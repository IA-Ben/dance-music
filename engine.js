
/* ===================================================================
   PAGE / CHAPTER SYSTEM — strands, nodes, flip book
   =================================================================== */
window.PageHooks = window.PageHooks || {};
const STRAND_KEYS = Object.keys(STRANDS);
let CURSTRAND = 'techno', CUR = null, FLIPPING = false, PENDING = null;
const pageEl = id => document.querySelector(`.page[data-page="${id}"]`);
const pageExists = id => !!pageEl(id) || !!NODE[id];
const onSpine = (s, id) => STRANDS[s] && STRANDS[s].spine.includes(id);
const titleOf = id => CHAPTER_TITLES[id] || (NODE[id] && NODE[id].title) || id;
function parseHash(){
  let h = (location.hash || '#home').slice(1).split(/[?&]/)[0]; let strand = null;
  for (const s of STRAND_KEYS){ if (h.startsWith(s + '-')){ const rest = h.slice(s.length + 1); if (pageExists(rest)){ strand = s; h = rest; break; } } }
  MISSING = (!pageExists(h) && h && h !== 'home') ? h : null; if (!pageExists(h)) h = 'home'; return { id: h, strand };
}
let MISSING = null;
function noteMissing(){ if (!MISSING) return; let n = document.getElementById('missingNote'); if (!n){ n = document.createElement('div'); n.id = 'missingNote'; n.setAttribute('role', 'status'); document.body.appendChild(n); } let h = MISSING; try { h = decodeURIComponent(h); } catch (e) {} n.textContent = `There is no page at “${h}”, so here is the cover. Try the search in the contents.`; n.classList.add('show'); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('show'), 7000); }
function strandFor(id, hinted){
  if (hinted && (onSpine(hinted, id) || (NODE[id] && NODE[id].strands.includes(hinted)))) return hinted;
  if (onSpine(CURSTRAND, id)) return CURSTRAND;
  for (const s of STRAND_KEYS) if (onSpine(s, id)) return s;
  if (NODE[id]){ const s = NODE[id].strands.find(x => STRANDS[x]); if (s) return s; }
  return CURSTRAND;
}
function buildShell(){
  const side = document.getElementById('side'); side.innerHTML = '<a class="brand" href="#home">fortyyearsof.dance<small>dance music · ' + BOOK.span + '</small></a><div id="sideSearch"><input type="search" placeholder="search people, clubs, records…"><div class="results"></div></div>';
  if (typeof Contents !== 'undefined'){ Contents.buildSide(side); const home = document.getElementById('homeToc'); if (home) Contents.buildHome(home); if (window.smarten){ smarten(side); if (home) smarten(home); } }
  document.getElementById('menuBtn').onclick = () => side.classList.toggle('open');
  const applyTheme = () => { const paper = localStorage.getItem('dm-theme') !== 'dark'; document.body.classList.toggle('paper', paper); const tb = document.getElementById('themeBtn'); if (tb) tb.textContent = paper ? 'Dark' : 'Paper'; }; applyTheme();
  document.getElementById('readBtn').onclick = () => { if (window.Reader) Reader.toggle(); };
  if (window.Neural && Neural.ok()){ const vb = document.createElement('button'); vb.id = 'voiceBtn'; vb.title = 'Choose the reading voice'; vb.textContent = 'Voice'; document.getElementById('readBtn').after(vb); vb.onclick = () => Neural.picker(); }
  document.getElementById('themeBtn').onclick = () => { localStorage.setItem('dm-theme', document.body.classList.contains('paper') ? 'dark' : 'paper'); applyTheme(); };
  try { const q = new URLSearchParams(location.search), pid = q.get('p'); if (pid && /^[\w-]+$/.test(pid)){ q.delete('p'); const rest = q.toString(); history.replaceState(null, '', location.pathname + '#' + pid + (rest ? '?' + rest : '')); } } catch (e) {}
  window.addEventListener('hashchange', route); if (window.buildSearch) buildSearch();
}
function pageFlipSound(){
  const ch = AudioCore.peek(); if (!ch || ch.c.state !== 'running') return; const c = ch.c, t = c.currentTime;
  const n = c.createBufferSource(); n.buffer = AudioCore.noise(c); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7; bp.frequency.setValueAtTime(600, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.18);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  n.connect(bp); bp.connect(g); g.connect(ch.out); n.start(t); n.stop(t + 0.3);
}
function goTo(delta){ const sp = STRANDS[CURSTRAND].spine; const i = sp.indexOf(CUR); if (i < 0){ if (delta < 0) history.back(); return; } const n = sp[i + delta]; if (n) location.hash = '#' + CURSTRAND + '-' + n; }
function route(){
  const { id, strand: hinted } = parseHash();
  if (CUR && id === CUR && !hinted && window.PageHooks && PageHooks[id + '?']){ PageHooks[id + '?'](); return; }   /* only the ?params changed on the same page (the cover graph's view): let the page move, don't turn it */
  const strand = strandFor(id, hinted);
  if (FLIPPING){ PENDING = location.hash; return; }
  const isNode = !pageEl(id) && !!NODE[id]; const inEl = isNode ? pageEl('node') : pageEl(id); const outEl = CUR ? (pageEl(CUR) || pageEl('node')) : null;
  const sp = STRANDS[strand].spine; const idx = sp.indexOf(id); const fromIdx = CUR ? sp.indexOf(CUR) : -1;
  let dir = 0; if (outEl && outEl !== inEl){ dir = (idx >= 0 && fromIdx >= 0) ? Math.sign(idx - fromIdx) || 1 : 1; }
  CURSTRAND = strand; noteMissing();
  if (isNode) NodeView.render(id, strand);
  const crumb = document.getElementById('crumb'); crumb.innerHTML = id === 'home' ? '<b>Cover</b>' : `${(STANDALONE[id] || STRANDS[strand].title)} · <b>${titleOf(id)}</b>`; crumb.style.setProperty('--c', `var(${STRANDS[strand].color})`);
  const spine = document.getElementById('spine'); if (spine){ spine.style.setProperty('--c', `var(${STRANDS[strand].color})`); spine.firstElementChild.style.width = (idx >= 0 ? (idx + 1) / sp.length * 100 : 0) + '%'; }
  let nav = inEl.querySelector('.pagenav'); if (!nav){ nav = document.createElement('div'); nav.className = 'pagenav'; inEl.appendChild(nav); const pn = document.createElement('div'); pn.className = 'pagenum'; inEl.appendChild(pn); const cn = document.createElement('div'); cn.className = 'corner next'; cn.innerHTML = '<span>turn ›</span>'; cn.onclick = () => goTo(1); inEl.appendChild(cn); const cp = document.createElement('div'); cp.className = 'corner prev'; cp.innerHTML = '<span>‹ back</span>'; cp.onclick = () => goTo(-1); inEl.appendChild(cp); }
  if (isNode){ inEl.appendChild(nav); inEl.appendChild(inEl.querySelector('.pagenum')); inEl.appendChild(inEl.querySelector('.corner.next')); inEl.appendChild(inEl.querySelector('.corner.prev')); }
  const prev = idx > 0 ? sp[idx - 1] : null, next = idx >= 0 && idx < sp.length - 1 ? sp[idx + 1] : null;
  const lastChapter = [...Trail.items].reverse().find(t => t.id !== id && !NODE[t.id]);
  const prevHtml = prev ? `<a href="#${strand}-${prev}"><small>← previous · ${STRANDS[strand].title}</small>${titleOf(prev)}</a>` : lastChapter ? `<a href="#${lastChapter.id}"><small>← back to</small>${lastChapter.title}</a>` : '<span style="flex:1"></span>';
  const nextHtml = next ? `<a class="next" href="#${strand}-${next}"><small>next · ${STRANDS[strand].title} →</small>${titleOf(next)}</a>` : (isNode && NODE[id].strands.find(s => STRANDS[s])) ? (() => { const s = NODE[id].strands.find(x => STRANDS[x]); const m = ((typeof MENTIONS !== 'undefined' && MENTIONS && MENTIONS[id]) || []).find(c => onSpine(s, c)); return m ? `<a class="next" href="#${s}-${m}"><small>read about it · ${STRANDS[s].title} →</small>${titleOf(m)}</a>` : `<a class="next" href="#${s}-${STRANDS[s].spine[0]}"><small>the ${STRANDS[s].title} strand →</small>${titleOf(STRANDS[s].spine[0])}</a>`; })() : '';
  nav.innerHTML = prevHtml + nextHtml;
  inEl.querySelector('.pagenum').textContent = idx >= 0 ? `${STRANDS[strand].title} · page ${idx + 1} of ${sp.length}` : (isNode ? `${TYPE_LABEL[NODE[id].type]} page · ${Object.keys(NODE).length} nodes in the book` : '');
  inEl.querySelector('.corner.next').style.display = next ? '' : 'none'; inEl.querySelector('.corner.prev').style.display = (prev || isNode) ? '' : 'none';
  document.body.dataset.strand = strand;
  let rh = inEl.querySelector('.runhead'); if (!rh){ rh = document.createElement('div'); rh.className = 'runhead'; inEl.prepend(rh); const tb = document.createElement('div'); tb.className = 'thumbtab'; inEl.prepend(tb); ['l', 'r'].forEach(k => { const f = document.createElement('div'); f.className = 'folio ' + k; inEl.appendChild(f); }); }
  const gidx = idx >= 0 ? STRAND_KEYS.slice(0, STRAND_KEYS.indexOf(strand)).reduce((a, k) => a + STRANDS[k].spine.length, 0) + idx : -1;
  rh.innerHTML = `<span>fortyyearsof.dance</span><span>${id === 'home' ? 'Introduction' : isNode ? (TYPE_LABEL[NODE[id].type] + ' · ' + titleOf(id)) : ((STANDALONE[id] || STRANDS[strand].title)) + ' · ' + titleOf(id)}</span>`;
  inEl.querySelector('.thumbtab').textContent = isNode ? TYPE_LABEL[NODE[id].type] : ((STANDALONE[id] || STRANDS[strand].title));
  inEl.querySelector('.folio.l').textContent = gidx >= 0 ? String(2 * gidx + 1) : (isNode ? NODE[id].years || '' : ''); inEl.querySelector('.folio.r').textContent = gidx >= 0 ? String(2 * gidx + 2) : (isNode ? TYPE_LABEL[NODE[id].type].toLowerCase() : '');
  if (!isNode && window.renderForks) renderForks(id, inEl);
  if (!isNode && !inEl.dataset.linked && window.autolink){ inEl.dataset.linked = 1; autolink(inEl, id); }
  if (window.SoundBus && CUR && CUR !== id) SoundBus.all();
  Trail.push(id, titleOf(id)); Visited.add(id);
  if (typeof Contents !== 'undefined') Contents.sync(id, strand, idx >= 0);
  if (window.Notes && id !== 'home' && !/^(year|explore|tours|path|quiz|crate|notes|credits|rights|mixer)$/.test(id)) Notes.mount(inEl, id);
  if (isNode && window.Flyer) Flyer.autoMount(inEl, id);
  if (window.SpotifyEmbed) setTimeout(() => { SpotifyEmbed.wire(inEl); if (isNode) SpotifyEmbed.feature(inEl, id); }, 50);
  if (window.Gallery) Gallery.mount(inEl, id, isNode);
  if (window.Flyers) Flyers.mount(inEl, id, isNode);
  if (window.ClubFlyers) ClubFlyers.mount(inEl, id, isNode);
  if (window.Listings) Listings.mount(inEl, id, isNode);
  if (window.HowTo && isNode){ inEl.dataset.node = id; HowTo.mount(inEl); }
  if (window.Panels){ Panels.mountAll(inEl); if (!isNode) Panels.mountChapter(inEl, id); }
  if (window.Art) Art.mount(inEl, id);
  if (window.Floor) Floor.mount(inEl, id, isNode);
  if (window.Place) Place.mountAll(inEl);
  if (isNode && NODE[id].type === 'record' && window.Crate){ const slot = inEl.querySelector('.chips'); if (slot && !slot.querySelector('.crate-btn')) slot.appendChild(Crate.button(id)); }
  const finish = () => { if (outEl && outEl !== inEl) outEl.classList.remove('show', 'lift', 'out-fwd', 'in-back'); inEl.classList.remove('lift', 'in-back'); inEl.classList.add('show'); FLIPPING = false; if (PageHooks[id]) PageHooks[id](); if (!isNode && window.autolink) setTimeout(() => { try { autolink(inEl, id); } catch (e) {} }, 60); if (window.smarten){ smarten(inEl); smarten(document.getElementById('crumb')); setTimeout(() => smarten(inEl), 800); } if (PENDING){ const p = PENDING; PENDING = null; if (p !== location.hash) location.hash = p; } };
  CUR = id;
  if (!outEl || outEl === inEl || dir === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches){ document.querySelectorAll('.page').forEach(p => p.classList.toggle('show', p === inEl)); window.scrollTo(0, 0); finish(); return; }
  FLIPPING = true; window.scrollTo(0, 0); pageFlipSound();
  if (dir > 0){ inEl.classList.add('show'); outEl.classList.add('lift', 'out-fwd'); outEl.addEventListener('animationend', finish, { once: true }); }
  else { inEl.classList.add('show', 'lift', 'in-back'); inEl.addEventListener('animationend', finish, { once: true }); }
  setTimeout(() => { if (FLIPPING) finish(); }, 700);
}
function bookControls(){
  document.addEventListener('keydown', e => { if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return; const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'select' || tag === 'textarea') return; if (e.target.closest && e.target.closest('svg, .dg-tip, [role="slider"], [contenteditable]')) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(-1); });
  let sx = null, sy = null; const m = document.getElementById('book');
  m.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  m.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(dx < 0 ? 1 : -1); sx = sy = null; }, { passive: true });
  document.getElementById('prevBtn').onclick = () => goTo(-1); document.getElementById('nextBtn').onclick = () => goTo(1);
}

