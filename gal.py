"""Gallery candidates from Wikimedia Commons, for the vetted Pictures strips.

Input (<name>.gal.json): {"shard": "1/5", "budget_min": 80, "pages": [page, ...]} or a bare list of pages.
  page = {"id", "type", "name", "city", "generic", "node": true|false, "queries": [q1, q2, q3],
          "alt": [other names], "blurb", "has_bundled"}
  type is the page's node type, or "chapter" / "year" for chapter pages (node: false).
Output: a directory with
  cands.jsonl      one line per page: {id, name, type, has_bundled, blurb, q, items: [...], counts: {...}} or {id, error}
                   counts: candidates seen and how many each rule dropped (licence, size, format, relevance, meta_<reason>)
  sheets/<id>.jpg  one numbered contact sheet per page with at least one item
Each page runs its queries in order (the same search the site's live strip used to make) until 12
candidates pass the licence, size, relevance and metadata rules. Resumable: pages already in
cands.jsonl are skipped; the job stops cleanly after budget_min minutes so a re-run carries on.
Thumbnails are kept in a temporary folder, never in the output directory."""
import io, json, os, re, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request
from html import unescape

UA = 'fortyyearsof-dance-book/1.0 (book research; no contact)'
API = 'https://commons.wikimedia.org/w/api.php'
MAX_ITEMS, GSRLIMIT, MIN_W = 12, 50, 500

# ---------------------------------------------------------------- polite HTTP
_last = [0.0]
def get(url, gap=1.05, tries=6, timeout=60):
    err = ''
    for attempt in range(tries):
        wait = gap - (time.time() - _last[0])
        if wait > 0: time.sleep(wait)
        _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'identity'})
            with urllib.request.urlopen(req, timeout=timeout) as r: return r.read()
        except Exception as ex:
            code = getattr(ex, 'code', 0); err = '%s %s' % (code, str(ex)[:160])
            if code and code not in (408, 429, 500, 502, 503, 504): break
            ra = 0
            try: ra = int((getattr(ex, 'headers', None) or {}).get('Retry-After') or 0)
            except Exception: ra = 0
            time.sleep(max(ra, 4 + attempt * 8))
    raise RuntimeError('fetch failed: ' + err)

# ---------------------------------------------------------------- the site's rules, ported from build/gallery.js
# JavaScript's \s, written out, so whitespace means exactly what it meant in the browser
JS_WS = '\t\n\x0b\x0c\r \xa0  -     　﻿'
S = '[' + JS_WS + ']'
FREE = re.compile(r'(CC BY(-SA)?( \d\.\d)?|CC0|Public domain|CC-BY(-SA)?|Attribution)', re.I | re.A)
BAD = re.compile(r'(NC|ND|Fair use)', re.I | re.A)
MUSIC = re.compile(r'\b(night ?clubs?|clubs?|clubbing|raves?|djs?|disc jockeys?|techno|house music|acid house|dance music|electronic music|festivals?|party|parties|dance ?floors?|sound ?systems?|disco|drum and bass|jungle|trance|synthesi[sz]ers?|drum machines?|turntables?)\b', re.I | re.A)
COMMON = re.compile(r'(lost|space|trade|heaven|fire|rage|future|flying|shoom|spectrum|energy|sunrise|universe|pure|base|home|cream|shine|slam|bugged out|the end|the fridge|the gallery|the loft|the warehouse|the box|the hub|the edge|the eclipse|the sanctuary|the orbit|the cross|turnmills|trip|land of oz|helter skelter|fantazia|obsessed|raindance|biology|genesis|vision|dreamscape|amnesia|pacha|ku|privilege|eden|es paradis|output|smart ?bar|stereo|twilo|sound factory|tunnel|limelight|palladium|area|danceteria|world|zanzibar|power plant|music box|den|omen|dorian gray|planet|e-werk|bunker|walfisch|ufo|matrix|ostgut|watergate|bar 25|golden gate|about blank|sisyphos|tresor|fuse|rex|concrete|robert johnson|womb|ageha|contact|vent|liquid room|yellow|air|unit|zouk|velvet|mint|shelter|vinyl|save the robots)\Z', re.I | re.A)
# letters that Python's case-insensitive matching folds onto a-z but JavaScript's (non-unicode /i) does not
_JS_FOLD = str.maketrans({'ſ': '\x01', 'K': '\x01', 'ı': '\x01', 'İ': '\x01'})

