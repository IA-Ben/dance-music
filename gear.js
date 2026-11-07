/* Sourced production facts per record: machines, samples, studio — from build/gear.json */
window.Gear = {
  get(id){ return (window.GEAR || {})[id] || null; },
  html(n){
    if (n.type !== 'record' && n.type !== 'set') return '';
    const g = this.get(n.id); if (!g || (!g.machines.length && !g.other_gear.length && !g.samples.length && !g.studio && !g.note)) return '';
    const mk = id => NODE[id] ? `<a class="chip" href="#${id}" style="--c:var(--synth)"><i></i>${NODE[id].title}</a>` : '';
    const rows = [];
    if (g.machines.length || g.other_gear.length) rows.push(`<div class="relrow"><b>made on</b><span><span class="chips" style="display:inline-flex;gap:6px;flex-wrap:wrap">${g.machines.map(mk).join('')}</span>${g.other_gear.length ? `<span class="cap" style="display:block;margin-top:4px">also: ${g.other_gear.join(', ')}</span>` : ''}</span></div>`);
    if (g.samples.length) rows.push(`<div class="relrow"><b>samples</b><span>${g.samples.map(s => `${s.what}${s.from ? ` <span class="cap">— ${s.from}</span>` : ''}`).join('<br>')}</span></div>`);
    if (g.studio) rows.push(`<div class="relrow"><b>recorded at</b><span>${g.studio}</span></div>`);
    const src = (g.sources || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${(s.title || s.url).replace(/^https?:\/\//, '').slice(0, 60)}</a>`).join(' · ');
    return `<h3>In the studio</h3>${g.note ? `<p>${g.note}</p>` : ''}<div class="rels gearbox">${rows.join('')}</div>${src ? `<p class="cap">Sources: ${src}</p>` : ''}`;
  },
  // attach sourced machines as 'uses' relations so they appear in chips, timelines and backlinks
  apply(){ Object.entries(window.GEAR || {}).forEach(([id, g]) => { if (!NODE[id]) return; (g.machines || []).forEach(m => { if (NODE[m]) NODE_PUSH_REL(id, ['uses', m]); }); }); }
};
Gear.apply();
