/* ===================================================================
   GRAPH — the whole book as nodes, relations and strands
   Node: { id, type, title, years, city, strands, blurb, rel:[[relation, targetId]...], aliases, q (search query) }
   Relations are declared one way; backlinks are computed.
   =================================================================== */
/* the span the book celebrates: the breakout year to forty years on; earlier years are the prologue */
const BOOK = { from: 1987, to: 2027, span: '1987–2027' };
const STRANDS = {
  years:  { title: 'Forty years', color: '--mix', spine: ['timeline', ...Object.keys(window.YEARS || {}).map(y => 'y' + y), 'forty'] },
  techno: { title: 'Techno', color: '--rumble', spine: ['h0', 'pre', 'h1', 'h2', 'h3', 'ldn', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14'] },
  house:  { title: 'House', color: '--drums', spine: ['house0', 'hh1', 'chicagohouse', 'hh2', 'hh3', 'balearic', 'hh4', 'acid', 'hh5', 'hh6', 'techhouse'] },
  rave:   { title: 'Rave', color: '--perc', spine: ['r0', 'r1', 'r2', 'r3', 'split1992', 'r4', 'castlemorton', 'r5', 'r6', 'r7', 'r8'] },
  jungle: { title: 'Jungle & D&B', color: '--samp', spine: ['j0', 'j1', 'j2', 'j3', 'j4', 'j5'] },
  trance: { title: 'Trance', color: '--synth', spine: ['t0', 't1', 't2', 't3', 't4', 't5'] },
  tech: { title: 'Technology', color: '--synth', spine: ['k0','k1','k2','k3','k4','k5'] },
  law: { title: 'The law', color: '--kick', spine: ['l0','l1','l2','l3','l4','l5','l6'] },
  ibiza: { title: 'Ibiza', color: '--perc', spine: ['i0','i1','i2','i3','i4','i5','i6'] },
  goa: { title: 'Goa', color: '--rumble', spine: ['go0','go1','go2','go3','go4','go5'] },
  m25: { title: 'The M25 raves', color: '--perc', spine: ['orb0','orb1','orb2','orb3','orb4','orb5'] },
  lovepar: { title: 'The Love Parade', color: '--samp', spine: ['lp0','lp1','lp2','lp3','lp4','lp5'] },
  detroit: { title: 'Detroit', color: '--rumble', spine: ['det0','det1','det2','det3','det4','det5'] },
  chicago: { title: 'Chicago', color: '--drums', spine: ['chi0','chi1','chi2','chi3','chi4','chi5'] },
  newyork: { title: 'New York', color: '--bass', spine: ['ny0','ny1','ny2','ny3','ny4','ny5'] },
  roots: { title: 'Roots', color: '--bass', spine: ['rt0','rt1','rt2','rt3','rt4','rt5','rt6','rt7','rt8'] },
  clubs: { title: 'The clubs', color: '--kick', spine: ['cb0','cb1','cb2','cb3','cb4','cb5','cb6','cb7','cb8','cb9','cb10','cb11','cb12','cb13','cb14','cb15'] },
  towns: { title: 'Small towns', color: '--drums', spine: ['tw0','tw1','tw2','tw3','tw4','tw5','tw6','tw7','tw8','tw9','tw10'] },
  edm: { title: 'EDM in America', color: '--samp', spine: ['ed0','ed1','ed2','ed3','ed4','ed5'] },
  anatomy:{ title: 'Anatomy', color: '--kick', spine: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'] },
  mixer:  { title: 'Mixer', color: '--seq', spine: ['mixer'] }
};
const CHAPTER_TITLES = {
  rt0: 'Roots', rt1: 'West and Central Africa, and the Atlantic crossing', rt2: 'Blues, ragtime and jazz', rt3: 'Gospel, R&B, soul and funk', rt4: 'Disco and the backlash', rt5: 'The machines: electro, house and techno', rt6: 'Jamaica and Britain', rt7: 'Everywhere: the music multiplies', rt8: 'Back home: the return and the reckoning',
  cb0: 'The clubs', cb1: 'Amnesia, Ibiza', cb2: 'The Warehouse, Chicago', cb3: 'Paradise Garage, New York', cb4: 'The Fridge, Brixton', cb5: 'The Haçienda, Manchester', cb6: 'Rex Club, Paris', cb7: 'The Music Institute, Detroit', cb8: 'Space, Ibiza', cb9: 'Tresor, Berlin', cb10: 'Ministry of Sound, London', cb11: 'Yellow, Tokyo', cb12: 'Godskitchen', cb13: 'fabric, London', cb14: 'Berghain, Berlin', cb15: 'Bassiani, Tbilisi',
  tw0: 'Small towns', tw1: 'Hastings', tw2: 'Belleville, Michigan', tw3: 'Wigan, Blackburn and Morley', tw4: 'Riccione and the Riviera', tw5: 'Kastellaun and Boom', tw6: 'Tisno', tw7: 'Ko Pha Ngan', tw8: 'Tulum', tw9: 'Itajaí and Warung', tw10: 'Ozora and Idanha-a-Nova',
  ed0: 'EDM in America', ed1: 'The American underground, 1985–2002', ed2: 'Raves become festivals, 1997–2010', ed3: 'The boom, 2009–16', ed4: 'Harm, law and the reckoning', ed5: 'After EDM, 2017–26',
  orb0: 'The orbital', orb1: 'Out of the clubs, 1987–88', orb2: 'The summer of 1989', orb3: 'Phone lines, pirates and convoys', orb4: 'The Bright Bill and the end, 1990', orb5: 'Remembering the orbital, 1990–2026',
  lp0: 'The Love Parade', lp1: 'Friede, Freude, Eierkuchen, 1989–91', lp2: 'The techno city, 1992–96', lp3: 'A million in the Tiergarten, 1997–2003', lp4: 'Cancelled, revived, Duisburg, 2004–10', lp5: 'After the parade, 2011–26',
  det0: 'Detroit', det1: 'Before techno, 1977–85', det2: 'The Belleville Three, 1985–89', det3: 'Underground Resistance and the second wave, 1989–95', det4: 'Movement and the house heads, 1996–2010', det5: 'Detroit now, 2011–26',
  chi0: 'Chicago', chi1: 'The Warehouse, the Music Box and the radio, 1977–85', chi2: 'Trax, DJ International and acid, 1984–89', chi3: 'After the first wave, 1989–99', chi4: 'Ghetto house, juke and footwork, 1992–2015', chi5: 'Chicago now, 2010–26',
  ny0: 'New York', ny1: 'The Loft, the Gallery and disco, 1970–79', ny2: 'Paradise Garage and the Saint, 1977–87', ny3: 'House and the club kids, 1987–95', ny4: 'Giuliani and the superclubs, 1994–2010', ny5: 'Brooklyn and after, 2010–26',
  floor: 'From the floor',
  go0: 'Goa: the beach and the night', go1: 'Freaks, 1960s–1987', go2: 'The Goa sound, 1987–94', go3: 'Goa trance goes global, 1994–98', go4: 'The ban and the diaspora, 1998–2010', go5: 'Goa now, 2007–26',
  i0: 'The island', i1: 'Bohemians and the first clubs, 1950s–1983', i2: 'Alfredo and the Balearic beat, 1983–89', i3: 'The Ibiza Four and the summer of 1987', i4: 'Superclubs and the British season, 1989–99', i5: 'Techno\'s island, 1999–2015', i6: 'Space closes, the island changes, 2016–26',
  l0: 'Drugs, the law and the dance floor', l1: 'Ecstasy arrives, 1985–89', l2: 'The Bright Bill and the Pay Party Unit, 1989–90', l3: 'From Castlemorton to the Criminal Justice Act, 1992–94', l4: 'Leah Betts and safer dancing, 1995–2000', l5: 'Licensing, Form 696 and the superclub years, 2003–17', l6: 'Fabric, the Night Czar, Covid and after, 2016–26',
  k0: 'The machines: a route through forty years', k1: 'The analogue bargain bin, 1980–88', k2: 'The sampler, 1986–96', k3: 'Virtual analogue and the system, 1995–2001', k4: 'The laptop, 2001–12', k5: 'Hardware comes back, 2012–26',
  home: 'Cover', h0: 'Forty years in one picture', pre: 'Prehistory, 1920–80', h1: 'Roots, 1974–85', h2: 'Detroit, 1985–92', h3: 'Britain, 1988–99', ldn: 'London, 1986–2026', h4: 'Berlin, 1988–99', h5: 'Europe and the world', h6: 'The 2000s: minimal', h7: 'Ibiza, 2000–', h8: 'The 2010s: Berghain', h9: 'The 2020s: harder, faster', h10: 'Key DJs and producers', h11: 'Clubs', h12: 'Festivals and events', h13: 'Landmark sets', h14: 'Branches: the genres that emerged',
  r0: 'What a rave is', r1: 'Acid house parties and the orbital raves, 1988–90', r2: 'Pirate radio', r3: 'Hardcore, 1990–92', r4: 'The free party and the protest', r5: 'The Criminal Justice Act, 1994', r6: 'Licensed raves and the superclubs', r7: 'Jungle, happy hardcore and after', r8: 'Rave people, crews and stations',
  house0: 'The house strand', hh1: 'Chicago, 1977–88', hh2: 'New York and the garage', hh3: 'Ibiza: the island\'s own story', hh4: 'The Ibiza Four and London', hh5: 'Madchester and the North', hh6: 'House after 1990',
  j0: 'What jungle is', j1: 'Rage and the breakbeat, 1988–92', j2: 'Jungle, 1993–95', j3: 'Drum & bass, 1995–2000', j4: 'The 2000s and the revival', j5: 'Jungle people, labels and rooms',
  t0: 'What trance is', t1: 'Frankfurt and Berlin, 1990–95', t2: 'Goa and psytrance', t3: 'The boom, 1995–2001', t4: 'After the peak', t5: 'Trance people, labels and rooms', credits: 'Image credits', forty: 'Forty of everything', timeline: 'Forty years in one line', listings: 'What was on: listings', nights: 'Club nights', flyers: 'Real flyers', djs: 'DJs and producers', cities: 'Cities and the spread', streets: 'Street view', tours: 'Guided tours', path: 'Six degrees', quiz: 'Blind test', crate: 'Your crate', notes: 'Marginalia',
  a0: 'The map', a1: 'Kick', a2: 'Drums', a3: 'Percussion', a4: 'Rumble', a5: 'Bass', a6: 'Synth', a7: 'Sampling', a8: 'Mix', a9: 'Studio sequencer', mixer: 'The set builder', make: 'Learn to make each genre', disputes: 'Corrections and open questions', charts: 'What charted', shops: 'Record shops', press: 'The press', sound: 'Sound systems', year: 'Everywhere in one year', explore: 'Explore the graph', genres: 'The genre family tree'
};
Object.keys(window.YEARS || {}).forEach(y => { CHAPTER_TITLES['y' + y] = y + (+y < BOOK.from ? ' · the year before' : +y === BOOK.from ? ' · the breakout year' : +y === BOOK.to ? ' · forty years on' : ''); });
/* forks: where a chapter's history divides. [label, target, strand] */
const FORKS = {
  orb3: [['The law strand: the Bright Bill and the Pay Party Unit', 'l2', 'law']],
  orb4: [['The law that followed', 'l2', 'law'], ['Into the free parties', 'r4', 'rave']],
  orb1: [['The house strand: the Ibiza Four and London', 'hh4', 'house']],
  h4: [['The Love Parade in six chapters', 'lp0', 'lovepar']],
  lp1: [['Berlin\'s clubs, 1988–99', 'h4', 'techno']],
  lp4: [['The law strand: crowds, licences and the authorities', 'l0', 'law']],
  det2: [['The techno strand: Detroit, 1985–92', 'h2', 'techno']],
  chi2: [['The house strand: Chicago, 1977–88', 'hh1', 'house'], ['Detroit, four hours up the road', 'det2', 'detroit']],
  hh2: [['New York, the whole city', 'ny0', 'newyork']],
  ny2: [['The house strand: New York and the garage', 'hh2', 'house']],
  go2: [['The trance strand\'s Goa chapter', 't2', 'trance'], ['Frankfurt and Berlin, the other source', 't1', 'trance']],
  go3: [['The trance boom', 't3', 'trance'], ['Ibiza, the other island', 'i4', 'ibiza']],
  go4: [['The law strand: music, noise and the authorities', 'l0', 'law'], ['After the peak', 't4', 'trance']],
  t2: [['The Goa strand: the beach in six chapters', 'go0', 'goa']],
  i2: [['Alfredo\'s records in the house strand → Balearic beat', 'hh3', 'house'], ['Where the Balearic records went next → London', 'hh4', 'house']],
  i3: [['The same summer from London → the Ibiza Four and Shoom', 'hh4', 'house'], ['Out of the clubs and into the fields → the orbital raves', 'r1', 'rave']],
  i4: [['The superclubs at home → licensed raves', 'r6', 'rave'], ['The trance boom the island sold back', 't3', 'trance']],
  i5: [['The techno strand\'s island chapter', 'h7', 'techno'], ['Minimal, the sound of DC10\'s first decade', 'h6', 'techno']],
  i6: [['The 2020s on the floor', 'h9', 'techno'], ['Licensing, closures and the night-time economy → the law strand', 'l6', 'law']],
  hh3: [['The island strand: Ibiza in seven chapters', 'i0', 'ibiza']],
  h7: [['The island strand: techno\'s Ibiza', 'i5', 'ibiza']],
  l1: [['The parties the drug arrived at → Shoom and the orbital raves', 'r1', 'rave'], ['Ibiza, where the Four found it', 'hh3', 'house']],
  l2: [['Sunrise, Energy and the M25 → the rave strand', 'r1', 'rave'], ['Where the parties went next → licensed clubs', 'r6', 'rave']],
  l3: [['Castlemorton told in full', 'r4', 'rave'], ['The Act and the protests', 'r5', 'rave']],
  l4: [['The superclubs the guidelines were written for', 'r6', 'rave'], ['Manchester, where Lifeline started', 'hh5', 'house']],
  l5: [['The rooms the Licensing Act changed → Clubs', 'h11', 'techno'], ['UK garage, the nights Form 696 closed', 'g-ukgarage', 'house']],
  l6: [['fabric and The End → London', 'ldn', 'techno'], ['The 2020s on the floor', 'h9', 'techno']],
  r5: [['The law strand: the Act in context', 'l3', 'law']],
  k1: [['Hear the same boxes taken apart → Anatomy: Kick', 'a1', 'anatomy'], ['The records the 808 made → Chicago', 'hh1', 'house'], ['The 909 in Detroit', 'h2', 'techno']],
  k2: [['Chop a break yourself → Anatomy: Sampling', 'a7', 'anatomy'], ['The records the S1000 made → jungle', 'j2', 'jungle'], ['The same years in the fields → rave', 'r3', 'rave']],
  k3: [['The supersaw at work → trance', 't3', 'trance'], ['What the synth section does → Anatomy: Synth', 'a6', 'anatomy']],
  k4: [['Ableton\'s decade → minimal', 'h6', 'techno'], ['The set in software → the Mixer', 'mixer', 'mixer']],
  k5: [['The clones\' sound → the 2020s', 'h9', 'techno'], ['The engine this book runs on → Anatomy: The map', 'a0', 'anatomy']],
  a1: [['The box that makes it → the TR-909', 'tr909', 'tech'], ['The strand of machines', 'k1', 'tech']],
  a7: [['The Akai S1000 and the Atari', 'k2', 'tech']],
  a6: [['The hoover, the supersaw, the Juno → Technology', 'k3', 'tech']],
  r7: [['The breaks go to 170 → jungle strand', 'j2', 'jungle'], ['The pianos go to 165 → happy hardcore (rave)', 'r7', 'rave'], ['The straight beats → UK techno', 'h3', 'techno']],
  j1: [['Faster and darker → jungle', 'j2', 'jungle'], ['The rave side of the same years', 'r3', 'rave']],
  j3: [['The MCs and bass at 130 → UK garage (house)', 'hh6', 'house'], ['Techstep\'s techno roots', 'h3', 'techno']],
  h5: [['Frankfurt\'s melodic exit → trance strand', 't1', 'trance'], ['Rotterdam\'s hard exit → gabber (rave)', 'r7', 'rave']],
  t1: [['The psychedelic branch → Goa', 't2', 'trance'], ['Väth stays with techno → Cocoon', 'h7', 'techno']],
  t3: [['Progressive\'s house side → house strand', 'hh6', 'house'], ['Ibiza\'s trance summers', 'balearic', 'house']],
  hh1: [['The 303 record → acid (crossing)', 'acid', 'house'], ['The neighbour 280 miles east → Detroit', 'h2', 'techno']],
  hh4: [['Out of the clubs and into the fields → rave strand', 'r1', 'rave'], ['Up north → Madchester', 'hh5', 'house']],
  hh6: [['The jungle MCs at +8 → UK garage, then grime', 'g-ukgarage', 'house'], ['Progressive → trance strand', 't3', 'trance']],
  h1: [['The records reach Detroit → techno', 'h2', 'techno'], ['The same machines in Chicago → house', 'chicagohouse', 'house']],
  h2: [['Detroit sells to Britain → UK techno', 'h3', 'techno'], ['Detroit meets East Berlin → Tresor', 'h4', 'techno'], ['Hawtin takes acid to the Packard Plant → the 303', 'acid', 'techno']],
  ldn: [['The tech-house border → house strand', 'techhouse', 'house'], ['Clink Street\'s sibling → Shoom and the orbital raves', 'r1', 'rave'], ['Detroit, the other end of the exchange', 'h2', 'techno']],
  h3: [['London\'s own rooms → Clink Street to The End', 'ldn', 'techno'], ['The straight 4/4 stays techno → Berlin', 'h4', 'techno'], ['The breakbeats become hardcore → rave strand', 'split1992', 'rave'], ['The field becomes a movement → Castlemorton', 'castlemorton', 'rave']],
  r1: [['The parties go licensed → Raindance and the superclubs', 'r6', 'rave'], ['The parties go to the fields → free party', 'r4', 'rave'], ['The records underneath it all → acid', 'acid', 'house']],
  r3: [['Breakbeats accelerate → jungle', 'r7', 'rave'], ['Straight beats leave → UK techno', 'h3', 'techno'], ['Belgium\'s hoover → Europe', 'h5', 'techno']],
  h6: [['Minimal\'s summer home → Ibiza', 'h7', 'techno'], ['The tech-house border → house strand', 'techhouse', 'house']],
  chicagohouse: [['Chicago to London → acid house parties', 'r1', 'rave'], ['Chicago to Detroit → techno', 'h2', 'techno'], ['Stay in Chicago → the house strand', 'house0', 'house']],
  balearic: [['Four DJs fly home → Shoom and the orbital raves', 'r1', 'rave'], ['Techno arrives on a Monday in 2000', 'h7', 'techno'], ['The island\'s own story → house strand', 'house0', 'house']]
};
/* crossings into the place strands, added to existing chapters */
(FORKS['r1'] = FORKS['r1'] || []).push(...[['The M25 raves in full: six chapters', 'orb0', 'm25']]);
(FORKS['l2'] = FORKS['l2'] || []).push(...[['The parties the law was aimed at → the M25 raves', 'orb3', 'm25']]);
(FORKS['h2'] = FORKS['h2'] || []).push(...[['Detroit, the whole city', 'det0', 'detroit']]);
/* the movement: chapters that open onto a club, a town or the roots */
[['ldn', 'Hastings, the whole town', 'tw1', 'towns'], ['h2', 'Belleville, the small town where it began', 'tw2', 'towns'], ['det2', 'Belleville, the small town', 'tw2', 'towns'],
 ['hh1', 'The Warehouse, in depth', 'cb2', 'clubs'], ['hh2', 'Paradise Garage, in depth', 'cb3', 'clubs'], ['hh3', 'Amnesia, in depth', 'cb1', 'clubs'], ['hh5', 'The Haçienda, in depth', 'cb5', 'clubs'],
 ['h4', 'Tresor, in depth', 'cb9', 'clubs'], ['h6', 'Berghain, in depth', 'cb14', 'clubs'], ['h7', 'Space, in depth', 'cb8', 'clubs'], ['h8', 'Bassiani, in depth', 'cb15', 'clubs'],
 ['r6', 'Ministry of Sound, in depth', 'cb10', 'clubs'], ['t3', 'Godskitchen, in depth', 'cb12', 'clubs'], ['ny1', 'Disco and the backlash', 'rt4', 'roots'], ['chi1', 'The Warehouse, in depth', 'cb2', 'clubs'], ['det2', 'The Music Institute, in depth', 'cb7', 'clubs'],
 ['h0', 'Roots: where the music came from', 'rt0', 'roots'], ['house0', 'Roots: where the music came from', 'rt0', 'roots']
].forEach(([from, label, to, strand]) => (FORKS[from] = FORKS[from] || []).push([label, to, strand]));
(FORKS['hh1'] = FORKS['hh1'] || []).push(...[['Chicago, the whole city', 'chi0', 'chicago']]);

const NODES = [];
const N = (id, type, title, o = {}) => { const n = { id, type, title, years: o.years || '', city: o.city || '', strands: o.strands || ['techno'], blurb: o.blurb || '', rel: o.rel || [], aliases: o.aliases || [], q: o.q || title, color: o.color }; NODES.push(n); return n; };

/* ---------- cities ---------- */
[['detroit', 'Detroit', 'Motor City. Techno\'s birthplace: Belleville, the Music Institute, UR, Submerge, Movement.', ['techno']],
 ['chicago', 'Chicago', 'House\'s birthplace: the Warehouse, the Music Box, Trax, the 303.', ['house', 'techno']],
 ['berlin', 'Berlin', 'Techno\'s capital since 1991: UFO, Tresor, E-Werk, Hard Wax, Berghain.', ['techno']],
 ['london', 'London', 'Camden Palace and Clink Street, Shoom and Spectrum, the M25 raves, pirate radio, Lost, The End, Stay Up Forever, fabric, Fold.', ['rave', 'techno', 'house']],
 ['hastings', 'Hastings', 'The Sussex fishing town fifty miles from London where John Digweed was born; since 2023, the Hastings Techno Militia and the Detroit exchange.', ['techno', 'trance']],
 ['birmingham', 'Birmingham', 'Network Records named the genre; Downwards and House of God hardened it; the Que Club housed it.', ['techno']],
 ['sheffield', 'Sheffield', 'Warp Records and bleep, 1989–91.', ['techno']],
 ['manchester', 'Manchester', 'The Haçienda, Madchester, Bugged Out, 808 State and A Guy Called Gerald.', ['house', 'rave', 'techno']],
 ['glasgow', 'Glasgow', 'Sub Club, Slam, Soma, Rubadub.', ['techno']],
 ['frankfurt', 'Frankfurt', 'Trance\'s birthplace, and schranz\'s: Dorian Gray, Omen, Sven Väth, Harthouse.', ['techno']],
 ['ghent', 'Ghent', 'R&S Records and the hoover; Belgium\'s new beat around it.', ['techno', 'rave']],
 ['rotterdam', 'Rotterdam', 'Gabber: Parkzicht and Rotterdam Records; the Thunderdome raves, first held in Friesland in 1992, carried its sound across the country.', ['techno', 'rave']],
 ['amsterdam', 'Amsterdam', 'Awakenings, ADE, Dekmantel, the RoXY and Paradiso.', ['techno', 'house']],
 ['ibiza', 'Ibiza', 'Pacha, Amnesia, Ku, Space, DC10: open-air terraces roofed over by noise rules in the early 1990s (Space\'s excepted), and techno\'s summer residency since 2000.', ['house', 'techno', 'rave']],
 ['tokyo', 'Tokyo', 'Liquid Room, Womb, Ken Ishii.', ['techno']],
 ['tbilisi', 'Tbilisi', 'Bassiani and Khidi; the 2018 raid and the dancing protest.', ['techno']],
 ['paris', 'Paris', 'Rex Club, Laurent Garnier, F Communications, the teknivals.', ['techno', 'rave']],
 ['cologne', 'Cologne', 'Kompakt, and WDR\'s electronic studio before it.', ['techno']],
 ['dusseldorf', 'Düsseldorf', 'Kraftwerk\'s Kling Klang studio.', ['techno']],
 ['newyork', 'New York', 'The Paradise Garage, Planet Rock, Joey Beltram.', ['house', 'techno']],
 ['blackburn', 'Blackburn', 'The Lancashire warehouse raves of 1989–90, thousands every weekend.', ['rave']],
 ['milton-keynes', 'Milton Keynes', 'The Sanctuary, hardcore\'s home, with Helter Skelter and Dreamscape.', ['rave']]
].forEach(([id, t, b, s]) => N(id, 'city', t, { blurb: b, strands: s }));

/* ---------- machines ---------- */
[['tr808', 'Roland TR-808', '1980', 'Drum machine — Built by Roland for lounge bands; the boom of electro, hip-hop and acid house. Discontinued 1983, cheap by 1985.', ['techno', 'house', 'rave']],
 ['tb303', 'Roland TB-303', '1981–84', 'Bass synth — An accompaniment box that failed, then squealed: acid in Chicago (1987), London (1988) and the free parties (1993–).', ['house', 'techno', 'rave']],
 ['tr909', 'Roland TR-909', '1983', 'Drum machine — Roland\'s first with MIDI; the kick, hats and clap of house and techno for forty years.', ['techno', 'house', 'rave']],
 ['moog', 'Moog modular', '1964', 'Modular synth — Robert Moog\'s, heard on Switched-On Bach (1968) and I Feel Love (1977).', ['techno']],
 ['sampler', 'The sampler (Akai S900/S950, 1986–)', '1986', 'Sampler — Cheap sampling: the breakbeat, the vocal stab and the piano loop of hardcore all come from it.', ['rave', 'techno']],
 ['technics', 'Technics SL-1200 / pitch control', '1972–79', 'Record deck — The turntable with a pitch slider: beat-matching, the long mix, the DJ as instrumentalist.', ['house', 'techno', 'rave']],
 ['ableton', 'Ableton Live', '2001', 'Software — Made in Berlin by Henke and Behles; loops, edits and resampling move from the studio into the set.', ['techno']],
 ['finalscratch', 'Final Scratch', '2001', 'Timecode vinyl — Hawtin\'s DE9 and the laptop DJ.', ['techno']]
].forEach(([id, t, y, b, s]) => N(id, 'machine', t, { years: y, blurb: b, strands: s, aliases: { tr808: ['TR-808', '808'], tb303: ['TB-303', '303'], tr909: ['TR-909', '909'], moog: ['Moog'], sampler: ['sampler', 'Akai'], technics: ['Technics', 'turntable'], ableton: ['Ableton'], finalscratch: ['Final Scratch'] }[id] || [] }));

/* ---------- labels ---------- */
[['metroplex', 'Metroplex', '1985', 'detroit', 'Juan Atkins\'s label: Model 500, the first techno records.', ['techno']],
 ['transmat', 'Transmat', '1986', 'detroit', 'Derrick May\'s label: Rhythim Is Rhythim, Strings of Life.', ['techno']],
 ['kms', 'KMS', '1987', 'detroit', 'Kevin Saunderson\'s label: Inner City, Reese.', ['techno']],
 ['tresor-records', 'Tresor Records', '1991', 'berlin', 'Founded under the club in October 1991; X-101, Jeff Mills, Blake Baxter and Drexciya, the Detroit–Berlin axis on vinyl.', ['techno']],
 ['warp', 'Warp Records', '1989', 'sheffield', 'Bleep, then Artificial Intelligence, Aphex and Autechre.', ['techno']],
 ['rs', 'R&S Records', '1983', 'ghent', 'Renaat Vandepapeliere\'s label: Energy Flash, Mentasm, Aphex Twin.', ['techno', 'rave']],
 ['downwards', 'Downwards', '1993', 'birmingham', 'Karl O\'Connor\'s label: Regis, Surgeon, Female; the industrial line.', ['techno']],
 ['network', 'Network Records', '1988', 'birmingham', 'Neil Rushton\'s label: Detroit on British shelves, the Bio Rhythm compilations.', ['techno']],
 ['ostgut-ton', 'Ostgut Ton', '2005', 'berlin', 'Berghain\'s label: Klock, Dettmann, Function, the 2010s sound.', ['techno']],
 ['drumcode', 'Drumcode', '1996', 'stockholm', 'Adam Beyer\'s label: Swedish loop techno to main-stage peak-time.', ['techno']],
 ['kompakt', 'Kompakt', '1998', 'cologne', 'Voigt, Mayer and Paape\'s label, where minimal was made melodic.', ['techno']],
 ['soma', 'Soma', '1991', 'glasgow', 'Slam\'s label; Daft Punk\'s first records.', ['techno', 'house']],
 ['mnus', 'M_nus', '1998', 'windsor', 'Richie Hawtin\'s minimal label, founded in Windsor, Ontario and run from Berlin from the mid-2000s.', ['techno']],
 ['perlon', 'Perlon', '1997', 'berlin', 'Zip and Markus Nikolai; Villalobos\'s home.', ['techno']],
 ['suf', 'Stay Up Forever', '1993', 'london', 'London acid techno from The Liberators and D.A.V.E. the Drummer.', ['techno', 'rave']],
 ['planet-e', 'Planet E', '1991', 'detroit', 'Carl Craig\'s label.', ['techno']],
 ['plus8', 'Plus 8', '1990', 'windsor', 'Hawtin and Acquaviva\'s label, from Windsor, Ontario.', ['techno']],
 ['axis', 'Axis', '1992', 'newyork', 'Jeff Mills\'s label after UR: registered in New York, run from Chicago 1994–2017, Miami since.', ['techno']],
 ['m-plant', 'M-Plant', '1994', 'detroit', 'Robert Hood\'s label: Internal Empire, Moveable Parts; the 2009 reissue of Minimal Nation (first on Axis, 1994).', ['techno']],
 ['harthouse', 'Harthouse', '1992', 'frankfurt', 'Sven Väth\'s hard-trance label.', ['techno']],
 ['trax', 'Trax Records', '1984', 'chicago', 'Larry Sherman\'s Chicago label: Acid Tracks and most of early house.', ['house']],
 ['shut-up-and-dance', 'Shut Up and Dance', '1989', 'london', 'PJ and Smiley\'s label and group: breakbeat hardcore before it had a name.', ['rave']],
 ['reinforced', 'Reinforced', '1989', 'london', '4hero\'s label; Goldie\'s Metalheads; the hardcore-to-jungle bridge.', ['rave']],
 ['moving-shadow', 'Moving Shadow', '1990', 'stevenage', 'Rob Playford\'s label: 2 Bad Mice, Omni Trio, darkcore to drum & bass.', ['rave']],
 ['suburban-base', 'Suburban Base', '1991', 'romford', 'The Boogie Times shop\'s label: Sonz of a Loop da Loop Era, the hardcore anthems.', ['rave']],
 ['production-house', 'Production House', '1987', 'london', 'Hardcore and its pop crossover, from Acen and Baby D.', ['rave']],
 ['boys-own', 'Boy\'s Own', '1986', 'london', 'Fanzine (1986–92), then parties, then label: Farley, Weatherall, Heller; Underworld.', ['house', 'rave']]
].forEach(([id, t, y, c, b, s]) => N(id, 'label', t, { years: y, city: c, blurb: b, strands: s, rel: [['in', c]] }));

/* ---------- genres (ids match the Branches chapter) ---------- */
[['g-detroit', 'Detroit techno', '1985–', 'detroit', ['techno'], 'Kraftwerk + P-Funk + electro through a 909; instrumental, futurist.', 'Detroit 1988', ['h2']],
 ['g-bleep', 'Bleep', '1989–91', 'sheffield', ['techno'], 'Detroit minimalism over sound-system sub-bass.', 'UK bleep 1990', ['h3']],
 ['g-berlin', 'Berlin / Tresor techno', '1991–', 'berlin', ['techno'], 'Detroit played harder and faster in a vault.', 'Tresor 1992', ['h4']],
 ['g-hardcore', 'Breakbeat hardcore', '1990–93', 'london', ['rave'], 'Breakbeats, hoovers, pianos and sub-bass at 140; rave\'s own music.', 'UK rave 1991', ['r3']],
 ['g-acidtek', 'Acid techno', '1993–', 'london', ['techno', 'rave'], '303s and 909s in the London squat and free parties.', 'Acid techno 1994', ['h3', 'r4']],
 ['g-gabber', 'Gabber', '1992–', 'rotterdam', ['rave', 'techno'], 'Distorted kicks, commonly 150–190 bpm, out of Rotterdam.', null, ['h5']],
 ['g-trance', 'Trance', '1991–', 'frankfurt', ['techno'], 'Techno\'s melodic exit through Harthouse and Eye Q, later its own industry.', null, ['h5']],
 ['g-bham', 'Birmingham / UK industrial', '1993–', 'birmingham', ['techno'], 'Throbbing Gristle meets Detroit.', 'Birmingham 1995', ['h3']],
 ['g-dub', 'Dub techno', '1993–', 'berlin', ['techno'], 'A chord into a tape delay into a filter.', 'Dub techno 1995', ['h4']],
 ['g-idm', 'Ambient / intelligent techno', '1992–', 'sheffield', ['techno'], 'Warp\'s Artificial Intelligence series.', null, ['h3']],
 ['g-schranz', 'Schranz / hardgroove', '1997–2005', 'frankfurt', ['techno'], 'Loop techno: hardgroove at 130–140, schranz at 150–160.', 'Schranz 2002', ['h6']],
 ['g-minimal', 'Minimal', '2001–08', 'berlin', ['techno'], 'Robert Hood\'s Minimal Nation was its ancestor; Hawtin, Villalobos and Perlon made it a decade.', 'Minimal 2004', ['h6']],
 ['g-techhouse', 'Tech-house', '1995–', 'london', ['house', 'techno'], 'House groove meets techno sound design at the crossing.', 'Tech-house 1997', ['techhouse']],
 ['g-berghain', 'Berghain / Ostgut Ton sound', '2005–', 'berlin', ['techno'], 'Long, deep, functional techno for a concrete hall: Klock, Dettmann and the Ostgut Ton catalogue.', 'Berghain 2010', ['h8']],
 ['g-hypnotic', 'Hypnotic', '2012–', 'rome', ['techno'], 'Polymeters that never resolve.', 'Hypnotic 2015', ['h8']],
 ['g-industrial', 'Industrial revival', '2013–', 'berlin', ['techno'], 'Birmingham\'s line at 140.', 'Industrial 2018', ['h8']],
 ['g-peak', 'Peak-time techno', '2010s–', 'stockholm', ['techno'], 'Drumcode and the main stage; a Beatport category since February 2020.', 'Peak-time 2017', ['h8']],
 ['g-electro', 'Electro', '1981 / 2010s', 'newyork', ['techno'], 'Born in New York in 1981–82 with "Planet Rock"; Detroit its second home, from Cybotron to Drexciya, and Helena Hauff its revival.', null, ['h1']],
 ['g-hard', 'Hard techno', '2020–', 'everywhere', ['techno', 'rave'], '150+, hoovers, snare rolls, distortion.', 'Hard techno 2023', ['h9']],
 ['g-house', 'House', '1984–', 'chicago', ['house'], 'Disco\'s continuation; a different music with a shared grid.', null, ['house0']],
 ['g-acidhouse', 'Acid house', '1987–89', 'chicago', ['house', 'rave'], 'The 303 record and then the British movement named after it.', 'Chicago acid 1987', ['acid', 'r1']],
 ['g-jungle', 'Jungle / drum & bass', '1993–', 'london', ['rave'], 'Hardcore\'s breakbeats at 160 with reggae bass; Rage, Kool FM, AWOL.', null, ['r7']],
 ['g-happy', 'Happy hardcore', '1993–', 'london', ['rave'], 'Hardcore\'s pianos and vocals sped up; Slipmatt, Helter Skelter.', null, ['r7']],
 ['g-newbeat', 'New beat', '1987–89', 'antwerp', ['techno', 'rave'], 'EBM played at 33 with the pitch up, first at Antwerp\'s Ancienne Belgique; Belgium\'s hinge between industrial and house.', null, ['h5']],
 ['g-balearic', 'Balearic beat', '1984–', 'ibiza', ['house'], 'Alfredo\'s anything-goes at Amnesia: house, Italo, rock, reggae.', null, ['balearic']]
].forEach(([id, t, y, c, s, b, g, ch]) => N(id, 'genre', t, { years: y, city: c, strands: s, blurb: b, rel: [['in', c], ...ch.map(x => ['told', x])], aliases: [], color: s[0] === 'rave' ? '--perc' : s[0] === 'house' ? '--drums' : '--rumble', q: t + ' techno' }).genre = g);
NODES.forEach(n => { if (n.type === 'genre') n.preset = { 'g-detroit': 'Detroit 1988', 'g-bleep': 'UK bleep 1990', 'g-berlin': 'Tresor 1992', 'g-hardcore': 'UK rave 1991', 'g-acidtek': 'Acid techno 1994', 'g-bham': 'Birmingham 1995', 'g-dub': 'Dub techno 1995', 'g-schranz': 'Schranz 2002', 'g-minimal': 'Minimal 2004', 'g-berghain': 'Berghain 2010', 'g-hypnotic': 'Hypnotic 2015', 'g-industrial': 'Industrial 2018', 'g-peak': 'Peak-time 2017', 'g-hard': 'Hard techno 2023', 'g-acidhouse': 'Chicago acid 1987' }[n.id] || n.genre || null; });
[['g-detroit', 'g-bleep'], ['g-detroit', 'g-berlin'], ['g-detroit', 'g-minimal'], ['g-detroit', 'g-bham'], ['g-detroit', 'g-dub'], ['g-acidhouse', 'g-hardcore'], ['g-acidhouse', 'g-acidtek'], ['g-hardcore', 'g-jungle'], ['g-hardcore', 'g-happy'], ['g-hardcore', 'g-gabber'], ['g-newbeat', 'g-trance'], ['g-berlin', 'g-schranz'], ['g-bham', 'g-industrial'], ['g-dub', 'g-hypnotic'], ['g-minimal', 'g-berghain'], ['g-dub', 'g-berghain'], ['g-schranz', 'g-hard'], ['g-trance', 'g-hard'], ['g-gabber', 'g-hard'], ['g-house', 'g-acidhouse'], ['g-house', 'g-techhouse'], ['g-balearic', 'g-acidhouse'], ['g-electro', 'g-detroit'], ['g-bleep', 'g-idm'], ['g-peak', 'g-hard']].forEach(([a, b]) => NODES.find(n => n.id === b).rel.push(['from', a]));

/* ---------- crossings (framings live in templates in the HTML) ---------- */
[['acid', 'Acid', '1987–', ['house', 'techno', 'rave'], 'One Chicago record, three different stories. Phuture\'s 303 is a house record; Britain made it a movement; techno took the machine and the attitude.'],
 ['castlemorton', 'Castlemorton Common, May 1992', '1992', ['rave', 'techno'], 'A week-long free festival of 20–40,000 on a Worcestershire common; the end of the free party era and the beginning of acid techno\'s exile.'],
 ['split1992', 'The split, 1992–94', '1992–94', ['rave', 'techno'], 'The point where "rave" stopped being one music: breakbeats went one way, straight 4/4 went the other.'],
 ['balearic', 'Ibiza and the Balearic beat', '1984–', ['house', 'rave', 'techno'], 'The island as origin (house), as catalyst (rave) and as summer residency (techno).'],
 ['techhouse', 'Tech-house', '1995–', ['house', 'techno'], 'The crossing: house groove, techno sound design. Claimed by both strands.'],
 ['chicagohouse', 'Chicago house', '1977–', ['house', 'techno', 'rave'], 'The Warehouse, the Music Box, Trax: the music next door to techno and the source of acid house.']
].forEach(([id, t, y, s, b]) => N(id, 'border', t, { years: y, strands: s, blurb: b, aliases: { acid: ['Acid house', 'acid house', 'acieed'], castlemorton: ['Castlemorton', 'Castlemorton Common'], split1992: ['the split'], balearic: ['Balearic', 'Balearic beat'], techhouse: ['Tech-house', 'tech-house'], chicagohouse: ['Chicago house'] }[id] || [] }));

/* ---------- collectives / crews ---------- */
[['ur', 'Underground Resistance', '1989–', 'detroit', ['techno'], 'Mad Mike Banks and Jeff Mills, then Robert Hood: masked, militant, anti-corporate. The Final Frontier, Riot, Jupiter Jazz, Submerge.', [['in', 'detroit'], ['founded', 'tresor-records']]],
 ['spiral-tribe', 'Spiral Tribe', '1990–', 'london', ['rave', 'techno'], 'Founded 1990 by Mark Harrison, Debbie Griffith, Simone and friends; the free-party sound system, Castlemorton, exile to France and the teknival; the SP23 label.', [['in', 'london'], ['played', 'castlemorton'], ['founded', 'teknival']]],
 ['mutoid-waste', 'Mutoid Waste Company', '1984–', 'london', ['rave'], 'Post-apocalyptic sculpture from scrap, mobile sound systems and Spiral Tribe\'s collaborators; Glastonbury\'s Trash City descends from them.', [['in', 'london'], ['played', 'castlemorton']]],
 ['desert-storm', 'Desert Storm', '1992–', 'nottingham', ['rave'], 'The sound system that took the free party to Sarajevo during the siege.', [['played', 'castlemorton']]],
 ['exodus', 'Exodus Collective', '1992–2000', 'luton', ['rave'], 'Luton\'s free-party and housing collective; the political wing of the sound systems.', []]
].forEach(([id, t, y, c, s, b, r]) => N(id, 'collective', t, { years: y, city: c, strands: s, blurb: b, rel: r }));

/* ---------- people ---------- */
const P = (id, name, city, years, labels, blurb, strands, rel = [], aliases = []) => N(id, 'person', name, { city, years, blurb: labels + ' — ' + blurb, strands, rel: [['in', city], ...rel], aliases });
P('juan-atkins', 'Juan Atkins', 'detroit', '1962–2026', 'Cybotron, Model 500, Metroplex', 'The Originator: "Clear" (1983), "No UFO\'s" (1985); named the music after Toffler\'s techno-rebels, and the record "Techno Music" (1988) gave the genre its name. Born in Detroit on 12 September 1962; still touring at 64 — Movement, Dekmantel, Houghton — when he was found unresponsive in his Mexico City hotel room before a set on 31 October 2026 and died that night. Saunderson: "If it wasn\'t for Juan, there wouldn\'t be me, a Derrick, a Kevin."', ['techno'], [['founded', 'metroplex'], ['made', 'rec-clear'], ['made', 'rec-noufos'], ['played', 'music-institute']], ['Atkins', 'Model 500', 'Cybotron']);
P('derrick-may', 'Derrick May', 'detroit', '1986–', 'Rhythim Is Rhythim, Transmat', '"Strings of Life", "Nude Photo"; the Music Institute resident; closed its last night.', ['techno'], [['founded', 'transmat'], ['made', 'rec-strings'], ['made', 'rec-nudephoto'], ['played', 'music-institute'], ['played', 'set-musicinstitute']], ['May', 'Rhythim Is Rhythim', 'Mayday']);
P('kevin-saunderson', 'Kevin Saunderson', 'detroit', '1987–', 'Inner City, KMS, E-Dancer', '"Big Fun" and "Good Life" put Detroit in the UK charts.', ['techno', 'house'], [['founded', 'kms'], ['made', 'rec-bigfun']], ['Saunderson', 'Inner City']);
P('jeff-mills', 'Jeff Mills', 'detroit', '1985–', 'UR, Axis, Purpose Maker', 'The Wizard on WJLB; three decks and a 909; Liquid Room 1995; "The Bells".', ['techno'], [['member', 'ur'], ['founded', 'axis'], ['made', 'rec-thebells'], ['played', 'tresor'], ['played', 'lost'], ['played', 'liquid-room'], ['played', 'set-liquidroom'], ['played', 'set-exhibitionist'], ['played', 'the-orbit'], ['played', 'pure']], ['Mills', 'The Wizard']);
P('mike-banks', '"Mad" Mike Banks', 'detroit', '1989–', 'Underground Resistance, Submerge', 'The militant, masked, anti-corporate conscience of techno.', ['techno'], [['founded', 'ur']], ['Mad Mike', 'Banks']);
P('robert-hood', 'Robert Hood', 'detroit', '1990–', 'UR, M-Plant, Floorplan', '"Minimal Nation" (1994) invented minimal techno before it had a name.', ['techno'], [['member', 'ur'], ['founded', 'm-plant'], ['made', 'rec-minimalnation']], ['Hood']);
P('carl-craig', 'Carl Craig', 'detroit', '1989–', 'Planet E, 69, Paperclip People', 'The second wave\'s widest mind; co-created DEMF in 2000 and was its first artistic director.', ['techno'], [['founded', 'planet-e'], ['founded', 'movement'], ['made', 'rec-bugbassbin']], ['Craig']);
P('richie-hawtin', 'Richie Hawtin', 'windsor', '1990–', 'Plus 8, Plastikman, M_nus', 'Acid in the Packard Plant, then the laptop, then minimal\'s figurehead; ENTER. in Ibiza.', ['techno'], [['founded', 'plus8'], ['founded', 'mnus'], ['made', 'rec-spastik'], ['played', 'set-packard'], ['played', 'set-de9'], ['played', 'space'], ['uses', 'finalscratch']], ['Hawtin', 'Plastikman']);
P('drexciya', 'Drexciya', 'detroit', '1992–2002', 'James Stinson & Gerald Donald', 'Electro-techno with an Afrofuturist undersea mythology.', ['techno'], [['made', 'rec-bubble']], ['Stinson']);
P('eddie-fowlkes', 'Eddie Fowlkes', 'detroit', '1986–', 'Metroplex, Tresor', '"Goodbye Kiss" (1986); Berlin\'s early Detroit link.', ['techno'], [['played', 'tresor']], ['Fowlkes']);
P('blake-baxter', 'Blake Baxter', 'detroit', '1987–', 'KMS, Tresor', 'The Prince of Techno; the first Detroit artist to live in Berlin.', ['techno'], [['played', 'tresor']], ['Baxter']);
P('kenny-larkin', 'Kenny Larkin', 'detroit', '1990–', 'Warp, Art of Dance', 'Second-wave Detroit: "Azimuth" (1994).', ['techno'], [], ['Larkin']);
P('mojo', 'The Electrifying Mojo', 'detroit', '1977–', 'WGPR, WJLB', 'Charles Johnson\'s radio show: Kraftwerk, Parliament, Prince and the B-52s for the Belleville Three.', ['techno'], [['played', 'wjlb']], ['Electrifying Mojo', 'Mojo']);
P('neil-rushton', 'Neil Rushton', 'birmingham', '1988–', 'Network Records', 'Licensed the compilation that named the genre.', ['techno'], [['founded', 'network'], ['made', 'rec-technocomp']], ['Rushton']);
P('steve-bicknell', 'Steve Bicknell', 'london', '1991–', 'Lost, Cosmic Records', 'Ran the warehouse night that was Jeff Mills\'s London home.', ['techno'], [['founded', 'lost']], ['Bicknell']);
P('chris-liberator', 'Chris Liberator', 'london', '1993–', 'Stay Up Forever', 'Acid techno: a 303 and a 909 at 140, out of the Stoke Newington squat parties.', ['techno', 'rave'], [['founded', 'suf'], ['uses', 'tb303']], ['Liberator', 'The Liberators']);
P('ben-sims', 'Ben Sims', 'london', '1997–', 'Hardgroove, Theory', 'Three decks of Detroit-swung loop techno; the hardgroove revival\'s source.', ['techno'], [], ['Sims']);
P('carl-cox', 'Carl Cox', 'london', '1980s–', 'Space Ibiza, Intec', 'Three decks at the M25 raves, sixteen summers at Space, the people\'s champion of both house and techno.', ['rave', 'techno', 'house'], [['played', 'sunrise'], ['played', 'space'], ['played', 'set-coxspace'], ['played', 'the-orbit'], ['made', 'rec-ifeelit']], ['Cox', 'Coxy']);
P('dave-clarke', 'Dave Clarke', 'brighton', '1990–', '"Red" series, White Noise', 'The Baron of Techno; the hardest-cut DJ of the 90s.', ['techno'], [['made', 'rec-red2'], ['played', 'pure'], ['played', 'the-orbit']], ['Clarke']);
P('surgeon', 'Surgeon', 'birmingham', '1994–', 'Dynamic Tension, British Murder Boys', 'House of God resident; the Birmingham sound\'s technician.', ['techno'], [['played', 'house-of-god'], ['played', 'que-club'], ['made', 'rec-magneze'], ['played', 'set-surgeonbr']], ['Anthony Child']);
P('regis', 'Regis', 'birmingham', '1993–', 'Downwards, Sandwell District', 'Industrial techno\'s architect.', ['techno'], [['founded', 'downwards'], ['played', 'house-of-god'], ['made', 'rec-speaktome']], ['Karl O\'Connor']);
P('luke-slater', 'Luke Slater', 'london', '1989–', 'Planetary Assault Systems, Mote-Evolver', 'Thirty years of polymetric machine funk.', ['techno'], [['made', 'rec-freekfunk'], ['made', 'rec-tempsusp']], ['Slater', 'Planetary Assault Systems']);
P('laurent-garnier', 'Laurent Garnier', 'paris', '1987–', 'Rex Club, F Communications', 'Haçienda resident, then France\'s techno conscience; marathon sets.', ['techno', 'house'], [['played', 'rex-club'], ['played', 'hacienda'], ['played', 'set-garnierrex'], ['made', 'rec-crispybacon']], ['Garnier']);
P('sven-vath', 'Sven Väth', 'frankfurt', '1982–', 'Omen, Harthouse, Cocoon', 'Papa Sven: Omen, trance\'s birth, Cocoon Ibiza for two decades.', ['techno'], [['founded', 'omen'], ['founded', 'harthouse'], ['founded', 'cocoon'], ['played', 'amnesia'], ['played', 'set-cocoon'], ['made', 'rec-accident']], ['Vath', 'Väth', 'Sven']);
P('joey-beltram', 'Joey Beltram', 'newyork', '1989–', 'R&S', '"Energy Flash" and "Mentasm": the hoover, the rave.', ['techno', 'rave'], [['made', 'rec-energyflash'], ['made', 'rec-mentasm']], ['Beltram']);
P('dimitri-hegemann', 'Dimitri Hegemann', 'berlin', '1988–', 'UFO, Tresor', 'Found a bank vault and put Detroit in it.', ['techno'], [['founded', 'ufo'], ['founded', 'tresor'], ['founded', 'tresor-records']], ['Hegemann']);
P('tanith', 'Tanith', 'berlin', '1988–', 'UFO, Tresor, E-Werk', 'Berlin\'s first techno DJ; the hard, fast West Berlin line.', ['techno'], [['played', 'ufo'], ['played', 'tresor'], ['played', 'e-werk']], ['DJ Tanith']);
P('dr-motte', 'Dr. Motte', 'berlin', '1989–', 'Love Parade', '150 people, one truck, 1 July 1989; the 2024 heritage campaign.', ['techno'], [['founded', 'love-parade'], ['played', 'ufo']], ['Motte', 'Matthias Roeingh']);
P('basic-channel', 'Mark Ernestus & Moritz von Oswald', 'berlin', '1993–', 'Basic Channel, Hard Wax', 'Dub techno; the record shop at the centre of the city.', ['techno'], [['founded', 'hard-wax'], ['made', 'rec-phylyps'], ['made', 'rec-m4']], ['Basic Channel', 'Ernestus', 'Moritz von Oswald', 'Maurizio']);
P('ellen-allien', 'Ellen Allien', 'berlin', '1999–', 'BPitch Control', 'Berlin\'s most consistent label boss and ambassador.', ['techno'], [], ['Allien']);
P('ben-klock', 'Ben Klock', 'berlin', '2005–', 'Berghain, Klockworks', '"Subzero", "One", Berghain 04; the rumble\'s definer.', ['techno'], [['played', 'berghain'], ['made', 'rec-subzero'], ['played', 'set-klubnacht']], ['Klock']);
P('marcel-dettmann', 'Marcel Dettmann', 'berlin', '2005–', 'Berghain, MDR', 'The other Berghain resident; Hard Wax-schooled.', ['techno'], [['played', 'berghain'], ['made', 'rec-translation'], ['played', 'set-klubnacht']], ['Dettmann']);
P('chris-liebing', 'Chris Liebing', 'frankfurt', '1990s–', 'CLR', 'Schranz and the hard loop era.', ['techno'], [['made', 'rec-analogon']], ['Liebing']);
P('adam-beyer', 'Adam Beyer', 'stockholm', '1996–', 'Drumcode', 'From Swedish loop techno to the biggest brand in peak-time.', ['techno'], [['founded', 'drumcode'], ['made', 'rec-yourmind'], ['played', 'awakenings']], ['Beyer']);
P('ricardo-villalobos', 'Ricardo Villalobos', 'berlin', '1994–', 'Perlon, Playhouse', '"Alcachofa"; the longest, strangest minimal sets.', ['techno'], [['made', 'rec-dexter'], ['played', 'amnesia'], ['played', 'fabric']], ['Villalobos']);
P('nina-kraviz', 'Nina Kraviz', 'berlin', '2009–', 'трип', 'Acid, Siberia and Dekmantel.', ['techno'], [['played', 'dekmantel'], ['played', 'set-kraviz'], ['made', 'rec-ghettokraviz']], ['Kraviz']);
P('helena-hauff', 'Helena Hauff', 'hamburg', '2010–', 'Golden Pudel, Return to Disorder', 'Electro, EBM and acid on vinyl.', ['techno'], [['made', 'rec-qualm']], ['Hauff']);
P('donato-dozzy', 'Donato Dozzy', 'rome', '2000–', 'Voices From The Lake', 'Hypnotic techno\'s quiet master.', ['techno'], [['made', 'rec-twinsvirgo']], ['Dozzy', 'Voices From The Lake']);
P('blawan', 'Blawan', 'berlin', '2010–', 'Karenn, Ternesc', 'Modular, physical, resampled drum-machine techno.', ['techno'], [['made', 'rec-whytheyhide'], ['made', 'rec-sharingstuff']], ['Karenn']);
P('charlotte-de-witte', 'Charlotte de Witte', 'ghent', '2010–', 'KNTXT', 'The Belgian wave that made techno a festival headliner again.', ['techno'], [['made', 'rec-doppler']], ['de Witte']);
P('amelie-lens', 'Amelie Lens', 'antwerp', '2014–', 'Lenske, Exhale', 'Fast, acid-leaning peak-time; the 2020s\' biggest draw.', ['techno'], [['made', 'rec-hypnotized']], ['Lens']);
P('dax-j', 'Dax J', 'berlin', '2012–', 'Monnom Black', 'The 2010s\' hardest Berghain-era DJ; the bridge to hard techno.', ['techno'], [['played', 'berghain']], ['Dax']);
P('rrose', 'Rrose', 'berlin', '2011–', 'Eaux, Sandwell District', 'Hypnotic, slowly mutating techno.', ['techno'], [['made', 'rec-waterfall']]);
P('paula-temple', 'Paula Temple', 'berlin', '1998–', 'Noise Manifesto', 'Industrial techno as political noise.', ['techno'], []);
P('miss-djax', 'Miss Djax', 'eindhoven', '1989–', 'Djax-Up-Beats', 'Ran one of Europe\'s first techno labels and put Chicago acid on it.', ['techno', 'house'], []);
P('speedy-j', 'Speedy J', 'rotterdam', '1991–', 'Plus 8, Novamute', '"Pullover" (1991); the Dutch Detroit link; Time Warp\'s first edition.', ['techno'], [['made', 'rec-pullover'], ['played', 'time-warp']]);
P('ken-ishii', 'Ken Ishii', 'tokyo', '1993–', 'R&S', 'Japan\'s first techno export; "Extra" in the Liquid Room set.', ['techno'], [['made', 'rec-extra']]);
P('slam', 'Slam', 'glasgow', '1988–', 'Sub Club, Soma', 'Stuart McMillan and Orde Meikle; Joy and Return to Mono at the Sub Club, Pressure at The Arches; "Positive Education".', ['techno'], [['founded', 'soma'], ['played', 'sub-club'], ['made', 'rec-positiveeducation']], ['Stuart McMillan', 'Orde Meikle']);
P('aphex-twin', 'Aphex Twin', 'cornwall', '1991–', 'R&S, Rephlex, Warp', 'Richard D. James: Selected Ambient Works 85–92 (R&S), then Warp; the bleep-to-IDM hinge.', ['techno', 'rave'], [['made', 'rec-saw85']], ['Richard D. James']);
/* house and the Ibiza four (border people) */
P('frankie-knuckles', 'Frankie Knuckles', 'chicago', '1972–2014', 'The Warehouse, Power Plant', 'The Godfather of House; the Warehouse residency that named the music.', ['house'], [['played', 'warehouse']], ['Knuckles']);
P('ron-hardy', 'Ron Hardy', 'chicago', '1974–1992', 'The Music Box', 'Faster, rawer, reel-to-reel edits; the first floor for the 303.', ['house'], [['played', 'music-box']], ['Hardy']);
P('dj-pierre', 'DJ Pierre', 'chicago', '1987–', 'Phuture', 'Twisted the 303\'s knobs and made "Acid Tracks".', ['house', 'rave', 'techno'], [['made', 'rec-acidtracks'], ['uses', 'tb303']], ['Phuture', 'Pierre']);
P('alfredo', 'DJ Alfredo', 'ibiza', '1982–2024', 'Amnesia', 'Alfredo Fiorito, Argentine; the Amnesia terrace from midnight to dawn with no genre: the Balearic beat.', ['house', 'rave'], [['played', 'amnesia']], ['Alfredo Fiorito']);
P('jose-padilla', 'José Padilla', 'ibiza', '1991–', 'Café del Mar', 'The sunset session; the chill-out as a form.', ['house'], [['played', 'cafe-del-mar']], ['Padilla']);
P('paul-oakenfold', 'Paul Oakenfold', 'london', '1987–', 'Spectrum, Future, Perfecto', 'Took three friends to Ibiza for his birthday in late summer 1987; opened Spectrum at Heaven.', ['rave', 'house'], [['founded', 'spectrum'], ['played', 'heaven'], ['played', 'amnesia']], ['Oakenfold', 'Oakey']);
P('danny-rampling', 'Danny Rampling', 'london', '1987–', 'Shoom', 'Came back from Ibiza and opened a gym to acid house in December 1987.', ['house', 'rave'], [['founded', 'shoom'], ['played', 'amnesia']], ['Rampling']);
P('nicky-holloway', 'Nicky Holloway', 'london', '1987–', 'The Trip, Milk Bar', 'The Trip at the Astoria (June 1988): acid house on Charing Cross Road.', ['rave', 'house'], [['founded', 'the-trip']], ['Holloway']);
P('johnny-walker', 'Johnny Walker', 'london', '1987–', 'the Ibiza four', 'The fourth of the 1987 trip; later a trance DJ.', ['rave', 'house'], []);
P('mike-pickering', 'Mike Pickering', 'manchester', '1986–', 'Haçienda, Nude, M People', 'Played house to a working-class crowd before London did.', ['house', 'rave'], [['played', 'hacienda']], ['Pickering']);
P('graeme-park', 'Graeme Park', 'manchester', '1988–', 'Haçienda', 'Nude\'s other resident; Nottingham\'s Garage before that.', ['house', 'rave'], [['played', 'hacienda']]);
P('andrew-weatherall', 'Andrew Weatherall', 'london', '1988–2020', 'Boy\'s Own, Sabres of Paradise', 'The "Loaded" remix; the fanzine; the DJ everyone trusted.', ['house', 'rave'], [['member', 'boys-own'], ['made', 'rec-loaded']], ['Weatherall']);
P('terry-farley', 'Terry Farley', 'london', '1986–', 'Boy\'s Own', 'Fanzine, parties, label; Heller & Farley.', ['house', 'rave'], [['founded', 'boys-own']], ['Farley']);
/* rave */
P('tony-colston-hayter', 'Tony Colston-Hayter', 'london', '1988–', 'Sunrise', 'The "Acid House King": Sunrise at White Waltham and Santa Pod; the phone lines, the convoys, the cat and mouse.', ['rave'], [['founded', 'sunrise']], ['Colston-Hayter']);
P('paul-taylor', 'Paul Taylor', 'blackburn', '1989–', 'Angels, Retro', 'Lancashire\'s other story: Angels in Burnley and Retro, founded 1989, while the Blackburn warehouse parties ran a few miles away.', ['rave'], [['played', 'blackburn-raves']]);
P('charlie-chester', 'Charlie Chester', 'london', '1988–', 'Flying', 'Flying: Balearic into acid house in the late 80s.', ['house', 'rave'], []);
P('mr-c', 'Mr. C', 'london', '1987–', 'The Shamen, The End, Plink Plonk', 'Rapper, DJ, club owner: The End (1995–2009) with Layo.', ['rave', 'house', 'techno'], [['founded', 'the-end']], ['Richard West', 'Mr C', 'Mr.C']);
P('fabio-grooverider', 'Fabio & Grooverider', 'london', '1988–', 'Rage at Heaven', 'Sped the breaks up at Rage (1988–93) and invented jungle on the way.', ['rave'], [['played', 'heaven'], ['played', 'rage']], ['Fabio', 'Grooverider']);
P('slipmatt', 'Slipmatt', 'london', '1988–', 'SL2, Helter Skelter', '"On a Ragga Tip"; from hardcore to happy hardcore\'s king.', ['rave'], [['made', 'rec-raggatip'], ['played', 'helter-skelter']], ['SL2']);
P('ellis-dee', 'Ellis Dee', 'london', '1988–', 'Dance Paradise, Raindance', 'The hardcore era\'s workhorse: Raindance, Fantazia, every flyer.', ['rave'], [['played', 'raindance'], ['played', 'fantazia']]);
P('ratpack', 'Ratpack', 'london', '1989–', 'Evenson Allen & Lipmaster Mark', 'MC and DJ: "Searchin\' for My Rizla"; the rave duo.', ['rave'], []);
P('top-buzz', 'Top Buzz', 'london', '1988–', 'Mad P, Jason Kaye, Mikee B', 'The MC-and-DJ unit of Dreamscape and Fantazia; "Living in Darkness".', ['rave'], [['played', 'dreamscape']]);
P('dj-hype', 'DJ Hype', 'london', '1989–', 'Ganja Records, Fantasy FM, Kiss', 'From hardcore scratching on Fantasy FM to jungle\'s pioneer; "The Bee".', ['rave'], [['played', 'fantasy-fm']]);
P('ltj-bukem', 'LTJ Bukem', 'london', '1991–', 'Good Looking', '"Demon\'s Theme", "Music": the atmospheric side of jungle; Speed at the Mars Bar.', ['rave'], []);
P('doc-scott', 'Doc Scott', 'coventry', '1991–', 'Absolute 2, Reinforced', '"NHS", darkcore; from Coventry\'s Eclipse to drum & bass.', ['rave'], [['played', 'eclipse']]);
P('mickey-finn', 'Micky Finn', 'london', '1988–', 'Urban Shakedown', '"Some Justice"; the hardcore-to-jungle DJ.', ['rave'], [['made', 'rec-somejustice']], ['Mickey Finn']);
P('jumpin-jack-frost', 'Jumpin\' Jack Frost', 'london', '1988–', 'V Recordings', 'Brixton; from Passion and Lightning FM to V Recordings with Bryan Gee.', ['rave'], [['founded', 'v-recordings']]);
P('goldie', 'Goldie', 'london', '1992–', 'Metalheadz, Reinforced', '"Terminator" (1992) invented timestretch jungle; Metalheadz at the Blue Note.', ['rave'], [['made', 'rec-terminator'], ['member', 'reinforced']]);
P('sasha', 'Sasha', 'manchester', '1989–', 'Shelley\'s, Renaissance', 'The first superstar DJ: Shelley\'s Laserdome in Stoke, then progressive house with Digweed.', ['rave', 'house'], [['played', 'shelleys']]);
P('graham-gold', 'Graham Gold', 'london', '1969–', 'Kiss FM, Peach', 'Mayfair soul DJ turned Kiss 100 presenter from its legal launch in 1990; the Friday-night show from 1993 and Peach at Camden Palace, 1993–2004.', ['rave'], [['played', 'kiss-fm']]);
P('colin-dale', 'Colin Dale', 'london', '1985–', 'Kiss FM, Abstrakt Dance', 'Kiss\'s techno show; the Detroit connection on London radio.', ['techno', 'rave'], [['played', 'kiss-fm']]);
P('colin-faver', 'Colin Faver', 'london', '1982–2015', 'Kiss FM, Camden Palace', 'Techno on Kiss before anyone; the Camden Palace DJ.', ['techno', 'rave'], [['played', 'kiss-fm']]);
P('a-guy-called-gerald', 'A Guy Called Gerald', 'manchester', '1988–', '808 State, Juice Box', '"Voodoo Ray" (house), "28 Gun Bad Boy" (jungle): the one person on every strand.', ['house', 'rave', 'techno'], [['made', 'rec-voodooray'], ['made', 'rec-28gun']], ['Gerald Simpson']);
P('808-state', '808 State', 'manchester', '1988–', 'Graham Massey, Martin Price', '"Pacific State" (1989): acid house and techno from Eastern Bloc records.', ['rave', 'techno', 'house'], [['made', 'rec-pacific']]);
P('orbital', 'Orbital', 'sevenoaks', '1989–', 'Phil & Paul Hartnoll', '"Chime" (1989), named after the M25; Paul was beaten by police at a Sevenoaks rave the year before.', ['rave', 'techno'], [['made', 'rec-chime']], ['Hartnoll']);
P('the-prodigy', 'The Prodigy', 'braintree', '1990–', 'Liam Howlett, XL', '"Charly", "Out of Space", then the biggest band rave produced.', ['rave'], [['made', 'rec-charly']], ['Liam Howlett', 'Prodigy']);
P('altern-8', 'Altern 8', 'stafford', '1990–', 'Network', 'Chemical suits and "Activ 8"; hardcore\'s Midlands.', ['rave'], [['made', 'rec-activ8']]);
P('shut-up-and-dance-p', 'Shut Up and Dance', 'london', '1988–', 'PJ & Smiley', 'Hackney breakbeat hardcore; "Raving I\'m Raving"; the Ragga Twins.', ['rave'], [['founded', 'shut-up-and-dance'], ['made', 'rec-ravingimraving']]);
P('jeremy-deller', 'Jeremy Deller', 'london', '1997–', 'artist', '"Acid Brass", "The History of the World" and "Everybody in the Place" (2018): the artist who took rave seriously.', ['rave'], []);
P('dave-pratley', 'Dave Pratley', 'milton-keynes', '1989–', 'Helter Skelter', 'Founded Helter Skelter; the Sanctuary\'s hardcore nights.', ['rave'], [['founded', 'helter-skelter']]);
P('michael-teufele', 'Norbert Thormann & Michael Teufele', 'berlin', '1998–', 'Ostgut, Berghain', 'Snax, Ostgut, Berghain: the owners.', ['techno'], [['founded', 'ostgut'], ['founded', 'berghain']], ['Thormann']);
P('sven-marquardt', 'Sven Marquardt', 'berlin', '2004–', 'Berghain door', 'Photographer; the most famous doorman in the world.', ['techno'], [['played', 'berghain']]);

/* ---------- clubs ---------- */
const C = (id, name, city, years, blurb, strands, rel = [], aliases = []) => N(id, 'club', name, { city, years, blurb, strands, rel: [['in', city], ...rel], aliases });
C('music-institute', 'The Music Institute', 'detroit', '1988–89', 'Juice bar at 1315 Broadway, midnight to 9am, from May 1988 until it closed in November 1989.', ['techno']);
C('tresor', 'Tresor', 'berlin', '1991–', 'The Wertheim vault from 13 March 1991 to 2005; the Kraftwerk power station from 2007.', ['techno'], [], ['Tresor Berlin']);
C('ufo', 'UFO', 'berlin', '1988–90', 'West Berlin\'s first acid/techno basement; Interfisch, Dr. Motte, Tanith.', ['techno']);
C('e-werk', 'E-Werk', 'berlin', '1993–97', 'A substation on Wilhelmstraße, Planet\'s successor and the big room of Berlin\'s 90s.', ['techno'], [], ['Planet']);
C('bunker', 'Bunker', 'berlin', '1992–96', 'A Nazi air-raid shelter given over to hardcore and gabber, now the Boros collection.', ['techno', 'rave']);
C('ostgut', 'Ostgut', 'berlin', '1998–2003', 'Snax\'s permanent home in a railway depot; Panorama Bar upstairs from 2000; closed 6 January 2003 after 30 hours.', ['techno']);
C('berghain', 'Berghain / Panorama Bar', 'berlin', '2004–', 'A 1953 power plant, with Panorama Bar from October 2004 and the main floor from December; Funktion-One and Klubnacht.', ['techno', 'house'], [], ['Panorama Bar']);
C('hard-wax', 'Hard Wax', 'berlin', '1989–', 'Mark Ernestus\'s record shop; the city\'s centre of gravity.', ['techno']);
C('watergate', 'Watergate', 'berlin', '2002–2024', 'On the Spree; minimal\'s big room; closed 31 December 2024.', ['techno']);
C('bar25', 'Bar25', 'berlin', '2004–10', 'The riverside after-hours of the minimal years.', ['techno']);
C('omen', 'Omen', 'frankfurt', '1988–98', 'Sven Väth\'s club on Junghofstraße; trance\'s birthplace.', ['techno']);
C('dorian-gray', 'Dorian Gray', 'frankfurt', '1978–2000', 'In the airport; Väth\'s first residency; open until Monday.', ['techno', 'house']);
C('que-club', 'The Que Club', 'birmingham', '1989–2002, 2010–17', 'A Methodist hall: House of God, Atomic Jam, Surgeon and Regis most weeks.', ['techno']);
C('house-of-god', 'House of God', 'birmingham', '1993–', 'Birmingham\'s hard techno night; Surgeon\'s residency.', ['techno']);
C('sub-club', 'Sub Club', 'glasgow', '1987–', 'Jamaica Street basement; Slam\'s Subculture since 1994.', ['techno', 'house']);
C('pure', 'Pure', 'edinburgh', '1990–2001', 'Twitch and Brainstorm; Mills and Clarke as regulars.', ['techno']);
C('the-orbit', 'The Orbit', 'leeds', '1991–2003', 'After Dark in Morley, which brought every Detroit, Berlin and Birmingham name to a mill town.', ['techno'], [], ['Orbit']);
C('lost', 'Lost', 'london', '1991–', 'Steve Bicknell and Sheree Rashit\'s warehouse night; Jeff Mills\'s London home.', ['techno']);
C('fabric', 'fabric', 'london', '1999–', 'Three rooms under Smithfield; the bodysonic floor; closed September 2016, reopened January 2017.', ['techno', 'house']);
C('fold', 'Fold', 'london', '2018–', 'Canning Town, 24-hour licence, no photos.', ['techno']);
C('printworks', 'Printworks', 'london', '2017–23', 'The Press Halls in Canada Water.', ['techno']);
C('rex-club', 'Rex Club', 'paris', '1988–', 'Under the Grand Rex; Garnier\'s Wake Up.', ['techno', 'house']);
C('fuse', 'Fuse', 'brussels', '1994–', 'Belgium\'s techno institution.', ['techno']);
C('liquid-room', 'Liquid Room', 'tokyo', '1994–', 'Kabukichō then Ebisu; Mills, 28 October 1995.', ['techno']);
C('womb', 'Womb', 'tokyo', '2000–', 'Shibuya; the mirrorball the size of a car.', ['techno']);
C('bassiani', 'Bassiani', 'tbilisi', '2014–', 'Under the Dinamo stadium; raided May 2018.', ['techno']);
C('khidi', 'Khidi', 'tbilisi', '2016–', 'The harder, industrial counterpart.', ['techno']);
C('space', 'Space', 'ibiza', '1989–2016', 'Playa d\'en Bossa, the Terrace under the flight path; Carl Cox 2001–16; ENTER.; closed 2 October 2016.', ['techno', 'house'], [], ['Space Ibiza']);
C('amnesia', 'Amnesia', 'ibiza', '1976–', 'A farmhouse with no roof until 1991: Alfredo\'s Balearic terrace (house), Cocoon on Mondays from 1999 (techno).', ['house', 'techno', 'rave']);
C('pacha', 'Pacha', 'ibiza', '1973–', 'Ricardo Urgell\'s club in Ibiza Town; Music On from 2012.', ['house', 'techno']);
C('ku', 'Ku / Privilege', 'ibiza', '1978–', 'The biggest club in the world, open to the sky, a pool on the floor; Privilege from 1995.', ['house', 'rave'], [], ['Privilege']);
C('dc10', 'DC10', 'ibiza', '1999–', 'A shed by the runway; Circoloco Mondays.', ['house']);
C('cafe-del-mar', 'Café del Mar', 'ibiza', '1980–', 'San Antonio sunset; José Padilla.', ['house']);
C('warehouse', 'The Warehouse', 'chicago', '1977–82', 'Frankie Knuckles\'s club; the music was named after it.', ['house']);
C('music-box', 'The Music Box', 'chicago', '1983–87', 'Ron Hardy\'s club; the first floor for Acid Tracks.', ['house']);
C('paradise-garage', 'Paradise Garage', 'newyork', '1977–87', 'Larry Levan; the sound system and the congregation.', ['house']);
C('hacienda', 'The Haçienda', 'manchester', '1982–97', 'FAC 51; empty for years, then Nude (1986) and Hot (1988) made it Britain\'s first house club; closed by guns and debt.', ['house', 'rave'], [], ['Hacienda', 'FAC 51']);
C('shoom', 'Shoom', 'london', '1987–90', 'A Southwark fitness centre on Saturday nights; Danny and Jenni Rampling; 300 people who opened everything else.', ['house', 'rave']);
C('heaven', 'Heaven', 'london', '1979–', 'Under Charing Cross arches: Spectrum (1988) and Rage (1988–93), where jungle was invented.', ['rave', 'house'], [], ['Spectrum', 'Rage']);
C('spectrum', 'Spectrum', 'london', '1988–89', 'Paul Oakenfold\'s Monday at Heaven from April 1988, and acid house\'s first big room.', ['rave', 'house']);
C('rage', 'Rage at Heaven', 'london', '1988–93', 'Fabio and Grooverider\'s Thursday: Belgian techno, then breaks at 45 rpm, then jungle.', ['rave'], [['in', 'london']]);
C('the-trip', 'The Trip', 'london', '1988', 'Nicky Holloway at the Astoria; the crowd dancing in the Charing Cross Road fountain.', ['rave', 'house']);
C('ministry-of-sound', 'Ministry of Sound', 'london', '1991–', 'Elephant and Castle; built around the sound system, Garage-style; the superclub as brand.', ['rave', 'house']);
C('the-end', 'The End', 'london', '1995–2009', 'Mr. C and Layo Paskin\'s club in a former Post Office building at 18 West Central Street, once home to its delivery horses, designed by Layo\'s architect father Douglas: the booth on the floor, the system before the décor. Opened December 1995; Subterrain, Flavour, Superfreq, Trash; End Recordings; AKA next door from 1998. Closed with a 24-hour party on 24 January 2009.', ['techno', 'house', 'rave'], [], ['AKA', 'West Central Street']);
C('the-fridge', 'The Fridge', 'london', '1981–2010', 'Brixton: Love Muscle, Escape from Samsara (trance), the big rave nights.', ['rave']);
C('brixton-academy', 'Brixton Academy', 'london', '1983–', 'The all-nighters that put rave in a theatre.', ['rave']);
C('bagleys', 'Bagley\'s', 'london', '1991–2008', 'King\'s Cross warehouses: Slammin\' Vinyl and the licensed rave\'s London home; renamed Canvas in 2003, closed January 2008.', ['rave']);
C('paradise-club', 'The Paradise Club', 'london', '1991–', 'Islington; AWOL (A Way of Life), jungle\'s breeding ground.', ['rave']);
C('sanctuary', 'The Sanctuary', 'milton-keynes', '1990–2004', 'Helter Skelter and Dreamscape\'s arena; the home of hardcore.', ['rave']);
C('shelleys', 'Shelley\'s Laserdome', 'stoke', '1989–92', 'Sasha\'s residency; the North\'s rave club.', ['rave', 'house']);
C('quadrant-park', 'Quadrant Park', 'liverpool', '1990–91', 'Bootle; the North-West\'s first big legal all-nighter.', ['rave', 'house']);
C('eclipse', 'The Eclipse', 'coventry', '1990–92', 'Britain\'s first legal all-night rave club; Doc Scott\'s home.', ['rave']);
C('cream', 'Cream', 'liverpool', '1992–', 'Wolstenholme Square; the superclub; Creamfields from 1998.', ['house', 'rave']);
C('trade', 'Trade', 'london', '1990–2008', 'Turnmills, Sunday mornings; Tony De Vit; the gay after-hours that became hard house.', ['house', 'rave']);
C('front', 'Front', 'hamburg', '1983–97', 'Willi Prange and Phillip Clarke\'s gay club, with Klaus Stockhausen; one of the first house clubs in continental Europe.', ['house']);
C('roxy', 'RoXY', 'amsterdam', '1987–99', 'Amsterdam\'s house institution; burned down in 1999.', ['house']);
C('golden-pudel', 'Golden Pudel', 'hamburg', '1990s–', 'Helena Hauff\'s home.', ['techno']);

/* ---------- events, festivals, laws ---------- */
const E = (id, name, city, years, blurb, strands, rel = [], aliases = []) => N(id, 'event', name, { city, years, blurb, strands, rel: [['in', city], ...rel], aliases });
E('love-parade', 'Love Parade', 'berlin', '1989–2010', '150 people on the Ku\'damm on 1 July 1989; 1.5 million by 1999; Duisburg, 24 July 2010.', ['techno']);
E('mayday', 'Mayday', 'berlin', '1991–', 'First on 14 December 1991; Dortmund\'s Westfalenhallen since.', ['techno', 'rave']);
E('tribal-gathering', 'Tribal Gathering / Universe', 'wiltshire', '1993–97', 'Universe\'s licensed answer to the CJA: 25,000 at Lower Pertwood in 1993; Kraftwerk in 1997.', ['rave', 'techno'], [], ['Universe']);
E('time-warp', 'Time Warp', 'mannheim', '1994–', '26 November 1994, Ludwigshafen, 2,000 people; the Maimarkthalle since 2000.', ['techno']);
E('sonar', 'Sonar', 'barcelona', '1994–', 'Day and night; the conference that became a festival.', ['techno']);
E('nature-one', 'Nature One', 'kastellaun', '1995–', 'A rocket base in the Hunsrück.', ['techno', 'rave']);
E('awakenings', 'Awakenings', 'amsterdam', '1997–', '30 March 1997, the Gashouder; Spaarnwoude.', ['techno']);
E('movement', 'Movement / DEMF', 'detroit', '2000–', 'Hart Plaza, Memorial Day; founded free by Carl Craig.', ['techno']);
E('street-parade', 'Street Parade', 'zurich', '1992–', 'A million around the lake; Zürich techno listed as heritage in 2017.', ['techno', 'rave']);
E('boiler-room', 'Boiler Room', 'london', '2010–', 'A webcam in a Dalston warehouse; the format of the decade.', ['techno', 'house']);
E('dekmantel', 'Dekmantel', 'amsterdam', '2013–', 'The Amsterdamse Bos; the taste-maker\'s line-up.', ['techno', 'house']);
E('draaimolen', 'Draaimolen', 'tilburg', '2011–', 'A forest and the hypnotic end.', ['techno']);
E('houghton', 'Houghton', 'norfolk', '2017–', 'Craig Richards\'s 24-hour licence.', ['techno', 'house']);
E('sunrise', 'Sunrise', 'london', '1988–89', 'Tony Colston-Hayter\'s parties: White Waltham airfield, Santa Pod raceway; "Sunrise 5000"; the Sun\'s front page.', ['rave']);
E('energy', 'Energy', 'london', '1989', 'Jeremy Taylor and Karl Jewell; Membury airfield; the convoys.', ['rave']);
E('biology', 'Biology', 'london', '1989', 'Amnesia House\'s Coventry crew brought it south; one of the first "legal" raves.', ['rave']);
E('genesis', 'Genesis', 'london', '1988–89', 'Wayne Anthony\'s warehouse parties in East London; "Class of 88".', ['rave']);
E('world-dance', 'World Dance', 'kent', '1989–', 'Lydd airport; the hardcore and jungle platform.', ['rave']);
E('raindance', 'Raindance', 'london', '1989–', 'From the Jenkins Lane warehouse to licensed events, leading the way for the legal rave.', ['rave']);
E('fantazia', 'Fantazia', 'gloucestershire', '1991–', 'Promoters from Cheltenham: stately homes, Westpoint, 25,000; then videos, albums and merchandise.', ['rave']);
E('helter-skelter', 'Helter Skelter', 'milton-keynes', '1989–', 'Dave Pratley\'s Sanctuary nights: hardcore, jungle and techno on one bill.', ['rave']);
E('dreamscape', 'Dreamscape', 'milton-keynes', '1991–', 'The Sanctuary; the tape packs every teenager owned.', ['rave']);
E('blackburn-raves', 'The Blackburn raves', 'blackburn', '1989–90', 'Warehouse parties of thousands every weekend, until the police broke them in 1990.', ['rave']);
E('amnesia-house', 'Amnesia House', 'coventry', '1988–', 'Coventry\'s crew; Biology; the Eclipse.', ['rave']);
E('awol', 'AWOL', 'london', '1992–', 'A Way of Life at the Paradise Club, jungle\'s home.', ['rave']);
E('slammin-vinyl', 'Slammin\' Vinyl', 'london', '1990s', 'Event and label; the harder sounds at Bagley\'s.', ['rave']);
E('second-summer', 'The Second Summer of Love', 'london', '1988–89', 'Acid house goes national: Shoom, Spectrum, the Trip, the Haçienda\'s Hot, the smiley, the tabloids.', ['rave', 'house']);
E('beanfield', 'The Battle of the Beanfield', 'wiltshire', '1985', 'Police against the Peace Convoy on the way to Stonehenge, just over the border in Hampshire; the free festival\'s original wound.', ['rave']);
E('cja', 'The Criminal Justice and Public Order Act', 'london', '1994', 'Section 63: gatherings of 100+ playing music "wholly or predominantly characterised by the emission of a succession of repetitive beats".', ['rave', 'techno'], [], ['Criminal Justice Act', 'CJA']);
E('bright-bill', 'The Entertainments (Increased Penalties) Act', 'london', '1990', 'Graham Bright\'s bill: £20,000 fines and six months for unlicensed parties.', ['rave'], [], ['Bright Bill']);
E('teknival', 'The teknival', 'france', '1993–', 'Free festivals across France and Europe, born of Spiral Tribe\'s exile.', ['rave', 'techno']);
E('reclaim-the-streets', 'Reclaim the Streets', 'london', '1995–', 'Sound systems and road protest, with the party as occupation.', ['rave']);
E('creamfields', 'Creamfields', 'liverpool', '1998–', 'Cream\'s festival; the superclub outdoors.', ['house', 'rave']);
E('cocoon', 'Cocoon Ibiza', 'ibiza', '2000–19', 'Sven Väth\'s Monday at Amnesia, techno\'s first lasting Ibiza residency, with its closing marathons.', ['techno'], [['at', 'amnesia']]);

/* ---------- pirate stations ---------- */
[['kiss-fm', 'Kiss FM', '1985–', 'Pirate from 1985, legal from 1990: Colin Dale, Colin Faver, Norman Jay, Graham Gold.', ['rave', 'techno', 'house']],
 ['centreforce', 'Centreforce 88.3', '1989–', 'East London\'s seven-day rave station of 1989, by its own claim the first; raided and back on air through the year.', ['rave']],
 ['sunrise-fm', 'Sunrise FM', '1988–91', 'The rave station of the orbital era.', ['rave']],
 ['fantasy-fm', 'Fantasy FM', '1989–91', 'Techno, house and hardcore across the capital.', ['rave', 'techno']],
 ['kool-fm', 'Kool FM', '1991–', 'The jungle station; Hype, Brockie, Eastman.', ['rave']],
 ['rinse-fm', 'Rinse FM', '1994–', 'Garage, grime, dubstep; a licence in 2010.', ['rave']],
 ['don-fm', 'Don FM', '1992–', 'Jungle and drum & bass.', ['rave']],
 ['pulse-fm', 'Pulse FM', '1989–', 'House, techno, hardcore.', ['rave']],
 ['eruption-fm', 'Eruption FM', '1990s', 'Hardcore and jungle.', ['rave']],
 ['weekend-rush', 'Weekend Rush', '1990s', 'Hardcore and jungle.', ['rave']],
 ['dance-fm', 'Dance FM', '1990s', 'House and rave.', ['rave']],
 ['unity-fm', 'Unity FM', '1990s', 'Hardcore and jungle.', ['rave']],
 ['lazer-fm', 'Lazer FM', '1990s', 'Hardcore.', ['rave']],
 ['wjlb', 'WJLB / WGPR Detroit', '1977–', 'The Electrifying Mojo\'s and later Jeff Mills\'s radio; the ears of Belleville.', ['techno']]
].forEach(([id, t, y, b, s]) => N(id, 'station', t, { years: y, city: id === 'wjlb' ? 'detroit' : 'london', blurb: b, strands: s, rel: [['in', id === 'wjlb' ? 'detroit' : 'london']] }));

/* ---------- records ---------- */
const R = (id, artist, title, year, label, strands, blurb, by, uses = [], genre = null) => N(id, 'record', artist + ' — ' + title, { years: String(year), strands, blurb, rel: [...(label ? [['label', label]] : []), ...(by ? [['by', by]] : []), ...uses.map(u => ['uses', u]), ...(genre ? [['genre', genre]] : [])], aliases: [title], q: artist + ' ' + title });
R('rec-autobahn', 'Kraftwerk', 'Autobahn', 1974, null, ['techno'], 'The machine as the band; the record Detroit radio played.', null, [], 'g-electro');
R('rec-ifeellove', 'Donna Summer', 'I Feel Love', 1977, null, ['techno', 'house'], 'Moroder\'s Moog sequencer under a disco vocal.', null, ['moog']);
R('rec-tee', 'Kraftwerk', 'Trans-Europe Express', 1977, null, ['techno'], 'Sampled for Planet Rock; the vocoder record.', null, [], 'g-electro');
R('rec-planetrock', 'Afrika Bambaataa & Soulsonic Force', 'Planet Rock', 1982, null, ['techno'], 'Kraftwerk on an 808 in the Bronx, and the birth of electro.', null, ['tr808'], 'g-electro');
R('rec-clear', 'Cybotron', 'Clear', 1983, null, ['techno'], 'Atkins and Davis; the first Detroit record that sounds like what followed.', 'juan-atkins', [], 'g-electro');
R('rec-noufos', 'Model 500', 'No UFO\'s', 1985, 'metroplex', ['techno'], 'The first techno record.', 'juan-atkins', ['tr909'], 'g-detroit');
R('rec-nudephoto', 'Rhythim Is Rhythim', 'Nude Photo', 1987, 'transmat', ['techno'], 'The open hat on the offbeat; Detroit\'s groove.', 'derrick-may', ['tr909'], 'g-detroit');
R('rec-strings', 'Rhythim Is Rhythim', 'Strings of Life', 1987, 'transmat', ['techno', 'rave', 'house'], 'Michael James\'s piano, a 909, no bassline; the record that opened the Liquid Room.', 'derrick-may', ['tr909'], 'g-detroit');
R('rec-acidtracks', 'Phuture', 'Acid Tracks', 1987, 'trax', ['house', 'rave', 'techno'], 'The 303 twisted until it squealed; the crossing\'s founding record.', 'dj-pierre', ['tb303'], 'g-acidhouse');
R('rec-bigfun', 'Inner City', 'Big Fun', 1988, 'kms', ['techno', 'house'], 'Detroit in the UK top ten.', 'kevin-saunderson', [], 'g-detroit');
R('rec-technocomp', 'Various', 'Techno! The New Dance Sound of Detroit', 1988, 'network', ['techno'], 'The compilation that named the genre.', 'neil-rushton', [], 'g-detroit');
R('rec-voodooray', 'A Guy Called Gerald', 'Voodoo Ray', 1988, null, ['house', 'rave'], 'Manchester acid house; the first British dance classic.', 'a-guy-called-gerald', ['tb303', 'tr808'], 'g-acidhouse');
R('rec-pacific', '808 State', 'Pacific State', 1989, null, ['rave', 'techno', 'house'], 'Manchester\'s Balearic techno, made from sax, birdsong and an 808.', '808-state', ['tr808']);
R('rec-chime', 'Orbital', 'Chime', 1989, null, ['rave', 'techno'], 'Recorded on a cassette deck in Sevenoaks; the band, not the track, took its name from the M25.', 'orbital', [], 'g-hardcore');
R('rec-testone', 'Sweet Exorcist', 'Testone', 1990, 'warp', ['techno'], 'Bleep\'s first record, from Cabaret Voltaire\'s Richard Kirk.', null, [], 'g-bleep');
R('rec-lfo', 'LFO', 'LFO', 1990, 'warp', ['techno', 'rave'], 'UK No. 12; sub-bass under the kick.', null, [], 'g-bleep');
R('rec-forgemasters', 'Forgemasters', 'Track With No Name', 1989, 'warp', ['techno'], 'Warp 001, the label\'s first release.', null, [], 'g-bleep');
R('rec-energyflash', 'Joey Beltram', 'Energy Flash', 1990, 'rs', ['techno', 'rave'], 'The rave-techno hinge; "ecstasy, ecstasy".', 'joey-beltram', [], 'g-hardcore');
R('rec-mentasm', 'Second Phase', 'Mentasm', 1991, 'rs', ['rave', 'techno'], 'Beltram and Mundo Muzique invent the hoover.', 'joey-beltram', [], 'g-hardcore');
R('rec-dominator', 'Human Resource', 'Dominator', 1991, null, ['rave'], 'Rotterdam; the hoover as a riff; "I\'m bigger and bolder and rougher and tougher".', null, [], 'g-hardcore');
R('rec-anasthasia', 'T99', 'Anasthasia', 1991, null, ['rave'], 'Belgian rave\'s biggest stab.', null, [], 'g-hardcore');
R('rec-charly', 'The Prodigy', 'Charly', 1991, null, ['rave'], 'A public-information cat sample at 140.', 'the-prodigy', ['sampler'], 'g-hardcore');
R('rec-activ8', 'Altern 8', 'Activ 8 (Come With Me)', 1991, 'network', ['rave'], 'Chemical suits in the charts.', 'altern-8', ['sampler'], 'g-hardcore');
R('rec-raggatip', 'SL2', 'On a Ragga Tip', 1992, null, ['rave'], 'Slipmatt and Lime\'s ragga vocal over a break, a UK No. 2.', 'slipmatt', ['sampler'], 'g-hardcore');
R('rec-ravingimraving', 'Shut Up and Dance', 'Raving I\'m Raving', 1992, 'shut-up-and-dance', ['rave'], 'UK No. 2 and withdrawn in a week over the Marc Cohn sample.', 'shut-up-and-dance-p', ['sampler'], 'g-hardcore');
R('rec-weareie', 'Lennie De Ice', 'We Are I.E.', 1991, null, ['rave'], 'Proto-jungle built from reggae bass under a breakbeat.', null, ['sampler'], 'g-jungle');
R('rec-somejustice', 'Urban Shakedown', 'Some Justice', 1992, null, ['rave'], 'Micky Finn and Aphrodite; the hardcore anthem.', 'mickey-finn', ['sampler'], 'g-hardcore');
R('rec-terminator', 'Metalheads', 'Terminator', 1992, 'reinforced', ['rave'], 'Goldie and 4hero\'s timestretch, where jungle begins.', 'goldie', ['sampler'], 'g-jungle');
R('rec-28gun', 'A Guy Called Gerald', '28 Gun Bad Boy', 1992, null, ['rave'], 'Manchester\'s first jungle record.', 'a-guy-called-gerald', [], 'g-jungle');
R('rec-valley', 'Origin Unknown', 'Valley of the Shadows', 1993, null, ['rave'], 'Jungle\'s anthem, by Andy C and Ant Miles, with its "31 seconds".', null, [], 'g-jungle');
R('rec-helicopter', 'Deep Blue', 'The Helicopter Tune', 1993, 'moving-shadow', ['rave'], 'Sean O\'Keeffe\'s break; the drum & bass hinge.', null, [], 'g-jungle');
R('rec-papua', 'The Future Sound of London', 'Papua New Guinea', 1991, null, ['rave', 'techno'], 'Lisa Gerrard and a breakbeat; the rave sublime.', null, ['sampler']);
R('rec-hardcoreuproar', 'Together', 'Hardcore Uproar', 1990, null, ['rave'], 'Jon Dasilva and Suddi Raval built it around Raval\'s recording of the crowd at a Hardcore Uproar party.', null, [], 'g-hardcore');
R('rec-loaded', 'Primal Scream', 'Loaded (Weatherall remix)', 1990, null, ['house', 'rave'], 'The rock band remade for the dancefloor.', 'andrew-weatherall');
R('rec-spiraltribe', 'Spiral Tribe', 'Forward the Revolution', 1992, null, ['rave', 'techno'], 'The sound system on vinyl; Big Life signed them after Castlemorton.', 'spiral-tribe', [], 'g-acidtek');
R('rec-sonicdestroyer', 'X-101', 'Sonic Destroyer', 1991, 'tresor-records', ['techno'], 'Tresor 001, which put UR in the vault.', 'ur', [], 'g-berlin');
R('rec-finalfrontier', 'Underground Resistance', 'The Final Frontier', 1991, null, ['techno'], 'UR\'s manifesto in sound.', 'ur', [], 'g-detroit');
R('rec-jupiterjazz', 'Galaxy 2 Galaxy', 'Jupiter Jazz', 1993, null, ['techno'], 'UR\'s hi-tech jazz.', 'ur', [], 'g-detroit');
R('rec-bugbassbin', 'Innerzone Orchestra', 'Bug in the Bassbin', 1992, 'planet-e', ['techno'], 'Carl Craig; the record jungle producers pitched up.', 'carl-craig');
R('rec-spastik', 'Plastikman', 'Spastik', 1993, 'plus8', ['techno'], 'A 909 and nothing else.', 'richie-hawtin', ['tr909'], 'g-minimal');
R('rec-bubble', 'Drexciya', 'Bubble Metropolis', 1993, null, ['techno'], 'The undersea nation.', 'drexciya', [], 'g-electro');
R('rec-minimalnation', 'Robert Hood', 'Minimal Nation', 1994, 'm-plant', ['techno'], 'Minimal techno, named.', 'robert-hood', ['tr909'], 'g-minimal');
R('rec-phylyps', 'Basic Channel', 'Phylyps Trak', 1993, null, ['techno'], 'Dub techno\'s founding 12".', 'basic-channel', [], 'g-dub');
R('rec-m4', 'Maurizio', 'M4', 1995, null, ['techno'], 'One chord, forever.', 'basic-channel', [], 'g-dub');
R('rec-marusha', 'Marusha', 'Somewhere Over the Rainbow', 1994, null, ['techno', 'rave'], 'Berlin\'s rave-pop moment, a 1994 Low Spirit hit.', null, [], 'g-trance');
R('rec-speaktome', 'Regis', 'Speak to Me', 1995, 'downwards', ['techno'], 'Birmingham\'s dry hammer.', 'regis', [], 'g-bham');
R('rec-magneze', 'Surgeon', 'Magneze', 1995, 'downwards', ['techno'], 'Surgeon\'s first; the Birmingham sound.', 'surgeon', [], 'g-bham');
R('rec-red2', 'Dave Clarke', 'Red 2 (Wisdom to the Wise)', 1994, null, ['techno'], 'The Baron\'s hardest cut.', 'dave-clarke');
R('rec-positiveeducation', 'Slam', 'Positive Education', 1993, 'soma', ['techno'], 'Glasgow\'s techno anthem.', 'slam');
R('rec-freekfunk', 'Luke Slater', 'Freek Funk', 1997, null, ['techno'], 'NovaMute; machine funk at album length.', 'luke-slater');
R('rec-thebells', 'Jeff Mills', 'The Bells', 1996, 'axis', ['techno'], 'The most-played techno record ever made; Cox played it at the last Space.', 'jeff-mills', ['tr909'], 'g-detroit');
R('rec-crispybacon', 'Laurent Garnier', 'Crispy Bacon', 1997, null, ['techno'], 'Paris\'s techno hit.', 'laurent-garnier');
R('rec-accident', 'Sven Väth', 'An Accident in Paradise', 1992, null, ['techno'], 'Frankfurt trance at its birth.', 'sven-vath', [], 'g-trance');
R('rec-pullover', 'Speedy J', 'Pullover', 1991, 'plus8', ['techno', 'rave'], 'Rotterdam\'s Detroit record; a rave anthem by accident.', 'speedy-j');
R('rec-saw85', 'Aphex Twin', 'Selected Ambient Works 85–92', 1992, 'rs', ['techno'], 'Techno for the chair; R&S\'s strangest release.', 'aphex-twin', [], 'g-idm');
R('rec-extra', 'Ken Ishii', 'Extra (Luke Slater remix)', 1995, 'rs', ['techno'], 'In the Liquid Room set.', 'ken-ishii');
R('rec-drumcodes1', 'Adam Beyer', 'Drum Codes 1', 1996, 'drumcode', ['techno'], 'Swedish loop techno begins.', 'adam-beyer', [], 'g-schranz');
R('rec-analogon', 'Chris Liebing', 'Analogon', 2001, null, ['techno'], 'Schranz\'s calling card.', 'chris-liebing', [], 'g-schranz');
R('rec-closer', 'Plastikman', 'Closer', 2003, 'mnus', ['techno'], 'Minimal\'s dark album.', 'richie-hawtin', [], 'g-minimal');
R('rec-dexter', 'Ricardo Villalobos', 'Dexter', 2003, null, ['techno'], 'Alcachofa\'s opener.', 'ricardo-villalobos', [], 'g-minimal');
R('rec-immer', 'Michael Mayer', 'Immer', 2002, 'kompakt', ['techno'], 'Cologne\'s mix of the decade.', null, [], 'g-minimal');
R('rec-subzero', 'Ben Klock', 'Subzero', 2009, 'ostgut-ton', ['techno'], 'The rumble, defined.', 'ben-klock', [], 'g-berghain');
R('rec-translation', 'Marcel Dettmann', 'Translation', 2011, 'ostgut-ton', ['techno'], 'The 2011 EP, opening with "Barrier".', 'marcel-dettmann', [], 'g-berghain');
R('rec-tempsusp', 'Planetary Assault Systems', 'Temporary Suspension', 2009, 'ostgut-ton', ['techno'], 'Polymeters on Ostgut Ton.', 'luke-slater', [], 'g-hypnotic');
R('rec-twinsvirgo', 'Voices From The Lake', 'Twins in Virgo', 2012, null, ['techno'], 'The hypnotic school\'s statement.', 'donato-dozzy', [], 'g-hypnotic');
R('rec-whytheyhide', 'Blawan', 'Why They Hide Their Bodies Under My Garage?', 2012, null, ['techno'], 'A vocal sample and a distorted kick; the decade\'s UK techno hit.', 'blawan', [], 'g-industrial');
R('rec-sharingstuff', 'Karenn', 'Sharing the Stuff', 2011, null, ['techno'], 'Blawan and Pariah\'s hardware techno.', 'blawan');
R('rec-ghettokraviz', 'Nina Kraviz', 'Ghetto Kraviz', 2012, null, ['techno'], 'Acid vocals from Siberia.', 'nina-kraviz');
R('rec-qualm', 'Helena Hauff', 'Qualm', 2018, null, ['techno'], 'Electro and acid, no computer.', 'helena-hauff', [], 'g-electro');
R('rec-yourmind', 'Adam Beyer & Bart Skils', 'Your Mind', 2018, 'drumcode', ['techno'], 'The main-stage techno record of the decade.', 'adam-beyer', [], 'g-peak');
R('rec-doppler', 'Charlotte de Witte', 'Doppler', 2021, null, ['techno'], 'The Belgian wave\'s anthem.', 'charlotte-de-witte', [], 'g-peak');
R('rec-hypnotized', 'Amelie Lens', 'Hypnotized', 2019, null, ['techno'], 'Peak-time acid.', 'amelie-lens', [], 'g-peak');
R('rec-waterfall', 'Rrose', 'Waterfall', 2012, null, ['techno'], 'Hypnotic, mutating.', 'rrose', [], 'g-hypnotic');
R('rec-999', '999999999', '300000003', 2018, null, ['techno', 'rave'], 'Hard techno\'s acid-rave anthem.', null, [], 'g-hard');
R('rec-ihm', 'I Hate Models', 'Daydream', 2018, null, ['techno'], 'The French industrial-trance hinge.', null, [], 'g-hard');
R('rec-kobosil', 'Kobosil', '91', 2015, 'ostgut-ton', ['techno'], 'A four-track EP of 2015; Berghain\'s harder turn in miniature.', null, [], 'g-industrial');
R('rec-ifeelit', 'Carl Cox', 'I Want You (Forever)', 1991, null, ['rave'], 'The rave hit that reached UK No. 23.', 'carl-cox', [], 'g-hardcore');

/* ---------- landmark sets ---------- */
const SET = (id, title, city, years, blurb, strands, rel = []) => N(id, 'set', title, { city, years, blurb, strands, rel: [['in', city], ...rel] });
SET('set-musicinstitute', 'Derrick May at the Music Institute', 'detroit', '1988', 'Acid, Chicago and the first Detroit records, mixed by the man who made them, for the crowd they were made for.', ['techno'], [['at', 'music-institute']]);
SET('set-liquidroom', 'Jeff Mills — Live at the Liquid Room, Tokyo', 'tokyo', '28 October 1995', 'Released May 1996: around seventy records in 67 minutes — on three decks by the usual telling, on two turntables and two reel-to-reels by Wikipedia\'s account; the book lists both. Confirmed tracks include Surgeon "Argon", Robert Armani "Wet Floor", X-102 "Intro", "Humana", Ken Ishii "Extra" (Luke Slater remix), Jonzon & Hell "Lifeform" and "Strings of Life".', ['techno'], [['at', 'liquid-room']]);
SET('set-packard', 'Plastikman at the Packard Plant', 'detroit', '1994', 'Hawtin\'s illegal parties in the abandoned car factory: a 303, a 909 and "Spastik" live.', ['techno']);
SET('set-de9', 'Richie Hawtin — Decks, EFX & 909 / DE9', 'windsor', '1999 / 2001', 'The laptop DJ\'s founding documents, from a 909 and effects over vinyl to hundreds of loops on Final Scratch.', ['techno']);
SET('set-garnierrex', 'Laurent Garnier — Rex Club all-nighters', 'paris', '1992–', 'Seven and eight hours from jazz to hard techno and back; the "journey" set.', ['techno'], [['at', 'rex-club']]);
SET('set-cocoon', 'Sven Väth — Cocoon closing, Amnesia', 'ibiza', '2000–2019', 'The last Monday of every summer under the ice cannons.', ['techno'], [['at', 'amnesia']]);
SET('set-coxspace', 'Carl Cox — The Final Chapter, Space', 'ibiza', '20 September 2016', 'Nine-plus hours on vinyl and CDJs to end sixteen summers; "The Bells" and "Teckno Drome" in it; the club closed two weeks later.', ['techno', 'house'], [['at', 'space']]);
SET('set-klubnacht', 'Klock & Dettmann — Klubnacht closings', 'berlin', '2005–', 'Unrecorded by rule; the Berghain 02 and 04 mixes are the nearest document.', ['techno'], [['at', 'berghain']]);
SET('set-exhibitionist', 'Jeff Mills — Exhibitionist', 'detroit', '2004', 'Three decks and a 909 filmed from above.', ['techno']);
SET('set-kraviz', 'Nina Kraviz — Dekmantel sets', 'amsterdam', '2014–', 'Acid and Russian records broadcast to millions.', ['techno'], [['at', 'dekmantel']]);
SET('set-surgeonbr', 'Surgeon — Boiler Room / fabric', 'london', '2010s', 'Modular, live-edited, relentless.', ['techno'], [['at', 'fabric']]);
SET('set-rage', 'Fabio & Grooverider at Rage', 'london', '1988–93', 'Thursday at Heaven: Belgian techno, then breaks pitched to +8, then jungle. The set that split rave.', ['rave'], [['at', 'heaven']]);
SET('set-sunrise5000', 'Sunrise at White Waltham', 'london', '24 June 1989', 'Sunrise\'s "A Midsummer Night\'s Dream" at White Waltham airfield, often mislabelled Sunrise 5000: the Sun\'s "Spaced Out" front page followed.', ['rave'], [['at', 'sunrise']]);
SET('set-castlemorton', 'Spiral Tribe at Castlemorton', 'worcestershire', 'May 1992', 'Six days, the Tribe\'s rig running the whole time; the recording that ended the free-party era.', ['rave', 'techno'], [['at', 'castlemorton']]);

const NODE_PUSH_REL = (id, rel) => { const n = NODES.find(x => x.id === id); if (n && !n.rel.some(r => r[0] === rel[0] && r[1] === rel[1])) n.rel.push(rel); };

/* ---------- London & the Detroit exchange (chapter ldn) ---------- */
[['plink-plonk', 'Plink Plonk', '1993', 'london', 'Mr. C\'s label: London tech-house before the word.', ['techno', 'house']],
 ['end-recordings', 'End Recordings', '1996', 'london', 'The End\'s label: Layo & Bushwacka!, Mr. C, "Love Story".', ['techno', 'house']],
 ['superfreq', 'Superfreq', '2002', 'london', 'Mr. C\'s party and label; monthly at The End until the last night, then warehouses and fabric.', ['techno', 'house']],
 ['dtm-records', 'DTM Records', '2007', 'detroit', 'Detroit Techno Militia\'s vinyl label, launched early 2007; DTM Digital alongside.', ['techno']]
].forEach(([id, t, y, c, b, s]) => N(id, 'label', t, { years: y, city: c, blurb: b, strands: s, rel: [['in', c]] }));
[['detroit-techno-militia', 'Detroit Techno Militia', '2000s–', 'detroit', ['techno'], 'Street-level Detroit DJ-and-producer collective "dedicated to preserving the legacy of true Detroit electronic music": T.Linder, DJ Seoul, Darkcube, Neil V, DJ Psycho, J.Garcia. Label launched 2007; the DTM 5x5 (five DJs, five turntables, 2007); Detroit Music Award 2010; the Made in Detroit stage at Movement 2011; The Grid radio show (2013). Since 2023 a regular guest in Hastings.', [['in', 'detroit'], ['founded', 'dtm-records'], ['played', 'movement'], ['played', 'dtm-hastings'], ['played', 'the-pig']], ['DTM', 'the Militia']],
 ['hastings-techno-militia', 'Hastings Techno Militia', '2024–', 'hastings', ['techno'], 'The Hastings residents — DJK, Japhy, Rob Miller — who took the Detroit crew\'s name after hosting them: a vinyl crew playing Detroit techno in a Sussex seaside town, promoting nights at the Brewing Brothers Courtyard and sending DJK to play Detroit and bring the new wax home.', [['in', 'hastings'], ['played', 'dtm-hastings'], ['played', 'the-pig']], ['HTM']]
].forEach(([id, t, y, c, s, b, r, a]) => N(id, 'collective', t, { years: y, city: c, strands: s, blurb: b, rel: r, aliases: a }));
P('eddie-richards', 'Eddie Richards', 'london', '1982–', 'Dy-na-mix, Wiggle', 'Evil Eddie Richards: Camden Palace resident, Clink Street resident with Mr. C, the Dy-na-mix agency (1990), tech-house\'s elder.', ['techno', 'house'], [['played', 'camden-palace'], ['played', 'clink-street'], ['made', 'rec-page67'], ['played', 'wiggle']], ['Evil Eddie Richards']);
P('layo-bushwacka', 'Layo & Bushwacka!', 'london', '1995–', 'End Recordings, Olmeto', 'Layo Paskin and Matthew Benjamin: The End\'s residents and co-owner; "Love Story" (2002); four tech-house albums.', ['techno', 'house'], [['founded', 'the-end'], ['founded', 'end-recordings'], ['made', 'rec-lovestory']], ['Layo Paskin', 'Layo', 'Bushwacka']);
P('terry-francis', 'Terry Francis', 'london', '1994–', 'Wiggle, fabric', 'Wiggle with Nathan Coles (1994 —); fabric\'s resident from the first night; tech-house\'s name on the door.', ['techno', 'house'], [['founded', 'wiggle'], ['played', 'fabric']]);
P('craig-richards', 'Craig Richards', 'london', '1999–', 'fabric, Tyrant', 'fabric\'s Saturday-night resident for twenty years; the slow, strange room.', ['techno', 'house'], [['played', 'fabric']]);
P('t-linder', 'T.Linder', 'detroit', '2002–', 'Detroit Techno Militia', 'Tom Linder: "No Retreat. No Surrender" (2002), "Liver-Noise"; the Militia\'s most-travelled DJ; Hastings 2023, 2024, 2026.', ['techno'], [['member', 'detroit-techno-militia'], ['played', 'dtm-hastings'], ['played', 'movement']], ['Tom Linder']);
P('dj-seoul', 'DJ Seoul', 'detroit', '2000s–', 'Detroit Techno Militia', 'Half of DTM 2x4 with T.Linder; the Rust Belt Tour; Hastings, Edinburgh and Amsterdam over one Christmas week in 2024.', ['techno'], [['member', 'detroit-techno-militia'], ['played', 'dtm-hastings'], ['played', 'movement']]);
C('camden-palace', 'Camden Palace', 'london', '1982–2004', 'The Camden theatre, now KOKO, where Colin Faver and Eddie Richards played electro, funk, then early acid to London; Mr. C rapped in Richards\'s Jolly Roger act.', ['techno', 'house'], [], ['KOKO']);
C('clink-street', 'RIP at Clink Street', 'london', '1988', 'Paul Stone and Lu Vukovic\'s Friday-and-Saturday parties in a Southwark warehouse beside the old Clink prison: Mr. C and Eddie Richards resident, Kid Batchelor; the dark twin of Shoom, and where London heard Detroit. "Revolution in Progress".', ['techno', 'house', 'rave'], [], ['Clink Street', 'RIP']);
C('dungeons', 'The Dungeons', 'london', 'c.1987–94', 'Lea Bridge Road: the East London acid parties, the first flyers dated 1988, and the Base nights.', ['techno', 'rave'], [], ['Base']);
C('club-uk', 'Club UK (Final Frontier)', 'london', '1993–96', 'Wandsworth: Final Frontier, the purist techno night of the mid-90s.', ['techno'], [], ['Final Frontier']);
C('turnmills', 'Turnmills', 'london', '1990–2008', 'Clerkenwell: Trade on Sunday mornings (house strand), The Gallery, and most of London\'s techno guests in between.', ['house', 'techno'], []);
C('corsica-studios', 'Corsica Studios', 'london', '2002–', 'Two rooms under the railway arches at Elephant and Castle; the small club that booked everything first. In 2026 it announced it would close in its current form.', ['techno', 'house'], []);
C('the-pig', 'The Pig, Hastings', 'hastings', '2010s–', 'The Hastings venue where Detroit Techno Militia played with the Hastings Techno Militia on 27 December 2024.', ['techno'], []);
E('wiggle', 'Wiggle', 'london', '1994–', 'Terry Francis and Nathan Coles\'s party, where tech-house got its name.', ['house', 'techno'], [['in', 'london']]);
E('subterrain', 'Subterrain', 'london', '1995–2002', 'Mr. C\'s house-and-techno night at The End; the "100% Unreleased" mix (2000).', ['techno', 'house'], [['at', 'the-end']]);
E('catchmydrift', 'Catchmydrift?', 'hastings', '2023–', 'The Hastings promoter who brought over Detroit Techno Militia (Easter Sunday 2023, December 2024, Easter Sunday 2026) and incubated the Hastings Techno Militia.', ['techno'], [['founded', 'hastings-techno-militia']]);
E('dtm-hastings', 'Detroit Techno Militia in Hastings', 'hastings', '2023–', 'Easter Sunday 2023 (the first), 27 December 2024 at The Pig, Easter Sunday 5 April 2026 at the Deep End, Brewing Brothers Courtyard: T.Linder, DJ Seoul and J.Garcia from the 313, with DJK, Japhy and Rob Miller.', ['techno'], [['at', 'the-pig']]);
R('rec-page67', 'Myster-E', 'Page 67', 1987, null, ['house', 'techno'], 'Mr. C and Eddie Richards\'s first record, London deep house from August 1987.', 'mr-c', [], 'g-techhouse');
R('rec-ebeneezer', 'The Shamen', 'Ebeneezer Goode', 1992, null, ['rave'], 'Mr. C on the mic and a UK No. 1; the pop money that built The End.', 'mr-c', []);
R('rec-lovestory', 'Layo & Bushwacka!', 'Love Story', 2002, 'end-recordings', ['house', 'techno'], 'The End\'s anthem, tech-house with a tune; the 2003 hit version came out on XL.', 'layo-bushwacka', [], 'g-techhouse');
R('rec-midnightmadness', 'Detroit Techno Militia', 'Midnight Madness', 2011, 'dtm-records', ['techno'], 'The collective\'s calling card on CSI.', 'detroit-techno-militia', [], 'g-detroit');
SET('set-rip', 'Mr. C at RIP, Clink Street', 'london', '1988', 'Every Friday and Saturday: Chicago acid, the first Detroit imports, no smiley faces.', ['techno', 'house'], [['at', 'clink-street']]);
SET('set-endlast', 'The End\'s last 24 hours', 'london', '24 January 2009', 'The club closed with a 24-hour party: Layo & Bushwacka!, Mr. C, the residents and the regulars.', ['techno', 'house'], [['at', 'the-end']]);
SET('set-dtm5x5', 'DTM 5x5 at Movement', 'detroit', '2011', 'Five DJs on five turntables on the Made in Detroit stage.', ['techno'], [['at', 'movement']]);
NODE_PUSH_REL('mr-c', ['played', 'camden-palace']); NODE_PUSH_REL('mr-c', ['played', 'clink-street']); NODE_PUSH_REL('mr-c', ['founded', 'plink-plonk']); NODE_PUSH_REL('mr-c', ['founded', 'superfreq']); NODE_PUSH_REL('mr-c', ['founded', 'end-recordings']); NODE_PUSH_REL('mr-c', ['founded', 'subterrain']); NODE_PUSH_REL('mr-c', ['played', 'kiss-fm']); NODE_PUSH_REL('mr-c', ['played', 'set-rip']); NODE_PUSH_REL('mr-c', ['played', 'dungeons']);
NODE_PUSH_REL('colin-faver', ['played', 'camden-palace']); NODE_PUSH_REL('colin-dale', ['played', 'kiss-fm']);
NODE_PUSH_REL('derrick-may', ['played', 'the-end']); NODE_PUSH_REL('kevin-saunderson', ['played', 'the-end']); NODE_PUSH_REL('carl-craig', ['played', 'the-end']);
NODE_PUSH_REL('jeff-mills', ['played', 'club-uk']); NODE_PUSH_REL('john-digweed', ['in', 'hastings']);
(() => { const m = NODES.find(n => n.id === 'mr-c'); if (m) m.blurb = 'The Shamen, The End, Plink Plonk, Superfreq — Richard West, Mile End, 1965: resident rapper at the Camden Palace (1986), resident DJ at RIP Clink Street (1988), Kiss FM\'s Future Music (1993–2002), frontman of The Shamen, co-founder of The End (1995–2009) with Layo Paskin; tech-house\'s loudest advocate.'; })();
/* ===================================================================
   GRAPH 2 — jungle / drum & bass, trance, house nodes
   (inserted before the indexes in graph.js)
   =================================================================== */
/* ---------- genres ---------- */
[['g-raggajungle', 'Ragga jungle', '1994–95', 'london', ['jungle'], 'Dancehall vocals and reggae bass over timestretched breaks: "Incredible", "Original Nuttah".', 'Jungle 1994', ['j2']],
 ['g-intelligent', 'Intelligent / atmospheric drum & bass', '1994–98', 'london', ['jungle'], 'Jazz pads and Rhodes over the breaks, from Bukem and Good Looking.', null, ['j3']],
 ['g-techstep', 'Techstep', 'c.1995–99', 'london', ['jungle'], 'Dark drum & bass from No U Turn, Virus and Ed Rush & Optical, its "tech" taken from Belgian hardcore.', 'Drum & bass 1998', ['j3']],
 ['g-liquid', 'Liquid funk', '1999–', 'london', ['jungle'], 'Fabio\'s name, from 1999, for the soulful, musical strand: Hospital, High Contrast, Calibre.', null, ['j4']],
 ['g-neurofunk', 'Neurofunk', '1998–', 'london', ['jungle'], 'Techstep refined into sound design: Noisia, Phace, the basslines as instruments.', null, ['j4']],
 ['g-jumpup', 'Jump-up', '1995–', 'london', ['jungle'], 'The bassline hook and the rewind, from Hype\'s Ganja Kru, Aphrodite and Playaz.', null, ['j4']],
 ['g-frankfurt-trance', 'Frankfurt trance', '1990–95', 'frankfurt', ['trance'], 'Techno\'s euphoric exit, through Dance 2 Trance, Jam & Spoon, Harthouse and Eye Q.', 'Trance 1993', ['t1']],
 ['g-goa', 'Goa / psytrance', '1990–', 'goa', ['trance'], 'The psychedelic branch, from Anjuna beach and Goa Gil to Hallucinogen and Infected Mushroom.', null, ['t2']],
 ['g-uplifting', 'Uplifting trance', '1996–', 'netherlands', ['trance'], 'The breakdown, the supersaw, the key change: Tiësto, Armin, Ferry Corsten, Above & Beyond.', 'Trance 1999', ['t3']],
 ['g-progressive', 'Progressive house / trance', '1992–', 'london', ['trance', 'house'], 'Long, building and British, from Sasha & Digweed, Leftfield and Hooj Choons.', null, ['t3']],
 ['g-hardtrance', 'Hard trance', '1993–', 'frankfurt', ['trance', 'techno'], 'Harder kicks and faster tempos out of Frankfurt; revived inside 2020s hard techno.', null, ['t4']],
 ['g-deephouse', 'Deep house', '1985–', 'chicago', ['house'], 'Chords, warmth and the jazz line of house, from Larry Heard\'s "Can You Feel It".', null, ['hh1']],
 ['g-garage', 'Garage / US garage', '1980s–', 'newyork', ['house'], 'The Paradise Garage lineage: vocals, gospel, Todd Terry, Masters at Work.', null, ['hh2']],
 ['g-ukgarage', 'UK garage', '1995–2001', 'london', ['house', 'rave'], 'Speed garage and 2-step: US garage at +8 with jungle\'s MCs and bass.', null, ['hh6']],
 ['g-frenchtouch', 'French touch', '1995–2000', 'paris', ['house'], 'Filtered disco loops from Daft Punk, Cassius and Stardust.', null, ['hh6']]
].forEach(([id, t, y, c, s, b, g, ch]) => { const n = N(id, 'genre', t, { years: y, city: c, strands: s, blurb: b, rel: [['in', c], ...ch.map(x => ['told', x])], color: s[0] === 'jungle' ? '--samp' : s[0] === 'trance' ? '--synth' : '--drums', q: t }); n.preset = g; });
[['g-hardcore', 'g-raggajungle'], ['g-jungle', 'g-raggajungle'], ['g-jungle', 'g-intelligent'], ['g-jungle', 'g-techstep'], ['g-bham', 'g-techstep'], ['g-intelligent', 'g-liquid'], ['g-techstep', 'g-neurofunk'], ['g-jungle', 'g-jumpup'], ['g-trance', 'g-frankfurt-trance'], ['g-acidhouse', 'g-goa'], ['g-frankfurt-trance', 'g-uplifting'], ['g-house', 'g-progressive'], ['g-frankfurt-trance', 'g-hardtrance'], ['g-hardtrance', 'g-hard'], ['g-house', 'g-deephouse'], ['g-house', 'g-garage'], ['g-garage', 'g-ukgarage'], ['g-jungle', 'g-ukgarage'], ['g-house', 'g-frenchtouch'], ['g-ukgarage', 'g-jungle']].forEach(([a, b]) => NODE_PUSH_REL(b, ['from', a]));

/* ---------- labels ---------- */
[['metalheadz', 'Metalheadz', '1994', 'london', 'Goldie, Kemistry and Storm; the Blue Note Sundays; the drum & bass label.', ['jungle']],
 ['good-looking', 'Good Looking', '1991', 'london', 'LTJ Bukem\'s atmospheric label; Logical Progression.', ['jungle']],
 ['v-recordings', 'V Recordings', '1993', 'london', 'Bryan Gee and Jumpin\' Jack Frost; Roni Size and the Bristol crew\'s early home.', ['jungle']],
 ['full-cycle', 'Full Cycle', '1993', 'bristol', 'Bristol\'s drum & bass from Roni Size, Krust, Die and Suv.', ['jungle']],
 ['ram', 'RAM Records', '1992', 'hornchurch', 'Andy C and Ant Miles; from "Valley of the Shadows" to the biggest brand in drum & bass.', ['jungle']],
 ['hospital', 'Hospital Records', '1996', 'london', 'Tony Colman (London Elektricity) and Chris Goss; liquid funk\'s house.', ['jungle']],
 ['virus', 'Virus Recordings', '1998', 'london', 'Ed Rush & Optical; techstep\'s laboratory.', ['jungle']],
 ['no-u-turn', 'No U Turn', '1992', 'london', 'Nico Sykes; Trace, Ed Rush; the birthplace of techstep.', ['jungle']],
 ['ganja', 'Ganja Records / Playaz', '1994', 'london', 'DJ Hype\'s labels; jump-up.', ['jungle']],
 ['congo-natty-label', 'Congo Natty', '1994', 'london', 'Rebel MC\'s ragga jungle label.', ['jungle']],
 ['eye-q', 'Eye Q', '1991', 'frankfurt', 'Sven Väth, Heinz Roth and Matthias Hoffmann\'s label, Frankfurt trance\'s first; Cygnus X, Energy 52.', ['trance']],
 ['mfs', 'MFS', '1990', 'berlin', 'Mark Reeder\'s Masterminded For Success: Paul van Dyk, Cosmic Baby, Berlin trance.', ['trance']],
 ['platipus', 'Platipus', '1993', 'london', 'British trance from Art of Trance and Union Jack.', ['trance']],
 ['hooj-choons', 'Hooj Choons', '1990', 'london', 'Red Jerry and Alex Simons\'s progressive house and trance label; Hybrid, Tilt, Lustral.', ['trance']],
 ['perfecto', 'Perfecto', '1989', 'london', 'Paul Oakenfold\'s label; Grace, BT, the Goa mix era.', ['trance']],
 ['dragonfly', 'Dragonfly', '1993', 'london', 'Youth\'s Goa trance label; Hallucinogen\'s first records.', ['trance']],
 ['tip', 'TIP Records', '1994', 'london', 'Raja Ram, Graham Wood and Ian St Paul: The Infinity Project; Goa to psytrance.', ['trance']],
 ['black-hole', 'Black Hole Recordings', '1997', 'netherlands', 'Tiësto and Arny Bink\'s Dutch trance factory.', ['trance']],
 ['anjunabeats', 'Anjunabeats', '2000', 'london', 'Above & Beyond\'s label; named for the Goa beach.', ['trance']],
 ['armada', 'Armada Music', '2003', 'amsterdam', 'Armin van Buuren\'s label; A State of Trance.', ['trance']],
 ['dj-international', 'DJ International', '1985', 'chicago', 'Rocky Jones\'s label: "Jack Your Body", Chip E and the Chicago house of 1985–88.', ['house']],
 ['strictly-rhythm', 'Strictly Rhythm', '1989', 'newyork', 'New York\'s house factory of the 90s.', ['house']],
 ['nervous', 'Nervous Records', '1991', 'newyork', 'New York house label; Roger Sanchez\'s was the first release, Masters at Work among those who followed.', ['house']],
 ['roule', 'Roulé', '1995', 'paris', 'Thomas Bangalter\'s label: Stardust, "Music Sounds Better with You".', ['house']]
].forEach(([id, t, y, c, b, s]) => N(id, 'label', t, { years: y, city: c, blurb: b, strands: s, rel: [['in', c]] }));

/* ---------- people ---------- */
const P2 = (id, name, city, years, labels, blurb, strands, rel = [], aliases = []) => N(id, 'person', name, { city, years, blurb: labels + ' — ' + blurb, strands, rel: [['in', city], ...rel], aliases });
P2('roni-size', 'Roni Size', 'bristol', '1992–', 'Reprazent, Full Cycle', '"Brown Paper Bag"; New Forms won the Mercury Prize in 1997 and made drum & bass respectable.', ['jungle'], [['founded', 'full-cycle'], ['made', 'rec-brownpaperbag']]);
P2('andy-c', 'Andy C', 'hornchurch', '1992–', 'RAM Records', 'Co-wrote "Valley of the Shadows" at sixteen; the double-drop; the most-booked DJ in drum & bass for twenty years.', ['jungle'], [['founded', 'ram'], ['made', 'rec-valley'], ['made', 'rec-bodyrock']]);
P2('ed-rush-optical', 'Ed Rush & Optical', 'london', '1997–', 'Virus', '"Wormhole" (1998): techstep\'s defining album.', ['jungle'], [['founded', 'virus'], ['made', 'rec-wormhole']], ['Ed Rush', 'Optical']);
P2('photek', 'Photek', 'ipswich', '1994–', 'Photek Productions, Science', 'Rupert Parkes; "Ni Ten Ichi Ryu": the most intricate breaks ever cut.', ['jungle'], [['made', 'rec-nitenichiryu']]);
P2('dillinja', 'Dillinja', 'london', '1993–', 'Valve Sound System', 'Karl Francis; the bass; the Valve rig.', ['jungle'], []);
P2('shy-fx', 'Shy FX', 'london', '1994–', 'Digital Soundboy', '"Original Nuttah" with UK Apachi: ragga jungle\'s anthem.', ['jungle'], [['made', 'rec-originalnuttah']]);
P2('congo-natty', 'Congo Natty (Rebel MC)', 'london', '1989–', 'Congo Natty', 'From "Street Tuff" to the junglist manifesto.', ['jungle'], [['founded', 'congo-natty-label']], ['Rebel MC']);
P2('ray-keith', 'Ray Keith', 'london', '1991–', 'Dread, Penny Black', 'Renegade\'s "Terrorist" (1994).', ['jungle'], [['made', 'rec-terrorist']]);
P2('dj-rap', 'DJ Rap', 'london', '1990–', 'Proper Talent', 'Charissa Saverio; the first woman to headline jungle events.', ['jungle'], []);
P2('kemistry-storm', 'Kemistry & Storm', 'london', '1994–', 'Metalheadz', 'Co-founded Metalheadz with Goldie; Kemistry died in 1999.', ['jungle'], [['founded', 'metalheadz']], ['Kemistry', 'Storm']);
P2('randall', 'Randall', 'london', '1990–', 'AWOL, Mac II', 'AWOL\'s resident; the mixing standard.', ['jungle'], [['played', 'paradise-club']]);
P2('nicky-blackmarket', 'Nicky Blackmarket', 'london', '1988–', 'Blackmarket Records', 'The Soho shop where jungle was sold and the DJ who played it.', ['jungle'], []);
P2('4hero', '4hero', 'london', '1990–', 'Reinforced', 'Dego and Marc Mac; "Mr Kirk\'s Nightmare"; Reinforced; Parallel Universe.', ['jungle', 'rave'], [['founded', 'reinforced'], ['made', 'rec-mrkirk']], ['Dego', 'Marc Mac']);
P2('rob-playford', 'Rob Playford', 'stevenage', '1990–', 'Moving Shadow', 'Founded Moving Shadow; engineered Timeless with Goldie.', ['jungle'], [['founded', 'moving-shadow']]);
P2('omni-trio', 'Omni Trio', 'hertfordshire', '1993–', 'Moving Shadow', 'Rob Haigh; "Renegade Snares": the piano-and-breaks template.', ['jungle'], [['made', 'rec-renegadesnares']]);
P2('bryan-gee', 'Bryan Gee', 'london', '1988–', 'V Recordings, Movement', 'With Jumpin\' Jack Frost; Movement at Bar Rumba.', ['jungle'], [['founded', 'v-recordings']]);
P2('london-elektricity', 'London Elektricity', 'london', '1996–', 'Hospital', 'Tony Colman; Hospital Records and the Hospitality parties.', ['jungle'], [['founded', 'hospital']], ['Tony Colman']);
P2('high-contrast', 'High Contrast', 'cardiff', '2001–', 'Hospital', 'Liquid funk\'s first star; "Return of Forever".', ['jungle'], []);
P2('pendulum', 'Pendulum', 'perth', '2002–', 'Breakbeat Kaos', '"Hold Your Colour" (2005): drum & bass as stadium rock.', ['jungle'], [['made', 'rec-holdyourcolour']]);
P2('chase-status', 'Chase & Status', 'london', '2003–', 'RAM, Mercury', 'The 2010s\' crossover; "Blind Faith".', ['jungle'], []);
P2('noisia', 'Noisia', 'groningen', '2001–2022', 'Vision', 'Neurofunk\'s sound designers.', ['jungle'], []);
P2('nia-archives', 'Nia Archives', 'bradford', '2020–', 'Hijinxx', '"Headz Gone West"; the 2020s jungle revival\'s face.', ['jungle'], [['made', 'rec-headzgonewest']]);
P2('sherelle', 'Sherelle', 'london', '2018–', 'Beautiful, Hooversound', 'Jungle and footwork at 160; the Boiler Room set that went viral.', ['jungle'], []);
P2('adam-f', 'Adam F', 'london', '1994–', 'Metalheadz, Positiva', '"Circles" (1995); drum & bass in the Top 20.', ['jungle'], [['made', 'rec-circles']]);
P2('alex-reece', 'Alex Reece', 'london', '1994–', 'Metalheadz', '"Pulp Fiction" (1995): the two-step beat that became jazzstep, then UK garage\'s cousin.', ['jungle'], [['made', 'rec-pulpfiction']]);
P2('general-levy', 'General Levy', 'london', '1988–', 'MC', '"Incredible" with M-Beat: jungle at No. 8, and the row that followed.', ['jungle'], [['made', 'rec-incredible']]);
P2('stevie-hyper-d', 'Stevie Hyper D', 'london', '1990–98', 'MC', 'The jungle MC\'s template; died 1998.', ['jungle'], []);
P2('krust-die', 'Krust & Die', 'bristol', '1992–', 'Full Cycle, Reprazent', 'Bristol\'s other half; "Warhead" (Krust, 1997).', ['jungle'], [['member', 'full-cycle']]);
/* trance */
P2('paul-van-dyk', 'Paul van Dyk', 'berlin', '1991–', 'MFS, Vandit', 'E-Werk and Dubmission; "For an Angel"; the German trance star.', ['trance'], [['played', 'e-werk'], ['made', 'rec-forangel']]);
P2('cosmic-baby', 'Cosmic Baby', 'berlin', '1991–', 'MFS', 'Harald Blüchel; "Loops of Infinity"; Visions of Shiva with van Dyk.', ['trance'], []);
P2('jam-spoon', 'Jam & Spoon', 'frankfurt', '1991–2006', 'R&S, Dance Pool', 'Jam El Mar and Mark Spoon: "Stella", "Right in the Night", the Age of Love remix.', ['trance'], [['made', 'rec-stella'], ['made', 'rec-ageoflove']], ['Jam El Mar', 'Mark Spoon']);
P2('dance-2-trance', 'Dance 2 Trance', 'frankfurt', '1990–95', 'Logic', 'Dag Lerner and Rolf Ellmer: "We Came in Peace" (1990) named the genre.', ['trance'], [['made', 'rec-wecameinpeace']], ['Dag']);
P2('oliver-lieb', 'Oliver Lieb', 'frankfurt', '1990–', 'Spicelab, LSG', 'Frankfurt trance\'s most prolific producer.', ['trance'], []);
P2('hardfloor', 'Hardfloor', 'cologne', '1991–', 'Harthouse', 'Oliver Bondzio and Ramon Zenker: "Acperience 1" (1992), acid as trance\'s engine.', ['trance', 'techno'], [['made', 'rec-acperience']]);
P2('goa-gil', 'Goa Gil', 'goa', '1969–2023', 'Anjuna beach', 'Gilbert Levey; the full-moon parties; psytrance as ritual.', ['trance'], [['played', 'anjuna']]);
P2('simon-posford', 'Simon Posford', 'london', '1994–', 'Hallucinogen, Shpongle, Twisted', '"LSD" (1995); psytrance\'s best producer.', ['trance'], [['made', 'rec-lsd']], ['Hallucinogen', 'Shpongle']);
P2('raja-ram', 'Raja Ram', 'london', '1969–', 'TIP, Shpongle', 'Ron Rothfield; Quintessence to The Infinity Project to Shpongle.', ['trance'], [['founded', 'tip']]);
P2('youth', 'Youth', 'london', '1979–', 'Dragonfly, Killing Joke', 'Martin Glover; founded Dragonfly and signed Goa trance.', ['trance'], [['founded', 'dragonfly']]);
P2('infected-mushroom', 'Infected Mushroom', 'haifa', '1996–', 'Yoyo, HOMmega', 'Psytrance\'s biggest act.', ['trance'], []);
P2('astral-projection', 'Astral Projection', 'tel-aviv', '1989–', 'Trust in Trance', 'Israel\'s Goa trance pioneers.', ['trance'], []);
P2('juno-reactor', 'Juno Reactor', 'london', '1990–', 'NovaMute', 'Ben Watkins; Goa trance with orchestras and film scores.', ['trance'], []);
P2('tiesto', 'Tiësto', 'breda', '1994–', 'Black Hole, Magik', 'Tijs Verwest; "Adagio for Strings" (2005), the Athens Olympics; then EDM.', ['trance'], [['founded', 'black-hole'], ['made', 'rec-adagio']]);
P2('armin-van-buuren', 'Armin van Buuren', 'leiden', '1995–', 'Armada, A State of Trance', '"Communication" (1999); ASOT since 2001; trance\'s institution.', ['trance'], [['founded', 'armada'], ['made', 'rec-communication']]);
P2('ferry-corsten', 'Ferry Corsten', 'rotterdam', '1991–', 'System F, Gouryella', '"Out of the Blue" (1999); Gouryella with Tiësto.', ['trance'], [['made', 'rec-outoftheblue']], ['System F', 'Gouryella']);
P2('bt', 'BT', 'washington', '1995–', 'Perfecto', 'Brian Transeau; "Flaming June"; the American trance producer.', ['trance'], [['made', 'rec-flamingjune']]);
P2('robert-miles', 'Robert Miles', 'italy', '1995–2017', 'DBX', '"Children" (1995): dream trance, 5 million copies.', ['trance'], [['made', 'rec-children']]);
P2('chicane', 'Chicane', 'london', '1996–', 'Xtravaganza', 'Nick Bracegirdle; "Offshore", "Saltwater".', ['trance'], [['made', 'rec-offshore']]);
P2('john-digweed', 'John Digweed', 'hastings', '1988–', 'Bedrock', 'With Sasha: Renaissance, Northern Exposure, Twilo; progressive\'s architect.', ['trance', 'house'], []);
P2('judge-jules', 'Judge Jules', 'london', '1987–', 'Radio 1, Judgement Sundays', 'Radio 1\'s trance years; Eden in Ibiza.', ['trance'], []);
P2('above-beyond', 'Above & Beyond', 'london', '2000–', 'Anjunabeats', 'Jono Grant, Tony McGuinness, Paavo Siljamäki; "Sun & Moon"; Group Therapy.', ['trance'], [['founded', 'anjunabeats']]);
P2('mark-reeder', 'Mark Reeder', 'berlin', '1978–', 'MFS', 'Mancunian in Berlin; founded MFS; signed Paul van Dyk.', ['trance'], [['founded', 'mfs']]);
P2('scot-project', 'Scot Project', 'frankfurt', '1995–', 'Overdose', 'Frank Zenker; hard trance\'s defining producer.', ['trance'], []);
/* house */
P2('larry-levan', 'Larry Levan', 'newyork', '1977–87', 'Paradise Garage', 'The Garage\'s resident; the sound system and the congregation.', ['house'], [['played', 'paradise-garage']]);
P2('jesse-saunders', 'Jesse Saunders', 'chicago', '1984–', 'Jes Say', '"On and On" (1984): one of the first house records on vinyl.', ['house'], [['made', 'rec-onandon']]);
P2('marshall-jefferson', 'Marshall Jefferson', 'chicago', '1985–', 'Trax', '"Move Your Body" — the House Music Anthem; produced "Acid Tracks".', ['house'], [['made', 'rec-moveyourbody']]);
P2('larry-heard', 'Larry Heard', 'chicago', '1985–', 'Mr. Fingers, Fingers Inc.', '"Can You Feel It" (1986): deep house begins.', ['house'], [['made', 'rec-canyoufeelit']], ['Mr. Fingers']);
P2('steve-silk-hurley', 'Steve "Silk" Hurley', 'chicago', '1985–', 'DJ International', '"Jack Your Body": UK No. 1, January 1987 — house\'s first.', ['house'], [['made', 'rec-jackyourbody']]);
P2('farley-jackmaster-funk', 'Farley "Jackmaster" Funk', 'chicago', '1981–', 'Hot Mix 5, WBMX', '"Love Can\'t Turn Around"; the radio mix show that spread house.', ['house'], [['played', 'wbmx']]);
P2('derrick-carter', 'Derrick Carter', 'chicago', '1988–', 'Classic', 'Chicago\'s second generation; jazz and swing in the house.', ['house'], []);
P2('todd-terry', 'Todd Terry', 'newyork', '1987–', 'Royal House, Black Riot', 'Sample house; "Can You Party"; the New York hard edge.', ['house'], []);
P2('masters-at-work', 'Masters at Work', 'newyork', '1990–', 'MAW, Nervous', 'Louie Vega and Kenny Dope; the 90s New York sound.', ['house'], []);
P2('daft-punk', 'Daft Punk', 'paris', '1993–2021', 'Soma, Virgin, Roulé', 'From Soma\'s "The New Wave" to Homework and the French touch.', ['house', 'techno'], [['made', 'rec-dafunk']]);
P2('leo-mas', 'Leo Mas', 'ibiza', '1984–', 'Amnesia', 'Italian; Alfredo\'s partner on the Amnesia terrace.', ['house'], [['played', 'amnesia']]);
P2('pippi', 'Pippi', 'ibiza', '1980s–', 'Pacha, Ku', 'The island\'s long-serving resident.', ['house'], [['played', 'pacha']]);
P2('tony-wilson', 'Tony Wilson', 'manchester', '1978–2007', 'Factory Records, Haçienda', 'Granada TV presenter, Factory founder, Haçienda\'s owner and loss-maker.', ['house', 'rave'], [['founded', 'hacienda']]);
P2('dj-harvey', 'DJ Harvey', 'london', '1988–', 'Moist, Tonka', 'Tonka sound system; Balearic\'s British keeper.', ['house'], []);
P2('trevor-fung', 'Trevor Fung', 'london', '1980s–', 'Project Club, Ibiza', 'The Ibiza regular who brought Oakenfold out in 1985; the Project Club.', ['house', 'rave'], []);
P2('tony-de-vit', 'Tony De Vit', 'birmingham', '1990–98', 'Trade, TDV', 'Trade\'s resident; hard house\'s founder.', ['house', 'rave'], [['played', 'trade']]);

/* ---------- clubs / places ---------- */
const C2 = (id, name, city, years, blurb, strands, rel = [], aliases = []) => N(id, 'club', name, { city, years, blurb, strands, rel: [['in', city], ...rel], aliases });
C2('blue-note', 'The Blue Note', 'london', '1995–98', 'Hoxton Square; the drum & bass room of the Metalheadz Sunday Sessions.', ['jungle']);
C2('speed', 'Speed', 'london', '1994–96', 'The Mars Bar, Covent Garden; Bukem and Fabio\'s Thursday of atmospheric drum & bass.', ['jungle']);
C2('bar-rumba', 'Bar Rumba (Movement)', 'london', '1993–', 'Opened in September 1993; Bryan Gee\'s Movement made it drum & bass\'s weekly, still running fortnightly at the 2008 relaunch.', ['jungle']);
C2('lakota', 'Lakota', 'bristol', '1989/1992–', 'Bristol\'s jungle and drum & bass room; opened 1989 by Wikipedia\'s account, though the club dates itself from June 1992.', ['jungle']);
C2('gatecrasher', 'Gatecrasher', 'sheffield', '1996–2007', 'The Republic; the "Gatecrasher kids" with their cyber-hair; the home of trance.', ['trance']);
C2('godskitchen', 'Godskitchen', 'birmingham', '1994–', 'The UK\'s trance brand, from the Junction in Cambridge to weekly nights in Northampton from 1996, then Birmingham.', ['trance']);
C2('anjuna', 'Anjuna beach', 'goa', '1970s–', 'The full-moon parties; Goa Gil; where trance went psychedelic.', ['trance']);
C2('trance-energy', 'Trance Energy', 'utrecht', '1999–2013', 'The Jaarbeurs; the Dutch trance arena (as Energy from 2011).', ['trance']);
C2('eden', 'Eden', 'ibiza', '1999–', 'San Antonio; Judge Jules\'s Judgement Sundays.', ['trance', 'house']);
C2('twilo', 'Twilo', 'newyork', '1995–2001', 'Sasha and Digweed\'s monthly; the Phazon sound system.', ['trance', 'house']);
C2('wbmx', 'WBMX', 'chicago', '1980s', 'The Hot Mix 5\'s radio station, which took house to the whole city.', ['house']);
C2('power-plant', 'The Power Plant', 'chicago', '1983–86', 'Frankie Knuckles after the Warehouse.', ['house']);
C2('the-loft', 'The Loft', 'newyork', '1970–', 'David Mancuso\'s invitation-only parties; the root of the Garage.', ['house']);
C2('glorys', 'Glory\'s', 'ibiza', 'c.1975–85', 'On the old Can Bufí greyhound track, open from the mid-1970s alongside Amnesia and Ku.', ['house']);
C2('es-paradis', 'Es Paradís', 'ibiza', '1975–', 'San Antonio\'s pyramid; the water parties.', ['house']);
C2('cafe-mambo', 'Café Mambo', 'ibiza', '1994–', 'The Sunset Strip\'s other bar; Radio 1\'s Ibiza home.', ['house']);
C2('future', 'Future', 'london', '1988', 'Oakenfold\'s Balearic Thursday at Heaven.', ['house', 'rave']);
C2('flying', 'Flying', 'london', '1989–', 'Started at Queens in Slough in 1989 by Brandon Block and Dean Thatcher, promoted and later run by Charlie Chester; Italian house in 1990–91.', ['house']);
C2('milk-bar', 'Milk Bar', 'london', '1990–', 'Nicky Holloway\'s Soho club.', ['house']);
C2('back-to-basics', 'Back to Basics', 'leeds', '1991–', 'Dave Beer\'s night; the longest-running weekly in the UK.', ['house']);
C2('renaissance', 'Renaissance', 'mansfield', '1992–', 'Venue 44; Sasha and Digweed; the progressive house residency.', ['house', 'trance']);
C2('garage-nottingham', 'The Garage', 'nottingham', '1986–', 'Graeme Park\'s first residency.', ['house']);

/* ---------- events ---------- */
const E2 = (id, name, city, years, blurb, strands, rel = []) => N(id, 'event', name, { city, years, blurb, strands, rel: [['in', city], ...rel] });
E2('sun-and-bass', 'Sun and Bass', 'sardinia', '2004–', 'A week of drum & bass on a beach.', ['jungle']);
E2('hospitality', 'Hospitality', 'london', '2000–', 'Hospital Records\' parties; Brixton Academy, Finsbury Park.', ['jungle']);
E2('jungle-fever', 'Jungle Fever', 'london', '1993–', 'The ragga jungle rave brand.', ['jungle']);
E2('telepathy', 'Telepathy', 'london', '1991–', 'East London\'s jungle rave.', ['jungle']);
E2('return-to-source', 'Return to the Source', 'london', '1993–2003', 'The Fridge; Goa trance in Brixton.', ['trance']);
E2('boom', 'Boom Festival', 'portugal', '1997–', 'Psytrance\'s biennial.', ['trance']);
E2('sensation', 'Sensation', 'amsterdam', '2000–', 'The ArenA in white; trance as spectacle.', ['trance']);
E2('asot', 'A State of Trance', 'leiden', '2001–', 'Armin van Buuren\'s radio show and events; ASOT 1000 in 2021.', ['trance']);
E2('disco-demolition', 'Disco Demolition Night', 'chicago', '12 July 1979', 'Comiskey Park; the backlash that sent disco underground and made house necessary.', ['house']);
E2('winter-music-conference', 'Winter Music Conference', 'miami', '1985–', 'The industry\'s March; house\'s trade fair.', ['house']);

/* ---------- records ---------- */
const R2 = (id, artist, title, year, label, strands, blurb, by, genre = null) => N(id, 'record', artist + ' — ' + title, { years: String(year), strands, blurb, rel: [...(label ? [['label', label]] : []), ...(by ? [['by', by]] : []), ...(genre ? [['genre', genre]] : [])], aliases: [title], q: artist + ' ' + title });
R2('rec-mrkirk', '4hero', 'Mr Kirk\'s Nightmare', 1990, 'reinforced', ['rave', 'jungle'], 'Hardcore\'s darkest early record, made from a police phone call and a breakbeat.', '4hero', 'g-hardcore');
R2('rec-renegadesnares', 'Omni Trio', 'Renegade Snares', 1993, 'moving-shadow', ['jungle'], 'Piano and chopped breaks; the template for everything atmospheric.', 'omni-trio', 'g-jungle');
R2('rec-incredible', 'M-Beat feat. General Levy', 'Incredible', 1994, null, ['jungle'], 'UK No. 8; the ragga jungle crossover and the scene\'s backlash against it.', 'general-levy', 'g-raggajungle');
R2('rec-originalnuttah', 'Shy FX & UK Apachi', 'Original Nuttah', 1994, null, ['jungle'], 'Ragga jungle\'s anthem; the rewind record.', 'shy-fx', 'g-raggajungle');
R2('rec-terrorist', 'Renegade', 'Terrorist', 1994, null, ['jungle'], 'Ray Keith\'s dark jungle classic.', 'ray-keith', 'g-jungle');
R2('rec-innercitylife', 'Goldie', 'Inner City Life', 1994, null, ['jungle'], 'The single from Timeless, with Diane Charlemagne\'s vocal; drum & bass as song.', 'goldie', 'g-jungle');
R2('rec-music', 'LTJ Bukem', 'Music', 1993, 'good-looking', ['jungle'], 'Atmospheric drum & bass begins.', 'ltj-bukem', 'g-intelligent');
R2('rec-pulpfiction', 'Alex Reece', 'Pulp Fiction', 1995, 'metalheadz', ['jungle'], 'The two-step break; jazzstep.', 'alex-reece', 'g-intelligent');
R2('rec-circles', 'Adam F', 'Circles', 1995, null, ['jungle'], 'Drum & bass in the Top 20 (1997 reissue).', 'adam-f', 'g-intelligent');
R2('rec-supersharpshooter', 'Ganja Kru', 'Super Sharp Shooter', 1996, 'ganja', ['jungle'], 'Jump-up\'s anthem, from Hype, Zinc and Pascal.', 'dj-hype', 'g-jumpup');
R2('rec-brownpaperbag', 'Roni Size / Reprazent', 'Brown Paper Bag', 1997, null, ['jungle'], 'Double bass, Mercury Prize, drum & bass as album music.', 'roni-size', 'g-jungle');
R2('rec-nitenichiryu', 'Photek', 'Ni Ten Ichi Ryu', 1997, null, ['jungle'], 'Two-sword technique; breaks as calligraphy.', 'photek', 'g-techstep');
R2('rec-wormhole', 'Ed Rush & Optical', 'Wormhole', 1998, 'virus', ['jungle'], 'Techstep\'s album.', 'ed-rush-optical', 'g-techstep');
R2('rec-bodyrock', 'Shimon & Andy C', 'Body Rock', 1999, 'ram', ['jungle'], 'RAM\'s anthem; the dancefloor drum & bass of the 2000s begins.', 'andy-c', 'g-jungle');
R2('rec-thenine', 'Bad Company', 'The Nine', 1998, null, ['jungle'], 'Techstep goes stadium.', null, 'g-techstep');
R2('rec-holdyourcolour', 'Pendulum', 'Hold Your Colour', 2005, null, ['jungle'], 'Drum & bass as rock album; 500,000 sold.', 'pendulum', 'g-jungle');
R2('rec-headzgonewest', 'Nia Archives', 'Headz Gone West', 2021, null, ['jungle'], 'The jungle revival\'s first anthem.', 'nia-archives', 'g-jungle');
R2('rec-breakitoff', 'PinkPantheress', 'Break It Off', 2021, null, ['jungle'], 'Adam F\'s "Circles" sampled for TikTok; jungle at 20 million streams.', null, 'g-jungle');
/* trance */
R2('rec-wecameinpeace', 'Dance 2 Trance', 'We Came in Peace', 1990, null, ['trance'], 'Named the genre.', 'dance-2-trance', 'g-frankfurt-trance');
R2('rec-ageoflove', 'Age of Love', 'The Age of Love (Jam & Spoon mix)', 1992, null, ['trance'], 'The 1990 Belgian record in the remix that became trance\'s founding document.', 'jam-spoon', 'g-frankfurt-trance');
R2('rec-stella', 'Jam & Spoon', 'Stella', 1992, 'rs', ['trance'], 'The trance record on R&S.', 'jam-spoon', 'g-frankfurt-trance');
R2('rec-acperience', 'Hardfloor', 'Acperience 1', 1992, 'harthouse', ['trance', 'techno'], 'Three 303s; acid trance.', 'hardfloor', 'g-frankfurt-trance');
R2('rec-orangetheme', 'Cygnus X', 'The Orange Theme', 1993, 'eye-q', ['trance'], 'Eye Q\'s melody.', null, 'g-frankfurt-trance');
R2('rec-cafedelmar', 'Energy 52', 'Café del Mar', 1993, 'eye-q', ['trance', 'house'], 'The most-remixed trance record; the sunset in a riff.', null, 'g-frankfurt-trance');
R2('rec-forangel', 'Paul van Dyk', 'For an Angel', 1994, 'mfs', ['trance'], 'Berlin\'s trance anthem (1998 remix hit).', 'paul-van-dyk', 'g-uplifting');
R2('rec-children', 'Robert Miles', 'Children', 1995, null, ['trance'], 'Dream trance; five million copies.', 'robert-miles', 'g-uplifting');
R2('rec-lsd', 'Hallucinogen', 'LSD', 1995, 'dragonfly', ['trance'], 'Goa trance at its peak, first released in 1994 as a single with "Alpha Centauri".', 'simon-posford', 'g-goa');
R2('rec-offshore', 'Chicane', 'Offshore', 1996, null, ['trance'], 'Balearic trance.', 'chicane', 'g-uplifting');
R2('rec-flamingjune', 'BT', 'Flaming June', 1997, 'perfecto', ['trance'], 'American trance\'s finest.', 'bt', 'g-uplifting');
R2('rec-binaryfinary', 'Binary Finary', '1998', 1998, null, ['trance'], 'The year as a title; Gatecrasher\'s anthem.', null, 'g-uplifting');
R2('rec-universalnation', 'Push', 'Universal Nation', 1998, null, ['trance'], 'M.I.K.E.\'s Belgian trance.', null, 'g-uplifting');
R2('rec-outoftheblue', 'System F', 'Out of the Blue', 1999, null, ['trance'], 'Ferry Corsten; the Dutch sound arrives.', 'ferry-corsten', 'g-uplifting');
R2('rec-communication', 'Armin van Buuren', 'Communication', 1999, null, ['trance'], 'The breakthrough after "Push" and "Blue Fear"; uplifting trance\'s template.', 'armin-van-buuren', 'g-uplifting');
R2('rec-airwave', 'Rank 1', 'Airwave', 1999, null, ['trance'], 'The Innercity 1999 theme; Rank 1 later wrote Trance Energy\'s themes for 2005 and 2009.', null, 'g-uplifting');
R2('rec-sandstorm', 'Darude', 'Sandstorm', 1999, null, ['trance'], 'Finland; the meme; the biggest-selling trance 12".', null, 'g-uplifting');
R2('rec-adagio', 'Tiësto', 'Adagio for Strings', 2005, 'black-hole', ['trance'], 'Barber at 140; trance\'s peak and its exit.', 'tiesto', 'g-uplifting');
R2('rec-sunandmoon', 'Above & Beyond', 'Sun & Moon', 2011, 'anjunabeats', ['trance'], 'Group Therapy; the 2010s trance anthem.', 'above-beyond', 'g-uplifting');
R2('rec-madagascar', 'Art of Trance', 'Madagascar', 1998, 'platipus', ['trance'], 'British trance\'s classic.', null, 'g-uplifting');
/* house */
R2('rec-onandon', 'Jesse Saunders', 'On and On', 1984, null, ['house'], 'One of the first house records on vinyl.', 'jesse-saunders', 'g-house');
R2('rec-moveyourbody', 'Marshall Jefferson', 'Move Your Body', 1986, 'trax', ['house'], 'The House Music Anthem; the piano.', 'marshall-jefferson', 'g-house');
R2('rec-canyoufeelit', 'Mr. Fingers', 'Can You Feel It', 1986, 'trax', ['house'], 'Deep house begins.', 'larry-heard', 'g-deephouse');
R2('rec-jackyourbody', 'Steve "Silk" Hurley', 'Jack Your Body', 1986, 'dj-international', ['house'], 'House\'s first UK No. 1, in January 1987.', 'steve-silk-hurley', 'g-house');
R2('rec-lovecantturnaround', 'Farley "Jackmaster" Funk', 'Love Can\'t Turn Around', 1986, null, ['house'], 'UK Top 10; Darryl Pandy\'s vocal.', 'farley-jackmaster-funk', 'g-house');
R2('rec-promisedland', 'Joe Smooth', 'Promised Land', 1987, 'dj-international', ['house'], 'House as gospel.', null, 'g-house');
R2('rec-dafunk', 'Daft Punk', 'Da Funk', 1995, 'soma', ['house'], 'French touch\'s first hit.', 'daft-punk', 'g-frenchtouch');
R2('rec-musicsounds', 'Stardust', 'Music Sounds Better with You', 1998, 'roule', ['house'], 'The filtered disco loop perfected.', null, 'g-frenchtouch');
R2('rec-rip-groove', 'Double 99', 'RIP Groove', 1997, null, ['house', 'rave'], 'Speed garage\'s anthem.', null, 'g-ukgarage');
R2('rec-gabriel', 'Roy Davis Jr. feat. Peven Everett', 'Gabriel', 1996, null, ['house'], 'The Chicago record that became UK garage\'s template.', null, 'g-ukgarage');

/* ---------- sets ---------- */
const SET2 = (id, title, city, years, blurb, strands, rel = []) => N(id, 'set', title, { city, years, blurb, strands, rel: [['in', city], ...rel] });
SET2('set-metalheadz', 'Metalheadz Sunday Sessions at the Blue Note', 'london', '1995–98', 'Goldie\'s label night, in the room where drum & bass found its sound and its crowd.', ['jungle'], [['at', 'blue-note']]);
SET2('set-speed', 'Bukem & Fabio at Speed', 'london', '1995–96', 'A midweek night from 1995 where atmospheric drum & bass was worked out in a small room; sources differ on the venue.', ['jungle'], [['at', 'speed']]);
SET2('set-oakenfold-goa', 'Paul Oakenfold — The Goa Mix', 'london', '1994', 'The Radio 1 Essential Mix that took Goa trance to a national audience; it was already in UK clubs.', ['trance']);
SET2('set-tiesto-athens', 'Tiësto at the Athens Olympics', 'athens', '2004', 'Trance\'s global moment, with a DJ at the opening ceremony.', ['trance']);
SET2('set-knuckles-warehouse', 'Frankie Knuckles at the Warehouse', 'chicago', '1977–82', 'Disco edits on reel-to-reel over a drum machine; the residency that named a music.', ['house'], [['at', 'warehouse']]);
SET2('set-alfredo', 'Alfredo at Amnesia', 'ibiza', 'c.1983–89', 'Sunrise to midday (6am to noon in 1984, from 3am in 1985), no genre, the terrace open to the sky.', ['house'], [['at', 'amnesia']]);
SET2('set-sasha-digweed', 'Sasha & Digweed — Northern Exposure / Twilo', 'newyork', '1996–2001', 'Progressive as a journey, in the monthly at Twilo and the mixes.', ['trance', 'house'], [['at', 'twilo']]);

/* ---------- shops, press, sound systems, the law ---------- */
const SHOP = (id, name, city, years, blurb, strands, aliases = []) => N(id, 'shop', name, { city, years, blurb, strands, rel: city ? [['in', city]] : [], aliases });
const PRESS = (id, name, city, years, blurb, strands, aliases = []) => N(id, 'press', name, { city, years, blurb, strands, rel: city ? [['in', city]] : [], aliases });
const SOUND = (id, name, city, years, blurb, strands, aliases = []) => N(id, 'sound', name, { city, years, blurb, strands, rel: city ? [['in', city]] : [], aliases });
const LAW = (id, name, city, years, blurb, strands, aliases = []) => N(id, 'law', name, { city, years, blurb, strands, rel: city ? [['in', city]] : [], aliases });

// record shops
SHOP('shop-importes', 'Importes Etc.', 'chicago', '1979–', 'The shop where Frankie Knuckles\'s Warehouse records were sold under a sign that said "house music"; one origin of the word.', ['house'], ['Imports Etc']);
SHOP('shop-grammaphone', 'Gramaphone Records', 'chicago', '1969–', 'Chicago\'s dance shop on North Clark Street: Derrick Carter and Mark Farina behind the counter.', ['house']);
SHOP('shop-buy-rite', 'Buy-Rite Records', 'detroit', '1980s', 'Mike Banks and Jeff Mills\'s Detroit shop stop, where the first UR records were sold over the counter.', ['techno']);
SHOP('shop-record-time', 'Record Time', 'detroit', '1983–2011', 'Roseville, Michigan: the back room where Detroit\'s second wave bought their imports; Plus 8 and Transmat in the racks.', ['techno']);
SHOP('shop-vinyl-mania', 'Vinyl Mania', 'newyork', '1978–2007', 'Carmine Street: Larry Levan\'s record shop, where Garage records went on sale the Monday after he played them.', ['house']);
SHOP('shop-black-market', 'Black Market Records', 'london', '1988–2015', 'D\'Arblay Street, Soho: the house upstairs, the jungle basement with Nicky Blackmarket and Ray Keith behind the counter.', ['jungle', 'house', 'rave'], ['BM Soho', 'Blackmarket']);
SHOP('shop-fat-cat', 'Fat Cat Records', 'london', '1989–97', 'Covent Garden: the techno shop where Dave Clarke, Richie Hawtin and Andrew Weatherall dug; a label from 1997.', ['techno']);
SHOP('shop-eastern-bloc', 'Eastern Bloc', 'manchester', '1985–', 'Afflecks Palace then Oldham Street: Manchester\'s dance shop, the source of 808 State and the Creed label.', ['house', 'rave']);
SHOP('shop-spin-inn', 'Spin Inn', 'manchester', '1970s–', 'Manchester\'s import shop where Mike Pickering and Graeme Park bought the Chicago records they played at the Haçienda.', ['house']);
SHOP('shop-warp', 'Warp Records (shop)', 'sheffield', '1989–', 'The Division Street shop that became the label: Rob Mitchell and Steve Beckett behind the counter.', ['techno', 'rave']);
SHOP('shop-fon', 'FON Records', 'sheffield', '1986–89', 'Sheffield\'s shop and studio before Warp, where the bleep records were sold and some were made.', ['techno']);
SHOP('shop-de-underground', 'De Underground Records', 'london', '1991–96', 'Forest Gate: the Aymer brothers\' shop (Uncle 22 and Randall), hardcore and jungle\'s east London counter.', ['jungle', 'rave']);
SHOP('shop-lucky-spin', 'Lucky Spin', 'london', '1990s', 'Jumpin\' Jack Frost\'s shop and label in the jungle years.', ['jungle']);
SHOP('shop-boogie-times', 'Boogie Times', 'london', '1990–98', 'Romford: Danny Donnelly\'s shop and Suburban Base label, hardcore and jungle\'s Essex end.', ['rave', 'jungle']);
SHOP('shop-unity', 'Unity Records', 'london', '1990s', 'Soho: the shop under the Unity FM crew; hardcore and jungle twelves by the box.', ['jungle', 'rave']);
SHOP('shop-hard-wax', 'Hard Wax', 'berlin', '1989–', 'Mark Ernestus\'s Kreuzberg shop: Basic Channel\'s counter, the source of Berlin\'s techno and dub taste, still open.', ['techno']);
SHOP('shop-delirium', 'Delirium Records', 'frankfurt', '1988–', 'Frankfurt\'s techno shop, the counter behind the city\'s 1990s scene.', ['techno', 'trance']);
SHOP('shop-rush-hour', 'Rush Hour', 'amsterdam', '1997–', 'Amsterdam\'s shop, label and distributor; the Dutch techno and house counter since 1997.', ['techno', 'house']);
SHOP('shop-clone', 'Clone', 'rotterdam', '1993–', 'Serge Verschuur\'s Rotterdam shop and label.', ['techno']);
SHOP('shop-pure-groove', 'Pure Groove', 'london', '1989–2010', 'The UK garage counter where the two-step white labels went first, from a Camden stall in 1988 to Holloway Road and then Smithfield.', ['house']);
SHOP('shop-rough-trade', 'Rough Trade', 'london', '1976–', 'Not a dance shop, but by i-D\'s account Rough Trade stocked the rave-era dance twelve-inches for a different crowd.', ['techno']);
SHOP('shop-phonica', 'Phonica', 'london', '2003–', 'Poland Street, Soho: the dance shop of the 2000s and 2010s, still open where Black Market and the rest closed.', ['techno', 'house']);
SHOP('shop-idle-hands', 'Idle Hands', 'bristol', '2011–', 'Bristol\'s shop and label on City Road, by Stokes Croft; dubstep\'s and techno\'s counter in the 2010s.', ['jungle', 'techno']);
SHOP('shop-juno', 'Juno Records', 'london', '1996–', 'The online shop that replaced the counter for most of the world, with the distributor-sized catalogue of the 2000s.', ['techno', 'house', 'trance', 'jungle']);
SHOP('shop-discogs', 'Discogs', null, '2000–', 'The database that became the marketplace: every pressing catalogued by its users, and the second-hand record trade moved online.', ['techno', 'house']);

// press
PRESS('press-face', 'The Face', 'london', '1980–2004', 'The style monthly that put acid house on its cover in 1988 and made the smiley a national symbol.', ['rave', 'house']);
PRESS('press-ID', 'i-D', 'london', '1980–', 'Terry Jones\'s straight-up fashion magazine; its club pages and the early rave reporting.', ['rave', 'house']);
PRESS('press-nme', 'NME', 'london', '1952–2018', 'Reported acid house as a moral panic and then as a movement; the 1988 "Summer of Love" coverage.', ['rave']);
PRESS('press-mixmag', 'Mixmag', 'london', '1983–', 'From DMC\'s DJ newsletter to the biggest dance monthly in the world; the cover-mount CDs and the DJ of the Year.', ['house', 'techno', 'trance']);
PRESS('press-djmag', 'DJ Mag', 'london', '1991–', 'The Top 100 DJs poll, since 1993, that made and measured the superstar DJ.', ['trance', 'house', 'techno']);
PRESS('press-muzik', 'Muzik', 'london', '1995–2003', 'IPC\'s dance monthly: the Muzik Awards, the serious long reads of the superclub years.', ['house', 'techno', 'trance']);
PRESS('press-jockey-slut', 'Jockey Slut', 'manchester', '1993–2004', 'Manchester\'s fanzine turned magazine, the funny, knowledgeable voice of the 1990s underground.', ['house', 'techno']);
PRESS('press-knowledge', 'Knowledge', 'london', '1994–2008', 'Drum & bass\'s own magazine, from Colin Steven\'s Brixton bedroom to the newsstand.', ['jungle']);
PRESS('press-generator', 'Generator', 'london', '1990s', 'The techno and trance monthly of the mid-1990s; the Megadog and Tribal Gathering years in print.', ['trance', 'techno']);
PRESS('press-eternity', 'Eternity', 'london', '1993–98', 'The hardcore and happy hardcore magazine, the rave scene reporting on itself after the press moved on.', ['rave']);
PRESS('press-wire', 'The Wire', 'london', '1982–', 'The experimental monthly that took techno seriously as music in the 1990s; Kodwo Eshun and Simon Reynolds\'s writing.', ['techno']);
PRESS('press-frontpage', 'Frontpage', 'berlin', '1989–97', 'Berlin\'s free techno magazine: the Love Parade\'s house journal, Tresor and the Mayday years.', ['techno']);
PRESS('press-groove', 'Groove', 'berlin', '1989–', 'Germany\'s longest-running dance magazine, from Frankfurt to Berlin.', ['techno', 'trance']);
PRESS('press-ra', 'Resident Advisor', 'london', '2001–', 'Started in Sydney in 2001, the website that replaced the magazines: listings, reviews, the RA podcast and the ticketing business.', ['techno', 'house']);
PRESS('press-fact', 'FACT', 'london', '2003–', 'The free magazine turned website, and the FACT mix series.', ['jungle', 'techno']);
PRESS('press-boiler-room', 'Boiler Room (broadcast)', 'london', '2010–', 'A webcam in a London room in 2010 that became the dance world\'s television.', ['techno', 'house']);
PRESS('press-energy-flash', 'Energy Flash (Simon Reynolds)', null, '1998', 'Reynolds\'s book on rave culture, revised 2008 and 2013, and the history that most later histories, this one included, argue with.', ['rave', 'techno', 'jungle']);
PRESS('press-last-night', 'Last Night a DJ Saved My Life', null, '1999', 'Brewster and Broughton\'s history of the DJ; with "Altered State" and "Adventures in Wonderland" the shelf behind this book.', ['house', 'techno']);

// sound systems and engineers
SOUND('sound-richard-long', 'Richard Long & Associates', 'newyork', '1970s–86', 'The Paradise Garage system designer: the Levan horns, the bass array, the sound the whole genre was built to be played on.', ['house'], ['Richard Long']);
SOUND('sound-alex-rosner', 'Alex Rosner', 'newyork', '1960s–', 'Rosie\'s mixer for Francis Grasso and the Loft systems; the engineer who gave the DJ a cue button.', ['house']);
SOUND('sound-turbosound', 'Turbosound', 'london', '1978–', 'Tony Andrews and John Newsham\'s company: the Glastonbury rig, the Haçienda\'s system, Funktion-One\'s parent.', ['rave', 'house']);
SOUND('sound-tony-andrews', 'Tony Andrews', 'london', '1970s–', 'The engineer behind Turbosound and Funktion-One: horn-loading, the Resolution series, the systems of Space and Berghain.', ['techno', 'house']);
SOUND('sound-jah-shaka', 'Jah Shaka Sound System', 'london', '1970s–', 'The south London dub sound system whose bass taught the jungle producers what a room could do.', ['jungle']);
SOUND('sound-spiral-tribe-rig', 'The Spiral Tribe rig', 'london', '1990–', 'The free party sound system: the Castlemorton rig, impounded after the Criminal Justice Act, rebuilt in France.', ['rave']);
SOUND('sound-bedlam', 'Bedlam Sound System', 'london', '1990–', 'The free party crew whose rig stood beside Spiral Tribe\'s at Castlemorton; a decade of unlicensed parties.', ['rave']);
SOUND('sound-desert-storm', 'Desert Storm Sound System', 'glasgow', '1992–', 'Glasgow\'s free party crew that drove a rig to Bosnia during the war and to Castlemorton before it.', ['rave']);
SOUND('sound-void', 'Void Acoustics', null, '1999–', 'Rog Mogale\'s company from Poole, Dorset, behind the Incubus and Air systems of the 2010s; its first club system went into a Blackpool club.', ['techno', 'house']);
SOUND('sound-martin-audio', 'Martin Audio', 'london', '1971–', 'Dave Martin\'s company: the Ministry of Sound\'s original system and the Pink Floyd rigs before it.', ['house']);
SOUND('sound-kirsch', 'Kirsch Audio', 'berlin', '2000s–', 'The Berlin firm behind Berghain\'s Funktion-One install and the room\'s tuning.', ['techno']);
SOUND('sound-despacio', 'Despacio', null, '2013–', 'James Murphy and 2manydjs\' seven-stack McIntosh system, the audiophile dance floor as an idea.', ['house']);

// drugs, policy and the law
LAW('law-mdma', 'MDMA', null, '1912 / 1985–', 'Synthesised by Merck in 1912, used in therapy in the 1970s, banned in the US in 1985 and Britain in 1977; the drug the music is inseparable from.', ['rave', 'house'], ['Ecstasy', 'E']);
LAW('law-misuse', 'Misuse of Drugs Act 1971', 'london', '1971', 'The Act that classifies MDMA as Class A; the framework every later policy argument has been held inside.', ['rave']);
LAW('law-bright-bill', 'Entertainments (Increased Penalties) Act 1990', 'london', '1990', 'Graham Bright\'s private member\'s bill: £20,000 fines and six months for unlicensed parties, and a large part of why the orbital raves moved into licensed clubs.', ['rave'], ['Bright Bill']);
LAW('law-pay-party-unit', 'The Pay Party Unit', 'kent', '1988–90', 'Kent Police\'s unit against the orbital raves, run by Chief Superintendent Ken Tappenden from Dartford and then Gravesend.', ['rave']);
LAW('law-leah-betts', 'Leah Betts', null, '1995', 'The eighteen-year-old whose death after taking ecstasy at her birthday party became the "Sorted" billboard campaign and the decade\'s moral panic.', ['rave']);
LAW('law-safer-dancing', 'Safer dancing and harm reduction', 'manchester', '1990s–', 'Lifeline\'s Peanut Pete leaflets, the Safer Dancing guidelines, free water and chill-out rooms; the policy response that worked.', ['rave', 'house']);
LAW('law-licensing-2003', 'Licensing Act 2003', 'london', '2003–05', 'Flexible licensing hours for pubs and clubs alike, in force from November 2005; the club trade argued it eroded what had made late-night venues distinct.', ['house', 'techno']);
LAW('law-form-696', 'Form 696', 'london', '2005–17', 'The Met\'s risk-assessment form that asked promoters for the audience\'s ethnicity until 2008–09; blamed for closing grime and garage nights, scrapped in 2017.', ['house', 'jungle']);
LAW('law-fabric-closure', 'The fabric closure, 2016', 'london', '2016', 'Islington revoked fabric\'s licence after two deaths; the campaign, a crowdfund of over £330,000 and the reopening in January 2017 under new conditions.', ['techno', 'house']);
LAW('law-night-czar', 'The Night Czar and the night-time economy', 'london', '2016–', 'Amy Lamé, London\'s first Night Czar (2016), and the Night Time Commission. The post lapsed after 2024; City Hall proposed a Nightlife Commission instead (2026).', ['techno', 'house']);
LAW('law-agent-of-change', 'Agent of Change', 'london', '2018', 'The planning principle that makes developers, not venues, responsible for soundproofing: from the 2017 housing white paper into the planning framework in 2018, with the Ministry of Sound\'s Eileen House settlement as an early precedent.', ['house']);
LAW('law-the-loop', 'The Loop', 'manchester', '2013–', 'Fiona Measham\'s drug-checking charity, which ran the first front-of-house testing at a UK festival, Secret Garden Party 2016.', ['rave', 'techno']);
LAW('law-covid', 'Covid closures, 2020–21', 'london', '2020–21', 'Clubs in England shut from March 2020 to 19 July 2021, with Scotland, Wales and Northern Ireland on their own timetables; the Night Time Industries Association\'s count of what did not reopen.', ['techno', 'house']);
LAW('law-psychoactive', 'Psychoactive Substances Act 2016', 'london', '2016', 'The blanket ban on "legal highs" and nitrous oxide\'s long road to a 2023 ban.', ['rave']);
LAW('law-cja-link', 'The Criminal Justice and Public Order Act (see the rave strand)', 'london', '1994', 'Section 63 and "repetitive beats": the law strand\'s central event is told in the rave strand.', ['rave']);

/* ---------- Ibiza: the island strand's new nodes (blurbs checked by research) ---------- */
const IB = (id, type, title, years, blurb, strands, rel = [], aliases = [], city = 'ibiza') => N(id, type, title, { city, years, blurb, strands, rel: city ? [['in', city], ...rel] : rel, aliases });
// rooms
IB('ushuaia', 'club', 'Ushuaïa Ibiza', '2011–', 'The open-air hotel club on Platja d\'en Bossa, with daytime main-stage dance music for the 2010s island.', ['house', 'techno']);
IB('hi-ibiza', 'club', 'Hï Ibiza', '2017–', 'The club that opened in Space\'s former building in 2017, across the road from Ushuaïa.', ['house', 'techno'], [], ['Hi Ibiza']);
IB('unvrs', 'club', 'UNVRS', '2025–', 'The vast new club that opened in 2025 on the site of Ku and Privilege.', ['house', 'techno'], [], ['Universe']);
IB('pikes', 'club', 'Pikes', '1978–', 'Tony Pike\'s hotel in the hills above Sant Antoni, famous for its private parties, with a club room of its own.', ['house'], [], ['Pikes Hotel', 'Pikes Ibiza']);
// nights
IB('manumission', 'event', 'Manumission', '1994–', 'The theatrical Monday night at Ku and then Privilege, the biggest club in the world; the 1990s island as spectacle.', ['house', 'rave']);
IB('circoloco', 'event', 'Circoloco', '1999–', 'DC10\'s Monday, the after-party beside the airport that became the island\'s underground institution.', ['house', 'techno'], [['at', 'dc10']]);
IB('we-love', 'event', 'We Love… Sundays at Space', '2000s–2016', 'Space\'s Sunday, terrace and main room, until the club closed.', ['house'], [['at', 'space']], ['We Love Space', 'We Love Sundays']);
IB('enter-ibiza', 'event', 'Enter.', '2012–', 'Richie Hawtin\'s Thursday at Space: techno, sake and a light show.', ['techno'], [['at', 'space']], ['Enter']);
IB('music-on', 'event', 'Music On', '2012–', 'Marco Carola\'s night at Amnesia.', ['techno', 'house'], [['at', 'amnesia']]);
IB('paradise-ibiza', 'event', 'Paradise', '2010–', 'Jamie Jones\'s night at DC10.', ['house', 'techno'], [['at', 'dc10']], ['Paradise Ibiza']);
IB('glitterbox', 'event', 'Glitterbox', '2014–', 'Defected\'s disco and house night.', ['house']);
IB('afterlife-ibiza', 'event', 'Afterlife', '2016–', 'Tale Of Us\'s melodic techno night.', ['techno'], [], ['Afterlife Ibiza']);
IB('solomun-plus1', 'event', 'Solomun +1', '2015–', 'Solomun\'s Sunday at Pacha.', ['house', 'techno'], [['at', 'pacha']], ['Solomun + 1']);
IB('cream-ibiza', 'event', 'Cream Ibiza', '1990s–', 'The Liverpool superclub\'s Ibiza nights.', ['house', 'trance'], [['at', 'amnesia']]);
IB('ibiza-uncovered', 'press', 'Ibiza Uncovered', '1997–', 'The Sky One documentary series that showed Britain the clubbers\' island.', ['house', 'rave'], [], [], null);
// people
IB('ricardo-urgell', 'person', 'Ricardo Urgell', '1967–', 'Pacha — Founded it in Sitges and then, from 1973, in Ibiza.', ['house'], [['founded', 'pacha']]);
IB('pepe-rosello', 'person', 'Pepe Roselló', '1989–2016', 'Space — The owner.', ['house', 'techno'], [['founded', 'space']], ['Pepe Rosello']);
IB('tony-pike', 'person', 'Tony Pike', '1978–', 'Pikes — The Australian who built it.', ['house'], [['founded', 'pikes']]);
IB('marco-carola', 'person', 'Marco Carola', '1990s–', 'Music On — Neapolitan techno DJ and producer, behind the night at Amnesia.', ['techno'], [['founded', 'music-on']], [], 'italy');
IB('jamie-jones', 'person', 'Jamie Jones', '2000s–', 'Hot Creations — Welsh house DJ and producer; Paradise at DC10.', ['house'], [['founded', 'paradise-ibiza']], [], null);
IB('solomun', 'person', 'Solomun', '2000s–', 'Diynamic, Solomun +1 — Hamburg DJ and producer.', ['house', 'techno'], [['founded', 'solomun-plus1']], [], 'hamburg');
IB('tale-of-us', 'person', 'Tale Of Us', '2008–', 'Afterlife — Carmine Conte and Matteo Milleri.', ['techno'], [['founded', 'afterlife-ibiza']], [], 'italy');
IB('loco-dice', 'person', 'Loco Dice', '2000s–', 'Desolat — Düsseldorf DJ; a DC10 and Ibiza fixture.', ['house', 'techno'], [['played', 'dc10']], [], 'dusseldorf');
IB('luciano', 'person', 'Luciano', '2000s–', 'Cadenza — Chilean-Swiss DJ and producer; an Ibiza resident of the minimal years.', ['techno', 'house'], [], [], null);
IB('brandon-block', 'person', 'Brandon Block', '1980s–', 'Flying, Space\'s terrace — The British DJ of the 1990s Ibiza season.', ['house'], [['played', 'space']], [], 'london');
IB('erick-morillo', 'person', 'Erick Morillo', '1990s–2020', 'Subliminal Records — Subliminal Sessions at Pacha.', ['house'], [['played', 'pacha']], [], 'newyork');
// records
R2('rec-suenolatino', 'Sueño Latino', 'Sueño Latino', 1989, null, ['house'], 'Italian Balearic house built on Manuel Göttsching\'s "E2-E4".', null, 'g-balearic');
R2('rec-insomnia', 'Faithless', 'Insomnia', 1995, null, ['house', 'trance'], 'An Ibiza anthem of the superclub years.', null, 'g-progressive');
R2('rec-groovejet', 'Spiller', 'Groovejet (If This Ain\'t Love)', 2000, null, ['house'], 'Disco house from the island to number one.', null, 'g-frenchtouch');
R2('rec-momentsinlove', 'Art of Noise', 'Moments in Love', 1983, null, ['house'], 'A Balearic staple from Alfredo\'s Amnesia.', null, 'g-balearic');

/* ---------- Goa: the beach strand's new nodes (blurbs checked by research) ---------- */
const GO = (id, type, title, years, blurb, strands, rel = [], aliases = [], city = 'goa') => N(id, type, title, { city, years, blurb, strands, rel: city ? [['in', city], ...rel] : rel, aliases });
GO('hilltop', 'club', 'Hilltop', '1980s–', 'The open-air venue on a Vagator hill, home of parties since the Goa trance years.', ['trance'], [], ['Hilltop Vagator']);
GO('nine-bar', 'club', 'Nine Bar', '1990s–', 'The clifftop bar above Vagator beach where the sunset was played in trance.', ['trance'], [], ['9 Bar']);
GO('shiva-valley', 'club', 'Shiva Valley', '1990s–', 'The beach-shack party spot at the end of Anjuna.', ['trance']);
GO('disco-valley', 'club', 'Disco Valley', '1990s', 'The valley behind Vagator beach that held the big outdoor parties.', ['trance']);
GO('paradiso', 'club', 'Paradiso', '2000s–', 'The large Anjuna club built for the indoor era.', ['trance'], [], ['Club Paradiso']);
GO('curlies', 'club', 'Curlies', '1980s–', 'The Anjuna beach shack at the heart of the daytime scene.', ['trance']);
GO('goa-full-moon', 'event', 'Goa full-moon parties', '1980s–90s', 'All-night parties on the beaches and in the hills, timed to the full moon and the Christmas season.', ['trance'], [], ['full moon parties']);
GO('sunburn', 'event', 'Sunburn', '2007–', 'India\'s big commercial dance festival, born on the Goa beaches.', ['trance', 'house'], [], ['Sunburn Festival']);
GO('ozora', 'event', 'Ozora', '2004–', 'The Hungarian psytrance festival that grew out of the 1999 eclipse party.', ['trance'], [], ['O.Z.O.R.A.'], 'everywhere');
GO('universo-paralello', 'event', 'Universo Paralello', '2000–', 'Brazil\'s New Year psytrance festival.', ['trance'], [], [], 'everywhere');
GO('rainbow-serpent', 'event', 'Rainbow Serpent', '1998–', 'The Australian psytrance and electronic festival in Victoria.', ['trance'], [], [], 'everywhere');
GO('laurent', 'person', 'Laurent', '1980s', 'Goa parties — The French DJ credited with first playing electronic music there.', ['trance']);
GO('fred-disko', 'person', 'Fred Disko', '1980s–', 'Goa parties — One of the first DJs to shape their sound.', ['trance']);
GO('eight-finger-eddie', 'person', 'Eight Finger Eddie', '1960s–2010', 'Anjuna — The American who arrived in the 1960s; the flea market and the first parties grew around him.', ['trance'], [], ['Eddie Wozny']);
GO('man-with-no-name', 'person', 'Man With No Name', '1990s–', 'Dragonfly — Martin Freeland, Goa trance producer.', ['trance'], [], ['Martin Freeland'], 'london');
GO('doof', 'person', 'Doof', '1990s–', 'TIP, Dragonfly — Nick Barber, Goa trance producer.', ['trance'], [], ['Nick Barber'], 'london');
GO('tsuyoshi-suzuki', 'person', 'Tsuyoshi Suzuki', '1990s–', 'Matsuri Productions, Prana — Japanese DJ and producer.', ['trance'], [], [], 'tokyo');
GO('flying-rhino', 'label', 'Flying Rhino', '1994–', 'British psytrance label of the mid-1990s.', ['trance'], [], [], 'london');
GO('blue-room', 'label', 'Blue Room Released', '1994–', 'British label for Goa trance and its edges.', ['trance'], [], ['Blue Room'], 'london');
GO('matsuri', 'label', 'Matsuri Productions', '1990s–', 'Tsuyoshi Suzuki\'s label, linking Goa, London and Tokyo.', ['trance'], [], ['Matsuri'], 'london');
GO('law-goa-ban', 'law', 'The Goa noise ban', '2000–', 'Limits on amplified music outdoors after 10pm, enforced in Goa from 2000, which moved the beach parties indoors or ended them.', ['trance']);
R2('rec-junglehigh', 'Juno Reactor', 'Jungle High', 1993, null, ['trance'], 'An early Goa trance classic.', 'juno-reactor', 'g-goa');
R2('rec-teleport', 'Man With No Name', 'Teleport', 1993, 'dragonfly', ['trance'], 'Goa trance on Dragonfly.', 'man-with-no-name', 'g-goa');
R2('rec-peoplecanfly', 'Astral Projection', 'People Can Fly', 1995, null, ['trance'], 'Israeli Goa trance.', 'astral-projection', 'g-goa');
R2('rec-bustamove', 'Infected Mushroom', 'Bust a Move', 2003, null, ['trance'], 'Psytrance into the 2000s.', 'infected-mushroom', 'g-goa');

/* ---------- the place strands: new nodes (written from the researchers' facts files by graph5_build.py) ---------- */
N("back-to-the-future", "event", "Back to the Future", { city: "london", years: "1989–90", blurb: "Dave Roberts's 1989 party series, run alongside Sunrise: grain silos in Hampshire that April, then a joint festival with Sunrise at Longwick in August.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: [] });
N("freedom-to-party", "event", "Freedom to Party", { city: "london", years: "1989–90", blurb: "The orbital promoters' campaign against the rave crackdown and Graham Bright's bill: launched October 1989, rallies in London in January and March 1990.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: [] });
N("paul-staines", "person", "Paul Staines", { city: "london", years: "1988–90", blurb: "Libertarian who handled publicity for Tony Colston-Hayter's Sunrise parties and helped launch the Freedom to Party campaign in 1989.", strands: ["rave", "m25"], rel: [["in", "london"], ["member", "sunrise"], ["member", "freedom-to-party"], ["member", "tony-colston-hayter"]], aliases: ["Guido Fawkes (blog name, 2004–)"] });
N("ken-tappenden", "person", "Ken Tappenden", { city: "kent", years: "1988–91", blurb: "Kent Police chief superintendent who set up the Pay Party Unit and by 1989 co-ordinated the national police response to the orbital raves.", strands: ["rave", "m25"], rel: [["in", "kent"], ["member", "law-pay-party-unit"]], aliases: [] });
N("graham-bright", "person", "Graham Bright", { city: "london", years: "1990", blurb: "Conservative MP for Luton South (1983–97) whose private member's bill became the Entertainments (Increased Penalties) Act 1990.", strands: ["rave", "m25"], rel: [["in", "london"], ["member", "law-bright-bill"]], aliases: ["Sir Graham Bright"] });
N("wayne-anthony", "person", "Wayne Anthony", { city: "london", years: "1988–", blurb: "Co-founder of the Genesis warehouse parties (1988–90), Freedom to Party speaker and author of the memoir Class of 88.", strands: ["rave", "m25"], rel: [["in", "london"], ["member", "genesis"]], aliases: [] });
N("press-acid-tabloids", "press", "The tabloids and acid house, 1988–89", { city: "london", years: "1988–90", blurb: "How the Sun went from selling smiley T-shirts in October 1988 to 'Evils of Ecstasy' a week later, and led the press campaign against the raves until 1990.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: [] });
N("rec-frenchkiss", "record", "Lil Louis — French Kiss", { city: "chicago", years: "1989", blurb: "Lil Louis's Chicago record that slows to a stop and restarts over one note; a UK No. 2 in August 1989, at the height of the orbital summer.", strands: ["rave", "m25"], rel: [["in", "chicago"]], aliases: ["French Kiss"] });
N("rec-weallcall", "record", "D Mob — We Call It Acieed", { city: "london", years: "1988", blurb: "Danny D's October 1988 hit with Gary Haisman's chant: UK No. 3, on Top of the Pops on 20 October, then dropped from BBC playlists in the tabloid backlash.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: ["We Call It Acieed"] });
N("apocalypse-now", "event", "Apocalypse Now", { city: "london", years: "1988", blurb: "Tony Colston-Hayter's 1988 studio parties in London, sold as private events and filmed by TV news; the commercial model that became Sunrise.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: [] });
N("rec-rideontime", "record", "Black Box — Ride On Time", { city: "london", years: "1989", blurb: "Italian piano-house record on a sampled Loleatta Holloway vocal; a rave favourite before six weeks at No. 1 and the UK's best-selling single of 1989.", strands: ["rave", "m25"], rel: [["in", "london"]], aliases: ["Ride On Time"] });
N("westbam", "person", "WestBam", { city: "berlin", years: "1983–", blurb: "Münster-born Berlin DJ and producer, co-founder of Low Spirit and Mayday, who played every Love Parade 1989–2008 and co-wrote its anthems with Dr. Motte.", strands: ["techno", "lovepar"], rel: [["in", "berlin"], ["member", "love-parade"], ["member", "mayday"], ["member", "low-spirit"], ["member", "dr-motte"]], aliases: ["Maximilian Lenz", "Frank Xerox", "Westbam/ML", "Members of Mayday (with Klaus Jankuhn)", "Westbam and the Love Committee", "Westbam"] });
N("danielle-de-picciotto", "person", "Danielle de Picciotto", { city: "berlin", years: "1987–", blurb: "American-born Berlin artist and musician who co-founded the Love Parade with Dr. Motte in 1989, handling its visual side, and left it within a few years.", strands: ["techno", "lovepar"], rel: [["in", "berlin"], ["member", "love-parade"], ["member", "dr-motte"]], aliases: [] });
N("low-spirit", "label", "Low Spirit", { city: "berlin", years: "1985–2007", blurb: "Berlin label founded in 1985 by Westbam and four partners: home of Marusha, Members of Mayday and the Love Parade anthems, and the team behind Mayday.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: [] });
N("fuckparade", "event", "Fuckparade", { city: "berlin", years: "1997–", blurb: "Berlin's yearly counter-demonstration to the Love Parade, started as the Hateparade in 1997 for gabber and hardcore; a court confirmed it as a demo in 2007.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: [] });
N("rave-the-planet", "event", "Rave The Planet", { city: "berlin", years: "2022–", blurb: "Dr. Motte's yearly Berlin techno demonstration since 2022, run by a non-profit company, whose campaign won techno heritage status in 2024.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: [] });
N("lp-duisburg", "event", "Love Parade disaster, Duisburg 2010", { city: null, years: "2010", blurb: "The crowd crush at the Love Parade in Duisburg on 24 July 2010 that killed 21 and ended the parade; the trial closed in 2020 without a verdict.", strands: ["techno", "lovepar"], rel: [], aliases: [] });
N("rainer-schaller", "person", "Rainer Schaller", { city: null, years: "2006–10", blurb: "Founder of the McFit gym chain, whose company Lopavent owned and ran the Love Parade from 2006, took it to the Ruhr and organised Duisburg 2010.", strands: ["techno", "lovepar"], rel: [["member", "love-parade"], ["member", "lp-duisburg"]], aliases: [] });
N("rec-sunshine", "record", "Dr. Motte & Westbam — Sunshine", { city: "berlin", years: "1997", blurb: "The official anthem of the 1997 Love Parade, Dr. Motte and Westbam's first and most successful: No. 5 in Germany, on Low Spirit.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: ["Sunshine"] });
N("rec-oneworld", "record", "Dr. Motte & Westbam — One World One Future", { city: "berlin", years: "1998", blurb: "The 1998 Love Parade anthem, issued as Love Parade 1998 (One World One Future) on Low Spirit/BMG; No. 6 in Germany, 14 weeks on the chart.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: ["One World One Future"] });
N("lp-abroad", "event", "Love Parades abroad", { city: "berlin", years: "1994–2009", blurb: "The Love Parade's copies and spin-offs outside Germany, 1994–2009: Melbourne, Buenos Aires, Radio 1's Leeds parade of 2000, San Francisco, Santiago.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: [] });
N("rec-klangderfamilie", "record", "3 Phase feat. Dr. Motte — Der Klang der Familie", { city: "berlin", years: "1992", blurb: "Sven Röhrig's 1992 Tresor record with Dr. Motte, the sixth Tresor release, an early Berlin club hit listed as the 1992 Love Parade anthem.", strands: ["techno", "lovepar"], rel: [["in", "berlin"]], aliases: ["Der Klang der Familie"] });

/* new pages from the missing-pages research (Nov 2026) */
N("pete-tong", "person", "Pete Tong", {"years": "1979–", "city": "london", "strands": ["house", "rave"], "blurb": "Radio 1's Friday-night dance presenter since 1991 and host of the Essential Mix since 1993; earlier a London Records A&R man who compiled early Chicago house.", "rel": [["in", "london"], ["played", "essential-mix"], ["in", "ibiza"]], "aliases": []});
N("kenny-ken", "person", "Kenny Ken", {"years": "1989–", "city": "london", "strands": ["jungle", "rave"], "blurb": "London jungle DJ: original AWOL resident at the Paradise Club from 1992, winner of the first Jungle Sound Clash (1994), \"Everyman\", Kiss 100 show 1994–97.", "rel": [["in", "london"], ["played", "awol"], ["played", "paradise-club"]], "aliases": []});
N("ron-trent", "person", "Ron Trent", {"years": "1990–", "city": "chicago", "strands": ["house"], "blurb": "Chicago DJ and producer: \"Altered States\" (1990), made as a teenager; Prescription with Chez Damier from 1993; Future Vision; the live band WARM (2022).", "rel": [["in", "chicago"], ["label", "kms"]], "aliases": []});
N("john-acquaviva", "person", "John Acquaviva", {"years": "late 1970s–", "city": "detroit", "strands": ["techno"], "blurb": "Italian-born Ontario DJ who co-founded Plus 8 with Richie Hawtin (first release 1990), ran Definitive, championed Final Scratch and helped found Beatport.", "rel": [["in", "detroit"], ["label", "plus8"], ["uses", "finalscratch"], ["uses", "mp3-beatport"]], "aliases": []});
N("theo-parrish", "person", "Theo Parrish", {"years": "1995–", "city": "detroit", "strands": ["house", "techno"], "blurb": "Washington-born, Chicago-raised Detroit DJ and producer: trained as a sound sculptor, founded Sound Signature in 1997, known for long, EQ-heavy sets.", "rel": [["in", "detroit"]], "aliases": []});
N("claude-young", "person", "Claude Young", {"years": "1992–", "city": "detroit", "strands": ["techno"], "blurb": "Detroit second-wave DJ and producer: Dow and Utensil labels (1993), a DJ-Kicks mix, Soft Thru on Elypsia (1997), Different World; retired from DJing in 2023.", "rel": [["in", "detroit"]], "aliases": []});
N("ian-st-paul", "person", "Ian St Paul", {"years": "1987–1990s", "city": "london", "strands": ["house", "ibiza"], "blurb": "Trevor Fung's cousin and Paul Oakenfold's partner: on the 1987 Ibiza trip, then the promoter who started Future and Spectrum; later in Goa trance with TIP.", "rel": [["in", "london"], ["played", "spectrum"], ["played", "future"], ["in", "ibiza"]], "aliases": ["Ian St. Paul"]});
N("david-morales", "person", "David Morales", {"years": "1981–", "city": "newyork", "strands": ["house"], "blurb": "Brooklyn DJ and remixer: the Paradise Garage at 21, the Red Zone from 1989, Def Mix with Frankie Knuckles, Grammy Remixer of the Year 1998, The Face.", "rel": [["in", "newyork"], ["played", "paradise-garage"]], "aliases": []});
N("tony-humphries", "person", "Tony Humphries", {"years": "1981–", "city": "newyork", "strands": ["house"], "blurb": "Brooklyn-born DJ of the Jersey garage sound: Club Zanzibar in Newark from 1982, Kiss FM mix shows until 1994, then the first Ministry of Sound Sessions mix.", "rel": [["in", "newyork"]], "aliases": []});
N("roger-sanchez", "person", "Roger Sanchez", {"years": "1990–", "city": "newyork", "strands": ["house"], "blurb": "Queens-raised house DJ and producer: Strictly Rhythm records from 1990, a Grammy-winning remix, the UK number one \"Another Chance\" (2001) and Release Yourself.", "rel": [["in", "newyork"], ["played", "cream"], ["played", "cafe-mambo"]], "aliases": []});
N("chez-damier", "person", "Chez Damier", {"years": "1988–c.1996, 2004–", "city": "detroit", "strands": ["house", "techno"], "blurb": "Chicago-born deep house DJ and producer: co-founder of Detroit's Music Institute (1988), KMS label manager, then Prescription and Balance with Ron Trent.", "rel": [["in", "detroit"], ["label", "kms"]], "aliases": []});
N("kid-paul", "person", "Kid Paul", {"years": "1988–95", "city": "berlin", "strands": ["techno"], "blurb": "Berlin DJ Paul Schmitz-Moormann: at UFO aged thirteen, Dubmission resident with Paul van Dyk, co-producer of Energy 52's \"Café del Mar\" (1993).", "rel": [["in", "berlin"], ["played", "ufo"], ["played", "love-parade"], ["played", "e-werk"]], "aliases": []});
N("simon-reynolds", "person", "Simon Reynolds", {"years": "1984–", "city": "london", "strands": ["rave", "jungle", "techno"], "blurb": "London-born critic whose Energy Flash (1998) is a history of rave and its offshoots, and who framed British dance music as the hardcore continuum.", "rel": [["in", "london"], ["made", "rec-energyflash"]], "aliases": []});
N("essential-mix", "station", "Essential Mix", {"years": "1993–", "city": "london", "strands": ["house", "techno", "rave"], "blurb": "BBC Radio 1's weekly two-hour guest mix, devised by producer Eddie Gordon and presented by Pete Tong since the first show on 30 October 1993.", "rel": [["in", "london"]], "aliases": ["the Essential Mix", "Radio 1's Essential Mix"]});
N("ade", "event", "Amsterdam Dance Event", {"years": "1996–", "city": "amsterdam", "strands": ["techno", "house"], "blurb": "Amsterdam's five-day October conference and club festival, begun in 1996 as a trade meeting; in 2025 it drew a record 600,000 visitors to 300 venues.", "rel": [["in", "amsterdam"], ["played", "awakenings"], ["played", "dekmantel"]], "aliases": ["ADE", "Amsterdam Dance Event"]});
N("sandwell-district", "label", "Sandwell District", {"years": "2002–11, 2023–", "city": "birmingham", "strands": ["techno"], "blurb": "Techno label and collective founded in Birmingham in 2002 by Regis and Female; joined by Function and Silent Servant, it ended in 2011 and returned in 2023.", "rel": [["in", "birmingham"], ["from", "downwards"]], "aliases": ["Sandwell District"]});
N("xl-recordings", "label", "XL Recordings", {"years": "1989–", "city": "london", "strands": ["rave"], "blurb": "London label begun in 1989 as an imprint of Beggars Banquet's Citybeat: The Prodigy, SL2 and T99 first, then Dizzee Rascal, Adele and Radiohead.", "rel": [["in", "london"]], "aliases": ["XL Recordings"]});
N("chain-reaction", "label", "Chain Reaction", {"years": "1995–2003", "city": "berlin", "strands": ["techno"], "blurb": "Basic Channel's Berlin sister label, 1995–2003: dub techno from Porter Ricks, Monolake, Fluxion and Vladislav Delay, its CDs packed in metal cans.", "rel": [["in", "berlin"]], "aliases": ["Chain Reaction"]});
N("bad-mice", "person", "2 Bad Mice", {"years": "1991–95, 2010–", "city": "hertfordshire", "strands": ["rave", "jungle"], "blurb": "2 Bad Mice: Hertford breakbeat hardcore act of Sean O'Keeffe, Simon Colebrooke and Rob Playford on Moving Shadow; \"Bombscare\" (1992) charted again in 1996.", "rel": [["in", "hertfordshire"], ["label", "moving-shadow"]], "aliases": []});
N("british-murder-boys", "person", "British Murder Boys", {"years": "2002–13, 2016–", "city": "birmingham", "strands": ["techno"], "blurb": "Regis and Surgeon's duo, formed in 2002: industrial techno 12-inches, a staged Tokyo farewell in 2013, a 2016 return and a first studio album in 2024.", "rel": [["in", "birmingham"], ["label", "downwards"]], "aliases": ["British Murder Boys"]});
N("sound-factory", "club", "Sound Factory", {"years": "1989–1995", "city": "newyork", "strands": ["house"], "blurb": "Chelsea warehouse club at 530 West 27th Street (1989–95) where Junior Vasquez played all-morning sets to a ballroom crowd; the building became Twilo.", "rel": [["in", "newyork"], ["played", "twilo"]], "aliases": ["the Sound Factory"]});
NODE_PUSH_REL("pete-tong", ["played", "essential-mix"]);
NODE_PUSH_REL("regis", ["label", "sandwell-district"]);
NODE_PUSH_REL("the-prodigy", ["label", "xl-recordings"]);
NODE_PUSH_REL("slipmatt", ["label", "xl-recordings"]);
NODE_PUSH_REL("the-prodigy", ["label", "xl-recordings"]);
NODE_PUSH_REL("basic-channel", ["label", "chain-reaction"]);
NODE_PUSH_REL("frankie-knuckles", ["played", "sound-factory"]);

/* ---------- the technology route: machines, software, formats ---------- */
/* [id, title, years, kind, blurb, strands, preset, rel, aliases, era(k1..k5)] */
const TECH = [
 ['tr606', 'Roland TR-606 Drumatix', '1981–84', 'drum machine', 'The 303\'s companion: a cheap analogue drum box with a sync socket. Its hi-hats are the sound of early Chicago and of acid.', ['house', 'techno'], 'Chicago acid 1987', [], ['TR-606', '606'], 'k1'],
 ['tr707', 'Roland TR-707', '1985', 'drum machine', 'Sampled drums in a plastic box: the clap and snare of a hundred Chicago jack tracks, Mr. Fingers and Farley among them.', ['house'], 'Chicago house 1986', [], ['TR-707', '707'], 'k1'],
 ['juno60', 'Roland Juno-60 / Juno-106', '1982–86', 'polysynth', 'The warm, cheap polysynth with the chorus button: the pads of deep house and, per Roland, the bassline of "Can You Feel It".', ['house', 'techno'], 'Chicago house 1986', [['uses', 'rec-canyoufeelit']], ['Juno-60', 'Juno-106', 'Juno'], 'k1'],
 ['alpha-juno', 'Roland Alpha Juno', '1985–87', 'polysynth', 'An unloved budget synth until its "WhatThe" patch — detuned saws, a chorus and a pitch sweep — became the hoover on "Mentasm", the loudest sound in rave.', ['rave', 'techno'], 'Mentasm, 1991', [], ['Alpha Juno', 'the hoover', 'hoover'], 'k1'],
 ['sh101', 'Roland SH-101', '1982–86', 'monosynth', 'A mono synth with an arpeggiator and sequencer that could be slung round the neck; a cheap bassline machine for hardcore and techno once the 303 got expensive.', ['rave', 'techno'], 'UK rave 1991', [], ['SH-101'], 'k1'],
 ['jupiter8', 'Roland Jupiter-8', '1981', 'polysynth', 'The expensive one: Duran Duran\'s and Frankie Goes to Hollywood\'s synth, sampled into house from records rather than played.', ['house'], null, [], ['Jupiter-8'], 'k1'],
 ['mc202', 'Roland MC-202 / MC-4', '1981–83', 'sequencer', 'Roland\'s step sequencers: notes, gates and accents typed in one at a time — the way the boxes were programmed before the computer.', ['techno'], null, [], ['MC-202'], 'k1'],
 ['korg-ms', 'Korg MS-10 / MS-20', '1978', 'monosynth', 'Juan Atkins\'s first synthesiser, bought for him by his grandmother in 1979: the semi-modular Korg whose filter screams.', ['techno'], 'No UFO\'s, 1985', [], ['MS-10', 'MS-20'], 'k1'],
 ['korg-m1', 'Korg M1', '1988', 'workstation', 'The piano and organ of house: the M1\'s Organ 2 is the bassline of "Show Me Love" and a decade of Italian and UK house, its Piano 16\' the 1990s garage piano.', ['house'], 'Chicago house 1986', [], ['M1'], 'k2'],
 ['dx7', 'Yamaha DX7 / DX100', '1983–85', 'FM synth', 'Digital FM: the electric piano and the bells of the 80s, and FM basses on its cheaper cousins — "Lately Bass" is a TX81Z preset of 1987, the DX100\'s nearest is "Solid Bass".', ['techno', 'house'], null, [], ['DX7', 'DX100'], 'k1'],
 ['casio-cz', 'Casio CZ-5000 / CZ-101', '1985', 'phase-distortion synth', 'A Casio home keyboard whose detuned patch became the "reese": Kevin Saunderson\'s "Just Want Another Chance" bassline, later jungle\'s and drum & bass\'s signature.', ['techno', 'jungle'], 'Wormhole, 1998', [], ['CZ-5000', 'CZ-101', 'reese'], 'k1'],
 ['minimoog', 'Minimoog', '1970', 'monosynth', 'Bob Moog\'s portable: the bass of Parliament and the lead of Kraftwerk\'s "Autobahn" — the sound Detroit grew up on.', ['techno'], null, [['uses', 'rec-autobahn']], ['Moog'], 'k1'],
 ['arp2600', 'ARP 2600 / Odyssey', '1971–72', 'semi-modular', 'The other American synth: Herbie Hancock, Stevie Wonder, and the sawtooth leads of early electro.', ['techno'], null, [], ['ARP'], 'k1'],
 ['emulator', 'E-mu Emulator / Fairlight CMI', '1979–81', 'sampler', 'The first samplers, priced like houses. On "Planet Rock" the Kraftwerk parts were replayed by hand; the Fairlight supplied the stock orchestra hit, explosion and claps.', ['techno', 'house'], null, [['uses', 'rec-planetrock']], ['Fairlight', 'Emulator'], 'k2'],
 ['sp1200', 'E-mu SP-1200', '1987', 'sampling drum machine', 'Ten seconds of 12-bit sampling: hip-hop\'s machine, and the grit under early hardcore and Todd Terry\'s house.', ['house', 'rave'], null, [], ['SP-1200'], 'k2'],
 ['akai-s900', 'Akai S900 / S950', '1986–88', 'sampler', 'The first affordable rack sampler: "Voodoo Ray" and a large share of the breakbeat hardcore that followed were cut on S900s and S950s. The S950\'s timestretch was the crude first version.', ['house', 'rave'], 'UK rave 1991', [['uses', 'rec-voodooray']], ['S900', 'S950'], 'k2'],
 ['akai-s1000', 'Akai S1000', '1988', 'sampler', 'Stereo, CD-quality, and a timestretch that could slow a vocal without lowering it: the smear that became jungle\'s signature. ("Terminator" itself was pitch-shifted through an Eventide H3000, by 4hero\'s account; the S1000 put the stretching trick in every bedroom.)', ['jungle', 'rave'], 'Jungle 1994', [['uses', 'rec-terminator']], ['S1000', 'S1100', 'S3000'], 'k2'],
 ['mpc', 'Akai MPC60 / MPC3000', '1988–94', 'sampling sequencer', 'Roger Linn\'s pads and swing: hip-hop\'s instrument, and the swing setting that house and later UK garage borrowed for their shuffle.', ['house'], 'UK garage 1998', [], ['MPC'], 'k2'],
 ['atari-cubase', 'Atari ST + Cubase / Notator', '1985–92', 'computer sequencer', 'A home computer with MIDI sockets built in: the bedroom studio\'s brain from 1988 to the mid-90s, running Steinberg Cubase or C-Lab Notator with every machine on this page hanging off it.', ['techno', 'house', 'rave', 'jungle'], null, [], ['Atari ST', 'Cubase', 'Notator'], 'k2'],
 ['technics', 'Technics SL-1200', '1972–2010', 'turntable', 'The direct-drive deck with the pitch fader: the DJ\'s instrument for forty years, discontinued in 2010 and revived in 2016. Two of them and a mixer are the Mixer strand\'s premise.', ['techno', 'house', 'rave', 'jungle', 'trance'], null, [], ['SL-1200', 'SL-1210', '1210s'], 'k1'],
 ['funktion-one', 'Funktion-One', '1992', 'sound system', 'Tony Andrews\'s horn-loaded system, from Turbosound: Berghain, Space, fabric\'s rooms, Glastonbury\'s stages — the sound of the 2000s and 2010s club.', ['techno', 'house'], null, [], ['Funktion One'], 'k3'],
 ['jp8000', 'Roland JP-8000', '1996', 'virtual-analogue synth', 'The supersaw: seven detuned saws in one oscillator, and trance\'s lead from the late 1990s on.', ['trance', 'techno'], 'Trance 1999', [], ['JP-8000', 'supersaw'], 'k3'],
 ['nord-lead', 'Clavia Nord Lead', '1995', 'virtual-analogue synth', 'The red keyboard that gave "virtual analogue" its name — Clavia coined the term: digital models of analogue circuits, the lead and stab of the late 1990s.', ['trance', 'techno'], null, [], ['Nord Lead', 'Nord'], 'k3'],
 ['access-virus', 'Access Virus', '1997', 'virtual-analogue synth', 'A German virtual-analogue that became a studio workhorse of trance and techno from the late 1990s.', ['trance', 'techno'], 'Trance 1999', [], ['Virus'], 'k3'],
 ['bass-station', 'Novation Bass Station', '1993', 'monosynth', 'A British 303-and-101 substitute; the bass of drum & bass and of acid techno when the originals got expensive.', ['jungle', 'techno'], 'Acid techno 1994', [], ['Bass Station'], 'k3'],
 ['cubase-vst', 'Cubase VST / Logic / Pro Tools', '1996', 'software', 'Audio inside the computer: from 1996 the whole track could live on a PC or Mac, with plug-ins instead of boxes. The hardware era ends here.', ['techno', 'house', 'trance'], null, [], ['Cubase VST', 'Logic', 'Pro Tools'], 'k3'],
 ['fl-studio', 'FruityLoops / FL Studio', '1997', 'software', 'A Belgian step sequencer for Windows that became the first DAW of a generation: hardstyle, jump-up, half of the 2010s\' chart producers.', ['rave', 'jungle', 'trance'], null, [], ['FruityLoops', 'FL Studio'], 'k4'],
 ['reason', 'Propellerhead Reason / ReBirth', '1997–2000', 'software', 'ReBirth (1997) was a 303, an 808 and a 909 on a screen; Reason (2000) was a rack of them. The bedroom studio without the bedroom.', ['techno', 'house'], 'Chicago acid 1987', [], ['Reason', 'ReBirth'], 'k4'],
 ['cdj1000', 'Pioneer CDJ-1000', '2001', 'CD deck', 'The first CD player that felt like a turntable; by 2005 the booth standard, by 2010 the only thing in most booths. The CDJ-2000 (2009) made USB sticks the record box.', ['techno', 'house', 'trance'], null, [], ['CDJ', 'CDJ-1000', 'CDJ-2000'], 'k4'],
 ['final-scratch', 'Final Scratch / Traktor / Serato', '2001–04', 'DJ software', 'Timecode vinyl: Richie Hawtin\'s DE9 was the demonstration, Serato the hip-hop standard, Traktor the techno one. The laptop enters the booth.', ['techno'], null, [['uses', 'set-de9']], ['Traktor', 'Serato', 'Final Scratch'], 'k4'],
 ['ableton', 'Ableton Live', '2001', 'software', 'Written in Berlin by Monolake\'s Robert Henke and Gerhard Behles: a sequencer that could be played live, and the reason minimal\'s decade and every laptop set since sounded the way it did.', ['techno', 'house'], 'Minimal 2004', [], ['Ableton', 'Live'], 'k4'],
 ['xone92', 'Allen & Heath Xone:92', '2003', 'DJ mixer', 'The four-band techno mixer with the two filters: Berghain\'s booth and Hawtin\'s before the Model 1.', ['techno'], null, [], ['Xone:92', 'Xone'], 'k4'],
 ['mp3-beatport', 'MP3, Beatport, SoundCloud', '2004–08', 'format', 'The record shop moves online: Beatport (2004), SoundCloud (2007), Discogs for the past; the 12-inch survives as an object.', ['techno', 'house'], null, [], ['Beatport', 'SoundCloud', 'MP3'], 'k4'],
 ['elektron', 'Elektron Machinedrum / Octatrack', '2001–11', 'hardware groovebox', 'Swedish boxes that brought hardware back: the Octatrack is the live techno set of the 2010s, Surgeon\'s and Blawan\'s among them.', ['techno'], 'Industrial 2018', [], ['Octatrack', 'Machinedrum', 'Elektron'], 'k5'],
 ['eurorack', 'Eurorack modular', '1996–', 'modular synth', 'Doepfer\'s A-100 format (1996) became, after 2010, the modular revival: patch cables on stage, Surgeon\'s and Rrose\'s live rigs, the hypnotic lineage\'s instrument.', ['techno'], 'Hypnotic 2015', [], ['modular', 'Eurorack'], 'k5'],
 ['tr8', 'Roland TR-8 / TR-8S', '2014–18', 'drum machine', 'Roland\'s own digital remake of the 808 and 909 (the Aira line), followed by the Boutique TB-03 and TR-09; the originals\' sound at a tenth of the price.', ['techno', 'house'], 'Hard techno 2023', [], ['TR-8', 'TR-8S'], 'k5'],
 ['behringer', 'Behringer clones', '2017–', 'drum machine', 'The RD-8, TD-3 and Model D: exact copies of the 808, 303 and Minimoog for less than a night out. The machines of 1982 became the machines of 2020.', ['techno', 'house', 'rave'], 'Chicago acid 1987', [], ['RD-8', 'TD-3'], 'k5'],
 ['model1', 'PLAYdifferently Model 1', '2016', 'DJ mixer', 'Richie Hawtin and Andy Rigby-Jones\'s mixer with no EQ: filters and drive instead. The Mixer strand\'s console borrows its idea.', ['techno'], null, [], ['Model 1'], 'k5'],
 ['streaming', 'Boiler Room and the stream', '2010–', 'format', 'A webcam in a Dalston warehouse (2010), then the most-watched DJ sets in history: Sherelle, Kraviz, Dekmantel\'s stages. The set as a record.', ['techno', 'jungle', 'house'], null, [], ['Boiler Room', 'stream'], 'k5'],
 ['web-audio', 'Web Audio and the browser', '2011–', 'software', 'The synthesiser inside the web page. This book\'s engine is one: every kick, 303 and hoover here is generated in your browser from the same ideas as the machines above.', ['techno'], 'Detroit 1988', [], ['Web Audio'], 'k5']
];
TECH.forEach(([id, t, y, kind, b, s, preset, rel, aliases, era]) => { const ex = NODES.find(n => n.id === id) || (id === 'final-scratch' ? NODES.find(n => n.id === 'finalscratch') : null); if (ex){ ex.kind = ex.kind || kind; ex.era = ex.era || era; if (preset && !ex.preset) ex.preset = preset; ex.aliases = [...new Set([...(ex.aliases || []), ...aliases])]; rel.forEach(([r, target]) => { if (r === 'uses' && NODES.some(x => x.id === target)) NODE_PUSH_REL(target, ['uses', ex.id]); }); return; } const n = N(id, 'machine', t, { years: y, blurb: kind.charAt(0).toUpperCase() + kind.slice(1) + ' — ' + b, strands: s, rel: [], aliases }); n.kind = kind; n.era = era; if (preset) n.preset = preset; rel.forEach(([r, target]) => { if (r === 'uses' && NODES.some(x => x.id === target)) NODE_PUSH_REL(target, ['uses', id]); }); });
/* eras and presets for the machines that already existed */
[['tr808', 'k1', 'drum machine', 'Chicago house 1986'], ['tb303', 'k1', 'bass synth', 'Chicago acid 1987'], ['tr909', 'k1', 'drum machine', 'Detroit 1988'], ['moog', 'k1', 'modular synth', null], ['sampler', 'k2', 'sampler', 'UK rave 1991']].forEach(([id, era, kind, preset]) => { const n = NODES.find(x => x.id === id); if (n){ n.era = era; n.kind = kind; if (preset && !n.preset) n.preset = preset; } });
/* records → machines (only where the book is confident) */
/* genres → their machines */
[['g-acidhouse', ['tb303', 'tr808']], ['g-detroit', ['tr909']], ['g-hardcore', ['akai-s900', 'alpha-juno']], ['g-jungle', ['akai-s1000']], ['g-trance', ['jp8000']], ['g-minimal', ['ableton', 'xone92']], ['g-acidtek', ['tb303', 'tr909', 'bass-station']], ['g-house', ['korg-m1']], ['g-techstep', ['casio-cz']], ['g-hard', ['behringer']], ['g-hypnotic', ['eurorack']]].forEach(([g, ms]) => ms.forEach(m => { if (NODES.some(n => n.id === g) && NODES.some(n => n.id === m)) NODE_PUSH_REL(g, ['uses', m]); }));

/* revised one-line summaries for nodes whose blurb is assembled from parts (text pass, Nov 2026) */
;(() => { const F = {
"kenny-larkin": "Warp, Art of Dance — Second-wave Detroit, with \"Azimuth\" (1994).",
"sven-vath": "Omen, Harthouse, Cocoon — Papa Sven, from trance's birth at Omen to two decades of Cocoon Ibiza.",
"joey-beltram": "R&S — \"Energy Flash\" and \"Mentasm\", the hoover and the rave in two records.",
"alfredo": "Amnesia — Alfredo Fiorito, Argentine, whose no-genre nights on the Amnesia terrace, midnight to dawn, were the Balearic beat.",
"nicky-holloway": "The Trip, Milk Bar — The Trip at the Astoria (June 1988) put acid house on Charing Cross Road.",
"charlie-chester": "Flying — Balearic into acid house in the late 80s.",
"ratpack": "Evenson Allen & Lipmaster Mark — The MC-and-DJ rave duo behind \"Searchin' for My Rizla\".",
"dj-hype": "Ganja Records, Fantasy FM, Kiss — From hardcore scratching on Fantasy FM to jungle's first wave; \"The Bee\".",
"ltj-bukem": "Good Looking — Jungle's atmospheric side in \"Demon's Theme\" and \"Music\"; Speed at the Mars Bar.",
"a-guy-called-gerald": "808 State, Juice Box — \"Voodoo Ray\" (house) and \"28 Gun Bad Boy\" (jungle) make him the one person on every strand.",
"808-state": "Graham Massey, Martin Price — Made \"Pacific State\" (1989), acid house and techno from Eastern Bloc records.",
"orbital": "Phil & Paul Hartnoll — The band named after the M25; \"Chime\" (1989) came a year after police beat Paul at a Sevenoaks rave.",
"jeremy-deller": "artist — Took rave seriously in \"Acid Brass\", \"The History of the World\" and \"Everybody in the Place\" (2018).",
"michael-teufele": "Ostgut, Berghain — The owners, from Snax to Ostgut and Berghain.",
"terry-francis": "Wiggle, fabric — Wiggle with Nathan Coles (1994–); fabric's resident from the first night; tech-house's name on the door.",
"ed-rush-optical": "Virus — Made \"Wormhole\" (1998), techstep's defining album.",
"photek": "Photek Productions, Science — Rupert Parkes; \"Ni Ten Ichi Ryu\" has the most intricate breaks ever cut.",
"shy-fx": "Digital Soundboy — Made ragga jungle's anthem, \"Original Nuttah\", with UK Apachi.",
"4hero": "Reinforced — Dego and Marc Mac; \"Mr Kirk's Nightmare\" and Parallel Universe.",
"omni-trio": "Moving Shadow — Rob Haigh, whose \"Renegade Snares\" set the piano-and-breaks template.",
"pendulum": "Breakbeat Kaos — Drum & bass as stadium rock on \"Hold Your Colour\" (2005).",
"alex-reece": "Metalheadz — \"Pulp Fiction\" (1995) brought the two-step beat that became jazzstep, then UK garage's cousin.",
"general-levy": "MC — \"Incredible\" with M-Beat took jungle to No. 8, and a row followed.",
"astral-projection": "Trust in Trance — One of Israel's first Goa trance acts.",
"robert-miles": "DBX — \"Children\" (1995), the dream trance hit that sold 5 million copies.",
"jesse-saunders": "Jes Say — \"On and On\" (1984), one of the first house records on vinyl.",
"marshall-jefferson": "Trax — \"Move Your Body\", the House Music Anthem; produced \"Acid Tracks\".",
"larry-heard": "Mr. Fingers, Fingers Inc. — Deep house begins with \"Can You Feel It\" (1986).",
"steve-silk-hurley": "DJ International — \"Jack Your Body\" became house's first UK No. 1, in January 1987.",
"tr606": "Drum machine — The 303's companion, a cheap analogue drum box with a sync socket; its hi-hats are the sound of early Chicago and of acid.",
"tr707": "Drum machine — Sampled drums in a plastic box, and the clap and snare of a hundred Chicago jack tracks, Mr. Fingers and Farley among them.",
"juno60": "Polysynth — The warm, cheap polysynth with the chorus button, behind the pads of deep house and, per Roland, the bassline of \"Can You Feel It\".",
"alpha-juno": "Polysynth — An unloved budget synth until its \"WhatThe\" patch of detuned saws, chorus and pitch sweep became the hoover on \"Mentasm\", the loudest sound in rave.",
"sh101": "Monosynth — Arpeggiator and sequencer in a body that could be slung round the neck; a cheap bassline machine for hardcore and techno once the 303 got expensive.",
"jupiter8": "Polysynth — The expensive one, Duran Duran's and Frankie Goes to Hollywood's synth, sampled into house from records rather than played.",
"mc202": "Sequencer — Roland's step sequencers, with notes, gates and accents typed in one at a time, the way the boxes were programmed before the computer.",
"korg-ms": "Monosynth — The semi-modular Korg whose filter screams; Juan Atkins's first synthesiser, bought for him by his grandmother in 1979.",
"korg-m1": "Workstation — The M1, house's piano and organ: Organ 2 is the bassline of \"Show Me Love\" and a decade of Italian and UK house, Piano 16' the 1990s garage piano.",
"dx7": "FM synth — Digital electric piano and bells of the 80s. Its cheaper cousins did FM bass: \"Lately Bass\" is a 1987 TX81Z preset, the DX100's nearest \"Solid Bass\".",
"minimoog": "Monosynth — Bob Moog's portable; the bass of Parliament and the lead of Kraftwerk's \"Autobahn\", the sound Detroit grew up on.",
"emulator": "Sampler — The first samplers, priced like houses. \"Planet Rock\" replayed Kraftwerk by hand but took the Fairlight's stock orchestra hit, explosion and claps.",
"sp1200": "Sampling drum machine — Ten seconds of 12-bit sampling; hip-hop's machine, and the grit under early hardcore and Todd Terry's house.",
"akai-s900": "Sampler — The first affordable rack sampler: S900s and S950s cut \"Voodoo Ray\" and much breakbeat hardcore after it; the S950 had the first, crude timestretch.",
"mpc": "Sampling sequencer — Roger Linn's pads and swing; hip-hop's instrument, and the swing setting that house and later UK garage borrowed for their shuffle.",
"funktion-one": "Sound system — Tony Andrews's horn-loaded system, from Turbosound: Berghain, Space, fabric's rooms, Glastonbury's stages; the sound of the 2000s and 2010s club.",
"nord-lead": "Virtual-analogue synth — The red keyboard from Clavia, who coined \"virtual analogue\": digital models of analogue circuits, the lead and stab of the late 1990s.",
"cdj1000": "CD deck — The first one that felt like a turntable: booth standard by 2005, alone in most booths by 2010. The CDJ-2000 (2009) made USB sticks the record box.",
"xone92": "DJ mixer — The four-band techno mixer with the two filters, in Berghain's booth and Hawtin's before the Model 1.",
"tr8": "Drum machine — Roland's own digital remake of the 808 and 909 (the Aira line), then the Boutique TB-03 and TR-09; the originals' sound at a tenth of the price.",
"behringer": "Drum machine — The RD-8, TD-3 and Model D copy the 808, 303 and Minimoog exactly for less than a night out. The machines of 1982 became the machines of 2020.",
"web-audio": "Software — The synthesiser inside the web page. This book's engine is one, generating every kick, 303 and hoover in your browser from the machines' own ideas."
}; NODES.forEach(n => { if (F[n.id]) n.blurb = F[n.id]; }); })();

/* corrections from the research passes: one-liners, spans, names; a page folded into another is removed */
;(() => { const F = {"ushuaia": {"blurb": "Palladium's open-air hotel club on Platja d'en Bossa, opened 2011: daytime shows from Guetta, Garrix and Avicii, and the seed of Hï Ibiza and UNVRS.", "years": "2011–"}, "hi-ibiza": {"blurb": "The Night League's club in Space's old Platja d'en Bossa building, opened May 2017; voted world number one by DJ Mag readers from 2022 to 2025.", "years": "2017–"}, "unvrs": {"blurb": "The Night League's 'hyperclub' on the old Ku and Privilege site near Sant Rafel, opened May 2025 with a different residency every night of the week.", "years": "2025–", "aliases": []}, "pikes": {"blurb": "Tony Pike's farmhouse hotel outside Sant Antoni, opened 1980: Wham!'s pool, Freddie Mercury's party, and since the Ibiza Rocks takeover a DJs' retreat.", "years": "1980–"}, "manumission": {"blurb": "The McKays' theatrical Monday at Ku, then Privilege: 8,000–10,000 people, stage shows and the Motel, from 1994 until it ended at Amnesia in 2008.", "years": "1994–2008"}, "circoloco": {"blurb": "Antonio Carbonaro and Andrea Pelino's Monday at DC10 since 1999: a free morning after-party that grew into a global brand with its own label.", "years": "1999–"}, "we-love": {"blurb": "Space's Sunday party, grown from Darren Hughes's Home and programmed by Mark and Sarah Broadbent: terrace and club, until it left for Sankeys in 2015.", "years": "1999–2014"}, "enter-ibiza": {"blurb": "Richie Hawtin's Thursday at Space, 2012–15: his first solo Ibiza residency, with themed rooms, a sake bar and new lighting in the main room.", "years": "2012–2015"}, "music-on": {"blurb": "Marco Carola's long-set tech-house night: Fridays at Amnesia from 2012 to 2018, then at Pacha from 2019, where it still runs on Fridays.", "years": "2012–"}, "paradise-ibiza": {"blurb": "Jamie Jones's Hot Creations party: eight seasons at DC10 from 2012, Wednesdays at Amnesia from 2022 and at UNVRS since 2025.", "years": "2012–"}, "glitterbox": {"blurb": "Defected's disco-and-house party with performers, conceived by Simon Dunmore and launched at Space in 2014; on Sundays at Hï Ibiza since 2017.", "years": "2014–"}, "afterlife-ibiza": {"blurb": "Tale Of Us's melodic-techno party and label: Space in 2016, Privilege in 2017, then Thursdays at Hï Ibiza from 2018, built around big-screen visuals.", "years": "2016–"}, "solomun-plus1": {"blurb": "Solomun's Sunday at Pacha since 2013: one invited guest each week, long sets and a back-to-back finish, with the DJ booth moved down to the floor.", "years": "2013–"}, "cream-ibiza": {"blurb": "The Liverpool promoters' summer night at Amnesia from 1995, on Thursdays in later years, until RA reported its departure after 22 years in 2018.", "years": "1995–2017"}, "ibiza-uncovered": {"blurb": "Sky One's 1997 documentary series on young Britons in San Antonio; it began the Uncovered franchise (to 2002) and the Brits-abroad TV template.", "years": "1997–2002"}, "ricardo-urgell": {"blurb": "Founder of Pacha, with his brother Piti: Sitges in 1967 (some say 1966), Ibiza's farmhouse club from 1973; sold the group in 2017.", "years": "1967–2017"}, "pepe-rosello": {"blurb": "Ibiza club owner since 1963 (Capri/Playboy, Sant Antoni) who ran Space at Platja d'en Bossa from 1989 until its closure in 2016.", "years": "1963–"}, "tony-pike": {"blurb": "Hertfordshire-born, naturalised Australian hotelier who built Pikes near Sant Antoni from 1978; Wham!, Freddie Mercury and after-hours DJs. Sold 2008.", "years": "1978–2019"}, "marco-carola": {"blurb": "Neapolitan techno DJ and producer; founder of Zenit and other labels and of Music On, at Amnesia 2012–18 and at Pacha since 2019.", "years": "1990–"}, "jamie-jones": {"blurb": "Welsh house DJ and producer behind Hot Creations and Hot Natured; RA's top DJ of 2011; Paradise at DC10 from 2012, at Amnesia since 2022.", "years": "2003–"}, "solomun": {"blurb": "Bosnian-born Hamburg DJ and producer; co-founded Diynamic in 2005; Mixmag DJ of the Year 2012; Solomun +1, Pacha's Sunday night, from the mid-2010s.", "years": "2002–"}, "tale-of-us": {"blurb": "Carmine Conte and Matteo Milleri, a duo formed in Milan in 2008; founders of Afterlife, in Ibiza at Space (2016), Privilege (2017) and Hï from 2018.", "years": "2008–"}, "loco-dice": {"blurb": "Düsseldorf DJ and producer, ex-hip hop, on the Ibiza circuit since 2002: Circoloco at DC10, then Space, Ushuaïa, Pacha and Hï. Runs Desolat.", "years": "1994–"}, "luciano": {"blurb": "Swiss-born, Chile-raised DJ and producer; Cadenza founder; Cocoon at Amnesia 2001–06, DC10 from 2006, Vagabundos at Pacha 2010–12.", "years": "1994–"}, "brandon-block": {"blurb": "London DJ: co-founded Flying with Dean Thatcher in 1989; with Alex P, an early resident of Space's Sunday terrace; two Blockster hits in 1999.", "years": "1985–"}, "erick-morillo": {"blurb": "New York house DJ and producer: Reel 2 Real's \"I Like to Move It\" (1993), Subliminal Records (1997) and Subliminal Sessions at Pacha. Died 2020.", "years": "1993–2020"}, "rec-suenolatino": {"blurb": "Italian house of 1989 built on the opening of Manuel Göttsching's \"E2-E4\"; a Balearic staple, remixed in 1992 by Derrick May.", "years": "1989"}, "rec-insomnia": {"blurb": "Faithless's 1995 single: a minor hit at first, then a German smash, Pete Tong's Ibiza favourite and a UK number three on its 1996 reissue.", "years": "1995–96"}, "rec-groovejet": {"blurb": "Spiller and Sophie Ellis-Bextor's disco-house single, named after a Miami club, that beat Victoria Beckham to UK number one in August 2000.", "years": "1999–2000"}, "rec-momentsinlove": {"blurb": "Art of Noise's slow 1983 ZTT piece; Alfredo played it at dawn in a near-empty Amnesia in 1984, and it became a founding Balearic record.", "years": "1983–85"}, "hilltop": {"blurb": "Open-air palm-grove party ground behind Little Vagator: Sunday trance until 10pm, a festival since at least 2008, and still running in 2024.", "years": "1970s–"}, "nine-bar": {"blurb": "Clifftop bar at Ozran above Little Vagator that began as a tea shack; its sunset-to-10pm trance sessions drew 1,000-plus in the 1990s.", "years": "1990s–"}, "shiva-valley": {"blurb": "Beach shack beside Curlies at the south end of Anjuna, known for its Tuesday sundown psytrance party; opening date undocumented.", "years": "1990s–"}, "disco-valley": {"blurb": "Open ground at Vagator beach where some of the first organised Goa trance parties ran, c.1991–93; later used only at Christmas and New Year.", "years": "1990s–"}, "paradiso": {"blurb": "Multi-level nightclub on the Anjuna cliffs, once billed as Goa's most popular club; Fodor's now lists the site as Nyex Beach Club.", "years": "2000s–", "title": "Paradiso (Anjuna)", "aliases": ["Club Paradiso"]}, "curlies": {"blurb": "Beach shack at Anjuna's southern end grown into a bar, restaurant and club, known for its sunsets; in a coastal-zone demolition case since 2016.", "years": "2000s–"}, "goa-full-moon": {"blurb": "Dusk-to-dawn parties on north Goa's beaches and in its woods, timed to the full moon and Christmas–New Year: bands in the 1970s, DJs from the 1980s.", "years": "1970s–2000s"}, "sunburn": {"blurb": "Percept's EDM festival, first held on Candolim beach in December 2007; Vagator from 2013, Pune 2016–18, Goa again 2019–24, Mumbai in 2025.", "years": "2007–"}, "ozora": {"blurb": "Week-long psytrance and arts festival at Dádpuszta near Ozora, Hungary, grown from the Solipse eclipse gathering of August 1999; annual since 2004.", "years": "2004–"}, "universo-paralello": {"blurb": "New Year psytrance festival started by DJ Swarup (Juarez Petrillo) in Goiás in 2000; on Pratigi beach, Bahia, since 2003, roughly every two years.", "years": "2000–"}, "rainbow-serpent": {"blurb": "Psytrance-rooted festival on open land near Lexton, Victoria, held on the Australia Day weekend from 1998; renamed Rainbow Spirit Festival in 2023.", "years": "1998–"}, "law-goa-ban": {"blurb": "India's Noise Pollution Rules of 2000: loud outdoor music stops at 10pm. In Goa enforcement came in waves, from a 2017 curfew to court-led crackdowns.", "years": "2000–"}, "flying-rhino": {"blurb": "London Goa and psytrance label founded in August 1994 by James Monro, Dominic Lamb and George Barker; closed 2002, back online in 2007.", "years": "1994–2002, 2007–"}, "laurent": {"blurb": "French DJ who, with Fred Disko, turned Goa's parties electronic around 1983, cutting European synth records into all-night cassette sets.", "years": "1983–1990s"}, "fred-disko": {"blurb": "French DJ whom Laurent credits as the first to play electronic music at Goa's parties, working from cassettes around 1983.", "years": "1980s"}, "eight-finger-eddie": {"blurb": "Boston-born traveller Yertward Mazamanian, who settled at Anjuna in the mid-1960s, ran a soup kitchen and in 1975 started the Anjuna flea market.", "years": "1960s–2010", "aliases": []}, "man-with-no-name": {"blurb": "Martin Freeland's Goa trance alias: \"Teleport\" on Dragonfly in 1994, then UK hits for Perfecto with \"Floor-Essence\" and \"Paint a Picture\".", "years": "1985–"}, "doof": {"blurb": "Nick Barber's Goa trance project, from a 1993 NovaMute EP to Dragonfly and TIP Records; his 1996 album Let's Turn On is an early psytrance touchstone.", "years": "1993–"}, "tsuyoshi-suzuki": {"blurb": "Tokyo-born DJ who co-founded London's Matsuri Productions in 1994, played Return to the Source and recorded in Prana; Matsuri Digital since 2009.", "years": "1990–"}, "blue-room": {"blurb": "London label run by Simon Ghahary from 1994 to 2002: Juno Reactor, Total Eclipse, Koxbox and X-Dream, often on lavish multi-vinyl gatefold sets.", "years": "1994–2002"}, "matsuri": {"blurb": "London Goa trance label founded in 1994 by Tsuyoshi Suzuki and John Perloff: Prana, Transwave, Koxbox. Closed 1999; revived as Matsuri Digital in 2009.", "years": "1994–1999, 2009–"}, "rec-junglehigh": {"blurb": "Juno Reactor track by Ben Watkins and Johann Bley, issued as a 1997 Perfecto single with an Our House remix and an Oakenfold edit.", "years": "1997"}, "rec-teleport": {"blurb": "Martin Freeland's 1994 Goa trance track, out on Dragonfly and TIP's first compilation; Perfecto's 1996 reissue reached No. 55 in the UK.", "years": "1994"}, "rec-peoplecanfly": {"blurb": "Astral Projection track from the 1996 album Trust in Trance, by Tel Aviv's Avi Nissim and Lior Perlmutter; a games studio later took its name.", "years": "1996"}, "rec-bustamove": {"blurb": "Opening track of Infected Mushroom's 2000 album Classical Mushroom; the Haifa duo say it was the track that introduced them to Europe's trance scene.", "years": "2000"}, "acid": {"blurb": "Phuture's 303 squelch: a house record in Chicago in 1987, a British movement by 1988, and a machine and method that techno kept.", "years": "1986–"}, "split1992": {"blurb": "1992–94: hardcore splits. Darkcore and jungle keep the breakbeats, happy hardcore keeps the pianos, techno's crowd keeps the straight kick.", "years": "1992–94"}, "balearic": {"blurb": "Alfredo's anything-goes mix at Amnesia from 1984, taken to London by four DJs in 1987, later a summer base for techno: Ibiza across three strands.", "years": "1984–"}, "techhouse": {"blurb": "House's structure, techno's clean finish: a 1990s record-shop category for London nights like Wiggle and The End, and a chart style by 2018.", "years": "1995–"}, "chicagohouse": {"blurb": "Knuckles's Warehouse from 1977, Hardy's Music Box, WBMX and Trax: the house Detroit studied before naming techno, and the source of acid.", "years": "1977–"}, "rec-sharingstuff": {"blurb": "Blawan and Pariah's 2011 debut as Karenn: a hand-stamped three-track 12\" of hardware techno that launched their label Works The Long Nights.", "years": "2011", "title": "Karenn — Chaste Down", "aliases": ["\"Chaste Down\""]}, "garage-nottingham": {"blurb": "Selectadisc's Lace Market club, opened 1983: Graeme Park's first residency, where he moved from post-punk and electro to Chicago house by 1986.", "years": "1983–late 1980s", "title": "The Garage (Nottingham)"}, "press-groove": {"blurb": "Founded as a fanzine by DJ T. in 1989, edited in Frankfurt and from 2000 in Berlin; print until 2018, online since, run by its writers from 2024.", "years": "1989–"}, "press-last-night": {"blurb": "Brewster and Broughton's 1999 history of the DJ, revised 2022; with Collin's Altered State and Garratt's Adventures in Wonderland, the shelf behind this book.", "years": "1999–"}, "sound-turbosound": {"blurb": "Tony Andrews and John Newsham's festival PA firm of 1978: the TMS-3 and Flashlight, sold to Harman in 1992; Funktion-One's predecessor, now a Music Tribe brand.", "years": "1978–"}, "sound-tony-andrews": {"blurb": "Co-founder of Turbosound (1978) and Funktion-One (1992): a horn-loading purist whose Funktion-One systems went into clubs including Berghain.", "years": "1971–"}, "sound-jah-shaka": {"blurb": "Neville Powell's south-east London roots reggae sound, 1970–2023: home-made sirens, dubplates and sub-bass that jungle and dubstep DJs later cited.", "years": "1970–2023"}, "sound-spiral-tribe-rig": {"blurb": "Spiral Tribe's sound system, bought in 1991: one of the Castlemorton rigs, impounded by police in 1992, then taken to Paris and Berlin as the teknival began.", "years": "1991–"}, "sound-bedlam": {"blurb": "London free party rig from Harlesden and Dalston: first sound up at Castlemorton in 1992, free parties through the 1990s, then shipped to Australia for 2000.", "years": "1990–"}, "sound-desert-storm": {"blurb": "Glasgow free party rig born in after-hours parties during the 1991 Gulf War; it took techno to Tuzla and Sarajevo with aid convoys in 1994–96.", "years": "1991–", "aliases": ["Desert Storm"]}, "sound-void": {"blurb": "Rog Mogale and Alex Skan's speaker firm, founded 2002, now in Poole: sculpted Air Motion and Incubus designs, and systems for DC10, Tresor, Eden and festivals.", "years": "2002–"}, "sound-martin-audio": {"blurb": "Dave Martin's London loudspeaker firm of 1971: Pink Floyd's bass bins, the Philishave mid horn and, by 2010–11, award-winning club sound at Ministry of Sound.", "years": "1971–"}, "sound-kirsch": {"blurb": "Felix Kirsch's loudspeaker firm in Neukölln, Berlin, known for sound reinforcement and studio monitors."}, "sound-despacio": {"blurb": "James Murphy and Soulwax's vinyl-only night on seven 11-foot McIntosh-powered stacks, first heard in Manchester in 2013: hi-fi sound built for dancers.", "years": "2013–"}, "bass-station": {"blurb": "Monosynth — Novation's first synth (1993): a cheap analogue bass box with a Wasp filter, sold as a way round the scarce TB-303 and a fixture of 1990s acid.", "years": "1993–"}, "fl-studio": {"blurb": "Software — Image-Line's Belgian step sequencer (1997): cheap, pirated and quick, the first DAW of grime, early dubstep and EDM's bedroom stars.", "years": "1997–"}, "reason": {"blurb": "Software — ReBirth (1996) put two 303s and an 808, later a 909, on a screen; Reason (2000) became a patchable rack of virtual hardware.", "years": "1996–"}, "cdj1000": {"blurb": "CD deck — Pioneer's 2001 deck with a turntable-sized platter and Vinyl Mode became the booth standard; USB came in 2007, the networked CDJ-2000 in 2009.", "years": "2001–"}, "xone92": {"blurb": "DJ mixer — Allen & Heath's four-band, twin-filter mixer (2003), grown from Richie Hawtin's MIDI-modded Xone:62; the techno booth standard before his Model 1.", "years": "2003–"}, "mp3-beatport": {"blurb": "Format — The record shop goes online: Discogs (2000) for the past, Beatport (2004) for new tracks as MP3s, SoundCloud (2007) for everyone's uploads.", "years": "2000–"}, "elektron": {"blurb": "Hardware groovebox — Elektron's Machinedrum (2001) and Octatrack (2011): Swedish sequencer-led boxes at the heart of the 2010s hardware live set.", "years": "2001–"}, "eurorack": {"blurb": "Modular synth — Doepfer's A-100 (1995) set the Eurorack standard; hundreds of makers later, patch cables went on stage in sets by Surgeon and Karenn.", "years": "1995–"}, "tr8": {"blurb": "Drum machine — Roland's 2014 Aira TR-8 modelled the 808 and 909 circuits digitally for £399; the TR-8S (2018) added samples, the Boutique TR-08 shrank it.", "years": "2014–"}, "model1": {"blurb": "DJ mixer — Hawtin and Andy Rigby-Jones's 2016 analogue mixer: no fixed channel EQ, but Contour filters, a Sculpt band and drive. The Mixer strand borrows it.", "years": "2016–"}, "streaming": {"blurb": "Format — Boiler Room's webcam livestream (London, 2010) made the filmed DJ set a release in itself: Dekmantel's stages, Sherelle's 2019 set, HÖR's hard techno.", "years": "2010–"}, "web-audio": {"blurb": "Software — The W3C's browser audio standard (drafted 2011, Recommendation 2021). This book's engine builds every kick, 303 and hoover with it in your browser.", "years": "2011–"}, "nottingham": {"blurb": "Lace Market city where Graeme Park played house at The Garage from 1986, then home to Venus, DiY's free parties and Strictly 4 Groovers, The Bomb and Stealth.", "years": "1983–"}, "portugal": {"blurb": "Lisbon house from Plateau (1985) and Kaos Records' Underground Sound of Lisbon, Goa trance at Boom Festival (1997–), and Príncipe's batida (2011–).", "years": "1985–"}, "desert-storm": {"remove": true}, "club-uk": {"blurb": "Wandsworth club, 1993–97; on Fridays Universe's Final Frontier booked Jeff Mills, Laurent Garnier and Derrick May.", "years": "1993–97", "title": "Club UK (Final Frontier)"}, "shop-lucky-spin": {"blurb": "Jungle shop and label: King's Road, then Holloway Road from 1994; DJ Trace and Harmony worked its counter.", "years": "1993–95", "title": "Lucky Spin"}, "shop-unity": {"blurb": "Beak Street, Soho: Red Records' successor, selling rave, jungle, house and garage; managed by Seamus Haji.", "years": "1990s", "title": "Unity Records"}, "rec-magneze": {"years": "1994"}, "rec-ihm": {"years": "2016"}, "rec-waterfall": {"years": "2011", "blurb": "Rrose's 2011 B-side on Sandwell District: seven minutes of metallic churn over a skipping groove."}, "rec-orangetheme": {"years": "1994", "blurb": "Cygnus X's 1994 Eye Q single, built on the Purcell melody from A Clockwork Orange."}, "sanctuary": {"years": "1991–2004"}, "draaimolen": {"years": "2014–"}, "amnesia-house": {"years": "1989–", "blurb": "Coventry's rave crew, 1989–92: from Chalkies and the House series to licensed events, Shelley's and the Eclipse."}, "slammin-vinyl": {"years": "1992–"}, "future": {"years": "1987–88"}, "speed": {"years": "1995–97"}, "gatecrasher": {"years": "1997–2007"}, "shop-importes": {"years": "1981–91"}, "press-knowledge": {"years": "1994–2009"}, "dance-fm": {"years": "1989–91", "blurb": "Walthamstow's house and rave pirate of 1989–91 on 93.0 FM, set up by Mike Stone to sound like a legal station."}, "eruption-fm": {"years": "1993–", "blurb": "Waltham Forest's hardcore and jungle pirate on 101.3 FM, on air from February 1993 to February 2012."}, "reclaim-the-streets": {"years": "1991–"}, "biology": {"years": "1988–89", "blurb": "London promotion of Jarvis Sandy and Tarquin de Meza: in 1989 it staged the rave as a concert, with stage, sound and lasers in a field."}, "cocoon": {"years": "1999–2019"}, "set-cocoon": {"years": "1999–2017"}, "shop-warp": {"years": "1987–97"}, "shop-fon": {"years": "c.1985–87"}, "pulse-fm": {"years": "c.1990–", "blurb": "A hardcore pirate of early-1990s London on 90.6 FM, one of the rave-era stations that followed the acid house pirates."}, "johnny-walker": {"blurb": "One of the Ibiza four: the fourth London DJ on the 1987 trip with Oakenfold, Rampling and Holloway."}, "dj-rap": {"blurb": "Proper Talent — Charissa Saverio; the first woman to headline jungle events."}, "shop-buy-rite": {"blurb": "Cliff Thomas's west-side Detroit shop, the city's main source of Chicago house and ghetto-house twelve-inches."}, "press-generator": {"blurb": "The techno and trance monthly of the mid-1990s."}, "shop-spin-inn": {"blurb": "Manchester's import shop on Cross Street, which supplied the Chicago and New York records Mike Pickering played at the Haçienda."}, "don-fm": {"blurb": "South London's hardcore and jungle pirate of 1992–97, on 105.7 FM from Wandsworth, and the first airtime for DJ Trace and Ed Rush."}, "weekend-rush": {"blurb": "One of the earliest jungle pirates, broadcasting at weekends from Hackney's Nightingale Estate; a July 1993 raid made it the face of the panic."}, "unity-fm": {"blurb": "A hardcore and jungle pirate of 1990s London about which almost nothing reliable has been published."}, "lazer-fm": {"blurb": "A hardcore pirate of 1990s London, remembered by listeners but barely documented."}, "planet-e": {"blurb": "Carl Craig's Detroit label, founded in 1991: the home of the city's second wave, from Moodymann's first album to Craig's own aliases."}, "fuse": {"blurb": "Belgium's longest-running techno club, in a former cinema on Rue Blaes in Brussels since 1994."}, "golden-pudel": {"blurb": "A small, independent club on the Fischmarkt in St Pauli, Hamburg, which brought through Helena Hauff."}, "milk-bar": {"blurb": "Nicky Holloway's all-white basement club at 12 Sutton Row, behind the Astoria, opened in April 1990."}, "ganja": {"blurb": "DJ Hype's family of labels, from Ganja in 1994 to Playaz: jump-up drum and bass from the hardcore era to now."}, "boom": {"blurb": "A week-long psychedelic trance festival on the lake at Idanha-a-Nova in Portugal, held since 1997, now every other year."}, "jungle-fever": {"blurb": "The rave brand that grew out of Kool FM in 1993, a home for ragga jungle's DJs and MCs."}, "rec-noufos": {"blurb": "Juan Atkins's first Model 500 record and Metroplex's first release, April 1985: the record most often named as techno's first."}, "rec-extra": {"blurb": "Luke Slater's remix of Ken Ishii's 1995 track, the hammering loop Jeff Mills played at the Liquid Room."}, "rec-dexter": {"blurb": "Nine minutes of one wobbling riff from Alcachofa (2003), the track that made Ricardo Villalobos's name as a composer."}, "rec-immer": {"blurb": "Michael Mayer's 2002 Kompakt mix, which fixed the Cologne sound for listeners outside the city."}, "rec-wecameinpeace": {"blurb": "Dance 2 Trance's 1990 Frankfurt track, the record most often put forward as the first trance track."}, "rec-stella": {"blurb": "Jam & Spoon's 1992 track for R&S, remixed and relaunched for a decade, and a founding record of Frankfurt trance."}, "rec-offshore": {"blurb": "Chicane's first single, a slow-building 1996 instrumental that reached No. 12 in the UK."}, "rec-flamingjune": {"blurb": "BT and Paul van Dyk's 1997 Perfecto single, twice a UK Dance chart No. 1."}, "rec-universalnation": {"blurb": "The 1998 Bonzai track that made Push, the Belgian producer Mike Dierickx, a name across Europe."}, "rec-madagascar": {"blurb": "Art of Trance's 1998 track, which charted three times and topped the UK Dance chart in 2002."}, "rec-canyoufeelit": {"blurb": "Larry Heard's 1986 Trax instrumental as Mr. Fingers, one of the first deep house records."}, "rec-bodyrock": {"years": "2001"}, "rec-supersharpshooter": {"years": "1995"}, "rec-ghettokraviz": {"years": "2011"}, "rec-terminator": {"blurb": "Goldie, as Metalheads, with Mark Rutherford: a break run through an Eventide pitch-shifter, its pitch moving while its tempo held."}}; for (let i = NODES.length - 1; i >= 0; i--){ const n = NODES[i], f = F[n.id]; if (!f) continue; if (f.remove){ NODES.splice(i, 1); continue; } ["blurb", "years", "title", "aliases", "city"].forEach(k => { if (f[k] !== undefined) n[k] = f[k]; }); } })();

/* ---------- indexes ---------- */
/* auto-create cities referenced but not defined */
NODES.slice().forEach(n => n.rel.forEach(([r, t]) => { if (r === 'in' && !NODES.some(x => x.id === t) && t) N(t, 'city', t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '), { blurb: '', strands: n.strands }); }));
const NODE = Object.fromEntries(NODES.map(n => [n.id, n]));
/* a strand appears only once its chapters exist in this build; crossing pages on a spine are graph pages and stay */
if (window.PAGE_IDS) { const have = new Set(window.PAGE_IDS); Object.keys(STRANDS).forEach(k => { if (k === 'years' || k === 'mixer') return; STRANDS[k].spine = STRANDS[k].spine.filter(id => have.has(id) || NODE[id]); if (!STRANDS[k].spine.some(id => have.has(id))) delete STRANDS[k]; }); }
/* ---------- the contents: the order of the book ---------- */
const CONTENTS = [
  { part: 'Forty years', sub: `one page a year, ${BOOK.from} to ${BOOK.to}, and the year before`, strands: ['years'] },
  { part: 'The music', sub: 'five strands, one for each family of sound', strands: ['techno', 'house', 'rave', 'jungle', 'trance'] },
  { part: 'The places', sub: 'follow the music from New York to Goa', strands: ['newyork', 'chicago', 'detroit', 'ibiza', 'm25', 'lovepar', 'goa'] },
  { part: 'The movement', sub: 'where the music came from, the rooms that made it, the towns it reached', strands: ['roots', 'clubs', 'towns', 'edm'] },
  { part: 'The forces', sub: 'the machines that made it and the law that chased it', strands: ['tech', 'law'] },
  { part: 'Make it', sub: 'take a track apart, then build a set', strands: ['anatomy', 'mixer'], pages: ['make'] },
  { part: 'Explore', sub: 'cut across the whole book', groups: [
    ['scenes', 'Scenes and sources', ['nights', 'listings', 'flyers', 'floor', 'shops', 'press', 'sound', 'charts']],
    ['ways', 'Ways through', ['tours', 'genres', 'explore', 'djs', 'cities', 'streets', 'year', 'path']],
    ['keep', 'Play and keep', ['quiz', 'crate', 'notes']],
    ['about', 'About this book', ['disputes', 'credits']]
  ] }
];
const STRAND_SUB = { years: `one page a year, ${BOOK.from} to ${BOOK.to}`, techno: 'Detroit, Berlin and the machine', house: 'Chicago, New York and the floor', rave: 'Britain, from the M25 to the Criminal Justice Act', jungle: 'the breakbeat at 170', trance: 'Frankfurt, Goa and the breakdown', newyork: 'the Loft, the Garage and the club kids', chicago: 'house music\'s home town, from the Warehouse to footwork', detroit: 'techno\'s home town, before and after', ibiza: 'the island, from the bohemians to the superclubs', m25: 'the orbital raves, 1987–90', lovepar: 'Berlin\'s street party, 1989–2010', goa: 'the beach parties and the trance they made', tech: 'from the bargain-bin 808 to the browser', law: 'drugs, licences and the dance floor', anatomy: 'a techno track taken apart, layer by layer', mixer: 'two decks, one clock', roots: 'a history of Black music, from West Africa to the world and back', clubs: 'fifteen rooms on four continents', towns: 'from Hastings Pier to the psytrance villages', edm: 'the American scene, from the underground to the boom' };
/* pages outside the strands, and the part of the contents they sit in */
const STANDALONE = {}; CONTENTS.forEach(p => { (p.pages || []).forEach(id => { STANDALONE[id] = p.part; }); (p.groups || []).forEach(([, , ids]) => ids.forEach(id => { STANDALONE[id] = p.part; })); });
/* strands in the order of the contents (folios, fallbacks and filters follow it) */
(() => { const order = [...CONTENTS.flatMap(p => p.strands || []), ...Object.keys(STRANDS)]; const o = {}; order.forEach(k => { if (STRANDS[k] && !o[k]) o[k] = STRANDS[k]; }); Object.keys(STRANDS).forEach(k => delete STRANDS[k]); Object.assign(STRANDS, o); })();
const BACK = {}; NODES.forEach(n => n.rel.forEach(([r, t]) => { (BACK[t] = BACK[t] || []).push([r, n.id]); }));
const REL_LABEL = { in: 'in', played: 'played at', founded: 'founded', made: 'made', member: 'member of', uses: 'uses', label: 'on', by: 'by', genre: 'genre', from: 'descends from', told: 'told in', at: 'at' };
const REL_BACK = { in: 'based here', played: 'played here', founded: 'founded by', made: 'made by', member: 'members', uses: 'used on', label: 'released', by: 'records', genre: 'records', from: 'led to', told: 'genres in this chapter', at: 'sets here' };
const TYPE_LABEL = { city: 'City', machine: 'Machine', label: 'Label', genre: 'Genre', border: 'Crossing', collective: 'Collective', person: 'Person', club: 'Club', event: 'Event', station: 'Radio station', record: 'Record', set: 'Landmark set', shop: 'Record shop', press: 'Press', sound: 'Sound system', law: 'Law and policy' };
const TYPE_COLOR = { city: '--mix', machine: '--synth', label: '--samp', genre: '--rumble', border: '--perc', collective: '--kick', person: '--kick', club: '--rumble', event: '--perc', station: '--drums', record: '--bass', set: '--drums', shop: '--samp', press: '--mix', sound: '--drums', law: '--kick' };