/* ===================================================================
   AUDIO CORE
   =================================================================== */
const AudioCore = (() => {
  let ctx = null, chain = null;
  const noiseCache = new WeakMap();
  function noise(c){
    if (noiseCache.has(c)) return noiseCache.get(c);
    const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseCache.set(c, b); return b;
  }
  function impulse(c, secs, decay, lp){
    const len = Math.floor(c.sampleRate * secs);
    const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++){
      const d = b.getChannelData(ch); let y = 0;
      for (let i = 0; i < len; i++){
        const env = Math.pow(1 - i / len, decay);
        let x = (Math.random() * 2 - 1) * env;
        if (lp){ y += (x - y) * lp; x = y; }
        d[i] = x;
      }
    }
    return b;
  }
  function curve(drive){
    const n = 2048, c = new Float32Array(n), k = Math.tanh(drive);
    for (let i = 0; i < n; i++){ const x = i * 2 / (n - 1) - 1; c[i] = Math.tanh(x * drive) / k; }
    return c;
  }
  function build(c, live){
    const out = c.createGain(); out.gain.value = ST.master;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -9; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.12; comp.knee.value = 6;
    const analyser = c.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.8;
    out.connect(comp); comp.connect(analyser); analyser.connect(c.destination);
    const duck = c.createGain(); duck.connect(out);
    // reverb send/return (ducked)
    const verb = c.createConvolver(); verb.buffer = impulse(c, 2.2, 3, 0);
    const verbRet = c.createGain(); verbRet.gain.value = 0.4; verb.connect(verbRet); verbRet.connect(duck);
    const verbSend = c.createGain(); verbSend.connect(verb);
    // dub delay send/return (ducked)
    const delay = c.createDelay(2); delay.delayTime.value = (60 / ST.bpm) * 0.75;
    const dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2200;
    const fb = c.createGain(); fb.gain.value = 0.55;
    delay.connect(dlp); dlp.connect(fb); fb.connect(delay);
    const delRet = c.createGain(); delRet.gain.value = 0.6; dlp.connect(delRet); delRet.connect(duck);
    const delSend = c.createGain(); delSend.connect(delay);
    // rumble chain: kick copy -> drive -> dark reverb -> HPF -> LPF -> level -> duck
    const rumbleIn = c.createGain();
    const rsh = c.createWaveShaper(); rsh.curve = curve(7); rsh.oversample = '2x';
    const rverb = c.createConvolver(); rverb.buffer = impulse(c, 1.5, 2.2, 0.08);
    const rhp = c.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 28;
    const rlp = c.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = ST.rumble.cutoff; rlp.Q.value = 2;
    const rumbleGain = c.createGain();
    rumbleIn.connect(rsh); rsh.connect(rverb); rverb.connect(rhp); rhp.connect(rlp); rlp.connect(rumbleGain);
    // per-track gains
    const tr = {};
    TRACKS.forEach(t => {
      const g = t.id === 'rumble' ? rumbleGain : c.createGain();
      g.gain.value = ST.level[t.id] * t.base;
      g.connect(t.bus === 'duck' ? duck : out);
      tr[t.id] = g;
    });
    return { c, live: !!live, out, comp, analyser, duck, verbSend, delSend, delay, rumbleIn, rlp, tr };
  }
  function get(){
    if (!ctx){
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      chain = build(ctx, true);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return chain;
  }
  function peek(){ return chain; }
  return { get, peek, build, noise, curve, impulse };
})();

/* voices registry so Stop can kill scheduled notes */
const Voices = [];
function reg(ch, node, stopAt){ if (ch.live) Voices.push({ node, stopAt }); return node; }
function pruneVoices(now){ for (let i = Voices.length - 1; i >= 0; i--) if (Voices[i].stopAt < now) Voices.splice(i, 1); }
function stopAll(){
  if (window.MixerStop) MixerStop(); if (window.GridStop) GridStop();
  if (window.Fade) Fade.cut();
  Voices.forEach(v => { try { v.node.stop(0); } catch (e) {} });
  Voices.length = 0;
  const ch = AudioCore.peek();
  if (ch){ const t = ch.c.currentTime; ch.duck.gain.cancelScheduledValues(t); ch.duck.gain.setValueAtTime(1, t); }
  Seq.stop();
}

/* ===================================================================
   GLOBAL STATE (shared by section demos and the sequencer)
   =================================================================== */
const ROOTS = [['E1', 41.20], ['F1', 43.65], ['F#1', 46.25], ['G1', 49.00], ['G#1', 51.91], ['A1', 55.00], ['A#1', 58.27], ['B1', 61.74], ['C2', 65.41]];
const ST = {
  master: 0.8, bpm: 132, swing: 0, root: 49.00,
  kick: { pitchStart: 180, pitchEnd: 49, pitchDecay: 0.045, ampDecay: 0.45, drive: 2.5, click: 0.5 },
  hat: { decayC: 0.045, decayO: 0.28, tone: 9000 },
  clap: { decay: 0.22 },
  perc: { tomPitch: 200, metalRatio: 1.41 },
  rumble: { cutoff: 110 },
  sc: { amt: 0.7, rel: 0.25, on: true },
  sub: { drive: 1.5, dur: 0.45 },
  off: { cutoff: 700 },
  acid: { cutoff: 500, res: 14, env: 2600, decay: 0.2, wave: 'sawtooth' },
  stab: { detune: 10, cutoff: 700, env: 2800, decay: 0.3, verb: 0.5 },
  pad: { lfo: 0.4, cutoff: 700 },
  samp: { rate: 1 },
  level: {}, mute: {}, solo: {}
};

const TRACKS = [
  { id: 'kick',   name: 'Kick',        color: '--kick',   bus: 'out',  base: 1.0 },
  { id: 'rumble', name: 'Rumble',      color: '--rumble', bus: 'duck', base: 1.0, send: true },
  { id: 'sub',    name: 'Sub bass',    color: '--bass',   bus: 'duck', base: 1.0 },
  { id: 'off',    name: 'Offbeat bass',color: '--bass',   bus: 'duck', base: 1.0 },
  { id: 'acid',   name: 'Acid 303',    color: '--bass',   bus: 'duck', base: 1.0, acid: true },
  { id: 'stab',   name: 'Stab',        color: '--synth',  bus: 'duck', base: 1.0 },
  { id: 'hatc',   name: 'Closed hat',  color: '--drums',  bus: 'out',  base: 1.0 },
  { id: 'hato',   name: 'Open hat',    color: '--drums',  bus: 'out',  base: 1.0 },
  { id: 'clap',   name: 'Clap',        color: '--drums',  bus: 'out',  base: 1.0 },
  { id: 'tom',    name: 'Tom',         color: '--perc',   bus: 'out',  base: 1.0 },
  { id: 'metal',  name: 'Metallic',    color: '--perc',   bus: 'out',  base: 1.0 },
  { id: 'shaker', name: 'Shaker',      color: '--perc',   bus: 'out',  base: 1.0 },
];
TRACKS.forEach(t => { ST.level[t.id] = 0.8; ST.mute[t.id] = false; ST.solo[t.id] = false; });
ST.level.rumble = 0.7; ST.level.acid = 0.6; ST.level.stab = 0.7; ST.level.hatc = 0.6; ST.level.hato = 0.5; ST.level.shaker = 0.5;

/* ===================================================================
   SOUND GENERATORS   S.name(chain, time, params)
   =================================================================== */
const S = {};
const dest = (ch, p, bus) => p.dest || (ch.tr && ch.tr[bus]) || ch.out;

