window.GALLERY_INDEX = {"v":"cedfa157","p":{"access-virus":1,"ade":1,"afrikaburn":1,"ageha":1,"akai-s1000":1,"akai-s900":1,"alpha-juno":1,"amnesia":1,"anjuna":1,"atari-cubase":1,"audioriver":1,"awakenings":1,"bagleys":1,"bass-station":1,"bbc-radiophonic-workshop":1,"berghain":1,"berlin":1,"bestival":1,"big-chill":1,"big-day-out":1,"birmingham":1,"boom":1,"bpm-festival":1,"brighton":1,"brixton-academy":1,"burning-man":1,"cafe-mambo":1,"casio-cz":1,"circuit-festival":1,"cologne":1,"commodore-amiga":2,"creamfields":2,"cubase-vst":2,"curlies":2,"cyberdog":2,"czechtek":2,"dance-valley":2,"defqon1":2,"disco-valley":2,"distant-heat":2,"djakarta-warehouse-project":2,"dreamscape":2,"dx7":2,"e-werk":2,"edc-mexico":2,"efx500":2,"electric-daisy-carnival":2,"electric-forest":2,"electric-zoo":2,"emulator":2,"estereo-picnic":2,"eurorack":2,"fabric":2,"field-day":2,"frankfurt":2,"fusion-festival":2,"garageband":2,"glastonbury-festival":2,"goa":2,"golden-pudel":2,"h4":3,"h8":3,"hard-wax":3,"heaven":3,"hh3":3,"homelands":3,"ibiza":3,"jewels-catch-one":3,"jp8000":3,"juno60":3,"jupiter8":3,"kablys":3,"kappa-futurfestival":3,"kazantip":3,"korg-m1":3,"korg-ms":3,"ku":3,"law-mdma":3,"liverpool":3,"london":3,"manchester":3,"medusa-festival":3,"metropol-berlin":3,"minimoog":3,"ministry-of-sound":3,"moga-festival":3,"monegros-desert-festival":3,"moog":3,"mpc":3,"mysteryland":3,"nature-one":4,"nightingale-birmingham":4,"nottingham":4,"nyc-downlow":4,"ortofon-concorde":4,"ozora":4,"pacha":4,"pioneer-dvj":4,"press-ra":4,"printworks":4,"pro-tools":4,"pure-data":4,"q-dance":4,"qlimax":4,"rave-the-planet":4,"roxy":4,"schwuz":4,"secret-garden-party":4,"sh101":4,"shambala":4,"sheffield":4,"shop-hard-wax":4,"soundstorm":4,"sp1200":4,"space":4,"stereosonic":4,"stockholm":4,"stonewall-inn":4,"street-parade":4,"sunburn":4,"supercollider":5,"tb303":5,"technics-sh-dj1200":5,"technics-sldz1200":5,"technics-sp10":5,"the-end":5,"the-saint-new-york":5,"tidalcycles":5,"time-warp":5,"tokyo":5,"tomorrowland":5,"tr606":5,"tr707":5,"tr8":5,"tr909":5,"traktor":5,"traktor-kontrol-s4":5,"trance-energy":5,"tresor":5,"turnmills":5,"ultra-europe":5,"ultra-music-festival":5,"untold":5,"urei-1620":5,"ushuaia":5,"winter-music-conference":5,"womb":5,"wonderfruit":5,"xone92":5,"y1997":5,"y2001":6,"y2005":6,"y2007":6,"y2009":6,"y2016":6,"y2017":6,"y2019":6,"y2024":6,"y2025":6,"zoukout":6}};
/* ===================================================================
   GALLERIES — on the web edition, a page can show a strip of Creative
   Commons photographs from Wikimedia Commons, with credits, in a
   lightbox. Only vetted pictures are shown: each page's list was
   searched once, filtered, and every picture looked at before it was
   allowed (pipeline: /tmp/mw/gal.py, review kit /tmp/deep2/GALLERY-REVIEW.md,
   merge /tmp/deep2/tools/gallery_merge.py → build/gallery-vetted.json).
   Nothing is searched in the reader's browser. A page with no vetted
   entry shows no strip. SITE.galleries is the on/off switch.
   The build (build/assemble.py) bundles build/gallery-vetted.json as
   window.GALLERY_INDEX (page id → shard number, below) and the shards
   site/gallery-<n>.js, loaded on demand with a <script> tag (works from
   file:// too); each shard calls Gallery.got(n, {pageId: [items]}).
   Item: { title, thumb, url, page, lic, licUrl, author, desc, w, h, caption? }
   =================================================================== */
