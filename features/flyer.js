/* ===================================================================
   FLYER — "Make a flyer". The reader types a night and picks one of six
   era styles. Each style is an original design made for this feature in
   the general manner of its period: generated patterns and system fonts
   only, no real club, logo, lettering, mascot or copied flyer. Drawn on
   a canvas in the browser; "Save image" makes the PNG locally.
   =================================================================== */
(() => {
  const KEY = 'fyod-flyer', W = 900, H = 1272, FOOT = 'made at fortyyearsof.dance';
  const F = {
    mono: "'Courier New', Courier, ui-monospace, monospace",
    serif: "Georgia, 'Times New Roman', serif",
    heavy: "Impact, 'Haettenschweiler', 'Arial Black', 'Archivo', sans-serif",
    black: "'Arial Black', 'Archivo', Arial, sans-serif",
    sans: "'Helvetica Neue', Helvetica, Arial, 'Archivo', sans-serif",
    narrow: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif"
  };
  const STYLES = [
    { id: 'p88', year: 1988, name: 'Photocopied cut-and-paste', blurb: 'Letters cut from different sources, a halftone strip, tape and toner on cheap paper.', fact: ['The first Genesis party was put on for under £1,000, £80 of it for 500 flyers.', 'sy5'] },
    { id: 'f91', year: 1991, name: 'Fluorescent fractal', blurb: 'A generated fractal in day-glo colours, glowing heavy type on black.' },
    { id: 'a93', year: 1993, name: 'Airbrushed sci-fi', blurb: 'A soft-sprayed planet over a grid horizon, chrome lettering.', fact: ['As raves became licensed events, the tape pack and the flyer became an industry.', 'r6'] },
    { id: 'm96', year: 1996, name: 'Minimal two-colour techno', blurb: 'Two inks, a few geometric marks, small lower-case type.' },
    { id: 'g00', year: 2000, name: 'Glossy superclub', blurb: 'A deep gradient, light streaks and gloss, big italic type.', fact: ['Godskitchen sold itself on production as much as on the names on the flyer.', 'cb12'] },
    { id: 's15', year: 2015, name: 'Plain sans-serif', blurb: 'One typeface, black and white, the line-up as a list.' }
  ];
  const DEF = { name: 'Your night', venue: 'A room you know', date: 'Saturday, 10pm till late', lineup: 'You\nYour friends\nA guest from out of town', price: '£5 before 11' };
  const LIM = { name: 40, venue: 60, date: 40, lineup: 220, price: 30 };

  /* ---------- a short block-list of slurs ---------- */
  const WORDS = new Set(atob('bmlnZ2VyLG5pZ2dlcnMsbmlnZ2EsbmlnZ2FzLG5pZ2dheixmYWdnb3QsZmFnZ290cyxmYWcsZmFncyx0cmFubnksdHJhbm5pZXMsa2lrZSxraWtlcyxzcGljLHNwaWNzLGNoaW5rLGNoaW5rcyxwYWtpLHBha2lzLHdldGJhY2ssd2V0YmFja3MsZ29vayxnb29rcyxyYWdoZWFkLHJhZ2hlYWRzLHJldGFyZCxyZXRhcmRzLGNvb24sY29vbnMsZ29sbGl3b2csZ29sbGl3b2dzLGtrayxzYW1ibw==').split(','));
  const RUNS = atob('bmlnZ2VyLG5pZ2dhLGZhZ2dvdCxzaWVnaGVpbCxoZWlsaGl0bGVyLHdoaXRlcG93ZXIsd2hpdGVwcmlkZSxnYXN0aGVqZXdzLGtpbGxhbGxqZXdz').split(',');
  function abusive(s){
    if (/\b14\s*88\b/.test(s)) return true;
    const t = s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[0134578@$!|]/g, ch => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's', '!': 'i', '|': 'i' })[ch]);
    if (t.split(/[^a-z]+/).some(w => WORDS.has(w))) return true;
    const run = t.replace(/[^a-z]/g, '').replace(/(.)\1{2,}/g, '$1$1');
    return RUNS.some(r => run.includes(r));
  }

  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = st => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  /* ---------- type helpers ---------- */
  function fit(x, text, font, maxW, big, small){ let s = big; x.font = font(s); while (s > small && x.measureText(text).width > maxW){ s -= 2; x.font = font(s); } return s; }
  function wrap(x, text, maxW){ const out = []; String(text).split('\n').forEach(par => { let line = ''; par.split(/\s+/).filter(Boolean).forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line){ out.push(line); line = w; } else line = t; }); if (line) out.push(line); }); return out; }
  /* title: largest size (big..small) at which it wraps into maxLines lines */
  function block(x, text, font, maxW, big, small, maxLines){ let s = big, ls; for (;;){ x.font = font(s); ls = wrap(x, text, maxW); if ((ls.length <= maxLines && ls.every(l => x.measureText(l).width <= maxW)) || s <= small) break; s -= 3; } return { s, ls }; }
  const lines = d => d.lineup.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8);
  function foot(x, ink, plate){
    x.save(); x.font = `600 19px ${F.sans}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    if (plate){ const w = x.measureText(FOOT).width + 24; x.fillStyle = plate; x.fillRect(W / 2 - w / 2, H - 46, w, 32); }
    x.fillStyle = ink; x.fillText(FOOT, W / 2, H - 23); x.restore();
  }

  /* ---------- 1988: photocopied cut-and-paste ---------- */
  function p88(x, d, r){
    x.fillStyle = '#efece3'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++){ x.fillStyle = `rgba(0,0,0,${.03 + r() * .05})`; x.fillRect(r() * W, 0, 1 + r() * 3, H); }
    // halftone strip from a generated gradient
    x.save(); x.translate(W / 2, 330); x.rotate(-.04 + r() * .02); x.fillStyle = '#111';
    for (let yy = -110; yy <= 110; yy += 14) for (let xx = -430; xx <= 430; xx += 14){ const v = .5 + .5 * Math.sin(xx / 90 + r() * .2) * Math.cos(yy / 60); x.beginPath(); x.arc(xx, yy, 6.6 * v, 0, 7); x.fill(); }
    x.restore();
    // ransom-note title
    const fonts = [F.mono, F.serif, F.heavy, F.black, F.sans], t = d.name.toUpperCase();
    let size = 112, rows;
    for (;;){ rows = [[]]; let w = 0; const lim = W - 120;
      const words = t.split(/\s+/).filter(Boolean);
      words.forEach(word => { const ww = [...word].length * size * .78 + size * .3; if (w + ww > lim && rows[rows.length - 1].length){ rows.push([]); w = 0; } rows[rows.length - 1].push(word); w += ww; });
      if (rows.length <= 3 || size <= 54) break; size -= 8; }
    let y = 120;
    x.textBaseline = 'middle'; x.textAlign = 'center';
    rows.forEach(row => { const chars = [...row.join(' ')], cw = size * .78, x0 = W / 2 - chars.length * cw / 2 + cw / 2;
      chars.forEach((ch, i) => { if (ch === ' ') return; const inv = r() < .45; x.save(); x.translate(x0 + i * cw, y + (r() - .5) * 10); x.rotate((r() - .5) * .22);
        x.fillStyle = inv ? '#111' : '#fbfaf5'; x.fillRect(-cw * .48, -size * .56, cw * .96, size * 1.1); x.strokeStyle = '#111'; x.lineWidth = 2; if (!inv) x.strokeRect(-cw * .48, -size * .56, cw * .96, size * 1.1);
        x.fillStyle = inv ? '#fbfaf5' : '#111'; x.font = `${r() < .5 ? 'bold ' : ''}${Math.round(size * (.72 + r() * .2))}px ${fonts[Math.floor(r() * fonts.length)]}`; x.fillText(ch, 0, size * .04); x.restore(); });
      y += size * 1.2; });
    // pasted scrap with the details
    const top = Math.max(500, y + 40), L = lines(d);
    x.save(); x.translate(W / 2, top); x.rotate(.015 - r() * .03);
    x.font = `bold 38px ${F.mono}`; const lw = Math.min(W - 180, Math.max(360, ...L.map(l => x.measureText(l).width + 60)));
    const bh = 130 + L.length * 50 + 150;
    x.fillStyle = '#fdfcf8'; x.fillRect(-lw / 2, 0, lw, bh); x.strokeStyle = '#222'; x.lineWidth = 2; x.strokeRect(-lw / 2, 0, lw, bh);
    x.fillStyle = 'rgba(210,200,170,.6)'; [[-lw / 2, 0, -.5], [lw / 2, 0, .5]].forEach(([tx, ty, a]) => { x.save(); x.translate(tx, ty); x.rotate(a); x.fillRect(-60, -18, 120, 36); x.restore(); });
    x.fillStyle = '#111'; x.textAlign = 'center'; x.textBaseline = 'top';
    x.font = `bold 26px ${F.mono}`; x.fillText('* * *', 0, 30);
    let yy = 80; x.font = `bold 38px ${F.mono}`; L.forEach(l => { fit(x, l, s => `bold ${s}px ${F.mono}`, lw - 40, 38, 18); x.fillText(l, 0, yy); yy += 50; });
    x.font = `26px ${F.mono}`; yy += 20;
    [d.venue, d.date, d.price].filter(Boolean).forEach(l => { fit(x, l, s => `${s}px ${F.mono}`, lw - 40, 26, 14); x.fillText(l, 0, yy); yy += 38; });
    x.restore();
    // toner speckle
    for (let i = 0; i < 2600; i++){ x.fillStyle = `rgba(0,0,0,${r() * .35})`; x.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
    foot(x, '#111', '#efece3');
  }

  /* ---------- 1991: fluorescent fractal ---------- */
  const fracCache = new Map();
  function fractal(seed){
    if (fracCache.has(seed)) return fracCache.get(seed);
    const w = W / 2, h = H / 2, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), img = x.createImageData(w, h), r = rng(seed);
    const cr = -.8 + r() * .1, ci = .156 + r() * .05, zoom = 1.25 + r() * .4, pal = [[204, 255, 0], [255, 0, 170], [0, 240, 255], [255, 120, 0]], off = Math.floor(r() * 4);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++){
      let zr = (px - w / 2) / (w / 2) * zoom * .72, zi = (py - h / 2) / (h / 2) * zoom, n = 0;
      while (n < 48 && zr * zr + zi * zi < 4){ const t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; n++; }
      const i = (py * w + px) * 4;
      if (n >= 48){ img.data[i] = img.data[i + 1] = img.data[i + 2] = 0; } else { const p = pal[(Math.floor(n / 3) + off) % 4], k = Math.min(1, n / 14); img.data[i] = p[0] * k; img.data[i + 1] = p[1] * k; img.data[i + 2] = p[2] * k; }
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); fracCache.set(seed, c); if (fracCache.size > 4) fracCache.delete(fracCache.keys().next().value); return c;
  }
  function f91(x, d, r, seed){
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.imageSmoothingEnabled = true; x.drawImage(fractal(seed), 0, 0, W, H);
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(.35, 'rgba(0,0,0,.15)'); g.addColorStop(.6, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const T = block(x, d.name.toUpperCase(), s => `${s}px ${F.heavy}`, W - 100, 170, 60, 3); let y = 90 + T.s;
    T.ls.forEach(l => { x.font = `${T.s}px ${F.heavy}`; const gr = x.createLinearGradient(0, y - T.s, 0, y); gr.addColorStop(0, '#ccff00'); gr.addColorStop(.5, '#fff200'); gr.addColorStop(1, '#ff00aa');
      x.save(); x.shadowColor = '#00f0ff'; x.shadowBlur = 34; x.fillStyle = gr; x.fillText(l, W / 2, y); x.restore(); x.lineWidth = 3; x.strokeStyle = '#000'; x.strokeText(l, W / 2, y); y += T.s * .95; });
    const L = lines(d), cols = ['#ccff00', '#ff00aa', '#00f0ff', '#ff7800']; let yy = Math.max(y + 60, H * .52);
    L.forEach((l, i) => { const s = fit(x, l.toUpperCase(), s => `${s}px ${F.heavy}`, W - 120, 64, 26); x.save(); x.shadowColor = cols[i % 4]; x.shadowBlur = 20; x.fillStyle = cols[i % 4]; x.fillText(l.toUpperCase(), W / 2, yy); x.restore(); yy += s * 1.15; });
    x.fillStyle = '#fff'; yy = Math.max(yy + 30, H - 210);
    [d.venue, d.date, d.price].filter(Boolean).forEach(l => { fit(x, l, s => `bold ${s}px ${F.sans}`, W - 120, 32, 16); x.fillText(l, W / 2, yy); yy += 44; });
    foot(x, '#ccff00', 'rgba(0,0,0,.8)');
  }

  /* ---------- 1993: airbrushed sci-fi ---------- */
  function a93(x, d, r){
    const hz = H * .6, sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#040218'); sky.addColorStop(.55, '#2c0c58'); sky.addColorStop(1, '#e0521c'); x.fillStyle = sky; x.fillRect(0, 0, W, hz);
    for (let i = 0; i < 260; i++){ x.fillStyle = `rgba(255,255,255,${r() * .9})`; const s = r() < .9 ? 1.5 : 3; x.fillRect(r() * W, r() * hz * .8, s, s); }
    const px = W * (.62 + r() * .2), py = H * (.2 + r() * .08), pr = 150 + r() * 60, pg = x.createRadialGradient(px - pr * .4, py - pr * .4, pr * .1, px, py, pr);
    pg.addColorStop(0, '#ffe6b0'); pg.addColorStop(.45, '#e07a3a'); pg.addColorStop(.85, '#5a1a50'); pg.addColorStop(1, 'rgba(40,10,60,0)'); x.fillStyle = pg; x.beginPath(); x.arc(px, py, pr, 0, 7); x.fill();
    x.save(); x.translate(px, py); x.rotate(-.35); x.strokeStyle = 'rgba(255,220,180,.55)'; x.lineWidth = 7; x.beginPath(); x.ellipse(0, 0, pr * 1.7, pr * .38, 0, 0, 7); x.stroke(); x.restore();
    const gl = x.createRadialGradient(W / 2, hz, 10, W / 2, hz, W * .7); gl.addColorStop(0, 'rgba(255,160,90,.75)'); gl.addColorStop(1, 'rgba(255,120,60,0)'); x.fillStyle = gl; x.fillRect(0, hz - 300, W, 300);
    const fl = x.createLinearGradient(0, hz, 0, H); fl.addColorStop(0, '#1a0630'); fl.addColorStop(1, '#03010a'); x.fillStyle = fl; x.fillRect(0, hz, W, H - hz);
    x.strokeStyle = 'rgba(255,60,200,.75)'; x.lineWidth = 2;
    for (let i = -14; i <= 14; i++){ x.beginPath(); x.moveTo(W / 2 + i * 12, hz); x.lineTo(W / 2 + i * 150, H); x.stroke(); }
    for (let k = 1; k < 14; k++){ const yy = hz + (H - hz) * Math.pow(k / 13, 2.2); x.globalAlpha = .3 + .7 * k / 13; x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); } x.globalAlpha = 1;
    // chrome title
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const T = block(x, d.name.toUpperCase(), s => `italic ${s}px ${F.heavy}`, W - 110, 150, 56, 3); let y = 80 + T.s;
    T.ls.forEach(l => { x.font = `italic ${T.s}px ${F.heavy}`; const ch = x.createLinearGradient(0, y - T.s, 0, y + 6); ch.addColorStop(0, '#ffffff'); ch.addColorStop(.45, '#8fb2e0'); ch.addColorStop(.5, '#14214a'); ch.addColorStop(.62, '#f2b56b'); ch.addColorStop(1, '#fff8e8');
      x.save(); x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowOffsetY = 8; x.shadowBlur = 14; x.fillStyle = ch; x.fillText(l, W / 2, y); x.restore(); x.lineWidth = 3; x.strokeStyle = '#0b1030'; x.strokeText(l, W / 2, y);
      x.fillStyle = 'rgba(255,255,255,.95)'; const fx = W / 2 + x.measureText(l).width * .38; x.beginPath(); x.moveTo(fx - 26, y - T.s * .78); x.lineTo(fx, y - T.s * .74 - 4); x.lineTo(fx + 26, y - T.s * .78); x.lineTo(fx, y - T.s * .82 + 4); x.fill(); y += T.s; });
    const L = lines(d); let yy = Math.max(y + 50, H * .44);
    L.forEach(l => { const s = fit(x, l, s => `bold ${s}px ${F.sans}`, W - 140, 54, 24); x.save(); x.shadowColor = '#3cc8ff'; x.shadowBlur = 16; x.fillStyle = '#fff'; x.fillText(l, W / 2, yy); x.restore(); yy += s * 1.2; });
    const bx = 90, by = H - 250, bw = W - 180, bh = 170; x.fillStyle = 'rgba(5,5,30,.72)'; x.strokeStyle = 'rgba(120,200,255,.8)'; x.lineWidth = 2; x.beginPath(); x.roundRect ? x.roundRect(bx, by, bw, bh, 22) : x.rect(bx, by, bw, bh); x.fill(); x.stroke();
    x.fillStyle = '#e8f4ff'; let ly = by + 52; [d.venue, d.date, d.price].filter(Boolean).forEach(l => { fit(x, l, s => `bold ${s}px ${F.sans}`, bw - 40, 30, 14); x.fillText(l, W / 2, ly); ly += 44; });
    foot(x, '#bfe6ff', null);
  }

  /* ---------- 1996: minimal two-colour ---------- */
  function m96(x, d, r){
    const pairs = [['#f15a24', '#111111'], ['#d8d8d0', '#161616'], ['#1d3fbb', '#f2f2ee'], ['#111111', '#c8ff00']], [bg, ink] = pairs[Math.floor(r() * pairs.length)];
    x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = ink; x.strokeStyle = ink;
    const cx = W * (.55 + r() * .2), cy = H * (.3 + r() * .1), cr = 190 + r() * 90; x.lineWidth = 14; x.beginPath(); x.arc(cx, cy, cr, 0, 7); x.stroke();
    x.beginPath(); x.arc(cx, cy, cr * .18, 0, 7); x.fill();
    for (let i = 0; i < 22; i++){ const hh = 2 + Math.floor(r() * 3) * 3; x.fillRect(60, 60 + i * 15, 120 + r() * 180, hh); }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (r() < .55) x.fillRect(W - 240 + i * 30, H - 250 + j * 30, 16, 16);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    const T = block(x, d.name.toLowerCase(), s => `bold ${s}px ${F.sans}`, W - 140, 96, 40, 3); let y = H * .58;
    T.ls.forEach(l => { x.font = `bold ${T.s}px ${F.sans}`; x.fillText(l, 70, y); y += T.s * 1.02; });
    x.fillRect(70, y - T.s * .5 + 20, W - 140, 4); y += 30;
    x.font = `22px ${F.mono}`; const L = lines(d).map(s => s.toLowerCase()); wrap(x, L.join(' / '), W - 140).forEach(l => { x.fillText(l, 70, y); y += 32; });
    x.textAlign = 'right'; let yy = 92; [d.date, d.venue, d.price].filter(Boolean).forEach(l => { fit(x, l.toLowerCase(), s => `${s}px ${F.mono}`, W * .45, 22, 12); x.fillText(l.toLowerCase(), W - 60, yy); yy += 32; });
    foot(x, ink, null);
  }

  /* ---------- 2000: glossy superclub ---------- */
  function g00(x, d, r){
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#16052f'); g.addColorStop(.5, '#4a0f8c'); g.addColorStop(1, '#06265e'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++){ const bx = r() * W, by = r() * H, br = 20 + r() * 80, bg = x.createRadialGradient(bx, by, 0, bx, by, br); bg.addColorStop(0, `rgba(255,255,255,${.05 + r() * .12})`); bg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = bg; x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); }
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++){ const y0 = H * (.2 + r() * .6), sg = x.createLinearGradient(0, 0, W, 0); sg.addColorStop(0, 'rgba(0,200,255,0)'); sg.addColorStop(.5, i % 2 ? 'rgba(255,80,220,.8)' : 'rgba(80,220,255,.8)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      x.strokeStyle = sg; x.lineWidth = 2 + r() * 10; x.shadowColor = '#fff'; x.shadowBlur = 18; x.beginPath(); x.moveTo(-50, y0); x.bezierCurveTo(W * .3, y0 - 300 * r(), W * .7, y0 + 300 * r(), W + 50, y0 - 120 + r() * 240); x.stroke(); }
    x.restore();
    const gl = x.createLinearGradient(0, 0, 0, H * .45); gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.beginPath(); x.ellipse(W / 2, 0, W * .8, H * .42, 0, 0, 7); x.fill();
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const T = block(x, d.name, s => `italic 800 ${s}px ${F.sans}`, W - 100, 140, 54, 3); let y = H * .3;
    T.ls.forEach(l => { x.font = `italic 800 ${T.s}px ${F.sans}`; const tg = x.createLinearGradient(0, y - T.s, 0, y); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#9be7ff'); x.save(); x.shadowColor = 'rgba(150,80,255,.9)'; x.shadowBlur = 30; x.fillStyle = tg; x.fillText(l, W / 2, y); x.restore();
      x.save(); x.translate(0, y * 2 + 8); x.scale(1, -1); x.globalAlpha = .16; x.fillStyle = '#9be7ff'; x.fillText(l, W / 2, y); x.restore(); y += T.s * 1.02; });
    const L = lines(d); let yy = Math.max(y + 90, H * .5);
    x.font = `600 22px ${F.sans}`; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('—  WITH  —', W / 2, yy - 20); yy += 40;
    L.forEach(l => { const s = fit(x, l.toUpperCase(), s => `bold ${s}px ${F.sans}`, W - 140, 50, 22); x.fillStyle = '#fff'; x.fillText(l.toUpperCase(), W / 2, yy); yy += s * 1.25; });
    const info = [d.venue, d.date].filter(Boolean).join('  ·  '); fit(x, info, s => `600 ${s}px ${F.sans}`, W - 120, 28, 14); x.fillStyle = '#e8dcff'; x.fillText(info, W / 2, H - 170);
    if (d.price){ x.font = `bold 28px ${F.sans}`; const pw = x.measureText(d.price).width + 60, pg = x.createLinearGradient(0, H - 140, 0, H - 84); pg.addColorStop(0, '#ffffff'); pg.addColorStop(.5, '#c9a8ff'); pg.addColorStop(1, '#6a2bd0'); x.fillStyle = pg; x.beginPath(); x.roundRect ? x.roundRect(W / 2 - pw / 2, H - 140, pw, 54, 27) : x.rect(W / 2 - pw / 2, H - 140, pw, 54); x.fill(); x.fillStyle = '#1a0636'; x.fillText(d.price, W / 2, H - 103); }
    foot(x, 'rgba(255,255,255,.85)', null);
  }

  /* ---------- 2015: plain sans-serif ---------- */
  function s15(x, d, r){
    const dark = r() < .5, bg = dark ? '#0e0e0e' : '#f4f4f1', ink = dark ? '#f4f4f1' : '#0e0e0e'; x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = ink;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    const T = block(x, d.name, s => `bold ${s}px ${F.sans}`, W - 120, 120, 44, 4); let y = 80 + T.s;
    T.ls.forEach(l => { x.font = `bold ${T.s}px ${F.sans}`; x.fillText(l, 60, y); y += T.s * 1.02; });
    y += 50; x.fillRect(60, y - 30, W - 120, 2);
    lines(d).forEach(l => { const s = fit(x, l, s => `${s}px ${F.sans}`, W - 120, 44, 20); x.fillText(l, 60, y + 20); y += s * 1.3; });
    x.fillRect(60, H - 190, W - 120, 2); x.font = `26px ${F.sans}`;
    let yy = H - 145; [d.date, d.venue].filter(Boolean).forEach(l => { fit(x, l, s => `${s}px ${F.sans}`, W * .6, 26, 14); x.fillText(l, 60, yy); yy += 36; });
    if (d.price){ x.textAlign = 'right'; fit(x, d.price, s => `bold ${s}px ${F.sans}`, W * .3, 26, 14); x.fillText(d.price, W - 60, H - 145); }
    foot(x, ink, null);
  }
  const DRAW = { p88, f91, a93, m96, g00, s15 };

  function place(pageEl, sec){
    const kids = [...pageEl.children], blocks = kids.filter(k => k.querySelector && k.querySelector('h3') && !k.matches('h3'));
    const cap = kids.filter(k => k.matches('p.cap')).pop();
    if (blocks.length) blocks[blocks.length - 1].after(sec); else if (cap) cap.before(sec); else pageEl.appendChild(sec);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function build(pageEl, id){
    const saved = load() || {}, st = { ...DEF, style: 'p88', seed: 1, ...saved };
    if (!DRAW[st.style]) st.style = 'p88';
    const uid = 'fl' + Math.random().toString(36).slice(2, 7);
    const sec = document.createElement('section'); sec.className = 'feature feat-flyer'; sec.setAttribute('aria-labelledby', uid + 'h');
    const field = (k, lab, ta) => `<label class="fl-f"><span>${lab}</span>${ta ? `<textarea name="${k}" rows="4" maxlength="${LIM[k]}"></textarea>` : `<input name="${k}" type="text" maxlength="${LIM[k]}" autocomplete="off">`}</label>`;
    sec.innerHTML = `
      <h3 id="${uid}h">Make a flyer</h3>
      <p class="fl-intro">Type in a night of your own, pick a period, and the flyer is drawn in your browser. Nothing you type leaves this page.</p>
      <div class="fl-wrap">
        <div class="fl-form">
          ${field('name', 'Name of the night')}${field('venue', 'Venue')}${field('date', 'Date and time')}${field('lineup', 'Line-up (one name a line)', 1)}${field('price', 'Price')}
          <fieldset class="fl-styles"><legend>Style</legend>${STYLES.map(s => `<label class="fl-st"><input type="radio" name="${uid}s" value="${s.id}"><span><b>${s.year}</b> ${s.name}</span></label>`).join('')}</fieldset>
          <p class="fl-blurb" aria-live="polite"></p>
          <p class="fl-msg" role="alert" hidden></p>
          <div class="fl-btns"><button type="button" class="play fl-save">Save image</button><button type="button" class="fl-new">New pattern</button><button type="button" class="fl-reset">Start again</button></div>
        </div>
        <figure class="fl-fig"><canvas width="${W}" height="${H}" role="img"></canvas><figcaption class="fl-desc"></figcaption></figure>
      </div>
      <p class="cap fl-cap">A simplified illustration made for the book. The six styles are original designs made for this page in the general manner of their period, from generated patterns and the fonts already on your device; they copy no real flyer, club, logo or lettering. Every flyer carries the line "${FOOT}". "Save image" makes the picture on your device; nothing is uploaded.</p>`;
    const $ = s => sec.querySelector(s), cv = $('canvas'), x = cv.getContext('2d'), msg = $('.fl-msg'), saveB = $('.fl-save');
    let bad = false, pending = 0;
    sec.querySelectorAll('.fl-f [name]').forEach(el => { el.value = st[el.name] != null ? st[el.name] : ''; });
    sec.querySelectorAll('.fl-st input').forEach(el => { el.checked = el.value === st.style; });

    function data(){ return { name: st.name.trim() || ' ', venue: st.venue.trim(), date: st.date.trim(), lineup: st.lineup, price: st.price.trim() }; }
    function describe(d, sty){ const L = lines(d); return `Flyer preview, ${sty.year} ${sty.name.toLowerCase()} style: "${d.name.trim()}"` + (d.venue ? ` at ${d.venue}` : '') + (d.date ? `, ${d.date}` : '') + (L.length ? `, with ${L.join(', ')}` : '') + (d.price ? `, ${d.price}` : '') + `. Footer: ${FOOT}.`; }
    function draw(){
      pending = 0; const sty = STYLES.find(s => s.id === st.style), d = data();
      bad = abusive([d.name, d.venue, d.date, d.lineup, d.price].join(' \n '));
      msg.hidden = !bad; msg.textContent = bad ? 'That wording can\'t go on a flyer here. Please change it.' : '';
      saveB.disabled = bad;
      $('.fl-blurb').innerHTML = `<b>${sty.year}: ${esc(sty.name)}.</b> ${esc(sty.blurb)}` + (sty.fact ? ` <span class="fl-fact" data-src="${sty.fact[1]}">From the book: ${esc(sty.fact[0])} <a href="#${sty.fact[1]}">Read it</a></span>` : '');
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
      if (bad){ x.fillStyle = '#777'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = `bold 40px ${F.sans}`; x.textAlign = 'center'; x.fillText('Change the wording to see the flyer', W / 2, H / 2); foot(x, '#fff', null); cv.setAttribute('aria-label', 'No preview: the wording was refused.'); $('.fl-desc').textContent = 'No preview: the wording was refused.'; x.restore(); return; }
      try { DRAW[st.style](x, d, rng(st.seed * 7919 + st.style.charCodeAt(0)), st.seed); } catch (e) {}
      x.restore();
      const desc = describe(d, sty); cv.setAttribute('aria-label', desc); $('.fl-desc').textContent = desc;
    }
    const later = () => { if (!pending) pending = requestAnimationFrame(draw); };
    const keep = () => { const { name, venue, date, lineup, price, style, seed } = st; save({ name, venue, date, lineup, price, style, seed }); };

    sec.addEventListener('input', e => { const t = e.target; if (t.name && t.name in LIM){ st[t.name] = t.value.slice(0, LIM[t.name]); keep(); later(); } else if (t.type === 'radio'){ st.style = t.value; keep(); later(); } });
    sec.addEventListener('change', e => { if (e.target.type === 'radio'){ st.style = e.target.value; keep(); later(); } });
    $('.fl-new').onclick = () => { st.seed = (st.seed % 9973) + 1; keep(); draw(); };
    $('.fl-reset').onclick = () => { Object.assign(st, DEF); sec.querySelectorAll('.fl-f [name]').forEach(el => { el.value = st[el.name]; }); keep(); draw(); };
    saveB.onclick = () => {
      draw(); if (bad) return;
      const nm = (st.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flyer').slice(0, 40) + '-' + st.style + '.png';
      const go = url => { const a = document.createElement('a'); a.href = url; a.download = nm; document.body.appendChild(a); a.click(); a.remove(); };
      try { if (cv.toBlob) cv.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b); go(u); setTimeout(() => URL.revokeObjectURL(u), 4000); }, 'image/png'); else go(cv.toDataURL('image/png')); }
      catch (e) { msg.hidden = false; msg.textContent = 'This browser could not save the picture.'; }
    };
    place(pageEl, sec);
    draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (sec.isConnected) draw(); });
    sec._flyer = { destroy(){ if (pending) cancelAnimationFrame(pending); sec.remove(); } };
    return sec;
  }

  (window.FEATURES = window.FEATURES || []).push({
    name: 'flyer', pages: ['flyers', 'r6', 'sy5'], anchor: null,
    mount(pageEl, id){ this.unmount(pageEl); return build(pageEl, id); },
    unmount(pageEl){ pageEl.querySelectorAll('section.feat-flyer').forEach(s => { if (s._flyer) s._flyer.destroy(); else s.remove(); }); },
    _test: { abusive }
  });
})();
