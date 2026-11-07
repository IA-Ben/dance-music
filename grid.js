/* ===================================================================
   PATTERN GRID — the step matrix, embeddable on any page.
   PatternGrid.mount(container, [genreNames], opts)
   =================================================================== */
window.PatternGrid = {
  active: null,
  mount(box, genres, opts = {}){
    if (!box || box.dataset.mounted) return; box.dataset.mounted = 1; genres = genres.filter(g => PRESET(g)); if (!genres.length) return;
    const st = { genre: genres[0], pat: {}, mute: {}, playing: false, step: 0, nextTime: 0, timer: null, queue: [], box, tabs: genres };
    const load = name => { st.genre = name; const G = PRESET(name); DECK_LAYERS.forEach(([lid]) => { st.pat[lid] = parsePat(G.pat[lid] || E16); st.mute[lid] = false; }); if (st.playing){ const dk = Mixer.ensureDemo(); dk.load(name); dk.pat = st.pat; dk.mute = st.mute; dk.setDelayForBpm(G.bpm); } render(); };
    const rows = () => DECK_LAYERS.filter(([lid]) => lid !== 'rumble' && (st.pat[lid].some(v => v) || st.shown && st.shown.has(lid)));
    const render = () => {
      const G = PRESET(st.genre);
      box.innerHTML = `<div class="pg">
        ${st.tabs.length > 1 ? `<div class="pgtabs">${st.tabs.map(g => `<button class="${g === st.genre ? 'on' : ''}" data-g="${g}">${g}</button>`).join('')}</div>` : ''}
        <div class="pghead"><button class="play pgplay">${st.playing ? 'Stop' : 'Play the pattern'}</button><span class="pgmeta"><b>${st.genre}</b> · ${G.bpm} BPM · swing ${Math.round(G.swing * 100)}% · key ${G.key[0]}${G.rumble > 0 ? ' · rumble ' + Math.round(G.rumble * 100) + '%' : ''}</span><button class="sm pgreset">reset</button><select class="pgadd"><option value="">+ layer</option>${DECK_LAYERS.filter(([lid]) => lid !== 'rumble' && !st.pat[lid].some(v => v) && !(st.shown && st.shown.has(lid))).map(([lid, n]) => `<option value="${lid}">${n}</option>`).join('')}</select></div>
        <div class="deckgrid pgrid" style="--dk:${opts.color || 'var(--c, var(--kick))'}"><div class="lbl"></div>${Array.from({ length: 16 }, (_, i) => `<div class="lbl pgnum${i % 4 === 0 ? ' beat' : ''}">${i % 4 === 0 ? i / 4 + 1 : '·'}</div>`).join('')}</div>
        <p class="pgnote">${G.notes || ''} <span class="muted">Click a step to add or remove a hit; click a layer name to mute it; the acid row cycles off → note → accent → slide.</span></p>
      </div>`;
      const grid = box.querySelector('.pgrid');
      rows().forEach(([lid, name]) => {
        const l = document.createElement('div'); l.className = 'lbl lname' + (st.mute[lid] ? ' off' : ''); l.textContent = name; l.title = 'mute / unmute'; l.onclick = () => { st.mute[lid] = !st.mute[lid]; l.classList.toggle('off', st.mute[lid]); }; grid.appendChild(l);
        for (let i = 0; i < 16; i++){ const c = document.createElement('div'); c.className = 'st' + (i && i % 4 === 0 ? ' b' : ''); c.dataset.step = i; c.dataset.layer = lid; const paint = v => { c.classList.toggle('on', v === 1); c.classList.toggle('acc', v === 2); c.classList.toggle('sl', v === 3); }; paint(st.pat[lid][i]);
          c.onclick = () => { const cur = st.pat[lid][i]; const nv = lid === 'acid' ? (cur + 1) % 4 : (cur ? 0 : 1); st.pat[lid][i] = nv; paint(nv); }; grid.appendChild(c); }
      });
      box.querySelectorAll('.pgtabs button').forEach(b => b.onclick = () => load(b.dataset.g));
      box.querySelector('.pgplay').onclick = () => st.playing ? this.stop() : this.play(st);
      box.querySelector('.pgreset').onclick = () => load(st.genre);
      box.querySelector('.pgadd').onchange = e => { if (!e.target.value) return; st.shown = st.shown || new Set(); st.shown.add(e.target.value); render(); };
    };
    box._grid = st; st.load = load; st.render = render; load(st.genre);
  },
  play(st){
    if (this.active && this.active !== st) this.stop();
    AudioCore.get(); if (window.MixerStop) MixerStop(); if (window.Seq) Seq.stop();
    const dk = Mixer.ensureDemo(); dk.load(st.genre); dk.pat = st.pat; dk.mute = st.mute; const G = PRESET(st.genre); dk.setDelayForBpm(G.bpm);
    st.playing = true; st.step = 0; st.nextTime = dk.ch.c.currentTime + 0.06; st.queue = []; this.active = st;
    const tick = () => { const c = dk.ch.c; while (st.nextTime < c.currentTime + 0.15){ const d = 60 / G.bpm / 4; dk.scheduleStep(st.step, st.nextTime, G.bpm); st.queue.push({ step: st.step, time: st.nextTime }); st.nextTime += d; st.step = (st.step + 1) % 16; } };
    st.timer = setInterval(tick, 25); tick(); st.render(); this.animate();
  },
  stop(){ const st = this.active; if (!st) return; clearInterval(st.timer); st.playing = false; st.queue = []; this.active = null; st.box.querySelectorAll('.cur').forEach(e => e.classList.remove('cur')); st.render(); },
  animate(){
    const st = this.active; if (!st) return; requestAnimationFrame(() => this.animate());
    const now = Mixer.demoDeck.ch.c.currentTime; let cur = null; while (st.queue.length && st.queue[0].time <= now) cur = st.queue.shift();
    if (cur !== null && cur){ st.box.querySelectorAll('.st.cur').forEach(e => e.classList.remove('cur')); st.box.querySelectorAll(`.st[data-step="${cur.step}"]`).forEach(e => e.classList.add('cur')); }
  },
  /* auto-mount: every .era card on a page becomes a grid with one tab per era button */
  autoMount(root){
    (root || document).querySelectorAll('.era').forEach(era => {
      if (era.dataset.grid) return; era.dataset.grid = 1; const genres = [...era.querySelectorAll('.era-btn')].map(b => b.dataset.genre).filter((g, i, a) => a.indexOf(g) === i && PRESET(g)); if (!genres.length) return;
      const box = document.createElement('div'); box.className = 'pgbox'; era.after(box); this.mount(box, genres);
    });
  }
};
window.GridStop = () => PatternGrid.stop();

