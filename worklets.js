/* ===================================================================
   AUDIO-THREAD DSP for Dance Music (AudioWorklet).
   dm-ladder : a four-stage saturating ladder filter. mode 'moog' is the
               classic transistor ladder; mode '303' puts a highpass in the
               resonance loop and drives the stages harder, after the
               TB-303's diode ladder. Oversampled; self-oscillates near the top.
   dm-crush  : sample-and-hold rate reduction and bit-depth quantising,
               for the 12-bit samplers (SP-1200, S900/S950, MPC60).
   =================================================================== */
const T = x => (x < -3 ? -1 : x > 3 ? 1 : x * (27 + x * x) / (27 + 9 * x * x)); // fast tanh

class DMLadder extends AudioWorkletProcessor {
  static get parameterDescriptors(){
    return [
      { name: 'cutoff', defaultValue: 1000, minValue: 20, maxValue: 20000, automationRate: 'a-rate' },
      { name: 'resonance', defaultValue: 0.4, minValue: 0, maxValue: 1.2, automationRate: 'k-rate' },
      { name: 'drive', defaultValue: 1, minValue: 0.1, maxValue: 12, automationRate: 'k-rate' }
    ];
  }
  constructor(opts){
    super();
    const p = (opts && opts.processorOptions) || {};
    this.until = p.until || 1e9;          // keep alive until the note's scheduled end
    this.mode = p.mode === '303' ? 1 : 0;
    this.os = p.os === 1 ? 1 : 2;          // oversampling
    this.st = [new Float64Array(4), new Float64Array(4)];
    this.hx = [0, 0]; this.hy = [0, 0];
  }
  process(inputs, outputs, params){
    const inp = inputs[0], out = outputs[0];
    if (!inp || inp.length === 0){ for (let c = 0; c < out.length; c++) out[c].fill(0); return currentTime < this.until; }
    const cut = params.cutoff, k = params.resonance[0] * 4, drive = params.drive[0];
    const sr = sampleRate * this.os, nyq = sr * 0.45, os = this.os, m303 = this.mode;
    const hpA = Math.exp(-2 * Math.PI * 160 / sr);             // 303: highpass in the feedback loop
    const comp = (1 + k * (m303 ? 0.22 : 0.42)) / Math.max(1, drive * 0.55);
    for (let c = 0; c < out.length; c++){
      const x = inp[Math.min(c, inp.length - 1)], y = out[c];
      const s = this.st[c] || (this.st[c] = new Float64Array(4));
      let hx = this.hx[c] || 0, hy = this.hy[c] || 0;
      let g = 0, lastF = -1;
      for (let i = 0; i < y.length; i++){
        const f = cut.length > 1 ? cut[i] : cut[0];
        if (f !== lastF){ g = 1 - Math.exp(-2 * Math.PI * Math.min(f, nyq) / sr); lastF = f; }
        const xin = x[i] * drive;
        for (let n = 0; n < os; n++){
          let fb = s[3];
          if (m303){ hy = hpA * (hy + fb - hx); hx = fb; fb = hy; }
          const u = T(xin - k * fb);
          const t0 = T(s[0]), t1 = T(s[1]), t2 = T(s[2]);
          s[0] += g * (u - t0);
          s[1] += g * (t0 - t1);
          s[2] += g * (t1 - t2);
          s[3] += g * (t2 - T(s[3]));
        }
        y[i] = s[3] * comp;
      }
      this.hx[c] = hx; this.hy[c] = hy;
    }
    return true;
  }
}
registerProcessor('dm-ladder', DMLadder);

class DMCrush extends AudioWorkletProcessor {
  static get parameterDescriptors(){
    return [
      { name: 'bits', defaultValue: 16, minValue: 2, maxValue: 16, automationRate: 'k-rate' },
      { name: 'rate', defaultValue: 96000, minValue: 1000, maxValue: 96000, automationRate: 'k-rate' }
    ];
  }
  constructor(){ super(); this.ph = [0, 0]; this.h = [0, 0]; }
  process(inputs, outputs, params){
    const inp = inputs[0], out = outputs[0];
    if (!inp || inp.length === 0){ for (let c = 0; c < out.length; c++) out[c].fill(0); return true; }
    const bits = params.bits[0], rate = params.rate[0];
    const bypass = bits >= 16 && rate >= sampleRate;
    const q = Math.pow(2, bits - 1), step = Math.min(1, rate / sampleRate);
    for (let c = 0; c < out.length; c++){
      const x = inp[Math.min(c, inp.length - 1)], y = out[c];
      if (bypass){ y.set(x); continue; }
      let ph = this.ph[c] || 0, h = this.h[c] || 0;
      for (let i = 0; i < y.length; i++){
        ph += step; if (ph >= 1){ ph -= 1; h = Math.round(Math.max(-1, Math.min(1, x[i])) * q) / q; }
        y[i] = h;
      }
      this.ph[c] = ph; this.h[c] = h;
    }
    return true;
  }
}
registerProcessor('dm-crush', DMCrush);
