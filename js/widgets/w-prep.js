// Lecture 6 and Labs 1-2 widgets: data quality, preprocessing, scraping, EDA, cleaning.
import { bench, on, seg, setSeg, scale, fmt, mean, median, std, quantile, fiveNum, xAxis, yGrid, niceTicks, boxplotSVG, histogram, esc } from '../viz.js';
import { sorter } from './w-foundations.js';
import { CGPA, MARKS } from '../placement.js';

// ---------- quality: anatomy of a bad record + dimension game ----------
const REC = [
  [['T.Das', 'name'], ['97336o8327', 'phone'], ['24.95', 'amt'], ['Y', 'flag'], ['-', 'dash'], ['0.0', 'zero'], ['1000', 'k']],
  [['Ted J.', 'name'], ['973 -360 -8779', 'phone2'], ['2000', 'amt'], ['N', 'flag'], ['M', 'sex'], ['NY', 'state'], ['1000', 'k']],
];
const DIAG = {
  phone: ['Accuracy', 'A letter "o" sits where a digit 0 should be. The value is simply wrong.'],
  phone2: ['Consistency', 'Same kind of field, different format: "97336o8327" vs "973 -360 -8779".'],
  name: ['Integrity', '"T.Das" and "Ted J." in different formats: are they the same person? Nothing enforces a link between records.'],
  amt: ['Interpretability', 'Is 24.95 a price? Is 2000 a salary? No unit, no header: the data cannot be understood.'],
  flag: ['Interpretability', 'Y and N for what? A flag without a definition is unreadable.'],
  dash: ['Completeness', 'A dash where a value should be. Missing data disguised as a character.'],
  zero: ['Believability', 'Is 0.0 a real measurement or a default filler? You cannot trust it.'],
  sex: ['Consistency', 'Record 1 has "-" in this column, record 2 has "M": the column mixes placeholders and codes.'],
  state: ['Consistency', 'Record 1 has 0.0 in the same position where record 2 has a state code. Columns do not line up.'],
  k: ['Interpretability', 'Both rows end in 1000. A constant with no label might be a limit, a code or a mistake.'],
};
export function quality(el) {
  let pick = null;
  const render = () => {
    el.innerHTML = `${bench('magnifying-glass', 'Diagnose the raw records', 'Click any field')}
    <div class="bench-body">
      ${REC.map(r => `<div style="display:flex;flex-wrap:wrap;gap:0;font:500 15px var(--mono);margin-bottom:8px">${r.map(([v, k], i) => `${i ? '<span class="muted" style="padding:6px 2px">|</span>' : ''}<button type="button" data-k="${k}" style="border:1px dashed ${pick === k ? 'var(--accent-viz)' : 'var(--line-strong)'};background:${pick === k ? 'var(--accent-soft)' : 'var(--surface)'};border-radius:6px;padding:5px 9px;font:inherit">${esc(v)}</button>`).join('')}</div>`).join('')}
      <div class="explain">${pick ? `<strong class="hl">${DIAG[pick][0]}.</strong> ${DIAG[pick][1]}` : 'Two records copied from the lecture slide. Every field hides a quality problem. Which dimension does each one break?'}</div>
    </div>`;
  };
  on(el, '[data-k]', 'click', (e, b) => { pick = b.dataset.k; render(); });
  render();
  const game = document.createElement('div');
  game.className = 'bench';
  el.after(game);
  sorter(game, {
    id: 'l6-quality', icon: 'seal-check', title: 'Which quality dimension fails?', cols: 280,
    options: ['Accuracy', 'Completeness', 'Consistency', 'Timeliness', 'Integrity', 'Believability', 'Interpretability'],
    items: [
      { t: 'A customer\'s age is stored as 230.', a: 'Accuracy', why: 'The value is not correct.' },
      { t: '30% of contact records have no email address.', a: 'Completeness', why: 'We do not have everything we need.' },
      { t: 'One system stores weight in kg, another in lb, both in a column called "weight".', a: 'Consistency', why: 'Units and formats differ across places.' },
      { t: 'The sales dashboard shows last month\'s numbers on the morning of the board meeting.', a: 'Timeliness', why: 'Data is not updated when needed.' },
      { t: 'An order references customer_id 9912, which does not exist in the customers table.', a: 'Integrity', why: 'A required relationship is not enforced.' },
      { t: 'Survey data from an unknown vendor with no description of how it was collected.', a: 'Believability', why: 'We cannot trust the source.' },
      { t: 'A column named "x7_flg" with values 0, 1, 9 and no documentation.', a: 'Interpretability', why: 'Nobody can understand it.' },
    ],
  });
}

