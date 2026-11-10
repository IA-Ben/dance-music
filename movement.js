/* ===================================================================
   THE MOVEMENT — the clubs, the small towns, the roots of the music
   and the American scene. Each chapter gets a timeline you can touch;
   the openers get a map of every club and town, and the roots opener
   a map of the crossings that carried the music round the world.
   Data: window.MOVE (movement-data.js, built from build/movement/).
   =================================================================== */
window.MOVE = window.MOVE || { tl: {}, facts: {} };
/* node pages link to their deep dive */
window.DEEP_DIVES = { amnesia: 'cb1', warehouse: 'cb2', 'set-knuckles-warehouse': 'cb2', 'paradise-garage': 'cb3', 'the-fridge': 'cb4', hacienda: 'cb5', 'rex-club': 'cb6', 'music-institute': 'cb7', 'set-musicinstitute': 'cb7', space: 'cb8', tresor: 'cb9', 'ministry-of-sound': 'cb10', godskitchen: 'cb12', fabric: 'cb13', berghain: 'cb14', bassiani: 'cb15', hastings: 'tw1', 'the-pig': 'tw1', 'dtm-hastings': 'tw1', 'hastings-techno-militia': 'tw1', blackburn: 'tw3', 'blackburn-raves': 'tw3', 'the-orbit': 'tw3', kastellaun: 'tw5', 'nature-one': 'tw5', ozora: 'tw10', boom: 'tw10', 'disco-demolition': 'rt4', 'the-loft': 'rt4' };
window.Movement = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const col = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#999';
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const yr = y => { const f = Math.floor(y), r = y - f; return r >= .66 ? 'late ' + f : r >= .33 ? 'mid-' + f : String(f); };

  /* ---------- a chapter's timeline: one row per moment, a card for the detail ---------- */
  function timeline(page, id){
    const T = (MOVE.tl || {})[id]; if (!page || !T || !T.length || page.querySelector('.mv-tl')) return;
    const box = document.createElement('div'); box.className = 'card mv-tl';
    box.innerHTML = `<h3>Timeline</h3><svg class="diag" id="mvtl-${esc(id)}" role="group" aria-label="Timeline (diagram: arrow keys move between moments)"></svg><p class="cap">Point at or tap a moment for the detail.</p>`;
    const cap = [...page.querySelectorAll(':scope > p.cap')].pop(); if (cap) page.insertBefore(box, cap); else page.appendChild(box);
    const svg = box.querySelector('svg'); const W = 640, ROW = 30, TOP = 14, H = TOP * 2 + T.length * ROW; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const lineCol = getComputedStyle(page).getPropertyValue('--c').trim() || '#bbb';
    mk('line', { x1: 78, y1: TOP, x2: 78, y2: H - TOP, stroke: '#30303d', 'stroke-width': 2 }, svg);
    T.forEach(([y, label, detail, when], i) => {
      const cy = TOP + ROW / 2 + i * ROW; const g = mk('g', {}, svg);
      mk('circle', { cx: 78, cy, r: 6, fill: lineCol }, g);
      mk('rect', { class: 'dg-hit', x: 0, y: cy - ROW / 2, width: W, height: ROW }, g);
      const t1 = mk('text', { x: 64, y: cy + 4, 'text-anchor': 'end', fill: '#8f8fa0', 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' }, g); t1.textContent = when || yr(y);
      const t2 = mk('text', { x: 94, y: cy + 4, fill: '#ebebf1', 'font-size': 12.5, 'font-weight': 600, 'font-family': 'Space Grotesk, sans-serif' }, g); t2.textContent = label.length > 70 ? label.slice(0, 69) + '…' : label;
      if (window.Dg) Dg.mark(g, { title: label, meta: when || yr(y), text: detail || '', href: null });
    });
  }

  /* ---------- maps: equirectangular, with a coarse world outline ---------- */
  const VIEWS = { world: [-170, 180, -40, 72], europe: [-11, 30, 36, 60], britain: [-6.5, 2.5, 50, 55.4], usa: [-125, -66, 24, 50] };
  const proj = (v, [lat, lon], W, H) => { const [l0, l1, b0, b1] = VIEWS[v]; return [(lon - l0) / (l1 - l0) * W, (b1 - lat) / (b1 - b0) * H]; };
  function drawBase(svg, v, W, H){
    while (svg.firstChild) svg.removeChild(svg.firstChild); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    mk('rect', { width: W, height: H, fill: '#0e0e13' }, svg);
    for (let lat = -60; lat <= 80; lat += (v === 'world' ? 20 : 5)){ const [, y] = proj(v, [lat, 0], W, H); if (y > 0 && y < H) mk('line', { x1: 0, y1: y, x2: W, y2: y, stroke: '#18181f' }, svg); }
    for (let lon = -180; lon <= 180; lon += (v === 'world' ? 30 : 5)){ const [x] = proj(v, [0, lon], W, H); if (x > 0 && x < W) mk('line', { x1: x, y1: 0, x2: x, y2: H, stroke: '#18181f' }, svg); }
    if ((v === 'world' || v === 'usa') && window.MOVE_LAND) MOVE_LAND.forEach(poly => mk('path', { d: poly.map((p, i) => (i ? 'L' : 'M') + proj(v, p, W, H).map(n => n.toFixed(1)).join(' ')).join(' ') + 'Z', fill: '#1b1b24', stroke: '#2a2a35' }, svg));
  }
  /* items: [{id (chapter), title, where, years, lat, lon, kind}] */
  function map(svg, items, opts = {}){
    if (!svg || !items.length) return; const W = 1000, H = opts.h || 520; let view = opts.view || 'world';
    const card = svg.closest('.card'); let bar = card && card.querySelector('.mv-views');
    if (card && !bar && opts.views){ bar = document.createElement('div'); bar.className = 'dg-bar mv-views'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Map view'); bar.innerHTML = opts.views.map(([k, l]) => `<button type="button" class="dg-f${k === view ? ' on' : ''}" data-v="${k}" aria-pressed="${k === view}" style="--k:var(--mix)"><i></i>${esc(l)}</button>`).join(''); svg.parentNode.insertBefore(bar, svg); bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.v; bar.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); }); }
    function draw(){
      if (window.Dg){ Dg.clear(true); Dg.wire(svg, { reach: 14 }); }
      drawBase(svg, view, W, H);
      const placed = [];
      const shown = items.filter(it => { const [x, y] = proj(view, [it.lat, it.lon], W, H); return x > -5 && x < W + 5 && y > -5 && y < H + 5; });
      shown.sort((a, b) => b.lat - a.lat).forEach((it, i) => {
        const [x, y] = proj(view, [it.lat, it.lon], W, H); const g = mk('a', { href: '#' + it.id, 'aria-label': `${it.title}, ${it.where}${it.years ? ', ' + it.years : ''}` }, svg);
        mk('circle', { cx: x, cy: y, r: view === 'world' ? 6 : 8, fill: col(it.color || '--kick'), stroke: '#0e0e13', 'stroke-width': 1.5 }, g);
        mk('circle', { class: 'dg-hit', cx: x, cy: y, r: 14 }, g);
        if (view !== 'world' || opts.labels){ const right = x < W - 170; const fs = view === 'world' ? 10 : 12; let ly = y + 4; const lw = it.title.length * fs * .56, lx0 = right ? x + 11 : x - 11 - lw;
          for (let k = 0; k < 6 && placed.some(b => lx0 < b[2] && lx0 + lw > b[0] && ly - fs < b[3] && ly > b[1]); k++) ly += fs + 3;
          placed.push([lx0, ly - fs, lx0 + lw, ly + 2]);
          if (Math.abs(ly - (y + 4)) > 2) mk('line', { x1: x, y1: y, x2: right ? x + 9 : x - 9, y2: ly - 4, stroke: '#4a4a5c', 'stroke-width': 1 }, g);
          const t = mk('text', { x: x + (right ? 11 : -11), y: ly, 'text-anchor': right ? 'start' : 'end', fill: '#ebebf1', 'font-size': fs, 'font-weight': 600, 'font-family': 'Space Grotesk, sans-serif' }, g); t.textContent = it.title; }
        if (window.Dg) Dg.mark(g, { title: it.title, meta: [it.where, it.years].filter(Boolean).join(' · '), text: it.blurb || '', href: '#' + it.id, go: 'Read the chapter' });
      });
      const off = items.length - shown.length;
      const note = mk('text', { x: 12, y: H - 10, fill: '#6a6a80', 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' }, svg); note.textContent = `${shown.length} on this view${off ? ` · ${off} more on the world view` : ''}`;
      if (window.Dg) Dg.dirty(svg);
    }
    draw();
  }

  /* ---------- the roots opener: the crossings, drawn in turn ---------- */
  function routes(svg, steps){
    if (!svg || svg.dataset.done) return; svg.dataset.done = 1; const W = 1000, H = 520, v = 'world';
    drawBase(svg, v, W, H); if (window.Dg) Dg.wire(svg);
    const card = svg.closest('.card'); const say = document.createElement('p'); say.className = 'dg-open mv-say'; say.setAttribute('aria-live', 'polite'); say.textContent = 'Press play to follow the music round the world, or point at a crossing.';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'play mv-play'; btn.textContent = 'Play the journey';
    svg.parentNode.insertBefore(btn, svg); svg.insertAdjacentElement('afterend', say);
    const arcs = steps.map((s, i) => {
      const [x1, y1] = proj(v, s.from, W, H), [x2, y2] = proj(v, s.to, W, H); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(160, Math.hypot(x2 - x1, y2 - y1) * .35);
      const g = mk('g', {}, svg);
      const p = mk('path', { d: `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, fill: 'none', stroke: col(s.color || '--bass'), 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .9 }, g);
      mk('path', { class: 'mv-arc-hit', d: p.getAttribute('d'), fill: 'none', stroke: 'transparent', 'stroke-width': 18, 'pointer-events': 'stroke' }, g);
      mk('circle', { cx: x1, cy: y1, r: 4, fill: '#ebebf1' }, g); mk('circle', { cx: x2, cy: y2, r: 5.5, fill: col(s.color || '--bass') }, g);
      const n = mk('text', { x: mx, y: my + 26, 'text-anchor': 'middle', fill: '#0e0e13', 'font-size': 11, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace' }, g);
      const badge = mk('circle', { cx: mx, cy: my + 22, r: 10, fill: col(s.color || '--bass') }, g); g.insertBefore(badge, n); n.textContent = i + 1;
      if (window.Dg) Dg.mark(g, { title: s.title, meta: s.when, text: s.text, href: s.href || null, go: s.go || 'Read the chapter' });
      return { g, p, s };
    });
    let timer = 0, k = -1;
    const show = i => { arcs.forEach((a, j) => { a.g.classList.toggle('mv-dim', i >= 0 && j > i); }); if (i >= 0){ const a = arcs[i]; say.innerHTML = `<b>${i + 1}. ${esc(a.s.when)}:</b> ${esc(a.s.title)}.`; if (!reduce()){ const L = a.p.getTotalLength(); a.p.style.transition = 'none'; a.p.style.strokeDasharray = L; a.p.style.strokeDashoffset = L; a.p.getBoundingClientRect(); a.p.style.transition = 'stroke-dashoffset 1.6s ease'; a.p.style.strokeDashoffset = 0; } } };
    const stop = () => { clearInterval(timer); timer = 0; btn.textContent = 'Play the journey'; arcs.forEach(a => { a.g.classList.remove('mv-dim'); a.p.style.strokeDasharray = ''; a.p.style.strokeDashoffset = ''; }); };
    btn.addEventListener('click', () => { if (timer){ stop(); return; } k = 0; btn.textContent = '■ Stop'; show(0); timer = setInterval(() => { k++; if (k >= arcs.length){ stop(); say.textContent = 'Point at a crossing for its story, or press play again.'; return; } show(k); }, reduce() ? 1200 : 2600); });
    addEventListener('hashchange', stop);
  }

  /* ---------- an opener lists its chapters, with the years from each kicker ---------- */
  function chapterList(ol){
    if (!ol || ol.dataset.done || typeof STRANDS === 'undefined') return; const S = STRANDS[ol.dataset.strand]; if (!S) return; ol.dataset.done = 1;
    ol.innerHTML = S.spine.slice(1).map(id => { const pg = document.querySelector(`.page[data-page="${id}"]`); const k = pg && pg.querySelector('.kicker'); const yrs = k ? k.textContent.split('·').pop().trim() : ''; return `<li><a class="xl" href="#${id}">${esc((typeof CHAPTER_TITLES !== 'undefined' && CHAPTER_TITLES[id]) || id)}</a>${yrs ? ` <small>${esc(yrs)}</small>` : ''}</li>`; }).join('');
  }
  /* ---------- page hooks ---------- */
  function hookAll(){
    window.PageHooks = window.PageHooks || {};
    ['rt0', 'cb0', 'tw0', 'ed0', 'wn0', 'qf0', 'ub0', 'cm0', 'wm0', 'rs0'].forEach(id => { const prev = PageHooks[id]; PageHooks[id] = () => { if (prev) prev(); chapterList(document.querySelector(`.page[data-page="${id}"] .mv-list`)); }; });
    Object.keys(MOVE.tl || {}).forEach(id => { const prev = PageHooks[id]; PageHooks[id] = () => { if (prev) prev(); timeline(document.querySelector(`.page[data-page="${id}"]`), id); }; });
    const opener = (id, fn) => { const prev = PageHooks[id]; PageHooks[id] = () => { if (prev) prev(); try { fn(); } catch (e) { console.warn(e); } }; };
    opener('cb0', () => map(document.getElementById('mvClubMap'), MOVE.clubs || [], { views: [['world', 'World'], ['europe', 'Europe'], ['britain', 'Britain']] }));
    opener('tw0', () => map(document.getElementById('mvTownMap'), MOVE.towns || [], { views: [['world', 'World'], ['europe', 'Europe'], ['britain', 'Britain']] }));
    opener('ed0', () => map(document.getElementById('mvUsMap'), MOVE.usa || [], { view: 'usa', labels: true }));
    opener('rt0', () => routes(document.getElementById('mvRoutes'), MOVE.routes || []));
  }
  hookAll();
  return { timeline, map, routes };
})();
