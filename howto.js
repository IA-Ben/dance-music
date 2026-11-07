/* ===================================================================
   HOW TO MAKE IT — a production recipe for every genre in the book.
   Each recipe builds the genre's pattern layer by layer in the step grid,
   then explains the arrangement, the machines and the records to study.
   =================================================================== */
(() => {
  /* ---------- presets for the genres that had none ---------- */
  const GP = (base, name, over) => { const G = GENRES[base]; if (!G) return; const P = deepMerge(G, over); P.pat = Object.assign({}, over.pat || G.pat); P.levels = Object.assign({}, G.levels, over.levels || {}); P.era = (name.match(/(\d{4})$/) || [])[1] || G.era; EXTRA[name] = P; };
  const EXTRA = window.EXTRA_PRESETS = {};
  GP('Chicago house 1986', 'House 1988', { bpm: 122, swing: 0.1, notes: 'House: a four-to-the-floor kick, an offbeat open hat, a piano or organ riff and a clap. Everything else is taste.', pat: { kick: 'x...x...x...x...', piano: '..x...x.x...x...', organ: 'x.x.x.x.x.x.x.x.', clap: '....x.......x...', hato: '..x...x...x...x.', hatc: 'x.x.x.x.x.x.x.x.', sub: 'x.......x.......' } });
  GP('Chicago house 1986', 'Deep house 1990', { bpm: 120, swing: 0.12, key: ['D', 36.71], stab: { detune: 5, cutoff: 900, env: 600, decay: 0.45, verb: 0.5, chord: [0, 3, 7, 10, 14] }, levels: { stab: 0.75, organ: 0.5, piano: 0.4, shaker: 0.4 }, pat: { kick: 'x...x...x...x...', stab: '..x.....x..x....', organ: 'x..x..x.x..x..x.', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', shaker: 'x.xxx.xxx.xxx.xx', sub: 'x.......x.......' }, notes: 'Deep house: a minor-ninth chord held through the bar, a warm organ bass, swung shakers. Larry Heard, 1986–90.' });
  GP('Chicago house 1986', 'Garage 1992', { bpm: 124, swing: 0.14, key: ['F', 43.65], levels: { piano: 0.85, organ: 0.7, clap: 0.7, hato: 0.55 }, pat: { kick: 'x...x...x...x...', piano: 'x..x..x...x..x..', organ: 'x.x.x.x.x.x.x.x.', clap: '....x.......x...', hato: '..x...x...x...x.', hatc: 'x.x.x.x.x.x.x.x.', snare: '............x.x.', sub: 'x.......x.......', rim: '.......x.......x' }, notes: 'US garage: gospel piano, a swung organ bass, a vocal in the gaps. The Paradise Garage\'s music made on machines, Todd Terry to MAW.' });
  GP('Chicago house 1986', 'Balearic 1987', { bpm: 108, swing: 0.1, key: ['E', 41.2], levels: { piano: 0.6, shaker: 0.5, stab: 0.5, tom: 0.5 }, pat: { kick: 'x...x...x...x...', piano: '....x.......x...', stab: 'x.......x.......', shaker: 'x.xxx.xxx.xxx.xx', tom: '......x.x.....x.', hato: '..x...x...x...x.', hatc: 'x.x.x.x.x.x.x.x.', sub: 'x.......x.......', cow: '......x.......x.' }, notes: 'Balearic: 108 BPM, a sunset chord, congas and a piano that could be from anything. Alfredo at Amnesia.' });
  GP('Tech-house 1997', 'French touch 1997', { bpm: 124, swing: 0.06, stab: { detune: 6, cutoff: 600, env: 2500, decay: 0.3, verb: 0.3, chord: [0, 4, 7, 11] }, levels: { stab: 0.85, off: 0.6, clap: 0.6, hato: 0.5 }, pat: { kick: 'x...x...x...x...', stab: 'x.x.x.x.x.x.x.x.', off: '..x...x...x...x.', clap: '....x.......x...', hato: '..x...x...x...x.', hatc: 'xxxxxxxxxxxxxxxx', sub: 'x.......x.......' }, notes: 'French touch: a disco loop under a filter that opens and closes over eight bars, a compressor pumping. Daft Punk and Cassius, 1997.' });
  GP('UK garage 1998', 'UK garage 1999', { bpm: 132, notes: 'Two-step: no kick on the two, swung shuffled hats, a warm sub and a sped-up vocal.' });
  GP('Tech-house 1997', 'Progressive 1994', { bpm: 128, swing: 0.02, key: ['A', 55], stab: { detune: 8, cutoff: 800, env: 1800, decay: 0.6, verb: 0.9, chord: [0, 7, 12, 14] }, levels: { stab: 0.6, off: 0.7, ride: 0.4, hatc: 0.4, sub: 0.8 }, pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', stab: 'x.......x.......', ride: 'x.x.x.x.x.x.x.x.', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', sub: 'x.......x.......', tom: '.............x.x' }, notes: 'Progressive: long, tribal, a chord that takes sixteen bars to arrive. Leftfield and Sasha, 1992–96.' });
  GP('Trance 1993', 'Trance 1995', { bpm: 136, notes: 'Trance: a 16th-note arpeggio, an offbeat bass, a breakdown with no drums and a build back in.' });
  GP('Trance 1993', 'Goa 1995', { bpm: 145, key: ['E', 41.2], acid: { cutoff: 700, res: 14, env: 3000, decay: 0.15, wave: 'sawtooth' }, acidNotes: [0, 12, 0, 12, 3, 15, 0, 12, 0, 12, 7, 19, 0, 12, 3, 15], levels: { acid: 0.8, off: 0.85, hatc: 0.5, hato: 0.45, super: 0.4 }, pat: { kick: 'x...x...x...x...', off: '.xx..xx..xx..xx.', acid: 'xAxxxAxxxAxxxAxx', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', super: '........x.......', sub: 'x.......x.......' }, notes: 'Goa: a rolling triplet bass, a 303 or a Nord going at 16ths, 145 BPM, a Hindu sample. Anjuna beach, 1993–96.' });
  GP('Trance 1999', 'Hard trance 1996', { bpm: 148, key: ['A', 55], levels: { hoover: 0.8, off: 0.85, super: 0.5, snare: 0.5 }, pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', hoover: 'x.......x.....x.', super: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', snare: '............xxxx', sub: 'x.......x.......' }, notes: 'Hard trance: 148, a hoover riff, an offbeat bass that never stops and a snare roll every eight bars. Frankfurt and the north of England.' });
  GP('Hard techno 2023', 'Gabber 1993', { bpm: 180, key: ['A', 55], kick: { pitchStart: 220, pitchEnd: 50, pitchDecay: 0.02, ampDecay: 0.32, drive: 9, click: 1 }, sc: 0.3, rumble: 0, levels: { hoover: 0.75, stab: 0.5, hatc: 0.35, snare: 0.5, clap: 0.4 }, pat: { kick: 'x...x...x...x...', hoover: 'x.......x.....x.', stab: '..x...x...x...x.', hatc: '..x...x...x...x.', snare: '............x.x.', clap: '....x.......x...' }, notes: 'Gabber: a 909 kick distorted until it is a square wave, 180 BPM, a hoover and a shouted sample. Rotterdam, 1992–95.' });
  GP('UK rave 1991', 'Happy hardcore 1995', { bpm: 170, key: ['C', 65.4], levels: { piano: 0.85, hoover: 0.6, snare: 0.7, sub: 0.7, hatc: 0.4 }, pat: { kick: 'x...x...x...x...', piano: 'x..x..x...x..x..', hoover: '........x.......', snare: '....x.......x...', sub: 'x...x...x...x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', stab: '..x.......x.....' }, pianoChord: [0, 4, 7, 12], notes: 'Happy hardcore: 170, four-to-the-floor, a major-key piano riff and a sped-up vocal. Slipmatt and Hixxy, 1994–97.' });
  GP('Tresor 1992', 'New beat 1988', { bpm: 108, key: ['E', 41.2], levels: { off: 0.85, stab: 0.7, clap: 0.7, tom: 0.5, hoover: 0.4 }, pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', stab: 'x.......x.......', clap: '....x.......x...', tom: '......x.......x.', hatc: 'x.x.x.x.x.x.x.x.', hoover: '............x...', sub: 'x.......x.......' }, notes: 'New beat: EBM and acid played at 33 with the pitch at +8. Slow, heavy, Belgian, 1987–89.' });
  GP('Chicago acid 1987', 'Electro 1983', { bpm: 128, swing: 0, key: ['D', 36.71], kick: { pitchStart: 90, pitchEnd: 45, pitchDecay: 0.08, ampDecay: 0.7, drive: 1, click: 0.3 }, levels: { bleep: 0.6, snare: 0.7, clap: 0.6, hatc: 0.45, sub: 0.8, acid: 0.4 }, pat: { kick: 'x..x..x...x.x...', snare: '....x.......x...', clap: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '......x.......x.', bleep: '..x.....x.....x.', sub: 'x..x..x...x.x...', acid: '..x.....x..x....', cow: '..x.....x.x.....' }, notes: 'Electro: an 808 kick with a long decay in a syncopated pattern, a clap, a vocoder. Planet Rock and Clear, 1982–83.' });
  GP('Dub techno 1995', 'Ambient techno 1993', { bpm: 110, swing: 0.05, key: ['C', 32.7], stab: { detune: 10, cutoff: 700, env: 400, decay: 1.2, verb: 1, chord: [0, 7, 14, 21] }, levels: { stab: 0.7, bleep: 0.4, shaker: 0.3, sub: 0.6, hatc: 0.25 }, pat: { kick: 'x.......x.......', stab: 'x...............', bleep: '......x.......x.', shaker: 'x.x.x.x.x.x.x.x.', hatc: '..x...x...x...x.', sub: 'x.......x.......', metal: '...........x....' }, notes: 'Ambient / intelligent techno: chords that last a bar, a kick that may not be there, 110 BPM. Artificial Intelligence, 1992–94.' });
  GP('Jungle 1994', 'Jungle 1993', { bpm: 158, notes: 'Jungle: the Amen chopped so the snares land where you do not expect, a reggae sub, a timestretched vocal.', pat: { kick: 'x..x......x.x...', snare: '....x..x....x..x', hatc: 'x.xxx.xx.xxx.xxx', sub: 'x.......x.......', reese: '........x.......', stab: '......x.........', metal: '...x.......x....' } });
  GP('Jungle 1994', 'Atmospheric 1995', { bpm: 160, key: ['D', 36.71], stab: { detune: 8, cutoff: 700, env: 600, decay: 1, verb: 1, chord: [0, 3, 7, 14] }, levels: { stab: 0.7, piano: 0.45, snare: 0.6, sub: 0.8, reese: 0, shaker: 0.4 }, pat: { kick: 'x.........x.....', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', stab: 'x...............', piano: '......x.......x.', sub: 'x.......x.......', shaker: '.x.x.x.x.x.x.x.x' }, notes: 'Atmospheric / intelligent drum & bass: a chord that lasts the bar, a Rhodes, a clean break. Good Looking and Metalheadz, 1994–96.' });
  GP('Drum & bass 1998', 'Liquid 2002', { bpm: 172, key: ['F', 43.65], levels: { piano: 0.6, stab: 0.5, reese: 0.35, sub: 0.85, snare: 0.65, shaker: 0.4 }, stab: { detune: 6, cutoff: 900, env: 800, decay: 0.5, verb: 0.7, chord: [0, 3, 7, 10, 14] }, pat: { kick: 'x.........x.....', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '......x.........', piano: '..x.....x...x...', stab: 'x.......x.......', sub: 'x.........x.....', reese: '......x.........', shaker: '.x.x.x.x.x.x.x.x' }, notes: 'Liquid funk: soul chords and a Rhodes over a two-step, the bass warm rather than hostile. Hospital and Soul:r, 2000–.' });
  GP('Drum & bass 1998', 'Neurofunk 1999', { bpm: 174, levels: { reese: 0.9, metal: 0.6, snare: 0.8, stab: 0.5, sub: 0.5 }, stab: { detune: 25, cutoff: 400, env: 3500, decay: 0.12, verb: 0.2, chord: [0, 1, 6] }, pat: { kick: 'x.........x.....', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', reese: 'x.x.......x.x.x.', metal: '...x...x...x...x', stab: '..............x.', sub: 'x...............' }, notes: 'Neurofunk: the Reese resampled, filtered and resampled again until it moves on its own; a snare like a door. Ed Rush & Optical, 1998.' });
  GP('Drum & bass 1998', 'Jump-up 1996', { bpm: 175, key: ['G', 49], levels: { reese: 0.8, acid: 0.6, snare: 0.75, sub: 0.7, hoover: 0.4 }, acid: { cutoff: 400, res: 14, env: 2500, decay: 0.3, wave: 'sawtooth' }, acidNotes: [0, 0, 0, 7, 0, 0, 5, 0, 0, 0, 0, 7, 0, 3, 0, 0], pat: { kick: 'x.........x.....', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', reese: 'x.......x.......', acid: 'x..x..x.x..x..x.', sub: 'x...............', hoover: '............x...' }, notes: 'Jump-up: a bassline that is the hook, a hip-hop sample, nothing clever. Aphrodite and Ganja Kru, 1995–97.' });
  window.PRESET = name => GENRES[name] || RECORD_PRESETS[name] || EXTRA[name] || null;

  /* ---------- the recipes ---------- */
  // steps: [layers added, title, text, anatomy chapter]; m: machines; l: records/people to study (free text, autolinked)
  const R = window.HOWTO = {};
  const S = (id, preset, steps, arr, m, l) => { R[id] = { preset, steps, arr, m, l }; const n = NODE[id]; if (n && !n.preset) n.preset = preset; };

  S('g-house', 'House 1988', [
    [['kick'], 'The kick on every beat', 'Four to the floor at 120–125: a 909 kick, not too clicky, the same on every beat. The whole genre rests on it; do not decorate it.', 'a1'],
    [['hatc', 'hato'], 'The offbeat open hat', 'Closed hats on the 8ths, an open hat on every offbeat — the "and" of each beat. That open hat is what makes it house and not techno.', 'a2'],
    [['clap'], 'Clap on 2 and 4', 'A 909 clap on the two and the four, slightly loose. Layer a snare under it later if you want it bigger.', 'a2'],
    [['sub', 'organ'], 'The bassline', 'A bouncing organ-bass or an M1 bass on the offbeats with the root under it. Keep it to three notes; the groove comes from where they sit, not what they are.', 'a5'],
    [['piano'], 'The piano riff', 'A minor-seventh stab on the offbeats, or the M1 piano. Two chords are plenty. Swing it 8–12% so it leans.', 'a6']
  ], 'Intro of 32 bars of drums for the DJ, the riff in at bar 33, a breakdown at 64 where the kick leaves and the vocal or chord holds, everything back at 80. Eight-minute 12-inch, six-minute edit.', ['tr909', 'korg-m1', 'juno60', 'mpc'], 'Study "Can You Feel It", "Move Your Body", "Your Love" and "Big Fun".'),

  S('g-deephouse', 'Deep house 1990', [
    [['kick', 'hatc'], 'A soft kick and quiet hats', 'A rounder kick than house proper — 808 or a softened 909 — at 118–122, hats low in the mix.', 'a1'],
    [['stab'], 'The ninth chord', 'A minor ninth (root, flat third, fifth, seventh, ninth) on a Juno or a Rhodes, held or stabbed once a bar, drowned in chorus. This chord is the genre.', 'a6'],
    [['organ', 'sub'], 'The warm bass', 'A smooth organ or filtered saw bass walking under the chord: root and fifth, occasionally the seventh. No distortion anywhere.', 'a5'],
    [['shaker', 'clap', 'hato'], 'Swing and shakers', 'Swung 16th shakers at 12–15%, a soft clap, an open hat on the offbeat. The groove should feel late.', 'a3']
  ], 'Deep house arranges by subtraction: start with everything and take layers out for eight bars at a time. The vocal, if any, is spoken or sung low. Nine minutes is fine.', ['juno60', 'tr808', 'korg-m1'], 'Study Larry Heard\'s "Can You Feel It", Mr Fingers, "Deep Burnt" and the early Prescription catalogue.'),

  S('g-garage', 'Garage 1992', [
    [['kick', 'clap'], 'Kick and clap', 'A 909 at 122–126, the clap on 2 and 4 a shade behind the beat — garage swings harder than house.', 'a1'],
    [['hatc', 'hato'], 'Swung hats', 'Hats at 14% swing. The hats carry the "shuffle" the New Jersey rooms were named for.', 'a2'],
    [['organ', 'sub'], 'Organ bass', 'An M1 organ bass bouncing on the 8ths: this is the Todd Terry / MAW signature.', 'a5'],
    [['piano', 'snare'], 'Gospel piano and the fill', 'Big major-key piano chords, four at a time, and a snare fill every eight bars to bring the vocal in.', 'a6']
  ], 'The vocal is the record: verse over drums and bass, chorus with the piano, a breakdown of piano alone, the drop back in. Dub mix on the B-side with the vocal cut to one line.', ['tr909', 'korg-m1', 'mpc'], 'Study Masters at Work, Todd Terry, "Follow Me" and the Strictly Rhythm catalogue.'),

  S('g-ukgarage', 'UK garage 1999', [
    [['kick'], 'The two-step kick', 'No kick on the two. Kick on 1, the "and" of 2 and a push before 4 — the step pattern is the whole trick.', 'a1'],
    [['snare', 'clap'], 'Snare on 2 and 4', 'A tight snare or rimshot on 2 and 4 so the missing kick is felt.', 'a2'],
    [['hatc', 'hato', 'shaker'], 'Shuffled hats', 'Hats and shakers swung 16–20%, open hat on the offbeat. The swing is the MPC\'s 62–66% setting.', 'a3'],
    [['sub', 'off'], 'The warm sub', 'A sine or filtered sub playing the root and a slide, with a reese-ish bass under it for the darker rooms.', 'a5'],
    [['piano', 'stab'], 'Chord and vocal', 'A sped-up R&B vocal chopped into syllables, a stab from an M1 or a Virus behind it.', 'a7']
  ], 'Intro of 16 bars, vocal hook at 17, the bass drops at 33. Keep it under six minutes; the MC fills the rest.', ['mpc', 'akai-s1000', 'korg-m1', 'access-virus'], 'Study "Re-Rewind", MJ Cole, Tuff Jam, Artful Dodger and "Sweet Like Chocolate".'),

  S('g-acidhouse', 'Chicago acid 1987', [
    [['kick'], 'A plain kick', 'A 707 or 808 kick, four to the floor, 120–125. Acid is not about the drums.', 'a1'],
    [['acid'], 'The 303 line', 'A 303 playing one note with accents and slides; open the cutoff slowly, resonance three-quarters up. Program badly: the mistakes are the music.', 'a6'],
    [['hatc', 'hato'], 'Hats', '8th-note closed hats, an open hat on the offbeat.', 'a2'],
    [['clap', 'tom'], 'Clap and toms', 'A clap on 2 and 4; 808 toms on the last beat as a fill.', 'a2']
  ], 'The arrangement is the filter: twelve minutes of one pattern with the cutoff and resonance moving by hand. Record the knob moves live to tape.', ['tb303', 'tr707', 'tr808'], 'Study "Acid Tracks", Armando, "Voodoo Ray" and Hardfloor for the 1990s version.'),

  S('g-detroit', 'Detroit 1988', [
    [['kick', 'rumble'], 'A warm 909', 'A 909 kick at 120–125 with a little tape warmth — Detroit never distorted it.', 'a1'],
    [['hatc', 'hato', 'shaker'], 'Hats and shakers', 'Closed hats on 8ths, open hat offbeat, a 16th shaker underneath at 8% swing. The shaker is why it moves.', 'a3'],
    [['clap', 'tom'], 'Clap and congas', 'A clap on 2 and 4, toms or congas as syncopation.', 'a2'],
    [['sub'], 'The bass', 'A sub on the one and the "and" of 3, often just the root.', 'a5'],
    [['stab'], 'The chord', 'A minor-seventh or minor-ninth chord with a touch of detune and a long reverb. Play it on the offbeats and let it ring: the chord is the record.', 'a6']
  ], 'Build for 32 bars, drop the chord in, take the drums out for 16 bars so the strings stand alone, bring everything back. Eight minutes, mixed in mono on a cheap desk.', ['tr909', 'juno60', 'korg-ms', 'dx7'], 'Study "Strings of Life", "Nude Photo", "Big Fun", "Good Life" and "Clear".'),

  S('g-electro', 'Electro 1983', [
    [['kick'], 'The 808 kick', 'An 808 kick with the decay turned up so it booms, in a syncopated pattern: 1, the "and" of 2, the 4.', 'a1'],
    [['snare', 'clap'], 'Snare and clap together', 'An 808 snare and clap layered on 2 and 4, bright.', 'a2'],
    [['hatc', 'hato'], 'Hats', 'Straight 8th hats, no swing at all. Electro is machine time.', 'a2'],
    [['sub', 'bleep'], 'Bass and bleep', 'The bass follows the kick; a square-wave bleep melody on top in a minor key.', 'a5'],
    [['acid'], 'A vocoder or a lead', 'A vocoded phrase or a simple monosynth lead, robotic, four notes.', 'a6']
  ], 'Verse-chorus if there is a rap, otherwise 16-bar blocks with the bleep melody in and out. 128 BPM, 12-inch, instrumental on the B.', ['tr808', 'emulator', 'korg-ms', 'dx7'], 'Study "Planet Rock", "Clear", Drexciya and Aux 88 for the Detroit revival.'),

  S('g-bleep', 'UK bleep 1990', [
    [['kick', 'sub'], 'Kick and the biggest sub you can', 'A 909 kick at 118–122 and a sine sub a full octave lower than you think, in the kick\'s gaps. The sub was built for the Jamaican sound systems in Sheffield and Leeds.', 'a5'],
    [['bleep'], 'The bleep', 'A square-wave blip, one or two notes, placed off the beat. Nothing else melodic.', 'a6'],
    [['snare', 'hatc'], 'Snare and hats', 'A dry snare on 2 and 4, straight closed hats.', 'a2'],
    [['hato'], 'The open hat', 'One open hat per bar, late.', 'a2']
  ], 'Minimal by necessity: eight bars of kick and sub, bleep in, a sample of a film line, out. Five minutes.', ['tr909', 'casio-cz', 'atari-cubase'], 'Study "LFO", "Testone", "Dextrous" and Unique 3.'),

  S('g-hardcore', 'UK rave 1991', [
    [['kick', 'snare'], 'A kick over a break', 'A 909 kick on a syncopated pattern over a sampled breakbeat; the snare on 2 and 4 is the break\'s own.', 'a7'],
    [['hatc', 'hato'], '16th hats', 'The break\'s own hats plus 16th closed hats on top for speed.', 'a2'],
    [['sub'], 'Sub following the kick', 'A sub that doubles the kick pattern so it hits in the chest.', 'a5'],
    [['hoover'], 'The hoover', 'The Alpha Juno "WhatThe" patch, pitch-swept, on the one. Mentasm and Dominator made this the sound of 1991.', 'a6'],
    [['stab'], 'Rave stabs and a piano', 'A detuned stab or a sped-up piano on the offbeats, a vocal sample pitched up.', 'a7']
  ], 'Intro, hoover drop at 17, a breakdown with the piano alone at 65, a second drop with the break doubled. 138 BPM, five minutes, white label.', ['akai-s900', 'alpha-juno', 'tr909', 'atari-cubase'], 'Study "Charly", "Mentasm", "Dominator", "Raving I\'m Raving" and "Energy Flash".'),

  S('g-berlin', 'Tresor 1992', [
    [['kick', 'rumble'], 'A hard kick with rumble', 'A 909 kick driven hard at 135–140, with a rumble — the kick through a reverb and a lowpass — under it. Tresor\'s vault did the rumble for free.', 'a4'],
    [['hatc', 'ride'], 'Hats and ride', '16th closed hats and a ride on the 8ths, both loud. This is where techno gets its hiss.', 'a2'],
    [['off', 'clap'], 'Offbeat bass and clap', 'A bass note on every offbeat, a clap on 2 and 4.', 'a5'],
    [['stab', 'bleep'], 'Metallic stabs', 'A short detuned stab and a bleep, nothing melodic for more than two notes.', 'a6']
  ], 'No breakdowns to speak of: layers come in and go out every 16 bars. Eight minutes, loud, for a concrete room.', ['tr909', 'tb303', 'sh101', 'akai-s1000'], 'Study "Spastik", Jeff Mills\'s Waveform Transmission, "Sonic Destroyer" and Tresor\'s first compilation.'),

  S('g-acidtek', 'Acid techno 1994', [
    [['kick', 'rumble'], 'A distorted 909', 'A 909 kick with distortion and a rumble at 140–150.', 'a1'],
    [['acid'], 'Two 303s', 'One 303 doing the bassline, another doing a lead an octave up, both with the resonance high. Slides everywhere.', 'a6'],
    [['hatc', 'hato', 'ride'], 'Hats and ride', 'Fast closed hats, an open hat on the offbeat, a ride on the 8ths.', 'a2'],
    [['clap', 'snare'], 'Clap and snare rolls', 'Clap on 2 and 4; snare rolls into every drop.', 'a2']
  ], 'Build the two 303s against each other for 16 bars at a time; a breakdown with only the acid; a snare roll; both back. Made for a squat party sound system.', ['tb303', 'tr909', 'bass-station'], 'Study Liberator, "Hoovers and Horns", Chris Liberator, Stay Up Forever and Hardfloor.'),

  S('g-gabber', 'Gabber 1993', [
    [['kick'], 'The distorted kick', 'A 909 kick through so much distortion it becomes a square wave, four to the floor at 170–190. Equalise the mids up so it is a note, not a thud.', 'a1'],
    [['hoover', 'stab'], 'Hoover and stab', 'A hoover riff on the one and a stab on the offbeats, both distorted.', 'a6'],
    [['hatc', 'snare', 'clap'], 'The rest of the drums', 'Open hat on the offbeat, a snare roll into the drop, a clap under it.', 'a2']
  ], 'Intro, kick alone; hoover at 17; a breakdown with a shouted sample; everything back. The arrangement is energy management.', ['tr909', 'alpha-juno', 'akai-s1000'], 'Study Euromasters, "Poing", Rotterdam Records and Thunderdome.'),

  S('g-happy', 'Happy hardcore 1995', [
    [['kick', 'sub'], 'Kick and sub', 'A 909 kick and a sub on every beat at 165–175.', 'a1'],
    [['snare', 'hatc', 'hato'], 'Drums', 'Snare on 2 and 4, 8th hats, an open hat on the offbeat.', 'a2'],
    [['piano', 'stab'], 'The piano riff', 'A major-key piano riff, up-tempo, the melody the crowd will sing; a stab behind it.', 'a6'],
    [['hoover'], 'A hoover for the drop', 'A hoover sweep into each drop.', 'a6']
  ], 'A verse of drums and piano, a breakdown of piano and vocal (sped up a tone), a drum roll, the drop. Under five minutes; the vocal is the hook.', ['tr909', 'akai-s1000', 'korg-m1'], 'Study Slipmatt, Hixxy, "Toytown" and Bonkers.'),

  S('g-newbeat', 'New beat 1988', [
    [['kick', 'off'], 'Slow kick, offbeat bass', 'A kick at 105–110 — a techno record played at 33 — with a heavy offbeat bass.', 'a5'],
    [['stab', 'hoover'], 'EBM stabs', 'A sawtooth stab on the one and a slow hoover for atmosphere.', 'a6'],
    [['clap', 'tom', 'hatc'], 'Drums', 'A big gated clap, toms, straight hats.', 'a2']
  ], 'New beat is mostly arrangement: drop everything but the bass for eight bars, bring the stab back. Four minutes, Belgian.', ['tr909', 'juno60', 'alpha-juno'], 'Study "Flesh", Confetti\'s, "Rock to the Beat" and the Boccaccio.'),

  S('g-balearic', 'Balearic 1987', [
    [['kick', 'shaker'], 'A slow kick and shakers', 'A kick at 100–112 and swung shakers; this is dance music that does not need to make you dance.', 'a3'],
    [['stab', 'piano'], 'A sunset chord and piano', 'A warm major-seventh chord held across the bar, a piano on the two and four.', 'a6'],
    [['tom', 'hatc', 'hato'], 'Congas and hats', 'Congas as a counter-rhythm, hats low.', 'a2'],
    [['sub'], 'Bass', 'A soft bass on the root. Add a guitar if you have one.', 'a5']
  ], 'Anything goes: the point is sequencing records from different genres, not arranging one. If you are producing it, keep it open and long.', ['juno60', 'dx7', 'technics'], 'Study Alfredo\'s playlists, "Sueño Latino", "Jibaro" and Café del Mar.'),

  S('g-trance', 'Trance 1995', [
    [['kick', 'off'], 'Kick and the offbeat bass', 'A 909 kick at 132–140 and a bass on every offbeat — the pump that the whole genre rides on.', 'a5'],
    [['acid'], 'The 16th arpeggio', 'A 303-ish or JP-8000 arpeggio at 16ths, minor key, the filter opening over 32 bars.', 'a6'],
    [['hatc', 'hato', 'clap'], 'Drums', '16th hats, open hat offbeat, clap on 2 and 4.', 'a2'],
    [['stab'], 'The pad', 'A wide detuned pad under everything, long reverb.', 'a8']
  ], 'The breakdown is the point: at bar 65 the drums leave, the pad and arpeggio stay, a snare roll of 16 bars builds, the kick returns on the one. Eight minutes.', ['tr909', 'jp8000', 'nord-lead', 'access-virus'], 'Study "Age of Love", Jam & Spoon, "Café del Mar" and Oliver Lieb.'),

  S('g-frankfurt-trance', 'Trance 1993', [
    [['kick', 'off'], 'Kick and offbeat bass', 'A clean 909 at 130–136 with the offbeat bass; Frankfurt kept it cleaner than Berlin.', 'a5'],
    [['acid', 'stab'], 'Arpeggio and chord', 'A fast arpeggio and a minor chord, more techno than melody.', 'a6'],
    [['hatc', 'hato', 'ride'], 'Drums', 'Hats and ride, metronomic.', 'a2']
  ], 'Long, hypnotic, few breakdowns: this was still techno with a melody, made for the Omen and the Dorian Gray.', ['tr909', 'juno60', 'atari-cubase'], 'Study Dance 2 Trance, "We Came in Peace", Sven Väth\'s Accident in Paradise and Harthouse.'),

  S('g-goa', 'Goa 1995', [
    [['kick', 'off'], 'Kick and the rolling bass', 'A kick at 140–148 and the Goa bassline: three 16ths on each beat after the kick, the "rolling" bass.', 'a5'],
    [['acid'], 'The 16th lead', 'A 303 or Nord Lead going at 16ths with the resonance high and accents on the odd steps; this is where psytrance\'s squelch comes from.', 'a6'],
    [['hatc', 'hato'], 'Hats', 'Fast closed hats, an open hat on the offbeat.', 'a2'],
    [['super', 'sub'], 'Layers', 'A sawtooth lead for the melody, a sub under the roll; a sample from a Hindu chant or a film.', 'a8']
  ], 'Ten minutes: layers added one at a time, a breakdown halfway with an Indian sample, a key change up, the roll back in. Mixed to be played at sunrise.', ['tb303', 'nord-lead', 'jp8000', 'akai-s1000'], 'Study Goa Gil, Hallucinogen\'s "LSD", Astral Projection and Juno Reactor.'),

  S('g-uplifting', 'Trance 1999', [
    [['kick', 'off'], 'Kick and the offbeat bass', 'A 909 kick at 136–140 with a sidechained offbeat bass.', 'a5'],
    [['super'], 'The supersaw lead', 'The JP-8000\'s seven detuned saws playing the melody in a major key with a lift at the end of the phrase.', 'a6'],
    [['hatc', 'hato', 'clap', 'snare'], 'Drums and the roll', 'Hats, clap on 2 and 4, and a snare that rolls into every drop.', 'a2'],
    [['piano', 'sub'], 'Piano and sub', 'A piano doubling the melody in the breakdown, a sub under the bass.', 'a8']
  ], 'A 32-bar intro, the breakdown at 65 with the melody on piano and strings, the snare roll, the drop at 97 with the supersaw. Key change up a tone for the last drop. Gatecrasher, 1999.', ['jp8000', 'access-virus', 'nord-lead', 'cubase-vst'], 'Study "Sandstorm", "For an Angel", Ferry Corsten and Armin\'s early records.'),

  S('g-hardtrance', 'Hard trance 1996', [
    [['kick', 'off'], 'Hard kick, offbeat bass', 'A kick with more click than trance proper at 145–150, the offbeat bass up front.', 'a5'],
    [['hoover'], 'The hoover riff', 'A hoover playing the hook, not just a sweep.', 'a6'],
    [['super', 'snare'], 'Lead and rolls', 'A supersaw doubling the hoover in the drop, a snare roll every eight bars.', 'a2'],
    [['hatc', 'hato', 'clap'], 'Hats and clap', 'Hats and clap as trance.', 'a2']
  ], 'Short breakdowns, lots of rolls. It wants a big room in Frankfurt or Blackburn.', ['alpha-juno', 'jp8000', 'tr909'], 'Study "Hooligan", Kai Tracid, Yves Deruyter and Tidy Trax.'),

  S('g-progressive', 'Progressive 1994', [
    [['kick', 'off', 'sub'], 'Kick, offbeat and sub', 'A deep kick at 126–130, an offbeat bass and a sub; the bass is more melodic than trance\'s.', 'a5'],
    [['ride', 'hatc', 'hato'], 'Ride and hats', 'A ride on the 8ths and 16th hats; a tribal feel from toms later.', 'a2'],
    [['stab'], 'The long chord', 'A chord that arrives once every two bars with a huge reverb, taking 16 bars to evolve.', 'a8'],
    [['tom'], 'Toms', 'Tribal toms at the end of every four bars.', 'a3']
  ], 'Ten minutes with one breakdown. Layers change every 32 bars, nothing announces itself. Sasha and Digweed at Renaissance.', ['tr909', 'juno60', 'akai-s1000', 'cubase-vst'], 'Study Leftfield\'s "Not Forgotten", Spooky, Sasha\'s "Xpander" and the Guerilla catalogue.'),

  S('g-bham', 'Birmingham 1995', [
    [['kick', 'rumble'], 'A hard kick with rumble', 'A 909 kick pushed to 140, with the room\'s rumble under it.', 'a4'],
    [['metal', 'hatc'], 'Metal', 'Metallic percussion — a resonant bleep or a sampled hit — on every other 8th, with hats.', 'a3'],
    [['sub'], 'Sub', 'A sub on the one; no bassline to speak of.', 'a5'],
    [['bleep', 'tom'], 'Bleep and toms', 'A single bleep off the beat and toms as the only melody.', 'a6']
  ], 'Loop techno: the same bar for eight minutes, with filters and the rumble doing the work. House of God, Surgeon and Regis.', ['tr909', 'sh101', 'akai-s1000'], 'Study Surgeon\'s "Magneze", Regis\'s "Gymnastics", Downwards and Female.'),

  S('g-dub', 'Dub techno 1995', [
    [['kick', 'hatc'], 'A soft kick and quiet hats', 'A kick at 115–125, round, with hats mostly inaudible.', 'a1'],
    [['stab'], 'The chord through a delay', 'A minor chord through a long dub delay and a reverb, filtered until only the echo is heard. This is the whole genre.', 'a8'],
    [['sub'], 'Sub', 'A sub on the one, occasionally the fifth.', 'a5'],
    [['shaker', 'metal'], 'Texture', 'Shakers and a metallic click low in the mix, vinyl crackle if you can.', 'a3']
  ], 'No arrangement: the chord\'s delay feedback opens and closes over ten minutes. Basic Channel, Maurizio, Chain Reaction.', ['tr909', 'juno60', 'akai-s1000'], 'Study "Phylyps Trak", Maurizio\'s "M4", Deepchord and Rhythm & Sound.'),

  S('g-idm', 'Ambient techno 1993', [
    [['stab'], 'Start with the chord', 'A pad chord that lasts the bar at 100–115, with a slow filter; the drums come second.', 'a8'],
    [['kick', 'sub'], 'A kick that does not insist', 'A kick on the one and three, a sub with it.', 'a1'],
    [['bleep', 'shaker', 'hatc'], 'Bleeps and texture', 'Square-wave melodies in a minor key, shakers swung, hats on offbeats.', 'a6'],
    [['metal'], 'Something broken', 'A metallic or sampled hit that falls off the grid: the "intelligent" part.', 'a7']
  ], 'Album music: 7-minute pieces that change every 16 bars. Artificial Intelligence, Warp, 1992–94.', ['juno60', 'akai-s1000', 'atari-cubase', 'korg-m1'], 'Study Aphex Twin\'s Selected Ambient Works, B12, Black Dog and The Orb.'),

  S('g-schranz', 'Schranz 2002', [
    [['kick', 'rumble'], 'Kick and rumble, fast', 'A 909 kick at 145–155 with a heavy rumble and distortion.', 'a4'],
    [['metal', 'ride'], 'Metallic loops', 'A loop of metallic percussion and a ride, both distorted, filling every 16th.', 'a3'],
    [['sub', 'stab'], 'Sub and a stab', 'Sub on the one, a short stab for the only pitch.', 'a5'],
    [['hatc', 'clap'], 'Hats and clap', 'Hats and a clap buried in the loop.', 'a2']
  ], 'Hardgroove: two loops crossfaded against each other, filters open and shut, no breakdowns. Chris Liebing and Adam Beyer, 2001–04.', ['tr909', 'akai-s1000', 'cubase-vst'], 'Study Chris Liebing, Adam Beyer\'s Drumcode, Ben Sims and Umek.'),

  S('g-minimal', 'Minimal 2004', [
    [['kick', 'sub'], 'Kick and sub, 125', 'A dry kick at 123–128 and a sub, everything clean.', 'a1'],
    [['hatc', 'shaker'], 'Micro-percussion', 'Tiny clicks and hats, each a different sound, placed off the grid in Ableton.', 'a3'],
    [['bleep', 'metal'], 'The hook is a click', 'A one-note bleep or a metallic hit as the only hook; delay it in 3/16 against the 4/4.', 'a6'],
    [['stab'], 'A chord, barely', 'A filtered chord low in the mix that appears for eight bars every two minutes.', 'a8']
  ], 'Ten minutes of small changes: a sound enters, a sound leaves, nothing drops. Made to be mixed three records at a time. Villalobos, Hawtin, Perlon, 2001–08.', ['ableton', 'xone92', 'cubase-vst'], 'Study "Dexter", Plastikman\'s Closer, Perlon and Robert Hood\'s Minimal Nation for the ancestor.'),

  S('g-techhouse', 'Tech-house 1997', [
    [['kick', 'sub'], 'Kick and sub', 'A 909 kick at 124–128 and a sub, house tempo with techno weight.', 'a1'],
    [['hatc', 'hato', 'clap'], 'House drums', 'House hats with the open hat on the offbeat, a clap on 2 and 4.', 'a2'],
    [['off', 'bleep'], 'A techno bassline', 'An offbeat bass with a bleep over it.', 'a5'],
    [['stab', 'tom'], 'Stab and tribal toms', 'A chord stab and toms from house.', 'a3']
  ], 'The best of both: house\'s arrangement with techno\'s sounds. Mr C, Terry Francis, Eddie Richards at The End, 1995–2000.', ['tr909', 'akai-s1000', 'cubase-vst'], 'Study Mr C, Terry Francis\'s Wiggle, Eddie Richards and "Mr C — Science".'),

  S('g-berghain', 'Berghain 2010', [
    [['kick', 'rumble'], 'Kick and the rumble', 'A deep kick at 128–132 with a long rumble in a cold reverb — this is the Berghain sound in one layer.', 'a4'],
    [['hatc', 'ride', 'metal'], 'Hats, ride and metal', 'Hats and a ride high, metallic percussion that sounds like a factory.', 'a3'],
    [['sub', 'stab'], 'Sub and a dark chord', 'A sub on the one and a dark chord, minor, long reverb, once every two bars.', 'a8'],
    [['clap', 'bleep'], 'Clap and bleep', 'A clap under the ride and a bleep for the hook.', 'a6']
  ], 'Ten-minute records with a long middle. Ostgut Ton, Ben Klock, Marcel Dettmann, 2007–14.', ['tr909', 'elektron', 'ableton', 'funktion-one'], 'Study Ben Klock\'s "Subzero", Dettmann, Planetary Assault Systems and Shed.'),

  S('g-hypnotic', 'Hypnotic 2015', [
    [['kick', 'rumble'], 'Kick and rumble, 130', 'A kick at 128–135 with the rumble modulated so it moves.', 'a4'],
    [['metal', 'shaker'], 'Polyrhythmic percussion', 'Percussion in 3s and 5s against the 4/4 — a modular sequencer helps.', 'a3'],
    [['bleep'], 'The drone', 'A bleep or a drone that detunes slowly over 32 bars.', 'a6'],
    [['sub', 'hatc'], 'Sub and hats', 'A sub and hats as glue.', 'a5']
  ], 'Eleven minutes with no drop; the record slowly turns. Donato Dozzy, Voices from the Lake, Spazio Disponibile.', ['eurorack', 'elektron', 'tr8', 'ableton'], 'Study Donato Dozzy, Voices from the Lake, Neel and Abdulla Rashim.'),

  S('g-industrial', 'Industrial 2018', [
    [['kick', 'rumble'], 'A kick with distortion', 'A kick at 135–145 through a distortion and a rumble; clipping is allowed.', 'a4'],
    [['metal', 'snare'], 'Metal and a snare', 'Metallic hits on an Octatrack, a snare like a door.', 'a3'],
    [['hoover', 'stab'], 'Noise', 'A hoover or a noise sweep, a stab from an EBM record.', 'a6'],
    [['hatc', 'sub'], 'Hats and sub', 'Hats and a sub to hold it.', 'a5']
  ], 'Live-set music: patterns muted in and out on the box, no computer. Ancient Methods, Blawan (as Karenn), Helena Hauff, Perc.', ['elektron', 'eurorack', 'tr8', 'behringer'], 'Study Blawan, Perc Trax, Ancient Methods and Helena Hauff.'),

  S('g-peak', 'Peak-time 2017', [
    [['kick', 'rumble'], 'Kick and rumble, 130', 'A big kick at 128–132 with a rumble, mastered loud.', 'a4'],
    [['hatc', 'hato', 'ride', 'clap'], 'Full drums', 'Everything: hats, open hat, ride, clap.', 'a2'],
    [['off', 'sub'], 'Offbeat bass', 'An offbeat bass from trance with a sub.', 'a5'],
    [['stab', 'super'], 'The big chord', 'A chord or a supersaw riff for the drop.', 'a6']
  ], 'Trance arrangement at techno tempo: breakdown, roll, drop. Amelie Lens, Charlotte de Witte, Drumcode, 2016–20.', ['tr909', 'ableton', 'access-virus'], 'Study Charlotte de Witte, Amelie Lens, Adam Beyer and Enrico Sangiuliano.'),

  S('g-hard', 'Hard techno 2023', [
    [['kick', 'rumble'], 'Kick and rumble, 150+', 'A distorted kick at 150–160 with a rumble, the loudest thing in the mix by far.', 'a4'],
    [['hoover', 'super'], 'Hoover and supersaw', 'A hoover riff and a supersaw lead — the 1991 and 1999 sounds together.', 'a6'],
    [['snare', 'clap'], 'Snare rolls', 'A snare roll into every drop, a clap under it.', 'a2'],
    [['hatc', 'off'], 'Hats and offbeat bass', 'Hats and an offbeat bass to pump.', 'a5']
  ], 'A drop every 32 bars, a vocal shouted, under five minutes, made on a laptop with Behringer clones. 999999999, Sara Landry, Trym.', ['behringer', 'tr8', 'fl-studio', 'ableton'], 'Study 999999999, Sara Landry, Trym and I Hate Models.'),

  S('g-jungle', 'Jungle 1993', [
    [['kick', 'snare'], 'Chop the break', 'The Amen or the Think break chopped into single hits and re-sequenced so the snares land on 2, the "and" of 3 and the 4. The chopping is the composition.', 'a7'],
    [['hatc', 'metal'], 'The break\'s ghosts', 'Its hats and ghost notes between the hits; timestretch a copy so it smears.', 'a7'],
    [['sub', 'reese'], 'Reggae sub and a reese', 'A dub sub playing a reggae line under the break, a reese for the darker bars.', 'a5'],
    [['stab'], 'A stab and a vocal', 'A ragga vocal or a film line timestretched, a stab from a dub record.', 'a6']
  ], 'A 16-bar intro of break alone, the sub at 17, a breakdown with the vocal, the drop. 155–165 BPM, made on an S950 and an Atari.', ['akai-s900', 'akai-s1000', 'atari-cubase'], 'Study "Terminator", "Original Nuttah", "Incredible", Dillinja and Remarc.'),

  S('g-raggajungle', 'Jungle 1994', [
    [['kick', 'snare', 'hatc'], 'The break', 'The Amen chopped, snares pushed around, 160 BPM.', 'a7'],
    [['sub'], 'The reggae bassline', 'A sine sub playing a Jamaican riddim\'s bassline.', 'a5'],
    [['stab', 'reese'], 'Ragga vocal and stab', 'A ragga vocal sampled from a dancehall record, timestretched to fit; a reese under it.', 'a7'],
    [['metal', 'shaker'], 'Texture', 'Metallic hits and a shaker from the dub.', 'a3']
  ], 'Vocal intro, bass drop, a rewind. "Original Nuttah", "Incredible", Shy FX, Congo Natty, 1994–95.', ['akai-s1000', 'atari-cubase'], 'Study "Original Nuttah", "Incredible", Congo Natty and Kool FM.'),

  S('g-intelligent', 'Atmospheric 1995', [
    [['kick', 'snare', 'hatc'], 'A clean break', 'A break left mostly intact, two-step, at 160.', 'a7'],
    [['stab'], 'The pad', 'A chord that lasts the whole bar, huge reverb; a major seventh is allowed.', 'a8'],
    [['sub'], 'Sub', 'A warm sub playing the root, no reese.', 'a5'],
    [['piano', 'shaker'], 'Rhodes and shakers', 'A Rhodes line, jazz chords, shakers.', 'a6']
  ], 'Seven minutes with a long pad intro: the record arrives rather than drops. LTJ Bukem, Good Looking, "Music", 1994–96.', ['akai-s1000', 'korg-m1', 'cubase-vst'], 'Study LTJ Bukem\'s "Music", PFM, Photek\'s "Ni-Ten-Ichi-Ryu" and Metalheadz\' Timeless.'),

  S('g-techstep', 'Drum & bass 1998', [
    [['kick', 'snare'], 'Two-step drums', 'A kick on 1 and the "and" of 3, a snare on 2 and 4, at 170–174. The break is sampled and layered with 909 hits.', 'a2'],
    [['reese'], 'The reese', 'Two detuned saws through a distortion and a filter — the reese, from Kevin Saunderson\'s "Just Want Another Chance" by way of a Casio CZ — playing one note.', 'a5'],
    [['metal', 'hatc'], 'Metal and hats', 'Metallic hits off the grid, straight hats.', 'a3'],
    [['stab', 'sub'], 'Cold stab and sub', 'A dissonant stab and a sub under the reese.', 'a6']
  ], 'A 32-bar intro of atmosphere, the drop at 33 with the reese, a switch halfway to a second bassline. No U Turn, Virus, Ed Rush & Optical, 1996–99.', ['akai-s1000', 'casio-cz', 'cubase-vst'], 'Study "Pulp Fiction", Ed Rush & Optical\'s Wormhole, No U Turn and Dom & Roland.'),

  S('g-liquid', 'Liquid 2002', [
    [['kick', 'snare', 'hatc'], 'Two-step drums', 'A two-step at 172–175, snare soft.', 'a2'],
    [['stab', 'piano'], 'Soul chords and a Rhodes', 'A minor-ninth chord, a Rhodes playing the melody, a soul vocal sampled whole.', 'a6'],
    [['sub', 'reese'], 'Warm bass', 'A warm sub with a reese underneath, filtered not distorted.', 'a5'],
    [['shaker', 'hato'], 'Shakers', 'Shakers and an open hat for air.', 'a3']
  ], 'Intro, vocal verse over drums, the bass drop, a chorus. Hospital, Soul:r, High Contrast, Calibre, 2000–.', ['cubase-vst', 'akai-s1000', 'korg-m1'], 'Study High Contrast, Calibre, Marcus Intalex & ST Files and London Elektricity.'),

  S('g-neurofunk', 'Neurofunk 1999', [
    [['kick', 'snare'], 'Two-step drums, hard', 'A two-step at 172–176 with a snare like a slamming door.', 'a2'],
    [['reese'], 'The reese, resampled', 'A reese resampled through filters and distortion three or four times so it moves on its own; the bassline is the movement.', 'a5'],
    [['metal', 'hatc'], 'Metal and hats', 'Metallic hits on every 4th 16th, straight hats.', 'a3'],
    [['stab', 'sub'], 'Stab and sub', 'A dissonant stab (root, flat second, flat fifth) and a sub.', 'a6']
  ], 'Intro, drop, a second drop with the bass switched. Ed Rush & Optical, Konflict, Noisia, 1998–.', ['akai-s1000', 'cubase-vst', 'access-virus'], 'Study Ed Rush & Optical, "Bodyrock", Konflict\'s "Messiah" and Noisia.'),

  S('g-jumpup', 'Jump-up 1996', [
    [['kick', 'snare', 'hatc'], 'Two-step drums', 'A two-step at 174–176, the break loud.', 'a2'],
    [['reese', 'acid'], 'The bassline is the hook', 'A bassline with a melody — a reese and a squelchy acid-ish lead — that the crowd can sing.', 'a5'],
    [['sub'], 'Sub', 'A sub under it.', 'a5'],
    [['hoover'], 'A horn or a hoover', 'A hoover or a horn sample before the drop, a hip-hop vocal.', 'a7']
  ], 'A hip-hop intro, the drop at 33, a rewind. Aphrodite, Ganja Kru, DJ Hype, 1995–97.', ['akai-s1000', 'atari-cubase'], 'Study Aphrodite, DJ Hype\'s Ganja Kru, "Super Sharp Shooter" and Mickey Finn.'),

  S('g-frenchtouch', 'French touch 1997', [
    [['kick', 'clap'], 'Kick and clap', 'A kick at 122–126 and a clap: house drums.', 'a1'],
    [['stab'], 'The disco loop under a filter', 'A two-bar loop from a disco record, with a lowpass filter that opens over eight bars and shuts. The filter is the arrangement.', 'a7'],
    [['off', 'sub'], 'Bass', 'The disco bassline or a synth bass doubling it, with a sub.', 'a5'],
    [['hatc', 'hato'], 'Hats', 'Hats, with the whole mix through a compressor keyed from the kick so it pumps.', 'a8']
  ], 'Filter opens, filter closes, a breakdown with the loop alone, the kick back. Daft Punk, Cassius, Stardust, Alan Braxe, 1996–2000.', ['akai-s1000', 'cubase-vst', 'juno60'], 'Study "Music Sounds Better with You", "Da Funk", Cassius\'s "1999" and Alan Braxe.');

  /* ---------- rendering ---------- */
  window.HowTo = {
    html(n){
      const r = R[n.id]; if (!r || n.type !== 'genre') return '';
      const P = PRESET(r.preset); if (!P) return '';
      const layerName = l => (DECK_LAYERS.find(d => d[0] === l) || [l, l])[1];
      const steps = r.steps.map((s, i) => `<li class="hstep" data-i="${i}"><b>${i + 1}. ${s[1]}</b> <span class="cap">· ${s[0].map(layerName).join(', ')} · <a class="xl" href="#${s[3]}">${CHAPTER_TITLES[s[3]] || s[3]}</a></span><p>${s[2]}</p><button class="play hbuild" data-i="${i}">Hear it so far</button></li>`).join('');
      const ms = r.m.filter(id => NODE[id]).map(id => `<a class="chip" href="#${id}" style="--c:var(--synth)"><i></i>${NODE[id].title}</a>`).join('');
      return `<h3>How to make it</h3><p class="cap">Build the pattern a layer at a time — each button plays the grid with only the layers so far — then the arrangement, the machines and the records to study. ${P.bpm} BPM, key of ${P.key[0]}.</p>
        <ol class="howto">${steps}</ol>
        <div class="howgrid" data-preset="${r.preset}"></div>
        <h4>Arranging it</h4><p>${r.arr}</p>
        ${ms ? `<h4>The machines</h4><div class="chips">${ms}</div>` : ''}
        <h4>Study</h4><p>${r.l}</p>`;
    },
    mount(art){
      art.querySelectorAll('.howgrid:not([data-mounted])').forEach(box => {
        PatternGrid.mount(box, [box.dataset.preset]);
        const st = box._grid; if (!st) return;
        const steps = (R[art.dataset.node || (location.hash || '').slice(1)] || {}).steps || [];
        art.querySelectorAll('.hbuild').forEach(btn => btn.onclick = () => {
          const upto = +btn.dataset.i; const on = new Set(steps.slice(0, upto + 1).flatMap(s => s[0]));
          DECK_LAYERS.forEach(([lid]) => { st.mute[lid] = !on.has(lid); });
          art.querySelectorAll('.hstep').forEach(li => li.classList.toggle('done', +li.dataset.i <= upto));
          if (!st.playing) PatternGrid.play(st); else st.render();
          box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
    },
    // index page
    index(){
      const box = document.getElementById('makeIndex'); if (!box || box.dataset.done) return; box.dataset.done = 1;
      const rows = Object.keys(R).map(id => ({ id, n: NODE[id], P: PRESET(R[id].preset), r: R[id] })).filter(x => x.n && x.P).sort((a, b) => a.P.bpm - b.P.bpm);
      box.innerHTML = `<div class="makelist">${rows.map(x => `<a class="makerow" href="#${x.id}"><span class="bpm">${x.P.bpm}</span><span class="mname">${x.n.title}<small>${x.n.years || ''} · ${x.r.steps.length} steps · ${x.r.m.filter(m => NODE[m]).map(m => NODE[m].title.replace(/^(Roland|Akai|Korg|Yamaha|Clavia|Access|E-mu|Novation|Elektron|Pioneer|PLAYdifferently) /, '')).slice(0, 3).join(', ')}</small></span><button class="play era-btn" data-genre="${x.r.preset}" data-bars="2" onclick="event.preventDefault()">2 bars</button></a>`).join('')}</div>`;
      if (window.wireEraButtons) wireEraButtons();
    }
  };
  window.PageHooks = window.PageHooks || {}; window.PageHooks.make = () => HowTo.index();
})();