// ---------- transformation demos ----------
export function transform(el) {
  let t = 'normalize', win = 5, cut1 = 30, cut2 = 55;
  const DAILY = Array.from({ length: 60 }, (_, i) => Math.round(50 + i * .6 + 14 * Math.sin(i * 1.3) + 9 * Math.cos(i * 2.9)));
  const AGES = [19, 23, 25, 27, 31, 34, 38, 41, 45, 47, 52, 58, 61, 66, 72];
  const render = () => {
    let body = '', note = '';
    if (t === 'normalize') {
      const mn = Math.min(...AGES), mx = Math.max(...AGES), m = mean(AGES), s = std(AGES);
      body = `<div class="tbl-wrap"><table class="tbl"><tr><th>age</th>${AGES.map(a => `<td class="num">${a}</td>`).join('')}</tr>
        <tr><th>min-max</th>${AGES.map(a => `<td class="num hl">${fmt((a - mn) / (mx - mn), 2)}</td>`).join('')}</tr>
        <tr><th>z-score</th>${AGES.map(a => `<td class="num">${fmt((a - m) / s, 2)}</td>`).join('')}</tr></table></div>
        <div class="formula">min-max: x' = (x − min) / (max − min) = (x − ${mn}) / ${mx - mn} &nbsp;&nbsp; z-score: z = (x − ${fmt(m, 1)}) / ${fmt(s, 1)}</div>`;
      note = '<strong>Normalization</strong> represents data in a smaller range so features with big numbers do not dominate. Min-max maps to [0, 1]; z-score centers on 0 with unit spread.';
    } else if (t === 'discretize') {
      const lab = a => a < cut1 ? 'Young' : a < cut2 ? 'Adult' : 'Senior';
      const x = scale(15, 75, 30, 690);
      body = `<div class="controls"><div class="field"><label for="c1">Cut 1 <span class="val">${cut1}</span></label><input id="c1" type="range" min="20" max="45" value="${cut1}"></div><div class="field"><label for="c2">Cut 2 <span class="val">${cut2}</span></label><input id="c2" type="range" min="46" max="70" value="${cut2}"></div></div>
        <svg class="viz" viewBox="0 0 720 100">${[[15, cut1, 'Young'], [cut1, cut2, 'Adult'], [cut2, 75, 'Senior']].map(([a, b, l], i) => `<rect x="${x(a)}" y="20" width="${x(b) - x(a)}" height="40" fill="${['var(--sunken)', 'var(--surface-2)', 'var(--accent-soft)'][i]}" stroke="var(--line)"/><text x="${(x(a) + x(b)) / 2}" y="14" text-anchor="middle" class="lbl-strong">${l} (${AGES.filter(v => lab(v) === l).length})</text>`).join('')}
        ${AGES.map(a => `<circle cx="${x(a)}" cy="40" r="6" fill="var(--context-2)"/>`).join('')}${xAxis(x, [20, 30, 40, 50, 60, 70], 64, v => v)}</svg>`;
      note = '<strong>Discretization</strong> splits a continuous attribute into intervals (bins with labels). Useful for reports and some models; you lose detail inside each bin.';
    } else {
      const sm = DAILY.map((_, i) => { const a = DAILY.slice(Math.max(0, i - Math.floor(win / 2)), i + Math.ceil(win / 2)); return mean(a); });
      const months = [0, 1].map(k => DAILY.slice(k * 30, k * 30 + 30).reduce((a, b) => a + b, 0));
      const x = scale(0, 59, 40, 690), y = scale(20, 110, 180, 10);
      body = t === 'smooth'
        ? `<div class="controls"><div class="field"><label for="win">Moving-average window <span class="val">${win} days</span></label><input id="win" type="range" min="1" max="15" step="2" value="${win}"></div></div>
          <svg class="viz" viewBox="0 0 720 200">${yGrid(y, [40, 70, 100], 40, 690, v => v)}<polyline points="${DAILY.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="var(--context)" stroke-width="1.5"/><polyline points="${sm.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="var(--accent-viz)" stroke-width="3"/></svg>`
        : `<div class="two"><svg class="viz" viewBox="0 0 360 200"><text x="0" y="14" class="lbl-strong">60 daily values</text>${DAILY.map((v, i) => `<rect x="${i * 5.8 + 6}" y="${190 - v * 1.4}" width="4" height="${v * 1.4}" fill="var(--context)"/>`).join('')}</svg>
           <svg class="viz" viewBox="0 0 360 200"><text x="0" y="14" class="lbl-strong">aggregated: monthly sum</text>${months.map((v, i) => `<rect x="${40 + i * 150}" y="${190 - v / 25}" width="110" height="${v / 25}" rx="4" fill="${i ? 'var(--accent-viz)' : 'var(--context-2)'}"/><text x="${95 + i * 150}" y="${182 - v / 25}" text-anchor="middle" class="num">${v.toLocaleString()}</text>`).join('')}</svg></div>`;
      note = t === 'smooth' ? '<strong>Smoothing</strong> removes noise so the trend shows. A wider window gives a smoother line but reacts later to real changes.' : '<strong>Aggregation</strong> summarizes many rows into fewer (daily → monthly). It also reduces volume, so it overlaps with numerosity reduction.';
    }
    el.innerHTML = `${bench('arrows-clockwise', 'Data transformation toolkit')}
    <div class="bench-body"><div class="controls">${seg([['normalize', 'Normalization'], ['discretize', 'Discretization'], ['smooth', 'Smoothing'], ['aggregate', 'Aggregation']], t)}</div>${body}<div class="explain">${note}</div></div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { t = b.dataset.v; render(); });
  el.addEventListener('change', e => { const id = e.target.id; if (id === 'win') win = +e.target.value; if (id === 'c1') cut1 = +e.target.value; if (id === 'c2') cut2 = +e.target.value; render(); el.querySelector('#' + id)?.focus(); });
  render();
}

// ---------- dirty contacts cleaner ----------
const DIRTY = [
  { name: 'Mona Adel', email: 'mona.adel@mail.com', country: 'Egypt', age: 29, born: '1996-05-12' },
  { name: 'Omar Said', email: '', country: 'United States', age: 34, born: '1991-08-03' },
  { name: 'Lina Farouk', email: 'lina@mail.com', country: 'U.S.', age: -20, born: '2001-09-30' },
  { name: 'Mona Adel', email: 'mona.adel@mail.com', country: 'Egypt', age: 29, born: '1996-05-12', dup: true },
  { name: 'Karim Nabil', email: 'karim@mail.com', country: 'US', age: 45, born: '1980-01-01' },
  { name: 'Sara Hany', email: 'sara@mail', country: 'egypt', age: 31, born: '1994-07-21' },
  { name: 'Youssef Ali', email: 'y.ali@mail.com', country: 'Egypt', age: 27, born: '1998-01-01' },
];
const ACTIONS = [
  ['dedupe', 'Remove duplicates', 'Duplicate data'],
  ['country', 'Standardize country', 'Inconsistent formatting'],
  ['age', 'Age < 0 → NaN', 'Noisy data (error)'],
  ['jan1', 'Jan 1 birthdays → NaN', 'Disguised missing data'],
  ['email', 'Flag invalid emails', 'Inaccurate data'],
  ['unknown', 'Empty email → "unknown"', 'Global constant'],
];
export function cleaner(el) {
  const on_ = {};
  const render = () => {
    const rows = DIRTY.map(r => ({ ...r, c: {} }));
    rows.forEach(r => {
      if (!r.email) r.c.email = 'bad';
      if (r.email && !/^[^@]+@[^@]+\.[a-z]{2,}$/.test(r.email)) r.c.email = on_.email ? 'flag' : 'bad';
      if (!['Egypt', 'United States'].includes(r.country)) r.c.country = 'bad';
      if (r.age < 0) r.c.age = 'bad';
      if (r.born.endsWith('-01-01')) r.c.born = 'bad';
    });
    if (on_.dedupe) rows.forEach(r => { if (r.dup) r.gone = true; });
    if (on_.country) rows.forEach(r => { if (r.c.country) { r.country = { 'U.S.': 'United States', US: 'United States', egypt: 'Egypt' }[r.country]; r.c.country = 'fix'; } });
    if (on_.age) rows.forEach(r => { if (r.c.age) { r.age = 'NaN'; r.c.age = 'fix'; } });
    if (on_.jan1) rows.forEach(r => { if (r.c.born) { r.born = 'NaN'; r.c.born = 'fix'; } });
    if (on_.unknown) rows.forEach(r => { if (!r.email) { r.email = 'unknown'; r.c.email = 'warn'; } });
    const open = rows.filter(r => !r.gone).reduce((n, r) => n + Object.values(r.c).filter(v => v === 'bad').length + (r.dup ? 1 : 0), 0);
    const td = (r, k) => `<td class="${k === 'age' ? 'num' : ''} ${r.c[k] === 'bad' ? 'cell-bad' : r.c[k] === 'fix' ? 'cell-fix' : ''}" ${r.c[k] === 'warn' ? 'style="color:var(--accent);font-weight:600"' : ''}>${esc(r[k] === '' ? '(empty)' : r[k])}${r.c[k] === 'flag' ? ' <span class="chip accent" style="padding:1px 7px">invalid</span>' : ''}</td>`;
    el.innerHTML = `${bench('broom', 'Clean the contacts table', `<span class="num">${open}</span> open problems`)}
    <div class="bench-body">
      <div class="chips" style="margin-bottom:14px">${ACTIONS.map(([k, l, p]) => `<button class="chip" data-a="${k}" aria-pressed="${!!on_[k]}" title="${p}">${on_[k] ? '<i class="ph ph-check"></i>' : ''}${l}</button>`).join('')}</div>
      <div class="tbl-wrap"><table class="tbl"><tr><th>name</th><th>email</th><th>country</th><th>age</th><th>birthdate</th></tr>
      ${rows.map(r => `<tr class="${r.gone ? 'gone' : r.dup ? 'flag' : ''}">${['name', 'email', 'country', 'age', 'born'].map(k => k === 'name' ? `<td>${r.name}${r.dup && !r.gone ? ' <span class="cell-bad small">dup</span>' : ''}</td>` : td(r, k)).join('')}</tr>`).join('')}</table></div>
      <div class="explain">${on_.unknown ? '<strong>Careful with "unknown":</strong> a global constant keeps the row, but an algorithm may treat "unknown" as a meaningful, interesting value. ' : ''}${on_.jan1 ? 'Two people born on January 1st is suspicious: a form default disguised as data. ' : 'Red cells are problems. Each button applies one technique; hover it to see which problem type it targets. '}${open === 0 ? '<strong class="hl">All problems handled.</strong>' : ''}</div>
    </div>`;
  };
  on(el, '[data-a]', 'click', (e, b) => { on_[b.dataset.a] = !on_[b.dataset.a]; render(); });
  render();
}

// ---------- imputation comparison ----------
const INC = { Low: [62, 55, 70, 48, 85, 58, 66, 240, 52, 60], High: [22, 28, 18, 31, 25, 35, 20, 27, 24, 30] };
const MISS = { Low: [3, 6], High: [2, 5, 8] };
export function impute(el) {
  let s = 'mean';
  const render = () => {
    const obs = { Low: INC.Low.filter((_, i) => !MISS.Low.includes(i)), High: INC.High.filter((_, i) => !MISS.High.includes(i)) };
    const all = [...obs.Low, ...obs.High];
    const fill = cls => ({ drop: null, zero: 0, mean: mean(all), median: median(all), cmean: mean(obs[cls]), cmedian: median(obs[cls]) }[s]);
    const pts = [], errs = [];
    ['Low', 'High'].forEach(cls => INC[cls].forEach((v, i) => {
      if (MISS[cls].includes(i)) { const f = fill(cls); if (f !== null) { pts.push({ v: f, cls, imp: true, truth: v }); errs.push(Math.abs(f - v)); } }
      else pts.push({ v, cls });
    }));
    const vals = pts.map(p => p.v);
    const x = scale(0, 250, 90, 700);
    el.innerHTML = `${bench('syringe', 'Missing-value strategies compared', 'Monthly income ($K) by credit-risk class, 5 values missing (sample data)')}
    <div class="bench-body">
      <div class="controls">${seg([['drop', 'Ignore tuple'], ['zero', 'Constant 0'], ['mean', 'Mean'], ['median', 'Median'], ['cmean', 'Class mean'], ['cmedian', 'Class median']], s)}</div>
      <svg class="viz" viewBox="0 0 720 170" role="img" aria-label="Incomes by class with imputed values">
        ${['Low', 'High'].map((cls, r) => `<text x="80" y="${50 + r * 60}" text-anchor="end" class="lbl-strong">${cls} risk</text><line x1="90" x2="700" y1="${46 + r * 60}" y2="${46 + r * 60}" stroke="var(--line)"/>
          ${pts.filter(p => p.cls === cls).map(p => `<circle cx="${x(p.v)}" cy="${46 + r * 60}" r="${p.imp ? 7 : 5.5}" fill="${p.imp ? 'var(--accent-viz)' : 'var(--context-2)'}" opacity="${p.imp ? 1 : .8}" ${p.imp ? 'stroke="var(--surface)" stroke-width="2"' : ''}/>`).join('')}
          ${MISS[cls].map(i => `<circle cx="${x(INC[cls][i])}" cy="${46 + r * 60}" r="7" fill="none" stroke="var(--ink)" stroke-dasharray="2 2"/>`).join('')}`).join('')}
        ${xAxis(x, [0, 50, 100, 150, 200, 250], 140, v => v)}
      </svg>
      <div class="small muted" style="margin:-4px 0 6px">Orange = imputed value. Dashed ring = the true value we pretended not to know.</div>
      <div class="readout">
        <div><div class="k">Rows used</div><div class="v">${vals.length} / 20</div></div>
        <div><div class="k">Resulting mean</div><div class="v">${fmt(mean(vals), 1)}</div></div>
        <div><div class="k">True mean</div><div class="v">${fmt(mean([...INC.Low, ...INC.High]), 1)}</div></div>
        <div><div class="k">Avg error of fills</div><div class="v accent">${errs.length ? fmt(mean(errs), 1) : 'n/a'}</div></div>
      </div>
      <div class="explain">${{
        drop: 'Dropping loses 25% of the rows. If missing values cluster in one class, the remaining data is biased.',
        zero: 'A constant 0 invents five people with no income. It drags the mean down and creates a fake pattern.',
        mean: 'The overall mean is pulled up by the 240 outlier, so high-risk customers get incomes far above their class.',
        median: 'The median resists the outlier, but it still ignores that the two classes earn very differently.',
        cmean: 'Better: each fill uses its own class. The low-risk class mean is still inflated by the 240 outlier.',
        cmedian: '<strong>Best here:</strong> multivariate (class-based) and robust to skew. This is the lecture\'s advice: class median for skewed data.',
      }[s]}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { s = b.dataset.v; render(); });
  render();
}

