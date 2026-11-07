/* ===================================================================
   MIXER — two synced decks, EQ/filter/faders, genre presets, auto-set
   Depends on engine.js (AudioCore, S, duckAt, parsePat, ACID_NOTES, reg)
   =================================================================== */

/* extra generators used by the decks */
S.snare = (ch, t, p = {}) => {
  const c = ch.c, P = { decay: 0.18, level: 0.6, ...p };
  const n = c.createBufferSource(); n.buffer = AudioCore.noise(c);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.7;
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  n.connect(bp); bp.connect(g); g.connect(dest(ch, P, 'snare')); n.start(t); n.stop(t + P.decay + 0.05); reg(ch, n, t + P.decay + 0.05);
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(230, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.05);
  const og = c.createGain(); og.gain.setValueAtTime(P.level * 0.7, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og); og.connect(dest(ch, P, 'snare')); o.start(t); o.stop(t + 0.15); reg(ch, o, t + 0.15);
};
S.hoover = (ch, t, p = {}) => {
  const c = ch.c, P = { root: 220, decay: 0.45, level: 0.09, ...p };
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(3500, t); f.frequency.exponentialRampToValueAtTime(600, t + P.decay);
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay + 0.1);
  const sp = P.spread == null ? 1 : P.spread; [[-25, 1], [0, 1], [25, 1], [0, 0.5]].forEach(([det, mul]) => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.detune.value = det * sp;
    o.frequency.setValueAtTime(P.root * mul * 1.6, t); o.frequency.exponentialRampToValueAtTime(P.root * mul, t + 0.12);
    o.connect(f); o.start(t); o.stop(t + P.decay + 0.3); reg(ch, o, t + P.decay + 0.3);
  });
  f.connect(g); g.connect(dest(ch, P, 'hoover'));
  const vs = c.createGain(); vs.gain.value = 0.4; g.connect(vs); vs.connect(ch.verbSend);
};
S.bleep = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: 880, decay: 0.09, level: 0.22, ...p };
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = P.freq;
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.004); g.gain.setValueAtTime(P.level, t + P.decay * 0.6); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  o.connect(g); g.connect(dest(ch, P, 'bleep')); o.start(t); o.stop(t + P.decay + 0.05); reg(ch, o, t + P.decay + 0.05);
  const ds = c.createGain(); ds.gain.value = 0.3; g.connect(ds); ds.connect(ch.delSend);
};

S.reese = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: 55, dur: 0.6, level: 0.35, cutoff: 420, ...p };
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(P.cutoff * 1.6, t); f.frequency.exponentialRampToValueAtTime(P.cutoff, t + P.dur);
  const sh = c.createWaveShaper(); sh.curve = AudioCore.curve(P.drive || 3);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.01); g.gain.setValueAtTime(P.level, t + P.dur * 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + P.dur);
  const rs = P.spread == null ? 1 : P.spread; [-14, 14, 0].forEach((det, i) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq * (i === 2 ? 0.5 : 1); o.detune.value = det * rs; o.connect(f); o.start(t); o.stop(t + P.dur + 0.05); reg(ch, o, t + P.dur + 0.05); });
  f.connect(sh); sh.connect(g); g.connect(dest(ch, P, 'reese'));
};
S.supersaw = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: 440, gate: 0.2, level: 0.05, cutoff: 2600, ...p };
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1; f.frequency.value = P.cutoff;
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.01); g.gain.setValueAtTime(P.level, t + P.gate); g.gain.exponentialRampToValueAtTime(0.001, t + P.gate + 0.08);
  const sp = P.spread == null ? 1 : P.spread, dets = [-24, -14, -6, 0, 6, 14, 24].slice(0, P.voices || 7); dets.forEach(det => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = P.freq; o.detune.value = det * sp; o.connect(f); o.start(t); o.stop(t + P.gate + 0.15); reg(ch, o, t + P.gate + 0.15); });
  f.connect(g); g.connect(dest(ch, P, 'super'));
  const vs = c.createGain(); vs.gain.value = 0.5; g.connect(vs); vs.connect(ch.verbSend); const ds = c.createGain(); ds.gain.value = 0.35; g.connect(ds); ds.connect(ch.delSend);
};
S.piano = (ch, t, p = {}) => {
  const c = ch.c, P = { root: 220, chord: [0, 4, 7, 11], decay: 0.35, level: 0.09, ...p };
  const g = c.createGain(); g.gain.setValueAtTime(P.level, t); g.gain.exponentialRampToValueAtTime(0.001, t + P.decay);
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(1200, t + P.decay);
  P.chord.forEach(semi => { const fr = P.root * Math.pow(2, semi / 12); [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 3, 0.12]].forEach(([w, mul, lv]) => { const o = c.createOscillator(); o.type = w; o.frequency.value = fr * mul; o.detune.value = (Math.random() - 0.5) * 6; const og = c.createGain(); og.gain.value = lv; o.connect(og); og.connect(f); o.start(t); o.stop(t + P.decay + 0.05); reg(ch, o, t + P.decay + 0.05); }); });
  f.connect(g); g.connect(dest(ch, P, 'piano')); const vs = c.createGain(); vs.gain.value = 0.3; g.connect(vs); vs.connect(ch.verbSend);
};
S.organ = (ch, t, p = {}) => {
  const c = ch.c, P = { freq: 98, dur: 0.16, level: 0.3, ...p };
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.level, t + 0.006); g.gain.setValueAtTime(P.level, t + P.dur); g.gain.exponentialRampToValueAtTime(0.001, t + P.dur + 0.04);
  [[1, 1], [2, 0.5], [3, 0.3], [4, 0.2]].forEach(([mul, lv]) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = P.freq * mul; const og = c.createGain(); og.gain.value = lv; o.connect(og); og.connect(g); o.start(t); o.stop(t + P.dur + 0.1); reg(ch, o, t + P.dur + 0.1); });
  g.connect(dest(ch, P, 'organ'));
};

const DECK_LAYERS = [
  ['kick', 'Kick', 'out'], ['rumble', 'Rumble', 'duck'], ['sub', 'Sub', 'duck'], ['off', 'Offbeat bass', 'duck'], ['acid', 'Acid', 'duck'],
  ['stab', 'Stab', 'duck'], ['hoover', 'Hoover', 'duck'], ['bleep', 'Bleep', 'duck'], ['hatc', 'Closed hat', 'out'], ['hato', 'Open hat', 'out'],
  ['ride', 'Ride', 'out'], ['clap', 'Clap', 'out'], ['snare', 'Snare', 'out'], ['tom', 'Tom', 'out'], ['metal', 'Metallic', 'out'], ['shaker', 'Shaker', 'out'],
  ['reese', 'Reese bass', 'duck'], ['super', 'Supersaw', 'duck'], ['piano', 'Piano', 'duck'], ['organ', 'Organ bass', 'duck']
];
const E16 = '................';

