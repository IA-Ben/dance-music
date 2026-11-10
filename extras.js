/* ===================================================================
   EXTRAS — tours, six degrees, blind test, crate, marginalia
   =================================================================== */
const EXPLORE_IDS = ['year', 'explore', 'tours', 'path', 'quiz', 'crate', 'notes', 'credits'];
const nodeTitle = id => NODE[id] ? NODE[id].title : (CHAPTER_TITLES[id] || id);
const hashFor = id => NODE[id] ? '#' + id : ('#' + (Object.keys(STRANDS).find(s => STRANDS[s].spine.includes(id)) || 'techno') + '-' + id);

/* ---------- tours ---------- */
const TOURS = [
  { id: 'tour-303', title: 'The 303\'s journey', blurb: 'A failed bass box from Osaka to the free parties of Essex.', stops: [
    ['tb303', 'Roland built it in 1981 to accompany guitarists. It could not keep up with a real bass player and was discontinued in 1984. Second-hand, it cost almost nothing.'],
    ['dj-pierre', 'In Chicago in 1986 DJ Pierre and Phuture bought one, turned the resonance up and the cutoff knob, and heard it squeal.'],
    ['rec-acidtracks', 'Ron Hardy played the tape four times in one night. Trax released it in 1987: twelve minutes of one machine.'],
    ['acid', 'Britain heard the record through the Ibiza DJs. "Acid" became a movement here, not a production style — a crossing the house, rave and techno strands all claim.'],
    ['shoom', 'December 1987: a gym in Southwark, the smiley face, the record on repeat. The sound and the drug were given the same name by the tabloids.'],
    ['richie-hawtin', 'Across the river from Detroit, Hawtin rebuilt acid as minimal: one 303, one 909, nothing else.'],
    ['rec-spastik', 'And then threw the 303 away altogether for a record made only of snare rolls.'],
    ['chris-liberator', 'In London the free-party sound systems kept the machine: Stay Up Forever, a 303 and a 909 at 140.'],
    ['suf', 'Acid techno — still the city\'s free-party dialect thirty years on. The box that failed never stopped.'] ] },
  { id: 'tour-1992', title: 'One night in 1992', blurb: 'The year everything split, told by the rooms that were open.', stops: [
    ['split1992', 'Rave split in 1992: the breakbeats went one way towards jungle, the straight 4/4 went another towards techno. This crossing page shows both.'],
    ['rage', 'Thursday at Heaven. Fabio and Grooverider pitching Belgian techno and breaks to +8 — jungle being invented in real time.'],
    ['rec-terminator', 'Goldie\'s "Terminator": the timestretch, the reese, the hoover. Hardcore going dark.'],
    ['castlemorton', 'Late May, Castlemorton Common: a week-long free festival, Spiral Tribe\'s rig, and the headline that wrote the Criminal Justice Act.'],
    ['spiral-tribe', 'The Tribe went to France after the trial and started the teknival. The free party went continental.'],
    ['tresor', 'Meanwhile in Berlin: a bank vault under the old Wertheim department store, Detroit records played harder than Detroit ever did.'],
    ['rec-sonicdestroyer', 'Tresor Records\' first release was UR under another name. The Detroit–Berlin axis in one record.'],
    ['sven-vath', 'And in Frankfurt, Väth was turning techno melodic at the Omen — the exit that became trance.'],
    ['rec-ageoflove', 'The Jam & Spoon mix of "The Age of Love": usually called the first trance record. Same year, four musics.'] ] },
  { id: 'tour-rage', title: 'Rage to Metalheadz', blurb: 'How a Thursday night became drum & bass.', stops: [
    ['heaven', 'Under the Charing Cross arches: Spectrum in 1988 made it the Balearic room; Rage, the same year, made it something else.'],
    ['fabio-grooverider', 'The residents. Every week a little faster, a little more broken, until the records they wanted did not exist and people made them.'],
    ['rec-mrkirk', '4hero\'s "Mr Kirk\'s Nightmare": the dark side of hardcore, Reinforced Records, 1990.'],
    ['goldie', 'A graffiti writer from Walsall who heard Rage and went to Reinforced to learn.'],
    ['rec-terminator', '"Terminator", 1992: timestretching turned a vocal into a texture. Jungle\'s signature trick, found by accident.'],
    ['kool-fm', 'The pirate that carried it: Kool FM from a tower block in Hackney, 1991 onwards.'],
    ['metalheadz', 'Goldie, Kemistry and Storm\'s label, 1994. The name from his first record; the sound from Rage.'],
    ['blue-note', 'Sunday Sessions at the Blue Note in Hoxton Square: the room drum & bass was perfected in.'],
    ['ltj-bukem', 'And the other road from the same Thursday: Bukem\'s atmospheric side, Speed at the Mars Bar, Good Looking.'] ] },
  { id: 'tour-clink', title: 'Clink Street to Hastings', blurb: 'London\'s techno line, and where it went in 2023.', stops: [
    ['camden-palace', 'Colin Faver and Eddie Richards playing Detroit and Chicago to London in 1986, with a 21-year-old rapper called Mr. C on the mic.'],
    ['clink-street', 'RIP at Clink Street, 1988: the dark twin of Shoom, in a warehouse beside the old prison.'],
    ['mr-c', 'Resident every Friday and Saturday. Then the Shamen, then a club of his own.'],
    ['the-end', 'West Central Street, December 1995 to January 2009: the booth on the floor, the system before the décor.'],
    ['rec-lovestory', 'The End\'s anthem, on its own label.'],
    ['fabric', 'Smithfield, 1999: Wiggle\'s tech-house residents in a three-room club with a vibrating floor.'],
    ['hastings', 'Fifty miles down the A21: John Digweed\'s home town, and from 2023 a techno scene of its own.'],
    ['dtm-hastings', 'Easter Sunday 2023: Detroit Techno Militia play a Sussex seaside town, and keep coming back.'],
    ['hastings-techno-militia', 'The residents took the name. A vinyl crew playing Detroit records by the sea, and sending one of their own to play Detroit.'],
    ['detroit', 'Back where the chapter started: the city whose records every stop on this tour was built around.'] ] },
  { id: 'tour-axis', title: 'The Detroit–Berlin axis', blurb: 'How one city\'s records became another city\'s identity.', stops: [
    ['juan-atkins', 'Belleville, Michigan: Atkins hears Kraftwerk on the radio and makes "No UFO\'s".'],
    ['ur', 'Underground Resistance: masked, militant, and the first Detroit act to treat Berlin as a second home.'],
    ['tresor', 'March 1991, a bank vault. Dimitri Hegemann opens the room UR\'s records were waiting for.'],
    ['tresor-records', 'October 1991: the label. X-101, Jeff Mills, Blake Baxter, Drexciya — Detroit on a Berlin imprint.'],
    ['jeff-mills', 'Three decks and a 909 in the vault; the DJ Berlin learned techno from.'],
    ['rec-phylyps', 'Basic Channel answer with the opposite: a chord in a delay, repeated until it becomes weather.'],
    ['hard-wax', 'The shop under the railway where the two cities\' records sat in the same rack.'],
    ['berghain', '2004: a power station, Ostgut Ton, the rumble as bassline. Detroit\'s grandchild, now the world\'s reference room.'],
    ['rec-midnightmadness', 'And Detroit still making records in its own palette, unchanged — which is the point.'] ] },
  { id: 'tour-island', title: 'The island', blurb: 'Ibiza from hippies to the techno summer.', stops: [
    ['ibiza', 'A Balearic island with no roofs on its clubs until 1990.'],
    ['alfredo', 'An Argentine DJ at Amnesia playing anything — house, Italo, rock, reggae — to a terrace at dawn.'],
    ['amnesia', 'The terrace. The place four Londoners heard it in late summer 1987.'],
    ['paul-oakenfold', 'Oakenfold\'s birthday trip: four friends, one summer, and London changed when they got home.'],
    ['danny-rampling', 'Shoom, December 1987: the first attempt to rebuild Amnesia in a Southwark gym.'],
    ['balearic', 'The crossing: Balearic as a house dialect, as rave\'s origin story, and as techno\'s summer residency.'],
    ['space', 'Playa d\'en Bossa: Carl Cox\'s sixteen summers, the terrace with the planes overhead.'],
    ['sven-vath', 'Cocoon at Amnesia from 2000: techno gets a Monday on the island, and keeps it for nineteen years.'] ] }
];
window.Tour = {
  cur: null, i: 0, timer: null, auto: false,
  start(id){ const t = TOURS.find(x => x.id === id); if (!t) return; this.cur = t; this.i = 0; this.show(); },
  show(){ const t = this.cur; if (!t) return; const [id, text] = t.stops[this.i]; location.hash = hashFor(id); this.renderBar(text); if (this.auto){ clearTimeout(this.timer); this.timer = setTimeout(() => { if (this.i < t.stops.length - 1){ this.i++; this.show(); } else this.setAuto(false); }, 22000); } },
  renderBar(text){ let bar = document.getElementById('tourBar'); if (!bar){ bar = document.createElement('div'); bar.id = 'tourBar'; document.body.appendChild(bar); } const t = this.cur; bar.innerHTML = `<div class="tb-head"><b>${t.title}</b> · stop ${this.i + 1} of ${t.stops.length}<span class="tb-prog"><i style="width:${(this.i + 1) / t.stops.length * 100}%"></i></span></div><p>${text}</p><div class="tb-ctl"><button class="sm" id="tbPrev" ${this.i === 0 ? 'disabled' : ''}>‹ back</button><button class="play" id="tbNext">${this.i < t.stops.length - 1 ? 'Next stop ›' : 'Finish'}</button><button class="sm" id="tbAuto">${this.auto ? '■ stop auto' : '▶ auto-play'}</button><button class="sm" id="tbExit">exit tour</button></div>`; bar.classList.add('show');
    document.getElementById('tbPrev').onclick = () => { if (this.i > 0){ this.i--; this.show(); } }; document.getElementById('tbNext').onclick = () => { if (this.i < t.stops.length - 1){ this.i++; this.show(); } else this.exit(); }; document.getElementById('tbAuto').onclick = () => this.setAuto(!this.auto); document.getElementById('tbExit').onclick = () => this.exit(); },
  setAuto(v){ this.auto = v; clearTimeout(this.timer); if (v) this.show(); else this.renderBar(this.cur.stops[this.i][1]); },
  exit(){ clearTimeout(this.timer); this.auto = false; this.cur = null; const bar = document.getElementById('tourBar'); if (bar) bar.classList.remove('show'); }
};
window.PageHooks.tours = () => { const box = document.getElementById('tourList'); if (!box || box.dataset.done) return; box.dataset.done = 1; TOURS.forEach(t => { const d = document.createElement('div'); d.className = 'ccard'; d.innerHTML = `<h4>${t.title}</h4><div class="meta">${t.stops.length} stops</div><p>${t.blurb}</p><p class="cap">${t.stops.map(s => nodeTitle(s[0])).join(' → ')}</p><div class="row" style="margin:8px 0 0"><button class="play">Start the tour</button></div>`; d.querySelector('button').onclick = () => Tour.start(t.id); box.appendChild(d); }); };

