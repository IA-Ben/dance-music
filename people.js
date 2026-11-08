/* Key-facts cards for every node type, from build/*-facts.json merged into window.FACTS */
window.People = {
  LABELS: {
    person: [['born', 'born'], ['from', 'from'], ['aliases', 'also known as'], ['groups', 'groups'], ['labels', 'labels'], ['residencies', 'residencies'], ['radio', 'radio'], ['records', 'key records'], ['active', 'active']],
    club: [['address', 'address'], ['opened', 'opened'], ['closed', 'closed'], ['capacity', 'capacity'], ['sound', 'sound system'], ['owners', 'owners'], ['residents', 'residents'], ['nights', 'nights'], ['status', 'status']],
    event: [['type', 'type'], ['founded', 'founded'], ['founders', 'founders'], ['venues', 'venues'], ['attendance', 'attendance'], ['residents', 'residents'], ['editions', 'famous editions'], ['status', 'status']],
    collective: [['type', 'type'], ['founded', 'founded'], ['founders', 'founders'], ['venues', 'venues'], ['residents', 'members and residents'], ['editions', 'famous editions'], ['status', 'status']],
    label: [['founded', 'founded'], ['city', 'city'], ['founders', 'founders'], ['sublabels', 'sublabels'], ['key_releases', 'key releases'], ['status', 'status']],
    station: [['frequency', 'frequency'], ['area', 'area'], ['years', 'years'], ['founders', 'founders'], ['djs', 'DJs and shows'], ['raids', 'raids'], ['status', 'status']],
    record: [['label', 'label'], ['catno', 'catalogue no.'], ['released', 'released'], ['formats', 'formats'], ['producers', 'producers'], ['remixes', 'remixes'], ['charts', 'chart peaks'], ['reissues', 'reissues']],
    set: [['label', 'released on'], ['catno', 'catalogue no.'], ['released', 'released'], ['formats', 'formats'], ['charts', 'chart peaks'], ['reissues', 'reissues']],
    shop: [['address', 'address'], ['opened', 'opened'], ['closed', 'closed'], ['founders', 'founders'], ['staff', 'behind the counter'], ['label', 'label that grew from it'], ['status', 'status']],
    press: [['founded', 'founded'], ['closed', 'closed'], ['founders', 'founders'], ['editors', 'editors'], ['notable', 'notable'], ['status', 'status']],
    sound: [['founded', 'founded'], ['people', 'people'], ['technique', 'the idea'], ['installs', 'installs'], ['status', 'status']],
    law: [['date', 'date'], ['jurisdiction', 'jurisdiction'], ['what_it_did', 'what it did'], ['status', 'status']],
    city: [['country', 'country'], ['first_room', 'first room'], ['first_record', 'first record'], ['sound', 'the sound'], ['peak', 'peak years'], ['shops', 'shops'], ['radio', 'radio'], ['now', 'now']],
    machine: [['maker', 'maker'], ['designer', 'designer'], ['released', 'released'], ['discontinued', 'discontinued'], ['launch_price', 'launch price'], ['units', 'units made'], ['type', 'type'], ['notable_users', 'notable users'], ['clones', 'clones and reissues']],
    genre: [['emerged', 'emerged'], ['named_by', 'named by'], ['first_records', 'first records'], ['tempo', 'tempo'], ['peak', 'peak'], ['rooms', 'rooms'], ['branches', 'branches']]
  },
  fmt(v){ if (v == null || v === '' || (Array.isArray(v) && !v.length)) return null; if (Array.isArray(v)) return v.join(' · '); if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k}: <b>${x}</b>`).join(' · '); return String(v); },
  html(n){
    const f = (window.FACTS || {})[n.id]; const L = this.LABELS[n.type]; if (!f || !L) return '';
    const rows = L.map(([k, lab]) => { const v = this.fmt(f[k]); return v ? `<div class="relrow"><b>${lab}</b><span>${v}</span></div>` : ''; }).join('');
    return rows ? `<div class="card keyfacts"><h3>Key facts</h3><div class="rels">${rows}</div>${f.chart_source ? `<p class="cap">Chart peaks: ${f.chart_source}</p>` : ''}</div>` : '';
  }
};
/* charts page */
window.PageHooks = window.PageHooks || {};
window.PageHooks.charts = () => { const box = document.getElementById('chartsTable'); if (!box || box.dataset.done) return; box.dataset.done = 1;
  const rows = Object.entries(window.FACTS || {}).filter(([id, f]) => f.charts && Object.keys(f.charts).length && NODE[id]).map(([id, f]) => ({ id, n: NODE[id], c: f.charts, y: (yrsOf(NODE[id]) || [0])[0] })).sort((a, b) => a.y - b.y);
  const cols = ['UK Singles', 'UK Dance', 'US Hot Dance Club', 'US Hot 100', 'Germany', 'Netherlands', 'Belgium'];
  const other = r => Object.entries(r.c).filter(([k]) => !cols.includes(k)).map(([k, v]) => `${k} ${v}`).join(', ');
  box.innerHTML = `<table class="charts"><thead><tr><th>Year</th><th>Record</th>${cols.map(c => `<th>${c.replace('US Hot Dance Club', 'US Dance').replace('US Hot 100', 'US Hot 100')}</th>`).join('')}<th>Other</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.y || ''}</td><td><a class="xl" href="#${r.id}">${r.n.title}</a></td>${cols.map(c => `<td class="${r.c[c] === 1 ? 'one' : r.c[c] <= 10 ? 'ten' : ''}">${r.c[c] != null ? r.c[c] : ''}</td>`).join('')}<td class="cap">${other(r)}</td></tr>`).join('')}</tbody></table><p class="cap">${rows.length} records with a sourced chart peak. Peaks from the Official Charts Company, Billboard and national chart archives as cited on each record's page; blanks mean no sourced placing, not "did not chart".</p>`;
};
/* index pages for shops, press, sound systems */
const indexPage = (type, elId) => () => { const box = document.getElementById(elId); if (!box || box.dataset.done) return; box.dataset.done = 1;
  const items = NODES.filter(n => n.type === type).sort((a, b) => ((NODE[a.city] || {}).title || '').localeCompare((NODE[b.city] || {}).title || '') || (yrsOf(a) || [0])[0] - (yrsOf(b) || [0])[0]);
  const byCity = {}; items.forEach(n => { const c = n.city && NODE[n.city] ? NODE[n.city].title : 'Everywhere'; (byCity[c] = byCity[c] || []).push(n); });
  box.innerHTML = Object.entries(byCity).map(([c, ns]) => `<h3>${c}</h3><div class="icards">${ns.map(n => `<a class="icard" href="#${n.id}" style="--c:var(${TYPE_COLOR[n.type]})"><b>${n.title}</b><small>${n.years || ''}</small><p>${n.blurb}</p></a>`).join('')}</div>`).join('');
};
window.PageHooks.shops = indexPage('shop', 'shopsIndex'); window.PageHooks.press = indexPage('press', 'pressIndex'); window.PageHooks.sound = indexPage('sound', 'soundIndex');