// ---------- DOM + BeautifulSoup selectors ----------
const DOM = [
  ['<html><head><title>Quotes to Scrape</title></head>', ['title']],
  ['<body>', []],
  ['  <div class="quote">', ['quote']],
  ['    <span class="text">"The world as we have created it..."</span>', ['quote', 'text', 'text1']],
  ['    <span>by <small class="author">Albert Einstein</small></span>', ['quote', 'author', 'author1']],
  ['    <div class="tags">', ['quote']],
  ['      <a class="tag" href="/tag/change/">change</a>', ['quote', 'tag']],
  ['      <a class="tag" href="/tag/thinking/">thinking</a>', ['quote', 'tag']],
  ['    </div>', ['quote']],
  ['  </div>', ['quote']],
  ['  <div class="quote">', ['quote']],
  ['    <span class="text">"It is our choices, Harry..."</span>', ['quote', 'text']],
  ['    <span>by <small class="author">J.K. Rowling</small></span>', ['quote', 'author']],
  ['    <div class="tags">', ['quote']],
  ['      <a class="tag" href="/tag/choices/">choices</a>', ['quote', 'tag']],
  ['    </div>', ['quote']],
  ['  </div>', ['quote']],
  ['  <li class="next"><a href="/page/2/">Next →</a></li>', ['next']],
  ['</body></html>', []],
];
const SEL = [
  ['title', 'soup.title.string', "'Quotes to Scrape'"],
  ['text1', "soup.find('span', class_='text')", '<span class="text">"The world as we have created it..."</span>  ← first match only'],
  ['text', "soup.find_all('span', class_='text')", '[<span class="text">"The world as..."</span>, <span class="text">"It is our choices..."</span>]  ← a list'],
  ['quote', "soup.select('div.quote')", '[<div class="quote">…</div>, <div class="quote">…</div>]  ← 2 blocks to loop over'],
  ['author1', "soup.select_one('small.author').get_text(strip=True)", "'Albert Einstein'"],
  ['tag', "[t.get_text(strip=True) for t in soup.select('div.tags a.tag')]", "['change', 'thinking', 'choices']"],
  ['next', "soup.select_one('li.next a')['href']", "'/page/2/'  ← no next link on the last page, so the loop stops"],
];
export function dom(el) {
  let k = 'quote';
  const render = () => {
    const s = SEL.find(x => x[0] === k);
    el.innerHTML = `${bench('brackets-angle', 'Selectors on a real page structure', 'Pick a call, watch what it matches')}
    <div class="bench-body">
      <div class="chips" style="margin-bottom:12px">${SEL.map(([id, code]) => `<button class="chip" data-s="${id}" aria-pressed="${id === k}" style="font-family:var(--mono);font-size:12px">${esc(code.length > 44 ? code.slice(0, 42) + '…' : code)}</button>`).join('')}</div>
      <pre class="code" style="padding:10px 8px">${DOM.map(([line, tags]) => `<span class="dom-line ${tags.includes(k) ? 'hit' : ''}">${esc(line)}</span>`).join('')}</pre>
      <pre class="code"><span class="c"># ${esc(s[1])}</span>\n<span class="s">${esc(s[2])}</span></pre>
    </div>`;
  };
  on(el, '[data-s]', 'click', (e, b) => { k = b.dataset.s; render(); });
  render();
}