S.kick = (ch, t, p = {}) => {
  const c = ch.c, P = { ...ST.kick, level: 1, ...p };
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(P.pitchStart, t);
  o.frequency.exponentialRampToValueAtTime(P.pitchEnd, t + P.pitchDecay);
  const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(Math.max(1, P.drive)); sh.oversample = '2x';
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.ampDecay);
  const d = dest(ch, P, 'kick');
  o.connect(sh); sh.connect(g); g.connect(d);
  o.start(t); o.stop(t + P.ampDecay + 0.1); reg(ch, o, t + P.ampDecay + 0.1);
  if (P.click > 0.01){
    const n = c.createBufferSource(); n.buffer = AudioCore.noise(c);
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const cg = c.createGain(); cg.gain.setValueAtTime(P.click * 0.6 * P.level, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.014);
    n.connect(hp); hp.connect(cg); cg.connect(d); n.start(t); n.stop(t + 0.05); reg(ch, n, t + 0.05);
  }
};
S.rumble = (ch, t, p = {}) => S.kick(ch, t, { ...ST.kick, ...p, click: 0, dest: ch.rumbleIn });

S.hat = (ch, t, p = {}) => {
  const c = ch.c, P = { decay: ST.hat.decayC, tone: ST.hat.tone, level: 0.35, ...p };
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = P.tone; bp.Q.value = 1.2;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500;
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(r => {
    const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 40 * r;
    o.connect(bp); o.start(t); o.stop(t + P.decay + 0.05); reg(ch, o, t + P.decay + 0.05);
  });
  bp.connect(hp); hp.connect(g); g.connect(dest(ch, P, p.open ? 'hato' : 'hatc'));
};
S.clap = (ch, t, p = {}) => {
  const c = ch.c, P = { decay: ST.clap.decay, level: 0.8, ...p };
  const n = c.createBufferSource(); n.buffer = AudioCore.noise(c);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.9;
  const g = c.createGain(); g.gain.setValueAtTime(0, t);
  [0, 0.011, 0.022].forEach(k => { g.gain.setValueAtTime(P.level, t + k); g.gain.exponentialRampToValueAtTime(P.level * 0.15, t + k + 0.01); });
  g.gain.setValueAtTime(P.level, t + 0.033); g.gain.exponentialRampToValueAtTime(0.001, t + 0.033 + P.decay);
  n.connect(bp); bp.connect(g); g.connect(dest(ch, P, 'clap'));
  const vs = c.createGain(); vs.gain.value = 0.35; g.connect(vs); vs.connect(ch.verbSend);
  n.start(t); n.stop(t + P.decay + 0.1); reg(ch, n, t + P.decay + 0.1);
};
S.tom = (ch, t, p = {}) => {
  const c = ch.c, P = { pitch: ST.perc.tomPitch, decay: 0.22, level: 0.55, ...p };
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(P.pitch, t); o.frequency.exponentialRampToValueAtTime(P.pitch * 0.45, t + 0.09);
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  o.connect(g); g.connect(dest(ch, P, 'tom')); o.start(t); o.stop(t + P.decay + 0.05); reg(ch, o, t + P.decay + 0.05);
};
S.metal = (ch, t, p = {}) => {
  const c = ch.c, P = { carrier: 720, ratio: ST.perc.metalRatio, index: 900, decay: 0.14, level: 0.4, ...p };
  const car = c.createOscillator(); car.type = 'sine'; car.frequency.value = P.carrier;
  const mod = c.createOscillator(); mod.type = 'sine'; mod.frequency.value = P.carrier * P.ratio;
  const mg = c.createGain(); mg.gain.setValueAtTime(P.index, t); mg.gain.exponentialRampToValueAtTime(P.index * 0.1, t + P.decay);
  mod.connect(mg); mg.connect(car.frequency);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.4;
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  car.connect(bp); bp.connect(g); g.connect(dest(ch, P, 'metal'));
  car.start(t); mod.start(t); car.stop(t + P.decay + 0.05); mod.stop(t + P.decay + 0.05); reg(ch, car, t + 0.3); reg(ch, mod, t + 0.3);
};
S.shaker = (ch, t, p = {}) => {
  const c = ch.c, P = { decay: 0.08, level: 0.35, ...p };
  const n = c.createBufferSource(); n.buffer = AudioCore.noise(c);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6500; bp.Q.value = 2;
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + 0.015 + P.decay);
  n.connect(bp); bp.connect(g); g.connect(dest(ch, P, 'shaker')); n.start(t); n.stop(t + 0.2); reg(ch, n, t + 0.2);
};
S.sub = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: ST.root, dur: ST.sub.dur, drive: ST.sub.drive, level: 0.9, ...p };
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = P.freq;
  const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(Math.max(1, P.drive));
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.008);
  g.gain.setValueAtTime(P.level, t + P.dur * 0.55); g.gain.exponentialRampToValueAtTime(0.001, t + P.dur);
  o.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'sub')); o.start(t); o.stop(t + P.dur + 0.05); reg(ch, o, t + P.dur + 0.05);
};
S.off = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: ST.root * 2, cutoff: ST.off.cutoff, decay: 0.2, level: 0.45, ...p };
  const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq;
  const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = P.freq / 2;
  const og = c.createGain(); og.gain.value = 0.35;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 5;
  f.frequency.setValueAtTime(P.cutoff * 2.2, t); f.frequency.exponentialRampToValueAtTime(Math.max(80, P.cutoff * 0.35), t + 0.14);
  const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(2);
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  o.connect(f); o2.connect(og); og.connect(f); f.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'off'));
  o.start(t); o2.start(t); o.stop(t + P.decay + 0.05); o2.stop(t + P.decay + 0.05); reg(ch, o, t + 0.4); reg(ch, o2, t + 0.4);
};
S.acid = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: ST.root * 2, ...ST.acid, accent: false, slideTo: null, slideTime: 0, gate: 0.11, level: 0.5, ...p };
  const o = c.createOscillator(); o.type = P.wave; o.frequency.setValueAtTime(P.freq, t);
  const gate = P.slideTo ? P.slideTime : P.gate;
  if (P.slideTo){ o.frequency.setValueAtTime(P.freq, t + gate * 0.35); o.frequency.exponentialRampToValueAtTime(P.slideTo, t + gate); }
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = P.res;
  const peak = Math.min(16000, P.cutoff + P.env * (P.accent ? 1.5 : 1));
  f.frequency.setValueAtTime(peak, t); f.frequency.exponentialRampToValueAtTime(P.cutoff, t + P.decay * (P.accent ? 0.75 : 1));
  const lvl = P.level * (P.accent ? 1.35 : 1);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.004);
  g.gain.setValueAtTime(lvl, t + gate); g.gain.exponentialRampToValueAtTime(0.001, t + gate + 0.05);
  const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(1.6);
  o.connect(f); f.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'acid'));
  o.start(t); o.stop(t + gate + 0.1); reg(ch, o, t + gate + 0.1);
};
S.stab = (ch, t, p = {}) => {
  const c = ch.c, P = { root: ST.root * 4, chord: [0, 3, 7], ...ST.stab, delay: 0, level: 0.13, ...p };
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4;
  f.frequency.setValueAtTime(Math.min(16000, P.cutoff + P.env), t); f.frequency.exponentialRampToValueAtTime(P.cutoff, t + P.decay);
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay + 0.12);
  P.chord.forEach(semi => [-1, 1].forEach(side => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.root * Math.pow(2, semi / 12); o.detune.value = side * P.detune;
    o.connect(f); o.start(t); o.stop(t + P.decay + 0.3); reg(ch, o, t + P.decay + 0.3);
  }));
  f.connect(g); g.connect(dest(ch, P, 'stab'));
  if (P.verb > 0){ const vs = c.createGain(); vs.gain.value = P.verb; g.connect(vs); vs.connect(ch.verbSend); }
  if (P.delay > 0){ const ds = c.createGain(); ds.gain.value = P.delay; g.connect(ds); ds.connect(ch.delSend); }
};
S.pad = (ch, t, p = {}) => {
  const c = ch.c, P = { root: ST.root * 4, chord: [0, 7, 12, 15], dur: 4, ...ST.pad, level: 0.08, ...p };
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = P.cutoff; f.Q.value = 2;
  const lfo = c.createOscillator(); lfo.frequency.value = P.lfo; const lg = c.createGain(); lg.gain.value = P.cutoff * 0.7;
  lfo.connect(lg); lg.connect(f.frequency); lfo.start(t); lfo.stop(t + P.dur + 1.5); reg(ch, lfo, t + P.dur + 1.5);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.9);
  g.gain.setValueAtTime(P.level, t + P.dur - 0.9); g.gain.linearRampToValueAtTime(0, t + P.dur + 1.2);
  P.chord.forEach(semi => [-1, 1].forEach(side => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.root * Math.pow(2, semi / 12) / 2; o.detune.value = side * 12;
    o.connect(f); o.start(t); o.stop(t + P.dur + 1.5); reg(ch, o, t + P.dur + 1.5);
  }));
  f.connect(g); g.connect(dest(ch, P, 'stab'));
  const vs = c.createGain(); vs.gain.value = 0.8; g.connect(vs); vs.connect(ch.verbSend);
};
S.lead = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: 220, decay: 0.14, level: 0.16, ...p };
  const o = c.createOscillator(); o.type = 'square'; o.frequency.value = P.freq;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
  f.frequency.setValueAtTime(P.freq * 8, t); f.frequency.exponentialRampToValueAtTime(P.freq * 2, t + P.decay);
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  o.connect(f); f.connect(g); g.connect(dest(ch, P, 'stab'));
  const ds = c.createGain(); ds.gain.value = 0.25; g.connect(ds); ds.connect(ch.delSend);
  o.start(t); o.stop(t + P.decay + 0.05); reg(ch, o, t + P.decay + 0.05);
};
S.sample = (ch, t, p = {}) => {
  const c = ch.c, P = { buffer: null, offset: 0, dur: null, rate: 1, reverse: false, level: 0.9, ...p };
  if (!P.buffer) return;
  const n = c.createBufferSource(); n.buffer = P.reverse ? reverseBuffer(c, P.buffer) : P.buffer; n.playbackRate.value = P.rate;
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t);
  const dur = P.dur == null ? P.buffer.duration - P.offset : P.dur;
  g.gain.setValueAtTime(P.level, t + (dur / P.rate) - 0.01); g.gain.linearRampToValueAtTime(0, t + dur / P.rate);
  n.connect(g); g.connect(dest(ch, P, 'stab'));
  n.start(t, P.offset, dur); reg(ch, n, t + dur / P.rate + 0.1);
};
function reverseBuffer(c, buf){
  const r = c.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
  for (let ch = 0; ch < buf.numberOfChannels; ch++){ const s = buf.getChannelData(ch), d = r.getChannelData(ch); for (let i = 0; i < s.length; i++) d[i] = s[s.length - 1 - i]; }
  return r;
}
function duckAt(ch, t, sc){
  if (!sc.on || sc.amt <= 0) return;
  const g = ch.duck.gain;
  g.cancelScheduledValues(t); g.setValueAtTime(1, t);
  g.linearRampToValueAtTime(1 - sc.amt, t + 0.006);
  g.linearRampToValueAtTime(1, t + 0.006 + sc.rel);
}