/* ---------- Genre presets: a decade-by-decade dialect map ---------- */
const GENRES = {
  'Detroit 1988': {
    era: '1985–92', city: 'Detroit', bpm: 122, swing: 0.08, key: ['A', 55], sc: 0.45, rumble: 0.15, rumbleLp: 100,
    kick: { pitchStart: 150, pitchEnd: 55, pitchDecay: 0.04, ampDecay: 0.38, drive: 1.6, click: 0.6 },
    hat: { decayC: 0.05, decayO: 0.26, tone: 9500 }, stab: { detune: 8, cutoff: 900, env: 2200, decay: 0.32, verb: 0.6, chord: [0, 3, 7, 10] },
    acid: { cutoff: 500, res: 10, env: 2000, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.2, dur: 0.5 }, offCutoff: 600, acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10],
    levels: { stab: 0.8, hatc: 0.5, hato: 0.45, clap: 0.7, shaker: 0.45, sub: 0.8, tom: 0.6 },
    pat: { kick: 'x...x...x...x...', sub: 'x.......x.......', stab: 'x..x..x...x..x..', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', tom: '......x.......x.', shaker: 'xxxxxxxxxxxxxxxx' },
    notes: 'Hi-tech soul: a warm 909, jazzy minor-7th stabs, shakers and congas. The kick is not the point; the chord is.'
  },
  'Chicago acid 1987': {
    era: '1986–89', city: 'Chicago', bpm: 124, swing: 0.05, key: ['F', 43.65], sc: 0.4, rumble: 0.1, rumbleLp: 100,
    kick: { pitchStart: 120, pitchEnd: 50, pitchDecay: 0.06, ampDecay: 0.55, drive: 1.3, click: 0.3 },
    hat: { decayC: 0.06, decayO: 0.3, tone: 9000 }, stab: { detune: 6, cutoff: 800, env: 1500, decay: 0.25, verb: 0.3, chord: [0, 3, 7] },
    acid: { cutoff: 380, res: 17, env: 3200, decay: 0.22, wave: 'sawtooth' }, sub: { drive: 1, dur: 0.4 }, offCutoff: 600, acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0],
    levels: { acid: 0.7, hatc: 0.45, hato: 0.4, clap: 0.75, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', acid: 'xxAxx.sxxAx.xsAx', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', tom: '.......x.......x' },
    notes: 'A 707 under a 303 with the resonance up: Phuture, Trax Records, the sound that crossed to London.'
  },
  'UK bleep 1990': {
    era: '1989–91', city: 'Sheffield / Leeds', bpm: 118, swing: 0.04, key: ['E', 41.2], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 130, pitchEnd: 45, pitchDecay: 0.05, ampDecay: 0.42, drive: 1.5, click: 0.4 },
    hat: { decayC: 0.04, decayO: 0.2, tone: 10000 }, stab: { detune: 4, cutoff: 1200, env: 1000, decay: 0.2, verb: 0.2, chord: [0, 7] },
    acid: { cutoff: 500, res: 8, env: 1500, decay: 0.2, wave: 'square' }, sub: { drive: 1, dur: 0.3 }, offCutoff: 500, acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10],
    levels: { sub: 0.95, bleep: 0.6, snare: 0.6, hatc: 0.4, hato: 0.3 },
    pat: { kick: 'x...x...x..x..x.', sub: 'x..x..x.x..x..x.', bleep: '..x...x.....x.x.', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '......x.......x.' },
    notes: 'Warp, LFO, Sweet Exorcist: reggae sound-system sub-bass under Detroit minimalism, with sine "bleeps" as the hook.'
  },
  'UK rave 1991': {
    era: '1990–92', city: 'London / M25', bpm: 138, swing: 0, key: ['G', 49], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 170, pitchEnd: 52, pitchDecay: 0.03, ampDecay: 0.3, drive: 3, click: 0.7 },
    hat: { decayC: 0.04, decayO: 0.18, tone: 9500 }, stab: { detune: 12, cutoff: 1400, env: 3000, decay: 0.25, verb: 0.5, chord: [0, 3, 7, 12] },
    acid: { cutoff: 600, res: 12, env: 2500, decay: 0.18, wave: 'sawtooth' }, sub: { drive: 1.5, dur: 0.3 }, offCutoff: 700, acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0],
    levels: { hoover: 0.8, snare: 0.75, sub: 0.8, hatc: 0.45, hato: 0.4, stab: 0.5 },
    pat: { kick: 'x..x..x...x.x...', snare: '....x.......x...', sub: 'x..x..x...x.x...', hoover: 'x.......x.....x.', hatc: 'xxxxxxxxxxxxxxxx', hato: '......x.......x.', stab: '..x.......x.....' },
    notes: 'Breakbeat hardcore: a chopped break, a hoover, sub-bass and 138 BPM. Where UK rave left techno and became jungle.'
  },
  'Acid techno 1994': {
    era: '1993–', city: 'London', bpm: 140, swing: 0, key: ['A', 55], sc: 0.5, rumble: 0.2, rumbleLp: 110,
    kick: { pitchStart: 190, pitchEnd: 55, pitchDecay: 0.03, ampDecay: 0.3, drive: 5, click: 0.8 },
    hat: { decayC: 0.04, decayO: 0.2, tone: 10000 }, stab: { detune: 12, cutoff: 600, env: 2500, decay: 0.15, verb: 0.3, chord: [0, 7] },
    acid: { cutoff: 480, res: 19, env: 3800, decay: 0.16, wave: 'sawtooth' }, sub: { drive: 2, dur: 0.25 }, offCutoff: 800, acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0],
    levels: { acid: 0.85, hatc: 0.5, hato: 0.45, metal: 0.4, clap: 0.5 },
    pat: { kick: 'x...x...x...x...', acid: 'xAxxx.sxxAx.xsAx', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', metal: '.......x.......x', clap: '....x.......x...' },
    notes: 'Stay Up Forever, Spiral Tribe: a distorted 303 line over a hard 909 at 140. The free-party sound.'
  },
  'Tresor 1992': {
    era: '1991–95', city: 'Berlin', bpm: 138, swing: 0, key: ['F#', 46.25], sc: 0.6, rumble: 0.35, rumbleLp: 110,
    kick: { pitchStart: 200, pitchEnd: 50, pitchDecay: 0.035, ampDecay: 0.32, drive: 4, click: 0.8 },
    hat: { decayC: 0.04, decayO: 0.22, tone: 10500 }, stab: { detune: 14, cutoff: 500, env: 3500, decay: 0.18, verb: 0.25, chord: [0, 6] },
    acid: { cutoff: 700, res: 14, env: 3000, decay: 0.14, wave: 'sawtooth' }, sub: { drive: 2, dur: 0.3 }, offCutoff: 900, acidNotes: [0, 0, 0, 12, 0, 0, 13, 0, 0, 0, 12, 0, 0, 1, 0, 0],
    levels: { off: 0.8, hatc: 0.6, hato: 0.5, metal: 0.6, stab: 0.5, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', metal: 'x..x..x..x..x..x', stab: '......x.......x.', tom: '...........x...x' },
    notes: 'The vault: Detroit records played harder and faster to a crowd from both halves of a city. No clap, no mercy.'
  },
  'Birmingham 1995': {
    era: '1993–99', city: 'Birmingham', bpm: 136, swing: 0, key: ['D', 36.71], sc: 0.5, rumble: 0.3, rumbleLp: 120,
    kick: { pitchStart: 160, pitchEnd: 48, pitchDecay: 0.03, ampDecay: 0.28, drive: 5, click: 0.9 },
    hat: { decayC: 0.035, decayO: 0.2, tone: 11000 }, stab: { detune: 20, cutoff: 400, env: 4000, decay: 0.14, verb: 0.4, chord: [0, 1, 7] },
    acid: { cutoff: 900, res: 10, env: 2000, decay: 0.12, wave: 'square' }, sub: { drive: 2.5, dur: 0.25 }, offCutoff: 800, acidNotes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    levels: { metal: 0.7, ride: 0.5, stab: 0.55, hatc: 0.5, tom: 0.55, shaker: 0.35 },
    pat: { kick: 'x...x...x...x...', metal: 'x..x..x..x..x..x', ride: '..x...x...x...x.', stab: '.......x.....x..', hatc: 'x.x.x.x.x.x.x.x.', tom: '.x..........x...', shaker: 'x.xxx.xxx.xxx.xx' },
    notes: 'Surgeon, Regis, House of God: dry, metallic, relentless. Industrial textures on a 909 at 136.'
  },
  'Dub techno 1995': {
    era: '1993–', city: 'Berlin', bpm: 122, swing: 0.05, key: ['G', 49], sc: 0.55, rumble: 0.4, rumbleLp: 90,
    kick: { pitchStart: 110, pitchEnd: 49, pitchDecay: 0.06, ampDecay: 0.5, drive: 1.4, click: 0.2 },
    hat: { decayC: 0.05, decayO: 0.3, tone: 8500 }, stab: { detune: 9, cutoff: 700, env: 1800, decay: 0.22, verb: 0.3, chord: [0, 3, 7, 10], delay: 0.9 },
    acid: { cutoff: 400, res: 8, env: 1200, decay: 0.3, wave: 'sawtooth' }, sub: { drive: 1.2, dur: 0.6 }, offCutoff: 500, acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10],
    levels: { stab: 0.75, sub: 0.85, shaker: 0.5, hatc: 0.35, hato: 0.3 },
    pat: { kick: 'x...x...x...x...', sub: 'x.......x.......', stab: '...x......x.....', hatc: '..x...x...x...x.', shaker: 'x.xxx.xxx.xxx.xx', hato: '..............x.' },
    notes: 'Basic Channel: one chord into a filtered tape delay, forever. The echo is the instrument.'
  },
  'Schranz 2002': {
    era: '2000–05', city: 'Frankfurt', bpm: 145, swing: 0, key: ['F', 43.65], sc: 0.6, rumble: 0.3, rumbleLp: 120,
    kick: { pitchStart: 200, pitchEnd: 47, pitchDecay: 0.03, ampDecay: 0.26, drive: 6, click: 0.9 },
    hat: { decayC: 0.03, decayO: 0.16, tone: 11000 }, stab: { detune: 25, cutoff: 350, env: 4500, decay: 0.1, verb: 0.2, chord: [0, 7] },
    acid: { cutoff: 800, res: 12, env: 3000, decay: 0.1, wave: 'sawtooth' }, sub: { drive: 3, dur: 0.2 }, offCutoff: 1000, acidNotes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    levels: { metal: 0.8, ride: 0.55, off: 0.7, hatc: 0.5, stab: 0.5, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', metal: 'x.xx.xx.x.xx.xx.', ride: 'x.x.x.x.x.x.x.x.', off: '..x...x...x...x.', hatc: 'xxxxxxxxxxxxxxxx', stab: '.x......x.....x.', tom: '...x.......x....' },
    notes: 'Chris Liebing–era loop techno: distorted, 145 BPM, percussion loops layered until the groove is a wall.'
  },
  'Minimal 2004': {
    era: '2001–08', city: 'Berlin / Cologne', bpm: 126, swing: 0.15, key: ['A', 55], sc: 0.35, rumble: 0.1, rumbleLp: 100,
    kick: { pitchStart: 120, pitchEnd: 55, pitchDecay: 0.05, ampDecay: 0.3, drive: 1.3, click: 0.4 },
    hat: { decayC: 0.03, decayO: 0.15, tone: 12000 }, stab: { detune: 3, cutoff: 1500, env: 600, decay: 0.12, verb: 0.3, chord: [0, 7] },
    acid: { cutoff: 600, res: 8, env: 900, decay: 0.15, wave: 'square' }, sub: { drive: 1, dur: 0.35 }, offCutoff: 600, acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10],
    levels: { metal: 0.4, bleep: 0.35, sub: 0.8, hatc: 0.35, tom: 0.4, shaker: 0.35 },
    pat: { kick: 'x...x...x...x...', sub: 'x.......x.......', metal: '.x...x.x...x..x.', bleep: '......x.........', hatc: '..x...x...x...x.', tom: '.............x..', shaker: '.x.x.x.x.x.x.x.x' },
    notes: 'Villalobos, Hawtin, Perlon: almost nothing, swung hard. Clicks, a sub, one bleep every bar, and space.'
  },
  'Berghain 2010': {
    era: '2008–16', city: 'Berlin', bpm: 130, swing: 0, key: ['G', 49], sc: 0.8, rumble: 0.85, rumbleLp: 110,
    kick: { pitchStart: 180, pitchEnd: 49, pitchDecay: 0.045, ampDecay: 0.45, drive: 2.8, click: 0.5 },
    hat: { decayC: 0.045, decayO: 0.28, tone: 9000 }, stab: { detune: 10, cutoff: 700, env: 2800, decay: 0.3, verb: 0.5, chord: [0, 3, 7] },
    acid: { cutoff: 500, res: 12, env: 2500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.5, dur: 0.45 }, offCutoff: 700, acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0],
    levels: { hatc: 0.55, hato: 0.45, metal: 0.5, stab: 0.6, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', metal: 'x..x..x..x..x..x', stab: '......x.......x.', tom: '...x......x.....' },
    notes: 'Ostgut Ton: the rumble is the bassline. Dark, physical, no clap, built to run for ten hours.'
  },
  'Hypnotic 2015': {
    era: '2012–', city: 'Italy / Berlin', bpm: 128, swing: 0.12, key: ['E', 41.2], sc: 0.7, rumble: 0.65, rumbleLp: 100,
    kick: { pitchStart: 150, pitchEnd: 41.2, pitchDecay: 0.05, ampDecay: 0.5, drive: 2, click: 0.3 },
    hat: { decayC: 0.04, decayO: 0.22, tone: 9500 }, stab: { detune: 6, cutoff: 600, env: 1200, decay: 0.4, verb: 0.9, chord: [0, 7, 12] },
    acid: { cutoff: 350, res: 10, env: 1500, decay: 0.35, wave: 'sawtooth' }, sub: { drive: 1.3, dur: 0.9 }, offCutoff: 500, acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10],
    levels: { sub: 0.85, tom: 0.6, metal: 0.45, shaker: 0.5, hatc: 0.4, hato: 0.35, stab: 0.4 },
    pat: { kick: 'x...x...x...x...', sub: 'x...............', tom: 'x..x..x..x..x..x', metal: '.x..x..x..x..x..', shaker: 'xxxxxxxxxxxxxxxx', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', stab: '...............x' },
    notes: 'Dozzy, Rrose, Voices From The Lake: 3-against-4 percussion that never resolves, a long sub, a chord once a bar.'
  },
  'Peak-time 2017': {
    era: '2014–', city: 'Stockholm / Amsterdam', bpm: 136, swing: 0, key: ['F', 43.65], sc: 0.75, rumble: 0.5, rumbleLp: 120,
    kick: { pitchStart: 190, pitchEnd: 47, pitchDecay: 0.04, ampDecay: 0.4, drive: 3.5, click: 0.7 },
    hat: { decayC: 0.04, decayO: 0.2, tone: 9800 }, stab: { detune: 12, cutoff: 900, env: 3500, decay: 0.22, verb: 0.4, chord: [0, 3, 7] },
    acid: { cutoff: 700, res: 10, env: 3000, decay: 0.15, wave: 'sawtooth' }, sub: { drive: 2, dur: 0.3 }, offCutoff: 800, acidNotes: [0, 7, 12, 10, 7, 3, 7, 15, 0, 7, 12, 10, 7, 3, 19, 15],
    levels: { off: 0.85, clap: 0.8, ride: 0.5, hatc: 0.5, hato: 0.45, bleep: 0.45, stab: 0.5, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', clap: '....x.......x...', ride: 'x.x.x.x.x.x.x.x.', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', bleep: 'x.x.x.x.x.x.x.x.', stab: '......x.....x...', tom: '.............x.x' },
    notes: 'Drumcode, Awakenings main stage: offbeat bass, big clap, a ride and an arpeggio. Built for 20,000 people.'
  },
  'Industrial 2018': {
    era: '2015–', city: 'Berlin / Paris', bpm: 140, swing: 0, key: ['D', 36.71], sc: 0.7, rumble: 0.7, rumbleLp: 130,
    kick: { pitchStart: 220, pitchEnd: 46, pitchDecay: 0.03, ampDecay: 0.35, drive: 9, click: 1 },
    hat: { decayC: 0.03, decayO: 0.18, tone: 11500 }, stab: { detune: 30, cutoff: 300, env: 5000, decay: 0.12, verb: 0.3, chord: [0, 1, 6] },
    acid: { cutoff: 900, res: 16, env: 4000, decay: 0.12, wave: 'sawtooth' }, sub: { drive: 4, dur: 0.25 }, offCutoff: 900, acidNotes: [0, 0, 1, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 13, 0, 0],
    levels: { metal: 0.8, shaker: 0.6, acid: 0.55, hatc: 0.5, stab: 0.55, snare: 0.5 },
    pat: { kick: 'x...x...x...x...', metal: 'x.x.xx.x.x.xx.x.', shaker: 'xxxxxxxxxxxxxxxx', acid: '..A....x..A..x..', hatc: 'x.x.x.x.x.x.x.x.', stab: '.......x......x.', snare: '..........x.....' },
    notes: 'Ancient Methods, Perc, Paula Temple: the kick is a weapon, the percussion is scrap metal, the acid is a siren.'
  },
  'Hard techno 2023': {
    era: '2020–', city: 'everywhere', bpm: 152, swing: 0, key: ['F', 43.65], sc: 0.7, rumble: 0.5, rumbleLp: 130,
    kick: { pitchStart: 240, pitchEnd: 46, pitchDecay: 0.03, ampDecay: 0.3, drive: 10, click: 1 },
    hat: { decayC: 0.03, decayO: 0.16, tone: 10500 }, stab: { detune: 18, cutoff: 1200, env: 4000, decay: 0.18, verb: 0.5, chord: [0, 3, 7, 12] },
    acid: { cutoff: 700, res: 12, env: 3000, decay: 0.12, wave: 'sawtooth' }, sub: { drive: 3, dur: 0.2 }, offCutoff: 1000, acidNotes: [0, 7, 12, 10, 7, 3, 7, 15, 0, 7, 12, 10, 7, 3, 19, 15],
    levels: { hoover: 0.75, clap: 0.8, hato: 0.5, hatc: 0.5, snare: 0.55, off: 0.6, bleep: 0.4 },
    pat: { kick: 'x...x...x...x...', clap: '....x.......x...', hato: '..x...x...x...x.', hatc: 'xxxxxxxxxxxxxxxx', hoover: 'x.......x...x...', snare: '..............xx', off: '..x...x...x...x.', bleep: 'x.x.x.x.x.x.x.x.' },
    notes: '999999999, I Hate Models, Sara Landry: 150+, trance leads and hoovers, snare rolls, distortion on everything.'
  }
};
Object.assign(GENRES, {
  'Tech-house 1997': {
    era: '1994–2002', city: 'London', bpm: 125, swing: 0.22, key: ['G', 49], sc: 0.4, rumble: 0.15, rumbleLp: 90,
    kick: { pitchStart: 110, pitchEnd: 49, pitchDecay: 0.05, ampDecay: 0.38, drive: 1.4, click: 0.45 }, hat: { decayC: 0.04, decayO: 0.22, tone: 9500 },
    stab: { detune: 6, cutoff: 900, env: 700, decay: 0.16, verb: 0.35, chord: [0, 3, 7, 10] }, acid: { cutoff: 400, res: 7, env: 1200, decay: 0.22, wave: 'square' }, sub: { drive: 1.2, dur: 0.3 }, offCutoff: 450,
    acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10], bassNotes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pianoChord: [0, 3, 7, 10],
    levels: { sub: 0.85, stab: 0.5, hatc: 0.45, hato: 0.4, shaker: 0.45, clap: 0.5, tom: 0.5, bleep: 0.3 },
    pat: { kick: 'x...x...x...x...', sub: 'x..x..x...x..x..', stab: '..x.....x..x....', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', shaker: 'xxxxxxxxxxxxxxxx', clap: '....x.......x...', tom: '.......x......x.', bleep: '..............x.' },
    notes: 'Wiggle, Plink Plonk, The End\'s Subterrain: house swing at 125, a syncopated sub bassline, a dubbed-out chord, no vocal. The crossing.'
  },
  'Chicago house 1986': {
    era: '1984–88', city: 'Chicago', bpm: 122, swing: 0.1, key: ['A', 55], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 120, pitchEnd: 55, pitchDecay: 0.05, ampDecay: 0.4, drive: 1.3, click: 0.4 }, hat: { decayC: 0.05, decayO: 0.3, tone: 9000 },
    stab: { detune: 4, cutoff: 1200, env: 800, decay: 0.2, verb: 0.3, chord: [0, 3, 7, 10] }, acid: { cutoff: 500, res: 8, env: 1500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1, dur: 0.35 }, offCutoff: 500,
    acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10], bassNotes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pianoChord: [0, 3, 7, 10],
    levels: { piano: 0.8, organ: 0.6, clap: 0.8, hato: 0.5, hatc: 0.45, sub: 0.7, tom: 0.5 },
    pat: { kick: 'x...x...x...x...', piano: '..x...x.x...x...', organ: '..x.x...x..x..x.', clap: '....x.......x...', hato: '..x...x...x...x.', hatc: 'x.x.x.x.x.x.x.x.', sub: 'x.......x.......', tom: '......x.......x.' },
    notes: 'Trax Records, 1986: a 909, a piano stab, an organ bassline and a clap on 2 and 4. The Warehouse\'s music on a drum machine.'
  },
  'UK garage 1998': {
    era: '1997–2001', city: 'London', bpm: 132, swing: 0.2, key: ['A', 55], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 130, pitchEnd: 52, pitchDecay: 0.04, ampDecay: 0.3, drive: 1.5, click: 0.6 }, hat: { decayC: 0.04, decayO: 0.18, tone: 10500 },
    stab: { detune: 6, cutoff: 1500, env: 1200, decay: 0.15, verb: 0.3, chord: [0, 4, 7, 11] }, acid: { cutoff: 500, res: 8, env: 1500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.2, dur: 0.3 }, offCutoff: 600,
    acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10], bassNotes: [0, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 3], pianoChord: [0, 4, 7, 11],
    levels: { organ: 0.75, snare: 0.6, hatc: 0.5, hato: 0.4, piano: 0.6, shaker: 0.45, bleep: 0.3 },
    pat: { kick: 'x.....x...x.....', snare: '....x.......x...', hatc: 'x.xxx.x.x.xxx.x.', hato: '......x.......x.', organ: 'x..x..x.x..x..x.', piano: '..x.....x.x.....', shaker: '.x.x.x.x.x.x.x.x', bleep: '...........x....' },
    notes: '2-step: the kick drops out of the grid, the hats swing hard, an organ bassline and a chopped vocal. US garage at +8 with jungle\'s manners.'
  },
  'Jungle 1994': {
    era: '1993–95', city: 'London', bpm: 160, swing: 0, key: ['F', 43.65], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 160, pitchEnd: 55, pitchDecay: 0.03, ampDecay: 0.22, drive: 2.5, click: 0.8 }, hat: { decayC: 0.03, decayO: 0.14, tone: 10000 },
    stab: { detune: 8, cutoff: 900, env: 1500, decay: 0.2, verb: 0.5, chord: [0, 3, 7] }, acid: { cutoff: 500, res: 8, env: 1500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.4, dur: 0.5 }, offCutoff: 600,
    acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10], bassNotes: [0, 0, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 3, 0],
    levels: { snare: 0.7, sub: 0.9, reese: 0.5, hatc: 0.45, hato: 0.35, shaker: 0.4, stab: 0.4, metal: 0.4 },
    pat: { kick: 'x..x......x.x...', snare: '....x..x....x..x', hatc: 'x.xxx.xx.xxx.xxx', hato: '..........x.....', sub: 'x.......x.......', reese: '........x.......', shaker: '.x.x.x.x.x.x.x.x', stab: '......x.......x.', metal: '...x.......x....' },
    notes: 'The Amen chopped and re-sequenced, reggae sub under it, a snare on the two and the "and" of four. Kool FM, 1994.'
  },
  'Drum & bass 1998': {
    era: '1996–2000', city: 'London', bpm: 172, swing: 0, key: ['D', 36.71], sc: 0.3, rumble: 0, rumbleLp: 90,
    kick: { pitchStart: 180, pitchEnd: 50, pitchDecay: 0.025, ampDecay: 0.18, drive: 3, click: 0.9 }, hat: { decayC: 0.025, decayO: 0.12, tone: 11000 },
    stab: { detune: 20, cutoff: 500, env: 3000, decay: 0.14, verb: 0.3, chord: [0, 1, 7] }, acid: { cutoff: 500, res: 8, env: 1500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 2, dur: 0.4 }, offCutoff: 600,
    acidNotes: [0, 0, 7, 0, 10, 0, 0, 3, 0, 7, 0, 12, 0, 3, 0, 10], bassNotes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0],
    levels: { snare: 0.75, reese: 0.8, sub: 0.6, hatc: 0.45, metal: 0.5, stab: 0.4, hato: 0.3 },
    pat: { kick: 'x.........x.....', snare: '....x.......x...', hatc: 'x.x.x.x.x.x.x.x.', hato: '......x.......x.', reese: 'x.........x...x.', sub: 'x...............', metal: '.......x.......x', stab: '..............x.' },
    notes: 'Techstep: a two-step kick and snare at 172, a distorted Reese bass, cold metal. No U Turn and Virus, 1998.'
  },
  'Trance 1993': {
    era: '1990–95', city: 'Frankfurt', bpm: 135, swing: 0, key: ['A', 55], sc: 0.5, rumble: 0.1, rumbleLp: 100,
    kick: { pitchStart: 170, pitchEnd: 50, pitchDecay: 0.04, ampDecay: 0.4, drive: 2.2, click: 0.6 }, hat: { decayC: 0.04, decayO: 0.22, tone: 9500 },
    stab: { detune: 10, cutoff: 1200, env: 2500, decay: 0.3, verb: 0.7, chord: [0, 7, 12] }, acid: { cutoff: 600, res: 12, env: 2800, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.5, dur: 0.3 }, offCutoff: 700,
    acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0], leadNotes: [0, 7, 12, 7, 3, 7, 12, 15, 0, 7, 12, 7, 3, 7, 19, 15],
    levels: { super: 0.7, acid: 0.55, off: 0.75, hatc: 0.5, hato: 0.45, clap: 0.6, stab: 0.5 },
    pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', super: 'x.x.x.x.x.x.x.x.', acid: 'x..x..x...x..x..', hatc: 'xxxxxxxxxxxxxxxx', hato: '..x...x...x...x.', clap: '....x.......x...', stab: '......x.........' },
    notes: 'Harthouse and Eye Q: a 303, an arpeggio, an offbeat bass and a 909 at 135. Techno with a melody and a build.'
  },
  'Trance 1999': {
    era: '1996–2002', city: 'Netherlands / Sheffield', bpm: 138, swing: 0, key: ['F', 43.65], sc: 0.6, rumble: 0.2, rumbleLp: 100,
    kick: { pitchStart: 190, pitchEnd: 47, pitchDecay: 0.04, ampDecay: 0.45, drive: 2.8, click: 0.6 }, hat: { decayC: 0.04, decayO: 0.22, tone: 10000 },
    stab: { detune: 12, cutoff: 1400, env: 3000, decay: 0.3, verb: 0.8, chord: [0, 4, 7, 12] }, acid: { cutoff: 600, res: 10, env: 2500, decay: 0.2, wave: 'sawtooth' }, sub: { drive: 1.5, dur: 0.3 }, offCutoff: 800,
    acidNotes: [0, 0, 12, 0, 3, 0, 0, 10, 0, 12, 0, 7, 0, 3, 15, 0], leadNotes: [0, 0, 4, 7, 12, 7, 4, 0, -1, -1, 2, 7, 11, 7, 2, -1],
    levels: { super: 0.85, off: 0.8, hatc: 0.5, hato: 0.5, clap: 0.7, snare: 0.5, sub: 0.6, piano: 0.4 },
    pat: { kick: 'x...x...x...x...', off: '..x...x...x...x.', super: 'x.xx.x.xx.xx.x.x', hatc: 'x.x.x.x.x.x.x.x.', hato: '..x...x...x...x.', clap: '....x.......x...', snare: '..............xx', sub: 'x.......x.......', piano: '....x.......x...' },
    notes: 'The boom: supersaw lead over an offbeat bass at 138, a snare roll into the drop, a key change waiting. Gatecrasher, 1999.'
  }
});
const GENRE_NAMES = Object.keys(GENRES);
const JOURNEYS = {
  'Techno: Detroit 1988 → hard techno 2023': [['Detroit 1988', 16, 2], ['Chicago acid 1987', 16, 4], ['Dub techno 1995', 16, 4], ['Minimal 2004', 16, 4], ['Hypnotic 2015', 16, 4], ['Berghain 2010', 16, 4], ['Tresor 1992', 16, 4], ['Birmingham 1995', 16, 4], ['Peak-time 2017', 16, 4], ['Industrial 2018', 16, 4], ['Hard techno 2023', 24, 4]],
  'Rave: acid 1987 → the field 1994 → now': [['Chicago acid 1987', 16, 4], ['UK bleep 1990', 16, 4], ['UK rave 1991', 24, 4], ['Acid techno 1994', 16, 4], ['Schranz 2002', 16, 4], ['Hard techno 2023', 24, 4]],
  'Berlin night: Tresor to Berghain': [['Tresor 1992', 16, 4], ['Dub techno 1995', 16, 4], ['Minimal 2004', 16, 4], ['Berghain 2010', 24, 4], ['Hypnotic 2015', 16, 4], ['Industrial 2018', 16, 4]],
  'Britain: bleep to Birmingham': [['UK bleep 1990', 16, 4], ['UK rave 1991', 16, 4], ['Acid techno 1994', 16, 4], ['Birmingham 1995', 24, 4], ['Peak-time 2017', 16, 4]],
  'Jungle: Rage to techstep': [['UK rave 1991', 16, 4], ['Jungle 1994', 24, 4], ['Drum & bass 1998', 24, 4]],
  'Trance: Frankfurt to the boom': [['Trance 1993', 16, 4], ['Trance 1999', 24, 4], ['Hard techno 2023', 16, 4]],
  'London: Clink Street to The End': [['Chicago acid 1987', 16, 4], ['Detroit 1988', 16, 4], ['UK rave 1991', 16, 4], ['Tech-house 1997', 24, 4], ['Minimal 2004', 16, 4]],
  'House: Chicago to garage': [['Chicago house 1986', 16, 4], ['Chicago acid 1987', 16, 4], ['Minimal 2004', 16, 4], ['UK garage 1998', 16, 4]],
  'The whole book in ten minutes': [['Chicago house 1986', 8, 2], ['Detroit 1988', 8, 2], ['Chicago acid 1987', 8, 2], ['UK bleep 1990', 8, 2], ['UK rave 1991', 8, 2], ['Tresor 1992', 8, 2], ['Trance 1993', 8, 2], ['Jungle 1994', 8, 2], ['Dub techno 1995', 8, 2], ['Birmingham 1995', 8, 2], ['Drum & bass 1998', 8, 2], ['UK garage 1998', 8, 2], ['Trance 1999', 8, 2], ['Schranz 2002', 8, 2], ['Minimal 2004', 8, 2], ['Berghain 2010', 8, 2], ['Hypnotic 2015', 8, 2], ['Peak-time 2017', 8, 2], ['Industrial 2018', 8, 2], ['Hard techno 2023', 12, 2]]
};
const DEFAULT_SET = [
  ['Detroit 1988', 16, 2], ['Chicago acid 1987', 16, 4], ['Dub techno 1995', 16, 4], ['Minimal 2004', 16, 4], ['Hypnotic 2015', 16, 4],
  ['Berghain 2010', 16, 4], ['Tresor 1992', 16, 4], ['Birmingham 1995', 16, 4], ['Peak-time 2017', 16, 4], ['Industrial 2018', 16, 4], ['Hard techno 2023', 24, 4]
];

