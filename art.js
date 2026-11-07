/* ===================================================================
   ART — the linocut plates that open each strand (made with Krea for
   this book: black ink and one fluorescent ink per strand, no real
   people, no logos). Placed at the top of each strand's first chapter.
   =================================================================== */
window.Art = {
  MAP: { timeline: 'years', h0: 'techno', house0: 'house', r0: 'rave', j0: 'jungle', t0: 'trance', k0: 'tech', l0: 'law', i0: 'ibiza', go0: 'goa', a0: 'anatomy', mixer: 'mixer', orb0: 'm25', lp0: 'lovepar', det0: 'detroit', chi0: 'chicago', ny0: 'newyork', floor: 'floor' },
  ALT: {
    years: 'A road running through forty years of nights: a warehouse, a field with lasers, a beach, a club queue, a festival stage, a dark club.',
    techno: 'A lone dancer in a pool of strobe light between silent machines in an empty car factory.',
    house: 'A basement dance floor from above: dancers in a circle around one spinning dancer under a mirror ball.',
    rave: 'Dawn over a field after an all-night party: a crowd on a hill, lasers in the mist, a speaker stack, cars along the hedge.',
    jungle: 'A home-made radio aerial on a tower-block roof, its cable running down to one lit window.',
    trance: 'Thousands of raised hands under laser beams converging on one point of light.',
    tech: 'Vintage electronic music machines on a table under a desk lamp, patch cables everywhere.',
    law: 'Police cars with flashing lights blocking a country lane at night, a queue of cars behind, a party glowing beyond the trees.',
    ibiza: 'A whitewashed hilltop town above a harbour at sunset, dancers on a terrace by the sea.',
    goa: 'A palm beach at night under a full moon, ultraviolet backdrops between the palms, a speaker stack on the sand.',
    anatomy: 'A loudspeaker with sound rising from it in layers like rock strata.',
    mixer: 'Two hands on a DJ mixer between two spinning records.',
    m25: 'Headlight trails on an orbital motorway at night, a line of cars turning off towards a lit tent in a field.',
    lovepar: 'A boulevard packed with dancers and slow trucks of speakers, a golden winged column at the end of the avenue.',
    detroit: 'An industrial city avenue at dusk: a railway station tower, car-plant chimneys, one lit window above a record shop.',
    chicago: 'An elevated train over a city street at night above brick buildings.',
    newyork: 'A loft party at night: balloons on the ceiling, a stack of speakers, dancers against windows over rooftop water towers.',
    floor: 'Inside a crowd on a dance floor: raised arms, turned heads, strobes and smoke.'
  },
  CREDIT: 'Linocut-style illustration made with Krea for this book',
  html(k, cls) {
    return `<figure class="art-hero${cls ? ' ' + cls : ''}"><img src="img/art/${k}-1376.webp" srcset="img/art/${k}-720.webp 720w, img/art/${k}-1376.webp 1376w" sizes="(max-width: 700px) 100vw, 1100px" width="1376" height="768" alt="${this.ALT[k] || ''}" loading="lazy" decoding="async"><figcaption>${this.CREDIT}</figcaption></figure>`;
  },
  mount(el, id) {
    const k = this.MAP[id]; if (!k || !el || el.querySelector('.art-hero')) return;
    const at = el.querySelector(':scope > .kicker') || el.querySelector(':scope > h2');
    const tmp = document.createElement('div'); tmp.innerHTML = this.html(k, el.querySelector(':scope > .hero-img') ? 'banner' : '');
    if (at) el.insertBefore(tmp.firstChild, at); else el.prepend(tmp.firstChild);
  }
};

/* the credits page lists the plates too */
(() => { const prev = (window.PageHooks || {}).credits; window.PageHooks = window.PageHooks || {};
  window.PageHooks.credits = () => { if (prev) prev(); const box = document.getElementById('creditList'); if (!box || box.querySelector('.art-credits')) return;
    const d = document.createElement('div'); d.className = 'art-credits'; d.style.gridColumn = '1 / -1';
    d.innerHTML = `<h3>Illustrations</h3><p class="cap">The linocut-style plates that open the strands and the cover were made for this book with Krea, an AI image generator: black ink and one fluorescent ink per strand. They show invented scenes and no real people, logos or record sleeves. Labelled on each page.</p><div class="art-thumbs">${Object.entries(Art.MAP).map(([id, k]) => `<a href="#${id}" title="${Art.ALT[k] || ''}"><img src="img/art/${k}-720.webp" alt="${Art.ALT[k] || ''}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px"></a>`).join('')}</div>`;
    box.prepend(d); };
})();
