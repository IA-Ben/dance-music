/* ===================================================================
   PLACE — maps, timelines, year tables and week views for the place
   strands (Ibiza, Goa, the M25, the Love Parade, the cities).
   Outlines: window.PLACES_GEO (built by geo_build.py from open data).
   Data:     window.PLACE_DATA[pid] = { markers, routes, landmarks, timeline, years }
   A map, its timeline and its year table share one year: move one and
   the others follow.
   =================================================================== */
window.Place = (() => {
  const GEO = () => window.PLACES_GEO || {};
  const DATA = () => window.PLACE_DATA || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byTitle = {};
  function nodeFor(t) {
    if (!t) return null;
    if (!Object.keys(byTitle).length && typeof NODES !== 'undefined') NODES.forEach(n => { byTitle[n.title.toLowerCase()] = n; (n.aliases || []).forEach(a => { byTitle[String(a).toLowerCase()] = byTitle[String(a).toLowerCase()] || n; }); });
    return byTitle[String(t).toLowerCase()] || null;
  }
  const link = (t, label) => { const n = nodeFor(t); return n ? `<a class="xl" href="#${n.id}">${esc(label || t)}</a>` : esc(label || t); };
  const span = y => { if (Array.isArray(y)) return y; const m = String(y || '').match(/(\d{4})(?:\s*[–-]\s*(\d{2,4})?)?/); if (!m) return [null, null]; const a = +m[1]; let b = m[2] ? +m[2] : (/[–-]\s*$/.test(String(y)) || /[–-]$/.test(String(y).trim()) ? null : a); if (b && b < 100) b = Math.floor(a / 100) * 100 + b; if (/[–-]\s*$/.test(String(y).trim())) b = null; return [a, b]; };
  const live = (yrs, y) => { if (y == null) return true; const [a, b] = yrs; if (a == null) return true; return a <= y && (b == null || b >= y); };
  const KIND = { club: 'Club', venue: 'Venue', shop: 'Record shop', studio: 'Studio', radio: 'Radio', festival: 'Festival site', landmark: 'Landmark', party: 'Party', meet: 'Meeting point', police: 'Police', rally: 'Rally', place: 'Place' };
  const bus = {};
  function on(pid, fn) { (bus[pid] = bus[pid] || []).push(fn); }
  function setYear(pid, y, from) { (bus[pid] || []).forEach(fn => { try { fn(y, from); } catch (e) { console.warn(e); } }); }

  /* ---------- markers: the place's own list plus any book page with coordinates in this place ---------- */
  function markers(pid) {
    const D = DATA()[pid] || {}; const out = (D.markers || []).map(m => {
      if (m.nodeid && typeof NODE !== 'undefined' && NODE[m.nodeid]) { const n = NODE[m.nodeid]; const f = (window.FACTS || {})[n.id] || {}; m = { name: n.title, title: n.title, kind: n.type === 'shop' ? 'shop' : n.type === 'event' ? 'party' : 'club', years: f.years || n.years, note: f.blurb || n.blurb, ...m }; }
      return { ...m, yrs: span(m.years || m.date) };
    });
    const have = new Set(out.map(m => (m.title || m.name || '').toLowerCase()));
    if (window.FACTS && typeof NODES !== 'undefined') NODES.forEach(n => {
      const f = FACTS[n.id]; if (!f || !Array.isArray(f.coords) || n.city !== pid) return;
      if (have.has(n.title.toLowerCase())) return;
      out.push({ name: n.title, title: n.title, kind: n.type === 'shop' ? 'shop' : n.type === 'event' ? 'party' : 'club', coords: f.coords, yrs: span(f.years || n.years), note: f.blurb || n.blurb || '' });
    });
    return out.filter(m => Array.isArray(m.coords) && m.coords.length === 2 && isFinite(m.coords[0]) && isFinite(m.coords[1]));
  }
  function proj(g, lat, lon) { const [lon0, , lon1, lat1] = g.bbox; const k = g.w / ((lon1 - lon0) * g.cos); return [(lon - lon0) * g.cos * k, (lat1 - lat) * k]; }

  /* ---------- the map ---------- */
  function map(el, pid) {
    if (el) el.dataset.pmap = pid;
    if (!el || el.dataset.done) return; const D = DATA()[pid] || {}; const g = GEO()[D.geo || pid]; if (!g) return; el.dataset.done = 1; const M = markers(pid); const R = D.routes || []; const L = D.landmarks || [];
    const years = [...M.map(m => m.yrs[0]), ...R.map(r => (r.years || [])[0])].filter(Boolean);
    const y0 = years.length ? Math.min(...years) : 1986, y1 = Math.max(2026, ...M.map(m => m.yrs[1] || 0));
    const lay = g.layers.map(l => l.k === 'names' ? '' : `<path class="pm-${l.k}${l.hi ? ' hi' : ''}" d="${l.d}"${l.name ? ` data-name="${esc(l.name)}"` : ''}/>`).join('');
    const names = (g.layers.find(l => l.k === 'names') || { names: [] }).names.map(([n, x, y]) => `<text class="pm-area-name" x="${x}" y="${y}">${esc(n)}</text>`).join('');
    const rt = R.map((r, i) => `<polyline class="pm-route" data-i="${i}" points="${(r.points || []).map(p => proj(g, p[0], p[1]).map(v => v.toFixed(1)).join(',')).join(' ')}"/>`).join('');
    const lm = L.map(l => { const [x, y] = proj(g, l.coords[0], l.coords[1]); return `<g class="pm-lm" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="-4" y="-4" width="8" height="8" transform="rotate(45)"/><text x="9" y="4">${esc(l.name)}</text></g>`; }).join('');
    const mk = M.map((m, i) => { const [x, y] = proj(g, m.coords[0], m.coords[1]); return `<g class="pm-mk k-${esc(m.kind || 'place')}" data-i="${i}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(m.name)}${m.yrs[0] ? ', ' + m.yrs[0] : ''}"><circle r="7"/><text class="pm-lbl" x="${x > g.w * 0.6 ? -11 : 11}" y="4"${x > g.w * 0.6 ? ' text-anchor="end"' : ''}>${esc(m.name)}</text></g>`; }).join('');
    const kinds = [...new Set(M.map(m => m.kind || 'place'))];
    el.innerHTML = `<div class="pm-tools"><button class="play pm-play" type="button" aria-label="Play the years">Play the years</button><label class="pm-yr"><span class="pm-yrout">All years</span><input type="range" min="${y0}" max="${y1 + 1}" value="${y1 + 1}" step="1" aria-label="Year"></label></div>
      <div class="pm-wrap"><svg class="pm" viewBox="0 0 ${g.w} ${g.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of ${esc(g.title)}">${lay}${names}${rt}${lm}${mk}</svg></div>
      ${kinds.length > 1 ? `<div class="pm-legend">${kinds.map(k => `<button type="button" class="pm-kind on k-${esc(k)}" data-k="${esc(k)}"><i></i>${esc(KIND[k] || k)}</button>`).join('')}</div>` : ''}
      <div class="pm-info" aria-live="polite"><p class="cap">${M.length ? `${M.length} places. Tap one for its story; drag the slider to see what was open in a given year.` : R.length ? 'Drag the slider or press play to see each year\'s route.' : 'Places are being added to this map.'}</p></div>
      <p class="cap pm-credit">Outline: ${pid === 'world' ? 'Natural Earth' : '© OpenStreetMap contributors, Natural Earth' + (g.layers.some(l => l.k === 'city') ? ', Click That ’Hood' : '')}.</p>`;
    const svg = el.querySelector('svg'), info = el.querySelector('.pm-info'), range = el.querySelector('input'), out = el.querySelector('.pm-yrout'), play = el.querySelector('.pm-play');
    /* frame the dense cluster of places first; the whole outline is one tap away */
    const P = M.map(m => proj(g, m.coords[0], m.coords[1])).concat(R.flatMap(r => (r.points || []).map(q => proj(g, q[0], q[1]))), L.filter(l => l.coords).map(l => proj(g, l.coords[0], l.coords[1])));
    let focus = null;
    if (P.length >= 4) {
      const med = a => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
      const mx = med(P.map(q => q[0])), my = med(P.map(q => q[1])); const ds = P.map(q => Math.hypot(q[0] - mx, q[1] - my)); const r = Math.max(med(ds) * 2.6, g.w * 0.08);
      const C = P.filter((q, i) => ds[i] <= r);
      let x0 = Math.min(...C.map(q => q[0])), x1 = Math.max(...C.map(q => q[0])), y0 = Math.min(...C.map(q => q[1])), y1 = Math.max(...C.map(q => q[1]));
      const padx = Math.max((x1 - x0) * 0.18, g.w * 0.04), pady = Math.max((y1 - y0) * 0.18, g.h * 0.04); x0 -= padx; x1 += padx; y0 -= pady; y1 += pady;
      let w = x1 - x0, h = y1 - y0; const ar = g.w / g.h; if (w / h > ar) { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; }
      if (w < g.w * 0.8 && C.length < P.length || w < g.w * 0.6) focus = [Math.max(0, x0), Math.max(0, y0), Math.min(w, g.w), Math.min(h, g.h)];
    }
    let zoomed = !!focus;
    const vbFull = `0 0 ${g.w} ${g.h}`;
    function frame() { svg.setAttribute('viewBox', zoomed && focus ? focus.map(v => v.toFixed(1)).join(' ') : vbFull); scale(); }
    if (focus) { const zb = document.createElement('button'); zb.type = 'button'; zb.className = 'pm-zoom'; zb.textContent = 'Whole map'; el.querySelector('.pm-tools').appendChild(zb); zb.addEventListener('click', () => { zoomed = !zoomed; zb.textContent = zoomed ? 'Whole map' : 'Zoom in'; frame(); }); }
    const off = new Set();
    function scale() { const vb = (svg.getAttribute('viewBox') || vbFull).split(' ').map(Number); const s = vb[2] / Math.max(1, svg.clientWidth || el.clientWidth || g.w); svg.style.setProperty('--s', s); svg.querySelectorAll('.pm-mk circle').forEach(c => c.setAttribute('r', Math.max(5, Math.min(11, 7 * s)))); svg.querySelectorAll('.pm-mk text, .pm-lm text, .pm-area-name').forEach(t => t.style.fontSize = (11 * s).toFixed(1) + 'px'); svg.querySelectorAll('.pm-mk text').forEach(t => t.setAttribute('x', ((t.getAttribute('text-anchor') === 'end' ? -11 : 11) * s).toFixed(1))); }
    function show(y) {
      out.textContent = y == null ? 'All years' : y;
      M.forEach((m, i) => { const e = svg.querySelector(`.pm-mk[data-i="${i}"]`); const on = live(m.yrs, y) && !off.has(m.kind || 'place'); e.classList.toggle('dim', !on); e.classList.toggle('lbl', on && y != null && M.filter(n => live(n.yrs, y)).length <= 14); });
      R.forEach((r, i) => { const e = svg.querySelector(`.pm-route[data-i="${i}"]`); e.classList.toggle('dim', y != null && !live(r.years || [null, null], y)); });
    }
    function pick(i) {
      const m = M[i]; svg.querySelectorAll('.pm-mk.sel').forEach(e => e.classList.remove('sel')); const e = svg.querySelector(`.pm-mk[data-i="${i}"]`); if (e) e.classList.add('sel');
      const yrs = m.date ? esc(m.date) : m.yrs[0] ? `${m.yrs[0]}–${m.yrs[1] === null ? '' : m.yrs[1] === m.yrs[0] ? '' : m.yrs[1]}`.replace(/–$/, m.yrs[1] === null ? '–' : '') : '';
      info.innerHTML = `<h4>${link(m.title || m.name, m.name)}</h4><p class="cap">${esc(KIND[m.kind] || m.kind || '')}${m.site ? ' · ' + esc(m.site) : m.area ? ' · ' + esc(m.area) : ''}${yrs ? ' · ' + yrs : ''}${m.crowd ? ' · ' + esc(m.crowd) : ''}</p>${m.note ? `<p>${esc(m.note)}</p>` : ''}${m.source || (window.Street && m.coords) ? `<p class="cap">${m.source ? `<a href="${esc(m.source)}" target="_blank" rel="noopener">Source</a>` : ''}${m.source && window.Street && m.coords ? ' · ' : ''}${window.Street && m.coords ? Street.a(m.coords, m.title || m.name, /coordinates are (those|that) of|estimated|not surveyed|placed by|approximate/i.test(m.note || '')) : ''}</p>` : ''}`;
      if (window.autolink) try { autolink(info, null); } catch (e) {}
    }
    svg.addEventListener('click', ev => { const e = ev.target.closest('.pm-mk'); if (e) pick(+e.dataset.i); });
    svg.addEventListener('keydown', ev => { const e = ev.target.closest('.pm-mk'); if (e && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); pick(+e.dataset.i); } });
    range.addEventListener('input', () => { const v = +range.value; const y = v > y1 ? null : v; show(y); setYear(pid, y, 'map'); });
    el.querySelectorAll('.pm-kind').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; if (off.has(k)) off.delete(k); else off.add(k); b.classList.toggle('on', !off.has(k)); show(+range.value > y1 ? null : +range.value); }));
    let timer = null;
    play.addEventListener('click', () => {
      if (timer) { clearInterval(timer); timer = null; play.classList.remove('on'); play.textContent = 'Play the years'; return; }
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      let y = +range.value > y1 ? y0 : +range.value; play.classList.add('on'); play.textContent = 'Stop';
      timer = setInterval(() => { range.value = y; show(y); setYear(pid, y, 'map'); y++; if (y > y1) { clearInterval(timer); timer = null; play.classList.remove('on'); play.textContent = 'Play the years'; } }, reduce ? 1200 : 650);
    });
    on(pid, (y, from) => { if (from === 'map') return; range.value = y == null ? y1 + 1 : y; show(y); });
    frame(); show(null); if (window.ResizeObserver) new ResizeObserver(scale).observe(svg); else addEventListener('resize', scale);
    if (D.inset && DATA()[D.inset]) { const box = document.createElement('div'); box.className = 'pm-inset'; box.innerHTML = `<h4>${esc(DATA()[D.inset].title || '')}</h4><div class="placeMap" data-place="${esc(D.inset)}"></div>`; el.appendChild(box); map(box.querySelector('.placeMap'), D.inset); }
  }

  /* ---------- the timeline: dated sentences, grouped by decade, linked to the map ---------- */
  function timeline(el, pid) {
    if (!el || el.dataset.done) return; const T = (DATA()[pid] || {}).timeline || []; if (!T.length) { el.innerHTML = '<p class="cap">The dates are being gathered.</p>'; return; } el.dataset.done = 1;
    const rows = [...T].sort((a, b) => (+a[0] || 0) - (+b[0] || 0));
    const decs = [...new Set(rows.map(r => Math.floor(+r[0] / 10) * 10).filter(Boolean))];
    el.innerHTML = `<div class="pt-decades" role="tablist">${['All', ...decs].map(d => `<button type="button" class="chip pt-dec${d === 'All' ? ' on' : ''}" data-d="${d}">${d === 'All' ? 'All' : d + 's'}</button>`).join('')}</div>
      <ol class="pt-list">${rows.map((r, i) => `<li class="pt-row" data-y="${esc(r[0])}" data-d="${Math.floor(+r[0] / 10) * 10}"><button type="button" class="pt-year" data-y="${esc(r[0])}" aria-label="Show ${esc(r[0])} on the map">${esc(r[0])}</button><span class="pt-text">${esc(r[1])}${r[2] && nodeFor(r[2]) ? ` <span class="pt-go">${link(r[2], '→ ' + r[2])}</span>` : ''}${r[3] ? ` <a class="pt-src" href="${esc(r[3])}" target="_blank" rel="noopener" aria-label="Source">source</a>` : ''}</span></li>`).join('')}</ol>`;
    el.querySelectorAll('.pt-dec').forEach(b => b.addEventListener('click', () => { el.querySelectorAll('.pt-dec').forEach(x => x.classList.toggle('on', x === b)); const d = b.dataset.d; el.querySelectorAll('.pt-row').forEach(r => r.hidden = d !== 'All' && r.dataset.d !== d); }));
    el.querySelectorAll('.pt-year').forEach(b => b.addEventListener('click', () => { const y = +b.dataset.y; mark(y); setYear(pid, y, 'timeline'); const m = document.querySelector(`.page.show [data-pmap="${pid}"]`); if (m){ const r = m.getBoundingClientRect(); if (r.bottom < 60 || r.top > innerHeight - 60) m.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }));
    /* the chosen year's rows light up, with a way on to that year's page */
    function mark(y) { el.querySelectorAll('.pt-yl').forEach(a => a.remove()); el.querySelectorAll('.pt-row').forEach(r => { const on = y != null && +r.dataset.y === y; r.classList.toggle('now', on); }); const first = y != null && el.querySelector(`.pt-row[data-y="${y}"]`); if (first && (!window.PAGE_IDS || PAGE_IDS.includes('y' + y))) first.querySelector('.pt-text').insertAdjacentHTML('beforeend', ` <a class="pt-yl xl" href="#y${y}">${y} in the book →</a>`); }
    on(pid, (y, from) => { if (from !== 'timeline') mark(y); });
  }

  /* ---------- every parade: the Love Parade's years as cards ---------- */
  function years(el, pid) {
    if (!el || el.dataset.done) return; const Y = (DATA()[pid] || {}).years || []; if (!Y.length) { el.innerHTML = '<p class="cap">The year-by-year table is being gathered.</p>'; return; } el.dataset.done = 1;
    el.innerHTML = `<div class="py-grid">${Y.map(r => `<button type="button" class="py-card${/cancel/i.test((r.note || '') + (r.route || '')) && !r.crowd ? ' off' : ''}" data-y="${esc(r.year)}"><b class="py-year">${esc(r.year)}</b>${r.motto ? `<span class="py-motto">${esc(r.motto)}</span>` : ''}<span class="py-meta">${[r.city, r.crowd].filter(Boolean).map(esc).join(' · ')}</span>${r.anthem ? `<span class="py-anthem">♪ ${esc(r.anthem)}</span>` : ''}</button>`).join('')}</div><div class="py-info" aria-live="polite"></div>`;
    const info = el.querySelector('.py-info');
    function pick(y) {
      el.querySelectorAll('.py-card').forEach(c => c.classList.toggle('sel', +c.dataset.y === y)); const r = Y.find(x => +x.year === y); if (!r) { info.innerHTML = ''; return; }
      info.innerHTML = `<h4>${esc(r.year)}${r.date ? ' · ' + esc(r.date) : ''}</h4><p class="cap">${[r.city, r.route, r.floats ? r.floats + ' floats' : '', r.crowd].filter(Boolean).map(esc).join(' · ')}</p>${r.note ? `<p>${esc(r.note)}</p>` : ''}${r.anthem ? `<p class="cap">Anthem: ${link(r.anthem)}</p>` : ''}${r.source ? `<p class="cap"><a href="${esc(r.source)}" target="_blank" rel="noopener">Source</a></p>` : ''}`;
      if (window.autolink) try { autolink(info, null); } catch (e) {}
    }
    el.querySelectorAll('.py-card').forEach(c => c.addEventListener('click', () => { const y = +c.dataset.y; pick(y); setYear(pid, y, 'years'); }));
    on(pid, (y, from) => { if (from !== 'years' && y != null) pick(y); });
  }

  /* ---------- a week of listings in one city and year ---------- */
  function week(el, city, year) {
    if (!el || el.dataset.done || !window.Listings || !window.LISTINGS) return; el.dataset.done = 1;
    const ls = Listings.on(year).filter(l => l[1] === city);
    if (ls.length < 2) { el.innerHTML = `<p class="cap">Not enough listings yet for ${year}. The listings page has the rest.</p>`; return; }
    const by = {}; Listings.DAYS.forEach(d => by[d] = []); const other = [];
    const nightly = []; ls.forEach(l => { if (String(l[5]).toLowerCase() === 'nightly'){ nightly.push(l); return; } const ds = Listings.days(l[5]); if (ds.length) ds.forEach(d => by[d].push(l)); else other.push(l); });
    el.innerHTML = `<p class="cap">${year}: ${ls.length} nights the book knows about.</p>${nightly.length ? `<div class="pw-week pw-nightly"><div class="pw-day"><h4>Every night</h4>${nightly.map(l => Listings.line(l, false)).join('')}</div></div>` : ''}<div class="pw-week">${Listings.DAYS.map(d => `<div class="pw-day"><h4>${d}</h4>${by[d].length ? by[d].map(l => Listings.line(l, false)).join('') : '<p class="cap">–</p>'}</div>`).join('')}</div>${other.length ? `<div class="pw-other"><h4>Monthly, one-offs and festivals</h4>${other.map(l => Listings.line(l, false)).join('')}</div>` : ''}`;
  }

  /* ---------- mount everything on a page ---------- */
  const IDS = { ibizaMap: ['map', 'ibiza'], goaMap: ['map', 'goa'], m25Map: ['map', 'm25'], lpMap: ['map', 'lovepar'], ibizaTimeline: ['timeline', 'ibiza'], goaTimeline: ['timeline', 'goa'], m25Timeline: ['timeline', 'm25'], lpTimeline: ['timeline', 'lovepar'], lpYears: ['years', 'lovepar'] };
  function mountAll(root) {
    root = root || document;
    Object.entries(IDS).forEach(([id, [f, pid]]) => { const e = root.querySelector('#' + id); if (e) ({ map, timeline, years })[f](e, pid); });
    root.querySelectorAll('.placeMap[data-place]').forEach(e => map(e, e.dataset.place));
    root.querySelectorAll('.placeTimeline[data-place]').forEach(e => timeline(e, e.dataset.place));
    root.querySelectorAll('.placeYears[data-place]').forEach(e => years(e, e.dataset.place));
    root.querySelectorAll('.ibizaWeek[data-year]').forEach(e => week(e, e.dataset.city || 'ibiza', +e.dataset.year));
  }
  return { map, timeline, years, week, mountAll, setYear, on, markers };
})();
