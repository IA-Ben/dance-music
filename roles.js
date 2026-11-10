/* ===================================================================
   ROLES — "The people" by what they did: one index page per role
   (DJs, producers, promoters...) and the roles on each person's page.
   Data: roles-gen.js, written by /tmp/deep2/tools/gen_roles.py from the
   person pages; hand corrections in build/roles-overrides.json.
   The DJs index is the page that was already called djs.
   =================================================================== */
window.Roles = {
  D: window.ROLE_DATA || { defs: [], meta: {}, people: {} },
  esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
  def(page){ return this.D.defs.find(d => d.page === page); },
  of(id){ return this.D.people[id] || []; },
  first(n){ const y = (typeof YearView !== 'undefined') ? YearView.years(n) : null; return y ? y[0] : null; },
  people(d){ return Object.keys(this.D.people).filter(id => NODE[id] && this.of(id).some(k => d.keys.includes(k))).map(id => NODE[id]); },
  /* the DJs page was built for the old list of everyone: give it the index's shape */
  adopt(){
    const d = this.def('djs'), art = document.querySelector('.page[data-page="djs"]'); if (!d || !art) return;
    const k = art.querySelector('.kicker'), h = art.querySelector('h2'), l = art.querySelector('.lede');
    if (k) k.textContent = 'The people · by role'; if (h) h.textContent = d.title; if (l) l.textContent = d.desc;
    if (art.querySelector('.roleidx')) return;
    ['djFilters', 'djList'].forEach(i => { const e = document.getElementById(i); if (e) e.remove(); });
    const box = document.createElement('div'); box.className = 'roleidx'; box.dataset.role = 'djs'; (l || h || art.lastChild).after(box);
  },
  build(page){
    const art = document.querySelector(`.page[data-page="${page}"]`), d = this.def(page); if (!art || !d) return;
    const box = art.querySelector('.roleidx'); if (!box || box.dataset.built) return; box.dataset.built = 1;
    const col = new Intl.Collator('en', { sensitivity: 'base', ignorePunctuation: true }), list = this.people(d), byName = (a, b) => col.compare(a.title, b.title);
    const cities = [...new Set(list.map(n => n.city).filter(c => NODE[c]))].sort((a, b) => NODE[a].title.localeCompare(NODE[b].title));
    const decades = [...new Set(list.map(n => this.first(n)).filter(Boolean).map(y => Math.floor(y / 10) * 10))].sort((a, b) => a - b);
    const others = this.D.defs.filter(x => x.page !== page && (!window.PAGE_IDS || PAGE_IDS.includes(x.page) || document.querySelector(`.page[data-page="${x.page}"]`)));
    box.innerHTML = `<p class="cap">${list.length} people. Anyone who did several things is in each index.</p>
      <div class="row" style="margin:0 0 10px"><select data-k="sort" aria-label="Sort"><option value="name">by name</option><option value="year">by first year</option></select>${cities.length > 1 ? `<select data-k="city" aria-label="City"><option value="">every city</option>${cities.map(c => `<option value="${c}">${this.esc(NODE[c].title)}</option>`).join('')}</select>` : ''}${decades.length > 1 ? `<select data-k="dec" aria-label="Decade"><option value="">every decade</option>${decades.map(y => `<option value="${y}">${y}s</option>`).join('')}</select>` : ''}<input type="search" data-k="q" placeholder="name…" aria-label="Filter by name" style="font:12px var(--f-mono);background:var(--bg3);color:var(--text);border:1px solid var(--line);border-radius:6px;padding:6px 8px;min-width:0;flex:1 1 120px"><span class="cap" data-k="n"></span></div>
      <div class="djgrid"></div>
      ${others.length ? `<div class="chips" style="margin-top:16px">${others.map(x => `<a class="chip" href="#${x.page}"><i></i>${this.esc(x.title)}</a>`).join('')}</div>` : ''}`;
    const get = k => box.querySelector(`[data-k="${k}"]`), grid = box.querySelector('.djgrid');
    const render = () => {
      const o = get('sort').value, c = get('city') ? get('city').value : '', dc = get('dec') ? +get('dec').value : 0, q = get('q').value.trim();
      const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(), fq = fold(q);
      const rows = list.filter(n => (!c || n.city === c) && (!dc || Math.floor((this.first(n) || 0) / 10) * 10 === dc) && (!fq || [n.title, ...(n.aliases || [])].some(a => fold(a).includes(fq))));
      rows.sort(o === 'year' ? (a, b) => ((this.first(a) || 9999) - (this.first(b) || 9999)) || byName(a, b) : byName);
      get('n').textContent = rows.length === list.length ? `${rows.length} people` : `${rows.length} of ${list.length}`;
      grid.innerHTML = rows.length ? rows.map(n => { const b = n.blurb || ''; const meta = [n.years, n.city && NODE[n.city] ? NODE[n.city].title : ''].filter(Boolean).join(' · ');
        return `<a class="djcard" href="#${n.id}" style="--c:var(${STRANDS[n.strands[0]] ? STRANDS[n.strands[0]].color : '--kick'})"><b>${this.esc(n.title)}</b>${meta ? `<span class="meta">${this.esc(meta)}</span>` : ''}<span class="who">${this.esc(b.length > 150 ? b.slice(0, 149).replace(/\s+\S*$/, '') + '…' : b)}</span></a>`; }).join('') : '<p class="cap">No one matches.</p>';
    };
    box.querySelectorAll('select, input').forEach(e => e.oninput = render); render();
  },
  /* on a person's page: the roles as small chips beside the strand chips, under the kicker that names the type */
  mark(id){
    const n = NODE[id], ks = this.of(id); if (!n || n.type !== 'person' || !ks.length) return;
    const row = document.querySelector('.page[data-page="node"] > .chips'); if (!row || row.querySelector('.rolechip')) return;
    row.insertAdjacentHTML('afterbegin', ks.map(k => { const m = this.D.meta[k] || { label: k }; return m.page ? `<a class="chip rolechip" href="#${m.page}" title="Index: ${this.esc((this.def(m.page) || {}).title || m.label)}" style="--c:var(--kick)"><i></i>${this.esc(m.label)}</a>` : `<span class="chip rolechip" style="--c:var(--kick)"><i></i>${this.esc(m.label)}</span>`; }).join(''));
  }
};
Roles.adopt();
Roles.D.defs.forEach(d => { window.PageHooks[d.page] = () => Roles.build(d.page); });
if (typeof NodeView !== 'undefined'){ const render = NodeView.render; NodeView.render = function (id, strand){ render.call(this, id, strand); try { Roles.mark(id); } catch (e) {} }; }