/* ===================================================================
   MORPH — drag one era into another and hear the mutation
   =================================================================== */
window.Morph = {
  active: null,
  lerp: (a, b, t) => a + (b - a) * t,
  blend(A, B, t){
    const L = this.lerp; const num = (x, y) => (typeof x === 'number' && typeof y === 'number') ? L(x, y, t) : (t < .5 ? x : y);
    const obj = (x, y) => { const o = {}; Object.keys({ ...x, ...y }).forEach(k => { o[k] = num(x[k], y[k]); }); return o; };
    const pick = (x, y) => t < .5 ? x : y;
    const P = { bpm: L(A.bpm, B.bpm, t), swing: L(A.swing, B.swing, t), sc: { amt: L(A.sc, B.sc, t), rel: 0.22, on: true }, rumble: L(A.rumble, B.rumble, t), rumbleLp: L(A.rumbleLp, B.rumbleLp, t), root: pick(A.key[1], B.key[1]), key: pick(A.key[0], B.key[0]),
      kick: obj(A.kick, B.kick), hat: obj(A.hat, B.hat), stab: { ...obj(A.stab, B.stab), chord: pick(A.stab.chord, B.stab.chord) }, acid: { ...obj(A.acid, B.acid), wave: pick(A.acid.wave, B.acid.wave) }, sub: obj(A.sub, B.sub), offCutoff: L(A.offCutoff, B.offCutoff, t),
      acidNotes: pick(A.acidNotes, B.acidNotes), bassNotes: pick(A.bassNotes || null, B.bassNotes || null), leadNotes: pick(A.leadNotes || null, B.leadNotes || null), pianoChord: pick(A.pianoChord || null, B.pianoChord || null) };
    const pat = {}, levels = {}; const n = DECK_LAYERS.length;
    DECK_LAYERS.forEach(([lid], i) => { const thr = 0.3 + 0.4 * (i / n); const pa = parsePat(A.pat[lid] || E16), pb = parsePat(B.pat[lid] || E16); pat[lid] = t < thr ? pa : pb; const la = lid === 'rumble' ? A.rumble : (A.levels && A.levels[lid] != null ? A.levels[lid] : (pa.some(v => v) ? 0.8 : 0)); const lb = lid === 'rumble' ? B.rumble : (B.levels && B.levels[lid] != null ? B.levels[lid] : (pb.some(v => v) ? 0.8 : 0)); levels[lid] = L(la, lb, t); });
    return { P, pat, levels };
  },
  apply(dk, A, B, t){ const { P, pat, levels } = this.blend(A, B, t); dk.P = P; dk.pat = pat; DECK_LAYERS.forEach(([lid]) => { dk.mute[lid] = false; dk.tr[lid].gain.setTargetAtTime(levels[lid], dk.ch.c.currentTime, 0.05); }); dk.rlp.frequency.setTargetAtTime(P.rumbleLp, dk.ch.c.currentTime, 0.05); dk.setDelayForBpm(P.bpm); return P; },
  mount(box, a, b, opts = {}){
    if (!box || box.dataset.mounted) return; box.dataset.mounted = 1; const names = [...GENRE_NAMES, ...Object.keys(RECORD_PRESETS)];
    const st = { a, b, t: 0, playing: false, box, timer: null, step: 0, nextTime: 0, queue: [] };
    const opt = (sel) => names.map(g => `<option ${g === sel ? 'selected' : ''}>${g}</option>`).join('');
    box.innerHTML = `<div class="pg morph"><div class="pghead"><button class="play mplay">Play the morph</button><span class="pgmeta">drag the slider while it plays</span></div>
      <div class="mrow"><select class="ma">${opt(a)}</select><input type="range" class="mt" min="0" max="100" value="0"><select class="mb">${opt(b)}</select></div>
      <div class="mread"></div><div class="deckgrid pgrid mgrid"></div><p class="pgnote mnote"></p></div>`;
    const read = () => { const A = PRESET(st.a), B = PRESET(st.b); const { P, pat, levels } = this.blend(A, B, st.t); box.querySelector('.mread').innerHTML = `<span><b>${Math.round(P.bpm)}</b> BPM</span><span>kick drive <b>${P.kick.drive.toFixed(1)}</b></span><span>rumble <b>${Math.round(P.rumble * 100)}%</b></span><span>swing <b>${Math.round(P.swing * 100)}%</b></span><span>key <b>${P.key}</b></span><span>sidechain <b>${Math.round(P.sc.amt * 100)}%</b></span>`;
      const g = box.querySelector('.mgrid'); g.innerHTML = ''; DECK_LAYERS.forEach(([lid, name]) => { if (lid === 'rumble' || !pat[lid].some(v => v)) return; const l = document.createElement('div'); l.className = 'lbl'; l.textContent = name; l.style.opacity = 0.4 + levels[lid] * 0.6; g.appendChild(l); for (let i = 0; i < 16; i++){ const c = document.createElement('div'); c.className = 'st' + (i && i % 4 === 0 ? ' b' : ''); c.dataset.step = i; const v = pat[lid][i]; c.classList.toggle('on', v === 1); c.classList.toggle('acc', v === 2); c.classList.toggle('sl', v === 3); c.style.opacity = 0.35 + levels[lid] * 0.65; g.appendChild(c); } });
      box.querySelector('.mnote').textContent = st.t < 0.5 ? `${Math.round((1 - st.t) * 100)}% ${st.a}: ${A.notes || ''}` : `${Math.round(st.t * 100)}% ${st.b}: ${B.notes || ''}`;
      if (st.playing) this.apply(Mixer.ensureDemo(), A, B, st.t); };
    box.querySelector('.ma').onchange = e => { st.a = e.target.value; read(); }; box.querySelector('.mb').onchange = e => { st.b = e.target.value; read(); };
    box.querySelector('.mt').oninput = e => { st.t = +e.target.value / 100; read(); };
    box.querySelector('.mplay').onclick = () => st.playing ? this.stop() : this.play(st);
    st.read = read; read();
  },
  play(st){
    if (this.active && this.active !== st) this.stop(); AudioCore.get(); if (window.MixerStop) MixerStop(); if (window.GridStop) GridStop(); if (window.Seq) Seq.stop();
    const dk = Mixer.ensureDemo(); dk.load(st.a); st.playing = true; this.active = st; this.apply(dk, PRESET(st.a), PRESET(st.b), st.t);
    st.step = 0; st.nextTime = dk.ch.c.currentTime + 0.06; st.queue = [];
    const tick = () => { const c = dk.ch.c; while (st.nextTime < c.currentTime + 0.15){ const bpm = dk.P.bpm; const d = 60 / bpm / 4; dk.scheduleStep(st.step, st.nextTime, bpm); st.queue.push({ step: st.step, time: st.nextTime }); st.nextTime += d; st.step = (st.step + 1) % 16; } };
    st.timer = setInterval(tick, 25); tick(); st.box.querySelector('.mplay').textContent = 'Stop'; st.box.querySelector('.mplay').classList.add('flash'); this.animate();
  },
  stop(){ const st = this.active; if (!st) return; clearInterval(st.timer); st.playing = false; this.active = null; st.box.querySelectorAll('.cur').forEach(e => e.classList.remove('cur')); const b = st.box.querySelector('.mplay'); b.textContent = 'Play the morph'; b.classList.remove('flash'); },
  animate(){ const st = this.active; if (!st) return; requestAnimationFrame(() => this.animate()); const now = Mixer.demoDeck.ch.c.currentTime; let cur = null; while (st.queue.length && st.queue[0].time <= now) cur = st.queue.shift(); if (cur){ st.box.querySelectorAll('.st.cur').forEach(e => e.classList.remove('cur')); st.box.querySelectorAll(`.st[data-step="${cur.step}"]`).forEach(e => e.classList.add('cur')); } },
  autoMount(root){ (root || document).querySelectorAll('.morphbox').forEach(b => this.mount(b, b.dataset.a || 'Detroit 1988', b.dataset.b || 'Berghain 2010')); }
};
window.GridStop = () => { PatternGrid.stop(); Morph.stop(); };
