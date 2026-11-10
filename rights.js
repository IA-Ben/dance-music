window.CLUB_FLYERS = [];
window.RIGHTS_REMOVED = [];
/* ===================================================================
   RIGHTS — the Rights and takedown page, the "Report this image" link
   under every picture, and the bundled flyer and logo slots.
   Data: window.CLUB_FLYERS (build/club-flyers.json, see
   build/flyers.README.md) and window.RIGHTS_REMOVED (the entries of
   build/removed-images.json with reason "request": date and what only).
   The contact route is BOOK.rightsContact in build/graph.js: an email
   address or a URL. Empty = a pre-filled issue on the public repository.
   Removal: python3 /tmp/deep2/tools/takedown.py <id or file>.
   =================================================================== */
window.Rights = {
  REPO_NEW: 'https://github.com/IA-Ben/dance-music/issues/new',
  SITE: 'https://fortyyearsof.dance/',
  esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); },
  contact(){ return String((typeof BOOK !== 'undefined' && BOOK.rightsContact) || '').trim(); },
  /* the link under a picture: id is its key in the data file, file its path, page the page it is on */
  href(id, file, page){ return '#rights?' + new URLSearchParams({ img: id || '', file: file || '', page: page || '' }).toString(); },
  link(id, file, page){ return `<a class="xl report" href="${this.esc(this.href(id, file, page))}">Report this image</a>`; },
  params(){ const h = location.hash || ''; const i = h.indexOf('?'); return new URLSearchParams(i >= 0 ? h.slice(i + 1) : ''); },
  base(){ return /^https?:$/.test(location.protocol) ? location.origin + location.pathname : this.SITE; },
  pageTitle(p){ return !p ? '' : (typeof NODE !== 'undefined' && NODE[p]) ? NODE[p].title : (typeof CHAPTER_TITLES !== 'undefined' && CHAPTER_TITLES[p]) || p; },
  /* find the picture a link names, in whichever data file holds it */
  find(id, file){
    const base = f => String(f || '').split('/').pop();
    const im = (window.IMAGES || {})[id]; if (im) return { src: im.src, what: imgCaption(im), credit: `${im.author} · ${im.license}` };
    const cf = (window.CLUB_FLYERS || []).find(f => f.id === id || (file && f.src === file)); if (cf) return { src: cf.src, what: ClubFlyers.caption(cf), credit: ClubFlyers.creditText(cf) };
    const cm = (window.FLYERS || []).find(f => file && base(f.src) === base(file)); if (cm) return { src: cm.src, what: cm.title.replace(/^File:/, ''), credit: `${cm.author} · ${cm.license}` };
    const byFile = Object.values(window.IMAGES || {}).find(v => v && file && base(v.src) === base(file)); if (byFile) return { src: byFile.src, what: imgCaption(byFile), credit: `${byFile.author} · ${byFile.license}` };
    return null;
  },
  build(){
    const how = document.getElementById('rightsHow'), box = document.getElementById('rightsRequest'), rem = document.getElementById('rightsRemoved'); if (!how || !box) return;
    const c = this.contact(), isMail = c && /^[^\s@/]+@[^\s@/]+$/.test(c);
    how.innerHTML = !c ? `Open a new issue on the book's public repository, <a class="xl" href="https://github.com/IA-Ben/dance-music" target="_blank" rel="noopener">IA-Ben/dance-music</a> on GitHub; the button below opens one with the picture already filled in. You need a free GitHub account to post it, and anyone can read an issue, so put in only what you are happy to have seen in public.`
      : isMail ? `Write to <a class="xl" href="mailto:${this.esc(c)}">${this.esc(c)}</a>; the button below opens an email with the picture already filled in.`
      : `Use <a class="xl" href="${this.esc(c)}" target="_blank" rel="noopener">the request page</a>; the button below opens it, and copies nothing you have not typed.`;
    const q = this.params(), id = q.get('img') || '', file = q.get('file') || '', page = q.get('page') || ''; const pic = (id || file) ? this.find(id, file) : null;
    const picHtml = (id || file) ? `<div class="rq-pic">${pic ? `<img src="${this.esc(pic.src)}" alt="" loading="lazy">` : ''}<p class="cap"><b>${this.esc(pic ? pic.what : 'A picture no longer in the book')}</b>${pic ? `<br>${this.esc(pic.credit)}` : ''}<br>Picture: <code>${this.esc(id)}</code> · file <code>${this.esc(file)}</code>${page ? `<br>On the page <a class="xl" href="#${this.esc(page)}">${this.esc(this.pageTitle(page))}</a>` : ''}</p></div>`
      : `<p class="cap">No picture chosen. Use the “Report this image” link under the picture, or name it below.</p>`;
    box.innerHTML = `<h3>Your request</h3>${picHtml}<div class="rq">
      <label>What you want done<select class="rq-what"><option>Remove it</option><option>Credit it differently</option><option>Replace it</option><option>Something else</option></select></label>
      <label>Who you are<textarea class="rq-who" rows="2" placeholder="e.g. I designed this flyer / I promoted the night / I am in this photograph"></textarea></label>
      <label>${(id || file) ? 'Anything else' : 'Which picture, and anything else'}<textarea class="rq-more" rows="3" placeholder="For a new credit, the wording you want; for a replacement, what with"></textarea></label>
      <p><a class="sm rq-go" target="_blank" rel="noopener">Open the request</a></p></div>`;
    const go = box.querySelector('.rq-go');
    const update = () => {
      const what = box.querySelector('.rq-what').value, who = box.querySelector('.rq-who').value.trim(), more = box.querySelector('.rq-more').value.trim();
      const title = `Image request: ${what.toLowerCase()} – ${(file.split('/').pop() || id || 'a picture')}`;
      const body = [(id || file) ? `Picture: ${pic ? pic.what : id}` : '', id ? `Image id: ${id}` : '', file ? `File: ${file}` : '', page ? `Page: ${this.base()}#${page}` : '', '', `What I would like done: ${what}`, `Who I am: ${who}`, more ? `Details: ${more}` : ''].filter((l, i) => l || i === 4).join('\n');
      const qs = new URLSearchParams({ title, body }).toString();
      go.href = !c ? `${this.REPO_NEW}?${qs}` : isMail ? `mailto:${c}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}` : /\/issues\/new\/?$/.test(c) ? `${c}?${qs}` : c;
      go.textContent = !c ? 'Open the request on GitHub' : isMail ? 'Write the email' : 'Open the request page';
    };
    box.querySelectorAll('select, textarea').forEach(el => el.addEventListener('input', update)); update();
    if (rem && !rem.dataset.done){ rem.dataset.done = 1; const R = window.RIGHTS_REMOVED || []; rem.innerHTML = R.length ? `<ul>${R.map(r => `<li>${this.esc(r.date)}: ${this.esc(r.what)}</li>`).join('')}</ul>` : '<p class="cap">Nothing has been removed on request yet.</p>'; }
  }
};
window.PageHooks = window.PageHooks || {};
window.PageHooks.rights = () => Rights.build();

