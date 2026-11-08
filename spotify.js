/* ===================================================================
   EMBEDS — on the web edition (fortyyearsof.dance), "listen" and
   "watch" chips with a known video play inline, and every node page
   with one shows a player in its side column. Spotify ids, where
   known, still give the Spotify player; otherwise a listen chip plays
   the track's YouTube video. Elsewhere (the claude.ai edition, which
   blocks other sites' frames) the chips stay plain links.
   window.SPOTIFY = { "<query>": "<trackId>" }
   window.YOUTUBE = { "<query>": "<videoId>" }, window.YT_META = { "<videoId>": ["title", "channel"] }
   =================================================================== */
window.SpotifyEmbed = {
  enabled(){ return !!(window.SITE && SITE.embeds) && !/claudeusercontent|claude\.ai/.test(location.hostname); },
  key(q){ return String(q || '').trim(); },
  idFor(q){ const S = window.SPOTIFY || {}; q = this.key(q); if (!q) return null; return S[q] || S[q.toLowerCase()] || null; },
  ytFor(q){ const Y = window.YOUTUBE || {}; q = this.key(q); if (!q) return null; return Y[q] || Y[q.toLowerCase()] || null; },
  meta(id){ return (window.YT_META || {})[id] || null; },
  esc(s){ return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
  box(anchor){
    const host = anchor.closest('.chips, .tracks, .card, .node-body, .page') || anchor.parentElement;
    let box = host.querySelector(':scope > .spbox'); if (!box){ box = document.createElement('div'); box.className = 'spbox'; host.appendChild(box); }
    return box;
  },
  open(anchor, id, label){
    const box = this.box(anchor); if (box.dataset.id === id){ box.remove(); return; }
    box.dataset.id = id; box.innerHTML = `<div class="sphead"><span>${this.esc(label)}</span><button class="sm spclose">close</button></div><iframe title="Spotify player: ${this.esc(label)}" src="https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    box.querySelector('.spclose').onclick = () => box.remove(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  frame(id, label, autoplay){ return `<div class="ytwrap"><iframe title="YouTube: ${this.esc(label)}" src="https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`; },
  openYt(anchor, id, label){
    const box = this.box(anchor); if (box.dataset.id === 'yt' + id){ box.remove(); return; }
    const m = this.meta(id);
    box.dataset.id = 'yt' + id; box.innerHTML = `<div class="sphead"><span>${this.esc(m ? m[0] : label)}</span><button class="sm spclose">close</button></div>${this.frame(id, m ? m[0] : label, true)}`;
    box.querySelector('.spclose').onclick = () => box.remove(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  wire(root){
    if (!this.enabled()) return;
    (root || document).querySelectorAll('a.chip.sp, a.trackchip, a.spot').forEach(a => {
      if (a.dataset.sp) return; a.dataset.sp = 1;
      const q = a.dataset.q || decodeURIComponent((a.href.split('/search/')[1] || '')).replace(/\+/g, ' ');
      const label = a.textContent.replace(/·\s*(listen|play|Spotify|YouTube)\s*$/i, '').trim();
      const it = { q, title: label };
      if (window.Dock && Dock.playable(it)){ a.classList.add('has-embed'); a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); Dock.play([it], 0); }); const s0 = a.querySelector('small'); if (s0) s0.textContent = '· play'; return; }
      const sid = this.idFor(q), yid = sid ? null : this.ytFor(q);
      if (!sid && !yid) return;
      a.classList.add('has-embed'); if (yid) a.classList.add('yt-embed');
      a.addEventListener('click', e => { e.preventDefault(); sid ? this.open(a, sid, label) : this.openYt(a, yid, label); });
      const s = a.querySelector('small'); if (s) s.textContent = '· play';
    });
    /* SoundCloud chips (mixes, shows, new artists) play in the dock once the book has the exact SoundCloud URL */
    (root || document).querySelectorAll('a.chip.sc').forEach(a => {
      if (a.dataset.scw || !window.Dock || !Dock.ok()) return; a.dataset.scw = 1; const url = (Dock.ids(a.dataset.q) || {}).soundcloud; if (!url) return;
      a.classList.add('has-embed'); const title = a.closest('.page') && a.closest('.page').querySelector('h2') ? a.closest('.page').querySelector('h2').textContent : a.dataset.q;
      a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); Dock.play([{ q: a.dataset.q, title, soundcloud: url }], 0); Dock.svc = 'soundcloud'; Dock.render(); });
      const s = a.querySelector('small'); if (s) s.textContent = '· play';
    });
    (root || document).querySelectorAll('a.chip.yt').forEach(a => {
      if (a.dataset.yt) return; a.dataset.yt = 1;
      const id = this.ytFor(a.dataset.q); if (!id) return;
      a.classList.add('has-embed', 'yt-embed');
      const label = a.textContent.replace(/·\s*(watch|play)\s*$/, '').trim();
      a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); if (window.Dock && Dock.ok()) Dock.play([{ q: a.dataset.q, title: label }], 0); else this.openYt(a, id, label); });
      const s = a.querySelector('small'); if (s) s.textContent = '· play';
    });
  },
  /* node pages: one player at the top of the side column, as a still
     with a play button until the reader presses it (no frame loads first) */
  feature(inEl, id){
    if (!this.enabled() || !inEl || inEl.querySelector('.media-feature')) return;
    const n = (typeof NODE !== 'undefined') ? NODE[id] : null; if (!n || !n.q) return;
    const isTrack = n.type === 'record' || n.type === 'set';
    const watchQ = n.q + (n.type === 'person' ? ' DJ set' : n.type === 'club' ? ' club' : '');
    const vid = isTrack ? (this.ytFor(n.q) || this.ytFor(watchQ)) : this.ytFor(watchQ);
    if (!vid) return;
    const col = inEl.querySelector('.grid2 > div:nth-child(2)'); if (!col) return;
    const m = this.meta(vid) || [n.title, ''];
    const head = isTrack ? 'Listen' : n.type === 'person' ? 'Watch a set' : 'Watch';
    const fig = document.createElement('figure'); fig.className = 'media-feature card';
    fig.innerHTML = `<h3>${head}</h3><button class="mf-play" aria-label="Play ${this.esc(m[0])}"><img src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'"><span class="mf-btn" aria-hidden="true"></span></button><figcaption>${this.esc(m[0])}${m[1] ? ` <small>· ${this.esc(m[1])}</small>` : ''} <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">YouTube ↗</a></figcaption>`;
    fig.querySelector('.mf-play').onclick = e => { const b = e.currentTarget; const wrap = document.createElement('div'); wrap.innerHTML = this.frame(vid, m[0], true); b.replaceWith(wrap.firstChild); };
    col.prepend(fig);
  }
};