/* ===================================================================
   DEMO LOOP SCHEDULER (fixed, short loops for the sections)
   =================================================================== */
function stepDur(){ return 60 / ST.bpm / 4; }
function demo(bars, fn, btn){
  if (window.SoundBus) SoundBus.claim('engine'); const ch = AudioCore.get(); const t0 = ch.c.currentTime + 0.06; const d = stepDur();
  for (let b = 0; b < bars; b++) for (let i = 0; i < 16; i++) fn(ch, t0 + (b * 16 + i) * d, i, b);
  flash(btn, bars * 16 * d);
}
function flash(btn, secs){ if (!btn) return; btn.classList.add('flash'); setTimeout(() => btn.classList.remove('flash'), Math.min(secs * 1000, 8000)); }
const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', e => fn(e, el)); return el; };
const kickOn = i => i % 4 === 0;

/* ===================================================================
   CONTROL BUILDER
   =================================================================== */
function ctl(container, label, obj, key, min, max, step, fmt, onchange){
  const row = document.createElement('div'); row.className = 'ctl';
  const l = document.createElement('span'); l.textContent = label;
  const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = obj[key];
  const o = document.createElement('output'); o.textContent = fmt(obj[key]);
  r.addEventListener('input', () => { obj[key] = parseFloat(r.value); o.textContent = fmt(obj[key]); if (onchange) onchange(obj[key]); });
  row.append(l, r, o); document.getElementById(container).appendChild(row); return r;
}
const fHz = v => v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : Math.round(v) + ' Hz';
const fMs = v => Math.round(v * 1000) + ' ms';
const fPct = v => Math.round(v * 100) + '%';
const fX = v => v.toFixed(1) + '×';
const fDb = v => Math.round(v) + ' dB';

/* ===================================================================
   SVG HELPERS
   =================================================================== */
