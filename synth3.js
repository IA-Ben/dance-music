const WORKLET_SRC = "/* ===================================================================\n   AUDIO-THREAD DSP for Dance Music (AudioWorklet).\n   dm-ladder : a four-stage saturating ladder filter. mode 'moog' is the\n               classic transistor ladder; mode '303' puts a highpass in the\n               resonance loop and drives the stages harder, after the\n               TB-303's diode ladder. Oversampled; self-oscillates near the top.\n   dm-crush  : sample-and-hold rate reduction and bit-depth quantising,\n               for the 12-bit samplers (SP-1200, S900/S950, MPC60).\n   =================================================================== */\nconst T = x => (x < -3 ? -1 : x > 3 ? 1 : x * (27 + x * x) / (27 + 9 * x * x)); // fast tanh\n\nclass DMLadder extends AudioWorkletProcessor {\n  static get parameterDescriptors(){\n    return [\n      { name: 'cutoff', defaultValue: 1000, minValue: 20, maxValue: 20000, automationRate: 'a-rate' },\n      { name: 'resonance', defaultValue: 0.4, minValue: 0, maxValue: 1.2, automationRate: 'k-rate' },\n      { name: 'drive', defaultValue: 1, minValue: 0.1, maxValue: 12, automationRate: 'k-rate' }\n    ];\n  }\n  constructor(opts){\n    super();\n    const p = (opts && opts.processorOptions) || {};\n    this.until = p.until || 1e9;          // keep alive until the note's scheduled end\n    this.mode = p.mode === '303' ? 1 : 0;\n    this.os = p.os === 1 ? 1 : 2;          // oversampling\n    this.st = [new Float64Array(4), new Float64Array(4)];\n    this.hx = [0, 0]; this.hy = [0, 0];\n  }\n  process(inputs, outputs, params){\n    const inp = inputs[0], out = outputs[0];\n    if (!inp || inp.length === 0){ for (let c = 0; c < out.length; c++) out[c].fill(0); return currentTime < this.until; }\n    const cut = params.cutoff, k = params.resonance[0] * 4, drive = params.drive[0];\n    const sr = sampleRate * this.os, nyq = sr * 0.45, os = this.os, m303 = this.mode;\n    const hpA = Math.exp(-2 * Math.PI * 160 / sr);             // 303: highpass in the feedback loop\n    const comp = (1 + k * (m303 ? 0.22 : 0.42)) / Math.max(1, drive * 0.55);\n    for (let c = 0; c < out.length; c++){\n      const x = inp[Math.min(c, inp.length - 1)], y = out[c];\n      const s = this.st[c] || (this.st[c] = new Float64Array(4));\n      let hx = this.hx[c] || 0, hy = this.hy[c] || 0;\n      let g = 0, lastF = -1;\n      for (let i = 0; i < y.length; i++){\n        const f = cut.length > 1 ? cut[i] : cut[0];\n        if (f !== lastF){ g = 1 - Math.exp(-2 * Math.PI * Math.min(f, nyq) / sr); lastF = f; }\n        const xin = x[i] * drive;\n        for (let n = 0; n < os; n++){\n          let fb = s[3];\n          if (m303){ hy = hpA * (hy + fb - hx); hx = fb; fb = hy; }\n          const u = T(xin - k * fb);\n          const t0 = T(s[0]), t1 = T(s[1]), t2 = T(s[2]);\n          s[0] += g * (u - t0);\n          s[1] += g * (t0 - t1);\n          s[2] += g * (t1 - t2);\n          s[3] += g * (t2 - T(s[3]));\n        }\n        y[i] = s[3] * comp;\n      }\n      this.hx[c] = hx; this.hy[c] = hy;\n    }\n    return true;\n  }\n}\nregisterProcessor('dm-ladder', DMLadder);\n\nclass DMCrush extends AudioWorkletProcessor {\n  static get parameterDescriptors(){\n    return [\n      { name: 'bits', defaultValue: 16, minValue: 2, maxValue: 16, automationRate: 'k-rate' },\n      { name: 'rate', defaultValue: 96000, minValue: 1000, maxValue: 96000, automationRate: 'k-rate' }\n    ];\n  }\n  constructor(){ super(); this.ph = [0, 0]; this.h = [0, 0]; }\n  process(inputs, outputs, params){\n    const inp = inputs[0], out = outputs[0];\n    if (!inp || inp.length === 0){ for (let c = 0; c < out.length; c++) out[c].fill(0); return true; }\n    const bits = params.bits[0], rate = params.rate[0];\n    const bypass = bits >= 16 && rate >= sampleRate;\n    const q = Math.pow(2, bits - 1), step = Math.min(1, rate / sampleRate);\n    for (let c = 0; c < out.length; c++){\n      const x = inp[Math.min(c, inp.length - 1)], y = out[c];\n      if (bypass){ y.set(x); continue; }\n      let ph = this.ph[c] || 0, h = this.h[c] || 0;\n      for (let i = 0; i < y.length; i++){\n        ph += step; if (ph >= 1){ ph -= 1; h = Math.round(Math.max(-1, Math.min(1, x[i])) * q) / q; }\n        y[i] = h;\n      }\n      this.ph[c] = ph; this.h[c] = h;\n    }\n    return true;\n  }\n}\nregisterProcessor('dm-crush', DMCrush);\n";
/* ===================================================================
   SYNTH v3 — the engine around the voices.
   Ladder filter and sampler crusher on the audio thread (worklets.js),
   rimshot, cowbell and FM voices, a room per preset, stereo ping-pong
   echo, 12-bit sampler grit, drum dynamics, a worker clock that keeps
   time in background tabs, and click-free stopping.
   Loads after synth2.js and before records.js, so record presets inherit
   the rooms and grit set on their base genres.
   =================================================================== */
