// Labs 3-5 widgets: Power BI workflow and interactivity, data storytelling.
import { bench, on, seg, setSeg, scale, fmt, esc, yGrid, xAxis, reduced } from '../viz.js';
import { sorter } from './w-foundations.js';
import { recordScore } from '../store.js';

export function cases(el) {
  sorter(el, {
    id: 'lab3-cases', icon: 'buildings', title: 'Match the Power BI case study', cols: 300,
    options: ['Metro Bank', 'Heathrow Airport', 'Univ. of Phoenix', 'Egypt Healthcare Authority', 'Marriott'],
    items: [
      { t: 'Manual data entry made financial reports slow and error-prone. Automated reporting cut reporting time and raised accuracy.', a: 'Metro Bank' },
      { t: 'Congestion at peak travel times. Real-time dashboards on passenger flow reduced wait times.', a: 'Heathrow Airport' },
      { t: 'No central view of academic data; hard to spot at-risk students. Dashboards tracked performance and engagement in real time.', a: 'Univ. of Phoenix' },
      { t: 'Monitoring hospitals under the Comprehensive Health Insurance System: patient volumes, referrals, occupancy, medicine availability. 22+ million visits monitored.', a: 'Egypt Healthcare Authority' },
      { t: 'Guest data from many sources, hard to personalize. A full view of guest preferences raised satisfaction and loyalty.', a: 'Marriott' },
    ].map(i => ({ ...i, why: '' })),
  });
}