def strip(s):
    """String(s || '').replace(/<[^>]+>/g, '').replace(/\\s+/g, ' ').trim()"""
    s = re.sub(r'<[^>]+>', '', '' if s is None else str(s))
    s = re.sub(S + '+', ' ', s)
    return re.sub('^' + S + '+|' + S + '+\\Z', '', s)

def _esc(s): return ''.join('\\' + c if c in '.*+?^${}()|[]\\' else c for c in s)
def _word(s):
    pat = '(^|[^a-z0-9])' + re.sub(S + '+', lambda m: '[' + JS_WS + '_-]+', _esc(s.lower())) + '([^a-z0-9]|\\Z)'
    rx = re.compile(pat, re.I)
    return lambda txt: bool(rx.search(txt.translate(_JS_FOLD)))

def base_name(title):
    name = re.sub(S + r'*\([^)]*\)' + S + r'*\Z', '', title)
    return name, re.sub(r'^the' + S + '+', '', name, flags=re.I)

def is_generic(title):
    name, bare = base_name(title)
    return bool(COMMON.match(name) or COMMON.match(bare) or (not re.search(S, bare) and len(bare) <= 5))

def rel_for(page, name=None):
    """Gallery.relFor(id, isNode): a test on 'title | description | categories | object name'."""
    if not page.get('node'): return lambda txt: bool(MUSIC.search(txt))
    title = name or page['name']
    nm, bare = base_name(title); name_re = _word(bare)
    city = _word(page['city']) if page.get('city') else None
    generic = page['generic'] if (name is None and 'generic' in page) else is_generic(title)
    t = page.get('type')
    if t == 'machine': return name_re
    if t == 'city': return lambda txt: name_re(txt) and bool(MUSIC.search(txt))
    def f(txt):
        if not name_re(txt): return False
        c = city(txt) if city else False; m = bool(MUSIC.search(txt))
        return (c and m) if generic else m if re.match(r'(club|event|festival|shop|collective)\Z', t or '') else (c or m)
    return f

# ---------------------------------------------------------------- metadata rules: no named people, flyers, logos, sleeves, screenshots, maps, diagrams
MAINT = re.compile(r'^(pages|files|media|images|photographs|uploaded|taken|created|supported|self-published|cc-|gfdl|licen[cs]e|quality images|valued images|featured pictures|user:|lossy|cc[ -]?by|pd[ -]|public domain|copyright|flickr|panoramio|geograph|wiki loves|location|categor)', re.I)
RULES = [
    ('person', r'\bportraits?\b|\bhead ?shots?\b|\bselfies?\b|\bmugshots?\b|\bposing\b|\bposes\b|\bperforming\b|\bin concert\b'
               r'|\((?:dj|disc jockey|musician|singer|rapper|(?:record )?producer|composer|artist|band|entertainer|actor|actress|politician|photographer|journalist|businessman|businesswoman|presenter)\)'
               r'|\b(?:male|female|smiling|bearded|young|elderly) (?:men|women|people|djs|disc jockeys|musicians|singers|rappers|performers)\b'
               r'|\b(?:men|women) (?:of|from|in|with|wearing|at|playing|holding|looking|facing|standing|sitting)\b'
               r'|\b(?:djs|disc jockeys|musicians|singers|rappers|record producers|composers|guitarists|drummers|vocalists|keyboardists|electronic musicians|people) (?:from|by name)\b'),
    ('logo',   r'\blogos?\b|\blogotypes?\b|\bwordmarks?\b|\bemblems?\b|\bicons?\b|\bcoats? of arms\b|\bheraldry\b|\bescutcheons?\b|\bseals? of\b'),
    ('flyer',  r'\bflyers?\b|\bfliers?\b|\bposters?\b|\bleaflets?\b|\bhandbills?\b|\b(?:event|concert|festival|admission|party) tickets?\b'),
    ('sleeve', r'\balbum (?:covers?|art(?:work)?|sleeves?)\b|\b(?:record|lp|cd|vinyl|single|ep|dvd) (?:covers?|sleeves?|jackets?)\b|\bcover art\b|\b(?:magazine|book|front) covers?\b'),
    ('screen', r'\bscreen ?shots?\b|\bscreen captures?\b|\bscreen ?grabs?\b'),
    ('map',    r'\bmaps?\b|\bopenstreetmap\b|\blocator\b|\bfloor ?plans?\b|\bsite plans?\b|\bplans? of\b'),
    ('diagram', r'\bdiagrams?\b|\bschematics?\b|\bcharts?\b|\bgraphs?\b|\binfographics?\b|\bflowcharts?\b|\btimelines?\b'),
    ('artwork', r'\bdrawings?\b|\bpaintings?\b|\billustrations?\b|\bcartoons?\b|\bclip ?art\b|\b3d render|\bcomputer[- ]generated\b|\bai[- ]generated\b|\bsketch(?:es)?\b|\bclippings?\b|\bsignatures?\b|\bpostage stamps?\b|\bstamps of\b|\bbanknotes?\b'),
    ('adult',  r'\bnud(?:e|es|ity)\b|\bnaked\b|\btopless\b|\berotic\b|\bfetish\b|\bbdsm\b|\bpornograph|\bgenital|\bcorpses?\b'),
]
RULES = [(k, re.compile(v, re.I | re.A)) for k, v in RULES]