/* ---------- six degrees ---------- */
const Graph = {
  adj: null,
  build(cities){ const key = cities ? 'adjC' : 'adj'; if (this[key]) return this[key]; const adj = {}; const add = (a, b, r, dir) => { (adj[a] = adj[a] || []).push([b, r, dir]); }; NODES.forEach(n => n.rel.forEach(([r, t]) => { if (!NODE[t] || (r === 'in' && !cities)) return; add(n.id, t, r, 'out'); add(t, n.id, r, 'in'); })); this[key] = adj; return adj; },
  path(a, b, cities){ const adj = this.build(cities); if (a === b) return [[a]]; const prev = { [a]: null }; const q = [a]; while (q.length){ const x = q.shift(); for (const [y, r, dir] of (adj[x] || [])){ if (prev[y] !== undefined) continue; prev[y] = [x, r, dir]; if (y === b){ const out = []; let c = b; while (c !== a){ const [p, rr, dd] = prev[c]; out.unshift([c, rr, dd]); c = p; } return [[a], ...out]; } q.push(y); } } return cities ? null : this.path(a, b, true); },
  sentence(from, to, r, dir){ const S = NODE[dir === 'out' ? from : to].title, O = NODE[dir === 'out' ? to : from].title; const L = { played: `${S} played at ${O}`, founded: `${S} founded ${O}`, made: `${S} made ${O}`, member: `${S} was in ${O}`, uses: `${S} uses ${O}`, label: `${S} came out on ${O}`, by: `${S} is by ${O}`, genre: `${S} is ${O}`, from: `${S} descends from ${O}`, told: `${S} is told in ${O}`, at: `${S} happened at ${O}`, in: `${S} is in ${O}` }; return L[r] || `${S} → ${O}`; }
};
window.PageHooks.path = () => {
  const a = document.getElementById('pathA'), b = document.getElementById('pathB'), out = document.getElementById('pathOut'); if (!a || a.dataset.done) return; a.dataset.done = 1;
  const dl = document.getElementById('nodeNames'); NODES.filter(n => n.type !== 'city').forEach(n => { const o = document.createElement('option'); o.value = n.title; dl.appendChild(o); });
  const PRI = { club: 0, person: 1, record: 2, label: 3, event: 4, collective: 5, set: 6, station: 7, machine: 8, border: 9, genre: 10, city: 11 }; const find = s => { s = s.trim().toLowerCase(); if (!s) return null; const byPri = list => list.sort((x, y) => (PRI[x.type] ?? 9) - (PRI[y.type] ?? 9))[0]; return NODES.find(n => n.title.toLowerCase() === s) || byPri(NODES.filter(n => (n.aliases || []).some(x => x.toLowerCase() === s))) || byPri(NODES.filter(n => n.title.toLowerCase().startsWith(s))) || byPri(NODES.filter(n => n.title.toLowerCase().includes(s))) || null; };
  const run = () => { const A = find(a.value), B = find(b.value); if (!A || !B){ out.innerHTML = '<p class="cap">Pick two pages — start typing and choose from the list.</p>'; return; } const p = Graph.path(A.id, B.id); if (!p){ out.innerHTML = `<p class="cap">No chain of links joins <b>${A.title}</b> and <b>${B.title}</b> yet — cities don't count as hops. Try another pair, or add the link you know is missing.</p>`; return; }
    out.innerHTML = `<div class="card"><h3>${A.title} → ${B.title}: ${p.length - 1} ${p.length - 1 === 1 ? 'hop' : 'hops'}</h3><ol class="pathlist">${p.slice(1).map(([id, r, dir], i) => { const from = p[i][0]; return `<li><span class="dot" style="background:var(${TYPE_COLOR[NODE[id].type]})"></span>${Graph.sentence(from, id, r, dir).replace(NODE[id].title, `<a class="xl" href="#${id}">${NODE[id].title}</a>`).replace(NODE[from].title, `<a class="xl" href="#${from}">${NODE[from].title}</a>`)}</li>`; }).join('')}</ol><div class="chips" style="margin-top:10px">${p.map(([id]) => `<a class="chip" href="#${id}"><i style="background:var(${TYPE_COLOR[NODE[id].type]})"></i>${NODE[id].title}</a>`).join('')}</div></div>`; };
  document.getElementById('pathGo').onclick = run; a.onkeydown = b.onkeydown = e => { if (e.key === 'Enter') run(); };
  document.getElementById('pathRandom').onclick = () => { const pool = NODES.filter(n => n.type !== 'city' && n.rel.length + (BACK[n.id] || []).length > 1); const A = pool[Math.floor(Math.random() * pool.length)], B = pool[Math.floor(Math.random() * pool.length)]; a.value = A.title; b.value = B.title; run(); };
  const tries = [['mr-c', 'berghain'], ['tb303', 'goldie'], ['alfredo', 'jeff-mills'], ['frankie-knuckles', 'hastings-techno-militia'], ['sven-vath', 'ltj-bukem'], ['tr909', 'rec-sandstorm']]; const tb = document.getElementById('pathTry'); tries.forEach(([x, y]) => { if (!NODE[x] || !NODE[y]) return; const c = document.createElement('a'); c.className = 'chip'; c.href = '#path'; c.innerHTML = `<i></i>${NODE[x].title} → ${NODE[y].title}`; c.onclick = e => { e.preventDefault(); a.value = NODE[x].title; b.value = NODE[y].title; run(); }; tb.appendChild(c); });
};