/* ---------- bundled flyers, posters and logos (build/club-flyers.json) ---------- */
window.ClubFlyers = {
  all(){ return window.CLUB_FLYERS || []; },
  caption(f){ return f.caption || [f.event, f.date].filter(Boolean).join(', ') || f.kind; },
  creditText(f){ return [f.designer && 'Design: ' + f.designer, f.promoter && 'Promoter: ' + f.promoter, f.source && 'Source: ' + f.source].filter(Boolean).join(' · '); },
  creditHtml(f){ const E = s => Rights.esc(s); const src = E(f.source || '').replace(/(https?:\/\/[^\s&]+)/g, u => `<a class="xl" href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>`); return [f.designer && 'Design: ' + E(f.designer), f.promoter && 'Promoter: ' + E(f.promoter), f.source && 'Source: ' + src].filter(Boolean).join(' · '); },
  granted(f){ return /^granted\b/i.test(f.permission || '') ? 'Permission ' + Rights.esc(f.permission) : ''; },
  item(f){ const cap = Rights.esc(this.caption(f)); const g = this.granted(f);
    return `<figure class="gitem cflyer"><a href="${Rights.esc(f.src)}" target="_blank" rel="noopener" title="Open full size"><img src="${Rights.esc(f.src)}" alt="${cap}" loading="lazy"${f.w && f.h ? ` width="${+f.w}" height="${+f.h}"` : ''}></a><figcaption>${cap}<small>${this.creditHtml(f)}</small>${g ? `<small>${g}</small>` : ''}<small>${Rights.link(f.id, f.src, f.node)}</small></figcaption></figure>`; },
  mount(pageEl, id, isNode){ pageEl.querySelectorAll('.cflyers, .nodelogo').forEach(e => e.remove()); if (!isNode) return; const items = this.all().filter(f => f.node === id); if (!items.length) return;
    const logo = items.find(f => f.kind === 'logo'); const h2 = pageEl.querySelector('h2'); if (logo && h2) h2.insertAdjacentHTML('beforeend', `<img class="nodelogo" src="${Rights.esc(logo.src)}" alt="${Rights.esc(this.caption(logo))}">`);
    const d = document.createElement('div'); d.className = 'cflyers'; const fl = items.filter(f => f.kind !== 'logo');
    d.innerHTML = `<h3>${fl.length ? 'Flyers' : 'Logo'}</h3><p class="cap">Reproduced at reduced size to document what they advertised; tap one for the full size. To have one credited differently or taken down, see <a class="xl" href="#rights">Rights and takedown</a>.</p><div class="ggrid">${[...fl, ...items.filter(f => f.kind === 'logo')].map(f => this.item(f)).join('')}</div>`;
    const facts = pageEl.querySelector('.keyfacts'), grid = pageEl.querySelector('.grid2'); if (facts) facts.after(d); else if (grid) grid.before(d); else pageEl.appendChild(d); },
  /* the Image credits page: one section for every flyer, poster and logo */
  credits(box){ if (box.querySelector('.cflyer-head')) return; const own = this.all(), cc = window.FLYERS || []; if (!own.length && !cc.length) return;
    const head = document.createElement('div'); head.className = 'cflyer-head'; head.style.gridColumn = '1 / -1'; head.innerHTML = `<h3>Flyers, posters and logos</h3><p class="cap">Reproduced at reduced size to document the nights, clubs, labels and festivals they advertised, each credited to its designer, promoter or source where known.</p>`; box.appendChild(head);
    const where = n => (typeof NODE !== 'undefined' && NODE[n]) ? `<a class="xl" href="#${n}">${NODE[n].title}</a>` : Rights.esc(n || '');
    own.forEach(f => { const d = document.createElement('div'); d.className = 'ccard'; const g = this.granted(f); d.innerHTML = `<a href="${Rights.esc(f.src)}" target="_blank" rel="noopener"><img src="${Rights.esc(f.src)}" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:8px" loading="lazy" alt=""></a><h4>${where(f.node)}</h4><div class="meta">${Rights.esc(f.kind)}${f.date ? ' · ' + Rights.esc(f.date) : ''}</div><p>${Rights.esc(this.caption(f))}<br>${this.creditHtml(f)}${g ? `<br>${g}` : ''}<br>${Rights.link(f.id, f.src, f.node)}</p>`; box.appendChild(d); });
    const items = window.Flyers ? Flyers.items() : [];
    items.forEach(it => { const d = document.createElement('div'); d.className = 'ccard'; const stem = String(it.src).split('/').pop().replace(/\.[a-z]+$/i, ''); d.innerHTML = `<img src="${Rights.esc(it.src)}" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:8px" loading="lazy" alt=""><h4>${it.node ? where(it.node) : Rights.esc(it.label || 'Flyer')}</h4><div class="meta">flyer${it.year ? ' · ' + it.year : ''} · ${Rights.esc(it.license)}</div><p>${Rights.esc(it.title)}<br>by ${Rights.esc(it.author)} · <a class="xl" href="${Rights.esc(it.page)}" target="_blank" rel="noopener">source</a>${it.licenseUrl ? ` · <a class="xl" href="${Rights.esc(it.licenseUrl)}" target="_blank" rel="noopener">licence</a>` : ''}<br>${Rights.link(stem, it.src, it.node || 'flyers')}</p>`; box.appendChild(d); });
  }
};
(() => { const prev = window.PageHooks.credits; window.PageHooks.credits = () => { if (prev) prev(); const box = document.getElementById('creditList'); if (box) ClubFlyers.credits(box); }; })();
