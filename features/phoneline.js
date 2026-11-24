/* ===================================================================
   FOLLOW THE PHONE LINE — a short text-and-map game on the M25 for the
   orbital-rave chapters. Ring the line, get the next instruction, choose
   which way round the ring to go, and learn at each step what the book
   says about the phone systems, the meeting points, the police and the
   1990 Act. Three nights of rising difficulty, each ending with the
   passage of the book it illustrates.
   The line's messages are generic wording written for this game; every
   fact, date, figure and place in "From the book" panels comes from the
   book's pages (cited by page id). Real places appear only as "what
   happened", never as somewhere to go. No phone numbers; nobody depicted.
   =================================================================== */
(() => {
  const NAME = 'phoneline', KEY = 'feat-phoneline';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const src = p => `<a class="pl-src" href="#${esc(p)}" data-src="${esc(p)}">from the book</a>`;

  /* places, from the book's M25 register (PLACE_DATA.m25); fallback copies of the same coordinates */
  const PL = { ww: ['A Midsummer Night\'s Dream', [51.50083, -0.77444], 'White Waltham airfield, 24 June 1989'], meo: ['Biology Panorama, Meopham', [51.364, 0.36], 'near Meopham, 9 September 1989'], roy: ['Sunrise New Year\'s Eve, Roydon', [51.77, 0.02], 'near Roydon, 31 December 1989'], hes: ['Heston services', [51.4857, -0.3804], 'Heston services, 31 December 1989'], slo: ['Future Power People', [51.5, -0.57], 'Slough, 31 December 1989'], sev: ['Sevenoaks party raid', [51.27, 0.17], 'Sevenoaks, September 1988'] };
  const BOX = [-1.1, 51.1, 0.8, 52.3], GW = 1000, COS = 0.6197790317951402;

  /* the three nights. f: [fact, page]; ln: what the line says (generic, written for the game) */
  const NIGHTS = [
    { t: 'Night one: a summer Saturday, 1989', lede: 'Easy. One line, one convoy.', start: 180, steps: [
      { k: 'ring', ln: 'Thanks for calling. Tonight\'s meeting point is a pub car park just off the motorway, north-west of London. Be there by ten. Ring this number again at midnight.',
        f: [['The ticket bought a phone number rather than an address. Sunrise\'s adverts sent buyers to an answerphone on BT\'s Voicebank service, whose message was updated with directions as the night went on.', 'orb3'], ['Tickets were sold in advance, usually bundled with membership of a private club, which the promoters argued made each party a private event outside licensing law.', 'orb3']] },
      { k: 'go', to: 315, what: 'the meeting point, north-west of the ring', ok: 'You are there before ten, with a few dozen cars.', late: 'The long way round: you arrive late, but the cars are still waiting for the next message.',
        f: [['The crowd gathered at agreed meeting points, very often service stations off the M25, and drove on in convoy.', 'orb0']] },
      { k: 'ring', ln: 'Midnight update. Move to the car park on the A-road just north of here and wait. The site will be phoned through.',
        f: [['In the Sun\'s account of the White Waltham party, its reporters met at 10pm at a pub two minutes from the M25; at midnight twenty cars and two vans moved to a car park on the A41.', 'orb3']] },
      { k: 'choose', q: 'Nobody in the car park knows where the party is. What now?', opts: [
        ['Wait for the runner', 1, 'Half an hour later a runner phones the destination through to the meeting point.'],
        ['Drive off and guess', 0, 'There is nothing to guess from: the site stays secret until the runner phones it through. You come back and wait.']],
        f: [['Mobile phones and BT\'s message service helped coordinate the meeting points, where runners phoned the destination through. The aim was to get as many people as possible on site before the police arrived.', 'orb3']] },
      { k: 'go', to: 270, what: 'the junction for the motorway west', ok: 'The convoy heads west.', late: 'The long way round the ring: the convoy has gone ahead without you, but the tail-lights are easy to follow.',
        happened: 'ww', f: [['By 2am there was a three-mile tailback and the crowd was squeezing through a hangar entrance ten feet wide, until two police officers, fearing a crush, had the doors opened. The paper counted 11,000 people and more than 1,000 vehicles.', 'orb3'], ['The Borosix archive says up to 8,000.', 'orb2']] }],
      end: ['orb3', 'The convoy', 'Half an hour later a runner phoned through the destination and the convoy headed for the M4. By 2am there was a three-mile tailback and the crowd was squeezing through a hangar entrance ten feet wide, until two police officers, fearing a crush, had the doors opened. … Service stations, landmarks and car parks were the usual meeting points.'] },
    { t: 'Night two: autumn 1989, the squeeze', lede: 'Harder. The police are listening too.', start: 180, steps: [
      { k: 'ring', ln: 'Tonight\'s meeting point is the services on the south-east side of the ring, out in Kent. Ring again at eleven.',
        f: [['After a party in a derelict house in Sevenoaks in September 1988 took about sixty officers two hours to clear, Chief Superintendent Ken Tappenden set up a unit to watch for the next: officially the Pay Party Unit, to its quarry the Acid House Squad.', 'orb3']] },
      { k: 'go', to: 135, what: 'the services, south-east of the ring', ok: 'You reach the services. So, it seems, has a police car.', late: 'The long way round takes you past three counties\' worth of junctions. By the time you arrive the car park is half empty.',
        f: [['It ran HOLMES, the Home Office\'s major-inquiry database, on about 1,700 vehicles and nearly 4,000 names.', 'orb3']] },
      { k: 'choose', q: 'Police have blocked the slip road ahead. What now?', opts: [
        ['Ring the line for an update', 1, 'The line has a new message.'],
        ['Wait at the roadblock', 0, 'You wait an hour and are turned back. You ring the line from the next services.']],
        f: [['The unit sought injunctions against landowners and threw roadblocks across junctions.', 'l2'], ['At one roadblock on the M25 drivers abandoned their cars and threw their keys into a hedge.', 'orb3']] },
      { k: 'choose', q: 'A pirate station on the car radio says tonight\'s party has moved far to the north-east. The line says something else. Which do you trust?', opts: [
        ['Ring the line again', 1, 'The line: tonight\'s warehouse has been raided; callers are sent on to another party out in the Kent countryside.'],
        ['Follow the radio', 0, 'You drive a long way for nothing. The message on the air was not the promoters\'.']],
        f: [['Ken Tappenden later described officers imitating the Sunrise station on air to announce that a party planned for Sevenoaks had moved to Colchester, where the diverted crowd ransacked petrol stations.', 'orb3']] },
      { k: 'go', to: 120, what: 'the fields east of the services', ok: 'A field, heavy rain, very little shelter.', late: 'The long way round again. You arrive as the rain sets in.',
        happened: 'meo', f: [['On 9 September 1989 Genesis\'s warehouse party was raided at about six in the evening and its lighting crew arrested. Their hotline sent callers to Biology\'s party near Meopham, where about 4,000 danced through heavy rain.', 'orb2']] }],
      end: ['orb3', 'The Pay Party Unit', 'After a party in a derelict house in Sevenoaks in September 1988 took about sixty officers two hours to clear, Chief Superintendent Ken Tappenden, commander of north-west Kent, set up a unit to watch for the next. … At one roadblock on the M25 drivers abandoned their cars and threw their keys into a hedge.'] },
    { t: 'Night three: New Year\'s Eve 1989, and after', lede: 'Hardest. Everything that can change does.', start: 180, steps: [
      { k: 'ring', ln: 'Happy New Year. The site is printed on your ticket this time: a field in Essex, north-east of the ring. See you there.',
        f: [['For the first time Sunrise printed the location on its tickets, a field near Roydon in Essex.', 'orb4']] },
      { k: 'go', to: 30, what: 'the field north-east of the ring', ok: 'You reach the lane to the field. It is dark and empty.', late: 'The long way round: the lane to the field is dark and empty when you get there.',
        happened: 'roy', f: [['Essex Police persuaded the farmer to pull out.', 'orb4']] },
      { k: 'choose', q: 'The line now gives a fallback site, far to the north. Drive there, or ring again later?', opts: [
        ['Ring again later', 1, 'At about eleven the line has a new message.'],
        ['Drive north to the fallback', 0, 'Hours up the road, the fallback is off too. You ring the line again from a phone box.']],
        f: [['North Norfolk District Council won a High Court injunction against the fallback site near North Barningham.', 'orb4']] },
      { k: 'ring', ln: 'Eleven o\'clock update. Go to the services on the motorway west of London and wait for directions.',
        f: [['At about 11pm the convoy was sent to Heston services on the M4.', 'orb4']] },
      { k: 'go', to: 255, what: 'the services on the western motorway', ok: 'The services fill up with cars. After a deal, the convoy is led on to another promoter\'s party.', late: 'The long way round, on New Year\'s Eve. You arrive just as the convoy moves off.',
        happened: 'slo', f: [['From Heston, after a deal, the convoy went on to Future Power People, the party Genesis and Biology were running in the National Panasonic building in Slough. Sunrise lost thousands of pounds.', 'orb4']] },
      { k: 'ring', ln: '(Spring 1990. The line now plays a recording of an old party, charged by the minute.)',
        f: [['Sunrise, with new backers, advertised a Superseries \'90 for 4 May and played tapes of old parties down three premium-rate 0839 lines. It never took place.', 'orb4'], ['A premium-rate call cost 25p a minute at cheap rate and 38p otherwise in January 1990.', 'sy5']] },
      { k: 'law', q: 'What the 1990 Act changed',
        f: [['The Entertainments (Increased Penalties) Act raised the maximum penalty for running an entertainment without a licence, or breaking a licence\'s limit on numbers, from a £2,000 fine and three months in prison to £20,000 and six months.', 'orb4'], ['It created no new offence and gave the police no new powers. It received royal assent on 13 July 1990.', 'orb4'], ['The power to seize sound equipment came later, with the Criminal Justice and Public Order Act 1994.', 'orb5']] }],
      end: ['orb4', 'The Bright Bill and the end, 1990', 'The orbital raves were never banned. What ended them was a short private member’s bill that multiplied the fines, police forces that had learned to find a site before the convoy did, and a business that was moving indoors anyway.'] }
  ];

  /* ---------- the map ---------- */
  function geo(){
    const G = window.PLACES_GEO && PLACES_GEO.m25; let ring = null, extra = '';
    if (G && G.layers){ const m = G.layers.find(l => l.name === 'M25'); if (m) ring = m.d; G.layers.forEach(l => { if (l.k === 'river') extra += `<path class="pl-river" d="${l.d}"/>`; else if (l.k === 'road' && l.name !== 'M25') extra += `<path class="pl-road" d="${l.d}"/>`; }); }
    if (!ring){ ring = 'M510,890 C700,890 725,700 720,620 C715,520 600,505 510,505 C400,500 300,540 300,640 C300,760 360,890 510,890Z'; extra = ''; }
    return { ring, extra };
  }
  const proj = (lat, lon) => { const k = GW / ((BOX[2] - BOX[0]) * COS); return [(lon - BOX[0]) * COS * k, (BOX[3] - lat) * k]; };
  function place(id){ const p = PL[id]; let c = p[1]; try { const m = (window.PLACE_DATA && PLACE_DATA.m25.markers || []).find(x => x.name === p[0]); if (m && m.coords) c = m.coords; } catch (e) {} return proj(c[0], c[1]); }

  function build(sec){
    sec.innerHTML = `
      <h3>Follow the phone line</h3>
      <p class="pl-lede">Three nights on the orbital, 1989–90. Ring the line, follow the instruction, choose which way round the M25 to go, and find out at each step what the chapters say happened.</p>
      <p class="pl-notice">The line's messages are written for this game. The facts in the boxes, and the places marked on the map as what happened, are from the book. No phone numbers, no real addresses to drive to.</p>
      <div class="pl-tabs" role="group" aria-label="Choose a night"></div>
      <div class="pl-grid">
        <figure class="pl-map"><svg class="pl-svg" viewBox="100 420 800 520" role="img" aria-labelledby=""></svg><figcaption class="pl-cap"></figcaption></figure>
        <div class="pl-play"><div class="pl-log" aria-live="polite"></div><div class="pl-act"></div></div>
      </div>
      <p class="pl-made">A simplified illustration made for the book. The map outline is the book's M25 map (© OpenStreetMap contributors, Natural Earth). Nobody is depicted.</p>`;
  }

  function Inst(sec){
    const q = s => sec.querySelector(s), me = { L: [] };
    const on = (el, ev, fn) => { el.addEventListener(ev, fn); me.L.push([el, ev, fn]); };
    const svg = q('.pl-svg'), log = q('.pl-log'), act = q('.pl-act'), cap = q('.pl-cap'), tabs = q('.pl-tabs');
    const { ring, extra } = geo(), st = load(); st.done = st.done || [];
    svg.innerHTML = `${extra}<path class="pl-ring" d="${ring}"/><text class="pl-lab" x="735" y="610">M25</text><g class="pl-marks"></g><circle class="pl-me" r="11"/>`;
    const rp = svg.querySelector('.pl-ring'), dot = svg.querySelector('.pl-me'); let LEN = 1, C = [500, 700];
    try { LEN = rp.getTotalLength(); let sx = 0, sy = 0; for (let i = 0; i < 64; i++){ const p = rp.getPointAtLength(LEN * i / 64); sx += p.x; sy += p.y; } C = [sx / 64, sy / 64]; } catch (e) {}
    const at = t => { try { const p = rp.getPointAtLength(((t % 1) + 1) % 1 * LEN); return [p.x, p.y]; } catch (e) { return C; } };
    const bearing = t => { const [x, y] = at(t); return (Math.atan2(x - C[0], C[1] - y) * 180 / Math.PI + 360) % 360; };
    const tFor = deg => { let b = 0, bd = 999; for (let i = 0; i < 200; i++){ const d = Math.abs(((bearing(i / 200) - deg + 540) % 360) - 180); if (d < bd){ bd = d; b = i / 200; } } return b; };
    const dirOf = t => { const b = bearing(t); return ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(b / 45) % 8]; };
    // which way along the path is clockwise on screen?
    const cwSign = (() => { const a = bearing(0.1), b = bearing(0.12); return ((b - a + 540) % 360 - 180) > 0 ? 1 : -1; })();
    let N = 0, S = 0, T = 0, raf = 0, wrong = 0, busy = false;
    const put = t => { T = ((t % 1) + 1) % 1; const [x, y] = at(T); dot.setAttribute('cx', x); dot.setAttribute('cy', y); describe(); };
    function marks(ids){ svg.querySelector('.pl-marks').innerHTML = ids.map(id => { const [x, y] = place(id), r = x > 640; return `<g class="pl-mk"><rect x="${x - 7}" y="${y - 7}" width="14" height="14" transform="rotate(45 ${x} ${y})"/><text x="${x + (r ? -14 : 14)}" y="${y + 5}" text-anchor="${r ? 'end' : 'start'}">${esc(PL[id][2])}</text></g>`; }).join(''); describe(); }
    let shown = [];
    function describe(){ cap.textContent = `Map of London and the M25. Your position: the ${dirOf(T)} side of the ring.` + (shown.length ? ' Marked as what happened: ' + shown.map(id => PL[id][2]).join('; ') + '.' : ''); }
    function tabsDraw(){ tabs.innerHTML = NIGHTS.map((n, i) => `<button type="button" class="pl-tab" aria-pressed="${i === N}" data-n="${i}">${i + 1}${st.done.includes(i) ? ' ✓' : ''}<small>${esc(n.t.split(':')[0].replace('Night ', ''))}</small></button>`).join(''); tabs.querySelectorAll('.pl-tab').forEach((b, i) => b.setAttribute('aria-label', NIGHTS[i].t + (st.done.includes(i) ? ', finished' : ''))); }
    const facts = f => `<div class="pl-fact"><p class="pl-k">From the book</p>${f.map(([t, p]) => `<p data-src="${esc(p)}">${esc(t)} ${src(p)}</p>`).join('')}</div>`;
    const add = (html, cls) => { const d = document.createElement('div'); d.className = 'pl-msg ' + (cls || ''); d.innerHTML = html; log.appendChild(d); try { d.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) {} };
    const btn = (label, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls || ''; b.textContent = label; b.onclick = fn; act.appendChild(b); return b; };
    function startNight(n){
      cancelAnimationFrame(raf); busy = false; N = n; S = 0; wrong = 0; shown = []; marks([]); log.innerHTML = ''; tabsDraw();
      const nt = NIGHTS[n]; put(tFor(nt.start));
      add(`<h4>${esc(nt.t)}</h4><p>${esc(nt.lede)} You start on the south side of the ring with a ticket bought in advance.</p>`, 'pl-head'); step();
    }
    function step(){
      act.innerHTML = ''; const nt = NIGHTS[N], s = nt.steps[S];
      if (!s) return finish();
      if (s.k === 'ring'){ btn('Ring the line', () => { add(`<p class="pl-k">The line (written for this game)</p><p class="pl-line">${esc(s.ln)}</p>`, 'pl-ln'); add(facts(s.f), 'pl-f'); act.innerHTML = ''; btn('Next', next, 'pl-next').focus(); }, 'pl-ring-b').focus(); }
      else if (s.k === 'go'){
        const target = tFor(s.to); const d = ((target - T) % 1 + 1) % 1; // fraction going along the path
        const alongIsCw = cwSign > 0; const cwFrac = alongIsCw ? d : 1 - d;
        add(`<p>Head for ${esc(s.what)}. Which way round the ring?</p>`, 'pl-q');
        const go = cw => { const frac = cw ? cwFrac : 1 - cwFrac, longWay = frac > 0.5 + 1e-6; if (longWay) wrong++; act.innerHTML = ''; if (innerWidth < 860) try { q('.pl-map').scrollIntoView({ block: 'start', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) {} travel(target, cw ? (alongIsCw ? 1 : -1) : (alongIsCw ? -1 : 1), frac, () => {
          add(`<p>${cw ? 'Clockwise' : 'Anticlockwise'}, about ${Math.round(frac * 10) * 10 || 5}% of the way round. ${esc(longWay ? s.late : s.ok)}</p>`, longWay ? 'pl-late' : 'pl-ok');
          if (s.happened){ shown.push(s.happened); marks(shown); add(`<p class="pl-k">What happened</p><p>${esc(PL[s.happened][2])} is marked on the map.</p>`, 'pl-hap'); }
          add(facts(s.f), 'pl-f'); btn('Next', next, 'pl-next').focus(); }); };
        btn('Clockwise ↻', () => go(true)).focus(); btn('Anticlockwise ↺', () => go(false));
      } else if (s.k === 'choose'){
        add(`<p>${esc(s.q)}</p>`, 'pl-q');
        s.opts.forEach(([l, good, out], i) => { const b = btn(l, () => { if (!good) wrong++; add(`<p><b>${esc(l)}.</b> ${esc(out)}</p>`, good ? 'pl-ok' : 'pl-late'); add(facts(s.f), 'pl-f'); act.innerHTML = ''; btn('Next', next, 'pl-next').focus(); }); if (i === 0) b.focus(); });
      } else if (s.k === 'law'){ add(`<h4>${esc(s.q)}</h4>`, 'pl-head'); add(facts(s.f), 'pl-f'); btn('Next', next, 'pl-next').focus(); }
    }
    function next(){ S++; step(); }
    function travel(target, dir, frac, done){
      busy = true; const t0 = T, dist = frac; const end = () => { busy = false; put(target); done(); };
      if (rm()) return end();
      const ms = 500 + 1400 * dist, s0 = performance.now();
      const f = now => { const k = Math.min(1, (now - s0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; put(t0 + dir * dist * e); if (k < 1) raf = requestAnimationFrame(f); else end(); };
      raf = requestAnimationFrame(f);
    }
    function finish(){
      const nt = NIGHTS[N], [p, h, txt] = nt.end; if (!st.done.includes(N)) st.done.push(N); save(st); tabsDraw();
      add(`<p class="pl-k">The night ends. ${wrong ? `Wrong turns or long ways round: ${wrong}.` : 'No wrong turns.'}</p><blockquote class="pl-pass" data-src="${esc(p)}"><p>${esc(txt)}</p><footer>From ${p === 'orb3' ? '“' + esc(h) + '”, in ' : ''}<a href="#${esc(p)}" data-src="${esc(p)}">${p === 'orb3' ? 'Phone lines, pirates and convoys' : esc(h)}</a></footer></blockquote>`, 'pl-end');
      act.innerHTML = ''; if (N < NIGHTS.length - 1) btn(`Next night: ${NIGHTS[N + 1].t.split(': ')[1]}`, () => startNight(N + 1), 'pl-next').focus(); btn('Play this night again', () => startNight(N));
    }
    on(tabs, 'click', e => { const b = e.target.closest('.pl-tab'); if (b) startNight(+b.dataset.n); });
    me.destroy = () => { cancelAnimationFrame(raf); me.L.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn)); };
    tabsDraw(); N = 0; put(tFor(180)); log.innerHTML = ''; add(`<p>Choose a night above, or start with the first.</p>`); btn('Start night one', () => startNight(0), 'pl-next');
    return me;
  }

  const INST = new WeakMap();
  (window.FEATURES = window.FEATURES || []).push({
    name: NAME, pages: ['orb3'], anchor: 'Saturday night, step by step',
    mount(pageEl, id){
      this.unmount(pageEl);
      const sec = document.createElement('section'); sec.className = 'feature feat-' + NAME; sec.setAttribute('aria-label', 'Follow the phone line: a game on the M25'); sec.dataset.src = 'orb3';
      build(sec); pageEl.appendChild(sec); INST.set(pageEl, Inst(sec)); return sec;
    },
    unmount(pageEl){ const me = INST.get(pageEl); if (me){ me.destroy(); INST.delete(pageEl); } pageEl.querySelectorAll('section.feat-' + NAME).forEach(s => s.remove()); }
  });
})();
