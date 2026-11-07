/* ===================================================================
   SYNTH v2 — improved voices layered over the original engine.
   Same signatures as engine.js / mixer.js; the originals are kept in
   S._v1 and an A/B switch (SynthV2.set(false)) restores them.
   =================================================================== */
(() => {
  const V1 = Object.assign({}, S); S._v1 = V1;
  const rnd = a => (Math.random() * 2 - 1) * a;
  const pan = (c, v) => { if (!c.createStereoPanner) return null; const p = c.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, v)); return p; };
  const via = (node, p, to) => { if (p){ node.connect(p); p.connect(to); } else node.connect(to); };
  const noiseAt = (c, t, dur) => { const n = c.createBufferSource(); n.buffer = AudioCore.noise(c); n.start(t, Math.random() * 1.6); n.stop(t + dur); return n; };

  /* ---------- stereo chorus send, one per chain (the Juno's two BBD lines) ---------- */
  function chorus(ch){
    if (ch._chorus) return ch._chorus; const c = ch.c;
    const inp = c.createGain(); const merge = c.createChannelMerger(2); const wet = c.createGain(); wet.gain.value = 0.7;
    [[0, 0.513, 0.0061], [1, 0.637, 0.0072]].forEach(([side, rate, base]) => {
      const d = c.createDelay(0.05); d.delayTime.value = base;
      const lfo = c.createOscillator(); lfo.type = 'triangle'; lfo.frequency.value = rate;
      const lg = c.createGain(); lg.gain.value = 0.0021; lfo.connect(lg); lg.connect(d.delayTime); lfo.start();
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; // BBD roll-off
      inp.connect(d); d.connect(lp); lp.connect(merge, 0, side);
    });
    merge.connect(wet); wet.connect(ch.duck || ch.out);
    ch._chorus = inp; return inp;
  }
  const send = (c, from, to, amt) => { if (!to || !amt) return; const s = c.createGain(); s.gain.value = amt; from.connect(s); s.connect(to); };

  const N = {};

  /* ---------- 303: two cascaded poles, RC decay, accent, fixed-time slide ---------- */
  N.acid = (ch, t, p = {}) => {
    const c = ch.c, P = { freq: ST.root * 2, ...ST.acid, accent: false, slideTo: null, slideTime: 0, gate: 0.11, level: 0.5, ...p };
    const o = c.createOscillator(); o.type = P.wave || 'sawtooth'; o.frequency.setValueAtTime(P.freq, t); o.detune.value = rnd(3);
    const gate = P.slideTo ? P.slideTime : P.gate;
    if (P.slideTo){ const s0 = t + Math.max(0.01, gate - 0.06); o.frequency.setValueAtTime(P.freq, s0); o.frequency.setTargetAtTime(P.slideTo, s0, 0.02); }
    const acc = !!P.accent; const envAmt = P.env * (acc ? 1.7 : 1); const dec = acc ? Math.min(P.decay, 0.18) : P.decay;
    const peak = Math.min(14000, P.cutoff + envAmt);
    const f1 = c.createBiquadFilter(); f1.type = 'lowpass'; f1.Q.value = 0.7;
    const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.Q.value = Math.max(0.5, P.res * 0.9);
    [f1, f2].forEach(f => { f.frequency.setValueAtTime(peak, t); f.frequency.setTargetAtTime(Math.max(60, P.cutoff), t + 0.002, Math.max(0.01, dec / 3)); });
    const ls = c.createBiquadFilter(); ls.type = 'lowshelf'; ls.frequency.value = 180; ls.gain.value = -Math.min(6, P.res * 0.25); // the 303 thins as resonance rises
    const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(acc ? 2.6 : 1.8); sh.oversample = '2x';
    const lvl = P.level * (acc ? 1.3 : 1);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.003); g.gain.setValueAtTime(lvl, t + gate); g.gain.setTargetAtTime(0, t + gate, 0.012);
    o.connect(f1); f1.connect(f2); f2.connect(ls); ls.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'acid'));
    o.start(t); o.stop(t + gate + 0.12); reg(ch, o, t + gate + 0.12);
  };

  /* ---------- poly stab: stereo detune pairs, RC filter, chorus ---------- */
  N.stab = (ch, t, p = {}) => {
    const c = ch.c, P = { root: ST.root * 4, chord: [0, 3, 7], ...ST.stab, delay: 0, level: 0.13, ...p };
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3.5;
    f.frequency.setValueAtTime(Math.min(16000, P.cutoff + P.env), t); f.frequency.setTargetAtTime(Math.max(80, P.cutoff), t + 0.002, Math.max(0.02, P.decay / 3.2));
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 110;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level * 1.12, t + 0.004); g.gain.setTargetAtTime(0, t + 0.01, Math.max(0.03, (P.decay + 0.12) / 3.5));
    const end = t + P.decay + 0.6;
    P.chord.forEach((semi, i) => [-1, 1].forEach(side => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.root * Math.pow(2, semi / 12); o.detune.value = side * P.detune + rnd(4);
      via(o, pan(c, side * (0.25 + 0.08 * (i % 3))), f); o.start(t); o.stop(end); reg(ch, o, end);
    }));
    f.connect(hp); hp.connect(g); g.connect(dest(ch, P, 'stab'));
    send(c, g, chorus(ch), 0.75);
    if (P.verb > 0) send(c, g, ch.verbSend, P.verb);
    if (P.delay > 0) send(c, g, ch.delSend, P.delay);
  };

  N.pad = (ch, t, p = {}) => {
    const c = ch.c, P = { root: ST.root * 4, chord: [0, 7, 12, 15], dur: 4, ...ST.pad, level: 0.08, ...p };
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = P.cutoff; f.Q.value = 1.5;
    const lfo = c.createOscillator(); lfo.frequency.value = P.lfo; const lg = c.createGain(); lg.gain.value = P.cutoff * 0.6;
    lfo.connect(lg); lg.connect(f.frequency); lfo.start(t); lfo.stop(t + P.dur + 1.5); reg(ch, lfo, t + P.dur + 1.5);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level * 1.4, t + 0.9);
    g.gain.setValueAtTime(P.level * 1.4, t + P.dur - 0.9); g.gain.linearRampToValueAtTime(0, t + P.dur + 1.2);
    P.chord.forEach((semi, i) => [-1, 1].forEach(side => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.root * Math.pow(2, semi / 12) / 2; o.detune.value = side * 11 + rnd(5);
      via(o, pan(c, side * (0.3 + 0.1 * i)), f); o.start(t); o.stop(t + P.dur + 1.5); reg(ch, o, t + P.dur + 1.5);
    }));
    f.connect(g); g.connect(dest(ch, P, 'stab'));
    send(c, g, chorus(ch), 0.8); send(c, g, ch.verbSend, 0.8);
  };

  /* ---------- JP-8000 supersaw: non-linear spread, random phase, stereo, tracking HPF ---------- */
  const SS = [0, -0.0195, 0.0195, -0.0629, 0.0629, -0.1100, 0.1100];
  N.supersaw = (ch, t, p = {}) => {
    const c = ch.c, P = { freq: 440, gate: 0.2, level: 0.05, cutoff: 2600, ...p };
    const sp = P.spread == null ? 1 : P.spread, nv = Math.max(1, Math.min(7, Math.round(P.voices || 7)));
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.8; f.frequency.value = P.cutoff;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = P.freq * 0.85; hp.Q.value = 0.5;
    const norm = P.level * (nv === 1 ? 2.4 : 3.3 / Math.sqrt(nv));
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(norm, t + 0.008); g.gain.setValueAtTime(norm, t + P.gate); g.gain.setTargetAtTime(0, t + P.gate, 0.03);
    const end = t + P.gate + 0.25, per = 1 / Math.max(20, P.freq);
    SS.slice(0, nv).forEach((off, i) => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq; o.detune.value = off * 220 * sp + rnd(1.5);
      const lv = c.createGain(); lv.gain.value = i === 0 ? 1 : 0.78; o.connect(lv);
      via(lv, pan(c, nv === 1 ? 0 : Math.sign(off) * Math.min(0.95, Math.abs(off) * 8.5)), f);
      o.start(t + Math.random() * per); o.stop(end); reg(ch, o, end);
    });
    f.connect(hp); hp.connect(g); g.connect(dest(ch, P, 'super'));
    send(c, g, ch.verbSend, 0.5); send(c, g, ch.delSend, 0.35);
  };

  /* ---------- the hoover: five saws, pitch dive, delayed vibrato, chorus ---------- */
  N.hoover = (ch, t, p = {}) => {
    const c = ch.c, P = { root: 220, decay: 0.45, level: 0.09, ...p }; const sp = P.spread == null ? 1 : P.spread;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2.2; f.frequency.setValueAtTime(5200, t); f.frequency.setTargetAtTime(800, t + 0.02, Math.max(0.05, P.decay / 2));
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level * 0.68, t + 0.008); g.gain.setTargetAtTime(0, t + P.decay * 0.55, Math.max(0.03, P.decay / 3));
    const end = t + P.decay + 0.5;
    const lfo = c.createOscillator(); lfo.frequency.value = 5.6; const lg = c.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(22, t + Math.max(0.1, P.decay * 0.8));
    lfo.connect(lg); lfo.start(t); lfo.stop(end); reg(ch, lfo, end);
    [[-32, 1, -0.7], [-11, 1, -0.25], [11, 1, 0.25], [32, 1, 0.7], [0, 0.5, 0]].forEach(([det, mul, pv]) => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.detune.value = det * sp + rnd(3); lg.connect(o.detune);
      o.frequency.setValueAtTime(P.root * mul * 1.9, t); o.frequency.exponentialRampToValueAtTime(P.root * mul * 0.95, t + 0.15); o.frequency.exponentialRampToValueAtTime(P.root * mul, t + 0.32);
      via(o, pan(c, pv * Math.min(1, 0.6 + 0.4 * sp)), f); o.start(t); o.stop(end); reg(ch, o, end);
    });
    f.connect(g); g.connect(dest(ch, P, 'hoover'));
    send(c, g, chorus(ch), 0.85); send(c, g, ch.verbSend, 0.4);
  };

  /* ---------- reese: two saws split L/R, slow filter drift, clean sub under the dirt ---------- */
  N.reese = (ch, t, p = {}) => {
    const c = ch.c, P = { freq: 55, dur: 0.6, level: 0.35, cutoff: 420, ...p }; const rs = P.spread == null ? 1 : P.spread;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(P.cutoff * 1.8, t); f.frequency.setTargetAtTime(P.cutoff, t, Math.max(0.05, P.dur / 3));
    const lfo = c.createOscillator(); lfo.frequency.value = 0.3 + Math.random() * 0.25; const lg = c.createGain(); lg.gain.value = P.cutoff * 0.35; lfo.connect(lg); lg.connect(f.frequency);
    const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(P.drive || 3); sh.oversample = '2x';
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level * 0.85, t + 0.01); g.gain.setValueAtTime(P.level * 0.85, t + P.dur * 0.8); g.gain.setTargetAtTime(0, t + P.dur * 0.8, Math.max(0.02, P.dur * 0.06));
    const end = t + P.dur + 0.2;
    [[-14, -0.75], [14, 0.75]].forEach(([det, pv]) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq; o.detune.value = det * rs + rnd(2); via(o, pan(c, pv), f); o.start(t); o.stop(end); reg(ch, o, end); });
    const sub = c.createOscillator(); sub.type = 'sine'; sub.frequency.value = P.freq; const sg = c.createGain(); sg.gain.value = 0.55; sub.connect(sg); sg.connect(g); sub.start(t); sub.stop(end); reg(ch, sub, end);
    lfo.start(t); lfo.stop(end); reg(ch, lfo, end);
    f.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'reese'));
  };

  /* ---------- drums: fresh noise each hit, 909-style snare ---------- */
  N.snare = (ch, t, p = {}) => {
    const c = ch.c, P = { decay: 0.18, level: 0.6, tone: 185, ...p }; const d = dest(ch, P, 'snare');
    [[P.tone, 1, 0.08], [P.tone * 1.87, 0.55, 0.05]].forEach(([fr, lv, dk]) => {
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(fr * 1.45, t); o.frequency.exponentialRampToValueAtTime(fr, t + 0.018);
      const g = c.createGain(); g.gain.setValueAtTime(P.level * 0.46 * lv, t); g.gain.exponentialRampToValueAtTime(0.001, t + dk + 0.03);
      o.connect(g); g.connect(d); o.start(t); o.stop(t + dk + 0.06); reg(ch, o, t + dk + 0.06);
    });
    const n = noiseAt(c, t, P.decay + 0.06);
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1100;
    const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 4800; pk.gain.value = 4; pk.Q.value = 0.8;
    const g = c.createGain(); g.gain.setValueAtTime(P.level * 0.52, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
    n.connect(hp); hp.connect(pk); pk.connect(g); g.connect(d); reg(ch, n, t + P.decay + 0.06);
    send(c, g, ch.verbSend, 0.12);
  };
  N.clap = (ch, t, p = {}) => {
    const c = ch.c, P = { decay: ST.clap.decay, level: 0.8, ...p };
    const n = noiseAt(c, t, P.decay + 0.12);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1250 + rnd(120); bp.Q.value = 1.1;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    const bursts = [0, 0.0095 + rnd(0.0015), 0.0195 + rnd(0.002)];
    bursts.forEach(k => { g.gain.setValueAtTime(P.level, t + k); g.gain.exponentialRampToValueAtTime(P.level * 0.12, t + k + 0.0085); });
    const tl = bursts[2] + 0.011; g.gain.setValueAtTime(P.level * 0.95, t + tl); g.gain.exponentialRampToValueAtTime(0.001, t + tl + P.decay);
    n.connect(bp); bp.connect(hp); hp.connect(g); g.connect(dest(ch, P, 'clap')); reg(ch, n, t + P.decay + 0.12);
    send(c, g, ch.verbSend, 0.35);
  };
  N.shaker = (ch, t, p = {}) => {
    const c = ch.c, P = { decay: 0.08, level: 0.35, ...p }; const lv = P.level * 0.92 * (1 + rnd(0.12));
    const n = noiseAt(c, t, 0.2);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6500 + rnd(400); bp.Q.value = 2;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.012 + Math.random() * 0.006); g.gain.exponentialRampToValueAtTime(0.001, t + 0.02 + P.decay);
    n.connect(bp); bp.connect(g); g.connect(dest(ch, P, 'shaker')); reg(ch, n, t + 0.2);
  };
  N.hat = (ch, t, p = {}) => V1.hat(ch, t, { ...p, level: (p.level || 0.35) * (1 + rnd(0.05)) });

  /* ---------- M1 piano: hammer click, inharmonic partials; organ bass with key click ---------- */
  N.piano = (ch, t, p = {}) => {
    const c = ch.c, P = { root: 220, chord: [0, 4, 7, 11], decay: 0.35, level: 0.09, ...p };
    const out = c.createGain(); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(6500, t); f.frequency.setTargetAtTime(1500, t + 0.01, Math.max(0.05, P.decay / 2.5));
    out.connect(f); f.connect(dest(ch, P, 'piano'));
    P.chord.forEach(semi => { const fr = P.root * Math.pow(2, semi / 12);
      [[1, 1, 1], [2, 0.45, 0.6], [3, 0.2, 0.4], [4, 0.1, 0.3], [5, 0.05, 0.22]].forEach(([mul, lv, dk]) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr * mul * (1 + 0.0005 * mul * mul); o.detune.value = rnd(4);
        const og = c.createGain(); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(P.level * lv * 0.5, t + 0.002); og.gain.setTargetAtTime(0, t + 0.003, Math.max(0.02, P.decay * dk * 0.6));
        const end = t + P.decay * dk * 4 + 0.08; o.connect(og); og.connect(out); o.start(t); o.stop(end); reg(ch, o, end);
      }); });
    const n = noiseAt(c, t, 0.04); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.5;
    const ng = c.createGain(); ng.gain.setValueAtTime(P.level * 0.25, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.018); n.connect(bp); bp.connect(ng); ng.connect(out); reg(ch, n, t + 0.04);
    send(c, out, ch.verbSend, 0.3); send(c, out, chorus(ch), 0.25);
  };
  N.organ = (ch, t, p = {}) => {
    const c = ch.c, P = { freq: 98, dur: 0.16, level: 0.3, ...p };
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.004); g.gain.setValueAtTime(P.level, t + P.dur); g.gain.setTargetAtTime(0, t + P.dur, 0.012);
    const end = t + P.dur + 0.1;
    [[1, 1, 0], [2, 0.5, 0], [3, 0.42, 0.06], [4, 0.18, 0]].forEach(([mul, lv, perc]) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = P.freq * mul; o.detune.value = rnd(2);
      const og = c.createGain(); if (perc){ og.gain.setValueAtTime(lv, t); og.gain.setTargetAtTime(lv * 0.25, t, perc); } else og.gain.value = lv;
      o.connect(og); og.connect(g); o.start(t); o.stop(end); reg(ch, o, end);
    });
    const n = noiseAt(c, t, 0.02); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const ng = c.createGain(); ng.gain.setValueAtTime(P.level * 0.25, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.006); n.connect(hp); hp.connect(ng); ng.connect(g); reg(ch, n, t + 0.02);
    g.connect(dest(ch, P, 'organ'));
  };
  N.off = (ch, t, p = {}) => V1.off(ch, t, { ...p, freq: (p.freq || ST.root * 2) * Math.pow(2, rnd(3) / 1200) });

  /* ---------- switch ---------- */
  const KEYS = Object.keys(N).filter(k => typeof V1[k] === 'function');
  window.SynthV2 = {
    on: true,
    set(v){ this.on = !!v; try { localStorage.setItem('dm-synth', v ? '2' : '1'); } catch (e) {} KEYS.forEach(k => { S[k] = this.on ? N[k] : V1[k]; }); document.querySelectorAll('.synthab').forEach(b => b.textContent = this.on ? 'Engine: improved' : 'Engine: classic'); },
    keys: KEYS
  };
  let saved = '2'; try { saved = localStorage.getItem('dm-synth') || '2'; } catch (e) {}
  SynthV2.set(saved !== '1');

  /* ---------- master: better reverb, soft clip, voice pruning ---------- */
  function hall(c, secs){
    const len = Math.floor(c.sampleRate * secs), b = c.createBuffer(2, len, c.sampleRate);
    for (let k = 0; k < 2; k++){ const d = b.getChannelData(k); let lp = 0;
      for (let i = 0; i < len; i++){ const u = i / len; const env = Math.pow(1 - u, 2) * Math.exp(-u * 2.2); const a = 0.92 - 0.78 * u; lp += ((Math.random() * 2 - 1) - lp) * a; d[i] = lp * env; }
      [0.0071, 0.0129, 0.0207, 0.0293, 0.0371, 0.0453].forEach((s, j) => { const idx = Math.floor((s + (k ? 0.0019 : 0)) * c.sampleRate); if (idx < len) d[idx] += (j % 2 ? -1 : 1) * 0.55 * (1 - j * 0.13); });
    }
    return b;
  }
  const softclip = (() => { const n = 4096, a = new Float32Array(n); for (let i = 0; i < n; i++){ const x = i * 2 / (n - 1) - 1, ax = Math.abs(x); a[i] = ax < 0.6 ? x : Math.sign(x) * (0.6 + 0.4 * Math.tanh((ax - 0.6) / 0.4)); } return a; })();
  const origImpulse = AudioCore.impulse;
  AudioCore.impulse = (c, secs, decay, lp) => lp ? origImpulse(c, secs, decay, lp) : hall(c, secs);
  const origGet = AudioCore.get;
  AudioCore.get = () => { const ch = origGet(); if (ch && !ch._v2){ ch._v2 = 1; const c = ch.c;
      try { ch.comp.disconnect(); const clip = c.createWaveShaper(); clip.curve = softclip; clip.oversample = '4x'; ch.comp.connect(clip); clip.connect(ch.analyser); } catch (e) {}
      try { ch.verbSend.disconnect(); const pre = c.createDelay(0.1); pre.delayTime.value = 0.016; const v = c.createConvolver(); v.buffer = hall(c, 2.4); const r = c.createGain(); r.gain.value = 0.42; ch.verbSend.connect(pre); pre.connect(v); v.connect(r); r.connect(ch.duck); } catch (e) {}
    } return ch; };
  setInterval(() => { const ch = AudioCore.peek(); if (!ch || typeof Voices === 'undefined') return; const now = ch.c.currentTime; let j = 0; for (let i = 0; i < Voices.length; i++){ if (Voices[i].stopAt > now - 0.5) Voices[j++] = Voices[i]; } Voices.length = j; }, 4000);
})();
