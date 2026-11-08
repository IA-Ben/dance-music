"""Resolve each query to YouTube candidates with yt-dlp (search only, no
downloads), and check whether the top candidates allow embedding."""
import json, sys, time, urllib.request, urllib.parse
import concurrent.futures as cf
from yt_dlp import YoutubeDL

Q = json.load(open(sys.argv[1]))
OPTS = {'quiet': True, 'no_warnings': True, 'skip_download': True, 'extract_flat': 'in_playlist', 'socket_timeout': 20}

def embeddable(vid):
    u = 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote('https://www.youtube.com/watch?v=' + vid)
    try:
        with urllib.request.urlopen(u, timeout=15) as r:
            return r.status == 200
    except Exception:
        return False

def one(item):
    q, err = item['q'], ''
    for attempt in range(3):
        try:
            with YoutubeDL(OPTS) as y:
                info = y.extract_info('ytsearch6:' + q, download=False)
            ents = []
            for e in (info.get('entries') or []):
                if not e or not e.get('id'):
                    continue
                ents.append({'id': e['id'], 'title': e.get('title'), 'channel': e.get('channel') or e.get('uploader'),
                             'duration': e.get('duration'), 'views': e.get('view_count')})
            for e in ents[:4]:
                e['embed'] = embeddable(e['id'])
            return {'q': q, 'kind': item['kind'], 'results': ents}
        except Exception as ex:
            err = str(ex)[:300]
            time.sleep(4 + attempt * 6)
    return {'q': q, 'kind': item['kind'], 'error': err}

if __name__ == '__main__':
    done = 0
    with cf.ThreadPoolExecutor(6) as ex, open(sys.argv[2], 'w') as out:
        for r in ex.map(one, Q):
            out.write(json.dumps(r, ensure_ascii=False) + '\n'); out.flush()
            done += 1
            if done % 50 == 0:
                print(done, 'done', flush=True)
