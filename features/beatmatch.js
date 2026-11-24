/* ===================================================================
   BEATMATCH BY EAR — two generated records that drift apart, matched
   by hand: pitch faders, nudges, slip-cue, a split headphone cue and a
   crossfader. Nothing is synced for the reader. A phase meter is hidden
   until asked for; after a pause a trace shows how long the kicks held.
   Facts quoted come from the booth chapters (bt1, bt2, bt3, bt4).
   =================================================================== */
(() => {
  const NAME = 'beatmatch', KEY = 'fyod-feat-beatmatch', WIN = 20; // ms either side counted as "together"
  const LEVELS = [
    { id: 'near', label: 'Close tempos', a: 122, b: 123.2, drive: 'direct', fader: true,
      note: 'Two direct-drive decks, two generated house records a little over one BPM apart. The pitch fader slides about ±8 per cent, as on the Technics SL-1200MK2 of 1979, whose manual gives 0.7 seconds to reach 33⅓ rpm.', src: 'bt1' },
    { id: 'gap', label: 'Four BPM apart', a: 122, b: 126, drive: 'direct', fader: true,
      note: 'The same decks, with record B four BPM faster. The SL-1200\'s pitch dial was there to trim the speed, and DJs used it to match tempos.', src: 'bt1' },
    { id: 'belt', label: 'Belt drive', a: 120, b: 122, drive: 'belt', fader: true,
      note: 'Press too hard on a belt-driven platter and it stops, then takes its time coming back. Speed changes here arrive late and the drag overshoots. Greg Wilson remembers most of his peers in the late 1970s working on belt-driven Garrard and Citronic decks, with few clubs owning variable-speed turntables, so that a running mix was largely impossible. The book gives no range for a belt deck\'s speed control, so this one keeps ±8 per cent.', src: 'bt1', src2: 'bt2' },
    { id: 'fixed', label: 'Fixed speed', a: 122, b: 122.3, drive: 'direct', fader: false,
      note: 'No pitch control at all. Francis Grasso said the speeds of his decks could not be adjusted, so a mix had to be caught at the right moment. Let record B go on a kick and ride it with your hand while it lasts.', src: 'bt1' }
  ];
  const ld = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const sv = o => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(ld(), o))); } catch (e) {} };
  const rm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const fmt = s => { s = Math.round(s); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };
  const wrap = x => x - Math.round(x); // to [-0.5, 0.5]

  /* ---------- audio: the site's engine if it is loaded, else our own ---------- */
  let OWN = null;
  function audio(){
    try { if (typeof AudioCore !== 'undefined' && AudioCore.get){ const ch = AudioCore.get(); return { c: ch.c, out: ch.out }; } } catch (e) {}
    if (!OWN){ const C = window.AudioContext || window.webkitAudioContext; const c = new C(); const g = c.createGain(); g.gain.value = 0.8; g.connect(c.destination); OWN = { c, out: g }; }
    if (OWN.c.state === 'suspended') OWN.c.resume().catch(() => {});
    return OWN;
  }
  const NOISE = new WeakMap();
  function noise(c){ if (NOISE.has(c)) return NOISE.get(c); const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; NOISE.set(c, b); return b; }

  /* generated voices; every frequency follows the deck's speed, as vinyl does */
  const V = {
    kick(c, o, t, r, hard){ const s = c.createOscillator(), g = c.createGain(); s.type = 'sine';
      s.frequency.setValueAtTime((hard ? 190 : 140) * r, t); s.frequency.exponentialRampToValueAtTime((hard ? 54 : 47) * r, t + (hard ? 0.035 : 0.06));
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.95, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + (hard ? 0.28 : 0.42) / Math.max(r, 0.3));
      s.connect(g); g.connect(o); s.start(t); s.stop(t + 0.5);
      if (hard){ const n = c.createBufferSource(); n.buffer = noise(c); const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500 * r; const ng = c.createGain(); ng.gain.setValueAtTime(0.35, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.012); n.connect(f); f.connect(ng); ng.connect(o); n.start(t); n.stop(t + 0.03); } },
    hat(c, o, t, r, dec, lv, tone){ const n = c.createBufferSource(); n.buffer = noise(c); n.playbackRate.value = Math.max(r, 0.1);
      const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = (tone || 7000) * r; const g = c.createGain();
      g.gain.setValueAtTime(lv, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec); n.connect(f); f.connect(g); g.connect(o); n.start(t, Math.random() * 0.5); n.stop(t + dec + 0.02); },
    clap(c, o, t, r){ const n = c.createBufferSource(); n.buffer = noise(c); const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400 * r; f.Q.value = 0.9; const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); [0, 0.011, 0.022].forEach(d => { g.gain.setValueAtTime(0.42, t + d); g.gain.exponentialRampToValueAtTime(0.05, t + d + 0.009); });
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); n.connect(f); f.connect(g); g.connect(o); n.start(t, Math.random() * 0.5); n.stop(t + 0.25); },
    bass(c, o, t, r, hz){ const s = c.createOscillator(); s.type = 'sawtooth'; s.frequency.value = hz * r; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4;
      f.frequency.setValueAtTime(900 * r, t); f.frequency.exponentialRampToValueAtTime(180 * r, t + 0.12); const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.006); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      s.connect(f); f.connect(g); g.connect(o); s.start(t); s.stop(t + 0.25); },
    stab(c, o, t, r){ const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400 * r; f.connect(g); g.connect(o);
      [220, 261.63, 329.63, 392].forEach(hz => { const s = c.createOscillator(); s.type = 'square'; s.frequency.value = hz * r; s.connect(f); s.start(t); s.stop(t + 0.3); }); }
  };
  /* one bar of sixteenths per record; both in A minor so the blend sits together */
  const REC = {
    A: (c, o, st, t, r) => { if (st % 4 === 0) V.kick(c, o, t, r, false); if (st % 4 === 2){ V.hat(c, o, t, r, 0.16, 0.22, 7500); V.bass(c, o, t, r, st === 14 ? 65.41 : 55); } if (st % 2 === 1) V.hat(c, o, t, r, 0.03, 0.06, 9000); },
    B: (c, o, st, t, r) => { if (st % 4 === 0) V.kick(c, o, t, r, true); if (st === 4 || st === 12) V.clap(c, o, t, r); V.hat(c, o, t, r, 0.025, st % 4 === 2 ? 0.13 : 0.06, 6000); if (st === 3 || st === 11) V.stab(c, o, t, r); }
  };

  /* ---------- markup ---------- */
  function deckHTML(id){
    const other = id === 'A' ? 'the room' : 'your ear';
    return `<div class="bm-deck" data-d="${id}" role="group" aria-label="Deck ${id}">
      <div class="bm-dh"><b class="bm-badge">${id}</b><span class="bm-dn">Record ${id} <small>${id === 'A' ? 'deep kick, offbeat bass' : 'hard kick, clap, chord'}</small></span></div>
      <svg class="bm-tt" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="57" class="bm-plt"/><g class="bm-rot"><circle cx="60" cy="60" r="50" class="bm-rec"/>${[44, 38, 32].map(r => `<circle cx="60" cy="60" r="${r}" class="bm-gr"/>`).join('')}<circle cx="60" cy="60" r="19" class="bm-lab"/><rect x="58.6" y="41" width="2.8" height="12" rx="1.4" class="bm-mk"/><text x="60" y="66" text-anchor="middle" class="bm-lt">${id}</text></g><circle cx="60" cy="60" r="2.2" class="bm-spn"/></svg>
      <button type="button" class="bm-btn bm-hold" aria-pressed="false">Hold</button>
      <div class="bm-nud"><button type="button" class="bm-btn bm-drag" aria-label="Drag deck ${id}: slow it while held">‹ Drag</button><button type="button" class="bm-btn bm-push" aria-label="Push deck ${id}: speed it up while held">Push ›</button></div>
      <label class="bm-pl"><span>Pitch</span><input type="range" class="bm-pitch" min="-8" max="8" step="0.02" value="0" aria-label="Deck ${id} pitch, per cent"><output class="bm-po">+0.00%</output></label>
      <button type="button" class="bm-btn bm-cue" aria-pressed="${id === 'B'}">Cue ${id} <small>to left ear</small></button>
    </div>`.replace(/\s{2,}</g, '<');
  }
  function build(sec){
    const st = ld(); const lv = LEVELS.find(l => l.id === st.level) || LEVELS[0];
    sec.innerHTML = `<h4 class="bm-h">Beatmatch by ear</h4>
      <p class="bm-desc">Two generated records play on two decks at slightly different speeds, and nothing syncs them. Record A plays to the room; record B starts held under your thumb in the headphones. Let it go on a kick, then match its speed with the pitch fader and keep the kicks together with Push and Drag. A phase meter is hidden so that you listen first. When you pause, a trace shows how long the kicks stayed within ${WIN} ms of each other.</p>
      <div class="bm-lv" role="radiogroup" aria-label="Difficulty">${LEVELS.map(l => `<button type="button" role="radio" class="bm-chip" data-l="${l.id}" aria-checked="${l === lv}">${l.label}</button>`).join('')}</div>
      <p class="cap bm-note" aria-live="polite"></p>
      <div class="bm-tr"><button type="button" class="play bm-play">Play</button><button type="button" class="sm bm-reset">Start again</button><span class="cap bm-stat" role="status" aria-live="polite">Stopped. Nothing plays until you press Play.</span></div>
      <div class="bm-decks">${deckHTML('A')}${deckHTML('B')}</div>
      <label class="bm-xf"><span>Crossfader <small>(what the room hears)</small></span><span class="bm-xr"><b>A</b><input type="range" class="bm-xfr" min="-1" max="1" step="0.01" value="-1" aria-label="Crossfader, A to B"><b>B</b></span></label>
      <p class="cap bm-how">Cue puts a deck in your left ear and moves the room to your right, the way a DJ splits the headphones. Larry Levan used a one-cup Sennheiser and Francis Grasso a single earpiece. Hold works like the slip-cue: the record held still on the beat while the platter turns, then let go. <a href="#bt1" data-src="bt1">From the book: the booth, chapter 1</a></p>
      <div class="bm-mw"><button type="button" class="sm bm-show" aria-expanded="false">Show the phase meter</button><label class="cap bm-mot" hidden><input type="checkbox" class="bm-motion"> turn the platters</label></div>
      <div class="bm-meter" hidden><canvas class="bm-mc" height="74" role="img" aria-label="Phase meter"></canvas><p class="cap bm-mt"></p></div>
      <div class="bm-res" hidden><h5>Your last run</h5><canvas class="bm-tc" height="120" role="img" aria-label="Trace of the gap between the kicks over time"></canvas><p class="bm-rt"></p></div>
      <p class="cap bm-sync">Since 2012 a CDJ can do this for you: Beat Sync matched one deck's tempo and beat position to another at one press, and the mixer on this site's Mixer page syncs its decks too. Here your ears do it. <a href="#bt3" data-src="bt3">The sync button, the booth, chapter 3</a> · <a href="#bt4" data-src="bt4">the sync argument, chapter 4</a></p>
      <p class="cap bm-cap">A simplified illustration made for the book: the records and sounds are generated, not samples of real ones, and the tempos are chosen for practice.</p>`;
  }

  /* ---------- the instance ---------- */
  function Inst(sec){
    const q = s => sec.querySelector(s), qa = s => [...sec.querySelectorAll(s)];
    const S = ld();
    const me = {
      sec, lv: LEVELS.find(l => l.id === S.level) || LEVELS[0], playing: false, timer: null, raf: 0, A: null, ctx: null, lastNow: 0,
      xf: -1, meter: false, motion: !rm() || !!S.motion, trace: [], runT: 0, inT: 0, best: 0, cur: 0, sampT: 0, played: false,
      decks: { A: null, B: null }
    };
    const mkDeck = id => ({ id, base: 0, pitch: 0, rate: 1, pos: 0, next: 0, held: false, nud: 0, cue: id === 'B', node: null, room: null, cueG: null });
    me.decks.A = mkDeck('A'); me.decks.B = mkDeck('B');

    function setLevel(l, quiet){
      me.lv = l; sv({ level: l.id }); pause(true); reset();
      qa('.bm-chip').forEach(b => b.setAttribute('aria-checked', b.dataset.l === l.id));
      const n = q('.bm-note'); n.innerHTML = `${l.note} <a href="#${l.src}" data-src="${l.src}">From the book</a>${l.src2 ? ` · <a href="#${l.src2}" data-src="${l.src2}">${l.src2 === 'bt2' ? 'chapter 2' : l.src2}</a>` : ''}`;
      qa('.bm-pitch').forEach(i => { i.disabled = !l.fader; i.closest('.bm-pl').classList.toggle('off', !l.fader); });
      if (!quiet) say(`${l.label}. Press Play to start.`);
    }
    function reset(){
      const l = me.lv; ['A', 'B'].forEach(id => { const d = me.decks[id]; d.base = id === 'A' ? l.a : l.b; d.pitch = 0; d.rate = 1; d.nud = 0; d.pos = 0; d.next = 0; d.held = id === 'B'; });
      qa('.bm-pitch').forEach(i => { i.value = 0; }); me.trace = []; me.runT = 0; me.inT = 0; me.best = 0; me.cur = 0; me.sampT = 0; me.played = false;
      syncUI(); drawDecks(); q('.bm-res').hidden = true;
    }
    function say(t){ q('.bm-stat').textContent = t; }
    const factor = d => (me.lv.fader ? 1 + d.pitch / 100 : 1) * (1 + d.nud);
    const bpmOf = d => d.base * (d.held ? 0 : d.rate);

    /* audio graph: deck → room (crossfader) → room pan; deck → cue → left ear */
    function wire(){
      const A = audio(); me.A = A; const c = A.c; if (me.ctx === c && me.roomPan) return;
      me.ctx = c; me.bus = c.createGain(); me.bus.gain.value = 1; me.bus.connect(A.out);
      const pan = v => { if (c.createStereoPanner){ const p = c.createStereoPanner(); p.pan.value = v; return p; } const g = c.createGain(); g.pan = { value: 0, setTargetAtTime(){} }; return g; };
      me.roomPan = pan(0); me.cuePan = pan(-1); me.roomPan.connect(me.bus); me.cuePan.connect(me.bus);
      ['A', 'B'].forEach(id => { const d = me.decks[id]; d.node = c.createGain(); d.node.gain.value = 0.5; d.room = c.createGain(); d.cueG = c.createGain(); d.node.connect(d.room); d.node.connect(d.cueG); d.room.connect(me.roomPan); d.cueG.connect(me.cuePan); });
      applyMix(true);
    }
    function applyMix(now){
      if (!me.ctx) return; const t = me.ctx.currentTime, k = now ? 0.001 : 0.02; const x = (me.xf + 1) / 2;
      me.decks.A.room.gain.setTargetAtTime(Math.cos(x * Math.PI / 2), t, k); me.decks.B.room.gain.setTargetAtTime(Math.sin(x * Math.PI / 2), t, k);
      const anyCue = me.decks.A.cue || me.decks.B.cue; ['A', 'B'].forEach(id => me.decks[id].cueG.gain.setTargetAtTime(me.decks[id].cue ? 0.9 : 0, t, k));
      me.roomPan.pan.setTargetAtTime(anyCue ? 1 : 0, t, k);
    }

    /* clock: each deck keeps its own position in beats; nothing links them */
    function tick(){
      const c = me.ctx, now = c.currentTime, dt = Math.min(0.1, Math.max(0, now - me.lastNow)); me.lastNow = now;
      ['A', 'B'].forEach(id => {
        const d = me.decks[id];
        if (d.held){ d.rate = 0; return; }
        const tgt = factor(d); let tau = 0.03;
        if (me.lv.drive === 'belt') tau = tgt < d.rate ? 0.22 : 1.1;
        d.rate += (tgt - d.rate) * (1 - Math.exp(-dt / tau));
        const bps = d.base / 60 * d.rate; d.pos += bps * dt;
        const ahead = d.pos + bps * 0.12;
        while (d.next / 4 < ahead){ const tt = now + (d.next / 4 - d.pos) / Math.max(bps, 0.01); if (tt >= now - 0.005) REC[id](c, d.node, d.next % 16, Math.max(tt, now), d.rate); d.next++; }
      });
      // score: only while both records run
      const a = me.decks.A, b = me.decks.B, both = !a.held && !b.held;
      if (both){ const e = errMs(); me.runT += dt; if (Math.abs(e) <= WIN){ me.inT += dt; me.cur += dt; if (me.cur > me.best) me.best = me.cur; } else me.cur = 0; }
      me.sampT += dt; if (me.sampT >= 0.1){ me.sampT -= 0.1; me.trace.push(both ? errMs() : null); if (me.trace.length > 6000) me.trace.shift(); }
    }
    function errMs(){ const a = me.decks.A, b = me.decks.B; const per = 60 / Math.max(1, a.base * Math.max(a.rate, 0.2)) * 1000; return wrap(b.pos - a.pos) * per; }

    function play(){
      wire(); if (window.SoundBus) try { SoundBus.claim(NAME); } catch (e) {}
      me.playing = true; me.played = true; me.lastNow = me.ctx.currentTime;
      ['A', 'B'].forEach(id => { const d = me.decks[id]; d.next = Math.ceil(d.pos * 4); if (!d.held) d.rate = factor(d); });
      clearInterval(me.timer); me.timer = setInterval(tick, 25); tick();
      q('.bm-play').textContent = 'Pause'; q('.bm-play').classList.add('stopbtn'); q('.bm-res').hidden = true; q('.bm-mot').hidden = !rm();
      say(me.decks.B.held ? 'Playing. Record B is held in your left ear: press Let go on a kick.' : 'Playing. Match the speeds by ear.');
      loop();
    }
    function pause(silent, why){
      const was = me.playing; me.playing = false; clearInterval(me.timer); me.timer = null; cancelAnimationFrame(me.raf); me.raf = 0;
      ['A', 'B'].forEach(id => { me.decks[id].nud = 0; }); qa('.bm-drag,.bm-push').forEach(b => b.classList.remove('on'));
      const pb = q('.bm-play'); if (pb){ pb.textContent = 'Play'; pb.classList.remove('stopbtn'); }
      if (was && !silent){ say(why || 'Paused.'); showResult(); }
    }
    me.pause = pause;

    /* ---------- drawing ---------- */
    function drawDecks(){
      ['A', 'B'].forEach(id => { const d = me.decks[id], el = q(`.bm-deck[data-d="${id}"]`); if (!el) return;
        if (me.motion){ const ang = (d.pos * 60 / d.base * 200) % 360; el.querySelector('.bm-rot').setAttribute('transform', `rotate(${ang.toFixed(1)} 60 60)`); }
        el.querySelector('.bm-po').textContent = me.lv.fader ? (d.pitch >= 0 ? '+' : '') + d.pitch.toFixed(2) + '%' : 'fixed'; });
      if (me.meter) drawMeter();
    }
    function loop(){ if (!me.playing) return; drawDecks(); me.raf = requestAnimationFrame(loop); }
    function canvas(cv, h){ const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(200, cv.clientWidth || 300); if (cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [x, w]; }
    function col(){ const cs = getComputedStyle(sec); return { tx: cs.getPropertyValue('--text').trim() || '#ebebf1', mu: cs.getPropertyValue('--muted').trim() || '#8f8fa0', ln: cs.getPropertyValue('--line').trim() || '#272733', ok: '#2fbf71', c: cs.getPropertyValue('--ci').trim() || cs.getPropertyValue('--c').trim() || '#a9bdd3' }; }
    function drawMeter(){
      const cv = q('.bm-mc'); const [x, w] = canvas(cv, 74), C = col(), a = me.decks.A, b = me.decks.B; x.clearRect(0, 0, w, 74);
      const per = 60 / a.base * 1000, half = per / 2, X = ms => w / 2 + (ms / half) * (w / 2 - 10);
      x.fillStyle = C.ln; x.fillRect(10, 30, w - 20, 14);
      x.fillStyle = C.ok + '55'; x.fillRect(X(-WIN), 26, X(WIN) - X(-WIN), 22);
      x.fillStyle = C.mu; x.font = '11px ' + (getComputedStyle(sec).getPropertyValue('--f-mono') || 'monospace'); x.textAlign = 'left'; x.fillText('B late', 10, 18); x.textAlign = 'right'; x.fillText('B early', w - 10, 18); x.textAlign = 'center'; x.fillText('together', w / 2, 66);
      const both = !a.held && !b.held && me.played; let txt;
      if (both){ const e = errMs(); x.fillStyle = Math.abs(e) <= WIN ? C.ok : C.tx; x.fillRect(X(e) - 2, 22, 4, 30); txt = `Kicks ${Math.abs(e) < 1 ? 'together' : Math.abs(e).toFixed(0) + ' ms apart, B ' + (e > 0 ? 'early' : 'late')}.`; }
      else txt = 'One record is held: the meter reads when both run.';
      q('.bm-mt').textContent = `${txt} Deck A ${bpmOf(a).toFixed(2)} BPM, deck B ${bpmOf(b).toFixed(2)} BPM.`;
    }
    function showResult(){
      const box = q('.bm-res'); if (!me.trace.some(v => v != null)){ box.hidden = true; return; } box.hidden = false;
      const cv = q('.bm-tc'), H = 120; const [x, w] = canvas(cv, H), C = col(); x.clearRect(0, 0, w, H);
      const R = Math.round(30000 / me.decks.A.base), Y = ms => 16 + (1 - (Math.max(-R, Math.min(R, ms)) + R) / (2 * R)) * (H - 32), n = me.trace.length, X = i => 4 + i / Math.max(1, n - 1) * (w - 8);
      x.fillStyle = C.ok + '40'; x.fillRect(0, Y(WIN), w, Y(-WIN) - Y(WIN)); x.strokeStyle = C.ln; x.beginPath(); x.moveTo(0, H / 2); x.lineTo(w, H / 2); x.stroke();
      x.lineWidth = 1.6; x.strokeStyle = C.tx; x.beginPath(); let pen = false;
      me.trace.forEach((v, i) => { if (v == null){ pen = false; return; } if (pen && Math.abs(v - me.trace[i - 1]) > 150){ pen = false; } if (!pen){ x.moveTo(X(i), Y(v)); pen = true; } else x.lineTo(X(i), Y(v)); }); x.stroke();
      x.fillStyle = C.mu; x.font = '10px monospace'; x.textAlign = 'left'; x.fillText(`+${R} ms, B early`, 4, 10); x.fillText(`−${R} ms, B late`, 4, H - 3); x.textAlign = 'right'; x.fillText(fmt(n / 10), w - 4, H - 3);
      const t = `The kicks stayed within ${WIN} ms of each other for ${fmt(me.inT)} of the ${fmt(me.runT)} both records were running; the longest stretch was ${fmt(me.best)}. The shaded band is that window; gaps in the line are where a record was held.`;
      q('.bm-rt').textContent = me.runT > 0.5 ? t : 'Record B was never let go, so there is nothing to show yet.';
      cv.setAttribute('aria-label', me.runT > 0.5 ? t : 'No trace yet');
    }
    function syncUI(){
      ['A', 'B'].forEach(id => { const d = me.decks[id], el = q(`.bm-deck[data-d="${id}"]`); const h = el.querySelector('.bm-hold');
        h.textContent = d.held ? 'Let go' : 'Hold'; h.setAttribute('aria-pressed', d.held); h.setAttribute('aria-label', d.held ? `Let go of record ${id}` : `Hold record ${id} still on the beat`);
        el.classList.toggle('held', d.held); const cu = el.querySelector('.bm-cue'); cu.setAttribute('aria-pressed', d.cue); el.classList.toggle('cued', d.cue); });
    }

    /* ---------- controls ---------- */
    const L = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); L.push([el, ev, fn, o]); };
    qa('.bm-chip').forEach(b => on(b, 'click', () => setLevel(LEVELS.find(l => l.id === b.dataset.l))));
    on(q('.bm-lv'), 'keydown', e => { const i = LEVELS.indexOf(me.lv); let j = -1; if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % LEVELS.length; if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i + LEVELS.length - 1) % LEVELS.length; if (j < 0) return; e.preventDefault(); setLevel(LEVELS[j]); q(`.bm-chip[data-l="${LEVELS[j].id}"]`).focus(); });
    on(q('.bm-play'), 'click', () => me.playing ? pause(false) : play());
    on(q('.bm-reset'), 'click', () => { const was = me.playing; pause(true); reset(); if (was) play(); else say('Back to the start. Record B is held again.'); });
    qa('.bm-deck').forEach(el => {
      const d = me.decks[el.dataset.d];
      on(el.querySelector('.bm-hold'), 'click', () => {
        if (d.held){ d.held = false; d.rate = factor(d); d.next = Math.ceil(d.pos * 4); if (!me.playing) play(); else say(`Record ${d.id} let go.`); }
        else { d.held = true; d.pos = Math.round(d.pos / 4) * 4; d.next = d.pos * 4; say(`Record ${d.id} held on its first beat. Let go on a kick.`); }
        syncUI(); drawDecks();
      });
      ['drag', 'push'].forEach(k => {
        const b = el.querySelector('.bm-' + k);
        const down = () => { d.nud = k === 'push' ? 0.04 : (me.lv.drive === 'belt' ? -0.35 : -0.04); b.classList.add('on'); }, up = () => { if (b.classList.contains('on')){ d.nud = 0; b.classList.remove('on'); } };
        on(b, 'pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) {} down(); });
        ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(ev => on(b, ev, up));
        on(b, 'keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); if (!e.repeat) down(); } });
        on(b, 'keyup', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); up(); } });
        on(b, 'contextmenu', e => e.preventDefault());
      });
      const p = el.querySelector('.bm-pitch'); on(p, 'input', () => { d.pitch = +p.value; drawDecks(); });
      on(el.querySelector('.bm-cue'), 'click', () => { d.cue = !d.cue; syncUI(); applyMix(); });
    });
    on(q('.bm-xfr'), 'input', e => { me.xf = +e.target.value; applyMix(); });
    on(q('.bm-show'), 'click', e => { me.meter = !me.meter; e.target.setAttribute('aria-expanded', me.meter); e.target.textContent = me.meter ? 'Hide the phase meter' : 'Show the phase meter'; q('.bm-meter').hidden = !me.meter; if (me.meter) drawMeter(); });
    const mo = q('.bm-motion'); mo.checked = me.motion; q('.bm-mot').hidden = !rm(); on(mo, 'change', () => { me.motion = mo.checked; sv({ motion: me.motion }); drawDecks(); });
    on(document, 'visibilitychange', () => { if (document.hidden && me.playing) pause(false, 'Paused while the tab was hidden.'); });
    if ('IntersectionObserver' in window){ me.io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting && me.playing) pause(false, 'Paused when it scrolled out of view.'); }), { threshold: 0 }); me.io.observe(sec); }
    const sa = document.getElementById('stopAll'); if (sa) on(sa, 'click', () => { if (me.playing) pause(false, 'Stopped.'); });
    on(window, 'resize', () => { if (me.meter) drawMeter(); if (!q('.bm-res').hidden) showResult(); });
    me.destroy = () => { pause(true); L.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o)); if (me.io) me.io.disconnect(); try { ['A', 'B'].forEach(id => { const d = me.decks[id]; d.node && d.node.disconnect(); }); me.bus && me.bus.disconnect(); } catch (e) {} };
    setLevel(me.lv, true);
    return me;
  }

  /* other sounds starting on the site stop this one (and page turns, which call SoundBus.all) */
  function hookBus(){
    /* the book's one stop registry (build/soundbus.js): registered in mount, removed in unmount */
  }
  const INST = new WeakMap();
  (window.FEATURES = window.FEATURES || []).push({
    name: NAME, pages: ['bt1'], anchor: null,
    mount(pageEl, id){
      this.unmount(pageEl);
      const sec = document.createElement('section'); sec.className = 'feature feat-' + NAME; sec.setAttribute('aria-label', 'Beatmatch by ear'); sec.dataset.src = 'bt1';
      build(sec); pageEl.appendChild(sec); const me = Inst(sec); INST.set(pageEl, me);
      if (window.SoundBus && SoundBus.register) SoundBus.register(NAME, () => { if (me.playing) me.pause(false, 'Stopped: another sound started.'); });
      return sec;
    },
    unmount(pageEl){
      const me = INST.get(pageEl); if (me){ me.destroy(); INST.delete(pageEl); if (window.SoundBus && SoundBus.unregister) SoundBus.unregister(NAME); }
      pageEl.querySelectorAll('section.feat-' + NAME).forEach(s => s.remove());
    }
  });
})();
