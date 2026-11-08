/* ===================================================================
   GENRE MAP — the family tree of the book's forty genres.
   Time runs left to right; each genre is a bar from its first year to
   its last (or to now); lines show what grew out of what. Tap a genre
   to light up its line of descent, hear its pattern and open its page;
   play the tree to watch the decades fill in.
   =================================================================== */
window.GenreMap = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const col = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#999';
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* families in reading order; rows inside each keep children near their parents */
  const FAMILIES = [
    ['techno', 'Techno', ['g-electro', 'g-detroit', 'g-bleep', 'g-idm', 'g-berlin', 'g-schranz', 'g-minimal', 'g-berghain', 'g-dub', 'g-hypnotic', 'g-bham', 'g-industrial', 'g-acidtek', 'g-peak', 'g-hard']],
    ['house', 'House', ['g-house', 'g-deephouse', 'g-garage', 'g-ukgarage', 'g-frenchtouch', 'g-techhouse', 'g-balearic', 'g-acidhouse']],
    ['rave', 'Rave', ['g-newbeat', 'g-hardcore', 'g-happy', 'g-gabber']],
    ['jungle', 'Jungle & D&B', ['g-jungle', 'g-raggajungle', 'g-jumpup', 'g-intelligent', 'g-liquid', 'g-techstep', 'g-neurofunk']],
    ['trance', 'Trance', ['g-trance', 'g-frankfurt-trance', 'g-uplifting', 'g-hardtrance', 'g-goa', 'g-progressive']]
  ];
  const Y0 = 1975, Y1 = (window.BOOK && BOOK.to) || 2027, W = 1000, L = 16, R = 16, ROW = 22, GAP = 26, TOP = 34;
  const x = y => L + (y - Y0) * (W - L - R) / (Y1 - Y0);
  /* "1985–" → [1985, now]; "1989–91" → [1989, 1991]; "1981 / 2010s" → two spans */
  function spans(years){
    const s = String(years || '');
    if (/\/\s*2010s/.test(s)) return [[1981, 1992], [2010, Y1]];
    const m = s.match(/(\d{4})s?\s*(?:[–-]\s*(\d{2,4})?)?/); if (!m) return [[1990, Y1]];
    let a = +m[1]; if (/^\s*c?\.?\s*\d{4}s/.test(s) && !/–/.test(s)) a += 3;
    if (/\d{4}s\s*–/.test(s) && /^\s*\d{4}s/.test(s)) a += 3;
    let b = Y1; if (m[2]) b = m[2].length === 2 ? +(String(a).slice(0, 2) + m[2]) : +m[2]; else if (!/–/.test(s)) b = a + 2;
    return [[a, Math.max(b, a + 1)]];
  }
  let state = null;
  function build(box){
    if (!box || box.dataset.done) return; box.dataset.done = 1;
    const G = {}; NODES.filter(n => n.type === 'genre').forEach(n => { G[n.id] = n; });
    const parents = {}, kids = {};
    Object.values(G).forEach(n => { parents[n.id] = n.rel.filter(r => r[0] === 'from' && G[r[1]]).map(r => r[1]); });
    Object.entries(parents).forEach(([c, ps]) => ps.forEach(p => { (kids[p] = kids[p] || []).push(c); }));
    const rows = {}; let yy = TOP; const famOf = {}; const famTop = [];
    FAMILIES.forEach(([f, label, ids]) => { famTop.push([f, label, yy]); yy += 16; ids.filter(id => G[id]).forEach(id => { rows[id] = yy + ROW / 2; famOf[id] = f; yy += ROW; }); yy += GAP - 10; });
    Object.keys(G).filter(id => !rows[id]).forEach(id => { rows[id] = yy + ROW / 2; famOf[id] = (G[id].strands || ['techno'])[0]; yy += ROW; });
    const H = yy + 6;
    const colour = id => col((STRANDS[famOf[id]] || STRANDS.techno).color);
    box.innerHTML = `<div class="gm-bar">
        <button class="play gm-play">Play the tree</button>
        <label class="gm-snd"><input type="checkbox" checked> with sound</label>
        <span class="gm-filters">${FAMILIES.map(([f, label]) => `<button class="gm-f on" data-f="${f}" style="--c:var(${(STRANDS[f] || STRANDS.techno).color})"><i></i>${label}</button>`).join('')}</span>
      </div>
      <div class="gm-scroll"><svg class="diag gm-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="The genre family tree, ${Y0} to ${Y1}"></svg></div>
      <div class="gm-card" aria-live="polite"><p class="cap">Tap a genre to follow its line of descent, hear its pattern and open its page. Lines run from a genre to the ones that grew out of it.</p></div>`;
    const svg = box.querySelector('svg');
    /* decades */
    const grid = mk('g', { class: 'gm-grid' }, svg);
    for (let d = 1980; d <= Y1; d += 10){ mk('line', { x1: x(d), y1: TOP - 10, x2: x(d), y2: H - 4 }, grid); const t = mk('text', { x: x(d), y: TOP - 16, 'text-anchor': 'middle' }, grid); t.textContent = d; }
    const now = mk('line', { class: 'gm-now', x1: x(Y1), y1: TOP - 10, x2: x(Y1), y2: H - 4 }, grid);
    famTop.forEach(([f, label, top]) => { const c = col((STRANDS[f] || STRANDS.techno).color); mk('line', { class: 'gm-famline', x1: L, x2: W - R, y1: top + 6, y2: top + 6, stroke: c }, svg); const t = mk('text', { class: 'gm-fam', x: L, y: top + 10, fill: c }, svg); t.textContent = label.toUpperCase(); });
    /* lines of descent */
    const edges = mk('g', { class: 'gm-edges' }, svg); const E = [];
    Object.entries(parents).forEach(([c, ps]) => ps.forEach(p => {
      const cx = x(spans(G[c].years)[0][0]); const y1 = rows[p], y2 = rows[c];
      const d = `M ${cx - 7} ${y1} C ${cx + 4} ${y1}, ${cx - 4} ${y2}, ${cx + 2} ${y2}`;
      const e = mk('path', { d, class: 'gm-e', stroke: colour(c), 'data-a': p, 'data-b': c }, edges); E.push(e);
    }));
    /* genres */
    const genres = mk('g', { class: 'gm-genres' }, svg); const nodes = {};
    Object.keys(rows).forEach(id => {
      const n = G[id], sp = spans(n.years), y = rows[id];
      const a = mk('a', { href: '#' + id, class: 'gm-g', 'data-id': id, 'data-f': famOf[id], tabindex: 0, 'aria-label': `${n.title}, ${n.years}` }, genres);
      const bars = sp.map(([s, e]) => mk('rect', { x: x(s), y: y - 6, width: Math.max(4, x(e) - x(s)), height: 12, rx: 6, fill: colour(id), class: 'gm-bar-r', 'data-s': s, 'data-e': e }, a));
      mk('circle', { cx: x(sp[0][0]), cy: y, r: 4.5, fill: colour(id), class: 'gm-dot' }, a);
      const t = mk('text', { x: x(sp[0][0]) + 9, y: y + 4, class: 'gm-t' }, a); t.textContent = n.title;
      const tt = mk('title', {}, a); tt.textContent = `${n.title} · ${n.years}`;
      nodes[id] = { a, bars, start: sp[0][0] };
    });
    state = { box, svg, G, parents, kids, rows, nodes, E, famOf, pinned: null, timer: null };
    const lineage = id => { const up = new Set(), down = new Set(); const walk = (k, m, s) => (m[k] || []).forEach(j => { if (!s.has(j)){ s.add(j); walk(j, m, s); } }); walk(id, parents, up); walk(id, kids, down); return { up, down }; };
    const light = id => {
      if (!id){ svg.classList.remove('gm-dim'); Object.values(nodes).forEach(o => o.a.classList.remove('lit', 'me')); E.forEach(e => e.classList.remove('lit')); return; }
      const { up, down } = lineage(id); const on = new Set([id, ...up, ...down]);
      svg.classList.add('gm-dim');
      Object.entries(nodes).forEach(([k, o]) => { o.a.classList.toggle('lit', on.has(k)); o.a.classList.toggle('me', k === id); });
      E.forEach(e => e.classList.toggle('lit', on.has(e.dataset.a) && on.has(e.dataset.b) && ((up.has(e.dataset.a) || e.dataset.a === id) && (up.has(e.dataset.b) || e.dataset.b === id) || (down.has(e.dataset.b) && (down.has(e.dataset.a) || e.dataset.a === id)))));
    };
    const chip = id => `<a class="chip gm-jump" href="#${id}" data-id="${id}" style="--c:var(${(STRANDS[famOf[id]] || STRANDS.techno).color})"><i></i>${esc(G[id].title)}</a>`;
    const card = box.querySelector('.gm-card');
    const show = id => {
      const n = G[id]; const city = n.city && NODE[n.city] ? NODE[n.city].title : '';
      const ps = parents[id] || [], ks = kids[id] || [];
      card.innerHTML = `<div class="gm-head"><b style="color:${colour(id)}">${esc(n.title)}</b><span>${esc(n.years || '')}${city ? ' · ' + esc(city) : ''}</span></div>
        <p>${esc(n.blurb || '')}</p>
        ${ps.length ? `<div class="gm-rel"><small>Grew out of</small>${ps.map(chip).join('')}</div>` : ''}
        ${ks.length ? `<div class="gm-rel"><small>Led to</small>${ks.map(chip).join('')}</div>` : ''}
        <div class="gm-acts">${n.preset ? `<button class="play gm-hear">Hear it</button>` : ''}<a class="gm-open" href="#${id}">Open the page and how to make it →</a></div>`;
      const hb = card.querySelector('.gm-hear'); if (hb) hb.onclick = () => { stopTree(); if (typeof playGenre === 'function') playGenre(n.preset, 4, hb); };
      card.querySelectorAll('.gm-jump').forEach(j => j.onclick = e => { e.preventDefault(); pin(j.dataset.id); });
    };
    const pin = id => { state.pinned = id; light(id); show(id); const o = nodes[id]; if (o){ const sc = box.querySelector('.gm-scroll'); const bx = +o.bars[0].getAttribute('x') * sc.scrollWidth / W; if (bx < sc.scrollLeft || bx > sc.scrollLeft + sc.clientWidth - 80) sc.scrollTo({ left: Math.max(0, bx - 60), behavior: reduce() ? 'auto' : 'smooth' }); } };
    Object.entries(nodes).forEach(([id, o]) => {
      o.a.addEventListener('mouseenter', () => { if (!state.timer) light(id); });
      o.a.addEventListener('mouseleave', () => { if (!state.timer) light(state.pinned); });
      o.a.addEventListener('focus', () => { if (!state.timer) light(id); });
      o.a.addEventListener('click', e => { e.preventDefault(); if (state.pinned === id){ location.hash = '#' + id; return; } pin(id); });
      o.a.addEventListener('keydown', e => {
        if (e.key === 'Enter'){ e.preventDefault(); if (state.pinned === id) location.hash = '#' + id; else pin(id); }
        const order = Object.keys(rows); const i = order.indexOf(id);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); const j = order[(i + (e.key === 'ArrowDown' ? 1 : order.length - 1)) % order.length]; nodes[j].a.focus(); }
        if (e.key === 'ArrowLeft' && (parents[id] || []).length){ e.preventDefault(); nodes[parents[id][0]].a.focus(); }
        if (e.key === 'ArrowRight' && (kids[id] || []).length){ e.preventDefault(); nodes[kids[id][0]].a.focus(); }
      });
    });
    svg.addEventListener('click', e => { if (!e.target.closest('.gm-g')){ state.pinned = null; light(null); } });
    /* family filters */
    box.querySelectorAll('.gm-f').forEach(b => b.onclick = () => { b.classList.toggle('on'); const off = new Set([...box.querySelectorAll('.gm-f:not(.on)')].map(x => x.dataset.f)); Object.values(nodes).forEach(o => o.a.classList.toggle('off', off.has(o.a.dataset.f))); E.forEach(e => e.classList.toggle('off', off.has(famOf[e.dataset.a]) || off.has(famOf[e.dataset.b]))); });
    /* play the tree: the years sweep left to right and the genres grow in as they begin */
    const head = mk('g', { class: 'gm-head-l', opacity: 0 }, svg); const hl = mk('line', { y1: TOP - 10, y2: H - 4 }, head); const ht = mk('text', { y: TOP - 2, 'text-anchor': 'middle' }, head);
    const reveal = yr => {
      Object.entries(nodes).forEach(([id, o]) => {
        o.bars.forEach(r => { const s = +r.dataset.s, e = +r.dataset.e; const w = yr <= s ? 0 : Math.max(4, x(Math.min(e, yr)) - x(s)); r.setAttribute('width', w); r.style.opacity = yr < s ? 0 : 1; });
        o.a.classList.toggle('hidden', yr < o.start);
      });
      E.forEach(e => e.classList.toggle('hidden', yr < nodes[e.dataset.b].start));
      hl.setAttribute('x1', x(yr)); hl.setAttribute('x2', x(yr)); ht.setAttribute('x', x(yr)); ht.textContent = Math.floor(yr);
    };
    const stopTree = () => { if (!state.timer) return; clearInterval(state.timer); state.timer = null; head.setAttribute('opacity', 0); reveal(Y1 + 1); svg.classList.remove('gm-playing'); box.querySelector('.gm-play').textContent = 'Play the tree'; };
    state.stop = stopTree;
    box.querySelector('.gm-play').onclick = () => {
      if (state.timer){ stopTree(); if (window.SoundBus) try { SoundBus.all(); } catch (e) {} return; }
      state.pinned = null; light(null); svg.classList.add('gm-playing'); head.setAttribute('opacity', 1); box.querySelector('.gm-play').textContent = 'Stop';
      const sound = box.querySelector('.gm-snd input').checked; let yr = 1979; const step = reduce() ? 1 : 0.25; const ms = reduce() ? 600 : 160;
      const sc = box.querySelector('.gm-scroll'); let lastSound = 0;
      state.timer = setInterval(() => {
        const before = yr; yr += step; reveal(yr);
        if (sc.scrollWidth > sc.clientWidth){ const px = x(yr) * sc.scrollWidth / W; sc.scrollLeft = Math.max(0, px - sc.clientWidth * 0.6); }
        const born = Object.keys(nodes).filter(id => nodes[id].start > before && nodes[id].start <= yr);
        if (born.length){ const id = born[born.length - 1]; show(id); light(id);
          if (sound && G[id].preset && typeof playGenre === 'function' && performance.now() - lastSound > 2600){ lastSound = performance.now(); try { playGenre(G[id].preset, 2, null); } catch (e) {} } }
        if (yr >= Y1){ stopTree(); }
      }, ms);
    };
    addEventListener('hashchange', () => { if (state && state.timer) stopTree(); });
    /* arrive with a genre chosen: #genres?g=g-detroit */
    const want = (location.hash.match(/[?&]g=([\w-]+)/) || [])[1]; if (want && nodes[want]) setTimeout(() => pin(want), 50);
  }
  return { build, focus(id){ if (state && state.nodes[id]) state.box.querySelector(`.gm-g[data-id="${id}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })); } };
})();
window.PageHooks = window.PageHooks || {};
window.PageHooks.genres = () => GenreMap.build(document.getElementById('genreMap'));
