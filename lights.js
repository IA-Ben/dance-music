/* ===================================================================
   LIGHTS — five playable lighting features for the Visuals strand
   (vz1–vz5). Mounted at runtime by page id: Lights.mount(pageEl, id)
   puts each one at the end of a named section of its chapter, or
   before the page nav if that section is not there, so the chapters
   need no markup. Any other id is a no-op.
   Everything is generated in the browser: no samples, no footage, no
   network. Sound goes through the book's AudioCore master (and its
   compressor) at a quiet level, never without a press.
   Safety: nothing starts by itself; every feature pauses off screen,
   on a hidden tab, on page turns and when another sound starts.
   Features 2–5 run a flash governor on their canvas: it measures the
   frame's mean luminance and holds back any rise that would make a
   fourth flash inside a second, so they cannot flash faster than
   three times a second whatever the reader does. The strobe in
   feature 5 is capped at 3 Hz at reduced brightness on top of that.
   Under prefers-reduced-motion features start still; chases and the
   strobe stay off until the reader allows them.
   =================================================================== */
window.Lights = (() => {
  const RM = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const CAP = 'A simplified illustration made for the book, not a recreation of any artist\'s show or software.';
  const NOTICE = '<p class="notice lt-notice" role="note">▲ <span><b>This has moving light and colour.</b> Nothing flashes faster than three times a second. Sound starts quiet; there is a mute button.</span></p>';
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, k) => a + (b - a) * k;
  const hsl = (h, s, l, a) => `hsla(${h},${s}%,${l}%,${a == null ? 1 : a})`;
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const h = (tag, cls, html, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const btn = (label, cls, attrs) => h('button', 'lt-btn' + (cls ? ' ' + cls : ''), label, Object.assign({ type: 'button' }, attrs || {}));
  const range = (label, min, max, val, step, cls) => { const w = h('label', 'lt-rng' + (cls ? ' ' + cls : ''), `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step || 1}" value="${val}"><output></output>`); return w; };

  /* ---------- sound: generated buffers into the book's master ---------- */
  const A = {
    c: null, g: null, muted: false, B: null, vol: 0.45,
    get(){
      let ch = null; try { ch = (typeof AudioCore !== 'undefined' && AudioCore.get) ? AudioCore.get() : null; } catch (e) {}
      if (!this.c){
        let dest;
        if (ch){ this.c = ch.c; dest = ch.out; }
        else { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; this.c = new C(); dest = this.c.destination; }
        this.g = this.c.createGain(); this.g.gain.value = this.muted ? 0 : this.vol; this.g.connect(dest); this.B = makeBufs(this.c);
      }
      if (this.c.state === 'suspended') this.c.resume().catch(() => {});
      return this.c;
    },
    now(){ return this.c ? this.c.currentTime : performance.now() / 1000; },
    mute(on){ this.muted = on; if (this.g) this.g.gain.setTargetAtTime(on ? 0 : this.vol, this.c.currentTime, 0.02); S.inst.forEach(i => i.syncMute && i.syncMute()); },
    play(name, t, gain, rate, off, dur, rev){
      const c = this.c; if (!c || !this.B) return; const b = this.B[name]; if (!b) return;
      const s = c.createBufferSource(); s.buffer = rev ? b.rev : b.fwd; if (rate) s.playbackRate.value = rate;
      const g = c.createGain(); g.gain.value = gain == null ? 1 : gain; s.connect(g); g.connect(this.g);
      t = Math.max(t || 0, c.currentTime);
      if (dur){ g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008); g.gain.setValueAtTime(gain, t + dur - 0.02); g.gain.linearRampToValueAtTime(0, t + dur); s.start(t, off || 0, dur); }
      else s.start(t, off || 0);
    }
  };
  function makeBufs(c){
    const sr = c.sampleRate, R = rng(7), out = {};
    const mk = (name, dur, fn) => {
      const n = Math.ceil(dur * sr), b = c.createBuffer(1, n, sr), d = b.getChannelData(0), st = { p: 0, y: 0, z: 0, x: 0 };
      let pk = 0; for (let i = 0; i < n; i++){ d[i] = fn(i / sr, st, dur); pk = Math.max(pk, Math.abs(d[i])); }
      const k = pk ? 0.85 / pk : 1; const r = c.createBuffer(1, n, sr), rd = r.getChannelData(0);
      for (let i = 0; i < n; i++){ d[i] *= k; rd[n - 1 - i] = d[i]; }
      out[name] = { fwd: b, rev: r, dur, data: d };
    };
    const osc = (st, f) => { st.p += 2 * Math.PI * f / sr; return Math.sin(st.p); };
    const hp = (st, x) => { const y = x - st.x; st.x = x; return y; };
    const lp = (st, x, a) => (st.y += (x - st.y) * a);
    const nz = () => R() * 2 - 1, E = Math.exp;
    mk('kick', 0.45, (t, s) => osc(s, 46 + 120 * E(-t / 0.04)) * E(-t / 0.3) * Math.min(1, t / 0.002) + nz() * E(-t / 0.003) * 0.25);
    mk('hat', 0.07, (t, s) => hp(s, nz()) * E(-t / 0.016));
    mk('ohat', 0.3, (t, s) => hp(s, hp(s, nz()) * 0.7 + nz() * 0.3) * E(-t / 0.09));
    mk('snare', 0.22, (t, s) => lp(s, nz(), 0.5) * E(-t / 0.06) * 0.8 + Math.sin(2 * Math.PI * 185 * t) * E(-t / 0.05) * 0.5);
    mk('clap', 0.3, (t, s) => { const e = [0, 0.011, 0.022].reduce((a, ti) => a + (t >= ti ? E(-(t - ti) / 0.005) : 0), 0) + E(-t / 0.08) * 0.4; return hp(s, lp(s, nz(), 0.35)) * e; });
    mk('tom', 0.32, (t, s) => osc(s, 88 + 75 * E(-t / 0.07)) * E(-t / 0.2));
    mk('zap', 0.26, (t, s) => osc(s, 90 + 1500 * E(-t / 0.035)) * E(-t / 0.14));
    mk('bell', 0.7, t => Math.sin(2 * Math.PI * 660 * t + 2.2 * Math.sin(2 * Math.PI * 990 * t) * E(-t / 0.25)) * E(-t / 0.32));
    mk('scrape', 0.4, (t, s, d) => lp(s, nz(), 0.04 + 0.5 * t / d) * Math.sin(Math.PI * t / d));
    return out;
  }
  /* a 16th-note clock on the audio clock; visual steps are released when they are heard */
  function Transport(bpm, audioStep, visStep){
    const T = { bpm, on: false, q: [], step: 0, next: 0, iv: 0 };
    const tick = () => { const n = A.now(); while (T.next < n + 0.12){ if (audioStep) audioStep(T.step, T.next); T.q.push([T.next, T.step]); T.next += 15 / T.bpm; T.step = (T.step + 1) % 16; } };
    T.start = () => { A.get(); T.on = true; T.step = 0; T.q.length = 0; T.next = A.now() + 0.06; tick(); clearInterval(T.iv); T.iv = setInterval(tick, 25); };
    T.stop = () => { T.on = false; clearInterval(T.iv); T.q.length = 0; };
    T.poll = () => { const n = A.now(); while (T.q.length && T.q[0][0] <= n){ const s = T.q.shift()[1]; if (visStep) visStep(s); } };
    return T;
  }

  /* ---------- the flash governor (features 2–5) ---------- */
  function Guard(cv){
    /* mean relative luminance of the whole frame and of each twelfth of it (4 × 3 cells); a rise of more than T that would
       start a fourth flash within a second is held down, in that cell only, until a third of a second has passed */
    const SW = 64, SH = 36, s = document.createElement('canvas'); s.width = SW; s.height = SH; const sg = s.getContext('2d', { willReadFrequently: true }); sg.imageSmoothingQuality = 'high';
    const LUT = new Float32Array(256); for (let i = 0; i < 256; i++){ const v = i / 255; LUT[i] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    const T = 0.06, cells = Array.from({ length: 13 }, () => ({ up: false, lo: null, hi: 0, last: -1e9 })), G = { held: 0, cells };
    const dim = (g, k, L, lo) => { const f = clamp(1 - Math.pow((lo + T * 0.9) / Math.max(L, 1e-4), 1 / 2.2), 0, 1); const w = cv.width, h = cv.height; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(0,0,0,${f})`; if (k === 12) g.fillRect(0, 0, w, h); else g.fillRect(Math.floor((k % 4) * w / 4), Math.floor((k / 4 | 0) * h / 3), Math.ceil(w / 4), Math.ceil(h / 3)); g.restore(); G.held++; };
    G.check = (g, now) => {
      let d; try { sg.clearRect(0, 0, SW, SH); sg.drawImage(cv, 0, 0, SW, SH); d = sg.getImageData(0, 0, SW, SH).data; } catch (e) { return; }
      const L = new Float32Array(13);
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++){ const i = (y * SW + x) * 4, l = 0.2126 * LUT[d[i]] + 0.7152 * LUT[d[i + 1]] + 0.0722 * LUT[d[i + 2]]; L[(y / 12 | 0) * 4 + (x >> 4)] += l / 192; L[12] += l / 2304; }
      for (let k = 12; k >= 0; k--){
        const c = cells[k], v = L[k];
        if (c.lo == null){ c.lo = c.hi = v; continue; }
        if (!c.up){
          if (v - c.lo > T){ if (now - c.last < 334) dim(g, k, v, c.lo); else { c.up = true; c.hi = v; c.last = now; } }
          else c.lo = Math.min(c.lo, v);
        } else if (c.hi - v > T){ c.up = false; c.lo = v; } else c.hi = Math.max(c.hi, v);
      }
    };
    return G;
  }

  /* ---------- shared shell ---------- */
  const S = { inst: [], wired: false };
  function pauseAll(why, except){ S.inst.forEach(i => { if (i !== except && i.on) i.stop(why); }); }
  function wire(){
    if (S.wired) return; S.wired = true;
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll('the tab was hidden'); });
    const sa = document.getElementById('stopAll'); if (sa) sa.addEventListener('click', () => pauseAll('stopped'));
    if (window.SoundBus && SoundBus.register) SoundBus.register('lights', () => pauseAll('another sound started'));   /* the book's one stop registry (build/soundbus.js) */
  }
  function shell(pageEl, id, spec){
    const box = h('section', 'card lights', null, { 'data-lid': id, 'aria-label': spec.title });
    box.innerHTML = `<p class="kicker">Try it</p><h3 class="lt-h">${spec.title}</h3><p class="lt-intro">${spec.intro}</p>${spec.notice ? NOTICE : ''}<div class="lt-stage" style="aspect-ratio:${spec.aspect || '16/9'}"><canvas tabindex="0" role="img" aria-label="${spec.alt}"></canvas></div><div class="lt-bar"><button type="button" class="play lt-play" aria-pressed="false">Play</button>${spec.audio ? '<button type="button" class="lt-btn lt-mute" aria-pressed="false">Mute</button>' : ''}<span class="lt-status" role="status" aria-live="polite"></span></div><div class="lt-ctl"></div><p class="cap lt-cap">${CAP}</p>`;
    const I = { id, box, spec, on: false, raf: 0, last: 0, cv: box.querySelector('canvas'), ctl: box.querySelector('.lt-ctl'), stage: box.querySelector('.lt-stage'), W: 0, H: 0, dpr: 1, reduce: RM() };
    const playB = box.querySelector('.lt-play'), st = box.querySelector('.lt-status'), muteB = box.querySelector('.lt-mute');
    I.say = m => { st.textContent = m || ''; };
    I.syncMute = () => { if (muteB){ muteB.setAttribute('aria-pressed', A.muted); } };
    const loop = now => { if (!I.on) return; const dt = Math.min(0.05, (now - (I.last || now)) / 1000); I.last = now; I.f.frame(now / 1000, dt); if (I.guard) I.guard.check(I.g, now); I.raf = requestAnimationFrame(loop); };
    I.start = () => { if (I.on) return; wire(); pauseAll('another feature started', I); if (spec.audio){ A.get(); if (window.SoundBus) try { SoundBus.claim('lights'); } catch (e) {} } I.on = true; I.last = 0; playB.textContent = 'Pause'; playB.classList.add('stopbtn'); playB.setAttribute('aria-pressed', 'true'); I.say(''); if (I.f.start) I.f.start(); I.raf = requestAnimationFrame(loop); };
    I.stop = why => { if (!I.on) return; I.on = false; cancelAnimationFrame(I.raf); playB.textContent = 'Play'; playB.classList.remove('stopbtn'); playB.setAttribute('aria-pressed', 'false'); if (I.f.stop) I.f.stop(); I.say(why ? 'Paused: ' + why + '.' : 'Paused.'); };
    I.claim = () => { wire(); pauseAll('another feature started', I); A.get(); if (window.SoundBus) try { SoundBus.claim('lights'); } catch (e) {} };
    I.toggle = () => I.on ? I.stop() : I.start();
    playB.addEventListener('click', I.toggle);
    if (muteB) muteB.addEventListener('click', () => A.mute(!A.muted));
    box.addEventListener('keydown', e => { if (e.key !== ' ' || e.defaultPrevented) return; const t = e.target; if (t.tagName === 'BUTTON' || t.tagName === 'SELECT' || t.tagName === 'A' || (t.tagName === 'INPUT' && t.type !== 'range')) return; e.preventDefault(); I.toggle(); });
    ['touchstart', 'touchend'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation(), { passive: true }));   /* no page-turn swipes from inside a feature */
    const size = () => { const r = I.stage.getBoundingClientRect(); if (!r.width) return; I.dpr = Math.min(window.devicePixelRatio || 1, spec.gl ? 1.25 : 1.5); I.W = r.width; I.H = r.height; const w = Math.round(r.width * I.dpr), hh = Math.round(r.height * I.dpr); if (I.cv.width !== w || I.cv.height !== hh){ I.cv.width = w; I.cv.height = hh; if (I.f && I.f.resize) I.f.resize(); if (I.f && !I.on) I.f.still(); } };
    I.size = size;
    if (window.ResizeObserver) new ResizeObserver(size).observe(I.stage); else window.addEventListener('resize', size);
    if (window.IntersectionObserver) new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && I.on) I.stop('scrolled off screen'); }), { threshold: 0 }).observe(box);
    return I;
  }
  /* where it goes: the end of the named section, else before the page nav */
  function place(pageEl, box, anchor){
    const hs = [...pageEl.querySelectorAll('h3')].filter(x => !x.closest('.lights'));
    const a = hs.find(x => x.textContent.trim().toLowerCase().startsWith(anchor.toLowerCase()));
    if (a){ let n = a.nextElementSibling; while (n && n.tagName !== 'H3' && !n.querySelector('h3')) n = n.nextElementSibling; a.parentNode.insertBefore(box, n); return 'after section "' + a.textContent.trim() + '"'; }
    const nav = pageEl.querySelector('.lsstrip') || pageEl.querySelector('.margin-note') || pageEl.querySelector('.pagenav');
    if (nav) nav.parentNode.insertBefore(box, nav); else pageEl.appendChild(box); return 'before the page nav';
  }
  const jump = (pageEl, name) => { const a = [...pageEl.querySelectorAll('h3')].find(x => !x.closest('.lights') && x.textContent.trim().toLowerCase().startsWith(name.toLowerCase())); return a; };
  const g2d = I => { const g = I.cv.getContext('2d'); I.g = g; return g; };
  const base = (I, g, VW) => { if (!I.W) return 0; const k = I.W / VW * I.dpr; g.setTransform(k, 0, 0, k, 0, 0); return I.H / I.W * VW; };

  /* ================= 1 · THE LIQUID LIGHT SHOW ================= */
  const DYES = [['Amber', [1, .6, .08]], ['Magenta', [.95, .18, .62]], ['Cyan', [.08, .72, .95]], ['Green', [.35, .9, .2]], ['Violet', [.5, .22, .95]], ['Red', [.95, .14, .08]]];
  const FRAG = `precision mediump float;uniform vec2 R;uniform float T,H;uniform vec3 B[24];uniform float C[24];uniform vec3 P[6];
void main(){vec2 p=gl_FragCoord.xy/R.x;p.y=(R.y-gl_FragCoord.y)/R.x;vec2 q=p;
float w=.004+.01*H;p+=w*vec2(sin(p.y*23.+T*.7)+sin(p.y*41.-T*.4),cos(p.x*19.-T*.5)+sin(p.x*37.+T*.3));
float f0=0.,f1=0.,f2=0.,f3=0.,f4=0.,f5=0.;
for(int i=0;i<24;i++){vec3 b=B[i];if(b.z<=0.)continue;vec2 d=p-b.xy;float f=b.z*b.z/(dot(d,d)+1e-5);float c=C[i];
if(c<.5)f0+=f;else if(c<1.5)f1+=f;else if(c<2.5)f2+=f;else if(c<3.5)f3+=f;else if(c<4.5)f4+=f;else f5+=f;}
float m=f0;vec3 col=P[0];float s=0.;
if(f1>m){s=m;m=f1;col=P[1];}else s=max(s,f1);if(f2>m){s=m;m=f2;col=P[2];}else s=max(s,f2);if(f3>m){s=m;m=f3;col=P[3];}else s=max(s,f3);
if(f4>m){s=m;m=f4;col=P[4];}else s=max(s,f4);if(f5>m){s=m;m=f5;col=P[5];}else s=max(s,f5);
float r=length(q-vec2(.5,.375));float lamp=smoothstep(.375,.345,r)*(1.-.55*r*r/.14);
vec3 L=vec3(1.,.94,.82)*lamp;vec3 water=vec3(.93,.96,1.);
float oil=smoothstep(.85,1.1,m);float deep=smoothstep(1.,4.,m);
vec3 dye=mix(vec3(1.),col,.55+.4*deep);float rim=smoothstep(.8,1.,m)*(1.-smoothstep(1.,1.5,m));
float seam=s>.8?1.-smoothstep(0.,.5,m-s):0.;
vec3 o=L*mix(water,dye,oil)*(1.-.55*rim)*(1.-.6*seam*oil);
gl_FragColor=vec4(o,1.);}`;
  function liquid(I){
    let gl = null; try { gl = I.cv.getContext('webgl', { antialias: false, preserveDrawingBuffer: false }); } catch (e) {}
    const F = { mode: 'push', dye: 0, heat: 0.35, tilt: [0, 0], ptr: null, blobs: [], t: 0 };
    const seed = () => { const R = rng(3); F.blobs = []; [[.38, .3, 0], [.6, .42, 1], [.48, .5, 2], [.32, .45, 0], [.66, .3, 2], [.52, .25, 1], [.42, .38, 3]].forEach(([x, y, c]) => F.blobs.push({ x, y, vx: 0, vy: 0, r: 0.035 + R() * 0.03, r0: 0, c })); F.blobs.forEach(b => b.r0 = b.r); };
    seed();
    let prog, U = {};
    if (gl){
      try {
        const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
        prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}')); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
        const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const al = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
        ['R', 'T', 'H', 'B', 'C', 'P'].forEach(k => U[k] = gl.getUniformLocation(prog, k)); gl.uniform3fv(U.P, new Float32Array(DYES.flatMap(d => d[1])));
      } catch (e) { gl = null; const nc = I.cv.cloneNode(); I.cv.replaceWith(nc); I.cv = nc; }
    }
    const g = gl ? null : g2d(I);
    const draw = () => {
      if (gl){
        gl.viewport(0, 0, I.cv.width, I.cv.height); gl.uniform2f(U.R, I.cv.width, I.cv.height); gl.uniform1f(U.T, F.t); gl.uniform1f(U.H, F.heat);
        const b = new Float32Array(72), c = new Float32Array(24); F.blobs.slice(0, 24).forEach((o, i) => { b[i * 3] = o.x; b[i * 3 + 1] = o.y; b[i * 3 + 2] = o.r; c[i] = o.c; });
        gl.uniform3fv(U.B, b); gl.uniform1fv(U.C, c); gl.drawArrays(gl.TRIANGLES, 0, 3); return;
      }
      const W = I.cv.width; g.setTransform(W, 0, 0, W, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, 1, .75);
      const lg = g.createRadialGradient(.5, .375, 0, .5, .375, .36); lg.addColorStop(0, '#fff3dc'); lg.addColorStop(.9, '#a89a84'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.beginPath(); g.arc(.5, .375, .36, 0, 7); g.fill();
      g.globalCompositeOperation = 'multiply';
      F.blobs.forEach(o => { const [r, gg, bb] = DYES[o.c][1].map(v => Math.round(255 * (0.45 + 0.55 * v))); const gr = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 1.3); gr.addColorStop(0, `rgb(${r},${gg},${bb})`); gr.addColorStop(.75, `rgb(${r * .8 | 0},${gg * .8 | 0},${bb * .8 | 0})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(o.x, o.y, o.r * 1.3, 0, 7); g.fill(); });
      g.globalCompositeOperation = 'source-over';
    };
    const step = dt => {
      F.t += dt; const t = F.t, amp = 0.012 + 0.07 * F.heat, bl = F.blobs, p = F.ptr;
      F.tilt[0] *= 0.995; F.tilt[1] *= 0.995;
      for (const b of bl){
        const ux = amp * (Math.cos(b.y * 9 + t * .3) * .6 + Math.sin(b.y * 4 - t * .17)), uy = -amp * (Math.sin(b.x * 8 - t * .25) * .6 + Math.cos(b.x * 5 + t * .2)) + amp * 0.4 * Math.sin(t * .11 + b.x * 3);
        b.vx += (ux - b.vx) * 0.6 * dt + F.tilt[0] * dt; b.vy += (uy - b.vy) * 0.6 * dt + F.tilt[1] * dt;
        if (p && p.down){
          const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) + 1e-4;
          if (F.mode === 'push' && d < 0.13){ const k = (1 - d / 0.13); b.vx += p.vx * k * 0.5; b.vy += p.vy * k * 0.5; }
          if (F.mode === 'squeeze' && d < 0.2){ const k = (1 - d / 0.2); b.vx += dx / d * k * 0.25 * dt * 10; b.vy += dy / d * k * 0.25 * dt * 10; b.r = Math.min(b.r0 * 1.45, b.r + b.r0 * k * dt * 1.5); }
        }
        b.r += (b.r0 - b.r) * dt * 0.6;
      }
      for (let i = 0; i < bl.length; i++) for (let j = i + 1; j < bl.length; j++){
        const a = bl[i], b = bl[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) + 1e-4, rr = (a.r + b.r);
        if (a.c === b.c && d < rr * 0.55){ const r0 = Math.hypot(a.r0, b.r0); a.x = (a.x * a.r0 ** 2 + b.x * b.r0 ** 2) / r0 ** 2; a.y = (a.y * a.r0 ** 2 + b.y * b.r0 ** 2) / r0 ** 2; a.r0 = Math.min(r0, 0.11); a.r = Math.max(a.r, a.r0 * .9); bl.splice(j, 1); j--; continue; }
        if (a.c !== b.c && d < rr * 0.95){ const k = (rr * 0.95 - d) * 2.5 * dt; a.vx -= dx / d * k; a.vy -= dy / d * k; b.vx += dx / d * k; b.vy += dy / d * k; }
      }
      for (const b of bl){
        b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx * dt; b.y += b.vy * dt;
        const dx = b.x - .5, dy = b.y - .375, d = Math.hypot(dx, dy), lim = .34 - b.r * .6;
        if (d > lim){ b.x = .5 + dx / d * lim; b.y = .375 + dy / d * lim; const vn = (b.vx * dx + b.vy * dy) / d; if (vn > 0){ b.vx -= 1.6 * vn * dx / d; b.vy -= 1.6 * vn * dy / d; } }
      }
      if (p) { p.vx *= 0.8; p.vy *= 0.8; }
    };
    const drop = (x, y) => { const R = Math.random; if (F.blobs.length >= 24){ const k = F.blobs.reduce((m, b, i) => b.r0 < F.blobs[m].r0 ? i : m, 0); F.blobs.splice(k, 1); } F.blobs.push({ x, y, vx: 0, vy: 0, r: 0.012, r0: 0.03 + R() * 0.025, c: F.dye }); if (!I.on) { step(0.4); draw(); } };
    /* controls */
    const modes = h('div', 'lt-row lt-modes', null, { role: 'group', 'aria-label': 'What your finger does' });
    [['drop', 'Drop'], ['push', 'Push'], ['squeeze', 'Squeeze'], ['tilt', 'Tilt']].forEach(([k, l]) => { const b = btn(l, '', { 'aria-pressed': k === F.mode, 'data-k': k }); b.onclick = () => { F.mode = k; modes.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); }; modes.appendChild(b); });
    const wheel = h('div', 'lt-wheel', null, { role: 'radiogroup', 'aria-label': 'Dye colour' });
    DYES.forEach(([n, c], i) => { const a = i / DYES.length * Math.PI * 2 - Math.PI / 2; const b = h('button', 'lt-dye', '', { type: 'button', role: 'radio', 'aria-checked': i === 0, 'aria-label': n, tabindex: i === 0 ? 0 : -1, style: `--dye:rgb(${c.map(v => v * 255 | 0)});left:calc(50% + ${Math.cos(a) * 46}px - 22px);top:calc(50% + ${Math.sin(a) * 46}px - 22px)` }); b.onclick = () => sel(i); wheel.appendChild(b); });
    const sel = i => { F.dye = i; wheel.querySelectorAll('button').forEach((x, j) => { x.setAttribute('aria-checked', j === i); x.tabIndex = j === i ? 0 : -1; }); wheel.children[i].focus(); };
    wheel.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); sel((F.dye + d + DYES.length) % DYES.length); });
    const wl = h('div', 'lt-wheelbox'); wl.append(wheel, h('span', 'cap', 'Dye colour'));
    const heat = range('Lamp heat', 0, 100, 35); heat.querySelector('input').oninput = e => { F.heat = e.target.value / 100; heat.querySelector('output').textContent = e.target.value < 25 ? 'cool' : e.target.value < 70 ? 'warm' : 'hot'; };
    heat.querySelector('input').oninput({ target: heat.querySelector('input') });
    const add = btn('Add a drop'); add.onclick = () => drop(.5 + (Math.random() - .5) * .1, .375 + (Math.random() - .5) * .1);
    const clr = btn('Fresh glass'); clr.onclick = () => { seed(); F.tilt = [0, 0]; draw(); };
    const side = h('div', 'lt-col'); side.append(modes, heat, h('div', 'lt-row', null)); side.lastChild.append(add, clr);
    const grid = h('div', 'lt-liq'); grid.append(wl, side); I.ctl.appendChild(grid);
    /* pointer */
    const cv = I.cv; cv.style.touchAction = 'none';
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.width]; };
    cv.addEventListener('pointerdown', e => { const [x, y] = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {} F.ptr = { x, y, vx: 0, vy: 0, down: true, t: performance.now(), x0: x, y0: y }; if (F.mode === 'drop') drop(x, y); });
    cv.addEventListener('pointermove', e => { const p = F.ptr; if (!p || !p.down) return; const [x, y] = pos(e), n = performance.now(), dt = Math.max(8, n - p.t) / 1000; p.vx = (x - p.x) / dt; p.vy = (y - p.y) / dt; if (F.mode === 'tilt'){ F.tilt = [clamp((x - p.x0) * 0.6, -.15, .15), clamp((y - p.y0) * 0.6, -.15, .15)]; } p.x = x; p.y = y; p.t = n; });
    const up = () => { if (F.ptr) F.ptr.down = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', e => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (d){ e.preventDefault(); F.tilt = [clamp(F.tilt[0] + d[0] * .03, -.15, .15), clamp(F.tilt[1] + d[1] * .03, -.15, .15)]; I.say('Glass tilted ' + e.key.replace('Arrow', '').toLowerCase() + '.'); } else if (e.key === 'Enter'){ e.preventDefault(); drop(.5, .375); I.say('A drop of ' + DYES[F.dye][0].toLowerCase() + ' added.'); } });
    return { frame: (t, dt) => { step(dt); draw(); }, still: () => { draw(); }, resize: () => {} };
  }

  /* ================= 2 · SCRATCH THE PICTURE ================= */
  const PADS = [['Kick', 'kick', 8], ['Snare', 'snare', 42], ['Hat', 'hat', 58], ['Clap', 'clap', 320], ['Tom', 'tom', 200], ['Zap', 'zap', 170], ['Bell', 'bell', 270], ['Scrape', 'scrape', 25]];
  const CLIPS = [
    (g, W, H, p, c) => { g.strokeStyle = c; for (let i = 0; i < 3; i++){ const r = (p * 0.9 + i * 0.12) * H * 0.55; g.lineWidth = 6 * (1 - p) + 1; g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.stroke(); } },
    (g, W, H, p, c) => { g.fillStyle = c; for (let i = 0; i < 5; i++){ const x = (p * 1.6 - 0.3 - i * 0.08) * W; g.fillRect(x, H * (0.2 + i * 0.13), W * 0.22, H * 0.035); } },
    (g, W, H, p, c) => { g.fillStyle = c; for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++){ if ((i + j + Math.floor(p * 6)) % 3) continue; g.beginPath(); g.arc(W * (0.1 + i * 0.1), H * (0.18 + j * 0.16), 3 + 3 * (1 - p), 0, 7); g.fill(); } },
    (g, W, H, p, c) => { g.strokeStyle = c; g.lineWidth = 3; for (let i = 0; i < 3; i++){ const a = -Math.PI / 2 + (i - 1) * (0.4 + p * 0.9), r = H * (0.15 + p * 0.3); const x = W / 2 + Math.cos(a) * r, y = H * 0.6 + Math.sin(a) * r; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 13, y + 10); g.lineTo(x - 13, y + 10); g.closePath(); g.stroke(); } },
    (g, W, H, p, c) => { g.save(); g.translate(W / 2, H / 2); g.rotate(p * Math.PI); const s = H * 0.5 * (1 - p * 0.7); g.strokeStyle = c; g.lineWidth = 4; g.strokeRect(-s / 2, -s / 2, s, s); g.restore(); },
    (g, W, H, p, c) => { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 12; i++){ const x = W * (0.08 + i * 0.07), y = H * (0.15 + p * 0.6) + (i % 2 ? 16 : -16); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); },
    (g, W, H, p, c) => { g.strokeStyle = c; g.lineWidth = 2.5; g.beginPath(); for (let a = 0; a < p * 18; a += 0.15){ const r = a * H * 0.022, x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); },
    (g, W, H, p, c) => { g.fillStyle = c; const R = rng(11); for (let i = 0; i < 16; i++){ const x = ((R() + p * (0.3 + R() * 0.6)) % 1) * W; g.fillRect(x, H * R() * 0.5, 3, H * (0.2 + R() * 0.3)); } }
  ];
  function sampler(I){
    const g = g2d(I); I.guard = Guard(I.cv);
    const F = { pat: PADS.map(() => new Array(16).fill(false)), sel: 0, cur: 0, ph: 1, dur: 0.5, held: 0, playhead: -1, bpm: 112, scr: 0 };
    [[0, [0, 4, 8, 12]], [2, [2, 6, 10, 14]], [1, [4, 12]], [5, [15]], [6, [0]], [7, [11]]].forEach(([p, s]) => s.forEach(i => F.pat[p][i] = true));
    const hit = (i, t) => { F.cur = i; F.ph = 0; F.tStart = performance.now() + Math.max(0, (t - A.now())) * 1000; F.dur = Math.max(0.35, A.B ? A.B[PADS[i][1]].dur : 0.5); };
    const T = Transport(F.bpm, (s, t) => PADS.forEach((p, i) => { if (F.pat[i][s]) A.play(p[1], t, i === 0 ? 0.9 : 0.6); }), s => { F.playhead = s; PADS.forEach((p, i) => { if (F.pat[i][s]) hit(i, A.now()); }); paintSteps(); });
    const draw = () => {
      const VH = base(I, g, 480); if (!VH) return; g.fillStyle = 'rgba(5,5,9,0.32)'; g.fillRect(0, 0, 480, VH);
      const p = F.held > performance.now() ? F.scr : F.ph; const c = hsl(PADS[F.cur][2], 80, 62);
      if (p < 1) CLIPS[F.cur](g, 480, VH, p, c);
      g.fillStyle = '#05050a'; g.fillRect(0, VH - 20, 480, 20); g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '11px ui-monospace,monospace'; g.fillText(PADS[F.cur][0].toUpperCase() + '  ' + (p < 1 ? Math.round(p * 100) : 100) + '%', 8, VH - 6);
    };
    /* pads */
    const pads = h('div', 'lt-pads', null, { role: 'group', 'aria-label': 'Pads: each plays a sound with its own picture' });
    PADS.forEach(([n, , hue], i) => { const b = btn(`<i style="background:${hsl(hue, 80, 60)}"></i>${n}`, 'lt-pad', { 'aria-label': n + ' pad', 'aria-pressed': i === 0 }); b.onclick = () => { I.claim(); hit(i, A.now()); A.play(PADS[i][1], 0, 0.8); F.sel = i; pads.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-pressed', j === i)); paintSteps(); wave(); if (!I.on){ F.ph = 0; for (let k = 0; k < 6; k++){ F.ph = k / 10; draw(); } } }; pads.appendChild(b); });
    /* steps */
    const lab = h('p', 'cap lt-steplab', '');
    const steps = h('div', 'lt-steps', null, { role: 'group', 'aria-label': 'Sixteen steps for the selected pad' });
    for (let s = 0; s < 16; s++){ const b = btn(String(s + 1), 'lt-step', { 'aria-pressed': 'false' }); b.onclick = () => { F.pat[F.sel][s] = !F.pat[F.sel][s]; paintSteps(); }; steps.appendChild(b); }
    const paintSteps = () => { lab.textContent = 'Steps for: ' + PADS[F.sel][0] + ' (tap a pad to choose it)'; [...steps.children].forEach((b, s) => { b.setAttribute('aria-pressed', F.pat[F.sel][s]); b.setAttribute('aria-label', `Step ${s + 1}, ${PADS[F.sel][0]} ${F.pat[F.sel][s] ? 'on' : 'off'}`); b.classList.toggle('now', s === F.playhead && T.on); b.classList.toggle('any', PADS.some((p, i) => F.pat[i][s])); b.style.setProperty('--pc', hsl(PADS[F.sel][2], 80, 60)); }); };
    /* scratch strip */
    const strip = h('div', 'lt-strip', '<canvas></canvas><i></i>', { role: 'slider', tabindex: '0', 'aria-label': 'Scratch strip: drag or use the arrow keys to move the current clip back and forth', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    const sc = strip.querySelector('canvas'), knob = strip.querySelector('i'); strip.style.touchAction = 'none';
    const wave = () => { const r = strip.getBoundingClientRect(); sc.width = Math.max(10, r.width | 0); sc.height = 44; const x = sc.getContext('2d'); x.clearRect(0, 0, sc.width, 44); const d = A.B && A.B[PADS[F.sel][1]].data; if (!d){ x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(0, 21, sc.width, 2); return; } x.fillStyle = hsl(PADS[F.sel][2], 70, 55, 0.7); const n = d.length / sc.width; for (let i = 0; i < sc.width; i++){ let m = 0; for (let j = 0; j < n; j += 8) m = Math.max(m, Math.abs(d[(i * n + j) | 0] || 0)); x.fillRect(i, 22 - m * 20, 1, m * 40 + 1); } };
    let last = null;
    const scrub = (p, v) => { p = clamp(p, 0, 0.999); F.cur = F.sel; F.scr = p; F.held = performance.now() + 450; strip.setAttribute('aria-valuenow', Math.round(p * 100)); knob.style.left = (p * 100) + '%'; const b = A.B && A.B[PADS[F.sel][1]]; if (b && Math.abs(v) > 0.02){ const sp = clamp(Math.abs(v) * b.dur, 0.3, 2.4), rev = v < 0; A.play(PADS[F.sel][1], 0, 0.7, sp, rev ? (1 - p) * b.dur : p * b.dur, 0.07, rev); } if (!I.on) draw(); };
    strip.addEventListener('pointerdown', e => { I.claim(); wave(); try { strip.setPointerCapture(e.pointerId); } catch (er) {} const r = strip.getBoundingClientRect(); last = { x: (e.clientX - r.left) / r.width, t: performance.now() }; scrub(last.x, 0); });
    strip.addEventListener('pointermove', e => { if (!last) return; const r = strip.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, n = performance.now(), dt = Math.max(16, n - last.t) / 1000; if (n - last.t < 30) return; scrub(x, (x - last.x) / dt); last = { x, t: n }; });
    ['pointerup', 'pointercancel'].forEach(ev => strip.addEventListener(ev, () => last = null));
    strip.addEventListener('keydown', e => { const d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key]; if (!d) return; e.preventDefault(); I.claim(); scrub(F.scr + d * 0.06, d * 1.2); });
    const tempo = range('Tempo', 80, 136, F.bpm); const ti = tempo.querySelector('input'), to = tempo.querySelector('output'); ti.oninput = () => { T.bpm = F.bpm = +ti.value; to.textContent = ti.value + ' bpm'; }; ti.oninput();
    const clear = btn('Clear steps'); clear.onclick = () => { F.pat[F.sel].fill(false); paintSteps(); };
    I.ctl.append(pads, lab, steps, h('p', 'cap', 'Scratch the current clip: the picture and the sound move together.'), strip, h('div', 'lt-row'));
    I.ctl.lastChild.append(tempo, clear); paintSteps(); setTimeout(wave, 0);
    return { frame: () => { T.poll(); if (F.ph < 1) F.ph = Math.min(1, (performance.now() - (F.tStart || 0)) / 1000 / F.dur); if (F.ph < 0) F.ph = 0; draw(); }, start: () => { T.bpm = F.bpm; T.start(); wave(); }, stop: () => { T.stop(); F.playhead = -1; paintSteps(); }, still: () => { F.ph = 0.35; draw(); g.fillStyle = 'rgba(5,5,9,.2)'; }, resize: wave };
  }

  /* ================= 3 · THE VJ'S DESK ================= */
  const LOOPS = [
    ['Tunnel', (g, w, h, t, hu) => { g.lineWidth = 2; for (let i = 0; i < 9; i++){ const z = ((i + t * 0.6) % 9) / 9, s = z * z * w * 1.3; g.strokeStyle = hsl(hu + i * 12, 80, 30 + 35 * z); g.strokeRect(w / 2 - s / 2, h / 2 - s * 0.3, s, s * 0.6); } }],
    ['Bars', (g, w, h, t, hu) => { for (let i = 0; i < 8; i++){ const x = ((i / 8 + t * 0.07) % 1) * w; g.fillStyle = hsl(hu + i * 25, 75, 30 + (i % 3) * 12); g.fillRect(x, 0, w / 16, h); } }],
    ['Orbit', (g, w, h, t, hu) => { for (let i = 0; i < 14; i++){ const a = t * 0.8 + i * 0.45; g.fillStyle = hsl(hu + i * 9, 85, 60); g.beginPath(); g.arc(w / 2 + Math.sin(a * 1.3) * w * 0.38, h / 2 + Math.sin(a * 2.1) * h * 0.36, 3 + (i % 4) * 1.5, 0, 7); g.fill(); } }],
    ['Wave grid', (g, w, h, t, hu) => { g.lineWidth = 1.5; for (let j = 0; j < 10; j++){ g.strokeStyle = hsl(hu + j * 6, 70, 55); g.beginPath(); for (let x = 0; x <= w; x += 8){ const y = h * (j + 0.5) / 10 + Math.sin(x * 0.05 + t * 2 + j * 0.6) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }],
    ['Polygons', (g, w, h, t, hu) => { g.lineWidth = 2; for (let k = 1; k < 6; k++){ g.strokeStyle = hsl(hu + k * 30, 80, 58); g.beginPath(); const n = 3 + k % 4, r = k * h * 0.09; for (let i = 0; i <= n; i++){ const a = i / n * Math.PI * 2 + t * (k % 2 ? 0.5 : -0.4); const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }],
    ['Blobs', (g, w, h, t, hu) => { for (let i = 0; i < 4; i++){ const x = w * (0.5 + 0.35 * Math.sin(t * 0.4 + i * 1.7)), y = h * (0.5 + 0.3 * Math.cos(t * 0.33 + i * 2.3)), r = h * 0.35; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hsl(hu + i * 40, 80, 60, 0.85)); gr.addColorStop(1, hsl(hu + i * 40, 80, 40, 0)); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }]
  ];
  function vjdesk(I){
    const g = g2d(I); I.guard = Guard(I.cv);
    const bw = 192, bh = 108, mk = () => { const c = document.createElement('canvas'); c.width = bw; c.height = bh; return c; };
    const srcA = mk(), srcB = mk(), mix = mk(), fb = mk(); const gA = srcA.getContext('2d', { willReadFrequently: true }), gB = srcB.getContext('2d', { willReadFrequently: true }), gm = mix.getContext('2d', { willReadFrequently: true }), gf = fb.getContext('2d');
    const F = { a: 0, b: 4, x: 0.35, mode: 'mix', fx: { mirror: false, feedback: false, post: false }, sync: !I.reduce, step: 0, beatLit: 0, t: 0, kick: false };
    const T = Transport(124, (s, t) => { if (s % 4 === 0) A.play('kick', t, 0.9); if (s % 4 === 2) A.play('hat', t, 0.35); }, s => { if (s % 4 === 0){ F.beatLit = performance.now(); if (F.sync) F.step++; led.classList.add('on'); setTimeout(() => led.classList.remove('on'), 90); } });
    const render = dt => {
      F.t += dt; const t = F.t;
      [[gA, F.a, 20], [gB, F.b, 200]].forEach(([c, k, hu]) => { c.fillStyle = '#000'; c.fillRect(0, 0, bw, bh); LOOPS[k][1](c, bw, bh, t, hu); });
      if (F.fx.feedback){ const z = 1.05 + (F.step % 2) * 0.02, rot = (F.step % 2 ? 1 : -1) * 0.015; gf.clearRect(0, 0, bw, bh); gf.drawImage(mix, 0, 0); gm.save(); gm.fillStyle = '#000'; gm.fillRect(0, 0, bw, bh); gm.translate(bw / 2, bh / 2); gm.rotate(rot); gm.scale(z, z); gm.globalAlpha = 0.82; gm.drawImage(fb, -bw / 2, -bh / 2); gm.restore(); gm.globalAlpha = 0.5; }
      else { gm.globalAlpha = 1; gm.fillStyle = '#000'; gm.fillRect(0, 0, bw, bh); }
      const x = F.x, ga = gm.globalAlpha;
      if (F.mode === 'mix'){ gm.globalAlpha = ga * (1 - x); gm.drawImage(srcA, 0, 0); gm.globalAlpha = ga * x; gm.globalCompositeOperation = 'lighter'; gm.drawImage(srcB, 0, 0); }
      else if (F.mode === 'add'){ gm.globalAlpha = ga * Math.min(1, 2 * (1 - x)); gm.drawImage(srcA, 0, 0); gm.globalCompositeOperation = 'lighter'; gm.globalAlpha = ga * Math.min(1, 2 * x); gm.drawImage(srcB, 0, 0); }
      else if (F.mode === 'wipe'){ gm.globalAlpha = ga; gm.drawImage(srcA, 0, 0); gm.save(); gm.beginPath(); gm.rect(0, 0, bw * x, bh); gm.clip(); gm.drawImage(srcB, 0, 0); gm.restore(); }
      else { /* luma key: B's bright parts over A; the fader sets how much of B gets through */
        const da = gA.getImageData(0, 0, bw, bh), db = gB.getImageData(0, 0, bw, bh).data, d = da.data, th = (1 - x) * 255;
        for (let i = 0; i < d.length; i += 4){ const l = 0.3 * db[i] + 0.59 * db[i + 1] + 0.11 * db[i + 2]; if (l > th && x > 0.01){ d[i] = db[i]; d[i + 1] = db[i + 1]; d[i + 2] = db[i + 2]; } }
        gf.putImageData(da, 0, 0); gm.globalAlpha = ga; gm.drawImage(fb, 0, 0);
      }
      gm.globalCompositeOperation = 'source-over'; gm.globalAlpha = 1;
      if (F.fx.mirror){ const m = F.sync ? F.step % 3 : 0; gf.clearRect(0, 0, bw, bh); gf.drawImage(mix, 0, 0); gm.save(); if (m !== 1){ gm.translate(bw, 0); gm.scale(-1, 1); gm.drawImage(fb, 0, 0, bw / 2, bh, 0, 0, bw / 2, bh); gm.setTransform(1, 0, 0, 1, 0, 0); } if (m >= 1){ gf.clearRect(0, 0, bw, bh); gf.drawImage(mix, 0, 0); gm.translate(0, bh); gm.scale(1, -1); gm.drawImage(fb, 0, 0, bw, bh / 2, 0, 0, bw, bh / 2); } gm.restore(); }
      if (F.fx.post){ const lv = F.sync ? [2, 3, 4, 6][F.step % 4] : 4, q = 255 / (lv - 1); const im = gm.getImageData(0, 0, bw, bh), d = im.data; for (let i = 0; i < d.length; i += 4){ d[i] = Math.round(d[i] / q) * q; d[i + 1] = Math.round(d[i + 1] / q) * q; d[i + 2] = Math.round(d[i + 2] / q) * q; } gm.putImageData(im, 0, 0); }
      g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(mix, 0, 0, I.cv.width, I.cv.height);
    };
    /* controls */
    const prev = h('div', 'lt-prev');
    [['A', srcA, 'a'], ['B', srcB, 'b']].forEach(([n, c, k]) => { const w = h('label', 'lt-src', `<span>Source ${n}</span>`); c.className = 'lt-thumb'; c.setAttribute('aria-hidden', 'true'); const s = h('select', '', LOOPS.map((l, i) => `<option value="${i}"${i === F[k] ? ' selected' : ''}>${l[0]}</option>`).join('')); s.onchange = () => { F[k] = +s.value; if (!I.on) render(0); }; w.append(c, s); prev.appendChild(w); });
    const xf = range('Crossfader A ↔ B', 0, 100, F.x * 100, 1, 'lt-xf'); const xi = xf.querySelector('input'); xi.oninput = () => { F.x = xi.value / 100; xf.querySelector('output').textContent = xi.value; if (!I.on) render(0); }; xi.oninput();
    const modes = h('div', 'lt-row', null, { role: 'group', 'aria-label': 'Blend mode' });
    [['mix', 'Mix'], ['add', 'Add'], ['luma', 'Luma key'], ['wipe', 'Wipe']].forEach(([k, l]) => { const b = btn(l, '', { 'aria-pressed': k === F.mode }); b.onclick = () => { F.mode = k; modes.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); if (!I.on) render(0); }; modes.appendChild(b); });
    const fx = h('div', 'lt-row', null, { role: 'group', 'aria-label': 'Effects' });
    [['mirror', 'Mirror'], ['feedback', 'Feedback'], ['post', 'Posterise']].forEach(([k, l]) => { const b = btn(l, '', { 'aria-pressed': 'false' }); b.onclick = () => { F.fx[k] = !F.fx[k]; b.setAttribute('aria-pressed', F.fx[k]); if (!I.on) render(0); }; fx.appendChild(b); });
    const beat = h('div', 'lt-row'); const kb = btn('Start the kick', '', { 'aria-pressed': 'false' }); const sb = btn('Beat sync', '', { 'aria-pressed': F.sync }); const led = h('span', 'lt-led', '', { 'aria-hidden': 'true' });
    kb.onclick = () => { if (!I.on) I.start(); F.kick = !T.on; if (T.on) T.stop(); else T.start(); kb.setAttribute('aria-pressed', T.on); kb.textContent = T.on ? 'Stop the kick' : 'Start the kick'; };
    sb.onclick = () => { F.sync = !F.sync; sb.setAttribute('aria-pressed', F.sync); I.say(F.sync ? (T.on ? 'Effects step on every beat.' : 'Start the kick to give the effects a beat.') : 'Beat sync off.'); };
    beat.append(kb, sb, led);
    I.ctl.append(prev, xf, h('p', 'cap', 'Blend'), modes, h('p', 'cap', 'Effects'), fx, beat);
    return { frame: (t, dt) => { T.poll(); render(dt); }, start: () => {}, stop: () => { T.stop(); kb.setAttribute('aria-pressed', 'false'); kb.textContent = 'Start the kick'; }, still: () => { F.t = 2; render(0); }, resize: () => {} };
  }

  /* ================= 4 · MAP THE CUBE ================= */
  const PATS = ['Grid', 'Stripes', 'Rings', 'Checker', 'Wave', 'Colour wash', 'Off'];
  function pattern(c, n, k, t, hu, lit){
    c.fillStyle = '#000'; c.fillRect(0, 0, n, n); if (k === 6 || lit <= 0) return; c.globalAlpha = lit;
    const col = (o, l) => hsl(hu + (o || 0), 85, l || 58);
    if (k === 0){ c.strokeStyle = col(); c.lineWidth = 2; const o = (t * 12) % 16; for (let i = -16; i < n + 16; i += 16){ c.beginPath(); c.moveTo(i + o, 0); c.lineTo(i + o, n); c.moveTo(0, i + o); c.lineTo(n, i + o); c.stroke(); } }
    if (k === 1){ c.fillStyle = col(); const o = (t * 20) % 24; for (let i = -n; i < n * 2; i += 24){ c.beginPath(); c.moveTo(i + o, 0); c.lineTo(i + o + 10, 0); c.lineTo(i + o + 10 - n, n); c.lineTo(i + o - n, n); c.fill(); } }
    if (k === 2){ c.strokeStyle = col(); c.lineWidth = 3; for (let r = (t * 18) % 14; r < n; r += 14){ c.beginPath(); c.arc(n / 2, n / 2, r, 0, 7); c.stroke(); } }
    if (k === 3){ const s = n / 6; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++){ c.fillStyle = (i + j + Math.floor(t)) % 2 ? col(0, 55) : col(180, 30); c.fillRect(i * s, j * s, s, s); } }
    if (k === 4){ c.strokeStyle = col(); c.lineWidth = 2; for (let j = 0; j < 8; j++){ c.beginPath(); for (let x = 0; x <= n; x += 4){ const y = (j + .5) * n / 8 + Math.sin(x * .1 + t * 3 + j) * 4; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
    if (k === 5){ const gr = c.createLinearGradient(0, 0, n, n); gr.addColorStop(0, col(0, 45)); gr.addColorStop((Math.sin(t) + 1) / 2 * .8 + .1, col(60, 60)); gr.addColorStop(1, col(120, 40)); c.fillStyle = gr; c.fillRect(0, 0, n, n); }
    c.globalAlpha = Math.min(1, lit + 0.2); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, n - 3, n - 3); c.globalAlpha = 1;   /* the frame shows where the picture's edges land */
  }
  function cube(I){
    const g = g2d(I); I.guard = Guard(I.cv); const VW = 1000, VH = 562.5, N = 96;
    const cx = 500, cy = 288, s = 200, ca = s * Math.cos(Math.PI / 6);
    const FACES = [
      ['Top', [[cx, cy - s], [cx + ca, cy - s / 2], [cx, cy], [cx - ca, cy - s / 2]], '#2a2a31'],
      ['Left', [[cx - ca, cy - s / 2], [cx, cy], [cx, cy + s], [cx - ca, cy + s / 2]], '#1f1f25'],
      ['Right', [[cx, cy], [cx + ca, cy - s / 2], [cx + ca, cy + s / 2], [cx, cy + s]], '#18181d']
    ];
    const flat = () => [[[cx - .63 * s, cy - 1.17 * s], [cx + .63 * s, cy - 1.17 * s], [cx + .63 * s, cy - .09 * s], [cx - .63 * s, cy - .09 * s]], [[cx - ca - .11 * s, cy - .34 * s], [cx - .06 * s, cy - .34 * s], [cx - .06 * s, cy + .97 * s], [cx - ca - .11 * s, cy + .97 * s]], [[cx + .06 * s, cy - .34 * s], [cx + ca + .11 * s, cy - .34 * s], [cx + ca + .11 * s, cy + .97 * s], [cx + .06 * s, cy + .97 * s]]];
    const F = { pins: flat(), pats: [0, 1, 2], hue: [190, 320, 40], lit: [1, 1, 1], face: 0, raster: false, t: 0, show: -1, edge: 0 };
    const tex = FACES.map(() => { const c = document.createElement('canvas'); c.width = c.height = N; return c; });
    const layer = document.createElement('canvas'); let lg = layer.getContext('2d');
    const tri = (c, img, s0, s1, s2, d0, d1, d2) => {
      const mx = (d0[0] + d1[0] + d2[0]) / 3, my = (d0[1] + d1[1] + d2[1]) / 3, ex = p => { const dx = p[0] - mx, dy = p[1] - my, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * 0.8, p[1] + dy / l * 0.8]; };
      const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
      c.save(); c.beginPath(); c.moveTo(e0[0], e0[1]); c.lineTo(e1[0], e1[1]); c.lineTo(e2[0], e2[1]); c.closePath(); c.clip();
      const [x0, y0] = s0, [x1, y1] = s1, [x2, y2] = s2, den = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0); if (!den){ c.restore(); return; }
      const a = ((d1[0] - d0[0]) * (y2 - y0) - (d2[0] - d0[0]) * (y1 - y0)) / den, cc = ((d2[0] - d0[0]) * (x1 - x0) - (d1[0] - d0[0]) * (x2 - x0)) / den;
      const b = ((d1[1] - d0[1]) * (y2 - y0) - (d2[1] - d0[1]) * (y1 - y0)) / den, d = ((d2[1] - d0[1]) * (x1 - x0) - (d1[1] - d0[1]) * (x2 - x0)) / den;
      c.transform(a, b, cc, d, d0[0] - a * x0 - cc * y0, d0[1] - b * x0 - d * y0); c.drawImage(img, 0, 0); c.restore();
    };
    const bil = (P, u, v) => [lerp(lerp(P[0][0], P[1][0], u), lerp(P[3][0], P[2][0], u), v), lerp(lerp(P[0][1], P[1][1], u), lerp(P[3][1], P[2][1], u), v)];
    const warp = (c, img, P) => { const n = 5; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++){ const u0 = i / n, u1 = (i + 1) / n, v0 = j / n, v1 = (j + 1) / n; const A_ = bil(P, u0, v0), B_ = bil(P, u1, v0), C_ = bil(P, u1, v1), D_ = bil(P, u0, v1); tri(c, img, [u0 * N, v0 * N], [u1 * N, v0 * N], [u1 * N, v1 * N], A_, B_, C_); tri(c, img, [u0 * N, v0 * N], [u1 * N, v1 * N], [u0 * N, v1 * N], A_, C_, D_); } };
    const poly = (c, P) => { c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
    const draw = () => {
      const k = I.cv.width / VW; if (layer.width !== I.cv.width || layer.height !== I.cv.height){ layer.width = I.cv.width; layer.height = I.cv.height; lg = layer.getContext('2d'); }
      g.setTransform(k, 0, 0, k, 0, 0); const bg = g.createLinearGradient(0, 0, 0, VH); bg.addColorStop(0, '#0b0b10'); bg.addColorStop(.75, '#08080b'); bg.addColorStop(1, '#111116'); g.fillStyle = bg; g.fillRect(0, 0, VW, VH);
      g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(0, cy + s * 0.75, VW, VH);
      FACES.forEach(f => { poly(g, f[1]); g.fillStyle = f[2]; g.fill(); });
      FACES.forEach((f, i) => {
        pattern(tex[i].getContext('2d'), N, F.pats[i], F.t, F.hue[i], F.lit[i]);
        lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, layer.width, layer.height); lg.setTransform(k, 0, 0, k, 0, 0); warp(lg, tex[i], F.pins[i]);
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.16; g.drawImage(layer, 0, 0); g.restore();     /* the light that misses the cube lands on the wall behind */
        g.save(); poly(g, f[1]); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer, 0, 0); g.restore();
      });
      if (F.edge > 0){ g.strokeStyle = `rgba(255,255,255,${F.edge * 0.8})`; g.lineWidth = 2.5; FACES.forEach(f => { poly(g, f[1]); g.stroke(); }); }
      if (F.raster){
        const R = [[cx - 330, 50], [cx + 330, 50], [cx + 330, 521], [cx - 330, 521]];
        g.strokeStyle = 'rgba(160,220,255,.7)'; g.setLineDash([8, 6]); g.lineWidth = 1.5; poly(g, R); g.stroke(); g.setLineDash([]);
        g.strokeStyle = 'rgba(160,220,255,.18)'; g.lineWidth = 1; for (let i = 1; i < 12; i++){ g.beginPath(); g.moveTo(cx - 330 + i * 55, 50); g.lineTo(cx - 330 + i * 55, 521); g.stroke(); } for (let j = 1; j < 8; j++){ g.beginPath(); g.moveTo(cx - 330, 50 + j * 58.9); g.lineTo(cx + 330, 50 + j * 58.9); g.stroke(); }
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; F.pins.forEach(P => { for (let i = 1; i < 5; i++){ g.beginPath(); for (let j = 0; j <= 8; j++){ const p = bil(P, i / 5, j / 8); j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); g.beginPath(); for (let j = 0; j <= 8; j++){ const p = bil(P, j / 8, i / 5); j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); } });
        g.fillStyle = 'rgba(200,230,255,.85)'; g.font = '600 17px ui-monospace,monospace'; g.fillText('THE PROJECTOR THROWS ONE FLAT RECTANGLE', cx - 320, 40); g.fillText('WARPING BENDS THE PICTURE TO EACH FACE', cx - 320, 545);
      }
      const px = VW / (I.W || VW); F.pins[F.face].forEach((p, i) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(p[0], p[1], 6 * px, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.5 * px; g.stroke(); const fc = FACES[F.face][1][i]; g.strokeStyle = 'rgba(255,220,90,.9)'; g.lineWidth = 1.5 * px; g.beginPath(); g.arc(fc[0], fc[1], 10 * px, 0, 7); g.stroke(); });
      placePins();
    };
    /* pins: four buttons over the canvas for the chosen face */
    const pinBox = h('div', 'lt-pins'); I.stage.appendChild(pinBox); const names = ['first', 'second', 'third', 'fourth'];
    const pins = names.map((n, i) => { const b = h('button', 'lt-pin', '', { type: 'button' }); b.style.touchAction = 'none'; pinBox.appendChild(b); return b; });
    const near = (i, c, r) => { const fc = FACES[F.face][1][i]; return Math.hypot(c[0] - fc[0], c[1] - fc[1]) < (r || 14) * VW / (I.W || VW) ? fc.slice() : c; };
    const mapped = () => F.pins.every((P, f) => P.every((p, i) => Math.hypot(p[0] - FACES[f][1][i][0], p[1] - FACES[f][1][i][1]) < 1));
    const setPin = (i, p, snap) => { p = [clamp(p[0], 0, VW), clamp(p[1], 0, VH)]; F.pins[F.face][i] = snap ? near(i, p, snap === true ? 0 : snap) : p; if (!I.on) draw(); };
    function placePins(){ pins.forEach((b, i) => { const p = F.pins[F.face][i]; b.style.left = (p[0] / VW * 100) + '%'; b.style.top = (p[1] / VH * 100) + '%'; b.setAttribute('aria-label', `${FACES[F.face][0]} face, ${names[i]} corner pin. Arrow keys move it; it snaps to the yellow ring on the cube's corner.`); }); }
    pins.forEach((b, i) => {
      let drag = false;
      b.addEventListener('pointerdown', e => { drag = true; try { b.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); });
      b.addEventListener('pointermove', e => { if (!drag) return; const r = I.stage.getBoundingClientRect(); setPin(i, [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH], true); });
      ['pointerup', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { if (drag){ drag = false; I.say(mapped() ? 'Every corner is pinned: the pictures now fit the cube.' : ''); } }));
      b.addEventListener('keydown', e => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return; e.preventDefault(); const m = (e.shiftKey ? 12 : 3) * VW / (I.W || VW), p = F.pins[F.face][i]; setPin(i, [p[0] + d[0] * m, p[1] + d[1] * m], e.shiftKey ? 10 : 2.7); I.say(mapped() ? 'Every corner is pinned.' : ''); });
    });
    /* controls */
    const faces = h('div', 'lt-row', null, { role: 'group', 'aria-label': 'Choose a face' });
    const pick = h('select', '', PATS.map((p, i) => `<option value="${i}">${p}</option>`).join(''), { 'aria-label': 'Picture on this face' });
    FACES.forEach((f, i) => { const b = btn(f[0] + ' face', '', { 'aria-pressed': i === 0 }); b.onclick = () => { F.face = i; pick.value = F.pats[i]; faces.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); }; faces.appendChild(b); });
    pick.value = 0; pick.onchange = () => { F.pats[F.face] = +pick.value; if (!I.on) draw(); };
    const pl = h('label', 'lt-src', '<span>Picture</span>'); pl.appendChild(pick);
    const ras = btn('Show the projector\'s rectangle', '', { 'aria-pressed': 'false' }); ras.onclick = () => { F.raster = !F.raster; ras.setAttribute('aria-pressed', F.raster); draw(); };
    const fit = btn('Pin every corner'); fit.onclick = () => { F.pins = FACES.map(f => f[1].map(p => p.slice())); I.say('Mapped: each picture is warped to its face.'); draw(); };
    const unw = btn('Unwarp'); unw.onclick = () => { F.pins = flat(); I.say('Unwarped: three flat rectangles, spilling on the wall.'); draw(); };
    const showB = btn('Play the show', 'lt-show');
    const save = { pats: null, hue: null };
    const T = Transport(124, (st, t) => { if (F.show < 0) return; if (st % 4 === 0) A.play('kick', t, 0.9); if (st % 4 === 2) A.play('hat', t, 0.3); if (st === 0 && F.show % 32 === 0) A.play('ohat', t, 0.25); }, () => { if (F.show < 0) return; F.show++; cue(F.show); });
    const cue = n => {     /* 8 bars, everything changes on the beat or slower */
      if (n >= 128){ endShow(); return; } if (n % 4) return;
      const bar = n >> 4, beat = (n >> 2) & 3;
      if (bar < 2){ F.lit = [0, 1, 2].map(i => beat === 3 || beat === i ? 1 : 0.06); F.pats = bar ? [5, 5, 5] : [0, 0, 0]; F.hue = [190 + beat * 30, 300 + beat * 30, 40 + beat * 30]; }
      else if (bar < 4){ F.lit = [1, 1, 1]; F.pats = [1, 1, 1]; F.hue = [200, 210, 220]; }
      else if (bar === 4){ F.pats = [2, 2, 2]; F.hue = F.hue.map(x => x + 40); }
      else if (bar === 5){ F.pats = [3, 3, 3]; }
      else if (bar === 6){ F.pats = [[0, 4, 2], [4, 2, 0], [2, 0, 4], [5, 5, 5]][beat]; }
      else { F.lit = [0.6, 0.4, 0.2].map(x => x * (1 - beat / 4)); F.edge = 1; }
      F.edge = bar === 7 ? 1 : (beat === 0 && bar >= 2 ? 0.6 : 0);
    };
    const endShow = () => { F.show = -1; T.stop(); F.pats = save.pats || F.pats; F.hue = save.hue || F.hue; F.lit = [1, 1, 1]; F.edge = 0; showB.textContent = 'Play the show'; I.say('The show is over.'); };
    showB.onclick = () => { if (F.show >= 0){ endShow(); return; } if (!I.on) I.start(); save.pats = F.pats.slice(); save.hue = F.hue.slice(); F.show = 0; cue(0); T.start(); showB.textContent = 'Stop the show'; I.say(mapped() ? 'Eight bars, cut to the beat.' : 'Eight bars, cut to the beat. The corners are not pinned yet, so watch the picture miss.'); };
    I.ctl.append(h('p', 'cap', 'Choose a face, then drag its four white pins to the yellow rings on the cube\'s corners.'), faces, h('div', 'lt-row'), h('div', 'lt-row'));
    I.ctl.children[2].append(pl, ras); I.ctl.children[3].append(fit, unw, showB);
    return { frame: (t, dt) => { T.poll(); F.t += dt; F.edge = Math.max(0, F.edge - dt * (F.show >= 0 && F.show >= 112 ? 0 : 1.5)); draw(); }, start: () => {}, stop: () => { if (F.show >= 0) endShow(); T.stop(); }, still: () => { F.t = 1; draw(); }, resize: () => {} };
  }

  /* ================= 5 · BUSK THE DESK ================= */
  const COLS = [['Red', [255, 40, 30]], ['Blue', [40, 90, 255]], ['Amber', [255, 150, 30]], ['Green', [40, 230, 90]], ['Violet', [150, 50, 255]], ['White', [235, 235, 255]]];
  function desk(I, pageEl){
    const g = g2d(I); I.guard = Guard(I.cv); const VW = 1000;
    const F = { lv: { wash: 0.7, beams: 0.55, blinder: 0, laser: 0, haze: 0.45, strobe: 0 }, out: { wash: 0, beams: 0, blinder: 0, laser: 0, haze: 0, strobe: 0 }, flash: {}, col: 2, chase: I.reduce ? 'off' : 'run', allow: !I.reduce, bo: false, master: 1, bpm: 128, beat: 0, par: [1, 1, 1, 1], parT: [1, 1, 1, 1], ang: [0, 0, 0, 0], angT: [-.3, .2, -.2, .3], t: 0, strobeAt: 0, strobeOn: 0, lastFlash: -1e9, taps: [] };
    const T = Transport(F.bpm, (s, t) => { A.play('kick', t, s % 4 === 0 ? 0.95 : 0) ; if (s % 4 === 2) A.play('ohat', t, 0.28); else if (s % 2) A.play('hat', t, 0.18); else if (s % 4) A.play('hat', t, 0.1); }, s => { if (s % 4 === 0){ F.beat++; chase(); } });
    const chase = () => {
      const b = F.beat, c = F.allow ? F.chase : 'off';
      F.parT = [0, 1, 2, 3].map(j => c === 'run' ? (j === b % 4 ? 1 : 0.15) : c === 'bounce' ? (j === [0, 1, 2, 3, 2, 1][b % 6] ? 1 : 0.15) : c === 'pairs' ? ((j + b) % 2 ? 1 : 0.2) : 1);
      if (c !== 'off') F.angT = [0, 1, 2, 3].map(j => (((b + j) % 4) / 3 - 0.5) * 0.9 * (j % 2 ? 1 : -1));
    };
    const flashOk = () => { const n = performance.now(); if (n - F.lastFlash < 334) return false; F.lastFlash = n; return true; };
    const step = dt => {
      F.t += dt; const lv = F.lv, k = 1 - Math.exp(-dt / 0.06);
      F.master = lerp(F.master, F.bo ? 0 : 1, 1 - Math.exp(-dt / 0.03));
      for (const ch in F.out){ const tgt = (F.flash[ch] ? 1 : lv[ch]) * (ch === 'haze' ? 1 : F.master); F.out[ch] = lerp(F.out[ch], tgt, ch === 'haze' ? 1 - Math.exp(-dt / 0.8) : k); }
      for (let j = 0; j < 4; j++){ F.par[j] = lerp(F.par[j], F.parT[j], 1 - Math.exp(-dt / 0.08)); if (F.allow && F.chase === 'off' && !I.reduce) F.angT[j] = Math.sin(F.t * 0.4 + j * 1.3) * 0.45; F.ang[j] = lerp(F.ang[j], F.angT[j], 1 - Math.exp(-dt / 0.25)); }
      const rate = F.allow ? Math.min(3, lv.strobe) : 0, n = performance.now();     /* strobe: never above 3 Hz, at most a third of full brightness */
      if (rate > 0 && n - F.strobeAt >= 1000 / rate && n - F.lastFlash >= 334){ F.strobeAt = n; F.lastFlash = n; F.strobeOn = n + 45; }
      if (F.flash.strobe1){ F.flash.strobe1 = 0; F.strobeOn = n + 45; }
    };
    const glow = (x, y, r, c, a, sy) => { if (a <= 0.003) return; g.save(); g.translate(x, y); g.scale(1, sy || 1); const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); };
    const draw = () => {
      const VH = base(I, g, VW); if (!VH) return; const o = F.out, haze = o.haze, C = COLS[F.col][1].join(','), m = F.master;
      g.globalCompositeOperation = 'source-over'; g.fillStyle = '#040406'; g.fillRect(0, 0, VW, VH);
      g.fillStyle = '#09090c'; g.beginPath(); g.moveTo(0, VH * 0.62); g.lineTo(VW, VH * 0.62); g.lineTo(VW, VH); g.lineTo(0, VH); g.fill();
      g.globalCompositeOperation = 'lighter';
      const px = [170, 390, 610, 830];
      px.forEach((x, j) => { const a = o.wash * F.par[j]; glow(x, 200, 260, C, 0.32 * a); glow(x, VH * 0.8, 200, C, 0.4 * a, 0.25); if (haze > 0.05){ g.fillStyle = `rgba(${C},${0.07 * a * haze})`; g.beginPath(); g.moveTo(x - 8, 52); g.lineTo(x + 8, 52); g.lineTo(x + 120, VH * 0.8); g.lineTo(x - 120, VH * 0.8); g.fill(); } });
      const hx = [280, 440, 560, 720];
      hx.forEach((x, j) => { const a = o.beams, ang = F.ang[j], L = 520, ex = x + Math.sin(ang) * L, ey = 50 + Math.cos(ang) * L; const vis = a * (0.08 + 0.9 * haze); if (vis > 0.01){ const gr = g.createLinearGradient(x, 50, ex, ey); gr.addColorStop(0, `rgba(235,240,255,${0.55 * vis})`); gr.addColorStop(1, `rgba(235,240,255,0)`); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 3, 50); g.lineTo(x + 3, 50); g.lineTo(ex + 22, ey); g.lineTo(ex - 22, ey); g.fill(); } glow(clamp(ex, 0, VW), Math.min(ey, VH * 0.86), 60, '235,240,255', 0.35 * a, 0.3); });
      if (o.laser > 0.01){ const vis = o.laser * (0.12 + 0.88 * haze); g.strokeStyle = `rgba(60,255,120,${0.7 * vis})`; g.lineWidth = 1.3; const sw = I.reduce && !F.allow ? 0 : Math.sin(F.t * 0.9) * 0.25; for (let i = 0; i < 9; i++){ const a = -Math.PI / 2 + (i - 4) * 0.16 + sw; g.beginPath(); g.moveTo(500, 245); g.lineTo(500 + Math.cos(a) * 700, 245 + Math.sin(a) * 700); g.stroke(); } glow(500, 245, 14, '60,255,120', 0.8 * o.laser); }
      if (o.blinder > 0.01){ [400, 600].forEach(x => { glow(x, 292, 240, '255,190,120', 0.3 * o.blinder); for (let i = 0; i < 2; i++) glow(x - 12 + i * 24, 292, 16, '255,230,190', 0.95 * o.blinder); }); glow(500, VH * 0.85, 420, '255,190,120', 0.25 * o.blinder, 0.3); }
      const sOn = performance.now() < F.strobeOn ? 1 : 0;
      if (sOn){ glow(500, 50, 30, '255,255,255', 0.9); g.fillStyle = 'rgba(230,235,255,0.3)'; g.fillRect(0, 0, VW, VH * 0.62); }
      const tot = (o.wash * F.par.reduce((a, b) => a + b) / 4 + o.beams * 0.5 + o.blinder + o.laser * 0.2) * m;
      if (haze > 0.02){ g.fillStyle = `rgba(150,160,190,${haze * (0.015 + 0.05 * Math.min(1, tot))})`; g.fillRect(0, 0, VW, VH); }
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#16161b'; g.fillRect(60, 40, 880, 10); px.forEach(x => { g.fillRect(x - 10, 50, 20, 16); }); hx.forEach(x => { g.beginPath(); g.arc(x, 56, 9, 0, 7); g.fill(); }); g.fillRect(488, 40, 24, 18);
      g.fillStyle = '#050507'; g.fillRect(380, 270, 240, 70); g.fillStyle = '#111117'; g.fillRect(380, 268, 240, 4);
      g.fillStyle = '#030304'; g.beginPath(); g.arc(500, 236, 14, 0, 7); g.fill(); g.fillRect(482, 250, 36, 22);
      const R = rng(5); for (let i = 0; i < 26; i++){ const x = 20 + i * 38 + R() * 16, y = VH * 0.86 + R() * 26, s = 15 + R() * 6, bob = I.on && !I.reduce ? Math.abs(Math.sin(F.t * Math.PI * F.bpm / 60 + i)) * 3 : 0; g.fillStyle = '#020203'; g.beginPath(); g.arc(x, y - bob, s, 0, 7); g.fill(); g.fillRect(x - s * 1.7, y - bob + s * 0.8, s * 3.4, 80); }
      const pct = Math.round(100 * clamp(tot / 2.7 + haze * 0.02 + sOn * 0.1, 0, 1)); meter.style.setProperty('--v', pct + '%'); meterT.textContent = pct + '%'; meter.setAttribute('aria-valuenow', pct);
    };
    /* the desk */
    const meter = h('div', 'lt-meter', '<span>Light in use</span><b><i></i></b><output></output>', { role: 'meter', 'aria-label': 'How much of the rig\'s light is in use' }); const meterT = meter.querySelector('output');
    const chans = [['wash', 'Pars (wash)'], ['beams', 'Moving beams'], ['blinder', 'Blinder'], ['laser', 'Laser fan'], ['haze', 'Haze']];
    const board = h('div', 'lt-desk', null, { role: 'group', 'aria-label': 'Lighting desk' }); const ins = {};
    const flashB = (ch, label) => { const b = btn(label || 'Flash', 'lt-flash', { 'aria-label': (label || 'Flash') + ' ' + ch + ' (hold)' }); const on = () => { if (ch === 'strobe'){ if (F.allow && flashOk()) F.flash.strobe1 = 1; return; } if (!F.flash[ch] && (ch === 'haze' || flashOk())) F.flash[ch] = 1; }, off = () => { F.flash[ch] = 0; }; b.addEventListener('pointerdown', e => { e.preventDefault(); on(); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, off)); b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); on(); } }); b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); off(); } }); b.addEventListener('click', e => e.preventDefault()); return b; };
    chans.forEach(([ch, l]) => { const r = range(l, 0, 100, F.lv[ch] * 100, 1, 'lt-fader'); const i = r.querySelector('input'); i.oninput = () => { F.lv[ch] = i.value / 100; r.querySelector('output').textContent = i.value; if (!I.on){ step(1); draw(); } }; i.oninput(); ins[ch] = i; const row = h('div', 'lt-chan'); row.append(r, flashB(ch, ch === 'haze' ? 'Puff' : 'Flash')); board.appendChild(row); });
    const sr = range('Strobe rate', 0, 3, 0, 0.5, 'lt-fader'); const si = sr.querySelector('input'); ins.strobe = si; si.oninput = () => { F.lv.strobe = +si.value; sr.querySelector('output').textContent = +si.value ? si.value + '/s' : 'off'; }; si.oninput();
    const srow = h('div', 'lt-chan lt-strobe'); srow.append(sr, flashB('strobe', 'Hit')); board.appendChild(srow);
    const why = h('p', 'cap lt-why', 'Strobe: capped at three flashes a second and a third of full brightness: the broadcast limit, below the four a second the HSE recommends for clubs. <a href="#" class="lt-jump">Why: read “The strobe” above ↑</a>');
    why.querySelector('a').onclick = e => { e.preventDefault(); const a = jump(pageEl, 'The strobe'); if (a){ a.scrollIntoView({ behavior: RM() ? 'auto' : 'smooth', block: 'start' }); a.setAttribute('tabindex', '-1'); a.focus({ preventScroll: true }); } };
    const cols = h('div', 'lt-row', null, { role: 'group', 'aria-label': 'Wash colour' });
    COLS.forEach(([n, c], i) => { const b = btn(`<i style="background:rgb(${c})"></i>${n}`, 'lt-col1', { 'aria-pressed': i === F.col }); b.onclick = () => { F.col = i; cols.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); if (!I.on) draw(); }; cols.appendChild(b); });
    const chS = h('select', '', [['off', 'No chase'], ['run', 'Run'], ['bounce', 'Bounce'], ['pairs', 'Pairs']].map(([k, l]) => `<option value="${k}"${k === F.chase ? ' selected' : ''}>${l}</option>`).join(''), { 'aria-label': 'Chase pattern' }); chS.onchange = () => { F.chase = chS.value; chase(); };
    const chL = h('label', 'lt-src', '<span>Chase (on the beat)</span>'); chL.appendChild(chS);
    const tap = btn('Tap tempo', 'lt-tap'); const bpmO = h('output', 'lt-bpm', F.bpm + ' bpm');
    tap.onclick = () => { const n = performance.now(); if (F.taps.length && n - F.taps[F.taps.length - 1] > 2000) F.taps = []; F.taps.push(n); if (F.taps.length > 5) F.taps.shift(); if (F.taps.length > 1){ const d = (F.taps[F.taps.length - 1] - F.taps[0]) / (F.taps.length - 1); F.bpm = Math.round(clamp(60000 / d, 80, 160)); T.bpm = F.bpm; bpmO.textContent = F.bpm + ' bpm'; I.say('Tempo ' + F.bpm + '.'); } };
    const bo = btn('Blackout', 'lt-bo', { 'aria-pressed': 'false' }); bo.onclick = () => { F.bo = !F.bo; bo.setAttribute('aria-pressed', F.bo); if (!I.on){ step(1); draw(); } };
    const set = (v, c, ch) => { Object.assign(F.lv, v); for (const k in v) if (ins[k]){ ins[k].value = k === 'strobe' ? v[k] : v[k] * 100; ins[k].oninput(); } if (c != null){ F.col = c; cols.children[c].click(); } if (ch && F.allow){ F.chase = ch; chS.value = ch; } chase(); if (!I.on){ step(1); draw(); } };
    const dark = btn('Dark room'); dark.onclick = () => { set({ wash: 0.06, beams: 0.3, blinder: 0, laser: 0, haze: 0.85, strobe: 0 }, 0, 'off'); I.say('Dark room: haze, a dim red wash and one slow beam. Look at the meter.'); };
    const full = btn('Everything up'); full.onclick = () => { set({ wash: 0.9, beams: 0.85, blinder: 0, laser: 0.6, haze: 0.5 }, 2, 'run'); I.say('The whole rig, apart from the blinder and the strobe.'); };
    const allow = h('label', 'toggle lt-allow', `<input type="checkbox"${F.allow ? ' checked' : ''}> Chases and strobe ${I.reduce ? '(off because your device asks for reduced motion)' : ''}`);
    const ai = allow.querySelector('input'); const syncAllow = () => { F.allow = ai.checked; chS.disabled = !F.allow; si.disabled = !F.allow; if (!F.allow){ F.chase = chS.value = 'off'; si.value = 0; si.oninput(); } chase(); }; ai.onchange = syncAllow; syncAllow();
    const top = h('div', 'lt-row'); top.append(tap, bpmO, bo, chL); const pre = h('div', 'lt-row'); pre.append(dark, full);
    I.ctl.append(meter, top, h('p', 'cap', 'Wash colour'), cols, board, why, pre, allow);
    chase();
    return { frame: (t, dt) => { T.poll(); step(dt); draw(); }, start: () => { T.bpm = F.bpm; T.start(); }, stop: () => { T.stop(); F.flash = {}; }, still: () => { step(1); draw(); }, resize: () => {} };
  }

  /* ---------- which chapter gets which ---------- */
  const DEF = {
    vz1: { anchor: 'Oil, water and a hot lamp', title: 'The liquid light show', aspect: '4/3', gl: true, build: liquid,
      intro: 'Coloured oils floating on water in a glass dish, lit from below by a projector lamp. Press Play, then push the oil about, press down to squeeze it, or tilt the glass. Turn up the heat and the convection gets busier.',
      alt: 'A round pool of projector light with blobs of coloured oil drifting in water. The blobs merge with their own colour and keep apart from other colours. Nothing flashes.' },
    vz2: { anchor: 'Let Us Play', title: 'Scratch the picture', notice: true, audio: true, build: sampler,
      intro: 'Eight pads, each a short synthesised sound with its own made-up picture, so that cutting the sound cuts the picture. Tap a pad, build a pattern on the sixteen steps, then drag the scratch strip to rock the clip back and forth.',
      alt: 'A dark screen on which a simple abstract shape plays for each sound: rings for the kick, sliding bars for the snare, dots for the hat, and so on.' },
    vz3: { anchor: 'The mixer and the screens', title: 'The VJ\'s desk', notice: true, audio: true, build: vjdesk,
      intro: 'Two generated loops go into a video mixer. Move the crossfader, change the blend, add effects, then start the kick and turn on beat sync so the effects step on the beat, as the hardware mixers of the 2000s could.',
      alt: 'The mixer\'s output: two abstract animated loops, such as a tunnel of rectangles and rotating polygons, blended together and changed by mirror, feedback and posterise effects.' },
    vz4: { anchor: 'Cubes', title: 'Map the cube', notice: true, audio: true, build: cube,
      intro: 'A white cube on a dark stage, and one projector. A projector only throws a flat rectangle, so each picture has to be warped to fit its face. Drag the corner pins to the cube\'s corners, then play the show.',
      alt: 'An isometric cube with three visible faces, each carrying a generated pattern. Where a picture is not pinned to its face, the light spills on the wall behind.' },
    vz5: { anchor: 'The man at the board', title: 'Work the desk', notice: true, audio: true, build: desk,
      intro: 'A small club room with a few groups of lights, and a desk to play them. Press Play for a kick and hats, tap the tempo, pick a chase, push the faders, hold the flash buttons and throw a blackout on the drop. Then try the dark room.',
      alt: 'A club room in silhouette: a truss of lights above a DJ booth and a crowd. Coloured washes, white beams in haze, a green laser fan and warm blinders respond to the desk.' }
  };
  function mount(pageEl, id){
    const spec = DEF[id]; if (!spec || !pageEl || pageEl.querySelector('.lights[data-lid="' + id + '"]')) return null;
    const I = shell(pageEl, id, spec); I.where = place(pageEl, I.box, spec.anchor);
    I.f = spec.build(I, pageEl); S.inst.push(I); I.syncMute();
    requestAnimationFrame(() => { I.size(); if (I.f) I.f.still(); });
    return I;
  }
  return { mount, pauseAll, ids: Object.keys(DEF), _inst: S.inst, _audio: A };
})();
if (window._lightsPending){ const p = window._lightsPending; window._lightsPending = null; Lights.mount(p[0], p[1]); }
