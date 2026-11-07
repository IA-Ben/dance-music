/* ===================================================================
   NODE ENGINE — node pages, autolinks, backlinks, trail, framings,
   forks, neighbourhood graph, year scrubber, explore, search
   =================================================================== */
const Trail = { items: [], push(id, title){ if (this.items.length && this.items[this.items.length - 1].id === id) return; this.items.push({ id, title }); if (this.items.length > 40) this.items.shift(); this.render(); },
  render(){ const el = document.getElementById('trail'); if (!el) return; el.innerHTML = ''; this.items.slice(-8).forEach((t, i, arr) => { const a = document.createElement('a'); a.href = '#' + t.id; a.textContent = t.title; a.className = i === arr.length - 1 ? 'cur' : ''; el.appendChild(a); if (i < arr.length - 1){ const s = document.createElement('span'); s.textContent = '›'; el.appendChild(s); } }); } };
const Visited = { set: new Set(), load(){ try { JSON.parse(localStorage.getItem('tb-visited') || '[]').forEach(x => this.set.add(x)); } catch (e) {} }, add(id){ this.set.add(id); try { localStorage.setItem('tb-visited', JSON.stringify([...this.set])); } catch (e) {} } };
Visited.load();

/* ---------- alias index for autolinking ---------- */
let ALIASES = null;
function buildAliases(){
  if (ALIASES) return ALIASES; const list = [];
  NODES.forEach(n => { const names = [n.title, ...(n.aliases || [])]; if (n.type === 'record'){ const t = n.title.split(' — ')[1]; if (t) names.push('"' + t + '"'); } const STOP = /^(Space|Future|Hospital|Virus|Planet|Flying|Base|Release|Harmony|Drop|Cyclone|Trip|Music|Energy|Strings|Circles|Original|Loaded|Pure|Speed|Flavour|Incredible|Terrorist)$/; names.forEach(a => { if (!a || a.length < 3) return; if (STOP.test(a)) return; if (n.type === 'record' && !/\s/.test(a) && !/^"/.test(a) && a.length < 9) return; list.push([a, n.id]); }); });
  Object.entries(CHAPTER_TITLES).forEach(([id, t]) => { if (!/^(home|year|explore)$/.test(id)) list.push([t, id]); if (/^y\d{4}$/.test(id)) list.push([id.slice(1), id]); });
  list.sort((a, b) => b[0].length - a[0].length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  ALIASES = { list, re: new RegExp('(^|[^\\w\\-])(' + list.map(x => esc(x[0])).join('|') + ')(?![\\w\\-])', 'g'), map: Object.fromEntries(list) };
  return ALIASES;
}
function autolink(root, selfId){
  const A = buildAliases(); const done = new Set([selfId]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(t){ const p = t.parentElement; if (!p || p.closest('a, button, h1, h2, .nolink, .kicker, .tag, code, .chip, .trackchip, .chips, select, option, .seq-table, .deckgrid, .cap, .pagenum, .trail, svg, textarea, input')) return NodeFilter.FILTER_REJECT; if (!p.closest('p, li, .fact span, .pcard, .ccard, .lede, .quote, td, .framing, .node-body')) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  const texts = []; let t; while ((t = walker.nextNode())) texts.push(t);
  texts.forEach(tn => {
    const s = tn.nodeValue; A.re.lastIndex = 0; let m, last = 0; const frag = document.createDocumentFragment(); let any = false;
    while ((m = A.re.exec(s))){ const name = m[2], id = A.map[name]; if (!id || done.has(id)){ continue; } done.add(id); any = true; const start = m.index + m[1].length; frag.appendChild(document.createTextNode(s.slice(last, start))); const a = document.createElement('a'); a.href = '#' + id; a.className = 'xl'; a.textContent = name; frag.appendChild(a); last = start + name.length; }
    if (any){ frag.appendChild(document.createTextNode(s.slice(last))); tn.parentNode.replaceChild(frag, tn); }
  });
}
/* which chapters mention each node (computed once) */
let MENTIONS = null;
function buildMentions(){
  if (MENTIONS) return MENTIONS; MENTIONS = {}; const A = buildAliases();
  document.querySelectorAll('.page[data-page]').forEach(pg => { const id = pg.dataset.page; if (id === 'node' || id === 'home') return; const text = pg.textContent; A.re.lastIndex = 0; let m; const seen = new Set(); while ((m = A.re.exec(text))){ const nid = A.map[m[2]]; if (nid && nid !== id && !seen.has(nid)){ seen.add(nid); (MENTIONS[nid] = MENTIONS[nid] || []).push(id); } } });
  return MENTIONS;
}

/* ---------- node page ---------- */
const NodeView = {
  render(id, strand){
    const n = NODE[id]; const art = document.querySelector('.page[data-page="node"]'); if (!n || !art) return;
    const col = TYPE_COLOR[n.type] || '--mix'; art.style.setProperty('--c', `var(${col})`);
    const strands = n.strands.filter(s => STRANDS[s]);
    const spot = strands.map(s => `<a class="chip" href="#${s}-${n.id}" style="--c:var(${STRANDS[s].color})"><i></i>${STRANDS[s].title} strand</a>`).join('');
    const links = [['sp', 'listen', n.q], ['yt', 'watch', n.q + (n.type === 'person' ? ' DJ set' : n.type === 'club' ? ' club' : '')], ['dg', 'discogs', n.q], ['g', 'search', n.q]].filter(l => !(n.type === 'city' && l[0] === 'sp')).filter(l => !(n.type === 'machine' && l[0] === 'sp'));
    const cc = `<a class="chip dg" target="_blank" rel="noopener" href="https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(n.q)}&ns6=1"><i></i>Creative Commons images<small style="color:var(--muted)">· Wikimedia Commons</small></a>`;
    const body = document.getElementById('node-' + n.id); // optional hand-written body in HTML
    const framings = [...document.querySelectorAll(`template[data-framing="${n.id}"]`)];
    const curStrand = strand && n.strands.includes(strand) ? strand : n.strands[0];
    let framingHtml = '';
    if (framings.length){
      framingHtml = `<div class="framing-switch"><span>Read this as</span>${n.strands.filter(s => STRANDS[s]).map(s => `<a href="#${s}-${n.id}" class="${s === curStrand ? 'on' : ''}" style="--c:var(${STRANDS[s].color})">${STRANDS[s].title}</a>`).join('')}</div>`;
      const f = framings.find(t => t.dataset.strand === curStrand) || framings[0];
      framingHtml += `<div class="framing" style="--c:var(${STRANDS[f.dataset.strand].color})">${f.innerHTML}</div>`;
      const others = framings.filter(t => t !== f); if (others.length) framingHtml += `<details class="otherframes"><summary>The other framings</summary>${others.map(t => `<div class="framing dim" style="--c:var(${STRANDS[t.dataset.strand].color})"><div class="kicker" style="margin:0 0 6px">${STRANDS[t.dataset.strand].title} strand</div>${t.innerHTML}</div>`).join('')}</details>`;
    }
    const rels = {}; n.rel.forEach(([r, t]) => { (rels[r] = rels[r] || []).push(t); });
    const backs = {}; (BACK[n.id] || []).forEach(([r, src]) => { (backs[r] = backs[r] || []).push(src); });
    const link = t => NODE[t] ? `<a class="xl" href="#${t}">${NODE[t].title}</a>` : CHAPTER_TITLES[t] ? `<a class="xl" href="#${t}">${CHAPTER_TITLES[t]}</a>` : t;
    const relHtml = Object.entries(rels).map(([r, ts]) => `<div class="relrow"><b>${REL_LABEL[r] || r}</b><span>${ts.map(link).join(', ')}</span></div>`).join('');
    const backHtml = Object.entries(backs).map(([r, ts]) => `<div class="relrow"><b>${REL_BACK[r] || r}</b><span>${ts.map(link).join(', ')}</span></div>`).join('');
    const mentions = (buildMentions()[n.id] || []).filter(p => CHAPTER_TITLES[p]);
    const mentionHtml = mentions.length ? `<div class="relrow"><b>appears in</b><span>${mentions.map(p => `<a class="xl" href="#${p}">${CHAPTER_TITLES[p]}</a>`).join(', ')}</span></div>` : '';
    const hear = n.preset ? (n.type === 'record' ? `<h3>Record anatomy</h3><p class="cap" style="margin-bottom:8px">Rebuilt in the engine: the tempo, the drums, the sound design, the kind of chord and bass — not the tune, which is at the links above. Mute layers to hear what each one does.</p><div class="era"><button class="play era-btn" data-genre="${n.preset}" data-bars="2">Hear the anatomy · 2 bars</button></div>` : `<div class="era"><button class="play era-btn" data-genre="${n.preset}" data-bars="2">Hear it: ${n.preset}</button></div>`) : '';
    const parent = n.type === 'genre' && n.preset ? (n.rel.find(r => r[0] === 'from' && NODE[r[1]] && NODE[r[1]].preset) || [])[1] : null;
    const morph = parent ? `<h3>Morph from ${NODE[parent].title}</h3><p class="cap" style="margin-bottom:8px">This genre descends from <a class="xl" href="#${parent}">${NODE[parent].title}</a>. Drag from the parent's sound to this one and hear what changed.</p><div class="morphbox" data-a="${NODE[parent].preset}" data-b="${n.preset}"></div>` : '';
    const im = (window.IMAGES || {})[n.id]; const img = im ? `<figure class="nodeimg"><img src="${im.src}" alt="${im.title.replace('File:', '')}" loading="lazy"><figcaption>${im.title.replace('File:', '').replace(/\.(jpe?g|png)$/i, '')} · ${im.author} · <a href="${im.page}" target="_blank" rel="noopener">${im.license}</a> via Wikimedia Commons</figcaption></figure>` : '';
    art.innerHTML = `
      <p class="kicker">${TYPE_LABEL[n.type] || n.type}${n.city && NODE[n.city] ? ' · ' + NODE[n.city].title : ''}${n.years ? ' · ' + n.years : ''}</p>
      <h2>${n.title}</h2>
      <div class="chips" style="margin-top:4px">${spot}</div>
      ${n.blurb ? `<p class="lede">${n.blurb}</p>` : ''}
      ${img}
      <div class="grid2">
        <div>
          ${framingHtml}
          ${body ? `<div class="node-body">${body.innerHTML}</div>` : ''}
          ${hear}
          ${window.Gear ? Gear.html(n) : ''}
          ${window.HowTo ? HowTo.html(n) : ''}
          ${morph}
          <h3>Connections</h3>
          <div class="rels">${relHtml}${backHtml}${mentionHtml || ''}${(!relHtml && !backHtml && !mentionHtml) ? '<p class="cap">No links yet.</p>' : ''}</div>
        </div>
        <div>
          <div class="card"><h3>Neighbourhood</h3><svg id="hood" class="diag"></svg><p class="cap">Click any node to travel. Grey ring = chapters that mention this.</p></div>
          <div class="card" style="margin-top:14px"><h3>Outside the book</h3><div class="chips"></div></div>
          ${n.type === 'person' ? '<p class="cap">No portrait is bundled: images of named people are linked, not embedded.</p>' : ''}
        </div>
      </div>`;
    chipsInto(art.querySelector('.card .chips'), links); art.querySelector('.card .chips').insertAdjacentHTML('beforeend', cc);
    wireEraButtons(); autolink(art, n.id); this.drawHood(n, mentions);
  },
  drawHood(n, mentions){
    const svg = document.getElementById('hood'); if (!svg) return; const W = 420, H = 420, cx = 210, cy = 210; clearSvg(svg, W, H);
    const out = n.rel.map(([r, t]) => ({ id: t, r, dir: 'out' })).filter(x => NODE[x.id] || CHAPTER_TITLES[x.id]);
    const inn = (BACK[n.id] || []).map(([r, s]) => ({ id: s, r, dir: 'in' }));
    const ch = mentions.map(m => ({ id: m, r: 'mention', dir: 'ch' }));
    const seen = new Set([n.id]); const all = [...out, ...inn, ...ch].filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).slice(0, 28);
    const rings = { out: 95, in: 150, ch: 190 }; const groups = { out: [], in: [], ch: [] }; all.forEach(x => groups[x.dir].push(x));
    Object.entries(groups).forEach(([dir, items]) => { const R = rings[dir]; el('circle', { cx, cy, r: R, fill: 'none', stroke: '#272733', 'stroke-dasharray': dir === 'ch' ? '2 4' : '' }, svg); items.forEach((x, i) => { const a = (i / items.length) * Math.PI * 2 - Math.PI / 2 + (dir === 'in' ? 0.2 : 0); const x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R; el('line', { x1: cx, y1: cy, x2: x1, y2: y1, stroke: '#2a2a35' }, svg); const g = el('g', { style: 'cursor:pointer' }, svg); const node = NODE[x.id]; const col = node ? css(TYPE_COLOR[node.type] || '--mix') : '#8f8fa0'; el('circle', { cx: x1, cy: y1, r: dir === 'ch' ? 4 : 6, fill: dir === 'ch' ? '#8f8fa0' : col }, g); const label = node ? ((node.type === 'record' || node.type === 'set') ? node.title.split(' — ').pop() : node.title) : CHAPTER_TITLES[x.id]; const t = text(g, x1 + (Math.cos(a) >= 0 ? 8 : -8), y1 + 3, label.length > 22 ? label.slice(0, 21) + '…' : label, { 'text-anchor': Math.cos(a) >= 0 ? 'start' : 'end', fill: '#ebebf1', 'font-size': 8.5 }); g.addEventListener('click', () => { location.hash = '#' + x.id; }); const tip = document.getElementById('tlTip'); g.addEventListener('mouseenter', () => { tip.innerHTML = `<b>${node ? node.title : CHAPTER_TITLES[x.id]}</b><br>${x.dir === 'out' ? (REL_LABEL[x.r] || x.r) : x.dir === 'in' ? (REL_BACK[x.r] || x.r) : 'mentions this'}`; tip.style.display = 'block'; }); g.addEventListener('mousemove', e => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; }); g.addEventListener('mouseleave', () => tip.style.display = 'none'); }); });
    el('circle', { cx, cy, r: 16, fill: css(TYPE_COLOR[n.type] || '--mix') }, svg); text(svg, cx, cy + 32, n.title.length > 26 ? n.title.slice(0, 25) + '…' : n.title, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-weight': 600 });
  }
};

/* ---------- forks ---------- */
function renderForks(pageId, pageEl){
  let box = pageEl.querySelector('.forks'); const f = FORKS[pageId];
  if (!f){ if (box) box.remove(); return; }
  if (!box){ box = document.createElement('div'); box.className = 'forks'; const nav = pageEl.querySelector('.pagenav'); pageEl.insertBefore(box, nav); }
  box.innerHTML = `<div class="kicker" style="margin-bottom:8px">Where the history forks here</div>` + f.map(([label, to, s]) => `<a href="#${s}-${to}" style="--c:var(${STRANDS[s].color})"><small>${STRANDS[s].title} strand</small>${label}</a>`).join('');
}

/* ---------- year scrubber ---------- */
const YearView = {
  built: false,
  years(n){ const m = (n.years || '').match(/(\d{4})/g); if (!m) return null; const a = +m[0]; let b = m[1] ? +m[1] : a; if (/–\s*$/.test(n.years) || /–$/.test(n.years.trim())) b = 2026; if (b < a) b = a; return [a, b]; },
  build(){ if (this.built) return; this.built = true; const r = document.getElementById('yearRange'); r.oninput = () => this.show(+r.value); this.show(+r.value); },
  show(y){
    document.getElementById('yearOut').textContent = y;
    const active = NODES.filter(n => { const yy = this.years(n); return yy && y >= yy[0] && y <= yy[1] && n.type !== 'city'; });
    const born = active.filter(n => this.years(n)[0] === y);
    const byStrand = {}; active.forEach(n => (byStrand[n.strands[0]] = byStrand[n.strands[0]] || []).push(n));
    const box = document.getElementById('yearBox'); box.innerHTML = '';
    const tl = TL.filter(e => e[0] === y);
    if (tl.length) box.innerHTML += `<div class="card" style="margin-bottom:12px"><h3>This year on the timeline</h3>${tl.map(e => `<p><b>${e[2]}</b> — ${e[4]} <a class="xl" href="#${e[3]}">chapter →</a></p>`).join('')}</div>`;
    if (born.length) box.innerHTML += `<div class="card" style="margin-bottom:12px"><h3>Born this year</h3><div class="chips">${born.map(n => `<a class="chip" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type]})"><i></i>${n.title}</a>`).join('')}</div></div>`;
    ['techno', 'rave', 'house'].forEach(s => { const items = (byStrand[s] || []).filter(n => this.years(n)[0] !== y); if (!items.length) return; const d = document.createElement('div'); d.className = 'card'; d.style.marginBottom = '12px'; d.style.setProperty('--c', `var(${STRANDS[s].color})`); d.innerHTML = `<h3>${STRANDS[s].title}: alive in ${y}</h3><div class="chips">${items.slice(0, 60).map(n => `<a class="chip" href="#${s}-${n.id}"><i></i>${n.title}</a>`).join('')}${items.length > 60 ? `<span class="cap">+${items.length - 60} more</span>` : ''}</div>`; box.appendChild(d); });
    const presets = [[1987, 'Chicago acid 1987'], [1988, 'Detroit 1988'], [1990, 'UK bleep 1990'], [1991, 'UK rave 1991'], [1992, 'Tresor 1992'], [1994, 'Acid techno 1994'], [1995, 'Dub techno 1995'], [1996, 'Birmingham 1995'], [2002, 'Schranz 2002'], [2004, 'Minimal 2004'], [2010, 'Berghain 2010'], [2015, 'Hypnotic 2015'], [2017, 'Peak-time 2017'], [2018, 'Industrial 2018'], [2023, 'Hard techno 2023']];
    let best = presets[0]; presets.forEach(p => { if (Math.abs(p[0] - y) < Math.abs(best[0] - y)) best = p; });
    const sb = document.getElementById('yearSound'); sb.textContent = `Sound of ${y}: ${best[1]}`; sb.onclick = () => playGenre(best[1], 2, sb);
    autolink(box, null);
  }
};

/* ---------- explore page ---------- */
const Explore = {
  built: false,
  build(){
    if (this.built) return; this.built = true;
    const counts = {}; NODES.forEach(n => counts[n.type] = (counts[n.type] || 0) + 1);
    document.getElementById('typeCounts').innerHTML = Object.entries(counts).map(([t, c]) => `<div class="fact" style="--c:var(${TYPE_COLOR[t]})"><b>${TYPE_LABEL[t]}</b><span>${c}</span></div>`).join('');
    const list = document.getElementById('nodeList'); const sel = document.getElementById('typeSel'); const q = document.getElementById('nodeSearch');
    const render = () => { const t = sel.value, s = q.value.toLowerCase(); list.innerHTML = ''; NODES.filter(n => (t === 'all' || n.type === t) && (!s || (n.title + ' ' + n.blurb + ' ' + (n.aliases || []).join(' ')).toLowerCase().includes(s))).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 400).forEach(n => { const a = document.createElement('a'); a.className = 'chip' + (Visited.set.has(n.id) ? ' seen' : ''); a.href = '#' + n.id; a.style.setProperty('--c', `var(${TYPE_COLOR[n.type]})`); a.innerHTML = `<i></i>${n.title}<small style="color:var(--muted)">· ${n.years || TYPE_LABEL[n.type]}</small>`; list.appendChild(a); }); };
    sel.innerHTML = '<option value="all">everything</option>' + Object.keys(counts).map(t => `<option value="${t}">${TYPE_LABEL[t]}</option>`).join(''); sel.onchange = render; q.oninput = render; render();
    document.getElementById('randomWalk').onclick = () => { const un = NODES.filter(n => !Visited.set.has(n.id) && n.type !== 'city'); const pick = (un.length ? un : NODES)[Math.floor(Math.random() * (un.length ? un.length : NODES.length))]; location.hash = '#' + pick.id; };
    document.getElementById('copyTrail').onclick = () => { const txt = Trail.items.map(t => t.title + '  ' + location.origin + location.pathname + '#' + t.id).join('\n'); try { navigator.clipboard.writeText(txt); } catch (e) {} };
    const pr = document.getElementById('progress'); if (pr) pr.textContent = `${Visited.set.size} of ${NODES.length + Object.keys(CHAPTER_TITLES).length} pages visited`;
  }
};

/* ---------- sidebar search ---------- */
function buildSearch(){
  const box = document.getElementById('sideSearch'); if (!box) return; const input = box.querySelector('input'), out = box.querySelector('.results');
  input.oninput = () => { const s = input.value.toLowerCase().trim(); out.innerHTML = ''; if (s.length < 2) return; const hits = []; NODES.forEach(n => { if ((n.title + ' ' + (n.aliases || []).join(' ')).toLowerCase().includes(s)) hits.push([n.title, n.id, TYPE_LABEL[n.type], TYPE_COLOR[n.type]]); }); Object.entries(CHAPTER_TITLES).forEach(([id, t]) => { if (t.toLowerCase().includes(s)) hits.push([t, id, 'Chapter', '--mix']); }); hits.slice(0, 12).forEach(([t, id, ty, col]) => { const a = document.createElement('a'); a.href = '#' + id; a.innerHTML = `<i style="background:var(${col})"></i>${t}<small>${ty}</small>`; a.onclick = () => { input.value = ''; out.innerHTML = ''; document.getElementById('side').classList.remove('open'); }; out.appendChild(a); }); };
}

window.PageHooks = window.PageHooks || {};
window.PageHooks.year = () => YearView.build();
window.PageHooks.explore = () => Explore.build();

/* ---------- cover: the whole book as a graph ---------- */
function drawCoverGraph(){
  const svg = document.getElementById('coverGraph'); if (!svg || svg.dataset.drawn) return; svg.dataset.drawn = 1;
  const W = 900, H = 610, cx = 450, cy = 300; const rOf = y => y < 1980 ? 40 + (y - 1920) / 60 * 50 : 90 + (y - 1980) / 46 * 160; clearSvg(svg, W, H);
  const order = ['techno', 'house', 'rave', 'jungle', 'trance']; const span = Math.PI * 2 / order.length;
  const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h / 1000003; };
  const pos = {};
  NODES.forEach(n => { const st = order.indexOf((n.strands || [])[0]); const si = st < 0 ? 0 : st; const yy = YearView.years(n); const yr = yy ? Math.min(2026, Math.max(1920, yy[0])) : null; const r = yr ? rOf(yr) + (hash(n.id + 'r') - .5) * 10 : 262; const a = -Math.PI / 2 + si * span + 0.06 + hash(n.id) * (span - 0.12); pos[n.id] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, n]; });
  [1950, 1980, 1990, 2000, 2010, 2020].forEach(y => { const r = rOf(y); el('circle', { cx, cy, r, fill: 'none', stroke: '#1e1e28' }, svg); text(svg, cx - 4, cy - r + 9, y, { 'font-size': 8, fill: '#6a6a80', 'text-anchor': 'end' }); });
  order.forEach((s, i) => { const a = -Math.PI / 2 + i * span; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 275, y2: cy + Math.sin(a) * 275, stroke: '#1e1e28' }, svg); const am = a + span / 2; text(svg, cx + Math.cos(am) * 278, cy + Math.sin(am) * 278 + 4, STRANDS[s].title.toUpperCase(), { 'text-anchor': 'middle', 'font-size': 9, 'letter-spacing': '.14em', fill: css(STRANDS[s].color) }); });
  const g = el('g', { opacity: .18 }, svg); let links = 0;
  NODES.forEach(n => n.rel.forEach(([r, t]) => { const q = pos[t]; if (!q || r === 'in') return; links++; const p = pos[n.id]; el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: css(TYPE_COLOR[n.type] || '--text'), 'stroke-width': .6 }, g); }));
  NODES.forEach(n => { const [x, y] = pos[n.id]; if (n.type === 'city') return; const deg = n.rel.length + ((BACK[n.id] || []).length); const a = el('a', { href: '#' + n.id }, svg); el('circle', { cx: x, cy: y, r: Math.min(6, 1.6 + Math.sqrt(deg) * .55), fill: css(TYPE_COLOR[n.type] || '--text'), opacity: .9 }, a); const t = el('title', {}, a); t.textContent = n.title + ' · ' + (TYPE_LABEL[n.type] || n.type) + (n.years ? ' · ' + n.years : ''); });
  ['person', 'club', 'record', 'label', 'event', 'set', 'genre', 'machine', 'station', 'collective', 'border'].forEach((t, i) => { const x = 20 + (i % 6) * 130, y = H - 40 + Math.floor(i / 6) * 18; el('circle', { cx: x, cy: y - 4, r: 4, fill: css(TYPE_COLOR[t]) }, svg); text(svg, x + 10, y, TYPE_LABEL[t], { 'font-size': 9 }); });
  const count = t => NODES.filter(n => n.type === t).length; const chapters = Object.values(STRANDS).reduce((s, v) => s + v.spine.length, 0);
  const st = document.getElementById('coverStats'); if (st) st.innerHTML = `<b>${NODES.length}</b> pages · ${count('person')} people · ${count('club')} clubs and rooms · ${count('record')} records · ${count('label')} labels · ${count('event')} events · ${count('set')} landmark sets · ${count('machine')} machines · ${count('genre')} genres · <b>${NODES.reduce((s, n) => s + n.rel.length, 0)}</b> links, each followed both ways · ${chapters} chapters across ${Object.keys(STRANDS).length} strands · ${typeof GENRE_NAMES !== 'undefined' ? GENRE_NAMES.length : ''} sound presets. Placed by strand and by year, rings mark 1950, 1980, 1990, 2000, 2010 and 2020; dots scale with how connected a page is. Click any dot.`;
}
(() => { const prev = window.PageHooks.home; window.PageHooks.home = () => { if (prev) prev(); drawCoverGraph(); }; })();
if (!location.hash || location.hash === '#home') setTimeout(drawCoverGraph, 50);
