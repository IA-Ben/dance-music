/* ===================================================================
   SOUND BUS — one source at a time, and silence on every page turn.
   Every play entry point claims the bus; the router silences it.
   =================================================================== */
const _G = n => { try { return eval(n); } catch (e) { return undefined; } };
window.SoundBus = {
  closeEmbeds(){ document.querySelectorAll('.spbox').forEach(b => b.remove()); },
  // stop everything except the kind that is about to start
  claim(kind){
    try { if (window.Fade) Fade.cut(); else if (typeof Voices !== 'undefined'){ Voices.forEach(v => { try { v.node.stop(0); } catch (e) {} }); Voices.length = 0; } } catch (e) {}
    try { const Sq = _G('Seq'); if (kind !== 'seq' && Sq && Sq.playing) Sq.stop(); } catch (e) {}
    try { const Mx = _G('Mixer'); if (kind !== 'mixer' && Mx && Mx.playing){ if (window.MixerStop) MixerStop(); else Mx.stop(); } } catch (e) {}
    try { if (kind !== 'grid' && window.PatternGrid && PatternGrid.active) PatternGrid.stop(); } catch (e) {}
    try { if (kind !== 'morph' && window.Morph && Morph.active) Morph.stop(); } catch (e) {}
    try { if (kind !== 'embed') this.closeEmbeds(); } catch (e) {}
    try { if (kind !== 'reader' && window.Reader && Reader.on) Reader.stop(); } catch (e) {}
    try { const ch = typeof AudioCore !== 'undefined' && AudioCore.peek && AudioCore.peek(); if (ch && kind !== 'mixer'){ const t = ch.c.currentTime; ch.duck.gain.cancelScheduledValues(t); ch.duck.gain.setValueAtTime(1, t); } } catch (e) {}
  },
  all(){ this.claim('nothing'); if (typeof stopAll === 'function') try { stopAll(); } catch (e) {} }
};
// wrap the entry points that exist by now
(() => {
  const wrap = (obj, m, kind) => { if (!obj || typeof obj[m] !== 'function' || obj[m]._bus) return; const f = obj[m]; obj[m] = function(...a){ SoundBus.claim(kind); return f.apply(this, a); }; obj[m]._bus = 1; };
  if (window.PatternGrid) wrap(PatternGrid, 'play', 'grid');
  if (window.Morph) wrap(Morph, 'play', 'morph');
  wrap(_G('Mixer'), 'start', 'mixer');
  wrap(_G('Seq'), 'start', 'seq');
  if (window.Reader) wrap(Reader, 'start', 'reader');
  if (window.SpotifyEmbed){ wrap(SpotifyEmbed, 'open', 'embed'); wrap(SpotifyEmbed, 'openYt', 'embed'); }
})();

/* ===================================================================
   AUDIO START-UP FOR PHONES — shared by the whole book.
   - iOS mutes Web Audio when the ringer switch is on silent, unless the
     page is in the "playback" audio session: navigator.audioSession
     (iOS 17+) where it exists, otherwise a looping silent <audio> started
     inside the first tap that makes sound (older iOS, in-app browsers).
   - iOS leaves the context "interrupted" or "suspended" after a call, an
     alarm, a lock or a tab switch: resume it on return and on the next tap.
   - a safety limiter after the master analyser, so a hot mix of two decks
     never clips the phone's output.
   Nothing here runs until the reader presses something that makes sound.
   =================================================================== */
(() => {
  const ua = navigator.userAgent || '';
  const iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
  const needTag = iOS && !navigator.audioSession;
  let tag = null;
  const silentWav = () => {            // 0.5 s of 8 kHz, 8-bit mono silence, built here: no file to fetch
    const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), s = (o, t) => { for (let i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
    s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44);
    let bin = ''; for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]); return 'data:audio/wav;base64,' + btoa(bin);
  };
  const tagOn = () => {
    if (!needTag || document.hidden) return;
    try {
      if (!tag){ tag = document.createElement('audio'); tag.setAttribute('playsinline', ''); tag.setAttribute('webkit-playsinline', ''); tag.setAttribute('x-webkit-airplay', 'deny'); tag.disableRemotePlayback = true; tag.loop = true; tag.preload = 'auto'; tag.src = silentWav(); }
      if (tag.paused){ const p = tag.play(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) {}
  };
  const tagOff = () => { try { if (tag && !tag.paused) tag.pause(); } catch (e) {} };
  const AC = () => (typeof AudioCore !== 'undefined' ? AudioCore : null);   // a const in engine.js, not a window property
  const core = () => { const A = AC(); return (A && A.peek && A.peek()) || null; };
  const wake = () => { const ch = core(); if (!ch) return Promise.resolve(); const c = ch.c; if (c.state === 'running' || c.state === 'closed') return Promise.resolve(); try { return c.resume().catch(() => {}); } catch (e) { return Promise.resolve(); } };
  const say = () => { const ch = core(); try { document.dispatchEvent(new CustomEvent('dm-audiostate', { detail: ch ? ch.c.state : 'none' })); } catch (e) {} };
  const primed = new WeakSet();
  function prime(ch){
    const c = ch.c; if (primed.has(c)) return; primed.add(c);
    try {                                   // safety limiter: catches only peaks above -1 dBFS
      const lim = c.createDynamicsCompressor(); lim.threshold.value = -1; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
      ch.analyser.disconnect(); ch.analyser.connect(lim); lim.connect(c.destination); ch.limiter = lim;
    } catch (e) { try { ch.analyser.connect(c.destination); } catch (e2) {} }
    c.addEventListener('statechange', () => { say(); if (c.state !== 'running' && c.state !== 'closed' && !document.hidden) setTimeout(wake, 300); });
  }
  if (AC() && AudioCore.get && !AudioCore.get._dm){
    const g0 = AudioCore.get;
    AudioCore.get = function(){ const ch = g0.apply(this, arguments); if (ch){ prime(ch); if (ch.c.state !== 'running') wake(); tagOn(); } return ch; };
    AudioCore.get._dm = 1;
  }
  // the next tap after an interruption brings the sound back (iOS will only resume inside a gesture)
  ['touchend', 'pointerup', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { const ch = core(); if (ch && ch.c.state !== 'running' && ch.c.state !== 'closed'){ wake().then(say); if (typeof Mixer !== 'undefined' && Mixer.playing) tagOn(); } }, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden){ tagOff(); return; } wake().then(say); if (typeof Mixer !== 'undefined' && Mixer.playing) tagOn(); });
  window.addEventListener('pageshow', () => { wake().then(say); });
  const sb = document.getElementById('stopAll'); if (sb) sb.addEventListener('click', tagOff);
  const all0 = SoundBus.all.bind(SoundBus); SoundBus.all = () => { all0(); tagOff(); };
  SoundBus.wake = wake; SoundBus.unlock = tagOn; SoundBus.iOS = iOS; SoundBus.silentTag = () => tag;
})();
