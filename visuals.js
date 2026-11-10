/* ===================================================================
   VISUALS — a visualiser that changes with the era being played.
   It listens to the book's own sound engine (the era buttons, the
   pattern grids, the mixer) through the engine's analyser, and draws
   what a dance floor of that year would have been looking at:
   liquid light, the mirror ball, lasers and smoke, video feedback,
   rave fractals, the VJ's cut-up grid, the LED pyramid, projection
   mapping, and the dark room with one strobe.
   Players in the dock (YouTube, Spotify and the rest) are other
   sites' frames and cannot be heard by the page, so it does not
   react to them.
   Flashing: the strobe is off until asked for, never faster than
   2.5 flashes a second, and off altogether under reduced motion.
   =================================================================== */
window.Visuals = (() => {
  const ERAS = [
    ['liquid', '1966', 'Liquid light', 'Oil, dye and water between glass, over a projector lamp: the light shows of UFO and the Fillmore.'],
    ['disco', '1977', 'Mirror ball', 'Pin spots on a mirror ball and a floor lit from below: the disco room.'],
    ['laser', '1987', 'Lasers and smoke', 'A green beam scanned into fans and figures through the smoke of an acid house night.'],
    ['scratch', '1989', 'Video feedback', 'A camera pointed at its own monitor, and edits cut to the beat: scratch video and the first rave tapes.'],
    ['rave', '1992', 'Fractals', 'Computer fractals zoomed on a bedsheet screen: the rave visual of the early 1990s.'],
    ['vj', '1997', 'The VJ\'s grid', 'Clips triggered from a keyboard in time with the record, as VJ software made possible.'],
    ['led', '2006', 'The LED pyramid', 'The DJ inside a structure of LED panels, the show built round one image.'],
    ['map', '2011', 'Projection mapping', 'Video fitted to a stack of white cubes so the shape itself seems to move.'],
    ['dark', '2016', 'The dark room', 'Almost nothing: haze, one beam and a strobe. Phones away.']
  ];
  const BY = Object.fromEntries(ERAS.map(e => [e[0], e]));
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* which look goes with which sound: by name first, then by year */
  function eraFor(name){
    const s = String(name || ''); const y = +(s.match(/(19|20)\d\d/) || [0])[0];
    if (/Berghain|Hypnotic|Industrial|Tresor|Birmingham|Schranz|Dub techno|Hard techno|Minimal/i.test(s)) return 'dark';
    if (/Goa|Trance 1993|Acid techno|Gabber/i.test(s)) return 'rave';
    if (/Chicago house|Garage 1992|Deep house|House 1988|Balearic/i.test(s)) return 'disco';
    if (/Electro|Chicago acid|New beat|Detroit/i.test(s)) return 'laser';
    if (/Peak-time|Progressive/i.test(s)) return 'led';
    if (!y) return 'laser';
    return y < 1975 ? 'liquid' : y < 1984 ? 'disco' : y < 1989 ? 'laser' : y < 1991 ? 'scratch' : y < 1996 ? 'rave' : y < 2005 ? 'vj' : y < 2010 ? 'led' : y < 2016 ? 'map' : 'dark';
  }
  const S = { era: 'liquid', auto: true, strobe: false, heard: '', lastFlash: 0, t0: performance.now(), beat: 0, bassAvg: 0, raf: 0, mounts: new Set() };
  const A = { bass: 0, mid: 0, high: 0, level: 0, beat: 0, hit: false, snare: 0, hat: 0, wave: null, freq: null, live: false };
  let fbuf = null, wbuf = null, midAvg = 0, hiAvg = 0;
  function listen(now){
    const ch = (typeof AudioCore !== 'undefined' && AudioCore.peek) ? AudioCore.peek() : null; const an = ch && ch.analyser;
    A.hit = false;
    if (!an){ idle(now); return; }
    if (!fbuf || fbuf.length !== an.frequencyBinCount){ fbuf = new Uint8Array(an.frequencyBinCount); wbuf = new Uint8Array(an.fftSize); }
    an.getByteFrequencyData(fbuf); an.getByteTimeDomainData(wbuf); A.freq = fbuf; A.wave = wbuf;
    const hz = ch.c.sampleRate / an.fftSize; const band = (lo, hi) => { let s = 0, n = 0; for (let i = Math.max(1, Math.floor(lo / hz)); i <= Math.min(fbuf.length - 1, Math.ceil(hi / hz)); i++){ s += fbuf[i]; n++; } return n ? s / n / 255 : 0; };
    const bass = band(35, 140), mid = band(300, 2500), high = band(5000, 14000); const level = (bass + mid + high) / 3;
    A.live = level > 0.012; if (!A.live){ idle(now); return; }
    A.bass += (bass - A.bass) * 0.5; A.mid += (mid - A.mid) * 0.4; A.high += (high - A.high) * 0.4; A.level = level;
    S.bassAvg += (bass - S.bassAvg) * 0.05; midAvg += (mid - midAvg) * 0.05; hiAvg += (high - hiAvg) * 0.05;
    if (bass > S.bassAvg * 1.25 + 0.05 && now - S.beat > 180){ S.beat = now; A.hit = true; }
    A.beat = Math.max(0, 1 - (now - S.beat) / 320);
    A.snare = Math.max(A.snare * 0.86, mid > midAvg * 1.3 + 0.04 ? 1 : 0); A.hat = Math.max(A.hat * 0.8, high > hiAvg * 1.3 + 0.03 ? 1 : 0);
  }
  /* nothing playing: a slow pulse so the picture is not dead */
  function idle(now){ const t = now / 1000; A.live = false; A.wave = null; A.freq = null; A.bass = 0.18 + 0.1 * Math.sin(t * 1.3); A.mid = 0.14 + 0.08 * Math.sin(t * 0.9 + 1); A.high = 0.1 + 0.06 * Math.sin(t * 1.7 + 2); A.level = 0.14; const ph = (t * 0.55) % 1; A.beat = Math.max(0, 1 - ph * 3) * 0.5; A.hit = ph < 0.03 && now - S.beat > 900; if (A.hit) S.beat = now; A.snare *= 0.9; A.hat *= 0.85; }
  const hsl = (h, s, l, a = 1) => `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

  /* ---------- the nine looks ---------- */
  const DRAW = {
    liquid(g, W, H, t){
      g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(8,4,14,0.22)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      const n = 9; for (let i = 0; i < n; i++){ const a = t * (0.07 + i * 0.011) + i * 2.1; const x = W / 2 + Math.cos(a * 1.3 + i) * W * 0.34 * Math.sin(a * 0.7 + i * 0.4), y = H / 2 + Math.sin(a * 1.1 + i * 1.7) * H * 0.36;
        const r = H * (0.16 + 0.08 * Math.sin(a * 2 + i) + A.bass * 0.22 + (i % 3 === 0 ? A.beat * 0.06 : 0)); const gr = g.createRadialGradient(x, y, r * 0.1, x, y, r); const hue = [320, 28, 190, 275, 48, 350, 160, 300, 20][i] + t * 6;
        gr.addColorStop(0, hsl(hue, 95, 60, 0.5)); gr.addColorStop(0.6, hsl(hue + 30, 90, 45, 0.22)); gr.addColorStop(1, hsl(hue + 60, 90, 30, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      g.globalCompositeOperation = 'source-over';
    },
    disco(g, W, H, t){
      g.fillStyle = 'rgba(6,5,12,0.3)'; g.fillRect(0, 0, W, H);
      /* the lit floor */
      const cols = 12, rows = 4, fy = H * 0.66, fh = H - fy; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){ const p = (r + 1) / rows; const x0 = W / 2 + (c - cols / 2) * (W / cols) * (0.55 + p * 0.6), x1 = W / 2 + (c + 1 - cols / 2) * (W / cols) * (0.55 + p * 0.6); const y0 = fy + fh * (r / rows) ** 1.4, y1 = fy + fh * ((r + 1) / rows) ** 1.4;
        const v = A.freq ? A.freq[4 + ((c * 7 + r * 13) % 60)] / 255 : 0.3 + 0.3 * Math.sin(t * 2 + c + r * 2); const on = (c + r + Math.floor(t * 2 + (A.hit ? 1 : 0))) % 3 === 0; g.fillStyle = hsl([350, 45, 200, 280][(c + r * 2) % 4], 90, 18 + (on ? 34 : 8) * (0.4 + v), 0.9); g.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2); }
      /* the ball and its spots */
      const bx = W / 2, by = H * 0.2, br = H * 0.09; const spin = t * 0.5; g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 70; i++){ const lon = (i * 2.399) + spin, lat = Math.asin(((i * 37) % 70) / 35 - 1); const dx = Math.cos(lat) * Math.sin(lon), dy = Math.sin(lat), dz = Math.cos(lat) * Math.cos(lon); if (dz < -0.2) continue; const x = bx + dx * W * 0.7, y = by + (dy * 0.9 + 0.55) * H * 0.75; const r = 3 + 5 * (1 + dz) + A.beat * 4; g.fillStyle = hsl(40 + i * 3, 30, 85, 0.16 + 0.3 * A.high + 0.2 * A.beat); g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, 7); g.fill(); }
      g.globalCompositeOperation = 'source-over'; const gr = g.createRadialGradient(bx - br * 0.3, by - br * 0.3, 1, bx, by, br); gr.addColorStop(0, '#f4f4ff'); gr.addColorStop(1, '#55586e'); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill();
      g.strokeStyle = 'rgba(20,20,30,0.55)'; g.lineWidth = 1; for (let i = -3; i <= 3; i++){ g.beginPath(); g.ellipse(bx, by + i * br / 4, Math.sqrt(Math.max(0, 1 - (i / 4) ** 2)) * br, br * 0.08, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(bx, by, Math.abs(Math.sin(spin + i * 0.45)) * br, br, 0, 0, 7); g.stroke(); }
      g.strokeStyle = '#444'; g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx, by - br); g.stroke();
    },
    laser(g, W, H, t){
      g.fillStyle = 'rgba(0,6,3,0.2)'; g.fillRect(0, 0, W, H);
      const hz = g.createLinearGradient(0, H, 0, 0); hz.addColorStop(0, `rgba(40,70,50,${0.1 + A.mid * 0.15})`); hz.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hz; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter'; const ox = W / 2, oy = H * 0.04; const fans = 9; const sweep = Math.sin(t * 0.8) * 0.5;
      for (let i = 0; i < fans; i++){ const a = Math.PI / 2 + (i - (fans - 1) / 2) * (0.1 + A.bass * 0.16) + sweep * (i % 2 ? 1 : -1) * 0.35; const len = H * 1.3; g.strokeStyle = `rgba(60,255,120,${0.2 + 0.5 * A.beat + 0.2 * A.high})`; g.lineWidth = 1.5 + A.beat * 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * len, oy + Math.sin(a) * len); g.stroke(); }
      /* the scanned figure: the waveform against itself */
      g.strokeStyle = 'rgba(120,255,160,0.9)'; g.lineWidth = 2; g.beginPath(); const cx = W / 2, cy = H * 0.58, R = H * 0.26; const N = 220;
      for (let i = 0; i <= N; i++){ let x, y; if (A.wave){ const a = (A.wave[i * 4] - 128) / 128, b = (A.wave[i * 4 + 96] - 128) / 128; x = cx + a * R * 2.2; y = cy + b * R * 2.2; } else { const p = i / N * Math.PI * 2; x = cx + Math.sin(p * 3 + t) * R; y = cy + Math.sin(p * 2 + t * 0.7) * R * 0.8; } i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.globalCompositeOperation = 'source-over';
    },
    scratch(g, W, H, t, cv){
      /* video feedback: the last frame, shrunk and turned, under the new one */
      g.save(); g.globalAlpha = 0.93; g.translate(W / 2, H / 2); g.rotate(0.012 + A.mid * 0.03 * Math.sin(t)); const s = 0.965 - A.beat * 0.03; g.scale(s, s); g.drawImage(cv, -W / 2, -H / 2, W, H); g.restore();
      g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(0, 0, W, H);
      const bars = 7; const cols = ['#ffffff', '#ffe600', '#00e5e5', '#00d000', '#e000e0', '#e00000', '#0020e0']; const off = Math.floor(t * 3) % bars;
      if (A.hit || Math.floor(t * 4) % 4 === 0){ for (let i = 0; i < bars; i++){ g.fillStyle = cols[(i + off) % bars]; g.globalAlpha = 0.5 + 0.4 * A.beat; g.fillRect(W * 0.3 + i * W * 0.4 / bars, H * 0.38, W * 0.4 / bars + 1, H * 0.24); } g.globalAlpha = 1; }
      g.strokeStyle = hsl(t * 80, 100, 60, 0.9); g.lineWidth = 3; const n = 3 + Math.floor(t / 2) % 4; g.beginPath(); for (let i = 0; i <= n; i++){ const a = i / n * Math.PI * 2 + t; const r = H * (0.12 + A.bass * 0.3); const x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      /* tracking lines */
      g.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = (t * 60) % 6; y < H; y += 6) g.fillRect(0, y, W, 1);
    },
    rave(g, W, H, t, cv, st){
      const w = 160, h = 90; if (!st.img){ st.off = document.createElement('canvas'); st.off.width = w; st.off.height = h; st.octx = st.off.getContext('2d'); st.img = st.octx.createImageData(w, h); }
      const d = st.img.data; const cr = -0.74 + 0.11 * Math.cos(t * 0.21) + A.bass * 0.05, ci = 0.14 + 0.11 * Math.sin(t * 0.17) + A.mid * 0.04; const zoom = 1.25 - 0.35 * Math.sin(t * 0.11); const shift = t * 40 + A.beat * 40; const IT = 26;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ let zr = (x - w / 2) / (h / 2) * zoom, zi = (y - h / 2) / (h / 2) * zoom; let i = 0; for (; i < IT; i++){ const r2 = zr * zr, i2 = zi * zi; if (r2 + i2 > 4) break; zi = 2 * zr * zi + ci; zr = r2 - i2 + cr; }
        const p = (y * w + x) * 4; if (i === IT){ d[p] = 0; d[p + 1] = 0; d[p + 2] = 0; } else { const hh = (i * 14 + shift) % 360; const c = 1 - Math.abs((hh / 60) % 2 - 1); const [r, gg, b] = hh < 60 ? [1, c, 0] : hh < 120 ? [c, 1, 0] : hh < 180 ? [0, 1, c] : hh < 240 ? [0, c, 1] : hh < 300 ? [c, 0, 1] : [1, 0, c]; const v = 90 + 165 * (i / IT); d[p] = r * v; d[p + 1] = gg * v; d[p + 2] = b * v; } d[p + 3] = 255; }
      st.octx.putImageData(st.img, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(st.off, 0, 0, W, H);
    },
    vj(g, W, H, t, cv, st){
      g.fillStyle = '#050508'; g.fillRect(0, 0, W, H); const C = 4, R = 3; st.cells = st.cells || Array.from({ length: C * R }, (_, i) => ({ at: -9, kind: i % 6, hue: (i * 47) % 360 }));
      const fire = row => { const c = st.cells[row * C + Math.floor(Math.random() * C)]; c.at = t; c.kind = Math.floor(Math.random() * 6); c.hue = Math.random() * 360; };
      if (A.hit) fire(0); if (A.snare > 0.95) fire(1); if (A.hat > 0.95 && Math.random() < 0.5) fire(2);
      const cw = W / C, chh = H / R; st.cells.forEach((c, i) => { const x = (i % C) * cw, y = Math.floor(i / C) * chh; const age = t - c.at; const k = Math.max(0, 1 - age / 0.9); g.save(); g.beginPath(); g.rect(x + 3, y + 3, cw - 6, chh - 6); g.clip(); g.fillStyle = hsl(c.hue, 70, 8 + 30 * k); g.fillRect(x, y, cw, chh); g.strokeStyle = g.fillStyle = hsl(c.hue + 160, 90, 55 + 25 * k, 0.35 + 0.65 * k); g.lineWidth = 3; const cx = x + cw / 2, cy = y + chh / 2, ph = age * 6;
        if (c.kind === 0){ for (let j = -1; j < 8; j++) g.fillRect(x + ((j * cw / 6 + ph * 30) % (cw + cw / 6)), y, cw / 12, chh); }
        else if (c.kind === 1){ for (let j = 0; j < 5; j++){ g.beginPath(); g.arc(cx, cy, ((j * 22 + ph * 26) % 110) * (chh / 180), 0, 7); g.stroke(); } }
        else if (c.kind === 2){ const q = chh / 5; for (let a = 0; a < 6; a++) for (let b = 0; b < 8; b++) if ((a + b + Math.floor(ph)) % 2) g.fillRect(x + b * q, y + a * q, q, q); }
        else if (c.kind === 3){ g.beginPath(); for (let j = 0; j <= 40; j++){ const v = A.wave ? (A.wave[j * 20] - 128) / 128 : Math.sin(j * 0.5 + ph); const px = x + j / 40 * cw, py = cy + v * chh * 0.4; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
        else if (c.kind === 4){ g.translate(cx, cy); g.rotate(ph * 0.6); g.strokeRect(-chh * 0.25, -chh * 0.25, chh * 0.5, chh * 0.5); g.rotate(0.8); g.strokeRect(-chh * 0.15, -chh * 0.15, chh * 0.3, chh * 0.3); }
        else { for (let j = 0; j < 9; j++) g.fillRect(x + (j / 9) * cw, y + chh, cw / 11, -chh * (A.freq ? A.freq[6 + j * 9] / 255 : 0.3 + 0.3 * Math.sin(ph + j))); }
        g.restore(); });
    },
    led(g, W, H, t){
      g.fillStyle = '#020204'; g.fillRect(0, 0, W, H); const px = Math.max(8, Math.round(W / 64)); const cols = Math.floor(W / px), rows = Math.floor(H / px); const apexX = cols / 2, top = rows * 0.08, base = rows * 0.92; const chev = (t * 10) % 12;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++){ const f = (y - top) / (base - top); if (f < 0 || f > 1) continue; const half = f * cols * 0.42; const dx = Math.abs(x - apexX); if (dx > half) continue;
        const band = Math.min(63, Math.floor(dx / (cols * 0.42) * 48) + 3); const amp = A.freq ? A.freq[band] / 255 : 0.35 + 0.3 * Math.sin(t * 2 + dx * 0.3); const colH = (1 - f) < amp; const ch = ((y + dx * 0.9 + chev) % 12) < (2 + A.beat * 4);
        const l = (colH ? 46 : 6) + (ch ? 26 : 0) + A.beat * 10; g.fillStyle = hsl(ch ? 20 : 205 + f * 80 + t * 12, 95, Math.min(72, l)); g.fillRect(x * px + 1, y * px + 1, px - 2, px - 2); }
      /* the booth */
      g.fillStyle = '#000'; g.fillRect((apexX - 3) * px, (base - 7) * px, 6 * px, 5 * px);
    },
    map(g, W, H, t){
      g.fillStyle = '#04040a'; g.fillRect(0, 0, W, H); const u = H / 9; const ox = W / 2, oy = H * 0.86; const iso = (x, y, z) => [ox + (x - y) * u * 0.866, oy - (x + y) * u * 0.5 - z * u];
      const cubes = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [2, 0, 0], [0, 2, 0], [1, 1, 0], [3, 0, 0], [0, 3, 0], [2, 1, 0], [1, 2, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [2, 0, 1], [0, 2, 1], [1, 1, 1], [0, 0, 2], [1, 0, 2], [0, 1, 2], [0, 0, 3], [-1, 0, 0], [0, -1, 0], [-1, 1, 0], [1, -1, 0], [-1, 0, 1], [0, -1, 1]].sort((a, b) => (a[0] + a[1] - a[2]) - (b[0] + b[1] - b[2])).reverse();
      const sweep = (t * 1.6) % 8 - 2; const face = (pts, shade, key) => { const lit = 0.5 + 0.5 * Math.sin(key * 1.7 - t * 3) ; const wave = Math.max(0, 1 - Math.abs(key - sweep) * 0.9); g.fillStyle = hsl(190 + key * 18 + t * 10, 80, Math.min(78, shade * (10 + 26 * lit * (0.4 + A.mid) + 46 * wave + 24 * A.beat))); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.stroke(); };
      cubes.forEach(([x, y, z]) => { const k = x + y + z; face([iso(x, y, z + 1), iso(x + 1, y, z + 1), iso(x + 1, y + 1, z + 1), iso(x, y + 1, z + 1)], 1, k + 0.6); face([iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, z + 1), iso(x + 1, y, z + 1)], 0.62, k); face([iso(x, y + 1, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, z + 1), iso(x, y + 1, z + 1)], 0.38, k + 0.3); });
    },
    dark(g, W, H, t, cv, st, now){
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, W, H); const hz = g.createRadialGradient(W / 2, H * 1.1, 10, W / 2, H * 1.1, H * 1.1); hz.addColorStop(0, `rgba(70,74,90,${0.06 + A.bass * 0.14})`); hz.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hz; g.fillRect(0, 0, W, H);
      const a = Math.PI / 2 + Math.sin(t * 0.3) * 0.7; g.save(); g.translate(W * 0.5, -H * 0.05); g.rotate(a - Math.PI / 2); const bm = g.createLinearGradient(0, 0, 0, H * 1.3); bm.addColorStop(0, `rgba(230,235,255,${0.1 + A.high * 0.25})`); bm.addColorStop(1, 'rgba(230,235,255,0)'); g.fillStyle = bm; g.beginPath(); g.moveTo(-4, 0); g.lineTo(4, 0); g.lineTo(H * 0.09, H * 1.3); g.lineTo(-H * 0.09, H * 1.3); g.closePath(); g.fill(); g.restore();
      if (A.hit && A.live){ if (S.strobe && !reduce() && now - S.lastFlash > 400){ S.lastFlash = now; st.flash = 1; } else st.glow = 1; }
      if (st.flash > 0){ g.fillStyle = `rgba(255,255,255,${st.flash * 0.85})`; g.fillRect(0, 0, W, H); st.flash -= 0.34; }
      if (st.glow > 0){ g.fillStyle = `rgba(200,205,230,${st.glow * 0.07})`; g.fillRect(0, 0, W, H); st.glow -= 0.08; }
    }
  };

  /* ---------- a mounted canvas ---------- */
  function mount(el){
    if (!el || el.dataset.vis) return; el.dataset.vis = 1; const fixed = el.dataset.era || '';
    el.innerHTML = `<div class="vis-stage"><canvas class="vis-cv" width="960" height="540" role="img" aria-label="Visualiser"></canvas><div class="vis-tag"></div></div>
      <div class="vis-eras" role="group" aria-label="Era">${fixed ? '' : '<button class="sm on" data-era="auto">Follow the music</button>'}${ERAS.map(e => `<button class="sm" data-era="${e[0]}" title="${e[3].replace(/"/g, '&quot;')}">${e[1]} · ${e[2]}</button>`).join('')}</div>
      <div class="row vis-ctl"><select class="vis-sel" aria-label="Sound to play"></select><button class="play vis-play">Play 8 bars</button><button class="sm vis-stop">Stop</button><label class="vis-str"><input type="checkbox" class="vis-strobe"> strobe</label><button class="sm vis-full">Full screen</button></div>
      <p class="cap vis-cap"></p>`;
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'); const m = { el, cv, g, st: {}, era: fixed || S.era, auto: !fixed, last: '' }; S.mounts.add(m);
    const sel = el.querySelector('.vis-sel'); const yr = n => +(n.match(/(19|20)\d\d/) || [0])[0]; let names = 'Electro 1983|Chicago house 1986|Chicago acid 1987|Balearic 1987|New beat 1988|House 1988|Detroit 1988|Deep house 1990|UK bleep 1990|UK rave 1991|Tresor 1992|Garage 1992|Trance 1993|Gabber 1993|Ambient techno 1993|Jungle 1993|Jungle 1994|Acid techno 1994|Progressive 1994|Trance 1995|Birmingham 1995|Dub techno 1995|Goa 1995|Happy hardcore 1995|Atmospheric 1995|Hard trance 1996|Jump-up 1996|Tech-house 1997|French touch 1997|UK garage 1998|Drum & bass 1998|Trance 1999|Neurofunk 1999|Liquid 2002|Schranz 2002|Minimal 2004|Berghain 2010|Hypnotic 2015|Peak-time 2017|Industrial 2018|Hard techno 2023'.split('|').filter(n => typeof PRESET === 'function' && PRESET(n)); if (!names.length && typeof GENRE_NAMES !== 'undefined') names = GENRE_NAMES.slice(); names.sort((a, b) => yr(a) - yr(b)); sel.innerHTML = names.map(n => `<option value="${n.replace(/&/g, '&amp;')}">${n.replace(/&/g, '&amp;')}</option>`).join(''); if (names.includes('Detroit 1988')) sel.value = 'Detroit 1988'; if (fixed){ const pick = names.find(n => eraFor(n) === fixed); if (pick) sel.value = pick; }
    el.querySelector('.vis-play').onclick = () => { if (typeof playGenre === 'function') playGenre(sel.value, 8, el.querySelector('.vis-play')); };
    el.querySelector('.vis-stop').onclick = () => { if (typeof stopAll === 'function') stopAll(); };
    el.querySelector('.vis-strobe').onchange = e => { S.strobe = e.target.checked; sync(); };
    el.querySelector('.vis-full').onclick = () => { const st = el.querySelector('.vis-stage'); if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen().catch(() => {}); };
    el.querySelectorAll('.vis-eras button').forEach(b => b.onclick = () => { if (b.dataset.era === 'auto'){ m.auto = true; } else { m.auto = false; m.era = b.dataset.era; m.st = {}; } paint(m); });
    paint(m); start();
  }
  function sync(){ S.mounts.forEach(m => { const cb = m.el.querySelector('.vis-strobe'); if (cb) cb.checked = S.strobe; }); }
  function paint(m){ m.el.querySelectorAll('.vis-eras button').forEach(b => b.classList.toggle('on', m.auto ? b.dataset.era === 'auto' : b.dataset.era === m.era)); const e = BY[m.era]; m.el.querySelector('.vis-tag').textContent = `${e[1]} · ${e[2]}`; m.el.querySelector('.vis-cap').textContent = e[3] + (m.auto && S.heard ? ` Chosen for ${S.heard}.` : '') + (reduce() ? ' Reduced motion is on, so it moves slowly and never flashes.' : ''); }
  function heard(name){ S.heard = name; const e = eraFor(name); S.era = e; S.mounts.forEach(m => { if (m.auto && m.era !== e){ m.era = e; m.st = {}; } if (m.auto) paint(m); }); }
  function frame(now){
    S.raf = 0; let any = false; listen(now);
    /* the mixer: follow the louder deck */
    try { if (typeof Mixer !== 'undefined' && Mixer.playing && Mixer.decks){ const d = Mixer.xf > 0 ? Mixer.decks.B : Mixer.decks.A; const nm = d && d.playing ? d.genre : ((Mixer.decks.A.playing && Mixer.decks.A.genre) || (Mixer.decks.B.playing && Mixer.decks.B.genre)); if (nm && nm !== S.heard) heard(nm); } } catch (e) {}
    const slow = reduce() ? 0.3 : 1; const t = (now - S.t0) / 1000 * slow;
    S.mounts.forEach(m => { if (!m.el.isConnected){ S.mounts.delete(m); return; } if (!m.cv.offsetParent && !document.fullscreenElement) return; any = true; const W = m.cv.width, H = m.cv.height; try { DRAW[m.era](m.g, W, H, t, m.cv, m.st, now); } catch (e) {} });
    if (any) S.raf = requestAnimationFrame(frame);
  }
  function start(){ if (!S.raf) S.raf = requestAnimationFrame(frame); }
  function autoMount(root){ (root || document).querySelectorAll('.vis-mount').forEach(mount); start(); }
  /* hear which sound was asked for */
  if (typeof window.playGenre === 'function'){ const pg = window.playGenre; window.playGenre = function(name){ try { heard(name); } catch (e) {} return pg.apply(this, arguments); }; }
  window.PageHooks = window.PageHooks || {}; const prev = window.PageHooks.visuals;
  window.PageHooks.visuals = () => { if (prev) prev(); autoMount(document.querySelector('.page[data-page="visuals"]')); const q = (location.hash.split('?')[1] || '').match(/era=([a-z]+)/); if (q && BY[q[1]]) S.mounts.forEach(m => { m.auto = false; m.era = q[1]; m.st = {}; paint(m); }); };
  window.addEventListener('hashchange', () => setTimeout(() => { autoMount(); }, 400));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  return { ERAS, eraFor, mount, autoMount, heard, state: S, audio: () => { if (!S.raf) listen(performance.now()); return A; } };
})();
