/* ===================================================================
   SPOTIFY EMBEDS — on hosts that allow iframes, a chip with a known
   track id opens an inline Spotify player; elsewhere chips stay links.
   window.SPOTIFY = { "<query>": "<trackId>" } comes from spotify-ids.js
   =================================================================== */
window.SpotifyEmbed = {
  enabled(){ return !!(window.SITE && SITE.embeds) && !/claudeusercontent|claude\.ai/.test(location.hostname); },
  idFor(q){ const S = window.SPOTIFY || {}; if (!q) return null; return S[q] || S[q.toLowerCase()] || null; },
  open(anchor, id, label){
    const host = anchor.closest('.chips, .tracks, .card, .node-body, .page') || anchor.parentElement; let box = host.querySelector(':scope > .spbox'); if (!box){ box = document.createElement('div'); box.className = 'spbox'; host.appendChild(box); }
    if (box.dataset.id === id){ box.remove(); return; }
    box.dataset.id = id; box.innerHTML = `<div class="sphead"><span>${label || ''}</span><button class="sm spclose">close</button></div><iframe title="Spotify player: ${(label || '').replace(/"/g, '')}" src="https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    box.querySelector('.spclose').onclick = () => box.remove(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  ytFor(q){ const Y = window.YOUTUBE || {}; if (!q) return null; return Y[q] || Y[q.toLowerCase()] || null; },
  openYt(anchor, id, label){
    const host = anchor.closest('.chips, .card, .node-body, .page') || anchor.parentElement; let box = host.querySelector(':scope > .spbox'); if (!box){ box = document.createElement('div'); box.className = 'spbox'; host.appendChild(box); }
    if (box.dataset.id === 'yt' + id){ box.remove(); return; }
    box.dataset.id = 'yt' + id; box.innerHTML = `<div class="sphead"><span>${label || ''}</span><button class="sm spclose">close</button></div><div class="ytwrap"><iframe title="YouTube: ${(label || '').replace(/"/g, '')}" src="https://www.youtube-nocookie.com/embed/${id}?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    box.querySelector('.spclose').onclick = () => box.remove(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  wire(root){
    if (!this.enabled()) return;
    (root || document).querySelectorAll('a.chip.sp, a.trackchip, a.spot').forEach(a => { if (a.dataset.sp) return; a.dataset.sp = 1; const q = a.dataset.q || decodeURIComponent((a.href.split('/search/')[1] || '')).replace(/\+/g, ' '); const id = this.idFor(q); if (!id) return; a.classList.add('has-embed'); const label = a.textContent.replace(/·\s*(listen|play)\s*$/, '').trim(); a.addEventListener('click', e => { e.preventDefault(); this.open(a, id, label); }); const s = a.querySelector('small'); if (s) s.textContent = '· play'; });
    (root || document).querySelectorAll('a.chip.yt').forEach(a => { if (a.dataset.yt) return; a.dataset.yt = 1; const id = this.ytFor(a.dataset.q); if (!id) return; a.classList.add('has-embed', 'yt-embed'); const label = a.textContent.replace(/·\s*(watch|play)\s*$/, '').trim(); a.addEventListener('click', e => { e.preventDefault(); this.openYt(a, id, label); }); const s = a.querySelector('small'); if (s) s.textContent = '· play'; });
  }
};
