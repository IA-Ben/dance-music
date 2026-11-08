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
    ['space', 'Playa d\'en Bossa: Carl Cox\'s fifteen summers, the terrace with the planes overhead.'],
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
  button(id){ const b = document.createElement('button'); b.className = 'sm crate-btn' + (this.has(id) ? ' on' : ''); b.textContent = this.has(id) ? '★ in your crate' : '☆ add to crate'; b.onclick = () => { const on = this.toggle(id); b.classList.toggle('on', on); b.textContent = on ? '★ in your crate' : '☆ add to crate'; }; return b; },
  presetFor(id){ const n = NODE[id]; if (!n) return null; if (REC_INDEX[id]) return REC_INDEX[id]; const g = (n.rel.find(r => r[0] === 'genre') || [])[1]; return g && NODE[g] && NODE[g].preset ? NODE[g].preset : null; },
  render(){ const box = document.getElementById('crateList'); if (!box) return; const ids = this.get().filter(id => NODE[id]); if (!ids.length){ box.innerHTML = '<p class="cap">Empty. Every record page has a ☆ button.</p>'; return; } box.innerHTML = ids.map(id => { const n = NODE[id]; const pr = this.presetFor(id); return `<div class="relrow"><b>${n.years}</b><span><a class="xl" href="#${id}">${n.title}</a>${pr ? ` <span class="cap">· ${pr}</span>` : ''} <button class="sm crate-rm" data-id="${id}">remove</button></span></div>`; }).join(''); box.querySelectorAll('.crate-rm').forEach(b => b.onclick = () => { this.toggle(b.dataset.id); this.render(); }); },
  list(){ return this.get().filter(id => NODE[id]).map(id => `${NODE[id].title} (${NODE[id].years})`).join('\n'); }
};
window.PageHooks.crate = () => { Crate.render(); const msg = document.getElementById('crateMsg'); if (!msg.dataset.done){ msg.dataset.done = 1;
  document.getElementById('crateSet').onclick = () => { const segs = Crate.get().map(id => Crate.presetFor(id)).filter(Boolean).filter((g, i, a) => a.indexOf(g) === i).map(g => ({ genre: g, bars: 16, trans: 4 })); if (!segs.length){ msg.textContent = 'star some records first'; return; } segs.sort((x, y) => PRESET(x.genre).bpm - PRESET(y.genre).bpm); Mixer.init(); Mixer.program = segs; if (window.MixerUI && MixerUI.built) MixerUI.renderProgram(); location.hash = '#mixer'; setTimeout(() => { if (MixerUI.built){ Mixer.program = segs; MixerUI.renderProgram(); } }, 600); };
  document.getElementById('crateCopy').onclick = () => { const t = Crate.list(); try { navigator.clipboard.writeText(t).then(() => msg.textContent = 'copied', () => msg.textContent = t); } catch (e){ msg.textContent = t; } };
  document.getElementById('crateClear').onclick = () => { Crate.set([]); Crate.render(); }; } };

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
  styles: ['detroit', 'acid', 'rave', 'ibiza', 'berlin', 'dub', 'minimal', 'berghain', 'hard', 'chicago', 'london'],
  autoMount(root, id){ const n = NODE[id]; if (!n || !/^(club|event|set|collective)$/.test(n.type)) return; let box = root.querySelector('.flyerbox'); if (box) return; box = document.createElement('div'); box.className = 'flyerbox'; const rels = root.querySelector('.rels'); const anchor = rels ? rels.parentElement : root; box.innerHTML = `<h3>Flyer press</h3><p class="cap" style="margin-bottom:8px">A flyer for this room, set from the line-up the book knows about. Pick a style, download it, stick it on something.</p><div class="chips fstyles">${this.styles.map(s => `<button class="chip fs" data-s="${s}"><i></i>${s}</button>`).join('')}</div><div class="card tint" style="margin-top:10px"><svg id="flyerSvg" class="diag"></svg></div><div class="row"><button class="sm fdl">Download PNG</button><button class="sm fdls">Download SVG</button><span class="cap fmsg"></span></div>`; anchor.appendChild(box);
    const draw = style => { box.querySelectorAll('.fs').forEach(b => b.classList.toggle('on', b.dataset.s === style)); this.draw(n, style); };
    box.querySelectorAll('.fs').forEach(b => b.onclick = () => draw(b.dataset.s));
    box.querySelector('.fdl').onclick = () => this.download(n, 'png'); box.querySelector('.fdls').onclick = () => this.download(n, 'svg');
    const guess = n.strands[0] === 'rave' ? 'rave' : n.strands[0] === 'house' ? 'chicago' : n.strands[0] === 'trance' ? 'ibiza' : n.strands[0] === 'jungle' ? 'dub' : n.city === 'berlin' ? 'berlin' : n.city === 'london' ? 'london' : 'detroit'; draw(guess); },
  lineup(n){ const played = (BACK[n.id] || []).filter(([r]) => r === 'played' || r === 'at').map(([, id]) => NODE[id]).filter(x => x && x.type === 'person'); const members = (BACK[n.id] || []).filter(([r]) => r === 'member').map(([, id]) => NODE[id]).filter(Boolean); const residents = n.rel.filter(([r]) => r === 'founded').map(([, id]) => NODE[id]).filter(x => x && x.type === 'person'); const list = [...new Set([...played, ...members, ...residents].map(x => x.title))]; return list.length ? list : ['residents all night']; },
  draw(n, style){ const svg = document.getElementById('flyerSvg'); if (!svg) return; const city = n.city && NODE[n.city] ? NODE[n.city].title : ''; drawPoster('flyerSvg', style, n.title.toUpperCase().slice(0, 22), [city.toUpperCase(), n.years].filter(Boolean).join(' · ')); const names = this.lineup(n).slice(0, 9); const col = css(TYPE_COLOR[n.type] || '--text');
    el('rect', { x: 352, y: 22, width: 228, height: 22 + names.length * 19, rx: 6, fill: '#0e0e13', opacity: .82, stroke: col, 'stroke-opacity': .5 }, svg); text(svg, 364, 38, names.length > 1 || names[0] !== 'residents all night' ? 'LINE-UP' : 'ALL NIGHT', { fill: col, 'font-size': 9, 'letter-spacing': '.2em', 'font-weight': 700 }); names.forEach((nm, i) => text(svg, 364, 56 + i * 19, nm.toUpperCase().slice(0, 28), { fill: '#ebebf1', 'font-size': 11, 'font-family': 'Space Grotesk, sans-serif', 'font-weight': 600 }));
    text(svg, 24, 24, (TYPE_LABEL[n.type] || '').toUpperCase() + ' · FORTYYEARSOF.DANCE · CC BY-SA', { fill: '#8f8fa0', 'font-size': 8, 'letter-spacing': '.16em' }); },
  download(n, kind){ const svg = document.getElementById('flyerSvg'); if (!svg) return; const clone = svg.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', 1200); clone.setAttribute('height', 800); clone.querySelectorAll('text').forEach(t => { if (!t.getAttribute('font-family')) t.setAttribute('font-family', 'JetBrains Mono, monospace'); }); const src = new XMLSerializer().serializeToString(clone); const name = 'flyer-' + n.id; const msg = document.querySelector('.flyerbox .fmsg');
    if (kind === 'svg'){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' })); a.download = name + '.svg'; a.click(); return; }
    const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 1200, 800); c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name + '.png'; a.click(); }); }; img.onerror = () => { if (msg) msg.textContent = 'PNG export blocked here — use SVG'; }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src); }
};