/* ---------- blind test ---------- */
window.Quiz = {
  round: 0, score: 0, cur: null, history: [],
  pool(){ const eras = GENRE_NAMES.map(g => ({ name: g, ...GENRES[g], kind: 'era' })); const recs = Object.keys(RECORD_PRESETS).map(g => ({ name: g, ...RECORD_PRESETS[g], kind: 'record' })); return [...eras, ...recs].filter(p => p.city); },
  decade(p){ const y = parseInt((p.era || '').match(/\d{4}/)?.[0] || p.name.match(/\d{4}/)?.[0] || '1990'); return Math.floor(y / 10) * 10; },
  cityOf(p){ return (p.city || '').split(/\s*[\/·]\s*/)[0]; },
  start(){ this.round = 0; this.score = 0; this.history = []; this.next(); },
  next(){ if (this.round >= 10) return this.finish(); this.round++; const pool = this.pool(); const p = pool[Math.floor(Math.random() * pool.length)]; const cities = [...new Set(pool.map(x => this.cityOf(x)))].filter(c => c !== this.cityOf(p)).sort(() => Math.random() - .5).slice(0, 3); const opts = [...cities, this.cityOf(p)].sort(() => Math.random() - .5); const dec = this.decade(p); const decs = [...new Set([dec, dec - 10, dec + 10, dec - 20, dec + 20].filter(d => d >= 1970 && d <= 2020))].sort(); this.cur = { p, opts, decs, city: null, dec: null }; this.render(); },
  render(){ const box = document.getElementById('quizBox'); if (!box) return; const c = this.cur; if (!c){ box.innerHTML = `<h3>Ten rounds</h3><p style="font-size:14px">Press play, listen for the kick, the hats, the bass, the chord — then pick the city and the decade. Headphones help.</p><div class="row"><button class="play" id="qStart">Start the test</button></div>`; document.getElementById('qStart').onclick = () => this.start(); return; }
    const answered = c.city !== null && c.dec !== null;
    box.innerHTML = `<div class="row" style="margin:0 0 8px;justify-content:space-between"><span class="cap">round ${this.round} of 10 · score ${this.score}</span><button class="play qplay">Play it · 2 bars</button></div>
      <div class="qgrid"><div><h4>Where?</h4><div class="chips">${c.opts.map(o => `<button class="chip qc ${c.city === o ? 'on' : ''}" data-v="${o}"><i></i>${o}</button>`).join('')}</div></div><div><h4>When?</h4><div class="chips">${c.decs.map(d => `<button class="chip qd ${c.dec === d ? 'on' : ''}" data-v="${d}"><i></i>${d}s</button>`).join('')}</div></div></div>
      <div class="row"><button class="play" id="qCheck" ${answered ? '' : 'disabled'}>Check</button></div><div id="qResult"></div>`;
    box.querySelector('.qplay').onclick = e => playGenre(c.p.name, 2, e.target); box.querySelectorAll('.qc').forEach(b => b.onclick = () => { c.city = b.dataset.v; this.render(); }); box.querySelectorAll('.qd').forEach(b => b.onclick = () => { c.dec = +b.dataset.v; this.render(); });
    document.getElementById('qCheck').onclick = () => this.check(); },
  check(){ const c = this.cur; const okC = c.city === this.cityOf(c.p), okD = c.dec === this.decade(c.p); const pts = (okC ? 1 : 0) + (okD ? 1 : 0); this.score += pts; const rec = c.p.record ? NODE[c.p.record] : null; const genreNode = NODES.find(n => n.type === 'genre' && n.preset === c.p.name); const where = rec ? `<a class="xl" href="#${rec.id}">${rec.title}</a>` : genreNode ? `<a class="xl" href="#${genreNode.id}">${genreNode.title}</a>` : ''; const chapter = genreNode ? (genreNode.rel.find(r => r[0] === 'told') || [])[1] : null;
    document.getElementById('qResult').innerHTML = `<div class="card" style="margin-top:10px"><h3>${pts === 2 ? 'Both right.' : pts === 1 ? 'Half right.' : 'Not this time.'} It was <b>${c.p.name}</b> — ${c.p.city}, ${c.p.era || ''}</h3><p style="font-size:14px">${c.p.notes || ''}</p>${where ? `<p class="cap">Read about it: ${where}${chapter ? ` · <a class="xl" href="${hashFor(chapter)}">${nodeTitle(chapter)}</a>` : ''}</p>` : ''}<div class="row"><button class="play" id="qNext">${this.round < 10 ? 'Next round' : 'See the score'}</button></div></div>`; this.history.push({ name: c.p.name, pts }); document.getElementById('qNext').onclick = () => this.next(); },
  finish(){ const box = document.getElementById('quizBox'); const s = this.score; box.innerHTML = `<h3>${s} out of 20</h3><p style="font-size:14px">${s >= 17 ? 'You have spent a lot of nights in the right rooms.' : s >= 12 ? 'A good ear. The decades are the hard part.' : s >= 7 ? 'The cities are coming; keep listening to the kick drum.' : 'Start with the Anatomy strand, then come back.'}</p><ul style="font-size:13px">${this.history.map(h => `<li>${h.name}: ${h.pts}/2</li>`).join('')}</ul><div class="row"><button class="play" id="qAgain">Again</button></div>`; this.cur = null; document.getElementById('qAgain').onclick = () => this.start(); }
};
window.PageHooks.quiz = () => { if (!document.getElementById('quizBox').dataset.done){ document.getElementById('quizBox').dataset.done = 1; Quiz.render(); } };

