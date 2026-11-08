"""Look up each track on Apple Music (iTunes Search API), Deezer and Bandcamp, so the book's
player can embed them. No keys: all three are public. Writes one JSON line per track."""
import json, re, sys, time, html, unicodedata, urllib.request, urllib.parse
import concurrent.futures as cf
UA = {'User-Agent': 'Mozilla/5.0 (compatible; fortyyearsof.dance media lookup)'}

def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:
            err = e; time.sleep(3 + i * 5)
    raise err

def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\((?:feat|ft|with)[^)]*\)|\[(?:feat|ft)[^\]]*\]', ' ', s)
    s = re.sub(r'\s*[-–(]\s*(original|radio|club|extended|album)?\s*(mix|edit|version|remaster(ed)?(\s*\d{4})?)\s*\)?', ' ', s)
    s = re.sub(r'&', ' and ', s); s = re.sub(r'[^a-z0-9 ]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def first_artist(a):
    return norm(re.split(r'\s+(?:feat\.?|ft\.?|featuring|presents|pres\.|vs\.?|&|and|with|x)\s+|,', a, flags=re.I)[0])

def ok(want_a, want_t, got_a, got_t):
    wa, wt, ga, gt = first_artist(want_a), norm(want_t), norm(got_a), norm(got_t)
    if not wa or not wt: return False
    a_ok = wa in ga or ga in wa or any(w in ga.split() for w in wa.split() if len(w) > 3)
    t_ok = gt == wt or gt.startswith(wt + ' ') or wt.startswith(gt + ' ') or gt.replace(' ', '') == wt.replace(' ', '')
    return a_ok and t_ok

def apple(it):
    u = 'https://itunes.apple.com/search?' + urllib.parse.urlencode({'term': f"{it['artist']} {it['title']}", 'entity': 'song', 'limit': 15, 'country': 'GB'})
    try: res = json.loads(get(u)).get('results', [])
    except Exception as e: return {'error': str(e)[:120]}
    for r in res:
        if ok(it['artist'], it['title'], r.get('artistName'), r.get('trackName')):
            return {'trackId': r['trackId'], 'collectionId': r.get('collectionId'), 'collection': r.get('collectionName'), 'url': r.get('trackViewUrl'), 'artist': r.get('artistName'), 'title': r.get('trackName')}
    return None

def deezer(it):
    q = f'artist:"{it["artist"]}" track:"{it["title"]}"'
    try: res = json.loads(get('https://api.deezer.com/search?' + urllib.parse.urlencode({'q': q, 'limit': 15}))).get('data', [])
    except Exception as e: return {'error': str(e)[:120]}
    if not res:
        try: res = json.loads(get('https://api.deezer.com/search?' + urllib.parse.urlencode({'q': f"{it['artist']} {it['title']}", 'limit': 15}))).get('data', [])
        except Exception: res = []
    for r in res:
        if ok(it['artist'], it['title'], (r.get('artist') or {}).get('name'), r.get('title')):
            return {'id': r['id'], 'url': r.get('link'), 'artist': (r.get('artist') or {}).get('name'), 'title': r.get('title')}
    return None

def bandcamp(it):
    try: page = get('https://bandcamp.com/search?' + urllib.parse.urlencode({'q': f"{it['artist']} {it['title']}", 'item_type': 't'}))
    except Exception as e: return {'error': str(e)[:120]}
    for blk in re.findall(r'<li class="searchresult[^"]*"(.*?)</li>', page, re.S)[:10]:
        m = re.search(r'<div class="heading">\s*<a href="([^"]+)"[^>]*>\s*(.*?)\s*</a>', blk, re.S)
        b = re.search(r'<div class="subhead">\s*(?:from\s+.*?)?by\s+(.*?)\s*</div>', blk, re.S)
        if not m: continue
        url = html.unescape(m.group(1)).split('?')[0]; title = html.unescape(re.sub('<[^>]+>', '', m.group(2))).strip()
        by = html.unescape(re.sub('<[^>]+>', '', b.group(1))).strip() if b else ''
        if not ok(it['artist'], it['title'], by, title): continue
        try:
            tp = get(url); time.sleep(1.5)
            pm = re.search(r'name="bc-page-properties"\s+content="([^"]+)"', tp)
            props = json.loads(html.unescape(pm.group(1))) if pm else {}
            if props.get('item_id'): return {'id': props['item_id'], 'type': props.get('item_type', 't'), 'url': url, 'artist': by, 'title': title}
        except Exception as e: return {'error': str(e)[:120]}
    return None

def main(src, out):
    items = json.load(open(src)); res = {it['q']: {'q': it['q'], 'alt': it.get('alt', [])} for it in items}
    def run(fn, key, delay):
        for it in items:
            try: res[it['q']][key] = fn(it)
            except Exception as e: res[it['q']][key] = {'error': str(e)[:120]}
            time.sleep(delay)
    with cf.ThreadPoolExecutor(3) as ex:
        fs = [ex.submit(run, apple, 'apple', 3.2), ex.submit(run, deezer, 'deezer', 0.4), ex.submit(run, bandcamp, 'bandcamp', 1.5)]
        for f in fs: f.result()
    with open(out, 'w') as o:
        for v in res.values(): o.write(json.dumps(v, ensure_ascii=False) + '\n')
    print('apple', sum(1 for v in res.values() if v.get('apple') and 'trackId' in v['apple']), 'deezer', sum(1 for v in res.values() if v.get('deezer') and 'id' in v['deezer']), 'bandcamp', sum(1 for v in res.values() if v.get('bandcamp') and 'id' in v['bandcamp']), 'of', len(items))
