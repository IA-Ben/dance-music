/* ===================================================================
   ART — the collage plates that open the cover, each strand and each
   year page. Made with Krea for this book in the manner of photocopied
   club flyers: a night photograph shot with flash, halftone scraps and
   torn fluorescent paper. Invented scenes: no real people, no logos,
   no record sleeves. The era stamp on each plate is set in type here,
   never drawn by the generator, so the names and dates are always right.
   =================================================================== */
window.ART_YEARS = Array.from({ length: 42 }, (_, i) => 1986 + i);
window.Art = {
  MAP: { timeline: 'years', h0: 'techno', house0: 'house', r0: 'rave', j0: 'jungle', t0: 'trance', k0: 'tech', l0: 'law', i0: 'ibiza', go0: 'goa', a0: 'anatomy', mixer: 'mixer', orb0: 'm25', lp0: 'lovepar', det0: 'detroit', chi0: 'chicago', ny0: 'newyork', floor: 'floor', genres: 'genres', explore: 'explore', djs: 'djs', cities: 'cities', make: 'make', nights: 'nights', crate: 'crate', shops: 'shops', tours: 'tours', sound: 'sound', press: 'press', quiz: 'quiz', path: 'path', disputes: 'disputes', listings: 'listings' },
  ALT: {
    cover: 'From behind the decks at five in the morning: a record spinning, a hand on the mixer, and a dark crowd with raised arms under a strobe.',
    years: 'Torn strips of night photographs side by side: a figure in a field, laser beams, a warehouse doorway, a crowd at a stage in the rain.',
    techno: 'A lone dancer in a pool of light between rows of abandoned cars in a factory hall.',
    house: 'A sweltering basement dance floor under a mirror ball, dancers in sweat-soaked vests and T-shirts.',
    rave: 'Dawn over a field after an all-night party: figures on the ridge, lasers in the mist, a speaker stack and parked cars along the lane.',
    jungle: 'A home-made radio aerial on a tower-block roof at night, its cable running down to one lit window.',
    trance: 'Thousands of raised hands under laser beams converging on one point of light.',
    tech: 'A second-hand shop window at night crammed with old synthesisers and drum machines, blank price tags hanging above, a wet street outside.',
    law: 'Police cars with flashing lights blocking a country lane at night, a party glowing beyond the trees.',
    ibiza: 'An open-air dance floor in the small hours: a sweaty crowd in front of a whitewashed DJ booth, a palm against the black sky.',
    goa: 'A palm beach at night under a full moon: ultraviolet backdrops, a speaker stack on the sand, dancers.',
    anatomy: 'A loudspeaker with sound rising from it in torn layers like rock strata.',
    mixer: 'Two hands on a DJ mixer between two spinning records.',
    m25: 'A convoy of cars on a country road at night, headlights on, heading for a lit marquee in a field.',
    lovepar: 'A boulevard packed with dancers between slow trucks of speakers, a golden winged column at the end of the avenue.',
    detroit: 'A derelict tower with broken windows above an empty avenue at night, factory chimneys and sodium lights beyond.',
    chicago: 'An elevated train over a city street at night, a queue outside a club door below.',
    newyork: 'A loft party in the small hours: dancers between cast-iron columns, a tall stack of speakers, a water tower in the window.',
    floor: 'Inside a crowd on a dance floor: wet hair, raised arms, a strobe in the smoke.',
    genres: 'Patch cables spilling across a modular synthesiser in a dark studio like the branches of a tree, small lights glowing.',
    explore: 'A corkboard of flyers and dance-floor snapshots joined by red string, lit by a desk lamp above a turntable.',
    djs: 'An empty DJ booth under coloured lights: two turntables, a gaffer-taped mixer, a record bag full of vinyl and a torch.',
    cities: 'Tower blocks and railway arches seen through a rain-flecked train window at night, a record on the seat.',
    make: 'A bedroom studio late at night: a drum machine, a synthesiser and a sampler on a cluttered desk under an anglepoise lamp.',
    nights: 'A queue in the rain along a brick wall towards a red-lit club door, a torch beam in the drizzle.',
    crate: 'Fingers flicking through a crate of records, one pulled out to show a blank white label.',
    shops: 'Inside a record shop after closing: racks of vinyl, headphones on hooks, strip lights, the street dark beyond the door.',
    tours: 'The front window of an empty night bus in the rain, a folded map on the seat and the city lights ahead.',
    sound: 'A wall of loudspeaker cabinets stacked in a field at dusk, cables across the grass, a work light and an open van.',
    press: 'A fanzine being made by hand under a lamp: a typewriter, scissors, glue and cut-out photographs of dance floors.',
    quiz: 'Headphones beside a spinning record, a pencil and a scrap of paper with a column of ticked boxes.',
    path: 'A muddy footpath across a field at dawn after a party, glow sticks in the grass and a marquee in the mist.',
    disputes: 'A magnifying glass on a pile of cassettes and record sleeves under a desk lamp, index cards and a red pencil.',
    listings: 'A red telephone box on a wet street at night, its glass covered in faded flyers, the receiver off the hook.'
  },
  YEAR_ALT: {
    y1986: 'A packed early club night, dancers moving around a turntable and a reel-to-reel tape machine.',
    y1987: 'A basement party lit by one red bulb: a small silver synthesiser and a drum machine on an upturned crate, a dancer blurred behind.',
    y1988: 'Dancers in dry ice under a single spotlight, arms flung out.',
    y1989: 'A car on a dark road at night, heading for a lit warehouse.',
    y1990: 'A towering stack of speaker cabinets in a dark warehouse.',
    y1991: 'Dancers seen through the open door of a steel bank vault.',
    y1992: 'A free party in a field at night: tents, camper vans, a speaker rig and laser beams in the smoke.',
    y1993: 'An old car parked on a wet street at night outside a block of flats.',
    y1994: 'A sound-system truck stacked with speakers rolling through a protest crowd at night, a flare burning, police in yellow jackets.',
    y1995: 'A lone figure under a ring of light in an empty concrete space.',
    y1996: 'Raised hands reaching up towards a lighting rig in the smoke.',
    y1997: 'Inside a vast round gasholder hall: a crowd under the iron roof, lasers through the smoke.',
    y1998: 'A lone dancer at the end of a railway tunnel, lit from behind.',
    y1999: 'A crowd and trucks of speakers on a wide avenue, a victory column in the distance.',
    y2000: 'A free festival on a concrete riverside plaza at night: scaffolding stages, a crowd on the steps, office towers behind.',
    y2001: 'A jet roaring low over an open-air terrace at night, landing lights blazing above a crowd with raised arms.',
    y2002: 'Dancers under a brick arch, a red light cutting through the smoke.',
    y2003: 'A nearly empty club at seven in the morning: a few dancers, one red bulb, a small speaker stack, long shadows.',
    y2004: 'A long queue in front of a vast concrete building at night.',
    y2005: 'A wall of speakers in a warehouse, one dancer in a beam of light.',
    y2006: 'A big outdoor stage between tower blocks, a dense crowd in front.',
    y2007: 'Lasers and smoke inside a vast derelict industrial hall.',
    y2008: 'A crowd in a raw warehouse room beside a speaker stack, a tower block through the window.',
    y2009: 'Dancers in a bare-bulb basement club.',
    y2010: 'An empty dance floor in a dark concrete hall under a single lamp.',
    y2011: 'Five turntables in a row on a rough stage, the DJs seen from behind, a crowd pressed against the barrier.',
    y2012: 'A dense crowd caught by a single strobe under a low concrete ceiling, sweat on the pipes.',
    y2013: 'A festival stage among trees at night, the trunks lit white by strobes, a crowd in the mud.',
    y2014: 'A crowd in smoke and strobe light between concrete pillars.',
    y2015: 'A crowd under strip lights and laser lines in a low dark room.',
    y2016: 'A queue outside a club at night, faces lit by phone screens.',
    y2017: 'A huge crowd in a steel-framed warehouse hall.',
    y2018: 'Clouds of vapour in a club yard, figures in hoodies.',
    y2019: 'A festival stage with lasers fanning out over a vast crowd.',
    y2020: 'An empty club room, chairs stacked on the tables, one phone glowing on the floor.',
    y2021: 'A crowd pouring back through a club doorway into the smoke.',
    y2022: 'A packed industrial hall under red and yellow girders.',
    y2023: 'A crowd moving between giant rusted printing presses in red light and smoke.',
    y2024: 'A riverside club on its last night: a crowd under glowing ceiling panels, bridge lights on the black water outside.',
    y2025: 'A packed basement jungle night in a seaside town, under a low ceiling.',
    y2026: 'A record made of torn photographs: a warehouse, a field with a laser, a beach, a crowd and an empty room.',
    y2027: 'An anniversary: a stack of records with one lit candle on a DJ booth, in front of torn photographs of a packed club, an empty field rave site, a beach at sunset and a laser hall.'
  },
  /* the era stamp: name and dates, in the strand's colour */
  STAMP: { cover: ['fortyyearsof.dance', '1987–2027', '--samp'], years: ['Forty years', '1987–2027', '--mix'], techno: ['Techno', '1985–', '--rumble'], house: ['House', '1977–', '--drums'], rave: ['Rave', '1988–', '--perc'], jungle: ['Jungle', '1992–', '--samp'], trance: ['Trance', '1990–', '--synth'], tech: ['The machines', '1980–2026', '--synth'], law: ['The law', '1985–2026', '--kick'], ibiza: ['Ibiza', '1983–', '--perc'], goa: ['Goa', '1987–', '--rumble'], anatomy: ['Anatomy', 'of a track', '--kick'], mixer: ['The mix', 'two decks', '--bass'], m25: ['The M25', '1988–90', '--perc'], lovepar: ['Love Parade', '1989–2010', '--samp'], detroit: ['Detroit', '1977–', '--rumble'], chicago: ['Chicago', '1977–', '--drums'], newyork: ['New York', '1970–', '--bass'], floor: ['From the floor', '1977–2026', '--drums'] , genres: ['Family tree', '40 genres', '--synth'], explore: ['The graph', 'every page', '--mix'], djs: ['DJs', 'and producers', '--kick'], cities: ['Cities', 'how it spread', '--perc'], make: ['Make it', 'forty recipes', '--bass'], nights: ['Club nights', '', '--drums'], crate: ['Your crate', '', '--perc'], shops: ['Record shops', 'the counters', '--samp'] , tours: ['Guided tours', 'a dozen stops', '--mix'], sound: ['The rigs', 'sound systems', '--bass'], press: ['The press', 'who wrote it down', '--drums'], quiz: ['Blind test', 'ten rounds', '--synth'], path: ['Six degrees', 'any two pages', '--perc'], disputes: ['Corrections', 'open questions', '--kick'], listings: ['What was on', 'the listings', '--samp'] },
  /* a year plate is stamped with its year, in the fluorescent ink of its collage */
  YEAR_INK: { 1986: 'or', 1987: 'or', 1988: 'ye', 1989: 'ye', 1990: 'mi', 1991: 'pi', 1992: 'ye', 1993: 'pi', 1994: 're', 1995: 'cy', 1996: 'or', 1997: 'mi', 1998: 'cy', 1999: 'pi', 2000: 'or', 2001: 'cy', 2002: 'mi', 2003: 'cy', 2004: 're', 2005: 'vi', 2006: 'pi', 2007: 'vi', 2008: 'ye', 2009: 're', 2010: 'vi', 2011: 'or', 2012: 'cy', 2013: 'mi', 2014: 're', 2015: 'vi', 2016: 'pi', 2017: 'or', 2018: 'mi', 2019: 'cy', 2020: 'vi', 2021: 'ye', 2022: 're', 2023: 'cy', 2024: 'vi', 2025: 'or', 2026: 'pi', 2027: 'or' },
  INKS: { or: 'var(--drums)', ye: 'var(--perc)', mi: 'var(--synth)', pi: 'var(--samp)', re: 'var(--kick)', cy: '#4fdcff', vi: 'var(--rumble)' },
  stamp(k) {
    let S = this.STAMP[k], ink;
    if (S) ink = `var(${S[2]})`;
    else if (/^y\d{4}$/.test(k)) { S = [k.slice(1), '']; ink = this.INKS[this.YEAR_INK[k.slice(1)]] || 'var(--mix)'; }
    if (!S) return '';
    return `<span class="art-stamp${S[1] ? '' : ' solo'}" style="--ink:${ink}" aria-hidden="true"><b>${S[0]}</b>${S[1] ? `<i>${S[1]}</i>` : ''}</span>`;
  },
  alt(k) { return this.ALT[k] || this.YEAR_ALT[k] || ''; },
  html(k, cls) {
    return `<figure class="art-hero${cls ? ' ' + cls : ''}"><div class="art-frame"><img src="img/art/${k}-1376.webp" srcset="img/art/${k}-720.webp 720w, img/art/${k}-1376.webp 1376w" sizes="(max-width: 700px) 100vw, 1100px" width="1376" height="768" alt="${this.alt(k)}" loading="lazy" decoding="async">${this.stamp(k)}</div></figure>`;
  },
  mount(el, id) {
    let k = this.MAP[id]; if (!k && /^y\d{4}$/.test(id) && window.ART_YEARS.includes(+id.slice(1))) k = id;
    if (!k || !el || el.querySelector('.art-hero')) return;
    const at = el.querySelector(':scope > .kicker') || el.querySelector(':scope > h2');
    const tmp = document.createElement('div'); tmp.innerHTML = this.html(k, el.querySelector(':scope > .hero-img') ? 'banner' : '');
    if (at) el.insertBefore(tmp.firstChild, at); else el.prepend(tmp.firstChild);
  }
};