/* ---------- crate ---------- */
window.Crate = {
  key: 'dm-crate', get(){ try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch (e){ return []; } }, set(v){ try { localStorage.setItem(this.key, JSON.stringify(v)); } catch (e){} },
  has(id){ return this.get().includes(id); }, toggle(id){ const v = this.get(); const i = v.indexOf(id); if (i >= 0) v.splice(i, 1); else v.push(id); this.set(v); return i < 0; },
  add(ids){ const v = this.get(); ids.forEach(id => { if (NODE[id] && !v.includes(id)) v.push(id); }); this.set(v); },
  button(id){ const b = document.createElement('button'); b.className = 'sm crate-btn' + (this.has(id) ? ' on' : ''); b.textContent = this.has(id) ? '★ in your crate' : '☆ add to crate'; b.onclick = () => { const on = this.toggle(id); b.classList.toggle('on', on); b.textContent = on ? '★ in your crate' : '☆ add to crate'; }; return b; },
  presetFor(id){ const n = NODE[id]; if (!n) return null; if (REC_INDEX[id]) return REC_INDEX[id]; const g = (n.rel.find(r => r[0] === 'genre') || [])[1]; return g && NODE[g] && NODE[g].preset ? NODE[g].preset : null; },
  bpm(id){ const p = this.presetFor(id); try { return p && typeof PRESET === 'function' ? PRESET(p).bpm : 0; } catch (e){ return 0; } },
  year(id){ const m = String((NODE[id] || {}).years || '').match(/\d{4}/); return m ? +m[0] : 0; },
  parts(id){ const n = NODE[id]; const [a, t] = n.title.includes(' — ') ? n.title.split(' — ') : ['', n.title]; const lab = n.rel.filter(r => r[0] === 'label').map(r => NODE[r[1]] && NODE[r[1]].title).filter(Boolean)[0] || ''; return { artist: a.trim(), title: t.replace(/\s*\((?:\d{4})\)\s*$/, '').trim(), label: lab }; },
  sort: 'added',
  ids(list){ const v = (list || this.get()).filter(id => NODE[id]); if (this.sort === 'year') return [...v].sort((a, b) => this.year(a) - this.year(b)); if (this.sort === 'tempo') return [...v].sort((a, b) => this.bpm(a) - this.bpm(b) || this.year(a) - this.year(b)); return v; },
  item(id){ const n = NODE[id]; return { q: n.q, title: n.title }; },
  /* records the crate points to but doesn't hold: same artist, label or genre, scored by how many ways they connect */
  suggest(){
    const have = new Set(this.get()); if (!have.size) return []; const score = {};
    const keys = new Set(); have.forEach(id => (NODE[id] ? NODE[id].rel : []).forEach(([r, t]) => { if (/^(by|label|genre)$/.test(r)) keys.add(r + ':' + t); }));
    NODES.forEach(n => { if (n.type !== 'record' || have.has(n.id)) return; let s = 0; n.rel.forEach(([r, t]) => { if (keys.has(r + ':' + t)) s += r === 'genre' ? 1 : 2; }); if (s) score[n.id] = s; });
    return Object.entries(score).sort((a, b) => b[1] - a[1] || this.year(a[0]) - this.year(b[0])).slice(0, 8).map(x => x[0]);
  },
  starters(){ const g = {}; NODES.forEach(n => { if (n.type !== 'record') return; n.rel.filter(r => r[0] === 'genre').forEach(([, id]) => { (g[id] = g[id] || []).push(n.id); }); }); return Object.entries(g).filter(([id, l]) => NODE[id] && l.length >= 5).sort((a, b) => b[1].length - a[1].length).slice(0, 8).map(([id, l]) => [id, l.sort((a, b) => this.year(a) - this.year(b))]); },
  row(id, i, shared){ const n = NODE[id]; const pr = this.presetFor(id); const canPlay = window.Dock && Dock.playable(this.item(id)); return `<div class="relrow crow"><b>${this.year(id) || ''}</b><span><a class="xl" href="#${id}">${n.title}</a>${pr ? ` <span class="cap">· ${pr}</span>` : ''}</span><span class="crow-act">${canPlay ? `<button class="sm crate-play" data-i="${i}" aria-label="Play ${n.title.replace(/"/g, '&quot;')}">▶</button>` : ''}<a class="crate-buy" href="${LINK.bc(n.q)}" target="_blank" rel="noopener" title="Buy this release on Bandcamp">buy</a>${shared ? '' : `<button class="sm crate-rm" data-id="${id}" aria-label="Remove">✕</button>`}</span></div>`; },
  render(){
    const box = document.getElementById('crateList'); if (!box) return; const ids = this.ids();
    const st = document.getElementById('crateStats'); const yrs = ids.map(id => this.year(id)).filter(Boolean);
    if (st) st.textContent = ids.length ? `${ids.length} record${ids.length > 1 ? 's' : ''}${yrs.length ? ` · ${Math.min(...yrs)}–${Math.max(...yrs)}` : ''}` : '';
    box.innerHTML = ids.length ? ids.map((id, i) => this.row(id, i)).join('') : '<p class="cap">Empty. Every record page has a ☆ button, or start from one of the crates below.</p>';
    box.querySelectorAll('.crate-rm').forEach(b => b.onclick = () => { this.toggle(b.dataset.id); this.render(); });
    box.querySelectorAll('.crate-play').forEach(b => b.onclick = () => Dock.play(ids.map(id => this.item(id)), +b.dataset.i));
    const sg = document.getElementById('crateDig'); if (sg){ const s = this.suggest(); sg.innerHTML = s.length ? `<h3>Dig deeper</h3><p class="cap">Records that share an artist, a label or a genre with your crate.</p>` + s.map(id => `<div class="relrow crow"><b>${this.year(id) || ''}</b><span><a class="xl" href="#${id}">${NODE[id].title}</a></span><span class="crow-act"><button class="sm crate-add" data-id="${id}">☆ add</button></span></div>`).join('') : ''; sg.querySelectorAll('.crate-add').forEach(b => b.onclick = () => { this.add([b.dataset.id]); this.render(); }); }
    const sc = document.getElementById('crateStart'); if (sc && !sc.dataset.done){ sc.dataset.done = 1; sc.innerHTML = `<h3>Starter crates</h3><p class="cap">Every record the book has in a genre, in date order. Adding keeps what you've already starred.</p><div class="chips">${this.starters().map(([g, l]) => `<button class="chip crate-start" data-g="${g}"><i></i>${NODE[g].title} · ${l.length}</button>`).join('')}</div>`; sc.querySelectorAll('.crate-start').forEach(b => b.onclick = () => { const l = this.starters().find(x => x[0] === b.dataset.g); if (l){ this.add(l[1]); this.render(); this.say(`Added ${NODE[b.dataset.g].title}`); } }); }
  },
  say(t){ const m = document.getElementById('crateMsg'); if (m) m.innerHTML = t; },
  list(){ return this.ids().map(id => { const p = this.parts(id); return p.artist ? `${p.artist} - ${p.title}` : NODE[id].title; }).join('\n'); },
  csv(){ const q = s => '"' + String(s || '').replace(/"/g, '""') + '"'; return 'Artist,Title,Year,Label\n' + this.ids().map(id => { const p = this.parts(id); return [p.artist, p.title, this.year(id) || '', p.label].map(q).join(','); }).join('\n'); },
  download(name, text, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); },
  youtube(){ const vids = this.ids().map(id => window.SpotifyEmbed ? SpotifyEmbed.ytFor(NODE[id].q) : null).filter(Boolean).slice(0, 50); return vids.length ? 'https://www.youtube.com/watch_videos?video_ids=' + vids.join(',') : null; },
  shareUrl(){ return location.origin + location.pathname + '?p=crate&c=' + this.get().join(','); },
  /* Spotify: the reader's own account, by PKCE; needs the site's Spotify app id in config */
  async spotifyStart(){
    const cid = (window.SITE_KEYS || {}).spotify; if (!cid){ this.say('Saving to Spotify needs the site\'s Spotify app ID, which isn\'t set up yet. Meanwhile, use the CSV or the list with a transfer service.'); return; }
    const rnd = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(x => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'[x % 66]).join(''); };
    const ver = rnd(64); const dig = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ver)); const ch = btoa(String.fromCharCode(...new Uint8Array(dig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    try { sessionStorage.setItem('sp-ver', ver); sessionStorage.setItem('sp-crate', JSON.stringify(this.ids())); } catch (e){}
    location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({ client_id: cid, response_type: 'code', redirect_uri: location.origin + location.pathname, code_challenge_method: 'S256', code_challenge: ch, scope: 'playlist-modify-private', state: 'crate' });
  },
  async spotifyFinish(){
    const p = new URLSearchParams(location.search); const code = p.get('code'); if (!code || p.get('state') !== 'crate') return; history.replaceState(null, '', location.pathname + '#crate');
    const cid = (window.SITE_KEYS || {}).spotify; let ver = '', ids = []; try { ver = sessionStorage.getItem('sp-ver') || ''; ids = JSON.parse(sessionStorage.getItem('sp-crate') || '[]'); } catch (e){}
    const say = t => setTimeout(() => this.say(t), 300);
    try {
      say('Saving to Spotify…');
      const tk = await (await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cid, grant_type: 'authorization_code', code, redirect_uri: location.origin + location.pathname, code_verifier: ver }) })).json();
      if (!tk.access_token) throw new Error(tk.error_description || 'Spotify did not sign you in');
      const H = { Authorization: 'Bearer ' + tk.access_token, 'Content-Type': 'application/json' }; const uris = [], miss = [];
      for (const id of ids.filter(x => NODE[x])){ const pr = this.parts(id); const q = pr.artist ? `track:${pr.title} artist:${pr.artist}` : NODE[id].title; const r = await (await fetch('https://api.spotify.com/v1/search?' + new URLSearchParams({ q, type: 'track', limit: 5 }), { headers: H })).json(); const t = r.tracks && r.tracks.items && r.tracks.items[0]; if (t) uris.push(t.uri); else miss.push(NODE[id].title); }
      const pl = await (await fetch('https://api.spotify.com/v1/me/playlists', { method: 'POST', headers: H, body: JSON.stringify({ name: 'My crate · fortyyearsof.dance', description: 'Records starred in fortyyearsof.dance', public: false }) })).json();
      if (!pl.id) throw new Error((pl.error && pl.error.message) || 'could not make the playlist');
      for (let i = 0; i < uris.length; i += 100) await fetch(`https://api.spotify.com/v1/playlists/${pl.id}/items`, { method: 'POST', headers: H, body: JSON.stringify({ uris: uris.slice(i, i + 100) }) });
      say(`Saved ${uris.length} track${uris.length === 1 ? '' : 's'} to Spotify. <a href="${(pl.external_urls || {}).spotify || '#'}" target="_blank" rel="noopener">Open the playlist ↗</a>${miss.length ? ` Not found: ${miss.slice(0, 5).join('; ')}${miss.length > 5 ? '…' : ''}` : ''}`);
    } catch (e){ say('Spotify: ' + String(e.message || e)); }
  }
};
window.PageHooks.crate = () => {
  const shared = ((location.hash.split('?')[1] || '').match(/(?:^|&)c=([^&]+)/) || [])[1];
  const sh = document.getElementById('crateShared');
  if (sh){ const ids = shared ? decodeURIComponent(shared).split(',').filter(id => NODE[id]) : []; sh.innerHTML = ids.length ? `<div class="card tint"><h3>A crate someone shared</h3>${ids.map((id, i) => Crate.row(id, i, true)).join('')}<div class="row"><button class="sm" id="crateTake">Add all to my crate</button><button class="sm" id="cratePlayShared">▶ Play it</button></div></div>` : ''; if (ids.length){ document.getElementById('crateTake').onclick = () => { Crate.add(ids); Crate.render(); Crate.say('Added to your crate'); }; document.getElementById('cratePlayShared').onclick = () => Dock.play(ids.map(id => Crate.item(id)), 0); sh.querySelectorAll('.crate-play').forEach(b => b.onclick = () => Dock.play(ids.map(id => Crate.item(id)), +b.dataset.i)); } }
  Crate.render(); const msg = document.getElementById('crateMsg'); if (msg.dataset.done) return; msg.dataset.done = 1;
  const playBtn = document.getElementById('cratePlay'); if (!(window.Dock && Dock.ok())) playBtn.hidden = true;
  playBtn.onclick = () => { const ids = Crate.ids(); if (!ids.length){ Crate.say('Star some records first'); return; } if (!Dock.play(ids.map(id => Crate.item(id)), 0)) Crate.say('None of these has a player yet'); };
  document.getElementById('crateSort').onchange = e => { Crate.sort = e.target.value; Crate.render(); };
  document.getElementById('crateSet').onclick = () => { const segs = Crate.ids().map(id => Crate.presetFor(id)).filter(Boolean).filter((g, i, a) => a.indexOf(g) === i).map(g => ({ genre: g, bars: 16, trans: 4 })); if (!segs.length){ Crate.say('Star some records first'); return; } segs.sort((x, y) => PRESET(x.genre).bpm - PRESET(y.genre).bpm); Mixer.init(); Mixer.program = segs; if (window.MixerUI && MixerUI.built) MixerUI.renderProgram(); location.hash = '#mixer'; setTimeout(() => { if (MixerUI.built){ Mixer.program = segs; MixerUI.renderProgram(); } }, 600); };
  document.getElementById('crateYt').onclick = () => { const u = Crate.youtube(); if (!u){ Crate.say('None of these has a YouTube video in the book yet'); return; } window.open(u, '_blank', 'noopener'); Crate.say('Opened as a YouTube playlist (up to 50 tracks); save it from there to keep it.'); };
  document.getElementById('crateSpotify').onclick = () => Crate.spotifyStart();
  document.getElementById('crateCsv').onclick = () => { if (!Crate.get().length){ Crate.say('Star some records first'); return; } Crate.download('my-crate.csv', Crate.csv(), 'text/csv'); Crate.say('Downloaded. <a href="https://www.tunemymusic.com/" target="_blank" rel="noopener">TuneMyMusic</a> and <a href="https://soundiiz.com/" target="_blank" rel="noopener">Soundiiz</a> can import the file into Apple Music, Tidal, Deezer, Amazon Music or YouTube Music.'); };
  document.getElementById('crateCopy').onclick = () => { const t = Crate.list(); try { navigator.clipboard.writeText(t).then(() => Crate.say('Copied as "Artist - Title" lines, the format transfer services accept.'), () => Crate.say(t.replace(/\n/g, '<br>'))); } catch (e){ Crate.say(t.replace(/\n/g, '<br>')); } };
  document.getElementById('crateShare').onclick = () => { if (!Crate.get().length){ Crate.say('Star some records first'); return; } const u = Crate.shareUrl(); try { navigator.clipboard.writeText(u).then(() => Crate.say('Link copied. Anyone who opens it sees your crate and can add it to theirs.'), () => Crate.say(u)); } catch (e){ Crate.say(u); } };
  document.getElementById('crateClear').onclick = () => { if (!confirm('Empty your crate?')) return; Crate.set([]); Crate.render(); };
};
Crate.spotifyFinish();