/* ---------- Deck ---------- */
class Deck {
  constructor(id, ch){
    this.id = id; this.ch = ch; const c = ch.c;
    this.input = c.createGain();
    this.eqLow = c.createBiquadFilter(); this.eqLow.type = 'lowshelf'; this.eqLow.frequency.value = 180;
    this.eqMid = c.createBiquadFilter(); this.eqMid.type = 'peaking'; this.eqMid.frequency.value = 1200; this.eqMid.Q.value = 0.8;
    this.eqHigh = c.createBiquadFilter(); this.eqHigh.type = 'highshelf'; this.eqHigh.frequency.value = 6000;
    this.hpf = c.createBiquadFilter(); this.hpf.type = 'highpass'; this.hpf.frequency.value = 20; this.hpf.Q.value = 2;
    this.lpf = c.createBiquadFilter(); this.lpf.type = 'lowpass'; this.lpf.frequency.value = 20000; this.lpf.Q.value = 2;
    this.fader = c.createGain(); this.xf = c.createGain(); this.xf.gain.value = id === 'A' ? 1 : 0;
    this.input.connect(this.eqLow); this.eqLow.connect(this.eqMid); this.eqMid.connect(this.eqHigh); this.eqHigh.connect(this.hpf); this.hpf.connect(this.lpf); this.lpf.connect(this.fader); this.fader.connect(this.xf); this.xf.connect(ch.out);
    this.duck = c.createGain(); this.duck.connect(this.input);
    // own reverb + delay (so tails follow the fader)
    const verb = c.createConvolver(); verb.buffer = AudioCore.impulse(c, 2.2, 3, 0); const vr = c.createGain(); vr.gain.value = 0.4; verb.connect(vr); vr.connect(this.duck);
    this.verbSend = c.createGain(); this.verbSend.connect(verb);
    this.delay = c.createDelay(2); this.delay.delayTime.value = 0.34; const dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2200;
    const fb = c.createGain(); fb.gain.value = 0.55; this.delay.connect(dlp); dlp.connect(fb); fb.connect(this.delay); const dr = c.createGain(); dr.gain.value = 0.6; dlp.connect(dr); dr.connect(this.duck);
    this.delSend = c.createGain(); this.delSend.connect(this.delay);
    // rumble chain
    this.rumbleIn = c.createGain(); const rsh = c.createWaveShaper(); rsh.curve = AudioCore.curve(7); rsh.oversample = '2x';
    const rverb = c.createConvolver(); rverb.buffer = AudioCore.impulse(c, 1.5, 2.2, 0.08);
    const rhp = c.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 28; this.rlp = c.createBiquadFilter(); this.rlp.type = 'lowpass'; this.rlp.frequency.value = 110; this.rlp.Q.value = 2;
    this.tr = {}; DECK_LAYERS.forEach(([lid, , bus]) => { const g = c.createGain(); g.gain.value = 0.8; g.connect(bus === 'duck' ? this.duck : this.input); this.tr[lid] = g; });
    this.rumbleIn.connect(rsh); rsh.connect(rverb); rverb.connect(rhp); rhp.connect(this.rlp); this.rlp.connect(this.tr.rumble);
    this.chain = { c, live: ch.live, out: this.input, duck: this.duck, verbSend: this.verbSend, delSend: this.delSend, rumbleIn: this.rumbleIn, rlp: this.rlp, tr: this.tr };
    this.pat = {}; this.mute = {}; this.playing = false; this.bar = 0; this.genre = null; this.P = null; this.eq = { low: 0, mid: 0, high: 0 }; this.kills = { low: false, mid: false, high: false }; this.filter = 0; this.level = 1;
    this.load(GENRE_NAMES[0]);
  }
  load(name){
    const G = (window.PRESET ? PRESET(name) : GENRES[name]) || GENRES[GENRE_NAMES[0]]; this.genre = name;
    this.P = JSON.parse(JSON.stringify({ bassNotes: G.bassNotes || null, leadNotes: G.leadNotes || null, pianoChord: G.pianoChord || null, kick: G.kick, hat: G.hat, stab: G.stab, acid: G.acid, sub: G.sub, offCutoff: G.offCutoff, acidNotes: G.acidNotes, swing: G.swing, sc: { amt: G.sc, rel: 0.22, on: true }, root: G.key[1], key: G.key[0], bpm: G.bpm, rumble: G.rumble, rumbleLp: G.rumbleLp }));
    DECK_LAYERS.forEach(([lid]) => { this.pat[lid] = parsePat(G.pat[lid] || E16); this.mute[lid] = false; const lv = lid === 'rumble' ? G.rumble : (G.levels && G.levels[lid] != null ? G.levels[lid] : 0.8); this.tr[lid].gain.setTargetAtTime(lv, this.ch.c.currentTime, 0.02); });
    this.rlp.frequency.setTargetAtTime(G.rumbleLp, this.ch.c.currentTime, 0.02);
    this.bar = 0;
  }
  setDelayForBpm(bpm){ this.delay.delayTime.setTargetAtTime((60 / bpm) * 0.75, this.ch.c.currentTime, 0.05); }
  setEQ(band, db){ this.eq[band] = db; this.applyEQ(band); }
  setKill(band, on){ this.kills[band] = on; this.applyEQ(band); }
  applyEQ(band){ const node = band === 'low' ? this.eqLow : band === 'mid' ? this.eqMid : this.eqHigh; node.gain.setTargetAtTime(this.kills[band] ? -40 : this.eq[band], this.ch.c.currentTime, 0.02); }
  setFilter(v){ // -1..1 : negative = low-pass closing, positive = high-pass opening
    this.filter = v; const t = this.ch.c.currentTime;
    const lp = v < 0 ? 20000 * Math.pow(150 / 20000, -v) : 20000, hp = v > 0 ? 20 * Math.pow(5000 / 20, v) : 20;
    this.lpf.frequency.setTargetAtTime(lp, t, 0.03); this.hpf.frequency.setTargetAtTime(hp, t, 0.03);
  }
  setLevel(v){ this.level = v; this.fader.gain.setTargetAtTime(v, this.ch.c.currentTime, 0.02); }
  setXF(g){ this.xf.gain.setTargetAtTime(g, this.ch.c.currentTime, 0.02); }
  scheduleStep(i, t, bpm){
    const ch = this.chain, P = this.P, p = this.pat, aud = id => !this.mute[id];
    const d = 60 / bpm / 4; t = t + (i % 2 ? P.swing * d : 0);
    if (p.kick[i] && aud('kick')){ S.kick(ch, t, P.kick); if (aud('rumble')) S.rumble(ch, t, P.kick); duckAt(ch, t, P.sc); }
    if (p.sub[i] && aud('sub')) S.sub(ch, t, { freq: P.root, ...P.sub });
    if (p.off[i] && aud('off')) S.off(ch, t, { freq: P.root * 2, cutoff: P.offCutoff });
    if (p.acid[i] && aud('acid')){
      let j = (i + 1) % 16, n = 1; while (!p.acid[j] && n < 16){ j = (j + 1) % 16; n++; }
      const f = P.root * 2 * Math.pow(2, P.acidNotes[i] / 12), f2 = P.root * 2 * Math.pow(2, P.acidNotes[j] / 12);
      S.acid(ch, t, { ...P.acid, freq: f, accent: p.acid[i] === 2, slideTo: p.acid[i] === 3 ? f2 : null, slideTime: d * n });
    }
    if (p.stab[i] && aud('stab')) S.stab(ch, t, { root: P.root * 4, ...P.stab });
    if (p.hoover[i] && aud('hoover')) S.hoover(ch, t, { root: P.root * 4, ...(P.hoover || {}) });
    if (p.bleep[i] && aud('bleep')) S.bleep(ch, t, { freq: P.root * 8 * Math.pow(2, P.acidNotes[i] / 12) });
    if (p.hatc[i] && aud('hatc')) S.hat(ch, t, { decay: P.hat.decayC, tone: P.hat.tone, level: i % 2 ? 0.25 : 0.35 });
    if (p.hato[i] && aud('hato')) S.hat(ch, t, { open: true, decay: P.hat.decayO, tone: P.hat.tone });
    if (p.ride[i] && aud('ride')) S.hat(ch, t, { open: true, decay: 0.42, tone: 7500, level: 0.2, dest: this.tr.ride });
    if (p.clap[i] && aud('clap')) S.clap(ch, t, P.clap || {});
    if (p.snare[i] && aud('snare')) S.snare(ch, t, P.snare || {});
    if (p.tom[i] && aud('tom')) S.tom(ch, t, { pitch: 200, ...(P.tom || {}) });
    if (p.metal[i] && aud('metal')) S.metal(ch, t, { ratio: 1.41 });
    if (p.shaker[i] && aud('shaker')) S.shaker(ch, t, { level: i % 4 === 2 ? 0.4 : 0.22 });
    if (p.reese[i] && aud('reese')){ let j = (i + 1) % 16, n = 1; while (!p.reese[j] && n < 16){ j = (j + 1) % 16; n++; } S.reese(ch, t, { freq: P.root * Math.pow(2, (P.bassNotes ? P.bassNotes[i] : 0) / 12), dur: d * n * 0.95, ...(P.reese || {}) }); }
    if (p.super[i] && aud('super')){ let j = (i + 1) % 16, n = 1; while (!p.super[j] && n < 16){ j = (j + 1) % 16; n++; } S.supersaw(ch, t, { freq: P.root * 8 * Math.pow(2, (P.leadNotes ? P.leadNotes[i] : P.acidNotes[i]) / 12), gate: d * Math.min(n, 2) * 0.9, ...(P.super || {}) }); }
    if (p.piano[i] && aud('piano')) S.piano(ch, t, { root: P.root * 4, chord: P.pianoChord || [0, 3, 7, 10] });
    if (p.organ[i] && aud('organ')) S.organ(ch, t, { freq: P.root * 2 * Math.pow(2, (P.bassNotes ? P.bassNotes[i] : 0) / 12), dur: d * 0.9 });
  }
}

