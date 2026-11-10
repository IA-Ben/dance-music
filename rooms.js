/* ===================================================================
   ROOMS — walk through sketch reconstructions of the rooms.
   Each room is built by hand from simple boxes. Every size says where
   it came from: a published dimension, or an estimate. Nothing here
   is a survey. The page lists what is sourced, what is estimated and
   what is not known, and the model leaves unknown things out.
   Look: drag. Walk: W A S D or the arrow keys, or hold the Walk
   button. Headsets: Enter VR, then pull the trigger to move between
   the standing points.
   The 3D library (three.js, MIT licence) is loaded only on this page.
   =================================================================== */
window.Rooms = (() => {
  const live = () => !/claudeusercontent|claude\.ai/.test(location.hostname) && location.protocol !== 'file:';
  /* box: [x, y, z, w, h, d, colour, opts]  — x across, y up, z from the street end towards the stage; metres; x,z are the box's low corner */
  const ROOMS = {
    'brixton-academy': {
      title: 'Brixton Academy', year: 'about 1993', node: 'brixton-academy', preset: 'UK rave 1991', size: [36.6, 18, 44.2], fog: 0x0b0d12, amb: 0x8a8fa0, ambI: 2.6, hemi: 1.6, fogD: 0.006, glowR: 16,
      sourced: ['Auditorium about 36.6 m by 44.2 m (Theatres Trust)', 'Stage 40 ft (12.2 m) deep (Cinema Treasures)', 'Stalls and one circle; seats out, a floor that slopes to the stage', 'Proscenium flanked by two towers with a bridge between; side walls dressed as an Italian garden', 'Gilt ornament on a turquoise ground on the circle wall (Theatres Trust photograph)'],
      estimated: ['Which of the two figures is the length', 'Ceiling height (18 m here)', 'The fall of the floor (2 m here)', 'The circle\'s height and depth', 'The width of the proscenium opening'],
      unknown: ['Where the bars, the cloakroom and the mixing desk stood at the raves', 'The lighting and sound rigs of 1989–95', 'Whether the star ceiling still lit'],
      sources: [['Theatres Trust database', 'https://database.theatrestrust.org.uk/resources/theatres/show/439'], ['Historic England list entry 1064934 (via British Listed Buildings)', 'https://britishlistedbuildings.co.uk/101064934-the-academy-ferndale-ward'], ['Cinema Treasures', 'https://cinematreasures.org/theaters/1244']],
      views: [['By the doors', 18.3, 3.7, 3, 0], ['Middle of the floor', 18.3, 2.6, 18, 0], ['At the front', 18.3, 1.9, 28, 0], ['In the circle', 18.3, 9.8, 5, 0], ['On the stage', 18.3, 3.3, 36, Math.PI]],
      build(B){
        const W = 36.6, L = 44.2, H = 18, cream = 0xd9cfb2, turq = 0x2fb5b0, dark = 0x15161c;
        B.ramp(0, 0, 0, W, 32, 2.0, 0x1b1b20);                         /* the raked floor: 2 m at the doors falling to 0 at the stage */
        B.box(0, 0, 32, W, 1.5, 12.2, 0x101014);                       /* stage */
        B.box(-0.3, 0, 0, 0.3, H, L, cream); B.box(W, 0, 0, 0.3, H, L, cream); B.box(0, 0, -0.3, W, H, 0.3, dark); B.box(0, 0, L, W, H, 0.3, 0x0a0a0d); B.box(0, H, 0, W, 0.3, L, 0x05060c);
        /* proscenium: two towers and a bridge */
        B.box(6, 1.5, 31.2, 4, 12, 1.2, cream); B.box(26.6, 1.5, 31.2, 4, 12, 1.2, cream); B.box(6, 11.5, 31.2, 24.6, 2.2, 1.2, cream); B.box(5.6, 13.5, 31, 4.8, 1.2, 1.6, 0xb5553c); B.box(26.2, 13.5, 31, 4.8, 1.2, 1.6, 0xb5553c);
        B.box(0, 1.5, 31.2, 6, H - 1.5, 1.2, dark); B.box(30.6, 1.5, 31.2, 6, H - 1.5, 1.2, dark);
        /* garden walls: an arcade of columns down each side */
        for (let i = 0; i < 8; i++){ const z = 9 + i * 2.8; B.box(0.1, 6, z, 0.5, 6, 0.5, 0xefe6cc); B.box(W - 0.6, 6, z, 0.5, 6, 0.5, 0xefe6cc); }
        B.box(0.05, 12, 8.6, 0.7, 0.6, 20.6, 0xefe6cc); B.box(W - 0.75, 12, 8.6, 0.7, 0.6, 20.6, 0xefe6cc); B.box(0.05, 5.4, 8.6, 0.7, 0.6, 20.6, turq); B.box(W - 0.75, 5.4, 8.6, 0.7, 0.6, 20.6, turq);
        /* the circle, stepped */
        for (let i = 0; i < 5; i++) B.box(0, 7 + i * 0.7, 9.5 - i * 2.0, W, 0.7, 2.0, 0x23242b); B.box(0, 7, 11.2, W, 1.1, 0.25, turq);
        for (let i = 0; i < 4; i++){ B.glow(1.4, 9.5, 11 + i * 5.6, 0xffc98a); B.glow(W - 1.4, 9.5, 11 + i * 5.6, 0xffc98a); } B.stars(W, H - 0.2, L, 160);
        B.rig(W / 2, 12, 30, 20);
      }
    },
    warehouse: {
      title: 'The Warehouse, Chicago', year: '1977–82', node: 'warehouse', preset: 'Chicago house 1986', size: [7.32, 4.2, 30.48], fog: 0x07060a, amb: 0x3a3340,
      sourced: ['The building is 24 ft wide and 100 ft deep (7.3 m by 30.5 m), on three storeys (Chicago landmark report, 2023)', 'The dance floor was on the main floor, with a lounge above and a basement below', 'The DJ booth was built on the old loading dock at the back', 'Dark, with glowing lights, and fog off the exhaust fans', 'Sound by Richard Long'],
      estimated: ['Ceiling height (4.2 m here)', 'The size and height of the booth', 'Where the stairs came down'],
      unknown: ['Columns, bars and decoration', 'Where the loudspeakers stood', 'One account puts the booth in the middle of the floor'],
      sources: [['City of Chicago landmark designation report, 2023 (summary)', 'https://www.chicago.gov/city/en/depts/dcd/supp_info/the-warehouse.html'], ['The book\'s chapter', '#cb2']],
      views: [['Top of the stairs', 3.66, 1.7, 2.5, 0], ['Middle of the floor', 3.66, 1.7, 14, 0], ['Under the booth', 3.66, 1.7, 23, 0], ['In the booth', 3.66, 2.7, 28.5, Math.PI]],
      build(B){
        const W = 7.32, L = 30.48, H = 4.2, brick = 0x2a2226;
        B.box(0, -0.2, 0, W, 0.2, L, 0x1a1512); B.box(-0.3, 0, 0, 0.3, H, L, brick); B.box(W, 0, 0, 0.3, H, L, brick); B.box(0, 0, -0.3, W, H, 0.3, brick); B.box(0, 0, L, W, H, 0.3, brick); B.box(0, H, 0, W, 0.3, L, 0x0c0b0e);
        B.box(0, 0, 26.5, W, 1.0, 3.98, 0x161318);                       /* the loading dock */
        B.box(2.2, 1.0, 27.2, 2.9, 1.0, 0.7, 0x0a0a0c);                 /* the console */
        B.box(0.2, 0, 0.6, 1.2, 2.4, 3.2, 0x100e12);                    /* stair enclosure (position estimated) */
        for (let i = 0; i < 9; i++) B.glow(0.4 + (i % 2) * (W - 0.8), 2.8, 4 + i * 2.6, [0xff3344, 0x3355ff, 0xffaa22][i % 3]);
        B.rig(W / 2, 3.4, 22, 4);
      }
    },
    'the-fridge': {
      title: 'The Fridge, Brixton', year: 'about 1990', node: 'the-fridge', preset: 'Trance 1993', size: [28, 12, 23], fog: 0x030304, amb: 0x55555f, ambI: 2.2, hemi: 1.0, fogD: 0.012,
      sourced: ['The old Palladium cinema of 1913: stalls, one balcony, a wide proscenium and stage, boxes by the stage (Cinema Treasures)', 'Wider than it is deep', 'Painted black throughout as a club', 'Banks of television screens round the dance floor (1987 review)', 'About 1,700 people'],
      estimated: ['Every dimension: 28 m by 23 m by 12 m is worked out from the cinema\'s 876 stalls seats', 'The balcony\'s height and depth', 'How many screens, and where'],
      unknown: ['Where the DJ booth and the bars were', 'Columns', 'The chill-out lounge'],
      sources: [['Cinema Treasures: Palladium, Brixton', 'https://cinematreasures.org/theaters/31364'], ['urban75: the Fridge', 'https://www.urban75.org/brixton/features/fridge.html'], ['The book\'s chapter', '#cb4']],
      views: [['By the doors', 14, 1.7, 2, 0], ['Middle of the floor', 14, 1.7, 9, 0], ['In the balcony', 14, 6.6, 3, 0], ['On the stage', 14, 2.9, 19.5, Math.PI]],
      build(B){
        const W = 28, L = 23, H = 12, blk = 0x0b0b0d;
        B.box(0, -0.2, 0, W, 0.2, L, 0x101012); B.box(-0.3, 0, 0, 0.3, H, L, blk); B.box(W, 0, 0, 0.3, H, L, blk); B.box(0, 0, -0.3, W, H, 0.3, blk); B.box(0, 0, L, W, H, 0.3, blk); B.box(0, H, 0, W, 0.3, L, 0x050506);
        B.box(4, 0, 17.5, 20, 1.2, 5.5, 0x09090b);                      /* stage */
        B.box(0, 1.2, 17.2, 4, H - 1.2, 0.6, blk); B.box(24, 1.2, 17.2, 4, H - 1.2, 0.6, blk); B.box(4, 9, 17.2, 20, 3, 0.6, blk);
        B.box(0.1, 3.2, 13.5, 2.2, 0.3, 3.5, 0x141418); B.box(W - 2.3, 3.2, 13.5, 2.2, 0.3, 3.5, 0x141418);   /* boxes by the stage */
        for (let i = 0; i < 4; i++) B.box(0, 5 + i * 0.6, 6 - i * 1.6, W, 0.6, 1.6, 0x111114); B.box(0, 5, 7.5, W, 1, 0.2, 0x18181c);
        for (let i = 0; i < 6; i++){ B.screens(0.35, 1.6, 8.6 + i * 1.45, 1); B.screens(W - 0.35, 1.6, 8.6 + i * 1.45, -1); }
        B.rig(W / 2, 9, 15, 12);
      }
    }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let T = null, cur = null;
  async function three(){ if (T) return T; T = await import('./vendor/three.module.min.js'); return T; }
  function chip(n){ const id = Object.keys(ROOMS).find(k => ROOMS[k].node === n.id); return id ? `<a class="chip" href="#rooms?r=${id}" style="--c:var(--mix)"><i></i>Walk the room<small style="color:var(--muted)">· a sketch in 3D</small></a>` : ''; }

  async function open(id, host){
    const R = ROOMS[id]; if (!R || !host) return; close();
    const info = host.querySelector('.rm-info'); const list = (h, a) => a && a.length ? `<h4>${h}</h4><ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
    info.innerHTML = `<h3>${esc(R.title)} <small>${esc(R.year)}</small></h3><p class="cap">A sketch, not a survey. ${typeof NODE !== 'undefined' && NODE[R.node] ? `<a class="xl" href="#${R.node}">Read the page</a>.` : ''}</p>${list('From the record', R.sourced)}${list('Estimated', R.estimated)}${list('Not known, so left out', R.unknown)}<p class="cap">Sources: ${R.sources.map(s => `<a ${/^#/.test(s[1]) ? 'class="xl"' : 'target="_blank" rel="noopener"'} href="${s[1]}">${esc(s[0])}</a>`).join(' · ')}</p>`;
    const stage = host.querySelector('.rm-stage'); const views = host.querySelector('.rm-views'); views.innerHTML = R.views.map((v, i) => `<button class="sm" data-v="${i}">${esc(v[0])}</button>`).join('');
    if (!live()){ stage.innerHTML = '<p class="cap rm-msg">The walkable room runs on the web edition of the book. This copy lists what is known about it.</p>'; return; }
    stage.innerHTML = '<p class="cap rm-msg">Building the room…</p>';
    let THREE; try { THREE = await three(); } catch (e) { stage.innerHTML = '<p class="cap rm-msg">The 3D library could not be loaded.</p>'; return; }
    const w = stage.clientWidth || 800, h = Math.round(w * 9 / 16);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(w, h); renderer.xr.enabled = true; stage.innerHTML = ''; stage.appendChild(renderer.domElement); renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'Sketch reconstruction of ' + R.title); renderer.domElement.tabIndex = 0;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(R.fog); scene.fog = new THREE.FogExp2(R.fog, R.fogD || 0.022);
    const cam = new THREE.PerspectiveCamera(70, w / h, 0.1, 200); const rigGroup = new THREE.Group(); rigGroup.add(cam); scene.add(rigGroup);
    scene.add(new THREE.AmbientLight(R.amb, R.ambI || 1.1)); scene.add(new THREE.HemisphereLight(0x8890a8, 0x1a1410, R.hemi || 0.5)); const lights = [], glows = [], screens = [];
    const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, metalness: 0.02 });
    const B = {
      box(x, y, z, bw, bh, bd, c){ const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat(c)); m.position.set(x + bw / 2, y + bh / 2, z + bd / 2); scene.add(m); return m; },
      ramp(x, y, z, bw, bd, rise, c){ const g = new THREE.BufferGeometry(); const v = new Float32Array([x, y + rise, z, x + bw, y + rise, z, x + bw, y, z + bd, x, y, z + bd]); g.setAttribute('position', new THREE.BufferAttribute(v, 3)); g.setIndex([0, 3, 2, 0, 2, 1]); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat(c)); m.material.side = THREE.DoubleSide; scene.add(m); B._ramp = { z0: z, z1: z + bd, rise }; },
      stars(sw, y, sl, n){ const p = new Float32Array(n * 3); for (let i = 0; i < n; i++){ p[i * 3] = Math.random() * sw; p[i * 3 + 1] = y; p[i * 3 + 2] = Math.random() * sl; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff2c8, size: 0.14, fog: false }))); },
      glow(x, y, z, c){ const l = new THREE.PointLight(c, 6, R.glowR || 9, 2); l.position.set(x, y, z); scene.add(l); const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: c })); s.position.copy(l.position); scene.add(s); glows.push(l); },
      screens(x, y, z, dir){ for (let r = 0; r < 2; r++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.52), new THREE.MeshBasicMaterial({ color: 0x224466 })); m.position.set(x, y + r * 0.62, z); m.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(m); screens.push(m); } },
      rig(x, y, z, spread){ [0xff2244, 0x22aaff, 0xffcc22, 0x44ff88].forEach((c, i) => { const l = new THREE.SpotLight(c, 60, 60, 0.42, 0.6, 1.4); l.position.set(x + (i - 1.5) * spread / 4, y, z); l.target.position.set(x, 0, z - 8); scene.add(l); scene.add(l.target); lights.push(l); }); }
    };
    R.build(B);
    const st = { yaw: 0, pitch: 0, pos: new THREE.Vector3(), keys: {}, walk: false, drag: null, view: 0, raf: 0, renderer };
    const floorY = z => { const r = B._ramp; if (!r) return 0; if (z <= r.z0) return r.rise; if (z >= r.z1) return 0; return r.rise * (1 - (z - r.z0) / (r.z1 - r.z0)); };
    const eye = 1.7; let lift = 0;
    const go = i => { const v = R.views[i]; st.view = i; st.pos.set(v[1], 0, v[3]); lift = v[2] - eye - floorY(v[3]); if (lift < 0.3) lift = 0; st.yaw = v[4]; st.pitch = 0; views.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); };
    views.querySelectorAll('button').forEach(b => b.onclick = () => go(+b.dataset.v)); go(1);
    const el = renderer.domElement;
    el.addEventListener('pointerdown', e => { st.drag = [e.clientX, e.clientY]; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!st.drag) return; st.yaw += (e.clientX - st.drag[0]) * 0.005; st.pitch = Math.max(-1.2, Math.min(1.2, st.pitch + (e.clientY - st.drag[1]) * 0.004)); st.drag = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', () => { st.drag = null; }); el.addEventListener('pointercancel', () => { st.drag = null; });
    const kd = e => { if (/^(Arrow|Key[WASD])/.test(e.code) && document.activeElement === el){ st.keys[e.code] = e.type === 'keydown'; e.preventDefault(); e.stopPropagation(); } }; el.addEventListener('keydown', kd); el.addEventListener('keyup', kd);
    const wb = host.querySelector('.rm-walk'); if (wb){ const on = v => e => { st.walk = v; e.preventDefault(); }; wb.onpointerdown = on(true); wb.onpointerup = on(false); wb.onpointerleave = on(false); wb.onpointercancel = on(false); }
    /* headsets */
    const vb = host.querySelector('.rm-vr'); if (vb){ vb.hidden = true; if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then(ok => { if (!ok) return; vb.hidden = false; vb.onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }); renderer.xr.setSession(s); s.addEventListener('select', () => go((st.view + 1) % R.views.length)); } catch (e) {} }; }).catch(() => {}); }
    const [RW, , RL] = R.size; let last = performance.now();
    renderer.setAnimationLoop(now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const f = (st.keys.KeyW || st.keys.ArrowUp || st.walk ? 1 : 0) - (st.keys.KeyS || st.keys.ArrowDown ? 1 : 0), s = (st.keys.KeyD ? 1 : 0) - (st.keys.KeyA ? 1 : 0); if (st.keys.ArrowLeft) st.yaw -= dt * 1.6; if (st.keys.ArrowRight) st.yaw += dt * 1.6;
      if (f || s){ const sp = 3.2 * dt; st.pos.x += (Math.sin(st.yaw) * f + Math.cos(st.yaw) * s) * sp; st.pos.z += (Math.cos(st.yaw) * f - Math.sin(st.yaw) * s) * sp; st.pos.x = Math.max(0.5, Math.min(RW - 0.5, st.pos.x)); st.pos.z = Math.max(0.5, Math.min(RL - 0.5, st.pos.z)); }
      const y = floorY(st.pos.z) + lift; const inXR = renderer.xr.isPresenting; rigGroup.position.set(st.pos.x, y + (inXR ? 0 : eye), st.pos.z); rigGroup.rotation.set(0, Math.PI - st.yaw, 0); if (!inXR) cam.rotation.set(-st.pitch, 0, 0);
      /* the lights follow the book's sound, when it is playing */
      const A = window.Visuals && Visuals.audio ? Visuals.audio() : null; const beat = A ? A.beat : 0.3 + 0.3 * Math.sin(now / 400), bass = A ? A.bass : 0.2; const t = now / 1000; const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1;
      lights.forEach((l, i) => { l.intensity = 30 + 90 * (i % 2 ? beat : bass); l.target.position.x = RW / 2 + Math.sin(t * 0.6 * calm + i * 1.6) * RW * 0.35; l.target.position.z = RL * 0.45 + Math.cos(t * 0.45 * calm + i) * RL * 0.25; });
      glows.forEach((l, i) => { l.intensity = 3 + 5 * (0.5 + 0.5 * Math.sin(t * calm + i)) + beat * 3; });
      screens.forEach((m, i) => { m.material.color.setHSL((0.55 + 0.1 * Math.sin(t * 0.7 * calm + i * 0.9)) % 1, 0.7, 0.18 + 0.25 * (A ? A.mid : 0.3) + ((i + Math.floor(t * 2 * calm)) % 5 === 0 ? 0.2 : 0)); });
      renderer.render(scene, cam);
    });
    const ro = () => { const nw = stage.clientWidth; if (!nw) return; const nh = Math.round(nw * 9 / 16); renderer.setSize(nw, nh); cam.aspect = nw / nh; cam.updateProjectionMatrix(); }; window.addEventListener('resize', ro);
    cur = { id, renderer, ro, scene };
    const pb = host.querySelector('.rm-play'); if (pb) pb.onclick = () => { if (typeof playGenre === 'function') playGenre(R.preset, 8, pb); };
  }
  function close(){ if (!cur) return; try { cur.renderer.setAnimationLoop(null); const s = cur.renderer.xr.getSession && cur.renderer.xr.getSession(); if (s) s.end().catch(() => {}); cur.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); cur.renderer.dispose(); cur.renderer.domElement.remove(); window.removeEventListener('resize', cur.ro); } catch (e) {} cur = null; }
  window.PageHooks = window.PageHooks || {};
  window.PageHooks.rooms = () => { const host = document.querySelector('.page[data-page="rooms"] .rm-host'); if (!host) return; const pick = host.querySelector('.rm-pick'); if (!pick.dataset.done){ pick.dataset.done = 1; pick.innerHTML = Object.keys(ROOMS).map(k => `<button class="sm" data-r="${k}">${esc(ROOMS[k].title)}</button>`).join(''); pick.querySelectorAll('button').forEach(b => b.onclick = () => { history.replaceState(null, '', '#rooms?r=' + b.dataset.r); show(b.dataset.r); }); }
    const show = id => { pick.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.r === id)); open(id, host); };
    const q = (location.hash.split('?')[1] || '').match(/r=([\w-]+)/); show(q && ROOMS[q[1]] ? q[1] : 'brixton-academy'); };
  window.addEventListener('hashchange', () => { if (!/^#rooms/.test(location.hash)) close(); });
  return { ROOMS, chip, open, close, live };
})();