/* ---------- marginalia ---------- */
window.Notes = {
  key: 'dm-notes', all(){ try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e){ return {}; } }, save(v){ try { localStorage.setItem(this.key, JSON.stringify(v)); } catch (e){} },
  shared: null, // filled if the artifact runtime offers a database
  mount(pageEl, id){ let box = pageEl.querySelector('.margin-note'); if (box) box.remove(); box = document.createElement('div'); box.className = 'margin-note'; const all = this.all(); const mine = all[id] || '';
    box.innerHTML = `<h3>Margin</h3><textarea class="mn-text" placeholder="Write in the margin — a memory, a correction, where you were…">${mine.replace(/</g, '&lt;')}</textarea><div class="row" style="margin:6px 0 0"><button class="sm mn-save">Save in this browser</button>${this.shared ? '<button class="sm mn-post">Post to the shared margin</button>' : ''}<span class="cap mn-msg"></span></div><div class="mn-shared"></div>`;
    const nav = pageEl.querySelector('.pagenav'); if (nav) pageEl.insertBefore(box, nav); else pageEl.appendChild(box);
    box.querySelector('.mn-save').onclick = () => { const v = box.querySelector('.mn-text').value; const a = this.all(); if (v.trim()) a[id] = v; else delete a[id]; this.save(a); box.querySelector('.mn-msg').textContent = 'saved'; };
    const post = box.querySelector('.mn-post'); if (post) post.onclick = () => this.post(id, box.querySelector('.mn-text').value, box);
    if (this.shared) this.loadShared(id, box); },
  async post(id, text, box){ if (!text.trim()) return; try { await this.shared.write(id, text); box.querySelector('.mn-msg').textContent = 'posted'; this.loadShared(id, box); } catch (e){ box.querySelector('.mn-msg').textContent = 'could not post'; } },
  async loadShared(id, box){ try { const rows = await this.shared.read(id); const el = box.querySelector('.mn-shared'); el.innerHTML = rows.length ? `<h4 style="margin:12px 0 6px">Shared margin</h4>` + rows.map(r => `<blockquote class="mn-q">${String(r.text).replace(/</g, '&lt;')}<small>${r.when || ''}</small></blockquote>`).join('') : ''; } catch (e){} }
};
window.PageHooks.notes = () => { const box = document.getElementById('notesAll'); const all = Notes.all(); const ids = Object.keys(all); box.innerHTML = ids.length ? ids.map(id => `<div class="card" style="margin-bottom:10px"><h3><a class="xl" href="${hashFor(id)}">${nodeTitle(id)}</a></h3><p style="white-space:pre-wrap;font-size:14px">${all[id].replace(/</g, '&lt;')}</p></div>`).join('') : '<p class="cap">Nothing in the margins yet. Every page has a box above its page-turn links.</p>'; };

/* ---------- flyer press ---------- */
window.Flyer = {
  STYLES: [['chicago', 'Chicago house'], ['detroit', 'Detroit techno'], ['acid', 'Acid house'], ['rave', 'Rave'], ['ibiza', 'Balearic'], ['london', 'London'], ['dub', 'Dub and jungle'], ['berlin', 'Berlin warehouse'], ['minimal', 'Minimal'], ['berghain', 'Berghain'], ['hard', 'Hard techno']],
  COL: { detroit: '--kick', acid: '--perc', rave: '--drums', ibiza: '--perc', berlin: '--rumble', minimal: '--synth', berghain: '--rumble', hard: '--kick', dub: '--synth', chicago: '--kick', london: '--samp' },
  NOW: 2026,
  /* "1987–90", "2004–", "1990s", "early 1990s", "c. 1983/84–1990", "from 1992" → [from, to] */
  span(s, open){
    s = String(s || ''); const ys = (s.match(/\d{4}/g) || []).map(Number); if (!ys.length) return null;
    const dec = s.match(/(early|mid-?|late)?\s*(\d{3})0s/); const a = ys[0];
    let b = /(\d{4})\s*[–-]\s*(\d{2,4})/.test(s) ? +s.match(/(\d{4})\s*[–-]\s*(\d{2,4})/)[2] : null; if (b && b < 100) b = Math.floor(a / 100) * 100 + b;
    if (!b && ys.length > 1 && /[–-]/.test(s)) b = ys[ys.length - 1];
    if (!b && dec && !/[–-]\s*$/.test(s.trim()) && !/from|since/.test(s)){ const d = +dec[2] * 10; const w = (dec[1] || '').replace('-', ''); return w === 'early' ? [d, d + 3] : w === 'mid' ? [d + 3, d + 6] : w === 'late' ? [d + 6, d + 9] : [d, d + 9]; }
    if (!b) b = (/[–-]\s*\)?\s*$/.test(s.trim()) || /from|since/.test(s) || open) ? this.NOW : a;
    return [a, Math.min(b, this.NOW)];
  },
  years(n){ const f = (window.FACTS || {})[n.id] || {}; return this.span(n.years, /[–-]\s*$/.test(String(n.years || '').trim())) || this.span(f.opened) || [1990, 1990]; },
  /* who stands behind the decks: dated residents first, then undated ones, then guests whose careers cover the year */
  people(n){
    const F = (window.FACTS || {})[n.id] || {}; const A = buildAliases(); const out = [];
    (F.residents || []).forEach(s => { const name = String(s).split(' (')[0].split(' / ')[0].trim(); const inner = (String(s).match(/\(([^)]*)\)/) || [])[1] || ''; out.push({ name, id: A.map[name] || null, yrs: this.span(inner), role: 'res' }); });
    (BACK[n.id] || []).forEach(([r, id]) => { const p = NODE[id]; if (!p || !/^(person|collective)$/.test(p.type)) return; if (r === 'founded'){ out.push({ name: p.title, id, yrs: null, role: 'found' }); return; } if (r === 'played' || r === 'member' || r === 'at') out.push({ name: p.title, id, yrs: this.span(p.years, true), role: 'guest' }); });
    return out;
  },
  lineup(n, y){
    const P = this.people(n), seen = new Set(), res = [], guests = []; const add = (arr, p) => { const k = (p.id || p.name).toLowerCase(); if (seen.has(k)) return; seen.add(k); arr.push(p.name); };
    P.filter(p => p.role === 'res' && p.yrs && p.yrs[0] <= y && y <= p.yrs[1]).forEach(p => add(res, p));
    /* undated names (most lists give today's residents) and guests (the book does not date who played when) only on a flyer for the room's recent years, or for a short-lived room */
    const [a0, b0] = this.years(n); const recent = y >= b0 - 8 || b0 - a0 <= 12;
    if (recent) P.filter(p => p.role === 'res' && !p.yrs).forEach(p => add(res, p));
    if (recent) P.filter(p => p.role === 'guest' && (!p.yrs || (p.yrs[0] <= y && y <= p.yrs[1]))).forEach(p => add(guests, p));
    const presents = P.filter(p => p.role === 'found').map(p => p.name).slice(0, 2);
    return { res: res.slice(0, 6), guests: guests.slice(0, Math.max(0, 7 - Math.min(res.length, 6))), presents };
  },
  richest(n){ const [a, b] = this.years(n); let best = a, score = -1; for (let y = a; y <= b; y++){ const L = this.lineup(n, y); const sc = L.res.length * 2 + L.guests.length; if (sc > score){ score = sc; best = y; } } return best; },
  styleFor(n, y){
    const c = n.city, s = n.strands || [];
    if (c === 'detroit') return 'detroit'; if (c === 'chicago') return y < 1988 ? 'chicago' : 'acid'; if (c === 'ibiza' || c === 'goa' || s[0] === 'trance') return 'ibiza';
    if (s[0] === 'jungle') return 'dub'; if (n.id === 'berghain') return 'berghain';
    if (c === 'berlin') return y < 2003 ? 'berlin' : y < 2016 ? 'minimal' : 'hard';
    if (c === 'london' && y >= 1997) return 'london';
    return y < 1988 ? 'chicago' : y < 1990 ? 'acid' : y < 1996 ? 'rave' : y < 2003 ? 'berlin' : y < 2016 ? 'minimal' : 'hard';
  },
  autoMount(root, id){
    const n = NODE[id]; if (!n || !/^(club|event|set|collective)$/.test(n.type)) return; if (root.querySelector('.flyerbox')) return;
    const [a, b] = this.years(n); const y0 = this.richest(n); const box = document.createElement('div'); box.className = 'flyerbox card';
    box.innerHTML = `<div class="fl-grid"><div class="fl-art"><svg id="flyerSvg" class="diag" role="img" aria-label="Tribute flyer for ${n.title.replace(/"/g, '&quot;')}"></svg></div>
      <div class="fl-side"><h3>Flyer press</h3><p class="cap">Set a tribute flyer for a night at ${n.title} in any year it ran. The line-up is the residents and guests the book connects to the room in that year; it is a tribute, not a copy of a real flyer.</p>
      ${b > a ? `<label class="fl-row"><span>Year</span><input type="range" class="fl-year" min="${a}" max="${b}" value="${y0}" step="1"><b class="fl-yout">${y0}</b></label>` : ''}
      <label class="fl-row"><span>Style</span><select class="fl-style"><option value="">Match the year</option>${this.STYLES.map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></label>
      <div class="row"><button class="sm fdl">Download PNG</button><button class="sm fdls">Download SVG</button><span class="cap fmsg"></span></div></div></div>`;
    const grid = root.querySelector('.grid2'); if (grid) grid.after(box); else { const nav = root.querySelector('.pagenav'); root.insertBefore(box, nav || null); }
    let y = y0; const yr = box.querySelector('.fl-year'), sel = box.querySelector('.fl-style');
    const draw = () => { this.draw(n, y, sel.value || this.styleFor(n, y)); const o = box.querySelector('.fl-yout'); if (o) o.textContent = y; };
    if (yr) yr.oninput = () => { y = +yr.value; draw(); }; sel.onchange = draw;
    box.querySelector('.fdl').onclick = () => this.download(n, y, 'png'); box.querySelector('.fdls').onclick = () => this.download(n, y, 'svg');
    draw();
  },
  wrap(s, max){ const out = []; let line = ''; String(s).split(/\s+/).forEach(w => { if ((line + ' ' + w).trim().length > max && line){ out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) out.push(line); return out; },
  draw(n, y, style){
    const svg = document.getElementById('flyerSvg'); if (!svg) return; const W = 420, H = 594; clearSvg(svg, W, H); const col = css(this.COL[style] || '--text');
    el('rect', { width: W, height: H, fill: '#0e0e13' }, svg);
    const art = el('svg', { id: 'flyerArt', x: 0, y: 0, width: W, height: 318, preserveAspectRatio: 'xMidYMid slice' }, svg); drawPoster('flyerArt', style, '', '');
    const g = el('linearGradient', { id: 'flfade', x1: 0, y1: 0, x2: 0, y2: 1 }, el('defs', {}, svg)); el('stop', { offset: 0, 'stop-color': '#0e0e13', 'stop-opacity': 0 }, g); el('stop', { offset: 1, 'stop-color': '#0e0e13', 'stop-opacity': 1 }, g);
    el('rect', { x: 0, y: 210, width: W, height: 110, fill: 'url(#flfade)' }, svg);
    const L = this.lineup(n, y); const city = n.city && NODE[n.city] ? NODE[n.city].title : '';
    el('rect', { x: 0, y: 0, width: W, height: 34, fill: '#0e0e13', opacity: .72 }, svg);
    const head = (L.presents.length ? L.presents.join(' & ') + ' presents' : (TYPE_LABEL[n.type] || '')).toUpperCase(); text(svg, 22, 22, head, { fill: '#ebebf1', 'font-size': Math.min(10, (W - 110) / (head.length * .78)).toFixed(1), 'letter-spacing': '.18em', 'font-weight': 700 });
    text(svg, W - 22, 23, String(y), { fill: col, 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', 'letter-spacing': '.06em' });
    const gl = this.wrap(L.guests.map(x => x.toUpperCase()).join(' · '), 44);
    const lineupH = (L.res.length ? 22 + L.res.reduce((h, _, i) => h + (i < 2 ? 24 : 19), 0) : 0) + (L.guests.length ? 31 + gl.length * 17 : 0) + (!L.res.length && !L.guests.length ? 26 : 0);
    const top = 286, avail = (H - 46) - top - lineupH - 44; const name = n.title.toUpperCase(); let fs = 58, lines;
    for (; fs >= 22; fs -= 2){ lines = this.wrap(name, Math.floor((W - 44) / (fs * .6))); if (lines.length <= 3 && lines.every(l => l.length * fs * .6 <= W - 44) && lines.length * fs * .95 <= Math.max(avail, 60)) break; }
    let ty = top + fs * .85; lines.slice(0, 3).forEach(l => { text(svg, 22, ty, l, { fill: '#ebebf1', 'font-size': fs, 'font-weight': 700, 'font-family': 'Space Grotesk, sans-serif', 'letter-spacing': '-0.02em' }); ty += fs * .95; });
    text(svg, 22, ty - fs * .25 + 14, [city, String(y)].filter(Boolean).join(' · ').toUpperCase(), { fill: col, 'font-size': 11, 'letter-spacing': '.2em', 'font-weight': 700 });
    let ly = ty + 30; const room = H - 46;
    if (L.res.length){ text(svg, 22, ly, L.res.length > 1 ? 'RESIDENTS' : 'RESIDENT', { fill: '#8f8fa0', 'font-size': 9, 'letter-spacing': '.24em' }); ly += 22;
      L.res.forEach((nm, i) => { if (ly > room) return; const big = i < 2; text(svg, 22, ly, nm.toUpperCase(), { fill: '#ebebf1', 'font-size': big ? 19 : 14, 'font-weight': 700, 'font-family': 'Space Grotesk, sans-serif' }); ly += big ? 24 : 19; }); }
    if (L.guests.length && ly < room - 20){ ly += 6; text(svg, 22, ly, L.res.length ? 'WITH' : 'LINE-UP', { fill: '#8f8fa0', 'font-size': 9, 'letter-spacing': '.24em' }); ly += 19;
      gl.forEach(l => { if (ly > room) return; text(svg, 22, ly, l, { fill: '#ebebf1', 'font-size': 12.5, 'font-family': 'Space Grotesk, sans-serif', 'font-weight': 600 }); ly += 17; }); }
    if (!L.res.length && !L.guests.length) text(svg, 22, ly + 4, 'RESIDENTS ALL NIGHT', { fill: '#ebebf1', 'font-size': 16, 'font-weight': 700, 'font-family': 'Space Grotesk, sans-serif' });
    el('line', { x1: 22, y1: H - 30, x2: W - 22, y2: H - 30, stroke: '#2a2a35' }, svg);
    text(svg, 22, H - 15, 'A TRIBUTE FLYER, NOT AN ORIGINAL · FORTYYEARSOF.DANCE · CC BY-NC-SA', { fill: '#6f6f80', 'font-size': 7.5, 'letter-spacing': '.12em' });
  },
  download(n, y, kind){
    const svg = document.getElementById('flyerSvg'); if (!svg) return; const clone = svg.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', 1240); clone.setAttribute('height', 1754);
    clone.querySelectorAll('text').forEach(t => { if (!t.getAttribute('font-family')) t.setAttribute('font-family', 'JetBrains Mono, monospace'); }); clone.querySelectorAll('[class]').forEach(e => e.removeAttribute('class'));
    const src = new XMLSerializer().serializeToString(clone); const name = `flyer-${n.id}-${y}`; const msg = document.querySelector('.flyerbox .fmsg');
    if (kind === 'svg'){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' })); a.download = name + '.svg'; a.click(); return; }
    const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = 1240; c.height = 1754; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 1240, 1754); c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name + '.png'; a.click(); }); }; img.onerror = () => { if (msg) msg.textContent = 'PNG export is blocked here; use SVG'; }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
  }
};

