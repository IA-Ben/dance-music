/* ===================================================================
   NODE ENGINE — node pages, autolinks, backlinks, trail, framings,
   forks, neighbourhood graph, year scrubber, explore, search
   =================================================================== */
const Trail = { items: [], push(id, title){ if (this.items.length && this.items[this.items.length - 1].id === id) return; this.items.push({ id, title }); if (this.items.length > 40) this.items.shift(); this.render(); },
  render(){ const el = document.getElementById('trail'); if (!el) return; el.innerHTML = ''; this.items.slice(-8).forEach((t, i, arr) => { const a = document.createElement('a'); a.href = '#' + t.id; a.textContent = t.title; a.className = i === arr.length - 1 ? 'cur' : ''; el.appendChild(a); if (i < arr.length - 1){ const s = document.createElement('span'); s.textContent = '›'; el.appendChild(s); } }); } };
const Visited = { set: new Set(), load(){ try { JSON.parse(localStorage.getItem('tb-visited') || '[]').forEach(x => this.set.add(x)); } catch (e) {} }, add(id){ this.set.add(id); try { localStorage.setItem('tb-visited', JSON.stringify([...this.set])); } catch (e) {} } };
Visited.load();

/* ---------- alias index for autolinking ---------- */
let ALIASES = null;
/* names that point at a page without being its title: members, festivals, teams, nicknames (used only while no page has the name) */
const ALIAS_EXTRA = { acid: ['Acid House', 'Acid house'], balearic: ['Balearic Beat', 'Balearic beat'], orbital: ['Paul Hartnoll', 'Phil Hartnoll'], movement: ['DEMF', 'Detroit Electronic Music Festival', 'Movement festival'], 'masters-at-work': ['Louie Vega', 'Kenny Dope', 'Little Louie Vega'], 'dance-2-trance': ['Rolf Ellmer'], wbmx: ['Hot Mix 5', 'Hot Mix Five'], 'paradise-garage': ['the Garage', 'The Garage'],
  /* club nights named in the text by another form (nights audit, November 2026) */
  spectrum: ['Land of Oz'], rage: ['Rage'], 'flesh-hacienda': ['Flesh'], 'home-of-la-troya': ['La Troya', 'La Troya Asesina', 'La Vaca Asesina'], 'horoom-nights': ['Horoom'], 'queen-smartbar': ['Queen!'], 'enter-ibiza': ['ENTER.'], 'we-love': ['We Love…'], 'heavenly-sunday-social': ['Heavenly Social'], 'set-metalheadz': ['Metalheadz Sunday Sessions', 'Metalheadz Sundays'], 'the-loft': ['Love Saves the Day'], homoelectric: ['Homobloc'] };
/* a name another page claims by mistake */
const ALIAS_FORCE = { Universe: 'tribal-gathering', Trax: 'trax', Cocoon: 'cocoon', 'Golden Pudel Club': 'golden-pudel',
  /* nights whose one-word names are on ALIAS_DENY: linked only in these longer forms the text uses */
  "Energy's": 'energy', "Energy's Jeremy Taylor": 'energy', "Energy's second party": 'energy', "Energy's Quentin Chambers": 'energy', "Energy's Chambers and Taylor": 'energy', "Bukem's Speed": 'speed', 'Pure in Edinburgh': 'pure', 'Sunday night Orange': 'orange-nation', "Bryan Gee's Movement": 'bar-rumba', 'Bedrock became a night': 'bedrock-night', 'Monday-night Trash': 'trash-the-end' };
