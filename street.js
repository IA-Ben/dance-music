/* ===================================================================
   STREET VIEW — stand outside the places in the book.
   Every place with coordinates (the city maps, the club chapters, the
   small towns, pages with a surveyed address) gets a "Street view"
   link. On the web edition it opens in a sheet over the page; where
   embeds are off it is a plain link to Google Maps. What you see is
   the street as Google last photographed it: what stands there now.
   =================================================================== */
window.Street = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const live = () => !!(window.SITE && SITE.embeds) && !/claudeusercontent|claude\.ai/.test(location.hostname);
  const link = (la, lo) => `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${la},${lo}`;
  const embed = (la, lo) => `https://www.google.com/maps?layer=c&cbll=${la},${lo}&cbp=12,0,0,0,0&output=svembed`;
  const APPROX = /coordinates are (those|that) of|estimated|not surveyed|placed by|approximate|centre of/i;
  const GROUP = { m25: 'London and the M25', lovepar: 'Berlin', 'lovepar-ruhr': 'The Ruhr', detroit: 'Detroit', chicago: 'Chicago', newyork: 'New York', ibiza: 'Ibiza', goa: 'Goa', soho: 'Soho' };
  let cache = null;
  function places(){
    if (cache) return cache; const out = [], seen = new Set(); const F = window.FACTS || {}; const N = typeof NODE !== 'undefined' ? NODE : {};
    const add = p => { const c = p.c; if (!Array.isArray(c) || c.length < 2 || !isFinite(c[0]) || !isFinite(c[1]) || !p.name) return; const k = (+c[0]).toFixed(4) + ',' + (+c[1]).toFixed(4) + '|' + p.name; if (seen.has(k)) return; seen.add(k); out.push(p); };
    const PD = window.PLACE_DATA || {};
    Object.keys(PD).forEach(pid => (PD[pid].markers || []).forEach(m => { const n = m.nodeid && N[m.nodeid]; const f = n ? F[n.id] || {} : {};
      add({ name: (n && n.title) || m.title || m.name, c: m.coords || f.coords, years: m.years || (n && n.years) || '', group: GROUP[pid] || pid, id: n ? n.id : null, approx: APPROX.test(m.note || ''), note: m.site || m.area || '' }); }));
    if (typeof NODES !== 'undefined') NODES.forEach(n => { const f = F[n.id]; if (f && Array.isArray(f.coords)) add({ name: n.title, c: f.coords, years: n.years, group: (N[n.city] && N[n.city].title) || 'Elsewhere', id: n.id, note: f.address || '' }); });
    const M = window.MOVE || {};
    (M.clubs || []).forEach(c => add({ name: c.title, c: [c.lat, c.lon], years: c.years, group: 'The clubs', id: c.id, note: c.where || '' }));
    (M.towns || []).forEach(c => add({ name: c.title, c: [c.lat, c.lon], years: c.years, group: 'Small towns', id: c.id, note: c.where || '', approx: true }));
    cache = out; return out;
  }
  function forId(id, title){
    const P = places(); let p = P.find(x => x.id === id && !x.approx) || P.find(x => x.id === id) || (title ? P.find(x => x.name === title) : null);
    if (!p && window.DEEP_DIVES && DEEP_DIVES[id]) p = P.find(x => x.id === DEEP_DIVES[id]);
    return p || null;
  }
  /* an anchor that works everywhere: a link to Google Maps, taken over by the sheet when embeds are on */
  function a(c, title, approx, cls){ if (!Array.isArray(c)) return ''; return `<a class="${cls || 'xl'} sv-a" href="${link(c[0], c[1])}" target="_blank" rel="noopener" data-sv="${c[0]},${c[1]}" data-svt="${esc(title || '')}"${approx ? ' data-svx="1"' : ''}>Street view${approx ? ' (nearby)' : ''}</a>`; }
  function chip(n){ const p = forId(n.id, n.title); if (!p) return ''; return `<a class="chip sv-a" href="${link(p.c[0], p.c[1])}" target="_blank" rel="noopener" data-sv="${p.c[0]},${p.c[1]}" data-svt="${esc(n.title)}"${p.approx ? ' data-svx="1"' : ''} style="--c:var(--mix)"><i></i>Street view<small style="color:var(--muted)">· ${p.approx ? 'the area today' : 'what stands there now'}</small></a>`; }
  function sheet(){ let s = document.getElementById('svSheet'); if (s) return s; s = document.createElement('div'); s.id = 'svSheet'; s.hidden = true; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', 'Street view');
    s.innerHTML = '<div class="sv-bar"><div class="sv-now"><b class="sv-title"></b><span class="sv-meta"></span></div><a class="sm sv-out" target="_blank" rel="noopener">Open in Google Maps</a><button class="sm sv-close" aria-label="Close street view">close</button></div><div class="sv-frame"></div>';
    document.body.appendChild(s); s.querySelector('.sv-close').onclick = close; return s; }
  function open(la, lo, title, approx){
    if (!live()){ window.open(link(la, lo), '_blank', 'noopener'); return; }
    const s = sheet(); s.querySelector('.sv-title').textContent = title || 'Street view'; s.querySelector('.sv-meta').textContent = approx ? 'Nearby: the book has only an approximate position for this place.' : 'The street as Google last photographed it. Drag to look round.';
    s.querySelector('.sv-out').href = link(la, lo);
    s.querySelector('.sv-frame').innerHTML = `<iframe title="Street view: ${esc(title || '')}" src="${embed(la, lo)}" allowfullscreen loading="eager" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    s.hidden = false; s.querySelector('.sv-close').focus();
  }
  function close(){ const s = document.getElementById('svSheet'); if (!s) return; s.hidden = true; s.querySelector('.sv-frame').innerHTML = ''; }
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('a[data-sv]'); if (!el || !live() || e.metaKey || e.ctrlKey) return; const [la, lo] = el.dataset.sv.split(',').map(Number); e.preventDefault(); open(la, lo, el.dataset.svt, !!el.dataset.svx); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('hashchange', close);

  /* the club and town chapters get a line under the lede */
  function hookChapters(){ window.PageHooks = window.PageHooks || {}; const M = window.MOVE || {};
    [...(M.clubs || []), ...(M.towns || [])].forEach(c => { if (!c.id || !isFinite(c.lat)) return; const prev = PageHooks[c.id]; PageHooks[c.id] = () => { if (prev) prev(); const pg = document.querySelector(`.page[data-page="${c.id}"]`); if (!pg || pg.querySelector('.sv-line')) return; const lede = pg.querySelector('.lede'); if (!lede) return; const p = document.createElement('p'); p.className = 'cap sv-line'; p.innerHTML = a([c.lat, c.lon], c.title, /^tw/.test(c.id)) + ' · stand outside it today'; lede.after(p); }; }); }
  hookChapters();

  /* Explore: every place the book can put you outside */
  window.PageHooks.streets = () => { const box = document.getElementById('svIndex'); if (!box || box.dataset.done) return; box.dataset.done = 1; const P = places(); const groups = {}; P.forEach(p => { (groups[p.group] = groups[p.group] || []).push(p); });
    const order = Object.keys(groups).sort((x, y) => groups[y].length - groups[x].length);
    const cnt = document.getElementById('svCount'); if (cnt) cnt.textContent = `${P.length} places in ${order.length} groups`;
    box.innerHTML = order.map(g => `<div class="card sv-group"><h3>${esc(g)} <small>${groups[g].length}</small></h3><ul class="sv-list">${groups[g].slice().sort((x, y) => String(x.name).localeCompare(String(y.name))).map(p => `<li>${p.id && (typeof NODE !== 'undefined' && NODE[p.id] || (window.PAGE_IDS || []).includes(p.id)) ? `<a class="xl" href="#${p.id}">${esc(p.name)}</a>` : esc(p.name)}${p.years ? ` <small>${esc(p.years)}</small>` : ''} · ${a(p.c, p.name, p.approx)}</li>`).join('')}</ul></div>`).join(''); };
  return { live, link, embed, places, forId, a, chip, open, close };
})();
