// Lecture 4 & 5 widgets: chart choice, chart anatomy, Gestalt, color, complex data.
import { bench, on, seg, setSeg, scale, fmt, mean, median, fiveNum, rng, normal, xAxis, yGrid, niceTicks, boxplotSVG, histogram, pearson, skewness, reduced } from '../viz.js';
import { CGPA, MARKS } from '../placement.js';
import { recordScore } from '../store.js';

// ---------- chart chooser ----------
const GOALS = {
  compare: { label: 'Compare categories', q: 'How are the categories shaped?', opts: [['few', 'One metric, short labels', 'vbar'], ['long', 'Long category labels', 'hbar'], ['sub', 'Sub-categories inside each', 'grouped']] },
  time: { label: 'Show change over time', q: 'How many series?', opts: [['one', '1 to 5 series', 'line'], ['many', 'More than 5 series', 'many'], ['part', 'Parts of a total over time', 'stacked']] },
  dist: { label: 'Show a distribution', q: 'What do you need to see?', opts: [['shape', 'Full shape of one variable', 'hist'], ['groups', 'Compare spread across groups', 'box'], ['space', 'Where things are on a map', 'map']] },
  rel: { label: 'Show a relationship', q: 'How many numeric variables?', opts: [['two', 'Two', 'scatter'], ['three', 'Three', 'bubble'], ['manyv', 'Four or more', 'splom']] },
  comp: { label: 'Show composition', q: 'What is the context?', opts: [['static', 'Parts of one whole, many parts', 'sortedbar'], ['tiny', 'Parts of one whole, 2 or 3 parts', 'pie'], ['overtime', 'Composition changing over time', 'stacked']] },
};
const REC = {
  vbar: ['Vertical bar (column) chart', 'Nominal or ordinal categories on one axis, the metric on the other. Sort the bars and start the axis at zero.'],
  hbar: ['Horizontal bar chart', 'Same as a bar chart, but long labels stay readable on the vertical axis.'],
  grouped: ['Grouped bar chart', 'Compares sub-categories within each main category side by side.'],
  line: ['Line chart', 'Tracks trends and continuity over time. Keep it to 4 or 5 lines at most.'],
  many: ['Highlight 1 line, grey the rest (or split into small panels)', 'More than 5 lines becomes spaghetti. The lecture caps line charts at 4 or 5 series.'],
  stacked: ['Stacked column or area chart', 'Shows how the parts of a total change over time.'],
  hist: ['Histogram', 'Continuous variable split into bins with no gaps. Shows symmetry, skew or bimodality. Check the bin size.'],
  box: ['Box plot', 'Quartiles, median, range and outliers per group. Compact for comparing many groups.'],
  map: ['Map', 'The lecture lists maps under distribution charts. Plotly offers scatter_map and density_map.'],
  scatter: ['Scatter plot', 'Two numeric variables. Summarize with the correlation coefficient; remember correlation is not causation.'],
  bubble: ['Bubble chart', 'A scatter plot with a third variable as size. The x-y relationship will still dominate.'],
  splom: ['Scatter plot matrix', 'Pairwise scatter plots of every variable, arranged in a matrix.'],
  sortedbar: ['Sorted bar chart (not a pie)', 'Pies make many slices hard to compare. Bars sorted by value make ranking obvious.'],
  pie: ['Pie or donut, three slices at most', 'Only acceptable for 2 or 3 parts of one whole (Lab 5 rule). Still, a bar is usually clearer.'],
};
function thumb(t) {
  const g = 'var(--context)', a = 'var(--accent-viz)';
  const S = {
    vbar: `<rect x="14" y="40" width="14" height="40" fill="${a}"/><rect x="34" y="52" width="14" height="28" fill="${g}"/><rect x="54" y="60" width="14" height="20" fill="${g}"/><rect x="74" y="66" width="14" height="14" fill="${g}"/>`,
    hbar: `<rect x="14" y="14" width="70" height="12" fill="${a}"/><rect x="14" y="32" width="54" height="12" fill="${g}"/><rect x="14" y="50" width="40" height="12" fill="${g}"/><rect x="14" y="68" width="26" height="12" fill="${g}"/>`,
    grouped: `<rect x="12" y="40" width="9" height="40" fill="${a}"/><rect x="22" y="52" width="9" height="28" fill="${g}"/><rect x="40" y="30" width="9" height="50" fill="${a}"/><rect x="50" y="56" width="9" height="24" fill="${g}"/><rect x="68" y="48" width="9" height="32" fill="${a}"/><rect x="78" y="44" width="9" height="36" fill="${g}"/>`,
    line: `<polyline points="10,62 30,50 50,56 70,30 90,22" fill="none" stroke="${a}" stroke-width="3"/><polyline points="10,70 30,66 50,60 70,62 90,52" fill="none" stroke="${g}" stroke-width="2"/>`,
    many: `${[0, 1, 2, 3, 4, 5].map(i => `<polyline points="10,${40 + i * 6} 30,${50 - i * 3} 50,${36 + i * 5} 70,${60 - i * 4} 90,${44 + i * 2}" fill="none" stroke="${g}" stroke-width="1.5"/>`).join('')}<polyline points="10,64 30,54 50,46 70,30 90,18" fill="none" stroke="${a}" stroke-width="3"/>`,
    stacked: `${[0, 1, 2, 3].map(i => `<rect x="${14 + i * 20}" y="${50 - i * 6}" width="14" height="${30 + i * 6}" fill="${g}"/><rect x="${14 + i * 20}" y="${30 - i * 6}" width="14" height="20" fill="${a}"/>`).join('')}`,
    hist: `${[10, 22, 36, 44, 34, 20, 12, 6].map((h, i) => `<rect x="${10 + i * 10}" y="${80 - h}" width="10" height="${h}" fill="${i === 3 ? a : g}" stroke="var(--surface)"/>`).join('')}`,
    box: `<line x1="50" x2="50" y1="14" y2="80" stroke="var(--ink-2)"/><rect x="36" y="30" width="28" height="30" fill="none" stroke="${a}" stroke-width="2"/><line x1="36" x2="64" y1="44" y2="44" stroke="${a}" stroke-width="3"/><circle cx="50" cy="8" r="3" fill="none" stroke="var(--bad)"/>`,
    map: `<path d="M14 40 Q30 18 50 30 T86 34 L82 64 Q60 76 40 66 T14 60Z" fill="${g}" opacity=".5"/><circle cx="34" cy="44" r="6" fill="${a}"/><circle cx="62" cy="50" r="4" fill="${a}"/><circle cx="52" cy="38" r="3" fill="${a}"/>`,
    scatter: `${[[14, 70], [24, 62], [30, 64], [40, 52], [48, 50], [56, 40], [64, 42], [72, 30], [82, 24], [88, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${a}"/>`).join('')}`,
    bubble: `${[[18, 66, 4], [32, 56, 8], [50, 46, 5], [64, 38, 11], [82, 22, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}" opacity=".6"/>`).join('')}`,
    splom: `${[0, 1, 2].flatMap(r => [0, 1, 2].map(c => `<rect x="${10 + c * 28}" y="${10 + r * 24}" width="24" height="20" fill="none" stroke="var(--line-strong)"/>${r === c ? `<rect x="${16 + c * 28}" y="${20 + r * 24}" width="12" height="8" fill="${g}"/>` : `<circle cx="${16 + c * 28}" cy="${24 + r * 24}" r="1.8" fill="${a}"/><circle cx="${22 + c * 28}" cy="${20 + r * 24}" r="1.8" fill="${a}"/><circle cx="${28 + c * 28}" cy="${15 + r * 24}" r="1.8" fill="${a}"/>`}`)).join('')}`,
    sortedbar: `<rect x="14" y="14" width="72" height="12" fill="${a}"/><rect x="14" y="32" width="50" height="12" fill="${g}"/><rect x="14" y="50" width="34" height="12" fill="${g}"/><rect x="14" y="68" width="18" height="12" fill="${g}"/>`,
    pie: `<circle cx="50" cy="46" r="32" fill="${g}"/><path d="M50 46 L50 14 A32 32 0 0 1 80 56Z" fill="${a}"/>`,
  };
  return `<svg viewBox="0 0 100 90" width="120" height="108" aria-hidden="true">${S[t]}</svg>`;
}
export function chooser(el) {
  let goal = 'compare', opt = 'few';
  const render = () => {
    const G = GOALS[goal], o = G.opts.find(x => x[0] === opt) || G.opts[0], [name, why] = REC[o[2]];
    el.innerHTML = `${bench('signpost', 'Chart chooser', 'Start with the question, not the chart')}
    <div class="bench-body">
      <div class="field"><span class="lbl">1. What should the chart do?</span><div class="chips">${Object.entries(GOALS).map(([k, g]) => `<button class="chip" data-goal="${k}" aria-pressed="${k === goal}">${g.label}</button>`).join('')}</div></div>
      <div class="field" style="margin-top:14px"><span class="lbl">2. ${G.q}</span><div class="chips">${G.opts.map(([k, l]) => `<button class="chip" data-opt="${k}" aria-pressed="${k === o[0]}">${l}</button>`).join('')}</div></div>
      <div style="display:flex;gap:18px;align-items:center;margin-top:18px;padding:16px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);animation:viewIn .4s var(--ease)" key="${o[2]}">
        ${thumb(o[2])}<div><div class="tiny muted">Recommended</div><h3 style="margin:2px 0 6px">${name}</h3><p class="small muted">${why}</p></div>
      </div>
    </div>`;
  };
  on(el, '[data-goal]', 'click', (e, b) => { goal = b.dataset.goal; opt = GOALS[goal].opts[0][0]; render(); });
  on(el, '[data-opt]', 'click', (e, b) => { opt = b.dataset.opt; render(); });
  render();
}