/* words that are also something else: never linked on their own */
const ALIAS_DENY = /^(Paradiso|January|February|March|April|May|June|July|August|September|October|November|December|Live|Papua New Guinea|Last Night a DJ Saved My Life|Space|Future|Hospital|Virus|Planet|Flying|Base|Release|Harmony|Drop|Cyclone|Trip|Music|Energy|Strings|Circles|Original|Loaded|Pure|Speed|Flavour|Incredible|Terrorist|Movement|the End|the Loop|the Box|the Club|the Room|the Gallery)$/;
/* the same, for names on the generated subject pages (graph-gen.js, written by /tmp/deep2/tools/gen_nodes.py); a page marked exact links only on its name as written, case for case */
const ALIAS_DENY_GEN = new Set(window.GEN_ALIAS_DENY || []);
/* chapter titles too generic to link from running text */
const CHAPTER_NOLINK = /^(a\d|h11)$/;
/* spelling variants of a name: accents, apostrophes, curly quotes (as strong as the name itself) */
function aliasSpellings(a, n){
  const out = new Set([a]);
  if (n && n.type === 'genre' && /\s/.test(a)){ const tc = a.replace(/(^|\s)([a-z])/g, (m, b, c) => b + c.toUpperCase()); if (tc !== a) out.add(tc); }
  [...out].forEach(x => { const p = x.normalize('NFD').replace(/[̀-ͯ]/g, ''); if (p !== x) out.add(p); });
  [...out].forEach(x => { if (/['’]/.test(x)){ out.add(x.replace(/’/g, "'")); out.add(x.replace(/'/g, '’')); } });
  return [...out];
}
/* shortened forms of a name: weaker, used only while no page has them as a name */
function aliasShortenings(a, n){
  const out = new Set(); const add = x => { x = x.replace(/\s+/g, ' ').trim(); if (x.length >= 3 && x !== a) out.add(x); };
  add(a.replace(/\s*\([^)]*\)\s*$/, ''));                                               /* "Club UK (Final Frontier)" → "Club UK" */
  add(a.replace(/\.$/, ''));
  if (n.type !== 'record' && / \/ /.test(a)) a.split(' / ').forEach(x => { if (/\s/.test(x) || /^[A-Z0-9]{3,}$/.test(x)) add(x); });
  if (/"[^"]+"/.test(a)){ add(a.replace(/"([^"]+)"/g, '$1')); add(a.replace(/\s*"[^"]+"\s*/g, ' ')); add(a.replace(/"([^"]+)"/g, '“$1”')); }
  [a, ...out].forEach(x => { if (/^The /.test(x)){ const rest = x.slice(4); if (/\s/.test(rest)) add(rest); else if (/^[A-ZÀ-Þ]/.test(rest)) add('the ' + rest); } });
  if (n.type === 'record'){ const t = (n.title.split(' — ')[1] || '').replace(/\s*\([^)]*\)\s*$/, ''); if (t && t.split(/\s+/).length >= 3 && t.length >= 12) add(t); }
  return [...out].flatMap(x => aliasSpellings(x, n));
}
function buildAliases(){
  if (ALIASES) return ALIASES; const claim = new Map();
  const ok = a => a && a.length >= 3 && !ALIAS_DENY.test(a) && !ALIAS_DENY_GEN.has(a);
  const strong = n => { const names = [n.title, ...(n.aliases || [])]; if (n.exact) return names.filter(Boolean); if (n.type === 'record'){ const t = n.title.split(' — ')[1]; if (t){ const bare = t.replace(/\s*\([^)]*\)\s*$/, ''); names.push('"' + bare + '"', '“' + bare + '”'); if (bare !== t) names.push('"' + t + '"'); } } return names.filter(Boolean).flatMap(a => aliasSpellings(a, n)).filter(a => !(n.type === 'record' && !/\s/.test(a) && !/^["“]/.test(a) && a.length < 9)); };
  /* 1. names and their spellings (a later page wins a shared name, as before) */
  NODES.forEach(n => strong(n).forEach(a => { if (ok(a)) claim.set(a, n.id); }));
  /* 2. extra names, where free */
  Object.entries(ALIAS_EXTRA).forEach(([id, names]) => { if (typeof NODE !== 'undefined' && !NODE[id]) return; names.forEach(a => { if (ok(a) && !claim.has(a)) claim.set(a, id); }); });
  /* 3. shortened forms, where free and not claimed by two pages at once */
  const weak = new Map(); NODES.filter(n => !n.exact).forEach(n => [n.title, ...(n.aliases || [])].filter(Boolean).forEach(nm => aliasShortenings(nm, n).forEach(a => { if (!ok(a) || claim.has(a)) return; const w = weak.get(a); weak.set(a, w && w !== n.id ? null : n.id); })));
  weak.forEach((id, a) => { if (id) claim.set(a, id); });
  Object.entries(ALIAS_FORCE).forEach(([a, id]) => { if (typeof NODE === 'undefined' || NODE[id]) claim.set(a, id); });
  /* 4. chapter titles and years */
  Object.entries(CHAPTER_TITLES).forEach(([id, t]) => { if (!/^(home|year|explore)$/.test(id) && !CHAPTER_NOLINK.test(id) && ok(t)) claim.set(t, id); if (/^y\d{4}$/.test(id)) claim.set(id.slice(1), id); });
  const list = [...claim.entries()].sort((a, b) => b[0].length - a[0].length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const q = s => esc(s).replace(/['’]/g, "['’]").replace(/["“”]/g, '["“”]');
  ALIASES = { list, re: new RegExp('(^|[^\\w\\-])(' + list.map(x => q(x[0])).join('|') + ')(?![\\w\\-])', 'g'), map: Object.fromEntries(list) };
  return ALIASES;
}
/* a bare one-word name inside a longer name ("Desert Storm", "Front 242", "House of God", "Stoke Newington") is not that page */
const CAP_FUNC = new Set('DJ MC Mr Mrs Ms Dr St Sir Saint Lady Lord A An And As At After Before Between Both But By During Each Even Every For From He Her Here His How I If In Into It Its Like Many Most My No Not Now Of On One Only Or Our Over She Since So Some Than That The Their Then There These They This Those Through To Two Three Four Under Until Unlike We What When Where Which While Who Why With Within Without Yet You Your'.split(' '));
function linkable(s, start, name){
  if (!/^[A-ZÀ-Þ][a-zà-ÿ’'.-]+$/.test(name)) return true;   /* only capitalised ordinary words: not acronyms, model numbers or lower-case terms */
  const after = s.slice(start + name.length, start + name.length + 30), before = s.slice(Math.max(0, start - 60), start);
  if (/^\s+(of|de|del|der|la|le)\s/.test(after)) return false;
  if (/^[  ]+[A-Z0-9À-Þ]/.test(after) && !/^[  ]+(I|A)\b/.test(after)) return false;
  const pm = before.match(/(^|[\s(])([A-ZÀ-Þ][\w’'.&-]*)[  ]+$/);
  if (pm && !CAP_FUNC.has(pm[2]) && !/['’]s$/.test(pm[2])){ const pre = before.slice(0, before.length - pm[0].length + pm[1].length); if (!/(^|[.!?:;—–]\s*)$/.test(pre)) return false; }
  if (/["“‘']$/.test(before)) return false;
  return true;
}
/* typography: straight quotes and apostrophes become curly ones in the reader's text, never in code or inputs */
const SMART_SKIP = 'script, style, code, pre, textarea, input, select, option, svg, kbd, .nosmart, .seq-table, .deckgrid';
const SMART_BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, figcaption, blockquote, summary, button, label, .lede, .kicker, .cap, .chip, .relrow span, a.icard, .ccard';
function smarten(root){
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(t){ const p = t.parentElement; return (!p || p.closest(SMART_SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
  const OPEN = /[\s(\[{—–\/‘“-]/, ELIDE = /^(s-|t\s|n['’]|em\b|til\b|cause\b|bout\b|Avin\b|tis\b)/; let blk = null, last = ' ', open = false, t;
  while ((t = w.nextNode())){
    const b = t.parentElement.closest(SMART_BLOCKS) || root; if (b !== blk){ blk = b; last = ' '; open = false; }
    const s = t.nodeValue; if (!s) continue;
    if (s.indexOf('"') < 0 && s.indexOf("'") < 0){ last = s[s.length - 1]; continue; }
    let out = '';
    for (let i = 0; i < s.length; i++){
      const c = s[i], prev = i ? s[i - 1] : last, next = s[i + 1] || '';
      if (c === '"'){ if (OPEN.test(prev)){ out += '“'; open = true; } else if (open){ out += open === 'de' ? '“' : '”'; open = false; } else out += /\d/.test(prev) ? '″' : '”'; }
      else if (c === "'"){ out += ((OPEN.test(prev) || (prev === '"' && open)) && !/\d/.test(next) && !ELIDE.test(s.slice(i + 1, i + 7))) ? '‘' : '’'; }
      else { if (c === '„') open = 'de'; out += c; }
    }
    t.nodeValue = out; last = s[s.length - 1];
  }
}
const unsmart = s => s.replace(/[‘’]/g, "'").replace(/[“”″]/g, '"');
/* photo captions: a written caption where there is one, else a tidied Commons file name */
function imgCaption(im){ if (im.caption) return im.caption; return String(im.title || '').replace(/^File:/, '').replace(/\.(jpe?g|png|webp|tiff?)$/i, '').replace(/\s*-\s*geograph\.org\.uk\s*-\s*\d+/i, '').replace(/\s*\(\d{6,}\)/g, '').replace(/_/g, ' ').trim(); }
/* links: one rule for the whole book. In running prose a target (a person, club, label, place, record, chapter or year) is linked at its
   first mention on the page and not again. A list or card (People, Records, Nights, a fact box, a timeline, a table) is its own scope and may
   link each item once. A hand-written link counts as the mention of what it points to; a later hand-written link in prose to the same target
   is unwrapped to plain text, and one that points somewhere else is left alone. */
const LINK_SCOPE = '.card, .facts, .glance, aside, table, figure, details, .lsstrip, .flyerstrip, .gallery, .relrow, .rels';
const LINK_PROSE = 'p, li, .fact span, .pcard, .ccard, .lede, .quote, td, .framing, .node-body';
const LINK_SKIP = 'a, button, h1, h2, .nolink, .kicker, .tag, code, .chip, .trackchip, .chips, select, option, .seq-table, .deckgrid, .cap, .pagenum, .trail, svg, textarea, input';
function autolink(root, selfId){
  const A = buildAliases(); const scopes = new Map();
  const doneFor = el => { const sc = el.closest(LINK_SCOPE); const key = sc && sc !== root && root.contains(sc) ? sc : root; let d = scopes.get(key); if (!d){ d = new Set([selfId]); scopes.set(key, d); } return [d, key]; };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode(t){ if (t.nodeType === 1) return (t !== root && t.tagName === 'A') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; const p = t.parentElement; if (!p || p.closest(LINK_SKIP)) return NodeFilter.FILTER_REJECT; if (!p.closest(LINK_PROSE)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  const texts = []; let t; while ((t = walker.nextNode())) texts.push(t);
  texts.forEach(tn => {
    if (tn.nodeType === 1){
      const p = tn.parentElement; const full = (tn.getAttribute('href') || '').slice(1).split(/[?&]/)[0]; const h = (tn.getAttribute('href') || '').match(/^#(?:[a-z0-9]+-)?([^?&]+)/);
      if (!h || !p || p.closest(LINK_SKIP) || !p.closest(LINK_PROSE)) return;   /* navigation, chips and captions are not mentions */
      const [done, key] = doneFor(p);
      if (key === root && (!tn.className || tn.className === 'xl') && !tn.target && (done.has(h[1]) || done.has(full)) && h[1] !== selfId){ tn.replaceWith(document.createTextNode(tn.textContent)); return; }
      done.add(h[1]); done.add(full); return;
    }
    const [done] = doneFor(tn.parentElement);
    const s = tn.nodeValue; A.re.lastIndex = 0; let m, last = 0; const frag = document.createDocumentFragment(); let any = false;
    const capped = tn.parentElement.classList.contains('lede') && tn === tn.parentElement.firstChild; /* the drop cap would split a link on the opening word */
    while ((m = A.re.exec(s))){ const name = m[2], id = A.map[name] || A.map[unsmart(name)]; if (capped && !s.slice(0, m.index + m[1].length).trim()) continue; if (!id || done.has(id) || !linkable(s, m.index + m[1].length, name)){ continue; } done.add(id); any = true; const start = m.index + m[1].length; frag.appendChild(document.createTextNode(s.slice(last, start))); const a = document.createElement('a'); a.href = '#' + id; a.className = 'xl'; a.textContent = name; frag.appendChild(a); last = start + name.length; }
    if (any){ frag.appendChild(document.createTextNode(s.slice(last))); tn.parentNode.replaceChild(frag, tn); }
  });
}
/* which chapters mention each node (computed once) */
let MENTIONS = null;
function buildMentions(){
  if (MENTIONS) return MENTIONS; MENTIONS = {}; const A = buildAliases();
  document.querySelectorAll('.page[data-page]').forEach(pg => { const id = pg.dataset.page; if (id === 'node' || id === 'home') return; const text = pg.textContent; A.re.lastIndex = 0; let m; const seen = new Set(); while ((m = A.re.exec(text))){ const nid = A.map[m[2]] || A.map[unsmart(m[2])]; if (nid && nid !== id && !seen.has(nid) && linkable(text, m.index + m[1].length, m[2])){ seen.add(nid); (MENTIONS[nid] = MENTIONS[nid] || []).push(id); } } });
  return MENTIONS;
}

/* where the book sends you, by what a page is:
   listen — the reader's streaming service (the dock plays it where it can); watch — YouTube;
   mixes and radio shows — SoundCloud; buy a release — Bandcamp, and Beatport for DJ copies of the dance-era records;
   the catalogue and second-hand vinyl — Discogs */
function platformChips(n){
  const yr = +((String(n.years || '').match(/\d{4}/) || [0])[0]); const out = [];
  if (n.type === 'record'){ out.push(['bc', 'buy', n.q]); if (yr >= 1985) out.push(['bp', 'buy for DJs', n.q]); }
  if (n.type === 'set') out.push(['sc', 'the mix', n.q]);
  if (n.type === 'station') out.push(['sc', 'shows', n.title]);
  return out;
}
/* ---------- node page ---------- */
const NodeView = {
  render(id, strand){
    const n = NODE[id]; const art = document.querySelector('.page[data-page="node"]'); if (!n || !art) return;
    const col = TYPE_COLOR[n.type] || '--mix'; art.style.setProperty('--c', `var(${col})`);
    const strands = n.strands.filter(s => STRANDS[s]);
    /* a strand chip opens that strand's chapters about this page, not the same page in another colour */
    let ment = buildMentions()[n.id] || [];
    if (!ment.length){ /* a name a chapter title has claimed (Chicago, Ibiza): find it in the strand chapters' text */ const re = new RegExp('\\b' + n.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'); ment = strands.flatMap(s => STRANDS[s].spine).filter((c, i, a) => a.indexOf(c) === i && c !== n.id && re.test((document.querySelector(`.page[data-page="${c}"]`) || {}).textContent || '')); }
    const inStrand = s => ment.filter(c => STRANDS[s].spine.includes(c) && (!window.PAGE_IDS || PAGE_IDS.includes(c)));
    const spot = strands.map(s => { const cs = inStrand(s); const to = cs[0] || STRANDS[s].spine[0]; const lbl = cs.length ? `${STRANDS[s].title} strand · ${cs.length} chapter${cs.length > 1 ? 's' : ''}` : `${STRANDS[s].title} strand`; const tip = cs.length ? `Where ${n.title} comes up in the ${STRANDS[s].title} strand: ${cs.map(titleOf).join('; ')}` : `Open the ${STRANDS[s].title} strand`; return `<a class="chip" href="#${s}-${to}" title="${tip.replace(/"/g, '&quot;')}" style="--c:var(${STRANDS[s].color})"><i></i>${lbl}</a>`; }).join('');
    const reads = strands.map(s => [s, inStrand(s)]).filter(([, cs]) => cs.length > 1);
    const spotReads = reads.length ? `<p class="cap strand-reads">${reads.map(([s, cs]) => `<span style="--c:var(${STRANDS[s].color})"><b>${STRANDS[s].title}:</b> ${cs.slice(0, 6).map(c => `<a class="xl" href="#${s}-${c}">${titleOf(c)}</a>`).join(' · ')}${cs.length > 6 ? ` and ${cs.length - 6} more` : ''}</span>`).join('<br>')}</p>` : '';
    const spotTree = n.type === 'genre' ? `<a class="chip" href="#genres?g=${n.id}" style="--c:var(--synth)"><i></i>On the family tree</a>` : '';
    const deep = (window.DEEP_DIVES || {})[n.id]; const spotDeep = deep && (!window.PAGE_IDS || PAGE_IDS.includes(deep)) ? `<a class="chip" href="#${deep}" style="--c:var(--kick)"><i></i>${/^tw/.test(deep) ? 'The town, in depth' : /^cb/.test(deep) ? 'The full story of the room' : 'Read the chapter'}</a>` : '';
    const links = [['sp', 'listen', n.q], ['yt', 'watch', n.q + (n.type === 'person' ? ' DJ set' : n.type === 'club' ? ' club' : '')], ['dg', 'discogs', n.q], ...platformChips(n), ['g', 'search', n.q]].filter(l => !(l[0] === 'sp' && !/^(record|person|collective|label|genre)$/.test(n.type))).filter(l => !(l[0] === 'dg' && !/^(record|set|person|collective|label|shop)$/.test(n.type)));
    const cc = `<a class="chip dg" target="_blank" rel="noopener" href="https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(n.q)}&ns6=1"><i></i>Creative Commons images<small style="color:var(--muted)">· Wikimedia Commons</small></a>`;
    const body = document.getElementById('node-' + n.id); // optional hand-written body in HTML
    const framings = [...document.querySelectorAll(`template[data-framing="${n.id}"]`)];
    const curStrand = strand && n.strands.includes(strand) ? strand : n.strands[0];
    let framingHtml = '';
    if (framings.length){
      framingHtml = `<div class="framing-switch"><span>Read this as</span>${n.strands.filter(s => STRANDS[s]).map(s => `<a href="#${s}-${n.id}" class="${s === curStrand ? 'on' : ''}" style="--c:var(${STRANDS[s].color})">${STRANDS[s].title}</a>`).join('')}</div>`;
      const f = framings.find(t => t.dataset.strand === curStrand) || framings[0];
      framingHtml += `<div class="framing" style="--c:var(${STRANDS[f.dataset.strand].color})">${f.innerHTML}</div>`;
      const others = framings.filter(t => t !== f); if (others.length) framingHtml += `<details class="otherframes"><summary>The other framings</summary>${others.map(t => `<div class="framing dim" style="--c:var(${STRANDS[t.dataset.strand].color})"><div class="kicker" style="margin:0 0 6px">${STRANDS[t.dataset.strand].title} strand</div>${t.innerHTML}</div>`).join('')}</details>`;
    }
    const rels = {}; n.rel.forEach(([r, t]) => { (rels[r] = rels[r] || []).push(t); });
    const backs = {}; (BACK[n.id] || []).forEach(([r, src]) => { (backs[r] = backs[r] || []).push(src); });
    const link = t => NODE[t] ? `<a class="xl" href="#${t}">${NODE[t].title}</a>` : CHAPTER_TITLES[t] ? `<a class="xl" href="#${t}">${CHAPTER_TITLES[t]}</a>` : t;
    const relHtml = Object.entries(rels).map(([r, ts]) => `<div class="relrow"><b>${REL_LABEL[r] || r}</b><span>${ts.map(link).join(', ')}</span></div>`).join('');
    const backHtml = Object.entries(backs).map(([r, ts]) => `<div class="relrow"><b>${REL_BACK[r] || r}</b><span>${ts.map(link).join(', ')}</span></div>`).join('');
    const mentions = (buildMentions()[n.id] || []).filter(p => CHAPTER_TITLES[p]);
    const mentionHtml = mentions.length ? `<div class="relrow"><b>appears in</b><span>${mentions.map(p => `<a class="xl" href="#${p}">${CHAPTER_TITLES[p]}</a>`).join(', ')}</span></div>` : '';
    const hear = n.preset ? (n.type === 'record' ? `<h3>Record anatomy</h3><p class="cap" style="margin-bottom:8px">Rebuilt in the engine: the tempo, the drums, the sound design, the kind of chord and bass — not the tune, which is at the links above. Mute layers to hear what each one does.</p><div class="era"><button class="play era-btn" data-genre="${n.preset}" data-bars="2">Hear the anatomy · 2 bars</button></div>` : `<div class="era"><button class="play era-btn" data-genre="${n.preset}" data-bars="2">Hear it: ${n.preset}</button></div>`) : '';
    const parent = n.type === 'genre' && n.preset ? (n.rel.find(r => r[0] === 'from' && NODE[r[1]] && NODE[r[1]].preset) || [])[1] : null;
    const morph = parent ? `<h3>Morph from ${NODE[parent].title}</h3><p class="cap" style="margin-bottom:8px">This genre descends from <a class="xl" href="#${parent}">${NODE[parent].title}</a>. Drag from the parent's sound to this one and hear what changed.</p><div class="morphbox" data-a="${NODE[parent].preset}" data-b="${n.preset}"></div>` : '';
    const im = (window.IMAGES || {})[n.id]; const img = im ? `<figure class="nodeimg"><img src="${im.src}" alt="${imgCaption(im).replace(/"/g, '&quot;')}" loading="lazy"><figcaption>${imgCaption(im)} · ${im.author} · <a href="${im.page}" target="_blank" rel="noopener">${im.license}</a> via Wikimedia Commons${window.Rights ? ' · ' + Rights.link(n.id, im.src, n.id) : ''}</figcaption></figure>` : '';
    art.innerHTML = `
      <p class="kicker"><span>${TYPE_LABEL[n.type] || n.type}${n.city && NODE[n.city] ? ' · ' + NODE[n.city].title : ''}${n.years ? ' · ' + String(n.years).replace(/(\d)s\b/g, '$1<span class="lc">s</span>') : ''}</span></p>
      <h2>${n.title}</h2>
      <div class="chips" style="margin-top:4px">${spot}${spotTree}${window.Street ? Street.chip(n) : ''}${window.Rooms ? Rooms.chip(n) : ''}${spotDeep}</div>${spotReads}
      ${n.blurb ? `<p class="lede">${n.blurb}</p>` : ''}
      ${img}
      <div class="grid2">
        <div>
          ${framingHtml}
          ${body ? `<div class="node-body">${body.innerHTML}</div>` : ''}
          ${hear}
          ${window.Gear ? Gear.html(n) : ''}
          ${window.HowTo ? HowTo.html(n) : ''}
          ${window.Panels ? Panels.html(n) : ''}
          ${morph}
          <h3>Connections</h3>
          <div class="rels">${relHtml}${backHtml}${mentionHtml || ''}${(!relHtml && !backHtml && !mentionHtml) ? '<p class="cap">No links yet.</p>' : ''}</div>
        </div>
        <div>
          ${window.People ? People.html(n) : ''}
          <div class="card" style="margin-top:14px"><h3>Neighbourhood</h3><svg id="hood" class="diag"></svg><p class="cap">Click any node to travel. Grey ring = chapters that mention this.</p></div>
          <div class="card" style="margin-top:14px"><h3>Outside the book</h3><div class="chips"></div></div>
          ${n.type === 'person' ? '<p class="cap">No portrait is bundled: images of named people are linked, not embedded.</p>' : ''}
        </div>
      </div>`;
    chipsInto(art.querySelector('.card .chips'), links); art.querySelector('.card .chips').insertAdjacentHTML('beforeend', cc);
    wireEraButtons(); autolink(art, n.id); this.drawHood(n, mentions);
  },
  drawHood(n, mentions){
    const svg = document.getElementById('hood'); if (!svg) return; const W = 420, H = 420, cx = 210, cy = 210; clearSvg(svg, W, H);
    const out = n.rel.map(([r, t]) => ({ id: t, r, dir: 'out' })).filter(x => NODE[x.id] || CHAPTER_TITLES[x.id]);
    const inn = (BACK[n.id] || []).map(([r, s]) => ({ id: s, r, dir: 'in' }));
    const ch = mentions.map(m => ({ id: m, r: 'mention', dir: 'ch' }));
    const seen = new Set([n.id]); const all = [...out, ...inn, ...ch].filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).slice(0, 28);
    const rings = { out: 95, in: 150, ch: 190 }; const groups = { out: [], in: [], ch: [] }; all.forEach(x => groups[x.dir].push(x));
    Object.entries(groups).forEach(([dir, items]) => {
      const R = rings[dir]; el('circle', { cx, cy, r: R, fill: 'none', stroke: '#272733', 'stroke-dasharray': dir === 'ch' ? '2 4' : '' }, svg);
      items.forEach((x, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2 + (dir === 'in' ? 0.2 : 0); const x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R;
        const spoke = el('line', { class: 'dg-e', x1: cx, y1: cy, x2: x1, y2: y1, stroke: '#2a2a35' }, svg);
        const g = el('g', {}, svg); const node = NODE[x.id]; const col = node ? css(TYPE_COLOR[node.type] || '--mix') : '#8f8fa0';
        el('circle', { cx: x1, cy: y1, r: dir === 'ch' ? 4 : 6, fill: dir === 'ch' ? '#8f8fa0' : col }, g); el('circle', { class: 'dg-hit', cx: x1, cy: y1, r: 11 }, g);
        const label = node ? ((node.type === 'record' || node.type === 'set') ? node.title.split(' — ').pop() : node.title) : CHAPTER_TITLES[x.id];
        text(g, x1 + (Math.cos(a) >= 0 ? 8 : -8), y1 + 3, label.length > 22 ? label.slice(0, 21) + '…' : label, { 'text-anchor': Math.cos(a) >= 0 ? 'start' : 'end', fill: '#ebebf1', 'font-size': 8.5 });
        const how = x.dir === 'out' ? (REL_LABEL[x.r] || x.r) : x.dir === 'in' ? (REL_BACK[x.r] || x.r) : 'mentions this page';
        const kind = node ? [TYPE_LABEL[node.type] || node.type, node.years].filter(Boolean).join(' · ') : 'Chapter';
        Dg.mark(g, { id: x.id, meta: how.charAt(0).toUpperCase() + how.slice(1) + ' · ' + kind, rel: [spoke] });
      });
    });
    el('circle', { cx, cy, r: 16, fill: css(TYPE_COLOR[n.type] || '--mix') }, svg); text(svg, cx, cy + 32, n.title.length > 26 ? n.title.slice(0, 25) + '…' : n.title, { 'text-anchor': 'middle', fill: '#ebebf1', 'font-weight': 600 });
  }

};

/* ---------- forks ---------- */
function renderForks(pageId, pageEl){
  let box = pageEl.querySelector('.forks');
  // only crossings into strands this edition has (the Ibiza and Goa strands are not written yet)
  const f = (FORKS[pageId] || []).filter(([, to, s]) => STRANDS[s] && (!window.PAGE_IDS || PAGE_IDS.includes(to) || (typeof NODE !== 'undefined' && NODE[to])));
  if (!f.length){ if (box) box.remove(); return; }
  if (!box){ box = document.createElement('div'); box.className = 'forks'; const nav = pageEl.querySelector('.pagenav'); pageEl.insertBefore(box, nav); }
  box.innerHTML = `<div class="kicker" style="margin-bottom:8px">Where the history forks here</div>` + f.map(([label, to, s]) => `<a href="#${s}-${to}" style="--c:var(${STRANDS[s].color})"><small>${STRANDS[s].title} strand</small>${label}</a>`).join('');
}

/* ---------- year scrubber ---------- */
const YearView = {
  built: false,
  years(n){ const m = (n.years || '').match(/(\d{4})/g); if (!m) return null; const a = +m[0]; let b = m[1] ? +m[1] : a; if (/–\s*$/.test(n.years) || /–$/.test(n.years.trim())) b = 2026; if (b < a) b = a; return [a, b]; },
  build(){ if (this.built) return; this.built = true; const r = document.getElementById('yearRange'); r.oninput = () => this.show(+r.value); this.show(+r.value); },
  show(y){
    document.getElementById('yearOut').textContent = y;
    const active = NODES.filter(n => { const yy = this.years(n); return yy && y >= yy[0] && y <= yy[1] && n.type !== 'city'; });
    const born = active.filter(n => this.years(n)[0] === y);
    const byStrand = {}; active.forEach(n => (byStrand[n.strands[0]] = byStrand[n.strands[0]] || []).push(n));
    const box = document.getElementById('yearBox'); box.innerHTML = '';
    const tl = TL.filter(e => e[0] === y);
    if (tl.length) box.innerHTML += `<div class="card" style="margin-bottom:12px"><h3>This year on the timeline</h3>${tl.map(e => `<p><b>${e[2]}</b> — ${e[4]} <a class="xl" href="#${e[3]}">chapter →</a></p>`).join('')}</div>`;
    if (born.length) box.innerHTML += `<div class="card" style="margin-bottom:12px"><h3>Born this year</h3><div class="chips">${born.map(n => `<a class="chip" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type]})"><i></i>${n.title}</a>`).join('')}</div></div>`;
    ['techno', 'rave', 'house'].forEach(s => { const items = (byStrand[s] || []).filter(n => this.years(n)[0] !== y); if (!items.length) return; const d = document.createElement('div'); d.className = 'card'; d.style.marginBottom = '12px'; d.style.setProperty('--c', `var(${STRANDS[s].color})`); d.innerHTML = `<h3>${STRANDS[s].title}: alive in ${y}</h3><div class="chips">${items.slice(0, 60).map(n => `<a class="chip" href="#${s}-${n.id}"><i></i>${n.title}</a>`).join('')}${items.length > 60 ? `<span class="cap">+${items.length - 60} more</span>` : ''}</div>`; box.appendChild(d); });
    const presets = [[1987, 'Chicago acid 1987'], [1988, 'Detroit 1988'], [1990, 'UK bleep 1990'], [1991, 'UK rave 1991'], [1992, 'Tresor 1992'], [1994, 'Acid techno 1994'], [1995, 'Dub techno 1995'], [1996, 'Birmingham 1995'], [2002, 'Schranz 2002'], [2004, 'Minimal 2004'], [2010, 'Berghain 2010'], [2015, 'Hypnotic 2015'], [2017, 'Peak-time 2017'], [2018, 'Industrial 2018'], [2023, 'Hard techno 2023']];
    let best = presets[0]; presets.forEach(p => { if (Math.abs(p[0] - y) < Math.abs(best[0] - y)) best = p; });
    const sb = document.getElementById('yearSound'); sb.textContent = `Sound of ${y}: ${best[1]}`; sb.onclick = () => playGenre(best[1], 2, sb);
    autolink(box, null);
  }
};

/* ---------- explore page ---------- */
const Explore = {
  built: false,
  build(){
    if (this.built) return; this.built = true;
    const counts = {}; NODES.forEach(n => counts[n.type] = (counts[n.type] || 0) + 1);
    document.getElementById('typeCounts').innerHTML = Object.entries(counts).map(([t, c]) => `<div class="fact" style="--c:var(${TYPE_COLOR[t]})"><b>${TYPE_LABEL[t]}</b><span>${c}</span></div>`).join('');
    const list = document.getElementById('nodeList'); const sel = document.getElementById('typeSel'); const q = document.getElementById('nodeSearch');
    const render = () => { const t = sel.value, s = q.value.toLowerCase(); list.innerHTML = ''; NODES.filter(n => (t === 'all' || n.type === t) && (!s || (n.title + ' ' + n.blurb + ' ' + (n.aliases || []).join(' ')).toLowerCase().includes(s))).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 400).forEach(n => { const a = document.createElement('a'); a.className = 'chip' + (Visited.set.has(n.id) ? ' seen' : ''); a.href = '#' + n.id; a.style.setProperty('--c', `var(${TYPE_COLOR[n.type]})`); a.innerHTML = `<i></i>${n.title}<small style="color:var(--muted)">· ${n.years || TYPE_LABEL[n.type]}</small>`; list.appendChild(a); }); };
    sel.innerHTML = '<option value="all">everything</option>' + Object.keys(counts).map(t => `<option value="${t}">${TYPE_LABEL[t]}</option>`).join(''); sel.onchange = render; q.oninput = render; render();
    document.getElementById('randomWalk').onclick = () => { const un = NODES.filter(n => !Visited.set.has(n.id) && n.type !== 'city'); const pick = (un.length ? un : NODES)[Math.floor(Math.random() * (un.length ? un.length : NODES.length))]; location.hash = '#' + pick.id; };
    document.getElementById('copyTrail').onclick = () => { const txt = Trail.items.map(t => t.title + '  ' + location.origin + location.pathname + '#' + t.id).join('\n'); try { navigator.clipboard.writeText(txt); } catch (e) {} };
    const pr = document.getElementById('progress'); if (pr) pr.textContent = `${Visited.set.size} of ${NODES.length + Object.keys(CHAPTER_TITLES).length} pages visited`;
  }
};

/* ---------- sidebar search ---------- */
function buildSearch(){
  const box = document.getElementById('sideSearch'); if (!box) return; const input = box.querySelector('input'), out = box.querySelector('.results');
  /* accents, quotes and case don't matter: "hacienda" finds the Haçienda, "vath" finds Väth */
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’‘`]/g, '').replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim();
  let index = null;
  const build = () => { index = []; NODES.forEach(n => index.push({ t: n.title, id: n.id, ty: TYPE_LABEL[n.type], col: TYPE_COLOR[n.type], k: norm(n.title), a: norm((n.aliases || []).join(' | ')) })); Object.entries(CHAPTER_TITLES).forEach(([id, t]) => index.push({ t, id, ty: 'Chapter', col: '--mix', k: norm(t), a: '' })); };
  const score = (e, s) => e.k === s ? 0 : e.k.startsWith(s) ? 1 : (' ' + e.k).includes(' ' + s) ? 2 : e.k.includes(s) ? 3 : e.a.includes(s) ? 4 : -1;
  const go = a => { input.value = ''; out.innerHTML = ''; document.getElementById('side').classList.remove('open'); if (a) location.hash = a.getAttribute('href'); };
  input.oninput = () => {
    if (!index) build(); const s = norm(input.value); out.innerHTML = ''; if (s.length < 2) return;
    const hits = index.map(e => [score(e, s), e]).filter(([sc]) => sc >= 0).sort((x, y) => x[0] - y[0] || x[1].t.length - y[1].t.length).slice(0, 12);
    if (!hits.length){ const p = document.createElement('p'); p.className = 'noresults'; p.textContent = `No pages match “${input.value.trim()}”. Try part of a name, or browse the contents below.`; out.appendChild(p); return; }
    hits.forEach(([, e]) => { const a = document.createElement('a'); a.href = '#' + e.id; a.innerHTML = `<i style="background:var(${e.col})"></i>${e.t}<small>${e.ty}</small>`; a.onclick = ev => { ev.preventDefault(); go(a); }; out.appendChild(a); });
  };
  input.onkeydown = e => { if (e.key === 'Enter'){ const a = out.querySelector('a'); if (a){ e.preventDefault(); go(a); } } else if (e.key === 'Escape'){ input.value = ''; out.innerHTML = ''; input.blur(); } };
}

window.PageHooks = window.PageHooks || {};
window.PageHooks.year = () => YearView.build();
window.PageHooks.explore = () => Explore.build();

/* ---------- cover: the whole book as a graph ---------- */
/* moved to build/covergraph.js (assembled onto the end of this file): families from build/families.js, zoom, branching and the address */

/* ===================================================================
   COVER GRAPH — the whole book as a tree you can open.
   The centre is the book; each musical family (build/families.js) is a
   branch and a sector; each genre page is a limb off its family at the
   year it began, joined to what it grew out of; every other page is a dot
   placed by family and by year. Drawn on a canvas so it stays quick while
   zooming. State lives in the address: #home?f=house&g=g-acidhouse&n=phuture
   =================================================================== */
window.CoverGraph = (() => {
  const TAU = Math.PI * 2;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CC = {}; const col = v => CC[v] || (CC[v] = getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#9a9aae');
  const rgba = (c, a) => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c); return m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})` : c; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h / 1000003; };
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‘’“”'"]/g, '').toLowerCase();
  /* years run outward: 1920–80 squeezed into the inner ring, 1980–2026 across the rest */
  const R0 = 0.1, R_EDGE = 1, R_NOYEAR = 0.965;
  const rOf = y => y < 1980 ? R0 + Math.max(0, y - 1920) / 60 * 0.2 : 0.3 + (Math.min(y, 2026) - 1980) / 46 * 0.62;
  const TYPES = ['person', 'club', 'record', 'label', 'event', 'set', 'genre', 'machine', 'sound', 'station', 'collective', 'shop', 'press', 'law', 'border'];
  const startYear = n => { const yy = YearView.years(n); return yy ? Math.min(2026, Math.max(1920, yy[0])) : null; };

  let M = null, V = null, box, cv, ctx, stage, W = 0, H = 0, DPR = 1, base = 1;
  const st = { f: null, g: null, n: null }; let hover = null, cursor = null, lit = new Set(), offTypes = new Set(), flyAnim = 0, wantFly = false;
  const stats = { frames: [], last: 0 };

  /* ---------- the model: sectors, limbs, dots ---------- */
  function build(){
    const F = Families; F.compute();
    const nodes = NODES.filter(n => n.type !== 'city' && F.of(n.id));
    const byFam = {}; F.all.forEach(f => { byFam[f.k] = []; }); nodes.forEach(n => byFam[F.of(n.id).fam].push(n));
    /* genre marks per family, in tree order: what grew out of what sits side by side */
    const marks = {};
    F.all.forEach(f => {
      if (f.k === 'across'){ marks[f.k] = []; return; }
      const gs = F.genres(f.k).filter(id => startYear(NODE[id]) != null); const inF = new Set(gs);
      const kids = {}; gs.forEach(id => F.parents(id).filter(p => inF.has(p)).forEach(p => (kids[p] = kids[p] || []).push(id)));
      const yr = id => startYear(NODE[id]); const seen = new Set(), out = [];
      const walk = id => { if (seen.has(id)) return; seen.add(id); out.push(id); (kids[id] || []).sort((a, b) => yr(a) - yr(b)).forEach(walk); };
      gs.filter(id => !F.parents(id).some(p => inF.has(p))).sort((a, b) => yr(a) - yr(b)).forEach(walk); gs.forEach(walk);
      marks[f.k] = out;
    });
    /* sector widths: by size, softened so small families keep room for their limbs */
    const wt = k => Math.pow(Math.max(40, byFam[k].length + 14 * marks[k].length), 0.5);
    const tot = F.all.reduce((s, f) => s + wt(f.k), 0); const sec = {}; let a = -Math.PI / 2;
    F.all.forEach(f => { const span = wt(f.k) / tot * TAU; sec[f.k] = { k: f.k, a0: a, a1: a + span, mid: a + span / 2, n: byFam[f.k].length, color: col(f.color) }; a += span; });
    /* the neutral sector is split into its groups */
    const groups = {}; { const s = sec.across; const cnt = {}; byFam.across.forEach(n => { const g = F.of(n.id).group || 'venues'; cnt[g] = (cnt[g] || 0) + 1; }); let b = s.a0; const all = Families.across.groups.map(x => x[0]).filter(g => cnt[g]); const t = all.reduce((x, g) => x + cnt[g], 0); all.forEach(g => { const sp = cnt[g] / t * (s.a1 - s.a0); groups[g] = { a0: b, a1: b + sp, mid: b + sp / 2, n: cnt[g] }; b += sp; }); }
    const P = {}; /* genre marks */
    Object.entries(marks).forEach(([k, ids]) => { const s = sec[k], pad = Math.min(0.06, (s.a1 - s.a0) * 0.1), span = s.a1 - s.a0 - 2 * pad;
      ids.forEach((id, i) => { const ang = s.a0 + pad + (i + 0.5) / ids.length * span; const r = rOf(startYear(NODE[id])); P[id] = { id, k, a: ang, r, x: Math.cos(ang) * r, y: Math.sin(ang) * r, mark: true, spread: Math.min(0.11, span / ids.length * 0.48) }; }); });
    const D = []; const idx = {};
    nodes.forEach(n => {
      if (P[n.id]){ idx[n.id] = P[n.id]; return; }
      const o = F.of(n.id); const s = sec[o.fam]; const y = startYear(n);
      let ang; const m = o.sub && P[o.sub] && P[o.sub].k === o.fam ? P[o.sub] : null;
      if (m) ang = Math.max(s.a0 + 0.01, Math.min(s.a1 - 0.01, m.a + (hash(n.id) - 0.5) * 2 * m.spread));
      else { const g = o.fam === 'across' ? groups[o.group || 'venues'] : s; const pad = Math.min(0.03, (g.a1 - g.a0) * 0.06); ang = g.a0 + pad + hash(n.id) * (g.a1 - g.a0 - 2 * pad); }
      const r = y != null ? rOf(y) + (hash(n.id + 'r') - 0.5) * 0.026 : R_NOYEAR + (hash(n.id + 'r') - 0.5) * 0.03;
      const deg = n.rel.length + (BACK[n.id] || []).length;
      const d = { id: n.id, n, k: o.fam, a: ang, r, x: Math.cos(ang) * r, y: Math.sin(ang) * r, deg, rad: Math.min(6, 1.6 + Math.sqrt(deg) * 0.55), color: col(TYPE_COLOR[n.type] || '--text'), type: n.type };
      D.push(d); idx[n.id] = d;
    });
    Object.values(P).forEach(p => { const n = NODE[p.id]; p.n = n; p.deg = n.rel.length + (BACK[n.id] || []).length; p.type = 'genre'; p.color = sec[p.k].color; });
    /* links (a page's "in" link to its city is not drawn: cities are not dots) */
    const E = [], nb = {}; const link = (a, b) => { if (a === b || !idx[a] || !idx[b]) return; (nb[a] = nb[a] || new Set()).add(b); (nb[b] = nb[b] || new Set()).add(a); };
    nodes.forEach(n => n.rel.forEach(([r, t]) => { if (r === 'in' || !idx[t]) return; link(n.id, t); E.push([idx[n.id], idx[t], col(TYPE_COLOR[n.type] || '--text')]); }));
    /* limbs: from each genre's parents, or from its family's branch */
    const L = []; Object.values(P).forEach(p => { const ps = Families.parents(p.id).filter(q => P[q]); if (ps.length) ps.forEach(q => L.push([P[q], p, true])); else L.push([null, p, false]); });
    M = { F, nodes, byFam, marks, sec, groups, P, D, idx, E, nb, L };
  }

  /* ---------- view ---------- */
  const toS = (x, y) => [x * V.s + V.ox, y * V.s + V.oy];
  const toW = (x, y) => [(x - V.ox) / V.s, (y - V.oy) / V.s];
  const K = () => V.s / base;
  function clampV(v){
    v.s = Math.max(base * 0.85, Math.min(base * 60, v.s));
    const cx = (W / 2 - v.ox) / v.s, cy = (H / 2 - v.oy) / v.s, d = Math.hypot(cx, cy), lim = 1.1;
    if (d > lim){ v.ox = W / 2 - cx / d * lim * v.s; v.oy = H / 2 - cy / d * lim * v.s; }
    return v;
  }
  const fitBox = (x0, y0, x1, y1, pad = 0.08, maxK = 12) => { const bw = (x1 - x0) * (1 + pad * 2), bh = (y1 - y0) * (1 + pad * 2); const s = Math.min(base * maxK, Math.min(W / bw, H / bh)); return clampV({ s, ox: W / 2 - (x0 + x1) / 2 * s, oy: H / 2 - (y0 + y1) / 2 * s }); };
  const bookView = () => ({ s: base, ox: W / 2, oy: H / 2 });
  function sectorView(k){ /* fit the family's own dots and styles, with its label */ const s = M.sec[k]; const pts = [...M.byFam[k].map(n => M.idx[n.id]), ...M.marks[k].map(id => M.P[id])].map(d => [d.x, d.y]); pts.push([Math.cos(s.mid) * 1.1, Math.sin(s.mid) * 1.1]);
    return fitBox(Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1])), 0.06, 6); }
  function genreView(g){ const pts = [M.P[g], ...members(g).map(id => M.idx[id]).filter(d => d && d.k === M.P[g].k)]; const xs = pts.map(p => p.x), ys = pts.map(p => p.y); let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const m = 0.12; if (x1 - x0 < m){ const c = (x0 + x1) / 2; x0 = c - m / 2; x1 = c + m / 2; } if (y1 - y0 < m){ const c = (y0 + y1) / 2; y0 = c - m / 2; y1 = c + m / 2; } return fitBox(x0, y0, x1, y1, 0.12, 10); }
  function nodeView(id, from){ const d = M.idx[id]; const s = Math.max(from.s, base * 3.2); return clampV({ s, ox: W / 2 - d.x * s, oy: H / 2 - d.y * s }); }
  function targetView(){
    let v = st.g ? genreView(st.g) : st.f ? sectorView(st.f) : bookView();
    if (st.n && M.idx[st.n]){ const d = M.idx[st.n]; const [x, y] = toS(d.x, d.y); const onScreen = x > 20 && x < W - 20 && y > 20 && y < H - 20 && K() >= 1.4; if (wantFly || !onScreen){ const vv = st.g || st.f ? v : V; v = nodeView(st.n, vv); } else v = V; }
    wantFly = false; return v;
  }
  function fly(to, ms){
    cancelAnimationFrame(flyAnim); if (reduce() || !ms || !V){ V = to; queue(); return; }
    const from = { ...V }; const wc0 = [(W / 2 - from.ox) / from.s, (H / 2 - from.oy) / from.s], wc1 = [(W / 2 - to.ox) / to.s, (H / 2 - to.oy) / to.s]; const t0 = performance.now();
    const step = now => { const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; const s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e); const cx = wc0[0] + (wc1[0] - wc0[0]) * e, cy = wc0[1] + (wc1[1] - wc0[1]) * e; V = { s, ox: W / 2 - cx * s, oy: H / 2 - cy * s }; draw(); if (t < 1) flyAnim = requestAnimationFrame(step); else { V = to; queue(); } };
    flyAnim = requestAnimationFrame(step);
  }
  function zoomAbout(x, y, f){ cancelAnimationFrame(flyAnim); const [wx, wy] = toW(x, y); const s = V.s * f; V = clampV({ s, ox: x - wx * Math.max(base * 0.85, Math.min(base * 60, s)), oy: y - wy * Math.max(base * 0.85, Math.min(base * 60, s)) }); queue(); }

  /* ---------- what is in focus ---------- */
  const memo = {};
  function members(g){ if (memo[g]) return memo[g]; const s = new Set(Families.members(g)); (M.nb[g] || []).forEach(x => s.add(x)); s.delete(g); return (memo[g] = [...s]); }
  function focusSet(){
    if (st.g){ const s = new Set([st.g, ...members(st.g), ...Families.parents(st.g).filter(p => M.P[p])]); Object.values(M.P).forEach(p => { if (Families.parents(p.id).includes(st.g)) s.add(p.id); }); return s; }
    if (st.f) return new Set([...M.byFam[st.f].map(n => n.id)]);
    return null;
  }

  /* ---------- drawing ---------- */
  let queued = 0; const queue = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; draw(); }); };
  let labelBoxes = [], famBoxes = [];
  const clash = (b, list) => list.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  function wedge(k, r0, r1){ const s = M.sec[k]; ctx.beginPath(); ctx.arc(V.ox, V.oy, r1 * V.s, s.a0, s.a1); ctx.arc(V.ox, V.oy, r0 * V.s, s.a1, s.a0, true); ctx.closePath(); }
  function draw(){
    if (!M || !W) return; const t0 = performance.now(); const k = K(); const phone = W < 520;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    const focus = focusSet(); const sel = st.n && M.idx[st.n] ? M.idx[st.n] : null; const near = sel ? (M.nb[sel.id] || new Set()) : null;
    const hv = hover && M.idx[hover] ? M.idx[hover] : null; const hnear = hv ? (M.nb[hv.id] || new Set()) : null;
    const searching = lit.size > 0;
    const inView = (x, y, m = 40) => x > -m && x < W + m && y > -m && y < H + m;
    /* sectors */
    Object.values(M.sec).forEach(s => { const open = st.f === s.k, dim = st.f && !open; wedge(s.k, R0 * 0.6, R_EDGE); ctx.fillStyle = rgba(s.color, s.k === 'across' ? (open ? 0.07 : 0.025) : open ? 0.1 : dim ? 0.018 : 0.045); ctx.fill();
      ctx.strokeStyle = '#1e1e28'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.ox, V.oy); ctx.lineTo(V.ox + Math.cos(s.a0) * R_EDGE * V.s, V.oy + Math.sin(s.a0) * R_EDGE * V.s); ctx.stroke(); });
    if (M.groups){ Object.values(M.groups).forEach((g, i) => { if (!i) return; ctx.setLineDash([2, 4]); ctx.strokeStyle = '#2a2a35'; ctx.beginPath(); ctx.moveTo(V.ox + Math.cos(g.a0) * 0.3 * V.s, V.oy + Math.sin(g.a0) * 0.3 * V.s); ctx.lineTo(V.ox + Math.cos(g.a0) * R_EDGE * V.s, V.oy + Math.sin(g.a0) * R_EDGE * V.s); ctx.stroke(); ctx.setLineDash([]); }); }
    /* year rings */
    const mono = '"JetBrains Mono", ui-monospace, monospace', ui = 'Archivo, system-ui, sans-serif';
    ctx.font = `${phone ? 8 : 9}px ${mono}`; ctx.textAlign = 'right';
    [1950, 1980, 1990, 2000, 2010, 2020].forEach(y => { const r = rOf(y) * V.s; ctx.strokeStyle = '#1e1e28'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(V.ox, V.oy, r, 0, TAU); ctx.stroke(); ctx.fillStyle = '#6a6a80'; ctx.fillText(y, V.ox - 4, V.oy - r + 10); });
    /* branches and limbs */
    Object.values(M.sec).forEach(s => { if (s.k === 'across') return; const dim = st.f && st.f !== s.k; ctx.strokeStyle = rgba(s.color, dim ? 0.12 : 0.45); ctx.lineWidth = Math.min(3, 1.4 + k * 0.1); ctx.beginPath(); ctx.moveTo(V.ox + Math.cos(s.mid) * R0 * 0.6 * V.s, V.oy + Math.sin(s.mid) * R0 * 0.6 * V.s); ctx.lineTo(V.ox + Math.cos(s.mid) * rOf(2026) * V.s, V.oy + Math.sin(s.mid) * rOf(2026) * V.s); ctx.stroke(); });
    M.L.forEach(([p, c, real]) => {
      const s = M.sec[c.k]; const on = !focus || focus.has(c.id) && (!p || focus.has(p.id) || st.f); const a = on ? (real ? 0.75 : 0.4) : 0.08;
      const r0 = p ? p.r : Math.max(R0, c.r - 0.05), a0 = p ? p.a : s.mid; const [x0, y0] = toS(Math.cos(a0) * r0, Math.sin(a0) * r0); const [x1, y1] = toS(c.x, c.y); const [qx, qy] = toS(Math.cos(c.a) * r0, Math.sin(c.a) * r0);
      ctx.strokeStyle = rgba(s.color, a); ctx.lineWidth = real ? Math.min(2.6, 1.2 + k * 0.08) : 1; if (!real) ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(qx, qy, x1, y1); ctx.stroke(); ctx.setLineDash([]);
    });
    /* links */
    const lw = Math.min(1.2, 0.5 + k * 0.03); ctx.lineWidth = lw;
    const byCol = {}; M.E.forEach(e => { const [a, b, c] = e; if (offTypes.has(a.type) || offTypes.has(b.type)) return; if (focus && !focus.has(a.id) && !focus.has(b.id)) return; (byCol[c] = byCol[c] || []).push(e); });
    const baseA = sel || hv || searching ? 0.05 : focus ? 0.22 : 0.13;
    Object.entries(byCol).forEach(([c, es]) => { ctx.strokeStyle = rgba(c, baseA); ctx.beginPath(); es.forEach(([a, b]) => { const [x0, y0] = toS(a.x, a.y), [x1, y1] = toS(b.x, b.y); if (!inView(x0, y0, 0) && !inView(x1, y1, 0) && Math.hypot(x1 - x0, y1 - y0) < Math.max(W, H)) return; ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }); ctx.stroke(); });
    const litLinks = (d, nbs, c) => { const [x0, y0] = toS(d.x, d.y); ctx.strokeStyle = c; ctx.lineWidth = 1.3; ctx.beginPath(); nbs.forEach(id => { const q = M.idx[id]; if (!q || offTypes.has(q.type)) return; const [x1, y1] = toS(q.x, q.y); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }); ctx.stroke(); };
    if (sel) litLinks(sel, near, rgba('#ebebf1', 0.8));
    if (hv && hv !== sel) litLinks(hv, hnear, rgba(hv.color, 0.85));
    /* ties to a second family, for the family that is open */
    if (st.f && !st.g){ ctx.setLineDash([2, 3]); ctx.lineWidth = 0.8; M.byFam[st.f].forEach(n => { const o = Families.of(n.id); if (!o.fam2 || !M.sec[o.fam2]) return; const d = M.idx[n.id]; const [x0, y0] = toS(d.x, d.y); const s2 = M.sec[o.fam2]; const a2 = Math.abs(s2.a0 - d.a) < Math.abs(s2.a1 - d.a) ? s2.a0 + 0.02 : s2.a1 - 0.02; const [x1, y1] = toS(Math.cos(a2) * d.r, Math.sin(a2) * d.r); ctx.strokeStyle = rgba(s2.color, 0.35); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }); ctx.setLineDash([]); }
    /* dots */
    const grow = Math.min(1.9, 1 + Math.log2(Math.max(1, k)) * 0.22) * (phone ? 0.85 : 1);
    M.D.forEach(d => { if (offTypes.has(d.type)) return; const [x, y] = toS(d.x, d.y); if (!inView(x, y, 8)) return; let a = 0.9;
      if (searching) a = lit.has(d.id) ? 1 : 0.15; else if (sel) a = d === sel || near.has(d.id) ? 1 : focus && focus.has(d.id) ? 0.35 : 0.12; else if (focus) a = focus.has(d.id) ? 0.95 : 0.1;
      ctx.globalAlpha = a; ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(x, y, d.rad * grow, 0, TAU); ctx.fill();
      if ((searching && lit.has(d.id)) || d === sel){ ctx.strokeStyle = '#fff'; ctx.lineWidth = d === sel ? 2 : 1.2; ctx.stroke(); } });
    ctx.globalAlpha = 1;
    /* genre marks: a diamond at the year the style began */
    if (!offTypes.has('genre')) Object.values(M.P).forEach(p => { const [x, y] = toS(p.x, p.y); if (!inView(x, y, 10)) return; const on = !focus || focus.has(p.id) || (st.f === p.k && !st.g); const z = (phone ? 4 : 4.6) * Math.min(1.5, grow); ctx.globalAlpha = searching ? (lit.has(p.id) ? 1 : 0.2) : sel ? (p === sel || near.has(p.id) ? 1 : 0.3) : on ? 1 : 0.18;
      ctx.fillStyle = p.color; ctx.strokeStyle = '#0e0e13'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y - z); ctx.lineTo(x + z, y); ctx.lineTo(x, y + z); ctx.lineTo(x - z, y); ctx.closePath(); ctx.fill(); ctx.stroke(); if (p === sel || st.g === p.id){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); } });
    ctx.globalAlpha = 1;
    /* labels: families round the edge, then genres, then names, none overlapping */
    labelBoxes = []; famBoxes = [];
    const place = (txt, x, y, font, fill, align = 'left', always = false, bg = false) => { ctx.font = font; const w = ctx.measureText(txt).width, h = +((/([\d.]+)px/.exec(font) || [])[1] || 10); const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; const b = [bx - 2, y - h, bx + w + 2, y + 3]; if (!always && (clash(b, labelBoxes) || b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2)) return null; labelBoxes.push(b); if (bg){ ctx.fillStyle = 'rgba(14,14,19,.72)'; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); } ctx.fillStyle = fill; ctx.textAlign = align; ctx.fillText(txt, x, y); return b; };
    Families.all.forEach(f => { const s = M.sec[f.k]; const dim = st.f && st.f !== f.k; const rr = R_EDGE * V.s + (phone ? 10 : 14); const x = V.ox + Math.cos(s.mid) * rr, y = V.oy + Math.sin(s.mid) * rr; const c = Math.cos(s.mid); const align = Math.abs(c) < 0.25 ? 'center' : c > 0 ? 'left' : 'right';
      const lines = phone && f.label.length > 11 ? (/ and /.test(f.label) ? f.label.replace(/ and /, ' and\n') : f.label.replace(/ (?=\S+$)/, '\n')).split('\n') : [f.label]; const fs = phone ? 9 : 10.5; const y0 = y + 4 - (lines.length - 1) * fs * 0.6 + (Math.sin(s.mid) > 0.6 ? 6 : 0);
      ctx.font = `600 ${fs}px ${mono}`; const tw = Math.max(...lines.map(t => ctx.measureText(t.toUpperCase()).width)); let xx = x; const left = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x; if (left < 4) xx += 4 - left; if (left + tw > W - 4) xx -= left + tw - (W - 4);
      ctx.globalAlpha = dim ? 0.45 : 1; const bs = lines.map((t, i) => place(t.toUpperCase(), xx, y0 + i * (fs + 2), `600 ${fs}px ${mono}`, f.k === 'across' ? '#9a9aae' : s.color, align, true, true)).filter(Boolean); ctx.globalAlpha = 1;
      if (bs.length){ const b = [Math.min(...bs.map(q => q[0])) - 6, Math.min(...bs.map(q => q[1])) - 6, Math.max(...bs.map(q => q[2])) + 6, Math.max(...bs.map(q => q[3])) + 6]; famBoxes.push([f.k, b]); if (cursor && cursor.kind === 'fam' && cursor.id === f.k){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); } } });
    if ((st.f === 'across' || (k > 2.2 && !st.f)) && M.groups) Object.entries(M.groups).forEach(([g, q]) => { const rr = 0.24 * V.s; place(Families.groupLabel(g), V.ox + Math.cos(q.mid) * rr, V.oy + Math.sin(q.mid) * rr, `600 ${phone ? 8.5 : 9.5}px ${mono}`, '#9a9aae', 'center', false, true); });
    if (sel){ const [x, y] = toS(sel.x, sel.y); place(sel.n.title, x + 9, y + 4, `600 ${phone ? 11 : 12}px ${ui}`, '#fff', 'left', true, true); }
    if (hv && hv !== sel){ const [x, y] = toS(hv.x, hv.y); place(hv.n.title, x + 9, y + 4, `600 12px ${ui}`, '#fff', 'left', true, true); }
    const showGenres = k >= (phone ? 1.9 : 1.6) || st.f;
    if (showGenres && !offTypes.has('genre')){ const gs = Object.values(M.P).filter(p => (!focus || focus.has(p.id) || st.f === p.k) && (!st.f || st.f === p.k || (focus && focus.has(p.id)))).sort((a, b) => (b.id === st.g) - (a.id === st.g) || members(b.id).length - members(a.id).length);
      gs.forEach(p => { if (p === sel) return; const [x, y] = toS(p.x, p.y); const t = p.n.title.length > 26 ? p.n.title.replace(/\s*\/.*$/, '').slice(0, 26) : p.n.title; const fnt = `${st.g === p.id ? 700 : 600} ${phone ? 10 : 11}px ${ui}`, c = st.g === p.id ? '#fff' : rgba(p.color, 1);
        place(t, x + 8, y + 4, fnt, c, 'left', false, true) || place(t, x - 8, y + 4, fnt, c, 'right', false, true) || place(t, x, y - 9, fnt, c, 'center', false, true) || place(t, x, y + 17, fnt, c, 'center', false, true); }); }
    const kk = focus ? k * 1.5 : k; const maxNames = kk < 2.4 ? 0 : kk < 4 ? 25 : kk < 7 ? 60 : kk < 12 ? 120 : 220; const minDeg = 0;   /* names come in as you zoom: the best-linked first */
    const cands = M.D.filter(d => !offTypes.has(d.type) && d !== sel && d !== hv && ((near && near.has(d.id)) || (searching && lit.has(d.id)) || (maxNames > 0 && (!focus || focus.has(d.id)) && !sel)));
    cands.sort((a, b) => ((near && near.has(b.id)) - (near && near.has(a.id))) || b.deg - a.deg); let shown = 0;
    for (const d of cands){ if (shown >= maxNames && !(near && near.has(d.id)) && !(searching && lit.has(d.id))) continue; const [x, y] = toS(d.x, d.y); if (!inView(x, y, 0)) continue; const t = d.n.title.length > 30 ? d.n.title.slice(0, 29) + '…' : d.n.title; const fnt = `${phone ? 9.5 : 10.5}px ${ui}`, c = near && near.has(d.id) ? '#fff' : '#d6d6e0'; if (place(t, x + 6, y + 3.5, fnt, c, 'left', false, true) || place(t, x - 6, y + 3.5, fnt, c, 'right', false, true)) shown++; }
    /* the keyboard cursor */
    if (cursor && cursor.kind !== 'fam'){ const d = M.idx[cursor.id]; if (d){ const [x, y] = toS(d.x, d.y); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } }
    stage.classList.toggle('zoomed', k > 1.03);
    const dt = performance.now() - t0; stats.last = dt; stats.frames.push(dt); if (stats.frames.length > 240) stats.frames.shift();
    countsSoon();
  }

  /* ---------- hit testing ---------- */
  function hit(x, y, touch){
    for (const [k, b] of famBoxes) if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return { kind: 'fam', id: k };
    const reach = touch ? 20 : 11; let best = null, bd = reach * reach;
    if (!offTypes.has('genre')) Object.values(M.P).forEach(p => { const [px, py] = toS(p.x, p.y); const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd * 1.3){ bd = d / 1.3; best = { kind: 'genre', id: p.id }; } });
    M.D.forEach(q => { if (offTypes.has(q.type)) return; const [px, py] = toS(q.x, q.y); const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd){ bd = d; best = { kind: 'node', id: q.id }; } });
    if (best) return best;
    const [wx, wy] = toW(x, y); const r = Math.hypot(wx, wy); if (r > R_EDGE * 1.04) return null;
    let a = Math.atan2(wy, wx); const s = Object.values(M.sec).find(q => { let aa = a; while (aa < q.a0) aa += TAU; while (aa > q.a0 + TAU) aa -= TAU; return aa <= q.a1; });
    return s ? { kind: 'sector', id: s.k } : null;
  }

  /* ---------- state and the address ---------- */
  function readHash(){ const q = new URLSearchParams((location.hash.split('?')[1] || '')); const f = q.get('f'), g = q.get('g'), n = q.get('n');
    st.f = f && M.sec[f] ? f : null; st.g = g && M.P[g] ? g : null; st.n = n && M.idx[n] ? n : null;
    if (st.g && !st.f) st.f = M.P[st.g].k; if (st.n && !st.f) st.f = Families.of(st.n).fam; if (st.g && st.f !== M.P[st.g].k) st.g = null; }
  const hashOf = s => { const q = []; if (s.f) q.push('f=' + encodeURIComponent(s.f)); if (s.g) q.push('g=' + encodeURIComponent(s.g)); if (s.n) q.push('n=' + encodeURIComponent(s.n)); return '#home' + (q.length ? '?' + q.join('&') : ''); };
  function go(s, fly){ if (fly) wantFly = true; const h = hashOf(s); if (h === location.hash || (h === '#home' && !location.hash)) apply(true); else location.hash = h; }
  function apply(anim){ if (!M) return; readHash(); cursor = null; const to = targetView(); fly(to, anim ? 480 : 0); ui(); }
  const up = () => { if (st.n) go({ f: st.f, g: st.g && members(st.g).includes(st.n) ? st.g : null }); else if (st.g) go({ f: st.f }); else if (st.f) go({}); };
  function choose(h){
    if (!h) return;
    if (h.kind === 'fam') go(st.f === h.id && !st.g && !st.n ? {} : { f: h.id });
    else if (h.kind === 'genre') go(st.g === h.id && !st.n ? { f: st.f } : { f: M.P[h.id].k, g: h.id });
    else if (h.kind === 'node'){ if (st.n === h.id){ location.hash = '#' + h.id; return; } const f = Families.of(h.id).fam; const g = st.g && members(st.g).includes(h.id) ? st.g : (Families.of(h.id).sub && M.P[Families.of(h.id).sub] && st.f === f ? (st.g || null) : null); go({ f, g, n: h.id }); }
    else if (h.kind === 'sector'){ if (st.n) go({ f: st.f, g: st.g }); else if (st.f !== h.id) go({ f: h.id }); }
  }

  /* ---------- the panels, the crumb, the chips ---------- */
  const title = id => (NODE[id] || {}).title || id;
  const famChip = k => `<button type="button" class="dg-f cg-fam${st.f === k ? ' on' : ''}" data-f="${k}" aria-pressed="${st.f === k}" style="--k:${M.sec[k].color}"><i></i>${esc(Families.label(k))} <small>${M.sec[k].n}</small></button>`;
  function ui(){
    const F = Families; const crumb = box.querySelector('.cg-crumb'); const parts = [['#home', 'Book']];
    if (st.f) parts.push([hashOf({ f: st.f }), F.label(st.f)]); if (st.g) parts.push([hashOf({ f: st.f, g: st.g }), title(st.g)]); if (st.n) parts.push([hashOf(st), title(st.n)]);
    crumb.innerHTML = parts.map(([h, t], i) => i === parts.length - 1 ? `<b aria-current="location">${esc(t)}</b>` : `<a href="${h}">${esc(t)}</a>`).join('<span aria-hidden="true">›</span>');
    box.querySelectorAll('.cg-fam').forEach(b => { const on = b.dataset.f === st.f; b.classList.toggle('on', on || !st.f); b.setAttribute('aria-pressed', on); });
    const side = box.querySelector('.cg-side'); let h = '';
    if (st.n){ const n = NODE[st.n], o = F.of(st.n) || {}; const nbs = [...(M.nb[st.n] || [])].filter(id => M.idx[id]).sort((a, b) => M.idx[b].deg - M.idx[a].deg);
      h += `<div class="cg-card"><small>${esc([TYPE_LABEL[n.type] || n.type, n.years].filter(Boolean).join(' · '))}</small><b>${esc(n.title)}</b><p>${esc(n.blurb || '')}</p>
        <p class="cap">${o.fam === 'across' ? esc(F.across.label + ' · ' + F.groupLabel(o.group)) : esc(F.label(o.fam))}${o.fam2 ? ' · tied also to ' + esc(F.label(o.fam2)) : ''}</p>
        <a class="chip cg-open" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type] || '--mix'});--ci:var(${TYPE_COLOR[n.type] || '--mix'})"><i></i>Open page →</a>
        ${nbs.length ? `<div class="cg-nb"><small>Linked to ${nbs.length} · tap to step along</small>${nbs.slice(0, 24).map(id => `<button type="button" class="chip cg-step" data-n="${id}" style="--c:var(${TYPE_COLOR[NODE[id].type] || '--mix'});--ci:var(${TYPE_COLOR[NODE[id].type] || '--mix'})"><i></i>${esc(title(id))}</button>`).join('')}${nbs.length > 24 ? `<small>and ${nbs.length - 24} more on the page</small>` : ''}</div>` : ''}</div>`;
    }
    if (st.g){ const g = NODE[st.g]; const ps = F.parents(st.g).filter(p => M.P[p]); const ks = Object.keys(M.P).filter(id => F.parents(id).includes(st.g)); const ms = members(st.g);
      h += `<div class="cg-card"><small>Genre · ${esc(g.years || '')}</small><b style="color:${M.P[st.g].color}">${esc(g.title)}</b>${st.n ? '' : `<p>${esc(g.blurb || '')}</p>`}
        ${ps.length ? `<div class="cg-nb"><small>Grew out of</small>${ps.map(id => `<a class="chip" href="${hashOf({ f: M.P[id].k, g: id })}" style="--c:${M.P[id].color};--ci:${M.P[id].color}"><i></i>${esc(title(id))}</a>`).join('')}</div>` : ''}
        ${ks.length ? `<div class="cg-nb"><small>Led to</small>${ks.map(id => `<a class="chip" href="${hashOf({ f: M.P[id].k, g: id })}" style="--c:${M.P[id].color};--ci:${M.P[id].color}"><i></i>${esc(title(id))}</a>`).join('')}</div>` : ''}
        <p class="cap">${ms.length} page${ms.length === 1 ? '' : 's'} tied to it are lit. <a class="xl" href="#${st.g}">Open the genre page →</a></p></div>`;
    }
    if (st.f && !st.g && !st.n){ const gs = M.marks[st.f] || []; const fam = F.byKey[st.f];
      h += `<div class="cg-card"><small>Family · ${M.sec[st.f].n} pages</small><b style="color:${st.f === 'across' ? '#9a9aae' : M.sec[st.f].color}">${esc(fam.label)}</b><p>${esc(fam.about)}</p>
        ${gs.length ? `<div class="cg-nb"><small>${gs.length} styles, in order of descent · tap one</small>${gs.map(id => `<a class="chip" href="${hashOf({ f: st.f, g: id })}" style="--c:${M.P[id].color};--ci:${M.P[id].color}"><i></i>${esc(title(id))} <small>${startYear(NODE[id])}</small></a>`).join('')}</div>` : st.f === 'across' ? `<p class="cap">Pages the book does not tie to one music: ${Object.entries(M.groups).map(([g, q]) => esc(F.groupLabel(g)) + ' (' + q.n + ')').join(', ')}.</p>` : ''}</div>`;
    }
    if (!st.f) h = `<div class="cg-card"><small>The whole book</small><b>${M.D.length + Object.keys(M.P).length} pages in ${Families.list.length} families</b><p>Each sector is a family of music; its branch runs out from the centre and each style is a limb at the year it began, joined to what it grew out of. ${esc(F.across.label)}, in grey, holds the machines, the law, the trade and the rooms the book does not tie to one sound.</p><p class="cap">Tap a family to open it; pinch or scroll to zoom; drag to move.</p></div>`;
    side.innerHTML = h;
    side.querySelectorAll('.cg-step').forEach(b => b.onclick = () => { wantFly = true; choose({ kind: 'node', id: b.dataset.n }); });
    if (window.smarten) try { smarten(side); } catch (e) {}
    live(st.n ? `${title(st.n)} selected. Enter opens the page; arrow keys step along its links; Escape goes back.` : st.g ? `${title(st.g)}: ${members(st.g).length} pages. Arrow keys move through them; Escape goes back.` : st.f ? `${F.label(st.f)} open: ${M.sec[st.f].n} pages. Arrow keys move along its styles; Escape goes back to the book.` : 'The whole book. Arrow keys move between the families; Enter opens one.');
    countsSoon(true);
  }
  let liveT = 0; const live = t => { clearTimeout(liveT); liveT = setTimeout(() => { const l = box.querySelector('.cg-live'); if (l) l.textContent = t; }, 250); };
  let cT = 0; function countsSoon(now){ clearTimeout(cT); cT = setTimeout(counts, now ? 0 : 160); }
  function counts(){ const focus = focusSet(); const c = {}; [...M.D, ...Object.values(M.P)].forEach(d => { if (focus && !focus.has(d.id)) return; const [x, y] = toS(d.x, d.y); if (x < 0 || x > W || y < 0 || y > H) return; c[d.type] = (c[d.type] || 0) + 1; }); box.querySelectorAll('.cg-type').forEach(b => { b.querySelector('small').textContent = c[b.dataset.k] || 0; }); }

  /* ---------- keyboard ---------- */
  function items(){
    if (st.n) return [st.n, ...[...(M.nb[st.n] || [])].filter(id => M.idx[id]).sort((a, b) => M.idx[a].a - M.idx[b].a)].map(id => ({ kind: M.P[id] ? 'genre' : 'node', id }));
    if (st.g) return [st.g, ...members(st.g).filter(id => M.idx[id] && !M.P[id]).sort((a, b) => (M.idx[a].r - M.idx[b].r))].map(id => ({ kind: id === st.g ? 'genre' : 'node', id }));
    if (st.f) return (M.marks[st.f].length ? M.marks[st.f] : M.byFam[st.f].map(n => n.id).sort((a, b) => M.idx[a].r - M.idx[b].r)).map(id => ({ kind: M.P[id] ? 'genre' : 'node', id }));
    return Families.all.map(f => ({ kind: 'fam', id: f.k }));
  }
  function key(e){
    const it = items(); let i = cursor ? it.findIndex(x => x.id === cursor.id) : -1;
    const move = d => { e.preventDefault(); i = (i + d + it.length) % it.length; cursor = it[i]; const q = M.idx[cursor.id]; if (q){ const [x, y] = toS(q.x, q.y); if (x < 30 || x > W - 30 || y < 30 || y > H - 30) fly(clampV({ s: V.s, ox: W / 2 - q.x * V.s, oy: H / 2 - q.y * V.s }), 250); }
      const lbl = cursor.kind === 'fam' ? `${Families.label(cursor.id)}, ${M.sec[cursor.id].n} pages` : `${title(cursor.id)}, ${cursor.kind === 'genre' ? 'genre, ' + (NODE[cursor.id].years || '') : (TYPE_LABEL[NODE[cursor.id].type] || '') + (NODE[cursor.id].years ? ', ' + NODE[cursor.id].years : '')}`; live(`${lbl}. ${i + 1} of ${it.length}.`); queue(); };
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(-1);
    else if (e.key === 'Home'){ i = 0; move(0); } else if (e.key === 'End'){ i = it.length - 1; move(0); }
    else if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); const c = cursor || (st.n ? { kind: 'node', id: st.n } : null); if (!c) return; if (c.kind === 'node' && c.id === st.n) location.hash = '#' + c.id; else { wantFly = c.kind === 'node'; choose(c); } }
    else if (e.key === 'Escape'){ if (st.f || st.g || st.n){ e.preventDefault(); up(); } }
    else if (e.key === '+' || e.key === '='){ e.preventDefault(); zoomAbout(W / 2, H / 2, 1.5); } else if (e.key === '-'){ e.preventDefault(); zoomAbout(W / 2, H / 2, 1 / 1.5); }
  }

  /* ---------- pointer, touch, wheel ---------- */
  function wire(){
    const ptr = new Map(); let drag = null, pinch = null, lastTap = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, pos(e)); cancelAnimationFrame(flyAnim);
      if (ptr.size === 1){ const [x, y] = pos(e); drag = { x, y, ox: V.ox, oy: V.oy, moved: false, t: performance.now(), type: e.pointerType }; pinch = null; }
      else if (ptr.size === 2){ const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], v: { ...V } }; drag = null; } });
    cv.addEventListener('pointermove', e => {
      if (!ptr.has(e.pointerId)){ if (e.pointerType === 'mouse'){ const [x, y] = pos(e); const h = hit(x, y, false); const id = h && (h.kind === 'node' || h.kind === 'genre') ? h.id : null; cv.style.cursor = h && h.kind !== 'sector' ? 'pointer' : 'grab'; if (id !== hover){ hover = id; queue(); } } return; }
      ptr.set(e.pointerId, pos(e));
      if (pinch && ptr.size >= 2){ const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const wx = (pinch.m[0] - pinch.v.ox) / pinch.v.s, wy = (pinch.m[1] - pinch.v.oy) / pinch.v.s; const s = Math.max(base * 0.85, Math.min(base * 60, pinch.v.s * d / pinch.d)); V = clampV({ s, ox: m[0] - wx * s, oy: m[1] - wy * s }); queue(); return; }
      if (drag){ const [x, y] = pos(e); if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) > 5) drag.moved = true; if (drag.moved){ V = clampV({ s: V.s, ox: drag.ox + x - drag.x, oy: drag.oy + y - drag.y }); cv.style.cursor = 'grabbing'; queue(); } }
    });
    const end = e => { const had = ptr.has(e.pointerId); ptr.delete(e.pointerId); if (!had) return;
      if (pinch){ if (ptr.size < 2) pinch = null; if (ptr.size === 1){ const [p] = [...ptr.values()]; drag = { x: p[0], y: p[1], ox: V.ox, oy: V.oy, moved: true }; } return; }
      if (drag && !drag.moved && e.type === 'pointerup'){ const [x, y] = pos(e); const touch = drag.type !== 'mouse'; const now = performance.now();
        if (touch && lastTap && now - lastTap.t < 320 && Math.hypot(x - lastTap.x, y - lastTap.y) < 30){ lastTap = null; dbl(x, y); }
        else { lastTap = { t: now, x, y }; choose(hit(x, y, touch)); } }
      drag = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', () => { if (hover){ hover = null; queue(); } });
    cv.addEventListener('dblclick', e => { e.preventDefault(); const [x, y] = pos(e); dbl(x, y); });
    const dbl = (x, y) => { const [wx, wy] = toW(x, y); let a = Math.atan2(wy, wx); const s = Object.values(M.sec).find(q => { let aa = a; while (aa < q.a0) aa += TAU; while (aa > q.a0 + TAU) aa -= TAU; return aa <= q.a1; }); if (s) go({ f: s.k }); };
    cv.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = pos(e); const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; zoomAbout(x, y, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022))); }, { passive: false });
    /* two fingers zoom the chart, never the page; one finger at the whole-book view still scrolls the page (touch-action: pan-y) */
    cv.addEventListener('touchstart', e => { e.stopPropagation(); if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchmove', e => { if (e.touches.length > 1 || K() > 1.03) e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchend', e => e.stopPropagation());
    cv.addEventListener('keydown', key);
    cv.addEventListener('focus', () => { if (!cursor){ const it = items(); cursor = st.n ? { kind: 'node', id: st.n } : it[0]; queue(); } });
    cv.addEventListener('blur', () => { cursor = null; queue(); });
    /* buttons */
    box.querySelector('.cg-ctl').addEventListener('click', e => { const b = e.target.closest('[data-z]'); if (!b) return; if (b.dataset.z === 'in') zoomAbout(W / 2, H / 2, 1.6); else if (b.dataset.z === 'out') zoomAbout(W / 2, H / 2, 1 / 1.6); else { if (st.f || st.g || st.n) go({}); else fly(bookView(), 400); } });
    box.querySelector('.cg-fams').addEventListener('click', e => { const b = e.target.closest('.cg-fam'); if (b) choose({ kind: 'fam', id: b.dataset.f }); });
    box.querySelector('.cg-types').addEventListener('click', e => { const b = e.target.closest('.cg-type'); if (!b) return; b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); if (!box.querySelector('.cg-type.on')) box.querySelectorAll('.cg-type').forEach(x => { x.classList.add('on'); x.setAttribute('aria-pressed', 'true'); }); offTypes = new Set([...box.querySelectorAll('.cg-type:not(.on)')].map(x => x.dataset.k)); queue(); });
    /* light up a name: matches glow as you type, the best few are offered, choosing one flies to it */
    const find = box.querySelector('.cg-find input'), sug = box.querySelector('.cg-sugg'); let hits = [];
    const pick = id => { find.value = ''; sug.innerHTML = ''; sug.hidden = true; lit = new Set(); wantFly = true; choose({ kind: M.P[id] ? 'genre' : 'node', id }); if (M.P[id]) { /* a genre opens as a limb */ } };
    find.addEventListener('input', () => { const q = norm(find.value.trim()); lit = new Set(); hits = []; if (q.length >= 2){ [...M.D, ...Object.values(M.P)].forEach(d => { const n = d.n; const t = norm(n.title); const sc = t === q ? 0 : t.startsWith(q) ? 1 : (' ' + t).includes(' ' + q) ? 2 : t.includes(q) ? 3 : (n.aliases || []).some(a => norm(a).includes(q)) ? 4 : -1; if (sc >= 0){ lit.add(d.id); hits.push([sc, d]); } }); hits.sort((a, b) => a[0] - b[0] || b[1].deg - a[1].deg); }
      sug.innerHTML = hits.slice(0, 6).map(([, d], i) => `<button type="button" role="option" data-id="${d.id}"${i ? '' : ' aria-selected="true"'}><i style="background:${d.color}"></i>${esc(d.n.title)}<small>${esc(TYPE_LABEL[d.type] || d.type)}${d.n.years ? ' · ' + esc(d.n.years) : ''}</small></button>`).join('') + (q.length >= 2 && !hits.length ? '<p class="cap">No page by that name.</p>' : '');
      sug.hidden = !sug.innerHTML; queue(); });
    find.addEventListener('keydown', e => { if (e.key === 'Enter' && hits.length){ e.preventDefault(); pick(hits[0][1].id); } else if (e.key === 'Escape'){ find.value = ''; find.dispatchEvent(new Event('input')); } else if (e.key === 'ArrowDown'){ const f = sug.querySelector('button'); if (f){ e.preventDefault(); f.focus(); } } });
    sug.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) pick(b.dataset.id); });
    sug.addEventListener('keydown', e => { const b = e.target.closest('button'); if (!b) return; if (e.key === 'ArrowDown' && b.nextElementSibling){ e.preventDefault(); b.nextElementSibling.focus(); } if (e.key === 'ArrowUp'){ e.preventDefault(); (b.previousElementSibling || find).focus(); } if (e.key === 'Escape'){ find.focus(); } });
    new ResizeObserver(() => size()).observe(stage);
  }
  function size(){
    const r = stage.getBoundingClientRect(); if (!r.width) return; const was = W; W = r.width; H = r.height; DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); base = Math.min(W, H) / 2 / (W < 520 ? 1.3 : 1.2);
    if (!V || !was){ readHash(); V = bookView(); V = targetView(); ui(); } else V = targetView();
    draw();
  }

  /* ---------- mount ---------- */
  function mount(){
    box = document.getElementById('coverGraph'); if (!box || box.dataset.drawn) return; box.dataset.drawn = 1;
    build();
    box.innerHTML = `<nav class="cg-crumb" aria-label="Where you are in the graph"></nav>
      <div class="cg-stage"><canvas tabindex="0" role="application" aria-roledescription="graph" aria-label="The whole book as a tree: ${Families.list.length} families of music and ${esc(Families.across.label)}. Arrow keys move, Enter opens, Escape goes back, plus and minus zoom." aria-describedby="cgHelp"></canvas></div>
      <div class="cg-ctl"><button type="button" class="chip" data-z="in" aria-label="Zoom in">+</button><button type="button" class="chip" data-z="out" aria-label="Zoom out">−</button><button type="button" class="chip" data-z="reset">Reset view</button>
        <span class="cg-find"><input type="search" class="dg-findbox" placeholder="Light up a name…" aria-label="Find a page on the graph" autocomplete="off"><span class="cg-sugg" role="listbox" hidden></span></span></div>
      <div class="cg-side"></div>
      <div class="dg-bar cg-fams" role="group" aria-label="Families: tap one to open it">${Families.all.map(f => famChip(f.k)).join('')}</div>
      <div class="dg-bar cg-types" role="group" aria-label="Kinds of page: switch them off and on (counts are for the current view)">${TYPES.filter(t => TYPE_LABEL[t] && NODES.some(n => n.type === t)).map(t => `<button type="button" class="dg-f on cg-type" data-k="${t}" aria-pressed="true" style="--k:${col(TYPE_COLOR[t])}"><i></i>${esc(TYPE_LABEL[t])} <small>0</small></button>`).join('')}</div>
      <p class="cap cg-help" id="cgHelp">Pinch, scroll or use + and − to zoom; drag to move; double-tap a sector to fit it. Tap a family, then a style, then a dot; the address keeps your place, and Back steps out again. Keyboard: arrow keys, Enter, Escape.</p>
      <p class="cg-live" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p>`;
    stage = box.querySelector('.cg-stage'); cv = stage.querySelector('canvas'); ctx = cv.getContext('2d');
    wire(); size();
    const count = t => NODES.filter(n => n.type === t).length; const chapters = Object.values(STRANDS).reduce((s, v) => s + v.spine.length, 0);
    const stt = document.getElementById('coverStats'); if (stt) stt.innerHTML = `<b>${NODES.length}</b> pages · ${count('person')} people · ${count('club')} clubs and rooms · ${count('record')} records · ${count('label')} labels · ${count('event')} events · ${count('machine')} machines · ${count('genre')} genres · <b>${NODES.reduce((s, n) => s + n.rel.length, 0)}</b> links · ${chapters} chapters across ${Object.keys(STRANDS).length} strands. Placed by family and by year: rings mark 1950, 1980, 1990, 2000, 2010 and 2020; dots scale with how connected a page is; diamonds are styles, drawn where they began and joined to what they grew out of.`;
  }
  return { mount, apply: () => apply(true), stats, state: st, view: () => V, model: () => M, famBoxes: () => famBoxes, base: () => base, hit: (x, y) => hit(x, y, false), toS: (x, y) => toS(x, y) };
})();
/* the cover's hooks: drawn when the cover opens; ?f= g= n= changes on the cover move the graph without leaving the page */
function drawCoverGraph(){ CoverGraph.mount(); }
(() => { const prev = window.PageHooks.home; window.PageHooks.home = () => { if (prev) prev(); drawCoverGraph(); }; window.PageHooks['home?'] = () => CoverGraph.apply(); })();
if (!location.hash || /^#home(\?|$)/.test(location.hash)) setTimeout(drawCoverGraph, 50);
