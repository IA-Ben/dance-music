/* ===================================================================
   HISTORY — data, generated illustrations, link chips, era demos
   =================================================================== */
const LINK = {
  yt: q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q),
  sp: q => 'https://open.spotify.com/search/' + encodeURIComponent(q),
  dg: q => 'https://www.discogs.com/search/?q=' + encodeURIComponent(q),
  bc: q => 'https://bandcamp.com/search?q=' + encodeURIComponent(q),
  bp: q => 'https://www.beatport.com/search?q=' + encodeURIComponent(q),
  sc: q => 'https://soundcloud.com/search?q=' + encodeURIComponent(q),
  g:  q => 'https://www.google.com/search?q=' + encodeURIComponent(q)
};
const LINK_LABEL = { yt: 'watch', sp: 'listen', dg: 'discogs', g: 'search', bc: 'Bandcamp', bp: 'Beatport', sc: 'SoundCloud' };
function chipsInto(container, items){
  items.forEach(([type, label, q]) => { const a = document.createElement('a'); a.className = 'chip ' + type; a.target = '_blank'; a.rel = 'noopener'; a.href = LINK[type](q || label); a.dataset.q = q || label; a.innerHTML = `<i></i><span>${label}</span><small style="color:var(--muted)">· ${LINK_LABEL[type]}</small>`; container.appendChild(a); });
  if (window.SpotifyEmbed) setTimeout(() => SpotifyEmbed.wire(container.closest('.page') || document), 0);
}
/* <div class="chips" data-chips="yt|Title|query;;sp|Title|query"> */
function renderChipBlocks(){
  document.querySelectorAll('[data-chips]').forEach(div => { if (div.dataset.done) return; div.dataset.done = 1; chipsInto(div, div.dataset.chips.split(';;').map(s => s.split('|'))); });
}
/* <button class="play era-btn" data-genre="Detroit 1988" data-bars="2"> */
function wireEraButtons(){
  document.querySelectorAll('.era-btn').forEach(b => { if (b.dataset.done) return; b.dataset.done = 1; b.addEventListener('click', () => playGenre(b.dataset.genre, +(b.dataset.bars || 2), b)); });
  if (typeof PatternGrid !== 'undefined') PatternGrid.autoMount();
  if (typeof Morph !== 'undefined') Morph.autoMount();
}

/* ---------- Master timeline ---------- */
const TL = [
  [1974, 'EU', 'Kraftwerk — Autobahn', 'h1', 'Düsseldorf. Machine music becomes pop; the Belleville Three hear it on Detroit radio.'],
  [1977, 'EU', 'I Feel Love', 'h1', 'Moroder sequences a dance record on a Moog, all but the kick and the vocal: the machine groove techno inherits.'],
  [1980, 'EU', 'Roland TR-808', 'h1', 'Followed by the TB-303 (1981) and the MIDI-equipped TR-909 (1983). All three flop, then get cheap.'],
  [1982, 'US', 'Planet Rock', 'h1', 'Bambaataa builds electro on Kraftwerk; Detroit is listening.'],
  [1983, 'US', 'Cybotron — Clear', 'h1', 'Juan Atkins and Rick Davis: the first Detroit record that sounds like what followed.'],
  [1985, 'US', 'Model 500 — No UFO\'s', 'h2', 'Atkins\'s Metroplex label; the first record most people call techno.'],
  [1987, 'US', 'Strings of Life · Nude Photo', 'h2', 'Rhythim Is Rhythim on Transmat; Derrick May\'s year.'],
  [1988, 'US', 'The Music Institute · "Techno!"', 'h2', '1315 Broadway opens in May; Neil Rushton\'s compilation gives the genre its name.'],
  [1988, 'UK', 'RIP at Clink Street', 'ldn', 'Mr. C and Eddie Richards resident every weekend in a Southwark warehouse: the dark twin of Shoom, where London heard Detroit.'],
  [1988, 'UK', 'Kool Kat · Inner City', 'h3', 'Birmingham puts Detroit in the UK charts and on its shelves.'],
  [1988, 'DE', 'UFO opens', 'h4', 'West Berlin\'s first acid/techno basement; Hegemann, Dr. Motte, Tanith.'],
  [1989, 'DE', 'Love Parade · the Wall falls', 'h4', '1 July: 150 people behind a truck on the Ku\'damm. 9 November: East Berlin empties out.'],
  [1989, 'UK', 'Warp Records · bleep', 'h3', 'Sheffield: Detroit minimalism over sound-system sub-bass.'],
  [1990, 'US', 'Underground Resistance · Plus 8', 'h2', 'Mad Mike and Jeff Mills go militant; Hawtin and Acquaviva start Plus 8 in Windsor.'],
  [1990, 'EU', 'Energy Flash (R&S)', 'h5', 'Ghent: Beltram\'s record defines the rave-techno hinge.'],
  [1991, 'DE', 'Tresor opens', 'h4', '13 March, the Wertheim vault. Tresor Records in October: the Detroit–Berlin axis.'],
  [1991, 'UK', 'Lost · the Orbit', 'h3', 'London\'s and Yorkshire\'s purist techno rooms open the same year.'],
  [1992, 'UK', 'Castlemorton', 'h3', 'A week-long free festival with Spiral Tribe among the sound systems; the Criminal Justice Act follows in 1994.'],
  [1993, 'DE', 'Basic Channel · E-Werk', 'h4', 'Ernestus and von Oswald define dub techno; E-Werk opens in the old substation.'],
  [1993, 'UK', 'Downwards · House of God', 'h3', 'Birmingham gets hard: Regis, Surgeon.'],
  [1994, 'EU', 'Time Warp · Sónar · the CJA', 'h12', 'Mannheim and Barcelona start; Britain criminalises "repetitive beats".'],
  [1994, 'US', 'Minimal Nation', 'h2', 'Robert Hood\'s Axis album: the blueprint for minimal techno.'],
  [1995, 'UK', 'The End opens', 'ldn', 'December, 18 West Central Street: Mr. C and Layo Paskin\'s club; booth on the floor, sound before décor. Closed 24 January 2009.'],
  [1995, 'EU', 'Jeff Mills — Liquid Room, Tokyo', 'h13', '28 October. Released the next year to wide acclaim.'],
  [1996, 'EU', 'Drumcode founded', 'h5', 'Adam Beyer, Stockholm.'],
  [1997, 'EU', 'Awakenings', 'h12', '30 March, the Gashouder, Amsterdam.'],
  [1998, 'DE', 'Ostgut · Kompakt', 'h6', 'The club that becomes Berghain; the Cologne label that softens minimal.'],
  [1999, 'UK', 'fabric opens · Decks, EFX & 909', 'h3', 'Farringdon in October; Hawtin\'s 909-in-the-booth mix the same year.'],
  [2000, 'US', 'DEMF / Movement', 'h12', 'Carl Craig\'s Detroit Electronic Music Festival, Hart Plaza, free.'],
  [1999, 'IB', 'Cocoon at Amnesia', 'h7', 'Sven Väth\'s night begins with four parties, then runs on Mondays at Amnesia until 2017.'],
  [2001, 'IB', 'Carl Cox at Space', 'h7', 'Every summer from 2001 to 2016: Thursdays at first, Tuesdays by the end.'],
  [2001, 'EU', 'Ableton Live · DE9', 'h6', 'The laptop arrives; Hawtin mixes hundreds of loops.'],
  [2003, 'DE', 'Villalobos — Alcachofa', 'h6', 'Minimal\'s high-water mark. Ostgut closes in January.'],
  [2004, 'DE', 'Berghain opens', 'h6', 'Panorama Bar on 15 October, the main floor at the end of the year; Funktion-One from 2005.'],
  [2005, 'DE', 'Ostgut Ton', 'h8', 'The label that defines the next decade.'],
  [2010, 'UK', 'Boiler Room', 'h8', 'A webcam taped to a wall in east London; the format of the decade.'],
  [2012, 'IB', 'ENTER. at Space', 'h7', 'Hawtin\'s minimal laboratory on the island, 2012–15.'],
  [2013, 'EU', 'Dekmantel Festival', 'h12', 'Amsterdamse Bos; the taste-making decade.'],
  [2014, 'EU', 'Bassiani · трип', 'h8', 'Tbilisi\'s club under the Dinamo stadium; Nina Kraviz\'s label.'],
  [2016, 'IB', 'Cox\'s last Space set', 'h7', '20 September, nine-plus hours on vinyl and CDJs; the club closes 2 October.'],
  [2016, 'UK', 'fabric closes, then reopens', 'h8', 'September to January: the campaign wins.'],
  [2017, 'UK', 'Printworks', 'h8', 'Canada Water, 2017–2023.'],
  [2020, 'EU', 'Clubs close', 'h9', 'March: the pandemic. Streams, then the hard-techno boom when doors reopen.'],
  [2026, 'US', 'Juan Atkins dies', 'h2', '31 October, Mexico City, aged 64, before a scheduled set. The Originator; the man who named it.'],
  [2024, 'DE', 'Berlin techno listed as heritage', 'h9', '13 March: added to Germany\'s UNESCO intangible-heritage inventory. Watergate closes on 31 December.'],
  [2025, 'EU', 'Liquid Room at 30', 'h13', 'Mills tours for the mix\'s thirtieth anniversary; London and Paris see unseen footage of the original night.'],
  [2023, 'UK', 'Detroit Techno Militia in Hastings', 'tw1', 'Easter Sunday: Detroit Techno Militia play a Sussex seaside town; the Hastings Techno Militia follows.']
];
TL.sort((a, b) => a[0] - b[0]);
function drawTimeline(){
  const svg = document.getElementById('tlMaster'); if (!svg) return; const W = 1000, H = 400, L = 60, R = 985; clearSvg(svg, W, H);
  const rows = [['US', 'Detroit / Chicago', '--kick'], ['UK', 'UK', '--drums'], ['IB', 'Ibiza (2000–)', '--perc'], ['DE', 'Berlin', '--rumble'], ['EU', 'Europe / world', '--synth']];
  const x = y => L + (y - 1973) / (2027 - 1973) * (R - L); const rowY = i => 70 + i * 68;
  for (let y = 1975; y <= 2025; y += 5){ el('line', { x1: x(y), y1: 20, x2: x(y), y2: H - 30, stroke: '#272733' }, svg); text(svg, x(y), H - 14, y, { 'text-anchor': 'middle' }); }
  rows.forEach((r, i) => { const yy = rowY(i); el('line', { x1: L, y1: yy, x2: R, y2: yy, stroke: css(r[2]), opacity: .3 }, svg); text(svg, 4, yy + 4, r[1], { fill: css(r[2]), 'font-size': 9 }); });
  const tip = document.getElementById('tlTip'); const stack = {};
  TL.forEach(ev => {
    const ri = rows.findIndex(r => r[0] === ev[1]); const yy = rowY(ri); const key = ev[1] + Math.round(ev[0] / 3); stack[key] = (stack[key] || 0) + 1; const off = (stack[key] - 1) * 9;
    const g = el('g', { style: 'cursor:pointer' }, svg); const px = x(ev[0]);
    el('circle', { cx: px, cy: yy, r: 6, fill: css(rows[ri][2]) }, g);
    const lab = ev[2].length > 26 ? ev[2].slice(0, 25) + '…' : ev[2]; const right = px > R - 140;
    const t = text(g, px + (right ? -9 : 9), yy - 9 - off, lab, { fill: '#ebebf1', 'font-size': 8.5, 'text-anchor': right ? 'end' : 'start' });
    t.setAttribute('transform', `rotate(${right ? 28 : -28} ${px} ${yy - 9 - off})`);
    g.addEventListener('mouseenter', () => { tip.innerHTML = `<b>${ev[0]} · ${ev[2]}</b><br>${ev[4]}`; tip.style.display = 'block'; });
    g.addEventListener('mousemove', e => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; });
    g.addEventListener('mouseleave', () => tip.style.display = 'none');
    g.addEventListener('click', () => { tip.style.display = 'none'; location.hash = '#' + ev[3]; });
  });
}

/* ---------- Prehistory timeline ---------- */
function drawPreTimeline(){
  const svg = document.getElementById('preTimeline'); if (!svg) return; const W = 1000, H = 220, L = 30, R = 975; clearSvg(svg, W, H);
  /* [year, label, the word to find on this page, the book's page if it has one] */
  const ev = [[1920, 'Theremin', 'theremin'], [1928, 'Ondes Martenot', 'Martenot'], [1930, 'Trautonium', 'Trautonium'], [1931, 'Rhythmicon — the first drum machine', 'Rhythmicon'], [1938, 'Novachord', 'Novachord'], [1939, 'Vocoder', 'vocoder'], [1948, 'Musique concrète', 'concrète'], [1957, 'RCA Mark II (paper-tape sequencing)', 'RCA'], [1958, 'BBC Radiophonic Workshop', 'Radiophonic'], [1963, 'Doctor Who theme', 'Doctor Who'], [1964, 'Moog modular', 'Moog\'s modular', 'moog'], [1968, 'Switched-On Bach', 'Switched-On'], [1971, 'Baba O\'Riley', 'Riley'], [1974, 'Autobahn', 'Autobahn (1974)', 'rec-autobahn'], [1977, 'I Feel Love', 'I Feel Love', 'rec-ifeellove'], [1980, 'TR-808', '808', 'tr808']];
  const x = y => L + (y - 1918) / (1982 - 1918) * (R - L);
  for (let y = 1920; y <= 1980; y += 10){ el('line', { x1: x(y), y1: 20, x2: x(y), y2: H - 30, stroke: '#272733' }, svg); text(svg, x(y), H - 14, y, { 'text-anchor': 'middle' }); }
  el('line', { x1: L, y1: 130, x2: R, y2: 130, stroke: css('--synth'), opacity: .4 }, svg);
  ev.forEach(([yr, label, find, id]) => {
    const px = x(yr); const g = el('g', {}, svg);
    el('circle', { cx: px, cy: 130, r: 5, fill: css('--synth') }, g); el('circle', { class: 'dg-hit', cx: px, cy: 130, r: 13 }, g);
    const t = text(g, px + 6, 122, label, { fill: '#ebebf1', 'font-size': 9 }); t.setAttribute('transform', `rotate(-32 ${px + 6} 122)`);
    const n = id && NODE[id];
    Dg.mark(g, n ? { id, find, meta: yr + ' · ' + (TYPE_LABEL[n.type] || n.type) } : { title: label.replace(/ — .*/, ''), meta: String(yr), find, href: null });
  });
}