window.Gallery = {
  data: {}, waiting: {},
  enabled(){ return !!(window.SITE && SITE.galleries); },
  idx(){ return window.GALLERY_INDEX || { v: '', p: {} }; },
  esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); },
  has(id){ return !!this.idx().p[id]; },
  load(shard, cb){
    if (this.data[shard]) return cb(this.data[shard]);
    const w = this.waiting[shard] = this.waiting[shard] || []; w.push(cb); if (w.length > 1) return;
    const s = document.createElement('script'); s.src = 'gallery-' + shard + '.js' + (this.idx().v ? '?v=' + this.idx().v : ''); s.async = true;
    s.onerror = () => { const q = this.waiting[shard] || []; delete this.waiting[shard]; q.forEach(f => f(null)); };
    document.head.appendChild(s);
  },
  got(shard, d){ this.data[shard] = d; const q = this.waiting[shard] || []; delete this.waiting[shard]; q.forEach(f => f(d)); },
  /* the vetted picture with this file, among the shards already loaded (for the Rights page) */
  findFile(file){ const b = String(file || '').split('/').pop(); if (!b) return null; for (const d of Object.values(this.data)) for (const [p, list] of Object.entries(d || {})) for (const it of list) if (String(it.url).split('/').pop() === b) return Object.assign({ pageId: p }, it); return null; },
  mount(pageEl, id, isNode){ pageEl.querySelectorAll('.gallery').forEach(g => g.remove()); if (!this.enabled()) return; const shard = this.idx().p[id]; if (!shard) return;
    const box = document.createElement('div'); box.className = 'gallery'; box.innerHTML = `<h3>Pictures</h3><p class="cap" style="margin-bottom:8px">Photographs from Wikimedia Commons under Creative Commons licences or in the public domain, each checked against this page before it was added, with their credits. Click one to see it large.</p><div class="ggrid"></div>`;
    const nav = pageEl.querySelector('.margin-note') || pageEl.querySelector('.pagenav'); if (nav) pageEl.insertBefore(box, nav); else pageEl.appendChild(box);
    const go = () => this.load(shard, d => { const items = d && d[id]; if (!items || !items.length || !box.isConnected){ box.remove(); return; } this.render(box, items, id); });
    if ('IntersectionObserver' in window){ const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ io.disconnect(); go(); } }, { rootMargin: '300px 0px' }); io.observe(box); } else go(); },
  label(it){ return it.caption || String(it.title || '').replace(/^File:/, '').replace(/\.(jpe?g|png|tiff?|webp)$/i, '').replace(/_/g, ' '); },
  render(box, items, id){ const E = s => this.esc(s); items = items.map(it => Object.assign({ rid: 'gallery:' + id, node: id }, it));
    box.querySelector('.ggrid').innerHTML = items.map((it, i) => `<figure class="gitem" data-i="${i}"><img src="${E(it.thumb)}" alt="${E(this.label(it))}" loading="lazy"${it.w && it.h ? ` width="${+it.w}" height="${+it.h}"` : ''}><figcaption>${E(this.label(it).slice(0, 80))}<small>${E(it.author)} · ${E(it.lic)}</small></figcaption></figure>`).join('');
    box.querySelectorAll('.gitem').forEach(f => f.onclick = () => this.lightbox(items, +f.dataset.i)); },
  lightbox(items, i){ const E = s => this.esc(s); let lb = document.getElementById('lightbox'); if (!lb){ lb = document.createElement('div'); lb.id = 'lightbox'; document.body.appendChild(lb); } const it = items[i];
    const commons = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(.)\/(..)\//.test(it.url || ''); const big = commons ? it.url.replace(/\/commons\/(.)\/(..)\//, '/commons/thumb/$1/$2/') + '/1600px-' + it.url.split('/').pop() : it.url;
    const file = it.url || it.src || ''; const rid = it.rid || String(file).split('/').pop().replace(/\.[a-z]+$/i, ''); const report = it.reportHtml != null ? ' · ' + it.reportHtml : window.Rights ? ' · ' + Rights.link(rid, file, it.node || '') : '';   /* reportHtml: fixed markup from the caller (the readers' margin), never reader data */
    const desc = it.caption ? it.caption : it.desc;
    lb.innerHTML = `<div class="lbin"><img src="${E(commons && it.w > 1600 ? big : it.url)}" alt="${E(this.label(it))}"><div class="lbcap"><b>${E(this.label(it))}</b><span>${desc && desc !== this.label(it) ? E(desc) + ' · ' : ''}${E(it.author)} · <a href="${E(it.licUrl || it.page)}" target="_blank" rel="noopener">${E(it.lic)}</a>${it.page ? ` · <a href="${E(it.page)}" target="_blank" rel="noopener">${commons ? 'Wikimedia Commons' : 'source'}</a>` : ''}${report}</span></div><div class="lbnav"><button class="sm lbprev" aria-label="previous picture">‹</button><span>${i + 1} / ${items.length}</span><button class="sm lbnext" aria-label="next picture">›</button><button class="sm lbclose">close</button></div></div>`;
    lb.classList.add('show'); lb.onclick = e => { if (e.target === lb) lb.classList.remove('show'); }; lb.querySelector('.lbclose').onclick = () => lb.classList.remove('show'); if (typeof it.wire === 'function') it.wire(lb);
    const rep = lb.querySelector('a.report'); if (rep) rep.addEventListener('click', () => lb.classList.remove('show'));
    lb.querySelector('.lbprev').onclick = () => this.lightbox(items, (i - 1 + items.length) % items.length); lb.querySelector('.lbnext').onclick = () => this.lightbox(items, (i + 1) % items.length);
    document.onkeydown = e => { if (!lb.classList.contains('show')) return; if (e.key === 'Escape') lb.classList.remove('show'); if (e.key === 'ArrowRight') this.lightbox(items, (i + 1) % items.length); if (e.key === 'ArrowLeft') this.lightbox(items, (i - 1 + items.length) % items.length); }; }
};
