/* ===================================================================
   MY NIGHTS — a personal passport. An "I was there" control on every
   club, event (nights and festivals) and city page, with optional years
   taken from that subject's own date range, saved in this browser's
   localStorage only. The passport (a #mynights page if the site has one,
   otherwise a panel opened from any control) shows the reader's own map,
   a timeline by year, counts by strand and neighbouring pages from the
   same year and city. Export and import as a small local JSON file.
   No account, no network, nothing shared.
   =================================================================== */
(() => {
  const KEY = 'dm-mynights', TYPES = ['club', 'event', 'city'], NOW = 2026;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const N = id => (typeof NODE !== 'undefined' && NODE[id]) || null;
  const ALL = () => (typeof NODES !== 'undefined' ? NODES : []);
  const TL = t => (typeof TYPE_LABEL !== 'undefined' && TYPE_LABEL[t]) || t;
  const ok = id => { const n = N(id); return !!n && TYPES.includes(n.type); };
  let uid = 0;

  /* ---------- years: the subject's own range, or for a city the range of its pages ---------- */
  function span(n) {
    const s = String((n && n.years) || ''); const m = s.match(/(\d{4})(?:\s*[–-]\s*(\d{2,4}))?/); if (!m) return null;
    const a = +m[1]; let b = a;
    if (m[2]) { b = +m[2]; if (b < 100) b = Math.floor(a / 100) * 100 + b; } else if (/(\d{4})\s*[–-]\s*$/.test(s.trim()) || /\d{4}\s*[–-]\s*(?:now|present)?\s*$/.test(s.trim())) b = NOW;
    return b >= a ? [a, Math.min(b, NOW)] : [a, a];
  }
  const cityCache = {};
  function range(id) {
    const n = N(id); if (!n) return null; const own = span(n); if (own) return own;
    if (n.type !== 'city') return null;
    if (cityCache[id] !== undefined) return cityCache[id];
    let a = Infinity, b = -Infinity; ALL().forEach(x => { if (x.city !== id) return; const r = span(x); if (r) { a = Math.min(a, r[0]); b = Math.max(b, r[1]); } });
    return (cityCache[id] = isFinite(a) ? [a, b] : null);
  }
  const yearsOf = id => { const r = range(id); if (!r) return []; const out = []; for (let y = r[0]; y <= r[1]; y++) out.push(y); return out; };

  /* ---------- storage: this browser only ---------- */
  const Store = {
    get() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && Array.isArray(d.nights) ? d.nights.filter(e => e && ok(e.id)) : []; } catch (e) { return []; } },
    set(list) { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, nights: list })); } catch (e) {} window.dispatchEvent(new CustomEvent('mynights:change')); },
    find(id) { return this.get().find(e => e.id === id) || null; },
    toggle(id) { const l = this.get(); const i = l.findIndex(e => e.id === id); if (i >= 0) l.splice(i, 1); else l.push({ id, years: [] }); this.set(l); return i < 0; },
    years(id, ys) { const l = this.get(); const e = l.find(x => x.id === id); if (!e) return; const valid = new Set(yearsOf(id)); e.years = [...new Set(ys)].filter(y => valid.has(y)).sort((a, b) => a - b); this.set(l); },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} window.dispatchEvent(new CustomEvent('mynights:change')); }
  };
  const marginOn = () => { try { return !!(window.Margin && typeof Margin.on === 'function' && Margin.on()); } catch (e) { return false; } };
  function openMargin(id) {
    let t = 0; const go = () => { const d = document.querySelector('.page.show details.mn-add') || document.querySelector(`.page[data-page="node"] details.mn-add`); if (d && (location.hash.slice(1) === id)) { d.open = true; d.scrollIntoView({ block: 'start', behavior: 'auto' }); const s = d.querySelector('summary'); if (s) s.focus(); } else if (++t < 20) setTimeout(go, 150); };
    setTimeout(go, 100);
  }

  /* ---------- the "I was there" control ---------- */
  function control(pageEl, id) {
    const n = N(id), u = 'myn' + (++uid), ys = yearsOf(id);
    const sec = document.createElement('section'); sec.className = 'feature feat-mynights myn-ctl'; sec.setAttribute('aria-label', 'I was there: ' + n.title);
    sec.innerHTML = `<div class="myn-row"><button type="button" class="myn-was" aria-pressed="false"><i aria-hidden="true"></i><span>I was there</span></button><button type="button" class="myn-open" aria-haspopup="dialog">My nights <span class="myn-n"></span></button></div>
      <div class="myn-yrs" hidden>${ys.length ? `<label for="${u}-y">Which years? <small>(optional, ${ys[0]}${ys.length > 1 ? '–' + ys[ys.length - 1] : ''})</small></label><div class="myn-yrow"><select id="${u}-y"><option value="">Add a year…</option>${ys.map(y => `<option value="${y}">${y}</option>`).join('')}</select></div><ul class="myn-chips" aria-label="Years you were there"></ul>` : '<p class="cap">The book gives no years for this page, so it is saved without one.</p>'}
        <p class="myn-mg" hidden><a href="#${esc(id)}" class="myn-margin">add a memory to the margin</a></p></div>
      <p class="cap myn-note">Saved only in this browser. Nothing is sent anywhere.</p>`;
    const was = sec.querySelector('.myn-was'), box = sec.querySelector('.myn-yrs'), sel = sec.querySelector('select'), chips = sec.querySelector('.myn-chips');
    const paint = () => {
      const e = Store.find(id), on = !!e; was.setAttribute('aria-pressed', on); was.classList.toggle('on', on); was.querySelector('span').textContent = on ? 'I was there' + (e.years.length ? ': ' + e.years.join(', ') : '') : 'I was there';
      box.hidden = !on; sec.querySelector('.myn-n').textContent = '(' + Store.get().length + ')';
      sec.querySelector('.myn-mg').hidden = !(on && marginOn());
      if (chips) chips.innerHTML = on ? e.years.map(y => `<li><button type="button" class="myn-chip" data-y="${y}" aria-label="Remove ${y}">${y} <span aria-hidden="true">×</span></button></li>`).join('') : '';
    };
    was.addEventListener('click', () => { Store.toggle(id); paint(); });
    if (sel) sel.addEventListener('change', () => { const y = +sel.value; if (!y) return; const e = Store.find(id); Store.years(id, (e ? e.years : []).concat(y)); sel.value = ''; paint(); sel.focus(); });
    if (chips) chips.addEventListener('click', ev => { const b = ev.target.closest('.myn-chip'); if (!b) return; const e = Store.find(id); Store.years(id, e.years.filter(y => y !== +b.dataset.y)); paint(); const f = chips.querySelector('.myn-chip') || sel; if (f) f.focus(); });
    sec.querySelector('.myn-open').addEventListener('click', e => Panel.open(e.currentTarget));
    sec.querySelector('.myn-margin').addEventListener('click', () => openMargin(id));
    const on = () => { if (sec.isConnected) paint(); else window.removeEventListener('mynights:change', on); };
    window.addEventListener('mynights:change', on); sec._off = () => window.removeEventListener('mynights:change', on);
    paint(); return sec;
  }

  /* ---------- the passport ---------- */
  const cityOf = id => { const n = N(id); return n.type === 'city' ? id : (n.city && N(n.city) ? n.city : ''); };
  const LL = id => (typeof CITY_LL !== 'undefined' && CITY_LL[id]) || null;
  function mapSvg(cities) {
    const g = window.PLACES_GEO && PLACES_GEO.world; const pts = cities.map(c => [c, LL(c)]).filter(x => x[1]);
    if (!g || !pts.length) return '';
    const [lon0, , lon1, lat1] = g.bbox, k = g.w / ((lon1 - lon0) * g.cos);
    const P = ([lat, lon]) => [(lon - lon0) * g.cos * k, (lat1 - lat) * k];
    const xy = pts.map(([c, ll]) => [c, P(ll)]);
    let x0 = Math.min(...xy.map(p => p[1][0])), x1 = Math.max(...xy.map(p => p[1][0])), y0 = Math.min(...xy.map(p => p[1][1])), y1 = Math.max(...xy.map(p => p[1][1]));
    const pad = Math.max(30, (x1 - x0) * 0.2, (y1 - y0) * 0.2); x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    let w = x1 - x0, h = y1 - y0; const ar = 1.6; if (w / h > ar) { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; }
    const s = w / g.w, land = g.layers.filter(l => l.k === 'land').map(l => `<path class="myn-land" d="${l.d}"/>`).join('');
    const dots = xy.map(([c, [x, y]]) => `<a href="#${esc(c)}" class="myn-dot" aria-label="${esc(N(c).title)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(9 * s + 1.5).toFixed(2)}"/><text x="${(x + 12 * s + 2).toFixed(1)}" y="${(y + 4 * s).toFixed(1)}" font-size="${(13 * s + 2).toFixed(2)}">${esc(N(c).title)}</text></a>`).join('');
    const missing = cities.filter(c => !LL(c));
    return `<figure class="myn-map"><svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" role="img" aria-label="Map of your cities: ${esc(pts.map(p => N(p[0]).title).join(', '))}" style="--s:${s.toFixed(3)}">${land}${dots}</svg><figcaption class="cap">Outline: Natural Earth, from the book's own maps. ${missing.length ? 'Not on the map (the book has no position for them): ' + esc(missing.map(c => N(c).title).join(', ')) + '.' : ''}</figcaption></figure>`;
  }
  function suggest(list) {
    const have = new Set(list.map(e => e.id)), seen = new Set(), groups = [];
    const rank = t => ({ club: 0, event: 1, set: 2, shop: 3, station: 4, collective: 5, person: 6 }[t] ?? 7);
    list.forEach(e => { const c = cityOf(e.id); if (!c) return; e.years.forEach(y => {
      const g = []; ALL().forEach(n => { if (have.has(n.id) || seen.has(n.id + y) || n.city !== c || n.type === 'city') return; const r = span(n); if (!r || y < r[0] || y > r[1]) return; seen.add(n.id + y); g.push([n, c, y]); });
      g.sort((a, b) => rank(a[0].type) - rank(b[0].type)); if (g.length) groups.push(g);
    }); });
    const out = [], ids = new Set();
    for (let i = 0; out.length < 8 && groups.some(g => g[i]); i++) groups.forEach(g => { const x = g[i]; if (x && out.length < 8 && !ids.has(x[0].id)) { ids.add(x[0].id); out.push(x); } });
    return out;
  }
  function passport(host, opts) {
    const list = Store.get(), u = opts.u || (opts.u = 'mynp' + (++uid));
    const byCity = {}; list.forEach(e => { const c = cityOf(e.id) || ''; (byCity[c] = byCity[c] || []).push(e); });
    const cities = Object.keys(byCity).filter(Boolean).sort((a, b) => N(a).title.localeCompare(N(b).title));
    const byYear = {}; list.forEach(e => (e.years.length ? e.years : ['none']).forEach(y => (byYear[y] = byYear[y] || []).push(e)));
    const yrs = Object.keys(byYear).filter(y => y !== 'none').map(Number).sort((a, b) => a - b);
    const strands = {}; list.forEach(e => (N(e.id).strands || []).forEach(s => { strands[s] = (strands[s] || 0) + 1; }));
    const sk = Object.keys(strands).sort((a, b) => strands[b] - strands[a]), max = Math.max(1, ...Object.values(strands));
    const ST = s => (typeof STRANDS !== 'undefined' && STRANDS[s]) || null;
    const count = t => list.filter(e => N(e.id).type === t).length, pl = (k, a, b) => k + ' ' + (k === 1 ? a : b);
    const itemLink = e => { const n = N(e.id); return `<a href="#${esc(n.id)}">${esc(n.title)}</a> <small>${esc(TL(n.type))}${e.years.length ? ' · ' + e.years.join(', ') : ''}</small>${marginOn() ? ` <a class="myn-margin" data-id="${esc(n.id)}" href="#${esc(n.id)}">add a memory to the margin</a>` : ''}`; };
    const sug = suggest(list);
    host.innerHTML = `${opts.heading ? `<h3 id="${u}-h">My nights</h3>` : ''}
      <p class="myn-priv"><b>Yours alone.</b> Kept only in this browser's local storage: no account, no network, nothing shared with anyone. Export makes a file on your own device.</p>
      ${list.length ? `<p class="myn-sum">${list.length} ${list.length === 1 ? 'page' : 'pages'} ticked: ${pl(count('club'), 'club', 'clubs')}, ${pl(count('event'), 'night or festival', 'nights and festivals')}, ${pl(count('city'), 'city', 'cities')}${yrs.length ? `, from ${yrs[0]} to ${yrs[yrs.length - 1]}` : ''}.</p>
      ${mapSvg(cities)}
      <h4>By city</h4><ul class="myn-list">${cities.map(c => `<li><a href="#${esc(c)}"><b>${esc(N(c).title)}</b></a><ul>${byCity[c].filter(e => e.id !== c).map(e => `<li>${itemLink(e)}</li>`).join('')}${byCity[c].some(e => e.id === c) ? `<li>${itemLink(byCity[c].find(e => e.id === c))}</li>` : ''}</ul></li>`).join('')}${byCity[''] ? `<li><b>No city in the book</b><ul>${byCity[''].map(e => `<li>${itemLink(e)}</li>`).join('')}</ul></li>` : ''}</ul>
      <h4>By year</h4>${yrs.length ? `<ol class="myn-tl">${yrs.map(y => `<li><span class="myn-y">${y}</span><span>${byYear[y].map(e => `<a href="#${esc(e.id)}">${esc(N(e.id).title)}</a>`).join(' · ')}</span></li>`).join('')}</ol>` : '<p class="cap">No years added yet: add them from each page\'s "I was there" control.</p>'}${byYear.none ? `<p class="cap">Without a year: ${byYear.none.map(e => `<a href="#${esc(e.id)}">${esc(N(e.id).title)}</a>`).join(' · ')}</p>` : ''}
      <h4>By strand</h4><ul class="myn-bars" aria-label="Pages ticked, by strand">${sk.map(s => `<li><span class="myn-bl">${esc(ST(s) ? ST(s).title : s)}</span><span class="myn-bar"><i style="width:${(strands[s] / max * 100).toFixed(0)}%;background:var(${ST(s) ? ST(s).color : '--mix'},#888)"></i></span><b>${strands[s]}</b></li>`).join('')}</ul>
      <h4>Nearby in the book</h4>${sug.length ? `<ul class="myn-sug">${sug.map(([n, c, y]) => `<li><a href="#${esc(n.id)}">${esc(n.title)}</a> <small>${esc(TL(n.type))} · also in ${esc(N(c).title)} in ${y}</small></li>`).join('')}</ul>` : '<p class="cap">Add years to your pages to see other pages from the same year and city.</p>'}`
      : `<p class="myn-empty">Nothing ticked yet. Look for "I was there" on any club, night, festival or city page.</p>`}
      <div class="myn-tools"><button type="button" class="myn-exp"${list.length ? '' : ' disabled'}>Export my nights</button><label class="myn-imp">Import a file<input type="file" accept="application/json,.json"></label><button type="button" class="myn-clr"${list.length ? '' : ' disabled'}>Clear everything</button></div>
      <p class="myn-msg cap" role="status" aria-live="polite"></p>
      <p class="cap">A simplified illustration made for the book. The pages, places, years and strands all come from the book's own data; only your ticks are yours.</p>`;
    const msg = host.querySelector('.myn-msg');
    host.querySelector('.myn-exp').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ app: 'fortyyearsof.dance: my nights', v: 1, nights: Store.get() }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-nights.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      msg.textContent = 'Saved my-nights.json to your device.';
    });
    host.querySelector('.myn-imp input').addEventListener('change', ev => {
      const f = ev.target.files && ev.target.files[0]; if (!f) return; if (f.size > 200000) { msg.textContent = 'That file is too big to be a my-nights file.'; return; }
      const r = new FileReader(); r.onload = () => {
        let d; try { d = JSON.parse(r.result); } catch (e) { msg.textContent = 'That file could not be read.'; return; }
        const inc = (Array.isArray(d) ? d : (d && d.nights)) || []; const l = Store.get(); let added = 0, skipped = 0;
        inc.forEach(x => { const id = x && typeof x.id === 'string' ? x.id : null; if (!id || !ok(id)) { skipped++; return; } const valid = new Set(yearsOf(id)); const ys = (Array.isArray(x.years) ? x.years : []).map(Number).filter(y => valid.has(y)); const e = l.find(z => z.id === id); if (e) e.years = [...new Set(e.years.concat(ys))].sort((a, b) => a - b); else { l.push({ id, years: [...new Set(ys)].sort((a, b) => a - b) }); added++; } });
        Store.set(l); const m = `Imported: ${added} new ${added === 1 ? 'page' : 'pages'}${skipped ? `, ${skipped} skipped (not a club, night or city page in this book)` : ''}.`; const f2 = host.querySelector('.myn-msg'); if (f2) f2.textContent = m;
      }; r.readAsText(f);
    });
    const clr = host.querySelector('.myn-clr'); let armed = false;
    clr.addEventListener('click', () => { if (!armed) { armed = true; clr.textContent = 'Press again to clear everything'; clr.classList.add('armed'); msg.textContent = 'This removes every tick and year from this browser.'; setTimeout(() => { if (clr.isConnected && armed) { armed = false; clr.textContent = 'Clear everything'; clr.classList.remove('armed'); } }, 5000); return; } Store.clear(); const m = host.querySelector('.myn-msg'); if (m) m.textContent = 'Cleared.'; });
    host.querySelectorAll('a.myn-margin').forEach(a => a.addEventListener('click', () => openMargin(a.dataset.id)));
  }
  function passportSection(opts) {
    const sec = document.createElement('section'); sec.className = 'feature feat-mynights myn-pass'; const box = document.createElement('div'); sec.appendChild(box);
    const draw = () => { if (!sec.isConnected && sec.dataset.drawn) { window.removeEventListener('mynights:change', draw); return; } sec.dataset.drawn = 1; const f = document.activeElement && sec.contains(document.activeElement) ? document.activeElement.className : ''; passport(box, opts); if (f) { const el = box.querySelector('.' + String(f).split(' ')[0]); if (el && !el.disabled) el.focus(); else { const t = box.querySelector('.myn-tools button:not([disabled]), .myn-imp input'); if (t) t.focus(); } } };
    window.addEventListener('mynights:change', draw); sec._off = () => window.removeEventListener('mynights:change', draw); draw(); return sec;
  }

  /* ---------- the panel (used wherever the site has no #mynights page) ---------- */
  const Panel = {
    el: null, back: null,
    open(from) {
      this.close(true); this.back = from || document.activeElement;
      const wrap = document.createElement('div'); wrap.className = 'feat-mynights myn-overlay';
      wrap.innerHTML = '<div class="myn-dlg" role="dialog" aria-modal="true" aria-labelledby="myn-dlg-h" tabindex="-1"><div class="myn-dh"><h3 id="myn-dlg-h">My nights</h3><button type="button" class="myn-x" aria-label="Close My nights">Close</button></div></div>';
      const dlg = wrap.firstChild; dlg.appendChild(passportSection({ heading: false }));
      wrap.addEventListener('click', e => { if (e.target === wrap) this.close(); });
      wrap.querySelector('.myn-x').addEventListener('click', () => this.close());
      wrap.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
        if (e.key !== 'Tab') return; const f = [...dlg.querySelectorAll('a[href],button:not([disabled]),input,select')].filter(x => x.offsetParent !== null); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      });
      wrap.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) this.close(true); });
      document.body.appendChild(wrap); this.el = wrap; document.documentElement.classList.add('myn-lock'); wrap.querySelector('.myn-x').focus();
    },
    close(quiet) { if (!this.el) return; this.el.querySelectorAll('.feat-mynights').forEach(x => { if (x._off) x._off(); }); this.el.remove(); this.el = null; document.documentElement.classList.remove('myn-lock'); if (!quiet && this.back && this.back.isConnected) this.back.focus(); }
  };
  window.addEventListener('hashchange', () => { if (Panel.el) Panel.close(true); });   /* the book has a #mynights page (build/extras.html) */

  const F = {
    name: 'mynights',
    get pages() { return ['mynights'].concat(ALL().filter(n => TYPES.includes(n.type)).map(n => n.id)); },
    anchor: null,
    mount(pageEl, id) {
      if (!pageEl) return null; this.unmount(pageEl);
      let sec;
      if (id === 'mynights') { sec = passportSection({ heading: !pageEl.querySelector('h2') }); pageEl.appendChild(sec); return sec; }
      if (!ok(id)) return null;
      sec = control(pageEl, id);
      const after = pageEl.querySelector('.lede') || pageEl.querySelector('.chips') || pageEl.querySelector('h2');
      if (after && after.parentNode) after.parentNode.insertBefore(sec, after.nextSibling); else pageEl.appendChild(sec);
      return sec;
    },
    unmount(pageEl) { if (pageEl) pageEl.querySelectorAll('.feat-mynights').forEach(s => { s.querySelectorAll('.feat-mynights').forEach(x => { if (x._off) x._off(); }); if (s._off) s._off(); s.remove(); }); },
    open: () => Panel.open(null), store: Store
  };
  (window.FEATURES = window.FEATURES || []).push(F);
})();