/* ---------- City network ---------- */
function drawCityNet(){
  const svg = document.getElementById('cityNet'); if (!svg) return; const W = 900, H = 420; clearSvg(svg, W, H);
  const N = { dus: [120, 80, 'Düsseldorf', '1974', '--synth'], chi: [120, 220, 'Chicago', '1977', '--kick'], det: [280, 150, 'Detroit', '1985', '--kick'], nyc: [250, 300, 'New York', '1977', '--kick'],
    ibz: [470, 330, 'Ibiza', '2000', '--perc'], lon: [470, 190, 'London', '1987', '--drums'], man: [430, 90, 'Manchester / Sheffield', '1988', '--drums'], bhm: [600, 110, 'Birmingham', '1993', '--drums'],
    ber: [720, 200, 'Berlin', '1989', '--rumble'], ffm: [650, 300, 'Frankfurt', '1988', '--synth'], gnt: [600, 230, 'Ghent / Rotterdam', '1990', '--synth'], tok: [820, 330, 'Tokyo', '1994', '--synth'], tbi: [840, 110, 'Tbilisi', '2014', '--synth'] };
  const E = [['dus', 'det', 'radio, 1977–82'], ['dus', 'nyc', 'Planet Rock, 1982'], ['nyc', 'det', 'electro, 1982'], ['chi', 'det', 'the neighbour (house strand)'], ['det', 'bhm', 'Network, 1988'], ['det', 'lon', 'Techno!, 1988'], ['ffm', 'ibz', 'Cocoon, 2000'], ['det', 'man', 'bleep, 1989'], ['det', 'ber', 'Tresor, 1991'], ['lon', 'ber', 'UFO, 1988'], ['ber', 'ffm', 'trance, 1991'], ['gnt', 'lon', 'Energy Flash, 1990'], ['det', 'tok', 'Liquid Room, 1995'], ['ber', 'tbi', 'Bassiani, 2014']];
  const defs = el('defs', {}, svg); const m = el('marker', { id: 'cn', viewBox: '0 0 10 10', refX: 10, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: '#8f8fa0' }, m);
  E.forEach(([a, b, lab]) => { const A = N[a], B = N[b]; const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy); const ux = dx / len, uy = dy / len; const x1 = A[0] + ux * 34, y1 = A[1] + uy * 34, x2 = B[0] - ux * 36, y2 = B[1] - uy * 36; el('line', { x1, y1, x2, y2, stroke: '#8f8fa0', 'stroke-width': 1.2, opacity: .7, 'marker-end': 'url(#cn)' }, svg); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const t = text(svg, mx, my - 4, lab, { 'text-anchor': 'middle', 'font-size': 9, fill: '#c9c9d4' }); t.setAttribute('transform', `rotate(${Math.atan2(dy, dx) * 180 / Math.PI} ${mx} ${my})`); });
  Object.values(N).forEach(([x, y, name, yr, col]) => { el('circle', { cx: x, cy: y, r: 30, fill: '#1b1b24', stroke: css(col), 'stroke-width': 2 }, svg); text(svg, x, y - 2, name, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-size': name.length > 12 ? 8 : 10, 'font-weight': 600 }); text(svg, x, y + 11, yr, { 'text-anchor': 'middle', fill: css(col) }); });
}

/* ---------- Genre family tree ---------- */
function drawGenreTree(){
  const svg = document.getElementById('genreTree'); if (!svg) return; const W = 1000, H = 520; clearSvg(svg, W, H);
  const N = {
    kraft: [120, 40, 'Kraftwerk / electro', '--synth'], disco: [380, 40, 'Disco', '--kick'], ebm: [700, 40, 'EBM / industrial', '--synth'],
    house: [380, 120, 'Chicago house 1984 → house strand', '--muted'], detroit: [160, 150, 'Detroit techno 1985', '--kick'], acid: [500, 190, 'Acid 1987 (shared)', '--perc'], newbeat: [760, 130, 'New beat 1987', '--synth'],
    bleep: [60, 250, 'Bleep 1989', '--drums'], hardcore: [600, 270, 'Hardcore / rave 1991', '--drums'], berlin: [300, 250, 'Berlin / Tresor 1991', '--rumble'], trance: [860, 220, 'Trance 1991', '--synth'],
    bham: [160, 340, 'Birmingham 1993', '--drums'], dub: [400, 340, 'Dub techno 1993', '--rumble'], jungle: [720, 350, 'Jungle / D&B 1993', '--drums'], gabber: [880, 320, 'Gabber 1992', '--synth'], minimal: [280, 420, 'Minimal 2001', '--synth'], schranz: [560, 420, 'Schranz / hard 2000', '--drums'],
    berghain: [420, 490, 'Berghain sound 2008', '--rumble'], industrial: [660, 490, 'Industrial 2015', '--drums'], hypnotic: [160, 490, 'Hypnotic 2012', '--rumble'], hard: [860, 470, 'Hard techno 2020', '--drums']
  };
  /* each branch's page in the book, and so its sound and its place on the full family tree */
  const GID = { kraft: 'g-electro', house: 'g-house', detroit: 'g-detroit', acid: 'g-acidhouse', newbeat: 'g-newbeat', bleep: 'g-bleep', hardcore: 'g-hardcore', berlin: 'g-berlin', trance: 'g-trance', bham: 'g-bham', dub: 'g-dub', jungle: 'g-jungle', gabber: 'g-gabber', minimal: 'g-minimal', schranz: 'g-schranz', berghain: 'g-berghain', industrial: 'g-industrial', hypnotic: 'g-hypnotic', hard: 'g-hard' };
  const BR = { kraft: 'electro', detroit: 'detroit', bleep: 'bleep', berlin: 'berlin', hardcore: 'hardcore', gabber: 'gabber', trance: 'trance', bham: 'bham', dub: 'dub', minimal: 'minimal', schranz: 'schranz', berghain: 'berghain', hypnotic: 'hypnotic', industrial: 'industrial', hard: 'hard' };
  const E = [['kraft', 'detroit'], ['disco', 'house'], ['house', 'detroit'], ['house', 'acid'], ['ebm', 'newbeat'], ['newbeat', 'trance'], ['detroit', 'bleep'], ['detroit', 'berlin'], ['acid', 'hardcore'], ['acid', 'berlin'], ['ebm', 'berlin'], ['hardcore', 'jungle'], ['hardcore', 'gabber'], ['berlin', 'bham'], ['detroit', 'bham'], ['berlin', 'dub'], ['detroit', 'dub'], ['berlin', 'schranz'], ['bham', 'schranz'], ['dub', 'minimal'], ['detroit', 'minimal'], ['berlin', 'berghain'], ['dub', 'berghain'], ['minimal', 'berghain'], ['bham', 'industrial'], ['schranz', 'industrial'], ['minimal', 'hypnotic'], ['dub', 'hypnotic'], ['schranz', 'hard'], ['trance', 'hard'], ['gabber', 'hard'], ['industrial', 'hard']];
  const paths = E.map(([a, b]) => { const A = N[a], B = N[b]; const p = el('path', { class: 'dg-e', d: `M${A[0]} ${A[1] + 14} C ${A[0]} ${(A[1] + B[1]) / 2}, ${B[0]} ${(A[1] + B[1]) / 2}, ${B[0]} ${B[1] - 14}`, fill: 'none', stroke: '#3a3a48', 'stroke-width': 1.5 }, svg); p.dataset.a = a; p.dataset.b = b; return p; });
  const up = {}, down = {}; E.forEach(([a, b]) => { (down[a] = down[a] || []).push(b); (up[b] = up[b] || []).push(a); });
  const walk = (k, m, seen = new Set()) => { (m[k] || []).forEach(j => { if (!seen.has(j)){ seen.add(j); walk(j, m, seen); } }); return seen; };
  const G = {};
  Object.entries(N).forEach(([key, [x, y, name, col]]) => { const g = el('g', {}, svg); const w = name.length * 6.4 + 18; el('rect', { x: x - w / 2, y: y - 13, width: w, height: 26, rx: 13, fill: '#1b1b24', stroke: css(col), 'stroke-width': 1.5 }, g); text(g, x, y + 4, name, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-size': 10, 'font-weight': 600 }); G[key] = g; });
  Object.entries(G).forEach(([key, g]) => {
    const anc = walk(key, up), des = walk(key, down), line = new Set([key, ...anc, ...des]);
    const rel = () => [...[...line].map(k => G[k]), ...paths.filter(p => (p.dataset.b === key || anc.has(p.dataset.b)) && (anc.has(p.dataset.a)) || (p.dataset.a === key || des.has(p.dataset.a)) && des.has(p.dataset.b))];
    const gid = GID[key], n = gid && NODE[gid];
    const from = [...(up[key] || [])].map(k => N[k][2].replace(/ \d{4}.*| →.*| \(.*\)/g, '')), to = [...(down[key] || [])].map(k => N[k][2].replace(/ \d{4}.*| →.*| \(.*\)/g, ''));
    const lin = (from.length ? 'From ' + from.join(', ') + '. ' : '') + (to.length ? 'Led to ' + to.join(', ') + '.' : '');
    const links = [];
    if (n) links.push(['On the family tree', '#genres?g=' + gid]);
    if (BR[key]) links.push(['In Branches', '#h14?b=' + BR[key]]);
    Dg.mark(g, n ? { id: gid, title: N[key][2], meta: [n.years, n.city].filter(Boolean).join(' · '), text: lin + (n.blurb ? ' ' + n.blurb : ''), play: n.preset || null, go: 'Open the genre', links, rel }
      : { title: N[key][2], meta: 'A root of the tree', text: lin, href: null, links, rel });
  });
}

/* ---------- BPM by era ---------- */
function drawBpmChart(){
  const svg = document.getElementById('bpmChart'); if (!svg) return; const W = 900, H = 240, L = 50, R = 880, T = 20, B = 200; clearSvg(svg, W, H);
  const data = [['Chicago house 1986', 122], ['Detroit 1988', 122], ['Bleep 1990', 118], ['Rave 1991', 140], ['Tresor 1992', 138], ['Acid techno 1994', 140], ['Birmingham 1995', 136], ['Dub 1995', 122], ['Schranz 2002', 145], ['Minimal 2004', 126], ['Berghain 2010', 130], ['Hypnotic 2015', 128], ['Peak-time 2017', 136], ['Industrial 2018', 140], ['Hard 2023', 152]];
  const y = v => B - (v - 110) / (160 - 110) * (B - T); [110, 120, 130, 140, 150, 160].forEach(v => { el('line', { x1: L, y1: y(v), x2: R, y2: y(v), stroke: '#272733' }, svg); text(svg, 6, y(v) + 4, v); });
  const bw = (R - L) / data.length; const pts = [];
  data.forEach((d, i) => { const x = L + i * bw + bw / 2; const hue = 200 + (d[1] - 118) / 34 * 160; el('rect', { x: x - bw * 0.3, y: y(d[1]), width: bw * 0.6, height: B - y(d[1]), rx: 3, fill: `hsl(${hue} 70% 55%)`, opacity: .8 }, svg); pts.push([x, y(d[1])]); const t = text(svg, x, B + 12, d[0], { 'text-anchor': 'end', 'font-size': 8.5 }); t.setAttribute('transform', `rotate(-28 ${x} ${B + 12})`); });
  el('path', { d: pathStr(pts), fill: 'none', stroke: '#ebebf1', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: .6 }, svg);
  text(svg, L, 14, 'typical BPM per dialect (the mixer\'s presets use these)');
}

/* ---------- Generative era posters (original abstract art, no logos) ---------- */
function seeded(s){ let a = s * 9301 + 49297; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; }
function drawPoster(id, style, title, sub){
  const svg = document.getElementById(id); if (!svg) return; const W = 600, H = 400; clearSvg(svg, W, H); const rnd = seeded(style.length * 7 + title.length);
  const bg = el('rect', { width: W, height: H, fill: '#0e0e13' }, svg);
  const col = css({ detroit: '--kick', acid: '--perc', rave: '--drums', ibiza: '--perc', berlin: '--rumble', minimal: '--synth', berghain: '--rumble', hard: '--kick', dub: '--synth', chicago: '--kick' }[style] || '--text');
  if (style === 'detroit'){ // afrofuturist grid + horizon
    for (let i = 0; i < 14; i++){ const y = 200 + i * i * 1.3; el('line', { x1: 0, y1: y, x2: W, y2: y, stroke: col, opacity: .15 + i * .04 }, svg); }
    for (let i = -8; i <= 8; i++) el('line', { x1: 300, y1: 200, x2: 300 + i * 120, y2: H, stroke: col, opacity: .3 }, svg);
    for (let i = 0; i < 70; i++) el('circle', { cx: rnd() * W, cy: rnd() * 190, r: rnd() * 1.6, fill: '#fff', opacity: .5 + rnd() * .5 }, svg);
    el('circle', { cx: 300, cy: 200, r: 60, fill: col, opacity: .9 }, svg); el('rect', { x: 0, y: 200, width: W, height: 8, fill: '#0e0e13' }, svg);
  } else if (style === 'chicago'){ for (let i = 0; i < 12; i++) el('rect', { x: 40 + i * 44, y: 60 + Math.sin(i) * 30, width: 26, height: 200 + Math.cos(i * 1.3) * 60, fill: col, opacity: .25 + (i % 3) * .2 }, svg); }
  else if (style === 'acid'){ for (let k = 0; k < 6; k++){ const pts = []; for (let x = 0; x <= W; x += 10) pts.push([x, 200 + Math.sin(x / 40 + k) * (30 + k * 12) * Math.sin(x / 300)]); el('path', { d: pathStr(pts), fill: 'none', stroke: col, 'stroke-width': 3, opacity: .25 + k * .12 }, svg); } }
  else if (style === 'rave'){ for (let r = 20; r < 300; r += 22) el('circle', { cx: 300, cy: 200, r, fill: 'none', stroke: col, 'stroke-width': 2, opacity: .15 + (r % 44 ? 0 : .35) }, svg); for (let i = 0; i < 24; i++){ const a = i / 24 * Math.PI * 2; el('line', { x1: 300, y1: 200, x2: 300 + Math.cos(a) * 300, y2: 200 + Math.sin(a) * 300, stroke: col, opacity: .18 }, svg); } }
  else if (style === 'ibiza'){ const g = el('linearGradient', { id: 'ibz', x1: 0, y1: 0, x2: 0, y2: 1 }, el('defs', {}, svg)); el('stop', { offset: 0, 'stop-color': '#ff7a3d' }, g); el('stop', { offset: 1, 'stop-color': '#ffd166' }, g); el('circle', { cx: 300, cy: 190, r: 130, fill: 'url(#ibz)' }, svg); for (let i = 0; i < 9; i++) el('rect', { x: 0, y: 200 + i * 22, width: W, height: 10, fill: '#0e0e13', opacity: .9 - i * .08 }, svg); el('rect', { x: 0, y: 320, width: W, height: 80, fill: '#113' , opacity: .9 }, svg); }
  else if (style === 'berlin'){ for (let i = 0; i < 40; i++) el('rect', { x: rnd() * W, y: rnd() * H, width: 20 + rnd() * 120, height: 20 + rnd() * 120, fill: ['#2a2a35', '#1c1c25', '#33333f'][i % 3], stroke: col, 'stroke-opacity': .25 }, svg); el('rect', { x: 230, y: 110, width: 140, height: 180, fill: '#0e0e13', stroke: col, 'stroke-width': 3 }, svg); el('circle', { cx: 300, cy: 200, r: 28, fill: 'none', stroke: col, 'stroke-width': 6 }, svg); }
  else if (style === 'dub'){ for (let i = 0; i < 14; i++) el('circle', { cx: 300, cy: 200, r: 10 + i * 20, fill: 'none', stroke: col, 'stroke-width': 10 - i * .6, opacity: .5 - i * .03 }, svg); }
  else if (style === 'minimal'){ for (let x = 60; x < W; x += 40) for (let y = 60; y < H; y += 40) el('circle', { cx: x, cy: y, r: rnd() < .15 ? 6 : 1.5, fill: col, opacity: .8 }, svg); }
  else if (style === 'berghain'){ el('rect', { x: 200, y: 40, width: 200, height: 330, fill: '#15151c', stroke: '#2b2b36' }, svg); for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) el('rect', { x: 215 + j * 45, y: 55 + i * 34, width: 30, height: 22, fill: '#0b0b0f', stroke: '#2b2b36' }, svg); el('rect', { x: 260, y: 295, width: 30, height: 22, fill: col, opacity: .9 }, svg); el('rect', { x: 0, y: 370, width: W, height: 30, fill: '#1a1a22' }, svg); }
  else if (style === 'london'){ const lines = ['#e32017', '#0098d4', '#ffd300', '#00782a', '#9b0056', '#003688', '#f3a9bb']; lines.forEach((c, i) => { const y = 70 + i * 36; el('path', { d: `M0 ${y} L ${180 + i * 30} ${y} L ${240 + i * 30} ${y + (i % 2 ? 36 : -30)} L 600 ${y + (i % 2 ? 36 : -30)}`, fill: 'none', stroke: c, 'stroke-width': 7, opacity: .85 }, svg); }); [[120, 70, 'Camden Palace'], [300, 106, 'Clink St'], [420, 142, 'The End'], [200, 178, 'Lost'], [500, 214, 'fabric'], [330, 250, 'Fold']].forEach(([x, y, n]) => { el('circle', { cx: x, cy: y, r: 7, fill: '#0e0e13', stroke: '#fff', 'stroke-width': 3 }, svg); text(svg, x + 11, y - 9, n, { fill: '#ebebf1', 'font-size': 9 }); }); }
  else if (style === 'hard'){ const pts = []; for (let x = 0; x <= W; x += 6) pts.push([x, 200 + (rnd() - .5) * (x % 60 < 6 ? 260 : 60)]); el('path', { d: pathStr(pts), fill: 'none', stroke: col, 'stroke-width': 2 }, svg); for (let i = 0; i < 16; i++) el('rect', { x: i * 38, y: 360 - (i % 4) * 30, width: 30, height: 60 + (i % 4) * 30, fill: col, opacity: .18 }, svg); }
  animatePoster(svg, style, col, rnd);
  text(svg, 24, H - 48, title, { fill: '#ebebf1', 'font-size': 30, 'font-weight': 700, 'font-family': 'Space Grotesk, sans-serif', 'letter-spacing': '-0.02em' });
  text(svg, 24, H - 24, sub, { fill: col, 'font-size': 11, 'letter-spacing': '.14em' });
}
/* the posters breathe while they are on screen: slow, never flashing, and still with reduced motion */
function animatePoster(svg, style, col, rnd){
  const add = (sel, cls, delay) => [...svg.querySelectorAll(sel)].forEach((e, i, all) => { e.classList.add(cls); const d = typeof delay === 'function' ? delay(i, all.length) : delay; if (d != null) e.style.animationDelay = d + 's'; });
  const kids = t => [...svg.children].filter(e => e.tagName === t);
  if (style === 'detroit'){ kids('circle').forEach(c => { if (+c.getAttribute('r') < 2){ c.classList.add('pz-tw'); c.style.animationDelay = (-rnd() * 4).toFixed(2) + 's'; c.style.animationDuration = (2.6 + rnd() * 3).toFixed(2) + 's'; } else c.classList.add('pz-glow'); }); }
  else if (style === 'chicago' || style === 'hard'){ kids('rect').slice(1).forEach((r, i) => { r.classList.add('pz-eq'); r.style.animationDelay = (-(i % 5) * .37).toFixed(2) + 's'; r.style.animationDuration = (1.5 + (i % 3) * .35).toFixed(2) + 's'; }); if (style === 'hard') kids('path').forEach(p => p.classList.add('pz-wave')); }
  else if (style === 'acid'){ kids('path').forEach((p, i) => { p.classList.add('pz-wave'); p.style.animationDelay = (-i * .9).toFixed(2) + 's'; }); }
  else if (style === 'rave'){ const g = el('g', { class: 'pz-spin' }); kids('line').forEach(l => g.appendChild(l)); svg.insertBefore(g, svg.children[1] || null); kids('circle').forEach((c, i) => { c.classList.add('pz-ring'); c.style.animationDelay = (i * .32).toFixed(2) + 's'; }); }
  else if (style === 'ibiza'){ kids('circle').forEach(c => c.classList.add('pz-sun')); }
  else if (style === 'berlin'){ kids('circle').forEach(c => c.classList.add('pz-glow')); kids('rect').slice(1, 41).forEach((r, i) => { if (rnd() < .18){ r.classList.add('pz-blink'); r.style.animationDelay = (-rnd() * 5).toFixed(2) + 's'; r.style.animationDuration = (4 + rnd() * 4).toFixed(2) + 's'; } }); }
  else if (style === 'dub'){ kids('circle').forEach((c, i) => { c.classList.add('pz-echo'); c.style.animationDelay = (i * .18).toFixed(2) + 's'; }); }
  else if (style === 'minimal'){ kids('circle').forEach(c => { if (+c.getAttribute('r') > 3){ c.classList.add('pz-blink'); c.style.animationDelay = (-rnd() * 4).toFixed(2) + 's'; c.style.animationDuration = (2.4 + rnd() * 3).toFixed(2) + 's'; } }); }
  else if (style === 'berghain'){ const wins = kids('rect').filter(r => r.getAttribute('width') === '30'); wins.forEach((r, i) => { if (r.getAttribute('fill') !== '#0b0b0f'){ r.classList.add('pz-glow'); return; } if (rnd() < .14){ r.classList.add('pz-light'); r.style.setProperty('--pzc', col); r.style.animationDelay = (-rnd() * 9).toFixed(2) + 's'; r.style.animationDuration = (6 + rnd() * 6).toFixed(2) + 's'; } }); }
  else if (style === 'london'){ kids('path').forEach((p, i) => { const t = el('path', { d: p.getAttribute('d'), fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 100, class: 'pz-train', opacity: .9 }); p.after(t); t.style.animationDelay = (-i * 1.3).toFixed(2) + 's'; t.style.animationDuration = (7 + (i % 3) * 2).toFixed(2) + 's'; }); }
  svg.classList.add('pz');
  if (!('IntersectionObserver' in window)){ svg.classList.add('pz-on'); return; }
  const io = new IntersectionObserver(es => es.forEach(en => svg.classList.toggle('pz-on', en.isIntersecting)), { threshold: .05 });
  io.observe(svg);
}

/* ---------- UK techno map ---------- */
function drawUKMap(){
  const svg = document.getElementById('ukMap'); if (!svg) return; const W = 600, H = 420; clearSvg(svg, W, H);
  const pts = [[300, 60, 'Glasgow', 'Sub Club 1987 · Soma 1991 · Rubadub 1992', 'glasgow'], [360, 100, 'Edinburgh', 'Pure 1990', 'edinburgh'], [330, 180, 'Leeds / Morley', 'The Orbit 1991 · Back to Basics', 'leeds'], [300, 210, 'Sheffield', 'Warp 1989 · bleep', 'sheffield'], [270, 230, 'Manchester', 'Bugged Out 1994', 'manchester'], [280, 280, 'Birmingham', 'Network 1988 · House of God & Downwards 1993 · Atomic Jam 1995', 'birmingham'], [240, 320, 'Castlemorton', 'Spiral Tribe, May 1992', 'castlemorton'], [360, 340, 'London', 'Lost 1991 · Final Frontier 1994 · Stay Up Forever 1993 · fabric 1999', 'london'], [350, 385, 'Brighton', 'Dave Clarke · Red 1994', 'brighton']];
  const lines = pts.slice(1).map((p, i) => el('line', { class: 'dg-e', x1: pts[i][0], y1: pts[i][1], x2: p[0], y2: p[1], stroke: '#272733' }, svg));
  pts.forEach(([x, y, n, d, id], i) => {
    const g = el('g', {}, svg); el('circle', { cx: x, cy: y, r: 7, fill: css('--drums') }, g); el('circle', { class: 'dg-hit', cx: x, cy: y, r: 14 }, g);
    text(g, x + 12, y - 2, n, { fill: '#ebebf1', 'font-weight': 600 }); text(g, x + 12, y + 10, d, { 'font-size': 8 });
    const node = NODE[id];
    Dg.mark(g, { id: node ? id : null, title: n, meta: node ? [node.type === 'city' ? 'City' : TYPE_LABEL[node.type], node.type === 'city' ? '' : node.years].filter(Boolean).join(' · ') : '', text: d.replace(/ · /g, '; ') + '.', find: n.split(' / ')[0], href: node ? '#' + id : null, go: node && node.type === 'city' ? 'Open the city' : null, rel: [lines[i - 1], lines[i]] });
  });
  text(svg, 20, H - 10, 'North to south; positions schematic.', { 'font-size': 9 });
}

/* ---------- London techno map ---------- */
function drawLondonMap(){
  const svg = document.getElementById('ldnMap'); if (!svg) return; const W = 900, H = 400; clearSvg(svg, W, H);
  el('path', { d: 'M0 250 C 150 200, 250 290, 380 250 S 560 180, 650 230 S 820 300, 900 240', fill: 'none', stroke: '#1d3a52', 'stroke-width': 26, 'stroke-linecap': 'round', opacity: .9 }, svg);
  text(svg, 20, 266, 'THE THAMES', { fill: '#4a7fa5', 'font-size': 9, 'letter-spacing': '.2em' });
  const rooms = [['camden-palace', 'Camden Palace', '1982 · Faver, Richards, Mr. C', 300, 60], ['clink-street', 'Clink Street (RIP)', '1988 · Southwark', 470, 300], ['dungeons', 'The Dungeons', '1989 · Lea Bridge Road', 760, 90], ['heaven', 'Heaven', '1979 · Charing Cross', 400, 215], ['lost', 'Lost', '1991 · warehouses, east', 700, 170], ['club-uk', 'Club UK', '1993 · Wandsworth', 150, 340], ['turnmills', 'Turnmills', '1990 · Clerkenwell', 520, 130], ['the-end', 'The End', '1995–2009 · West Central St', 420, 160], ['fabric', 'fabric', '1999 · Smithfield', 560, 175], ['corsica-studios', 'Corsica Studios', '2002 · Elephant & Castle', 520, 330], ['printworks', 'Printworks', '2017–23 · Canada Water', 720, 300], ['fold', 'Fold', '2018 · Canning Town', 850, 200]];
  const ERA = [['80', '1980s', '--perc'], ['90', '1990s', '--rumble'], ['00', '2000s and after', '--synth']];
  rooms.forEach(([id, n, d, x, y]) => {
    const yr = parseInt(d); const era = yr < 1990 ? ERA[0] : yr < 2000 ? ERA[1] : ERA[2];
    const g = el('g', {}, svg); g.dataset.dgk = era[0];
    el('circle', { cx: x, cy: y, r: 8, fill: css(era[2]) }, g); el('circle', { class: 'dg-hit', cx: x, cy: y, r: 15 }, g);
    text(g, x + 12, y - 1, n, { fill: '#ebebf1', 'font-weight': 600 }); text(g, x + 12, y + 11, d, { 'font-size': 8 });
    Dg.mark(g, NODE[id] ? { id, meta: d } : { title: n, meta: d, href: null });
  });
  Dg.legend(svg, ERA.map(([k, l, c]) => [k, l, css(c)]));
}
/* ---------- Detroit ⇄ London ⇄ Hastings exchange ---------- */
function drawExchange(){
  const svg = document.getElementById('dtmExchange'); if (!svg) return; const W = 900, H = 420; clearSvg(svg, W, H);
  const lanes = [['Detroit', 50], ['London', 135], ['Hastings', 220]]; const L = 110, R = 880; const x = y => L + (y - 1986) / (2027 - 1986) * (R - L);
  lanes.forEach(([n, y]) => { el('line', { x1: L, y1: y, x2: R, y2: y, stroke: '#272733' }, svg); text(svg, 10, y + 4, n, { fill: '#ebebf1', 'font-weight': 600 }); });
  for (let y = 1990; y <= 2025; y += 5){ el('line', { x1: x(y), y1: 40, x2: x(y), y2: 232, stroke: '#1c1c25' }, svg); text(svg, x(y), 248, y, { 'text-anchor': 'middle' }); }
  /* [year, from lane, to lane, what happened, colour, the book's page] */
  const trips = [[1988, 1, 0, 'Neil Rushton goes to Detroit and comes back with the word "techno"', '--drums', 'neil-rushton'], [1988.6, 0, 1, 'The imports reach the Camden Palace and Clink Street', '--perc', 'clink-street'], [1991.5, 0, 1, 'Jeff Mills plays Lost, early 1990s', '--rumble', 'lost'], [1994.2, 0, 1, 'Final Frontier at Club UK, Jeff Mills a regular', '--rumble', 'club-uk'], [2011, 0, 0, 'DTM 5x5 on the Made in Detroit stage, Movement', '--kick', 'set-dtm5x5'], [2023.3, 0, 2, 'Detroit Techno Militia to Hastings, Easter Sunday', '--kick', 'dtm-hastings'], [2024.95, 0, 2, 'DTM at The Pig, 27 December', '--kick', 'the-pig'], [2025.8, 2, 0, 'DJK plays Detroit, comes back with the wax', '--synth', 'hastings-techno-militia'], [2026.25, 0, 2, 'DTM at the Deep End, Easter Sunday', '--kick', 'dtm-hastings']];
  const pairs = [];
  trips.forEach(([yr, a, b, label, col, id], i) => {
    const xx = x(yr); const ya = lanes[a][1], yb = lanes[b][1]; const c = css(col);
    const g = el('g', {}, svg);
    el('circle', { cx: xx, cy: ya, r: 9, fill: c }, g);
    if (a !== b){ el('line', { x1: xx, y1: ya, x2: xx, y2: yb, stroke: c, 'stroke-width': 2.5 }, g); const dir = yb > ya ? 1 : -1; el('path', { d: `M${xx - 5} ${yb - dir * 8} L${xx} ${yb} L${xx + 5} ${yb - dir * 8}`, fill: 'none', stroke: c, 'stroke-width': 2.5 }, g); }
    el('rect', { class: 'dg-hit', x: xx - 10, y: Math.min(ya, yb) - 10, width: 20, height: Math.abs(yb - ya) + 20 }, g);
    text(g, xx, ya + 3.5, i + 1, { 'text-anchor': 'middle', fill: '#000', 'font-weight': 700, 'font-size': 10 });
    const col2 = i < 5 ? 0 : 1; const row = i % 5; const kx = 20 + col2 * 440, ky = 285 + row * 24;
    const k = el('g', {}, svg); el('circle', { cx: kx + 8, cy: ky - 4, r: 8, fill: c }, k); el('rect', { class: 'dg-hit', x: kx - 2, y: ky - 16, width: 420, height: 22 }, k);
    text(k, kx + 8, ky - .5, i + 1, { 'text-anchor': 'middle', fill: '#000', 'font-weight': 700, 'font-size': 10 }); text(k, kx + 24, ky, Math.floor(yr) + ' · ' + label, { fill: '#c9c9d4', 'font-size': 9.5 });
    pairs.push([g, k, { title: label, meta: Math.floor(yr) + ' · ' + lanes[a][0] + (a !== b ? ' → ' + lanes[b][0] : ''), text: NODE[id] ? NODE[id].blurb : '', href: NODE[id] ? '#' + id : null, go: NODE[id] ? 'Open: ' + NODE[id].title : null }]);
  });
  pairs.forEach(([g, k, spec]) => { Dg.mark(g, Object.assign({ rel: [k] }, spec)); Dg.mark(k, Object.assign({ rel: [g] }, spec)); });
}
/* ---------- Ibiza club road ---------- */
function drawIbiza(){
  const svg = document.getElementById('ibizaRoad'); if (!svg) return; const W = 900, H = 200; clearSvg(svg, W, H);
  el('path', { d: 'M40 120 C 250 60, 450 160, 860 100', fill: 'none', stroke: '#3a3a48', 'stroke-width': 10, 'stroke-linecap': 'round' }, svg);
  const stops = [[60, 'San Antonio', '(house strand: Café del Mar, Es Paradis)', 'cafe-del-mar'], [250, 'San Rafael', 'Amnesia — Cocoon 1999–2017 and 2019 · Music On 2012–18', 'amnesia'], [520, 'Ibiza Town', 'Pacha — Cocoon 2018 · Music On 2019–', 'pacha'], [700, 'Playa d\'en Bossa', 'Space — Carl Cox 2001–16 · ENTER. 2012–15 · Hï 2017', 'space'], [850, 'the airport', 'DC10 — Circoloco (house strand)', 'dc10']];
  stops.forEach(([x, name, clubs, id]) => {
    const y = 120 - Math.sin(x / 900 * Math.PI) * 30; const g = el('g', {}, svg);
    el('circle', { cx: x, cy: y, r: 9, fill: css('--perc') }, g); el('circle', { class: 'dg-hit', cx: x, cy: y, r: 18 }, g);
    text(g, x, y - 18, name, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-weight': 600 }); text(g, x, y + 26, clubs, { 'text-anchor': 'middle', 'font-size': 8.5 });
    const n = NODE[id];
    Dg.mark(g, { id, title: n ? n.title + ', ' + name : name, meta: clubs.replace(/^[^—]*— /, '').replace(/[()]/g, ''), go: n ? 'Open ' + n.title : null });
  });
}
/* ---------- Berlin club lifespans ---------- */
function drawBerlinClubs(){
  const svg = document.getElementById('berlinClubs'); if (!svg) return;
  /* [name, opened, closed (2026 = still open), the book's page, a note] */
  const clubs = [['UFO', 1988, 1990, 'ufo'], ['Tresor (Leipziger Str.)', 1991, 2005, 'tresor'], ['Tresor (Kraftwerk)', 2007, 2026, 'tresor'], ['Planet', 1991, 1993, null, 'its team went on to run E-Werk'], ['WMF', 1991, 2010], ['Bunker', 1992, 1996, 'bunker', 'closed in 1996 or 1997, depending on the account'], ['E-Werk', 1993, 1997, 'e-werk'], ['KitKatClub', 1994, 2026], ['Ostgut', 1998, 2003, 'ostgut', 'opened in 1998 or 1999, depending on the account'], ['Watergate', 2002, 2024, 'watergate'], ['Bar25', 2004, 2010, 'bar25'], ['Berghain / Panorama Bar', 2004, 2026, 'berghain'], ['Club der Visionäre', 1999, 2026], ['Sisyphos', 2009, 2026], ['://about blank', 2010, 2026], ['Griessmuehle', 2009, 2020], ['Renate', 2007, 2025, null, 'lease due to end in 2025']];
  const W = 900, H = 30 + clubs.length * 20; clearSvg(svg, W, H); const L = 170, R = 880; const x = y => L + (y - 1987) / (2027 - 1987) * (R - L);
  for (let y = 1990; y <= 2025; y += 5){ el('line', { x1: x(y), y1: 10, x2: x(y), y2: H - 18, stroke: '#272733' }, svg); text(svg, x(y), H - 4, y, { 'text-anchor': 'middle' }); }
  const head = el('line', { x1: 0, x2: 0, y1: 8, y2: H - 18, stroke: '#ebebf1', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, svg);
  const bars = clubs.map((c, i) => {
    const yy = 16 + i * 20; const open = c[2] === 2026; const g = el('g', {}, svg);
    el('rect', { x: x(c[1]), y: yy, width: Math.max(4, x(c[2]) - x(c[1])), height: 14, rx: 4, fill: css('--rumble'), opacity: open ? .9 : .5 }, g);
    el('rect', { class: 'dg-hit', x: 0, y: yy - 3, width: R, height: 20 }, g);
    text(g, 4, yy + 11, c[0], { fill: '#ebebf1' });
    const n = c[3] && NODE[c[3]]; const span = c[1] + (open ? ' to now' : '–' + c[2]);
    Dg.mark(g, { id: n ? c[3] : null, title: c[0], meta: span + (open ? ' · still open' : ''), text: [c[4] ? c[4].charAt(0).toUpperCase() + c[4].slice(1) + '.' : '', n ? n.blurb : ''].filter(Boolean).join(' '), href: n ? '#' + c[3] : null, find: n ? null : c[0].replace(/ \/.*| \(.*\)|:\/\//g, '') });
    return [g, c];
  });
  /* drag through the years: which rooms were open */
  const card = svg.closest('.card'); let box = card.querySelector('.dg-scrub'); if (box) box.remove(); let say = card.querySelector('.dg-open'); if (say) say.remove();
  box = document.createElement('div'); box.className = 'dg-scrub'; box.innerHTML = '<label for="bcYear">Open in</label><input id="bcYear" type="range" min="1988" max="2026" step="1" value="1995"><output for="bcYear">1995</output>';
  say = document.createElement('p'); say.className = 'dg-open'; say.setAttribute('aria-live', 'polite');
  svg.insertAdjacentElement('afterend', box); box.insertAdjacentElement('afterend', say);
  const r = box.querySelector('input'), out = box.querySelector('output');
  const setYear = y => {
    out.textContent = y; head.setAttribute('x1', x(y + .5)); head.setAttribute('x2', x(y + .5)); head.setAttribute('opacity', .8);
    const on = bars.filter(([, c]) => y >= c[1] && y < (c[2] === 2026 ? 2027 : c[2] + 1));
    bars.forEach(([g, c]) => g.classList.toggle('dg-dim', !on.some(o => o[1] === c)));
    say.innerHTML = on.length ? `<b>${y}:</b> ${on.map(([, c]) => c[3] && NODE[c[3]] ? `<a class="xl" href="#${c[3]}">${Dg.esc(c[0])}</a>` : Dg.esc(c[0])).join(', ')}.` : `<b>${y}:</b> none of these yet.`;
  };
  r.addEventListener('input', () => setYear(+r.value)); setYear(+r.value);
}
/* ---------- Europe network ---------- */
function drawEuroNet(){
  const svg = document.getElementById('euroNet'); if (!svg) return; const W = 900, H = 380; clearSvg(svg, W, H);
  const cities = [[120, 90, 'Glasgow', 'Slam · Soma · Sub Club', '--drums', 'glasgow'], [170, 180, 'Manchester', 'Haçienda · Bugged Out', '--drums', 'manchester'], [230, 250, 'Birmingham', 'Downwards · House of God', '--drums', 'birmingham'], [250, 330, 'London', 'Lost · fabric · The End', '--drums', 'london'],
    [380, 300, 'Paris', 'Rex Club · F Comm', '--synth', 'paris'], [400, 200, 'Ghent / Brussels', 'R&S · Fuse · new beat', '--synth', 'ghent'], [430, 120, 'Rotterdam / Amsterdam', 'gabber · Awakenings · Dekmantel', '--synth', 'rotterdam'], [520, 60, 'Hamburg', 'Golden Pudel · Helena Hauff', '--rumble', 'hamburg'],
    [600, 150, 'Berlin', 'Tresor · Berghain · Hard Wax', '--rumble', 'berlin'], [540, 230, 'Cologne', 'Kompakt', '--synth', 'cologne'], [560, 300, 'Frankfurt', 'Omen · Cocoon · Harthouse', '--synth', 'frankfurt'], [640, 330, 'Mannheim', 'Time Warp', '--synth', 'mannheim'], [470, 350, 'Barcelona', 'Sonar · Nitsa', '--perc', 'barcelona'], [700, 250, 'Munich', 'Gigolo · Ultraschall', '--synth'], [780, 320, 'Naples / Riccione', 'Carola · Cocoricò', '--perc'], [760, 80, 'Stockholm', 'Drumcode', '--drums', 'stockholm'], [860, 180, 'Tbilisi', 'Bassiani · Khidi', '--rumble', 'tbilisi']];
  cities.forEach(([x, y, n, d, col, id]) => {
    const g = el('g', {}, svg); el('circle', { cx: x, cy: y, r: 7, fill: css(col) }, g); el('circle', { class: 'dg-hit', cx: x, cy: y, r: 14 }, g);
    text(g, x + 11, y - 2, n, { fill: '#ebebf1', 'font-weight': 600 }); text(g, x + 11, y + 10, d, { 'font-size': 8.5 });
    const node = id && NODE[id];
    Dg.mark(g, { id: node ? id : null, title: n, meta: 'What it gave techno', text: d.replace(/ · /g, ', ') + '.', href: node ? '#' + id : null, go: node ? 'Open ' + node.title : null, find: node ? null : n.split(' / ')[0] });
  });
  text(svg, 10, H - 8, 'Schematic, not a map: each dot is a scene, the label is what it gave techno. Point at a scene to follow its names.', { 'font-size': 9 });
}
/* ---------- Club anatomy ---------- */
function drawClubAnatomy(){
  const svg = document.getElementById('clubAnatomy'); if (!svg) return; const W = 900, H = 420; clearSvg(svg, W, H);
  const room = (x, y, w, h, name, note, col, find) => {
    const g = el('g', {}, svg);
    el('rect', { x, y, width: w, height: h, rx: 6, fill: '#15151c', stroke: css(col || '--mix'), 'stroke-width': 1.5 }, g);
    text(g, x + 10, y + 18, name, { fill: '#ebebf1', 'font-weight': 600, 'font-size': 11 });
    if (note) note.split('|').forEach((s, i) => text(g, x + 10, y + 34 + i * 12, s, { 'font-size': 9 }));
    Dg.mark(g, { title: name, meta: 'Club anatomy', text: note ? note.replace(/\|/g, '; ').replace(/;\s*or /, ', or ') + '.' : '', find: find || null, href: null });
    return g;
  };
  room(20, 20, 150, 90, 'Door', 'the queue · selection|no photos · stickers on lenses', '--mix', 'selection');
  room(20, 130, 150, 90, 'Cloakroom', 'the ritual of leaving|the outside outside', '--mix', null);
  const main = room(190, 20, 420, 300, 'Main floor', 'concrete, steel, no decoration|no clock, no windows|the system is the architecture', '--rumble', 'Funktion-One');
  el('rect', { x: 370, y: 250, width: 60, height: 40, rx: 4, fill: css('--kick'), opacity: .8 }, main); text(main, 400, 275, 'DJ', { 'text-anchor': 'middle', fill: '#000', 'font-weight': 700 });
  [[200, 120], [560, 120], [200, 260], [560, 260]].forEach(([x, y]) => { el('rect', { x, y, width: 40, height: 50, fill: '#2a2a35', stroke: css('--bass') }, main); text(main, x + 20, y + 30, '▣', { 'text-anchor': 'middle', fill: css('--bass') }); });
  text(main, 250, 150, 'stacks: subs on the floor, mids/highs flown', { 'font-size': 9 });
  room(630, 20, 250, 110, 'Second floor', 'house, slower, windows (Panorama Bar);|or the harder room (Tresor\'s vault)', '--drums', null);
  room(630, 150, 250, 80, 'Bar', 'club mate · water · no glass', '--mix', null);
  room(630, 250, 250, 70, 'Darkroom / lab', 'the queer lineage of the music', '--perc', null);
  room(190, 340, 420, 60, 'Garden / terrace', 'daylight · Space\'s terrace, Berghain\'s garden, DC10\'s', '--synth', null);
  room(630, 340, 250, 60, 'Sound engineer', 'the only person who matters at 7am', '--bass', 'sound engineer');
  text(svg, 20, 240, 'A composite: Berghain\'s', { 'font-size': 9 }); text(svg, 20, 252, 'plan, Tresor\'s vault,', { 'font-size': 9 }); text(svg, 20, 264, 'Space\'s terrace, fabric\'s', { 'font-size': 9 }); text(svg, 20, 276, 'three rooms.', { 'font-size': 9 });
}
/* ---------- Festival calendar ---------- */
function drawFestCal(){
  const svg = document.getElementById('festCal'); if (!svg) return; const W = 700, H = 460, cx = 350, cy = 230; clearSvg(svg, W, H);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  /* this month's slice, lit */
  const now = new Date().getMonth(); const a0 = (now / 12) * Math.PI * 2 - Math.PI / 2, a1 = ((now + 1) / 12) * Math.PI * 2 - Math.PI / 2;
  el('path', { d: `M${cx} ${cy} L${cx + Math.cos(a0) * 200} ${cy + Math.sin(a0) * 200} A200 200 0 0 1 ${cx + Math.cos(a1) * 200} ${cy + Math.sin(a1) * 200} Z`, fill: '#ebebf1', opacity: .07 }, svg);
  months.forEach((m, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 200, y2: cy + Math.sin(a) * 200, stroke: '#272733' }, svg); const b = a + Math.PI / 12; text(svg, cx + Math.cos(b) * 212, cy + Math.sin(b) * 212 + 4, m, { 'text-anchor': 'middle', fill: i === now ? '#fff' : '#ebebf1', 'font-weight': i === now ? 700 : 400 }); });
  /* [name · place, month (0 = January, fractions through it), colour, the book's page] */
  const fests = [['Time Warp · Mannheim', 3.1, '--synth', 'time-warp'], ['Awakenings · Amsterdam', 6.3, '--synth', 'awakenings'], ['Movement · Detroit', 4.8, '--kick', 'movement'], ['Sonar · Barcelona', 5.5, '--perc', 'sonar'], ['Dekmantel · Amsterdam', 7.2, '--synth', 'dekmantel'], ['Love Parade · Berlin (1989–2006)', 6.4, '--rumble', 'love-parade'], ['Street Parade · Zürich', 7.4, '--synth', 'street-parade'], ['Nature One · Kastellaun', 7.0, '--synth', 'nature-one'], ['Mayday · Dortmund', 3.9, '--rumble', 'mayday'], ['ADE · Amsterdam', 9.6, '--synth', 'ade'], ['Draaimolen · Tilburg', 8.3, '--synth', 'draaimolen'], ['Houghton · Norfolk', 7.1, '--drums', 'houghton'], ['Tresor anniversary · Berlin', 2.2, '--rumble', 'tresor'], ['Glastonbury Block9', 5.9, '--drums'], ['Nuits Sonores · Lyon', 4.4, '--synth']];
  const ring = {}; let soon = [];
  fests.forEach(([n, m, col, id]) => {
    const k = Math.round(m); ring[k] = (ring[k] || 0) + 1; const r = 70 + ring[k] * 32; const a = (m / 12) * Math.PI * 2 - Math.PI / 2; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const g = el('g', {}, svg); el('circle', { cx: x, cy: y, r: 5, fill: css(col) }, g); el('circle', { class: 'dg-hit', cx: x, cy: y, r: 12 }, g);
    text(g, x + (Math.cos(a) > 0 ? 8 : -8), y + 3, n, { 'text-anchor': Math.cos(a) > 0 ? 'start' : 'end', 'font-size': 8.5, fill: '#ebebf1' });
    const mi = Math.floor(m), node = id && NODE[id];
    if (mi === now) soon.push(g);
    Dg.mark(g, { id: node ? id : null, title: n.replace(/ · /, ', '), meta: (m % 1 < .34 ? 'Early ' : m % 1 < .67 ? 'Mid-' : 'Late ') + MONTH[mi] + (node && node.years ? ' · ' + node.years : ''), href: node ? '#' + id : null, find: node ? null : n.split(' · ')[0] });
  });
  soon.forEach(g => g.classList.add('dg-now'));
  text(svg, cx, cy - 4, 'the year', { 'text-anchor': 'middle', fill: '#8f8fa0' });
  text(svg, cx, cy + 10, soon.length ? 'lit: this month' : 'lit: this month (quiet)', { 'text-anchor': 'middle', fill: '#6a6a80', 'font-size': 8 });
}

/* ---------- People, clubs, sets, festivals data ---------- */
const PEOPLE = [
  ['Juan Atkins', 'Detroit', '1962–2026', 'Cybotron, Model 500, Metroplex', 'The Originator: "Clear" (1983) and "No UFO\'s" (1985). Named the music after Toffler\'s "techno-rebels". Died in Mexico City, 31 October 2026, aged 64, before a set.', '--kick'],
  ['Derrick May', 'Detroit', '1986–', 'Rhythim Is Rhythim, Transmat', '"Strings of Life", "Nude Photo". The Music Institute resident; the Innovator.', '--kick'],
  ['Kevin Saunderson', 'Detroit', '1987–', 'Inner City, KMS, E-Dancer', '"Big Fun" and "Good Life" put Detroit in the UK charts; the Elevator.', '--kick'],
  ['Jeff Mills', 'Detroit', '1985–', 'UR, Axis, Purpose Maker', 'The Wizard on WJLB; three decks and a 909; Liquid Room 1995; "The Bells".', '--kick'],
  ['"Mad" Mike Banks', 'Detroit', '1989–', 'Underground Resistance, Submerge', 'The militant, masked, anti-corporate conscience of techno.', '--kick'],
  ['Robert Hood', 'Detroit', '1990–', 'UR, M-Plant, Floorplan', '"Minimal Nation" (1994) invented minimal techno before it had a name.', '--kick'],
  ['Carl Craig', 'Detroit', '1989–', 'Planet E, 69, Paperclip People', 'The second wave\'s widest mind; founded DEMF in 2000.', '--kick'],
  ['Richie Hawtin', 'Windsor / Berlin', '1990–', 'Plus 8, Plastikman, M_nus', 'Acid in the Packard Plant, then the laptop, then minimal\'s figurehead.', '--kick'],
  ['Drexciya', 'Detroit', '1992–2002', 'James Stinson & Gerald Donald', 'Electro-techno with an Afrofuturist undersea mythology.', '--kick'],
  ['Eddie Fowlkes', 'Detroit', '1986–', 'Metroplex, Tresor', '"Goodbye Kiss" (1986); the fourth Belleville name; Berlin\'s early Detroit link.', '--kick'],
  ['Blake Baxter', 'Detroit', '1987–', 'KMS, Tresor', 'The Prince of Techno; the first Detroit artist to live in Berlin.', '--kick'],
  ['Neil Rushton', 'Birmingham', '1988–', 'Network Records', 'Licensed the compilation that named the genre and kept Detroit on British shelves.', '--drums'],
  ['Steve Bicknell', 'London', '1991–', 'Lost, Cosmic Records', 'Ran the warehouse night that was Jeff Mills\'s London home for a decade.', '--drums'],
  ['Chris Liberator', 'London', '1993–', 'Stay Up Forever', 'Acid techno: a 303 and a 909 at 140, the free-party sound in a record shop.', '--drums'],
  ['Ben Sims', 'London', '1997–', 'Hardgroove, Theory', 'Three decks of Detroit-swung loop techno; the hardgroove revival\'s source.', '--drums'],
  ['Carl Cox', 'UK / Ibiza', '1980s–', 'Space Ibiza, Intec', 'Three decks, sixteen summers at Space, the people\'s champion.', '--drums'],
  ['Dave Clarke', 'Brighton', '1990–', '"Red" series, White Noise', 'The Baron of Techno; the hardest-cut DJ of the 90s.', '--drums'],
  ['Surgeon', 'Birmingham', '1994–', 'Dynamic Tension, British Murder Boys', 'House of God resident; the Birmingham sound\'s technician.', '--drums'],
  ['Regis', 'Birmingham', '1993–', 'Downwards, Sandwell District', 'Industrial techno\'s architect; later the quiet influence on everyone.', '--drums'],
  ['Luke Slater', 'UK', '1989–', 'Planetary Assault Systems, Mote-Evolver', 'Thirty years of polymetric, hypnotic machine funk.', '--drums'],
  ['Laurent Garnier', 'Manchester / Paris', '1987–', 'Rex Club, F Communications', 'Haçienda resident, then France\'s techno conscience; marathon sets.', '--synth'],
  ['Sven Väth', 'Frankfurt', '1982–', 'Omen, Harthouse, Cocoon', 'Papa Sven: Omen, trance\'s birth, Cocoon Ibiza for two decades.', '--synth'],
  ['Joey Beltram', 'New York', '1989–', 'R&S', '"Energy Flash" (1990) and "Mentasm": the hoover, the rave.', '--synth'],
  ['Dimitri Hegemann', 'Berlin', '1988–', 'UFO, Tresor', 'Found a bank vault and put Detroit in it.', '--rumble'],
  ['Tanith', 'Berlin', '1988–', 'UFO, Tresor, E-Werk', 'Berlin\'s first techno DJ: UFO resident, then Tresor and E-Werk; the hard, fast West Berlin line.', '--rumble'],
  ['Dr. Motte', 'Berlin', '1989–', 'Love Parade', '150 people, one truck, 1 July 1989.', '--rumble'],
  ['Mark Ernestus & Moritz von Oswald', 'Berlin', '1993–', 'Basic Channel, Hard Wax', 'Dub techno; the record shop at the centre of the city.', '--rumble'],
  ['Ellen Allien', 'Berlin', '1999–', 'BPitch Control', 'Berlin\'s most consistent label boss and ambassador.', '--rumble'],
  ['Ben Klock', 'Berlin', '2005–', 'Berghain, Klockworks', '"Subzero", "One", the Berghain 04 mix; the rumble\'s definer.', '--rumble'],
  ['Marcel Dettmann', 'Berlin', '2005–', 'Berghain, MDR', 'The other Berghain resident; harder, drier, Hard Wax-schooled.', '--rumble'],
  ['Chris Liebing', 'Frankfurt', '1990s–', 'CLR', 'Schranz and the hard loop era; then the AM/FM podcast.', '--synth'],
  ['Adam Beyer', 'Stockholm', '1996–', 'Drumcode', 'From Swedish loop techno to the biggest brand in peak-time.', '--drums'],
  ['Ricardo Villalobos', 'Berlin', '1994–', 'Perlon, Playhouse', '"Alcachofa"; the longest, strangest minimal sets.', '--synth'],
  ['Nina Kraviz', 'Moscow / Berlin', '2009–', 'трип', 'Acid, Siberia and Dekmantel; the most-booked DJ of the 2010s.', '--synth'],
  ['Helena Hauff', 'Hamburg', '2010–', 'Golden Pudel, Return to Disorder', 'Electro, EBM and acid on vinyl, no laptop.', '--synth'],
  ['Donato Dozzy', 'Rome', '2000–', 'Voices From The Lake, Spazio Disponibile', 'Hypnotic techno\'s quiet master.', '--rumble'],
  ['Blawan', 'UK / Berlin', '2010–', 'Karenn, Ternesc', 'Modular, physical, resampled drum-machine techno for the 2010s.', '--drums'],
  ['Charlotte de Witte', 'Ghent', '2010–', 'KNTXT', 'With Amelie Lens, the Belgian wave that made techno a festival headliner again.', '--drums'],
  ['Amelie Lens', 'Belgium', '2014–', 'Lenske, Exhale', 'Fast, acid-leaning peak-time; the 2020s\' biggest draw.', '--drums'],
  ['Dax J', 'London / Berlin', '2012–', 'Monnom Black', 'The 2010s\' hardest Berghain-era DJ; the bridge to hard techno.', '--drums'],
  ['Rrose', 'US / Berlin', '2011–', 'Eaux, Sandwell District', 'Hypnotic, slowly mutating techno; the Sandwell lineage continued.', '--rumble'],
  ['Paula Temple', 'UK / Berlin', '1998–', 'Noise Manifesto', 'Industrial techno as political noise.', '--drums'],
  ['Miss Djax', 'Eindhoven', '1989–', 'Djax-Up-Beats', 'Ran one of Europe\'s first techno labels and put Chicago acid on it.', '--synth']
];
const CLUBS = [
  ['The Music Institute', 'Detroit · 1988–89', '1315 Broadway. Juice bar, no alcohol, midnight to 9am. It closed in November 1989; accounts of the last record differ.', 'Music Institute Detroit 1315 Broadway'],
  ['Amnesia (Cocoon)', 'Ibiza · 1999–2017', 'The farmhouse super-club\'s Monday night, Sven Väth\'s for eighteen summers until Cocoon moved to Pacha in 2018. The club\'s own Balearic origin is in the house strand.', 'Cocoon Amnesia Ibiza Sven Vath'],
  ['Space', 'Ibiza · 1989–2016', 'Pepe Roselló\'s Playa d\'en Bossa club; the Terrace under the flight path; Carl Cox for 15 summers; closed 2 October 2016. Hï stands there now.', 'Space Ibiza Carl Cox terrace'],
  ['Tresor', 'Berlin · 1991–', 'The Wertheim vault (13 March 1991–2005), then the Kraftwerk power station from 2007. The Detroit–Berlin alliance in a cage.', 'Tresor Berlin club vault'],
  ['E-Werk', 'Berlin · 1993–97', 'An electrical substation on Wilhelmstraße; the big-room Berlin 90s; Paul van Dyk\'s home.', 'E-Werk Berlin club 1993'],
  ['Berghain / Panorama Bar', 'Berlin · 2004–', 'A 1953 power plant; Ostgut\'s reincarnation; Funktion-One; a 60-hour weekend; Sven at the door. The capital of techno.', 'Berghain Panorama Bar'],
  ['Omen', 'Frankfurt · 1988–98', 'Sven Väth\'s club on Junghofstraße; the birthplace of trance and the Frankfurt sound.', 'Omen Frankfurt Sven Vath'],
  ['The Que Club', 'Birmingham · 1989–2002, 2010–17', 'A Methodist hall: House of God on Fridays, Atomic Jam in the main room, Surgeon and Regis on the bill most weeks.', 'Que Club Birmingham Atomic Jam House of God'],
  ['Sub Club', 'Glasgow · 1987–', 'A basement on Jamaica Street; Slam\'s Subculture (1994–) is the longest-running weekly in the UK.', 'Sub Club Glasgow Slam Subculture'],
  ['The Orbit', 'Morley, Leeds · 1991–2003', 'After Dark in a small Yorkshire town: every Detroit, Berlin and Birmingham name played here. "Techno Mecca".', 'The Orbit Morley After Dark techno'],
  ['Lost', 'London · 1991–', 'Steve Bicknell and Sheree Rashit\'s warehouse parties; Jeff Mills\'s UK home; the London techno standard.', 'Lost London Steve Bicknell Jeff Mills'],
  ['fabric', 'London · 1999–', 'Three rooms under Smithfield market; the bodysonic floor; Craig Richards; the 2016 closure and the campaign that reopened it.', 'fabric London club Farringdon'],
  ['Rex Club', 'Paris · 1988–', 'Under the Grand Rex cinema; Laurent Garnier\'s Wake Up residency; the French techno institution.', 'Rex Club Paris Laurent Garnier'],
  ['Fuse', 'Brussels · 1994–', 'Belgium\'s techno temple; the first European club to book Detroit week after week.', 'Fuse Brussels club'],
  ['Liquid Room', 'Tokyo · 1994–', 'Kabukichō, then Ebisu; the room Jeff Mills recorded in on 28 October 1995.', 'Liquid Room Tokyo Jeff Mills'],
  ['Womb', 'Tokyo · 2000–', 'Shibuya; the Japanese techno room of the 2000s, with a Funktion-One and a mirrorball the size of a car.', 'Womb Tokyo club'],
  ['Bassiani', 'Tbilisi · 2014–', 'A swimming pool under the Dinamo stadium; raided by police in May 2018; the crowd danced in front of parliament.', 'Bassiani Tbilisi raid 2018'],
  ['Khidi', 'Tbilisi · 2016–', 'A Soviet-era building on the river; the harder, industrial counterpart to Bassiani.', 'Khidi Tbilisi club'],
  ['Printworks', 'London · 2017–23', 'A newspaper printing hall in Canada Water; the Press Halls; the 2010s festival-techno cathedral.', 'Printworks London Press Halls'],
  ['Fold', 'London · 2018–', 'Canning Town, 24-hour licence, no photos: the Berlin model in London.', 'Fold London club Canning Town']
];
const SETS = [
  ['Derrick May — The Music Institute', 'Detroit, 1988', 'The surviving recordings from 1315 Broadway: acid, Chicago and the first Detroit records, mixed by the man who made them, to the crowd they were made for.', 'Derrick May live Music Institute 1988'],
  ['Jeff Mills — Live at the Liquid Room, Tokyo', '28 October 1995', 'Released by React / Sony Japan in May 1996. Around seventy records in 67 minutes, cut between three decks with the EQ as an instrument. Confirmed tracks include Surgeon "Argon", Robert Armani "Wet Floor", X-102 "Intro", Mills\'s own "Humana", Ken Ishii "Extra" (Luke Slater remix), Jonzon & Hell "Lifeform" and, at the centre, "Strings of Life". The 30th-anniversary tour (2025–26) replays it with the original footage.', 'Jeff Mills Live at the Liquid Room Tokyo'],
  ['Plastikman — The Packard Plant', 'Detroit, 1994', 'Richie Hawtin\'s illegal parties in the abandoned car factory: a 303, a 909 and "Spastik" live, in the ruins the music was about.', 'Plastikman Packard Plant 1994 Richie Hawtin'],
  ['Richie Hawtin — Decks, EFX & 909 / DE9: Closer to the Edit', '1999 / 2001', 'The two mixes that moved DJing from records to loops: first with a 909 and effects over vinyl, then with Final Scratch and hundreds of edits of edits.', 'Richie Hawtin DE9 Closer to the Edit'],
  ['Laurent Garnier — Rex Club all-nighters', 'Paris, 1992–', 'Seven and eight hours from jazz to hard techno and back, in the club under the cinema. The template for the "journey" set.', 'Laurent Garnier Rex Club set'],
  ['Sven Väth — Cocoon closing, Amnesia', 'Ibiza, 2000–2019', 'The last Monday of every summer: marathon sets to sunrise under the ice cannons, trance in the morning, techno all night.', 'Sven Vath Cocoon Amnesia closing set'],
  ['Carl Cox — The Final Chapter, Space', 'Ibiza, 20 September 2016', 'Sixteen summers of residency ended with a set of nine or ten hours on vinyl and CDJs, including Jeff Mills\'s "The Bells" and Boo Williams\'s "Teckno Drome". The club closed twelve days later.', 'Carl Cox Space Ibiza closing 2016 final set'],
  ['Ben Klock & Marcel Dettmann — Klubnacht closings, Berghain', 'Berlin, 2005–', 'Unrecorded by rule. The ten-hour Sunday closing sets are the reason the Berghain sound exists; the residents\' mixes (Berghain 02 and 04) are the nearest document.', 'Ben Klock Berghain 04 mix Marcel Dettmann Berghain 02'],
  ['Jeff Mills — Exhibitionist', '2004', 'A DVD, not a set: Mills on three decks and a 909, filmed from above, so you can see what the Liquid Room sounds like.', 'Jeff Mills Exhibitionist DVD'],
  ['Nina Kraviz — Dekmantel / Boiler Room sets', '2014–', 'Acid, Russian records and the trip label\'s roster, broadcast to millions; the decade\'s best-known festival sets.', 'Nina Kraviz Dekmantel set'],
  ['Surgeon — Boiler Room / fabric', 'London, 2010s', 'Modular, live-edited, relentless; the Birmingham sound updated for streaming.', 'Surgeon Boiler Room London set']
];
const FESTS = [
  ['Love Parade', 'Berlin · 1989–2006 (Ruhr 2007–10)', 'From 150 people to 1.5 million in Tiergarten (1999). Ended after the Duisburg crush of 2010.'],
  ['Mayday', 'Berlin / Dortmund · 1991–', 'The first German indoor rave brand; the Westfalenhallen; the compilation CDs every teenager owned.'],
  ['Castlemorton Common', 'Worcestershire · May 1992', 'Spiral Tribe, Bedlam, Circus Warp: a week-long free festival that gave Britain the Criminal Justice Act.'],
  ['Tribal Gathering', 'UK · 1993–97', 'Universe\'s answer to the CJA: a licensed field with Detroit, Kraftwerk (1997) and the Orbital generation.'],
  ['Time Warp', 'Mannheim · 1994–', 'Born 26 November 1994 in Ludwigshafen with 2,000 people; the Maimarkthalle since 2000; production as the headliner.'],
  ['Sonar', 'Barcelona · 1994–', 'Day and night, art and club; the conference that became a festival.'],
  ['Nature One', 'Kastellaun · 1995–', 'A rocket base in the Hunsrück; the German rave as camping holiday.'],
  ['Awakenings', 'Amsterdam · 1997–', 'From the Gashouder (30 March 1997) to Spaarnwoude: the biggest techno festival in the world.'],
  ['Movement / DEMF', 'Detroit · 2000–', 'Hart Plaza, Memorial Day weekend; founded free by Carl Craig; the homecoming.'],
  ['Street Parade', 'Zürich · 1992–', 'A million people around the lake; Zürich techno was listed as cultural heritage in 2017, before Berlin.'],
  ['Boiler Room', 'London · 2010–', 'Not a festival: a camera in the room, which changed what a set is for.'],
  ['Dekmantel', 'Amsterdam · 2013–', 'The Amsterdamse Bos; the taste-maker\'s line-up; the 2010s canon was written here.'],
  ['Draaimolen', 'Tilburg · 2011–', 'A forest, art installations and the hypnotic end of the spectrum.'],
  ['Houghton', 'Norfolk · 2017–', 'Craig Richards\'s 24-hour licence in a stately home\'s grounds.']
];
const BRANCHES = [
  ['detroit', 'Detroit techno', '1985–', 'Detroit', 'Kraftwerk + P-Funk + electro through a 909; instrumental, futurist.', 'Chapter 02', 'Detroit 1988', '--kick'],
  ['bleep', 'Bleep', '1989–91', 'Sheffield / Leeds', 'Detroit minimalism over reggae sound-system sub-bass; sine bleeps as hooks.', 'Chapter 03', 'UK bleep 1990', '--drums'],
  ['berlin', 'Berlin / Tresor techno', '1991–', 'Berlin', 'Detroit records played harder and faster in a vault; no clap.', 'Chapter 05', 'Tresor 1992', '--rumble'],
  ['hardcore', 'Hardcore / rave → jungle', '1990–93', 'London / Belgium', 'Breakbeats, hoovers and pianos at 140; left techno for jungle and drum & bass in 1993.', 'Own strand (planned)', 'UK rave 1991', '--drums'],
  ['acidtek', 'Acid techno', '1993–', 'London', 'The free-party dialect: 303s and 909s at 140, Stay Up Forever.', 'Chapter 03', 'Acid techno 1994', '--drums'],
  ['gabber', 'Gabber / hardcore techno', '1992–', 'Rotterdam', 'Distorted kicks at 160–200; Parkzicht, Thunderdome. Hardstyle descends from it.', 'Own strand (planned)', null, '--synth'],
  ['trance', 'Trance', '1991–', 'Frankfurt', 'Harthouse and Eye Q: techno\'s euphoric, melodic exit, which became its own industry.', 'Own strand (planned)', null, '--synth'],
  ['bham', 'Birmingham / UK industrial', '1993–', 'Birmingham', 'Downwards, House of God: Throbbing Gristle meets Detroit; dry, metallic, relentless.', 'Chapter 03', 'Birmingham 1995', '--drums'],
  ['dub', 'Dub techno', '1993–', 'Berlin', 'Basic Channel: a chord into a tape delay into a filter; the hypnotic lineage\'s root.', 'Chapter 05', 'Dub techno 1995', '--rumble'],
  ['idm', 'Ambient / "intelligent" techno', '1992–', 'Sheffield / Cornwall', 'Warp\'s Artificial Intelligence series, Aphex, Autechre, the Black Dog: techno for the chair.', 'Own strand (planned)', null, '--synth'],
  ['schranz', 'Schranz / hardgroove', '1997–2005', 'Frankfurt / London', 'Loop techno at 140–150: Liebing\'s distortion, Sims\'s swing. Revived 2021.', 'Chapter 07', 'Schranz 2002', '--drums'],
  ['minimal', 'Minimal', '1994 / 2001–08', 'Detroit → Berlin', 'Hood named it; Hawtin, Villalobos and Perlon made it a decade.', 'Chapter 07', 'Minimal 2004', '--synth'],
  ['techhouse', 'Tech-house', '1995–', 'London → Ibiza', 'The crossing: house groove, techno sound design. Claimed by both strands; told in the house one and in London (Chapter 04).', 'House strand', 'Tech-house 1997', '--muted'],
  ['berghain', 'Berghain / Ostgut Ton sound', '2005–', 'Berlin', 'The rumble as bassline; tool techno for ten-hour sets.', 'Chapter 09', 'Berghain 2010', '--rumble'],
  ['hypnotic', 'Hypnotic', '2012–', 'Italy / Berlin', 'Polymeters that never resolve, long subs, dub\'s grandchildren: Dozzy, Rrose, Voices From The Lake.', 'Chapter 09', 'Hypnotic 2015', '--rumble'],
  ['industrial', 'Industrial revival', '2013–', 'Berlin / Paris', 'Birmingham\'s line at 140: Ancient Methods, Perc, Paula Temple, Dax J.', 'Chapter 09', 'Industrial 2018', '--drums'],
  ['peak', 'Peak-time / "business" techno', '2014–', 'Stockholm / Amsterdam', 'Drumcode and the main stage: offbeat bass, big claps, arpeggios.', 'Chapter 09', 'Peak-time 2017', '--drums'],
  ['electro', 'Electro (techno side)', '1982 / 2010s revival', 'Detroit / Hamburg', 'Drexciya to Helena Hauff and DJ Stingray; the broken-beat sibling.', 'Own strand (planned)', null, '--synth'],
  ['hard', 'Hard techno', '2020–', 'everywhere', '150+ BPM, hoovers, snare rolls, distortion: schranz + hardcore + trance, rebuilt by a generation raised on phones.', 'Chapter 10', 'Hard techno 2023', '--kick'],
  ['house', 'House (the sibling)', '1984–', 'Chicago / New York', 'Disco\'s continuation; a different music with a shared grid.', 'House strand', 'Chicago acid 1987', '--muted']
];
function renderBranches(){
  const bg = document.getElementById('branchGrid'); if (!bg || bg.childElementCount) return;
  BRANCHES.forEach(([key, name, years, city, dna, where, genre, col]) => { const d = document.createElement('div'); d.className = 'ccard'; d.id = 'branch-' + key; d.style.setProperty('--c', `var(${col})`); d.innerHTML = `<h4>${name}</h4><div class="meta">${years} · ${city}</div><p>${dna}</p><div class="row" style="margin:6px 0"><span class="tag">${where}</span></div><div class="era"></div>`; if (genre){ const b = document.createElement('button'); b.className = 'play era-btn'; b.dataset.genre = genre; b.dataset.bars = 2; b.textContent = 'Hear it: ' + genre; d.querySelector('.era').appendChild(b); } bg.appendChild(d); });
}
function renderCards(){
  const pp = document.getElementById('peopleGrid'); if (pp && !pp.childElementCount) PEOPLE.forEach(([n, city, era, labels, blurb, col]) => { const d = document.createElement('div'); d.className = 'pcard'; d.style.setProperty('--c', `var(${col})`); const ini = n.split(/[\s&]+/).filter(Boolean).map(w => w[0]).join('').replace(/["]/g, '').slice(0, 3); const nid = (NODES.find(x => x.type === 'person' && (x.title === n || (x.aliases || []).includes(n))) || {}).id; d.innerHTML = `<div class="mono">${ini}</div><div><h4>${nid ? `<a class="xl" href="#${nid}">${n}</a>` : n}</h4><div class="meta">${city} · ${era} · ${labels}</div><p>${blurb}</p><div class="links"></div></div>`; chipsInto(d.querySelector('.links'), [['sp', 'listen', n], ['yt', 'watch', n + ' DJ set']]); pp.appendChild(d); });
  const cc = document.getElementById('clubGrid'); if (cc && !cc.childElementCount) CLUBS.forEach(([n, meta, blurb, q]) => { const d = document.createElement('div'); d.className = 'ccard'; const cid = (NODES.find(x => x.type === 'club' && (x.title === n || n.startsWith(x.title) || (x.aliases || []).some(a => n.includes(a)))) || {}).id; d.innerHTML = `<h4>${cid ? `<a class="xl" href="#${cid}">${n}</a>` : n}</h4><div class="meta">${meta}</div><p>${blurb}</p><div class="chips"></div>`; chipsInto(d.querySelector('.chips'), [['yt', 'inside the club', q + ' documentary'], ['g', 'history', q + ' history']]); cc.appendChild(d); });
  const ss = document.getElementById('setGrid'); if (ss && !ss.childElementCount) SETS.forEach(([n, meta, blurb, q]) => { const d = document.createElement('div'); d.className = 'ccard'; d.innerHTML = `<h4>${n}</h4><div class="meta">${meta}</div><p>${blurb}</p><div class="chips"></div>`; chipsInto(d.querySelector('.chips'), [['yt', 'find the recording', q], ['g', 'tracklist', q + ' tracklist'], ['dg', 'release', q]]); ss.appendChild(d); });
  const ff = document.getElementById('festGrid'); if (ff && !ff.childElementCount) FESTS.forEach(([n, meta, blurb]) => { const d = document.createElement('div'); d.className = 'ccard'; d.innerHTML = `<h4>${n}</h4><div class="meta">${meta}</div><p>${blurb}</p><div class="chips"></div>`; chipsInto(d.querySelector('.chips'), [['yt', 'aftermovie / sets', n + ' festival techno set'], ['g', 'history', n + ' festival history']]); ff.appendChild(d); });
}
function drawHistoryAll(){
  drawTimeline(); drawPreTimeline(); drawCityNet(); drawGenreTree(); drawBpmChart(); drawUKMap(); drawLondonMap(); drawExchange(); drawIbiza(); drawBerlinClubs(); drawEuroNet(); drawClubAnatomy(); drawFestCal();
  drawPoster('posterMachines', 'chicago', 'ROOTS', 'DÜSSELDORF · THE BRONX · DETROIT RADIO · 1974–85');
  drawPoster('posterDetroit', 'detroit', 'DETROIT', 'HI-TECH SOUL · BELLEVILLE · 1985–1992');
  drawPoster('posterAcid', 'acid', 'REPETITIVE BEATS', 'SHEFFIELD · BIRMINGHAM · SPIRAL TRIBE · 1989–99');
  drawPoster('posterLdn', 'london', 'WEST CENTRAL ST', 'CAMDEN PALACE · CLINK STREET · THE END · 1986–2009');
  drawPoster('posterIbiza', 'ibiza', 'TERRAZA', 'COCOON · SPACE · ENTER. · 2000–');
  drawPoster('posterBerlin', 'berlin', 'TRESOR', 'LEIPZIGER STRASSE 126A · 1991');
  drawPoster('posterDub', 'dub', 'EUROPA', 'GHENT · FRANKFURT · ROTTERDAM · PARIS');
  drawPoster('posterMinimal', 'minimal', 'MNML', 'BERLIN · COLOGNE · 2001–2008');
  drawPoster('posterBerghain', 'berghain', 'KLUBNACHT', 'AM WRIEZENER BAHNHOF · 2004–');
  drawPoster('posterHard', 'hard', '150+', 'EVERYWHERE · 2020–');
  renderCards(); renderBranches(); renderChipBlocks(); wireEraButtons();
}
window.PageHooks = window.PageHooks || {};
['h0', 'pre', 'h1', 'h2', 'h3', 'ldn', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14', 'house0'].forEach(p => { window.PageHooks[p] = () => { if (!window._histDrawn){ window._histDrawn = true; drawHistoryAll(); } const qb = p === 'h14' && (location.hash.split('?')[1] || '').match(/(?:^|&)b=([a-z0-9-]+)/); if (qb) window._branchTarget = qb[1]; if (p === 'h14' && window._branchTarget){ const t = document.getElementById('branch-' + window._branchTarget); window._branchTarget = null; if (t) setTimeout(() => { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.style.outline = '2px solid #fff'; setTimeout(() => t.style.outline = '', 1800); }, 350); } }; });

/* ===================================================================
   RAVE STRAND VISUALS
   =================================================================== */
function drawOrbital(){
  const svg = document.getElementById('orbitalMap'); if (!svg) return; const W = 600, H = 400; clearSvg(svg, W, H);
  const ring = el('circle', { cx: 300, cy: 200, r: 150, fill: 'none', stroke: css('--perc'), 'stroke-width': 10, opacity: .35 }, svg); text(svg, 300, 60, 'M25', { 'text-anchor': 'middle', fill: css('--perc'), 'font-weight': 600 });
  const mid = el('g', {}, svg);
  el('circle', { cx: 300, cy: 200, r: 34, fill: '#1b1b24', stroke: '#8f8fa0' }, mid); text(mid, 300, 198, 'London', { 'text-anchor': 'middle', fill: '#ebebf1', 'font-weight': 600 }); text(mid, 300, 211, 'Genesis · Shoom · Spectrum', { 'text-anchor': 'middle', 'font-size': 7.5 });
  Dg.mark(mid, { id: 'london', meta: 'Genesis · Shoom · Spectrum', go: 'Open London' });
  const raves = [['Sunrise', 'sunrise', 20], ['Energy', 'energy', 75], ['Biology', 'biology', 130], ['Raindance', 'raindance', 190], ['World Dance', 'world-dance', 250], ['Genesis', 'genesis', 300], ['Back to the Future', 'back-to-the-future', 340]];
  raves.forEach(([n, id, a]) => {
    const r = a * Math.PI / 180, x = 300 + Math.cos(r) * 150, yy = 200 + Math.sin(r) * 150; const g = el('g', {}, svg);
    el('circle', { cx: x, cy: yy, r: 7, fill: css('--perc') }, g); el('circle', { class: 'dg-hit', cx: x, cy: yy, r: 15 }, g);
    const ox = Math.cos(r) * 48, oy = Math.sin(r) * 48; el('line', { x1: x, y1: yy, x2: x + ox, y2: yy + oy - 3, stroke: 'transparent', 'stroke-width': 18, 'pointer-events': 'stroke' }, g); text(g, x + ox, yy + oy, n, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-size': 10 });
    Dg.mark(g, NODE[id] ? { id } : { title: n, href: null });
  });
  text(svg, 20, H - 16, 'Warehouses, hangars and fields ringed the motorway so convoys from London could reach them in under an hour.', { 'font-size': 9 });
}
function drawPirateMap(){
  const svg = document.getElementById('pirateMap'); if (!svg) return; const W = 600, H = 330; clearSvg(svg, W, H);
  const groups = [['acid house & rave, 1988–91', ['kiss-fm', 'centreforce', 'sunrise-fm', 'fantasy-fm', 'pulse-fm', 'dance-fm'], '--perc', 'a'], ['hardcore & jungle, 1991–96', ['kool-fm', 'don-fm', 'eruption-fm', 'weekend-rush', 'unity-fm', 'lazer-fm'], '--drums', 'b'], ['garage, grime, after', ['rinse-fm'], '--synth', 'c']];
  groups.forEach(([lab, ids, col, k], gi) => {
    const y = 40 + gi * 95; text(svg, 20, y, lab, { fill: css(col), 'font-weight': 600 });
    ids.forEach((id, i) => {
      const n = NODE[id]; if (!n) return; const x = 20 + (i % 6) * 95; const g = el('g', {}, svg); g.dataset.dgk = k;
      el('rect', { x, y: y + 12, width: 86, height: 44, rx: 8, fill: '#1b1b24', stroke: css(col) }, g);
      text(g, x + 43, y + 30, n.title.replace(/ FM.*|\s88\.3/, ''), { 'text-anchor': 'middle', fill: '#ebebf1', 'font-size': 10, 'font-weight': 600 }); text(g, x + 43, y + 46, n.years, { 'text-anchor': 'middle', 'font-size': 8.5 });
      Dg.mark(g, { id });
    });
  });
  text(svg, 20, H - 12, 'Transmitter on a tower block, studio elsewhere, a phone line for the rave info. Raided weekly, back by Saturday.', { 'font-size': 9 });
}
function drawRaveBpm(){
  const svg = document.getElementById('raveBpm'); if (!svg) return; const W = 400, H = 170, L = 36, R = 390, T = 14, B = 140; clearSvg(svg, W, H);
  const x = y => L + (y - 1988) / 6 * (R - L), yv = v => B - (v - 115) / 65 * (B - T);
  [120, 140, 160, 180].forEach(v => { el('line', { x1: L, y1: yv(v), x2: R, y2: yv(v), stroke: '#272733' }, svg); text(svg, 4, yv(v) + 3, v); });
  [1988, 1990, 1992, 1994].forEach(y => text(svg, x(y), 158, y, { 'text-anchor': y === 1994 ? 'end' : 'middle' }));
  /* [points, colour, label, key, the genre page whose sound to hear] */
  const lines = [[[[1988, 122], [1990, 128], [1991, 140], [1992, 150], [1993, 158], [1994, 165]], '--perc', 'jungle', 'j', 'g-jungle'], [[[1992, 150], [1993, 160], [1994, 170]], '--drums', 'happy hardcore', 'h', 'g-happy'], [[[1991, 140], [1992, 138], [1994, 135]], '--rumble', 'techno rooms', 't', 'g-berlin']];
  const paths = {}, at = {};
  lines.forEach(([pts, col, lab, k, gid]) => {
    const p = el('path', { class: 'dg-e', d: pathStr(pts.map(q => [x(q[0]), yv(q[1])])), fill: 'none', stroke: css(col), 'stroke-width': 2.5 }, svg); p.dataset.dgk = k; paths[k] = p;
    const last = pts[pts.length - 1]; const t = text(svg, x(last[0]) - 2, yv(last[1]) - 6, lab, { 'text-anchor': 'end', fill: css(col) }); t.dataset.dgk = k;
    pts.forEach(([yr, bpm]) => { const key = yr + ',' + bpm; (at[key] = at[key] || { yr, bpm, col, on: [] }).on.push([lab, k, gid]); });
  });
  /* one mark per point; where two lines meet (the 1992 split) the mark speaks for both */
  Object.values(at).forEach(({ yr, bpm, col, on }) => {
    const g = el('g', {}, svg); if (on.length === 1) g.dataset.dgk = on[0][1];
    el('circle', { cx: x(yr), cy: yv(bpm), r: on.length > 1 ? 4.2 : 3.2, fill: css(col) }, g); el('circle', { class: 'dg-hit', cx: x(yr), cy: yv(bpm), r: 9 }, g);
    const n = NODE[on[0][2]]; const names = on.map(o => o[0]); const title = names.join(' and '); 
    Dg.mark(g, { title: title.charAt(0).toUpperCase() + title.slice(1) + ', ' + yr, meta: 'about ' + bpm + ' BPM' + (on.length > 1 ? ' · where they split' : ''), text: '', href: n ? '#' + on[0][2] : null, go: n ? 'Open ' + n.title : null, play: n && n.preset, links: on.slice(1).filter(o => NODE[o[2]]).map(o => ['Open ' + NODE[o[2]].title, '#' + o[2]]), rel: on.map(o => paths[o[1]]) });
  });
  Dg.legend(svg, lines.map(([, col, lab, k]) => [k, lab, css(col)]), 'after');
}

function drawCjaChart(){
  const svg = document.getElementById('cjaChart'); if (!svg) return; const W = 600, H = 330, L = 60; clearSvg(svg, W, H);
  /* [year, what happened, colour, the book's page for it] */
  const steps = [['1988', 'Warehouse parties; Janet Mayes\'s death; the first raids', '--perc', null], ['1989', 'White Waltham and "Spaced Out!"; Kent\'s Pay Party Unit; Thatcher takes an interest', '--perc', 'law-pay-party-unit'], ['1990', 'Bright Bill: £20,000 fines; 836 arrested at Gildersome; promoters go licensed', '--drums', 'law-bright-bill'], ['1992', 'Castlemorton: 20–40,000 for a week; Spiral Tribe charged', '--kick', 'castlemorton'], ['1994', 'CJPOA s.63: "repetitive beats"; three marches; Hyde Park riot', '--kick', 'cja']];
  steps.forEach((s, i) => {
    const y = 30 + i * 58; if (i) el('line', { x1: L + 30, y1: y - 14, x2: L + 30, y2: y, stroke: '#8f8fa0' }, svg);
    const g = el('g', {}, svg); el('rect', { x: L, y, width: 520, height: 44, rx: 8, fill: '#1b1b24', stroke: css(s[2]) }, g);
    text(g, L + 12, y + 18, s[0], { fill: css(s[2]), 'font-weight': 700, 'font-size': 12 }); text(g, L + 12, y + 34, s[1], { fill: '#ebebf1', 'font-size': 9.5 });
    const n = s[3] && NODE[s[3]];
    Dg.mark(g, { title: s[0] + ': ' + s[1].split(';')[0], meta: n ? n.title : 'On this page', text: n ? n.blurb : '', href: n ? '#' + s[3] : null, go: n ? 'Open: ' + n.title : null, find: n ? null : s[1].split(';')[1].trim().replace(/'s death/, '') });
  });
}
function renderRaveGrid(){
  const g = document.getElementById('raveGrid'); if (!g || g.childElementCount) return;
  const items = NODES.filter(n => ['person', 'collective', 'station', 'event'].includes(n.type) && n.strands[0] === 'rave').sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  items.forEach(n => { const d = document.createElement('a'); d.className = 'pcard'; d.href = '#rave-' + n.id; d.style.textDecoration = 'none'; d.style.setProperty('--c', `var(${TYPE_COLOR[n.type]})`); const ini = n.title.split(/[\s&]+/).filter(Boolean).map(w => w[0]).join('').replace(/[^A-Za-z0-9]/g, '').slice(0, 3); d.innerHTML = `<div class="mono">${ini}</div><div><h4>${n.title}</h4><div class="meta">${TYPE_LABEL[n.type]} · ${n.years}</div><p>${n.blurb.slice(0, 160)}${n.blurb.length > 160 ? '…' : ''}</p></div>`; g.appendChild(d); });
}
function drawRaveAll(){
  drawOrbital(); drawPirateMap(); drawRaveBpm(); drawCjaChart(); renderRaveGrid();
  drawPoster('posterRave0', 'rave', 'RAVE', 'SOHO 1958 · THE M25 1989 · THE FIELD 1992');
  drawPoster('posterRave1', 'acid', 'ACIEED', 'SUNRISE · ENERGY · BIOLOGY · 1988–90');
  drawPoster('posterRave3', 'hard', 'HARDCORE', 'BREAKS · HOOVERS · PIANOS · 1991');
  drawPoster('posterRave4', 'rave', 'FREE PARTY', 'SPIRAL TRIBE · DIY · EXODUS · 1990–');
  drawPoster('posterRave6', 'minimal', 'LICENSED', 'RAINDANCE · FANTAZIA · MINISTRY · 1991–');
  drawPoster('posterRave7', 'dub', 'JUNGLE', 'RAGE · KOOL FM · AWOL · 1993');
  renderChipBlocks(); wireEraButtons();
}
['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'].forEach(p => { window.PageHooks[p] = () => { if (!window._raveDrawn){ window._raveDrawn = true; drawRaveAll(); } }; });

/* ===================================================================
   JUNGLE / TRANCE / HOUSE VISUALS + IMAGES
   =================================================================== */
function renderStrandGrid(gridId, strand, prefix){
  const g = document.getElementById(gridId); if (!g || g.childElementCount) return;
  const items = NODES.filter(n => ['person', 'collective', 'station', 'event', 'label', 'club'].includes(n.type) && n.strands[0] === strand).sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  items.forEach(n => { const d = document.createElement('a'); d.className = 'pcard'; d.href = '#' + prefix + '-' + n.id; d.style.textDecoration = 'none'; d.style.setProperty('--c', `var(${TYPE_COLOR[n.type]})`); const ini = n.title.split(/[\s&]+/).filter(Boolean).map(w => w[0]).join('').replace(/[^A-Za-z0-9]/g, '').slice(0, 3); d.innerHTML = `<div class="mono">${ini}</div><div><h4>${n.title}</h4><div class="meta">${TYPE_LABEL[n.type]} · ${n.years}</div><p>${n.blurb.slice(0, 150)}${n.blurb.length > 150 ? '…' : ''}</p></div>`; g.appendChild(d); });
}
function drawStrandsAll(){
  drawPoster('posterJ0', 'rave', 'JUNGLE', 'THE AMEN · 160 · 1993');
  drawPoster('posterJ1', 'hard', 'RAGE', 'HEAVEN · THURSDAYS · 1988–93');
  drawPoster('posterJ2', 'dub', 'JUNGLIST', 'KOOL FM · AWOL · 1994');
  drawPoster('posterJ3', 'minimal', 'TIMELESS', 'METALHEADZ · SPEED · 1995–2000');
  drawPoster('posterJ4', 'berghain', '174', 'HOSPITALITY · RAM · THE REVIVAL');
  drawPoster('posterT0', 'rave', 'TRANCE', 'THE BREAKDOWN · THE DROP · 138');
  drawPoster('posterT1', 'acid', 'EYE Q', 'FRANKFURT · OMEN · 1990–95');
  drawPoster('posterT2', 'ibiza', 'ANJUNA', 'GOA · FULL MOON · 1969–');
  drawPoster('posterT3', 'minimal', 'GATECRASHER', 'SHEFFIELD · UTRECHT · 1999');
  drawPoster('posterT4', 'dub', 'ASOT 1000', 'THE INSTITUTION · 2001–');
  drawPoster('posterHH1', 'chicago', 'WAREHOUSE', 'SOUTH JEFFERSON STREET · 1977');
  drawPoster('posterHH2', 'detroit', 'GARAGE', 'KING STREET · 1977–87');
  drawPoster('posterHH3', 'ibiza', 'BALEARIC', 'AMNESIA TERRACE · 1984');
  drawPoster('posterHH4', 'acid', 'SHOOM', 'SOUTHWARK · DECEMBER 1987');
  drawPoster('posterHH5', 'rave', 'FAC 51', 'WHITWORTH STREET WEST · 1982–97');
  drawPoster('posterHH6', 'minimal', 'HOUSE', 'EVERY DIALECT · 1990–');
  renderStrandGrid('jungleGrid', 'jungle', 'jungle'); renderStrandGrid('tranceGrid', 'trance', 'trance');
  renderChipBlocks(); wireEraButtons();
}
['j0', 'j1', 'j2', 'j3', 'j4', 'j5', 't0', 't1', 't2', 't3', 't4', 't5', 'hh1', 'hh2', 'hh3', 'hh4', 'hh5', 'hh6'].forEach(p => { window.PageHooks[p] = () => { if (!window._strandsDrawn){ window._strandsDrawn = true; drawStrandsAll(); } }; });
/* ---- chapter hero images + credits ---- */
function heroFor(id){
  const art = document.querySelector(`.page[data-page="${id}"]`); if (!art || art.dataset.hero) return; art.dataset.hero = 1;
  const im = (window.IMAGES || {})['ch:' + id]; if (!im) return;
  const lede = art.querySelector('.lede'); if (!lede) return;
  const fig = document.createElement('figure'); fig.className = 'hero-img'; if (im.w && im.w < 720){ fig.classList.add('hero-narrow'); fig.style.setProperty('--hw', Math.round(im.w * 1.3) + 'px'); } fig.innerHTML = `<img src="${im.src}" alt="${imgCaption(im).replace(/"/g, '&quot;')}" loading="lazy"><figcaption>${imgCaption(im)} · ${im.author} · <a href="${im.page}" target="_blank" rel="noopener">${im.license}</a> via Wikimedia Commons${window.Rights ? ' · ' + Rights.link('ch:' + id, im.src, id) : ''}</figcaption>`;
  lede.insertAdjacentElement('afterend', fig);
}
Object.keys(CHAPTER_TITLES).forEach(id => { const prev = window.PageHooks[id]; window.PageHooks[id] = () => { if (prev) prev(); heroFor(id); }; });
window.PageHooks.credits = () => {
  const box = document.getElementById('creditList'); if (!box || box.childElementCount) return;
  /* one card per photograph: a file used on several pages (a venue and the nights it housed) is credited once, with every page it illustrates */
  const byFile = new Map(); Object.entries(window.IMAGES || {}).forEach(([key, im]) => { if (!im) return; const f = im.page || im.src; if (!byFile.has(f)) byFile.set(f, { im, keys: [] }); byFile.get(f).keys.push(key); });
  const where = key => { const target = key.startsWith('ch:') ? key.slice(3) : key; const label = key.startsWith('ch:') ? (CHAPTER_TITLES[target] || target) : (NODE[target] ? NODE[target].title : target); return `<a class="xl" href="#${target}">${label}</a>`; };
  byFile.forEach(({ im, keys }) => { const d = document.createElement('div'); d.className = 'ccard'; d.innerHTML = `<img src="${im.src}" style="width:100%;border-radius:8px;margin-bottom:8px" loading="lazy"><h4>${where(keys[0])}</h4><div class="meta">${im.license}</div><p>${imgCaption(im)}<br><small>${im.title.replace('File:', '')}</small><br>by ${im.author} · <a class="xl" href="${im.page}" target="_blank" rel="noopener">source</a>${im.licenseUrl ? ` · <a class="xl" href="${im.licenseUrl}" target="_blank" rel="noopener">licence</a>` : ''}${keys.length > 1 ? `<br><small>Also on: ${keys.slice(1).map(where).join(', ')}</small>` : ''}${window.Rights ? '<br>' + Rights.link(keys[0], im.src, keys[0].replace(/^ch:/, '')) : ''}</p>`; box.appendChild(d); });
};
