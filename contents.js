/* ===================================================================
   CONTENTS — the sidebar and the cover's table of contents, both built
   from CONTENTS (graph.js). Strands fold away; the strand you are
   reading opens by itself; progress is the pages you have visited.
   =================================================================== */
const Contents = {
  manual: new Set(), auto: null, suppressed: null, side: null, home: null, built: false,
  load(){ try { JSON.parse(localStorage.getItem('dm-toc') || '[]').forEach(k => this.manual.add(k)); } catch (e) {} },
  save(){ try { localStorage.setItem('dm-toc', JSON.stringify([...this.manual])); } catch (e) {} },
  last(){ try { return JSON.parse(localStorage.getItem('dm-last') || 'null'); } catch (e) { return null; } },
  remember(id, strand){ try { localStorage.setItem('dm-last', JSON.stringify({ id, strand })); } catch (e) {} },
  esc(s){ return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
  exists(id){ return !!document.querySelector(`.page[data-page="${id}"]`) || (typeof NODE !== 'undefined' && !!NODE[id]); },
  href(s, id){ return '#' + (s && STRANDS[s] && STRANDS[s].spine.length > 1 ? s + '-' : '') + id; },
  seen(id){ return typeof Visited !== 'undefined' && Visited.set.has(id); },
  count(s){ const sp = STRANDS[s].spine; return [sp.filter(id => this.seen(id)).length, sp.length]; },
  nextUnread(s){ const sp = STRANDS[s].spine; return sp.find(id => !this.seen(id)) || null; },
  years(){ return STRANDS.years ? STRANDS.years.spine.filter(id => /^y\d{4}$/.test(id)) : []; },
  yearClass(id){ const y = +id.slice(1); return y < BOOK.from ? ' pro' : y === BOOK.from ? ' one' : y === BOOK.to ? ' on' : ''; },
  parts(){
    return CONTENTS.map(p => ({ ...p,
      strands: (p.strands || []).filter(s => STRANDS[s]),
      pages: (p.pages || []).filter(id => this.exists(id)),
      groups: (p.groups || []).map(([k, t, ids]) => ['x-' + k, t, ids.filter(id => this.exists(id))]).filter(g => g[2].length)
    })).filter(p => p.strands.length || p.pages.length || p.groups.length);
  },
  /* ---------- sidebar ---------- */
  link(id, s, n, color){ const a = document.createElement('a'); a.className = 'ch'; a.href = this.href(s, id); a.dataset.id = id; if (color) a.style.setProperty('--c', `var(${color})`); a.innerHTML = `<span class="n">${n}</span><span>${this.esc(titleOf(id))}</span>`; return a; },
  group(k, title, color, items){
    const g = document.createElement('div'); g.className = 'sg'; g.dataset.k = k; g.style.setProperty('--c', `var(${color})`);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sh'; b.dataset.k = k; b.setAttribute('aria-expanded', 'false');
    b.innerHTML = `<i class="dot"></i><span class="sg-t">${this.esc(title)}</span><span class="sg-n"></span><span class="sg-v" aria-hidden="true"></span>`;
    const body = document.createElement('div'); body.className = 'sb'; body.setAttribute('role', 'group'); body.setAttribute('aria-label', title);
    const inner = document.createElement('div'); inner.className = 'sbi'; items.forEach(([id, s, n]) => inner.appendChild(this.link(id, s, n, color))); body.appendChild(inner);
    g.append(b, body); return g;
  },
  solo(id, s, title, color){ const a = document.createElement('a'); a.className = 'ch solo'; a.href = this.href(s, id); a.dataset.id = id; a.style.setProperty('--c', `var(${color})`); a.innerHTML = `<i class="dot"></i><span>${this.esc(title)}</span>`; return a; },
  yearsBlock(){
    const wrap = document.createElement('div'); wrap.className = 'sy';
    const sp = STRANDS.years.spine;
    if (sp.includes('timeline')) wrap.appendChild(this.link('timeline', 'years', '—', '--mix'));
    const grid = document.createElement('div'); grid.className = 'yeargrid';
    this.years().forEach(id => { const a = document.createElement('a'); a.className = 'yr' + this.yearClass(id); a.href = '#years-' + id; a.dataset.id = id; a.textContent = id.slice(1); a.title = titleOf(id); grid.appendChild(a); });
    wrap.appendChild(grid);
    if (sp.includes('forty')) wrap.appendChild(this.link('forty', 'years', '40', '--mix'));
    return wrap;
  },
  buildSide(side){
    this.side = side; this.load();
    const frag = document.createDocumentFragment();
    const resume = document.createElement('a'); resume.className = 'resume'; resume.hidden = true; frag.appendChild(resume); this.resumeEl = resume;
    const nav = document.createElement('nav'); nav.className = 'stoc'; nav.setAttribute('aria-label', 'Contents');
    this.parts().forEach(p => {
      const h = document.createElement('div'); h.className = 'part'; h.textContent = p.strands[0] === 'years' ? `${p.part} · ${BOOK.span}` : p.part; nav.appendChild(h);
      p.strands.forEach(s => { const S = STRANDS[s]; nav.appendChild(s === 'years' ? this.yearsBlock() : S.spine.length === 1 ? this.solo(S.spine[0], s, S.title, S.color) : this.group(s, S.title, S.color, S.spine.map((id, i) => [id, s, String(i).padStart(2, '0')]))); });
      p.pages.forEach(id => nav.appendChild(this.solo(id, null, titleOf(id), '--mix')));
      p.groups.forEach(([k, t, ids]) => nav.appendChild(this.group(k, t, '--mix', ids.map(id => [id, null, '·']))));
    });
    frag.appendChild(nav); side.appendChild(frag);
    side.addEventListener('click', e => { const b = e.target.closest('button.sh'); if (b){ this.toggle(b.dataset.k); return; } if (e.target.closest('a')) side.classList.remove('open'); });
    this.built = true;
  },
  isOpen(k){ return this.manual.has(k) || (k === this.auto && k !== this.suppressed); },
  toggle(k){ if (this.isOpen(k)){ this.manual.delete(k); if (k === this.auto) this.suppressed = k; } else { this.manual.add(k); if (k === this.suppressed) this.suppressed = null; } this.save(); this.paintSide(); },
  /* ---------- the cover's contents ---------- */
  card(s){
    const S = STRANDS[s], first = S.spine[0];
    const el = document.createElement('article'); el.className = 'scard'; el.dataset.s = s; el.style.setProperty('--c', `var(${S.color})`);
    const list = S.spine.map((id, i) => `<li><a href="${this.href(s, id)}" data-id="${id}"><span class="n">${String(i).padStart(2, '0')}</span>${this.esc(titleOf(id))}</a></li>`).join('');
    el.innerHTML = `<a class="sc-main" href="${this.href(s, first)}"><span class="sc-k">${S.spine.length} chapter${S.spine.length > 1 ? 's' : ''}</span><span class="sc-t">${this.esc(S.title)}</span><span class="sc-s">${this.esc(STRAND_SUB[s] || '')}</span></a><div class="sc-bar"><i></i></div><a class="sc-go" hidden></a>${S.spine.length > 1 ? `<details class="sc-list"><summary>All ${S.spine.length} chapters</summary><ol>${list}</ol></details>` : ''}`;
    return el;
  },
  pageCard(id, kicker, color, sub){ const el = document.createElement('article'); el.className = 'scard one'; el.style.setProperty('--c', `var(${color || '--mix'})`); el.innerHTML = `<a class="sc-main" href="#${id}"><span class="sc-k">${this.esc(kicker)}</span><span class="sc-t">${this.esc(titleOf(id))}</span>${sub ? `<span class="sc-s">${this.esc(sub)}</span>` : ''}</a>`; return el; },
  buildHome(home){
    this.home = home; home.innerHTML = '';
    const parts = this.parts();
    const chapters = Object.values(STRANDS).reduce((a, S) => a + S.spine.length, 0); /* same count as the cover stats: every page in a strand's reading order */
    const head = document.createElement('div'); head.className = 'parthead chead'; head.innerHTML = `<h2>Contents</h2><span>${chapters} chapters in ${Object.keys(STRANDS).length} strands, and ${typeof NODES !== 'undefined' ? NODES.length : ''} pages in the graph</span>`; home.appendChild(head);
    const resume = document.createElement('a'); resume.className = 'resume big'; resume.hidden = true; home.appendChild(resume); this.homeResume = resume;
    parts.forEach(p => {
      const ph = document.createElement('div'); ph.className = 'cpart'; ph.innerHTML = `<h3>${this.esc(p.part)}</h3><span>${this.esc(p.sub || '')}</span>`; home.appendChild(ph);
      if (p.strands[0] === 'years'){
        const g = document.createElement('div'); g.className = 'yeargrid home';
        this.years().forEach(id => { const a = document.createElement('a'); a.className = 'yr' + this.yearClass(id); a.href = '#years-' + id; a.dataset.id = id; a.textContent = id.slice(1); a.title = ((window.YEARS || {})[id.slice(1)] || [])[0] || titleOf(id); g.appendChild(a); });
        home.appendChild(g);
        const extra = STRANDS.years.spine.filter(id => !/^y\d{4}$/.test(id));
        if (extra.length){ const c = document.createElement('div'); c.className = 'chips cchips'; c.innerHTML = extra.map(id => `<a class="chip" href="#years-${id}"><i></i>${this.esc(titleOf(id))}</a>`).join(''); home.appendChild(c); }
        return;
      }
      if (p.strands.length || p.pages.length){ const grid = document.createElement('div'); grid.className = 'cgrid'; p.strands.forEach(s => grid.appendChild(STRANDS[s].spine.length === 1 ? this.pageCard(STRANDS[s].spine[0], STRANDS[s].title, STRANDS[s].color, STRAND_SUB[s]) : this.card(s))); p.pages.forEach(id => grid.appendChild(this.pageCard(id, p.part, '--mix'))); home.appendChild(grid); }
      if (p.groups.length){ const x = document.createElement('div'); x.className = 'cexplore'; x.innerHTML = p.groups.map(([, t, ids]) => `<div class="cx"><h4>${this.esc(t)}</h4>${ids.map(id => `<a href="#${id}" data-id="${id}">${this.esc(titleOf(id))}</a>`).join('')}</div>`).join(''); home.appendChild(x); }
    });
  },
  /* ---------- keeping it current ---------- */
  resumeTarget(){ const l = this.last(); if (!l || !l.id || !this.exists(l.id)) return null; const s = l.strand && STRANDS[l.strand] && STRANDS[l.strand].spine.includes(l.id) ? l.strand : null; return { id: l.id, s, label: `${s ? STRANDS[s].title + ' · ' : ''}${titleOf(l.id)}` }; },
  paintResume(cur){
    const r = cur === 'home' ? this.resumeTarget() : null;
    [this.resumeEl, this.homeResume, document.getElementById('resumeCover')].forEach(el => { if (!el) return; el.hidden = !r; if (!r) return; el.href = this.href(r.s, r.id); el.innerHTML = `<small>Pick up where you left off</small><span>${this.esc(r.label)} →</span>`; });
  },
  paintSide(cur){
    if (!this.side) return;
    this.side.querySelectorAll('.sg').forEach(g => {
      const k = g.dataset.k, open = this.isOpen(k); g.classList.toggle('open', open); g.querySelector('.sh').setAttribute('aria-expanded', open);
      g.classList.toggle('cur', k === this.auto);
      if (STRANDS[k]){ const [n, t] = this.count(k), sp = g.querySelector('.sg-n'); sp.textContent = n === 0 ? t : n === t ? '✓' : `${n}/${t}`; sp.classList.toggle('done', n === t); sp.title = `${n} of ${t} read`; }
    });
    this.side.querySelectorAll('a.ch, a.yr').forEach(a => { a.classList.toggle('seen', this.seen(a.dataset.id)); if (cur !== undefined) a.classList.toggle('active', a.dataset.id === cur); });
  },
  paintHome(){
    if (!this.home) return;
    this.home.querySelectorAll('.scard[data-s]').forEach(c => {
      const s = c.dataset.s; if (!STRANDS[s]) return; const [n, t] = this.count(s);
      c.querySelector('.sc-bar i').style.width = (n / t * 100) + '%'; c.classList.toggle('started', n > 0); c.classList.toggle('done', n === t);
      const go = c.querySelector('.sc-go'), next = this.nextUnread(s);
      if (n > 0 && next){ go.hidden = false; go.href = this.href(s, next); go.innerHTML = `<small>${n} of ${t} read · next</small>${this.esc(titleOf(next))} →`; } else go.hidden = true;
      c.querySelectorAll('li a').forEach(a => a.classList.toggle('seen', this.seen(a.dataset.id)));
    });
    this.home.querySelectorAll('.yeargrid a.yr, .cx a').forEach(a => a.classList.toggle('seen', this.seen(a.dataset.id)));
  },
  scrollToActive(){
    const side = this.side; if (!side || side.scrollHeight <= side.clientHeight) return;
    const a = side.querySelector('a.active'); if (!a) return;
    const r = a.getBoundingClientRect(), sr = side.getBoundingClientRect();
    if (r.top < sr.top + 80 || r.bottom > sr.bottom - 24) side.scrollTo({ top: side.scrollTop + (r.top - sr.top) - sr.height / 3, behavior: 'smooth' });
  },
  /* called by route() after every page change */
  sync(id, strand, onSpine){
    if (id === 'home') this.auto = null;
    else if (STANDALONE[id]){ const g = CONTENTS.flatMap(p => p.groups || []).find(([, , ids]) => ids.includes(id)); this.auto = g ? 'x-' + g[0] : null; }
    else if (onSpine && strand !== 'years' && STRANDS[strand] && STRANDS[strand].spine.length > 1) this.auto = strand;
    if (this.auto !== this.lastAuto){ this.suppressed = null; this.lastAuto = this.auto; }
    if (onSpine && id !== 'home') this.remember(id, strand);
    this.paintSide(id); this.paintHome(); this.paintResume(id);
    clearTimeout(this.st); this.st = setTimeout(() => this.scrollToActive(), 240);
  }
};
