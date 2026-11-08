"""Download Wikimedia Commons images by file title, as thumbnails at a standard
width, with a descriptive User-Agent and polite spacing. Input: a JSON list of
{"name": "out.jpg", "title": "File:...", "width": 1280}. Output: a folder."""
import json, os, sys, time, urllib.request, urllib.parse
UA = {'User-Agent': 'fortyyearsof-dance-book/1.0 (https://github.com/IA-Ben/dance-music; image credits)'}

def get(u, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:
            print('retry', i, u[:100], e, flush=True); time.sleep(5 + 10 * i)
    return None

def main(src, outdir):
    os.makedirs(outdir, exist_ok=True)
    meta = {}
    for item in json.load(open(src)):
        w = item.get('width', 1280)
        q = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'titles': item['title'], 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata', 'iiurlwidth': w, 'format': 'json'})
        d = json.loads(get(q) or b'{}')
        pages = list(d.get('query', {}).get('pages', {}).values())
        if not pages or 'imageinfo' not in pages[0]:
            print('missing', item['title']); continue
        ii = pages[0]['imageinfo'][0]; m = ii.get('extmetadata', {})
        data = get(ii.get('thumburl') or ii['url'])
        if data:
            open(os.path.join(outdir, item['name']), 'wb').write(data); print('got', item['name'], len(data), flush=True)
        meta[item['name']] = {'title': item['title'], 'page': ii.get('descriptionurl'), 'w': ii.get('thumbwidth') or ii.get('width'),
                              'license': (m.get('LicenseShortName') or {}).get('value'), 'licenseUrl': (m.get('LicenseUrl') or {}).get('value'),
                              'author': (m.get('Artist') or {}).get('value')}
        time.sleep(3)
    json.dump(meta, open(os.path.join(outdir, 'meta.json'), 'w'), indent=1, ensure_ascii=False)