// ---------- EDA console on adult.csv ----------
const AGEB = [[15, 2510], [20, 5922], [25, 6083], [30, 6494], [35, 6435], [40, 5758], [45, 4966], [50, 3805], [55, 2814], [60, 1968], [65, 1086], [70, 556], [75, 259], [80, 114], [85, 17], [90, 55]];
const CMDS = {
  shape: ['df.shape', '(48842, 15)', '48,842 rows (people) and 15 columns (attributes).'],
  info: ['df.info()', `RangeIndex: 48842 entries, 0 to 48841
 #   Column           Non-Null Count  Dtype
 0   age              48842 non-null  int64
 1   workclass        48842 non-null  object
 2   fnlwgt           48842 non-null  int64
 3   education        48842 non-null  object
 4   educational-num  48842 non-null  int64
 5   marital-status   48842 non-null  object
 6   occupation       48842 non-null  object
 7   relationship     48842 non-null  object
 8   race             48842 non-null  object
 9   gender           48842 non-null  object
 10  capital-gain     48842 non-null  int64
 11  capital-loss     48842 non-null  int64
 12  hours-per-week   48842 non-null  int64
 13  native-country   48842 non-null  object
 14  income           48842 non-null  object
dtypes: int64(6), object(9)`, '6 numeric and 9 text columns; every column claims to be fully non-null.'],
  describe: ['df[["age","hours-per-week"]].describe()', `       age        hours-per-week
count  48842.00   48842.00
mean      38.64      40.42
std       13.71      12.39
min       17.00       1.00
25%       28.00      40.00
50%       37.00      40.00
75%       48.00      45.00
max       90.00      99.00`, 'Age: mean 38.6 > median 37, a mild right skew. Hours: half the people work exactly 40.'],
  isna: ['df.isna().sum()', 'age 0\nworkclass 0\noccupation 0\nnative-country 0\n... every column 0', 'Zero missing values? Suspicious. Check the unique values.'],
  q: ['(df == "?").sum()', 'workclass        2799\noccupation       2809\nnative-country    857\n(all other columns 0)', 'Missing values were hiding as "?". 6,465 cells in three columns.'],
  target: ['df["income"].value_counts()', '<=50K    37155\n>50K     11687', 'Imbalanced target: about 76% earn ≤50K. A model that always says "≤50K" is already 76% accurate.'],
  hist: ["df['age'].hist(bins=20)", null, 'Right-skewed: many people in their 20s-40s, a thin tail to 90.'],
  box: ['sns.boxplot(data=df, x="income", y="hours-per-week")', null, 'People earning >50K work more hours: median 40 for both, but the >50K box reaches 50 at Q3.'],
};
export function eda(el) {
  let k = 'shape';
  const render = () => {
    const [code, out, note] = CMDS[k];
    let vis = '';
    if (k === 'hist') { const x = scale(15, 95, 40, 690), y = scale(0, 7000, 170, 10); vis = `<svg class="viz" viewBox="0 0 720 200">${yGrid(y, [0, 2000, 4000, 6000], 40, 690, v => v)}${AGEB.map(([a, c]) => `<rect x="${x(a)}" y="${y(c)}" width="${x(a + 5) - x(a) - 1}" height="${170 - y(c)}" fill="var(--context)"/>`).join('')}${xAxis(x, [20, 30, 40, 50, 60, 70, 80, 90], 170, v => v)}</svg>`; }
    if (k === 'box') {
      const x = scale(0, 100, 90, 690);
      const bx = (f, yy, c) => `<line x1="${x(f[0])}" x2="${x(f[4])}" y1="${yy}" y2="${yy}" stroke="var(--ink-2)"/><rect x="${x(f[1])}" y="${yy - 16}" width="${Math.max(3, x(f[3]) - x(f[1]))}" height="32" fill="color-mix(in srgb, ${c} 18%, transparent)" stroke="${c}" stroke-width="1.5"/><line x1="${x(f[2])}" x2="${x(f[2])}" y1="${yy - 16}" y2="${yy + 16}" stroke="${c}" stroke-width="3"/>`;
      vis = `<svg class="viz" viewBox="0 0 720 150"><text x="80" y="44" text-anchor="end" class="lbl-strong">≤50K</text><text x="80" y="104" text-anchor="end" class="lbl-strong">&gt;50K</text>${bx([1, 35, 40, 40, 99], 40, 'var(--context-2)')}${bx([1, 40, 40, 50, 99], 100, 'var(--accent-viz)')}${xAxis(x, [0, 20, 40, 60, 80, 100], 128, v => v)}</svg><div class="tiny muted">Whiskers drawn to min/max for simplicity; seaborn would mark many points beyond 1.5·IQR as outliers.</div>`;
    }
    el.innerHTML = `${bench('terminal-window', 'EDA console: adult.csv', 'Real outputs from the Lab 1 dataset')}
    <div class="bench-body">
      <div class="chips" style="margin-bottom:12px">${Object.entries(CMDS).map(([id, [c]]) => `<button class="chip" data-c="${id}" aria-pressed="${id === k}" style="font-family:var(--mono);font-size:12px">${esc(c)}</button>`).join('')}</div>
      <pre class="code"><span class="k">&gt;&gt;&gt;</span> ${esc(code)}${out ? `\n${esc(out)}` : ''}</pre>${vis}
      <div class="explain">${note}</div>
    </div>`;
  };
  on(el, '[data-c]', 'click', (e, b) => { k = b.dataset.c; render(); });
  render();
}

