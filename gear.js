/* Sourced production facts per record: machines, samples, studio — from build/gear.json */
window.Gear = {
  get(id){ return (window.GEAR || {})[id] || null; },
  html(n){
    const g = this.get(n.id); if (!g) return ''; const disp = g.disputes || []; if (!g.machines.length && !g.other_gear.length && !g.samples.length && !g.studio && !g.note && !disp.length) return '';
    const mk = id => NODE[id] ? `<a class="chip" href="#${id}" style="--c:var(--synth)"><i></i>${NODE[id].title}</a>` : '';
    const rows = [];
    if (g.machines.length || g.other_gear.length) rows.push(`<div class="relrow"><b>made on</b><span><span class="chips" style="display:inline-flex;gap:6px;flex-wrap:wrap">${g.machines.map(mk).join('')}</span>${g.other_gear.length ? `<span class="cap" style="display:block;margin-top:4px">also: ${g.other_gear.join(', ')}</span>` : ''}</span></div>`);
    if (g.samples.length) rows.push(`<div class="relrow"><b>samples</b><span>${g.samples.map(s => `${s.what}${s.from ? ` <span class="cap">— ${s.from}</span>` : ''}`).join('<br>')}</span></div>`);
    if (g.studio) rows.push(`<div class="relrow"><b>recorded at</b><span>${g.studio}</span></div>`);
    const cite = s => s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.source}</a>` : `<i>${s.source}</i>`;
    disp.forEach(d => rows.push(`<div class="relrow dispute"><b>accounts differ</b><span><em>${d.what}:</em> ${d.a.claim} <small>— ${cite(d.a)}</small><br><span class="vs">or</span> ${d.b.claim} <small>— ${cite(d.b)}</small></span></div>`));
    const src = (g.sources || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${(s.title || s.url).replace(/^https?:\/\//, '').slice(0, 60)}</a>`).join(' · ');
    return `<h3>In the studio</h3>${g.note ? `<p>${g.note}</p>` : ''}${disp.length ? `<p class="cap">Where the sources disagree the book lists both and does not choose.</p>` : ''}<div class="rels gearbox">${rows.join('')}</div>${src ? `<p class="cap">Sources: ${src}</p>` : ''}`;
  },
  // attach sourced machines as 'uses' relations so they appear in chips, timelines and backlinks
  apply(){ Object.entries(window.GEAR || {}).forEach(([id, g]) => { if (!NODE[id]) return; (g.machines || []).forEach(m => { if (NODE[m]) NODE_PUSH_REL(id, ['uses', m]); }); }); }
};
Gear.apply();

window.PageHooks = window.PageHooks || {};
window.PageHooks.disputes = () => { const box = document.getElementById('disputeList'); if (!box || box.dataset.done) return; box.dataset.done = 1;
  const cite = s => s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.source}</a>` : `<i>${s.source}</i>`;
  const items = Object.entries(window.GEAR || {}).filter(([id, g]) => g.disputes && g.disputes.length && NODE[id]).sort((a, b) => (yrsOf(NODE[a[0]]) || [0])[0] - (yrsOf(NODE[b[0]]) || [0])[0]);
  box.innerHTML = items.map(([id, g]) => g.disputes.map(d => `<div class="card dcard"><h3><a class="xl" href="#${id}">${NODE[id].title}</a> <small class="cap">· ${NODE[id].years || ''}</small></h3><p><b>${d.what}:</b> ${d.a.claim} <small class="cap">— ${cite(d.a)}</small></p><p><span class="vs cap">or</span> ${d.b.claim} <small class="cap">— ${cite(d.b)}</small></p></div>`).join('')).join('');
};
