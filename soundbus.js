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
    try { const ch = window.AudioCore && AudioCore.peek && AudioCore.peek(); if (ch && kind !== 'mixer'){ const t = ch.c.currentTime; ch.duck.gain.cancelScheduledValues(t); ch.duck.gain.setValueAtTime(1, t); } } catch (e) {}
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
