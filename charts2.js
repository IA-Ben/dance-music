/* ===================================================================
   CHARTS 2 — the history charts made playable and touchable.
   Replaces drawTimeline (master timeline), drawCityNet (how the ideas
   travelled) and drawBpmChart (tempo by dialect). Tap or click instead
   of hover; every chart can play; a year chosen in the timeline is the
   year the other two light up.
   =================================================================== */
window.Charts2 = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const h = (t, cls, html) => { const e = document.createElement(t); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const col = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#999';
  const narrow = el => (el.closest('.card') || el.parentElement || document.body).clientWidth < 620;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- one player for every chart: plays presets in turn, stops on navigation or Stop ---------- */
  let token = 0, timer = null, onStop = null;
  function cancel() { token++; clearTimeout(timer); timer = null; const f = onStop; onStop = null; if (f) f(); }
  function playOne(name, btn) { try { if (typeof playGenre === 'function' && (!window.PRESET || PRESET(name))) { playGenre(name, 2, btn || null); return true; } } catch (e) { console.warn(e); } return false; }
  function barsSec(name, bars = 2) { try { const G = PRESET(name); return bars * 4 * 60 / (G.bpm || 128); } catch (e) { return 4; } }
  function sequence(steps, stop) {
    cancel(); const my = ++token; onStop = stop; let i = 0;
    const next = () => { if (my !== token) return; if (i >= steps.length) { const f = onStop; onStop = null; if (f) f(); return; } const s = steps[i++]; s.show(); const ok = s.name ? playOne(s.name) : false; timer = setTimeout(next, ((ok ? barsSec(s.name) : 1.2) * 1000) | 0); };
    next();
  }
  addEventListener('hashchange', cancel);
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#stopAll')) cancel(); }, true);
  const yearBus = [];
  const setYear = (y, from) => yearBus.forEach(f => { try { f(y, from); } catch (e) {} });

  /* =========================== 1. MASTER TIMELINE =========================== */
  const SCENES = [['US', 'Detroit / Chicago', '--kick'], ['UK', 'UK', '--drums'], ['IB', 'Ibiza', '--perc'], ['DE', 'Berlin', '--rumble'], ['EU', 'Europe and the world', '--synth']];
  function timeline() {
    const svg = document.getElementById('tlMaster'); if (!svg || svg.dataset.v2) return; svg.dataset.v2 = 1;
    const TLd = (typeof TL !== 'undefined' ? TL : []).slice().sort((a, b) => a[0] - b[0]);
    const tip = document.getElementById('tlTip'); if (tip) tip.style.display = 'none';
    const box = h('div', 'c2 c2-tl'); svg.parentNode.insertBefore(box, svg); box.appendChild(svg);
    const cap = box.parentNode.querySelector('.cap'); if (cap && /Hover a dot/.test(cap.textContent)) cap.textContent = 'Forty years and more, by scene. Tap a dot for the story, drag the year, or press play to hear each year in turn.';
    const off = new Set();
    const tools = h('div', 'c2-tools', `<button type="button" class="play c2-playall">Play the forty years</button>${SCENES.map(s => `<button type="button" class="c2-chip on" data-s="${s[0]}" style="--k:var(${s[2]})" aria-pressed="true"><i></i>${s[1]}</button>`).join('')}`);
    box.insertBefore(tools, svg);
    const scrub = h('div', 'c2-scrub', `<input type="range" min="1974" max="2026" value="1988" step="1" aria-label="Year"><output>1988</output>`);
    const card = h('div', 'c2-card', '<p class="cap">Tap a dot, or drag the year.</p>'); card.setAttribute('aria-live', 'polite');
    const list = h('ol', 'c2-tllist');
    box.appendChild(scrub); box.appendChild(card); box.appendChild(list);
    const range = scrub.querySelector('input'), out = scrub.querySelector('output');
    let sel = null, year = null;
    const W = 1000, L = 150, R = 985, top = 34, lane = 54, H = top + lane * SCENES.length + 34;
    const x = y => L + (y - 1973) / (2027 - 1973) * (R - L);
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (narrow(box)) { svg.style.display = 'none'; list.style.display = ''; drawList(); return; }
      svg.style.display = ''; list.style.display = 'none';
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.removeAttribute('width'); svg.removeAttribute('height');
      for (let y = 1975; y <= 2025; y += 5) { mk('line', { x1: x(y), y1: top - 16, x2: x(y), y2: H - 26, class: 'c2-grid' }, svg); mk('text', { x: x(y), y: H - 8, class: 'c2-axis', 'text-anchor': 'middle' }, svg).textContent = y; }
      SCENES.forEach((s, i) => { const yy = top + lane * i + lane / 2; const g = mk('g', { class: 'c2-lane' + (off.has(s[0]) ? ' off' : '') }, svg); mk('line', { x1: L - 6, y1: yy, x2: R, y2: yy, class: 'c2-rule' }, g); mk('rect', { x: 8, y: yy - 4, width: 14, height: 3, rx: 1.5, fill: col(s[2]) }, g); mk('text', { x: 28, y: yy + 4, class: 'c2-lanelabel' }, g).textContent = s[1]; });
      mk('line', { class: 'c2-head', x1: 0, x2: 0, y1: top - 18, y2: H - 26 }, svg);
      const stack = {};
      TLd.forEach((ev, idx) => {
        const si = SCENES.findIndex(s => s[0] === ev[1]); if (si < 0) return; const key = ev[1] + ev[0]; stack[key] = (stack[key] || 0) + 1;
        const yy = top + lane * si + lane / 2 + (stack[key] - 1) * 9 - (stack[key] > 1 ? 4 : 0); const px = x(ev[0]);
        const g = mk('g', { class: 'c2-ev' + (off.has(ev[1]) ? ' off' : ''), 'data-i': idx, tabindex: off.has(ev[1]) ? -1 : 0, role: 'button', 'aria-label': `${ev[0]}, ${ev[2]}` }, svg);
        mk('circle', { cx: px, cy: yy, r: 16, class: 'c2-hit' }, g); mk('circle', { cx: px, cy: yy, r: 6.5, fill: col(SCENES[si][2]), class: 'c2-dot' }, g);
        const right = px > R - 220; mk('text', { x: px + (right ? -12 : 12), y: yy - 11, class: 'c2-evlabel', 'text-anchor': right ? 'end' : 'start' }, g).textContent = ev[2];
      });
      paint();
    }
    function drawList() {
      const by = {}; TLd.forEach((ev, i) => { if (!off.has(ev[1])) (by[ev[0]] = by[ev[0]] || []).push([ev, i]); });
      list.innerHTML = Object.keys(by).sort((a, b) => a - b).map(y => `<li class="c2-tlrow" data-y="${y}"><span class="c2-tlyear">${y}</span><span class="c2-tlevs">${by[y].map(([ev, i]) => `<button type="button" class="c2-tlev" data-i="${i}" style="--k:var(${SCENES.find(s => s[0] === ev[1])[2]})"><i></i>${esc(ev[2])}</button>`).join('')}</span></li>`).join('');
      paint();
    }
    function story(i) {
      const ev = TLd[i]; if (!ev) return; const sc = SCENES.find(s => s[0] === ev[1]);
      const Y = window.YEARS && YEARS[ev[0]]; const pre = Y && Y[2] && Y[2].find(g => !window.PRESET || PRESET(g));
      card.innerHTML = `<p class="c2-kick"><i style="background:var(${sc[2]})"></i>${ev[0]} · ${esc(sc[1])}</p><h4>${esc(ev[2])}</h4><p>${esc(ev[4])}</p><p class="c2-acts"><a class="xl" href="#${ev[3]}">Read the chapter →</a>${Y ? ` <a class="xl" href="#y${ev[0]}">The year ${ev[0]} →</a>` : ''}${pre ? ` <button type="button" class="play c2-hear" data-g="${esc(pre)}">Hear ${ev[0]}</button>` : ''}</p>`;
      const hb = card.querySelector('.c2-hear'); if (hb) hb.addEventListener('click', () => { cancel(); playOne(hb.dataset.g, hb); });
      if (window.autolink) try { autolink(card, null); } catch (e) {}
    }
    function yearCard(y) {
      const evs = TLd.map((ev, i) => [ev, i]).filter(([ev]) => ev[0] === y && !off.has(ev[1])); const Y = window.YEARS && YEARS[y]; const pre = Y && Y[2] && Y[2].find(g => !window.PRESET || PRESET(g));
      card.innerHTML = `<p class="c2-kick">${y}</p>${Y ? `<h4>${esc(Y[0])}</h4>` : ''}${evs.length ? `<ul class="c2-yl">${evs.map(([ev, i]) => `<li><button type="button" class="c2-link" data-i="${i}"><i style="background:var(${SCENES.find(s => s[0] === ev[1])[2]})"></i>${esc(ev[2])}</button></li>`).join('')}</ul>` : `<p class="cap">No timeline events in ${y}${Y ? ' — the year page has the rest' : ''}.</p>`}<p class="c2-acts">${Y ? `<a class="xl" href="#y${y}">The year ${y} →</a>` : ''}${pre ? ` <button type="button" class="play c2-hear" data-g="${esc(pre)}">Hear ${y}</button>` : ''}</p>`;
      card.querySelectorAll('.c2-link').forEach(b => b.addEventListener('click', () => { sel = +b.dataset.i; story(sel); paint(); }));
      const hb = card.querySelector('.c2-hear'); if (hb) hb.addEventListener('click', () => { cancel(); playOne(hb.dataset.g, hb); });
    }
    function paint() {
      const head = svg.querySelector('.c2-head'); if (head) { const on = year != null; head.style.display = on ? '' : 'none'; if (on) { head.setAttribute('x1', x(year)); head.setAttribute('x2', x(year)); } }
      svg.querySelectorAll('.c2-ev').forEach(g => { const ev = TLd[+g.dataset.i]; g.classList.toggle('sel', +g.dataset.i === sel); g.classList.toggle('now', year != null && ev[0] === year); g.classList.toggle('fade', year != null && Math.abs(ev[0] - year) > 2 && +g.dataset.i !== sel); });
      list.querySelectorAll('.c2-tlrow').forEach(r => r.classList.toggle('now', year != null && +r.dataset.y === year));
      list.querySelectorAll('.c2-tlev').forEach(b => b.classList.toggle('sel', +b.dataset.i === sel));
    }
    const pickEv = i => { sel = i; year = TLd[i][0]; range.value = year; out.textContent = year; story(i); paint(); setYear(year, 'tl'); };
    svg.addEventListener('click', e => { const g = e.target.closest('.c2-ev'); if (g && !g.classList.contains('off')) pickEv(+g.dataset.i); });
    svg.addEventListener('keydown', e => {
      const g = e.target.closest('.c2-ev'); if (!g) return; const i = +g.dataset.i;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickEv(i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const vis = [...svg.querySelectorAll('.c2-ev:not(.off)')]; const k = vis.indexOf(g) + (e.key === 'ArrowRight' ? 1 : -1); if (vis[k]) { vis[k].focus(); pickEv(+vis[k].dataset.i); } }
    });
    list.addEventListener('click', e => { const b = e.target.closest('.c2-tlev'); if (b) pickEv(+b.dataset.i); });
    range.addEventListener('input', () => { year = +range.value; out.textContent = year; sel = null; yearCard(year); paint(); setYear(year, 'tl'); });
    tools.querySelectorAll('.c2-chip').forEach(b => b.addEventListener('click', () => { const s = b.dataset.s; if (off.has(s)) off.delete(s); else off.add(s); b.classList.toggle('on', !off.has(s)); b.setAttribute('aria-pressed', !off.has(s)); draw(); }));
    const pa = tools.querySelector('.c2-playall');
    pa.addEventListener('click', () => {
      if (pa.classList.contains('on')) { cancel(); return; }
      const ys = Object.keys(window.YEARS || {}).map(Number).filter(y => YEARS[y][2] && YEARS[y][2].some(g => !window.PRESET || PRESET(g))).sort((a, b) => a - b);
      pa.classList.add('on'); pa.textContent = 'Stop';
      sequence(ys.map(y => ({ name: YEARS[y][2].find(g => !window.PRESET || PRESET(g)), show: () => { year = y; range.value = y; out.textContent = y; sel = null; yearCard(y); paint(); setYear(y, 'tl'); const r = list.querySelector(`.c2-tlrow[data-y="${y}"]`); if (r && list.style.display !== 'none' && !reduce()) r.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } })), () => { pa.classList.remove('on'); pa.textContent = 'Play the forty years'; });
    });
    draw(); let w0 = narrow(box); addEventListener('resize', () => { const w1 = narrow(box); if (w1 !== w0) { w0 = w1; draw(); } });
  }

  /* =========================== 2. HOW THE IDEAS TRAVELLED =========================== */
  const CITY = { dus: ['Düsseldorf', 1974, '--synth', 51.23, 6.78, 120, 80, 'dusseldorf'], chi: ['Chicago', 1977, '--kick', 41.88, -87.63, 120, 220, 'chicago'], det: ['Detroit', 1985, '--kick', 42.33, -83.05, 280, 150, 'detroit'], nyc: ['New York', 1977, '--kick', 40.71, -74.01, 250, 300, 'newyork'],
    ibz: ['Ibiza', 2000, '--perc', 38.98, 1.43, 470, 330, 'ibiza'], lon: ['London', 1987, '--drums', 51.51, -0.13, 470, 190, 'london'], man: ['Manchester / Sheffield', 1988, '--drums', 53.48, -2.24, 430, 90, 'manchester'], bhm: ['Birmingham', 1993, '--drums', 52.49, -1.89, 600, 110, 'birmingham'],
    ber: ['Berlin', 1989, '--rumble', 52.52, 13.40, 720, 200, 'berlin'], ffm: ['Frankfurt', 1988, '--synth', 50.11, 8.68, 650, 300, 'frankfurt'], gnt: ['Ghent / Rotterdam', 1990, '--synth', 51.05, 3.72, 600, 230, 'ghent'], tok: ['Tokyo', 1994, '--synth', 35.68, 139.69, 820, 330, 'tokyo'], tbi: ['Tbilisi', 2014, '--synth', 41.72, 44.79, 840, 110, 'tbilisi'] };
  const EDGE = [['dus', 'det', 'Radio, 1977–82', 1977, 'The Electrifying Mojo plays Kraftwerk on Detroit radio; the Belleville Three are listening.', 'h1'], ['dus', 'nyc', 'Planet Rock, 1982', 1982, 'Afrika Bambaataa builds electro on Kraftwerk in the Bronx.', 'h1'], ['nyc', 'det', 'Electro, 1982', 1982, 'Electro crosses back to Detroit; Cybotron answers it.', 'h1'], ['chi', 'det', 'The neighbour, 1985', 1985, 'Chicago house four hours down the road: Detroit\'s DJs play the Chicago records first.', 'h2'],
    ['lon', 'ber', 'UFO, 1988', 1988, 'Acid house reaches West Berlin: UFO opens in a basement.', 'h4'], ['det', 'bhm', 'Network, 1988', 1988, 'Neil Rushton\'s Network puts Detroit in Birmingham\'s shops and the UK charts.', 'h3'], ['det', 'lon', 'Techno!, 1988', 1988, 'The Virgin compilation names the genre for Britain.', 'h2'], ['det', 'man', 'Bleep, 1989', 1989, 'Sheffield and Leeds rebuild Detroit over sound-system sub-bass.', 'h3'],
    ['gnt', 'lon', 'Energy Flash, 1990', 1990, 'R&S in Ghent releases Beltram\'s record: Belgium supplies the rave sound.', 'h5'], ['det', 'ber', 'Tresor, 1991', 1991, 'Tresor opens in a vault and signs Detroit: the axis that defines the 1990s.', 'h4'], ['ber', 'ffm', 'Trance, 1991', 1991, 'Berlin and Frankfurt split the techno family; trance comes out of Frankfurt.', 'h5'], ['det', 'tok', 'Liquid Room, 1995', 1995, 'Jeff Mills plays the Liquid Room; the most-cited DJ recording in techno.', 'h13'],
    ['ffm', 'ibz', 'Cocoon, 2000', 2000, 'Sven Väth brings Cocoon to Amnesia on Mondays.', 'h7'], ['ber', 'tbi', 'Bassiani, 2014', 2014, 'Tbilisi\'s club under the stadium takes Berlin\'s model east.', 'h8']];
  function cityNet() {
    const svg = document.getElementById('cityNet'); if (!svg || svg.dataset.v2) return; svg.dataset.v2 = 1;
    const box = h('div', 'c2 c2-net'); svg.parentNode.insertBefore(box, svg); box.appendChild(svg);
    const tools = h('div', 'c2-tools', `<button type="button" class="play c2-netplay">Play the journey</button><span class="c2-seg" role="group" aria-label="View"><button type="button" class="on" data-v="net">Network</button><button type="button" data-v="world">World map</button><button type="button" data-v="europe">Europe</button></span><output class="c2-netyear"></output><button type="button" class="c2-netall" hidden>All years</button>`);
    box.insertBefore(tools, svg);
    const card = h('div', 'c2-card', '<p class="cap">Tap a city to see what came in and went out, or an arrow for the story behind it.</p>'); card.setAttribute('aria-live', 'polite'); box.appendChild(card);
    let view = 'net', selC = null, selE = null, upto = null;
    const order = EDGE.map((e, i) => i).sort((a, b) => EDGE[a][3] - EDGE[b][3]);
    function pos(k) {
      const c = CITY[k];
      if (view === 'net') return [c[5], c[6]];
      const g = (window.PLACES_GEO || {}).world; if (!g) return [c[5], c[6]];
      const [lon0, , lon1, lat1] = g.bbox; const kk = g.w / ((lon1 - lon0) * g.cos); return [(c[4] - lon0) * g.cos * kk, (lat1 - c[3]) * kk];
    }
    function vb() {
      if (view === 'net') return [0, 0, 900, 420];
      const g = (window.PLACES_GEO || {}).world; if (!g) return [0, 0, 900, 420];
      if (view === 'world') { const a = pos('chi'), b = pos('tok'); return [a[0] - 60, Math.min(a[1], pos('man')[1]) - 70, b[0] - a[0] + 140, 190]; }
      const a = pos('man'), b = pos('tbi'), c = pos('ibz'); return [a[0] - 30, a[1] - 22, b[0] - a[0] + 60, c[1] - a[1] + 44];
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const [vx, vy, vw, vh] = vb(); svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`); svg.removeAttribute('width'); svg.removeAttribute('height');
      const s = vw / Math.max(260, svg.clientWidth || box.clientWidth || vw); svg.style.setProperty('--fs', (12 * s).toFixed(2) + 'px'); svg.style.setProperty('--fs2', (10.5 * s).toFixed(2) + 'px');
      const defs = mk('defs', {}, svg); const m = mk('marker', { id: 'c2arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs); mk('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'c2-arrowhead' }, m);
      if (view !== 'net' && window.PLACES_GEO && PLACES_GEO.world) mk('path', { d: PLACES_GEO.world.layers[0].d, class: 'c2-land' }, svg);
      const R = view === 'net' ? 30 : 7 * s;
      EDGE.forEach((e, i) => {
        const A = pos(e[0]), B = pos(e[1]); const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1; const ux = dx / len, uy = dy / len;
        const x1 = A[0] + ux * (R + 3), y1 = A[1] + uy * (R + 3), x2 = B[0] - ux * (R + 5), y2 = B[1] - uy * (R + 5);
        const bend = view === 'net' ? 0.08 : 0.22; const cx = (x1 + x2) / 2 - uy * len * bend, cy = (y1 + y2) / 2 + ux * len * bend; const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
        const g = mk('g', { class: 'c2-edge', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `${CITY[e[0]][0]} to ${CITY[e[1]][0]}: ${e[2]}` }, svg);
        mk('path', { d, class: 'c2-ehit' }, g); const p = mk('path', { d, class: 'c2-eline', 'marker-end': 'url(#c2arrow)' }, g); p.style.setProperty('--len', Math.round(len * 1.1));
        const t = mk('text', { x: (x1 + 2 * cx + x2) / 4, y: (y1 + 2 * cy + y2) / 4 - 5 * s, class: 'c2-elabel', 'text-anchor': 'middle' }, g); t.textContent = e[2];
      });
      Object.entries(CITY).forEach(([k, c]) => {
        const [x, y] = pos(k); const g = mk('g', { class: 'c2-city', 'data-k': k, tabindex: 0, role: 'button', 'aria-label': `${c[0]}, ${c[1]}` }, svg);
        mk('circle', { cx: x, cy: y, r: Math.max(R, 14 * s), class: 'c2-chit' }, g); mk('circle', { cx: x, cy: y, r: R, class: 'c2-cdot', stroke: col(c[2]) }, g);
        if (view === 'net') { mk('text', { x, y: y - 1, class: 'c2-cname', 'text-anchor': 'middle' }, g).textContent = c[0].length > 12 ? c[0].split(' / ')[0] : c[0]; mk('text', { x, y: y + 13 * s, class: 'c2-cyear', 'text-anchor': 'middle' }, g).textContent = c[1]; }
        else mk('text', { x: x + R + 3 * s, y: y + 4 * s, class: 'c2-cname mapname' }, g).textContent = c[0].split(' / ')[0];
      });
      paint();
    }
    function paint() {
      const hot = new Set(); if (selC) EDGE.forEach((e, i) => { if (e[0] === selC || e[1] === selC) hot.add(i); });
      svg.querySelectorAll('.c2-edge').forEach(g => { const i = +g.dataset.i; const e = EDGE[i]; const hidden = upto != null && e[3] > upto; g.classList.toggle('hidden', hidden); g.classList.toggle('hot', hot.has(i) || selE === i || (upto != null && e[3] === upto)); g.classList.toggle('fade', (selC != null && !hot.has(i)) || (selE != null && selE !== i)); });
      svg.querySelectorAll('.c2-city').forEach(g => { const k = g.dataset.k; const reached = upto == null || CITY[k][1] <= upto || EDGE.some(e => e[3] <= upto && (e[0] === k || e[1] === k)); g.classList.toggle('dim', !reached); g.classList.toggle('sel', k === selC); });
    }
    function cityCard(k) {
      const c = CITY[k]; const outE = EDGE.filter(e => e[0] === k), inE = EDGE.filter(e => e[1] === k); const n = window.NODE && NODE[c[7]];
      const li = e => `<li><button type="button" class="c2-link" data-i="${EDGE.indexOf(e)}">${esc(e[2])}</button> ${e[0] === k ? '→ ' + esc(CITY[e[1]][0]) : '← ' + esc(CITY[e[0]][0])}</li>`;
      card.innerHTML = `<p class="c2-kick"><i style="background:var(${c[2]})"></i>${c[1]}</p><h4>${n ? `<a class="xl" href="#${c[7]}">${esc(c[0])}</a>` : esc(c[0])}</h4>${inE.length ? `<p class="cap">What came in</p><ul class="c2-yl">${inE.map(li).join('')}</ul>` : ''}${outE.length ? `<p class="cap">What went out</p><ul class="c2-yl">${outE.map(li).join('')}</ul>` : ''}`;
      card.querySelectorAll('.c2-link').forEach(b => b.addEventListener('click', () => { selE = +b.dataset.i; selC = null; edgeCard(selE); paint(); }));
    }
    function edgeCard(i) { const e = EDGE[i]; card.innerHTML = `<p class="c2-kick">${e[3]} · ${esc(CITY[e[0]][0])} → ${esc(CITY[e[1]][0])}</p><h4>${esc(e[2].replace(/, \d{4}.*$/, ''))}</h4><p>${esc(e[4])}</p><p class="c2-acts"><a class="xl" href="#${e[5]}">Read the chapter →</a></p>`; }
    svg.addEventListener('click', ev => { const c = ev.target.closest('.c2-city'); const e = ev.target.closest('.c2-edge'); if (c) { selC = selC === c.dataset.k ? null : c.dataset.k; selE = null; if (selC) cityCard(selC); paint(); } else if (e) { selE = +e.dataset.i; selC = null; edgeCard(selE); paint(); } });
    svg.addEventListener('keydown', ev => { if (ev.key !== 'Enter' && ev.key !== ' ') return; const c = ev.target.closest('.c2-city'), e = ev.target.closest('.c2-edge'); if (c || e) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    tools.querySelectorAll('.c2-seg button').forEach(b => b.addEventListener('click', () => { view = b.dataset.v; tools.querySelectorAll('.c2-seg button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    const pb = tools.querySelector('.c2-netplay'), yo = tools.querySelector('.c2-netyear');
    pb.addEventListener('click', () => {
      if (pb.classList.contains('on')) { cancel(); return; }
      pb.classList.add('on'); pb.textContent = 'Stop'; selC = selE = null; const yrs = [...new Set(order.map(i => EDGE[i][3]))];
      const Yp = y => { const Y = window.YEARS && YEARS[y]; return Y && Y[2] ? Y[2].find(g => !window.PRESET || PRESET(g)) : null; };
      sequence(yrs.map(y => ({ name: Yp(y), show: () => { upto = y; yo.textContent = y; svg.classList.add('anim'); const es = EDGE.filter(e => e[3] === y); card.innerHTML = `<p class="c2-kick">${y}</p>${es.map(e => `<h4>${esc(CITY[e[0]][0])} → ${esc(CITY[e[1]][0])}</h4><p>${esc(e[4])}</p>`).join('')}`; paint(); } })), () => { pb.classList.remove('on'); pb.textContent = 'Play the journey'; upto = null; yo.textContent = ''; svg.classList.remove('anim'); paint(); });
    });
    const allb = tools.querySelector('.c2-netall');
    allb.addEventListener('click', () => { upto = null; yo.textContent = ''; allb.hidden = true; paint(); });
    yearBus.push((y, from) => { if (from === 'tl' && !pb.classList.contains('on')) { upto = y; yo.textContent = y ? 'up to ' + y : ''; allb.hidden = !y; paint(); } });
    draw(); let lastW = box.clientWidth; addEventListener('resize', () => { if (Math.abs(box.clientWidth - lastW) > 40) { lastW = box.clientWidth; draw(); } });
  }

  /* =========================== 3. TEMPO BY DIALECT =========================== */
  const DIALECTS = ['Chicago house 1986', 'Detroit 1988', 'UK bleep 1990', 'UK rave 1991', 'Tresor 1992', 'Acid techno 1994', 'Birmingham 1995', 'Dub techno 1995', 'Schranz 2002', 'Minimal 2004', 'Berghain 2010', 'Hypnotic 2015', 'Peak-time 2017', 'Industrial 2018', 'Hard techno 2023'];
  function tempo() {
    const svg = document.getElementById('bpmChart'); if (!svg || svg.dataset.v2) return; svg.dataset.v2 = 1;
    const rows = DIALECTS.map(n => { let b = null; try { b = PRESET(n).bpm; } catch (e) {} return { n, bpm: b, y: +(n.match(/\d{4}/) || [0])[0] }; }).filter(r => r.bpm);
    const lo = Math.floor((Math.min(...rows.map(r => r.bpm)) - 6) / 10) * 10, hi = Math.ceil((Math.max(...rows.map(r => r.bpm)) + 4) / 10) * 10;
    const box = h('div', 'c2 c2-bpm'); svg.parentNode.insertBefore(box, svg); svg.style.display = 'none';
    box.innerHTML = `<div class="c2-tools"><button type="button" class="play c2-bpmplay">Hear the tempo climb</button><span class="c2-seg" role="group" aria-label="Sort"><button type="button" class="on" data-o="year">By year</button><button type="button" data-o="bpm">By tempo</button></span></div>
      <div class="c2-bpmrow c2-bpmhead" aria-hidden="true"><span class="cap">bpm</span><span class="c2-bpmaxis">${Array.from({ length: (hi - lo) / 10 + 1 }, (_, i) => lo + i * 10).map(v => `<span style="left:${((v - lo) / (hi - lo) * 100).toFixed(2)}%">${v}</span>`).join('')}</span><span></span></div>
      <ol class="c2-bpmrows"></ol><p class="cap">Beats per minute of the engine's preset for each dialect: the same numbers the mixer plays. Tap a row to hear it.</p>`;
    const ol = box.querySelector('.c2-bpmrows'); let order = 'year';
    function draw() {
      const rs = [...rows].sort((a, b) => order === 'year' ? a.y - b.y || a.bpm - b.bpm : a.bpm - b.bpm || a.y - b.y);
      ol.innerHTML = rs.map(r => `<li><button type="button" class="c2-bpmrow" data-n="${esc(r.n)}" aria-label="${esc(r.n)}, ${r.bpm} bpm. Play"><span class="c2-bpmname">${esc(r.n)}</span><span class="c2-bpmtrack"><span class="c2-bpmdot" style="left:${((r.bpm - lo) / (hi - lo) * 100).toFixed(2)}%"></span></span><span class="c2-bpmval">${r.bpm}</span></button></li>`).join('');
    }
    const mark = n => ol.querySelectorAll('.c2-bpmrow').forEach(b => b.classList.toggle('now', b.dataset.n === n));
    ol.addEventListener('click', e => { const b = e.target.closest('.c2-bpmrow'); if (!b) return; cancel(); mark(b.dataset.n); playOne(b.dataset.n, null); setTimeout(() => mark(null), barsSec(b.dataset.n) * 1000); });
    box.querySelectorAll('.c2-seg button').forEach(b => b.addEventListener('click', () => { order = b.dataset.o; box.querySelectorAll('.c2-seg button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    const pb = box.querySelector('.c2-bpmplay');
    pb.addEventListener('click', () => { if (pb.classList.contains('on')) { cancel(); return; } pb.classList.add('on'); pb.textContent = 'Stop'; const rs = [...rows].sort((a, b) => a.y - b.y || a.bpm - b.bpm); sequence(rs.map(r => ({ name: r.n, show: () => mark(r.n) })), () => { pb.classList.remove('on'); pb.textContent = 'Hear the tempo climb'; mark(null); }); });
    yearBus.push((y, from) => { if (from !== 'tl' || pb.classList.contains('on')) return; const best = rows.filter(r => r.y <= y).sort((a, b) => b.y - a.y)[0]; mark(best ? best.n : null); });
    draw();
  }

  function all() { try { timeline(); } catch (e) { console.warn('timeline', e); } try { cityNet(); } catch (e) { console.warn('net', e); } try { tempo(); } catch (e) { console.warn('tempo', e); } }
  return { all, cancel, timeline, cityNet, tempo, sequence };
})();
/* the history page calls these by name: point them at the new charts */
window.drawTimeline = () => Charts2.timeline();
window.drawCityNet = () => Charts2.cityNet();
window.drawBpmChart = () => Charts2.tempo();
