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
function drawCoverGraph(){
  const svg = document.getElementById('coverGraph'); if (!svg || svg.dataset.drawn) return; svg.dataset.drawn = 1;
  const W = 900, H = 610, cx = 450, cy = 300; const rOf = y => y < 1980 ? 40 + (y - 1920) / 60 * 50 : 90 + (y - 1980) / 46 * 160; clearSvg(svg, W, H);
  const order = ['techno', 'house', 'rave', 'jungle', 'trance']; const span = Math.PI * 2 / order.length;
  const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h / 1000003; };
  const pos = {};
  NODES.forEach(n => { const st = order.indexOf((n.strands || [])[0]); const si = st < 0 ? 0 : st; const yy = YearView.years(n); const yr = yy ? Math.min(2026, Math.max(1920, yy[0])) : null; const r = yr ? rOf(yr) + (hash(n.id + 'r') - .5) * 10 : 262; const a = -Math.PI / 2 + si * span + 0.06 + hash(n.id) * (span - 0.12); pos[n.id] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, n]; });
  [1950, 1980, 1990, 2000, 2010, 2020].forEach(y => { const r = rOf(y); el('circle', { cx, cy, r, fill: 'none', stroke: '#1e1e28' }, svg); text(svg, cx - 4, cy - r + 9, y, { 'font-size': 8, fill: '#6a6a80', 'text-anchor': 'end' }); });
  order.forEach((s, i) => { const a = -Math.PI / 2 + i * span; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 275, y2: cy + Math.sin(a) * 275, stroke: '#1e1e28' }, svg); const am = a + span / 2; const first = (STRANDS[s].spine || [])[0]; const link = el('a', { href: '#' + first, 'aria-label': STRANDS[s].title + ' strand: start reading' }, svg); text(link, cx + Math.cos(am) * 278, cy + Math.sin(am) * 278 + 4, STRANDS[s].title.toUpperCase(), { 'text-anchor': 'middle', 'font-size': 9, 'letter-spacing': '.14em', fill: css(STRANDS[s].color) }); });
  const g = el('g', { opacity: .18, class: 'cg-edges' }, svg); let links = 0;
  NODES.forEach(n => n.rel.forEach(([r, t]) => { const q = pos[t]; if (!q || r === 'in') return; links++; const p = pos[n.id]; el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: css(TYPE_COLOR[n.type] || '--text'), 'stroke-width': .6 }, g); }));
  const hl = el('g', { 'pointer-events': 'none' }, svg); /* the lit links of the dot under the pointer */
  const dots = {};
  NODES.forEach(n => { const [x, y] = pos[n.id]; if (n.type === 'city') return; const deg = n.rel.length + ((BACK[n.id] || []).length); const a = el('a', { href: '#' + n.id, 'aria-label': n.title + ', ' + (TYPE_LABEL[n.type] || n.type) + (n.years ? ', ' + n.years : '') }, svg); a.dataset.dgk = n.type; a.style.setProperty('--dgd', Math.round(Math.max(0, Math.hypot(x - cx, y - cy) - 40) / 225 * 1500) + 'ms'); el('circle', { cx: x, cy: y, r: Math.min(6, 1.6 + Math.sqrt(deg) * .55), fill: css(TYPE_COLOR[n.type] || '--text'), opacity: .9 }, a); dots[n.id] = a; });
  const near = id => { const s = new Set(); (NODE[id].rel || []).forEach(([r, t]) => { if (pos[t] && r !== 'in') s.add(t); }); (BACK[id] || []).forEach(([, src]) => { if (pos[src]) s.add(src); }); return [...s]; };
  Dg.wire(svg, { reach: 16, onlight(m){ while (hl.firstChild) hl.removeChild(hl.firstChild); if (!m || !m.dataset.dgk) return; const id = m.getAttribute('href').slice(1); const p = pos[id]; if (!p) return; const c = css(TYPE_COLOR[NODE[id].type] || '--text'); near(id).forEach(t => { const q = pos[t]; el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: c, 'stroke-width': 1.1, opacity: .85 }, hl); if (dots[t]) dots[t].classList.add('dg-lit'); }); } });
  Object.entries(dots).forEach(([id, a]) => Dg.mark(a, () => { const n = NODE[id]; const k = near(id).length; return { id, meta: [TYPE_LABEL[n.type] || n.type, n.years, k + (k === 1 ? ' link' : ' links')].filter(Boolean).join(' · ') }; }));
  const types = ['person', 'club', 'record', 'label', 'event', 'set', 'genre', 'machine', 'station', 'collective', 'border'];
  const bar = Dg.legend(svg, types.filter(t => TYPE_LABEL[t]).map(t => [t, TYPE_LABEL[t], css(TYPE_COLOR[t])]), 'after');
  /* light up a name */
  const find = document.createElement('input'); find.type = 'search'; find.className = 'dg-findbox'; find.placeholder = 'Light up a name…'; find.setAttribute('aria-label', 'Light up pages on the graph by name');
  bar.appendChild(find);
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‘’“”'"]/g, '').toLowerCase();
  let hits = [];
  find.addEventListener('input', () => { const q = norm(find.value.trim()); svg.querySelectorAll('.dg-lit').forEach(e => e.classList.remove('dg-lit')); hits = []; if (q.length < 2){ svg.classList.remove('dg-hl'); return; } Object.entries(dots).forEach(([id, a]) => { const n = NODE[id]; if ([n.title, ...(n.aliases || [])].some(t => norm(t).includes(q))){ a.classList.add('dg-lit'); hits.push(id); } }); svg.classList.toggle('dg-hl', hits.length > 0); });
  find.addEventListener('keydown', e => { if (e.key === 'Enter' && hits.length){ e.preventDefault(); location.hash = '#' + hits[0]; } if (e.key === 'Escape'){ find.value = ''; find.dispatchEvent(new Event('input')); } });
  const count = t => NODES.filter(n => n.type === t).length; const chapters = Object.values(STRANDS).reduce((s, v) => s + v.spine.length, 0);
  const st = document.getElementById('coverStats'); if (st) st.innerHTML = `<b>${NODES.length}</b> pages · ${count('person')} people · ${count('club')} clubs and rooms · ${count('record')} records · ${count('label')} labels · ${count('event')} events · ${count('set')} landmark sets · ${count('machine')} machines · ${count('genre')} genres · <b>${NODES.reduce((s, n) => s + n.rel.length, 0)}</b> links, each followed both ways · ${chapters} chapters across ${Object.keys(STRANDS).length} strands · ${typeof GENRE_NAMES !== 'undefined' ? GENRE_NAMES.length : ''} sound presets. Placed by strand and by year, rings mark 1950, 1980, 1990, 2000, 2010 and 2020; dots scale with how connected a page is. Point at a dot to light its links, click to open it; the chips switch kinds of page off and on.`;
}
(() => { const prev = window.PageHooks.home; window.PageHooks.home = () => { if (prev) prev(); drawCoverGraph(); }; })();
if (!location.hash || location.hash === '#home') setTimeout(drawCoverGraph, 50);
