"""Can Google Street View be embedded without a key? Try the embed URLs from a real browser."""
import json
from playwright.sync_api import sync_playwright
LAT, LON = 51.5134, -0.1340   # D'Arblay Street, Soho
URLS = {
 'svembed': f'https://www.google.com/maps?layer=c&cbll={LAT},{LON}&cbp=12,0,0,0,0&output=svembed',
 'svembed_q': f'https://maps.google.com/maps?q=&layer=c&cbll={LAT},{LON}&cbp=11,0,0,0,0&output=svembed',
 'embed_q': f'https://www.google.com/maps?q={LAT},{LON}&z=18&output=embed',
 'pano_url': f'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint={LAT},{LON}',
}
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 900, 'height': 700})
    for k, u in URLS.items():
        try:
            r = pg.request.get(u, timeout=30000); out[k + '_hdr'] = [r.status, r.headers.get('x-frame-options'), (r.headers.get('content-security-policy') or '')[:120]]
        except Exception as e: out[k + '_hdr'] = str(e)[:120]
    for k in ('svembed', 'svembed_q', 'embed_q'):
        pg.set_content(f'<html><body style="margin:0"><iframe id="f" src="{URLS[k]}" width="880" height="600" allowfullscreen></iframe></body></html>')
        pg.wait_for_timeout(9000)
        fr = [f for f in pg.frames if f != pg.main_frame]
        info = {'frames': len(fr)}
        if fr:
            try: info.update(fr[0].evaluate("() => ({url: location.href.slice(0,120), title: document.title, canvas: document.querySelectorAll('canvas').length, text: document.body.innerText.slice(0,200)})"))
            except Exception as e: info['err'] = str(e)[:160]
        out[k + '_frame'] = info
        pg.screenshot(path=f'sv-{k}.png')
    b.close()
print(json.dumps(out, indent=1))
