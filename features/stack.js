/* ===================================================================
   STACK — "Build a stack", for The rig (sy4).
   The reader stacks generic boxes (sub, kick, mid horn, tweeters),
   sets three crossovers and the amplifier power, picks a room or a
   field, and hears a generated loop split into four bands with Web
   Audio filters. A rough inverse-square model gives levels on the
   floor and 100 m away, set beside the limits the book states.
   Uses the engine's AudioCore, voices (S) and SoundBus when present.
   =================================================================== */
(() => {
  const NAME = 'stack', KEY = 'feat-stack';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const log10 = Math.log10, db = p => 10 * log10(p), sumDb = a => db(a.reduce((s, l) => s + Math.pow(10, l / 10), 0));
  const el = (tag, at, ...kids) => { const e = document.createElement(tag); if (at) for (const k in at){ if (k === 'text') e.textContent = at[k]; else if (k === 'html') e.innerHTML = at[k]; else if (k.startsWith('on')) e[k] = at[k]; else e.setAttribute(k, at[k]); } kids.forEach(k => k != null && e.append(k)); return e; };
  const src = (id, label) => el('a', { href: '#' + id, 'data-src': id, class: 'fs-src' }, label || 'from the book');
  const fmtW = w => w >= 1000 ? (w >= 10000 ? Math.round(w / 1000) : (Math.round(w / 100) / 10)) + ' kW' : Math.round(w) + ' W';
  const fmtHz = f => f >= 1000 ? (Math.round(f / 100) / 10) + ' kHz' : Math.round(f) + ' Hz';

  /* ---------- the boxes: generic shapes, generic numbers (assumptions of this model) ---------- */
  const TYPES = [
    { id: 'sub', name: 'Sub / bass bin', sens: 99, handle: 1500, share: 0.45, max: 4, def: 2, col: '--rumble' },
    { id: 'kick', name: 'Kick / mid-bass', sens: 102, handle: 1000, share: 0.25, max: 4, def: 1, col: '--kick' },
    { id: 'mid', name: 'Mid horn', sens: 107, handle: 600, share: 0.18, max: 4, def: 1, col: '--drums' },
    { id: 'top', name: 'Tweeter array', sens: 108, handle: 400, share: 0.12, max: 3, def: 1, col: '--synth' }
  ];
  const SETTINGS = {
    club: { name: 'Small club', floor: 5, rev: 13, verb: 0.9, wet: 0.16, gain: 3 },
    warehouse: { name: 'Warehouse', floor: 10, rev: 18, verb: 2.6, wet: 0.3, gain: 2 },
    field: { name: 'Open field', floor: 20, rev: null, verb: 0, wet: 0, gain: 0 }
  };
  /* amplifier sizes the book gives, to set the slider against */
  const RIGS = [
    [1000, 'a 1K hire rig, priced at about £65 to £75 in 1985', 'sy2'],
    [3000, 'about 3,000 watts: Heatwave\'s twelve bass bins', 'sy1'],
    [4500, 'about 4.5 kW: Spiral Tribe at Longstock, 1991', 'sy2'],
    [6000, '6K: Cheeba City\'s rig, seized at Woodbridge in 1995', 'sy2'],
    [10000, '10K: Sunnyside\'s rig on a truck at the 1994 marches', 'sy2'],
    [50000, '50 kW: Turbosound on Glastonbury\'s main stage, 1994', 'sy2'],
    [60000, '60 kW: the Black Box rig on the NME Stage, Glastonbury 1994', 'sy2'],
    [120000, '120K: the Big Bang in Glasgow, November 1993', 'sy5']
  ];
  /* crossover settings the book gives */
  const XO = [
    ['Rosner, 1979', 'Bass below 100 Hz, compression drivers above 6 kHz: the disco standard in the AES journal.', 'sy1', { f1: 100, f3: 6000 }],
    ['Loft tweeters', 'Clusters of four tweeters crossed over at about 5 kHz, hung above the floor.', 'sy1', { f3: 5000 }],
    ['TurboMid', 'A 10-inch cone covering 250 Hz to 4 kHz in a tri-amplified box.', 'sy2', { f2: 250, f3: 4000 }],
    ['Garage booth', 'The DJ\'s own bands: sub-bass from 20 to 100 Hz and tweeters from 7 kHz up.', 'bt1', { f1: 100, f3: 7000 }]
  ];
  const DEF = { n: { sub: 2, kick: 1, mid: 1, top: 1 }, f1: 100, f2: 250, f3: 5000, pv: 385, set: 'warehouse', where: 'floor', vol: 0.15 };
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.n) return { ...DEF, ...s, n: { ...DEF.n, ...s.n }, vol: DEF.vol }; } catch (e) {} return JSON.parse(JSON.stringify(DEF)); };
  const save = st => { try { localStorage.setItem(KEY, JSON.stringify({ n: st.n, f1: st.f1, f2: st.f2, f3: st.f3, pv: st.pv, set: st.set, where: st.where })); } catch (e) {} };
  const powerOf = pv => 500 * Math.pow(300, pv / 1000);           // slider 0..1000 → 500 W .. 150 kW
  const pvOf = w => Math.round(1000 * Math.log(w / 500) / Math.log(300));

  /* ---------- the rough model ---------- */
  const aW = f => { const f2 = f * f; const r = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2)); return 20 * log10(r) + 2.0; };
  function model(st){
    const S = SETTINGS[st.set], P = powerOf(st.pv);
    const live = TYPES.filter(t => st.n[t.id] > 0), shareSum = live.reduce((s, t) => s + t.share, 0) || 1;
    const edges = [35, st.f1, st.f2, st.f3, 16000];
    const bands = TYPES.map((t, i) => {
      const n = st.n[t.id], fc = Math.sqrt(edges[i] * edges[i + 1]);
      if (!n) return { t, n, fc, on: false, od: 0, L1: -Infinity };
      const Pb = P * t.share / shareSum / (2 * n), od = Pb / t.handle;
      const L1 = t.sens + db(Math.min(Pb, t.handle)) + db(2 * n);  // both stacks, power sum at 1 m
      return { t, n, fc, on: true, od, L1, Pb };
    });
    const at = (r, b, outdoors) => { if (!b.on) return -Infinity; let L = b.L1 - 20 * log10(r); if (!outdoors && S.rev != null) L = sumDb([L, b.L1 - S.rev]); if (outdoors && r >= 50){ L -= [0, 0.1, 0.6, 3][TYPES.indexOf(b.t)]; } return L; };
    const outdoors = st.set === 'field', floorL = bands.map(b => at(S.floor, b, outdoors)), farL = bands.map(b => at(100, b, true));
    const tot = a => sumDb(a.filter(isFinite)), totA = a => sumDb(a.map((l, i) => l + aW(bands[i].fc)).filter(isFinite));
    return { P, bands, floor: { d: S.floor, L: tot(floorL), A: totA(floorL), bass: floorL[0] }, far: { L: tot(farL), A: totA(farL), bass: farL[0] }, od: Math.max(0, ...bands.map(b => b.od)), any: live.length };
  }

  /* ---------- analytic filter response (2nd-order Butterworth pairs, as in the audio graph) ---------- */
  const cx = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  const lp2 = (f, fc) => { const w = f / fc; return cdiv([1, 0], [1 - w * w, w / 0.7071]); };
  const hp2 = (f, fc) => { const w = f / fc; return cdiv([-w * w, 0], [1 - w * w, w / 0.7071]); };
  const sq = h => cx(h, h);
  function bandResp(f, i, st){
    const e = [st.f1, st.f2, st.f3]; let h = [1, 0];
    if (i === 0){ h = cx(sq(lp2(f, e[0])), hp2(f, 35)); }
    if (i > 0) h = cx(h, sq(hp2(f, e[i - 1])));
    if (i < 3 && i > 0) h = cx(h, sq(lp2(f, e[i])));
    if (i === 3) h = cx(h, lp2(f, 18000));
    return h;
  }

  /* ---------- audio ---------- */
  function engine(){
    if (typeof AudioCore !== 'undefined' && AudioCore.get){ const ch = AudioCore.get(); return { c: ch.c, out: ch.out, shared: true }; }
    if (!engine.own){ const c = new (window.AudioContext || window.webkitAudioContext)(); const g = c.createGain(); g.connect(c.destination); engine.own = { c, out: g, shared: false }; }
    if (engine.own.c.state === 'suspended') engine.own.c.resume().catch(() => {});
    return engine.own;
  }
  const noiseBuf = c => { if (typeof AudioCore !== 'undefined' && AudioCore.noise) return AudioCore.noise(c); const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
  const impulse = (c, secs) => { const len = Math.floor(c.sampleRate * secs), b = c.createBuffer(2, len, c.sampleRate); for (let k = 0; k < 2; k++){ const d = b.getChannelData(k); let y = 0; for (let i = 0; i < len; i++){ y += ((Math.random() * 2 - 1) - y) * 0.35; d[i] = y * Math.pow(1 - i / len, 3); } } return b; };
  const shaperCurve = k => { const n = 1024, a = new Float32Array(n), t = Math.tanh(k); for (let i = 0; i < n; i++){ const x = i * 2 / (n - 1) - 1; a[i] = Math.tanh(x * k) / t; } return a; };

  /* fallback voices when the engine is not on the page */
  const FB = {
    kick(ch, t, p){ const c = ch.c, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.05); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4); o.connect(g); g.connect(p.dest); o.start(t); o.stop(t + 0.45); },
    tone(ch, t, p, type, f, dur, lv){ const c = ch.c, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(p.dest); o.start(t); o.stop(t + dur + 0.05); },
    hat(ch, t, p){ const c = ch.c, n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); n.buffer = noiseBuf(c); f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(p.level || 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + (p.decay || 0.05)); n.connect(f); f.connect(g); g.connect(p.dest); n.start(t); n.stop(t + 0.3); }
  };
  const V = () => (typeof S !== 'undefined' && S && S.kick) ? S : null;
  function voice(ch, name, t, p){
    const s = V();
    try {
      if (s){ if (name === 'kick') return s.kick(ch, t, p); if (name === 'sub') return s.sub(ch, t, p); if (name === 'off') return s.off(ch, t, p); if (name === 'hat') return s.hat(ch, t, p); if (name === 'clap') return s.clap(ch, t, p); if (name === 'stab') return s.stab(ch, t, p); }
    } catch (e) {}
    if (name === 'kick') FB.kick(ch, t, p); else if (name === 'sub') FB.tone(ch, t, p, 'sine', p.freq || 49, p.dur || 0.3, 0.7); else if (name === 'off') FB.tone(ch, t, p, 'sawtooth', p.freq || 98, 0.18, 0.25); else if (name === 'hat') FB.hat(ch, t, p); else if (name === 'clap') FB.hat(ch, t, { ...p, level: 0.5, decay: 0.15 }); else if (name === 'stab') FB.tone(ch, t, p, 'sawtooth', 392, 0.25, 0.08);
  }
  const ROOT = 49, BPM = 126;
  function step(ch, i, t, d){
    const b = i % 32, s = b % 16, D = ch.inp;
    if (s % 4 === 0) voice(ch, 'kick', t, { dest: D });
    if (s % 4 === 2){ voice(ch, 'off', t, { dest: D, freq: ROOT * 2, level: 0.32 }); voice(ch, 'hat', t, { dest: D, open: true, decay: 0.2, level: 0.22 }); }
    if (s % 2 === 1) voice(ch, 'hat', t, { dest: D, level: 0.16 });
    if (s === 4 || s === 12) voice(ch, 'clap', t, { dest: D, level: 0.55 });
    if (s % 4 === 1) voice(ch, 'sub', t, { dest: D, freq: ROOT, dur: d * 2.6, level: 0.55 });
    if (b === 6 || b === 22 || b === 29) voice(ch, 'stab', t, { dest: D, root: ROOT * 8, chord: [0, 3, 7, 10], level: 0.09, verb: 0 });
  }

  function makeGraph(st, inst){
    const E = engine(), c = E.c, g = {};
    g.c = c; g.inp = c.createGain(); g.inp.gain.value = 0.9;
    g.sum = c.createGain(); g.bands = [];
    for (let i = 0; i < 4; i++){
      const chain = [], mk = (type, f) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = 0.7071; chain.push(b); return b; };
      if (i === 0) mk('highpass', 35);
      if (i > 0){ mk('highpass', 100); mk('highpass', 100); }
      if (i < 3){ mk('lowpass', 100); mk('lowpass', 100); }
      if (i === 3) mk('lowpass', 18000);
      const gain = c.createGain(), drive = c.createWaveShaper(); drive.curve = shaperCurve(1.01); drive.oversample = '2x';
      let n = g.inp; chain.forEach(f => { n.connect(f); n = f; }); n.connect(gain); gain.connect(drive); drive.connect(g.sum);
      g.bands.push({ chain, gain, drive, k: 1.01 });
    }
    g.lim = c.createDynamicsCompressor(); g.lim.threshold.value = -6; g.lim.knee.value = 0; g.lim.ratio.value = 20; g.lim.attack.value = 0.002; g.lim.release.value = 0.12;
    g.push = c.createGain(); g.sum.connect(g.push); g.push.connect(g.lim);
    g.makeup = c.createGain(); g.lim.connect(g.makeup);
    g.room = c.createConvolver(); g.wet = c.createGain(); g.wet.gain.value = 0; g.dry = c.createGain();
    g.rgain = c.createBiquadFilter(); g.rgain.type = 'lowshelf'; g.rgain.frequency.value = 120;
    g.makeup.connect(g.rgain); g.rgain.connect(g.dry); g.rgain.connect(g.room); g.room.connect(g.wet);
    g.dist = c.createBiquadFilter(); g.dist.type = 'lowpass'; g.dist.Q.value = 0.6; g.dist.frequency.value = 20000;
    g.distG = c.createGain(); g.dry.connect(g.dist); g.wet.connect(g.dist); g.dist.connect(g.distG);
    g.vol = c.createGain(); g.vol.gain.value = 0;
    g.safe = c.createDynamicsCompressor(); g.safe.threshold.value = -14; g.safe.knee.value = 0; g.safe.ratio.value = 20; g.safe.attack.value = 0.001; g.safe.release.value = 0.1;
    g.cap = c.createGain(); g.cap.gain.value = 0.5;
    g.distG.connect(g.vol); g.vol.connect(g.safe); g.safe.connect(g.cap); g.cap.connect(E.out);
    g.verbSink = c.createGain(); g.delSink = c.createGain();
    g.ch = { c, live: false, out: g.inp, duck: g.inp, tr: null, verbSend: g.verbSink, delSend: g.delSink, inp: g.inp };
    g.roomName = '';
    return g;
  }
  function applyGraph(g, st, m, ramp){
    const c = g.c, now = c.currentTime, set = (p, v) => { p.cancelScheduledValues(now); p.setTargetAtTime(v, now, ramp ? 0.04 : 0.001); };
    const e = [st.f1, st.f2, st.f3], Lmax = Math.max(...m.bands.map(b => b.L1).filter(isFinite), 0);
    g.bands.forEach((B, i) => {
      let k = 0;
      B.chain.forEach(f => { if (i === 0 && k === 0 && f.type === 'highpass'){ k++; return; } if (f.type === 'lowpass' && i === 3) return; const fr = f.type === 'highpass' ? e[i - 1] : e[i]; set(f.frequency, fr); });
      const b = m.bands[i]; set(B.gain.gain, b.on ? clamp(Math.pow(10, (b.L1 - Lmax) / 20), 0.05, 1) : 0);
      const want = b.od > 1 ? 1 + Math.min(6, (b.od - 1) * 2.5) : 1.01; if (Math.abs(want - B.k) > 0.05){ B.drive.curve = shaperCurve(want); B.k = want; }
    });
    const over = clamp(m.od, 0, 16), pushDb = over > 1 ? Math.min(12, 20 * log10(over)) : 0;
    set(g.push.gain, Math.pow(10, pushDb / 20)); set(g.makeup.gain, Math.pow(10, -pushDb / 40));
    const S = SETTINGS[st.set];
    if (S.verb && g.roomName !== st.set){ g.room.buffer = impulse(c, S.verb); g.roomName = st.set; }
    set(g.wet.gain, S.wet); g.rgain.gain.value = S.gain;
    const far = st.where === 'far';
    set(g.dist.frequency, far ? (st.set === 'field' ? 2600 : 260) : 20000);
    set(g.distG.gain, far ? (st.set === 'field' ? 0.35 : 0.5) : 1);
    set(g.vol.gain, st.playing ? st.vol : 0);
  }

  /* ---------- drawing ---------- */
  const css = (n, v) => (getComputedStyle(n).getPropertyValue(v) || '').trim() || '#888';
  function drawStacks(svg, st){
    const W = 340, H = 230, base = 205, bw = 92, x0 = [22, W - 22 - bw], parts = [];
    const sizes = { sub: 46, kick: 34, mid: 26, top: 16 };
    let maxH = 0; TYPES.forEach(t => maxH += st.n[t.id] * sizes[t.id]); const sc = maxH > 185 ? 185 / maxH : 1;
    x0.forEach(x => {
      let y = base;
      TYPES.forEach(t => { for (let k = 0; k < st.n[t.id]; k++){ const h = sizes[t.id] * sc; y -= h; const col = `var(${t.col})`, cxm = x + bw / 2, cy = y + h / 2;
        parts.push(`<rect x="${x}" y="${y + 1}" width="${bw}" height="${h - 2}" rx="2" style="fill:var(--bg3);stroke:${col};stroke-width:1.5"/>`);
        if (t.id === 'sub') parts.push(`<path d="M${x + 8} ${y + h - 4} L${x + 22} ${y + 5} L${x + bw - 22} ${y + 5} L${x + bw - 8} ${y + h - 4} Z" style="fill:none;stroke:${col};stroke-width:1.2"/><line x1="${x + 8}" y1="${y + h - 4}" x2="${x + bw - 8}" y2="${y + h - 4}" style="stroke:${col};stroke-width:1.2"/>`);
        if (t.id === 'kick') [-1, 1].forEach(s => parts.push(`<circle cx="${cxm + s * 22}" cy="${cy}" r="${Math.min(13, h / 2 - 4)}" style="fill:none;stroke:${col};stroke-width:1.2"/><circle cx="${cxm + s * 22}" cy="${cy}" r="3" style="fill:${col}"/>`));
        if (t.id === 'mid') parts.push(`<path d="M${x + 14} ${y + 4} L${cxm - 6} ${cy - 2} L${cxm + 6} ${cy - 2} L${x + bw - 14} ${y + 4} M${x + 14} ${y + h - 4} L${cxm - 6} ${cy + 2} L${cxm + 6} ${cy + 2} L${x + bw - 14} ${y + h - 4}" style="fill:none;stroke:${col};stroke-width:1.2"/>`);
        if (t.id === 'top') for (let j = 0; j < 4; j++) parts.push(`<circle cx="${x + 18 + j * 18.5}" cy="${cy}" r="${Math.max(2, h / 2 - 4)}" style="fill:none;stroke:${col};stroke-width:1.2"/>`);
      } });
    });
    parts.push(`<line x1="8" y1="${base + 1}" x2="${W - 8}" y2="${base + 1}" style="stroke:var(--muted);stroke-width:1"/>`);
    parts.push(`<text x="${W / 2}" y="${base + 18}" text-anchor="middle" style="fill:var(--muted);font:11px var(--f-mono)">dance floor</text>`);
    if (!TYPES.some(t => st.n[t.id])) parts.push(`<text x="${W / 2}" y="110" text-anchor="middle" style="fill:var(--muted);font-size:12px">no boxes yet: add some below</text>`);
    svg.innerHTML = parts.join('');
  }
  function drawResp(cv, st, m, host){
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(240, cv.clientWidth || 320), h = 170;
    if (cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const L = 30, R = 8, T = 10, B = 22, pw = w - L - R, ph = h - T - B, fx = f => L + pw * (log10(f / 20) / 3), fy = d => T + ph * (1 - (clamp(d, -36, 12) + 36) / 48);
    const muted = css(host, '--muted'), line = css(host, '--line'), text = css(host, '--text');
    x.font = '10px ' + css(host, '--f-mono'); x.fillStyle = muted; x.strokeStyle = line; x.lineWidth = 1;
    [50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(f => { x.beginPath(); x.moveTo(fx(f), T); x.lineTo(fx(f), T + ph); x.stroke(); x.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), fx(f) - 8, h - 7); });
    [0, -12, -24].forEach(d => { x.beginPath(); x.moveTo(L, fy(d)); x.lineTo(L + pw, fy(d)); x.stroke(); x.fillText(d + '', 2, fy(d) + 3); });
    const Lmax = Math.max(...m.bands.map(b => b.L1).filter(isFinite), 0), N = 160, tot = new Array(N).fill(0).map(() => [0, 0]);
    m.bands.forEach((b, i) => {
      if (!b.on) return; const gl = Math.pow(10, (b.L1 - Lmax) / 20); x.strokeStyle = css(host, b.t.col); x.globalAlpha = 0.75; x.lineWidth = 1.5; x.beginPath();
      for (let k = 0; k < N; k++){ const f = 20 * Math.pow(1000, k / (N - 1)), hr = bandResp(f, i, st), v = [hr[0] * gl, hr[1] * gl]; tot[k][0] += v[0]; tot[k][1] += v[1]; const d = 20 * log10(Math.hypot(v[0], v[1]) + 1e-6); k ? x.lineTo(fx(f), fy(d)) : x.moveTo(fx(f), fy(d)); }
      x.stroke();
    });
    x.globalAlpha = 1; x.strokeStyle = text; x.lineWidth = 2.2; x.beginPath();
    tot.forEach((v, k) => { const f = 20 * Math.pow(1000, k / (N - 1)), d = 20 * log10(Math.hypot(v[0], v[1]) + 1e-6); k ? x.lineTo(fx(f), fy(d)) : x.moveTo(fx(f), fy(d)); }); x.stroke();
    x.setLineDash([3, 3]); x.strokeStyle = muted; [st.f1, st.f2, st.f3].forEach(f => { x.beginPath(); x.moveTo(fx(f), T); x.lineTo(fx(f), T + ph); x.stroke(); }); x.setLineDash([]);
    x.fillStyle = muted; x.fillText('dB', 2, T + 8);
  }

  /* ---------- the feature ---------- */
  const INST = new WeakMap();
  function hookBus(){ if (window.SoundBus && SoundBus.register) SoundBus.register(NAME, () => document.querySelectorAll('section.feat-stack').forEach(s => { const I = s._inst; if (I && I.st.playing) I.pause(); })); }   /* the book's one stop registry (build/soundbus.js) */

  function mount(pageEl, id){
    if (!pageEl) return null;
    unmount(pageEl);
    const st = load(); st.playing = false;
    const sec = el('section', { class: 'feature feat-stack', 'aria-labelledby': 'fsk-h-' + id, 'data-src': 'sy1 sy2 sy3 sy4 sy5' });
    const h = el('h3', { id: 'fsk-h-' + id, text: 'Build a stack' });
    const intro = el('p', { class: 'fs-lede', text: 'Stack the boxes, set the crossovers and the amplifier, choose the room, and hear a generated loop through the result. The numbers are a rough model, not a measurement.' });
    const notice = el('p', { class: 'fs-notice', role: 'note' }, el('b', { text: 'Headphones and speakers: ' }), 'this starts quiet and its output is limited, so it cannot play louder than the level you set. Turn your device volume down before you press Play.');
    const playB = el('button', { type: 'button', class: 'fs-play', 'aria-pressed': 'false', text: 'Play' });
    const vol = el('input', { type: 'range', min: '0', max: '0.6', step: '0.01', value: String(st.vol), 'aria-label': 'Listening volume', class: 'fs-vol' });
    const volOut = el('output', { class: 'fs-out', text: Math.round(st.vol / 0.6 * 100) + '%' });
    const limLamp = el('span', { class: 'fs-lamp', 'aria-hidden': 'true' });
    const limTxt = el('span', { class: 'fs-limtxt', text: 'limiter idle' });
    const transport = el('div', { class: 'fs-row fs-transport' }, playB, el('label', { class: 'fs-vl' }, el('span', { text: 'Volume' }), vol, volOut), el('span', { class: 'fs-lim' }, limLamp, limTxt));

    const setRow = el('div', { class: 'fs-seg', role: 'radiogroup', 'aria-label': 'Setting' });
    Object.entries(SETTINGS).forEach(([k, S]) => setRow.append(el('button', { type: 'button', role: 'radio', 'data-k': k, 'aria-checked': String(st.set === k), text: S.name })));
    const whereRow = el('div', { class: 'fs-seg', role: 'radiogroup', 'aria-label': 'Listen from' });
    [['floor', 'On the floor'], ['far', '100 m away']].forEach(([k, n]) => whereRow.append(el('button', { type: 'button', role: 'radio', 'data-k': k, 'aria-checked': String(st.where === k), text: n })));

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 340 230'); svg.setAttribute('class', 'fs-svg'); svg.setAttribute('role', 'img');
    const boxes = el('div', { class: 'fs-boxes' });
    const cnt = {};
    TYPES.forEach(t => {
      const out = el('output', { class: 'fs-n', 'aria-live': 'polite', text: String(st.n[t.id]) });
      const minus = el('button', { type: 'button', class: 'fs-step', 'aria-label': 'One fewer ' + t.name.toLowerCase() + ' a side', text: '−' });
      const plus = el('button', { type: 'button', class: 'fs-step', 'aria-label': 'One more ' + t.name.toLowerCase() + ' a side', text: '+' });
      minus.onclick = () => { st.n[t.id] = Math.max(0, st.n[t.id] - 1); upd(); }; plus.onclick = () => { st.n[t.id] = Math.min(t.max, st.n[t.id] + 1); upd(); };
      cnt[t.id] = out;
      boxes.append(el('div', { class: 'fs-box', style: `--bc:var(${t.col})` }, el('span', { class: 'fs-bn', text: t.name }), el('span', { class: 'fs-stepper' }, minus, out, plus), el('small', { text: 'a side' })));
    });

    const sl = {};
    const slider = (key, label, min, max, stepv, fmt) => {
      const inp = el('input', { type: 'range', min: String(min), max: String(max), step: String(stepv), value: String(st[key]), 'aria-label': label });
      const out = el('output', { class: 'fs-out' }); sl[key] = { inp, out, fmt };
      inp.oninput = () => { st[key] = +inp.value; fixOrder(key); upd(); };
      return el('label', { class: 'fs-sl' }, el('span', { text: label }), inp, out);
    };
    const xoWrap = el('div', { class: 'fs-sliders' },
      slider('f1', 'Sub to kick crossover', 50, 200, 1, fmtHz), slider('f2', 'Kick to mid crossover', 150, 1500, 5, fmtHz), slider('f3', 'Mid to tweeter crossover', 1500, 10000, 50, fmtHz));
    const xoPre = el('div', { class: 'fs-pre' }, el('span', { class: 'fs-k', text: 'Crossovers in the book:' }));
    XO.forEach(([n, d, pid, v]) => xoPre.append(el('button', { type: 'button', class: 'fs-chip', 'data-src': pid, title: d, 'aria-label': n + ': ' + d, onclick: () => { Object.assign(st, v); fixOrder('f1'); upd(); say(n + ': ' + d); }, text: n })));
    const pw = slider('pv', 'Amplifier power', 0, 1000, 1, v => fmtW(powerOf(v)));
    const rigNote = el('p', { class: 'fs-cap fs-rig' });
    const kNote = el('p', { class: 'fs-cap' }, 'Hire rigs were sold by the K, a thousand watts of amplifier, and a 1,000-watt amplifier might deliver only 500 into most eight-ohm speakers, so a rig\'s K was a claim to be tested. ', src('sy2', 'The rig, chapter 02'));

    const cv = el('canvas', { class: 'fs-cv', role: 'img', 'aria-label': 'Frequency response sketch' });
    const legend = el('p', { class: 'fs-cap fs-legend' });
    TYPES.forEach(t => legend.append(el('span', { style: `--bc:var(${t.col})`, text: t.name })));
    legend.append(el('span', { class: 'fs-tot', text: 'all four together' }));
    const levels = el('div', { class: 'fs-levels', 'aria-live': 'polite' });
    const limits = el('div', { class: 'fs-limits' });
    const desc = el('p', { class: 'fs-desc', id: 'fsk-d-' + id });
    svg.setAttribute('aria-describedby', desc.id); cv.setAttribute('aria-describedby', desc.id);
    const live = el('p', { class: 'fs-sr', 'aria-live': 'polite' });
    const say = t => { live.textContent = t; };
    const caption = el('p', { class: 'fs-cap fs-made' }, 'A simplified illustration made for the book: generic boxes with no maker\'s design, a generated loop, and a rough model of level (inverse-square spreading, a guessed room, generic box sensitivities). Real rigs, rooms and fields behave in more complicated ways.');

    sec.append(h, intro, notice, transport,
      el('div', { class: 'fs-grid' },
        el('div', { class: 'fs-col' }, el('h4', { text: 'The stack' }), svg, boxes),
        el('div', { class: 'fs-col' }, el('h4', { text: 'Setting' }), setRow, el('h4', { text: 'Crossovers' }), xoWrap, xoPre, el('h4', { text: 'Amplifier' }), pw, rigNote, kNote)),
      el('h4', { text: 'What the stack does to the sound' }), cv, legend, desc,
      el('h4', { text: 'How loud, roughly' }), el('div', { class: 'fs-row' }, el('span', { class: 'fs-k', text: 'Hear it from:' }), whereRow), levels,
      el('h4', { text: 'What the book says the limits are' }), limits, caption, live);

    function fixOrder(k){ st.f1 = clamp(st.f1, 50, 200); st.f2 = clamp(st.f2, Math.max(150, st.f1 * 1.5), 1500); st.f3 = clamp(st.f3, Math.max(1500, st.f2 * 2), 10000); if (k !== 'f1' && st.f2 < st.f1 * 1.5) st.f1 = Math.max(50, st.f2 / 1.5); }

    let g = null, timer = null, nextT = 0, stepI = 0, io = null, lastLim = -1, raf = 0;
    const m0 = () => model(st);
    function limiterLamp(m){ const on = st.playing && m.od > 1; if (on === lastLim) return; lastLim = on; limLamp.classList.toggle('on', on); limTxt.textContent = !st.playing ? 'limiter idle' : on ? 'overdriven: the limiter is holding it' : 'within the boxes\' power'; }
    function upd(){
      const m = m0();
      Object.entries(sl).forEach(([k, s]) => { s.inp.value = String(st[k]); s.out.textContent = s.fmt(st[k]); s.inp.setAttribute('aria-valuetext', s.out.textContent); });
      TYPES.forEach(t => { cnt[t.id].textContent = String(st.n[t.id]); });
      setRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.k === st.set)));
      whereRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.k === st.where)));
      const P = m.P, near = RIGS.reduce((a, r) => Math.abs(log10(r[0] / P)) < Math.abs(log10(a[0] / P)) ? r : a);
      rigNote.innerHTML = ''; if (Math.abs(log10(near[0] / P)) < 0.12) rigNote.append('Close to ' + near[1] + '. ', src(near[2]));
      else rigNote.append(fmtW(P) + ' across the whole system, both stacks.');
      drawStacks(svg, st); drawResp(cv, st, m, sec); levelsBox(m); limitsBox(m); describe(m);
      if (g) applyGraph(g, st, m, true); limiterLamp(m); save(st);
    }
    const r0 = v => isFinite(v) ? Math.round(v) : '–';
    function levelsBox(m){
      const S = SETTINGS[st.set], out = st.set === 'field';
      levels.innerHTML = '';
      const card = (t, a, b, note) => el('div', { class: 'fs-lv' }, el('span', { class: 'fs-k', text: t }), el('b', { text: a }), el('span', { text: b }), note ? el('small', { text: note }) : null);
      if (!m.any){ levels.append(el('p', { class: 'fs-cap', text: 'Add some boxes to get an estimate.' })); return; }
      levels.append(card('On the floor, about ' + S.floor + ' m from the stacks', '≈ ' + r0(m.floor.L) + ' dB', '≈ ' + r0(m.floor.A) + ' dB(A)', out ? 'Open air: the level falls by about 6 dB each time the distance doubles.' : 'Indoors the room holds the level up: reflections add to the direct sound.'));
      levels.append(card('At a boundary 100 m away', '≈ ' + r0(m.far.L) + ' dB', '≈ ' + r0(m.far.A) + ' dB(A) · bass band ≈ ' + r0(m.far.bass) + ' dB', out ? 'Inverse-square spreading only; no wind, ground or barriers. The bass band falls least in dB(A) terms and carries furthest.' : 'As if nothing stood in the way. Walls and doors would take a great deal off, by an amount this model cannot know.'));
      if (m.od > 1) levels.append(el('p', { class: 'fs-cap fs-warn', text: 'Some boxes are getting more power than they can take, so the model holds them at their limit and the limiter flattens the peaks: more amplifier no longer means more level, only more distortion.' }));
    }
    function limitsBox(m){
      const rows = [], out = st.set === 'field', F = m.floor, X = m.far;
      const cmp = (est, lim) => !isFinite(est) ? '' : est > lim + 0.5 ? 'the model\'s estimate is above this' : 'the model\'s estimate is below this';
      rows.push(['For the audience', 'The World Health Organization\'s standard for safe listening venues: an average of 100 dB over 15 minutes, with live monitoring, earplugs and quiet zones.', 'sy4', cmp(F.L, 100)]);
      rows.push(['For the audience', 'Chichester\'s environmental health officers, 2008: limiters at an event average of 107 dB(A), warnings above 96, and three metres between dancers and speakers.', 'sy4', cmp(F.A, 107)]);
      rows.push(['For the audience', 'There is no law on audience exposure; the Health and Safety Executive\'s event guidance recommends a 140 dB(C) peak and never less than a metre from a loudspeaker.', 'sy4', '']);
      rows.push(['For the staff', 'The Control of Noise at Work Regulations 2005, in force for music and entertainment from 6 April 2008: employers act at a daily exposure of 80 and 85 dB(A); the limit is 87 dB(A).', 'sy4', cmp(F.A, 87)]);
      if (out){
        rows.push(['Licence, at the desk', 'Glastonbury 1994: a 96 dB threshold on the NME Stage, and a 99 dB limit on the main stage that Mendip Council monitored from the mixing desk.', 'sy2', cmp(F.L, 99)]);
        rows.push(['At the neighbours', 'The Pop Code (Noise Council, 1995), at one metre from the façade of noise-sensitive premises, averaged over 15 minutes, for one to three concert days a year: 65 dB(A) at rural and most urban venues, 75 dB(A) at urban stadiums and arenas.', 'sy4', cmp(X.A, 65)]);
        rows.push(['At the neighbours', 'Luton\'s guidance, 2011: music no more than 15 dB(A) above background, and no more than 71 dB in either the 63 Hz or the 125 Hz octave band.', 'sy4', isFinite(X.bass) ? (X.bass > 71.5 ? 'the model\'s bass band is above 71 dB' : 'the model\'s bass band is below 71 dB') : '']);
        rows.push(['The law on the rig', 'The Criminal Justice and Public Order Act 1994, section 63: a gathering of 100 or more people on land in the open air, with amplified music at night likely to cause serious distress to local residents; sections 64 to 67 let the police seize the sound equipment and a court order it forfeited.', 'sy2', '']);
      } else {
        rows.push(['At the neighbours', 'Indoors the fight is with new flats: in Manchester a noise abatement notice on a club was upheld in 2024 but varied so its weekend nights could go on, with a noise limiter.', 'sy4', '']);
      }
      limits.innerHTML = '';
      const ul = el('ul', { class: 'fs-lim-list' });
      rows.forEach(([k, t, pid, c]) => ul.append(el('li', { 'data-src': pid }, el('span', { class: 'fs-k', text: k }), el('span', { text: t + ' ' }), src(pid, 'The rig, ' + (pid === 'sy2' ? 'chapter 02' : 'chapter 04')), c ? el('em', { text: ' · ' + c + ' (rough)' }) : null)));
      limits.append(ul);
      limits.append(el('p', { class: 'fs-cap' }, 'For comparison, rooms in the book: Rosner\'s 1979 disco standard asked for 115 to 120 dB of full-range sound for hours, where early discos rarely passed 100 dB ', src('sy1', '(chapter 01)'), '; the Ministry of Sound\'s Box ran at about 115 dBA and Despacio averaged 100 dB with a limiter ', src('sy3', '(chapter 03)'), '.'));
    }
    function describe(m){
      const parts = TYPES.map(t => st.n[t.id] + ' ' + t.name.toLowerCase()).join(', ');
      const holes = m.bands.filter(b => !b.on).map(b => b.t.name.toLowerCase());
      desc.textContent = `Two stacks, each with ${parts}, crossed over at ${fmtHz(st.f1)}, ${fmtHz(st.f2)} and ${fmtHz(st.f3)}, on ${fmtW(m.P)} of amplifier, in a ${SETTINGS[st.set].name.toLowerCase()}. The sketch shows each box's band as a coloured curve and the whole system as the thick line${holes.length ? '; with no ' + holes.join(' or ') + ' there is a hole in the response where that band should be' : ''}. Rough estimate: about ${r0(m.floor.L)} dB on the floor and about ${r0(m.far.A)} dB(A) at 100 m.`;
    }

    function tick(){
      if (!g || !st.playing) return; const c = g.c, d = 60 / BPM / 4;
      while (nextT < c.currentTime + 0.12){ step(g.ch, stepI, nextT, d); stepI++; nextT += d; }
    }
    function play(){
      hookBus(); if (window.SoundBus) try { SoundBus.claim(NAME); } catch (e) {}
      if (!g) g = makeGraph(st, I);
      st.playing = true; const c = g.c; if (c.state === 'suspended') c.resume().catch(() => {});
      nextT = c.currentTime + 0.08; stepI = 0; applyGraph(g, st, m0(), true);
      g.vol.gain.cancelScheduledValues(c.currentTime); g.vol.gain.setValueAtTime(0, c.currentTime); g.vol.gain.linearRampToValueAtTime(st.vol, c.currentTime + 0.6);
      clearInterval(timer); timer = setInterval(tick, 25); tick();
      playB.textContent = 'Pause'; playB.setAttribute('aria-pressed', 'true'); sec.classList.add('playing'); lastLim = -1; limiterLamp(m0());
    }
    function pause(){
      st.playing = false; clearInterval(timer); timer = null;
      if (g){ const c = g.c, n = c.currentTime; g.vol.gain.cancelScheduledValues(n); g.vol.gain.setValueAtTime(g.vol.gain.value, n); g.vol.gain.linearRampToValueAtTime(0, n + 0.05); }
      playB.textContent = 'Play'; playB.setAttribute('aria-pressed', 'false'); sec.classList.remove('playing'); lastLim = -1; limiterLamp(m0());
    }
    playB.onclick = () => st.playing ? pause() : play();
    vol.oninput = () => { st.vol = +vol.value; volOut.textContent = Math.round(st.vol / 0.6 * 100) + '%'; vol.setAttribute('aria-valuetext', volOut.textContent); if (g && st.playing) g.vol.gain.setTargetAtTime(st.vol, g.c.currentTime, 0.03); };
    const radio = (row, key) => { row.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st[key] = b.dataset.k; upd(); b.focus(); });
      row.addEventListener('keydown', e => { if (!/^Arrow/.test(e.key)) return; e.preventDefault(); const bs = [...row.querySelectorAll('button')], i = bs.findIndex(b => b.dataset.k === st[key]), j = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length; st[key] = bs[j].dataset.k; upd(); bs[j].focus(); }); };
    radio(setRow, 'set'); radio(whereRow, 'where');
    const roving = row => row.querySelectorAll('button').forEach(b => b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1);
    const upd0 = upd; upd = () => { upd0(); roving(setRow); roving(whereRow); };

    const onVis = () => { if (document.hidden && st.playing) pause(); };
    document.addEventListener('visibilitychange', onVis);
    if ('IntersectionObserver' in window){ io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && st.playing) pause(); }), { threshold: 0 }); io.observe(sec); }
    let ro = null; if ('ResizeObserver' in window){ ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => drawResp(cv, st, m0(), sec)); }); ro.observe(cv); }
    const onTheme = new MutationObserver(() => drawResp(cv, st, m0(), sec)); onTheme.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const I = { st, play, pause, destroy(){ pause(); clearInterval(timer); document.removeEventListener('visibilitychange', onVis); if (io) io.disconnect(); if (ro) ro.disconnect(); onTheme.disconnect(); if (g){ try { g.cap.disconnect(); } catch (e) {} g = null; } } };
    sec._inst = I;

    const anchor = pageEl.querySelector('.grid2') || null, nav = pageEl.querySelector('.pagenav, .margin-note');
    if (anchor && anchor.parentNode === pageEl) anchor.after(sec); else if (nav && nav.parentNode === pageEl) nav.before(sec); else pageEl.appendChild(sec);
    upd();
    return sec;
  }
  function unmount(pageEl){ if (!pageEl) return; pageEl.querySelectorAll('section.feat-stack').forEach(s => { if (s._inst) s._inst.destroy(); s.remove(); }); }

  (window.FEATURES = window.FEATURES || []).push({ name: NAME, pages: ['sy4'], anchor: null, mount, unmount });
})();