/* ---------- Mixer state + clock ---------- */
const Mixer = {
  ch: null, decks: null, demoDeck: null, bpm: 128, xf: -1, playing: false, step: 0, globalStep: 0, nextTime: 0, timer: null, queue: [], seconds: 0,
  program: DEFAULT_SET.map(([g, bars, trans]) => ({ genre: g, bars, trans })), auto: null, log: [],
  init(){
    if (this.decks) return; this.ch = AudioCore.get();
    this.decks = { A: new Deck('A', this.ch), B: new Deck('B', this.ch) };
    this.decks.B.load(GENRE_NAMES[1]); this.applyXF();
  },
  ensureDemo(){ if (!this.demoDeck){ const ch = AudioCore.get(); this.demoDeck = new Deck('D', ch); this.demoDeck.xf.gain.value = 1; } return this.demoDeck; },
  setBpm(v){ this.bpm = v; this.decks && Object.values(this.decks).forEach(d => d.setDelayForBpm(v)); if (typeof MixerUI !== 'undefined' && MixerUI.built){ MixerUI.updatePitch('A'); MixerUI.updatePitch('B'); } const el = document.getElementById('mxBpm'); if (el) el.firstChild.nodeValue = v.toFixed(1); const r = document.getElementById('mxBpmRange'); if (r && Math.abs(+r.value - v) > 0.05) r.value = v; },
  setXF(v){ this.xf = v; this.applyXF(); const r = document.getElementById('xfader'); if (r && Math.abs(+r.value - v) > 0.005) r.value = v; },
  applyXF(){ const a = Math.cos((this.xf + 1) / 2 * Math.PI / 2), b = Math.sin((this.xf + 1) / 2 * Math.PI / 2); this.decks.A.setXF(a); this.decks.B.setXF(b); },
  start(){
    if (this.playing) return; this.init(); AudioCore.get(); if (window.Seq) Seq.stop();
    this.playing = true; this.step = 0; this.globalStep = 0; this.seconds = 0; this.nextTime = this.ch.c.currentTime + 0.06; this.queue = [];
    this.timer = setInterval(() => this.tick(), 25); this.tick();
  },
  stop(){
    this.playing = false; clearInterval(this.timer); this.timer = null; this.queue = []; this.auto = null;
    if (this.decks) Object.values(this.decks).forEach(d => { d.playing = false; });
    document.querySelectorAll('#mixerRoot .cur').forEach(e => e.classList.remove('cur'));
    MixerUI.refresh();
  },
  tick(){
    const c = this.ch.c;
    while (this.nextTime < c.currentTime + 0.15){
      const d = 60 / this.bpm / 4;
      if (this.auto) this.auto.onStep(this.globalStep);
      Object.values(this.decks).forEach(dk => { if (dk.playing) dk.scheduleStep(this.step, this.nextTime, this.bpm); });
      this.queue.push({ step: this.step, g: this.globalStep, time: this.nextTime });
      this.nextTime += d; this.seconds += d; this.step = (this.step + 1) % 16; this.globalStep++;
      if (this.step === 0) Object.values(this.decks).forEach(dk => { if (dk.playing) dk.bar++; });
    }
  },
  deckPlay(id){ this.init(); AudioCore.get(); const dk = this.decks[id]; if (dk.playing) return; dk.playing = true; dk.bar = 0; if (!this.playing){ this.setBpm(dk.P.bpm); this.start(); } MixerUI.refresh(); },
  deckStop(id){ const dk = this.decks[id]; dk.playing = false; if (!Object.values(this.decks).some(d => d.playing) && !this.auto) this.stop(); MixerUI.refresh(); },
  timeStr(){ const s = Math.floor(this.seconds); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); },
  addLog(line){ this.log.push(line); const el = document.getElementById('setlog'); if (el){ el.textContent = this.log.join('\n'); el.scrollTop = el.scrollHeight; } },
  /* ---- auto set ---- */
  playSet(){
    this.init(); this.stop(); this.log = []; this.seconds = 0; const prog = this.program.filter(s => PRESET(s.genre) && s.bars > 0); if (!prog.length) return;
    const self = this; const A = this.decks.A, B = this.decks.B;
    this.auto = {
      idx: 0, active: A, idle: B, segStart: 0, prepared: false, transStart: 0,
      begin(){ A.load(prog[0].genre); self.setBpm(PRESET(prog[0].genre).bpm); self.setXF(-1); A.setEQ('low', 0); B.setEQ('low', 0); A.setLevel(1); B.setLevel(1); A.playing = true; A.bar = 0; B.playing = false; self.addLog(`${self.timeStr()}  ▶ ${prog[0].genre} · ${PRESET(prog[0].genre).bpm} BPM · key ${PRESET(prog[0].genre).key[0]}`); MixerUI.refresh(); },
      onStep(g){
        const seg = prog[this.idx], next = prog[this.idx + 1]; const elapsed = (g - this.segStart) / 16; const trans = Math.min(seg.trans, seg.bars);
        if (next && !this.prepared && elapsed >= seg.bars - trans){
          this.prepared = true; this.transStart = g; this.idle.load(next.genre); this.idle.setEQ('low', -40); this.idle.setLevel(1); this.idle.setFilter(0); this.idle.playing = true; this.idle.bar = 0;
          self.addLog(`${self.timeStr()}  ↗ mixing in ${next.genre} over ${trans} bars (bass swap)`); MixerUI.refresh();
        }
        if (this.prepared && next){
          const p = Math.min(1, (g - this.transStart) / Math.max(1, trans * 16)); const from = this.active === A ? -1 : 1;
          self.setXF(from * (1 - 2 * p)); self.setBpm(PRESET(seg.genre).bpm + (PRESET(next.genre).bpm - PRESET(seg.genre).bpm) * p);
          this.active.setEQ('low', p < 0.5 ? -40 * (p * 2) : -40); this.idle.setEQ('low', p < 0.5 ? -40 : -40 * (1 - (p - 0.5) * 2));
          MixerUI.syncEQ();
        }
        if (elapsed >= seg.bars){
          if (!next){ self.addLog(`${self.timeStr()}  ■ end of set`); self.stop(); return; }
          this.active.playing = false; this.active.setEQ('low', 0); this.active.setFilter(0);
          const tmp = this.active; this.active = this.idle; this.idle = tmp; this.idx++; this.segStart = g; this.prepared = false;
          self.setXF(this.active === A ? -1 : 1); self.setBpm(PRESET(next.genre).bpm);
          self.addLog(`${self.timeStr()}  ▶ ${next.genre} · ${PRESET(next.genre).bpm} BPM · key ${PRESET(next.genre).key[0]}`); MixerUI.refresh(); MixerUI.syncEQ();
        }
      }
    };
    this.auto.begin(); this.start();
  },
  totalBars(){ return this.program.reduce((a, s) => a + (s.bars || 0), 0); }
};
window.MixerStop = () => { if (Mixer.playing) Mixer.stop(); };