/* the stamp's rough rubber edge and ink speckle: one SVG filter for the whole book */
(() => {
  if (document.getElementById('artRoughDefs')) return;
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.id = 'artRoughDefs'; s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = '<filter id="artRough" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="rough"/><feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="1" seed="11" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.2 0 0 0 -1.15" result="speckle"/><feComposite in="rough" in2="speckle" operator="in"/></filter>';
  document.body.appendChild(s);
})();

/* the credits page lists the plates too */
(() => { const prev = (window.PageHooks || {}).credits; window.PageHooks = window.PageHooks || {};
  window.PageHooks.credits = () => { if (prev) prev(); const box = document.getElementById('creditList'); if (!box || box.querySelector('.art-credits')) return;
    const thumb = (href, k, title) => `<a href="#${href}" title="${title}"><img src="img/art/${k}-720.webp" alt="${Art.alt(k)}" loading="lazy" decoding="async" width="720" height="402"></a>`;
    const strands = [['home', 'cover', 'Cover']].concat(Object.entries(Art.MAP).map(([id, k]) => [id, k, (Art.STAMP[k] || [k])[0]]));
    const d = document.createElement('div'); d.className = 'art-credits'; d.style.gridColumn = '1 / -1';
    d.innerHTML = `<h3>Illustrations</h3><p class="cap">The collage plates on the cover, at the start of each strand, on every year page and on the Explore pages were made for this book with Krea, an AI image generator, in the manner of photocopied club flyers: a night photograph shot with flash, halftone scraps and torn fluorescent paper. They are invented scenes, with no real people, logos or record sleeves, and each is labelled where it appears. The names and dates stamped on them are set in type, not generated.</p><div class="art-thumbs">${strands.map(([id, k, t]) => thumb(id, k, t)).join('')}</div><div class="art-thumbs years">${window.ART_YEARS.map(y => thumb('y' + y, 'y' + y, String(y))).join('')}</div>`;
    box.prepend(d); };
})();