// ---------- bar chart variations ----------
const CATS = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books & Stationery'];
const MOB = [182, 96, 74, 61, 22], DESK = [120, 64, 70, 28, 31];
export function barvariants(el) {
  let v = 'vertical', sortOn = true;
  el.innerHTML = `${bench('chart-bar', 'One dataset, four bar charts', 'Revenue in $K by category and device (sample data)')}
  <div class="bench-body">
    <div class="controls">${seg([['vertical', 'Vertical'], ['horizontal', 'Horizontal'], ['stacked', 'Stacked'], ['grouped', 'Grouped']], v)}
      <label class="chip" style="cursor:pointer"><input type="checkbox" data-sort checked style="accent-color:var(--accent-viz)"> Sort by total</label></div>
    <svg class="viz" viewBox="0 0 720 300" role="img" aria-label="Bar chart variations"></svg>
    <div class="explain"></div>
  </div>`;
  const svg = el.querySelector('svg');
  const update = () => {
    const idx = CATS.map((_, i) => i);
    if (sortOn) idx.sort((a, b) => (MOB[b] + DESK[b]) - (MOB[a] + DESK[a]));
    const tot = i => MOB[i] + DESK[i];
    let marks = '', axis = '';
    const L = 150, R = 700, T = 20, B = 260;
    if (v === 'horizontal') {
      const x = scale(0, 320, L, R), bh = 34;
      idx.forEach((i, k) => { const y = T + k * 46; marks += `<rect x="${L}" y="${y}" width="${x(tot(i)) - L}" height="${bh}" rx="3" fill="${k === 0 ? 'var(--accent-viz)' : 'var(--context)'}"/><text x="${L - 8}" y="${y + 21}" text-anchor="end" class="lbl-strong">${CATS[i]}</text><text x="${x(tot(i)) + 6}" y="${y + 21}" class="num">${tot(i)}</text>`; });
      axis = xAxis(x, [0, 100, 200, 300], B, t => t);
    } else {
      const y = scale(0, 320, B, T), slot = (R - 60) / 5, x0 = 60;
      axis = yGrid(y, [0, 100, 200, 300], x0, R, t => t);
      idx.forEach((i, k) => {
        const cx = x0 + k * slot + slot / 2, lab = CATS[i].replace(' & ', ' &amp; ');
        if (v === 'vertical') marks += `<rect x="${cx - 32}" y="${y(tot(i))}" width="64" height="${B - y(tot(i))}" rx="3" fill="${k === 0 ? 'var(--accent-viz)' : 'var(--context)'}"/><text x="${cx}" y="${y(tot(i)) - 6}" text-anchor="middle" class="num">${tot(i)}</text>`;
        if (v === 'stacked') marks += `<rect x="${cx - 32}" y="${y(MOB[i])}" width="64" height="${B - y(MOB[i])}" fill="var(--accent-viz)"/><rect x="${cx - 32}" y="${y(tot(i))}" width="64" height="${y(MOB[i]) - y(tot(i))}" fill="var(--context)"/><text x="${cx}" y="${y(tot(i)) - 6}" text-anchor="middle" class="num">${tot(i)}</text>`;
        if (v === 'grouped') marks += `<rect x="${cx - 34}" y="${y(MOB[i])}" width="32" height="${B - y(MOB[i])}" fill="var(--accent-viz)"/><rect x="${cx + 2}" y="${y(DESK[i])}" width="32" height="${B - y(DESK[i])}" fill="var(--context)"/><text x="${cx - 18}" y="${y(MOB[i]) - 5}" text-anchor="middle" class="num" style="font-size:10px">${MOB[i]}</text><text x="${cx + 18}" y="${y(DESK[i]) - 5}" text-anchor="middle" class="num" style="font-size:10px">${DESK[i]}</text>`;
        marks += `<text x="${cx}" y="${B + 18}" text-anchor="middle" style="font-size:${lab.length > 14 ? 9.5 : 11}px">${lab}</text>`;
      });
      if (v !== 'vertical') marks += `<rect x="${R - 150}" y="2" width="10" height="10" fill="var(--accent-viz)"/><text x="${R - 136}" y="11">Mobile</text><rect x="${R - 80}" y="2" width="10" height="10" fill="var(--context)"/><text x="${R - 66}" y="11">Desktop</text>`;
    }
    svg.innerHTML = axis + marks;
    svg.style.animation = 'none'; svg.offsetWidth; svg.style.animation = 'viewIn .45s var(--ease)';
    el.querySelector('.explain').innerHTML = {
      vertical: '<strong>Vertical:</strong> the most common form. One category stands out because it gets the only accent color.',
      horizontal: '<strong>Horizontal:</strong> long labels like "Books &amp; Stationery" read without rotation. Great for ranked lists.',
      stacked: '<strong>Stacked:</strong> shows composition (mobile vs desktop within each total). Only the bottom segment shares a baseline, so comparing the top segments is hard.',
      grouped: '<strong>Grouped:</strong> compares sub-categories directly; every bar starts at zero. Notice Books is the only category where desktop beats mobile.',
    }[v] + (sortOn ? '' : ' <span class="hl">Unsorted:</span> ranking now takes effort. Lab 5 says sort the bars.');
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { v = b.dataset.v; setSeg(el.querySelector('.seg'), v); update(); } });
  el.addEventListener('change', e => { if (e.target.matches('[data-sort]')) { sortOn = e.target.checked; update(); } });
  update();
}

