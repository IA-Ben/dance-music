/* ===================================================================
   GRAPH — the whole book as nodes, relations and strands
   Node: { id, type, title, years, city, strands, blurb, rel:[[relation, targetId]...], aliases, q (search query) }
   Relations are declared one way; backlinks are computed.
   =================================================================== */
const STRANDS = {
  years:  { title: 'Forty years', color: '--mix', spine: Object.keys(window.YEARS || {}).map(y => 'y' + y) },
  techno: { title: 'Techno', color: '--rumble', spine: ['h0', 'pre', 'h1', 'h2', 'h3', 'ldn', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14'] },
  house:  { title: 'House', color: '--drums', spine: ['house0', 'hh1', 'chicagohouse', 'hh2', 'hh3', 'balearic', 'hh4', 'acid', 'hh5', 'hh6', 'techhouse'] },
  rave:   { title: 'Rave', color: '--perc', spine: ['r0', 'r1', 'r2', 'r3', 'split1992', 'r4', 'castlemorton', 'r5', 'r6', 'r7', 'r8'] },
  jungle: { title: 'Jungle & D&B', color: '--samp', spine: ['j0', 'j1', 'j2', 'j3', 'j4', 'j5'] },
  trance: { title: 'Trance', color: '--synth', spine: ['t0', 't1', 't2', 't3', 't4', 't5'] },
  anatomy:{ title: 'Anatomy', color: '--kick', spine: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'] },
  mixer:  { title: 'Mixer', color: '--seq', spine: ['mixer'] }
};
const CHAPTER_TITLES = {
  home: 'Cover', h0: 'Forty years in one picture', pre: 'Prehistory, 1920–80', h1: 'Roots, 1974–85', h2: 'Detroit, 1985–92', h3: 'Britain, 1988–99', ldn: 'London, 1986–2026', h4: 'Berlin, 1988–99', h5: 'Europe and the world', h6: 'The 2000s: minimal', h7: 'Ibiza, 2000–', h8: 'The 2010s: Berghain', h9: 'The 2020s: harder, faster', h10: 'Key DJs and producers', h11: 'Clubs', h12: 'Festivals and events', h13: 'Landmark sets', h14: 'Branches: the genres that emerged',
  r0: 'What a rave is', r1: 'Acid house parties and the orbital raves, 1988–90', r2: 'Pirate radio', r3: 'Hardcore, 1990–92', r4: 'The free party and the protest', r5: 'The Criminal Justice Act, 1994', r6: 'Licensed raves and the superclubs', r7: 'The split: jungle, happy hardcore and after', r8: 'Rave people, crews and stations',
  house0: 'The house strand', hh1: 'Chicago, 1977–88', hh2: 'New York and the garage', hh3: 'Ibiza: the island\'s own story', hh4: 'The Ibiza Four and London', hh5: 'Madchester and the North', hh6: 'House after 1990',
  j0: 'What jungle is', j1: 'Rage and the breakbeat, 1988–92', j2: 'Jungle, 1993–95', j3: 'Drum & bass, 1995–2000', j4: 'The 2000s and the revival', j5: 'Jungle people, labels and rooms',
  t0: 'What trance is', t1: 'Frankfurt and Berlin, 1990–95', t2: 'Goa and psytrance', t3: 'The boom, 1995–2001', t4: 'After the peak', t5: 'Trance people, labels and rooms', credits: 'Image credits', forty: 'Forty of everything', tours: 'Guided tours', path: 'Six degrees', quiz: 'Blind test', crate: 'Your crate', notes: 'Marginalia',
  a0: 'The map', a1: 'Kick', a2: 'Drums', a3: 'Percussion', a4: 'Rumble', a5: 'Bass', a6: 'Synth', a7: 'Sampling', a8: 'Mix', a9: 'Studio sequencer', mixer: 'The set builder', year: 'Everywhere in one year', explore: 'Explore the graph'
};
Object.keys(window.YEARS || {}).forEach(y => { CHAPTER_TITLES['y' + y] = y + (y === '1986' ? ' · year one' : y === '2026' ? ' · forty years on' : ''); });
/* forks: where a chapter's history divides. [label, target, strand] */
const FORKS = {
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

const NODES = [];
const N = (id, type, title, o = {}) => { const n = { id, type, title, years: o.years || '', city: o.city || '', strands: o.strands || ['techno'], blurb: o.blurb || '', rel: o.rel || [], aliases: o.aliases || [], q: o.q || title, color: o.color }; NODES.push(n); return n; };

/* ---------- cities ---------- */
[['detroit', 'Detroit', 'Motor City. Techno\'s birthplace: Belleville, the Music Institute, UR, Submerge, Movement.', ['techno']],
 ['chicago', 'Chicago', 'House\'s birthplace: the Warehouse, the Music Box, Trax, the 303.', ['house', 'techno']],
 ['berlin', 'Berlin', 'Techno\'s capital since 1991: UFO, Tresor, E-Werk, Hard Wax, Berghain.', ['techno']],
 ['london', 'London', 'Camden Palace and Clink Street, Shoom and Spectrum, the M25 raves, pirate radio, Lost, The End, Stay Up Forever, fabric, Fold.', ['rave', 'techno', 'house']],
 ['hastings', 'Hastings', 'The Sussex fishing town fifty miles from London: John Digweed\'s birthplace, and since 2023 the Hastings Techno Militia and the Detroit exchange.', ['techno', 'trance']],
 ['birmingham', 'Birmingham', 'Network Records named the genre; Downwards and House of God hardened it; the Que Club housed it.', ['techno']],
 ['sheffield', 'Sheffield', 'Warp Records and bleep, 1989–91.', ['techno']],
 ['manchester', 'Manchester', 'The Haçienda, Madchester, Bugged Out, 808 State and A Guy Called Gerald.', ['house', 'rave', 'techno']],
 ['glasgow', 'Glasgow', 'Sub Club, Slam, Soma, Rubadub.', ['techno']],
 ['frankfurt', 'Frankfurt', 'Dorian Gray, Omen, Sven Väth, Harthouse: trance\'s birthplace and schranz\'s.', ['techno']],
 ['ghent', 'Ghent', 'R&S Records and the hoover; Belgium\'s new beat around it.', ['techno', 'rave']],
 ['rotterdam', 'Rotterdam', 'Gabber: Parkzicht, Rotterdam Records, Thunderdome.', ['techno', 'rave']],
 ['amsterdam', 'Amsterdam', 'Awakenings, ADE, Dekmantel, the RoXY and Paradiso.', ['techno', 'house']],
 ['ibiza', 'Ibiza', 'Pacha, Amnesia, Ku, Space, DC10: the open-air club perfected; techno\'s summer residency since 2000.', ['house', 'techno', 'rave']],
 ['tokyo', 'Tokyo', 'Liquid Room, Womb, Ken Ishii.', ['techno']],
 ['tbilisi', 'Tbilisi', 'Bassiani and Khidi; the 2018 raid and the dancing protest.', ['techno']],
 ['paris', 'Paris', 'Rex Club, Laurent Garnier, F Communications, the teknivals.', ['techno', 'rave']],
 ['cologne', 'Cologne', 'Kompakt and Stockhausen\'s studio.', ['techno']],
 ['dusseldorf', 'Düsseldorf', 'Kraftwerk\'s Kling Klang studio.', ['techno']],
 ['newyork', 'New York', 'The Paradise Garage, Planet Rock, Joey Beltram.', ['house', 'techno']],
 ['blackburn', 'Blackburn', 'The Lancashire warehouse raves of 1989–90, thousands every weekend.', ['rave']],
 ['milton-keynes', 'Milton Keynes', 'The Sanctuary: Helter Skelter, Dreamscape, the hardcore cathedral.', ['rave']]
].forEach(([id, t, b, s]) => N(id, 'city', t, { blurb: b, strands: s }));

/* ---------- machines ---------- */
[['tr808', 'Roland TR-808', '1980', 'The drum machine Roland built for lounge bands; the boom of electro, hip-hop and acid house. Discontinued 1983, cheap by 1985.', ['techno', 'house', 'rave']],
 ['tb303', 'Roland TB-303', '1981–84', 'A bass accompaniment box that failed, then squealed: acid in Chicago (1987), London (1988) and the free parties (1993–).', ['house', 'techno', 'rave']],
 ['tr909', 'Roland TR-909', '1983', 'The first Roland drum machine with MIDI; the kick, hats and clap of house and techno for forty years.', ['techno', 'house', 'rave']],
 ['moog', 'Moog modular', '1964', 'Robert Moog\'s synthesiser; Switched-On Bach (1968), I Feel Love (1977).', ['techno']],
 ['sampler', 'The sampler (Akai S900/S950, 1986–)', '1986', 'Cheap sampling: the breakbeat, the vocal stab and the piano loop of hardcore all come from it.', ['rave', 'techno']],
 ['technics', 'Technics SL-1200 / pitch control', '1972–79', 'The turntable with a pitch slider: beat-matching, the long mix, the DJ as instrumentalist.', ['house', 'techno', 'rave']],
 ['ableton', 'Ableton Live', '2001', 'Berlin software by Henke and Behles; loops, edits and resampling move from the studio into the set.', ['techno']],
 ['finalscratch', 'Final Scratch', '2001', 'Timecode vinyl: Hawtin\'s DE9 and the laptop DJ.', ['techno']]
].forEach(([id, t, y, b, s]) => N(id, 'machine', t, { years: y, blurb: b, strands: s, aliases: { tr808: ['TR-808', '808'], tb303: ['TB-303', '303'], tr909: ['TR-909', '909'], moog: ['Moog'], sampler: ['sampler', 'Akai'], technics: ['Technics', 'turntable'], ableton: ['Ableton'], finalscratch: ['Final Scratch'] }[id] || [] }));

/* ---------- labels ---------- */
[['metroplex', 'Metroplex', '1985', 'detroit', 'Juan Atkins\'s label: Model 500, the first techno records.', ['techno']],
 ['transmat', 'Transmat', '1986', 'detroit', 'Derrick May\'s label: Rhythim Is Rhythim, Strings of Life.', ['techno']],
 ['kms', 'KMS', '1987', 'detroit', 'Kevin Saunderson\'s label: Inner City, Reese.', ['techno']],
 ['tresor-records', 'Tresor Records', '1991', 'berlin', 'Founded October 1991 under the club: X-101, Jeff Mills, Blake Baxter, Drexciya — the Detroit–Berlin axis on vinyl.', ['techno']],
 ['warp', 'Warp Records', '1989', 'sheffield', 'Bleep, then Artificial Intelligence, Aphex and Autechre.', ['techno']],
 ['rs', 'R&S Records', '1984', 'ghent', 'Renaat Vandepapeliere\'s label: Energy Flash, Mentasm, Aphex Twin.', ['techno', 'rave']],
 ['downwards', 'Downwards', '1993', 'birmingham', 'Karl O\'Connor\'s label: Regis, Surgeon, Female; the industrial line.', ['techno']],
 ['network', 'Network Records', '1988', 'birmingham', 'Neil Rushton: Detroit on British shelves, the Bio Rhythm compilations.', ['techno']],
 ['ostgut-ton', 'Ostgut Ton', '2005', 'berlin', 'Berghain\'s label: Klock, Dettmann, Function, the 2010s sound.', ['techno']],
 ['drumcode', 'Drumcode', '1996', 'stockholm', 'Adam Beyer\'s label: Swedish loop techno to main-stage peak-time.', ['techno']],
 ['kompakt', 'Kompakt', '1998', 'cologne', 'Voigt, Mayer, Paape: minimal made melodic.', ['techno']],
 ['soma', 'Soma', '1991', 'glasgow', 'Slam\'s label; Daft Punk\'s first records.', ['techno', 'house']],
 ['mnus', 'M_nus', '1998', 'berlin', 'Richie Hawtin\'s minimal label.', ['techno']],
 ['perlon', 'Perlon', '1997', 'berlin', 'Zip and Markus Nikolai; Villalobos\'s home.', ['techno']],
 ['suf', 'Stay Up Forever', '1993', 'london', 'The Liberators and D.A.V.E. the Drummer: London acid techno.', ['techno', 'rave']],
 ['planet-e', 'Planet E', '1991', 'detroit', 'Carl Craig\'s label.', ['techno']],
 ['plus8', 'Plus 8', '1990', 'windsor', 'Hawtin and Acquaviva, Windsor, Ontario.', ['techno']],
 ['axis', 'Axis', '1992', 'detroit', 'Jeff Mills\'s label after UR.', ['techno']],
 ['m-plant', 'M-Plant', '1994', 'detroit', 'Robert Hood\'s label: Minimal Nation.', ['techno']],
 ['harthouse', 'Harthouse', '1992', 'frankfurt', 'Sven Väth\'s hard-trance label.', ['techno']],
 ['trax', 'Trax Records', '1984', 'chicago', 'Larry Sherman\'s Chicago label: Acid Tracks and most of early house.', ['house']],
 ['shut-up-and-dance', 'Shut Up and Dance', '1989', 'london', 'PJ and Smiley\'s label and group: breakbeat hardcore before it had a name.', ['rave']],
 ['reinforced', 'Reinforced', '1990', 'london', '4hero\'s label; Goldie\'s Metalheads; the hardcore-to-jungle bridge.', ['rave']],
 ['moving-shadow', 'Moving Shadow', '1990', 'stevenage', 'Rob Playford\'s label: 2 Bad Mice, Omni Trio, darkcore to drum & bass.', ['rave']],
 ['suburban-base', 'Suburban Base', '1991', 'romford', 'Boogie Times shop label: Sonz of a Loop da Loop Era, the hardcore anthems.', ['rave']],
 ['production-house', 'Production House', '1987', 'london', 'Acen, Baby D: hardcore and its pop crossover.', ['rave']],
 ['boys-own', 'Boy\'s Own', '1986', 'london', 'Fanzine (1986–92), then parties, then label: Farley, Weatherall, Heller; Underworld.', ['house', 'rave']]
].forEach(([id, t, y, c, b, s]) => N(id, 'label', t, { years: y, city: c, blurb: b, strands: s, rel: [['in', c]] }));

/* ---------- genres (ids match the Branches chapter) ---------- */
[['g-detroit', 'Detroit techno', '1985–', 'detroit', ['techno'], 'Kraftwerk + P-Funk + electro through a 909; instrumental, futurist.', 'Detroit 1988', ['h2']],
 ['g-bleep', 'Bleep', '1989–91', 'sheffield', ['techno'], 'Detroit minimalism over sound-system sub-bass.', 'UK bleep 1990', ['h3']],
 ['g-berlin', 'Berlin / Tresor techno', '1991–', 'berlin', ['techno'], 'Detroit played harder and faster in a vault.', 'Tresor 1992', ['h4']],
 ['g-hardcore', 'Breakbeat hardcore', '1990–93', 'london', ['rave'], 'Breakbeats, hoovers, pianos and sub-bass at 140; rave\'s own music.', 'UK rave 1991', ['r3']],
 ['g-acidtek', 'Acid techno', '1993–', 'london', ['techno', 'rave'], '303s and 909s at 140 in the free parties.', 'Acid techno 1994', ['h3', 'r4']],
 ['g-gabber', 'Gabber', '1992–', 'rotterdam', ['rave', 'techno'], 'Distorted kicks at 160–200; hardstyle descends from it.', null, ['h5']],
 ['g-trance', 'Trance', '1991–', 'frankfurt', ['techno'], 'Harthouse and Eye Q: techno\'s melodic exit, later its own industry.', null, ['h5']],
 ['g-bham', 'Birmingham / UK industrial', '1993–', 'birmingham', ['techno'], 'Throbbing Gristle meets Detroit.', 'Birmingham 1995', ['h3']],
 ['g-dub', 'Dub techno', '1993–', 'berlin', ['techno'], 'A chord into a tape delay into a filter.', 'Dub techno 1995', ['h4']],
 ['g-idm', 'Ambient / intelligent techno', '1992–', 'sheffield', ['techno'], 'Warp\'s Artificial Intelligence series.', null, ['h3']],
 ['g-schranz', 'Schranz / hardgroove', '1997–2005', 'frankfurt', ['techno'], 'Loop techno at 140–150.', 'Schranz 2002', ['h6']],
 ['g-minimal', 'Minimal', '2001–08', 'berlin', ['techno'], 'Hood named it; Hawtin, Villalobos and Perlon made it a decade.', 'Minimal 2004', ['h6']],
 ['g-techhouse', 'Tech-house', '1995–', 'london', ['house', 'techno'], 'House groove, techno sound design: the crossing.', 'Tech-house 1997', ['techhouse']],
 ['g-berghain', 'Berghain / Ostgut Ton sound', '2005–', 'berlin', ['techno'], 'The rumble as bassline.', 'Berghain 2010', ['h8']],
 ['g-hypnotic', 'Hypnotic', '2012–', 'rome', ['techno'], 'Polymeters that never resolve.', 'Hypnotic 2015', ['h8']],
 ['g-industrial', 'Industrial revival', '2013–', 'berlin', ['techno'], 'Birmingham\'s line at 140.', 'Industrial 2018', ['h8']],
 ['g-peak', 'Peak-time techno', '2014–', 'stockholm', ['techno'], 'Drumcode and the main stage.', 'Peak-time 2017', ['h8']],
 ['g-electro', 'Electro', '1982 / 2010s', 'detroit', ['techno'], 'Planet Rock to Drexciya to Helena Hauff.', null, ['h1']],
 ['g-hard', 'Hard techno', '2020–', 'everywhere', ['techno', 'rave'], '150+, hoovers, snare rolls, distortion.', 'Hard techno 2023', ['h9']],
 ['g-house', 'House', '1984–', 'chicago', ['house'], 'Disco\'s continuation; a different music with a shared grid.', null, ['house0']],
 ['g-acidhouse', 'Acid house', '1987–89', 'chicago', ['house', 'rave'], 'The 303 record and then the British movement named after it.', 'Chicago acid 1987', ['acid', 'r1']],
 ['g-jungle', 'Jungle / drum & bass', '1993–', 'london', ['rave'], 'Hardcore\'s breakbeats at 160 with reggae bass; Rage, Kool FM, AWOL.', null, ['r7']],
 ['g-happy', 'Happy hardcore', '1993–', 'london', ['rave'], 'Hardcore\'s pianos and vocals sped up; Slipmatt, Helter Skelter.', null, ['r7']],
 ['g-newbeat', 'New beat', '1987–89', 'ghent', ['techno', 'rave'], 'EBM at 33 rpm with the pitch up; Belgium\'s hinge between industrial and house.', null, ['h5']],
 ['g-balearic', 'Balearic beat', '1984–', 'ibiza', ['house'], 'Alfredo\'s anything-goes at Amnesia: house, Italo, rock, reggae.', null, ['balearic']]
].forEach(([id, t, y, c, s, b, g, ch]) => N(id, 'genre', t, { years: y, city: c, strands: s, blurb: b, rel: [['in', c], ...ch.map(x => ['told', x])], aliases: [], color: s[0] === 'rave' ? '--perc' : s[0] === 'house' ? '--drums' : '--rumble', q: t + ' techno' }).genre = g);
NODES.forEach(n => { if (n.type === 'genre') n.preset = { 'g-detroit': 'Detroit 1988', 'g-bleep': 'UK bleep 1990', 'g-berlin': 'Tresor 1992', 'g-hardcore': 'UK rave 1991', 'g-acidtek': 'Acid techno 1994', 'g-bham': 'Birmingham 1995', 'g-dub': 'Dub techno 1995', 'g-schranz': 'Schranz 2002', 'g-minimal': 'Minimal 2004', 'g-berghain': 'Berghain 2010', 'g-hypnotic': 'Hypnotic 2015', 'g-industrial': 'Industrial 2018', 'g-peak': 'Peak-time 2017', 'g-hard': 'Hard techno 2023', 'g-acidhouse': 'Chicago acid 1987' }[n.id] || n.genre || null; });
[['g-detroit', 'g-bleep'], ['g-detroit', 'g-berlin'], ['g-detroit', 'g-minimal'], ['g-detroit', 'g-bham'], ['g-detroit', 'g-dub'], ['g-acidhouse', 'g-hardcore'], ['g-acidhouse', 'g-acidtek'], ['g-hardcore', 'g-jungle'], ['g-hardcore', 'g-happy'], ['g-hardcore', 'g-gabber'], ['g-newbeat', 'g-trance'], ['g-berlin', 'g-schranz'], ['g-bham', 'g-industrial'], ['g-dub', 'g-hypnotic'], ['g-minimal', 'g-berghain'], ['g-dub', 'g-berghain'], ['g-schranz', 'g-hard'], ['g-trance', 'g-hard'], ['g-gabber', 'g-hard'], ['g-house', 'g-acidhouse'], ['g-house', 'g-techhouse'], ['g-balearic', 'g-acidhouse'], ['g-electro', 'g-detroit'], ['g-bleep', 'g-idm'], ['g-peak', 'g-hard']].forEach(([a, b]) => NODES.find(n => n.id === b).rel.push(['from', a]));

/* ---------- crossings (framings live in templates in the HTML) ---------- */
[['acid', 'Acid', '1987–', ['house', 'techno', 'rave'], 'One Chicago record, three different stories. Phuture\'s 303 is a house record; Britain made it a movement; techno took the machine and the attitude.'],
 ['castlemorton', 'Castlemorton Common, May 1992', '1992', ['rave', 'techno'], 'A week-long free festival of 20–40,000 on a Worcestershire common: the end of the free party era and the beginning of acid techno\'s exile.'],
 ['split1992', 'The split, 1991–93', '1991–93', ['rave', 'techno'], 'The point where "rave" stopped being one music: breakbeats went one way, straight 4/4 went the other.'],
 ['balearic', 'Ibiza and the Balearic beat', '1984–', ['house', 'rave', 'techno'], 'The island as origin (house), as catalyst (rave) and as summer residency (techno).'],
 ['techhouse', 'Tech-house', '1995–', ['house', 'techno'], 'The crossing: house groove, techno sound design. Claimed by both strands.'],
 ['chicagohouse', 'Chicago house', '1977–', ['house', 'techno', 'rave'], 'The Warehouse, the Music Box, Trax: the music next door to techno and the source of acid house.']
].forEach(([id, t, y, s, b]) => N(id, 'border', t, { years: y, strands: s, blurb: b, aliases: { acid: ['Acid house', 'acid house', 'acieed'], castlemorton: ['Castlemorton', 'Castlemorton Common'], split1992: ['the split'], balearic: ['Balearic', 'Balearic beat'], techhouse: ['Tech-house', 'tech-house'], chicagohouse: ['Chicago house'] }[id] || [] }));

/* ---------- collectives / crews ---------- */
[['ur', 'Underground Resistance', '1989–', 'detroit', ['techno'], 'Mad Mike Banks and Jeff Mills, then Robert Hood: masked, militant, anti-corporate. The Final Frontier, Riot, Jupiter Jazz, Submerge.', [['in', 'detroit'], ['founded', 'tresor-records']]],
 ['spiral-tribe', 'Spiral Tribe', '1990–', 'london', ['rave', 'techno'], 'Founded 1990 by Mark Harrison, Debbie Griffith, Simone and friends; the free-party sound system, Castlemorton, exile to France and the teknival; the SP23 label.', [['in', 'london'], ['played', 'castlemorton'], ['founded', 'teknival']]],
 ['mutoid-waste', 'Mutoid Waste Company', '1984–', 'london', ['rave'], 'Post-apocalyptic sculpture from scrap, mobile sound systems and Spiral Tribe\'s collaborators; Glastonbury\'s Trash City descends from them.', [['in', 'london'], ['played', 'castlemorton']]],
 ['desert-storm', 'Desert Storm', '1992–', 'nottingham', ['rave'], 'The sound system that took the free party to Sarajevo during the siege.', [['played', 'castlemorton']]],
 ['exodus', 'Exodus Collective', '1992–', 'luton', ['rave'], 'Luton\'s free-party and housing collective; the political wing of the sound systems.', []]
].forEach(([id, t, y, c, s, b, r]) => N(id, 'collective', t, { years: y, city: c, strands: s, blurb: b, rel: r }));

/* ---------- people ---------- */
const P = (id, name, city, years, labels, blurb, strands, rel = [], aliases = []) => N(id, 'person', name, { city, years, blurb: labels + ' — ' + blurb, strands, rel: [['in', city], ...rel], aliases });
P('juan-atkins', 'Juan Atkins', 'detroit', '1962–2026', 'Cybotron, Model 500, Metroplex', 'The Originator: "Clear" (1983), "No UFO\'s" (1985); named the music after Toffler\'s techno-rebels, and the record "Techno Music" (1988) gave the genre its name. Born in Detroit on 12 September 1962; still touring at 64 — Movement, Dekmantel, Houghton — when he was found unresponsive in his Mexico City hotel room before a set on 31 October 2026 and died that night. Saunderson: "If it wasn\'t for Juan, there wouldn\'t be me, a Derrick, a Kevin."', ['techno'], [['founded', 'metroplex'], ['made', 'rec-clear'], ['made', 'rec-noufos'], ['played', 'music-institute']], ['Atkins', 'Model 500', 'Cybotron']);
P('derrick-may', 'Derrick May', 'detroit', '1986–', 'Rhythim Is Rhythim, Transmat', '"Strings of Life", "Nude Photo"; the Music Institute resident; closed its last night.', ['techno'], [['founded', 'transmat'], ['made', 'rec-strings'], ['made', 'rec-nudephoto'], ['played', 'music-institute'], ['played', 'set-musicinstitute']], ['May', 'Rhythim Is Rhythim', 'Mayday']);
P('kevin-saunderson', 'Kevin Saunderson', 'detroit', '1987–', 'Inner City, KMS, E-Dancer', '"Big Fun" and "Good Life" put Detroit in the UK charts.', ['techno', 'house'], [['founded', 'kms'], ['made', 'rec-bigfun']], ['Saunderson', 'Inner City']);
P('jeff-mills', 'Jeff Mills', 'detroit', '1985–', 'UR, Axis, Purpose Maker', 'The Wizard on WJLB; three decks and a 909; Liquid Room 1995; "The Bells".', ['techno'], [['member', 'ur'], ['founded', 'axis'], ['made', 'rec-thebells'], ['played', 'tresor'], ['played', 'lost'], ['played', 'liquid-room'], ['played', 'set-liquidroom'], ['played', 'set-exhibitionist'], ['played', 'the-orbit'], ['played', 'pure']], ['Mills', 'The Wizard']);
P('mike-banks', '"Mad" Mike Banks', 'detroit', '1989–', 'Underground Resistance, Submerge', 'The militant, masked, anti-corporate conscience of techno.', ['techno'], [['founded', 'ur']], ['Mad Mike', 'Banks']);
P('robert-hood', 'Robert Hood', 'detroit', '1990–', 'UR, M-Plant, Floorplan', '"Minimal Nation" (1994) invented minimal techno before it had a name.', ['techno'], [['member', 'ur'], ['founded', 'm-plant'], ['made', 'rec-minimalnation']], ['Hood']);
P('carl-craig', 'Carl Craig', 'detroit', '1989–', 'Planet E, 69, Paperclip People', 'The second wave\'s widest mind; founded DEMF in 2000.', ['techno'], [['founded', 'planet-e'], ['founded', 'movement'], ['made', 'rec-bugbassbin']], ['Craig']);
P('richie-hawtin', 'Richie Hawtin', 'windsor', '1990–', 'Plus 8, Plastikman, M_nus', 'Acid in the Packard Plant, then the laptop, then minimal\'s figurehead; ENTER. in Ibiza.', ['techno'], [['founded', 'plus8'], ['founded', 'mnus'], ['made', 'rec-spastik'], ['played', 'set-packard'], ['played', 'set-de9'], ['played', 'space'], ['uses', 'finalscratch']], ['Hawtin', 'Plastikman']);
P('drexciya', 'Drexciya', 'detroit', '1992–2002', 'James Stinson & Gerald Donald', 'Electro-techno with an Afrofuturist undersea mythology.', ['techno'], [['made', 'rec-bubble']], ['Stinson']);
P('eddie-fowlkes', 'Eddie Fowlkes', 'detroit', '1986–', 'Metroplex, Tresor', '"Goodbye Kiss" (1986); Berlin\'s early Detroit link.', ['techno'], [['played', 'tresor']], ['Fowlkes']);
P('blake-baxter', 'Blake Baxter', 'detroit', '1987–', 'KMS, Tresor', 'The Prince of Techno; the first Detroit artist to live in Berlin.', ['techno'], [['played', 'tresor']], ['Baxter']);
P('kenny-larkin', 'Kenny Larkin', 'detroit', '1990–', 'Warp, Art of Dance', 'Second-wave Detroit: "Azimuth" (1994).', ['techno'], [], ['Larkin']);
P('mojo', 'The Electrifying Mojo', 'detroit', '1977–', 'WGPR, WJLB', 'Charles Johnson\'s radio show: Kraftwerk, Parliament, Prince and the B-52s for the Belleville Three.', ['techno'], [['played', 'wjlb']], ['Electrifying Mojo', 'Mojo']);
P('neil-rushton', 'Neil Rushton', 'birmingham', '1988–', 'Network Records', 'Licensed the compilation that named the genre.', ['techno'], [['founded', 'network'], ['made', 'rec-technocomp']], ['Rushton']);
P('steve-bicknell', 'Steve Bicknell', 'london', '1991–', 'Lost, Cosmic Records', 'Ran the warehouse night that was Jeff Mills\'s London home.', ['techno'], [['founded', 'lost']], ['Bicknell']);
P('chris-liberator', 'Chris Liberator', 'london', '1993–', 'Stay Up Forever', 'Acid techno: a 303 and a 909 at 140 from a record shop and a free party.', ['techno', 'rave'], [['founded', 'suf'], ['uses', 'tb303']], ['Liberator', 'The Liberators']);
P('ben-sims', 'Ben Sims', 'london', '1997–', 'Hardgroove, Theory', 'Three decks of Detroit-swung loop techno; the hardgroove revival\'s source.', ['techno'], [], ['Sims']);
P('carl-cox', 'Carl Cox', 'london', '1980s–', 'Space Ibiza, Intec', 'Three decks at the M25 raves, fifteen summers at Space, the people\'s champion of both house and techno.', ['rave', 'techno', 'house'], [['played', 'sunrise'], ['played', 'space'], ['played', 'set-coxspace'], ['played', 'the-orbit'], ['made', 'rec-ifeelit']], ['Cox', 'Coxy']);
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
P('slam', 'Slam', 'glasgow', '1988–', 'Sub Club, Soma', 'Stuart McMillan and Orde Meikle; Subculture since 1994; "Positive Education".', ['techno'], [['founded', 'soma'], ['played', 'sub-club'], ['made', 'rec-positiveeducation']], ['Stuart McMillan', 'Orde Meikle']);
P('aphex-twin', 'Aphex Twin', 'cornwall', '1991–', 'R&S, Rephlex, Warp', 'Richard D. James: Selected Ambient Works 85–92 (R&S), then Warp; the bleep-to-IDM hinge.', ['techno', 'rave'], [['made', 'rec-saw85']], ['Richard D. James']);
/* house and the Ibiza four (border people) */
P('frankie-knuckles', 'Frankie Knuckles', 'chicago', '1977–', 'The Warehouse, Power Plant', 'The Godfather of House; the Warehouse residency that named the music.', ['house'], [['played', 'warehouse']], ['Knuckles']);
P('ron-hardy', 'Ron Hardy', 'chicago', '1982–', 'The Music Box', 'Faster, rawer, reel-to-reel edits; the first floor for the 303.', ['house'], [['played', 'music-box']], ['Hardy']);
P('dj-pierre', 'DJ Pierre', 'chicago', '1987–', 'Phuture', 'Twisted the 303\'s knobs and made "Acid Tracks".', ['house', 'rave', 'techno'], [['made', 'rec-acidtracks'], ['uses', 'tb303']], ['Phuture', 'Pierre']);
P('alfredo', 'DJ Alfredo', 'ibiza', '1984–', 'Amnesia', 'Alfredo Fiorito, Argentine; the Amnesia terrace from midnight to dawn with no genre: the Balearic beat.', ['house', 'rave'], [['played', 'amnesia']], ['Alfredo Fiorito']);
P('jose-padilla', 'José Padilla', 'ibiza', '1991–', 'Café del Mar', 'The sunset session; the chill-out as a form.', ['house'], [['played', 'cafe-del-mar']], ['Padilla']);
P('paul-oakenfold', 'Paul Oakenfold', 'london', '1987–', 'Spectrum, Future, Perfecto', 'Took three friends to Ibiza for his birthday in August 1987; opened Spectrum at Heaven.', ['rave', 'house'], [['founded', 'spectrum'], ['played', 'heaven'], ['played', 'amnesia']], ['Oakenfold', 'Oakey']);
P('danny-rampling', 'Danny Rampling', 'london', '1987–', 'Shoom', 'Came back from Ibiza and opened a gym to acid house in December 1987.', ['house', 'rave'], [['founded', 'shoom'], ['played', 'amnesia']], ['Rampling']);
P('nicky-holloway', 'Nicky Holloway', 'london', '1987–', 'The Trip, Milk Bar', 'The Trip at the Astoria (June 1988): acid house on Charing Cross Road.', ['rave', 'house'], [['founded', 'the-trip']], ['Holloway']);
P('johnny-walker', 'Johnny Walker', 'london', '1987–', 'the Ibiza four', 'The fourth of the 1987 trip; later a trance DJ.', ['rave', 'house'], []);
P('mike-pickering', 'Mike Pickering', 'manchester', '1986–', 'Haçienda, Nude, M People', 'Played house to a working-class crowd before London did.', ['house', 'rave'], [['played', 'hacienda']], ['Pickering']);
P('graeme-park', 'Graeme Park', 'manchester', '1988–', 'Haçienda', 'Nude\'s other resident; Nottingham\'s Garage before that.', ['house', 'rave'], [['played', 'hacienda']]);
P('andrew-weatherall', 'Andrew Weatherall', 'london', '1988–2020', 'Boy\'s Own, Sabres of Paradise', 'The "Loaded" remix; the fanzine; the DJ everyone trusted.', ['house', 'rave'], [['member', 'boys-own'], ['made', 'rec-loaded']], ['Weatherall']);
P('terry-farley', 'Terry Farley', 'london', '1986–', 'Boy\'s Own', 'Fanzine, parties, label; Heller & Farley.', ['house', 'rave'], [['founded', 'boys-own']], ['Farley']);
/* rave */
P('tony-colston-hayter', 'Tony Colston-Hayter', 'london', '1988–', 'Sunrise', 'The "Acid House King": Sunrise at White Waltham and Santa Pod; the phone lines, the convoys, the cat and mouse.', ['rave'], [['founded', 'sunrise']], ['Colston-Hayter']);
P('paul-taylor', 'Paul Taylor', 'blackburn', '1989–', 'Blackburn raves', 'Lancashire\'s warehouse parties, thousands every weekend until the police won.', ['rave'], [['founded', 'blackburn-raves']]);
P('charlie-chester', 'Charlie Chester', 'london', '1988–', 'Flying', 'Flying: Balearic into acid house in the late 80s.', ['house', 'rave'], []);
P('mr-c', 'Mr. C', 'london', '1987–', 'The Shamen, The End, Plink Plonk', 'Rapper, DJ, club owner: The End (1995–2009) with Layo.', ['rave', 'house', 'techno'], [['founded', 'the-end']], ['Richard West', 'Mr C', 'Mr.C']);
P('fabio-grooverider', 'Fabio & Grooverider', 'london', '1988–', 'Rage at Heaven', 'Sped the breaks up at Rage (1988–93) and invented jungle on the way.', ['rave'], [['played', 'heaven'], ['played', 'rage']], ['Fabio', 'Grooverider']);
P('slipmatt', 'Slipmatt', 'london', '1988–', 'SL2, Helter Skelter', '"On a Ragga Tip"; from hardcore to happy hardcore\'s king.', ['rave'], [['made', 'rec-raggatip'], ['played', 'helter-skelter']], ['SL2']);
P('ellis-dee', 'Ellis Dee', 'london', '1988–', 'Dance Paradise, Raindance', 'The hardcore era\'s workhorse: Raindance, Fantazia, every flyer.', ['rave'], [['played', 'raindance'], ['played', 'fantazia']]);
P('ratpack', 'Ratpack', 'london', '1989–', 'Evenson Allen & Lipmaster Mark', 'MC and DJ: "Searchin\' for My Rizla"; the rave duo.', ['rave'], []);
P('top-buzz', 'Top Buzz', 'london', '1990–', 'Mad P, Jason Kaye', 'The MC-and-DJ unit of Dreamscape and Fantazia; "Living in Darkness".', ['rave'], [['played', 'dreamscape']]);
P('dj-hype', 'DJ Hype', 'london', '1989–', 'Ganja Records, Kool FM', 'From hardcore scratching to jungle\'s pioneer; "The Bee".', ['rave'], [['played', 'kool-fm']]);
P('ltj-bukem', 'LTJ Bukem', 'london', '1991–', 'Good Looking', '"Demon\'s Theme", "Music": the atmospheric side of jungle; Speed at the Mars Bar.', ['rave'], []);
P('doc-scott', 'Doc Scott', 'coventry', '1991–', 'Absolute 2, Reinforced', '"NHS", darkcore; from Coventry\'s Eclipse to drum & bass.', ['rave'], [['played', 'eclipse']]);
P('mickey-finn', 'Mickey Finn', 'london', '1988–', 'Urban Shakedown', '"Some Justice"; the hardcore-to-jungle DJ.', ['rave'], [['made', 'rec-somejustice']]);
P('jumpin-jack-frost', 'Jumpin\' Jack Frost', 'london', '1988–', 'V Recordings', 'Brixton; from Centreforce to V Recordings with Bryan Gee.', ['rave'], [['played', 'centreforce']]);
P('goldie', 'Goldie', 'london', '1992–', 'Metalheadz, Reinforced', '"Terminator" (1992) invented timestretch jungle; Metalheadz at the Blue Note.', ['rave'], [['made', 'rec-terminator'], ['member', 'reinforced']]);
P('sasha', 'Sasha', 'manchester', '1989–', 'Shelley\'s, Renaissance', 'The first superstar DJ: Shelley\'s Laserdome in Stoke, then progressive house with Digweed.', ['rave', 'house'], [['played', 'shelleys']]);
P('graham-gold', 'Graham Gold', 'london', '1988–', 'Kiss FM', 'Kiss\'s rave show; the ravers\' DJ at the M25 parties.', ['rave'], [['played', 'kiss-fm']]);
P('colin-dale', 'Colin Dale', 'london', '1985–', 'Kiss FM, Abstrakt Dance', 'Kiss\'s techno show; the Detroit connection on London radio.', ['techno', 'rave'], [['played', 'kiss-fm']]);
P('colin-faver', 'Colin Faver', 'london', '1985–2015', 'Kiss FM, Camden Palace', 'Techno on Kiss before anyone; the Camden Palace DJ.', ['techno', 'rave'], [['played', 'kiss-fm']]);
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
C('music-institute', 'The Music Institute', 'detroit', '1988–89', '1315 Broadway. Juice bar, midnight to 9am, May 1988 to 24 November 1989; May closed it with "Strings of Life".', ['techno']);
C('tresor', 'Tresor', 'berlin', '1991–', 'The Wertheim vault from 13 March 1991 to 2005; the Kraftwerk power station from 2007.', ['techno'], [], ['Tresor Berlin']);
C('ufo', 'UFO', 'berlin', '1988–90', 'West Berlin\'s first acid/techno basement; Interfisch, Dr. Motte, Tanith.', ['techno']);
C('e-werk', 'E-Werk', 'berlin', '1993–97', 'A substation on Wilhelmstraße; the big-room Berlin 90s; Planet\'s successor.', ['techno'], [], ['Planet']);
C('bunker', 'Bunker', 'berlin', '1992–96', 'A Nazi air-raid shelter: hardcore and gabber. Now the Boros collection.', ['techno', 'rave']);
C('ostgut', 'Ostgut', 'berlin', '1998–2003', 'Snax\'s permanent home in a railway depot; Panorama Bar upstairs from 2000; closed 6 January 2003 after 30 hours.', ['techno']);
C('berghain', 'Berghain / Panorama Bar', 'berlin', '2004–', 'A 1953 power plant; Panorama Bar October 2004, the main floor December; Funktion-One; Klubnacht.', ['techno', 'house'], [], ['Panorama Bar']);
C('hard-wax', 'Hard Wax', 'berlin', '1989–', 'Mark Ernestus\'s record shop; the city\'s centre of gravity.', ['techno']);
C('watergate', 'Watergate', 'berlin', '2002–2024', 'On the Spree; minimal\'s big room; closed 31 December 2024.', ['techno']);
C('bar25', 'Bar25', 'berlin', '2004–10', 'The riverside after-hours of the minimal years.', ['techno']);
C('omen', 'Omen', 'frankfurt', '1988–98', 'Sven Väth\'s club on Junghofstraße; trance\'s birthplace.', ['techno']);
C('dorian-gray', 'Dorian Gray', 'frankfurt', '1978–2000', 'In the airport; Väth\'s first residency; open until Monday.', ['techno', 'house']);
C('que-club', 'The Que Club', 'birmingham', '1989–2002, 2010–17', 'A Methodist hall: House of God, Atomic Jam, Surgeon and Regis most weeks.', ['techno']);
C('house-of-god', 'House of God', 'birmingham', '1993–', 'Birmingham\'s hard techno night; Surgeon\'s residency.', ['techno']);
C('sub-club', 'Sub Club', 'glasgow', '1987–', 'Jamaica Street basement; Slam\'s Subculture since 1994.', ['techno', 'house']);
C('pure', 'Pure', 'edinburgh', '1990–2001', 'Twitch and Brainstorm; Mills and Clarke as regulars.', ['techno']);
C('the-orbit', 'The Orbit', 'leeds', '1991–2003', 'After Dark in Morley: every Detroit, Berlin and Birmingham name in a mill town.', ['techno'], [], ['Orbit']);
C('lost', 'Lost', 'london', '1991–', 'Steve Bicknell and Sheree Rashit\'s warehouse night; Jeff Mills\'s London home.', ['techno']);
C('fabric', 'fabric', 'london', '1999–', 'Three rooms under Smithfield; the bodysonic floor; closed September 2016, reopened January 2017.', ['techno', 'house']);
C('fold', 'Fold', 'london', '2018–', 'Canning Town, 24-hour licence, no photos.', ['techno']);
C('printworks', 'Printworks', 'london', '2017–23', 'The Press Halls in Canada Water.', ['techno']);
C('rex-club', 'Rex Club', 'paris', '1988–', 'Under the Grand Rex; Garnier\'s Wake Up.', ['techno', 'house']);
C('fuse', 'Fuse', 'brussels', '1994–', 'Belgium\'s techno temple.', ['techno']);
C('liquid-room', 'Liquid Room', 'tokyo', '1994–', 'Kabukichō then Ebisu; Mills, 28 October 1995.', ['techno']);
C('womb', 'Womb', 'tokyo', '2000–', 'Shibuya; the mirrorball the size of a car.', ['techno']);
C('bassiani', 'Bassiani', 'tbilisi', '2014–', 'Under the Dinamo stadium; raided May 2018.', ['techno']);
C('khidi', 'Khidi', 'tbilisi', '2016–', 'The harder, industrial counterpart.', ['techno']);
C('space', 'Space', 'ibiza', '1989–2016', 'Playa d\'en Bossa, the Terrace under the flight path; Carl Cox 2001–16; ENTER.; closed 2 October 2016.', ['techno', 'house'], [], ['Space Ibiza']);
C('amnesia', 'Amnesia', 'ibiza', '1976–', 'A farmhouse with no roof until 1990: Alfredo\'s Balearic terrace (house), Cocoon on Mondays from 2000 (techno).', ['house', 'techno', 'rave']);
C('pacha', 'Pacha', 'ibiza', '1973–', 'Ricardo Urgell\'s club in Ibiza Town; Music On from 2012.', ['house', 'techno']);
C('ku', 'Ku / Privilege', 'ibiza', '1978–', 'The biggest club in the world, open to the sky, a pool on the floor; Privilege from 1995.', ['house', 'rave'], [], ['Privilege']);
C('dc10', 'DC10', 'ibiza', '1999–', 'A shed by the runway; Circoloco Mondays.', ['house']);
C('cafe-del-mar', 'Café del Mar', 'ibiza', '1980–', 'San Antonio sunset; José Padilla.', ['house']);
C('warehouse', 'The Warehouse', 'chicago', '1977–82', 'Frankie Knuckles\'s club; the music was named after it.', ['house']);
C('music-box', 'The Music Box', 'chicago', '1982–87', 'Ron Hardy\'s club; the first floor for Acid Tracks.', ['house']);
C('paradise-garage', 'Paradise Garage', 'newyork', '1977–87', 'Larry Levan; the sound system and the congregation.', ['house']);
C('hacienda', 'The Haçienda', 'manchester', '1982–97', 'FAC 51; empty for years, then Nude (1986) and Hot (1988) made it Britain\'s first house club; closed by guns and debt.', ['house', 'rave'], [], ['Hacienda', 'FAC 51']);
C('shoom', 'Shoom', 'london', '1987–90', 'A Southwark fitness centre on Saturday nights; Danny and Jenni Rampling; 300 people who opened everything else.', ['house', 'rave']);
C('heaven', 'Heaven', 'london', '1979–', 'Under Charing Cross arches: Spectrum (1988), Rage (1988–93) — where jungle was invented.', ['rave', 'house'], [], ['Spectrum', 'Rage']);
C('spectrum', 'Spectrum', 'london', '1988–89', 'Paul Oakenfold\'s Monday at Heaven from April 1988: acid house\'s first big room.', ['rave', 'house']);
C('rage', 'Rage at Heaven', 'london', '1988–93', 'Fabio and Grooverider\'s Thursday: Belgian techno, then breaks at 45 rpm, then jungle.', ['rave'], [['in', 'london']]);
C('the-trip', 'The Trip', 'london', '1988', 'Nicky Holloway at the Astoria; the crowd dancing in the Charing Cross Road fountain.', ['rave', 'house']);
C('ministry-of-sound', 'Ministry of Sound', 'london', '1991–', 'Elephant and Castle; built around the sound system, Garage-style; the superclub as brand.', ['rave', 'house']);
C('the-end', 'The End', 'london', '1995–2009', 'Mr. C and Layo Paskin\'s club in a Victorian mail-horse stable at 18 West Central Street, designed by Layo\'s architect father Douglas: the booth on the floor, the system before the décor. Opened December 1995; Subterrain, Flavour, Superfreq, Trash; End Recordings; AKA next door from 1998. Closed with a 24-hour party on 24 January 2009.', ['techno', 'house', 'rave'], [], ['AKA', 'West Central Street']);
C('the-fridge', 'The Fridge', 'london', '1981–2010', 'Brixton: Love Muscle, Escape from Samsara (trance), the big rave nights.', ['rave']);
C('brixton-academy', 'Brixton Academy', 'london', '1983–', 'The all-nighters that put rave in a theatre.', ['rave']);
C('bagleys', 'Bagley\'s', 'london', '1991–2007', 'King\'s Cross warehouses: Slammin\' Vinyl, Pushca, the licensed rave\'s London home.', ['rave']);
C('paradise-club', 'The Paradise Club', 'london', '1991–', 'Islington; AWOL — A Way of Life — jungle\'s breeding ground.', ['rave']);
C('sanctuary', 'The Sanctuary', 'milton-keynes', '1990–2004', 'Helter Skelter and Dreamscape\'s arena; the hardcore cathedral.', ['rave']);
C('shelleys', 'Shelley\'s Laserdome', 'stoke', '1990–92', 'Sasha\'s residency; the North\'s rave club.', ['rave', 'house']);
C('quadrant-park', 'Quadrant Park', 'liverpool', '1990–91', 'Bootle; the North-West\'s first big legal all-nighter.', ['rave', 'house']);
C('eclipse', 'The Eclipse', 'coventry', '1990–92', 'Britain\'s first legal all-night rave club; Doc Scott\'s home.', ['rave']);
C('cream', 'Cream', 'liverpool', '1992–', 'Wolstenholme Square; the superclub; Creamfields from 1998.', ['house', 'rave']);
C('trade', 'Trade', 'london', '1990–2008', 'Turnmills, Sunday mornings; Tony De Vit; the gay after-hours that became hard house.', ['house', 'rave']);
C('front', 'Front', 'hamburg', '1983–97', 'Willi Prange and Philip Clarke\'s gay club; Klaus Stockhausen; Germany\'s first house room.', ['house']);
C('roxy', 'RoXY', 'amsterdam', '1987–99', 'Amsterdam\'s house temple; burned down in 1999.', ['house']);
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
E('raindance', 'Raindance', 'london', '1989–', 'Jenkins Lane warehouse, then licensed: the pioneer of the legal rave.', ['rave']);
E('fantazia', 'Fantazia', 'gloucestershire', '1991–', 'Stately homes, WestPoint, 25,000; then videos, albums and merchandise.', ['rave']);
E('helter-skelter', 'Helter Skelter', 'milton-keynes', '1989–', 'Dave Pratley\'s Sanctuary nights: hardcore, jungle and techno on one bill.', ['rave']);
E('dreamscape', 'Dreamscape', 'milton-keynes', '1991–', 'The Sanctuary; the tape packs every teenager owned.', ['rave']);
E('blackburn-raves', 'The Blackburn raves', 'blackburn', '1989–90', 'Warehouses, thousands every weekend, until the police broke it in 1990.', ['rave']);
E('amnesia-house', 'Amnesia House', 'coventry', '1988–', 'Coventry\'s crew; Biology; the Eclipse.', ['rave']);
E('awol', 'AWOL', 'london', '1991–', 'A Way of Life at the Paradise Club: jungle\'s home.', ['rave']);
E('slammin-vinyl', 'Slammin\' Vinyl', 'london', '1990s', 'Event and label; the harder sounds at Bagley\'s.', ['rave']);
E('second-summer', 'The Second Summer of Love', 'london', '1988–89', 'Acid house goes national: Shoom, Spectrum, the Trip, the Haçienda\'s Hot, the smiley, the tabloids.', ['rave', 'house']);
E('beanfield', 'The Battle of the Beanfield', 'wiltshire', '1985', 'Police against the Peace Convoy on the way to Stonehenge; the free festival\'s original wound.', ['rave']);
E('cja', 'The Criminal Justice and Public Order Act', 'london', '1994', 'Section 63: gatherings of 100+ playing music "wholly or predominantly characterised by the emission of a succession of repetitive beats".', ['rave', 'techno'], [], ['Criminal Justice Act', 'CJA']);
E('bright-bill', 'The Entertainments (Increased Penalties) Act', 'london', '1990', 'Graham Bright\'s bill: £20,000 fines and six months for unlicensed parties.', ['rave'], [], ['Bright Bill']);
E('teknival', 'The teknival', 'france', '1993–', 'Spiral Tribe\'s exile: free festivals across France and Europe.', ['rave', 'techno']);
E('reclaim-the-streets', 'Reclaim the Streets', 'london', '1995–', 'Sound systems and road protest: the party as occupation.', ['rave']);
E('creamfields', 'Creamfields', 'liverpool', '1998–', 'Cream\'s festival; the superclub outdoors.', ['house', 'rave']);
E('cocoon', 'Cocoon Ibiza', 'ibiza', '2000–19', 'Sven Väth\'s Monday at Amnesia: techno\'s first lasting Ibiza residency; the closing marathons.', ['techno'], [['at', 'amnesia']]);

/* ---------- pirate stations ---------- */
[['kiss-fm', 'Kiss FM', '1985–', 'Pirate from 1985, legal from 1990: Colin Dale, Colin Faver, Norman Jay, Graham Gold.', ['rave', 'techno', 'house']],
 ['centreforce', 'Centreforce 88.3', '1989–', 'The first acid house pirate; Jumpin\' Jack Frost; raided weekly.', ['rave']],
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
R('rec-planetrock', 'Afrika Bambaataa & Soulsonic Force', 'Planet Rock', 1982, null, ['techno'], 'Kraftwerk on an 808 in the Bronx: electro.', null, ['tr808'], 'g-electro');
R('rec-clear', 'Cybotron', 'Clear', 1983, null, ['techno'], 'Atkins and Davis; the first Detroit record that sounds like what followed.', 'juan-atkins', [], 'g-electro');
R('rec-noufos', 'Model 500', 'No UFO\'s', 1985, 'metroplex', ['techno'], 'The first techno record.', 'juan-atkins', ['tr909'], 'g-detroit');
R('rec-nudephoto', 'Rhythim Is Rhythim', 'Nude Photo', 1987, 'transmat', ['techno'], 'The open hat on the offbeat; Detroit\'s groove.', 'derrick-may', ['tr909'], 'g-detroit');
R('rec-strings', 'Rhythim Is Rhythim', 'Strings of Life', 1987, 'transmat', ['techno', 'rave', 'house'], 'Michael James\'s piano, a 909, no bassline; the record that closed the Music Institute and opened the Liquid Room.', 'derrick-may', ['tr909'], 'g-detroit');
R('rec-acidtracks', 'Phuture', 'Acid Tracks', 1987, 'trax', ['house', 'rave', 'techno'], 'The 303 twisted until it squealed; the crossing\'s founding record.', 'dj-pierre', ['tb303'], 'g-acidhouse');
R('rec-bigfun', 'Inner City', 'Big Fun', 1988, 'kms', ['techno', 'house'], 'Detroit in the UK top ten.', 'kevin-saunderson', [], 'g-detroit');
R('rec-technocomp', 'Various', 'Techno! The New Dance Sound of Detroit', 1988, 'network', ['techno'], 'The compilation that named the genre.', 'neil-rushton', [], 'g-detroit');
R('rec-voodooray', 'A Guy Called Gerald', 'Voodoo Ray', 1988, null, ['house', 'rave'], 'Manchester acid house; the first British dance classic.', 'a-guy-called-gerald', ['tb303', 'tr808'], 'g-acidhouse');
R('rec-pacific', '808 State', 'Pacific State', 1989, null, ['rave', 'techno', 'house'], 'Sax, birdsong and an 808: Manchester\'s Balearic techno.', '808-state', ['tr808']);
R('rec-chime', 'Orbital', 'Chime', 1989, null, ['rave', 'techno'], 'Recorded on a cassette deck in Sevenoaks; named for the M25.', 'orbital', [], 'g-hardcore');
R('rec-testone', 'Sweet Exorcist', 'Testone', 1990, 'warp', ['techno'], 'Cabaret Voltaire\'s Richard Kirk: bleep\'s first record.', null, [], 'g-bleep');
R('rec-lfo', 'LFO', 'LFO', 1990, 'warp', ['techno', 'rave'], 'UK No. 12; sub-bass under the kick.', null, [], 'g-bleep');
R('rec-forgemasters', 'Forgemasters', 'Track With No Name', 1989, 'warp', ['techno'], 'Warp 001.', null, [], 'g-bleep');
R('rec-energyflash', 'Joey Beltram', 'Energy Flash', 1990, 'rs', ['techno', 'rave'], 'The rave-techno hinge; "ecstasy, ecstasy".', 'joey-beltram', [], 'g-hardcore');
R('rec-mentasm', 'Second Phase', 'Mentasm', 1991, 'rs', ['rave', 'techno'], 'Beltram and Mundo Muzique invent the hoover.', 'joey-beltram', [], 'g-hardcore');
R('rec-dominator', 'Human Resource', 'Dominator', 1991, null, ['rave'], 'Rotterdam; the hoover as a riff; "I\'m bigger and bolder and rougher and tougher".', null, [], 'g-hardcore');
R('rec-anasthasia', 'T99', 'Anasthasia', 1991, null, ['rave'], 'Belgian rave\'s biggest stab.', null, [], 'g-hardcore');
R('rec-charly', 'The Prodigy', 'Charly', 1991, null, ['rave'], 'A public-information cat sample at 140.', 'the-prodigy', ['sampler'], 'g-hardcore');
R('rec-activ8', 'Altern 8', 'Activ 8 (Come With Me)', 1991, 'network', ['rave'], 'Chemical suits in the charts.', 'altern-8', ['sampler'], 'g-hardcore');
R('rec-raggatip', 'SL2', 'On a Ragga Tip', 1992, null, ['rave'], 'Slipmatt and Lime: ragga vocal over a break, UK No. 2.', 'slipmatt', ['sampler'], 'g-hardcore');
R('rec-ravingimraving', 'Shut Up and Dance', 'Raving I\'m Raving', 1992, 'shut-up-and-dance', ['rave'], 'UK No. 2 and withdrawn in a week over the Marc Cohn sample.', 'shut-up-and-dance-p', ['sampler'], 'g-hardcore');
R('rec-weareie', 'Lennie De Ice', 'We Are I.E.', 1991, null, ['rave'], 'Reggae bass under a breakbeat: proto-jungle.', null, ['sampler'], 'g-jungle');
R('rec-somejustice', 'Urban Shakedown', 'Some Justice', 1992, null, ['rave'], 'Mickey Finn and Aphrodite; the hardcore anthem.', 'mickey-finn', ['sampler'], 'g-hardcore');
R('rec-terminator', 'Metalheads', 'Terminator', 1992, 'reinforced', ['rave'], 'Goldie and 4hero\'s timestretch: jungle begins.', 'goldie', ['sampler'], 'g-jungle');
R('rec-28gun', 'A Guy Called Gerald', '28 Gun Bad Boy', 1992, null, ['rave'], 'Manchester\'s first jungle record.', 'a-guy-called-gerald', [], 'g-jungle');
R('rec-valley', 'Origin Unknown', 'Valley of the Shadows', 1993, null, ['rave'], 'Andy C and Ant Miles: "31 seconds"; jungle\'s anthem.', null, [], 'g-jungle');
R('rec-helicopter', 'Deep Blue', 'The Helicopter Tune', 1993, 'moving-shadow', ['rave'], 'Sean O\'Keeffe\'s break; the drum & bass hinge.', null, [], 'g-jungle');
R('rec-papua', 'The Future Sound of London', 'Papua New Guinea', 1991, null, ['rave', 'techno'], 'Lisa Gerrard and a breakbeat; the rave sublime.', null, ['sampler']);
R('rec-hardcoreuproar', 'Together', 'Hardcore Uproar', 1990, null, ['rave'], 'Jon Dasilva and Suddi Raval: recorded with the Haçienda crowd.', null, [], 'g-hardcore');
R('rec-loaded', 'Primal Scream', 'Loaded (Weatherall remix)', 1990, null, ['house', 'rave'], 'The rock band remade for the dancefloor.', 'andrew-weatherall');
R('rec-spiraltribe', 'Spiral Tribe', 'Forward the Revolution', 1992, null, ['rave', 'techno'], 'The sound system on vinyl; Big Life signed them after Castlemorton.', 'spiral-tribe', [], 'g-acidtek');
R('rec-sonicdestroyer', 'X-101', 'Sonic Destroyer', 1991, 'tresor-records', ['techno'], 'Tresor 001: UR in the vault.', 'ur', [], 'g-berlin');
R('rec-finalfrontier', 'Underground Resistance', 'The Final Frontier', 1991, null, ['techno'], 'UR\'s manifesto in sound.', 'ur', [], 'g-detroit');
R('rec-jupiterjazz', 'Galaxy 2 Galaxy', 'Jupiter Jazz', 1993, null, ['techno'], 'UR\'s hi-tech jazz.', 'ur', [], 'g-detroit');
R('rec-bugbassbin', 'Innerzone Orchestra', 'Bug in the Bassbin', 1992, 'planet-e', ['techno'], 'Carl Craig; the record jungle producers pitched up.', 'carl-craig');
R('rec-spastik', 'Plastikman', 'Spastik', 1993, 'plus8', ['techno'], 'A 909 and nothing else.', 'richie-hawtin', ['tr909'], 'g-minimal');
R('rec-bubble', 'Drexciya', 'Bubble Metropolis', 1993, null, ['techno'], 'The undersea nation.', 'drexciya', [], 'g-electro');
R('rec-minimalnation', 'Robert Hood', 'Minimal Nation', 1994, 'm-plant', ['techno'], 'Minimal techno, named.', 'robert-hood', ['tr909'], 'g-minimal');
R('rec-phylyps', 'Basic Channel', 'Phylyps Trak', 1993, null, ['techno'], 'Dub techno\'s founding 12".', 'basic-channel', [], 'g-dub');
R('rec-m4', 'Maurizio', 'M4', 1995, null, ['techno'], 'One chord, forever.', 'basic-channel', [], 'g-dub');
R('rec-marusha', 'Marusha', 'Somewhere Over the Rainbow', 1994, null, ['techno', 'rave'], 'Berlin\'s rave-pop moment, Love Parade\'s soundtrack.', null, [], 'g-trance');
R('rec-speaktome', 'Regis', 'Speak to Me', 1996, 'downwards', ['techno'], 'Birmingham\'s dry hammer.', 'regis', [], 'g-bham');
R('rec-magneze', 'Surgeon', 'Magneze', 1995, 'downwards', ['techno'], 'Surgeon\'s first; the Birmingham sound.', 'surgeon', [], 'g-bham');
R('rec-red2', 'Dave Clarke', 'Red 2 (Wisdom to the Wise)', 1994, null, ['techno'], 'The Baron\'s hardest cut.', 'dave-clarke');
R('rec-positiveeducation', 'Slam', 'Positive Education', 1993, 'soma', ['techno'], 'Glasgow\'s techno anthem.', 'slam');
R('rec-freekfunk', 'Luke Slater', 'Freek Funk', 1997, null, ['techno'], 'Peacefrog; machine funk at album length.', 'luke-slater');
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
R('rec-subzero', 'Ben Klock', 'Subzero', 2007, 'ostgut-ton', ['techno'], 'The rumble, defined.', 'ben-klock', [], 'g-berghain');
R('rec-translation', 'Marcel Dettmann', 'Translation', 2010, 'ostgut-ton', ['techno'], 'Dettmann\'s album opener.', 'marcel-dettmann', [], 'g-berghain');
R('rec-tempsusp', 'Planetary Assault Systems', 'Temporary Suspension', 2009, 'ostgut-ton', ['techno'], 'Polymeters on Ostgut Ton.', 'luke-slater', [], 'g-hypnotic');
R('rec-twinsvirgo', 'Voices From The Lake', 'Twins in Virgo', 2012, null, ['techno'], 'The hypnotic school\'s statement.', 'donato-dozzy', [], 'g-hypnotic');
R('rec-whytheyhide', 'Blawan', 'Why They Hide Their Bodies Under My Garage?', 2012, null, ['techno'], 'A vocal sample and a distorted kick; the decade\'s UK techno hit.', 'blawan', [], 'g-industrial');
R('rec-sharingstuff', 'Karenn', 'Sharing the Stuff', 2011, null, ['techno'], 'Blawan and Pariah\'s hardware techno.', 'blawan');
R('rec-ghettokraviz', 'Nina Kraviz', 'Ghetto Kraviz', 2012, null, ['techno'], 'Acid vocals from Siberia.', 'nina-kraviz');
R('rec-qualm', 'Helena Hauff', 'Qualm', 2018, null, ['techno'], 'Electro and acid, no computer.', 'helena-hauff', [], 'g-electro');
R('rec-yourmind', 'Adam Beyer & Bart Skils', 'Your Mind', 2018, 'drumcode', ['techno'], 'The main-stage techno record of the decade.', 'adam-beyer', [], 'g-peak');
R('rec-doppler', 'Charlotte de Witte', 'Doppler', 2019, null, ['techno'], 'The Belgian wave\'s anthem.', 'charlotte-de-witte', [], 'g-peak');
R('rec-hypnotized', 'Amelie Lens', 'Hypnotized', 2019, null, ['techno'], 'Peak-time acid.', 'amelie-lens', [], 'g-peak');
R('rec-waterfall', 'Rrose', 'Waterfall', 2012, null, ['techno'], 'Hypnotic, mutating.', 'rrose', [], 'g-hypnotic');
R('rec-999', '999999999', '300000003', 2019, null, ['techno', 'rave'], 'Hard techno\'s acid-rave anthem.', null, [], 'g-hard');
R('rec-ihm', 'I Hate Models', 'Daydream', 2018, null, ['techno'], 'The French industrial-trance hinge.', null, [], 'g-hard');
R('rec-kobosil', 'Kobosil', '91', 2016, 'ostgut-ton', ['techno'], 'Berghain to hard techno in one album.', null, [], 'g-industrial');
R('rec-ifeelit', 'Carl Cox', 'I Want You (Forever)', 1991, null, ['rave'], 'Cox\'s rave hit, UK No. 23.', 'carl-cox', [], 'g-hardcore');

/* ---------- landmark sets ---------- */
const SET = (id, title, city, years, blurb, strands, rel = []) => N(id, 'set', title, { city, years, blurb, strands, rel: [['in', city], ...rel] });
SET('set-musicinstitute', 'Derrick May at the Music Institute', 'detroit', '1988', 'Acid, Chicago and the first Detroit records, mixed by the man who made them, for the crowd they were made for.', ['techno'], [['at', 'music-institute']]);
SET('set-liquidroom', 'Jeff Mills — Live at the Liquid Room, Tokyo', 'tokyo', '28 October 1995', 'Released May 1996: around seventy records in 67 minutes across three decks. Confirmed tracks include Surgeon "Argon", Robert Armani "Wet Floor", X-102 "Intro", "Humana", Ken Ishii "Extra" (Luke Slater remix), Jonzon & Hell "Lifeform" and "Strings of Life".', ['techno'], [['at', 'liquid-room']]);
SET('set-packard', 'Plastikman at the Packard Plant', 'detroit', '1994', 'Hawtin\'s illegal parties in the abandoned car factory: a 303, a 909 and "Spastik" live.', ['techno']);
SET('set-de9', 'Richie Hawtin — Decks, EFX & 909 / DE9', 'windsor', '1999 / 2001', 'From a 909 and effects over vinyl to hundreds of loops on Final Scratch: the laptop DJ\'s founding documents.', ['techno']);
SET('set-garnierrex', 'Laurent Garnier — Rex Club all-nighters', 'paris', '1992–', 'Seven and eight hours from jazz to hard techno and back; the "journey" set.', ['techno'], [['at', 'rex-club']]);
SET('set-cocoon', 'Sven Väth — Cocoon closing, Amnesia', 'ibiza', '2000–2019', 'The last Monday of every summer under the ice cannons.', ['techno'], [['at', 'amnesia']]);
SET('set-coxspace', 'Carl Cox — The Final Chapter, Space', 'ibiza', '20 September 2016', 'Nine-plus hours on vinyl to end fifteen summers; "The Bells" and "Teckno Drome" in it; the club closed two weeks later.', ['techno', 'house'], [['at', 'space']]);
SET('set-klubnacht', 'Klock & Dettmann — Klubnacht closings', 'berlin', '2005–', 'Unrecorded by rule; the Berghain 02 and 04 mixes are the nearest document.', ['techno'], [['at', 'berghain']]);
SET('set-exhibitionist', 'Jeff Mills — Exhibitionist', 'detroit', '2004', 'Three decks and a 909 filmed from above.', ['techno']);
SET('set-kraviz', 'Nina Kraviz — Dekmantel sets', 'amsterdam', '2014–', 'Acid and Russian records broadcast to millions.', ['techno'], [['at', 'dekmantel']]);
SET('set-surgeonbr', 'Surgeon — Boiler Room / fabric', 'london', '2010s', 'Modular, live-edited, relentless.', ['techno'], [['at', 'fabric']]);
SET('set-rage', 'Fabio & Grooverider at Rage', 'london', '1988–93', 'Thursday at Heaven: Belgian techno, then breaks pitched to +8, then jungle. The set that split rave.', ['rave'], [['at', 'heaven']]);
SET('set-sunrise5000', 'Sunrise 5000, White Waltham', 'london', '24 June 1989', 'Eleven thousand in an aircraft hangar; the Sun\'s "Spaced Out" front page and the political panic that followed.', ['rave'], [['at', 'sunrise']]);
SET('set-castlemorton', 'Spiral Tribe at Castlemorton', 'worcestershire', 'May 1992', 'Six days, the Tribe\'s rig running the whole time; the recording that ended the free-party era.', ['rave', 'techno'], [['at', 'castlemorton']]);

const NODE_PUSH_REL = (id, rel) => { const n = NODES.find(x => x.id === id); if (n) n.rel.push(rel); };

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
P('craig-richards', 'Craig Richards', 'london', '1999–', 'fabric, Tyrant', 'fabric\'s resident for twenty years; the slow, strange, Friday-night room.', ['techno', 'house'], [['played', 'fabric']]);
P('t-linder', 'T.Linder', 'detroit', '2002–', 'Detroit Techno Militia', 'Tom Linder: "No Retreat. No Surrender" (2002), "Liver-Noise"; the Militia\'s most-travelled DJ; Hastings 2023, 2024, 2026.', ['techno'], [['member', 'detroit-techno-militia'], ['played', 'dtm-hastings'], ['played', 'movement']], ['Tom Linder']);
P('dj-seoul', 'DJ Seoul', 'detroit', '2000s–', 'Detroit Techno Militia', 'Half of DTM 2x4 with T.Linder; the Rust Belt Tour; Hastings, Edinburgh and Amsterdam over one Christmas week in 2024.', ['techno'], [['member', 'detroit-techno-militia'], ['played', 'dtm-hastings'], ['played', 'movement']]);
C('camden-palace', 'Camden Palace', 'london', '1982–2004', 'The Camden theatre where Colin Faver and Eddie Richards played Detroit and Chicago to London first, with Mr. C on the mic from 1986. Now KOKO.', ['techno', 'house'], [], ['KOKO']);
C('clink-street', 'RIP at Clink Street', 'london', '1988', 'Paul Stone and Lu Vukovic\'s Friday-and-Saturday parties in a Southwark warehouse beside the old Clink prison: Mr. C and Eddie Richards resident, Kid Batchelor; the dark twin of Shoom, and where London heard Detroit. "Revolution in Progress".', ['techno', 'house', 'rave'], [], ['Clink Street', 'RIP']);
C('dungeons', 'The Dungeons', 'london', '1989–91', 'Lea Bridge Road: Mr. C\'s Base (1989) and the East London acid parties.', ['techno', 'rave'], [], ['Base']);
C('club-uk', 'Club UK (Final Frontier)', 'london', '1993–96', 'Wandsworth: Final Frontier, the purist techno night of the mid-90s.', ['techno'], [], ['Final Frontier']);
C('turnmills', 'Turnmills', 'london', '1990–2008', 'Clerkenwell: Trade on Sunday mornings (house strand), The Gallery, and most of London\'s techno guests in between.', ['house', 'techno'], []);
C('corsica-studios', 'Corsica Studios', 'london', '2002–', 'Two rooms under the railway arches at Elephant and Castle; the small club that booked everything first.', ['techno', 'house'], []);
C('the-pig', 'The Pig, Hastings', 'hastings', '2010s–', 'The Hastings venue where Detroit Techno Militia played with the Hastings Techno Militia on 27 December 2024.', ['techno'], []);
E('wiggle', 'Wiggle', 'london', '1994–', 'Terry Francis and Nathan Coles\'s party: the night tech-house got its name.', ['house', 'techno'], [['in', 'london']]);
E('subterrain', 'Subterrain', 'london', '1995–2002', 'Mr. C\'s house-and-techno night at The End; the "100% Unreleased" mix (2000).', ['techno', 'house'], [['at', 'the-end']]);
E('catchmydrift', 'Catchmydrift?', 'hastings', '2023–', 'The Hastings promoter that brought Detroit Techno Militia to the coast — Easter Sunday 2023, December 2024, Easter Sunday 2026 — and incubated the Hastings Techno Militia.', ['techno'], [['founded', 'hastings-techno-militia']]);
E('dtm-hastings', 'Detroit Techno Militia in Hastings', 'hastings', '2023–', 'Easter Sunday 2023 (the first), 27 December 2024 at The Pig, Easter Sunday 5 April 2026 at the Deep End, Brewing Brothers Courtyard: T.Linder, DJ Seoul and J.Garcia from the 313, with DJK, Japhy and Rob Miller.', ['techno'], [['at', 'the-pig']]);
R('rec-page67', 'Myster-E', 'Page 67', 1987, null, ['house', 'techno'], 'Mr. C and Eddie Richards\'s first record: London deep house, August 1987.', 'mr-c', [], 'g-techhouse');
R('rec-ebeneezer', 'The Shamen', 'Ebeneezer Goode', 1992, null, ['rave'], 'Mr. C on the mic; UK No. 1; the pop money that built The End.', 'mr-c', []);
R('rec-lovestory', 'Layo & Bushwacka!', 'Love Story', 2002, 'end-recordings', ['house', 'techno'], 'The End\'s anthem: tech-house with a tune.', 'layo-bushwacka', [], 'g-techhouse');
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
 ['g-intelligent', 'Intelligent / atmospheric drum & bass', '1994–98', 'london', ['jungle'], 'Bukem, Speed and Good Looking: jazz pads and Rhodes over the breaks.', null, ['j3']],
 ['g-techstep', 'Techstep', '1996–99', 'london', ['jungle'], 'No U Turn, Virus, Ed Rush & Optical: the dark, techno-derived drum & bass.', 'Drum & bass 1998', ['j3']],
 ['g-liquid', 'Liquid funk', '2000–', 'london', ['jungle'], 'Fabio\'s name for the soulful, musical strand: Hospital, High Contrast, Calibre.', null, ['j4']],
 ['g-neurofunk', 'Neurofunk', '1998–', 'london', ['jungle'], 'Techstep refined into sound design: Noisia, Phace, the basslines as instruments.', null, ['j4']],
 ['g-jumpup', 'Jump-up', '1995–', 'london', ['jungle'], 'Hype\'s Ganja Kru, Aphrodite, Playaz: the bassline hook and the rewind.', null, ['j4']],
 ['g-frankfurt-trance', 'Frankfurt trance', '1990–95', 'frankfurt', ['trance'], 'Dance 2 Trance, Jam & Spoon, Harthouse, Eye Q: techno\'s euphoric exit.', 'Trance 1993', ['t1']],
 ['g-goa', 'Goa / psytrance', '1990–', 'goa', ['trance'], 'Anjuna beach, Goa Gil, Hallucinogen, Infected Mushroom: the psychedelic branch.', null, ['t2']],
 ['g-uplifting', 'Uplifting trance', '1996–', 'netherlands', ['trance'], 'The breakdown, the supersaw, the key change: Tiësto, Armin, Ferry Corsten, Above & Beyond.', 'Trance 1999', ['t3']],
 ['g-progressive', 'Progressive house / trance', '1992–', 'london', ['trance', 'house'], 'Sasha & Digweed, Leftfield, Hooj Choons: long, building, British.', null, ['t3']],
 ['g-hardtrance', 'Hard trance', '1993–', 'frankfurt', ['trance', 'techno'], 'Harder kicks, faster, Scot Project and Yoji; revived inside 2020s hard techno.', null, ['t4']],
 ['g-deephouse', 'Deep house', '1985–', 'chicago', ['house'], 'Larry Heard\'s "Can You Feel It": chords, warmth, the jazz line of house.', null, ['hh1']],
 ['g-garage', 'Garage / US garage', '1980s–', 'newyork', ['house'], 'The Paradise Garage lineage: vocals, gospel, Todd Terry, Masters at Work.', null, ['hh2']],
 ['g-ukgarage', 'UK garage', '1995–2001', 'london', ['house', 'rave'], 'Speed garage and 2-step: US garage at +8 with jungle\'s MCs and bass.', null, ['hh6']],
 ['g-frenchtouch', 'French touch', '1995–2000', 'paris', ['house'], 'Daft Punk, Cassius, Stardust: filtered disco loops.', null, ['hh6']]
].forEach(([id, t, y, c, s, b, g, ch]) => { const n = N(id, 'genre', t, { years: y, city: c, strands: s, blurb: b, rel: [['in', c], ...ch.map(x => ['told', x])], color: s[0] === 'jungle' ? '--samp' : s[0] === 'trance' ? '--synth' : '--drums', q: t }); n.preset = g; });
[['g-hardcore', 'g-raggajungle'], ['g-jungle', 'g-raggajungle'], ['g-jungle', 'g-intelligent'], ['g-jungle', 'g-techstep'], ['g-bham', 'g-techstep'], ['g-intelligent', 'g-liquid'], ['g-techstep', 'g-neurofunk'], ['g-jungle', 'g-jumpup'], ['g-trance', 'g-frankfurt-trance'], ['g-acidhouse', 'g-goa'], ['g-frankfurt-trance', 'g-uplifting'], ['g-house', 'g-progressive'], ['g-frankfurt-trance', 'g-hardtrance'], ['g-hardtrance', 'g-hard'], ['g-house', 'g-deephouse'], ['g-house', 'g-garage'], ['g-garage', 'g-ukgarage'], ['g-jungle', 'g-ukgarage'], ['g-house', 'g-frenchtouch'], ['g-ukgarage', 'g-jungle']].forEach(([a, b]) => NODE_PUSH_REL(b, ['from', a]));

/* ---------- labels ---------- */
[['metalheadz', 'Metalheadz', '1994', 'london', 'Goldie, Kemistry and Storm; the Blue Note Sundays; the drum & bass label.', ['jungle']],
 ['good-looking', 'Good Looking', '1991', 'london', 'LTJ Bukem\'s atmospheric label; Logical Progression.', ['jungle']],
 ['v-recordings', 'V Recordings', '1993', 'london', 'Bryan Gee and Jumpin\' Jack Frost; Roni Size and the Bristol crew\'s early home.', ['jungle']],
 ['full-cycle', 'Full Cycle', '1993', 'bristol', 'Roni Size, Krust, Die, Suv: Bristol\'s drum & bass.', ['jungle']],
 ['ram', 'RAM Records', '1992', 'hornchurch', 'Andy C and Ant Miles; from "Valley of the Shadows" to the biggest brand in drum & bass.', ['jungle']],
 ['hospital', 'Hospital Records', '1996', 'london', 'Tony Colman (London Elektricity) and Chris Goss; liquid funk\'s house.', ['jungle']],
 ['virus', 'Virus Recordings', '1997', 'london', 'Ed Rush & Optical; techstep\'s laboratory.', ['jungle']],
 ['no-u-turn', 'No U Turn', '1992', 'london', 'Nico Sykes; Trace, Ed Rush; the birthplace of techstep.', ['jungle']],
 ['ganja', 'Ganja Records / Playaz', '1994', 'london', 'DJ Hype\'s labels; jump-up.', ['jungle']],
 ['congo-natty-label', 'Congo Natty', '1994', 'london', 'Rebel MC\'s ragga jungle label.', ['jungle']],
 ['eye-q', 'Eye Q', '1991', 'frankfurt', 'Sven Väth, Heinz Roth, Matthias Hoffmann: Frankfurt trance\'s first label; Cygnus X, Energy 52.', ['trance']],
 ['mfs', 'MFS', '1990', 'berlin', 'Mark Reeder\'s Masterminded For Success: Paul van Dyk, Cosmic Baby, Berlin trance.', ['trance']],
 ['platipus', 'Platipus', '1993', 'london', 'Art of Trance, Union Jack: British trance.', ['trance']],
 ['hooj-choons', 'Hooj Choons', '1991', 'london', 'Progressive house and trance\'s UK label; Hybrid, Tilt, Lustral.', ['trance']],
 ['perfecto', 'Perfecto', '1989', 'london', 'Paul Oakenfold\'s label; Grace, BT, the Goa mix era.', ['trance']],
 ['dragonfly', 'Dragonfly', '1993', 'london', 'Youth\'s Goa trance label; Hallucinogen\'s first records.', ['trance']],
 ['tip', 'TIP Records', '1994', 'london', 'Raja Ram and Graham Wood: The Infinity Project; Goa to psytrance.', ['trance']],
 ['black-hole', 'Black Hole Recordings', '1997', 'netherlands', 'Tiësto and Arny Bink: the Dutch trance factory.', ['trance']],
 ['anjunabeats', 'Anjunabeats', '2000', 'london', 'Above & Beyond\'s label; named for the Goa beach.', ['trance']],
 ['armada', 'Armada Music', '2003', 'amsterdam', 'Armin van Buuren\'s label; A State of Trance.', ['trance']],
 ['dj-international', 'DJ International', '1985', 'chicago', 'Rocky Jones\'s label: "Jack Your Body", "Move Your Body", Chip E.', ['house']],
 ['strictly-rhythm', 'Strictly Rhythm', '1989', 'newyork', 'New York\'s house factory of the 90s.', ['house']],
 ['nervous', 'Nervous Records', '1991', 'newyork', 'Masters at Work\'s home.', ['house']],
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
P2('dj-rap', 'DJ Rap', 'london', '1990–', 'Proper Talkin\'', 'Charissa Saverio; the first woman headliner in jungle.', ['jungle'], []);
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
P2('hardfloor', 'Hardfloor', 'dusseldorf', '1991–', 'Harthouse', 'Oliver Bondzio and Ramon Zenker: "Acperience 1" (1992), acid as trance\'s engine.', ['trance', 'techno'], [['made', 'rec-acperience']]);
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
P2('jesse-saunders', 'Jesse Saunders', 'chicago', '1984–', 'Jes Say', '"On and On" (1984): the first house record pressed.', ['house'], [['made', 'rec-onandon']]);
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
C2('blue-note', 'The Blue Note', 'london', '1995–98', 'Hoxton Square; Metalheadz Sunday Sessions: the drum & bass room.', ['jungle']);
C2('speed', 'Speed', 'london', '1994–96', 'The Mars Bar, Covent Garden; Bukem and Fabio\'s Thursday: atmospheric drum & bass.', ['jungle']);
C2('bar-rumba', 'Bar Rumba (Movement)', 'london', '1997–2005', 'Bryan Gee\'s Thursday; drum & bass\'s weekly.', ['jungle']);
C2('lakota', 'Lakota', 'bristol', '1990s', 'Bristol\'s jungle room; Full Cycle\'s home.', ['jungle']);
C2('gatecrasher', 'Gatecrasher', 'sheffield', '1996–2007', 'The Republic; the "Gatecrasher kids" with their cyber-hair; trance\'s cathedral.', ['trance']);
C2('godskitchen', 'Godskitchen', 'birmingham', '1994–', 'Code, the Que Club; Birmingham\'s trance.', ['trance']);
C2('anjuna', 'Anjuna beach', 'goa', '1970s–', 'The full-moon parties; Goa Gil; where trance went psychedelic.', ['trance']);
C2('trance-energy', 'Trance Energy', 'utrecht', '1999–2011', 'The Jaarbeurs; the Dutch trance arena.', ['trance']);
C2('eden', 'Eden', 'ibiza', '1999–', 'San Antonio; Judge Jules\'s Judgement Sundays.', ['trance', 'house']);
C2('twilo', 'Twilo', 'newyork', '1995–2001', 'Sasha and Digweed\'s monthly; the Phazon sound system.', ['trance', 'house']);
C2('wbmx', 'WBMX', 'chicago', '1980s', 'The Hot Mix 5\'s radio station: house to the whole city.', ['house']);
C2('power-plant', 'The Power Plant', 'chicago', '1983–86', 'Frankie Knuckles after the Warehouse.', ['house']);
C2('the-loft', 'The Loft', 'newyork', '1970–', 'David Mancuso\'s invitation-only parties; the root of the Garage.', ['house']);
C2('glorys', 'Glory\'s', 'ibiza', '1970s–90s', 'A racing stadium turned club before Ku and Amnesia; Bowie, Mercury and Grace Jones.', ['house']);
C2('es-paradis', 'Es Paradís', 'ibiza', '1975–', 'San Antonio\'s pyramid; the water parties.', ['house']);
C2('cafe-mambo', 'Café Mambo', 'ibiza', '1994–', 'The Sunset Strip\'s other bar; Radio 1\'s Ibiza home.', ['house']);
C2('future', 'Future', 'london', '1988', 'Oakenfold\'s Thursday at Heaven: the Balearic night.', ['house', 'rave']);
C2('flying', 'Flying', 'london', '1989–', 'Charlie Chester\'s club: Balearic into acid house.', ['house']);
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
R2('rec-mrkirk', '4hero', 'Mr Kirk\'s Nightmare', 1990, 'reinforced', ['rave', 'jungle'], 'A police phone call and a breakbeat: hardcore\'s darkest early record.', '4hero', 'g-hardcore');
R2('rec-renegadesnares', 'Omni Trio', 'Renegade Snares', 1993, 'moving-shadow', ['jungle'], 'Piano and chopped breaks; the template for everything atmospheric.', 'omni-trio', 'g-jungle');
R2('rec-incredible', 'M-Beat feat. General Levy', 'Incredible', 1994, null, ['jungle'], 'UK No. 8; the ragga jungle crossover and the scene\'s backlash against it.', 'general-levy', 'g-raggajungle');
R2('rec-originalnuttah', 'Shy FX & UK Apachi', 'Original Nuttah', 1994, null, ['jungle'], 'Ragga jungle\'s anthem; the rewind record.', 'shy-fx', 'g-raggajungle');
R2('rec-terrorist', 'Renegade', 'Terrorist', 1994, null, ['jungle'], 'Ray Keith\'s dark jungle classic.', 'ray-keith', 'g-jungle');
R2('rec-innercitylife', 'Goldie', 'Inner City Life', 1994, null, ['jungle'], 'Diane Charlemagne\'s vocal; Timeless\'s single; drum & bass as song.', 'goldie', 'g-jungle');
R2('rec-music', 'LTJ Bukem', 'Music', 1993, 'good-looking', ['jungle'], 'Atmospheric drum & bass begins.', 'ltj-bukem', 'g-intelligent');
R2('rec-pulpfiction', 'Alex Reece', 'Pulp Fiction', 1995, 'metalheadz', ['jungle'], 'The two-step break; jazzstep.', 'alex-reece', 'g-intelligent');
R2('rec-circles', 'Adam F', 'Circles', 1995, null, ['jungle'], 'Drum & bass in the Top 20 (1997 reissue).', 'adam-f', 'g-intelligent');
R2('rec-supersharpshooter', 'Ganja Kru', 'Super Sharp Shooter', 1996, 'ganja', ['jungle'], 'Hype, Zinc and Pascal: jump-up\'s anthem.', 'dj-hype', 'g-jumpup');
R2('rec-brownpaperbag', 'Roni Size / Reprazent', 'Brown Paper Bag', 1997, null, ['jungle'], 'Double bass, Mercury Prize, drum & bass as album music.', 'roni-size', 'g-jungle');
R2('rec-nitenichiryu', 'Photek', 'Ni Ten Ichi Ryu', 1997, null, ['jungle'], 'Two-sword technique; breaks as calligraphy.', 'photek', 'g-techstep');
R2('rec-wormhole', 'Ed Rush & Optical', 'Wormhole', 1998, 'virus', ['jungle'], 'Techstep\'s album.', 'ed-rush-optical', 'g-techstep');
R2('rec-bodyrock', 'Shimon & Andy C', 'Body Rock', 1999, 'ram', ['jungle'], 'RAM\'s anthem; the dancefloor drum & bass of the 2000s begins.', 'andy-c', 'g-jungle');
R2('rec-thenine', 'Bad Company', 'The Nine', 1999, null, ['jungle'], 'Techstep goes stadium.', null, 'g-techstep');
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
R2('rec-lsd', 'Hallucinogen', 'LSD', 1995, 'dragonfly', ['trance'], 'Goa trance\'s masterpiece.', 'simon-posford', 'g-goa');
R2('rec-offshore', 'Chicane', 'Offshore', 1996, null, ['trance'], 'Balearic trance.', 'chicane', 'g-uplifting');
R2('rec-flamingjune', 'BT', 'Flaming June', 1997, 'perfecto', ['trance'], 'American trance\'s finest.', 'bt', 'g-uplifting');
R2('rec-binaryfinary', 'Binary Finary', '1998', 1998, null, ['trance'], 'The year as a title; Gatecrasher\'s anthem.', null, 'g-uplifting');
R2('rec-universalnation', 'Push', 'Universal Nation', 1998, null, ['trance'], 'M.I.K.E.\'s Belgian trance.', null, 'g-uplifting');
R2('rec-outoftheblue', 'System F', 'Out of the Blue', 1999, null, ['trance'], 'Ferry Corsten; the Dutch sound arrives.', 'ferry-corsten', 'g-uplifting');
R2('rec-communication', 'Armin van Buuren', 'Communication', 1999, null, ['trance'], 'Armin\'s first.', 'armin-van-buuren', 'g-uplifting');
R2('rec-airwave', 'Rank 1', 'Airwave', 1999, null, ['trance'], 'Trance Energy\'s anthem.', null, 'g-uplifting');
R2('rec-sandstorm', 'Darude', 'Sandstorm', 1999, null, ['trance'], 'Finland; the meme; the biggest-selling trance 12".', null, 'g-uplifting');
R2('rec-adagio', 'Tiësto', 'Adagio for Strings', 2005, 'black-hole', ['trance'], 'Barber at 140; trance\'s peak and its exit.', 'tiesto', 'g-uplifting');
R2('rec-sunandmoon', 'Above & Beyond', 'Sun & Moon', 2011, 'anjunabeats', ['trance'], 'Group Therapy; the 2010s trance anthem.', 'above-beyond', 'g-uplifting');
R2('rec-madagascar', 'Art of Trance', 'Madagascar', 1998, 'platipus', ['trance'], 'British trance\'s classic.', null, 'g-uplifting');
/* house */
R2('rec-onandon', 'Jesse Saunders', 'On and On', 1984, null, ['house'], 'The first house record pressed.', 'jesse-saunders', 'g-house');
R2('rec-moveyourbody', 'Marshall Jefferson', 'Move Your Body', 1986, 'trax', ['house'], 'The House Music Anthem; the piano.', 'marshall-jefferson', 'g-house');
R2('rec-canyoufeelit', 'Mr. Fingers', 'Can You Feel It', 1986, 'trax', ['house'], 'Deep house begins.', 'larry-heard', 'g-deephouse');
R2('rec-jackyourbody', 'Steve "Silk" Hurley', 'Jack Your Body', 1986, 'dj-international', ['house'], 'UK No. 1 in January 1987: house\'s first.', 'steve-silk-hurley', 'g-house');
R2('rec-lovecantturnaround', 'Farley "Jackmaster" Funk', 'Love Can\'t Turn Around', 1986, null, ['house'], 'UK Top 10; Darryl Pandy\'s vocal.', 'farley-jackmaster-funk', 'g-house');
R2('rec-promisedland', 'Joe Smooth', 'Promised Land', 1987, 'dj-international', ['house'], 'House as gospel.', null, 'g-house');
R2('rec-dafunk', 'Daft Punk', 'Da Funk', 1995, 'soma', ['house'], 'French touch\'s first hit.', 'daft-punk', 'g-frenchtouch');
R2('rec-musicsounds', 'Stardust', 'Music Sounds Better with You', 1998, 'roule', ['house'], 'The filtered disco loop perfected.', null, 'g-frenchtouch');
R2('rec-rip-groove', 'Double 99', 'RIP Groove', 1997, null, ['house', 'rave'], 'Speed garage\'s anthem.', null, 'g-ukgarage');
R2('rec-gabriel', 'Roy Davis Jr. feat. Peven Everett', 'Gabriel', 1996, null, ['house'], 'The Chicago record that became UK garage\'s template.', null, 'g-ukgarage');

/* ---------- sets ---------- */
const SET2 = (id, title, city, years, blurb, strands, rel = []) => N(id, 'set', title, { city, years, blurb, strands, rel: [['in', city], ...rel] });
SET2('set-metalheadz', 'Metalheadz Sunday Sessions at the Blue Note', 'london', '1995–98', 'Goldie\'s label night: the room where drum & bass found its sound and its crowd.', ['jungle'], [['at', 'blue-note']]);
SET2('set-speed', 'Bukem & Fabio at Speed', 'london', '1994–96', 'The Mars Bar Thursday: atmospheric drum & bass invented in a 300-capacity room.', ['jungle'], [['at', 'speed']]);
SET2('set-oakenfold-goa', 'Paul Oakenfold — The Goa Mix', 'london', '1994', 'The Radio 1 Essential Mix that took Goa trance to Britain.', ['trance']);
SET2('set-tiesto-athens', 'Tiësto at the Athens Olympics', 'athens', '2004', 'A DJ at the opening ceremony: trance\'s global moment.', ['trance']);
SET2('set-knuckles-warehouse', 'Frankie Knuckles at the Warehouse', 'chicago', '1977–82', 'Disco edits on reel-to-reel, a drum machine underneath: the residency that named a music.', ['house'], [['at', 'warehouse']]);
SET2('set-alfredo', 'Alfredo at Amnesia', 'ibiza', '1984–89', 'Midnight to dawn, no genre, the terrace open to the sky.', ['house'], [['at', 'amnesia']]);
SET2('set-sasha-digweed', 'Sasha & Digweed — Northern Exposure / Twilo', 'newyork', '1996–2001', 'Progressive as a journey: the monthly at Twilo and the mixes.', ['trance', 'house'], [['at', 'twilo']]);

/* ---------- indexes ---------- */
/* auto-create cities referenced but not defined */
NODES.slice().forEach(n => n.rel.forEach(([r, t]) => { if (r === 'in' && !NODES.some(x => x.id === t) && t) N(t, 'city', t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '), { blurb: '', strands: n.strands }); }));
const NODE = Object.fromEntries(NODES.map(n => [n.id, n]));
const BACK = {}; NODES.forEach(n => n.rel.forEach(([r, t]) => { (BACK[t] = BACK[t] || []).push([r, n.id]); }));
const REL_LABEL = { in: 'in', played: 'played at', founded: 'founded', made: 'made', member: 'member of', uses: 'uses', label: 'on', by: 'by', genre: 'genre', from: 'descends from', told: 'told in', at: 'at' };
const REL_BACK = { in: 'based here', played: 'played here', founded: 'founded by', made: 'made by', member: 'members', uses: 'used on', label: 'released', by: 'records', genre: 'records', from: 'led to', told: 'genres in this chapter', at: 'sets here' };
const TYPE_LABEL = { city: 'City', machine: 'Machine', label: 'Label', genre: 'Genre', border: 'Crossing', collective: 'Collective', person: 'Person', club: 'Club', event: 'Event', station: 'Radio station', record: 'Record', set: 'Landmark set' };
const TYPE_COLOR = { city: '--mix', machine: '--synth', label: '--samp', genre: '--rumble', border: '--perc', collective: '--kick', person: '--kick', club: '--rumble', event: '--perc', station: '--drums', record: '--bass', set: '--drums' };