// ---------- fillna playground ----------
const SER = [12.5, null, 14.0, null, null, 18.0, 15.5, null];
export function fillna(el) {
  let m = 'ffill';
  const run = () => {
    const nn = SER.filter(v => v !== null);
    switch (m) {
      case 'dropna': return SER.filter(v => v !== null).map(v => ({ v }));
      case 'zero': return SER.map(v => v === null ? { v: 0, f: 1 } : { v });
      case 'ffill': { let last = null; return SER.map(v => { if (v === null) return { v: last, f: last !== null }; last = v; return { v }; }); }
      case 'bfill': { let next = null; return [...SER].reverse().map(v => { if (v === null) return { v: next, f: next !== null }; next = v; return { v }; }).reverse(); }
      case 'mean': return SER.map(v => v === null ? { v: mean(nn), f: 1 } : { v });
      case 'median': return SER.map(v => v === null ? { v: median(nn), f: 1 } : { v });
    }
  };
  const CODE = { dropna: 'df["price_per_unit"].dropna()', zero: 'df["price_per_unit"].fillna(0)', ffill: 'df["price_per_unit"].ffill()', bfill: 'df["price_per_unit"].bfill()', mean: 'df["price_per_unit"].fillna(df["price_per_unit"].mean())', median: 'df["price_per_unit"].fillna(df["price_per_unit"].median())' };
  const render = () => {
    const out = run();
    const cell = (v, cls = '') => `<td class="num ${cls}" style="text-align:center">${v === null ? '<span class="cell-bad">NaN</span>' : fmt(v, 2)}</td>`;
    el.innerHTML = `${bench('drop', 'fillna playground', 'price_per_unit with 4 missing values')}
    <div class="bench-body">
      <div class="controls">${seg([['dropna', 'dropna()'], ['zero', 'fillna(0)'], ['ffill', 'ffill()'], ['bfill', 'bfill()'], ['mean', 'mean'], ['median', 'median']], m)}</div>
      <div class="tbl-wrap"><table class="tbl"><tr><th>before</th>${SER.map(v => cell(v)).join('')}</tr>
        <tr><th>after</th>${out.map(o => cell(o.v, o.f ? 'cell-fix' : '')).join('')}${Array(SER.length - out.length).fill('<td></td>').join('')}</tr></table></div>
      <pre class="code">${esc(CODE[m])}</pre>
      <div class="explain">${{ dropna: '4 of 8 rows are gone. Fine for a few missing rows, destructive when nulls are common (6% of all cells in the retail dataset).', zero: 'Zero is a real price. Filling with 0 creates free products that never existed.', ffill: 'Forward fill copies the <strong>most recent</strong> value forward. Sensible for ordered data like stock prices.', bfill: 'Backward fill copies the <strong>next</strong> known value backward. The last NaN stays NaN: there is nothing after it.', mean: 'Mean imputation: every gap gets the same average. Keeps the mean, shrinks the variance.', median: 'Median imputation: same idea, robust to outliers and skew.' }[m]}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { m = b.dataset.v; render(); });
  render();
}

// ---------- outliers on real placement data ----------
export function outliers(el) {
  let zt = 3, k = 1.5;
  const mC = mean(CGPA), sC = std(CGPA);
  const q1 = quantile(MARKS, .25), q3 = quantile(MARKS, .75), iqr = q3 - q1;
  el.innerHTML = `${bench('target', 'Outlier removal on placement.csv', '1,000 real students')}
  <div class="bench-body">
    <div class="two">
      <div><div class="field"><label for="zt">cgpa: |z| threshold <span class="val" data-zt></span></label><input id="zt" type="range" min="1.5" max="4" step=".1" value="${zt}"></div><svg class="viz" data-c viewBox="0 0 340 170"></svg><pre class="code" data-zc></pre></div>
      <div><div class="field"><label for="ik">placement_exam_marks: IQR multiplier k <span class="val" data-ik></span></label><input id="ik" type="range" min=".5" max="3" step=".1" value="${k}"></div><svg class="viz" data-m viewBox="0 0 340 170"></svg><pre class="code" data-ic></pre></div>
    </div>
    <div class="readout"></div>
    <div class="explain"></div>
  </div>`;
  const update = () => {
    const lo = mC - zt * sC, hi = mC + zt * sC, outC = CGPA.filter(v => v < lo || v > hi);
    const L = q1 - k * iqr, U = q3 + k * iqr, outM = MARKS.filter(v => !(v > L && v < U));
    el.querySelector('[data-zt]').textContent = zt.toFixed(1); el.querySelector('[data-ik]').textContent = k.toFixed(1);
    const xc = scale(4.6, 9.4, 20, 330), Hc = histogram(CGPA, 24, 4.6, 9.4), yc = scale(0, Math.max(...Hc.map(h => h.c)), 120, 10);
    el.querySelector('[data-c]').innerHTML = `<rect x="${xc(Math.max(4.6, lo))}" y="6" width="${xc(Math.min(9.4, hi)) - xc(Math.max(4.6, lo))}" height="116" fill="var(--good-soft)"/>
      ${Hc.map(h => `<rect x="${xc(h.x0)}" y="${yc(h.c)}" width="${xc(h.x1) - xc(h.x0) - 1}" height="${120 - yc(h.c)}" fill="${h.x1 <= lo || h.x0 >= hi ? 'var(--bad)' : 'var(--context)'}"/>`).join('')}
      ${outC.map(v => `<circle cx="${xc(v)}" cy="132" r="3.5" fill="var(--bad)"/>`).join('')}${xAxis(xc, [5, 6, 7, 8, 9], 142, v => v)}`;
    const xm = scale(0, 100, 20, 330), Hm = histogram(MARKS, 20, 0, 100), ym = scale(0, Math.max(...Hm.map(h => h.c)), 90, 10);
    el.querySelector('[data-m]').innerHTML = `${Hm.map(h => `<rect x="${xm(h.x0)}" y="${ym(h.c)}" width="${xm(h.x1) - xm(h.x0) - 1}" height="${90 - ym(h.c)}" fill="${h.x0 >= U ? 'var(--bad)' : 'var(--context)'}"/>`).join('')}
      ${boxplotSVG({ data: MARKS, x: xm, y: 118, h: 20, k })}${xAxis(xm, [0, 25, 50, 75, 100], 142, v => v)}`;
    el.querySelector('[data-zc]').textContent = `z = np.abs(stats.zscore(df["cgpa"]))\ndf = df[z < ${zt.toFixed(1)}]   # removes ${outC.length}`;
    el.querySelector('[data-ic]').textContent = `iqr = Q3 - Q1 = ${fmt(q3)} - ${fmt(q1)} = ${fmt(iqr)}\nkeep ${fmt(L, 1)} < marks < ${fmt(U, 1)}   # removes ${outM.length}`;
    el.querySelector('.readout').innerHTML = `<div><div class="k">cgpa mean ± sd</div><div class="v">${fmt(mC)} ± ${fmt(sC)}</div></div><div><div class="k">cgpa removed</div><div class="v accent">${outC.length}</div></div><div><div class="k">marks Q1 / Q3</div><div class="v">${fmt(q1)} / ${fmt(q3)}</div></div><div><div class="k">marks removed</div><div class="v accent">${outM.length}</div></div>`;
    el.querySelector('.explain').innerHTML = `Lower the thresholds and watch how fast "outliers" multiply: at |z| &gt; 2 you would delete ${CGPA.filter(v => Math.abs(v - mC) > 2 * sC).length} perfectly valid students. The conventional values (3 for z, 1.5 for IQR) are a starting point, not a law. The marks are right-skewed, so a z-score there would be distorted by the very tail it tries to detect.`;
  };
  el.addEventListener('input', e => { if (e.target.id === 'zt') zt = +e.target.value; if (e.target.id === 'ik') k = +e.target.value; update(); });
  update();
}

