/* ===================================================================
   CHOP — "Chop the break". A two-bar funk-style break is generated here
   from the engine's own drum voices (swung, humanised, seeded so it is
   the same break every time), cut into 16 slices and replayed from a
   32-step grid. Two ways to change tempo: play it faster (varispeed,
   pitch rises) or time-stretch it with a plain granular overlap-add, so
   the grainy, metallic smear the jungle chapters describe is audible.
   Not a copy, transcription or imitation of any recorded break.
   =================================================================== */
(() => {
  const KEY = 'fyod-chop', BASE = 100, SR = 44100, NSL = 16, STEPS = 32;
  const SLS = 60 / BASE / 2, SLN = Math.round(SR * SLS);          // one slice = an eighth note of the break
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const hasEngine = () => typeof AudioCore !== 'undefined' && AudioCore.get;
  const VS = () => (typeof S !== 'undefined' ? S : null);

  /* ---------- the generated break: [step (16ths), voice, velocity] ---------- */
  const HITS = (() => {
    const h = [], add = (v, a) => a.forEach(([s, g]) => h.push([s, v, g]));
    add('k', [[0, 1], [6, .8], [10, .9], [16, 1], [18, .75], [26, .9]]);
    add('s', [[4, 1], [12, 1], [20, 1], [28, 1]]);
    add('g', [[3, .22], [9, .28], [15, .3], [23, .25], [25, .3], [31, .35]]);
    for (let i = 0; i < 32; i += 2) if (i !== 14 && i !== 22) add('h', [[i, i % 4 ? .42 : .6]]);
    add('h', [[5, .22], [13, .2], [21, .22], [29, .2]]);
    add('o', [[14, .5], [22, .5]]);
    return h;
  })();
  const LAB = (() => Array.from({ length: NSL }, (_, k) => {
    const at = HITS.filter(h => h[0] === 2 * k), any = HITS.filter(h => h[0] >> 1 === k);
    if (at.some(h => h[1] === 'k')) return 'kick';
    if (at.some(h => h[1] === 's')) return 'snare';
    if (at.some(h => h[1] === 'o')) return 'open hat';
    return any.some(h => h[1] === 'g') ? 'ghost' : 'hat';
  }))();

  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const curve = d => { const n = 1024, c = new Float32Array(n), k = Math.tanh(d); for (let i = 0; i < n; i++){ const x = i * 2 / (n - 1) - 1; c[i] = Math.tanh(x * d) / k; } return c; };
  function room(c){ const len = Math.floor(c.sampleRate * 0.35), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0), r = rng(3); let y = 0; for (let i = 0; i < len; i++){ y += ((r() * 2 - 1) * Math.pow(1 - i / len, 5) - y) * 0.35; d[i] = y; } return b; }
  function noiseSrc(c, t, dur){ const n = c.createBufferSource(), b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0), r = rng(Math.round(t * 1000) + 11); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; n.buffer = b; n.start(t); return n; }
  /* fallback voices, only used if the engine's are missing */
  function fb(c, v, t, g, out){
    const e = c.createGain(); e.connect(out);
    if (v === 'k'){ const o = c.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(52, t + .05); e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(.001, t + .32); o.connect(e); o.start(t); o.stop(t + .4); return; }
    const hp = c.createBiquadFilter(); hp.type = v === 's' || v === 'g' ? 'bandpass' : 'highpass'; hp.frequency.value = v === 's' || v === 'g' ? 1900 : 7000; hp.connect(e);
    const dec = v === 'o' ? .22 : v === 'h' ? .04 : .18; e.gain.setValueAtTime(g * (v === 'h' || v === 'o' ? .35 : .6), t); e.gain.exponentialRampToValueAtTime(.001, t + dec); noiseSrc(c, t, dec + .05).connect(hp);
  }
  function voice(ch, v, t, g, out){
    const E = VS();
    try {
      if (E && v === 'k' && E.kick) return E.kick(ch, t, { pitchStart: 140, pitchEnd: 52, pitchDecay: .04, ampDecay: .3, drive: 1.6, click: .3, level: g, dest: out });
      if (E && (v === 's' || v === 'g') && E.snare) return E.snare(ch, t, { decay: v === 's' ? .2 : .1, level: g * 1.1, dest: out });
      if (E && (v === 'h' || v === 'o') && E.hat) return E.hat(ch, t, { decay: v === 'o' ? .22 : .04, tone: 8200, level: g * .75, dest: out });
    } catch (e) {}
    fb(ch.c, v, t, g, out);
  }
  let BREAK = null, BREAKP = null;
  function renderBreak(){
    if (BREAKP) return BREAKP;
    const n = SLN * NSL, len = n + Math.round(SR * .6), off = new OfflineAudioContext(1, len, SR), ch = { c: off, live: false };
    const bus = off.createGain(), sat = off.createWaveShaper(), lp = off.createBiquadFilter(), cv = off.createConvolver(), rg = off.createGain();
    sat.curve = curve(1.4); lp.type = 'lowpass'; lp.frequency.value = 8500; cv.buffer = room(off); rg.gain.value = .2;
    bus.connect(sat); sat.connect(lp); lp.connect(off.destination); bus.connect(cv); cv.connect(rg); rg.connect(lp);
    const r = rng(7), sd = 60 / BASE / 4;
    HITS.forEach(([s, v, g]) => voice(ch, v, Math.max(0, s * sd + (s % 2 ? sd * .16 : 0) + (r() - .5) * .008 + .002), g * (.92 + r() * .16), bus));
    BREAKP = off.startRendering().then(b => {
      const d = b.getChannelData(0), o = new Float32Array(n); o.set(d.subarray(0, n)); for (let i = n; i < d.length; i++) o[i - n] += d[i];
      let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(o[i])); const k = pk ? .9 / pk : 1; for (let i = 0; i < n; i++) o[i] *= k;
      BREAK = o; return o;
    });
    return BREAKP;
  }
  const mkBuf = a => { const b = new AudioBuffer({ length: Math.max(1, a.length), numberOfChannels: 1, sampleRate: SR }); b.copyToChannel(a, 0); return b; };
  const rev = a => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[a.length - 1 - i]; return o; };
  /* granular time-stretch: fixed grains read from the slice at the old speed and laid down at the new spacing */
  function stretch(src, ratio, grain){
    const n = Math.max(1, Math.round(src.length * ratio)), out = new Float32Array(n), G = Math.max(128, Math.round(grain * SR)), hop = G >> 1;
    const w = new Float32Array(G); for (let j = 0; j < G; j++) w[j] = .5 - .5 * Math.cos(2 * Math.PI * j / G);
    for (let o = 0; o < n; o += hop){ const i0 = Math.round(o / ratio); for (let j = 0; j < G && o + j < n; j++){ const ii = i0 + j; if (ii >= src.length) break; out[o + j] += src[ii] * (o === 0 && j < hop ? 1 : w[j]); } }
    for (let j = 0; j < Math.min(64, n); j++) out[n - 1 - j] *= j / 64;
    return out;
  }
  const slice = k => BREAK.subarray(k * SLN, (k + 1) * SLN);

  /* ---------- patterns: one token per 16th step; '-' empty, hex slice, then r (reverse), x (repeat), +n / -n semitones ---------- */
  const parse = s => s.trim().split(/\s+/).slice(0, STEPS).map(tk => { if (tk === '-') return null; const m = tk.match(/^([0-9a-f])(r?)(x?)([+-]\d+)?$/i); return m ? { s: parseInt(m[1], 16), r: !!m[2], x: !!m[3], p: +(m[4] || 0) } : null; });
  const ser = g => g.map(e => e ? e.s.toString(16) + (e.r ? 'r' : '') + (e.x ? 'x' : '') + (e.p ? (e.p > 0 ? '+' : '') + e.p : '') : '-').join(' ');
  const STRAIGHT = '0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - a - b - c - d - e - f -';
  const PRESETS = [
    { id: 'hc', name: 'Hardcore, c.1991', bpm: 138, mode: 'pitch', sub: true, src: 'r3', pat: '0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - a - b - 8 - d - ex e -',
      text: 'Rave\'s own music, made on an Akai sampler (the S950 was the standard) from a breakbeat lifted from a funk record, with sub-bass from reggae. The break is simply played faster here, so its pitch rises with the tempo, as at Rage, where the breakbeat records were pitched up. The book\'s hardcore of 1991 runs at 138 bpm.', also: [['r3', 'Hardcore'], ['j1', 'Rage and the breakbeat']] },
    { id: 'jg', name: 'Jungle, c.1994', bpm: 160, mode: 'stretch', sub: true, src: 'j2', pat: '0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 0 - 2 - 5 - 2r - 8 2 a+3 - ax - e e-2 6x 2',
      text: 'The break chopped into its hits and re-sequenced at 160 bpm so that no two bars are the same, with a sub under it. The tempo is changed by time-stretching, the trick of changing a sample\'s length without changing its pitch, which leaves a grainy, metallic smear.', also: [['j2', 'Jungle'], ['j0', 'What jungle is']] },
    { id: 'ts', name: 'Two-step drum and bass, c.1997', bpm: 175, mode: 'stretch', sub: true, src: 'j3', pat: '0 - 1 - 2 - 1 - 4 - 5 - 6 - 7 - 8 - 1 - a - 1 - 4 - 5 - e - f -',
      text: 'The two-step break, popularised by Alex Reece\'s "Pulp Fiction" (1995), became a drum and bass standard: a kick on the one and between the third and fourth beats, a snare on two and four. The tempo was 170 to 180 from about 1996 and the mid-170s ever since.', also: [['j3', 'Drum & bass'], ['j0', 'What jungle is']] }
  ];
  const SUBLINE = [[0, 0, 6], [10, 0, 4], [16, 0, 6], [22, -2, 4], [26, 3, 6]];

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = st => { try { localStorage.setItem(KEY, JSON.stringify({ pat: ser(st.grid), bpm: st.bpm, mode: st.mode, sub: st.sub, grain: st.grain, preset: st.preset })); } catch (e) {} };

  /* ---------- one player at a time across the book ---------- */
  let ACTIVE = null, fbCtx = null, fbOut = null;
  function audio(){
    if (hasEngine()){ const ch = AudioCore.get(); return { c: ch.c, out: ch.out }; }
    if (!fbCtx){ fbCtx = new (window.AudioContext || window.webkitAudioContext)(); fbOut = fbCtx.createGain(); fbOut.gain.value = .8; fbOut.connect(fbCtx.destination); }
    if (fbCtx.state === 'suspended') fbCtx.resume().catch(() => {});
    return { c: fbCtx, out: fbOut };
  }
  function hookBus(){
    if (window.SoundBus && SoundBus.register) SoundBus.register('chop', () => { if (ACTIVE) ACTIVE.stop(); });   /* the book's one stop registry (build/soundbus.js) */
  }

  function place(pageEl, sec){
    const kids = [...pageEl.children], blocks = kids.filter(k => k.querySelector && k.querySelector('h3') && !k.matches('h3'));
    const cap = kids.filter(k => k.matches('p.cap')).pop();
    if (blocks.length) blocks[blocks.length - 1].after(sec); else if (cap) cap.before(sec); else pageEl.appendChild(sec);
  }

  function build(pageEl, id){
    hookBus();
    const saved = load(), first = PRESETS.find(p => p.src === id) || PRESETS[1];
    const st = { grid: parse(saved && saved.pat || first.pat), bpm: saved ? saved.bpm : first.bpm, mode: saved ? saved.mode : first.mode, sub: saved ? !!saved.sub : first.sub, grain: saved && saved.grain || .04, preset: saved ? saved.preset : first.id, sel: null, playing: false };
    if (st.grid.length !== STEPS) st.grid = parse(STRAIGHT);
    const sec = document.createElement('section'); sec.className = 'feature feat-chop';
    sec.setAttribute('aria-labelledby', 'chopH-' + id);
    sec.innerHTML = `
      <h3 id="chopH-${id}">Chop the break</h3>
      <p class="chop-intro">A two-bar drum break, cut into sixteen slices. Put the slices back in any order on the grid, reverse, repeat or re-pitch single hits, then change the tempo: play it faster, so the pitch rises, or time-stretch it, so the pitch holds and the grains show.</p>
      <div class="chop-presets" role="group" aria-label="Presets from the book">${PRESETS.map(p => `<button type="button" class="chop-pre" data-p="${p.id}" data-src="${p.src}" aria-pressed="false">${p.name}<small>${p.bpm} bpm · ${p.mode === 'pitch' ? 'played faster' : 'time-stretched'}</small></button>`).join('')}<button type="button" class="chop-pre chop-straight" data-p="straight" aria-pressed="false">Straight<small>the break in order</small></button></div>
      <p class="chop-note" aria-live="polite"></p>
      <div class="chop-wave"><canvas role="img" aria-label="Waveform of the generated break, divided into sixteen numbered slices"></canvas></div>
      <div class="chop-transport">
        <button type="button" class="play chop-play" aria-pressed="false">Play</button>
        <label class="chop-tempo">Tempo <input type="range" min="90" max="175" step="1" aria-label="Tempo in beats per minute"><output></output></label>
      </div>
      <div class="chop-modes" role="group" aria-label="How the tempo is changed">
        <button type="button" data-m="pitch" aria-pressed="false">Play faster<small>pitch rises</small></button>
        <button type="button" data-m="stretch" aria-pressed="false">Time-stretch<small>tempo changes, pitch held</small></button>
        <label class="chop-grain">Grain <select aria-label="Grain size for the time-stretch"><option value="0.02">small (20 ms)</option><option value="0.04">medium (40 ms)</option><option value="0.08">large (80 ms)</option></select></label>
        <button type="button" class="chop-sub" aria-pressed="false">Sub-bass line</button>
      </div>
      <p class="chop-howto">Tap a step, then a pad to put that slice there. Tap a pad on its own to hear it.</p>
      <div class="chop-grid" role="grid" aria-label="Thirty-two step grid, two bars of sixteenth notes"></div>
      <div class="chop-edit" role="group" aria-label="Edit the selected step"></div>
      <div class="chop-pads" role="group" aria-label="Sixteen slice pads"></div>
      <div class="chop-tools"><button type="button" class="sm chop-shuffle">Shuffle bar two</button><button type="button" class="sm chop-clear">Clear grid</button></div>
      <p class="chop-desc">What this shows: the waveform of a two-bar break at its own speed of ${BASE} bpm, divided into sixteen slices of an eighth note each, and a grid of thirty-two sixteenth-note steps that plays those slices in any order. A line on the waveform follows the slice being played. Keys on the grid: arrows move, R reverses, X repeats, + and − change the pitch, Delete empties the step, 1 to 9 place slices 1 to 9 and 0 places slice 10; Tab moves on to the pads.</p>
      <p class="cap chop-cap">A simplified illustration made for the book. The break is generated here from synthesised drums, swung and humanised; it is not a sample of, or modelled on, any record. Facts from the book: <span class="chop-links"></span></p>`;
    const $ = s => sec.querySelector(s);
    const cv = $('canvas'), gridEl = $('.chop-grid'), padsEl = $('.chop-pads'), editEl = $('.chop-edit'), note = $('.chop-note'), tempo = $('.chop-tempo input'), tout = $('.chop-tempo output'), playB = $('.chop-play'), grainSel = $('.chop-grain select');
    const A = { orig: [], origR: [], str: null };
    let lastVoice = null, out = null, timer = null, raf = 0, nextT = 0, step = 0, queue = [], curStep = -1, wave = null, io = null;

    /* ---------- buffers ---------- */
    const strKey = () => st.bpm + '/' + st.grain;
    function ensureStr(){
      if (!BREAK || (A.str && A.str.key === strKey())) return;
      const ratio = BASE / st.bpm, f = [], r = [];
      for (let k = 0; k < NSL; k++){ const a = stretch(slice(k), ratio, st.grain); f.push(mkBuf(a)); r.push(mkBuf(rev(a))); }
      A.str = { key: strKey(), f, r };
    }
    function bufFor(e){ if (st.mode === 'stretch'){ ensureStr(); return e.r ? A.str.r[e.s] : A.str.f[e.s]; } return e.r ? A.origR[e.s] : A.orig[e.s]; }

    /* ---------- sound ---------- */
    function trig(e, t, cut){
      const c = out.context, b = bufFor(e); if (!b) return;
      const rate = (st.mode === 'pitch' ? st.bpm / BASE : 1) * Math.pow(2, e.p / 12);
      if (lastVoice){ try { lastVoice.g.gain.setValueAtTime(1, t); lastVoice.g.gain.linearRampToValueAtTime(0, t + .004); lastVoice.src.stop(t + .006); } catch (x) {} }
      const src = c.createBufferSource(), g = c.createGain(); src.buffer = b; src.playbackRate.value = rate;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .002); src.connect(g); g.connect(out);
      const dur = b.duration / rate, end = cut ? Math.min(dur, cut) : dur;
      if (cut && cut < dur){ g.gain.setValueAtTime(1, t + end - .004); g.gain.linearRampToValueAtTime(0, t + end); }
      src.start(t); src.stop(t + end + .01); lastVoice = { src, g };
      queue.push({ t, e, dur: end, full: dur });
    }
    function subNote(i, t, sd){
      const n = SUBLINE.find(x => x[0] === i); if (!n) return; const c = out.context;
      const o = c.createOscillator(), sh = c.createWaveShaper(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 87.31 * Math.pow(2, n[1] / 12); sh.curve = curve(1.8);
      const len = n[2] * sd; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .01); g.gain.setValueAtTime(.5, t + len * .7); g.gain.linearRampToValueAtTime(0, t + len);
      o.connect(sh); sh.connect(g); g.connect(out); o.start(t); o.stop(t + len + .02);
    }
    function tick(){
      const c = out.context, sd = 60 / st.bpm / 4;
      while (nextT < c.currentTime + .12){
        const e = st.grid[step];
        if (e){ if (e.x){ trig(e, nextT, sd); trig(e, nextT + sd, sd); } else trig(e, nextT, 0); }
        if (st.sub) subNote(step, nextT, sd);
        queue.push({ t: nextT, step }); nextT += sd; step = (step + 1) % STEPS;
      }
    }
    function play(){
      if (!BREAK || st.playing) return;
      if (window.SoundBus) SoundBus.claim('chop');
      if (ACTIVE && ACTIVE !== api) ACTIVE.stop();
      const au = audio(); out = au.c.createGain(); out.gain.value = .85; out.connect(au.out);
      st.playing = true; ACTIVE = api; step = 0; queue = []; lastVoice = null; nextT = au.c.currentTime + .06;
      timer = setInterval(tick, 25); tick(); ui(); raf = requestAnimationFrame(frame);
    }
    function stop(){
      if (!st.playing) return; st.playing = false; clearInterval(timer); timer = null; cancelAnimationFrame(raf); raf = 0;
      if (out){ const o = out, t = o.context.currentTime; try { o.gain.setValueAtTime(o.gain.value, t); o.gain.linearRampToValueAtTime(0, t + .03); } catch (x) {} setTimeout(() => { try { o.disconnect(); } catch (x) {} }, 80); }
      out = null; lastVoice = null; queue = []; curStep = -1; if (ACTIVE === api) ACTIVE = null; markStep(); drawWave(null); ui();
    }
    function audition(k){
      if (!BREAK) return;
      if (!st.playing){ if (window.SoundBus) SoundBus.claim('chop'); if (ACTIVE && ACTIVE !== api) ACTIVE.stop(); const au = audio(); const o = au.c.createGain(); o.gain.value = .85; o.connect(au.out); const keep = out; out = o; lastVoice = null; trig({ s: k, r: false, x: false, p: 0 }, au.c.currentTime + .01, 0); out = keep; queue = []; setTimeout(() => { try { o.disconnect(); } catch (x) {} }, 1500); }
    }

    /* ---------- drawing ---------- */
    const col = v => getComputedStyle(sec).getPropertyValue(v).trim();
    function sizeCanvas(){ const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 300, h = cv.clientHeight || 110; if (cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); wave = null; } return dpr; }
    function baseWave(){
      const dpr = sizeCanvas(), W = cv.width, H = cv.height, o = document.createElement('canvas'); o.width = W; o.height = H; const x = o.getContext('2d');
      const acc = col('--chop-acc') || '#e0a030', ink = col('--text') || '#eee', bg2 = col('--bg3') || '#222';
      for (let k = 0; k < NSL; k++){ const x0 = k * W / NSL; x.fillStyle = k % 2 ? bg2 : 'transparent'; x.fillRect(x0, 0, W / NSL, H); }
      if (st.sel != null && st.grid[st.sel]){ const k = st.grid[st.sel].s; x.fillStyle = acc; x.globalAlpha = .18; x.fillRect(k * W / NSL, 0, W / NSL, H); x.globalAlpha = 1; }
      if (BREAK){ x.fillStyle = acc; const n = BREAK.length, mid = H * .55, amp = H * .4; for (let px = 0; px < W; px++){ let lo = 1, hi = -1; const a = Math.floor(px * n / W), b = Math.floor((px + 1) * n / W); for (let i = a; i < b; i += 4){ const v = BREAK[i]; if (v < lo) lo = v; if (v > hi) hi = v; } if (hi >= lo) x.fillRect(px, mid - hi * amp, 1, Math.max(1, (hi - lo) * amp)); } }
      x.fillStyle = ink; x.font = `${10 * dpr}px ui-monospace, Menlo, monospace`; x.textBaseline = 'top';
      for (let k = 0; k < NSL; k++) x.fillText((k + 1) + '', k * W / NSL + 3 * dpr, 3 * dpr);
      x.strokeStyle = ink; x.globalAlpha = .35; x.lineWidth = dpr; for (let k = 1; k < NSL; k++){ const xx = Math.round(k * W / NSL) + .5; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, H); x.stroke(); } x.globalAlpha = 1;
      wave = o;
    }
    function drawWave(pos){
      if (!wave) baseWave(); const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(wave, 0, 0);
      if (pos != null){ const px = pos * cv.width; x.fillStyle = col('--text') || '#fff'; x.fillRect(px - 1, 0, Math.max(2, cv.width / 300), cv.height); }
    }
    function frame(){
      if (!st.playing || !out) return; raf = requestAnimationFrame(frame);
      const now = out.context.currentTime; let s = null, v = null;
      while (queue.length && queue[0].t <= now){ const q = queue.shift(); if (q.step != null) s = q; else v = q; }
      if (v) frame.v = v;
      if (s && s.step !== curStep){ curStep = s.step; markStep(); }
      if (reduce()) return;
      const cur = frame.v; let pos = null;
      if (cur && now - cur.t < cur.dur){ const f = (now - cur.t) / cur.full, ff = cur.e.r ? 1 - f : f; pos = (cur.e.s + Math.min(1, Math.max(0, ff))) / NSL; }
      drawWave(pos);
    }

    /* ---------- UI ---------- */
    const cellText = e => e ? `<b>${e.s + 1}</b><i>${e.r ? '◂' : ''}${e.x ? '×2' : ''}${e.p ? (e.p > 0 ? '+' : '−') + Math.abs(e.p) : ''}</i>` : '<b class="em">·</b>';
    const cellLabel = (i, e) => `Bar ${i < 16 ? 1 : 2}, step ${(i % 16) + 1}: ` + (e ? `slice ${e.s + 1}, ${LAB[e.s]}${e.r ? ', reversed' : ''}${e.x ? ', repeated' : ''}${e.p ? ', ' + (e.p > 0 ? 'up ' : 'down ') + Math.abs(e.p) + ' semitones' : ''}` : 'empty');
    function buildGrid(){
      gridEl.innerHTML = ''; const row = document.createElement('div'); row.setAttribute('role', 'row'); row.className = 'chop-row';
      for (let i = 0; i < STEPS; i++){ const b = document.createElement('button'); b.type = 'button'; b.className = 'chop-step' + (i % 4 === 0 ? ' beat' : '') + (i === 16 ? ' bar' : ''); b.dataset.i = i; b.setAttribute('role', 'gridcell'); b.tabIndex = -1; row.appendChild(b); }
      gridEl.appendChild(row); paintGrid();
    }
    function paintGrid(){
      gridEl.querySelectorAll('.chop-step').forEach(b => { const i = +b.dataset.i, e = st.grid[i]; b.innerHTML = cellText(e); b.classList.toggle('on', !!e); b.classList.toggle('sel', st.sel === i); b.setAttribute('aria-selected', st.sel === i ? 'true' : 'false'); b.setAttribute('aria-label', cellLabel(i, e)); b.tabIndex = (st.sel == null ? i === 0 : st.sel === i) ? 0 : -1; });
    }
    function markStep(){ gridEl.querySelectorAll('.chop-step.cur').forEach(b => b.classList.remove('cur')); if (curStep >= 0){ const b = gridEl.querySelector(`.chop-step[data-i="${curStep}"]`); if (b) b.classList.add('cur'); } }
    function buildPads(){ padsEl.innerHTML = LAB.map((l, k) => `<button type="button" class="chop-pad" data-k="${k}" aria-label="Slice ${k + 1}, ${l}"><b>${k + 1}</b><small>${l}</small></button>`).join(''); }
    function paintEdit(){
      const i = st.sel, e = i == null ? null : st.grid[i];
      if (i == null){ editEl.innerHTML = '<span class="muted">No step selected.</span>'; return; }
      editEl.innerHTML = `<span class="chop-ed-lab">${cellLabel(i, e)}</span>` + (e ? `
        <button type="button" data-a="r" aria-pressed="${e.r}">Reverse</button>
        <button type="button" data-a="x" aria-pressed="${e.x}">Repeat</button>
        <span class="chop-pitch" role="group" aria-label="Pitch"><button type="button" data-a="dn" aria-label="Pitch down a semitone">−</button><output aria-live="polite">${e.p > 0 ? '+' : ''}${e.p} st</output><button type="button" data-a="up" aria-label="Pitch up a semitone">+</button></span>
        <button type="button" data-a="del">Empty step</button>` : '');
    }
    function ui(){
      tempo.value = st.bpm; tout.textContent = st.bpm + ' bpm';
      sec.querySelectorAll('.chop-modes [data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === st.mode));
      $('.chop-sub').setAttribute('aria-pressed', st.sub); grainSel.value = String(st.grain); $('.chop-grain').hidden = st.mode !== 'stretch';
      sec.querySelectorAll('.chop-pre').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === st.preset));
      playB.textContent = st.playing ? 'Stop' : (BREAK ? 'Play' : 'Making the break…'); playB.setAttribute('aria-pressed', st.playing); playB.disabled = !BREAK;
      const p = PRESETS.find(x => x.id === st.preset);
      note.textContent = p ? p.text : (st.preset === 'straight' ? 'The break in its own order, sixteen slices on every other step.' : 'Your own pattern.');
      const ln = $('.chop-links'); ln.innerHTML = (p ? p.also : [['j2', 'The Amen and the Akai'], ['k2', 'The sampler']]).map(([pid, t]) => `<a href="#${pid}" data-src="${pid}">${t}</a>`).join(' · ');
      paintGrid(); paintEdit();
    }
    const changed = () => { st.preset = null; save(st); ui(); };
    function setSel(i, focus){ st.sel = i; wave = null; ui(); if (!st.playing) drawWave(null); if (focus){ const b = gridEl.querySelector(`.chop-step[data-i="${i}"]`); if (b) b.focus(); } }
    function edit(a){
      const i = st.sel; if (i == null) return; const e = st.grid[i];
      if (a === 'del'){ st.grid[i] = null; } else if (!e) return; else if (a === 'r') e.r = !e.r; else if (a === 'x') e.x = !e.x; else if (a === 'up') e.p = Math.min(12, e.p + 1); else if (a === 'dn') e.p = Math.max(-12, e.p - 1);
      changed();
    }
    function putSlice(k){ if (st.sel == null) return false; const e = st.grid[st.sel]; st.grid[st.sel] = { s: k, r: e ? e.r : false, x: e ? e.x : false, p: e ? e.p : 0 }; wave = null; changed(); drawWave(null); return true; }
    function applyPreset(id){
      const p = PRESETS.find(x => x.id === id);
      if (p){ st.grid = parse(p.pat); st.bpm = p.bpm; st.mode = p.mode; st.sub = p.sub; } else { st.grid = parse(STRAIGHT); }
      st.preset = id; save(st); wave = null; ui(); if (!st.playing) drawWave(null);
    }

    sec.addEventListener('click', ev => {
      const t = ev.target.closest('button'); if (!t || !sec.contains(t)) return;
      if (t === playB) return st.playing ? stop() : play();
      if (t.classList.contains('chop-step')) return setSel(+t.dataset.i === st.sel ? null : +t.dataset.i);
      if (t.classList.contains('chop-pad')){ const k = +t.dataset.k; audition(k); putSlice(k); return; }
      if (t.dataset.a) return edit(t.dataset.a);
      if (t.dataset.p) return applyPreset(t.dataset.p);
      if (t.dataset.m){ st.mode = t.dataset.m; return changed(); }
      if (t.classList.contains('chop-sub')){ st.sub = !st.sub; return changed(); }
      if (t.classList.contains('chop-clear')){ st.grid = Array(STEPS).fill(null); return changed(); }
      if (t.classList.contains('chop-shuffle')){ const r = rng(Date.now() & 0xffff); for (let i = 16; i < 32; i += 2) st.grid[i] = r() < .15 ? null : { s: Math.floor(r() * NSL), r: r() < .12, x: r() < .12, p: r() < .1 ? (r() < .5 ? -3 : 3) : 0 }; return changed(); }
    });
    tempo.addEventListener('input', () => { st.bpm = +tempo.value; tout.textContent = st.bpm + ' bpm'; st.preset = null; save(st); sec.querySelectorAll('.chop-pre').forEach(b => b.setAttribute('aria-pressed', 'false')); });
    tempo.addEventListener('change', () => ui());
    grainSel.addEventListener('change', () => { st.grain = +grainSel.value; save(st); });
    gridEl.addEventListener('keydown', ev => {
      const b = ev.target.closest('.chop-step'); if (!b) return; const i = +b.dataset.i, cols = +gridEl.dataset.cols || 16, k = ev.key;
      const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -i, End: STEPS - 1 - i }[k];
      if (mv != null){ ev.preventDefault(); const j = Math.max(0, Math.min(STEPS - 1, i + mv)); setSel(j, true); return; }
      if (st.sel !== i && /^[0-9rRxX+\-=]$|^(Delete|Backspace)$/.test(k)) st.sel = i;
      if (/^[0-9]$/.test(k) && !(ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); const sk = k === '0' ? 9 : +k - 1; audition(sk); putSlice(sk); b.focus(); return; }
      const a = { r: 'r', R: 'r', x: 'x', X: 'x', '+': 'up', '=': 'up', '-': 'dn', Delete: 'del', Backspace: 'del' }[k];
      if (a){ ev.preventDefault(); edit(a); const nb = gridEl.querySelector(`.chop-step[data-i="${i}"]`); if (nb) nb.focus(); }
    });

    const ro = window.ResizeObserver ? new ResizeObserver(() => { const w = gridEl.clientWidth; gridEl.dataset.cols = w >= 16 * 46 ? 16 : w >= 8 * 46 ? 8 : 4; wave = null; if (!st.playing) drawWave(null); }) : null;
    if (ro){ ro.observe(gridEl); ro.observe(cv); } else gridEl.dataset.cols = 8;
    if ('IntersectionObserver' in window){ io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) stop(); }), { threshold: 0 }); io.observe(sec); }
    const vis = () => { if (document.hidden) stop(); }; document.addEventListener('visibilitychange', vis);

    const api = { sec, stop, destroy(){ stop(); if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', vis); sec.remove(); } };
    buildGrid(); buildPads(); ui(); place(pageEl, sec); drawWave(null);
    renderBreak().then(() => { for (let k = 0; k < NSL; k++){ A.orig[k] = mkBuf(slice(k)); A.origR[k] = mkBuf(rev(slice(k))); } wave = null; drawWave(null); ui(); }).catch(() => { note.textContent = 'This browser could not make the break (it needs Web Audio).'; });
    sec._chop = api; return sec;
  }

  (window.FEATURES = window.FEATURES || []).push({
    name: 'chop', pages: ['j2', 'j1', 'j3'], anchor: null,
    mount(pageEl, id){ this.unmount(pageEl); return build(pageEl, id || (pageEl.dataset && pageEl.dataset.page) || 'j2'); },
    unmount(pageEl){ pageEl.querySelectorAll('section.feat-chop').forEach(s => { if (s._chop) s._chop.destroy(); else s.remove(); }); }
  });
})();
