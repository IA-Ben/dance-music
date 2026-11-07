/* ===================================================================
   HARDWARE PANELS — working reconstructions of the machines.
   Original, stylised front panels (no makers' marks) whose controls drive
   the book's own synthesiser: the knobs change the live parameters of the
   demo deck, the step buttons edit its pattern.
   =================================================================== */
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = { hz: v => Math.round(v) + ' Hz', ms: v => Math.round(v * 1000) + ' ms', pc: v => Math.round(v * 100) + '%', x: v => v.toFixed(1), n: v => Math.round(v), bpm: v => Math.round(v) + ' bpm', st: v => (v > 0 ? '+' : '') + Math.round(v) + ' st' };

  /* ---------- controls ---------- */
  const knob = (id, label, min, max, val, f, log) => `<div class="hwk" data-id="${id}" data-min="${min}" data-max="${max}" data-val="${val}" data-f="${f}" data-log="${log ? 1 : 0}"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="hwkbody"/><line x1="20" y1="20" x2="20" y2="6" class="hwkp"/></svg><span class="hwkl">${label}</span><span class="hwkv"></span></div>`;
  const slider = (id, label, min, max, val, f) => `<div class="hws" data-id="${id}" data-min="${min}" data-max="${max}" data-val="${val}" data-f="${f}"><div class="hwst"><i></i></div><span class="hwkl">${label}</span><span class="hwkv"></span></div>`;
  const pos = (el) => { const min = +el.dataset.min, max = +el.dataset.max, v = +el.dataset.val; const r = el.dataset.log === '1' ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min); return clamp(r, 0, 1); };
  const setPos = (el, r, cb) => { r = clamp(r, 0, 1); const min = +el.dataset.min, max = +el.dataset.max; const v = el.dataset.log === '1' ? min * Math.pow(max / min, r) : min + (max - min) * r; el.dataset.val = v; paint(el); cb && cb(el.dataset.id, v); };
  const paint = el => { const r = pos(el); const v = +el.dataset.val; const vEl = el.querySelector('.hwkv'); if (vEl) vEl.textContent = (fmt[el.dataset.f] || fmt.x)(v); const p = el.querySelector('.hwkp'); if (p){ const a = (-135 + 270 * r) * Math.PI / 180; p.setAttribute('x2', 20 + Math.sin(a) * 14); p.setAttribute('y2', 20 - Math.cos(a) * 14); } const s = el.querySelector('.hwst i'); if (s) s.style.bottom = (r * 100) + '%'; };
  const wireControls = (root, cb) => {
    root.querySelectorAll('.hwk, .hws').forEach(el => { paint(el); let y0 = null, r0 = 0;
      el.addEventListener('pointerdown', e => { y0 = e.clientY; r0 = pos(el); el.setPointerCapture(e.pointerId); e.preventDefault(); });
      el.addEventListener('pointermove', e => { if (y0 === null) return; setPos(el, r0 + (y0 - e.clientY) / 120, cb); });
      el.addEventListener('pointerup', () => { y0 = null; }); el.addEventListener('pointercancel', () => { y0 = null; });
      el.addEventListener('wheel', e => { e.preventDefault(); setPos(el, pos(el) - Math.sign(e.deltaY) * 0.04, cb); }, { passive: false });
      el.addEventListener('dblclick', () => { setPos(el, pos(el), cb); });
    });
  };

  /* ---------- transport: a private state object driven by PatternGrid's clock ---------- */
  const mkState = (box, preset) => { const st = { genre: preset, pat: {}, mute: {}, playing: false, step: 0, nextTime: 0, timer: null, queue: [], box, over: {}, levels: {}, render(){ box.querySelectorAll('.hwrun').forEach(b => b.textContent = st.playing ? 'stop' : 'run'); } }; const G = PRESET(preset); DECK_LAYERS.forEach(([lid]) => { st.pat[lid] = parsePat(G.pat[lid] || E16); st.mute[lid] = false; }); box._grid = st; return st; };
  const seed = (st, lid, pat) => { if (!st.pat[lid].some(v => v)) st.pat[lid] = parsePat(pat); };
  const deck = () => Mixer.ensureDemo();
  const applyOver = st => { const dk = deck(); Object.entries(st.over).forEach(([k, v]) => { if (v && typeof v === 'object' && !Array.isArray(v)){ dk.P[k] = Object.assign({}, dk.P[k] || {}, v); } else dk.P[k] = v; }); Object.entries(st.levels).forEach(([lid, lv]) => { if (dk.tr[lid]) dk.tr[lid].gain.setTargetAtTime(lv, dk.ch.c.currentTime, 0.02); }); };
  const run = st => { if (st.playing){ PatternGrid.stop(); return; } PatternGrid.play(st); applyOver(st); st.render(); };
  const setParam = (st, path, v) => { const [k, sub] = path.split('.'); if (sub){ st.over[k] = st.over[k] || {}; st.over[k][sub] = v; } else st.over[k] = v; if (st.playing) applyOver(st); };
  const setLevel = (st, lid, v) => { st.levels[lid] = v; if (st.playing) applyOver(st); };
  const hit = (lid, st) => { const ch = AudioCore.get(); const dk = deck(); if (!st.playing){ dk.load(st.genre); applyOver(st); } const t = ch.c.currentTime + 0.02; const P = dk.P, ch2 = dk.chain; const d = 60 / PRESET(st.genre).bpm / 4;
    ({ kick: () => { S.kick(ch2, t, P.kick); }, sub: () => S.sub(ch2, t, { freq: P.root, ...P.sub }), off: () => S.off(ch2, t, { freq: P.root * 2, cutoff: P.offCutoff }), acid: () => S.acid(ch2, t, { ...P.acid, freq: P.root * 2, accent: true }), stab: () => S.stab(ch2, t, { root: P.root * 4, ...P.stab }), hoover: () => S.hoover(ch2, t, { root: P.root * 4, ...(P.hoover || {}) }), bleep: () => S.bleep(ch2, t, { freq: P.root * 8 }), hatc: () => S.hat(ch2, t, { decay: P.hat.decayC, tone: P.hat.tone, level: 0.35 }), hato: () => S.hat(ch2, t, { open: true, decay: P.hat.decayO, tone: P.hat.tone }), ride: () => S.hat(ch2, t, { open: true, decay: 0.42, tone: 7500, level: 0.2, dest: dk.tr.ride }), clap: () => S.clap(ch2, t, P.clap || {}), snare: () => S.snare(ch2, t, P.snare || {}), tom: () => S.tom(ch2, t, { pitch: 200, ...(P.tom || {}) }), metal: () => S.metal(ch2, t, { ratio: 1.41 }), shaker: () => S.shaker(ch2, t, { level: 0.4 }), reese: () => S.reese(ch2, t, { freq: P.root, dur: d * 4, ...(P.reese || {}) }), super: () => S.supersaw(ch2, t, { freq: P.root * 8, gate: d * 2, ...(P.super || {}) }), piano: () => S.piano(ch2, t, { root: P.root * 4, chord: P.pianoChord || [0, 3, 7, 10] }), organ: () => S.organ(ch2, t, { freq: P.root * 2, dur: d * 2 }) }[lid] || (() => {}))(); };
  const stepRow = (lid, cls) => `<div class="hwsteps" data-layer="${lid}">${Array.from({ length: 16 }, (_, i) => `<button class="hwst ${cls || ''} g${Math.floor(i / 4)}" data-i="${i}"><i></i>${i + 1}</button>`).join('')}</div>`;
  const paintSteps = (box, st) => { box.querySelectorAll('.hwsteps').forEach(row => { const lid = row.dataset.layer; row.querySelectorAll('.hwst').forEach(b => { const v = st.pat[lid][+b.dataset.i]; b.classList.toggle('on', v === 1); b.classList.toggle('acc', v === 2); b.classList.toggle('sl', v === 3); }); }); };
  const wireSteps = (box, st, cycle) => { box.querySelectorAll('.hwsteps .hwst').forEach(b => b.onclick = () => { const lid = b.closest('.hwsteps').dataset.layer; const i = +b.dataset.i; const cur = st.pat[lid][i]; st.pat[lid][i] = cycle ? (cur + 1) % 4 : (cur ? 0 : 1); paintSteps(box, st); }); };
  const wireRun = (box, st) => { box.querySelectorAll('.hwrun').forEach(b => b.onclick = () => run(st)); };

  /* ---------- panel types ---------- */
  const P = {};
  // DRUM MACHINE: instrument select, one visible step row, per-voice knobs
  P.drum = (box, m, o) => {
    const st = mkState(box, o.preset); const kit = o.kit || [['kick', 'BD'], ['snare', 'SD'], ['clap', 'CP'], ['hatc', 'CH'], ['hato', 'OH'], ['tom', 'LT'], ['metal', 'CB'], ['shaker', 'MA']];
    const G = PRESET(o.preset);
    box.innerHTML = `<div class="hw hwdrum ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow"><div class="hwsect"><em>bass drum</em>${knob('kick.pitchEnd', 'tune', 35, 90, G.kick.pitchEnd, 'hz')}${knob('kick.ampDecay', 'decay', 0.08, 1.2, G.kick.ampDecay, 'ms')}${knob('kick.click', 'attack', 0, 1, G.kick.click, 'pc')}${knob('kick.drive', 'drive', 1, 12, G.kick.drive, 'x')}</div>
      <div class="hwsect"><em>snare · clap</em>${knob('snare.decay', 'snappy', 0.06, 0.4, 0.18, 'ms')}${knob('clap.decay', 'clap', 0.08, 0.5, 0.22, 'ms')}</div>
      <div class="hwsect"><em>hats</em>${knob('hat.decayC', 'closed', 0.015, 0.12, G.hat.decayC, 'ms')}${knob('hat.decayO', 'open', 0.08, 0.6, G.hat.decayO, 'ms')}${knob('hat.tone', 'tone', 5000, 14000, G.hat.tone, 'hz')}</div>
      <div class="hwsect"><em>tempo · swing</em>${knob('bpm', 'tempo', 90, 190, G.bpm, 'bpm')}${knob('swing', 'shuffle', 0, 0.3, G.swing, 'pc')}</div></div>
      <div class="hwinst">${kit.map(([lid, lab]) => `<button class="hwi" data-lid="${lid}"><i></i>${lab}<small>${(DECK_LAYERS.find(d => d[0] === lid) || [, lid])[1]}</small></button>`).join('')}</div>
      ${stepRow(kit[0][0])}
      <div class="hwfoot"><button class="play hwrun">run</button><span class="cap">Click an instrument, then the sixteen buttons to write its pattern; hold nothing — this is step-time. Drag a knob up or down.</span></div></div>`;
    let cur = kit[0][0];
    const select = lid => { cur = lid; box.querySelectorAll('.hwi').forEach(b => b.classList.toggle('on', b.dataset.lid === lid)); box.querySelector('.hwsteps').dataset.layer = lid; paintSteps(box, st); };
    box.querySelectorAll('.hwi').forEach(b => { b.onclick = () => { select(b.dataset.lid); hit(b.dataset.lid, st); }; });
    wireSteps(box, st); wireRun(box, st); select(cur);
    wireControls(box, (id, v) => { if (id === 'bpm'){ const dk = deck(); st.bpmOverride = v; if (st.playing){ PRESET(st.genre).bpm; } setParam(st, 'bpmOverride', v); } else setParam(st, id, v); });
  };
  // BASS SYNTH: 303-style knobs + note/accent/slide sequencer
  P.bass = (box, m, o) => {
    const st = mkState(box, o.preset); seed(st, 'acid', 'x..x..x.x..A..s.'); const G = PRESET(o.preset); const A = G.acid; const notes = (G.acidNotes || []).slice();
    const square = o.wave === 'square'; st.over.acid = { wave: square ? 'square' : 'sawtooth' };
    box.innerHTML = `<div class="hw hwbass ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow"><div class="hwsect"><em>vco</em><div class="hwsw"><button class="hwwave ${square ? '' : 'on'}" data-w="sawtooth">saw</button><button class="hwwave ${square ? 'on' : ''}" data-w="square">square</button></div>${knob('tune', 'tuning', -12, 12, 0, 'st')}</div>
      <div class="hwsect"><em>vcf</em>${knob('acid.cutoff', 'cut off', 120, 4000, A.cutoff, 'hz', 1)}${knob('acid.res', 'resonance', 0.5, 25, A.res, 'x')}${knob('acid.env', 'env mod', 100, 6000, A.env, 'hz', 1)}${knob('acid.decay', 'decay', 0.05, 1.2, A.decay, 'ms')}</div>
      <div class="hwsect"><em>vca</em>${knob('lv', 'volume', 0, 1, G.levels.acid != null ? G.levels.acid : 0.8, 'pc')}${knob('bpm', 'tempo', 90, 190, G.bpm, 'bpm')}</div></div>
      <div class="hwseq"><div class="hwseqlbl">note</div><div class="hwnotes">${notes.map((n, i) => `<div class="hwn" data-i="${i}"><button class="hwnu">▲</button><b>${n}</b><button class="hwnd">▼</button></div>`).join('')}</div>
      <div class="hwseqlbl">step · accent · slide</div>${stepRow('acid', 'cyc')}</div>
      <div class="hwfoot"><button class="play hwrun">run</button><button class="play hwhit">hit</button><span class="cap">Each step cycles off → note → accent → slide. The sequencer was the hard part of the real one; this one is easier.</span></div></div>`;
    wireSteps(box, st, true); wireRun(box, st); paintSteps(box, st);
    box.querySelector('.hwhit').onclick = () => hit('acid', st);
    box.querySelectorAll('.hwwave').forEach(b => b.onclick = () => { box.querySelectorAll('.hwwave').forEach(x => x.classList.remove('on')); b.classList.add('on'); setParam(st, 'acid.wave', b.dataset.w); });
    box.querySelectorAll('.hwn').forEach(el => { const i = +el.dataset.i; const upd = () => { el.querySelector('b').textContent = notes[i]; st.over.acidNotes = notes; if (st.playing) applyOver(st); }; el.querySelector('.hwnu').onclick = () => { notes[i] = clamp(notes[i] + 1, -12, 24); upd(); }; el.querySelector('.hwnd').onclick = () => { notes[i] = clamp(notes[i] - 1, -12, 24); upd(); }; });
    wireControls(box, (id, v) => { if (id === 'lv') setLevel(st, 'acid', v); else if (id === 'tune'){ st.over.root = G.key[1] * Math.pow(2, v / 12); if (st.playing) applyOver(st); } else if (id === 'bpm') setParam(st, 'bpmOverride', v); else setParam(st, id, v); });
  };
  // POLY SYNTH: slider panel driving the stab chord (or the hoover)
  P.poly = (box, m, o) => {
    const st = mkState(box, o.preset); seed(st, o.mode === 'hoover' ? 'hoover' : 'stab', o.mode === 'hoover' ? 'x.......x.....x.' : '..x...x...x...x.'); const G = PRESET(o.preset); const Sb = G.stab; const hoov = o.mode === 'hoover';
    const chords = [['min7', [0, 3, 7, 10]], ['min9', [0, 3, 7, 10, 14]], ['maj7', [0, 4, 7, 11]], ['sus', [0, 5, 7, 12]], ['5th', [0, 7, 12]], ['dim', [0, 3, 6, 9]]];
    box.innerHTML = `<div class="hw hwpoly ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow hwsliders">
        <div class="hwsect"><em>dco</em>${slider(hoov ? 'hoover.spread' : 'stab.detune', 'detune', hoov ? 0 : 0, hoov ? 3 : 40, hoov ? 1 : Sb.detune, 'x')}${slider('tune', 'tune', -12, 12, 0, 'st')}</div>
        <div class="hwsect"><em>vcf</em>${hoov ? '' : slider('stab.cutoff', 'freq', 150, 6000, Sb.cutoff, 'hz')}${hoov ? '' : slider('stab.env', 'env', 0, 6000, Sb.env, 'hz')}${slider(hoov ? 'hoover.decay' : 'stab.decay', 'decay', 0.08, 2, hoov ? 0.45 : Sb.decay, 'ms')}</div>
        <div class="hwsect"><em>${hoov ? 'vca' : 'chorus · vca'}</em>${hoov ? '' : slider('stab.verb', 'chorus', 0, 1.2, Sb.verb, 'pc')}${slider('lv', 'level', 0, 1, G.levels[hoov ? 'hoover' : 'stab'] != null ? G.levels[hoov ? 'hoover' : 'stab'] : 0.8, 'pc')}</div>
        <div class="hwsect hwchords"><em>${hoov ? 'the patch' : 'chord'}</em>${hoov ? '<p class="cap">The factory "WhatThe" patch: four saws a quarter-tone apart, pitch bent down at the start. Push detune up for 1991.</p>' : chords.map(([n, c]) => `<button class="hwc ${JSON.stringify(c) === JSON.stringify(Sb.chord) ? 'on' : ''}" data-c="${c.join(',')}">${n}</button>`).join('')}</div>
      </div>
      <div class="hwkeys">${Array.from({ length: 13 }, (_, i) => `<button class="hwkey ${[1, 3, 6, 8, 10].includes(i) ? 'blk' : ''}" data-n="${i}"></button>`).join('')}</div>
      ${stepRow(hoov ? 'hoover' : 'stab')}
      <div class="hwfoot"><button class="play hwrun">run</button><span class="cap">Sliders drag up and down; the keys play the ${hoov ? 'patch' : 'chord'} from the root; the row writes where it falls in the bar.</span></div></div>`;
    wireSteps(box, st); wireRun(box, st); paintSteps(box, st);
    box.querySelectorAll('.hwc').forEach(b => b.onclick = () => { box.querySelectorAll('.hwc').forEach(x => x.classList.remove('on')); b.classList.add('on'); setParam(st, 'stab.chord', b.dataset.c.split(',').map(Number)); });
    box.querySelectorAll('.hwkey').forEach(k => k.onpointerdown = () => { const ch = AudioCore.get(); const dk = deck(); if (!st.playing){ dk.load(st.genre); applyOver(st); } const t = ch.c.currentTime + 0.02; const root = (st.over.root || G.key[1]) * 4 * Math.pow(2, +k.dataset.n / 12); if (hoov) S.hoover(dk.chain, t, { root, ...(dk.P.hoover || {}) }); else S.stab(dk.chain, t, { root, ...dk.P.stab }); k.classList.add('on'); setTimeout(() => k.classList.remove('on'), 150); });
    wireControls(box, (id, v) => { if (id === 'lv') setLevel(st, hoov ? 'hoover' : 'stab', v); else if (id === 'tune'){ st.over.root = G.key[1] * Math.pow(2, v / 12); if (st.playing) applyOver(st); } else setParam(st, id, v); });
  };
  // SUPERSAW: detune spread, voices, cutoff, gate, and the lead's notes
  P.super = (box, m, o) => {
    const st = mkState(box, o.preset); seed(st, 'super', 'x.x.x.x.x.x.x.x.'); const G = PRESET(o.preset); const notes = (G.leadNotes || G.acidNotes).slice();
    box.innerHTML = `<div class="hw hwsuper ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow"><div class="hwsect"><em>supersaw osc</em>${knob('super.voices', 'voices', 1, 7, 7, 'n')}${knob('super.spread', 'detune', 0, 3, 1, 'x')}${knob('tune', 'tune', -12, 12, 0, 'st')}</div>
      <div class="hwsect"><em>filter · amp</em>${knob('super.cutoff', 'cutoff', 300, 9000, 2600, 'hz', 1)}${knob('lv', 'level', 0, 1, G.levels.super != null ? G.levels.super : 0.8, 'pc')}${knob('bpm', 'tempo', 100, 190, G.bpm, 'bpm')}</div></div>
      <div class="hwseq"><div class="hwseqlbl">lead note (semitones from the root)</div><div class="hwnotes">${notes.map((n, i) => `<div class="hwn" data-i="${i}"><button class="hwnu">▲</button><b>${n}</b><button class="hwnd">▼</button></div>`).join('')}</div><div class="hwseqlbl">gate</div>${stepRow('super')}</div>
      <div class="hwfoot"><button class="play hwrun">run</button><button class="play hwhit">hit</button><span class="cap">One voice is a saw; seven, spread, is the sound of 1999. Turn voices down to hear what the trick is.</span></div></div>`;
    wireSteps(box, st); wireRun(box, st); paintSteps(box, st);
    box.querySelector('.hwhit').onclick = () => hit('super', st);
    box.querySelectorAll('.hwn').forEach(el => { const i = +el.dataset.i; const upd = () => { el.querySelector('b').textContent = notes[i]; st.over.leadNotes = notes; if (st.playing) applyOver(st); }; el.querySelector('.hwnu').onclick = () => { notes[i] = clamp(notes[i] + 1, -12, 24); upd(); }; el.querySelector('.hwnd').onclick = () => { notes[i] = clamp(notes[i] - 1, -12, 24); upd(); }; });
    wireControls(box, (id, v) => { if (id === 'lv') setLevel(st, 'super', v); else if (id === 'tune'){ st.over.root = G.key[1] * Math.pow(2, v / 12); if (st.playing) applyOver(st); } else if (id === 'bpm') setParam(st, 'bpmOverride', v); else if (id === 'super.voices') setParam(st, id, Math.round(v)); else setParam(st, id, v); });
  };
  // REESE: the detuned-saw bass of jungle, drum & bass
  P.reese = (box, m, o) => {
    const st = mkState(box, o.preset); seed(st, 'reese', 'x.......x...x...'); const G = PRESET(o.preset);
    box.innerHTML = `<div class="hw hwbass ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow"><div class="hwsect"><em>two saws</em>${knob('reese.spread', 'detune', 0, 4, 1, 'x')}${knob('tune', 'tune', -12, 12, 0, 'st')}</div><div class="hwsect"><em>filter · drive</em>${knob('reese.cutoff', 'cutoff', 120, 2500, 420, 'hz', 1)}${knob('reese.drive', 'drive', 1, 12, 3, 'x')}${knob('lv', 'level', 0, 1, G.levels.reese != null ? G.levels.reese : 0.8, 'pc')}</div></div>
      ${stepRow('reese')}
      <div class="hwfoot"><button class="play hwrun">run</button><button class="play hwhit">hit</button><span class="cap">Two sawtooths a few cents apart beat against each other; the beating is the reese. Detune wider and it wobbles faster.</span></div></div>`;
    wireSteps(box, st); wireRun(box, st); paintSteps(box, st); box.querySelector('.hwhit').onclick = () => hit('reese', st);
    wireControls(box, (id, v) => { if (id === 'lv') setLevel(st, 'reese', v); else if (id === 'tune'){ st.over.root = G.key[1] * Math.pow(2, v / 12); if (st.playing) applyOver(st); } else setParam(st, id, v); });
  };
  // SAMPLER / PADS: pads fire the book's one-shots; pitch and 'stretch' knobs; swing
  P.pads = (box, m, o) => {
    const st = mkState(box, o.preset); const G = PRESET(o.preset);
    const pads = o.pads || [['kick', 'kick'], ['snare', 'snare'], ['clap', 'clap'], ['hatc', 'hat'], ['hato', 'open hat'], ['tom', 'tom'], ['metal', 'metal'], ['shaker', 'shaker'], ['stab', 'chord'], ['piano', 'piano'], ['organ', 'organ'], ['sub', 'sub'], ['reese', 'reese'], ['hoover', 'hoover'], ['bleep', 'bleep'], ['super', 'saw']];
    box.innerHTML = `<div class="hw hwpads ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow"><div class="hwpadgrid">${pads.map(([lid, lab]) => `<button class="hwpad" data-lid="${lid}"><i></i>${lab}</button>`).join('')}</div>
      <div class="hwsect hwpadk"><em>${o.mpc ? 'timing' : 'sample'}</em>${knob('swing', 'swing', 0, 0.33, G.swing, 'pc')}${knob('tom.pitch', 'pitch', 80, 600, 200, 'hz', 1)}${knob('snare.decay', 'stretch', 0.05, 0.6, 0.18, 'ms')}${knob('bpm', 'tempo', 90, 190, G.bpm, 'bpm')}<p class="cap">${o.note || ''}</p></div></div>
      <div class="hwinst">${pads.slice(0, 8).map(([lid, lab]) => `<button class="hwi" data-lid="${lid}"><i></i>${lab}</button>`).join('')}</div>${stepRow('kick')}
      <div class="hwfoot"><button class="play hwrun">run</button><span class="cap">Pads play; the row below sequences the selected one. Swing is the MPC's whole reputation: 54–66%.</span></div></div>`;
    box.querySelectorAll('.hwpad').forEach(b => b.onpointerdown = () => { hit(b.dataset.lid, st); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); });
    const select = lid => { box.querySelectorAll('.hwi').forEach(b => b.classList.toggle('on', b.dataset.lid === lid)); box.querySelector('.hwsteps').dataset.layer = lid; paintSteps(box, st); };
    box.querySelectorAll('.hwi').forEach(b => b.onclick = () => select(b.dataset.lid)); select('kick');
    wireSteps(box, st); wireRun(box, st);
    wireControls(box, (id, v) => { if (id === 'bpm') setParam(st, 'bpmOverride', v); else setParam(st, id, v); });
  };
  // CLIP LAUNCHER: scenes × tracks, quantised to the bar
  P.clips = (box, m, o) => {
    const st = mkState(box, o.preset); const G = PRESET(o.preset);
    const tracks = [['kick', 'Drums'], ['hatc', 'Hats'], ['sub', 'Bass'], ['stab', 'Chords'], ['bleep', 'Hook'], ['clap', 'Clap']].filter(([lid]) => st.pat[lid].some(v => v));
    const extra = { hato: 'hatc', rumble: 'kick', ride: 'hatc', off: 'sub', shaker: 'hatc', tom: 'clap', metal: 'bleep', snare: 'clap', super: 'stab', piano: 'stab', organ: 'sub', reese: 'sub', hoover: 'stab', acid: 'sub' };
    const groupOf = lid => tracks.some(t => t[0] === lid) ? lid : (extra[lid] && tracks.some(t => t[0] === extra[lid]) ? extra[lid] : null);
    const scenes = 4; const on = {}; tracks.forEach(([lid]) => on[lid] = -1);
    box.innerHTML = `<div class="hw hwclips ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwsession"><div class="hwtrk hwtrkh"><span></span>${Array.from({ length: scenes }, (_, s) => `<button class="hwscene" data-s="${s}">▶ scene ${s + 1}</button>`).join('')}</div>
      ${tracks.map(([lid, name]) => `<div class="hwtrk" data-lid="${lid}"><span>${name}</span>${Array.from({ length: scenes }, (_, s) => `<button class="hwclip" data-lid="${lid}" data-s="${s}">${s === 0 ? '▶' : s === 1 ? '▶ ½' : s === 2 ? '▶ fill' : '■'}</button>`).join('')}</div>`).join('')}</div>
      <div class="hwrow"><div class="hwsect"><em>master</em>${knob('bpm', 'tempo', 100, 150, G.bpm, 'bpm')}${knob('swing', 'groove', 0, 0.25, G.swing, 'pc')}</div><p class="cap" style="font-family:inherit;font-size:10.5px;color:#9a9aab">Clips launch on the next bar, like the real thing: column one is the full pattern, two is half of it, three a fill, four stops the track. A scene fires a whole row. Live\'s trick was that this could be performed.</p></div>
      <div class="hwfoot"><button class="play hwrun">run</button></div></div>`;
    const base = {}; DECK_LAYERS.forEach(([lid]) => base[lid] = st.pat[lid].slice());
    const applyClip = (lid, s) => { DECK_LAYERS.forEach(([l]) => { if (groupOf(l) !== lid) return; const b = base[l]; st.pat[l] = s === 0 ? b.slice() : s === 1 ? b.map((v, i) => i < 8 ? v : 0) : s === 2 ? b.map((v, i) => i >= 12 ? (i % 2 ? 1 : v || 1) : v) : b.map(() => 0); }); on[lid] = s; box.querySelectorAll(`.hwclip[data-lid="${lid}"]`).forEach(c => c.classList.toggle('on', +c.dataset.s === s)); };
    const queue = []; const schedule = fn => { if (!st.playing){ fn(); return; } queue.push(fn); };
    setInterval(() => { if (st.playing && st.step === 15 && queue.length){ const q = queue.splice(0); setTimeout(() => q.forEach(f => f()), (60 / (st.over.bpmOverride || G.bpm) / 4) * 1000 * 0.9); } }, 20);
    box.querySelectorAll('.hwclip').forEach(c => c.onclick = () => { c.classList.add('q'); schedule(() => { c.classList.remove('q'); applyClip(c.dataset.lid, +c.dataset.s); }); });
    box.querySelectorAll('.hwscene').forEach(b => b.onclick = () => { const s = +b.dataset.s; tracks.forEach(([lid]) => box.querySelector(`.hwclip[data-lid="${lid}"][data-s="${s}"]`).click()); });
    tracks.forEach(([lid]) => applyClip(lid, 0)); wireRun(box, st);
    wireControls(box, (id, v) => { if (id === 'bpm') setParam(st, 'bpmOverride', v); else setParam(st, id, v); });
  };
  // PIANO ROLL / STEP SEQUENCER: 16 steps × 13 notes editing the bass line
  P.roll = (box, m, o) => {
    const st = mkState(box, o.preset); const G = PRESET(o.preset); const notes = (G.acidNotes || []).slice(); const lid = o.layer || 'acid';
    const N = 13; const rows = Array.from({ length: N }, (_, r) => 12 - r);
    box.innerHTML = `<div class="hw hwroll ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrollgrid" style="--n:${N}">${rows.map(n => `<div class="hwrr ${[1, 3, 6, 8, 10].includes(n % 12) ? 'blk' : ''}"><span>${n}</span>${Array.from({ length: 16 }, (_, i) => `<button class="hwcell" data-i="${i}" data-n="${n}"></button>`).join('')}</div>`).join('')}</div>
      <div class="hwrow"><div class="hwsect"><em>transport</em>${knob('bpm', 'tempo', 90, 190, G.bpm, 'bpm')}${knob('swing', 'swing', 0, 0.3, G.swing, 'pc')}</div><p class="cap">${o.note || 'Click a cell to put a note on that step; click it again to take it off. The sequencer is the one instrument every studio in this book had.'}</p></div>
      <div class="hwfoot"><button class="play hwrun">run</button></div></div>`;
    const paintRoll = () => box.querySelectorAll('.hwcell').forEach(c => c.classList.toggle('on', st.pat[lid][+c.dataset.i] > 0 && notes[+c.dataset.i] === +c.dataset.n));
    box.querySelectorAll('.hwcell').forEach(c => c.onclick = () => { const i = +c.dataset.i, n = +c.dataset.n; if (st.pat[lid][i] && notes[i] === n) st.pat[lid][i] = 0; else { st.pat[lid][i] = 1; notes[i] = n; } st.over.acidNotes = notes; if (lid === 'super') st.over.leadNotes = notes; if (st.playing) applyOver(st); paintRoll(); });
    paintRoll(); wireRun(box, st); st.over.acidNotes = notes;
    wireControls(box, (id, v) => { if (id === 'bpm') setParam(st, 'bpmOverride', v); else setParam(st, id, v); });
  };
  // MODULAR: three modules and patch points; an LFO on the filter
  P.modular = (box, m, o) => {
    const st = mkState(box, o.preset); seed(st, 'acid', 'x.x.x.x.x.x.x.x.'); const G = PRESET(o.preset); const A = G.acid; let lfo = { rate: 0.25, amt: 0, on: false }, timer = null;
    box.innerHTML = `<div class="hw hwmod ${o.skin || ''}"><div class="hwtitle"><b>${o.name}</b><span>${o.sub}</span></div>
      <div class="hwrow hwmods">
        <div class="hwsect hwmodule"><em>VCO</em><div class="hwsw"><button class="hwwave on" data-w="sawtooth">saw</button><button class="hwwave" data-w="square">sq</button></div>${knob('tune', 'tune', -12, 12, 0, 'st')}<div class="hwjack" data-j="vco">out ●</div></div>
        <div class="hwsect hwmodule"><em>VCF</em>${knob('acid.cutoff', 'cutoff', 120, 4000, A.cutoff, 'hz', 1)}${knob('acid.res', 'res', 0.5, 25, A.res, 'x')}<div class="hwjack" data-j="vcf">cv in ●</div></div>
        <div class="hwsect hwmodule"><em>LFO</em>${knob('lfo.rate', 'rate', 0.03, 8, 0.25, 'x', 1)}${knob('lfo.amt', 'depth', 0, 1, 0.5, 'pc')}<div class="hwjack" data-j="lfo">out ●</div></div>
        <div class="hwsect hwmodule"><em>ENV · VCA</em>${knob('acid.env', 'env → vcf', 100, 6000, A.env, 'hz', 1)}${knob('acid.decay', 'decay', 0.05, 1.5, A.decay, 'ms')}${knob('lv', 'level', 0, 1, 0.7, 'pc')}</div>
      </div>
      <div class="hwpatch"><button class="hwcable" data-c="lfo-vcf">patch LFO → VCF</button><span class="cap">With the cable in, the LFO sweeps the filter at its own rate against the 4/4 — the drift the hypnotic records are made of. Patch and unpatch while it runs.</span></div>
      ${stepRow('acid', 'cyc')}
      <div class="hwfoot"><button class="play hwrun">run</button><button class="play hwhit">hit</button></div></div>`;
    wireSteps(box, st, true); wireRun(box, st); paintSteps(box, st); box.querySelector('.hwhit').onclick = () => hit('acid', st);
    box.querySelectorAll('.hwwave').forEach(b => b.onclick = () => { box.querySelectorAll('.hwwave').forEach(x => x.classList.remove('on')); b.classList.add('on'); setParam(st, 'acid.wave', b.dataset.w); });
    let baseCut = A.cutoff;
    const tick = () => { if (!lfo.on) return; const dk = deck(); const tnow = dk.ch.c.currentTime; const v = baseCut * Math.pow(2, Math.sin(tnow * lfo.rate * Math.PI * 2) * lfo.amt * 2); st.over.acid = st.over.acid || {}; st.over.acid.cutoff = v; if (st.playing) dk.P.acid.cutoff = v; box.querySelector('.hwjack[data-j="lfo"]').style.opacity = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(tnow * lfo.rate * Math.PI * 2)); };
    box.querySelector('.hwcable').onclick = e => { lfo.on = !lfo.on; e.target.classList.toggle('on', lfo.on); box.classList.toggle('patched', lfo.on); if (lfo.on){ timer = setInterval(tick, 40); } else { clearInterval(timer); setParam(st, 'acid.cutoff', baseCut); } };
    wireControls(box, (id, v) => { if (id === 'lv') setLevel(st, 'acid', v); else if (id === 'tune'){ st.over.root = G.key[1] * Math.pow(2, v / 12); if (st.playing) applyOver(st); } else if (id === 'lfo.rate') lfo.rate = v; else if (id === 'lfo.amt') lfo.amt = v; else if (id === 'acid.cutoff'){ baseCut = v; if (!lfo.on) setParam(st, id, v); } else setParam(st, id, v); });
  };

  /* ---------- which machine gets which panel ---------- */
  const MAP = {
    tr808: ['drum', { name: 'Rhythm composer, 1980', sub: 'analogue drum voices · 16-step write mode', preset: 'Electro 1983', skin: 'skin808', kit: [['kick', 'BD'], ['snare', 'SD'], ['clap', 'CP'], ['hatc', 'CH'], ['hato', 'OH'], ['tom', 'LT'], ['metal', 'CB'], ['shaker', 'MA']] }],
    tr909: ['drum', { name: 'Rhythm composer, 1983', sub: 'analogue drums, sampled cymbals · 16 steps', preset: 'Detroit 1988', skin: 'skin909' }],
    tr707: ['drum', { name: 'Rhythm composer, 1985', sub: 'sampled drums · the Chicago box', preset: 'Chicago acid 1987', skin: 'skin707', kit: [['kick', 'BD'], ['snare', 'SD'], ['clap', 'HC'], ['hatc', 'CH'], ['hato', 'OH'], ['tom', 'LT'], ['metal', 'CB'], ['shaker', 'TB']] }],
    tr606: ['drum', { name: 'Drumatix, 1981', sub: 'the 303\'s companion · seven voices', preset: 'Chicago acid 1987', skin: 'skin606', kit: [['kick', 'BD'], ['snare', 'SD'], ['hatc', 'CH'], ['hato', 'OH'], ['tom', 'LT'], ['metal', 'CY']] }],
    tr8: ['drum', { name: 'Rhythm performer, 2014', sub: 'the 808 and 909 modelled · the revival box', preset: 'Hard techno 2023', skin: 'skin8' }],
    behringer: ['drum', { name: 'Analogue clone, 2019', sub: 'the 808 circuit for a tenth of the price', preset: 'Hard techno 2023', skin: 'skin808' }],
    elektron: ['drum', { name: 'Machinedrum / Octatrack', sub: 'sequencer-first · parameter locks', preset: 'Industrial 2018', skin: 'skinelk', kit: [['kick', 'BD'], ['snare', 'SD'], ['clap', 'CP'], ['hatc', 'CH'], ['hato', 'OH'], ['metal', 'MT'], ['shaker', 'SH'], ['bleep', 'BL']] }],
    sp1200: ['pads', { name: 'Sampling drum machine, 1987', sub: '12-bit · 2.5 seconds of memory', preset: 'UK rave 1991', skin: 'skinsp', note: 'Ten seconds of sampling in total, 26 kHz, 12 bits: the grit is the memory running out.' }],
    tb303: ['bass', { name: 'Bass line, 1981', sub: 'one oscillator, one filter, one sequencer', preset: 'Chicago acid 1987', skin: 'skin303' }],
    'bass-station': ['bass', { name: 'Bass Station, 1993', sub: 'the British 303 · two oscillators', preset: 'Acid techno 1994', skin: 'skinbs' }],
    sh101: ['bass', { name: 'Monosynth, 1982', sub: 'one VCO, a sub-oscillator, a sequencer', preset: 'UK rave 1991', skin: 'skin101', wave: 'square' }],
    mc202: ['roll', { name: 'MicroComposer, 1983', sub: 'the 303\'s sequencer with a 101 inside', preset: 'Chicago acid 1987', skin: 'skin202', note: 'Step-time entry: the MC-202 made you type the notes, then the gates, then the accents, on a calculator keypad. This grid is what it was doing.' }],
    'korg-ms': ['modular', { name: 'Semi-modular, 1978', sub: 'patch points on a cheap synth · Cybotron\'s', preset: 'Electro 1983', skin: 'skinms' }],
    moog: ['modular', { name: 'Modular system, 1965', sub: 'the Minimoog\'s ancestor · I Feel Love', preset: 'Hypnotic 2015', skin: 'skinmoog' }],
    minimoog: ['bass', { name: 'Minimoog, 1970', sub: 'three oscillators, the ladder filter', preset: 'Electro 1983', skin: 'skinmoog' }],
    arp2600: ['modular', { name: 'Semi-modular, 1971', sub: 'a modular you could carry', preset: 'Detroit 1988', skin: 'skinarp' }],
    juno60: ['poly', { name: 'Polysynth with chorus, 1982', sub: 'six voices, one DCO each, the chorus button', preset: 'Deep house 1990', skin: 'skinjuno' }],
    'alpha-juno': ['poly', { name: 'Alpha Juno, 1985', sub: 'the "WhatThe" patch · the hoover', preset: 'UK rave 1991', skin: 'skinalpha', mode: 'hoover' }],
    jupiter8: ['poly', { name: 'Eight-voice polysynth, 1981', sub: 'two VCOs a voice · the strings', preset: 'Detroit 1988', skin: 'skinjup' }],
    dx7: ['poly', { name: 'FM synthesiser, 1983', sub: 'six operators · the bass and the bells', preset: 'House 1988', skin: 'skindx' }],
    'casio-cz': ['reese', { name: 'Phase-distortion synth, 1985', sub: 'the reese bass\'s first home', preset: 'Drum & bass 1998', skin: 'skincz' }],
    'korg-m1': ['poly', { name: 'Workstation, 1988', sub: 'the piano, the organ bass, the choir', preset: 'House 1988', skin: 'skinm1' }],
    jp8000: ['super', { name: 'Virtual-analogue, 1996', sub: 'the supersaw oscillator', preset: 'Trance 1999', skin: 'skinjp' }],
    'nord-lead': ['super', { name: 'Virtual-analogue, 1995', sub: 'the red one · four voices of analogue model', preset: 'Goa 1995', skin: 'skinnord' }],
    'access-virus': ['super', { name: 'Virtual-analogue, 1997', sub: 'the trance and Berlin workhorse', preset: 'Peak-time 2017', skin: 'skinvirus' }],
    'akai-s900': ['pads', { name: 'Rack sampler, 1986', sub: '12-bit · 750 KB · the bedroom studio', preset: 'UK rave 1991', skin: 'skinakai', note: 'Eleven seconds at 40 kHz, in a 2U rack, with a floppy drive. "Voodoo Ray" ran out of memory in it.' }],
    'akai-s1000': ['pads', { name: 'Rack sampler, 1988', sub: '16-bit · the first with timestretch', preset: 'Jungle 1994', skin: 'skinakai', note: 'The stretch knob slows a sound without lowering it: push it and the snare smears the way "Terminator" does.' }],
    sampler: ['pads', { name: 'The sampler', sub: 'any sound, on a key', preset: 'UK rave 1991', skin: 'skinakai' }],
    emulator: ['pads', { name: 'Keyboard sampler, 1981', sub: 'the Emulator and the Fairlight · orchestra hits', preset: 'Electro 1983', skin: 'skinemu', note: 'A sampled orchestra stab from a Fairlight is the hit on "Planet Rock".' }],
    mpc: ['pads', { name: 'MIDI production centre, 1988', sub: 'Roger Linn\'s pads and swing', preset: 'UK garage 1998', skin: 'skinmpc', mpc: true, note: 'Sixteen velocity pads and a swing setting from 50 to 75%. UK garage lives at 62–66.' }],
    'atari-cubase': ['roll', { name: 'Atari ST + sequencer, 1988', sub: 'MIDI built in · the studio computer', preset: 'UK bleep 1990', skin: 'skinatari', note: 'A 16-step page of a sequencer like Cubase or Notator: notes on a grid, sent out of the Atari\'s MIDI port to the boxes.' }],
    'cubase-vst': ['roll', { name: 'Audio in the computer, 1996', sub: 'Cubase VST, Logic, Pro Tools', preset: 'Trance 1999', skin: 'skinvst', layer: 'super' }],
    'fl-studio': ['roll', { name: 'FruityLoops, 1997', sub: 'a step sequencer for Windows', preset: 'Hard techno 2023', skin: 'skinfl', note: 'FruityLoops began as this: a step sequencer with a row per sound. The piano roll came later and became its best feature.' }],
    reason: ['bass', { name: 'ReBirth, 1997', sub: 'a 303, an 808 and a 909 on a screen', preset: 'Acid techno 1994', skin: 'skinrb' }],
    ableton: ['clips', { name: 'Live, 2001', sub: 'session view · clips launch on the bar', preset: 'Minimal 2004', skin: 'skinlive' }],
    eurorack: ['modular', { name: 'Eurorack, 1996–', sub: 'patch cables again · the hypnotic instrument', preset: 'Hypnotic 2015', skin: 'skineuro' }],
    'web-audio': ['roll', { name: 'Web Audio, 2011–', sub: 'the synthesiser this book runs on', preset: 'Detroit 1988', skin: 'skinweb', note: 'Everything you have heard in this book is oscillators, filters and noise generated in the browser by the Web Audio API — this grid included.' }]
  };

  window.Panels = {
    MAP,
    has: id => !!MAP[id],
    mount(root, id){ const spec = MAP[id]; if (!spec) return; root.querySelectorAll(`.hwpanel[data-machine="${id}"]:not([data-mounted])`).forEach(box => { box.dataset.mounted = 1; try { P[spec[0]](box, id, spec[1]); } catch (e) { console.error('panel', id, e); } }); },
    mountAll(root){ (root || document).querySelectorAll('.hwpanel:not([data-mounted])').forEach(box => this.mount(root || document, box.dataset.machine)); },
    html(n){ if (n.type !== 'machine' || !MAP[n.id]) return ''; const [type] = MAP[n.id]; const what = { drum: 'a drum machine', bass: 'a bass synthesiser', poly: 'a polysynth', super: 'a supersaw synth', reese: 'a reese bass', pads: 'a sampler', clips: 'a clip launcher', roll: 'a sequencer', modular: 'a modular' }[type]; return `<h3>The panel</h3><p class="cap">A working reconstruction of ${what}, driven by the book\'s own engine. The layout is the idea of the machine, not a copy of it: every control changes the sound you hear.</p><div class="hwpanel" data-machine="${n.id}"></div>`; }
  };
  // tempo override: PatternGrid reads bpm from the preset, so patch its tick through the deck
  const _play = PatternGrid.play.bind(PatternGrid);
  PatternGrid.play = st => { _play(st); if (st.over && st.over.bpmOverride){ const G = PRESET(st.genre); const bpm = st.over.bpmOverride; clearInterval(st.timer); const dk = deck(); dk.setDelayForBpm(bpm); const tick = () => { const c = dk.ch.c; while (st.nextTime < c.currentTime + 0.15){ const d = 60 / bpm / 4; dk.scheduleStep(st.step, st.nextTime, bpm); st.queue.push({ step: st.step, time: st.nextTime }); st.nextTime += d; st.step = (st.step + 1) % 16; } }; st.timer = setInterval(tick, 25); } };
})();
