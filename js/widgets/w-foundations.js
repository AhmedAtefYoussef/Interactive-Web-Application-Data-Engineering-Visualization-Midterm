// Lecture 1 & 2 widgets, plus the shared "sorter" classification game.
import { bench, $, $$, on, seg, setSeg, scale, fmt, esc } from '../viz.js';
import { recordScore } from '../store.js';

// A classification game: every item gets one of N labels, feedback explains why.
export function sorter(el, { id, icon = 'list-checks', title, hint = 'Pick a label for each card', options, items, cols }) {
  const state = {};
  const render = () => {
    const done = Object.keys(state).length, right = items.filter((it, i) => state[i] === it.a).length;
    el.innerHTML = `${bench(icon, title, `<span class="num">${right}/${items.length}</span> correct`)}
    <div class="bench-body">
      <p class="small muted" style="margin-bottom:12px">${hint}</p>
      <div class="sort-grid" ${cols ? `style="grid-template-columns:repeat(auto-fill,minmax(${cols}px,1fr))"` : ''}>
        ${items.map((it, i) => {
          const a = state[i], cls = a === undefined ? '' : a === it.a ? 'right' : 'wrong';
          return `<div class="sort-item ${cls}">
            <div>${it.t}</div>
            ${a === undefined
              ? `<div class="opts">${options.map(o => `<button type="button" data-i="${i}" data-o="${esc(o)}">${o}</button>`).join('')}</div>`
              : `<div class="why"><strong>${it.a}.</strong> ${a !== it.a ? `You said ${a}. ` : ''}${it.why || ''}</div>`}
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:14px">
        <button class="btn sm" data-reset><i class="ph ph-arrow-counter-clockwise"></i>Reset</button>
        ${done === items.length ? `<span class="small ${right === items.length ? 'hl' : 'muted'}">${right === items.length ? 'Perfect run.' : `Review the red cards, then reset and try again.`}</span>` : ''}
      </div>
    </div>`;
  };
  on(el, '[data-o]', 'click', (e, b) => {
    state[+b.dataset.i] = b.dataset.o;
    if (Object.keys(state).length === items.length && id) recordScore(id, items.filter((it, i) => state[i] === it.a).length, items.length);
    render();
  });
  on(el, '[data-reset]', 'click', () => { Object.keys(state).forEach(k => delete state[k]); render(); });
  render();
}

// ---------------- L1 ----------------
export function dupes(el) {
  sorter(el, {
    id: 'l1-dupes', icon: 'copy', title: 'Checkpoint: remove the duplicate?', options: ['Remove', 'Keep'],
    hint: 'Each card shows two identical-looking rows. Decide whether to drop one.',
    items: [
      { t: 'Two rows with the same <b>transaction_id</b> TXN_6867343, same time to the second. The CSV export ran twice.', a: 'Remove', why: 'Same event, same ID, recorded twice. Keeping it double counts revenue.' },
      { t: 'A café log shows two "1 × espresso, 25 LE, card" rows from the same customer, 40 minutes apart.', a: 'Keep', why: 'Two real purchases. Different events that happen to look alike.' },
      { t: 'A sensor reports "22.4 °C" in two consecutive readings, one minute apart.', a: 'Keep', why: 'A stable temperature is a legitimate repeated value, not a duplicate record.' },
      { t: 'The same student appears twice after merging two class lists, once as "Mona Adel" and once as "mona adel", same ID.', a: 'Remove', why: 'Same entity; fix the formatting, then keep one row.' },
    ],
  });
}

export function roles(el) {
  sorter(el, {
    id: 'l1-roles', icon: 'users-three', title: 'Who does this task?', options: ['Engineer', 'Scientist'],
    items: [
      { t: 'Design a schema to store 2 billion click events efficiently', a: 'Engineer', why: 'Designing efficient storage is core data engineering.' },
      { t: 'Train a model that predicts which users will churn', a: 'Scientist', why: 'Applying ML models to find patterns.' },
      { t: 'Schedule the join job to run only after cleaning finishes', a: 'Engineer', why: 'Scheduling tools keep the correct time and order.' },
      { t: 'Find which customer segments respond to discounts', a: 'Scientist', why: 'Mining data for patterns and insight.' },
      { t: 'Build a pipeline that moves CRM data into the warehouse nightly', a: 'Engineer', why: 'Pipelines that transform and move data are the engineer\'s job.' },
      { t: 'Remove corrupted rows and standardize date formats', a: 'Engineer', why: 'The engineer delivers clean data.' },
      { t: 'Scale the architecture when data grows 10×', a: 'Engineer', why: 'Architecture that scales for big data.' },
      { t: 'Evaluate whether a recommendation model is accurate', a: 'Scientist', why: 'Model evaluation sits with the scientist (engineers support with good data).' },
    ],
  });
}

const RAW = [
  { id: 1, name: 'Mona Adel', country: 'Egypt', age: 29, amount: 120, src: 'CRM' },
  { id: 2, name: 'Omar Said', country: 'EG', age: 34, amount: 85, src: 'API' },
  { id: 1, name: 'Mona Adel', country: 'Egypt', age: 29, amount: 120, src: 'CRM', dup: true },
  { id: 4, name: 'Lina Farouk', country: 'egypt', age: -20, amount: 60, src: 'POS' },
  { id: 5, name: 'Karim Nabil', country: 'Egypt', age: 45, amount: null, src: 'API' },
  { id: 6, name: 'Sara Hany', country: 'U.S.', age: 41, amount: 150, src: 'CRM' },
  { id: 7, name: 'Youssef Ali', country: 'US', age: 38, amount: 95, src: 'POS' },
];
const COUNTRY = { EG: 'Egypt', egypt: 'Egypt', 'U.S.': 'United States', US: 'United States', Egypt: 'Egypt' };

export function etl(el) {
  const st = { stage: 0, dedupe: false, country: false, validate: false, fill: false };
  const run = () => {
    let rows = RAW.map(r => ({ ...r, notes: {} }));
    if (st.stage < 1) return [];
    rows.forEach(r => {
      if (r.dup) r.issue = 'dup';
      if (!['Egypt', 'United States'].includes(r.country)) r.notes.country = 'bad';
      if (r.age < 0) r.notes.age = 'bad';
      if (r.amount === null) r.notes.amount = 'bad';
    });
    if (st.dedupe) rows.forEach(r => { if (r.dup) r.gone = true; });
    if (st.country) rows.forEach(r => { if (r.notes.country) { r.country = COUNTRY[r.country]; r.notes.country = 'fix'; } });
    if (st.validate) rows.forEach(r => { if (r.notes.age) r.gone = true; });
    if (st.fill) {
      const vals = rows.filter(r => !r.gone && r.amount !== null).map(r => r.amount);
      const m = vals.reduce((a, b) => a + b, 0) / vals.length;
      rows.forEach(r => { if (r.amount === null) { r.amount = Math.round(m * 100) / 100; r.notes.amount = 'fix'; } });
    }
    return rows;
  };
  const cell = (r, k) => {
    const v = r[k] === null ? 'null' : r[k];
    return `<td class="${k === 'amount' || k === 'age' ? 'num' : ''} ${r.notes[k] === 'bad' ? 'cell-bad' : r.notes[k] === 'fix' ? 'cell-fix' : ''}">${v}</td>`;
  };
  const render = () => {
    const rows = run();
    const live = rows.filter(r => !r.gone);
    const issues = live.reduce((n, r) => n + (r.dup ? 1 : 0) + Object.values(r.notes).filter(v => v === 'bad').length, 0);
    const quality = rows.length ? Math.round(100 * (1 - issues / (RAW.length + 3))) : 0;
    el.innerHTML = `${bench('flow-arrow', 'ETL pipeline simulator', 'Extract, then switch on transforms, then Load')}
    <div class="bench-body">
      <div class="controls" style="align-items:center">
        <button class="btn ${st.stage === 0 ? 'primary' : ''}" data-act="extract"><i class="ph ph-download-simple"></i>1 · Extract</button>
        <div class="chips" role="group" aria-label="Transform steps">
          ${[['dedupe', 'Remove duplicates'], ['country', 'Standardize country'], ['validate', 'Validate age'], ['fill', 'Fill missing (mean)']].map(([k, l]) =>
            `<button class="chip" data-t="${k}" aria-pressed="${st[k]}" ${st.stage < 1 ? 'disabled' : ''}>${st[k] ? '<i class="ph ph-check"></i>' : ''}${l}</button>`).join('')}
        </div>
        <button class="btn ${st.stage === 1 ? 'primary' : ''}" data-act="load" ${st.stage < 1 ? 'disabled' : ''}><i class="ph ph-database"></i>3 · Load</button>
      </div>
      ${st.stage === 0 ? `<div class="empty"><i class="ph ph-plugs"></i>Three heterogeneous sources are waiting: <b>CRM</b>, a <b>web API</b> and <b>point-of-sale</b> transactions. Press Extract.</div>` : `
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>id</th><th>name</th><th>country</th><th>age</th><th>amount</th><th>source</th><th>status</th></tr>
        ${rows.map((r, i) => `<tr class="${r.gone ? 'gone' : r.dup ? 'flag' : ''}" style="animation:viewIn .4s var(--ease) ${i * 50}ms both">
          <td class="num">${r.id}</td><td>${r.name}</td>${cell(r, 'country')}${cell(r, 'age')}${cell(r, 'amount')}<td class="muted">${r.src}</td>
          <td class="small">${r.gone ? (r.dup ? 'removed duplicate' : 'rejected: invalid') : r.dup ? '<span class="cell-bad">duplicate</span>' : Object.values(r.notes).includes('bad') ? '<span class="cell-bad">needs work</span>' : Object.values(r.notes).includes('fix') ? '<span class="cell-fix">fixed</span>' : 'ok'}</td></tr>`).join('')}
      </table></div>
      <div class="readout">
        <div><div class="k">Rows extracted</div><div class="v">${rows.length}</div></div>
        <div><div class="k">Rows surviving</div><div class="v">${live.length}</div></div>
        <div><div class="k">Open issues</div><div class="v ${issues ? '' : 'accent'}">${issues}</div></div>
        <div><div class="k">Quality score</div><div class="v accent">${quality}%</div></div>
      </div>
      ${st.stage === 2 ? `<div class="explain"><i class="ph ph-database"></i> <strong>Loaded ${live.length} rows into the warehouse.</strong> ${issues ? `But ${issues} issue${issues > 1 ? 's' : ''} went in with them: garbage in, garbage out. Switch on the remaining transforms and load again.` : 'Clean load. In production this load is scheduled to refresh periodically, and the transforms run before it every time.'}</div>`
        : `<div class="explain">Transform is where <strong>cleaning, validating and authenticating</strong> happen. Notice "Validate age" rejects the row with age -20 rather than guessing a value.</div>`}`}
    </div>`;
  };
  on(el, '[data-act]', 'click', (e, b) => { st.stage = b.dataset.act === 'extract' ? Math.max(1, st.stage === 2 ? 1 : 1) : 2; render(); });
  on(el, '[data-t]', 'click', (e, b) => { st[b.dataset.t] = !st[b.dataset.t]; if (st.stage === 2) st.stage = 1; render(); });
  render();
}

// ---------------- L2 ----------------
const STACK = [
  { k: 'Sources', icon: 'database', tools: 'APIs, databases, streams', job: 'Where data is born: app databases, SaaS APIs, event streams, files.', nf: 'User interactions on every device.' },
  { k: 'Ingestion', icon: 'download-simple', tools: 'Kafka, Airflow, Fivetran', job: 'Moves data from sources into the platform, in batches or as a stream.', nf: 'Kafka streams capture interactions in real time.' },
  { k: 'Storage', icon: 'hard-drives', tools: 'Snowflake, BigQuery, S3', job: 'Warehouses for structured analytics, lakes for raw files at low cost.', nf: 'S3 data lake for raw events, Cassandra for serving.' },
  { k: 'Transform', icon: 'arrows-split', tools: 'dbt, Spark, Databricks', job: 'Cleans, joins, aggregates and models data into analysis-ready tables.', nf: 'Spark processes events for immediate recommendations.' },
  { k: 'Analytics', icon: 'chart-line-up', tools: 'Tableau, Looker, ML', job: 'Where value is delivered: dashboards, reports, ML models.', nf: 'Real-time features feed recommendation models.' },
];
export function stack(el) {
  let sel = 1, netflix = false;
  const render = () => {
    const W = 760, bw = 128, gap = (W - 5 * bw) / 4;
    el.innerHTML = `${bench('stack', 'The modern data stack', 'Click a stage')}
    <div class="bench-body">
      <div class="controls">${seg([['generic', 'Generic stack'], ['netflix', 'Netflix mapping']], netflix ? 'netflix' : 'generic')}</div>
      <svg class="viz" viewBox="0 0 ${W} 190" role="img" aria-label="Modern data stack diagram">
        <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--context-2)"/></marker></defs>
        ${STACK.map((s, i) => {
          const x = i * (bw + gap), on = i === sel;
          return `<g class="map-node" data-i="${i}" tabindex="0" role="button" aria-label="${s.k}">
            <rect x="${x}" y="10" width="${bw}" height="88" rx="10" style="${on ? 'fill:var(--accent-soft);stroke:var(--accent-viz);stroke-width:2' : ''}"/>
            <text x="${x + 14}" y="40" style="font-weight:600;font-size:13px">${s.k}</text>
            <text x="${x + 14}" y="62" class="n">${s.tools.split(', ')[0]},</text>
            <text x="${x + 14}" y="78" class="n">${s.tools.split(', ').slice(1).join(', ')}</text>
            ${i < 4 ? `<line x1="${x + bw + 4}" x2="${x + bw + gap - 4}" y1="54" y2="54" stroke="var(--context-2)" stroke-width="1.5" marker-end="url(#arr)"/>` : ''}
          </g>`;
        }).join('')}
        <rect x="0" y="122" width="${W}" height="46" rx="10" fill="var(--sunken)" stroke="var(--line-strong)" stroke-dasharray="4 4"/>
        <text x="16" y="150" style="fill:var(--ink);font-weight:600;font-size:13px">Orchestration &amp; monitoring</text>
        <text x="${W - 16}" y="150" text-anchor="end">Apache Airflow · Prefect · Great Expectations</text>
      </svg>
      <div class="explain"><strong>${STACK[sel].k}.</strong> ${netflix ? `<span class="hl">Netflix:</span> ${STACK[sel].nf}` : STACK[sel].job} <span class="muted">Tools: ${STACK[sel].tools}.</span></div>
    </div>`;
  };
  on(el, '.map-node', 'click', (e, g) => { sel = +g.dataset.i; render(); });
  on(el, '.map-node', 'keydown', (e, g) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel = +g.dataset.i; render(); } });
  on(el, '[data-v]', 'click', (e, b) => { netflix = b.dataset.v === 'netflix'; render(); });
  render();
}

const EVENTS = [0.6, 1.4, 2.9, 3.3, 4.8, 6.1, 7.3, 8.2, 9.9, 11.4, 12.2, 13.8, 15.5, 17.1, 18.4];
const FRAUD = 7.3;
export function batchstream(el) {
  let mode = 'batch', win = 5;
  const W = 760, x = scale(0, 20, 30, W - 20);
  const render = () => {
    const proc = t => mode === 'stream' ? t + 0.3 : Math.ceil(t / win) * win;
    const lat = EVENTS.map(t => proc(t) - t), avg = lat.reduce((a, b) => a + b, 0) / lat.length;
    const fraudLag = proc(FRAUD) - FRAUD;
    el.innerHTML = `${bench('timer', 'Batch vs stream: latency', 'Same 15 events, two processing styles')}
    <div class="bench-body">
      <div class="controls">
        ${seg([['batch', 'Batch'], ['stream', 'Stream']], mode)}
        <div class="field" ${mode === 'stream' ? 'style="opacity:.4"' : ''}><label for="bwin">Batch window <span class="val">${win} s</span></label><input id="bwin" type="range" min="2" max="10" step="1" value="${win}" ${mode === 'stream' ? 'disabled' : ''}></div>
      </div>
      <svg class="viz" viewBox="0 0 ${W} 170" role="img" aria-label="Event arrival vs processing timeline">
        <text x="0" y="34" class="lbl-strong">arrive</text><text x="0" y="114" class="lbl-strong">done</text>
        <line x1="${x(0)}" x2="${x(20)}" y1="30" y2="30" stroke="var(--line-strong)"/>
        <line x1="${x(0)}" x2="${x(20)}" y1="110" y2="110" stroke="var(--line-strong)"/>
        ${mode === 'batch' ? Array.from({ length: Math.floor(20 / win) + 1 }, (_, i) => i * win).filter(v => v <= 20).map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="20" y2="120" stroke="var(--line)" stroke-dasharray="3 3"/><text x="${x(v)}" y="134" text-anchor="middle">${v}s</text>`).join('') : [0, 5, 10, 15, 20].map(v => `<text x="${x(v)}" y="134" text-anchor="middle">${v}s</text>`).join('')}
        ${EVENTS.map(t => {
          const f = t === FRAUD, c = f ? 'var(--accent-viz)' : 'var(--context-2)', p = Math.min(proc(t), 20);
          return `<line x1="${x(t)}" y1="34" x2="${x(p)}" y2="106" stroke="${c}" stroke-width="${f ? 2 : 1}" opacity="${f ? 1 : .55}"/>
          <circle cx="${x(t)}" cy="30" r="${f ? 6 : 4.5}" fill="${c}"/><circle cx="${x(p)}" cy="110" r="${f ? 6 : 4.5}" fill="${c}"/>`;
        }).join('')}
        <text x="${x(FRAUD)}" y="14" text-anchor="middle" style="fill:var(--accent);font-weight:600">fraudulent payment</text>
      </svg>
      <div class="readout">
        <div><div class="k">Average latency</div><div class="v">${fmt(avg, 2)} s</div></div>
        <div><div class="k">Fraud flagged after</div><div class="v accent">${fmt(fraudLag, 1)} s</div></div>
        <div><div class="k">Work pattern</div><div class="v" style="font-size:15px">${mode === 'batch' ? `${Math.ceil(20 / win)} chunks` : '15 single events'}</div></div>
      </div>
      <div class="explain">${mode === 'batch' ? `Batch waits for the window to close, so latency grows with the window. Fine for a <strong>daily sales report</strong>, too slow to stop a <strong>fraudulent card</strong> before the next purchase.` : `Stream handles each event as it arrives: latency stays near zero. This is why <strong>fraud detection, alerts, personalization and IoT</strong> use streaming (Kafka, Flink).`}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { mode = b.dataset.v; render(); });
  el.addEventListener('input', e => { if (e.target.id === 'bwin') e.target.previousElementSibling.querySelector('.val').textContent = e.target.value + ' s'; });
  el.addEventListener('change', e => { if (e.target.id === 'bwin') { win = +e.target.value; render(); el.querySelector('#bwin')?.focus(); } });
  render();
}

const LIFE = [
  ['Business understanding', 'target', 'Success depends on the questions and goals you set. What questions do you have for the data? What constraints (e.g. budget)? Google might ask: what is a relevant search result?'],
  ['Data collection', 'tray-arrow-down', 'Data is precious. What is available? What should we add? Which ratios to maintain? Record sources, units, methodologies (e.g. scraping).'],
  ['Data preparation', 'broom', 'Understand the data, clean it, structure it. Usually the longest step.'],
  ['Modeling', 'graph', 'Find patterns. Choose a model that fits the task and the data: regression, classification, clustering...'],
  ['Model evaluation', 'check-square', 'How accurate is the output? Are the answers sensible? Engineers help by providing good data for the model.'],
  ['Presentation / visualization', 'presentation-chart', 'Choose which outputs to show the business owner to tell the story. Visualize outputs and the model.'],
  ['Deployment', 'rocket-launch', 'Where to host it? Who will use and maintain it? Make sure the pipeline is sustainable.'],
];
export function lifecycle(el) {
  let i = 0;
  const render = () => {
    const cx = 150, cy = 140, R = 104;
    el.innerHTML = `${bench('arrows-clockwise', 'Life cycle of a data science project', 'Click a step or use Next')}
    <div class="bench-body"><div class="gestalt-stage">
      <svg class="viz" viewBox="0 0 300 280" role="img" aria-label="Seven-step life cycle wheel">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line-strong)" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--accent-viz)" stroke-width="3" stroke-linecap="round"
          stroke-dasharray="${2 * Math.PI * R}" stroke-dashoffset="${2 * Math.PI * R * (1 - (i + 1) / 7)}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dashoffset .6s var(--ease)"/>
        ${LIFE.map((s, k) => {
          const a = -Math.PI / 2 + k * 2 * Math.PI / 7, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a), on = k === i;
          return `<g class="map-node" data-i="${k}" tabindex="0" role="button" aria-label="Step ${k + 1}: ${s[0]}">
            <circle cx="${px}" cy="${py}" r="${on ? 19 : 15}" fill="${on ? 'var(--accent-viz)' : k < i ? 'var(--ink)' : 'var(--surface)'}" stroke="${on ? 'var(--accent-viz)' : 'var(--line-strong)'}" style="transition:all .3s"/>
            <text x="${px}" y="${py + 4}" text-anchor="middle" style="fill:${on || k < i ? 'var(--bg)' : 'var(--ink)'};font:600 12px var(--mono)">${k + 1}</text></g>`;
        }).join('')}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="lbl-strong" style="font-size:13px">Step ${i + 1} of 7</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle">iterate when needed</text>
      </svg>
      <div>
        <h3 style="display:flex;gap:8px;align-items:center"><i class="ph ph-${LIFE[i][1]}" style="color:var(--accent)"></i>${LIFE[i][0]}</h3>
        <p class="muted" style="margin-top:8px">${LIFE[i][2]}</p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn sm" data-step="-1" ${i === 0 ? 'disabled' : ''}><i class="ph ph-arrow-left"></i>Back</button>
          <button class="btn sm primary" data-step="1">${i === 6 ? 'Start over' : 'Next'}<i class="ph ph-arrow-right"></i></button>
        </div>
      </div>
    </div></div>`;
  };
  on(el, '.map-node', 'click', (e, g) => { i = +g.dataset.i; render(); });
  on(el, '.map-node', 'keydown', (e, g) => { if (e.key === 'Enter') { i = +g.dataset.i; render(); } });
  on(el, '[data-step]', 'click', (e, b) => { i = (i + +b.dataset.step + 7) % 7; render(); });
  render();
}

export function datatypes(el) {
  sorter(el, {
    id: 'l2-types', icon: 'tag', title: 'Classify the attribute: NOIR', options: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    items: [
      { t: 'Marital status (single, married, divorced)', a: 'Nominal', why: 'Named classes with no natural order.' },
      { t: 'T-shirt size (S, M, L, XL)', a: 'Ordinal', why: 'Ordered categories, but the "gap" between sizes is not a measured amount.' },
      { t: 'Temperature in °C', a: 'Interval', why: 'Equal steps, but 0 °C is not "no heat", so ratios are meaningless.' },
      { t: 'Weight in grams', a: 'Ratio', why: 'True zero: 4 g is twice 2 g.' },
      { t: '"How happy are you with your order?" (unhappy, neutral, happy)', a: 'Ordinal', why: 'The lecture\'s own ordinal example.' },
      { t: 'Hours worked per week', a: 'Ratio', why: '0 hours means none, and 40 is twice 20.' },
      { t: 'Payment method (cash, card, wallet)', a: 'Nominal', why: 'Labels only.' },
      { t: 'Calendar year (2019, 2024)', a: 'Interval', why: 'Differences are meaningful (5 years) but year 0 is arbitrary.' },
      { t: 'Education level (high school, BSc, MSc, PhD)', a: 'Ordinal', why: 'Ordered, distances not equal or measured.' },
      { t: 'Monthly income in EGP', a: 'Ratio', why: 'True zero and meaningful ratios.' },
    ],
  });
}

export function structure(el) {
  sorter(el, {
    id: 'l2-struct', icon: 'shapes', title: 'Structured, semi-structured or unstructured?', options: ['Structured', 'Semi-structured', 'Unstructured'],
    items: [
      { t: 'A SQL table of orders with fixed columns', a: 'Structured', why: 'Tabular with a schema, queryable with SQL.' },
      { t: 'An XML product feed', a: 'Semi-structured', why: 'Tags give structure without a rigid table schema.' },
      { t: 'A JSON response from a weather API', a: 'Semi-structured', why: 'Nested keys and values, flexible shape.' },
      { t: 'Photos uploaded by users', a: 'Unstructured', why: 'Pixels; any structure is implicit.' },
      { t: 'A tweet\'s free text', a: 'Unstructured', why: 'Social media posts are unstructured text.' },
      { t: 'A CSV export (per the lecture)', a: 'Semi-structured', why: 'The lecture lists CSV under semi-structured: separators but no enforced types or schema.' },
      { t: 'A social graph of who follows whom', a: 'Semi-structured', why: 'The lecture lists graphs under semi-structured.' },
      { t: 'A folder of scanned PDF contracts', a: 'Unstructured', why: 'Documents and images need extraction before analysis.' },
    ],
  });
}

const WIDE = { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], locs: ['333', '328', '327'], v: [[5, 3, 2], [2, 7, 3], [1, 2, 3], [5, 2, 3], [5, 6, 3], [5, 6, 10]] };
export function tidy(el) {
  let long = false;
  const render = () => {
    let id = 1;
    el.innerHTML = `${bench('table', 'Tidy the table', long ? 'One row per observation' : 'Spot the problem first')}
    <div class="bench-body">
      <div class="controls">${seg([['wide', 'Messy (wide)'], ['long', 'Tidy (long)']], long ? 'long' : 'wide')}</div>
      <div class="two" style="align-items:start">
        <div class="tbl-wrap" style="max-height:330px;overflow:auto">${long
          ? `<table class="tbl"><tr><th>ID</th><th>Time</th><th>Location</th><th>Number</th></tr>${WIDE.days.flatMap((d, r) => WIDE.locs.map((l, c) => `<tr style="animation:viewIn .35s var(--ease) ${(r * 3 + c) * 25}ms both"><td class="num">${id++}</td><td>${d}</td><td class="num hl">${l}</td><td class="num">${WIDE.v[r][c]}</td></tr>`)).join('')}</table>`
          : `<table class="tbl"><tr><th></th>${WIDE.locs.map(l => `<th class="hl" style="color:var(--accent)">${l}</th>`).join('')}</tr>${WIDE.days.map((d, r) => `<tr><td>${d}</td>${WIDE.v[r].map(v => `<td class="num">${v}</td>`).join('')}</tr>`).join('')}</table>`}
        </div>
        <div class="explain" style="margin-top:0">${long
          ? `<strong>Fixed.</strong> Every row is one observation (a day at a location), every column is one variable (Time, Location, Number). The 6 × 3 grid became <span class="num">18</span> rows. Now you can filter, group by location or plot directly.`
          : `<strong>Is it good?</strong> No. The headers <span class="hl">333, 328, 327</span> are <em>values</em> of a hidden variable (Location), not variable names. And it is unclear what the numbers count. Rule: headers are variables, not values.`}</div>
      </div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { long = b.dataset.v === 'long'; render(); });
  render();
}
