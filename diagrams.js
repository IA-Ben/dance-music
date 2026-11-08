/* ===================================================================
   DIAGRAMS — one way of touching every static diagram in the book.
   Point at a mark (or tab to it) and it lights up with a card: what
   it is, when, and where to go. Click opens its page; on a phone the
   first tap shows the card and the second opens the page. Arrow keys
   move between marks, Escape lets go. Legend chips switch groups off
   and on. Charts2 and the genre family tree keep their own controls.
   =================================================================== */
window.Dg = (() => {
  const SPEC = new WeakMap(), OPTS = new WeakMap();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let tip = null, cur = null, pinned = null, hideT = 0, lastPtr = 'mouse', findEl = null;

  /* ---------- the card ---------- */
  function ensure(){
    if (tip) return tip;
    tip = document.createElement('div'); tip.className = 'dg-tip'; tip.id = 'dgTip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    document.body.appendChild(tip);
    tip.addEventListener('pointerenter', () => clearTimeout(hideT));
    tip.addEventListener('pointerleave', () => { if (!pinned) hideSoon(); });
    tip.addEventListener('click', e => {
      const p = e.target.closest('[data-dg-play]'); if (p){ e.preventDefault(); try { if (typeof playGenre === 'function') playGenre(p.dataset.dgPlay, 4, p); } catch (err) { console.warn(err); } return; }
      if (e.target.closest('.dg-find')){ e.preventDefault(); const t = findEl; clear(true); if (t) flash(t); return; }
      if (e.target.closest('a[href^="#"]')) clear(true);
    });
    tip.addEventListener('keydown', e => { if (e.key === 'Escape'){ const m = pinned || cur; clear(true); if (m && m.focus) m.focus({ preventScroll: true }); } });
    addEventListener('hashchange', () => clear(true));
    addEventListener('resize', () => clear(true));
    addEventListener('scroll', () => { const m = pinned || cur; if (!m) return; const r = m.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) tip.hidden = true; else place(m); }, { passive: true });
    document.addEventListener('pointerdown', e => { lastPtr = e.pointerType || 'mouse'; if (pinned && !e.target.closest('.dg-tip, .dg-m, svg[data-dg]')) clear(true); }, true);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && (cur || pinned) && !tip.contains(document.activeElement)){ const m = pinned || cur; clear(true); if (m && m.focus) m.focus({ preventScroll: true }); } });
    return tip;
  }
  function hideSoon(){ clearTimeout(hideT); hideT = setTimeout(() => { if (!pinned) clear(); }, 180); }

  /* a node id fills in the title, the type and years, the blurb and the link */
  function resolve(m){
    let s = SPEC.get(m); if (typeof s === 'function'){ s = s() || {}; SPEC.set(m, s); } s = s || {};
    const n = s.id && typeof NODE !== 'undefined' ? NODE[s.id] : null;
    const chapter = !n && s.id && typeof CHAPTER_TITLES !== 'undefined' ? CHAPTER_TITLES[s.id] : null;
    const kind = n ? [(typeof TYPE_LABEL !== 'undefined' && TYPE_LABEL[n.type]) || n.type, n.years].filter(Boolean).join(' · ') : '';
    return {
      title: s.title || (n && n.title) || chapter || '',
      meta: s.meta != null ? s.meta : (kind || (chapter ? 'Chapter' : '')),
      text: s.text != null ? s.text : (n ? n.blurb : ''),
      html: s.html || null,
      href: s.href !== undefined ? s.href : (n || chapter ? '#' + s.id : null),
      go: s.go || null, play: s.play || null, find: s.find || null, links: s.links || null, self: s.id || null
    };
  }
  /* the first sentence on this page that mentions a term: the diagram explains itself in the book's own words */
  function sentence(term, root){
    if (!term || !root) return null;
    const want = term.toLowerCase();
    const els = [...root.querySelectorAll('p, li')].filter(e => !e.closest('.cap, .kicker, svg, .dg-tip, .chips, nav, .pagenav, .forks'));
    for (const e of els){
      const t = e.textContent.replace(/\s+/g, ' ').trim(); const i = t.toLowerCase().indexOf(want); if (i < 0) continue;
      const parts = t.split(/(?<=[.!?…])\s+(?=[A-Z“"‘(0-9])/); let at = 0;
      for (const p of parts){ if (i >= at && i < at + p.length + 1) return { el: e, text: p.length > 260 ? p.slice(0, 257).replace(/\s+\S*$/, '') + '…' : p }; at += p.length + 1; }
      return { el: e, text: parts[0] };
    }
    return null;
  }
  function flash(el){
    el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' });
    el.classList.remove('dg-flash'); void el.offsetWidth; el.classList.add('dg-flash'); setTimeout(() => el.classList.remove('dg-flash'), 1900);
  }
  function fill(m){
    const s = resolve(m); const svg = m.ownerSVGElement || m.closest('svg'); const page = svg && svg.closest('.page');
    let text = s.text, from = null;
    if (s.find){ from = sentence(s.find, page); if (from && !text) text = from.text; }
    findEl = from ? from.el : null;
    const acts = [];
    if (s.href) acts.push(`<a class="dg-go" href="${esc(s.href)}">${esc(s.go || 'Open the page')} →</a>`);
    if (s.play) acts.push(`<button type="button" class="play dg-play" data-dg-play="${esc(s.play)}">Hear it</button>`);
    if (findEl && s.find) acts.push(`<button type="button" class="dg-find">Read about it here ↓</button>`);
    (s.links || []).forEach(([label, href]) => acts.push(`<a class="dg-go dg-alt" href="${esc(href)}">${esc(label)}</a>`));
    tip.innerHTML = `<b>${esc(s.title)}</b>${s.meta ? `<small>${esc(s.meta)}</small>` : ''}${s.html ? `<p>${s.html}</p>` : text ? `<p>${esc(text)}</p>` : ''}${acts.length ? `<div class="dg-act">${acts.join('')}</div>` : ''}`;
    const p = tip.querySelector('p');
    if (p){ try { if (typeof autolink === 'function') autolink(p, s.self); p.querySelectorAll('a[href]').forEach(x => { if (/^#y\d{4}$/.test(x.getAttribute('href'))) x.replaceWith(document.createTextNode(x.textContent)); }); p.normalize(); if (typeof smarten === 'function') smarten(tip); } catch (err) {} }
  }
  function place(m){
    const r = m.getBoundingClientRect(); tip.hidden = false; tip.style.left = '0px'; tip.style.top = '0px';
    const tw = tip.offsetWidth, th = tip.offsetHeight, pad = 8, gap = 10;
    const bottomBar = innerWidth < 700 ? 80 : 0;
    let x = r.left + r.width / 2 - tw / 2; x = Math.max(pad, Math.min(innerWidth - tw - pad, x));
    let y = r.top - th - gap; if (y < pad) y = r.bottom + gap; if (y + th > innerHeight - pad - bottomBar) y = Math.max(pad, innerHeight - th - pad - bottomBar);
    tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
  }

  /* ---------- lighting ---------- */
  function light(m, on){
    const svg = m.ownerSVGElement || m.closest('svg'); if (!svg) return; const o = OPTS.get(svg) || {};
    svg.querySelectorAll('.dg-lit').forEach(e => e.classList.remove('dg-lit'));
    svg.classList.toggle('dg-hl', !!on);
    if (on){
      m.classList.add('dg-lit');
      let rel = (SPEC.get(m) || {}).rel; if (typeof rel === 'function') rel = rel(m);
      (rel || []).forEach(e => e && e.classList && e.classList.add('dg-lit'));
    }
    if (o.onlight) try { o.onlight(on ? m : null, svg); } catch (err) { console.warn(err); }
  }
  function show(m, pin){
    ensure(); clearTimeout(hideT);
    if (cur && cur !== m) cur.classList.remove('dg-pin');
    cur = m; if (pin){ pinned = m; m.classList.add('dg-pin'); }
    light(m, true); fill(m); place(m);
    m.setAttribute('aria-describedby', 'dgTip');
  }
  function clear(force){
    if (!tip) return; if (pinned && !force) return;
    const m = pinned || cur; pinned = null; cur = null; tip.hidden = true; findEl = null;
    if (m){ m.classList.remove('dg-pin'); m.removeAttribute('aria-describedby'); light(m, false); }
  }
  function activate(m, e){
    const s = resolve(m);
    if (m.tagName.toLowerCase() === 'a' && m.getAttribute('href')){ clear(true); if (e && e.type === 'keydown' && e.key === ' '){ e.preventDefault(); location.hash = m.getAttribute('href').replace(/^#/, ''); } return; } /* otherwise the browser follows it */
    if (e) e.preventDefault();
    if (s.href){ clear(true); location.hash = s.href.replace(/^#/, ''); return; }
    if (pinned === m){ clear(true); return; }
    show(m, true);
    const first = tip.querySelector('a, button'); if (first && e && e.type === 'keydown') first.focus({ preventScroll: true });
  }

  /* ---------- wiring: one set of listeners per diagram ---------- */
  function marks(svg){ return [...svg.querySelectorAll('.dg-m')].filter(m => !m.classList.contains('dg-off')); }
  function rove(svg, m){ svg.querySelectorAll('.dg-m[tabindex="0"]').forEach(x => { if (x !== m) x.setAttribute('tabindex', '-1'); }); m.setAttribute('tabindex', '0'); }
  /* the mark nearest a point, within reach: for dense diagrams and for fingers on a phone */
  const CENT = new WeakMap();
  function nearest(svg, cx, cy, reach){
    const sr = svg.getBoundingClientRect(); let c = CENT.get(svg);
    if (!c || c.w !== Math.round(sr.width) || c.n !== svg.querySelectorAll('.dg-m').length){
      c = { w: Math.round(sr.width), n: svg.querySelectorAll('.dg-m').length, pts: [...svg.querySelectorAll('.dg-m')].map(m => { const f = m.firstElementChild || m; const r = f.getBoundingClientRect(); return [m, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2]; }) };
      CENT.set(svg, c);
    }
    const x = cx - sr.left, y = cy - sr.top; let best = null, bd = reach * reach;
    for (const [m, px, py] of c.pts){ if (m.classList.contains('dg-off')) continue; const d = (px - x) * (px - x) + (py - y) * (py - y); if (d < bd){ bd = d; best = m; } }
    return best;
  }
  function wire(svg, opts){
    if (opts) OPTS.set(svg, Object.assign(OPTS.get(svg) || {}, opts));
    if (svg.dataset.dg) return svg; svg.dataset.dg = 1; ensure();
    enter(svg);
    const label = svg.closest('.card') && svg.closest('.card').querySelector('h3');
    if (!svg.getAttribute('role')) svg.setAttribute('role', 'group');
    if (label && !svg.getAttribute('aria-label')) svg.setAttribute('aria-label', label.textContent.trim() + ' (diagram: arrow keys move between items)');
    svg.addEventListener('pointerover', e => { const m = e.target.closest('.dg-m'); if (!m || !svg.contains(m) || e.pointerType === 'touch' || e.pointerType === 'pen') return; if (pinned && pinned !== m) return; if (cur !== m) show(m); else clearTimeout(hideT); });
    svg.addEventListener('pointerout', e => { const m = e.target.closest('.dg-m'); if (!m || (e.relatedTarget && m.contains(e.relatedTarget))) return; if (!pinned) hideSoon(); });
    let raf = 0;
    svg.addEventListener('pointermove', e => { const o = OPTS.get(svg) || {}; if (!o.reach || e.pointerType === 'touch' || pinned || e.target.closest('.dg-m')) return; if (raf) return; const X = e.clientX, Y = e.clientY; raf = requestAnimationFrame(() => { raf = 0; const m = nearest(svg, X, Y, o.reach); if (m && m !== cur) show(m); else if (!m && cur) hideSoon(); }); });
    svg.addEventListener('click', e => {
      const touch = lastPtr === 'touch' || lastPtr === 'pen'; let m = e.target.closest('.dg-m'), viaNear = false;
      if (!m){ const o = OPTS.get(svg) || {}; const reach = touch ? Math.max(o.reach || 0, 22) : (o.reach || 0); if (reach){ m = nearest(svg, e.clientX, e.clientY, reach); viaNear = !!m; } }
      if (!m || !svg.contains(m)){ if (pinned) clear(true); return; }
      if (touch && pinned !== m){ e.preventDefault(); show(m, true); return; }
      if (viaNear && m.tagName.toLowerCase() === 'a'){ e.preventDefault(); clear(true); location.hash = m.getAttribute('href').replace(/^#/, ''); return; }
      activate(m, e);
    });
    svg.addEventListener('focusin', e => { const m = e.target.closest('.dg-m'); if (!m) return; rove(svg, m); if (!pinned || pinned === m) show(m); });
    svg.addEventListener('focusout', e => { if (e.relatedTarget && (tip.contains(e.relatedTarget) || svg.contains(e.relatedTarget))) return; if (!pinned) clear(); });
    svg.addEventListener('keydown', e => {
      const m = e.target.closest('.dg-m'); if (!m) return; const all = marks(svg); const i = all.indexOf(m);
      const go = j => { const n = all[(j + all.length) % all.length]; if (n){ e.preventDefault(); if (pinned) clear(true); n.focus({ preventScroll: false }); } };
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(i + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(i - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(all.length - 1);
      else if (e.key === 'Enter' || e.key === ' '){ if (e.key === ' ' || m.tagName.toLowerCase() !== 'a') activate(m, e); else clear(true); }
    });
    return svg;
  }
  /* the first time a diagram scrolls into view its marks arrive in turn and its lines draw themselves */
  function enter(svg){
    if (reduce() || !('IntersectionObserver' in window) || svg.dataset.dgIn) return;
    svg.classList.add('dg-pre');
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; io.disconnect(); svg.dataset.dgIn = 1;
      let last = 0;
      svg.querySelectorAll('.dg-m').forEach(m => { last = Math.max(last, parseFloat(m.style.getPropertyValue('--dgd')) || 0); });
      svg.querySelectorAll('.dg-e').forEach((e, i) => { try { const L = e.getTotalLength(); if (!L || !isFinite(L)) return; e.style.strokeDasharray = L; e.style.strokeDashoffset = L; e.getBoundingClientRect(); e.style.transition = `stroke-dashoffset .9s ease ${Math.min(i * 30, 700)}ms`; e.style.strokeDashoffset = 0; } catch (err) {} });
      svg.classList.remove('dg-pre'); svg.classList.add('dg-in');
      setTimeout(() => { svg.classList.remove('dg-in'); svg.querySelectorAll('.dg-e').forEach(e => { e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; e.style.transition = ''; }); }, last + 1700);
    }), { threshold: .12 });
    io.observe(svg);
  }
  /* make an element a mark: spec is {id} for a book page, or {title, meta, text, href, play, find, rel, links} */
  function mark(el, spec, svg){
    svg = svg || el.ownerSVGElement || el.closest('svg'); if (!svg) return el;
    wire(svg); SPEC.set(el, spec || {});
    el.classList.add('dg-m');
    const first = !svg.querySelector('.dg-m[tabindex="0"]');
    if (el.tagName.toLowerCase() !== 'a' || !el.getAttribute('href')) el.setAttribute('role', 'button');
    el.setAttribute('tabindex', first ? '0' : '-1');
    if (!el.style.getPropertyValue('--dgd')){ const i = svg.querySelectorAll('.dg-m').length - 1; el.style.setProperty('--dgd', Math.min(i * 40, 900) + 'ms'); }
    if (typeof spec !== 'function'){ const s = resolve(el); if (s.title) el.setAttribute('aria-label', s.title + (s.meta ? ', ' + s.meta : '')); }
    return el;
  }

  /* ---------- legend chips that switch groups off and on (elements carry data-dgk) ---------- */
  function legend(svg, items, where){
    const card = svg.closest('.card') || svg.parentNode; let bar = card.querySelector('.dg-bar[data-for="' + svg.id + '"]'); if (bar) bar.remove();
    bar = document.createElement('div'); bar.className = 'dg-bar'; bar.dataset.for = svg.id; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Show or hide');
    bar.innerHTML = items.map(([k, label, colr]) => `<button type="button" class="dg-f on" data-k="${esc(k)}" aria-pressed="true" style="--k:${colr}"><i></i>${esc(label)}</button>`).join('');
    if (where === 'after') svg.insertAdjacentElement('afterend', bar); else svg.parentNode.insertBefore(bar, svg);
    bar.addEventListener('click', e => {
      const b = e.target.closest('.dg-f'); if (!b) return; b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on'));
      if (!bar.querySelector('.dg-f.on')) bar.querySelectorAll('.dg-f').forEach(x => { x.classList.add('on'); x.setAttribute('aria-pressed', 'true'); });
      const off = new Set([...bar.querySelectorAll('.dg-f:not(.on)')].map(x => x.dataset.k));
      svg.querySelectorAll('[data-dgk]').forEach(x => { const o = off.has(x.dataset.dgk); x.classList.toggle('dg-off', o); if (o && x.classList.contains('dg-m')) x.setAttribute('tabindex', '-1'); });
      if (!svg.querySelector('.dg-m[tabindex="0"]:not(.dg-off)')){ const f = svg.querySelector('.dg-m:not(.dg-off)'); if (f) f.setAttribute('tabindex', '0'); }
      clear(true);
      const o = OPTS.get(svg) || {}; if (o.onfilter) o.onfilter(off);
    });
    return bar;
  }
  function dirty(svg){ CENT.delete(svg); }
  return { mark, wire, legend, show, clear, sentence, flash, esc, dirty };
})();
