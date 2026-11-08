"""Open the live site in a real browser and check the parts that need the open web:
the neural voice (model download + one sentence) and the dock's sources."""
import json, sys, time
from playwright.sync_api import sync_playwright
URL = 'https://ia-ben.github.io/dance-music/'
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(URL + '#h1', wait_until='load'); pg.wait_for_timeout(4000)
    out['neural_ok'] = pg.evaluate("window.Neural ? Neural.ok() : 'missing'")
    out['stream_ids'] = pg.evaluate("Object.keys(window.STREAM_IDS || {}).length")
    out['dock_sample'] = pg.evaluate("(() => { const ks = Object.keys(window.STREAM_IDS || {}).slice(0, 40); return ks.map(q => [q, Dock.sources({q}).map(s => s[0])]).filter(x => x[1].length > 1).slice(0, 6); })()")
    out['dock_urls'] = pg.evaluate("(() => { const r = {}; Object.keys(window.STREAM_IDS || {}).some(q => { Dock.sources({q}).forEach(s => { if (!r[s[0]]) r[s[0]] = s[1]; }); return ['apple', 'deezer', 'bandcamp'].every(k => r[k]); }); return r; })()")
    for k, u in (out['dock_urls'] or {}).items():
        if k in ('apple', 'deezer', 'bandcamp'):
            try:
                r = pg.request.get(u, timeout=30000); out['embed_' + k] = [r.status, r.headers.get('x-frame-options'), (r.headers.get('content-security-policy') or '')[:160]]
            except Exception as e: out['embed_' + k] = str(e)[:160]
    t0 = time.time()
    try: out['neural'] = pg.evaluate("Neural.selfTest()", ) ; 
    except Exception as e: out['neural'] = 'ERR ' + str(e)[:300]
    out['neural_wall_s'] = round(time.time() - t0, 1)
    out['errors'] = errs[:8]
    b.close()
print(json.dumps(out, indent=1, ensure_ascii=False))