const NS = 'http://www.w3.org/2000/svg';
function el(name, attrs, parent){ const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
function clearSvg(svg, w, h){ svg.setAttribute('viewBox', `0 0 ${w} ${h}`); while (svg.firstChild) svg.removeChild(svg.firstChild); }
function text(svg, x, y, s, attrs = {}){ const t = el('text', { x, y, fill: '#8f8fa0', 'font-size': 10, 'font-family': 'JetBrains Mono, monospace', ...attrs }, svg); t.textContent = s; return t; }
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const logx = (f, w, lo = 20, hi = 20000) => (Math.log10(f) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * w;
function pathStr(pts){ return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '); }

/* ---------- Spectrum map ---------- */
function drawSpecMap(){
  const svg = document.getElementById('specmap'); const W = 900, H = 330, L = 10, R = 890, T = 20;
  clearSvg(svg, W, H);
  [20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 20000].forEach(f => {
    const x = L + logx(f, R - L); el('line', { x1: x, y1: T, x2: x, y2: H - 28, stroke: '#272733' }, svg);
    text(svg, x, H - 12, f >= 1000 ? (f / 1000) + 'k' : f, { 'text-anchor': 'middle' });
  });
  const bands = [
    ['Rumble', 30, 130, '--rumble', '#a4'], ['Kick body', 40, 110, '--kick', '#a1'], ['Kick click', 2000, 7000, '--kick', '#a1'],
    ['Sub bass', 38, 90, '--bass', '#a5'], ['Offbeat / acid bass', 70, 400, '--bass', '#a5'],
    ['Stabs & pads', 150, 4000, '--synth', '#a6'], ['Clap', 700, 3500, '--drums', '#a2'],
    ['Toms / metallic perc', 120, 6000, '--perc', '#a3'], ['Hats & ride', 5500, 16000, '--drums', '#a2'],
    ['Samples & texture', 200, 12000, '--samp', '#a7']
  ];
  const rowH = 26;
  bands.forEach((b, i) => {
    const y = T + 8 + i * rowH, x1 = L + logx(b[1], R - L), x2 = L + logx(b[2], R - L), col = css(b[3]);
    const g = el('g', { style: 'cursor:pointer' }, svg);
    el('rect', { x: x1, y, width: x2 - x1, height: 16, rx: 4, fill: col, opacity: 0.75 }, g);
    el('rect', { x: x1, y, width: x2 - x1, height: 16, rx: 4, fill: 'none', stroke: col }, g);
    text(g, x2 + 8, y + 12, b[0], { fill: '#ebebf1' });
    g.addEventListener('click', () => { location.hash = b[4]; });
    g.addEventListener('mouseenter', () => g.firstChild.setAttribute('opacity', 1));
    g.addEventListener('mouseleave', () => g.firstChild.setAttribute('opacity', 0.75));
  });
  text(svg, L, 14, 'Hz → (log scale)');
}

/* ---------- Kick envelope + waveform ---------- */
function drawKickEnv(){
  const svg = document.getElementById('kickEnv'); const W = 400, H = 150, L = 36, R = 390, T = 12, B = 128; clearSvg(svg, W, H);
  const P = ST.kick, dur = 0.4;
  [0, .1, .2, .3, .4].forEach(s => { const x = L + s / dur * (R - L); el('line', { x1: x, y1: T, x2: x, y2: B, stroke: '#272733' }, svg); text(svg, x, 143, fMs(s), { 'text-anchor': 'middle' }); });
  const fy = f => B - (Math.log10(f) - Math.log10(30)) / (Math.log10(400) - Math.log10(30)) * (B - T);
  [50, 100, 200, 400].forEach(f => { text(svg, 4, fy(f) + 3, f); el('line', { x1: L, y1: fy(f), x2: R, y2: fy(f), stroke: '#272733' }, svg); });
  const pts = [], apts = [];
  for (let i = 0; i <= 200; i++){
    const t = i / 200 * dur, x = L + t / dur * (R - L);
    const f = t < P.pitchDecay ? P.pitchStart * Math.pow(P.pitchEnd / P.pitchStart, t / P.pitchDecay) : P.pitchEnd;
    pts.push([x, fy(f)]);
    const a = Math.pow(0.001, t / P.ampDecay); apts.push([x, B - a * (B - T)]);
  }
  el('path', { d: pathStr(apts), fill: 'none', stroke: '#ebebf1', 'stroke-width': 1.5, opacity: .8 }, svg);
  el('path', { d: pathStr(pts), fill: 'none', stroke: css('--kick'), 'stroke-width': 2.5 }, svg);
}
let kickRenderTimer = null;
function renderKickWave(){
  clearTimeout(kickRenderTimer);
  kickRenderTimer = setTimeout(async () => {
    const sr = 44100, oc = new OfflineAudioContext(1, Math.ceil(sr * 0.5), sr);
    const ch = { c: oc, out: oc.destination, live: false };
    S.kick(ch, 0.005, { ...ST.kick, dest: oc.destination });
    const buf = await oc.startRendering(); const d = buf.getChannelData(0);
    const cv = document.getElementById('kickWave'); const dpr = window.devicePixelRatio || 1;
    cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const W = cv.clientWidth, H = cv.clientHeight; g.clearRect(0, 0, W, H);
    g.strokeStyle = '#272733'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    g.strokeStyle = css('--kick'); g.lineWidth = 1.5; g.beginPath();
    const n = Math.floor(sr * 0.5);
    for (let x = 0; x < W; x++){ const i = Math.floor(x / W * n); const v = d[i] || 0; const y = H / 2 - v * (H / 2 - 6); x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    g.fillStyle = '#8f8fa0'; g.font = '10px JetBrains Mono, monospace'; g.fillText('0 ms', 4, H - 6); g.fillText('500 ms', W - 46, H - 6);
  }, 120);
}

/* ---------- Hat spectrum, clap envelope ---------- */
let respCtx = null;
function filterResponse(type, freq, Q, freqs){
  if (!respCtx) respCtx = new OfflineAudioContext(1, 1, 44100);
  const f = respCtx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q;
  const mag = new Float32Array(freqs.length), ph = new Float32Array(freqs.length);
  f.getFrequencyResponse(freqs, mag, ph); return mag;
}
function drawHatSpec(){
  const svg = document.getElementById('hatSpec'); const W = 400, H = 150, L = 10, R = 390, T = 12, B = 128; clearSvg(svg, W, H);
  [1000, 2000, 5000, 10000, 20000].forEach(f => { const x = L + logx(f, R - L, 500, 20000); el('line', { x1: x, y1: T, x2: x, y2: B, stroke: '#272733' }, svg); text(svg, x, 143, f >= 1000 ? f / 1000 + 'k' : f, { 'text-anchor': 'middle' }); });
  // square partials: odd harmonics of 40*r, drawn with 1/n amplitude
  [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(r => { const f0 = 40 * r; for (let n = 1; n < 400; n += 2){ const f = f0 * n; if (f < 500 || f > 20000) continue; const x = L + logx(f, R - L, 500, 20000); const a = Math.min(1, 1 / Math.sqrt(n) * 2.2); el('line', { x1: x, y1: B, x2: x, y2: B - a * (B - T) * 0.8, stroke: css('--drums'), opacity: .35 }, svg); } });
  const freqs = new Float32Array(200); for (let i = 0; i < 200; i++) freqs[i] = 500 * Math.pow(40, i / 199);
  const bp = filterResponse('bandpass', ST.hat.tone, 1.2, freqs), hp = filterResponse('highpass', 6500, 1, freqs);
  const pts = []; for (let i = 0; i < 200; i++){ const m = bp[i] * hp[i]; pts.push([L + logx(freqs[i], R - L, 500, 20000), B - Math.min(1, m) * (B - T)]); }
  el('path', { d: pathStr(pts) + ` L${R} ${B} L${L} ${B} Z`, fill: '#ebebf1', opacity: .12 }, svg);
  el('path', { d: pathStr(pts), fill: 'none', stroke: '#ebebf1', 'stroke-width': 2 }, svg);
  text(svg, L + 4, 22, 'band-pass × high-pass window', { fill: '#ebebf1' });
}
function drawClapEnv(){
  const svg = document.getElementById('clapEnv'); const W = 400, H = 120, L = 10, R = 390, T = 12, B = 100; clearSvg(svg, W, H);
  const dur = 0.05 + ST.clap.decay, pts = [];
  const env = t => { for (const k of [0, 0.011, 0.022]) if (t >= k && t < k + 0.011) return 1 * Math.pow(0.15, (t - k) / 0.01); if (t >= 0.033) return Math.pow(0.001, (t - 0.033) / ST.clap.decay); return 0; };
  for (let i = 0; i <= 400; i++){ const t = i / 400 * dur; pts.push([L + t / dur * (R - L), B - env(t) * (B - T)]); }
  [0, 0.05, 0.1, 0.2].forEach(s => { if (s > dur) return; const x = L + s / dur * (R - L); el('line', { x1: x, y1: T, x2: x, y2: B, stroke: '#272733' }, svg); text(svg, x + 3, 113, fMs(s)); });
  el('path', { d: pathStr(pts) + ` L${R} ${B} L${L} ${B} Z`, fill: css('--drums'), opacity: .25 }, svg);
  el('path', { d: pathStr(pts), fill: 'none', stroke: css('--drums'), 'stroke-width': 2 }, svg);
}

/* ---------- Perc grid ---------- */
function drawPercGrid(){
  const svg = document.getElementById('percGrid'); const W = 400, H = 150; clearSvg(svg, W, H);
  const cols = 48, cw = (W - 50) / cols, rows = [['Kick', '--kick', i => i % 4 === 0], ['Hat', '--drums', i => i % 2 === 1], ['3-step', '--perc', i => i % 3 === 0]];
  for (let b = 0; b < 3; b++) text(svg, 50 + b * 16 * cw + 2, 12, 'bar ' + (b + 1));
  rows.forEach((r, ri) => {
    const y = 36 + ri * 36; text(svg, 4, y + 4, r[0], { fill: css(r[1]) });
    for (let i = 0; i < cols; i++){
      const x = 50 + i * cw + cw / 2; el('circle', { cx: x, cy: y, r: 2, fill: '#272733' }, svg);
      if (i % 16 === 0) el('line', { x1: 50 + i * cw, y1: 18, x2: 50 + i * cw, y2: 140, stroke: '#272733' }, svg);
      if (r[2](i)) el('circle', { cx: x, cy: y, r: ri === 2 ? 5 : 4, fill: css(r[1]) }, svg);
    }
  });
  text(svg, 50 + 2, 140, '← realigns with the kick only every 3 bars', { fill: css('--perc') });
}

/* ---------- Sidechain curve ---------- */
function drawSC(){
  const svg = document.getElementById('scCurve'); const W = 400, H = 130, L = 10, R = 390, T = 12, B = 108; clearSvg(svg, W, H);
  const beat = 60 / ST.bpm, span = beat * 2, sc = ST.sc, pts = [];
  const g = t => { const tb = t % beat; if (!sc.on) return 1; if (tb < 0.006) return 1 - sc.amt * (tb / 0.006); if (tb < 0.006 + sc.rel) return (1 - sc.amt) + sc.amt * ((tb - 0.006) / sc.rel); return 1; };
  for (let i = 0; i <= 400; i++){ const t = i / 400 * span; pts.push([L + t / span * (R - L), B - g(t) * (B - T)]); }
  [0, 1].forEach(k => { const x = L + k * beat / span * (R - L); el('rect', { x, y: T, width: 5, height: B - T, fill: css('--kick') }, svg); text(svg, x + 9, T + 10, 'kick'); });
  el('path', { d: pathStr(pts) + ` L${R} ${B} L${L} ${B} Z`, fill: css('--rumble'), opacity: .25 }, svg);
  el('path', { d: pathStr(pts), fill: 'none', stroke: css('--rumble'), 'stroke-width': 2 }, svg);
  text(svg, L, 124, '0'); text(svg, R - 60, 124, Math.round(span * 1000) + ' ms');
  text(svg, L + 20, B - (1 - sc.amt) * (B - T) + 4, '−' + Math.round(sc.amt * 100) + '%', { fill: css('--rumble') });
}

/* ---------- Acid filter response ---------- */
function drawAcidFilt(){
  const svg = document.getElementById('acidFilt'); const W = 400, H = 150, L = 10, R = 390, T = 12, B = 128; clearSvg(svg, W, H);
  [50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(f => { const x = L + logx(f, R - L, 40, 16000); el('line', { x1: x, y1: T, x2: x, y2: B, stroke: '#272733' }, svg); text(svg, x, 143, f >= 1000 ? f / 1000 + 'k' : f, { 'text-anchor': 'middle' }); });
  const freqs = new Float32Array(240); for (let i = 0; i < 240; i++) freqs[i] = 40 * Math.pow(400, i / 239);
  const db = m => 20 * Math.log10(Math.max(1e-4, m)); const yOf = d => B - Math.min(1, Math.max(0, (d + 36) / 60)) * (B - T);
  [[ST.acid.cutoff, 0.45], [Math.min(16000, ST.acid.cutoff + ST.acid.env), 1]].forEach(([fc, op]) => {
    const m = filterResponse('lowpass', fc, ST.acid.res, freqs); const pts = [];
    for (let i = 0; i < 240; i++) pts.push([L + logx(freqs[i], R - L, 40, 16000), yOf(db(m[i]))]);
    el('path', { d: pathStr(pts), fill: 'none', stroke: css('--bass'), 'stroke-width': 2, opacity: op }, svg);
  });
  text(svg, L + 4, 22, '0 dB'); el('line', { x1: L, y1: yOf(0), x2: R, y2: yOf(0), stroke: '#8f8fa0', 'stroke-dasharray': '3 3', opacity: .5 }, svg);
  text(svg, R - 110, 22, 'resting ← → env peak', { fill: css('--bass') });
}

/* ---------- Synth signal flow ---------- */
function drawSynthFlow(){
  const svg = document.getElementById('synthFlow'); const W = 900, H = 230; clearSvg(svg, W, H);
  const col = css('--synth');
  const box = (x, y, w, h, title, sub, hi) => { el('rect', { x, y, width: w, height: h, rx: 8, fill: hi ? '#1f2d28' : '#1b1b24', stroke: hi ? col : '#3a3a48' }, svg); text(svg, x + w / 2, y + 22, title, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-size': 13, 'font-weight': 600 }); if (sub) sub.split('|').forEach((s, i) => text(svg, x + w / 2, y + 40 + i * 13, s, { 'text-anchor': 'middle' })); };
  const arrow = (x1, y1, x2, y2, dashed) => { el('line', { x1, y1, x2, y2, stroke: dashed ? '#8f8fa0' : col, 'stroke-width': dashed ? 1.5 : 2, 'stroke-dasharray': dashed ? '4 3' : '', 'marker-end': 'url(#ah)' }, svg); };
  const defs = el('defs', {}, svg); const m = el('marker', { id: 'ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: '#8f8fa0' }, m);
  box(20, 30, 150, 80, 'OSC', 'saw / square / sine|detune · unison|sub-osc', true);
  box(210, 30, 150, 80, 'FILTER', 'low-pass 24 dB|cutoff · resonance|drive', true);
  box(400, 30, 150, 80, 'AMP', 'VCA|level', true);
  box(590, 30, 140, 80, 'FX', 'delay · reverb|chorus · saturation');
  box(770, 30, 110, 80, 'MIX', 'EQ · sidechain|pan · level');
  arrow(170, 70, 210, 70); arrow(360, 70, 400, 70); arrow(550, 70, 590, 70); arrow(730, 70, 770, 70);
  box(120, 150, 130, 60, 'ENV 1', 'filter envelope|A D S R');
  box(300, 150, 130, 60, 'ENV 2', 'amp envelope|A D S R');
  box(480, 150, 130, 60, 'LFO', 'sine / saw · rate|→ cutoff, pitch, pan');
  box(660, 150, 150, 60, 'SEQUENCER', 'notes · accents · slides|→ pitch, gates');
  arrow(185, 150, 270, 112, true); arrow(365, 150, 450, 112, true); arrow(545, 150, 300, 112, true); arrow(735, 150, 100, 112, true);
  text(svg, 20, 225, 'solid: audio   dashed: modulation (control signals)');
}

/* ---------- Arrangement ---------- */
function drawArrange(){
  const svg = document.getElementById('arrange'); const W = 900, H = 300, L = 110, R = 890, T = 36; clearSvg(svg, W, H);
  const bars = 240, bx = b => L + b / bars * (R - L);
  const sections = [['Intro', 0, 32], ['Bass in', 32, 64], ['Hook', 64, 96], ['Peak', 96, 128], ['Breakdown', 128, 160], ['Drop', 160, 176], ['Peak 2', 176, 208], ['Outro', 208, 240]];
  sections.forEach((s, i) => { el('rect', { x: bx(s[1]), y: 10, width: bx(s[2]) - bx(s[1]) - 1, height: 18, fill: i % 2 ? '#1b1b24' : '#22222c' }, svg); text(svg, bx(s[1]) + 4, 23, s[0], { fill: '#ebebf1' }); });
  for (let b = 0; b <= bars; b += 16){ el('line', { x1: bx(b), y1: T, x2: bx(b), y2: H - 24, stroke: b % 32 ? '#1f1f28' : '#2d2d3a' }, svg); if (b % 32 === 0) text(svg, bx(b), H - 8, b, { 'text-anchor': 'middle' }); }
  const layers = [
    ['Kick', '--kick', [[0, 128], [160, 240]]], ['Hats', '--drums', [[8, 128], [168, 232]]], ['Rumble', '--rumble', [[16, 128], [160, 240]]],
    ['Clap', '--drums', [[32, 128], [176, 224]]], ['Perc', '--perc', [[48, 128], [176, 224]]], ['Sub bass', '--bass', [[32, 128], [160, 224]]],
    ['Stab / hook', '--synth', [[64, 128], [176, 216]]], ['Pad / atmos', '--synth', [[96, 176]]], ['Sample / texture', '--samp', [[80, 112], [144, 160], [192, 208]]]
  ];
  layers.forEach((l, i) => { const y = T + 8 + i * 25; text(svg, 4, y + 12, l[0], { fill: css(l[1]) }); l[2].forEach(([a, b]) => el('rect', { x: bx(a), y, width: bx(b) - bx(a) - 1, height: 16, rx: 3, fill: css(l[1]), opacity: .75 }, svg)); });
  text(svg, L, H - 8, 'bars →');
}

/* ===================================================================
   SEQUENCER
   =================================================================== */
const parsePat = s => [...s].map(ch => ch === '.' ? 0 : ch === 'x' ? 1 : ch === 'A' ? 2 : ch === 's' ? 3 : 0);
const ACID_NOTES = [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0];
const PRESETS = {
  'Berlin':   { bpm: 132, swing: 0, sc: 0.8, rumble: 0.85, pat: { kick: 'x...x...x...x...', sub: '................', off: '................', acid: '................', stab: '......x.......x.', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', clap: '................', tom: '...x......x.....', metal: 'x..x..x..x..x..x', shaker: '................' } },
  'Detroit':  { bpm: 128, swing: 0.08, sc: 0.4, rumble: 0.25, pat: { kick: 'x...x...x...x...', sub: 'x.......x.......', off: '..x...x...x...x.', acid: '................', stab: 'x..x..x...x..x..', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', tom: '......x.......x.', metal: '................', shaker: 'xxxxxxxxxxxxxxxx' } },
  'Acid':     { bpm: 135, swing: 0, sc: 0.5, rumble: 0.4, pat: { kick: 'x...x...x...x...', sub: '................', off: '................', acid: 'xxAxx.sxxAx.xsAx', stab: '................', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', clap: '....x.......x...', tom: '................', metal: '................', shaker: '................' } },
  'Dub':      { bpm: 124, swing: 0.05, sc: 0.6, rumble: 0.5, pat: { kick: 'x...x...x...x...', sub: 'x.......x.......', off: '................', acid: '................', stab: '...x......x.....', hatc: '..x...x...x...x.', hato: '................', clap: '................', tom: '................', metal: '................', shaker: 'x.xxx.xxx.xxx.xx' }, dub: true },
  'Peak time':{ bpm: 140, swing: 0, sc: 0.75, rumble: 0.6, pat: { kick: 'x...x...x...x...', sub: '................', off: '..x...x...x...x.', acid: '................', stab: '......x.....x...', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', clap: '....x.......x...', tom: '.............x.x', metal: '...x..x....x..x.', shaker: '................' } },
  'Hypnotic': { bpm: 130, swing: 0.12, sc: 0.7, rumble: 0.7, pat: { kick: 'x...x...x...x...', sub: 'x...............', off: '................', acid: '................', stab: '................', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '................', tom: 'x..x..x..x..x..x', metal: '.x..x..x..x..x..', shaker: 'xxxxxxxxxxxxxxxx' } },
};
const Seq = {
  playing: false, step: 0, nextTime: 0, timer: null, queue: [], pat: {}, dub: false, preset: 'Berlin',
  stepTime(i, t){ return t + (i % 2 ? ST.swing * stepDur() : 0); },
  audible(id){ const anySolo = TRACKS.some(t => ST.solo[t.id]); return !ST.mute[id] && (!anySolo || ST.solo[id]); },
  scheduleStep(ch, i, base){
    const t = this.stepTime(i, base), p = this.pat, aud = id => this.audible(id);
    if (p.kick[i] && aud('kick')){ S.kick(ch, t); if (aud('rumble')) S.rumble(ch, t); duckAt(ch, t, ST.sc); }
    if (p.sub[i] && aud('sub')) S.sub(ch, t);
    if (p.off[i] && aud('off')) S.off(ch, t);
    if (p.acid[i] && aud('acid')){
      let j = (i + 1) % 16, n = 1; while (!p.acid[j] && n < 16){ j = (j + 1) % 16; n++; }
      const f = ST.root * 2 * Math.pow(2, ACID_NOTES[i] / 12), f2 = ST.root * 2 * Math.pow(2, ACID_NOTES[j] / 12);
      S.acid(ch, t, { freq: f, accent: p.acid[i] === 2, slideTo: p.acid[i] === 3 ? f2 : null, slideTime: stepDur() * n });
    }
    if (p.stab[i] && aud('stab')) S.stab(ch, t, this.dub ? { chord: [0, 3, 7, 10], delay: 0.9, verb: 0.3, decay: 0.22 } : {});
    if (p.hatc[i] && aud('hatc')) S.hat(ch, t, { level: i % 2 ? 0.25 : 0.35 });
    if (p.hato[i] && aud('hato')) S.hat(ch, t, { open: true, decay: ST.hat.decayO });
    if (p.clap[i] && aud('clap')) S.clap(ch, t);
    if (p.tom[i] && aud('tom')) S.tom(ch, t);
    if (p.metal[i] && aud('metal')) S.metal(ch, t);
    if (p.shaker[i] && aud('shaker')) S.shaker(ch, t, { level: i % 4 === 2 ? 0.4 : 0.22 });
  },
  tick(){
    const ch = AudioCore.get(), c = ch.c;
    while (this.nextTime < c.currentTime + 0.15){
      this.scheduleStep(ch, this.step, this.nextTime);
      this.queue.push({ step: this.step, time: this.nextTime });
      this.nextTime += stepDur(); this.step = (this.step + 1) % 16;
    }
  },
  start(){
    if (this.playing) return; const ch = AudioCore.get(); if (window.MixerStop) MixerStop();
    this.playing = true; this.step = 0; this.nextTime = ch.c.currentTime + 0.05; this.queue = [];
    this.timer = setInterval(() => this.tick(), 25); this.tick();
    document.getElementById('seqPlay').classList.add('flash');
  },
  stop(){
    this.playing = false; clearInterval(this.timer); this.timer = null; this.queue = [];
    document.querySelectorAll('.st.cur').forEach(e => e.classList.remove('cur'));
    document.getElementById('seqPlay').classList.remove('flash');
  },
  load(name){
    const P = PRESETS[name]; this.preset = name; this.dub = !!P.dub;
    for (const k in P.pat) this.pat[k] = parsePat(P.pat[k]);
    ST.bpm = P.bpm; ST.swing = P.swing; ST.sc.amt = P.sc; ST.level.rumble = P.rumble;
    syncTransport(); renderSeq(); applyLevels();
    document.querySelectorAll('#presets button').forEach(b => b.classList.toggle('on', b.textContent === name));
  }
};
function applyLevels(){
  const ch = AudioCore.peek(); if (!ch) return;
  TRACKS.forEach(t => ch.tr[t.id].gain.setTargetAtTime(ST.level[t.id] * t.base, ch.c.currentTime, 0.02));
  ch.out.gain.setTargetAtTime(ST.master, ch.c.currentTime, 0.02);
  ch.rlp.frequency.setTargetAtTime(ST.rumble.cutoff, ch.c.currentTime, 0.02);
  ch.delay.delayTime.setTargetAtTime((60 / ST.bpm) * 0.75, ch.c.currentTime, 0.05);
}
function renderSeq(){
  const tbl = document.getElementById('seqTable'); tbl.innerHTML = '';
  tbl.appendChild(document.createElement('div'));
  for (let i = 0; i < 16; i++){ const h = document.createElement('div'); h.className = 'seq-head' + (i % 4 === 0 ? ' beat' : '') + (i && i % 4 === 0 ? ' b' : ''); h.textContent = i % 4 === 0 ? (i / 4 + 1) : '·'; tbl.appendChild(h); }
  TRACKS.forEach(t => {
    const lab = document.createElement('div'); lab.className = 'trk'; lab.style.setProperty('--c', `var(${t.color})`);
    const dot = document.createElement('i'); const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = t.name;
    const m = document.createElement('button'); m.textContent = 'M'; m.classList.toggle('on', ST.mute[t.id]); m.onclick = () => { ST.mute[t.id] = !ST.mute[t.id]; m.classList.toggle('on', ST.mute[t.id]); };
    const s = document.createElement('button'); s.textContent = 'S'; s.classList.toggle('on', ST.solo[t.id]); s.onclick = () => { ST.solo[t.id] = !ST.solo[t.id]; s.classList.toggle('on', ST.solo[t.id]); };
    const lv = document.createElement('input'); lv.type = 'range'; lv.min = 0; lv.max = 1; lv.step = 0.01; lv.value = ST.level[t.id]; lv.title = 'level'; lv.oninput = () => { ST.level[t.id] = parseFloat(lv.value); applyLevels(); if (t.id === 'rumble') syncRumbleCtl(); };
    lab.append(dot, nm, m, s, lv); tbl.appendChild(lab);
    for (let i = 0; i < 16; i++){
      const cell = document.createElement('div'); cell.className = 'st' + (i && i % 4 === 0 ? ' b' : ''); cell.style.setProperty('--c', `var(${t.color})`); cell.dataset.step = i; cell.dataset.track = t.id;
      if (t.send){ cell.classList.add('ghost'); if (Seq.pat.kick[i]) cell.classList.add('on'); }
      else {
        const v = Seq.pat[t.id][i]; paintCell(cell, v, t);
        cell.onclick = () => { const cur = Seq.pat[t.id][i]; const nv = t.acid ? (cur + 1) % 4 : (cur ? 0 : 1); Seq.pat[t.id][i] = nv; paintCell(cell, nv, t); if (t.id === 'kick') renderSeq(); };
      }
      tbl.appendChild(cell);
    }
  });
}
function paintCell(cell, v, t){ cell.classList.toggle('on', v === 1); cell.classList.toggle('acc', v === 2); cell.classList.toggle('sl', v === 3); cell.textContent = (t.acid && v) ? noteName(ACID_NOTES[+cell.dataset.step]) : ''; }
const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteName(semi){ const rootIdx = ROOTS.findIndex(r => r[1] === ST.root); const base = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'][rootIdx] || 'G'; const i = (NN.indexOf(base) + semi) % 12; return NN[i]; }
function syncTransport(){
  const set = (id, v, out, f) => { document.getElementById(id).value = v; document.getElementById(out).textContent = f(v); };
  set('bpm', ST.bpm, 'bpmOut', v => v); set('swing', ST.swing, 'swingOut', v => Math.round(50 + v * 100 / 2) + '%');
  set('scAmt2', ST.sc.amt, 'scAmt2Out', fPct); set('masterVol', ST.master, 'masterOut', fPct);
  if (scAmtCtl) scAmtCtl.value = ST.sc.amt; drawSC();
}
let scAmtCtl = null, rumbleLvlCtl = null;
function syncRumbleCtl(){ if (rumbleLvlCtl){ rumbleLvlCtl.value = ST.level.rumble; rumbleLvlCtl.nextElementSibling.textContent = fPct(ST.level.rumble); } }

/* ===================================================================
   SAMPLER
   =================================================================== */
const Samp = { buffer: null, slices: 8 };
async function renderBar(){
  const sr = 44100, d = 60 / ST.bpm / 4, len = d * 16 + 0.6;
  const oc = new OfflineAudioContext(2, Math.ceil(sr * len), sr); const ch = AudioCore.build(oc, false);
  for (let i = 0; i < 16; i++) Seq.scheduleStep(ch, i, 0.02 + i * d);
  const buf = await oc.startRendering();
  // trim to exactly one bar
  const n = Math.floor(d * 16 * sr), out = oc.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) out.getChannelData(c).set(buf.getChannelData(c).subarray(Math.floor(0.02 * sr), Math.floor(0.02 * sr) + n));
  return out;
}
function setSample(buf, label){
  Samp.buffer = buf; drawSample();
  document.getElementById('sampInfo').textContent = `${label} — ${buf.duration.toFixed(2)} s, ${buf.sampleRate} Hz, ${buf.numberOfChannels} ch, chopped into 8 slices.`;
}
function drawSample(){
  const cv = document.getElementById('sampWave'); const dpr = window.devicePixelRatio || 1;
  cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const W = cv.clientWidth, H = cv.clientHeight; g.clearRect(0, 0, W, H);
  if (!Samp.buffer){ g.fillStyle = '#8f8fa0'; g.font = '11px JetBrains Mono, monospace'; g.fillText('no sample', W / 2 - 30, H / 2); return; }
  const d = Samp.buffer.getChannelData(0), n = d.length, per = Math.max(1, Math.floor(n / W));
  g.fillStyle = css('--samp'); g.globalAlpha = .85;
  for (let x = 0; x < W; x++){ let mx = 0; const s = x * per; for (let i = s; i < s + per && i < n; i += 4) mx = Math.max(mx, Math.abs(d[i])); const h = mx * (H - 10); g.fillRect(x, H / 2 - h / 2, 1, Math.max(1, h)); }
  g.globalAlpha = 1; g.strokeStyle = '#ebebf1'; g.setLineDash([3, 3]);
  for (let s = 1; s < 8; s++){ const x = s / 8 * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.setLineDash([]); g.fillStyle = '#8f8fa0'; g.font = '10px JetBrains Mono, monospace'; for (let s = 0; s < 8; s++) g.fillText(s + 1, s / 8 * W + 4, 12);
}
function playSlice(k, t, ch, opts = {}){
  if (!Samp.buffer) return; const sd = Samp.buffer.duration / 8;
  S.sample(ch, t, { buffer: Samp.buffer, offset: k * sd, dur: sd, rate: ST.samp.rate, ...opts });
}

/* ===================================================================
   SPECTRUM ANALYSER + STEP HIGHLIGHT LOOP
   =================================================================== */
function animate(){
  requestAnimationFrame(animate);
  const ch = AudioCore.peek(); if (!ch) return;
  const now = ch.c.currentTime;
  // step highlight
  if (Seq.playing){
    let cur = null; while (Seq.queue.length && Seq.queue[0].time <= now) cur = Seq.queue.shift().step;
    if (cur !== null){ document.querySelectorAll('.st.cur').forEach(e => e.classList.remove('cur')); document.querySelectorAll(`.st[data-step="${cur}"]`).forEach(e => e.classList.add('cur')); }
  }
  // analyser
  const cv = document.getElementById('spectrum'); const an = ch.analyser; const data = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(data);
  const dpr = window.devicePixelRatio || 1; if (cv.width !== cv.clientWidth * dpr){ cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); const W = cv.clientWidth, H = cv.clientHeight; g.clearRect(0, 0, W, H);
  const nyq = ch.c.sampleRate / 2; let peak = 0;
  g.fillStyle = '#272733'; [50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(f => { const x = logx(f, W, 20, 20000); g.fillRect(x, 0, 1, H - 14); g.fillStyle = '#8f8fa0'; g.font = '10px JetBrains Mono, monospace'; g.fillText(f >= 1000 ? f / 1000 + 'k' : f, x + 2, H - 3); g.fillStyle = '#272733'; });
  for (let x = 0; x < W; x += 2){
    const f = 20 * Math.pow(1000, x / W), bin = Math.min(data.length - 1, Math.floor(f / nyq * data.length));
    const v = data[bin] / 255; peak = Math.max(peak, v);
    const hue = f < 150 ? css('--rumble') : f < 400 ? css('--bass') : f < 4000 ? css('--synth') : css('--drums');
    g.fillStyle = hue; g.globalAlpha = 0.85; g.fillRect(x, (H - 14) - v * (H - 14), 2, v * (H - 14));
  }
  g.globalAlpha = 1;
  document.getElementById('meterBar').style.width = (peak * 100) + '%';
  if (Math.random() < 0.02) pruneVoices(now);
}

/* ---------- Listening examples (Spotify links) ---------- */
const TRACKLIST = {"kick": [["Jeff Mills", "The Bells"], ["Robert Hood", "Minimal Nation"], ["Surgeon", "Badger Bite"], ["Regis", "Speak to Me"], ["Blawan", "Why They Hide Their Bodies Under My Garage?"]], "drums": [["Rhythim Is Rhythim", "Nude Photo"], ["Adam Beyer", "Teach Me"], ["Marcel Dettmann", "Quicksand"], ["Ben Klock", "Subzero"]], "perc": [["Planetary Assault Systems", "Temporary Suspension"], ["Voices From The Lake", "Twins in Virgo"], ["Rrose", "Waterfall"], ["Underground Resistance", "Jupiter Jazz"], ["Perc", "Look What Your Love Has Done to Me"]], "rumble": [["Ben Klock", "Subzero"], ["Marcel Dettmann", "Translation"], ["Planetary Assault Systems", "Temporary Suspension"], ["Kobosil", "Avatar"], ["Blawan", "Tasser"]], "bass": [["Robert Hood", "Minimal Nation"], ["Underground Resistance", "Jupiter Jazz"], ["Adam Beyer", "Remainings III"], ["Umek", "Lanicor"], ["Phuture", "Acid Tracks"], ["Hardfloor", "Acperience 1"], ["Plastikman", "Spastik"], ["Josh Wink", "Higher State of Consciousness"]], "synth": [["Rhythim Is Rhythim", "Strings of Life"], ["Model 500", "No UFO's"], ["Joey Beltram", "Energy Flash"], ["Basic Channel", "Phylyps Trak"], ["Maurizio", "M4"], ["Deepchord", "Vantage Isle"], ["Charlotte de Witte", "Doppler"], ["The 7th Plain", "Grace"]], "sampling": [["Jeff Mills", "Phase 4"], ["Surgeon", "Basictonalvocabulary"], ["Regis", "Gymnastics"], ["Objekt", "Ganzfeld"], ["Karenn", "Sharing the Stuff"], ["Thomas Bangalter", "Spinal Scratch"], ["Daft Punk", "Rollin' & Scratchin'"]]};
function renderTracks(){
  document.querySelectorAll('.listen[data-tracks]').forEach(div => {
    const box = div.querySelector('.tracks');
    (TRACKLIST[div.dataset.tracks] || []).forEach(([artist, title]) => {
      const a = document.createElement('a'); a.className = 'trackchip'; a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://open.spotify.com/search/' + encodeURIComponent(artist + ' ' + title);
      a.innerHTML = '<i></i><span><b>' + artist + '</b> — ' + title + '</span>';
      box.appendChild(a);
    });
  });
}

/* ===================================================================
   WIRING
   =================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  /* nav */
  document.getElementById('stopAll').onclick = stopAll;

  /* KICK */
  ctl('kickCtls', 'Pitch start', ST.kick, 'pitchStart', 60, 400, 1, fHz, () => { drawKickEnv(); renderKickWave(); });
  ctl('kickCtls', 'Fundamental', ST.kick, 'pitchEnd', 35, 90, 0.5, fHz, () => { drawKickEnv(); renderKickWave(); });
  ctl('kickCtls', 'Pitch decay', ST.kick, 'pitchDecay', 0.01, 0.2, 0.001, fMs, () => { drawKickEnv(); renderKickWave(); });
  ctl('kickCtls', 'Amp decay', ST.kick, 'ampDecay', 0.1, 1.2, 0.01, fMs, () => { drawKickEnv(); renderKickWave(); });
  ctl('kickCtls', 'Drive', ST.kick, 'drive', 1, 12, 0.1, fX, renderKickWave);
  ctl('kickCtls', 'Click', ST.kick, 'click', 0, 1, 0.01, fPct, renderKickWave);
  on('kickHit', (e, b) => { const ch = AudioCore.get(); S.kick(ch, ch.c.currentTime + 0.02); flash(b, 0.3); });
  on('kickLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)) S.kick(ch, t); }, b));
  drawKickEnv(); renderKickWave();

  /* DRUMS */
  ctl('hatCtls', 'Closed decay', ST.hat, 'decayC', 0.02, 0.15, 0.001, fMs);
  ctl('hatCtls', 'Open decay', ST.hat, 'decayO', 0.1, 0.6, 0.01, fMs);
  ctl('hatCtls', 'Hat tone', ST.hat, 'tone', 6000, 14000, 50, fHz, drawHatSpec);
  ctl('hatCtls', 'Clap decay', ST.clap, 'decay', 0.08, 0.6, 0.01, fMs, drawClapEnv);
  on('hatC', (e, b) => { const ch = AudioCore.get(); S.hat(ch, ch.c.currentTime + 0.02); flash(b, .2); });
  on('hatO', (e, b) => { const ch = AudioCore.get(); S.hat(ch, ch.c.currentTime + 0.02, { open: true, decay: ST.hat.decayO }); flash(b, .4); });
  on('clapHit', (e, b) => { const ch = AudioCore.get(); S.clap(ch, ch.c.currentTime + 0.02); flash(b, .4); });
  const drumsPat = (withClap) => (ch, t, i) => { if (kickOn(i)) S.kick(ch, t); S.hat(ch, t, { level: i % 2 ? 0.22 : 0.35 }); if (i % 4 === 2) S.hat(ch, t, { open: true, decay: ST.hat.decayO }); if (withClap && (i === 4 || i === 12)) S.clap(ch, t); };
  on('drumsLoop1', (e, b) => demo(2, drumsPat(false), b));
  on('drumsLoop2', (e, b) => demo(2, drumsPat(true), b));
  drawHatSpec(); drawClapEnv();

  /* PERC */
  ctl('percCtls', 'Tom pitch', ST.perc, 'tomPitch', 90, 400, 1, fHz);
  ctl('percCtls', 'FM ratio', ST.perc, 'metalRatio', 1, 3, 0.01, v => v.toFixed(2));
  ctl('percCtls', 'Swing', ST, 'swing', 0, 0.3, 0.01, v => Math.round(50 + v * 50) + '%', syncTransport);
  on('tomHit', (e, b) => { const ch = AudioCore.get(); S.tom(ch, ch.c.currentTime + 0.02); flash(b, .3); });
  on('metalHit', (e, b) => { const ch = AudioCore.get(); S.metal(ch, ch.c.currentTime + 0.02); flash(b, .2); });
  on('shakerHit', (e, b) => { const ch = AudioCore.get(); S.shaker(ch, ch.c.currentTime + 0.02); flash(b, .2); });
  const sw = (i, t) => t + (i % 2 ? ST.swing * stepDur() : 0);
  on('percLoop1', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)) S.kick(ch, t); if (i % 2) S.hat(ch, sw(i, t), { level: .22 }); if (i % 4 === 3) S.tom(ch, sw(i, t)); if (i % 4 === 1) S.shaker(ch, sw(i, t)); }, b));
  on('percLoop2', (e, b) => demo(3, (ch, t, i, bar) => { if (kickOn(i)) S.kick(ch, t); if (i % 2) S.hat(ch, sw(i, t), { level: .22 }); if ((bar * 16 + i) % 3 === 0) S.metal(ch, sw(i, t)); if (i % 4 === 2) S.hat(ch, sw(i, t), { open: true, decay: .2 }); }, b));
  drawPercGrid();

  /* RUMBLE */
  rumbleLvlCtl = ctl('rumbleCtls', 'Rumble level', ST.level, 'rumble', 0, 1, 0.01, fPct, applyLevels);
  ctl('rumbleCtls', 'Low-pass', ST.rumble, 'cutoff', 60, 300, 1, fHz, applyLevels);
  scAmtCtl = ctl('rumbleCtls', 'SC amount', ST.sc, 'amt', 0, 1, 0.01, fPct, syncTransport);
  ctl('rumbleCtls', 'SC release', ST.sc, 'rel', 0.05, 0.4, 0.005, fMs, drawSC);
  on('rumble0', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)) S.kick(ch, t); }, b));
  on('rumble1', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); S.rumble(ch, t); } }, b));
  on('rumble2', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); S.rumble(ch, t); duckAt(ch, t, ST.sc); } }, b));
  drawSC();

  /* BASS */
  const rs = document.getElementById('rootSel'); ROOTS.forEach(r => { const o = document.createElement('option'); o.value = r[1]; o.textContent = `root ${r[0]} · ${r[1].toFixed(1)} Hz`; if (r[1] === ST.root) o.selected = true; rs.appendChild(o); });
  rs.onchange = () => { ST.root = parseFloat(rs.value); renderSeq(); };
  ctl('bassCtls', 'Sub harmonics', ST.sub, 'drive', 1, 6, 0.1, fX);
  ctl('bassCtls', 'Sub length', ST.sub, 'dur', 0.15, 1.2, 0.01, fMs);
  ctl('bassCtls', 'Offbeat cutoff', ST.off, 'cutoff', 200, 2000, 10, fHz);
  on('subHit', (e, b) => { const ch = AudioCore.get(); S.sub(ch, ch.c.currentTime + 0.02); flash(b, .5); });
  on('subLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); duckAt(ch, t, ST.sc); } if (i === 0) S.sub(ch, t, { dur: stepDur() * 7 }); if (i % 2) S.hat(ch, t, { level: .2 }); }, b));
  on('offLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)) S.kick(ch, t); if (i % 4 === 2){ S.off(ch, t); S.hat(ch, t, { open: true, decay: .18, level: .25 }); } if (i % 2 === 0) S.hat(ch, t, { level: .25 }); }, b));
  ctl('acidCtls', 'Cutoff', ST.acid, 'cutoff', 100, 3000, 10, fHz, drawAcidFilt);
  ctl('acidCtls', 'Resonance', ST.acid, 'res', 0, 24, 0.5, fDb, drawAcidFilt);
  ctl('acidCtls', 'Env amount', ST.acid, 'env', 0, 6000, 50, fHz, drawAcidFilt);
  ctl('acidCtls', 'Env decay', ST.acid, 'decay', 0.05, 0.6, 0.01, fMs);
  on('acidHit', (e, b) => { const ch = AudioCore.get(); S.acid(ch, ch.c.currentTime + 0.02, { accent: true }); flash(b, .3); });
  const acidPat = parsePat('xxAxx.sxxAx.xsAx');
  on('acidLoop', (e, b) => demo(2, (ch, t, i) => {
    if (kickOn(i)){ S.kick(ch, t); duckAt(ch, t, { ...ST.sc, amt: ST.sc.amt * 0.5 }); } if (i % 2) S.hat(ch, t, { level: .2 });
    if (acidPat[i]){ let j = (i + 1) % 16, n = 1; while (!acidPat[j] && n < 16){ j = (j + 1) % 16; n++; }
      const f = ST.root * 2 * Math.pow(2, ACID_NOTES[i] / 12), f2 = ST.root * 2 * Math.pow(2, ACID_NOTES[j] / 12);
      S.acid(ch, t, { freq: f, accent: acidPat[i] === 2, slideTo: acidPat[i] === 3 ? f2 : null, slideTime: stepDur() * n }); }
  }, b));
  drawAcidFilt();

  /* SYNTH */
  ctl('stabCtls', 'Detune', ST.stab, 'detune', 0, 40, 1, v => v + ' ct');
  ctl('stabCtls', 'Cutoff', ST.stab, 'cutoff', 150, 3000, 10, fHz);
  ctl('stabCtls', 'Filter env', ST.stab, 'env', 0, 6000, 50, fHz);
  ctl('stabCtls', 'Decay', ST.stab, 'decay', 0.08, 1, 0.01, fMs);
  ctl('stabCtls', 'Reverb send', ST.stab, 'verb', 0, 1.5, 0.01, fPct);
  on('stabHit', (e, b) => { const ch = AudioCore.get(); S.stab(ch, ch.c.currentTime + 0.02); flash(b, .5); });
  const stabPat = parsePat('x..x..x...x..x..');
  on('stabLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); duckAt(ch, t, ST.sc); } if (i % 2) S.hat(ch, t, { level: .2 }); if (stabPat[i]) S.stab(ch, t); }, b));
  on('dubLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); duckAt(ch, t, { ...ST.sc, amt: .5 }); } if (i % 4 === 2) S.hat(ch, t, { level: .18 }); if (i === 3 || i === 10) S.stab(ch, t, { chord: [0, 3, 7, 10], delay: 1.0, verb: 0.3, decay: 0.2 }); }, b));
  ctl('padCtls', 'Pad LFO rate', ST.pad, 'lfo', 0.05, 2, 0.01, v => v.toFixed(2) + ' Hz');
  ctl('padCtls', 'Pad cutoff', ST.pad, 'cutoff', 200, 2500, 10, fHz);
  on('padHit', (e, b) => { const ch = AudioCore.get(); S.pad(ch, ch.c.currentTime + 0.02); flash(b, 5); });
  const arpNotes = [0, 7, 12, 10, 7, 3, 7, 15, 0, 7, 12, 10, 7, 3, 19, 15];
  on('arpLoop', (e, b) => demo(2, (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); duckAt(ch, t, ST.sc); } if (i % 2) S.hat(ch, t, { level: .2 }); S.lead(ch, t, { freq: ST.root * 4 * Math.pow(2, arpNotes[i] / 12) }); }, b));
  drawSynthFlow();

  /* SAMPLING */
  ctl('sampCtls', 'Rate (varispeed)', ST.samp, 'rate', 0.25, 2, 0.01, fX);
  const sl = document.getElementById('slices'); for (let k = 0; k < 8; k++){ const bt = document.createElement('button'); bt.textContent = k + 1; bt.onclick = () => { const ch = AudioCore.get(); playSlice(k, ch.c.currentTime + 0.02, ch); flash(bt, .3); }; sl.appendChild(bt); }
  on('resample', async (e, b) => { AudioCore.get(); b.textContent = 'Rendering…'; const buf = await renderBar(); setSample(buf, `Resampled one bar of the "${Seq.preset}" Studio pattern at ${ST.bpm} BPM`); b.textContent = 'Resample the Studio loop'; });
  const fileIn = document.getElementById('fileIn'), dz = document.getElementById('dropZone');
  async function loadFile(f){ if (!f) return; const ch = AudioCore.get(); const ab = await f.arrayBuffer(); try { const buf = await ch.c.decodeAudioData(ab); const trimmed = buf.duration > 8 ? sliceBuffer(ch.c, buf, 8) : buf; setSample(trimmed, f.name + (buf.duration > 8 ? ' (first 8 s)' : '')); } catch (err){ document.getElementById('sampInfo').textContent = 'Could not decode that file.'; } }
  function sliceBuffer(c, buf, secs){ const n = Math.floor(secs * buf.sampleRate), o = c.createBuffer(buf.numberOfChannels, n, buf.sampleRate); for (let k = 0; k < buf.numberOfChannels; k++) o.getChannelData(k).set(buf.getChannelData(k).subarray(0, n)); return o; }
  fileIn.onchange = () => loadFile(fileIn.files[0]);
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); }); dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); loadFile(e.dataTransfer.files[0]); });
  const withKick = (ch, t0, bars) => { if (!document.getElementById('sampKick').checked) return; const d = stepDur(); for (let i = 0; i < bars * 16; i += 4){ S.kick(ch, t0 + i * d); duckAt(ch, t0 + i * d, ST.sc); } };
  on('sampPlay', (e, b) => { if (!Samp.buffer) return; const ch = AudioCore.get(), t = ch.c.currentTime + 0.05; S.sample(ch, t, { buffer: Samp.buffer, rate: ST.samp.rate }); withKick(ch, t, Math.ceil(Samp.buffer.duration / ST.samp.rate / (stepDur() * 16))); flash(b, Samp.buffer.duration / ST.samp.rate); });
  on('sampRev', (e, b) => { if (!Samp.buffer) return; const ch = AudioCore.get(), t = ch.c.currentTime + 0.05; S.sample(ch, t, { buffer: Samp.buffer, rate: ST.samp.rate, reverse: true }); withKick(ch, t, Math.ceil(Samp.buffer.duration / ST.samp.rate / (stepDur() * 16))); flash(b, Samp.buffer.duration / ST.samp.rate); });
  on('sampChop', (e, b) => { if (!Samp.buffer) return; const ch = AudioCore.get(), t0 = ch.c.currentTime + 0.05, d = stepDur() * 2; const order = [0, 2, 1, 3, 0, 5, 6, 7, 0, 2, 1, 1, 4, 5, 7, 6]; order.forEach((k, n) => playSlice(k, t0 + n * d, ch, { dur: Math.min(Samp.buffer.duration / 8, d * ST.samp.rate), reverse: n === 11 })); withKick(ch, t0, 2); flash(b, d * 16); });
  drawSample();

  /* MIX */
  ctl('mixCtls', 'SC amount', ST.sc, 'amt', 0, 1, 0.01, fPct, syncTransport);
  ctl('mixCtls', 'SC release', ST.sc, 'rel', 0.05, 0.4, 0.005, fMs, drawSC);
  const mixPat = sc => (ch, t, i) => { if (kickOn(i)){ S.kick(ch, t); S.rumble(ch, t); if (sc) duckAt(ch, t, ST.sc); } if (i === 0 || i === 8) S.sub(ch, t, { dur: stepDur() * 7.5 }); if (i % 2) S.hat(ch, t, { level: .2 }); if (i === 3 || i === 10 || i === 14) S.stab(ch, t); };
  on('mix0', (e, b) => demo(2, mixPat(false), b));
  on('mix1', (e, b) => demo(2, mixPat(true), b));
  drawArrange();

  /* STUDIO */
  const pr = document.getElementById('presets'); Object.keys(PRESETS).forEach(n => { const bt = document.createElement('button'); bt.textContent = n; bt.onclick = () => Seq.load(n); pr.appendChild(bt); });
  document.getElementById('bpm').oninput = e => { ST.bpm = +e.target.value; document.getElementById('bpmOut').textContent = ST.bpm; applyLevels(); drawSC(); };
  document.getElementById('swing').oninput = e => { ST.swing = +e.target.value; document.getElementById('swingOut').textContent = Math.round(50 + ST.swing * 50) + '%'; };
  document.getElementById('scAmt2').oninput = e => { ST.sc.amt = +e.target.value; syncTransport(); };
  document.getElementById('masterVol').oninput = e => { ST.master = +e.target.value; document.getElementById('masterOut').textContent = fPct(ST.master); applyLevels(); };
  on('seqPlay', () => Seq.start()); on('seqStop', () => Seq.stop());
  Seq.load('Berlin');
  drawSpecMap(); renderTracks();
  PageHooks.a1 = () => { drawKickEnv(); renderKickWave(); };
  PageHooks.a7 = () => drawSample();
  buildShell(); route(); bookControls();
  animate();
});
