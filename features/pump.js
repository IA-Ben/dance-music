/* ===================================================================
   PUMP — "The pump", for The studio (k7).
   A four-bar generated loop (kick, bass, chords, hats) through four
   studio moves, each with an A/B bypass: sidechain ducking (with the
   gain-reduction trace), a resonant filter sweep, a bit-depth and
   sample-rate reducer (the engine's dm-crush worklet), and a format
   switch imitating vinyl, DAT/CD and a low-bitrate MP3.
   Uses the engine's AudioCore, voices (S), DSP worklets and SoundBus
   when present.
   =================================================================== */
(() => {
  const NAME = 'pump', KEY = 'feat-pump', BPM = 124, BEAT = 60 / BPM, STEP = BEAT / 4, BARS = 4;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), log10 = Math.log10;
  const el = (tag, at, ...kids) => { const e = document.createElement(tag); if (at) for (const k in at){ if (k === 'text') e.textContent = at[k]; else if (k.startsWith('on')) e[k] = at[k]; else e.setAttribute(k, at[k]); } kids.forEach(k => k != null && e.append(k)); return e; };
  const src = (id, label) => el('a', { href: '#' + id, 'data-src': id, class: 'fp-src' }, label || 'from the book');
  const fmtHz = f => f >= 1000 ? (Math.round(f / 100) / 10) + ' kHz' : Math.round(f) + ' Hz';
  const cutOf = v => 40 * Math.pow(450, v / 1000), vOfCut = f => Math.round(1000 * Math.log(f / 40) / Math.log(450));

  const DEF = { sc: { on: true, depth: 12, rel: 220 }, fl: { on: true, type: 'lowpass', cv: 760, q: 6 }, cr: { on: false, bits: 12, rate: 26040 }, fm: { on: false, mode: 'vinyl' }, vol: 0.15 };
  const load = () => { const d = JSON.parse(JSON.stringify(DEF)); try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) ['sc', 'fl', 'cr', 'fm'].forEach(k => Object.assign(d[k], s[k] || {})); } catch (e) {} return d; };
  const save = st => { try { localStorage.setItem(KEY, JSON.stringify({ sc: st.sc, fl: st.fl, cr: st.cr, fm: st.fm })); } catch (e) {} };

  /* ---------- audio context: the engine's if it is there ---------- */
  function engine(){
    if (typeof AudioCore !== 'undefined' && AudioCore.get){ const ch = AudioCore.get(); return { c: ch.c, out: ch.out }; }
    if (!engine.own){ const c = new (window.AudioContext || window.webkitAudioContext)(); const g = c.createGain(); g.connect(c.destination); engine.own = { c, out: g }; }
    if (engine.own.c.state === 'suspended') engine.own.c.resume().catch(() => {});
    return engine.own;
  }
  const noise = c => { if (typeof AudioCore !== 'undefined' && AudioCore.noise) return AudioCore.noise(c); const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
  function crackleBuf(c){ const len = c.sampleRate * 4, b = c.createBuffer(2, len, c.sampleRate); for (let k = 0; k < 2; k++){ const d = b.getChannelData(k); for (let n = 0; n < 34; n++){ const i = Math.floor(Math.random() * (len - 80)), a = (Math.random() < 0.15 ? 0.9 : 0.3) * (Math.random() < 0.5 ? -1 : 1); for (let j = 0; j < 40; j++) d[i + j] += a * Math.exp(-j / 6) * (j % 2 ? -0.6 : 1); } } return b; }
  const quantCurve = bits => { const n = 4096, a = new Float32Array(n), q = Math.pow(2, bits - 1); for (let i = 0; i < n; i++){ const x = i * 2 / (n - 1) - 1; a[i] = Math.round(x * q) / q; } return a; };

  /* ---------- the loop: four bars in A minor, engine voices where they exist ---------- */
  const PROG = [[0, [0, 3, 7, 12]], [-4, [0, 4, 7, 12]], [3, [0, 4, 7, 12]], [-2, [0, 4, 7, 12]]];
  const has = n => typeof S !== 'undefined' && S && typeof S[n] === 'function';
  const FB = {
    kick(c, t, d){ const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.05); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.38); o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.4); },
    saws(c, t, d, fs, dur, lv, cut){ const f = c.createBiquadFilter(), g = c.createGain(); f.frequency.value = cut; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.02); g.gain.setValueAtTime(lv, t + dur * 0.85); g.gain.linearRampToValueAtTime(0, t + dur); fs.forEach(fr => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + dur + 0.05); }); f.connect(g); g.connect(d); },
    hat(c, t, d, lv, dec){ const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise(c); f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(lv, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec); n.connect(f); f.connect(g); g.connect(d); n.start(t, Math.random()); n.stop(t + dec + 0.02); }
  };
  function step(G, i, t){
    const ch = G.ch, c = G.c, s = i % 16, bar = Math.floor(i / 16) % BARS, [semi, chord] = PROG[bar], root = 55 * Math.pow(2, semi / 12);
    if (s % 4 === 0){ if (has('kick')) S.kick(ch, t, { dest: G.kick }); else FB.kick(c, t, G.kick); G.duck(t); }
    if (s % 4 === 2){ if (has('hat')) S.hat(ch, t, { dest: G.hat, open: true, decay: 0.16, level: 0.2 }); else FB.hat(c, t, G.hat, 0.18, 0.15); }
    if (s === 4 || s === 12){ if (has('clap')) S.clap(ch, t, { dest: G.hat, level: 0.45 }); else FB.hat(c, t, G.hat, 0.4, 0.18); }
    if (s === 0 || s === 8){ const dur = BEAT * 2 * 0.97; if (has('reese')) S.reese(ch, t, { dest: G.bass, freq: root, dur, level: 0.32, cutoff: 380, spread: 0.6 }); else FB.saws(c, t, G.bass, [root, root * 1.005], dur, 0.3, 400); }
    if (s === 0){ const dur = BEAT * 4; if (has('pad')) S.pad(ch, t, { dest: G.chord, root: 440 * Math.pow(2, semi / 12), chord, dur, level: 0.09, cutoff: 2400, lfo: 0.2 }); else FB.saws(c, t, G.chord, chord.map(x => 220 * Math.pow(2, (semi + x) / 12)), dur, 0.05, 2000); }
  }

  function section(c, inNode){ const s = { in: c.createGain(), out: c.createGain(), wet: c.createGain(), dry: c.createGain() }; s.in.connect(s.dry); s.dry.connect(s.out); s.wet.connect(s.out); if (inNode) inNode.connect(s.in); return s; }
  const ab = (c, s, on) => { const n = c.currentTime; s.wet.gain.setTargetAtTime(on ? 1 : 0, n, 0.015); s.dry.gain.setTargetAtTime(on ? 0 : 1, n, 0.015); };

  function makeGraph(st){
    const E = engine(), c = E.c, G = { c };
    G.kick = c.createGain(); G.hat = c.createGain(); G.bass = c.createGain(); G.chord = c.createGain();
    G.scB = c.createGain(); G.scC = c.createGain(); G.mix = c.createGain(); G.mix.gain.value = 0.8;
    G.bass.connect(G.scB); G.chord.connect(G.scC); [G.kick, G.hat, G.scB, G.scC].forEach(n => n.connect(G.mix));
    G.verbSink = c.createGain();
    G.ch = { c, live: false, out: G.mix, duck: G.chord, tr: null, verbSend: G.verbSink, delSend: G.verbSink };
    // filter
    G.F = section(c, G.mix); G.flt = c.createBiquadFilter(); G.F.in.connect(G.flt); G.flt.connect(G.F.wet);
    // crusher: the engine's worklet if it loads, a quantising waveshaper if not
    G.C = section(c, G.F.out); G.crIn = c.createGain(); G.crOut = c.createGain(); G.C.in.connect(G.crIn); G.crOut.connect(G.C.wet);
    G.crQ = c.createWaveShaper(); G.crIn.connect(G.crQ); G.crQ.connect(G.crOut); G.crKind = 'shaper';
    const tryWorklet = () => { if (G.crKind === 'worklet') return; try { const w = new AudioWorkletNode(c, 'dm-crush', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] }); G.crIn.disconnect(); G.crIn.connect(w); w.connect(G.crOut); G.crW = w; G.crKind = 'worklet'; G.setCrush && G.setCrush(); } catch (e) {} };
    if (window.DSP && DSP.load){ if (DSP.ready(c)) tryWorklet(); else DSP.load(c).then(ok => { if (ok) tryWorklet(); G.onCrush && G.onCrush(); }); }
    // format
    G.M = section(c, G.C.out); G.paths = {};
    const P = n => { const g = c.createGain(); g.gain.value = 0; g.connect(G.M.wet); G.paths[n] = g; return g; };
    const vin = P('vinyl'), lp = c.createBiquadFilter(), sh = c.createBiquadFilter(), hp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 11000; lp.Q.value = 0.5; sh.type = 'highshelf'; sh.frequency.value = 6000; sh.gain.value = -4; hp.type = 'highpass'; hp.frequency.value = 22; hp.Q.value = 0.5;
    G.M.in.connect(hp); hp.connect(lp); lp.connect(sh); sh.connect(vin); G.vinF = [hp, lp, sh];
    G.vinNoise = c.createGain(); G.vinNoise.gain.value = 0; G.vinNoise.connect(vin);
    const cln = P('clean'); G.M.in.connect(cln);
    const mp3 = P('mp3'), dl = c.createDelay(0.05), l1 = c.createBiquadFilter(), l2 = c.createBiquadFilter(), lo = c.createBiquadFilter(), hi = c.createBiquadFilter(), pre = c.createBiquadFilter();
    dl.delayTime.value = 0.018; [l1, l2].forEach(f => { f.type = 'lowpass'; f.frequency.value = 10500; f.Q.value = 0.7071; }); lo.type = 'lowpass'; lo.frequency.value = 3000; hi.type = 'highpass'; hi.frequency.value = 3000; pre.type = 'highpass'; pre.frequency.value = 2500;
    G.swirl = c.createGain(); G.ring = c.createGain(); G.ring.gain.value = 0; const preG = c.createGain(); preG.gain.value = 0.55;
    G.M.in.connect(dl); dl.connect(l1); l1.connect(l2); l2.connect(lo); l2.connect(hi); lo.connect(mp3); hi.connect(G.swirl); G.swirl.connect(mp3);
    G.M.in.connect(pre); pre.connect(G.ring); G.ring.connect(preG); preG.connect(l2); G.mp3F = [l1, l2];
    // out: volume, safety limiter, cap, then the engine's master
    G.vol = c.createGain(); G.vol.gain.value = 0; G.M.out.connect(G.vol);
    G.safe = c.createDynamicsCompressor(); G.safe.threshold.value = -14; G.safe.knee.value = 0; G.safe.ratio.value = 20; G.safe.attack.value = 0.001; G.safe.release.value = 0.1;
    G.cap = c.createGain(); G.cap.gain.value = 0.5; G.vol.connect(G.safe); G.safe.connect(G.cap); G.cap.connect(E.out);
    G.duck = t => {
      if (!st.sc.on || st.sc.depth <= 0) return; const fl = Math.pow(10, -st.sc.depth / 20), tau = Math.max(0.01, st.sc.rel / 1000 / 4);
      [G.scB.gain, G.scC.gain].forEach(p => { p.setTargetAtTime(fl, t, 0.003); p.setTargetAtTime(1, t + 0.015, tau); });
    };
    G.srcs = [];
    return G;
  }
  function startNoises(G){
    const c = G.c, t = c.currentTime;
    const r = c.createBufferSource(); r.buffer = noise(c); r.loop = true; const rl = c.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 28; const rg = c.createGain(); rg.gain.value = 0.9; r.connect(rl); rl.connect(rg); rg.connect(G.vinNoise);
    const k = c.createBufferSource(); k.buffer = crackleBuf(c); k.loop = true; const kh = c.createBiquadFilter(); kh.type = 'highpass'; kh.frequency.value = 900; const kg = c.createGain(); kg.gain.value = 0.22; k.connect(kh); kh.connect(kg); kg.connect(G.vinNoise);
    const h = c.createBufferSource(); h.buffer = noise(c); h.loop = true; const hg = c.createGain(); hg.gain.value = 0.006; h.connect(hg); hg.connect(G.vinNoise);
    const m = c.createBufferSource(); m.buffer = noise(c); m.loop = true; m.connect(G.ring.gain);
    [r, k, h, m].forEach(s => s.start(t)); G.srcs = [r, k, h, m];
  }
  const stopNoises = G => { G.srcs.forEach(s => { try { s.stop(); s.disconnect(); } catch (e) {} }); G.srcs = []; };

  /* ---------- response helpers (analytic biquads) ---------- */
  const biq = (f, fc, q, type) => { const w = f / fc, re = 1 - w * w, im = w / q, den = re * re + im * im; return type === 'highpass' ? (w * w * w * w) / den : 1 / den; };
  const grCurve = (st, dt) => { if (!st.sc.on) return 0; const fl = Math.pow(10, -st.sc.depth / 20), tau = Math.max(0.01, st.sc.rel / 1000 / 4); const v15 = 1 - (1 - fl) * (1 - Math.exp(-0.015 / 0.003)); const v = dt < 0.015 ? 1 - (1 - fl) * (1 - Math.exp(-dt / 0.003)) : 1 - (1 - v15) * Math.exp(-(dt - 0.015) / tau); return 20 * log10(v); };
  const css = (n, v) => (getComputedStyle(n).getPropertyValue(v) || '').trim() || '#888';
  function canvasCtx(cv, h){ const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(200, cv.clientWidth || 300); if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h); return [x, w]; }

  /* ---------- the feature ---------- */
  function hookBus(){ if (window.SoundBus && SoundBus.register) SoundBus.register(NAME, () => document.querySelectorAll('section.feat-pump').forEach(s => { const I = s._inst; if (I && I.st.playing) I.pause(); })); }   /* the book's one stop registry (build/soundbus.js) */

  function mount(pageEl, id){
    if (!pageEl) return null;
    unmount(pageEl);
    const st = load(); st.playing = false;
    const sec = el('section', { class: 'feature feat-pump', 'aria-labelledby': 'fpm-h-' + id, 'data-src': 'k7 a8 a4 hh6 k6 k2 sy5 bt1 rs2' });
    const live = el('p', { class: 'fp-sr', 'aria-live': 'polite' }), say = t => { live.textContent = t; };
    const notice = el('p', { class: 'fp-notice', role: 'note' }, el('b', { text: 'Headphones and speakers: ' }), 'this starts quiet and its output is limited, so it cannot play louder than the level you set. Turn your device volume down before you press Play.');
    const playB = el('button', { type: 'button', class: 'fp-play', 'aria-pressed': 'false', text: 'Play' });
    const stopB = el('button', { type: 'button', class: 'fp-stop', text: 'Stop' });
    const vol = el('input', { type: 'range', min: '0', max: '0.6', step: '0.01', value: String(st.vol), 'aria-label': 'Listening volume' });
    const volOut = el('output', { class: 'fp-out', text: Math.round(st.vol / 0.6 * 100) + '%' });
    const barOut = el('span', { class: 'fp-bar', text: 'bar – of 4' });

    const abBtn = (key, label) => { const b = el('button', { type: 'button', class: 'fp-ab', 'aria-pressed': String(st[key].on), 'aria-label': 'Use the ' + label + ' (A/B)' }); b.onclick = () => { st[key].on = !st[key].on; apply(); say(label + (st[key].on ? ' on' : ' bypassed')); }; return b; };
    const sl = {};
    const slider = (path, label, min, max, stp, fmt) => { const [a, b] = path.split('.'); const inp = el('input', { type: 'range', min: String(min), max: String(max), step: String(stp), value: String(st[a][b]), 'aria-label': label }); const out = el('output', { class: 'fp-out' }); sl[path] = { inp, out, fmt, a, b }; inp.oninput = () => { st[a][b] = +inp.value; if (path === 'fl.cv') sweepStop(); apply(); }; return el('label', { class: 'fp-sl' }, el('span', { text: label }), inp, out); };
    const seg = (key, field, opts, label) => { const row = el('div', { class: 'fp-seg', role: 'radiogroup', 'aria-label': label }); opts.forEach(([k, n]) => row.append(el('button', { type: 'button', role: 'radio', 'data-k': k, text: n })));
      const pick = k => { st[key][field] = k; apply(); }; row.addEventListener('click', e => { const b = e.target.closest('button'); if (b){ pick(b.dataset.k); b.focus(); } });
      row.addEventListener('keydown', e => { if (!/^Arrow/.test(e.key)) return; e.preventDefault(); const bs = [...row.querySelectorAll('button')], i = bs.findIndex(b => b.dataset.k === st[key][field]), j = (i + (/Right|Down/.test(e.key) ? 1 : bs.length - 1)) % bs.length; pick(bs[j].dataset.k); bs[j].focus(); });
      row._sync = () => row.querySelectorAll('button').forEach(b => { const on = b.dataset.k === st[key][field]; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }); return row; };
    const card = (title, abb, ...kids) => el('div', { class: 'fp-card' }, el('div', { class: 'fp-ch' }, el('h4', { text: title }), abb), ...kids);

    // 1 sidechain
    const abSC = abBtn('sc', 'sidechain'), grCv = el('canvas', { class: 'fp-cv', role: 'img', 'aria-label': 'Gain-reduction trace' }), grOut = el('span', { class: 'fp-k', text: '' });
    const c1 = card('1 · Sidechain: the bass ducks under the kick', abSC,
      slider('sc.depth', 'Depth', 0, 24, 1, v => '−' + v + ' dB'), slider('sc.rel', 'Release', 40, 600, 5, v => v + ' ms'), grCv, grOut,
      el('p', { class: 'fp-cap' }, 'The trace shows how far the bass and chords are turned down, beat by beat; the dashes mark the kicks. The book\'s mix chapter: a short attack, and a release set so the gain recovers just before the next kick, at 132 BPM under 450 ms and usually 150 to 300 ', src('a8', '(Anatomy, Mix)'), '. French touch was house built from filtered disco loops, sidechained until the whole record breathed ', src('hh6', '(house, 06)'), '; Cubase 4, announced in September 2006, added native sidechaining ', src('k7', '(The studio, 07)'), '. Here each kick note triggers the duck directly, as the book\'s own engine does, rather than a detector listening to the kick.'));
    // 2 filter
    const abF = abBtn('fl', 'filter'), fType = seg('fl', 'type', [['lowpass', 'Low-pass'], ['highpass', 'High-pass']], 'Filter type');
    const sweepB = el('button', { type: 'button', class: 'fp-sweep', 'aria-pressed': 'false', text: 'Sweep over four bars' });
    const c2 = card('2 · Filter sweep', abF, fType, slider('fl.cv', 'Cutoff', 0, 1000, 1, v => fmtHz(cutOf(v))), slider('fl.q', 'Resonance', 0.7, 18, 0.1, v => 'Q ' + v.toFixed(1)), sweepB,
      el('p', { class: 'fp-cap' }, 'A low-pass takes the top off and a high-pass takes the bottom away; resonance makes a peak at the cutoff. Impulse Tracker added resonant filters in 1995 ', src('k6', '(The studio, 06)'), ', and the DJ mixer put filters under the hand ', src('k4', '(The studio, 04)'), '.'));
    // 3 crusher
    const abC = abBtn('cr', 'bit and rate reducer'), crNote = el('p', { class: 'fp-cap fp-crnote' });
    const stair = el('canvas', { class: 'fp-cv fp-stair', role: 'img', 'aria-label': 'One cycle of a sine wave at the chosen bit depth and sample rate' });
    const preset = (n, v, d) => el('button', { type: 'button', class: 'fp-chip', 'aria-label': n + ': ' + d, onclick: () => { Object.assign(st.cr, v, { on: true }); apply(); say(n + ' on'); }, text: n });
    const c3 = card('3 · Bit depth and sample rate', abC, slider('cr.bits', 'Bit depth', 4, 16, 1, v => v + '-bit'), slider('cr.rate', 'Sample rate', 2000, 48000, 10, v => fmtHz(v)),
      el('div', { class: 'fp-pre' }, preset('12-bit grit', { bits: 12, rate: 26040 }, 'twelve bits at a lowered sample rate'), preset('8-bit', { bits: 8, rate: 26040 }, 'eight bits'), preset('16-bit', { bits: 16, rate: 48000 }, 'sixteen bits, full rate')), stair, crNote,
      el('p', { class: 'fp-cap' }, 'The picture is one cycle of a 400 Hz tone; at 12 bits or more its steps are too fine to draw. Fewer bits mean coarser steps and more noise; a lower sample rate loses the top and folds false tones back down. The E-mu SP-1200 gave hardcore its grit ', src('k2', '(The studio, 02)'), '; the Amiga played four 8-bit channels ', src('k6', '(06)'), '; and the book\'s engine adds 12-bit sampler grit to its sampler-era presets ', src('k0', '(00)'), '.'));
    // 4 format
    const abM = abBtn('fm', 'format'), fmSeg = seg('fm', 'mode', [['vinyl', 'Vinyl'], ['clean', 'DAT / CD'], ['mp3', 'Low-bitrate MP3']], 'Format'), fmNote = el('p', { class: 'fp-cap fp-fmnote' });
    const respCv = el('canvas', { class: 'fp-cv', role: 'img', 'aria-label': 'Frequency response of the filter and format' });
    const c4 = card('4 · Format', abM, fmSeg, fmNote, el('h4', { class: 'fp-sub', text: 'Filter and format, by frequency' }), respCv);

    const desc = el('p', { class: 'fp-desc', id: 'fpm-d-' + id }); [grCv, stair, respCv].forEach(cv => cv.setAttribute('aria-describedby', desc.id));
    sec.append(el('h3', { id: 'fpm-h-' + id, text: 'The pump' }),
      el('p', { class: 'fp-lede', text: 'Four generated bars of kick, bass and chords through four studio moves. Each has an A/B button, so you can hear it on and off.' }),
      notice, el('div', { class: 'fp-row fp-transport' }, playB, stopB, el('label', { class: 'fp-vl' }, el('span', { text: 'Volume' }), vol, volOut), barOut),
      el('div', { class: 'fp-grid' }, c1, c2, c3, c4), desc,
      el('p', { class: 'fp-cap fp-made', text: 'A simplified illustration made for the book: a generated loop and generic effects. The vinyl and MP3 settings imitate what you hear from those formats; they are approximations, not a record cut or an encoder.' }), live);

    let G = null, timer = null, nextT = 0, stepI = 0, t0 = 0, raf = 0, io = null, sweep = null, hist = [], lastTxt = 0, lastSwirl = 0;
    const FMT = {
      vinyl: ['An imitation of a record: low rumble, crackle and a rolled-off top. The twelve-inch spread its grooves so it could be cut louder, with bigger excursions in the bass ', 'bt1', '(The booth, 01)'],
      clean: ['Clean: what goes in comes out. The DAT decks of the raves recorded 16-bit audio at 48, 44.1 or 32 kHz ', 'sy5', '(The rig, 05)'],
      mp3: ['An imitation of a low-bitrate MP3, labelled as one: the top cut off, the highs swirling as the coder runs short of bits, and a smear of noise just before each hit, as pre-echo sounds. A real encoder works on blocks of frequencies and does none of this the same way. When MP3s arrived, one London shop found the vinyl stopped selling ', 'rs2', '(Record shops, 02)']
    };
    function apply(){
      Object.values(sl).forEach(s => { s.inp.value = String(st[s.a][s.b]); s.out.textContent = s.fmt(st[s.a][s.b]); s.inp.setAttribute('aria-valuetext', s.out.textContent); });
      [abSC, abF, abC, abM].forEach((b, i) => { const on = st[['sc', 'fl', 'cr', 'fm'][i]].on; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'A/B: on' : 'A/B: bypassed'; b.closest('.fp-card').classList.toggle('off', !on); });
      fType._sync(); fmSeg._sync();
      const f = FMT[st.fm.mode]; fmNote.textContent = ''; fmNote.append(f[0], src(f[1], f[2]), '.');
      crNote.textContent = G && G.crKind === 'shaper' ? 'This browser could not load the engine\'s crusher, so only the bit depth is heard here.' : '';
      if (G){
        const c = G.c, n = c.currentTime;
        ab(c, G.F, st.fl.on); ab(c, G.C, st.cr.on); ab(c, G.M, st.fm.on);
        G.flt.type = st.fl.type; G.flt.Q.setTargetAtTime(st.fl.q, n, 0.02); if (!sweep) G.flt.frequency.setTargetAtTime(cutOf(st.fl.cv), n, 0.02);
        G.setCrush();
        Object.entries(G.paths).forEach(([k, g]) => g.gain.setTargetAtTime(k === st.fm.mode ? 1 : 0, n, 0.02));
        G.vinNoise.gain.setTargetAtTime(st.fm.on && st.fm.mode === 'vinyl' && st.playing ? 0.5 : 0, n, 0.03);
        if (!st.sc.on){ [G.scB.gain, G.scC.gain].forEach(p => { p.cancelScheduledValues(n); p.setTargetAtTime(1, n, 0.01); }); }
      }
      describe(); drawStair(); drawResp(); if (!st.playing) drawGR(); save(st);
    }
    function describe(){
      desc.textContent = `Sidechain ${st.sc.on ? 'on, ducking the bass and chords by ' + st.sc.depth + ' dB with a ' + st.sc.rel + ' ms release' : 'bypassed'}; ${st.fl.on ? (st.fl.type === 'lowpass' ? 'low-pass' : 'high-pass') + ' filter at ' + fmtHz(cutOf(st.fl.cv)) + ', resonance ' + st.fl.q.toFixed(1) : 'filter bypassed'}; ${st.cr.on ? st.cr.bits + '-bit at ' + fmtHz(st.cr.rate) : 'bit reducer bypassed'}; format ${st.fm.on ? { vinyl: 'vinyl (imitation)', clean: 'DAT or CD (clean)', mp3: 'low-bitrate MP3 (imitation)' }[st.fm.mode] : 'bypassed'}. The first picture is the gain-reduction trace, the second a sine wave cut into steps by the bit depth and sample rate, the third what the filter and format do to each frequency.`;
    }
    function drawGR(){
      const h = 120, [x, w] = canvasCtx(grCv, h), L = 34, pw = w - L - 6, T = 8, ph = h - T - 18, fy = d => T + ph * (-clamp(d, -24, 0) / 24), BAR = BEAT * 4, fx = s => L + pw * s / BAR;
      const muted = css(sec, '--muted'), line = css(sec, '--line'), text = css(sec, '--text'), col = css(sec, '--c');
      x.font = '10px ' + css(sec, '--f-mono'); x.strokeStyle = line; x.fillStyle = muted; x.lineWidth = 1;
      [0, -6, -12, -18, -24].forEach(d => { x.beginPath(); x.moveTo(L, fy(d)); x.lineTo(L + pw, fy(d)); x.stroke(); x.fillText(String(d), 4, fy(d) + 3); });
      x.setLineDash([3, 3]); x.strokeStyle = muted; for (let b = 0; b < 4; b++){ x.beginPath(); x.moveTo(fx(b * BEAT), T); x.lineTo(fx(b * BEAT), T + ph); x.stroke(); x.fillText('kick', fx(b * BEAT) + 3, h - 5); } x.setLineDash([]);
      x.strokeStyle = st.playing ? muted : col; x.globalAlpha = st.playing ? 0.5 : 1; x.lineWidth = 2; x.beginPath();
      for (let k = 0; k <= 200; k++){ const s = BAR * k / 200, d = grCurve(st, s % BEAT); k ? x.lineTo(fx(s), fy(d)) : x.moveTo(fx(s), fy(d)); } x.stroke(); x.globalAlpha = 1;
      if (st.playing && hist.length > 1){ x.strokeStyle = col; x.lineWidth = 2.4; x.beginPath(); let prev = -1; hist.forEach(([s, d]) => { if (s < prev) x.moveTo(fx(s), fy(d)); else if (prev < 0) x.moveTo(fx(s), fy(d)); else x.lineTo(fx(s), fy(d)); prev = s; }); x.stroke(); const lst = hist[hist.length - 1]; x.fillStyle = text; x.fillRect(fx(lst[0]) - 1, T, 2, ph); }
      x.fillStyle = muted; x.fillText('dB', 4, T + 6);
    }
    function drawStair(){
      const h = 90, [x, w] = canvasCtx(stair, h), mid = h / 2, A = h * 0.4, on = st.cr.on, bits = on ? st.cr.bits : 16, rate = on ? st.cr.rate : 48000;
      const N = Math.max(3, Math.round(rate / 400)), q = Math.pow(2, bits - 1), qq = bits >= 12 ? 1e9 : q;
      x.strokeStyle = css(sec, '--line'); x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
      x.strokeStyle = css(sec, '--muted'); x.lineWidth = 1; x.beginPath(); for (let i = 0; i <= w; i++){ const y = mid - A * Math.sin(2 * Math.PI * i / w); i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke();
      x.strokeStyle = css(sec, '--c'); x.lineWidth = 2; x.beginPath();
      for (let k = 0; k < N; k++){ const x0 = w * k / N, x1 = w * (k + 1) / N, v = Math.round(Math.sin(2 * Math.PI * k / N) * qq) / qq, y = mid - A * v; k ? x.lineTo(x0, y) : x.moveTo(x0, y); x.lineTo(x1, y); } x.stroke();
      x.fillStyle = css(sec, '--muted'); x.font = '10px ' + css(sec, '--f-mono'); x.fillText(`${bits}-bit · ${fmtHz(rate)}`, 4, h - 4);
    }
    function drawResp(){
      const h = 130, [x, w] = canvasCtx(respCv, h), L = 30, pw = w - L - 6, T = 8, ph = h - T - 18, fx = f => L + pw * log10(f / 20) / 3, fy = d => T + ph * (1 - (clamp(d, -36, 18) + 36) / 54);
      const muted = css(sec, '--muted'), line = css(sec, '--line'), col = css(sec, '--c');
      x.font = '10px ' + css(sec, '--f-mono'); x.strokeStyle = line; x.fillStyle = muted; x.lineWidth = 1;
      [50, 100, 500, 1000, 5000, 10000].forEach(f => { x.beginPath(); x.moveTo(fx(f), T); x.lineTo(fx(f), T + ph); x.stroke(); x.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), fx(f) - 7, h - 4); });
      [12, 0, -12, -24].forEach(d => { x.beginPath(); x.moveTo(L, fy(d)); x.lineTo(L + pw, fy(d)); x.stroke(); x.fillText(String(d), 2, fy(d) + 3); });
      const cut = G && sweep ? G.flt.frequency.value : cutOf(st.fl.cv);
      x.strokeStyle = col; x.lineWidth = 2.2; x.beginPath();
      for (let k = 0; k <= 160; k++){
        const f = 20 * Math.pow(1000, k / 160); let p = 1;
        if (st.fl.on) p *= biq(f, cut, st.fl.q, st.fl.type);
        if (st.cr.on && f > st.cr.rate / 2) p *= 0.05;
        if (st.fm.on){ if (st.fm.mode === 'vinyl') p *= biq(f, 11000, 0.5, 'lowpass') * biq(f, 22, 0.5, 'highpass') * (f > 6000 ? 0.4 : 1); if (st.fm.mode === 'mp3') p *= Math.pow(biq(f, 10500, 0.7071, 'lowpass'), 2); }
        const d = 10 * log10(p + 1e-9); k ? x.lineTo(fx(f), fy(d)) : x.moveTo(fx(f), fy(d));
      } x.stroke(); x.fillStyle = muted; x.fillText('dB', 2, T + 6);
    }
    function frame(){
      raf = 0; if (!st.playing || !G) return; const c = G.c, now = c.currentTime, pos = Math.max(0, now - t0), BAR = BEAT * 4;
      hist.push([pos % BAR, 20 * log10(Math.max(1e-4, G.scB.gain.value))]); if (hist.length > 240) hist.shift();
      if (sweep){ const u = clamp((now - sweep.t) / (BAR * BARS), 0, 1), lo = st.fl.type === 'lowpass' ? 80 : 30, hi = st.fl.type === 'lowpass' ? 14000 : 3000, f = lo * Math.pow(hi / lo, u < 0.5 ? u * 2 : 2 - u * 2); G.flt.frequency.setTargetAtTime(f, now, 0.01); st.fl.cv = vOfCut(f); sl['fl.cv'].inp.value = String(st.fl.cv); sl['fl.cv'].out.textContent = fmtHz(f); if (u >= 1) sweepStop(); drawResp(); }
      if (performance.now() - lastTxt > 250){ lastTxt = performance.now(); barOut.textContent = 'bar ' + (1 + Math.floor(pos / BAR) % BARS) + ' of 4'; grOut.textContent = st.sc.on ? 'bass turned down now: ' + Math.abs(Math.round(hist[hist.length - 1][1])) + ' dB' : 'sidechain bypassed'; }
      drawGR(); raf = requestAnimationFrame(frame);
    }
    function sweepStop(){ if (!sweep) return; sweep = null; sweepB.setAttribute('aria-pressed', 'false'); sweepB.textContent = 'Sweep over four bars'; describe(); save(st); }
    sweepB.onclick = () => { if (sweep){ sweepStop(); return; } if (!st.playing) play(); st.fl.on = true; apply(); sweep = { t: G.c.currentTime }; sweepB.setAttribute('aria-pressed', 'true'); sweepB.textContent = 'Stop the sweep'; if (!raf) raf = requestAnimationFrame(frame); };
    function tick(){
      if (!G || !st.playing) return; const c = G.c;
      while (nextT < c.currentTime + 0.12){ step(G, stepI, nextT); stepI = (stepI + 1) % (16 * BARS); nextT += STEP; }
      if (st.fm.on && st.fm.mode === 'mp3') while (lastSwirl < c.currentTime + 0.12){ lastSwirl = Math.max(lastSwirl, c.currentTime) + 0.026; G.swirl.gain.setValueAtTime(0.3 + Math.random() * 0.7, lastSwirl); }
    }
    function play(){
      hookBus(); if (window.SoundBus) try { SoundBus.claim(NAME); } catch (e) {}
      if (!G){ G = makeGraph(st); G.setCrush = () => { if (!G) return; if (G.crW){ G.crW.parameters.get('bits').value = st.cr.bits; G.crW.parameters.get('rate').value = Math.min(st.cr.rate, G.c.sampleRate); } else G.crQ.curve = quantCurve(st.cr.bits); }; G.onCrush = apply; [G.F, G.C, G.M].forEach(s => { s.wet.gain.value = 0; s.dry.gain.value = 1; }); }
      const c = G.c; if (c.state === 'suspended') c.resume().catch(() => {});
      st.playing = true; startNoises(G); t0 = nextT = c.currentTime + 0.08; stepI = 0; lastSwirl = 0; hist = [];
      apply(); G.vol.gain.cancelScheduledValues(c.currentTime); G.vol.gain.setValueAtTime(0, c.currentTime); G.vol.gain.linearRampToValueAtTime(st.vol, c.currentTime + 0.6);
      clearInterval(timer); timer = setInterval(tick, 25); tick();
      playB.textContent = 'Pause'; playB.setAttribute('aria-pressed', 'true'); sec.classList.add('playing'); if (!raf) raf = requestAnimationFrame(frame);
    }
    function pause(reset){
      st.playing = false; clearInterval(timer); timer = null; cancelAnimationFrame(raf); raf = 0; sweepStop();
      if (G){ const c = G.c, n = c.currentTime; G.vol.gain.cancelScheduledValues(n); G.vol.gain.setValueAtTime(G.vol.gain.value, n); G.vol.gain.linearRampToValueAtTime(0, n + 0.05); G.vinNoise.gain.setTargetAtTime(0, n, 0.02); setTimeout(() => { if (G && !st.playing) stopNoises(G); }, 120); }
      playB.textContent = 'Play'; playB.setAttribute('aria-pressed', 'false'); sec.classList.remove('playing');
      if (reset){ hist = []; barOut.textContent = 'bar – of 4'; grOut.textContent = ''; }
      drawGR();
    }
    playB.onclick = () => st.playing ? pause() : play();
    stopB.onclick = () => pause(true);
    vol.oninput = () => { st.vol = +vol.value; volOut.textContent = Math.round(st.vol / 0.6 * 100) + '%'; vol.setAttribute('aria-valuetext', volOut.textContent); if (G && st.playing) G.vol.gain.setTargetAtTime(st.vol, G.c.currentTime, 0.03); };

    const onVis = () => { if (document.hidden && st.playing) pause(); };
    document.addEventListener('visibilitychange', onVis);
    if ('IntersectionObserver' in window){ io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && st.playing) pause(); }), { threshold: 0 }); io.observe(sec); }
    let ro = null, rr = 0; const redraw = () => { cancelAnimationFrame(rr); rr = requestAnimationFrame(() => { drawStair(); drawResp(); if (!st.playing) drawGR(); }); };
    if ('ResizeObserver' in window){ ro = new ResizeObserver(redraw); ro.observe(sec); }
    const mo = new MutationObserver(redraw); mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const I = { st, play, pause, destroy(){ pause(true); document.removeEventListener('visibilitychange', onVis); if (io) io.disconnect(); if (ro) ro.disconnect(); mo.disconnect(); if (G){ stopNoises(G); try { G.cap.disconnect(); } catch (e) {} G = null; } } };
    sec._inst = I;
    const anchor = pageEl.querySelector('.grid2'), nav = pageEl.querySelector('.pagenav, .margin-note');
    if (anchor && anchor.parentNode === pageEl) anchor.after(sec); else if (nav && nav.parentNode === pageEl) nav.before(sec); else pageEl.appendChild(sec);
    apply();
    return sec;
  }
  function unmount(pageEl){ if (!pageEl) return; pageEl.querySelectorAll('section.feat-pump').forEach(s => { if (s._inst) s._inst.destroy(); s.remove(); }); }

  (window.FEATURES = window.FEATURES || []).push({ name: NAME, pages: ['k7'], anchor: null, mount, unmount });
})();
