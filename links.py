"""Check the book's external links. 404/410 and dead hosts are broken; 401/403/429
are sites refusing robots, not broken. For broken links, ask the Wayback Machine
for the closest snapshot."""
import json, sys, time, urllib.request, urllib.parse, urllib.error
import concurrent.futures as cf
UA = 'Mozilla/5.0 (compatible; fortyyearsof.dance link check; +https://github.com/IA-Ben/dance-music)'

def fetch(u, method):
    req = urllib.request.Request(u, method=method, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en'})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.status, r.geturl()

def wayback(u):
    try:
        q = 'https://archive.org/wayback/available?url=' + urllib.parse.quote(u, safe='')
        with urllib.request.urlopen(urllib.request.Request(q, headers={'User-Agent': UA}), timeout=30) as r:
            snap = (json.load(r).get('archived_snapshots') or {}).get('closest')
            if snap and snap.get('available'):
                return snap['url'], snap.get('timestamp')
    except Exception:
        pass
    return None, None

def check(u):
    out = {'url': u}
    for method in ('HEAD', 'GET'):
        try:
            st, fin = fetch(u, method)
            out.update(status=st, final=fin); out.pop('error', None)
            return out
        except urllib.error.HTTPError as e:
            out.update(status=e.code, error=str(e)[:120])
            if method == 'HEAD':
                continue
        except Exception as e:
            out.update(status=None, error=str(e)[:160])
            if method == 'HEAD':
                continue
    if out.get('status') in (404, 410) or out.get('status') is None:
        w, ts = wayback(u)
        if w:
            out['wayback'] = w; out['wayback_ts'] = ts
    return out

def main(inp, outp):
    U = json.load(open(inp))
    done = 0
    with cf.ThreadPoolExecutor(16) as ex, open(outp, 'w') as f:
        for r in ex.map(check, U):
            f.write(json.dumps(r, ensure_ascii=False) + '\n'); f.flush()
            done += 1
            if done % 200 == 0:
                print(done, 'checked', flush=True)