// ---------- pie vs bar ----------
const PIE = [['A', 23], ['B', 21], ['C', 20], ['D', 19], ['E', 17]];
export function piebar(el) {
  let guess = null;
  const render = () => {
    const cx = 120, cy = 120, R = 100; let a0 = -Math.PI / 2;
    const tones = ['var(--context-2)', 'var(--context)', 'var(--context-2)', 'var(--context)', 'var(--context-2)'];
    const slices = PIE.map(([k, v], i) => { const a1 = a0 + v / 100 * 2 * Math.PI, la = (a1 - a0) > Math.PI ? 1 : 0, mid = (a0 + a1) / 2;
      const p = `<path d="M${cx} ${cy}L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)}A${R} ${R} 0 ${la} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}Z" fill="${tones[i]}" stroke="var(--surface)" stroke-width="2"/><text x="${cx + R * .65 * Math.cos(mid)}" y="${cy + R * .65 * Math.sin(mid) + 5}" text-anchor="middle" style="fill:var(--ink);font-weight:600;font-size:15px">${k}</text>`;
      a0 = a1; return p; }).join('');
    const order = [2, 0, 4, 1, 3].map(i => PIE[i]); // shuffled for the pie
    const x = scale(0, 25, 40, 330);
    el.innerHTML = `${bench('chart-pie-slice', 'Can you read a pie?', guess ? 'Now look at the bars' : 'Which slice is the largest?')}
    <div class="bench-body"><div class="two" style="align-items:center">
      <svg class="viz" viewBox="0 0 240 240" style="max-width:280px;margin:auto" role="img" aria-label="Pie chart with five similar slices">${slices}</svg>
      <div>${guess ? `<svg class="viz" viewBox="0 0 340 190" role="img" aria-label="Same values as a sorted bar chart">${PIE.map(([k, v], i) => `<text x="30" y="${i * 36 + 26}" text-anchor="end" class="lbl-strong">${k}</text><rect x="40" y="${i * 36 + 10}" width="${x(v) - 40}" height="24" rx="3" fill="${i === 0 ? 'var(--accent-viz)' : 'var(--context)'}" style="animation:viewIn .5s var(--ease) ${i * 80}ms both"/><text x="${x(v) + 6}" y="${i * 36 + 27}" class="num">${v}%</text>`).join('')}</svg>
        <div class="explain">${guess === 'A' ? 'Correct, but how sure were you?' : `You picked ${guess}; it is <strong>A</strong>.`} The slices differ by only 2 to 6 points. Angles hide that; aligned bar lengths show it instantly. That is why the lecture says <strong>avoid pie charts</strong>.</div>`
        : `<p class="muted small" style="margin-bottom:10px">No labels, no numbers. Just your eyes.</p><div class="chips">${PIE.map(([k]) => `<button class="chip" data-g="${k}" style="font-size:15px;padding:8px 16px">${k}</button>`).join('')}</div>`}
        ${guess ? `<button class="btn sm" data-again style="margin-top:12px"><i class="ph ph-arrow-counter-clockwise"></i>Again</button>` : ''}</div>
    </div></div>`;
  };
  on(el, '[data-g]', 'click', (e, b) => { guess = b.dataset.g; recordScore('l4-pie', guess === 'A' ? 1 : 0, 1); render(); });
  on(el, '[data-again]', 'click', () => { guess = null; render(); });
  render();
}

