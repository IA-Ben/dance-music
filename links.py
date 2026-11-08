"""Check the book's external links.
Wikipedia links are checked in batches through the API (a missing page is broken).
Other links: per-host throttling, HEAD then GET, retry once on 429. 404/410 and
dead hosts are broken; 401/403/429 mean a site refused a robot, not a dead page.
Broken links get the Wayback Machine's closest snapshot."""
import json, sys, time, threading, collections, urllib.request, urllib.parse, urllib.error
import concurrent.futures as cf
UA = 'Mozilla/5.0 (compatible; fortyyearsof.dance link check; +https://github.com/IA-Ben/dance-music)'
LOCKS = collections.defaultdict(threading.Lock); LAST = {}

def iri(u):
    p = urllib.parse.urlsplit(u)
    host = p.hostname.encode('idna').decode() if p.hostname else ''
    netloc = host + (f':{p.port}' if p.port else '')
    return urllib.parse.urlunsplit((p.scheme, netloc, urllib.parse.quote(p.path, safe="/%:@!$&'()*+,;=-._~"), urllib.parse.quote(p.query, safe="=&%/:?+,;@!$'()*-._~"), ''))

def fetch(u, method):
    host = urllib.parse.urlsplit(u).hostname or ''
    with LOCKS[host]:
        wait = 1.0 - (time.time() - LAST.get(host, 0))
        if wait > 0: time.sleep(wait)
        LAST[host] = time.time()
    req = urllib.request.Request(iri(u), method=method, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en'})
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
    for method in ('HEAD', 'GET', 'GET'):
        try:
            st, fin = fetch(u, method)
            out.update(status=st, final=fin); out.pop('error', None)
            return out
        except urllib.error.HTTPError as e:
            out.update(status=e.code, error=str(e)[:120])
            if e.code == 429: time.sleep(8)
        except Exception as e:
            out.update(status=None, error=str(e)[:160])
    if out.get('status') in (404, 410) or out.get('status') is None:
        w, ts = wayback(u)
        if w: out['wayback'] = w; out['wayback_ts'] = ts
    return out

def wiki_batch(urls):
    res = {}
    by = collections.defaultdict(list)
    for u in urls:
        p = urllib.parse.urlsplit(u); lang = p.hostname.split('.')[0]
        t = urllib.parse.unquote(p.path.split('/wiki/', 1)[1]).replace('_', ' ')
        by[lang].append((u, t))
    for lang, items in by.items():
        for i in range(0, len(items), 40):
            chunk = items[i:i + 40]
            q = f'https://{lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=' + urllib.parse.quote('|'.join(t for _, t in chunk))
            try:
                with urllib.request.urlopen(urllib.request.Request(q, headers={'User-Agent': UA}), timeout=30) as r:
                    j = json.load(r)
            except Exception as e:
                for u, _ in chunk: res[u] = {'url': u, 'status': None, 'error': 'api: ' + str(e)[:80]}
                continue
            norm = {n['from']: n['to'] for n in j['query'].get('normalized', [])}
            redir = {n['from']: n['to'] for n in j['query'].get('redirects', [])}
            missing = {p['title'] for p in j['query']['pages'].values() if 'missing' in p or 'invalid' in p}
            for u, t in chunk:
                tt = redir.get(norm.get(t, t), norm.get(t, t))
                res[u] = {'url': u, 'status': 404 if tt in missing else 200, 'wiki': True}
                if tt in missing:
                    w, ts = wayback(u)
                    if w: res[u]['wayback'] = w
            time.sleep(0.5)
    return res

def main(inp, outp):
    U = json.load(open(inp))
    wk = [u for u in U if '.wikipedia.org/wiki/' in u]
    rest = [u for u in U if u not in set(wk)]
    with open(outp, 'w') as f:
        for r in wiki_batch(wk).values():
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
        with cf.ThreadPoolExecutor(12) as ex:
            for n, r in enumerate(ex.map(check, rest)):
                f.write(json.dumps(r, ensure_ascii=False) + '\n'); f.flush()
                if n % 200 == 0: print(n, 'checked', flush=True)