(() => {
  const U = SynthV2.util, { rnd, pan, via, noiseAt, chorus, send, vel } = U;

  /* ---------- 1. worklets ---------- */
  const WSRC = typeof WORKLET_SRC === 'string' ? WORKLET_SRC : null;
  window.DSP = {
    ok: new WeakSet(), pending: new WeakMap(), voice: {},
    ready(c){ return this.ok.has(c); },
    load(c){
      if (!c || !c.audioWorklet) return Promise.resolve(false);
      if (this.ok.has(c)) return Promise.resolve(true);
      if (this.pending.has(c)) return this.pending.get(c);
      const tryUrl = u => c.audioWorklet.addModule(u).then(() => true, () => false);
      const pr = tryUrl('worklets.js').then(ok => ok || !WSRC ? ok : tryUrl(URL.createObjectURL(new Blob([WSRC], { type: 'text/javascript' }))))
        .then(ok => ok || !WSRC ? ok : tryUrl('data:text/javascript;charset=utf-8,' + encodeURIComponent(WSRC)))
        .then(ok => { if (ok) this.ok.add(c); return ok; });
      this.pending.set(c, pr); return pr;
    }
  };
  const getV2 = AudioCore.get;
  AudioCore.get = () => { const ch = getV2(); if (ch && !DSP.ready(ch.c)) DSP.load(ch.c); return ch; };
  const ladder = (c, mode, until, ch2) => new AudioWorkletNode(c, 'dm-ladder', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [ch2 ? 2 : 1], processorOptions: { mode, until, os: SynthV2.lite ? 1 : 2 } });

  /* ---------- 2. ladder voices ---------- */
  DSP.voice.acid = (ch, t, P) => {
    const c = ch.c, gate = P.slideTo ? P.slideTime : P.gate, end = t + gate + 0.15, acc = !!P.accent;
    const o = c.createOscillator(); o.type = P.wave || 'sawtooth'; o.frequency.setValueAtTime(P.freq, t); o.detune.value = rnd(3);
    if (P.slideTo){ const s0 = t + Math.max(0.01, gate - 0.06); o.frequency.setValueAtTime(P.freq, s0); o.frequency.setTargetAtTime(P.slideTo, s0, 0.02); }
    const lad = ladder(c, '303', end + 0.05);
    lad.parameters.get('resonance').value = Math.max(0, Math.min(1.08, 0.08 + (P.res - 0.5) / 24.5 * 0.95));
    lad.parameters.get('drive').value = acc ? 1.8 : 1.3;
    const cf = lad.parameters.get('cutoff'), envAmt = P.env * (acc ? 1.7 : 1), dec = acc ? Math.min(P.decay, 0.18) : P.decay;
    cf.setValueAtTime(Math.min(12000, P.cutoff + envAmt), t); cf.setTargetAtTime(Math.max(40, P.cutoff), t + 0.002, Math.max(0.01, dec / 3));
    const lvl = P.level * (acc ? 0.92 : 1) * 1.3;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.003); g.gain.setValueAtTime(lvl, t + gate); g.gain.setTargetAtTime(0, t + gate, 0.012);
    o.connect(lad); lad.connect(g); g.connect(dest(ch, P, 'acid'));
    o.start(t); o.stop(end); reg(ch, o, end);
  };
  DSP.voice.off = (ch, t, p) => {
    const c = ch.c, P = { freq: ST.root * 2, cutoff: ST.off.cutoff, decay: 0.2, level: 0.45, ...p }, end = t + P.decay + 0.08;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq;
    const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = P.freq / 2; const og = c.createGain(); og.gain.value = 0.35;
    const lad = ladder(c, 'moog', end + 0.05); lad.parameters.get('resonance').value = 0.42; lad.parameters.get('drive').value = 1.6;
    const cf = lad.parameters.get('cutoff'); cf.setValueAtTime(Math.min(12000, P.cutoff * 2.4), t); cf.setTargetAtTime(Math.max(70, P.cutoff * 0.4), t + 0.002, 0.045);
    const g = c.createGain(); g.gain.setValueAtTime(P.level * 1.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
    o.connect(lad); o2.connect(og); og.connect(lad); lad.connect(g); g.connect(dest(ch, P, 'off'));
    o.start(t); o2.start(t); o.stop(end); o2.stop(end); reg(ch, o, end); reg(ch, o2, end);
  };
  DSP.voice.reese = (ch, t, P, rs) => {
    const c = ch.c, end = t + P.dur + 0.2;
    const lad = ladder(c, 'moog', end + 0.05, true); lad.parameters.get('resonance').value = 0.35; lad.parameters.get('drive').value = Math.min(6, (P.drive || 3) * 0.8);
    const cf = lad.parameters.get('cutoff'); cf.setValueAtTime(P.cutoff * 1.8, t); cf.setTargetAtTime(P.cutoff, t, Math.max(0.05, P.dur / 3));
    const lfo = c.createOscillator(); lfo.frequency.value = 0.3 + Math.random() * 0.25; const lg = c.createGain(); lg.gain.value = P.cutoff * 0.35; lfo.connect(lg); lg.connect(cf);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level * 0.95, t + 0.01); g.gain.setValueAtTime(P.level * 0.95, t + P.dur * 0.8); g.gain.setTargetAtTime(0, t + P.dur * 0.8, Math.max(0.02, P.dur * 0.06));
    [[-14, -0.75], [14, 0.75]].forEach(([det, pv]) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq; o.detune.value = det * rs + rnd(2); via(o, pan(c, pv), lad); o.start(t); o.stop(end); reg(ch, o, end); });
    const sub = c.createOscillator(); sub.type = 'sine'; sub.frequency.value = P.freq; const sg = c.createGain(); sg.gain.value = 0.55; sub.connect(sg); sg.connect(g); sub.start(t); sub.stop(end); reg(ch, sub, end);
    lfo.start(t); lfo.stop(end); reg(ch, lfo, end);
    lad.connect(g); g.connect(dest(ch, P, 'reese'));
  };

  /* ---------- 3. new voices: rimshot, cowbell, FM ---------- */
  S.rim = (ch, t, p = {}) => {
    const c = ch.c, P = { level: 0.42, ...p }, lv = P.level * vel('rim'); const out = c.createGain(); via(out, pan(c, 0.2), dest(ch, P, 'rim'));
    [[1720, 0.028, 1], [455, 0.014, 0.6]].forEach(([f, dk, l]) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.06, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.004); const g = c.createGain(); g.gain.setValueAtTime(lv * l, t); g.gain.exponentialRampToValueAtTime(0.001, t + dk); o.connect(g); g.connect(out); o.start(t); o.stop(t + dk + 0.02); reg(ch, o, t + dk + 0.02); });
    const n = noiseAt(c, t, 0.02); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000; const ng = c.createGain(); ng.gain.setValueAtTime(lv * 0.5, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.008); n.connect(hp); hp.connect(ng); ng.connect(out); reg(ch, n, t + 0.02);
  };
  S.cow = (ch, t, p = {}) => {
    const c = ch.c, P = { level: 0.22, ...p }, lv = P.level * vel('cow');
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const g = c.createGain(); g.gain.setValueAtTime(lv, t); g.gain.exponentialRampToValueAtTime(lv * 0.35, t + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    [540, 800].forEach(f => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(bp); o.start(t); o.stop(t + 0.32); reg(ch, o, t + 0.32); });
    bp.connect(g); via(g, pan(c, -0.25), dest(ch, P, 'cow'));
  };
  // two-operator FM per note (carrier + modulator with its own index envelope) and an optional 14:1 "tine" pair
  S.fm = (ch, t, p = {}) => {
    const c = ch.c, F = Object.assign({ ratio: 1, index: 2.2, idecay: 0.6, decay: 1.2, tine: 0.25, oct: 0, detune: 3, gain: 1 }, p.fm || {});
    const P = { root: 220, chord: [0, 4, 7], level: 0.12, ...p }, n = P.chord.length, end = t + F.decay * 1.8 + 0.1;
    const out = c.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(P.level * 2.4 * F.gain, t + 0.002); out.gain.setTargetAtTime(0, t + 0.004, Math.max(0.03, F.decay / 3.5));
    P.chord.forEach((semi, i) => {
      const f = P.root * Math.pow(2, semi / 12 + F.oct);
      const car = c.createOscillator(); car.type = 'sine'; car.frequency.value = f; car.detune.value = (i % 2 ? 1 : -1) * F.detune;
      const mod = c.createOscillator(); mod.type = 'sine'; mod.frequency.value = f * F.ratio;
      const mg = c.createGain(), dev = F.index * f * F.ratio; mg.gain.setValueAtTime(dev, t); mg.gain.setTargetAtTime(dev * 0.12, t + 0.002, Math.max(0.01, F.idecay / 3));
      mod.connect(mg); mg.connect(car.frequency);
      const cg = c.createGain(); cg.gain.value = 1 / Math.sqrt(n); car.connect(cg); via(cg, pan(c, n > 1 ? (i / (n - 1) - 0.5) * 0.5 : 0), out);
      [car, mod].forEach(o => { o.start(t); o.stop(end); reg(ch, o, end); });
      if (F.tine > 0){
        const tc = c.createOscillator(); tc.type = 'sine'; tc.frequency.value = f; const tm = c.createOscillator(); tm.type = 'sine'; tm.frequency.value = f * 14;
        const tg = c.createGain(); tg.gain.setValueAtTime(f * 14 * 0.9, t); tg.gain.setTargetAtTime(0, t, 0.015); tm.connect(tg); tg.connect(tc.frequency);
        const tl = c.createGain(); tl.gain.setValueAtTime(F.tine / Math.sqrt(n), t); tl.gain.setTargetAtTime(0, t, 0.08); tc.connect(tl); tl.connect(out);
        [tc, tm].forEach(o => { o.start(t); o.stop(t + 0.5); reg(ch, o, t + 0.5); });
      }
    });
    out.connect(dest(ch, P, 'stab'));
    if (ch.verbSend) send(c, out, ch.verbSend, P.verb != null ? Math.min(0.6, P.verb) : 0.25);
    send(c, out, chorus(ch), 0.3);
  };

  /* ---------- 4. new layers ---------- */
  const at = DECK_LAYERS.findIndex(d => d[0] === 'shaker') + 1;
  DECK_LAYERS.splice(at, 0, ['rim', 'Rimshot', 'out'], ['cow', 'Cowbell', 'out']);

  /* ---------- 5. rooms, grit, dynamics per preset ---------- */
  const ROOM = {
    'Detroit 1988': 'club', 'Chicago acid 1987': 'club', 'UK bleep 1990': 'club', 'UK rave 1991': 'warehouse', 'Acid techno 1994': 'squat', 'Tresor 1992': 'vault',
    'Birmingham 1995': 'warehouse', 'Dub techno 1995': 'dub', 'Schranz 2002': 'warehouse', 'Minimal 2004': 'club', 'Berghain 2010': 'hall', 'Hypnotic 2015': 'hall',
    'Peak-time 2017': 'arena', 'Industrial 2018': 'vault', 'Hard techno 2023': 'warehouse', 'Tech-house 1997': 'club', 'Chicago house 1986': 'club', 'UK garage 1998': 'club',
    'Jungle 1994': 'club', 'Drum & bass 1998': 'club', 'Trance 1993': 'club', 'Trance 1999': 'arena',
    'House 1988': 'club', 'Deep house 1990': 'club', 'Garage 1992': 'club', 'Balearic 1987': 'open', 'French touch 1997': 'studio', 'UK garage 1999': 'club', 'Progressive 1994': 'arena',
    'Trance 1995': 'arena', 'Goa 1995': 'open', 'Hard trance 1996': 'warehouse', 'Gabber 1993': 'warehouse', 'Happy hardcore 1995': 'warehouse', 'New beat 1988': 'club',
    'Electro 1983': 'studio', 'Ambient techno 1993': 'studio', 'Jungle 1993': 'warehouse', 'Atmospheric 1995': 'studio', 'Liquid 2002': 'club', 'Neurofunk 1999': 'club', 'Jump-up 1996': 'warehouse'
  };
  const GRIT = {
    'UK rave 1991': { bits: 12, rate: 31250, filter: true }, 'Jungle 1993': { bits: 12, rate: 31250, filter: true }, 'Jungle 1994': { bits: 14, rate: 44100 },
    'Garage 1992': { bits: 12, rate: 40000, filter: true }, 'UK garage 1998': { bits: 14, rate: 44100 }, 'UK garage 1999': { bits: 14, rate: 44100 },
    'French touch 1997': { bits: 12, rate: 26040 }, 'Happy hardcore 1995': { bits: 14, rate: 44100 }, 'Jump-up 1996': { bits: 14, rate: 44100 }
  };
  const ROOM_LABEL = { club: 'a club', vault: 'a concrete vault', hall: 'a turbine hall', warehouse: 'a warehouse', arena: 'an arena', open: 'the open air', studio: 'a studio plate', dub: 'a dub plate reverb', squat: 'a squat party', classic: 'the classic reverb' };
  Object.entries(ROOM).forEach(([n, r]) => { if (GENRES[n]) GENRES[n].room = r; });
  Object.entries(GRIT).forEach(([n, g]) => { if (GENRES[n]) GENRES[n].grit = g; });
  const addPat = (n, pats) => { if (GENRES[n]) Object.assign(GENRES[n].pat, pats); };
  addPat('Chicago acid 1987', { rim: '...x......x..x..' });
  addPat('Chicago house 1986', { rim: '...x.......x....' });
  addPat('Detroit 1988', { rim: '.......x.......x' });
  window.SynthRooms = { ROOM, GRIT, ROOM_LABEL, roomFor: (name, G) => ROOM[name] || (G && G.room) || 'club', gritFor: (name, G) => (name in GRIT ? GRIT[name] : (G && G.grit)) || null };

  const ROOMS = {
    club:      { secs: 1.3, damp: 0.55, pre: 0.008, er: [5, 9, 13, 18, 24], erg: 0.5, width: 0.8 },
    vault:     { secs: 1.7, damp: 0.78, pre: 0.004, er: [3, 5, 7, 9, 12, 15], erg: 0.7, width: 0.6 },
    hall:      { secs: 3.4, damp: 0.35, pre: 0.032, er: [21, 33, 47, 61, 79], erg: 0.35, width: 1 },
    warehouse: { secs: 2.5, damp: 0.25, pre: 0.022, er: [17, 29, 43, 59], erg: 0.45, width: 1 },
    arena:     { secs: 2.9, damp: 0.4, pre: 0.038, er: [27, 41, 55, 71, 89], erg: 0.3, width: 1 },
    open:      { secs: 0.7, damp: 0.6, pre: 0.012, er: [11, 37], erg: 0.4, width: 0.7 },
    studio:    { secs: 1.9, damp: 0.3, pre: 0.01, er: [], erg: 0, width: 0.9 },
    dub:       { secs: 2.8, damp: 0.62, pre: 0.014, er: [], erg: 0, width: 1 },
    squat:     { secs: 1.9, damp: 0.5, pre: 0.016, er: [9, 19, 31, 44], erg: 0.55, width: 0.85 }
  };
  const irCache = new WeakMap();
  function ir(c, name){
    let m = irCache.get(c); if (!m){ m = {}; irCache.set(c, m); } if (m[name]) return m[name];
    const sr = c.sampleRate;
    if (name === 'classic'){ const len = Math.floor(sr * 2.2), b = c.createBuffer(2, len, sr); for (let k = 0; k < 2; k++){ const d = b.getChannelData(k); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } return (m[name] = b); }
    const R = ROOMS[name] || ROOMS.club, len = Math.floor(sr * R.secs), b = c.createBuffer(2, len, sr), L = [], aS = 0.95 - 0.35 * R.damp, aE = 0.45 * (1 - R.damp) + 0.03;
    for (let k = 0; k < 2; k++){ const d = b.getChannelData(k); let lp = 0;
      for (let i = 0; i < len; i++){ const u = i / len, a = aS + (aE - aS) * u; lp += ((Math.random() * 2 - 1) - lp) * a; d[i] = lp * Math.exp(-6.9 * u) * Math.min(1, i / (sr * 0.002)); }
      R.er.forEach((ms, j) => { const idx = Math.floor((ms + (k ? 1.7 : 0)) * sr / 1000); if (idx < len) d[idx] += (j % 2 ? -1 : 1) * R.erg * (1 - j * 0.1); });
      L.push(d);
    }
    if (R.width < 1){ const w = R.width, a = (1 + w) / 2, bb = (1 - w) / 2; for (let i = 0; i < len; i++){ const l = L[0][i], r = L[1][i]; L[0][i] = l * a + r * bb; L[1][i] = r * a + l * bb; } }
    return (m[name] = b);
  }

  /* ---------- 6. deck: room, ping-pong echo, grit insert, A/B gates ---------- */
  const DECKS = new Set();
  const OUT_LAYERS = () => DECK_LAYERS.filter(d => d[2] === 'out').map(d => d[0]);
  const ramp = (prm, v, c) => { const n = c.currentTime; prm.cancelScheduledValues(n); prm.setTargetAtTime(v, n, 0.03); };
  function setup(dk){
    if (dk._v3) return; dk._v3 = true; DECKS.add(dk); const c = dk.ch.c;
    // reverb: classic path and room path, gated
    dk.verbSend.disconnect();
    dk._vgC = c.createGain(); const cvC = c.createConvolver(); cvC.buffer = ir(c, 'classic'); const rC = c.createGain(); rC.gain.value = 0.4;
    dk.verbSend.connect(dk._vgC); dk._vgC.connect(cvC); cvC.connect(rC); rC.connect(dk.duck);
    dk._pre = c.createDelay(0.2); dk._vgR = c.createGain(); dk.verbSend.connect(dk._pre); dk._pre.connect(dk._vgR);
    dk._room = null; dk._roomName = '';
    // echo: classic mono delay path and stereo ping-pong path, gated
    dk.delSend.disconnect();
    dk._dgC = c.createGain(); dk.delSend.connect(dk._dgC); dk._dgC.connect(dk.delay);
    dk._dgP = c.createGain(); dk.delSend.connect(dk._dgP);
    const dl = c.createDelay(2), dr = c.createDelay(2), lp = c.createBiquadFilter(), fb = c.createGain(), mg = c.createChannelMerger(2), ret = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 2400; fb.gain.value = 0.5; ret.gain.value = 0.55; dl.delayTime.value = dr.delayTime.value = 0.34;
    dk._dgP.connect(dl); dl.connect(mg, 0, 0); dl.connect(dr); dr.connect(mg, 0, 1); dr.connect(lp); lp.connect(fb); fb.connect(dl); mg.connect(ret); ret.connect(dk.duck);
    dk._pp = { dl, dr, fb };
    // grit insert on the drum tracks
    dk._gIn = c.createGain(); dk._gLp = c.createBiquadFilter(); dk._gLp.type = 'lowpass'; dk._gLp.frequency.value = 20000; dk._gLp.Q.value = 0.5;
    dk._gIn.connect(dk._gLp); dk._gLp.connect(dk.input);
    OUT_LAYERS().forEach(lid => { const tr = dk.tr[lid]; if (!tr) return; tr.disconnect(); tr.connect(dk._gIn); });
    gates(dk, true);
  }
  function gates(dk, now){ const c = dk.ch.c, on = SynthV2.on, set = (g, v) => now ? (g.gain.value = v) : ramp(g.gain, v, c); set(dk._vgC, on ? 0 : 1); set(dk._vgR, on ? 1 : 0); set(dk._dgC, on ? 0 : 1); set(dk._dgP, on ? 1 : 0); }
  function applyRoom(dk){
    const name = dk.P.room || 'club'; if (name === dk._roomName) return; const c = dk.ch.c, R = ROOMS[name] || ROOMS.club;
    const cv = c.createConvolver(); cv.buffer = ir(c, name); const rt = c.createGain(); rt.gain.value = 0; rt.gain.setTargetAtTime(0.42, c.currentTime, 0.08);
    dk._vgR.connect(cv); cv.connect(rt); rt.connect(dk.duck); dk._pre.delayTime.setTargetAtTime(R.pre, c.currentTime, 0.02);
    const old = dk._room; if (old){ old.rt.gain.setTargetAtTime(0, c.currentTime, 0.08); setTimeout(() => { try { dk._vgR.disconnect(old.cv); old.cv.disconnect(); old.rt.disconnect(); } catch (e) {} }, 4000); }
    dk._room = { cv, rt }; dk._roomName = name;
  }
  function applyGrit(dk){
    dk._gritRef = dk.P.grit; const c = dk.ch.c, gr = SynthV2.on ? dk.P.grit : null;
    if (gr && !dk._crush && DSP.ready(c)){ try { dk._crush = new AudioWorkletNode(c, 'dm-crush', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] }); dk._gIn.disconnect(); dk._gIn.connect(dk._crush); dk._crush.connect(dk._gLp); } catch (e) { dk._crush = null; } }
    if (dk._crush){ dk._crush.parameters.get('bits').value = gr ? gr.bits : 16; dk._crush.parameters.get('rate').value = gr ? gr.rate : 96000; }
    else if (gr && !DSP.ready(c)){ DSP.load(c).then(ok => { if (ok) applyGrit(dk); }); }
    dk._gLp.frequency.setTargetAtTime(gr && gr.filter ? Math.min(20000, gr.rate * 0.45) : 20000, c.currentTime, 0.02);
  }
  const L0 = Deck.prototype.load;
  Deck.prototype.load = function(name){
    L0.call(this, name); setup(this); const G = PRESET(name) || {};
    this.P.room = SynthRooms.roomFor(name, G); this.P.grit = SynthRooms.gritFor(name, G); this.P.vel = G.vel || null;
    applyRoom(this); applyGrit(this);
  };
  const D0 = Deck.prototype.setDelayForBpm;
  Deck.prototype.setDelayForBpm = function(bpm){ D0.call(this, bpm); if (this._pp){ const v = (60 / bpm) * 0.75, n = this.ch.c.currentTime; this._pp.dl.delayTime.setTargetAtTime(v, n, 0.05); this._pp.dr.delayTime.setTargetAtTime(v, n, 0.05); } };
  const S0 = Deck.prototype.scheduleStep;
  Deck.prototype.scheduleStep = function(i, t, bpm){
    const P = this.P, p = this.pat;
    if (this._v3){ if (P.grit !== this._gritRef) applyGrit(this); if (P.room && P.room !== this._roomName) applyRoom(this); }
    const v = {};
    if (SynthV2.on){
      if (P.vel) for (const lid in P.vel){ const k = P.vel[lid][i]; if (k === 'g') v[lid] = 0.38; else if (k === 'h') v[lid] = 0.7; else if (k === 'A') v[lid] = 1.25; }
      ['kick', 'snare', 'clap', 'hatc', 'hato', 'tom', 'metal', 'shaker', 'rim', 'cow'].forEach(lid => { if (p[lid] && p[lid][i] === 2 && !v[lid]) v[lid] = 1.25; });
      if (p.snare && p.snare[i] && i !== 4 && i !== 12 && !v.snare) v.snare = 0.62;    // off-backbeat snares become ghost notes
      if (p.kick && p.kick[i] && i % 4 !== 0 && !v.kick) v.kick = 0.86;                // syncopated kicks sit back
      if (p.shaker && p.shaker[i] && !v.shaker) v.shaker = i % 4 === 2 ? 1.15 : i % 2 ? 0.75 : 0.9;
      if (p.tom && p.tom[i] && !v.tom) v.tom = 0.85 + Math.random() * 0.2;
    }
    S._vel = v; S._step = i;
    try { S0.call(this, i, t, bpm); } finally { S._vel = null; }
    const d = 60 / bpm / 4, ts = t + (i % 2 ? P.swing * d : 0), aud = id => !this.mute[id];
    S._vel = v; S._step = i;
    try {
      if (p.rim && p.rim[i] && aud('rim')) S.rim(this.chain, ts, {});
      if (p.cow && p.cow[i] && aud('cow')) S.cow(this.chain, ts, {});
    } finally { S._vel = null; }
  };
  const set0 = SynthV2.set.bind(SynthV2);
  SynthV2.set = v => { set0(v); DECKS.forEach(dk => { gates(dk); applyGrit(dk); }); };

  /* ---------- 7. a worker clock: schedulers keep time in background tabs ---------- */
  (() => {
    let W = null;
    try { W = new Worker(URL.createObjectURL(new Blob(["let t=null;onmessage=e=>{if(e.data==='go'){if(!t)t=setInterval(()=>postMessage(1),25)}else{clearInterval(t);t=null}}"], { type: 'text/javascript' }))); } catch (e) { W = null; }
    if (!W) return;
    const cbs = new Map(), si = window.setInterval.bind(window), ci = window.clearInterval.bind(window); let nid = 9e8;
    W.onmessage = () => cbs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
    window.setInterval = function(fn, ms, ...a){ if (ms === 25 && typeof fn === 'function'){ const id = ++nid; cbs.set(id, a.length ? () => fn(...a) : fn); W.postMessage('go'); return id; } return si(fn, ms, ...a); };
    window.clearInterval = function(id){ if (cbs.has(id)){ cbs.delete(id); if (!cbs.size) W.postMessage('stop'); return; } return ci(id); };
    window.SynthClock = { worker: true, active: () => cbs.size };
  })();

  /* ---------- 8. click-free stopping ---------- */
  window.Fade = {
    cut(){
      const ch = AudioCore.peek(), smooth = !!(ch && SynthV2.on), now = ch ? ch.c.currentTime : 0;
      if (smooth){
        const g = ch.out.gain, m = (typeof ST !== 'undefined' && ST.master) || 1;
        g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.0001, now + 0.03); g.setValueAtTime(0.0001, now + 0.034); g.linearRampToValueAtTime(m, now + 0.06);
        DECKS.forEach(dk => { const fb = dk._pp && dk._pp.fb; if (!fb) return; const per = dk._pp.dl.delayTime.value; fb.gain.cancelScheduledValues(now); fb.gain.setValueAtTime(fb.gain.value, now); fb.gain.linearRampToValueAtTime(0, now + 0.03); fb.gain.setValueAtTime(0, now + 0.03 + per * 2); fb.gain.linearRampToValueAtTime(0.5, now + 0.06 + per * 2); });
      }
      if (typeof Voices !== 'undefined'){ Voices.forEach(v => { try { v.node.stop(smooth ? now + 0.032 : 0); } catch (e) {} }); Voices.length = 0; }
    }
  };
  document.querySelectorAll('.synthlite').forEach(b => b.textContent = SynthV2.lite ? 'Quality: light' : 'Quality: full');
})();