// ---------- Dash callback emulator ----------
const SALES = { Electronics: [42, 48, 51, 55, 30, 33], Fashion: [30, 28, 35, 37, 39, 41], Home: [22, 25, 24, 27, 29, 26], Books: [9, 11, 10, 12, 11, 13] };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export function dash(el) {
  let cat = 'Electronics', month = 5, calls = 0;
  el.innerHTML = `${bench('plugs-connected', 'A working Dash callback', 'Change an Input: the callback fires and redraws the Output')}
  <div class="bench-body"><div class="two" style="align-items:start">
    <div style="border:1px solid var(--line);border-radius:10px;padding:14px;background:var(--surface-2)">
      <div class="tiny muted" style="margin-bottom:8px">app.layout (rendered)</div>
      <div class="field"><label for="dcat">dcc.Dropdown id="category"</label><select id="dcat">${Object.keys(SALES).map(c => `<option ${c === cat ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="field" style="margin-top:10px"><label for="dmon">dcc.Slider id="month" <span class="val" data-mo></span></label><input id="dmon" type="range" min="1" max="6" value="${month}"></div>
      <div class="tiny muted" style="margin:12px 0 4px">dcc.Graph id="sales-graph"</div>
      <svg class="viz" viewBox="0 0 320 150" data-g></svg>
    </div>
    <div><pre class="code" data-code></pre><div class="explain" data-ex></div></div>
  </div></div>`;
  const update = (fired) => {
    if (fired) calls++;
    const vals = SALES[cat].slice(0, month), x = scale(0, 5, 30, 300), y = scale(0, 60, 130, 10);
    el.querySelector('[data-mo]').textContent = `${month} (${MONTHS[month - 1]})`;
    el.querySelector('[data-g]').innerHTML = `${yGrid(y, [0, 20, 40, 60], 30, 300, v => v)}${vals.map((v, i) => `<rect x="${x(i) - 14}" y="${y(v)}" width="28" height="${130 - y(v)}" rx="2" fill="${i === vals.length - 1 ? 'var(--accent-viz)' : 'var(--context)'}"/><text x="${x(i)}" y="145" text-anchor="middle">${MONTHS[i]}</text>`).join('')}`;
    el.querySelector('[data-code]').innerHTML = `<span class="k">@app.callback</span>(
    Output(<span class="s">"sales-graph"</span>, <span class="s">"figure"</span>),
    Input(<span class="s">"category"</span>, <span class="s">"value"</span>),   <span class="c"># = "${cat}"</span>
    Input(<span class="s">"month"</span>, <span class="s">"value"</span>),      <span class="c"># = ${month}</span>
)
<span class="k">def</span> update_graph(category, month):
    dff = df[(df.category == category) &amp; (df.month &lt;= month)]
    <span class="k">return</span> px.bar(dff, x=<span class="s">"month"</span>, y=<span class="s">"revenue"</span>)`;
    const ex = el.querySelector('[data-ex]');
    ex.innerHTML = `Callback has run <strong class="num">${calls}</strong> time${calls === 1 ? '' : 's'}. Dash passes the current Input values as arguments, in order, and puts the return value into the Output's <code>figure</code> property. No JavaScript written.`;
    if (fired) ex.animate([{ background: 'var(--accent-soft)' }, { background: 'var(--surface-2)' }], { duration: 700 });
  };
  el.addEventListener('change', e => { if (e.target.id === 'dcat') { cat = e.target.value; update(true); } });
  el.addEventListener('input', e => { if (e.target.id === 'dmon') { month = +e.target.value; update(true); } });
  update(false);
}