/* ---------- audiobook: the browser reads the page ---------- */
window.Reader = {
  on: false, queue: [], i: 0, bed: true,
  voice(){ const vs = speechSynthesis.getVoices(); return vs.find(v => /en[-_]GB/i.test(v.lang) && /natural|neural|premium|enhanced/i.test(v.name)) || vs.find(v => /en[-_]GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || vs[0]; },
  items(){ const page = document.querySelector('.page.show'); if (!page) return []; return [...page.querySelectorAll('h2, .lede, h3, p, li, .framing p')].filter(e => !e.closest('.card, .pg, .morph, .margin-note, .pagenav, .forks, .chips, .runhead, .flyerbox, .rels, template') && e.textContent.trim().length > 2 && !e.classList.contains('cap') && !e.classList.contains('kicker')).filter((e, i, a) => !a.some((o, j) => j < i && o.contains(e))); },
  toggle(){ this.on ? this.stop() : this.start(); },
  start(){ if (!('speechSynthesis' in window)){ alert('This browser has no speech voices.'); return; } this.queue = this.items(); if (!this.queue.length) return; this.on = true; this.i = 0; document.getElementById('readBtn').textContent = '■ Reading'; document.getElementById('readBtn').classList.add('on');
    if (this.bed){ const g = document.querySelector('.page.show .pgbox'); if (g && g._grid && typeof PatternGrid !== 'undefined'){ PatternGrid.play(g._grid); Mixer.demoDeck.setLevel(0.22); } }
    this.speak(); },
  speak(){ if (!this.on) return; if (this.i >= this.queue.length){ this.stop(); return; } document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); const e = this.queue[this.i]; e.classList.add('reading'); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); const u = new SpeechSynthesisUtterance(e.textContent.replace(/\s+/g, ' ').trim()); const v = this.voice(); if (v) u.voice = v; u.rate = 1.0; u.pitch = 1; u.onend = () => { if (this.on){ this.i++; setTimeout(() => this.speak(), e.tagName === 'H2' || e.tagName === 'H3' ? 350 : 120); } }; u.onerror = () => { this.fails = (this.fails || 0) + 1; if (this.fails > 3){ this.stop(); return; } if (this.on){ this.i++; this.speak(); } }; u.onstart = () => { this.fails = 0; }; speechSynthesis.cancel(); speechSynthesis.speak(u); },
  stop(){ this.on = false; try { speechSynthesis.cancel(); } catch (e){} document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); const b = document.getElementById('readBtn'); if (b){ b.textContent = '🔈 Read'; b.classList.remove('on'); } if (typeof PatternGrid !== 'undefined' && PatternGrid.active){ PatternGrid.stop(); if (Mixer.demoDeck) Mixer.demoDeck.setLevel(1); } }
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
  render(y){ const art = document.querySelector(`.page[data-page="y${y}"]`); if (!art) return; const Y = YEARS[y]; if (!Y) return; const idx = y - 1986;
    art.querySelector('.yh2').textContent = Y[0]; art.querySelector('.ylede').innerHTML = Y[1];
    const box = art.querySelector('.yearbody'); if (box.dataset.done) return; box.dataset.done = 1;
    const yrs = n => YearView.years(n); const born = NODES.filter(n => n.type !== 'city' && yrs(n) && yrs(n)[0] === y); const alive = NODES.filter(n => yrs(n) && yrs(n)[0] < y && yrs(n)[1] >= y);
    const byType = {}; born.forEach(n => (byType[n.type] = byType[n.type] || []).push(n)); const order = ['record', 'club', 'event', 'person', 'collective', 'label', 'station', 'genre', 'set', 'machine', 'border'];
    const im = Object.entries(window.IMAGES || {}).find(([k]) => { const n = NODE[k]; return n && yrs(n) && yrs(n)[0] === y && /^(club|event|collective|station)$/.test(n.type); }) || Object.entries(window.IMAGES || {}).find(([k]) => { const n = NODE[k]; return n && yrs(n) && yrs(n)[0] === y; });
    const tl = TL.filter(e => e[0] === y); const rooms = alive.filter(n => n.type === 'club'); const chapters = [...new Set(born.flatMap(n => n.rel.filter(r => r[0] === 'told').map(r => r[1])))];
    box.innerHTML = `<div class="ynav"><span>${y === 1986 ? 'year one' : y === 2026 ? 'forty years on' : 'year ' + (idx + 1)}</span><span>${y > 1986 ? `<a class="xl" href="#years-y${y - 1}">← ${y - 1}</a>` : ''} ${y < 2026 ? `· <a class="xl" href="#years-y${y + 1}">${y + 1} →</a>` : ''}</span></div>
      <div class="ystats"><span><b>${(byType.record || []).length}</b>records</span><span><b>${(byType.club || []).length + (byType.event || []).length}</b>rooms &amp; nights opened</span><span><b>${(byType.person || []).length + (byType.collective || []).length}</b>people arrived</span><span><b>${(byType.label || []).length}</b>labels started</span><span><b>${rooms.length}</b>rooms open this year</span></div>
      ${im ? `<figure class="hero-img"><img src="${im[1].src}" alt="${im[1].title.replace('File:', '')}" loading="lazy"><figcaption>${NODE[im[0]].title} (${NODE[im[0]].years}) · ${im[1].title.replace('File:', '').replace(/\.(jpe?g|png)$/i, '')} · ${im[1].author} · <a href="${im[1].page}" target="_blank" rel="noopener">${im[1].license}</a></figcaption></figure>` : ''}
      <div class="grid2"><div>
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
window.PageHooks.forty = () => { const box = document.getElementById('fortyLists'); if (!box || box.dataset.done) return; box.dataset.done = 1; Object.entries(FORTY).forEach(([title, ids]) => { const items = ids.filter(id => NODE[id]).slice(0, 40); const d = document.createElement('div'); d.className = 'card'; d.style.marginBottom = '14px'; d.innerHTML = `<h3>${title}</h3><ol class="fortylist">${items.map(id => `<li><a class="xl" href="#${id}">${NODE[id].title}</a><small>${NODE[id].years}</small></li>`).join('')}</ol>${items.length < 40 ? `<p class="cap">${items.length} so far — the rest are pages still to be written.</p>` : ''}`; box.appendChild(d); }); };
