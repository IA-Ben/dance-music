/* ===================================================================
   DOCK — one player for the whole book, docked at the foot of the
   screen so a track keeps playing while the reader turns pages.
   Sources, in the reader's order of preference (the ♪ service button):
   YouTube and Spotify ids from media-ids.js; Apple Music and Deezer ids
   looked up when the site is built (window.STREAM_IDS); Bandcamp is for
   buying a release, so it is a link on record pages, never a player;
   SoundCloud where a page gives a track URL. Web edition only: the
   claude.ai edition blocks other sites' players, so links stay links.
   =================================================================== */
window.Dock = {
  queue: [], i: -1, svc: null, collapsed: false,
  ok(){ return !!(window.SpotifyEmbed && SpotifyEmbed.enabled()); },
  esc(s){ return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
  ids(q){ q = String(q || '').trim(); const S = window.STREAM_IDS || {}; return S[q] || S[q.toLowerCase()] || {}; },
  NAMES: { youtube: 'YouTube', spotify: 'Spotify', apple: 'Apple Music', deezer: 'Deezer', soundcloud: 'SoundCloud' },
  /* every source this track can play from, the reader's chosen service first */
  sources(it){
    const q = it.q, S = this.ids(q), out = [];
    const sp = window.SpotifyEmbed ? SpotifyEmbed.idFor(q) : null; if (sp) out.push(['spotify', `https://open.spotify.com/embed/track/${sp}?utm_source=generator&theme=0`, 80]);
    const yt = window.SpotifyEmbed ? SpotifyEmbed.ytFor(q) : null; if (yt) out.push(['youtube', `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`, 0, yt]);
    if (S.apple && S.apple.trackId){ const slug = String(S.apple.collection || 'album').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'album'; out.push(['apple', `https://embed.music.apple.com/gb/album/${slug}/${S.apple.collectionId}?i=${S.apple.trackId}`, 175]); }
    if (S.deezer && S.deezer.id) out.push(['deezer', `https://widget.deezer.com/widget/dark/track/${S.deezer.id}`, 150]);
    if (it.soundcloud || S.soundcloud) out.push(['soundcloud', `https://w.soundcloud.com/player/?url=${encodeURIComponent(it.soundcloud || S.soundcloud)}&auto_play=true&visual=false&color=%23f5c542`, 120]);
    const pref = window.Stream ? Stream.get() : 'youtube'; const map = { ytmusic: 'youtube' }; const want = map[pref] || pref;
    out.sort((a, b) => (b[0] === want) - (a[0] === want) || (a[0] === 'youtube' ? -1 : b[0] === 'youtube' ? 1 : 0));
    return out;
  },
  titleFor(it){ if (it.title && !/^(listen|watch|play|hear it)\b/i.test(it.title)) return it.title; const n = typeof NODES !== 'undefined' ? NODES.find(x => x.q === it.q) : null; if (n) return n.title; const yt = window.SpotifyEmbed ? SpotifyEmbed.ytFor(it.q) : null; const m = yt && SpotifyEmbed.meta(yt); return m ? m[0] : it.q; },
  playable(it){ return this.ok() && this.sources(it).length > 0; },
  play(items, start){ if (!this.ok()) return false; this.queue = items.filter(it => this.sources(it).length); if (!this.queue.length) return false; this.i = Math.max(0, Math.min(start || 0, this.queue.length - 1)); this.svc = null; this.render(); return true; },
  next(){ if (this.i < this.queue.length - 1){ this.i++; this.svc = null; this.render(); } },
  prev(){ if (this.i > 0){ this.i--; this.svc = null; this.render(); } },
  close(){ const d = document.getElementById('dock'); if (d) d.remove(); document.body.classList.remove('docked'); this.queue = []; this.i = -1; },
  el(){
    let d = document.getElementById('dock'); if (d) return d;
    d = document.createElement('div'); d.id = 'dock'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Player');
    d.innerHTML = `<div class="dk-bar"><button class="dk-prev" aria-label="Previous">‹</button><div class="dk-now"><b class="dk-title"></b><span class="dk-meta"></span></div><div class="dk-svcs" role="group" aria-label="Play from"></div><button class="dk-next" aria-label="Next">›</button><button class="dk-fold" aria-label="Hide the player">▾</button><button class="dk-x" aria-label="Close the player">×</button></div><div class="dk-frame"></div>`;
    document.body.appendChild(d); document.body.classList.add('docked');
    d.querySelector('.dk-prev').onclick = () => this.prev(); d.querySelector('.dk-next').onclick = () => this.next(); d.querySelector('.dk-x').onclick = () => this.close();
    d.querySelector('.dk-fold').onclick = () => { this.collapsed = !this.collapsed; d.classList.toggle('folded', this.collapsed); d.querySelector('.dk-fold').textContent = this.collapsed ? '▴' : '▾'; d.querySelector('.dk-fold').setAttribute('aria-label', this.collapsed ? 'Show the player' : 'Hide the player'); };
    return d;
  },
  render(){
    const it = this.queue[this.i]; if (!it) return; const d = this.el(); const srcs = this.sources(it); const cur = srcs.find(s => s[0] === this.svc) || srcs[0]; this.svc = cur[0];
    d.querySelector('.dk-title').textContent = this.titleFor(it);
    d.querySelector('.dk-meta').textContent = (this.queue.length > 1 ? `${this.i + 1} of ${this.queue.length} · ` : '') + this.NAMES[cur[0]];
    d.querySelector('.dk-svcs').innerHTML = srcs.length > 1 ? srcs.map(s => `<button class="sm dk-svc${s[0] === cur[0] ? ' on' : ''}" data-s="${s[0]}">${this.NAMES[s[0]]}</button>`).join('') : '';
    d.querySelectorAll('.dk-svc').forEach(b => b.onclick = () => { this.svc = b.dataset.s; this.render(); });
    d.querySelector('.dk-prev').disabled = this.i <= 0; d.querySelector('.dk-next').disabled = this.i >= this.queue.length - 1;
    const video = cur[0] === 'youtube';
    d.querySelector('.dk-frame').innerHTML = `<iframe title="${this.esc(this.NAMES[cur[0]] + ': ' + this.titleFor(it))}" src="${cur[1]}" ${video ? '' : `height="${cur[2]}"`} frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen loading="eager"></iframe>`;
    d.classList.toggle('video', video);
    const f = d.querySelector('iframe'); if (video) f.addEventListener('load', () => { try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) {} });
  }
};
/* a YouTube video that ends moves the queue on */
window.addEventListener('message', e => {
  if (!/youtube(-nocookie)?\.com$/.test((e.origin || '').replace(/^https?:\/\/(www\.)?/, ''))) return; let m; try { m = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
  if (!m || !Dock.queue.length) return; const st = m.event === 'onStateChange' ? m.info : (m.event === 'infoDelivery' && m.info ? m.info.playerState : null); if (st === 0) Dock.next();
});
