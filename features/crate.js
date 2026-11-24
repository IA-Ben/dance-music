/* ===================================================================
   THE CRATE — flip through the book's records like sleeves in a shop
   rack, filter by decade, strand, genre and label, pull records into a
   set (kept in this browser) and play the set through the dock.
   Data: NODES of type 'record' and their relations only. Sleeves are
   plain and generated: typeset words, no artwork.
   =================================================================== */
(() => {
  const NAME = 'crate', KEY = 'fyod-feat-crate', DEPTH = 5;
  const ld = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const sv = o => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(ld(), o))); } catch (e) {} };
  const rm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const G = n => { try { return typeof NODE !== 'undefined' ? NODE[n] : null; } catch (e) { return null; } };
  const strandTitle = s => { try { return (typeof STRANDS !== 'undefined' && STRANDS[s] && STRANDS[s].title) || s; } catch (e) { return s; } };
  const pageTitle = id => { try { if (typeof CHAPTER_TITLES !== 'undefined' && CHAPTER_TITLES[id]) return CHAPTER_TITLES[id]; } catch (e) {} const n = G(id); return n ? n.title : id; };
  /* a style tempo, only where the record's genre points to one of the Mixer's presets */
  const presetBpm = name => { try { if (typeof PRESET === 'function'){ const p = PRESET(name); return p && p.bpm ? p.bpm : 0; } if (typeof GENRES !== 'undefined' && GENRES[name]) return GENRES[name].bpm || 0; } catch (e) {} return 0; };

  let RECS = null;
  function records(){
    if (RECS) return RECS; if (typeof NODES === 'undefined') return (RECS = []);
    RECS = NODES.filter(n => n.type === 'record').map(n => {
      const [artist, title] = n.title.includes(' — ') ? n.title.split(' — ') : ['', n.title];
      const rel = k => n.rel.filter(r => r[0] === k && G(r[1])).map(r => r[1]);
      const genres = rel('genre'), labels = rel('label'), told = n.rel.filter(r => r[0] === 'told').map(r => r[1]);
      const pg = genres.find(g => G(g).preset); const bpm = pg ? presetBpm(G(pg).preset) : 0;
      return { id: n.id, artist: artist.trim(), title: title.trim(), years: String(n.years || ''), year: +((String(n.years).match(/\d{4}/) || [])[0] || 0), strands: n.strands || [], genres, labels, told, by: rel('by'), q: n.q, full: n.title, bpm, preset: bpm ? G(pg).preset : '', bpmGenre: bpm ? pg : '' };
    }).sort((a, b) => a.year - b.year || a.full.localeCompare(b.full));
    return RECS;
  }
  const byId = id => records().find(r => r.id === id);
  /* plain sleeve stocks: kraft, white, black, grey and a few dyed card colours, chosen by the id */
  const STOCK = [['#b8946a', '#231a10'], ['#ece7dc', '#1b1b1f'], ['#1d1d21', '#ecebe6'], ['#8f9196', '#141417'], ['#41526b', '#eef0f4'], ['#6d3b36', '#f3e9e4'], ['#c9c19f', '#1d1b12'], ['#2f4a3f', '#e9f1ec']];
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  function build(sec, recs){
    const count = (key) => { const m = {}; recs.forEach(r => (key === 'strand' ? r.strands : key === 'genre' ? r.genres : r.labels).forEach(x => m[x] = (m[x] || 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(b[0])); };
    const decs = [...new Set(recs.map(r => Math.floor(r.year / 10) * 10).filter(Boolean))].sort();
    const opt = (list, name) => list.map(([k, c]) => `<option value="${esc(k)}">${esc(name(k))} (${c})</option>`).join('');
    const hasCrate = !!(window.Crate && Crate.get);
    sec.innerHTML = `<h4 class="cr-h">The crate</h4>
      <p class="cr-desc">All ${recs.length} records the book holds, filed in date order as plain sleeves in a shop rack. Flip through them, narrow the rack by decade, strand, genre or label, and pull the ones you want into a set. The set keeps its running order, with years, and a style tempo wherever the record's genre has one of the Mixer's presets; it is saved in this browser and plays through the book's player.</p>
      <div class="cr-f" role="group" aria-label="Filter the rack">
        <label><span>Decade</span><select data-f="dec"><option value="">All</option>${decs.map(d => `<option value="${d}">${d}s</option>`).join('')}</select></label>
        <label><span>Strand</span><select data-f="strand"><option value="">All</option>${opt(count('strand'), strandTitle)}</select></label>
        <label><span>Genre</span><select data-f="genre"><option value="">All</option>${opt(count('genre'), k => G(k).title)}</select></label>
        <label><span>Label</span><select data-f="label"><option value="">All</option>${opt(count('label'), k => G(k).title)}</select></label>
        ${hasCrate ? '<label class="cr-star"><input type="checkbox" data-f="star"> <span>only records starred in your crate</span></label>' : ''}
        <button type="button" class="sm cr-clear">Clear filters</button>
      </div>
      <p class="cap cr-count" aria-live="polite"></p>
      <div class="cr-rackw">
        <button type="button" class="cr-nav cr-prev" aria-label="Flip back one record">‹</button>
        <div class="cr-rack" tabindex="0" role="group" aria-roledescription="record rack" aria-label="Record rack. Left and right arrow keys flip through the sleeves; Enter pulls the front record into your set."><div class="cr-bin"></div></div>
        <button type="button" class="cr-nav cr-next" aria-label="Flip forward one record">›</button>
      </div>
      <label class="cr-pos"><span class="cap">Position in the rack</span><input type="range" class="cr-jump" min="0" max="0" value="0" aria-label="Jump through the rack"></label>
      <div class="cr-front" aria-live="polite"></div>
      <div class="cr-set">
        <h5>Your set <span class="cap cr-tot"></span></h5>
        <ol class="cr-list"></ol>
        <div class="cr-sa"><button type="button" class="play cr-play">Play the set</button>${hasCrate ? '<button type="button" class="sm cr-star-all">Star them in your crate</button>' : ''}<button type="button" class="sm cr-empty">Empty the set</button></div>
        <p class="cap cr-msg" role="status" aria-live="polite"></p><p class="cap cr-dock" hidden>The book's player is switched off in this edition, so each record in the set links to its page instead.</p>
      </div>
      <p class="cap cr-cap">A simplified illustration made for the book: the sleeves are generated and plain, with typeset words only; they are not the records' real covers. Style tempos come from the Mixer's genre presets, not from the records themselves.</p>`.replace(/\n\s+/g, '\n');
  }

  function Inst(sec){
    const q = s => sec.querySelector(s), qa = s => [...sec.querySelectorAll(s)];
    const all = records(); build(sec, all);
    const st = ld();
    const me = { f: Object.assign({ dec: '', strand: '', genre: '', label: '', star: false }, st.f || {}), set: (st.set || []).filter(id => byId(id)), list: all, i: 0, els: new Map(), lastWheel: 0 };
    const L = []; const on = (el, ev, fn, o) => { if (!el) return; el.addEventListener(ev, fn, o); L.push([el, ev, fn, o]); };
    const dockOk = () => !!(window.Dock && Dock.ok && Dock.ok());
    const item = r => ({ q: r.q, title: r.full });
    const playable = r => { try { return dockOk() && Dock.playable(item(r)); } catch (e) { return false; } };

    function filter(keepId){
      const f = me.f, star = f.star && window.Crate ? new Set(Crate.get()) : null;
      me.list = all.filter(r => (!f.dec || Math.floor(r.year / 10) * 10 === +f.dec) && (!f.strand || r.strands.includes(f.strand)) && (!f.genre || r.genres.includes(f.genre)) && (!f.label || r.labels.includes(f.label)) && (!star || star.has(r.id)));
      const k = keepId ? me.list.findIndex(r => r.id === keepId) : -1; me.i = k >= 0 ? k : 0;
      qa('.cr-f select').forEach(s => { s.value = f[s.dataset.f] || ''; }); const sc = q('.cr-f input[data-f=star]'); if (sc) sc.checked = !!f.star;
      const any = f.dec || f.strand || f.genre || f.label || f.star;
      q('.cr-count').textContent = me.list.length ? `${me.list.length} record${me.list.length === 1 ? '' : 's'} in the rack${any ? ' (filtered)' : ''}, ${me.list[0].year || '?'}–${me.list[me.list.length - 1].year || '?'}.` : 'No record in the book matches all of these filters.';
      const j = q('.cr-jump'); j.max = Math.max(0, me.list.length - 1); j.disabled = me.list.length < 2;
      sv({ f }); me.els.forEach(el => el.remove()); me.els.clear(); render(0);
    }
    function sleeve(r){
      const [bg, fg] = STOCK[hash(r.id) % STOCK.length]; const el = document.createElement('div'); el.className = 'cr-slv'; el.style.setProperty('--sb', bg); el.style.setProperty('--sf', fg); el.dataset.id = r.id; el.setAttribute('aria-hidden', 'true');
      const lab = r.labels.map(l => G(l).title)[0] || '';
      el.innerHTML = `<div class="cr-tab">${esc(r.artist || r.title)}</div><div class="cr-in"><span class="cr-lab">${esc(lab)}</span><b class="cr-ar">${esc(r.artist || '')}</b><span class="cr-ti">${esc(r.title)}</span><span class="cr-yr">${esc(r.years)}</span></div>`;
      return el;
    }
    function render(dir){
      const bin = q('.cr-bin'), want = me.list.slice(me.i, me.i + DEPTH), ids = new Set(want.map(r => r.id)), anim = !rm() && dir;
      me.els.forEach((el, id) => { if (ids.has(id)) return; me.els.delete(id);
        if (anim && dir > 0 && el.classList.contains('d0')){ el.className = 'cr-slv out'; el.style.zIndex = 20; setTimeout(() => el.remove(), 320); } else el.remove(); });
      want.forEach((r, k) => { let el = me.els.get(r.id); const fresh = !el; if (fresh){ el = sleeve(r); me.els.set(r.id, el); bin.appendChild(el); if (anim && dir < 0 && k === 0){ el.className = 'cr-slv out'; void el.offsetWidth; } }
        el.className = 'cr-slv d' + k; el.style.zIndex = 10 - k; });
      front();
    }
    function front(){
      const r = me.list[me.i], box = q('.cr-front'); q('.cr-jump').value = me.i;
      q('.cr-prev').disabled = me.i <= 0; q('.cr-next').disabled = me.i >= me.list.length - 1;
      if (!r){ box.innerHTML = ''; return; }
      const inSet = me.set.includes(r.id);
      const g = r.genres.map(x => `<a href="#${x}" data-src="${x}">${esc(G(x).title)}</a>`).join(', '), l = r.labels.map(x => `<a href="#${x}" data-src="${x}">${esc(G(x).title)}</a>`).join(', ');
      const told = r.told.filter(t => document.querySelector(`.page[data-page="${t}"]`) || G(t)).slice(0, 3).map(t => `<a href="#${t}" data-src="${t}">${esc(pageTitle(t))}</a>`).join(' · ');
      box.innerHTML = `<p class="cr-now"><span class="cap">${me.i + 1} of ${me.list.length}</span> <b>${esc(r.full)}</b>, ${esc(r.years)}</p>
        <p class="cap">${l ? `Label: ${l}. ` : ''}${g ? `Genre: ${g}. ` : ''}${r.strands.length ? `Strand: ${r.strands.map(s => esc(strandTitle(s))).join(', ')}. ` : ''}${r.bpm ? `Style tempo ${r.bpm} BPM (the Mixer's ${esc(r.preset)} preset). ` : ''}</p>
        <div class="cr-fa"><button type="button" class="cr-btn cr-pull" aria-pressed="${inSet}">${inSet ? 'In your set ✓' : 'Pull into the set'}</button><a class="sm cr-open" href="#${r.id}" data-src="${r.id}">Read its page</a>${playable(r) ? '<button type="button" class="sm cr-listen">Listen</button>' : ''}</div>
        ${told ? `<p class="cap">From the book: ${told}</p>` : `<p class="cap">From the book: <a href="#${r.id}" data-src="${r.id}">its record page</a></p>`}`.replace(/\n\s+/g, '');
      q('.cr-rack').setAttribute('aria-label', `Record rack, ${me.i + 1} of ${me.list.length}: ${r.full}, ${r.years}. Left and right arrow keys flip; Enter pulls it into your set.`);
      box.querySelector('.cr-pull').onclick = () => toggle(r.id);
      const lb = box.querySelector('.cr-listen'); if (lb) lb.onclick = () => { if (window.SoundBus) try { SoundBus.claim('embed'); } catch (e) {} Dock.play([item(r)], 0); };
    }
    function go(d){ const j = Math.max(0, Math.min(me.list.length - 1, me.i + d)); if (j === me.i) return; me.i = j; render(d); }
    function toggle(id){ const k = me.set.indexOf(id); if (k >= 0) me.set.splice(k, 1); else me.set.push(id); saveSet(); front(); renderSet(); say(k >= 0 ? 'Taken out of the set.' : `Pulled into the set at number ${me.set.length}.`); }
    function saveSet(){ sv({ set: me.set }); }
    function say(t){ q('.cr-msg').textContent = t; }
    function renderSet(){
      const rs = me.set.map(byId).filter(Boolean), ol = q('.cr-list');
      const yrs = rs.map(r => r.year).filter(Boolean), bp = rs.filter(r => r.bpm);
      q('.cr-tot').textContent = rs.length ? `${rs.length} record${rs.length === 1 ? '' : 's'}${yrs.length ? ` · spanning ${Math.min(...yrs)}${Math.max(...yrs) > Math.min(...yrs) ? '–' + Math.max(...yrs) : ''}` : ''}${bp.length ? ` · style tempos for ${bp.length}, ${Math.min(...bp.map(r => r.bpm))}–${Math.max(...bp.map(r => r.bpm))} BPM` : ''}` : '';
      ol.innerHTML = rs.length ? rs.map((r, k) => `<li data-id="${r.id}"><span class="cr-yr2">${esc(r.years)}</span><span class="cr-t"><a href="#${r.id}" data-src="${r.id}">${esc(r.full)}</a><small>${r.bpm ? `${r.bpm} BPM style · ` : ''}${r.labels.map(x => esc(G(x).title)).join(', ')}${k > 0 && r.bpm && rs[k - 1].bpm ? ` · ${r.bpm - rs[k - 1].bpm >= 0 ? '+' : '−'}${Math.abs(r.bpm - rs[k - 1].bpm)} BPM from the last` : ''}</small></span><span class="cr-ra"><button type="button" class="cr-ib cr-up" aria-label="Move ${esc(r.full)} up" ${k === 0 ? 'disabled' : ''}>↑</button><button type="button" class="cr-ib cr-dn" aria-label="Move ${esc(r.full)} down" ${k === rs.length - 1 ? 'disabled' : ''}>↓</button><button type="button" class="cr-ib cr-rm" aria-label="Take ${esc(r.full)} out of the set">✕</button></span></li>`).join('') : '<li class="cr-none">Empty. Pull records in from the rack above.</li>';
      ol.querySelectorAll('li[data-id]').forEach(li => { const id = li.dataset.id;
        const mv = d => { const k = me.set.indexOf(id), j = k + d; if (j < 0 || j >= me.set.length) return; [me.set[k], me.set[j]] = [me.set[j], me.set[k]]; saveSet(); renderSet(); const b = q(`.cr-list li[data-id="${id}"] .${d < 0 ? 'cr-up' : 'cr-dn'}`); (b && !b.disabled ? b : q(`.cr-list li[data-id="${id}"] .cr-rm`)).focus(); say(`Moved to number ${j + 1}.`); };
        li.querySelector('.cr-up').onclick = () => mv(-1); li.querySelector('.cr-dn').onclick = () => mv(1);
        li.querySelector('.cr-rm').onclick = () => { toggle(id); const f = q('.cr-list button:not([disabled])') || q('.cr-rack'); f.focus(); }; });
      const pb = q('.cr-play'); pb.disabled = !rs.length; const ok = dockOk(); pb.hidden = !ok;
      q('.cr-dock').hidden = ok || !rs.length;
      const sa = q('.cr-star-all'); if (sa) sa.disabled = !rs.length; q('.cr-empty').disabled = !rs.length;
    }

    /* ---------- controls ---------- */
    qa('.cr-f select').forEach(s => on(s, 'change', () => { me.f[s.dataset.f] = s.value; filter(me.list[me.i] && me.list[me.i].id); }));
    on(q('.cr-f input[data-f=star]'), 'change', e => { me.f.star = e.target.checked; filter(); });
    on(q('.cr-clear'), 'click', () => { me.f = { dec: '', strand: '', genre: '', label: '', star: false }; filter(me.list[me.i] && me.list[me.i].id); });
    on(q('.cr-prev'), 'click', () => go(-1)); on(q('.cr-next'), 'click', () => go(1));
    on(q('.cr-jump'), 'input', e => { const j = +e.target.value; const d = j - me.i; me.i = j; render(Math.abs(d) === 1 ? d : 0); });
    const rack = q('.cr-rack');
    on(rack, 'keydown', e => { const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown'){ e.preventDefault(); go(1); } else if (k === 'ArrowLeft' || k === 'ArrowUp'){ e.preventDefault(); go(-1); }
      else if (k === 'PageDown'){ e.preventDefault(); go(10); } else if (k === 'PageUp'){ e.preventDefault(); go(-10); } else if (k === 'Home'){ e.preventDefault(); go(-me.i); } else if (k === 'End'){ e.preventDefault(); go(me.list.length); }
      else if ((k === 'Enter' || k === ' ') && me.list[me.i]){ e.preventDefault(); toggle(me.list[me.i].id); } });
    let px = null, py = null;
    on(rack, 'pointerdown', e => { px = e.clientX; py = e.clientY; });
    on(rack, 'pointerup', e => { if (px == null) return; const dx = e.clientX - px, dy = e.clientY - py; px = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; go(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : -1) : (dy > 0 ? 1 : -1)); });
    on(rack, 'pointercancel', () => { px = null; });
    on(rack, 'wheel', e => { if (Math.abs(e.deltaY) < 4 && Math.abs(e.deltaX) < 4) return; e.preventDefault(); const t = performance.now(); if (t - me.lastWheel < 180) return; me.lastWheel = t; go((Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) > 0 ? 1 : -1); }, { passive: false });
    on(q('.cr-play'), 'click', () => { const rs = me.set.map(byId).filter(Boolean); if (!rs.length) return; if (window.SoundBus) try { SoundBus.claim('embed'); } catch (e) {} if (!(dockOk() && Dock.play(rs.map(item), 0))) say('None of these has a player in the book yet.'); else { const n = Dock.queue.length; say(`Playing the set in the player at the foot of the screen: ${n} of ${rs.length}${n < rs.length ? `; ${rs.length - n} ${rs.length - n === 1 ? 'has' : 'have'} no player in the book and ${rs.length - n === 1 ? 'is' : 'are'} skipped` : ''}.`); } });
    on(q('.cr-empty'), 'click', () => { me.set = []; saveSet(); renderSet(); front(); say('The set is empty.'); });
    on(q('.cr-star-all'), 'click', () => { if (!window.Crate) return; Crate.add(me.set.slice()); say(`Starred ${me.set.length} in your crate.`); try { if (Crate.render) Crate.render(); } catch (e) {} });
    me.destroy = () => { L.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o)); me.els.clear(); };
    filter(); renderSet();
    return me;
  }

  const INST = new WeakMap();
  (window.FEATURES = window.FEATURES || []).push({
    name: NAME, pages: ['crate'], anchor: null,
    mount(pageEl, id){
      this.unmount(pageEl);
      const sec = document.createElement('section'); sec.className = 'feature feat-' + NAME; sec.setAttribute('aria-label', 'The crate: a rack of the book\'s records');
      pageEl.appendChild(sec); INST.set(pageEl, Inst(sec)); return sec;
    },
    unmount(pageEl){ const me = INST.get(pageEl); if (me){ me.destroy(); INST.delete(pageEl); } pageEl.querySelectorAll('section.feat-' + NAME).forEach(s => s.remove()); }
  });
})();