def meta_reason(title, desc, cats, obj):
    cats_kept = '|'.join(c for c in cats.split('|') if c and not MAINT.match(c.strip()))
    txt = ' | '.join([title.replace('_', ' '), desc, cats_kept.replace('_', ' '), obj])
    for k, rx in RULES:
        if rx.search(txt): return k
    return None

# ---------------------------------------------------------------- one search
def search(q):
    params = {'action': 'query', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap', 'gsrnamespace': '6', 'gsrlimit': str(GSRLIMIT),
              'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': '480',
              'iiextmetadatafilter': 'LicenseShortName|Artist|ImageDescription|LicenseUrl|Categories|ObjectName|DateTimeOriginal',
              'format': 'json', 'maxlag': '5'}
    pages, calls = {}, 0
    cont = {}
    while True:
        p = dict(params); p.update(cont); calls += 1
        for lag in range(4):
            d = json.loads(get(API + '?' + urllib.parse.urlencode(p)) or b'{}')
            if (d.get('error') or {}).get('code') == 'maxlag': time.sleep(6 + 6 * lag); continue
            break
        if d.get('error'): raise RuntimeError('api: ' + json.dumps(d['error'])[:200])
        for k, v in ((d.get('query') or {}).get('pages') or {}).items():
            cur = pages.setdefault(k, v)
            if 'imageinfo' in v and 'imageinfo' not in cur: cur['imageinfo'] = v['imageinfo']
        cont = d.get('continue') or {}
        if 'iicontinue' not in cont or calls >= 5: break
    return sorted(pages.values(), key=lambda x: x.get('index', 9999)), calls

def candidates(page, stats):
    rels = [rel_for(page)] + [rel_for(page, a) for a in page.get('alt') or []]
    items, seen, used = [], set(), []
    for q in page['queries']:
        if len(items) >= MAX_ITEMS: break
        res, calls = search(q); used.append(q); stats['calls'] += calls
        for p in res:
            if len(items) >= MAX_ITEMS: break
            if p.get('title') in seen: continue
            seen.add(p.get('title')); stats['seen'] += 1
            ii = (p.get('imageinfo') or [None])[0]
            if not ii: stats['noinfo'] += 1; continue
            m = ii.get('extmetadata') or {}
            val = lambda k: (m.get(k) or {}).get('value')
            lic = strip(val('LicenseShortName'))
            if not lic or BAD.search(lic) or not FREE.match(lic): stats['licence'] += 1; continue
            if (ii.get('width') or 0) < MIN_W: stats['size'] += 1; continue
            if re.search(r'\.(svg|gif)\Z', ii.get('url') or '', re.I): stats['format'] += 1; continue
            desc, cats, obj = strip(val('ImageDescription')), strip(val('Categories')), strip(val('ObjectName'))
            txt = ' | '.join([p['title'], desc, cats, obj])
            if not any(r(txt) for r in rels): stats['relevance'] += 1; continue
            why = meta_reason(p['title'], desc, cats, obj)
            if why: stats['meta_' + why] = stats.get('meta_' + why, 0) + 1; continue
            items.append({'n': len(items) + 1, 'title': p['title'], 'thumb': ii.get('thumburl'), 'url': ii.get('url'), 'page': ii.get('descriptionurl'),
                          'lic': lic, 'licUrl': strip(val('LicenseUrl')), 'author': unescape(strip(val('Artist')))[:120] or 'unknown',
                          'desc': unescape(desc)[:300], 'cats': cats[:300], 'date': strip(val('DateTimeOriginal'))[:40],
                          'w': ii.get('width'), 'h': ii.get('height')})
    return items, used