// ---------- histogram bins (real data) ----------
export function histbins(el) {
  let varName = 'marks', bins = 20;
  el.innerHTML = `${bench('chart-bar', 'Histogram bins on real data', 'placement.csv, 1,000 students (Lab 2)')}
  <div class="bench-body">
    <div class="controls">${seg([['marks', 'placement_exam_marks'], ['cgpa', 'cgpa']], varName)}
      <div class="field"><label for="hb">Bins <span class="val" data-b>${bins}</span></label><input id="hb" type="range" min="3" max="60" value="${bins}"></div></div>
    <svg class="viz" viewBox="0 0 720 260" role="img" aria-label="Histogram"></svg>
    <div class="readout"></div>
    <div class="explain"></div>
  </div>`;
  const update = () => {
    const d = varName === 'marks' ? MARKS : CGPA, lo = varName === 'marks' ? 0 : 4.8, hi = varName === 'marks' ? 100 : 9.2;
    const H = histogram(d, bins, lo, hi), mx = Math.max(...H.map(h => h.c));
    const x = scale(lo, hi, 50, 700), y = scale(0, mx * 1.1, 220, 16), m = mean(d), md = median(d);
    el.querySelector('svg').innerHTML = `${yGrid(y, niceTicks(0, mx * 1.1, 4), 50, 700, t => t)}
      ${H.map(h => `<rect x="${x(h.x0)}" y="${y(h.c)}" width="${Math.max(.5, x(h.x1) - x(h.x0))}" height="${220 - y(h.c)}" fill="var(--context)" stroke="var(--surface)" stroke-width="${bins > 40 ? .5 : 1}"><title>${fmt(h.x0, 2)} to ${fmt(h.x1, 2)}: ${h.c}</title></rect>`).join('')}
      ${xAxis(x, niceTicks(lo, hi, 8), 220, t => fmt(t, 1))}
      <line x1="${x(md)}" x2="${x(md)}" y1="12" y2="220" stroke="var(--ink)" stroke-width="2"/><text x="${x(md) + (m > md ? -5 : 5)}" y="24" text-anchor="${m > md ? 'end' : 'start'}" class="lbl-strong">median ${fmt(md)}</text>
      <line x1="${x(m)}" x2="${x(m)}" y1="30" y2="220" stroke="var(--accent-viz)" stroke-width="2.5"/><text x="${x(m) + (m > md ? 5 : -5)}" y="42" text-anchor="${m > md ? 'start' : 'end'}" style="fill:var(--accent);font-weight:600">mean ${fmt(m)}</text>`;
    const sk = skewness(d);
    el.querySelector('.readout').innerHTML = `<div><div class="k">Bin width</div><div class="v">${fmt((hi - lo) / bins, 2)}</div></div><div><div class="k">Mean</div><div class="v accent">${fmt(m)}</div></div><div><div class="k">Median</div><div class="v">${fmt(md)}</div></div><div><div class="k">Skewness (pandas .skew())</div><div class="v">${fmt(sk * Math.sqrt(1000 * 999) / 998, 3)}</div></div>`;
    el.querySelector('.explain').innerHTML = (bins < 6 ? '<strong>Too few bins</strong> hide the shape. ' : bins > 45 ? '<strong>Too many bins</strong> turn the shape into noise. ' : '') + (varName === 'marks'
      ? 'placement_exam_marks is <strong>right-skewed</strong>: mean above median, long tail to the right. That is why Lab 2 uses the <strong>IQR</strong> method on it.'
      : 'cgpa is close to <strong>normal</strong>: mean ≈ median, symmetric bell. That is why Lab 2 uses the <strong>Z-score</strong> method on it.');
  };
  el.addEventListener('input', e => { if (e.target.id === 'hb') { bins = +e.target.value; el.querySelector('[data-b]').textContent = bins; update(); } });
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { varName = b.dataset.v; setSeg(el.querySelector('.seg'), varName); update(); } });
  update();
}

// ---------- same box plot, different histogram ----------
const UNI = Array.from({ length: 21 }, (_, i) => i * 5);
const BIM = [0, 18, 20, 22, 24, 25, 26, 28, 30, 32, 50, 68, 70, 72, 74, 75, 76, 78, 80, 82, 100];
export function samebox(el) {
  let reveal = false;
  const render = () => {
    const x = scale(0, 100, 40, 330);
    const panel = (d, name) => {
      const H = histogram(d, 10, 0, 100), y = scale(0, 7, 120, 20);
      return `<svg class="viz" viewBox="0 0 350 210" role="img" aria-label="${name}">
        <text x="40" y="14" class="lbl-strong">${name}</text>
        ${reveal ? H.map(h => `<rect x="${x(h.x0)}" y="${y(h.c)}" width="${x(h.x1) - x(h.x0)}" height="${120 - y(h.c)}" fill="var(--context)" stroke="var(--surface)" style="animation:viewIn .5s var(--ease) both"/>`).join('') : `<text x="185" y="80" text-anchor="middle">histogram hidden</text>`}
        ${boxplotSVG({ data: d, x, y: 160, h: 26 })}
        ${xAxis(x, [0, 25, 50, 75, 100], 182, v => v)}</svg>`;
    };
    el.innerHTML = `${bench('equals', 'Same box plot, different data', 'Both datasets: min 0, Q1 25, median 50, Q3 75, max 100')}
    <div class="bench-body"><div class="controls">${seg([['box', 'Box plots only'], ['hist', 'Show histograms']], reveal ? 'hist' : 'box')}</div>
      <div class="two">${panel(UNI, 'Dataset A')}${panel(BIM, 'Dataset B')}</div>
      <div class="explain">${reveal ? 'A is spread evenly; B has <strong>two peaks</strong> (bimodal) and almost nothing near the median. The box plot hides this because it only draws five numbers. Use a histogram to see shape.' : 'The box plots are identical. Are the datasets the same? Decide, then reveal the histograms.'}</div>
    </div>`;
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { reveal = b.dataset.v === 'hist'; render(); } });
  render();
}