/* ---------- Era demo for history pages ---------- */
function playGenre(name, bars, btn){
  AudioCore.get(); if (window.GridStop) GridStop(); const dk = Mixer.ensureDemo(); if (Mixer.playing) Mixer.stop(); if (window.Seq) Seq.stop();
  dk.load(name); const G = PRESET(name); const d = 60 / G.bpm / 4; const t0 = dk.ch.c.currentTime + 0.06;
  for (let b = 0; b < bars; b++) for (let i = 0; i < 16; i++) dk.scheduleStep(i, t0 + (b * 16 + i) * d, G.bpm);
  dk.setDelayForBpm(G.bpm); flash(btn, bars * 16 * d);
}

/* ---------- UI ---------- */
const MixerUI = {
  built: false,
  build(){
    if (this.built) return; this.built = true; Mixer.init();
    const root = document.getElementById('mixerRoot');
    root.innerHTML = `
      <div class="mixer">
        <div class="deck A" id="deckA"></div>
        <div class="centre">
          <div class="bigbpm" id="mxBpm">128.0<small>master bpm · decks synced</small></div>
          <input type="range" id="mxBpmRange" min="110" max="180" step="0.1" value="128">
          <div class="xfader"><div class="lab">Crossfader</div><input type="range" id="xfader" min="-1" max="1" step="0.01" value="-1"><div class="ab"><span>A</span><span>B</span></div></div>
          <div><div class="lab">Master</div><input type="range" id="mxMaster" min="0" max="1" step="0.01" value="${ST.master}"></div>
          <canvas id="mixSpectrum" class="diag" style="height:120px"></canvas>
          <button class="play stopbtn" id="mxStopAll" style="justify-content:center">Stop all</button>
        </div>
        <div class="deck B" id="deckB"></div>
      </div>
      <div class="card program">
        <h3 style="margin-top:0">Set programme</h3>
        <p style="color:var(--muted);font-size:14px;margin-bottom:8px">Each row is a segment: the genre, how many bars it runs, and over how many bars it mixes into the next one (crossfade + bass swap + tempo ramp). Press <b>Play set</b> and the decks take over; you can still grab any fader or EQ while it runs.</p>
        <div class="row"><button class="play" id="playSet">Play set</button><button class="play stopbtn" id="stopSet">Stop</button><button class="sm" id="addSeg">+ add segment</button><select id="journeySel" style="font:12px 'JetBrains Mono',monospace;background:var(--bg3);color:var(--text);border:1px solid var(--line);border-radius:7px;padding:7px 10px">${Object.keys(JOURNEYS).map(j => `<option>${j}</option>`).join('')}</select><button class="sm" id="resetSet">Load journey</button><span style="font:11px 'JetBrains Mono',monospace;color:var(--muted)" id="setInfo"></span></div>
        <svg id="setTimeline" class="diag" style="margin:10px 0"></svg>
        <div class="prog-table" id="progTable"></div>
        <h3>Set list</h3>
        <div class="row"><button class="sm" id="copyLog">Copy set list</button><span style="font:11px 'JetBrains Mono',monospace;color:var(--muted)" id="copyMsg"></span></div>
        <div class="setlist" id="setlog" style="min-height:80px;max-height:220px;overflow:auto">(press Play set — every mix is logged here with its time, tempo and key)</div>
      </div>`;
    ['A', 'B'].forEach(id => this.buildDeck(id));
    document.getElementById('mxBpmRange').oninput = e => Mixer.setBpm(+e.target.value);
    document.getElementById('xfader').oninput = e => Mixer.setXF(+e.target.value);
    document.getElementById('mxMaster').oninput = e => { ST.master = +e.target.value; applyLevels(); };
    document.getElementById('mxStopAll').onclick = () => stopAll();
    document.getElementById('playSet').onclick = () => Mixer.playSet();
    document.getElementById('stopSet').onclick = () => Mixer.stop();
    document.getElementById('addSeg').onclick = () => { Mixer.program.push({ genre: GENRE_NAMES[0], bars: 16, trans: 4 }); this.renderProgram(); };
    document.getElementById('resetSet').onclick = () => { const j = JOURNEYS[document.getElementById('journeySel').value] || DEFAULT_SET; Mixer.program = j.map(([g, bars, trans]) => ({ genre: g, bars, trans })); this.renderProgram(); };
    document.getElementById('copyLog').onclick = () => { const txt = Mixer.log.join('\n') || ''; const msg = document.getElementById('copyMsg'); try { navigator.clipboard.writeText(txt).then(() => msg.textContent = 'copied', () => msg.textContent = 'select the text and copy manually'); } catch (e){ msg.textContent = 'select the text and copy manually'; } setTimeout(() => msg.textContent = '', 2500); };
    this.renderProgram(); this.refresh(); this.animate();
  },
  buildDeck(id){
    const dk = Mixer.decks[id], el = document.getElementById('deck' + id);
    el.innerHTML = `
      <div class="dh"><div class="badge">${id}</div><select class="gsel" title="put a record on">${GENRE_NAMES.map(n => `<option ${n === dk.genre ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="tt">
        <svg class="ttsvg" viewBox="0 0 320 262">
          <rect x="2" y="2" width="316" height="258" rx="12" fill="#17171f" stroke="#2a2a35"/>
          <g class="strobe">${Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2; return `<rect x="${(122 + Math.cos(a) * 106).toFixed(1)}" y="${(128 + Math.sin(a) * 106).toFixed(1)}" width="2.2" height="2.2" fill="#3a3a48" transform="rotate(${(i / 72 * 360).toFixed(1)} ${(122 + Math.cos(a) * 106).toFixed(1)} ${(128 + Math.sin(a) * 106).toFixed(1)})"/>`; }).join('')}</g>
          <g class="platter">
            <circle cx="122" cy="128" r="100" fill="#0b0b0f" stroke="#2a2a35"/>
            ${[96, 90, 84, 78, 72, 66, 60, 54, 48].map(r => `<circle cx="122" cy="128" r="${r}" fill="none" stroke="#1a1a22" stroke-width="${r % 12 === 0 ? 1.2 : .6}"/>`).join('')}
            <circle class="lblc" cx="122" cy="128" r="40" fill="var(--dk)"/>
            <text class="lbl1" x="122" y="121" text-anchor="middle" font-size="9.5" font-weight="700" fill="#000" font-family="Space Grotesk, sans-serif"></text>
            <text class="lbl2" x="122" y="133" text-anchor="middle" font-size="9" fill="#000" font-family="JetBrains Mono, monospace"></text>
            <text class="lbl3" x="122" y="146" text-anchor="middle" font-size="7.5" fill="#000" font-family="JetBrains Mono, monospace" letter-spacing=".08em"></text>
            <circle cx="122" cy="128" r="3.5" fill="#d6d6de"/>
            <rect x="121" y="30" width="2" height="10" fill="#fff" opacity=".8"/>
          </g>
          <g class="arm">
            <circle cx="268" cy="48" r="16" fill="#23232d" stroke="#3a3a48"/><circle cx="268" cy="48" r="5" fill="#8f8fa0"/>
            <line x1="268" y1="48" x2="180" y2="118" stroke="#c9c9d4" stroke-width="4" stroke-linecap="round"/>
            <line x1="180" y1="118" x2="168" y2="128" stroke="#c9c9d4" stroke-width="7" stroke-linecap="round"/>
            <rect x="268" y="40" width="40" height="16" rx="3" fill="#2d2d38"/>
          </g>
          <rect class="armrest" x="296" y="130" width="10" height="22" rx="3" fill="#2d2d38"/>
          <text x="236" y="248" font-size="7" fill="#55556a" font-family="JetBrains Mono, monospace" letter-spacing=".16em">33 · PITCH ±8</text>
        </svg>
        <div class="ttside"><input type="range" class="pitch" min="-8" max="8" step="0.1" value="0" title="pitch"><output class="pitchout">+0.0%</output></div>
        <button class="startstop dplay">START · STOP</button>
      </div>
      <div class="readout"><span>key <b class="rk"></b></span><span>native <b class="rb"></b> bpm</span><span>at <b class="rnow"></b></span><span>bar <b class="rbar">—</b></span><span class="rst"></span></div>
      <div class="eqrow"><span>High</span><input type="range" class="eq" data-band="high" min="-30" max="6" step="0.5" value="0"><output>0 dB</output><button class="kill" data-band="high">K</button></div>
      <div class="eqrow"><span>Mid</span><input type="range" class="eq" data-band="mid" min="-30" max="6" step="0.5" value="0"><output>0 dB</output><button class="kill" data-band="mid">K</button></div>
      <div class="eqrow"><span>Low</span><input type="range" class="eq" data-band="low" min="-30" max="6" step="0.5" value="0"><output>0 dB</output><button class="kill" data-band="low">K</button></div>
      <div class="ctl" style="margin-top:8px"><span>Filter</span><input type="range" class="flt" min="-1" max="1" step="0.01" value="0"><output>off</output></div>
      <div class="ctl fader"><span>Fader</span><input type="range" class="fdr" min="0" max="1" step="0.01" value="1"><output>100%</output></div>
      <div class="vu"><i></i></div>
      <div class="lab" style="font:600 10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:10px">Layers (click to mute)</div>
      <div class="layers"></div>
      <p class="notes" style="font-size:12.5px;color:var(--muted);margin:6px 0"></p>
      <button class="sm togglegrid">Show / edit pattern</button>
      <div class="deckgrid" style="display:none"></div>`;
    el.querySelector('.gsel').onchange = e => { dk.load(e.target.value); if (!Mixer.playing) Mixer.setBpm(dk.P.bpm); this.refreshDeck(id); };
    el.querySelector('.dplay').onclick = () => dk.playing ? Mixer.deckStop(id) : Mixer.deckPlay(id);
    const pitch = el.querySelector('.pitch'); pitch.oninput = () => { const v = +pitch.value; Mixer.setBpm(+(dk.P.bpm * (1 + v / 100)).toFixed(1)); }; pitch.ondblclick = () => { pitch.value = 0; pitch.oninput(); };
    el.querySelectorAll('.eq').forEach(r => r.oninput = () => { dk.setEQ(r.dataset.band, +r.value); r.nextElementSibling.textContent = (+r.value > 0 ? '+' : '') + r.value + ' dB'; });
    el.querySelectorAll('.kill').forEach(b => b.onclick = () => { dk.setKill(b.dataset.band, !dk.kills[b.dataset.band]); b.classList.toggle('on', dk.kills[b.dataset.band]); });
    const flt = el.querySelector('.flt'); flt.oninput = () => { dk.setFilter(+flt.value); flt.nextElementSibling.textContent = +flt.value === 0 ? 'off' : (+flt.value < 0 ? 'LP ' : 'HP ') + Math.round(Math.abs(flt.value) * 100) + '%'; };
    flt.ondblclick = () => { flt.value = 0; flt.oninput(); };
    const fdr = el.querySelector('.fdr'); fdr.oninput = () => { dk.setLevel(+fdr.value); fdr.nextElementSibling.textContent = Math.round(fdr.value * 100) + '%'; };
    el.querySelector('.togglegrid').onclick = () => { const g = el.querySelector('.deckgrid'); g.style.display = g.style.display === 'none' ? 'grid' : 'none'; };
    this.refreshDeck(id);
  },
  refreshDeck(id){
    const dk = Mixer.decks[id], el = document.getElementById('deck' + id); if (!el) return;
    el.querySelector('.gsel').value = dk.genre; el.querySelector('.rk').textContent = dk.P.key; el.querySelector('.rb').textContent = dk.P.bpm;
    el.querySelector('.rbar').textContent = dk.playing ? (dk.bar + 1) : '—'; el.querySelector('.rst').textContent = dk.playing ? '● playing' : '';
    const pb = el.querySelector('.dplay'); pb.classList.toggle('flash', dk.playing);
    const tt = el.querySelector('.tt'); tt.classList.toggle('playing', dk.playing); const parts = dk.genre.match(/^(.*?)(\s\d{4})?$/); tt.querySelector('.lbl1').textContent = (parts[1] || dk.genre).toUpperCase().slice(0, 18); tt.querySelector('.lbl2').textContent = (parts[2] || '').trim() + (parts[2] ? ' · ' : '') + dk.P.key[0]; tt.querySelector('.lbl3').textContent = dk.P.bpm + ' BPM · ' + (PRESET(dk.genre).city || '').toUpperCase().slice(0, 16);
    MixerUI.updatePitch(id);
    el.querySelector('.notes').textContent = PRESET(dk.genre).notes;
    const lay = el.querySelector('.layers'); lay.innerHTML = '';
    DECK_LAYERS.forEach(([lid, name]) => { const b = document.createElement('button'); b.textContent = name; const has = lid === 'rumble' ? dk.pat.kick.some(v => v) && PRESET(dk.genre).rumble > 0 : dk.pat[lid].some(v => v); b.classList.toggle('has', has); b.classList.toggle('off', dk.mute[lid]); b.onclick = () => { dk.mute[lid] = !dk.mute[lid]; b.classList.toggle('off', dk.mute[lid]); }; lay.appendChild(b); });
    const grid = el.querySelector('.deckgrid'); grid.innerHTML = '';
    DECK_LAYERS.forEach(([lid, name]) => {
      if (lid === 'rumble') return; const l = document.createElement('div'); l.className = 'lbl'; l.textContent = name; grid.appendChild(l);
      for (let i = 0; i < 16; i++){ const c = document.createElement('div'); c.className = 'st' + (i && i % 4 === 0 ? ' b' : ''); c.dataset.step = i; const v = dk.pat[lid][i]; c.classList.toggle('on', v === 1); c.classList.toggle('acc', v === 2); c.classList.toggle('sl', v === 3);
        c.onclick = () => { const cur = dk.pat[lid][i]; const nv = lid === 'acid' ? (cur + 1) % 4 : (cur ? 0 : 1); dk.pat[lid][i] = nv; c.classList.toggle('on', nv === 1); c.classList.toggle('acc', nv === 2); c.classList.toggle('sl', nv === 3); }; grid.appendChild(c); }
    });
  },
  updatePitch(id){ const dk = Mixer.decks && Mixer.decks[id], el = document.getElementById('deck' + id); if (!dk || !el) return; const ratio = Mixer.bpm / dk.P.bpm; const pct = (ratio - 1) * 100; const pitch = el.querySelector('.pitch'); if (pitch && Math.abs(+pitch.value - pct) > 0.05) pitch.value = Math.max(-8, Math.min(8, pct)); el.querySelector('.pitchout').textContent = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'; el.querySelector('.rnow').textContent = Mixer.bpm.toFixed(1); el.querySelector('.platter').style.animationDuration = (1.8 / Math.max(.3, ratio)).toFixed(3) + 's'; },
  syncEQ(){ ['A', 'B'].forEach(id => { const dk = Mixer.decks[id], el = document.getElementById('deck' + id); if (!el) return; el.querySelectorAll('.eq').forEach(r => { r.value = dk.eq[r.dataset.band]; r.nextElementSibling.textContent = (dk.eq[r.dataset.band] > 0 ? '+' : '') + Math.round(dk.eq[r.dataset.band]) + ' dB'; }); const f = el.querySelector('.fdr'); f.value = dk.level; f.nextElementSibling.textContent = Math.round(dk.level * 100) + '%'; }); },
  refresh(){ if (!this.built) return; ['A', 'B'].forEach(id => this.refreshDeck(id)); this.syncEQ(); this.renderTimeline(); },
  renderProgram(){
    const t = document.getElementById('progTable'); t.innerHTML = '<div class="h">#</div><div class="h">Genre</div><div class="h">Bars</div><div class="h">BPM</div><div class="h">Mix over</div><div></div>';
    Mixer.program.forEach((seg, n) => {
      const row = [];
      const num = document.createElement('div'); num.textContent = n + 1; num.style.color = 'var(--muted)';
      const sel = document.createElement('select'); const og1 = document.createElement('optgroup'); og1.label = 'Eras'; GENRE_NAMES.forEach(g => { const o = document.createElement('option'); o.textContent = g; o.selected = g === seg.genre; og1.appendChild(o); }); sel.appendChild(og1); const og2 = document.createElement('optgroup'); og2.label = 'Records'; Object.keys(RECORD_PRESETS).forEach(g => { const o = document.createElement('option'); o.textContent = g; o.selected = g === seg.genre; og2.appendChild(o); }); sel.appendChild(og2); sel.onchange = () => { seg.genre = sel.value; bpm.value = GENRES[seg.genre].bpm; this.renderTimeline(); };
      const bars = document.createElement('input'); bars.type = 'number'; bars.min = 4; bars.max = 128; bars.step = 4; bars.value = seg.bars; bars.oninput = () => { seg.bars = Math.max(1, +bars.value || 0); this.renderTimeline(); };
      const bpm = document.createElement('input'); bpm.type = 'number'; bpm.value = PRESET(seg.genre).bpm; bpm.disabled = true; bpm.title = 'tempo comes from the genre preset';
      const trans = document.createElement('input'); trans.type = 'number'; trans.min = 0; trans.max = 32; trans.value = seg.trans; trans.oninput = () => { seg.trans = Math.max(0, +trans.value || 0); };
      const del = document.createElement('button'); del.textContent = '×'; del.onclick = () => { Mixer.program.splice(n, 1); this.renderProgram(); };
      [num, sel, bars, bpm, trans, del].forEach(e => t.appendChild(e));
    });
    this.renderTimeline();
  },
  renderTimeline(){
    const svg = document.getElementById('setTimeline'); if (!svg) return; const W = 900, H = 90; clearSvg(svg, W, H);
    const total = Mixer.totalBars() || 1; let x = 0; let secs = 0;
    Mixer.program.forEach((seg, n) => {
      const w = seg.bars / total * W; const G = PRESET(seg.genre); const hue = 200 + (G.bpm - 118) / 34 * 160;
      el('rect', { x, y: 18, width: Math.max(0, w - 2), height: 40, rx: 5, fill: `hsl(${hue} 70% 55% / .75)` }, svg);
      if (w > 60) text(svg, x + 6, 36, seg.genre, { fill: '#000', 'font-weight': 600 }); if (w > 60) text(svg, x + 6, 50, `${G.bpm} bpm · ${seg.bars} bars · ${G.key[0]}`, { fill: '#000' });
      const m = Math.floor(secs / 60), s = Math.round(secs % 60); text(svg, x + 2, 74, `${m}:${String(s).padStart(2, '0')}`); secs += seg.bars * 4 * 60 / G.bpm; x += w;
    });
    const m = Math.floor(secs / 60), s = Math.round(secs % 60); text(svg, W - 40, 74, `${m}:${String(s).padStart(2, '0')}`, { 'text-anchor': 'end' });
    el('line', { id: 'playhead', x1: 0, y1: 10, x2: 0, y2: 66, stroke: '#fff', 'stroke-width': 2, opacity: 0 }, svg);
    const info = document.getElementById('setInfo'); if (info) info.textContent = `${Mixer.program.length} segments · ${total} bars · ≈ ${m}:${String(s).padStart(2, '0')}`;
  },
  animate(){
    requestAnimationFrame(() => this.animate()); if (!Mixer.ch) return;
    const now = Mixer.ch.c.currentTime;
    if (Mixer.playing){
      let cur = null; while (Mixer.queue.length && Mixer.queue[0].time <= now) cur = Mixer.queue.shift();
      if (cur){
        document.querySelectorAll('#mixerRoot .deckgrid .st.cur').forEach(e => e.classList.remove('cur'));
        ['A', 'B'].forEach(id => { const dk = Mixer.decks[id]; const el = document.getElementById('deck' + id); if (!el) return; if (dk.playing){ el.querySelectorAll(`.deckgrid .st[data-step="${cur.step}"]`).forEach(e => e.classList.add('cur')); el.querySelector('.rbar').textContent = dk.bar + 1; } });
        const ph = document.getElementById('playhead'); if (ph && Mixer.auto){ const total = Mixer.totalBars() || 1; ph.setAttribute('opacity', 1); const x = Math.min(900, cur.g / 16 / total * 900); ph.setAttribute('x1', x); ph.setAttribute('x2', x); }
      }
    }
    const cv = document.getElementById('mixSpectrum'); if (cv && cv.clientWidth){
      const an = Mixer.ch.analyser, data = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(data);
      const dpr = window.devicePixelRatio || 1; if (cv.width !== cv.clientWidth * dpr){ cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); const W = cv.clientWidth, H = cv.clientHeight; g.clearRect(0, 0, W, H); const nyq = Mixer.ch.c.sampleRate / 2;
      for (let x = 0; x < W; x += 2){ const f = 20 * Math.pow(1000, x / W), bin = Math.min(data.length - 1, Math.floor(f / nyq * data.length)); const v = data[bin] / 255; g.fillStyle = f < 150 ? css('--rumble') : f < 400 ? css('--bass') : f < 4000 ? css('--synth') : css('--drums'); g.globalAlpha = .85; g.fillRect(x, H - v * H, 2, v * H); }
      g.globalAlpha = 1;
    }
    ['A', 'B'].forEach(id => { const dk = Mixer.decks && Mixer.decks[id]; const el = document.getElementById('deck' + id); if (!dk || !el) return; const vu = el.querySelector('.vu i'); const a = Math.cos((Mixer.xf + 1) / 2 * Math.PI / 2), b = Math.sin((Mixer.xf + 1) / 2 * Math.PI / 2); vu.style.width = (dk.playing ? dk.level * (id === 'A' ? a : b) * 100 : 0) + '%'; });
  }
};
window.PageHooks = window.PageHooks || {};
window.PageHooks.mixer = () => { MixerUI.build(); };