/* ---------- the neural voice: Kokoro, run in the reader's own browser (web edition only) ---------- */
window.Neural = {
  MODEL: 'onnx-community/Kokoro-82M-v1.0-ONNX',
  VOICES: [['bm_george', 'George', 'British'], ['bf_emma', 'Emma', 'British'], ['bm_lewis', 'Lewis', 'British'], ['bf_isabella', 'Isabella', 'British'], ['bm_fable', 'Fable', 'British'], ['af_heart', 'Heart', 'American'], ['am_michael', 'Michael', 'American']],
  ok(){ return !!(window.SITE && SITE.embeds) && !/claudeusercontent|claude\.ai/.test(location.hostname) && typeof WebAssembly === 'object'; },
  pref(){ try { return localStorage.getItem('dm-voice') || 'device'; } catch (e){ return 'device'; } },
  setPref(v){ try { localStorage.setItem('dm-voice', v); } catch (e){} },
  on(){ return this.ok() && this.pref() !== 'device'; },
  voice(){ const v = this.pref(); return this.VOICES.some(x => x[0] === v) ? v : 'bm_george'; },
  tts: null, loading: null, ctx: null, src: null, pct: 0,
  audio(){ if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  load(progress){
    if (this.tts) return Promise.resolve(this.tts); if (this.loading) return this.loading;
    const seen = {}; const cb = p => { if (p && p.file && p.total){ seen[p.file] = [p.loaded || 0, p.total]; const L = Object.values(seen).reduce((a, x) => a + x[0], 0), T = Object.values(seen).reduce((a, x) => a + x[1], 0); this.pct = T ? Math.round(L / T * 100) : 0; if (progress) progress(this.pct); } };
    this.loading = import('./vendor/kokoro.web.js').then(m => m.KokoroTTS.from_pretrained(this.MODEL, { dtype: 'q8', device: 'wasm', progress_callback: cb })).then(t => (this.tts = t)).catch(e => { this.loading = null; throw e; });
    return this.loading;
  },
  async speak(text){ const t = await this.load(); return t.generate(text, { voice: this.voice() }); },
  play(a){ return new Promise(res => { const c = this.audio(); const buf = c.createBuffer(1, a.audio.length, a.sampling_rate); buf.copyToChannel(a.audio, 0); const s = c.createBufferSource(); s.buffer = buf; s.connect(c.destination); s.onended = () => res(); this.src = s; s.start(); }); },
  stop(){ try { if (this.src) this.src.stop(); } catch (e){} this.src = null; },
  /* sentences short enough for the model, never across paragraphs */
  chunks(t){ const out = []; String(t).replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[“"‘'(A-Z0-9])/).forEach(s => { while (s.length > 320){ const k = s.lastIndexOf(', ', 300) > 80 ? s.lastIndexOf(', ', 300) + 1 : s.lastIndexOf(' ', 300); out.push(s.slice(0, k).trim()); s = s.slice(k).trim(); } if (s) out.push(s); }); return out; },
  async selfTest(){ const t0 = performance.now(); await this.load(); const t1 = performance.now(); const a = await this.speak('Forty years of dance music, read aloud.'); return { loadMs: Math.round(t1 - t0), genMs: Math.round(performance.now() - t1), seconds: +(a.audio.length / a.sampling_rate).toFixed(2), rate: a.sampling_rate }; },
  picker(){
    let box = document.getElementById('voicePick'); if (box){ box.remove(); return; }
    box = document.createElement('div'); box.id = 'voicePick'; box.className = 'streampick';
    const cur = this.pref();
    box.innerHTML = `<h4>Reading voice</h4><label><input type="radio" name="vp" value="device"${cur === 'device' ? ' checked' : ''}> This device's own voice</label><p class="cap">Neural voices sound close to a person. They run in your browser after a one-time download of about 90 MB, then work offline.</p>${this.VOICES.map(([id, n, a]) => `<label><input type="radio" name="vp" value="${id}"${cur === id ? ' checked' : ''}> ${n} <small>· ${a}</small></label>`).join('')}<div class="row"><button class="sm vp-try">Try it</button><button class="sm vp-close">Done</button><span class="cap vp-msg"></span></div>`;
    document.body.appendChild(box);
    const msg = box.querySelector('.vp-msg');
    box.querySelectorAll('input[name=vp]').forEach(r => r.onchange = () => { this.setPref(r.value); msg.textContent = ''; });
    box.querySelector('.vp-close').onclick = () => box.remove();
    box.querySelector('.vp-try').onclick = async () => { const v = this.pref(); if (v === 'device'){ const u = new SpeechSynthesisUtterance('This is the voice your device reads with.'); const vv = Reader.voice(); if (vv) u.voice = vv; speechSynthesis.cancel(); speechSynthesis.speak(u); return; } this.audio(); try { msg.textContent = this.tts ? 'Speaking…' : 'Downloading the voice…'; const a = await (this.tts ? this.speak('This is how the book sounds, read aloud.') : this.load(p => msg.textContent = `Downloading the voice… ${p}%`).then(() => this.speak('This is how the book sounds, read aloud.'))); msg.textContent = ''; this.stop(); await this.play(a); } catch (e){ msg.textContent = 'The neural voice could not load here: ' + String(e.message || e).slice(0, 80); } };
  }
};

/* ---------- audiobook: the browser reads the page ---------- */
window.Reader = {
  on: false, queue: [], i: 0, bed: true,
  voice(){ const vs = speechSynthesis.getVoices(); return vs.find(v => /en[-_]GB/i.test(v.lang) && /natural|neural|premium|enhanced/i.test(v.name)) || vs.find(v => /en[-_]GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || vs[0]; },
  items(){ const page = document.querySelector('.page.show'); if (!page) return []; return [...page.querySelectorAll('h2, .lede, h3, p, li, .framing p')].filter(e => !e.closest('.card, .pg, .morph, .margin-note, .pagenav, .forks, .chips, .runhead, .flyerbox, .rels, template') && e.textContent.trim().length > 2 && !e.classList.contains('cap') && !e.classList.contains('kicker')).filter((e, i, a) => !a.some((o, j) => j < i && o.contains(e))); },
  toggle(){ this.on ? this.stop() : this.start(); },
  async neuralRun(){
    const C = []; this.queue.forEach(e => Neural.chunks(e.textContent).forEach(t => C.push({ e, t }))); const btn = document.getElementById('readBtn');
    if (!Neural.tts && btn) btn.textContent = '■ Loading voice';
    try { await Neural.load(p => { if (this.on && btn) btn.textContent = `■ Voice ${p}%`; }); } catch (e){ if (btn) btn.textContent = '■ Reading'; Neural.setPref('device'); this.neural = false; this.speak(); return; }
    if (!this.on) return; if (btn) btn.textContent = '■ Reading';
    const gen = i => C[i] ? Neural.speak(C[i].t).catch(() => null) : Promise.resolve(null); let ahead = [gen(0), gen(1)];
    for (let i = 0; i < C.length && this.on; i++){
      const a = await ahead[0]; ahead = [ahead[1], gen(i + 2)]; if (!this.on) break;
      if (!C[i].e.classList.contains('reading')){ document.querySelectorAll('.reading').forEach(x => x.classList.remove('reading')); C[i].e.classList.add('reading'); C[i].e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      if (a) await Neural.play(a);
    }
    if (this.on) this.stop();
  },
  start(){ if (!('speechSynthesis' in window)){ alert('This browser has no speech voices.'); return; } this.queue = this.items(); if (!this.queue.length) return; this.on = true; this.i = 0; document.getElementById('readBtn').textContent = '■ Reading'; document.getElementById('readBtn').classList.add('on');
    if (this.bed){ const g = document.querySelector('.page.show .pgbox'); if (g && g._grid && typeof PatternGrid !== 'undefined'){ PatternGrid.play(g._grid); Mixer.demoDeck.setLevel(0.22); } }
    if (window.Neural && Neural.on()){ this.neural = true; Neural.audio(); this.neuralRun(); return; } this.neural = false; this.speak(); },
  speak(){ if (!this.on) return; if (this.i >= this.queue.length){ this.stop(); return; } document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); const e = this.queue[this.i]; e.classList.add('reading'); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); const u = new SpeechSynthesisUtterance(e.textContent.replace(/\s+/g, ' ').trim()); const v = this.voice(); if (v) u.voice = v; u.rate = 1.0; u.pitch = 1; u.onend = () => { if (this.on){ this.i++; setTimeout(() => this.speak(), e.tagName === 'H2' || e.tagName === 'H3' ? 350 : 120); } }; u.onerror = () => { this.fails = (this.fails || 0) + 1; if (this.fails > 3){ this.stop(); return; } if (this.on){ this.i++; this.speak(); } }; u.onstart = () => { this.fails = 0; }; speechSynthesis.cancel(); speechSynthesis.speak(u); },
  stop(){ this.on = false; if (window.Neural) Neural.stop(); try { speechSynthesis.cancel(); } catch (e){} document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); const b = document.getElementById('readBtn'); if (b){ b.textContent = '🔈 Read'; b.classList.remove('on'); } if (typeof PatternGrid !== 'undefined' && PatternGrid.active){ PatternGrid.stop(); if (Mixer.demoDeck) Mixer.demoDeck.setLevel(1); } }
};
window.addEventListener('hashchange', () => { if (Reader.on) Reader.stop(); });
if ('speechSynthesis' in window) speechSynthesis.getVoices();

/* ---------- shared margin via the artifact runtime (lights up when present) ---------- */
(async () => {
  try {
    if (!window.claude || typeof claude.use !== 'function') return;
    const db = await claude.use('db'); const user = await claude.use('user'); if (!db || !user) return;
    const uid = await user.id(); if (!uid) return;
    let cache = null, cacheAt = 0;
    Notes.shared = {
      uid,
      async write(page, text){ const ref = db.doc('margins/' + uid); const snap = await ref.get(); const cur = snap.exists ? JSON.parse(JSON.stringify(snap.data() || {})) : {}; cur.pages = cur.pages || {}; cur.pages[page] = { text: String(text).slice(0, 2000), when: new Date().toISOString().slice(0, 10) }; await ref.set(cur); cache = null; },
      async read(page){ if (!cache || Date.now() - cacheAt > 60000){ const q = await db.collection('margins').get(); cache = q.docs.map(d => ({ id: d.id, pages: (d.data() || {}).pages || {} })); cacheAt = Date.now(); } const rows = cache.filter(d => d.pages[page]).map(d => ({ uid: d.id, ...d.pages[page] })); let names = {}; try { names = await user.profiles(rows.map(r => r.uid)); } catch (e){} rows.forEach(r => { r.who = (names[r.uid] && names[r.uid].name) || 'A reader'; r.when = `${r.who} · ${r.when || ''}`; }); return rows; }
    };
    const page = document.querySelector('.page.show'); const h = (location.hash || '#home').slice(1).split(/[?&]/)[0]; const id = h.replace(/^(techno|house|rave|jungle|trance|anatomy|mixer)-/, ''); if (page && page.querySelector('.margin-note')) Notes.mount(page, id);
  } catch (e){ /* no shared margin in this view */ }
})();

/* ---------- forty years: one page a year ---------- */
window.YearPage = {
  /* the anniversary year: what in the book turns forty, fifty, thirty, twenty-five, twenty and ten */
  anniversaries(y){
    const deg = n => n.rel.length + ((typeof BACK !== 'undefined' && BACK[n.id]) || []).length;
    return [[40, 'Forty'], [50, 'Fifty'], [30, 'Thirty'], [25, 'Twenty-five'], [20, 'Twenty'], [10, 'Ten']].map(([off, word]) => { const y0 = y - off; const tl = TL.filter(e => e[0] === y0); const ns = NODES.filter(n => /^(record|club|event|label|set|station|collective)$/.test(n.type) && YearView.years(n) && YearView.years(n)[0] === y0).sort((a, b) => deg(b) - deg(a)).slice(0, off === 40 ? 40 : 16);
      if (!tl.length && !ns.length) return '';
      return `<h3>${word} years since ${y0}</h3>${tl.slice(0, off === 40 ? 12 : 4).map(e => `<p><b>${e[2]}</b> — ${e[4]} <a class="xl" href="#${e[3]}">chapter →</a></p>`).join('')}${ns.length ? `<div class="chips">${ns.map(n => `<a class="chip" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type]})"><i></i>${n.title}</a>`).join('')}</div>` : ''}<p class="cap"><a class="xl" href="#years-y${y0}">the ${y0} page →</a></p>`; }).join('');
  },
  render(y){ const art = document.querySelector(`.page[data-page="y${y}"]`); if (!art) return; const Y = YEARS[y]; if (!Y) return;
    art.querySelector('.yh2').textContent = Y[0]; art.querySelector('.ylede').innerHTML = Y[1];
    const box = art.querySelector('.yearbody'); if (box.dataset.done) return; box.dataset.done = 1;
    const yrs = n => YearView.years(n); const born = NODES.filter(n => n.type !== 'city' && yrs(n) && yrs(n)[0] === y); const alive = NODES.filter(n => yrs(n) && yrs(n)[0] < y && yrs(n)[1] >= y);
    const byType = {}; born.forEach(n => (byType[n.type] = byType[n.type] || []).push(n)); const order = ['record', 'club', 'event', 'person', 'collective', 'label', 'station', 'genre', 'set', 'machine', 'border'];
    const im = Object.entries(window.IMAGES || {}).find(([k]) => { const n = NODE[k]; return n && yrs(n) && yrs(n)[0] === y && /^(club|event|collective|station)$/.test(n.type); }) || Object.entries(window.IMAGES || {}).find(([k]) => { const n = NODE[k]; return n && yrs(n) && yrs(n)[0] === y; });
    const tl = TL.filter(e => e[0] === y); const rooms = alive.filter(n => n.type === 'club'); const chapters = [...new Set(born.flatMap(n => n.rel.filter(r => r[0] === 'told').map(r => r[1])))];
    box.innerHTML = `<div class="ynav"><span>${y < BOOK.from ? 'the year before' : y === BOOK.from ? 'the breakout year' : y === BOOK.to ? 'forty years on' : 'year ' + (y - BOOK.from + 1)}</span><span>${YEARS[y - 1] ? `<a class="xl" href="#years-y${y - 1}">← ${y - 1}</a>` : ''} ${YEARS[y + 1] ? `· <a class="xl" href="#years-y${y + 1}">${y + 1} →</a>` : ''}</span></div>
      ${born.length || y < BOOK.to ? `<div class="ystats"><span><b>${(byType.record || []).length}</b>records</span><span><b>${(byType.club || []).length + (byType.event || []).length}</b>rooms &amp; nights opened</span><span><b>${(byType.person || []).length + (byType.collective || []).length}</b>people arrived</span><span><b>${(byType.label || []).length}</b>labels started</span><span><b>${rooms.length}</b>rooms open this year</span></div>` : ''}
      ${im ? `<figure class="hero-img"><img src="${im[1].src}" alt="${im[1].title.replace('File:', '')}" loading="lazy"><figcaption>${NODE[im[0]].title} (${NODE[im[0]].years}) · ${im[1].title.replace('File:', '').replace(/\.(jpe?g|png)$/i, '')} · ${im[1].author} · <a href="${im[1].page}" target="_blank" rel="noopener">${im[1].license}</a>${window.Rights ? ' · ' + Rights.link(im[0], im[1].src, 'y' + y) : ''}</figcaption></figure>` : ''}
      <div class="grid2"><div>
        ${y === BOOK.to ? `<div class="anniv">${this.anniversaries(y)}</div>` : ''}
        ${tl.length ? `<h3>On the timeline</h3>${tl.map(e => `<p><b>${e[2]}</b> — ${e[4]} <a class="xl" href="#${e[3]}">chapter →</a></p>`).join('')}` : ''}
        ${order.filter(t => byType[t]).map(t => `<h3>${{ record: 'Records of the year', club: 'Rooms that opened', event: 'Nights and festivals that began', person: 'Who arrived', collective: 'Crews', label: 'Labels', station: 'On the radio', genre: 'A genre is named', set: 'Landmark sets', machine: 'Machines', border: 'Crossings' }[t]}</h3><div class="chips">${byType[t].map(n => `<a class="chip" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type]})"><i></i>${n.title}</a>`).join('')}</div>`).join('')}
        ${rooms.length ? `<h3>Open this year</h3><p class="cap">${rooms.slice(0, 40).map(n => `<a class="xl" href="#${n.id}">${n.title}</a>`).join(' · ')}${rooms.length > 40 ? ` · and ${rooms.length - 40} more` : ''}</p>` : ''}
        ${chapters.length ? `<h3>Read the year</h3><div class="chips">${chapters.map(c => `<a class="chip" href="${hashFor(c)}"><i></i>${nodeTitle(c)}</a>`).join('')}</div>` : ''}
      </div><div>
        <div class="card tint"><h3>The sound of ${y}</h3><p class="cap" style="margin-bottom:6px">${Y[2].length > 1 ? 'The year\'s records and eras, rebuilt in the engine. Tabs switch between them.' : 'The era, rebuilt in the engine.'}</p><div class="era">${Y[2].filter(g => PRESET(g)).map(g => `<button class="play era-btn" data-genre="${g}" data-bars="2">${g}</button>`).join('')}</div></div>
      </div></div>`;
    wireEraButtons(); autolink(box, null); if (window.SpotifyEmbed) SpotifyEmbed.wire(art); }
};
Object.keys(YEARS).forEach(y => { window.PageHooks['y' + y] = () => YearPage.render(+y); });

/* ---------- forty of everything ---------- */
const FORTY = {
  'Forty records': ['rec-onandon', 'rec-noufos', 'rec-moveyourbody', 'rec-canyoufeelit', 'rec-jackyourbody', 'rec-nudephoto', 'rec-strings', 'rec-acidtracks', 'rec-bigfun', 'rec-voodooray', 'rec-pacific', 'rec-chime', 'rec-lfo', 'rec-energyflash', 'rec-mentasm', 'rec-sonicdestroyer', 'rec-terminator', 'rec-ageoflove', 'rec-stella', 'rec-spastik', 'rec-phylyps', 'rec-renegadesnares', 'rec-originalnuttah', 'rec-minimalnation', 'rec-pulpfiction', 'rec-thebells', 'rec-children', 'rec-dafunk', 'rec-brownpaperbag', 'rec-wormhole', 'rec-musicsounds', 'rec-sandstorm', 'rec-lovestory', 'rec-dexter', 'rec-subzero', 'rec-translation', 'rec-ghettokraviz', 'rec-whytheyhide', 'rec-doppler', 'rec-headzgonewest'],
  'Forty rooms': ['warehouse', 'music-box', 'paradise-garage', 'camden-palace', 'amnesia', 'hacienda', 'music-institute', 'shoom', 'clink-street', 'heaven', 'rage', 'ufo', 'space', 'tresor', 'lost', 'the-orbit', 'sub-club', 'pure', 'omen', 'e-werk', 'que-club', 'house-of-god', 'the-end', 'blue-note', 'speed', 'rex-club', 'liquid-room', 'gatecrasher', 'fabric', 'dorian-gray', 'watergate', 'berghain', 'corsica-studios', 'bassiani', 'printworks', 'fold', 'golden-pudel', 'khidi', 'the-pig', 'dc10'],
  'Forty people': ['frankie-knuckles', 'ron-hardy', 'larry-levan', 'alfredo', 'juan-atkins', 'derrick-may', 'kevin-saunderson', 'marshall-jefferson', 'larry-heard', 'dj-pierre', 'mr-c', 'eddie-richards', 'colin-faver', 'paul-oakenfold', 'danny-rampling', 'a-guy-called-gerald', 'jeff-mills', 'mike-banks', 'carl-craig', 'robert-hood', 'richie-hawtin', 'joey-beltram', 'tanith', 'dimitri-hegemann', 'sven-vath', 'laurent-garnier', 'carl-cox', 'fabio-grooverider', 'goldie', 'ltj-bukem', 'roni-size', 'surgeon', 'regis', 'basic-channel', 'ricardo-villalobos', 'ben-klock', 'paul-van-dyk', 'armin-van-buuren', 'nina-kraviz', 'sherelle'],
  'Forty nights': ['set-knuckles-warehouse', 'set-musicinstitute', 'set-alfredo', 'set-rip', 'set-rage', 'sunrise', 'set-sunrise5000', 'love-parade', 'castlemorton', 'set-liquidroom', 'tribal-gathering', 'set-speed', 'set-metalheadz', 'set-endlast', 'set-coxspace', 'set-cocoon', 'set-de9', 'set-klubnacht', 'set-surgeonbr', 'movement', 'awakenings', 'dekmantel', 'time-warp', 'sonar', 'set-exhibitionist', 'set-packard', 'set-dtm5x5', 'dtm-hastings', 'trance-energy', 'sensation', 'set-garnierrex', 'jungle-fever', 'hospitality', 'street-parade', 'nature-one', 'boom', 'set-kraviz', 'set-tiesto-athens', 'reclaim-the-streets', 'teknival']
};
window.PageHooks.forty = () => { const box = document.getElementById('fortyLists'); if (!box || box.dataset.done) return; box.dataset.done = 1; Object.entries(FORTY).forEach(([title, ids]) => { const yr = id => ((yrsOf(NODE[id]) || [9999])[0]); const items = ids.filter(id => NODE[id]).slice(0, 40).sort((a, b) => yr(a) - yr(b)); const d = document.createElement('div'); d.className = 'card'; d.style.marginBottom = '14px'; d.innerHTML = `<h3>${title}</h3><ol class="fortylist">${items.map(id => `<li><a class="xl" href="#${id}">${NODE[id].title}</a><small>${NODE[id].years}</small></li>`).join('')}</ol>${items.length < 40 ? `<p class="cap">${items.length} so far — the rest are pages still to be written.</p>` : ''}`; box.appendChild(d); }); };