// ---------- scatter / correlation / bubble ----------
export function scatter(el) {
  let r = 0.7, bubble = false, outlier = false;
  const R = rng(5), N = 70, base = Array.from({ length: N }, () => [normal(R), normal(R), R()]);
  el.innerHTML = `${bench('chart-scatter', 'Correlation and bubbles', 'Set the strength, add an outlier, add a third variable')}
  <div class="bench-body">
    <div class="controls"><div class="field"><label for="rr">Target correlation <span class="val" data-r></span></label><input id="rr" type="range" min="-1" max="1" step=".05" value="${r}"></div>
      <label class="chip" style="cursor:pointer"><input type="checkbox" data-o style="accent-color:var(--accent-viz)"> Add one outlier</label>
      <label class="chip" style="cursor:pointer"><input type="checkbox" data-b style="accent-color:var(--accent-viz)"> Bubble: size = 3rd variable</label></div>
    <svg class="viz" viewBox="0 0 720 300" role="img" aria-label="Scatter plot"></svg>
    <div class="readout"></div><div class="explain"></div>
  </div>`;
  const update = () => {
    const pts = base.map(([a, b, c]) => [a, r * a + Math.sqrt(Math.max(0, 1 - r * r)) * b, c]);
    if (outlier) pts.push([2.8, -2.8 * Math.sign(r || 1), .5]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), rr = pearson(xs, ys);
    const x = scale(-3.2, 3.2, 50, 700), y = scale(-3.4, 3.4, 270, 14);
    el.querySelector('[data-r]').textContent = fmt(r, 2);
    el.querySelector('svg').innerHTML = `${yGrid(y, [-3, -2, -1, 0, 1, 2, 3], 50, 700, t => t)}${xAxis(x, [-3, -2, -1, 0, 1, 2, 3], 270, t => t)}
      ${pts.map((p, i) => `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="${bubble ? 3 + p[2] * 16 : 5}" fill="${outlier && i === pts.length - 1 ? 'var(--bad)' : 'var(--accent-viz)'}" opacity="${bubble ? .45 : .8}" style="transition:cx .4s var(--ease),cy .4s var(--ease),r .4s"/>`).join('')}`;
    const s = Math.abs(rr), word = s > .7 ? 'strong' : s > .4 ? 'moderate' : s > .15 ? 'weak' : 'no clear';
    el.querySelector('.readout').innerHTML = `<div><div class="k">Measured r</div><div class="v accent">${fmt(rr, 3)}</div></div><div><div class="k">Direction</div><div class="v" style="font-size:15px">${rr > .15 ? 'positive' : rr < -.15 ? 'negative' : 'none'}</div></div><div><div class="k">Strength</div><div class="v" style="font-size:15px">${word}</div></div>`;
    el.querySelector('.explain').innerHTML = `r ranges from −1 (perfect negative) through 0 (no linear relationship) to +1 (perfect positive). ${outlier ? '<strong>One outlier</strong> visibly drags r: correlation is sensitive to extreme points, just like the mean.' : ''} ${bubble ? 'With bubbles, notice how much harder it is to judge the size variable than the x-y trend: that is the priority rule from the lecture.' : ''}`;
  };
  el.addEventListener('input', e => { if (e.target.id === 'rr') { r = +e.target.value; update(); } });
  el.addEventListener('change', e => { if (e.target.matches('[data-o]')) outlier = e.target.checked; if (e.target.matches('[data-b]')) bubble = e.target.checked; update(); });
  update();
}

