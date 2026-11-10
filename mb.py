"""Catalogue lookups against MusicBrainz (open data, CC0). Search only: names, dates, catalogue numbers.
Input: a list of {"id", "kind": "label"|"artist", "name", "hint": {...}}. Output: one JSON line per entity
with the candidates considered, the one chosen (or none) and its releases or release groups."""
import json, sys, time, urllib.request, urllib.parse
UA = 'fortyyearsof.dance-catalogue/1.0 ( https://github.com/IA-Ben/dance-music )'
BASE = 'https://musicbrainz.org/ws/2/'
last = [0.0]
def get(path, **q):
    q['fmt'] = 'json'; url = BASE + path + '?' + urllib.parse.urlencode(q)
    for attempt in range(6):
        wait = 1.15 - (time.time() - last[0])
        if wait > 0: time.sleep(wait)
        last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=40) as r: return json.load(r)
        except Exception as ex:
            code = getattr(ex, 'code', 0); time.sleep(3 + attempt * 5 if code in (0, 429, 500, 502, 503, 504) else 2)
            err = str(ex)[:200]
    return {'error': err}
norm = lambda s: ''.join(c for c in (s or '').lower().replace('&', 'and') if c.isalnum())
def strip(n): 
    n = n.split(' / ')[0]
    for suf in (' Records', ' Recordings', ' Music', ' Trax'): 
        if n.endswith(suf) and len(n) > len(suf) + 2: return n, n[:-len(suf)]
    return n, n
def pick(cands, name, kind):
    full, short = strip(name); want = {norm(full), norm(short)}
    exact = [c for c in cands if norm(c.get('name')) in want or any(norm(a.get('name')) in want for a in c.get('aliases') or [])]
    if not exact: return None, 'no exact name match'
    exact.sort(key=lambda c: -int(c.get('score', 0)))
    if len(exact) > 1 and int(exact[0].get('score', 0)) == int(exact[1].get('score', 0)): return exact[0], 'ambiguous: %d exact matches' % len(exact)
    return exact[0], 'ok'
def label(e, cap):
    full, short = strip(e['name'])
    s = get('label', query='label:"%s" OR alias:"%s" OR label:"%s"' % (full, full, short), limit=12)
    cands = [{k: c.get(k) for k in ('id', 'name', 'score', 'type', 'country', 'disambiguation', 'life-span', 'area', 'aliases')} for c in s.get('labels', [])]
    for c in cands: c['area'] = (c.get('area') or {}).get('name'); c['aliases'] = [a.get('name') for a in (c.get('aliases') or [])][:8]
    ch, why = ({'id': e['mbid']}, 'given') if e.get('mbid') else pick(s.get('labels', []), e['name'], 'label'); out = {'id': e['id'], 'kind': 'label', 'name': e['name'], 'cands': cands[:8], 'why': why}
    if not ch: return out
    out['mbid'] = ch['id']; rels, off, total = [], 0, None
    while total is None or off < min(total, cap):
        r = get('release', label=ch['id'], inc='artist-credits+labels+release-groups+media', limit=100, offset=off)
        if 'releases' not in r: out['partial'] = r.get('error', 'no releases key'); break
        total = r.get('release-count', 0)
        for x in r['releases']:
            rg = x.get('release-group') or {}
            rels.append({'t': x.get('title'), 'd': x.get('date') or '', 'c': x.get('country') or '', 'st': x.get('status') or '',
                         'ac': [[a.get('name') or (a.get('artist') or {}).get('name'), (a.get('artist') or {}).get('id'), a.get('joinphrase') or ''] for a in x.get('artist-credit') or []],
                         'cat': sorted({li.get('catalog-number') for li in x.get('label-info') or [] if li.get('catalog-number') and (li.get('label') or {}).get('id') == ch['id']}),
                         'rg': rg.get('id'), 'pt': rg.get('primary-type') or '', 'sec': rg.get('secondary-types') or [], 'fd': rg.get('first-release-date') or '',
                         'fmt': sorted({m.get('format') or '' for m in x.get('media') or []}), 'tr': sum(m.get('track-count') or 0 for m in x.get('media') or []), 'id': x.get('id')})
        off += 100
    out['total'] = total; out['releases'] = rels; return out
def artist(e, cap):
    names = [e['name']] + list(e.get('aliases') or [])
    s = get('artist', query=' OR '.join('artist:"%s" OR alias:"%s"' % (n, n) for n in names[:3]), limit=10)
    cands = [{'id': c.get('id'), 'name': c.get('name'), 'score': c.get('score'), 'type': c.get('type'), 'country': c.get('country'), 'disambiguation': c.get('disambiguation'), 'life-span': c.get('life-span'), 'area': (c.get('area') or {}).get('name'), 'tags': [t.get('name') for t in (c.get('tags') or [])][:6]} for c in s.get('artists', [])]
    ch, why = ({'id': e['mbid']}, 'given') if e.get('mbid') else pick(s.get('artists', []), e['name'], 'artist'); out = {'id': e['id'], 'kind': 'artist', 'name': e['name'], 'cands': cands[:6], 'why': why}
    if not ch: return out
    out['mbid'] = ch['id']; rgs, off, total = [], 0, None
    while total is None or off < min(total, cap):
        r = get('release-group', artist=ch['id'], inc='artist-credits', limit=100, offset=off)
        if 'release-groups' not in r: out['partial'] = r.get('error', 'no key'); break
        total = r.get('release-group-count', 0)
        for g in r['release-groups']:
            rgs.append({'t': g.get('title'), 'fd': g.get('first-release-date') or '', 'pt': g.get('primary-type') or '', 'sec': g.get('secondary-types') or [], 'rg': g.get('id'),
                        'ac': [[a.get('name') or (a.get('artist') or {}).get('name'), (a.get('artist') or {}).get('id'), a.get('joinphrase') or ''] for a in g.get('artist-credit') or []]})
        off += 100
    out['total'] = total; out['groups'] = rgs; return out
def main(inp, outp):
    Q = json.load(open(inp)); done = 0
    with open(outp, 'w') as f:
        for e in Q:
            try: r = label(e, e.get('cap', 4000)) if e['kind'] == 'label' else artist(e, e.get('cap', 1500))
            except Exception as ex: r = {'id': e['id'], 'kind': e['kind'], 'name': e['name'], 'error': str(ex)[:300]}
            f.write(json.dumps(r, ensure_ascii=False) + '\n'); f.flush(); done += 1
            if done % 10 == 0: print(done, 'of', len(Q), flush=True)
