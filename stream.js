/* ===================================================================
   LISTEN ON… — the reader's streaming service, remembered in this browser.
   Every "listen" link follows it; in-page players only where embedding is allowed.
   =================================================================== */
window.Stream = {
  SERVICES: [
    ['spotify', 'Spotify', q => 'https://open.spotify.com/search/' + encodeURIComponent(q), true],
    ['apple', 'Apple Music', q => 'https://music.apple.com/search?term=' + encodeURIComponent(q), true],
    ['ytmusic', 'YouTube Music', q => 'https://music.youtube.com/search?q=' + encodeURIComponent(q), true],
    ['youtube', 'YouTube', q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q), true],
    ['tidal', 'Tidal', q => 'https://listen.tidal.com/search?q=' + encodeURIComponent(q), false],
    ['deezer', 'Deezer', q => 'https://www.deezer.com/search/' + encodeURIComponent(q), true],
    ['bandcamp', 'Bandcamp', q => 'https://bandcamp.com/search?q=' + encodeURIComponent(q), false],
    ['soundcloud', 'SoundCloud', q => 'https://soundcloud.com/search?q=' + encodeURIComponent(q), false],
    ['beatport', 'Beatport', q => 'https://www.beatport.com/search?q=' + encodeURIComponent(q), false],
    ['amazon', 'Amazon Music', q => 'https://music.amazon.com/search/' + encodeURIComponent(q), false]
  ],
  get(){ try { return localStorage.getItem('dm-stream') || 'spotify'; } catch (e) { return 'spotify'; } },
  set(id){ try { localStorage.setItem('dm-stream', id); } catch (e) {} this.relink(); this.badge(); },
  svc(){ return this.SERVICES.find(s => s[0] === this.get()) || this.SERVICES[0]; },
  url(q){ return this.svc()[2](q); },
  embeddable(){ return this.svc()[3]; },
  // rewrite every listen link on the page to the chosen service
  relink(root){
    const s = this.svc();
    (root || document).querySelectorAll('a.chip.sp, a.spot, a.trackchip').forEach(a => { const q = a.dataset.q || a.textContent.trim(); if (!q) return; a.href = s[2](q); a.title = 'Listen on ' + s[1]; const sm = a.querySelector('small'); if (sm && /listen|spotify/i.test(sm.textContent)) sm.textContent = s[1]; });
  },
  badge(){ const b = document.getElementById('streamBtn'); if (b) b.textContent = '♪ ' + this.svc()[1]; },
  pick(){
    let box = document.getElementById('streamPick'); if (box){ box.remove(); return; }
    box = document.createElement('div'); box.id = 'streamPick'; box.className = 'streampick';
    box.innerHTML = `<b>Listen on…</b><p class="cap">The player at the foot of the screen plays from this service where the book has the track there, and from YouTube otherwise. Services marked "link" open in a new tab. Remembered in this browser only.</p>${this.SERVICES.map(([id, name, , emb]) => `<button class="${id === this.get() ? 'on' : ''}" data-id="${id}">${name}${emb ? ' <small>· plays here</small>' : ' <small>· link</small>'}</button>`).join('')}`;
    box.querySelectorAll('button').forEach(b => b.onclick = () => { this.set(b.dataset.id); box.remove(); });
    document.body.appendChild(box);
    setTimeout(() => document.addEventListener('click', function h(e){ if (!box.contains(e.target) && e.target.id !== 'streamBtn'){ box.remove(); document.removeEventListener('click', h); } }), 0);
  },
  init(){
    const tb = document.getElementById('topbar'); if (tb && !document.getElementById('streamBtn')){ const b = document.createElement('button'); b.id = 'streamBtn'; b.title = 'choose where listen links open'; b.onclick = () => this.pick(); const theme = document.getElementById('themeBtn'); tb.insertBefore(b, theme || null); }
    this.badge(); this.relink();
    // keep LINK.sp in step so freshly built chips use the choice
    if (window.LINK) LINK.sp = q => Stream.url(q);
    // only embed where the chosen service allows it
    /* the docked player plays from the chosen service where the book has the track there, and from YouTube otherwise */
    // relink after every route
    const mo = new MutationObserver(() => { clearTimeout(this._t); this._t = setTimeout(() => this.relink(), 60); });
    const book = document.getElementById('book'); if (book) mo.observe(book, { childList: true, subtree: true });
  }
};
document.addEventListener('DOMContentLoaded', () => Stream.init()); if (document.readyState !== 'loading') Stream.init();