// ---------- Gestalt ----------
const GESTALT = [
  ['proximity', 'Proximity', 'Objects close to one another appear to form groups.', 'Space related bars or legend items closer together; separate unrelated groups with whitespace instead of borders.'],
  ['similarity', 'Similarity', 'Similar shape, size, color or orientation reads as one group.', 'Use one color for one series across every chart on the page.'],
  ['closure', 'Closure', 'We perceive incomplete objects as complete.', 'A chart does not need a full box around it; implied edges are enough.'],
  ['symmetry', 'Symmetry', 'We perceive objects as symmetrical around a center point.', 'Diverging bars (e.g. agree vs disagree) read as one balanced whole.'],
  ['fate', 'Common fate', 'Objects moving together are perceived as one group, like a flock of birds.', 'In animated charts, points that move together are read as a cluster.'],
  ['continuity', 'Continuity', 'At intersections we still recognize separate continuous objects.', 'Crossing lines in a line chart stay traceable if they are smooth.'],
  ['past', 'Past experience', 'Visual stimuli are interpreted through what we have seen before.', 'Red means loss and green means gain for most audiences; maps put north up.'],
  ['pragnanz', 'Good Gestalt (Prägnanz)', 'The brain makes figures as simple and orderly as possible. The base of all other principles.', 'Simple, orderly layouts are understood fastest. Remove what does not add meaning.'],
];
export function gestalt(el) {
  let k = 'proximity', p = 0.5, anim = null;
  const demo = () => {
    const A = 'var(--accent-viz)', G = 'var(--context-2)';
    switch (k) {
      case 'proximity': { const gx = 12 + p * 40, gy = 52 - p * 40; return `${[0, 1, 2, 3, 4, 5].flatMap(c => [0, 1, 2, 3].map(r => `<circle cx="${40 + c * 22 + Math.floor(c / 2) * gx}" cy="${40 + r * 22 + Math.floor(r / 2) * gy}" r="7" fill="${G}"/>`)).join('')}`; }
      case 'similarity': return [0, 1, 2, 3, 4, 5].flatMap(c => [0, 1, 2, 3, 4].map(r => `<circle cx="${50 + c * 40}" cy="${30 + r * 34}" r="11" fill="${p > .5 ? (r % 2 ? A : G) : (c % 2 ? A : G)}"/>`)).join('');
      case 'closure': { const gap = 6 + p * 70; return `<circle cx="160" cy="105" r="70" fill="none" stroke="${A}" stroke-width="7" stroke-dasharray="${Math.max(4, 440 / 8 - gap)} ${gap}"/><rect x="250" y="40" width="0" height="0"/>`; }
      case 'symmetry': return `<text x="160" y="125" text-anchor="middle" style="font:500 ${54}px var(--mono);fill:var(--ink)">${p > .5 ? '[ ]{ }[ ]' : '[ ] { } [ ]'}</text><text x="160" y="170" text-anchor="middle">${p > .5 ? 'read as three symmetric pairs' : 'still pairs, even with uneven spacing'}</text>`;
      case 'fate': return Array.from({ length: 18 }, (_, i) => { const mover = [2, 5, 7, 11, 14].includes(i); return `<circle class="${mover ? 'fate' : ''}" cx="${36 + (i % 6) * 50}" cy="${50 + Math.floor(i / 6) * 50}" r="9" fill="${G}"/>`; }).join('');
      case 'continuity': return `<path d="M30 170 C 110 170, 210 40, 290 40" fill="none" stroke="${p > .5 ? A : G}" stroke-width="7"/><path d="M30 40 C 110 40, 210 170, 290 170" fill="none" stroke="${G}" stroke-width="7"/><text x="160" y="200" text-anchor="middle">two smooth lines, not four segments meeting at a point</text>`;
      case 'past': return `<text x="160" y="80" text-anchor="middle" style="font:600 40px var(--mono);fill:var(--ink)">A <tspan fill="${A}">13</tspan> C</text><text x="160" y="160" text-anchor="middle" style="font:600 40px var(--mono);fill:var(--ink)">12 <tspan fill="${A}">13</tspan> 14</text><text x="160" y="200" text-anchor="middle">same glyph, read as "B" or "13" by context</text>`;
      case 'pragnanz': return p > .5
        ? `${[[100, 90], [160, 90], [220, 90], [130, 130], [190, 130]].map(([cx, cy], i) => `<circle cx="${cx}" cy="${cy}" r="42" fill="none" stroke="${i % 2 ? A : G}" stroke-width="6"/>`).join('')}`
        : `<text x="160" y="110" text-anchor="middle" style="fill:var(--ink)">You see five circles, not a tangle of curved fragments.</text>`;
    }
  };
  const control = () => ({
    proximity: ['Spacing: rows ↔ columns', true], similarity: ['Color by: columns ↔ rows', true], closure: ['Gap size', true], symmetry: ['Spacing', true],
    fate: [null, false], continuity: ['Highlight one line', true], past: [null, false], pragnanz: ['Show the figure', true],
  }[k]);
  const render = () => {
    if (anim) { anim.forEach(a => a.cancel()); anim = null; }
    const g = GESTALT.find(x => x[0] === k), [cl] = control();
    el.innerHTML = `${bench('circles-three', 'Gestalt principles, live', '8 rules for grouping')}
    <div class="bench-body">
      <div class="chips" style="margin-bottom:16px">${GESTALT.map(([id, name], i) => `<button class="chip" data-k="${id}" aria-pressed="${id === k}"><span class="num muted">${i + 1}</span> ${name}</button>`).join('')}</div>
      <div class="gestalt-stage">
        <svg class="viz" viewBox="0 0 320 210" style="background:var(--surface-2);border-radius:10px;border:1px solid var(--line)" role="img" aria-label="${g[1]} demo">${demo()}</svg>
        <div><h3>${g[1]}</h3><p class="muted" style="margin-top:6px">${g[2]}</p>
          ${cl ? `<div class="field" style="margin-top:14px"><label for="gp">${cl}</label><input id="gp" type="range" min="0" max="1" step=".01" value="${p}"></div>` : ''}
          ${k === 'fate' ? `<button class="btn sm" data-fate style="margin-top:14px"><i class="ph ph-play"></i>Move them</button>` : ''}
          <div class="explain"><strong>In charts:</strong> ${g[3]}</div></div>
      </div>
    </div>`;
  };
  on(el, '[data-k]', 'click', (e, b) => { k = b.dataset.k; p = k === 'pragnanz' || k === 'continuity' ? 1 : 0.5; render(); });
  on(el, '[data-fate]', 'click', () => {
    const movers = el.querySelectorAll('.fate');
    anim = [...movers].map(m => m.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(0,-34px)' }, { transform: 'translate(0,0)' }], { duration: reduced() ? 1 : 1400, iterations: reduced() ? 1 : 3, easing: 'ease-in-out' }));
    movers.forEach(m => m.setAttribute('fill', 'var(--context-2)'));
  });
  el.addEventListener('input', e => { if (e.target.id === 'gp') { p = +e.target.value; el.querySelector('svg.viz').innerHTML = demo(); } });
  render();
}

// ---------- HSL ----------
const lum = (h, s, l) => { // HSL → relative luminance, for the grayscale check
  s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const lin = c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; return .2126 * lin(f(0)) + .7152 * lin(f(8)) + .0722 * lin(f(4));
};
export function hsl(el) {
  let h = 24, s = 85, l = 48, gray = false;
  el.innerHTML = `${bench('palette', 'Hue, saturation, lightness', 'Make one bar stand out, then test it in grayscale')}
  <div class="bench-body"><div class="two" style="align-items:center">
    <div>
      ${[['h', 'Hue', 360, '°'], ['s', 'Saturation', 100, '%'], ['l', 'Lightness', 100, '%']].map(([id, n, max, u]) => `<div class="field" style="margin-bottom:10px"><label for="c${id}">${n} <span class="val" data-${id}></span></label><input id="c${id}" type="range" min="0" max="${max}" value="${{ h, s, l }[id]}" data-u="${u}"></div>`).join('')}
      <label class="chip" style="cursor:pointer"><input type="checkbox" data-gray style="accent-color:var(--accent-viz)"> Print in grayscale</label>
    </div>
    <div><svg class="viz" viewBox="0 0 320 200" role="img" aria-label="Bar chart using the chosen color"></svg><div class="explain"></div></div>
  </div></div>`;
  const update = () => {
    ['h', 's', 'l'].forEach(k => el.querySelector(`[data-${k}]`).textContent = { h, s, l }[k] + (k === 'h' ? '°' : '%'));
    const ctxL = 64, c = `hsl(${h} ${s}% ${l}%)`, ctx = `hsl(220 8% ${ctxL}%)`;
    const vals = [62, 80, 140, 70, 55];
    el.querySelector('svg').innerHTML = `<g style="filter:${gray ? 'grayscale(1)' : 'none'};transition:filter .4s">${vals.map((v, i) => `<rect x="${20 + i * 60}" y="${180 - v}" width="44" height="${v}" rx="3" fill="${i === 2 ? c : ctx}"/>`).join('')}</g>`;
    const L1 = lum(h, s, l), L2 = lum(220, 8, ctxL), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    el.querySelector('.explain').innerHTML = gray
      ? (ratio < 1.5 ? `<strong>Lost.</strong> In grayscale the highlight is almost the same gray as the context bars (contrast ${fmt(ratio, 2)}:1). Hue alone does not survive. Change the <strong>lightness</strong>.` : `<strong>Survives.</strong> The highlight differs in lightness from the context (contrast ${fmt(ratio, 2)}:1), so it still pops without color.`)
      : `Saturation ${s < 30 ? 'is low: the highlight looks washed out' : 'makes it bold'}. ${s > 30 && Math.abs(L1 - L2) < .06 ? 'Careful: the lightness matches the grey bars, so this only works for viewers who see hue.' : 'Grey for context, one accent for the point.'}`;
  };
  el.addEventListener('input', e => { const id = e.target.id; if (id === 'ch') h = +e.target.value; if (id === 'cs') s = +e.target.value; if (id === 'cl') l = +e.target.value; update(); });
  el.addEventListener('change', e => { if (e.target.matches('[data-gray]')) { gray = e.target.checked; update(); } });
  update();
}

// ---------- color schemes on a profit map ----------
const REG = ['North', 'South', 'East', 'West'];
const PROFIT = Array.from({ length: 40 }, (_, i) => Math.round(Math.sin(i * 1.7) * 38 + Math.cos(i * .6) * 22 + (i % 7) * 3 - 6));
const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = c => `rgb(${c.join(',')})`;
export function schemes(el) {
  let sc = 'sequential', gray = false;
  const color = (v, i) => {
    const mn = Math.min(...PROFIT), mx = Math.max(...PROFIT);
    if (sc === 'sequential') return rgb(lerp([255, 237, 222], [124, 45, 18], (v - mn) / (mx - mn)));
    if (sc === 'diverging') return v < 0 ? rgb(lerp([242, 242, 242], [37, 84, 180], -v / -mn)) : rgb(lerp([242, 242, 242], [194, 65, 12], v / mx));
    if (sc === 'qualitative') return ['#2f62c8', '#e8590c', '#18804a', '#b08900'][Math.floor(i / 10)];
    if (sc === 'binary') return v >= 0 ? '#c2410c' : '#9aa1ad';
    return `hsl(${(v - mn) / (mx - mn) * 300} 85% 55%)`;
  };
  const NOTE = {
    sequential: 'Light = low, dark = high. Good for ordered values, but for profit it hides <b>where zero is</b>: a small loss and a small profit look alike.',
    diverging: '<b>Best for profit.</b> Zero is the critical midpoint (light); losses diverge to dark blue, profits to dark orange.',
    qualitative: 'Different hues for <b>nominal</b> groups (here: region). Right for "which region?", wrong for "how much profit?".',
    binary: 'Only two classes: profitable or not. Simple and honest when that split is all the viewer needs.',
    rainbow: '<b>Misleading.</b> Hue has no natural order, so the eye invents boundaries (yellow looks like a jump). Switch to grayscale and the order disappears.',
  };
  const render = () => {
    el.innerHTML = `${bench('swatches', 'Pick the right scheme', 'Profit by store, 40 stores in 4 regions (sample data)')}
    <div class="bench-body">
      <div class="controls">${seg([['sequential', 'Sequential'], ['diverging', 'Diverging'], ['qualitative', 'Qualitative'], ['binary', 'Binary'], ['rainbow', 'Rainbow']], sc)}
        <label class="chip" style="cursor:pointer"><input type="checkbox" data-gray ${gray ? 'checked' : ''} style="accent-color:var(--accent-viz)"> Grayscale</label></div>
      <svg class="viz" viewBox="0 0 720 200" style="filter:${gray ? 'grayscale(1)' : 'none'}" role="img" aria-label="Tile map colored by profit">
        ${PROFIT.map((v, i) => `<g><rect x="${20 + (i % 10) * 68}" y="${10 + Math.floor(i / 10) * 44}" width="64" height="40" rx="5" fill="${color(v, i)}" style="transition:fill .5s"/><text x="${52 + (i % 10) * 68}" y="${35 + Math.floor(i / 10) * 44}" text-anchor="middle" style="font:500 11px var(--mono);fill:${Math.abs(v) > 25 || sc === 'qualitative' || sc === 'binary' && v >= 0 ? '#fff' : '#222'}">${v}</text></g>`).join('')}
        ${REG.map((r, i) => `<text x="16" y="${34 + i * 44}" text-anchor="end">${r}</text>`).join('')}
      </svg>
      <div class="explain">${NOTE[sc]}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { sc = b.dataset.v; render(); });
  el.addEventListener('change', e => { if (e.target.matches('[data-gray]')) { gray = e.target.checked; render(); } });
  render();
}

// ---------- scatter plot matrix with brushing ----------
export function splom(el) {
  const R = rng(21), N = 60;
  const rows = Array.from({ length: N }, () => { const study = 2 + R() * 18, sleep = 5 + normal(R) * 1.1, att = Math.min(100, 55 + study * 1.6 + normal(R) * 8); return [study, sleep, att, Math.min(100, 30 + study * 2.2 + (sleep - 5) * 3 + normal(R) * 7)]; });
  const NAMES = ['Study h/wk', 'Sleep h', 'Attendance %', 'Grade'];
  const ext = NAMES.map((_, j) => [Math.min(...rows.map(r => r[j])), Math.max(...rows.map(r => r[j]))]);
  const C = 130, P = 8;
  el.innerHTML = `${bench('grid-four', 'Scatter plot matrix', 'Hover a point: the same student lights up everywhere (sample data)')}
  <div class="bench-body"><svg class="viz" viewBox="0 0 ${C * 4 + 40} ${C * 4 + 30}" style="max-width:600px;margin:auto" role="img" aria-label="Scatter plot matrix of four variables">
    ${NAMES.map((n, r) => NAMES.map((m, c) => {
      const ox = 40 + c * C, oy = r * C, xs = scale(ext[c][0], ext[c][1], ox + P, ox + C - P), ys = scale(ext[r][0], ext[r][1], oy + C - P, oy + P);
      if (r === c) { const H = histogram(rows.map(q => q[c]), 8, ext[c][0], ext[c][1] + 1e-9), mx = Math.max(...H.map(h => h.c)); return `<rect x="${ox}" y="${oy}" width="${C - 4}" height="${C - 4}" fill="var(--surface-2)" stroke="var(--line)"/>${H.map(h => `<rect x="${xs(h.x0)}" y="${oy + C - P - (h.c / mx) * (C - 40)}" width="${xs(h.x1) - xs(h.x0) - 1}" height="${(h.c / mx) * (C - 40)}" fill="var(--context)"/>`).join('')}<text x="${ox + 8}" y="${oy + 18}" class="lbl-strong">${n}</text>`; }
      const rr = pearson(rows.map(q => q[c]), rows.map(q => q[r]));
      return `<rect x="${ox}" y="${oy}" width="${C - 4}" height="${C - 4}" fill="none" stroke="var(--line)"/>${rows.map((q, i) => `<circle data-i="${i}" cx="${xs(q[c])}" cy="${ys(q[r])}" r="2.8" fill="var(--context-2)"/>`).join('')}<text x="${ox + C - 10}" y="${oy + 16}" text-anchor="end" class="num" style="font-size:10px">r ${fmt(rr, 2)}</text>`;
    }).join('')).join('')}
  </svg><div class="explain">Each off-diagonal cell is one pair of variables; the diagonal shows each variable's distribution. Study hours relate strongly to attendance and grade; sleep barely relates to anything. One matrix replaces 6 separate scatter plots.</div></div>`;
  const svg = el.querySelector('svg');
  svg.addEventListener('mouseover', e => { const c = e.target.closest('[data-i]'); if (!c) return; svg.querySelectorAll(`[data-i="${c.dataset.i}"]`).forEach(n => { n.setAttribute('fill', 'var(--accent-viz)'); n.setAttribute('r', 5); }); });
  svg.addEventListener('mouseout', e => { const c = e.target.closest('[data-i]'); if (!c) return; svg.querySelectorAll(`[data-i="${c.dataset.i}"]`).forEach(n => { n.setAttribute('fill', 'var(--context-2)'); n.setAttribute('r', 2.8); }); });
}

// ---------- heat map (real remote-work counts) ----------
const HEAT = {
  stress: { cols: ['Low', 'Medium', 'High'], rows: { Remote: [547, 577, 590], Hybrid: [543, 545, 561], Onsite: [555, 547, 535] } },
  sat: { cols: ['Unsatisfied', 'Neutral', 'Satisfied'], rows: { Remote: [592, 603, 519], Hybrid: [546, 539, 564], Onsite: [539, 506, 592] } },
};
export function heatmap(el) {
  let m = 'stress', zero = false;
  const render = () => {
    const H = HEAT[m], all = Object.values(H.rows).flat(), lo = zero ? 0 : Math.min(...all), hi = Math.max(...all);
    const col = v => rgb(lerp([255, 241, 232], [154, 52, 18], (v - lo) / (hi - lo)));
    el.innerHTML = `${bench('grid-nine', 'Heat map: work location × ' + (m === 'stress' ? 'stress level' : 'satisfaction'), 'Real counts from the Lab 3 CSV (5,000 employees)')}
    <div class="bench-body">
      <div class="controls">${seg([['stress', 'Stress level'], ['sat', 'Satisfaction']], m)}
        <label class="chip" style="cursor:pointer"><input type="checkbox" data-zero ${zero ? 'checked' : ''} style="accent-color:var(--accent-viz)"> Color scale starts at 0</label></div>
      <svg class="viz" viewBox="0 0 520 210" style="max-width:560px" role="img" aria-label="Heat map">
        ${H.cols.map((c, j) => `<text x="${150 + j * 120}" y="16" text-anchor="middle" class="lbl-strong">${c}</text>`).join('')}
        ${Object.entries(H.rows).map(([r, vals], i) => `<text x="80" y="${56 + i * 62}" text-anchor="end" class="lbl-strong">${r}</text>${vals.map((v, j) => `<rect x="${92 + j * 120}" y="${26 + i * 62}" width="116" height="58" rx="6" fill="${col(v)}" style="transition:fill .5s"/><text x="${150 + j * 120}" y="${60 + i * 62}" text-anchor="middle" style="font:600 15px var(--mono);fill:${(v - lo) / (hi - lo) > .55 ? '#fff' : '#2a1608'}">${v}</text>`).join('')}`).join('')}
      </svg>
      <div class="explain">${zero ? 'With the scale anchored at 0, every cell looks the same shade, which is the honest picture: the counts only range from ' + Math.min(...all) + ' to ' + hi + '.' : 'The default scale stretches from the smallest to the largest count, so a difference of under 100 people looks dramatic. <strong>Toggle the zero-based scale</strong> and the "pattern" mostly disappears. Color can mislead just like a truncated axis.'}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { m = b.dataset.v; render(); });
  el.addEventListener('change', e => { if (e.target.matches('[data-zero]')) { zero = e.target.checked; render(); } });
  render();
}

// ---------- stacked column vs area ----------
const QTR = ['Q1 23', 'Q2 23', 'Q3 23', 'Q4 23', 'Q1 24', 'Q2 24', 'Q3 24', 'Q4 24'];
const LINES = { Subscriptions: [40, 46, 52, 60, 66, 74, 83, 92], Hardware: [70, 68, 72, 75, 64, 60, 58, 55], Services: [22, 24, 23, 27, 30, 29, 33, 35] };
export function stackarea(el) {
  let v = 'stacked';
  const render = () => {
    const keys = Object.keys(LINES), tot = QTR.map((_, i) => keys.reduce((a, k) => a + LINES[k][i], 0));
    const x = scale(0, 7, 70, 680), y = scale(0, 200, 230, 20), fills = ['var(--accent-viz)', 'var(--context)', 'var(--context-2)'];
    let marks = '';
    if (v === 'stacked') QTR.forEach((_, i) => { let acc = 0; keys.forEach((k, j) => { const v0 = acc; acc += LINES[k][i]; marks += `<rect x="${x(i) - 24}" y="${y(acc)}" width="48" height="${y(v0) - y(acc)}" fill="${fills[j]}" stroke="var(--surface)"/>`; }); });
    else if (v === 'area') { let lower = QTR.map(() => 0); keys.forEach((k, j) => { const upper = lower.map((l, i) => l + LINES[k][i]); marks += `<path d="M${upper.map((u, i) => `${x(i)},${y(u)}`).join('L')}L${lower.map((l, i) => `${x(i)},${y(l)}`).reverse().join('L')}Z" fill="${fills[j]}" opacity=".9" stroke="var(--surface)"/>`; lower = upper; }); }
    else keys.forEach((k, j) => { marks += `<polyline points="${LINES[k].map((u, i) => `${x(i)},${y(u)}`).join(' ')}" fill="none" stroke="${fills[j]}" stroke-width="${j ? 2 : 3}"/>`; });
    el.innerHTML = `${bench('chart-line', 'Composition over time', 'Revenue $K by product line (sample data)')}
    <div class="bench-body"><div class="controls">${seg([['stacked', 'Stacked column'], ['area', 'Stacked area'], ['lines', 'Separate lines']], v)}</div>
      <svg class="viz" viewBox="0 0 720 270" role="img" aria-label="Composition chart">${yGrid(y, [0, 50, 100, 150, 200], 70, 690, t => t)}${marks}
        ${QTR.map((q, i) => `<text x="${x(i)}" y="250" text-anchor="middle">${q}</text>`).join('')}
        ${keys.map((k, j) => `<rect x="${430 + j * 95}" y="2" width="10" height="10" fill="${fills[j]}"/><text x="${444 + j * 95}" y="11">${k}</text>`).join('')}</svg>
      <div class="explain">${{ stacked: 'Stacked columns show the <strong>total</strong> and each part per period. Only the bottom series (Subscriptions) is easy to compare across time.', area: 'An area chart is the continuous version: good for the overall trend of the total and its composition, weak for reading exact values of the upper layers.', lines: 'Separate lines make each series easy to compare (Hardware is shrinking) but lose the total. Choose by the question.' }[v]}</div>
    </div>`;
  };
  on(el, '[data-v]', 'click', (e, b) => { v = b.dataset.v; render(); });
  render();
}