// ---------- Power Query emulator ----------
const PQROWS = [
  ['EMP0001', '32', 'F', 'HR', 'Hybrid', 'Medium'], ['EMP0002', '40', 'Female', 'Data Scientist', 'Remote', 'Medium'],
  ['EMP0003', '59', 'F', 'Software Engineer', 'Hybrid', 'Medium'], ['EMP0004', '27', 'Male', 'Software Engineer', 'Onsite', 'High'],
  ['EMP0005', '49', 'Male', 'Sales', 'Onsite', 'High'], ['EMP0006', '59', 'F', 'Sales', 'Hybrid', 'High'],
  ['EMP0007', '31', 'M', 'Sales', 'Remote', 'Low'], ['EMP0008', '42', 'F', 'Data Scientist', 'Onsite', 'Medium'],
];
const PQSTEPS = [
  ['type', 'Changed Type', 'Age: Text → Whole Number'],
  ['f', 'Replaced Value', 'Gender: "F" → "Female"'],
  ['m', 'Replaced Value1', 'Gender: "M" → "Male"'],
];
export function powerquery(el) {
  const done = new Set(); let loaded = false;
  const render = () => {
    const g = { Female: 1274 + (done.has('f') ? 1214 : 0), Male: 1270 + (done.has('m') ? 1242 : 0), ...(done.has('m') ? {} : { M: 1242 }), ...(done.has('f') ? {} : { F: 1214 }) };
    const mx = Math.max(...Object.values(g));
    const rows = PQROWS.map(r => [r[0], r[1], done.has('f') && r[2] === 'F' ? 'Female' : done.has('m') && r[2] === 'M' ? 'Male' : r[2], r[3], r[4], r[5]]);
    el.innerHTML = `${bench('funnel-simple', 'Power Query Editor (emulated)', 'Impact_of_Remote_Work_on_Mental_Health.csv · real values')}
    <div class="bench-body">
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:16px" class="pq">
        <div>
          <div class="tbl-wrap"><table class="tbl"><tr>${['Employee_ID', `<span class="mono">${done.has('type') ? '1²3' : 'ABC'}</span> Age`, 'Gender', 'Job_Role', 'Work_Location', 'Stress_Level'].map(h => `<th>${h}</th>`).join('')}</tr>
          ${rows.map((r, i) => `<tr>${r.map((c, j) => `<td class="${j === 1 ? 'num' : ''} ${j === 2 && PQROWS[i][2] !== c ? 'cell-fix' : j === 2 && (c === 'F' || c === 'M') ? 'cell-bad' : ''}" ${j === 1 ? `style="text-align:${done.has('type') ? 'right' : 'left'}"` : ''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>
          <div style="margin-top:14px"><div class="small muted" style="margin-bottom:6px">Column distribution: Gender (all 5,000 rows)</div>
            <svg class="viz" viewBox="0 0 520 ${Object.keys(g).length * 26 + 6}">${Object.entries(g).map(([k, v], i) => `<text x="70" y="${i * 26 + 18}" text-anchor="end" class="lbl-strong">${k}</text><rect x="78" y="${i * 26 + 4}" width="${(v / mx) * 360}" height="18" rx="3" fill="${k.length === 1 ? 'var(--bad)' : 'var(--context)'}" style="transition:width .6s var(--ease)"/><text x="${84 + (v / mx) * 360}" y="${i * 26 + 18}" class="num">${v.toLocaleString()}</text>`).join('')}</svg></div>
        </div>
        <div style="border-left:1px solid var(--line);padding-left:14px">
          <div class="small" style="font-weight:600;margin-bottom:8px">Applied steps</div>
          <ol style="margin:0;padding-left:18px;font-size:14px;line-height:1.9"><li>Source</li><li>Promoted Headers</li>${PQSTEPS.filter(s => done.has(s[0])).map(s => `<li style="animation:viewIn .35s var(--ease)">${s[1]}</li>`).join('')}</ol>
          <div class="small" style="font-weight:600;margin:14px 0 8px">Transform</div>
          <div style="display:flex;flex-direction:column;gap:6px">${PQSTEPS.map(([k, , d]) => `<button class="btn sm" data-s="${k}" ${done.has(k) ? 'disabled' : ''}>${d}</button>`).join('')}
            <button class="btn sm primary" data-load style="margin-top:6px"><i class="ph ph-floppy-disk"></i>Close &amp; Apply</button></div>
        </div>
      </div>
      <div class="explain">${loaded ? (done.size === 3 ? '<strong>Loaded clean.</strong> Gender now has 2 categories (Female 2,488, Male 2,512). Every visual built on it will be correct.' : `<strong>Loaded with problems.</strong> A pie of Gender would show 4 slices, and "female" employees would be split across F and Female. Fix it in Power Query, not in each chart.`) : 'The raw file spells gender four ways. Each Power Query step is recorded and re-applied automatically on every refresh: that is a reusable Transform stage.'}</div>
    </div>`;
  };
  on(el, '[data-s]', 'click', (e, b) => { done.add(b.dataset.s); loaded = false; render(); });
  on(el, '[data-load]', 'click', () => { loaded = true; render(); });
  render();
}

// ---------- API JSON expand ----------
const WEATHER = { coord: { lon: 31.25, lat: 30.06 }, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }], main: { temp: 31.4, feels_like: 30.2, temp_min: 30.1, temp_max: 32.0, pressure: 1011, humidity: 38 }, wind: { speed: 4.6, deg: 340 }, name: 'Cairo', cod: 200 };
export function api(el) {
  const ex = new Set();
  const render = () => {
    const cols = [['name', WEATHER.name]];
    if (ex.has('main')) cols.push(['main.temp', WEATHER.main.temp], ['main.humidity', WEATHER.main.humidity]);
    else cols.push(['main', '<span class="chip">Record</span>']);
    if (ex.has('weather')) cols.push(['weather.description', WEATHER.weather[0].description]);
    else cols.push(['weather', '<span class="chip">List</span>']);
    const ready = ex.has('main') && ex.has('weather');
    el.innerHTML = `${bench('cloud-sun', 'Get Data → Web: Cairo weather', 'Expand the nested JSON')}
    <div class="bench-body">
      <pre class="code" style="font-size:12px">GET https://api.openweathermap.org/data/2.5/weather?q=Cairo&amp;appid=<span class="k">YOUR_KEY</span>&amp;units=metric\n${esc(JSON.stringify(WEATHER, null, 1)).replace(/\n/g, '\n').slice(0, 520)}…</pre>
      <div class="chips" style="margin:6px 0 12px"><button class="chip" data-x="main" aria-pressed="${ex.has('main')}">Expand main → temp, humidity</button><button class="chip" data-x="weather" aria-pressed="${ex.has('weather')}">Expand weather (List → Record) → description</button></div>
      <div class="tbl-wrap"><table class="tbl"><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr><tr>${cols.map(c => `<td>${c[1]}</td>`).join('')}</tr></table></div>
      ${ready ? `<div class="three" style="margin-top:14px;animation:viewIn .5s var(--ease)">
        <div class="dash-tile"><h5>Card: Temperature</h5><div class="big">${WEATHER.main.temp}°C</div></div>
        <div class="dash-tile"><h5>Gauge: Humidity</h5><svg viewBox="0 0 120 64" style="width:120px"><path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--line)" stroke-width="10"/><path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--accent-viz)" stroke-width="10" stroke-dasharray="${Math.PI * 50}" stroke-dashoffset="${Math.PI * 50 * (1 - WEATHER.main.humidity / 100)}"/><text x="60" y="58" text-anchor="middle" style="font:600 14px var(--mono);fill:var(--ink)">${WEATHER.main.humidity}%</text></svg></div>
        <div class="dash-tile"><h5>Table</h5><div class="small">${WEATHER.name} · ${WEATHER.weather[0].description} · wind ${WEATHER.wind.speed} m/s</div></div></div>` : ''}
      <div class="explain">${ready ? 'Done: Card for a single number, Gauge for a value against a range, Table for details. The API key in a real report belongs in a parameter, not pasted into a shared file.' : 'APIs return nested JSON. Power BI shows nested objects as <strong>Record</strong> and arrays as <strong>List</strong>; you expand them into columns. Values shown are illustrative.'}</div>
    </div>`;
  };
  on(el, '[data-x]', 'click', (e, b) => { ex.has(b.dataset.x) ? ex.delete(b.dataset.x) : ex.add(b.dataset.x); render(); });
  render();
}

