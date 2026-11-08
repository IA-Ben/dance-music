"""Coordinates for the book's venues: Wikipedia's own coordinates first, then OpenStreetMap."""
import json, time, urllib.request, urllib.parse
UA = 'fortyyearsof.dance book build (https://github.com/IA-Ben/dance-music)'

def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=25) as r:
        return json.load(r)

def wp(title, lang):
    j = get(f'https://{lang}.wikipedia.org/w/api.php?action=query&prop=coordinates&format=json&redirects=1&titles=' + urllib.parse.quote(title))
    for p in (j.get('query', {}).get('pages') or {}).values():
        c = (p.get('coordinates') or [None])[0]
        if c:
            return [c['lat'], c['lon'], f'https://{lang}.wikipedia.org/wiki/' + urllib.parse.quote(p['title'].replace(' ', '_')), 'wikipedia']
    return None

def osm(q):
    j = get('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + urllib.parse.quote(q))
    time.sleep(1.2)
    if j:
        return [float(j[0]['lat']), float(j[0]['lon']), f"https://www.openstreetmap.org/{j[0]['osm_type']}/{j[0]['osm_id']}", 'osm: ' + j[0].get('display_name', '')[:120]]
    return None

def main(inp, outp):
    res = {}
    for it in json.load(open(inp)):
        r = None
        for t in it.get('wiki', []):
            lang, title = (t.split(':', 1) if t[2:3] == ':' else ('en', t))
            try:
                r = wp(title, lang)
            except Exception as e:
                r = None
            if r: break
        if not r:
            for q in it.get('osm', []):
                try:
                    r = osm(q)
                except Exception:
                    r = None
                if r: break
        res[it['id']] = r
        print(it['id'], r, flush=True)
    json.dump(res, open(outp, 'w'), indent=1, ensure_ascii=False)