# ---------------------------------------------------------------- contact sheets
def _pil():
    try:
        import PIL  # noqa
    except ImportError:
        r = subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow'])
        if r.returncode: subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', '--user', '--break-system-packages', 'pillow'])
        import site, importlib; importlib.reload(site)
    from PIL import Image, ImageDraw, ImageFont
    return Image, ImageDraw, ImageFont

def _font(ImageFont, size):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
              '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', '/Library/Fonts/Arial Bold.ttf', 'DejaVuSans-Bold.ttf'):
        try: return ImageFont.truetype(f, size)
        except Exception: pass
    try: return ImageFont.load_default(size=size)
    except TypeError: return ImageFont.load_default()

TILE_W, TILE_H, COLS, GAP, HEAD = 300, 225, 3, 4, 30
def make_sheet(label, tiles, out_path, max_bytes=120_000):
    """tiles: list of (number, bytes or None). Draws a 3-column grid of 300 px tiles, each numbered on a solid chip."""
    Image, ImageDraw, ImageFont = _pil()
    rows = (len(tiles) + COLS - 1) // COLS
    W = COLS * TILE_W + (COLS + 1) * GAP; H = HEAD + rows * (TILE_H + GAP) + GAP
    sheet = Image.new('RGB', (W, H), (24, 24, 28)); d = ImageDraw.Draw(sheet)
    big, small = _font(ImageFont, 30), _font(ImageFont, 15)
    d.text((GAP + 4, 7), label[:110], fill=(235, 235, 235), font=small)
    for i, (num, data) in enumerate(tiles):
        x = GAP + (i % COLS) * (TILE_W + GAP); y = HEAD + (i // COLS) * (TILE_H + GAP)
        d.rectangle([x, y, x + TILE_W - 1, y + TILE_H - 1], fill=(48, 48, 54))
        im = None
        if data:
            try: im = Image.open(io.BytesIO(data)); im.load(); im = im.convert('RGB')
            except Exception: im = None
        if im:
            im.thumbnail((TILE_W, TILE_H), Image.LANCZOS)
            sheet.paste(im, (x + (TILE_W - im.width) // 2, y + (TILE_H - im.height) // 2))
        else:
            d.text((x + 100, y + TILE_H // 2 - 8), 'no thumbnail', fill=(200, 200, 200), font=small)
        s = str(num); bw = 46 if len(s) == 1 else 62
        d.rectangle([x, y, x + bw, y + 42], fill=(255, 214, 0)); d.rectangle([x, y, x + bw, y + 42], outline=(0, 0, 0), width=2)
        try: tw = d.textlength(s, font=big)
        except Exception: tw = 18 * len(s)
        d.text((x + (bw - tw) / 2, y + 4), s, fill=(0, 0, 0), font=big)
    best = None
    for q in (70, 62, 55, 48, 40, 32):
        buf = io.BytesIO(); sheet.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        best = buf.getvalue()
        if len(best) <= max_bytes: break
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f: f.write(best)
    return len(best)

def sheet_for(rec, outdir, tmp):
    tiles = []
    for it in rec['items']:
        data = None
        if it.get('thumb'):
            fn = os.path.join(tmp, re.sub(r'[^\w.-]', '_', rec['id']) + '-%d.img' % it['n'])
            if os.path.exists(fn): data = open(fn, 'rb').read()
            else:
                try: data = get(it['thumb'], gap=1.0, tries=4); open(fn, 'wb').write(data)
                except Exception as ex: print('  thumb failed', it['title'][:60], ex, flush=True)
        tiles.append((it['n'], data))
    return make_sheet('%s  (%s)  %s' % (rec['name'], rec['type'], rec['id']), tiles, os.path.join(outdir, 'sheets', rec['id'] + '.jpg'))

def safe_id(i): return re.sub(r'[^\w.-]', '_', i)

# ---------------------------------------------------------------- main
def main(src, outdir):
    t0 = time.time()
    spec = json.load(open(src))
    pages = spec['pages'] if isinstance(spec, dict) else spec
    budget = float(spec.get('budget_min', 80) if isinstance(spec, dict) else 80) * 60
    shard = spec.get('shard', '') if isinstance(spec, dict) else ''
    os.makedirs(os.path.join(outdir, 'sheets'), exist_ok=True)
    cpath = os.path.join(outdir, 'cands.jsonl')
    done = {}
    if os.path.exists(cpath):
        for line in open(cpath):
            try: r = json.loads(line)
            except Exception: continue
            if 'error' not in r: done[r['id']] = r
        with open(cpath, 'w') as f:   # rewrite: keep each finished page once, drop old errors so they are retried
            for r in done.values(): f.write(json.dumps(r, ensure_ascii=False) + '\n')
    print('gal: shard %s, %d pages, %d already done, budget %d min' % (shard, len(pages), len(done), budget // 60), flush=True)
    tmp = tempfile.mkdtemp(prefix='galthumbs-')
    n_ok = n_err = n_items = calls = 0; stopped = False
    try:
        with open(cpath, 'a') as f:
            for k, page in enumerate(pages, 1):
                if time.time() - t0 > budget:
                    stopped = True; print('gal: time budget reached after %d pages; run again with the same output to resume' % (k - 1), flush=True); break
                pid = page['id']
                try:
                    rec = done.get(pid)
                    if rec is None:
                        stats = {'calls': 0, 'seen': 0, 'noinfo': 0, 'licence': 0, 'size': 0, 'format': 0, 'relevance': 0}
                        items, used = candidates(page, stats); calls += stats.pop('calls')
                        rec = {'id': pid, 'name': page.get('name'), 'type': page.get('type'), 'has_bundled': bool(page.get('has_bundled')),
                               'blurb': page.get('blurb', ''), 'q': used, 'items': items, 'counts': {a: b for a, b in stats.items() if b}}
                        if page.get('skip'): rec['skip'] = page['skip']
                        if page.get('act'): rec['act'] = True
                    sp = os.path.join(outdir, 'sheets', safe_id(pid) + '.jpg')
                    if rec['items'] and not os.path.exists(sp):
                        rec2 = dict(rec, id=safe_id(pid)); sz = sheet_for(rec2, outdir, tmp)
                    else: sz = 0
                    if pid not in done:
                        f.write(json.dumps(rec, ensure_ascii=False) + '\n'); f.flush(); done[pid] = rec
                    n_ok += 1; n_items += len(rec['items'])
                    print('[%d/%d] %s: %d items%s (%.0fs)' % (k, len(pages), pid, len(rec['items']), ', sheet %d KB' % (sz // 1024) if sz else '', time.time() - t0), flush=True)
                except Exception as ex:
                    n_err += 1
                    f.write(json.dumps({'id': pid, 'error': str(ex)[:300]}, ensure_ascii=False) + '\n'); f.flush()
                    print('[%d/%d] %s: ERROR %s' % (k, len(pages), pid, str(ex)[:200]), flush=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    summary = {'shard': shard, 'pages': len(pages), 'ok': n_ok, 'errors': n_err, 'items': n_items, 'api_calls': calls,
               'stopped_early': stopped, 'minutes': round((time.time() - t0) / 60, 1)}
    with open(os.path.join(outdir, 'summary.json'), 'w') as f: json.dump(summary, f, indent=1)
    print('gal: done', json.dumps(summary), flush=True)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