// ---------- Merge queries ----------
const ORD = [[1001, 'C1', 250], [1002, 'C2', 90], [1003, 'C1', 40], [1004, 'C4', 310]];
const CUS = [['C1', 'Mona', 'Cairo'], ['C2', 'Omar', 'Giza'], ['C3', 'Sara', 'Alexandria']];
const JOINS = {
  left: ['Left outer', 'All rows from Orders, matching rows from Customers', 'l'],
  right: ['Right outer', 'All rows from Customers, matching rows from Orders', 'r'],
  full: ['Full outer', 'All rows from both', 'lr'],
  inner: ['Inner', 'Only matching rows', 'i'],
  lanti: ['Left anti', 'Rows only in Orders', 'la'],
  ranti: ['Right anti', 'Rows only in Customers', 'ra'],
};
export function merge(el) {
  let j = 'left';
  const render = () => {
    const out = [];
    if (['left', 'full', 'inner', 'lanti'].includes(j)) ORD.forEach(o => { const c = CUS.find(c => c[0] === o[1]); if (j === 'inner' && !c) return; if (j === 'lanti' && c) return; out.push([o[0], o[1], o[2], c ? c[1] : null, c ? c[2] : null]); });
    if (['right', 'full', 'ranti'].includes(j)) CUS.forEach(c => { const os = ORD.filter(o => o[1] === c[0]); if (j === 'ranti' && os.length) return; if (j === 'right' && os.length) os.forEach(o => out.push([o[0], o[1], o[2], c[1], c[2]])); if (!os.length) out.push([null, c[0], null, c[1], c[2]]); });
    const v = JOINS[j][2], A = v.includes('l') || v === 'i' || v === 'la', B = v.includes('r') || v === 'i';
    const fillL = v === 'l' || v === 'lr' || v === 'la', fillR = v === 'r' || v === 'lr' || v === 'ra', fillI = v !== 'la' && v !== 'ra';
    el.innerHTML = `${bench('git-merge', 'Merge Queries: Orders ⋈ Customers on CustomerID', 'Pick a join kind')}
    <div class="bench-body">
      <div class="controls">${seg(Object.entries(JOINS).map(([k, [l]]) => [k, l]), j)}</div>
      <div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;align-items:center" class="mergegrid">
        <svg viewBox="0 0 150 100" aria-hidden="true"><defs><clipPath id="cA"><circle cx="58" cy="50" r="38"/></clipPath></defs>
          <circle cx="58" cy="50" r="38" fill="${fillL ? 'var(--accent-viz)' : 'var(--sunken)'}" opacity=".85"/><circle cx="92" cy="50" r="38" fill="${fillR ? 'var(--accent-viz)' : 'var(--sunken)'}" opacity=".85"/>
          <circle cx="92" cy="50" r="38" clip-path="url(#cA)" fill="${fillI ? 'var(--accent-viz)' : 'var(--sunken)'}"/>
          <circle cx="58" cy="50" r="38" fill="none" stroke="var(--ink-2)"/><circle cx="92" cy="50" r="38" fill="none" stroke="var(--ink-2)"/>
          <text x="34" y="54" style="font:600 11px var(--font);fill:var(--ink)">Orders</text><text x="96" y="54" style="font:600 11px var(--font);fill:var(--ink)">Cust.</text></svg>
        <div class="tbl-wrap"><table class="tbl"><tr><th>OrderID</th><th>CustomerID</th><th>Amount</th><th>Name</th><th>City</th></tr>
          ${out.map(r => `<tr style="animation:viewIn .3s var(--ease)">${r.map((c, i) => `<td class="${i !== 3 && i !== 4 ? 'num' : ''} ${c === null ? 'cell-bad' : ''}">${c === null ? 'null' : c}</td>`).join('')}</tr>`).join('')}</table></div>
      </div>
      <div class="explain"><strong>${JOINS[j][0]}:</strong> ${JOINS[j][1]}. Order 1004 has customer C4, who is not in Customers; customer C3 (Sara) has no orders. Watch where the <span class="cell-bad">nulls</span> appear. Left outer is Power BI's default.</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { j = b.dataset.v; render(); });
  render();
}

// ---------- Drill down & drill through ----------
const HIER = {
  Technology: { Phones: { 'Galaxy S24': 96, 'iPhone 15': 128, 'Pixel 8': 41 }, Accessories: { 'USB-C hub': 22, Headphones: 47, Keyboard: 18 }, Machines: { 'Laser printer': 58, Scanner: 14 } },
  Furniture: { Chairs: { 'Office chair': 74, 'Stool': 12 }, Tables: { 'Desk': 66, 'Side table': 9 }, Bookcases: { 'Tall bookcase': 31 } },
  'Office Supplies': { Binders: { 'Ring binder': 19, 'Lever arch': 11 }, Paper: { 'A4 ream': 27 }, Storage: { 'Archive box': 23, 'Drawer unit': 16 } },
};
const sumTree = n => typeof n === 'number' ? n : Object.values(n).reduce((a, v) => a + sumTree(v), 0);
export function drill(el) {
  let path = [], detail = null;
  const render = () => {
    const node = path.reduce((n, k) => n[k], HIER), level = ['Category', 'Sub-Category', 'Product Name'][path.length];
    const items = Object.entries(node).map(([k, v]) => [k, sumTree(v)]).sort((a, b) => b[1] - a[1]), mx = Math.max(...items.map(i => i[1]));
    const leaf = path.length === 2;
    if (detail) {
      const sales = HIER[path[0]][path[1]][detail];
      el.innerHTML = `${bench('arrow-square-out', 'Page: Product Details', 'Drill through filter: Product Name = ' + esc(detail))}
      <div class="bench-body" style="animation:viewIn .4s var(--ease)">
        <button class="btn sm" data-back-page><i class="ph ph-arrow-left"></i>Back to summary page</button>
        <div class="three" style="margin-top:14px">
          <div class="dash-tile"><h5>Product</h5><div class="big" style="font-size:20px">${detail}</div></div>
          <div class="dash-tile"><h5>Sales ($K)</h5><div class="big">${sales}</div></div>
          <div class="dash-tile"><h5>Profit ($K)</h5><div class="big">${fmt(sales * .17, 1)}</div></div>
        </div>
        <div class="explain"><strong>Drill through</strong> moved you to a <em>different report page</em>, filtered to one product. Built by dragging Product Name into this page's Drill through filters; the user gets there by right-clicking a data point → Drill through.</div>
      </div>`;
      return;
    }
    el.innerHTML = `${bench('tree-structure', 'Sales by ' + level, path.length ? path.join(' › ') : 'Top of hierarchy')}
    <div class="bench-body">
      <div class="controls"><button class="btn sm" data-up ${path.length ? '' : 'disabled'}><i class="ph ph-arrow-up"></i>Drill up</button>
        <span class="small muted">${leaf ? 'Lowest level. Use the <i class="ph ph-arrow-square-out"></i> button to drill through to the detail page.' : 'Click a bar to drill down within this visual.'}</span></div>
      <svg class="viz" viewBox="0 0 720 ${items.length * 40 + 10}" role="img" aria-label="Sales bar chart">${items.map(([k, v], i) => `<g class="${leaf ? '' : 'map-node'}" data-k="${esc(k)}" style="cursor:${leaf ? 'default' : 'pointer'};animation:viewIn .4s var(--ease) ${i * 50}ms both">
        <text x="150" y="${i * 40 + 27}" text-anchor="end" class="lbl-strong" style="fill:var(--ink)">${k}</text>
        <rect x="160" y="${i * 40 + 8}" width="${(v / mx) * 440}" height="28" rx="4" fill="${i === 0 ? 'var(--accent-viz)' : 'var(--context)'}" style="stroke:none"/>
        <text x="${168 + (v / mx) * 440}" y="${i * 40 + 27}" class="num">${v}</text>
        ${leaf ? `<foreignObject x="660" y="${i * 40 + 6}" width="40" height="32"><button xmlns="http://www.w3.org/1999/xhtml" class="icon-btn" data-thru="${esc(k)}" aria-label="Drill through to ${esc(k)}" style="width:32px;height:30px"><i class="ph ph-arrow-square-out"></i></button></foreignObject>` : ''}</g>`).join('')}</svg>
      <div class="explain"><strong>Drill down</strong> stays in the same visual and moves one level down the hierarchy Category → Sub-Category → Product Name. The up arrow goes back. Tooltip: hover is how Power BI shows details without navigating.</div>
    </div>`;
  };
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-thru]'); if (t) { detail = t.dataset.thru; render(); return; }
    if (e.target.closest('[data-back-page]')) { detail = null; render(); return; }
    if (e.target.closest('[data-up]')) { path.pop(); render(); return; }
    const g = e.target.closest('.map-node[data-k]'); if (g && path.length < 2) { path.push(g.dataset.k); render(); }
  });
  render();
}

// ---------- bookmarks & buttons ----------
const REGSALES = { All: [452, 318, 241, 144, 129], Cairo: [210, 120, 96, 61, 54], Giza: [130, 98, 70, 40, 35] };
const CAT5 = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books'];
export function bookmarks(el) {
  let st = { region: 'All', view: 'chart' }, saved = [{ name: 'Overview', s: { region: 'All', view: 'chart' } }], flash = '';
  const render = () => {
    const vals = REGSALES[st.region], mx = Math.max(...vals);
    el.innerHTML = `${bench('bookmark-simple', 'Buttons and bookmarks', 'A bookmark captures filters and visibility')}
    <div class="bench-body"><div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:16px" class="bm">
      <div class="dash" style="min-height:250px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <span class="small muted">Slicer: Region</span>${['All', 'Cairo', 'Giza'].map(r => `<button class="chip" data-r="${r}" aria-pressed="${st.region === r}">${r}</button>`).join('')}
          <span style="margin-left:auto;display:flex;gap:6px"><button class="btn sm" data-view="chart" title="Button → Bookmark: Show chart"><i class="ph ph-chart-bar"></i>Chart</button><button class="btn sm" data-view="table" title="Button → Bookmark: Show table"><i class="ph ph-table"></i>Table</button><button class="btn sm" data-reset title="Button → Reset filters"><i class="ph ph-arrow-counter-clockwise"></i>Reset</button></span>
        </div>
        <div class="dash-tile" style="animation:viewIn .35s var(--ease)">${st.view === 'chart'
          ? `<h5>Sales by category ($K) · ${st.region}</h5><svg class="viz" viewBox="0 0 400 150">${vals.map((v, i) => `<text x="70" y="${i * 28 + 20}" text-anchor="end">${CAT5[i]}</text><rect x="76" y="${i * 28 + 6}" width="${(v / mx) * 280}" height="20" rx="3" fill="${i === 0 ? 'var(--accent-viz)' : 'var(--context)'}"/><text x="${82 + (v / mx) * 280}" y="${i * 28 + 21}" class="num">${v}</text>`).join('')}</svg>`
          : `<h5>Sales table · ${st.region}</h5><table class="tbl">${vals.map((v, i) => `<tr><td>${CAT5[i]}</td><td class="num">${v}</td></tr>`).join('')}</table>`}</div>
      </div>
      <div style="border-left:1px solid var(--line);padding-left:14px">
        <div class="small" style="font-weight:600;margin-bottom:8px">Bookmarks pane</div>
        <div style="display:flex;flex-direction:column;gap:6px">${saved.map((b, i) => `<button class="btn sm ghost" data-b="${i}" style="justify-content:flex-start"><i class="ph ph-bookmark-simple"></i>${esc(b.name)} <span class="tiny muted">${b.s.region}, ${b.s.view}</span></button>`).join('')}</div>
        <button class="btn sm" data-add style="margin-top:10px;width:100%;justify-content:center"><i class="ph ph-plus"></i>Add</button>
        ${flash ? `<div class="tiny hl" style="margin-top:8px">${flash}</div>` : ''}
      </div>
    </div>
    <div class="explain">Set a region and a view, then <strong>Add</strong> a bookmark. Change things, then click the bookmark: the page snaps back to that exact state. Chain bookmarks to buttons to build navigation or a step-by-step data story.</div></div>`;
  };
  el.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return; flash = '';
    if (t.dataset.r) st.region = t.dataset.r;
    else if (t.dataset.view) st.view = t.dataset.view;
    else if (t.hasAttribute('data-reset')) st.region = 'All';
    else if (t.hasAttribute('data-add')) { saved.push({ name: `${st.region} ${st.view}`, s: { ...st } }); flash = 'Bookmark captured the current state.'; }
    else if (t.dataset.b) { st = { ...saved[+t.dataset.b].s }; flash = `Restored "${saved[+t.dataset.b].name}".`; }
    else return;
    render();
  });
  render();
}

// ---------- Lab 5: storytelling ----------
export function whatso(el) {
  sorter(el, {
    id: 'lab5-wsn', icon: 'chats-circle', title: 'What? So what? Now what?', options: ['What?', 'So what?', 'Now what?'],
    items: [
      { t: 'Electronics and Cairo lead revenue; Books & Stationery is the weakest category.', a: 'What?', why: 'A fact about key numbers and comparisons.' },
      { t: 'Revenue depends on one category and one region, which is a risk if either slows down.', a: 'So what?', why: 'Explains why it matters.' },
      { t: 'Run mobile promotions for Electronics in Cairo and test bundles to lift Books & Stationery.', a: 'Now what?', why: 'A recommended action.' },
      { t: 'Mobile Electronics revenue fell 52% from April to May.', a: 'What?', why: 'What happened, with the number.' },
      { t: 'Desktop stayed flat, so the drop is specific to the mobile experience, not to demand.', a: 'So what?', why: 'Compares and interprets: what changed and what is surprising.' },
      { t: 'Investigate the May mobile app release for checkout errors.', a: 'Now what?', why: 'An investigation the viewer can start.' },
    ],
  });
}

export function bigidea(el) {
  const P = [
    ['E-commerce managers', 'why online sales decreased this month', 'identify which products need attention'],
    ['The sales director', 'Electronics mobile revenue fell 52% in May while desktop stayed flat', 'prioritise fixing the mobile checkout before June'],
    ['HR leaders', 'remote and onsite employees report almost identical stress levels', 'stop treating work location as the main driver of burnout'],
  ];
  let v = [...P[1]];
  const render = () => {
    const [a, f, ac] = v.map(s => s.trim());
    const checks = [
      [a && !/^(everyone|people|users|all)$/i.test(a), 'Audience is specific'],
      [/\d|more|less|fell|rose|drop|increase|decrease|than|identical|higher|lower/i.test(f), 'Finding has a number or comparison'],
      [ac.split(/\s+/).length >= 3, 'Action says what they will do'],
    ];
    el.innerHTML = `${bench('quotes', 'Write your big idea', '[Audience] needs to know [finding] so they can [action].')}
    <div class="bench-body">
      <div class="chips" style="margin-bottom:12px">${P.map((p, i) => `<button class="chip" data-p="${i}">Example ${i + 1}</button>`).join('')}</div>
      <div class="three">${[['Audience', 0], ['Finding', 1], ['Action', 2]].map(([l, i]) => `<div class="field"><label for="bi${i}">${l}</label><input id="bi${i}" type="text" value="${esc(v[i])}"></div>`).join('')}</div>
      <blockquote style="margin:16px 0 0;padding:16px 18px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);font-size:18px;line-height:1.5" data-out></blockquote>
      <div class="chips" style="margin-top:12px" data-checks></div>
    </div>`;
    paint(checks);
  };
  const paint = (checks) => {
    const [a, f, ac] = v.map(s => esc(s.trim() || '…'));
    el.querySelector('[data-out]').innerHTML = `<strong>${a}</strong> needs to know <span class="hl">${f}</span> so they can <strong>${ac}</strong>.`;
    el.querySelector('[data-checks]').innerHTML = (checks || []).map(([ok, l]) => `<span class="chip" style="${ok ? 'color:var(--good);border-color:var(--good)' : ''}"><i class="ph ph-${ok ? 'check-circle' : 'circle'}"></i>${l}</span>`).join('');
  };
  el.addEventListener('input', e => {
    const m = e.target.id.match(/^bi(\d)$/); if (!m) return; v[+m[1]] = e.target.value;
    const [a, f, ac] = v.map(s => s.trim());
    paint([[a && !/^(everyone|people|users|all)$/i.test(a), 'Audience is specific'], [/\d|more|less|fell|rose|drop|increase|decrease|than|identical|higher|lower/i.test(f), 'Finding has a number or comparison'], [ac.split(/\s+/).length >= 3, 'Action says what they will do']]);
  });
  on(el, '[data-p]', 'click', (e, b) => { v = [...P[+b.dataset.p]]; render(); });
  render();
}

export function chartq(el) {
  sorter(el, {
    id: 'lab5-chartq', icon: 'question', title: 'Question → Data Studio chart', cols: 280,
    options: ['Scorecard', 'Time series', 'Bar chart', 'Scatter chart', 'Histogram', 'Table', 'Pie / donut'],
    items: [
      { t: 'How much revenue did we make this month?', a: 'Scorecard', why: 'Watch out: add a previous-period comparison, or the number has no meaning.' },
      { t: 'How did weekly orders change this year?', a: 'Time series', why: 'Watch out: keep date intervals consistent.' },
      { t: 'Which region sells the most?', a: 'Bar chart', why: 'Watch out: sort the bars and start the axis at zero.' },
      { t: 'Do bigger discounts come with bigger orders?', a: 'Scatter chart', why: 'Watch out: correlation is not causation.' },
      { t: 'How are order values spread?', a: 'Histogram', why: 'Watch out: check the bin size.' },
      { t: 'What exactly did customer #4471 buy?', a: 'Table', why: 'Watch out: keep tables on detail pages.' },
      { t: 'What share of orders is mobile vs desktop?', a: 'Pie / donut', why: 'Watch out: three slices at most.' },
    ],
  });
}

// ---------- makeover: bad vs good dashboard ----------
const CATREV = [['Electronics', 452], ['Fashion', 318], ['Home & Kitchen', 241], ['Beauty', 144], ['Books & Stationery', 129]];
const REGREV = [['Cairo', 541], ['Giza', 352], ['Alexandria', 228], ['Delta', 163]];
const DAYS = [31, 34, 33, 38, 36, 41, 39, 44, 46, 61, 43, 40, 42, 38, 44, 41, 39, 45, 42, 40, 46, 43, 41, 44, 47, 42, 45, 43, 46, 48, 44];
const MISTAKES = [
  ['Generic titles', '"Sales by Category" names the axes. Nothing tells the viewer what to conclude.'],
  ['No visual hierarchy', 'Three identical scorecards and a giant table: nothing says "look here first".'],
  ['Charts with no story', 'Category, region, date and table sit side by side with no flow or link.'],
  ['Raw table as a visual', 'Takes the most space, gives the least insight. Viewers must scan rows.'],
  ['No annotations or context', 'No peak marked, no target, no comparison. 1,284,530 means nothing alone.'],
  ['Poor use of color', 'Everything default blue; the pie adds red, yellow, blue with no meaning.'],
  ['Weak chart choices', 'Pie hides the small slice (Tablet 6%), bars unsorted, noisy line with no trend.'],
  ['Missing What / So what / Now what', 'Numbers are shown, nothing is called out, explained or recommended.'],
];
function badDash(pins = true) {
  const B = '#4e79a7', x = scale(0, 30, 10, 290), y = scale(25, 65, 80, 6);
  const pin = (n, l, t) => pins ? `<button class="pin" data-pin="${n}" style="left:${l};top:${t}" aria-label="Mistake ${n}">${n}</button>` : '';
  return `<div class="dash" style="font-family:Arial,sans-serif">${pin(2, '-8px', '-8px')}
    <div class="dash-grid" style="grid-template-columns:repeat(3,1fr)">${[['Total Revenue', '1,284,530'], ['Orders', '18,442'], ['Avg Order', '69.65']].map(([k, v]) => `<div class="dash-tile"><h5>${k}</h5><div class="big" style="font-size:20px">${v}</div></div>`).join('')}</div>
    <div class="dash-grid" style="grid-template-columns:1.2fr 1fr;margin-top:10px">
      <div class="dash-tile">${pin(1, '-8px', '-8px')}<h5>Sales by Category</h5><svg viewBox="0 0 300 110">${[241, 452, 129, 318, 144].map((v, i) => `<rect x="${12 + i * 58}" y="${100 - v / 5}" width="40" height="${v / 5}" fill="${B}"/>`).join('')}</svg></div>
      <div class="dash-tile">${pin(7, 'calc(100% - 14px)', '-8px')}${pin(6, '40%', '40%')}<h5>Revenue by Device</h5><svg viewBox="0 0 120 100" style="max-height:110px;margin:auto"><circle cx="60" cy="50" r="42" fill="#e15759"/><path d="M60 50L60 8A42 42 0 0 1 98 68Z" fill="#edc948"/><path d="M60 50L98 68A42 42 0 0 1 86 83Z" fill="${B}"/></svg></div>
    </div>
    <div class="dash-grid" style="grid-template-columns:1fr 1fr;margin-top:10px">
      <div class="dash-tile">${pin(5, '-8px', '-8px')}<h5>Revenue over time</h5><svg viewBox="0 0 300 86"><polyline points="${DAYS.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${B}" stroke-width="1.5"/></svg></div>
      <div class="dash-tile">${pin(4, '-8px', '-8px')}${pin(3, 'calc(100% - 14px)', '-8px')}<h5>Orders</h5><table class="tbl" style="font-size:11px">${['ORD-00001 Fashion Mobile Cairo 158.14', 'ORD-00002 Books Desktop Giza 10.76', 'ORD-00003 Electronics Mobile Cairo 54.49', 'ORD-00004 Fashion Mobile Giza 94.37'].map(r => `<tr><td style="padding:2px 4px">${r}</td></tr>`).join('')}</table></div>
    </div>${pin(8, 'calc(100% - 14px)', 'calc(100% - 14px)')}</div>`;
}
function goodDash() {
  const mx = 452, x = scale(0, 30, 10, 330), y = scale(25, 65, 96, 14);
  return `<div class="dash">
    <h4 style="font-size:17px;margin:2px 2px 10px">Electronics and Cairo drive revenue; Books &amp; Stationery lags</h4>
    <div class="dash-grid" style="grid-template-columns:200px minmax(0,1fr)">
      <div class="dash-tile"><h5>Revenue, January</h5><div class="big" style="font-size:34px;color:var(--accent)">$1.28M</div><div class="small muted">Orders 18,442 · avg $69.65</div></div>
      <div class="dash-tile"><h5>Electronics earns 3.5× more than Books &amp; Stationery</h5><svg viewBox="0 0 360 124">${CATREV.map(([k, v], i) => `<text x="122" y="${i * 24 + 16}" text-anchor="end" style="font-size:12px;fill:var(--muted)">${k}</text><rect x="128" y="${i * 24 + 5}" width="${(v / mx) * 180}" height="16" rx="2" fill="${i === 0 ? 'var(--accent-viz)' : 'var(--context)'}"/><text x="${132 + (v / mx) * 180}" y="${i * 24 + 17}" style="font:500 12px var(--mono);fill:var(--muted)">${v}K</text>`).join('')}</svg></div>
    </div>
    <div class="dash-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-top:10px">
      <div class="dash-tile"><h5>Daily revenue peaked on Jan 10 ($61K) after the flash sale</h5><svg viewBox="0 0 340 104"><polyline points="${DAYS.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="var(--context-2)" stroke-width="1.5"/><circle cx="${x(9)}" cy="${y(61)}" r="5" fill="var(--accent-viz)"/><text x="${x(9) + 8}" y="${y(61) + 4}" style="font:600 12.5px var(--font);fill:var(--accent)">Jan 10 peak</text><line x1="10" x2="330" y1="${y(42)}" y2="${y(42)}" stroke="var(--line-strong)" stroke-dasharray="3 3"/><text x="330" y="${y(42) - 4}" text-anchor="end" style="font-size:12px;fill:var(--muted)">daily target</text></svg></div>
      <div class="dash-tile" style="border-color:var(--accent-viz)"><h5>What / So what / Now what</h5><div class="small" style="line-height:1.45"><b>What:</b> Electronics and Cairo lead.<br><b>So what:</b> revenue depends on one category and one region.<br><b style="color:var(--accent)">Now what:</b> mobile promos for Electronics in Cairo; test Books bundles.</div></div>
    </div></div>`;
}
export function makeover(el) {
  let mode = 'bad', pin = null;
  const render = () => {
    el.innerHTML = `${bench('magic-wand', 'Dashboard makeover', mode === 'bad' ? 'Click the red pins: 8 common mistakes' : 'Same data, told as a story')}
    <div class="bench-body">
      <div class="controls">${seg([['bad', 'Before'], ['good', 'After']], mode)}</div>
      <div style="animation:viewIn .45s var(--ease)">${mode === 'bad' ? badDash() : goodDash()}</div>
      <div class="explain">${mode === 'bad'
        ? (pin ? `<strong class="hl">${pin}. ${MISTAKES[pin - 1][0]}.</strong> ${MISTAKES[pin - 1][1]}` : 'This dashboard shows data but answers no question. Click each pin.')
        : '<strong>What changed:</strong> a headline with the main finding, finding-style chart titles, one hero KPI, sorted bars, no pie, grey plus a single orange accent, an annotated peak with a target line, and a What / So what / Now what panel.'}</div>
    </div>`;
  };
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-pin]'); if (p) { pin = +p.dataset.pin; render(); return; }
    const b = e.target.closest('[data-v]'); if (b) { mode = b.dataset.v; pin = null; render(); }
  });
  render();
}

export function tensecond(el) {
  let phase = 'idle', which = 'good', left = 10, timer = null, ans = null;
  const OPTS = ['Revenue depends on Electronics and Cairo; Books lags', 'Mobile is the biggest device', 'Revenue was flat all month', 'There were 18,442 orders'];
  const stop = () => { clearInterval(timer); timer = null; };
  const render = () => {
    let body = '';
    if (phase === 'idle') body = `<div class="empty" style="border-style:solid"><i class="ph ph-timer"></i>Show a dashboard for exactly 10 seconds, hide it, then name the main message. Try both versions.<div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn primary" data-start="good">Test the "after" version</button><button class="btn" data-start="bad">Test the "before" version</button></div></div>`;
    if (phase === 'show') body = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px"><span class="timer num" style="color:${left <= 3 ? 'var(--accent)' : 'var(--ink)'}">${left}</span><div class="meter" style="flex:1;height:8px"><span style="transform:scaleX(${left / 10})"></span></div></div>${which === 'good' ? goodDash() : badDash(false)}`;
    if (phase === 'ask') body = `<p class="q-text">What is the main message of the dashboard you just saw?</p><div class="q-opts">${OPTS.map((o, i) => `<button class="q-opt ${ans !== null ? (i === 0 ? 'correct' : i === ans ? 'incorrect' : '') : ''}" data-a="${i}" ${ans !== null ? 'disabled' : ''}><span class="letter">${'ABCD'[i]}</span>${o}</button>`).join('')}</div>
      ${ans !== null ? `<div class="q-why ${ans === 0 ? 'good' : 'bad'}">${which === 'bad'
          ? (ans === 0 ? 'Correct, but only because you already know the story from this page. The "before" dashboard never states it: a new viewer has to infer it from unsorted, same-colored charts, and most latch onto the biggest number instead. As a design it fails the 10-second test; cut clutter and sharpen titles.' : 'Not the big idea, and that is the point: the "before" dashboard never states a message, so viewers latch onto whatever number is biggest. That is a failed 10-second test; cut clutter and sharpen titles.')
          : (ans === 0 ? 'You got the big idea in 10 seconds. The headline and the highlighted bars carry the message: a passed test.' : 'Not the big idea. Look again at the headline: it states the finding directly. If a viewer still misses it, sharpen the title or reduce what competes with it.')}</div><button class="btn sm" data-reset style="margin-top:12px">Try again</button>` : ''}`;
    el.innerHTML = `${bench('timer', 'The 10-second test')}<div class="bench-body">${body}</div>`;
  };
  el.addEventListener('click', e => {
    const s = e.target.closest('[data-start]');
    if (s) { which = s.dataset.start; phase = 'show'; left = reduced() ? 10 : 10; ans = null; render(); stop(); timer = setInterval(() => { left--; if (left <= 0) { stop(); phase = 'ask'; } render(); }, 1000); return; }
    const a = e.target.closest('[data-a]'); if (a) { ans = +a.dataset.a; recordScore('lab5-10s-' + which, ans === 0 ? 1 : 0, 1); render(); return; }
    if (e.target.closest('[data-reset]')) { phase = 'idle'; render(); }
  });
  render();
  return stop;
}
