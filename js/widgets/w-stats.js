// Lecture 3 widgets: statistics and perception.
import { bench, on, seg, setSeg, scale, fmt, mean, median, modes, variance, std, quantile, fiveNum, skewness, sorted, rng, normal, xAxis, yGrid, niceTicks, boxplotSVG, histogram, pearson, esc } from '../viz.js';
import { sorter } from './w-foundations.js';
import { recordScore } from '../store.js';

// ---------- central tendency playground ----------
const PRESETS = {
  symmetric: [6, 7, 8, 8, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 13, 14],
  right: [3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 9, 11, 13, 16, 19],
  left: [17, 17, 16, 16, 16, 16, 15, 15, 15, 14, 14, 13, 12, 11, 9, 7, 4, 1],
  bimodal: [4, 5, 5, 6, 6, 6, 7, 7, 13, 13, 14, 14, 14, 15, 15, 16],
  outlier: [8, 9, 9, 10, 10, 10, 11, 11, 12, 20],
};
export function central(el) {
  let data = [...PRESETS.right];
  const W = 720, H = 250, base = 190, x = scale(0, 20, 34, W - 20);
  el.innerHTML = `${bench('crosshair', 'Central tendency playground', 'Click the axis to add a value, click a dot to remove it')}
  <div class="bench-body">
    <div class="controls">${seg([['symmetric', 'Symmetric'], ['right', 'Right skew'], ['left', 'Left skew'], ['bimodal', 'Bimodal'], ['outlier', 'With outlier']], 'right')}</div>
    <svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot plot with mean, median and mode markers">
      <rect class="hit" x="20" y="20" width="${W - 30}" height="${base - 10}" fill="transparent" style="cursor:copy"/>
      <g class="dots"></g>
      <line x1="${x(0)}" x2="${x(20)}" y1="${base + 8}" y2="${base + 8}" stroke="var(--line-strong)"/>
      ${xAxis(x, niceTicks(0, 20, 10), base + 8, v => v)}
      <g class="mk mv" data-m="mean"><line y1="24" y2="${base + 4}" stroke="var(--accent-viz)" stroke-width="2.5"/><text y="18" text-anchor="middle" style="fill:var(--accent);font-weight:600">mean</text></g>
      <g class="mk mv" data-m="median"><line y1="40" y2="${base + 4}" stroke="var(--ink)" stroke-width="2"/><text y="34" text-anchor="middle" class="lbl-strong">median</text></g>
      <g class="modes"></g>
    </svg>
    <div class="readout"></div>
    <div class="explain"></div>
  </div>`;
  const svg = el.querySelector('svg'), dotsG = svg.querySelector('.dots'), modesG = svg.querySelector('.modes');
  const update = () => {
    const counts = {};
    dotsG.innerHTML = data.map((v, i) => {
      const k = counts[v] = (counts[v] || 0) + 1;
      return `<circle class="dot" data-i="${i}" cx="${x(v)}" cy="${base - 4 - (k - 1) * 14}" r="6.2" fill="var(--context-2)" stroke="var(--surface)" stroke-width="1.5" style="cursor:pointer"/>`;
    }).join('');
    const m = mean(data), md = median(data), mo = modes(data), sk = data.length > 2 ? skewness(data) : 0;
    svg.querySelector('[data-m="mean"]').style.transform = `translateX(${x(m)}px)`;
    svg.querySelector('[data-m="median"]').style.transform = `translateX(${x(md)}px)`;
    modesG.innerHTML = mo.map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="56" y2="${base + 4}" stroke="var(--second)" stroke-width="2" stroke-dasharray="4 3"/><text x="${x(v)}" y="52" text-anchor="middle" style="fill:var(--second);font-weight:600">mode</text>`).join('');
    const kind = mo.length === 0 ? 'No mode' : ['Unimodal', 'Bimodal', 'Trimodal'][mo.length - 1] || 'Multimodal';
    el.querySelector('.readout').innerHTML = `
      <div><div class="k">N</div><div class="v">${data.length}</div></div>
      <div><div class="k">Mean</div><div class="v accent">${fmt(m)}</div></div>
      <div><div class="k">Median</div><div class="v">${fmt(md)}</div></div>
      <div><div class="k">Mode</div><div class="v" style="color:var(--second)">${mo.length ? mo.join(', ') : 'none'}</div></div>
      <div><div class="k">Modality</div><div class="v" style="font-size:15px">${kind}</div></div>
      <div><div class="k">Skewness</div><div class="v">${fmt(sk)}</div></div>`;
    const gap = m - md;
    el.querySelector('.explain').innerHTML = Math.abs(gap) < 0.35
      ? `<strong>Roughly symmetric:</strong> mean (${fmt(m)}) ≈ median (${fmt(md)}). Either describes the center well.`
      : gap > 0
        ? `<strong>Positive (right) skew:</strong> the long tail on the right pulls the mean (${fmt(m)}) above the median (${fmt(md)}). ${data.length % 2 ? 'N is odd, so the median is the single middle value.' : 'N is even, so the median averages the two middle values.'} Report the median here.`
        : `<strong>Negative (left) skew:</strong> the tail on the left drags the mean (${fmt(m)}) below the median (${fmt(md)}). The median resists the tail; the mean does not.`;
  };
  el.addEventListener('click', e => {
    const dot = e.target.closest('.dot');
    if (dot) { if (data.length > 2) data.splice(+dot.dataset.i, 1); update(); return; }
    if (e.target.closest('.hit')) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const v = Math.max(0, Math.min(20, Math.round((p.x - 34) / ((W - 54) / 20))));
      if (data.filter(d => d === v).length < 10) data.push(v);
      update();
    }
    const b = e.target.closest('[data-v]');
    if (b) { data = [...PRESETS[b.dataset.v]]; setSeg(el.querySelector('.seg'), b.dataset.v); update(); }
  });
  update();
}

// ---------- weighted mean ----------
export function weighted(el) {
  const rows = [{ q: 500, p: 100 }, { q: 300, p: 800 }, { q: 100, p: 20 }];
  el.innerHTML = `${bench('scales', 'Weighted mean calculator', 'Edit quantities and prices')}
  <div class="bench-body">
    <div class="tbl-wrap"><table class="tbl"><tr><th>Batch</th><th>Pieces (weight w)</th><th>Price per piece, LE (x)</th><th>w × x</th></tr>
    ${rows.map((r, i) => `<tr><td>${i + 1}</td><td><input type="number" min="0" data-r="${i}" data-k="q" value="${r.q}" style="width:110px" aria-label="Pieces in batch ${i + 1}"></td><td><input type="number" min="0" data-r="${i}" data-k="p" value="${r.p}" style="width:110px" aria-label="Price in batch ${i + 1}"></td><td class="num" data-wx="${i}"></td></tr>`).join('')}
    </table></div>
    <svg class="viz" viewBox="0 0 720 120" style="margin-top:14px" role="img" aria-label="Prices sized by quantity with both means"></svg>
    <div class="formula" data-f></div>
    <div class="readout"></div>
  </div>`;
  const update = () => {
    const sw = rows.reduce((a, r) => a + r.q, 0), swx = rows.reduce((a, r) => a + r.q * r.p, 0);
    const wm = sw ? swx / sw : 0, sm = mean(rows.map(r => r.p));
    const maxP = Math.max(100, ...rows.map(r => r.p)) * 1.1, x = scale(0, maxP, 20, 700), maxQ = Math.max(...rows.map(r => r.q), 1);
    rows.forEach((r, i) => el.querySelector(`[data-wx="${i}"]`).textContent = (r.q * r.p).toLocaleString());
    el.querySelector('svg').innerHTML = `<line x1="20" x2="700" y1="70" y2="70" stroke="var(--line-strong)"/>
      ${rows.map(r => `<circle cx="${x(r.p)}" cy="70" r="${4 + 22 * Math.sqrt(r.q / maxQ)}" fill="var(--context)" opacity=".7"/><text x="${x(r.p)}" y="112" text-anchor="middle">${r.p} LE</text>`).join('')}
      <g class="mv" style="transform:translateX(${x(sm)}px)"><line y1="10" y2="96" stroke="var(--ink)" stroke-dasharray="4 3"/><text x="${wm >= sm ? -6 : 6}" y="14" text-anchor="${wm >= sm ? 'end' : 'start'}" class="lbl-strong">plain mean ${fmt(sm)}</text></g>
      <g class="mv" style="transform:translateX(${x(wm)}px)"><line y1="10" y2="96" stroke="var(--accent-viz)" stroke-width="2.5"/><text x="${wm >= sm ? 6 : -6}" y="14" text-anchor="${wm >= sm ? 'start' : 'end'}" style="fill:var(--accent);font-weight:600">weighted ${fmt(wm)}</text></g>`;
    el.querySelector('[data-f]').textContent = `x̄w = (${rows.map(r => `${r.q}×${r.p}`).join(' + ')}) / (${rows.map(r => r.q).join(' + ')}) = ${swx.toLocaleString()} / ${sw.toLocaleString()} = ${fmt(wm)} LE`;
    el.querySelector('.readout').innerHTML = `<div><div class="k">Weighted mean (correct)</div><div class="v accent">${fmt(wm)} LE</div></div><div><div class="k">Plain mean of prices</div><div class="v">${fmt(sm)} LE</div></div><div><div class="k">Total pieces</div><div class="v">${sw.toLocaleString()}</div></div>`;
  };
  el.addEventListener('input', e => { const t = e.target; if (t.dataset.r) { rows[+t.dataset.r][t.dataset.k] = Math.max(0, +t.value || 0); update(); } });
  update();
}

// ---------- dispersion ----------
const Z = [-1.6, -1.0, -0.5, -0.2, 0.3, 0.6, 1.1, 1.3];
export function dispersion(el) {
  let spread = 6, sample = false;
  el.innerHTML = `${bench('arrows-out-line-horizontal', 'Variance and standard deviation, step by step', 'Same mean, different spread')}
  <div class="bench-body">
    <div class="controls">
      <div class="field"><label for="spr">Spread <span class="val" data-sv></span></label><input id="spr" type="range" min="1" max="14" value="${spread}"></div>
      ${seg([['pop', 'Population (÷N)'], ['samp', 'Sample (÷N−1)']], 'pop')}
    </div>
    <svg class="viz" viewBox="0 0 720 110" role="img" aria-label="Values with mean and one standard deviation band"></svg>
    <div class="two" style="margin-top:12px;align-items:start"><div class="tbl-wrap"><table class="tbl" data-t></table></div><div><div class="readout" style="margin-top:0"></div><div class="explain"></div></div></div>
  </div>`;
  const x = scale(30, 110, 20, 700);
  const update = () => {
    const d = Z.map(z => Math.round(70 + spread * z));
    const m = mean(d), v = variance(d, sample), s = Math.sqrt(v);
    el.querySelector('[data-sv]').textContent = `×${spread}`;
    el.querySelector('svg').innerHTML = `
      <rect x="${x(m - s)}" y="20" width="${x(m + s) - x(m - s)}" height="60" rx="6" fill="var(--accent-soft)" class="mv"/>
      <line x1="20" x2="700" y1="50" y2="50" stroke="var(--line-strong)"/>
      ${xAxis(x, [30, 50, 70, 90, 110], 80, t => t)}
      ${d.map(v => `<circle cx="${x(v)}" cy="50" r="7" fill="var(--context-2)" stroke="var(--surface)" stroke-width="2" style="transition:cx .5s var(--ease)"/>`).join('')}
      <line x1="${x(m)}" x2="${x(m)}" y1="14" y2="86" stroke="var(--accent-viz)" stroke-width="2.5"/>
      <text x="${x(m)}" y="10" text-anchor="middle" style="fill:var(--accent);font-weight:600">x̄ = ${fmt(m, 1)}</text>
      <text x="${x(m + s) + 4}" y="32">+1σ</text><text x="${x(m - s) - 4}" y="32" text-anchor="end">−1σ</text>`;
    el.querySelector('[data-t]').innerHTML = `<tr><th>x</th><th>x − x̄</th><th>(x − x̄)²</th></tr>${d.map(v => `<tr><td class="num">${v}</td><td class="num">${fmt(v - m, 2)}</td><td class="num">${fmt((v - m) ** 2, 2)}</td></tr>`).join('')}
      <tr><td class="muted">Σ</td><td class="num">0</td><td class="num"><strong>${fmt(d.reduce((a, v) => a + (v - m) ** 2, 0), 2)}</strong></td></tr>`;
    el.querySelector('.readout').innerHTML = `<div><div class="k">Variance ${sample ? 's²' : 'σ²'}</div><div class="v">${fmt(v)}</div></div><div><div class="k">Std dev ${sample ? 's' : 'σ'}</div><div class="v accent">${fmt(s)}</div></div><div><div class="k">Range</div><div class="v">${Math.max(...d) - Math.min(...d)}</div></div>`;
    el.querySelector('.explain').innerHTML = `Sum the squared deviations, divide by <strong>${sample ? `N − 1 = ${d.length - 1}` : `N = ${d.length}`}</strong> to get the variance, then take the square root for the standard deviation. Deviations always sum to 0, which is why we square them first. ${sample ? 'Dividing by N−1 corrects a sample\'s tendency to underestimate spread.' : 'The lecture\'s definition: the average of the squared differences.'}`;
  };
  el.addEventListener('input', e => { if (e.target.id === 'spr') { spread = +e.target.value; update(); } });
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { sample = b.dataset.v === 'samp'; setSeg(el.querySelector('.seg'), b.dataset.v); update(); } });
  update();
}

// ---------- box plot builder ----------
const BOX = { exam: '52, 58, 61, 64, 66, 67, 70, 71, 73, 75, 78, 81, 84, 88', outlier: '12, 55, 58, 61, 64, 66, 67, 70, 71, 73, 75, 78, 81, 99', even: '3, 7, 8, 5, 12, 14, 21, 13, 18, 9' };
export function boxbuilder(el) {
  el.innerHTML = `${bench('chart-bar-horizontal', 'Five-number summary → box plot', 'Type your own numbers too')}
  <div class="bench-body">
    <div class="controls">${seg([['exam', 'Exam scores'], ['outlier', 'With outliers'], ['even', 'Even N, unsorted']], 'exam')}
      <div class="field" style="max-width:none;flex:2"><label for="boxin">Values (comma separated)</label><input id="boxin" type="text" value="${BOX.exam}"></div></div>
    <svg class="viz" viewBox="0 0 720 170" role="img" aria-label="Sorted values with quartiles and the resulting box plot"></svg>
    <div class="readout"></div>
    <div class="explain"></div>
  </div>`;
  const update = () => {
    const d = el.querySelector('#boxin').value.split(/[,\s]+/).map(Number).filter(v => Number.isFinite(v));
    const svg = el.querySelector('svg');
    if (d.length < 4) { svg.innerHTML = `<text x="360" y="85" text-anchor="middle">Enter at least 4 numbers</text>`; el.querySelector('.readout').innerHTML = ''; el.querySelector('.explain').innerHTML = ''; return; }
    const f = fiveNum(d), iqr = f.q3 - f.q1, lo = f.q1 - 1.5 * iqr, hi = f.q3 + 1.5 * iqr;
    const pad = (f.max - f.min) * .08 || 1, x = scale(f.min - pad, f.max + pad, 30, 700), s = sorted(d);
    svg.innerHTML = `<text x="0" y="32" class="lbl-strong">sorted</text>
      ${s.map((v, i) => `<circle cx="${x(v)}" cy="${36 - (s.slice(0, i).filter(u => u === v).length) * 11}" r="5" fill="${v < lo || v > hi ? 'var(--bad)' : 'var(--context-2)'}"/>`).join('')}
      ${[['Q1', f.q1], ['Q2', f.med], ['Q3', f.q3]].map(([l, v]) => `<line x1="${x(v)}" x2="${x(v)}" y1="46" y2="140" stroke="var(--line-strong)" stroke-dasharray="3 3"/><text x="${x(v)}" y="60" text-anchor="middle" style="fill:var(--ink-2);font-weight:600">${l}</text>`).join('')}
      <line x1="${x(Math.max(lo, f.min - pad))}" x2="${x(Math.max(lo, f.min - pad))}" y1="80" y2="130" stroke="var(--bad)" stroke-dasharray="2 4" opacity=".6"/>
      <line x1="${x(Math.min(hi, f.max + pad))}" x2="${x(Math.min(hi, f.max + pad))}" y1="80" y2="130" stroke="var(--bad)" stroke-dasharray="2 4" opacity=".6"/>
      ${boxplotSVG({ data: d, x, y: 104, h: 30 })}
      ${xAxis(x, niceTicks(f.min - pad, f.max + pad, 8), 140, v => fmt(v, 1))}`;
    const outs = d.filter(v => v < lo || v > hi);
    el.querySelector('.readout').innerHTML = [['Min', f.min], ['Q1', f.q1], ['Median', f.med], ['Q3', f.q3], ['Max', f.max], ['IQR', iqr]].map(([k, v]) => `<div><div class="k">${k}</div><div class="v ${k === 'Median' ? 'accent' : ''}">${fmt(v)}</div></div>`).join('');
    el.querySelector('.explain').innerHTML = `Fences: Q1 − 1.5·IQR = <span class="num">${fmt(lo)}</span>, Q3 + 1.5·IQR = <span class="num">${fmt(hi)}</span>. ${outs.length ? `<strong>${outs.length} outlier${outs.length > 1 ? 's' : ''}</strong> (${outs.join(', ')}) sit beyond the fences and are drawn as red circles; whiskers stop at the last value inside.` : 'No value falls outside the fences, so whiskers reach the min and max.'} Quartiles use linear interpolation (pandas default), so hand calculations with other rules may differ slightly.`;
  };
  el.addEventListener('input', e => { if (e.target.id === 'boxin') update(); });
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { el.querySelector('#boxin').value = BOX[b.dataset.v]; setSeg(el.querySelector('.seg'), b.dataset.v); update(); } });
  update();
}

// ---------- population vs sample ----------
export function sample(el) {
  const r = rng(11);
  const POP = Array.from({ length: 600 }, () => Math.min(58, Math.max(1, Math.round(Math.exp(2.4 + 0.55 * normal(r))))));
  const popMean = mean(POP);
  let n = 10, hist = [], cur = [];
  const W = 720, x = scale(0, 60, 30, 700), bins = histogram(POP, 30, 0, 60), maxC = Math.max(...bins.map(b => b.c));
  const y = scale(0, maxC, 150, 30);
  el.innerHTML = `${bench('users-four', 'Population vs sample', 'Minutes on site for 600 visitors (simulated)')}
  <div class="bench-body">
    <div class="controls">
      <div class="field"><label for="sn">Sample size n <span class="val" data-n>${n}</span></label><input id="sn" type="range" min="3" max="150" value="${n}"></div>
      <button class="btn primary" data-draw><i class="ph ph-shuffle"></i>Draw a sample</button>
      <button class="btn" data-draw20><i class="ph ph-repeat"></i>Draw 20</button>
      <button class="btn ghost" data-clear>Clear</button>
    </div>
    <svg class="viz" viewBox="0 0 ${W} 240" role="img" aria-label="Population histogram with sampled values and sample means"></svg>
    <div class="readout"></div>
    <div class="explain"></div>
  </div>`;
  const draw = () => { const s = Array.from({ length: n }, () => POP[Math.floor(r() * POP.length)]); cur = s; hist.push(mean(s)); if (hist.length > 60) hist.shift(); };
  const update = () => {
    const svg = el.querySelector('svg');
    svg.innerHTML = `${bins.map(b => `<rect x="${x(b.x0) + 1}" y="${y(b.c)}" width="${x(b.x1) - x(b.x0) - 2}" height="${150 - y(b.c)}" fill="var(--context)" rx="2"/>`).join('')}
      ${xAxis(x, [0, 10, 20, 30, 40, 50, 60], 150, v => v)}
      ${cur.map(v => `<circle cx="${x(v) + (Math.random() - .5) * 6}" cy="${140 - Math.random() * 30}" r="3.2" fill="var(--accent-viz)" opacity=".8"/>`).join('')}
      <line x1="${x(popMean)}" x2="${x(popMean)}" y1="20" y2="215" stroke="var(--ink)" stroke-width="2"/><text x="${x(popMean) + 6}" y="28" class="lbl-strong">population mean ${fmt(popMean, 1)}</text>
      <text x="0" y="208" class="lbl-strong">sample means</text>
      ${hist.map((m, i) => `<line x1="${x(m)}" x2="${x(m)}" y1="196" y2="218" stroke="var(--accent-viz)" stroke-width="2" opacity="${i === hist.length - 1 ? 1 : .35}"/>`).join('')}`;
    const sd = hist.length > 1 ? std(hist, true) : NaN;
    el.querySelector('.readout').innerHTML = `<div><div class="k">Population mean μ</div><div class="v">${fmt(popMean)}</div></div><div><div class="k">Last sample mean x̄</div><div class="v accent">${hist.length ? fmt(hist.at(-1)) : 'none'}</div></div><div><div class="k">Error</div><div class="v">${hist.length ? fmt(hist.at(-1) - popMean) : 'none'}</div></div><div><div class="k">Spread of x̄ (sd)</div><div class="v">${Number.isNaN(sd) ? 'none' : fmt(sd)}</div></div>`;
    el.querySelector('.explain').innerHTML = hist.length < 2 ? 'Draw several samples. Each sample mean lands somewhere different: that wobble is why we are "uncertain whether the mean of a sample is representative".' : `With n = ${n}, sample means scatter with a spread of about ${fmt(sd, 1)} minutes. Increase n and draw 20 more: the ticks crowd around μ. Bigger representative samples are more trustworthy.`;
  };
  el.addEventListener('input', e => { if (e.target.id === 'sn') { n = +e.target.value; el.querySelector('[data-n]').textContent = n; hist = []; cur = []; update(); } });
  el.addEventListener('click', e => {
    if (e.target.closest('[data-draw]')) { draw(); update(); }
    if (e.target.closest('[data-draw20]')) { for (let i = 0; i < 20; i++) draw(); update(); }
    if (e.target.closest('[data-clear]')) { hist = []; cur = []; update(); }
  });
  update();
}

// ---------- Anscombe ----------
const AX = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
const ANS = [
  { x: AX, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68], note: 'A noisy linear relationship.' },
  { x: AX, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74], note: 'A clean curve. A straight line is the wrong model.' },
  { x: AX, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73], note: 'A perfect line ruined by one outlier.' },
  { x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89], note: 'No relationship at all; one point creates the correlation.' },
];
export function anscombe(el) {
  let show = false;
  const render = () => {
    el.innerHTML = `${bench('eye', 'Anscombe\'s quartet', show ? 'Same numbers, four different stories' : 'Guess first: are these datasets alike?')}
    <div class="bench-body">
      <div class="controls">${seg([['stats', 'Statistics only'], ['plots', 'Reveal the plots']], show ? 'plots' : 'stats')}</div>
      ${show ? `<div class="three" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${ANS.map((d, i) => {
        const x = scale(2, 20, 26, 236), y = scale(2, 14, 166, 12);
        return `<figure style="margin:0;animation:viewIn .5s var(--ease) ${i * 90}ms both"><svg class="viz" viewBox="0 0 240 190">
          ${yGrid(y, [4, 8, 12], 26, 236, v => v)}${xAxis(x, [5, 10, 15, 20], 166, v => v)}
          <line x1="${x(3)}" y1="${y(4.5)}" x2="${x(19)}" y2="${y(12.5)}" stroke="var(--context-2)" stroke-dasharray="4 3"/>
          ${d.x.map((v, k) => `<circle cx="${x(v)}" cy="${y(d.y[k])}" r="4.5" fill="var(--accent-viz)"/>`).join('')}
          <text x="236" y="14" text-anchor="end" class="lbl-strong">${['I', 'II', 'III', 'IV'][i]}</text></svg>
          <figcaption class="small muted" style="margin-top:4px">${d.note}</figcaption></figure>`;
      }).join('')}</div>` : `<div class="tbl-wrap"><table class="tbl"><tr><th>Set</th><th>mean x</th><th>mean y</th><th>var x</th><th>var y</th><th>correlation r</th></tr>
        ${ANS.map((d, i) => `<tr><td><strong>${['I', 'II', 'III', 'IV'][i]}</strong></td><td class="num">${fmt(mean(d.x))}</td><td class="num">${fmt(mean(d.y))}</td><td class="num">${fmt(variance(d.x, true))}</td><td class="num">${fmt(variance(d.y, true))}</td><td class="num">${fmt(pearson(d.x, d.y), 3)}</td></tr>`).join('')}</table></div>`}
      <div class="explain">${show ? 'Every dataset has the same regression line (dashed, y ≈ 3 + 0.5x). Only the picture reveals the curve, the outlier and the fake correlation. <strong>Always plot your data.</strong>' : 'Means, variances and correlations match to two decimals. Based on the numbers, you would call these four datasets identical.'}</div>
    </div>`;
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { show = b.dataset.v === 'plots'; render(); } });
  render();
}

// ---------- pre-attentive search ----------
export function preattentive(el) {
  let mode = 'hue', size = 36, start = 0, target = -1, items = [], times = { hue: [], shape: [], conj: [] }, misses = 0, playing = false;
  const r = rng(Date.now() % 9973);
  const build = () => {
    items = Array.from({ length: size }, () => {
      if (mode === 'hue') return { shape: 'c', color: 'g' };
      if (mode === 'shape') return { shape: 'c', color: 'g' };
      return r() < .5 ? { shape: 'c', color: 'a' } : { shape: 's', color: 'g' };
    });
    target = Math.floor(r() * size);
    items[target] = mode === 'hue' ? { shape: 'c', color: 'a' } : mode === 'shape' ? { shape: 's', color: 'g' } : { shape: 's', color: 'a' };
  };
  const cols = () => Math.ceil(Math.sqrt(size * 1.8));
  const render = () => {
    const c = cols(), rowsN = Math.ceil(size / c), cell = 34, W = c * cell, H = rowsN * cell;
    const avg = k => times[k].length ? mean(times[k]) : null;
    const best = { hue: 'Find the orange circle', shape: 'Find the square', conj: 'Find the orange square' }[mode];
    el.innerHTML = `${bench('timer', 'Pre-attentive search', 'Click the odd one out as fast as you can')}
    <div class="bench-body">
      <div class="controls">
        ${seg([['hue', 'Hue'], ['shape', 'Shape'], ['conj', 'Hue + shape']], mode)}
        <div class="field"><label for="psz">Items <span class="val">${size}</span></label><input id="psz" type="range" min="12" max="80" step="4" value="${size}"></div>
        <button class="btn primary" data-go><i class="ph ph-play"></i>${playing ? 'Restart round' : 'Start round'}</button>
      </div>
      <div class="two" style="align-items:start">
        <div style="min-height:220px;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:12px">
          ${playing ? `<svg class="viz" viewBox="0 0 ${W} ${H}" style="max-width:${Math.min(460, W * 1.4)}px" role="img" aria-label="${best}">
            ${items.map((it, i) => { const cx = (i % c) * cell + cell / 2, cy = Math.floor(i / c) * cell + cell / 2, fill = it.color === 'a' ? 'var(--accent-viz)' : 'var(--context-2)';
              return it.shape === 'c' ? `<circle data-k="${i}" cx="${cx}" cy="${cy}" r="10" fill="${fill}" style="cursor:pointer"/>` : `<rect data-k="${i}" x="${cx - 9.5}" y="${cy - 9.5}" width="19" height="19" fill="${fill}" style="cursor:pointer"/>`; }).join('')}
          </svg>` : `<div class="muted small" style="text-align:center"><strong style="color:var(--ink)">${best}.</strong><br>Press Start. Do 3 rounds per mode, then compare.</div>`}
        </div>
        <div>
          <svg class="viz" viewBox="0 0 320 150" role="img" aria-label="Average search time by mode">
            ${(() => { const ks = [['hue', 'Hue'], ['shape', 'Shape'], ['conj', 'Hue + shape']], mx = Math.max(1.5, ...ks.map(([k]) => avg(k) || 0)), x = scale(0, mx, 90, 300);
              return ks.map(([k, l], i) => { const a = avg(k); return `<text x="84" y="${30 + i * 42}" text-anchor="end" class="${k === mode ? 'lbl-strong' : ''}">${l}</text>
                <rect x="90" y="${16 + i * 42}" width="${a ? x(a) - 90 : 0}" height="22" rx="4" fill="${k === 'conj' ? 'var(--accent-viz)' : 'var(--context)'}" style="transition:width .5s var(--ease)"/>
                <text x="${a ? x(a) + 6 : 96}" y="${31 + i * 42}" class="num">${a ? fmt(a, 2) + ' s' : 'no data'} ${times[k].length ? `(${times[k].length})` : ''}</text>`; }).join(''); })()}
          </svg>
          <div class="explain">${times.conj.length && (times.hue.length || times.shape.length) ? `Hue and shape alone "pop out" (pre-attentive, parallel). The conjunction forces a <strong>serial</strong> search: you check items one by one, so time grows with the number of items. Try 80 items to feel it.` : 'Single features are processed in parallel; conjunctions are not. Measure it yourself.'}${misses ? ` <span class="muted">Misclicks: ${misses}.</span>` : ''}</div>
        </div>
      </div>
    </div>`;
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (b) { mode = b.dataset.v; playing = false; render(); return; }
    if (e.target.closest('[data-go]')) { build(); playing = true; render(); start = performance.now(); return; }
    const k = e.target.closest('[data-k]');
    if (k && playing) {
      if (+k.dataset.k === target) { times[mode].push((performance.now() - start) / 1000); playing = false; render(); }
      else { misses++; k.style.opacity = .3; }
    }
  });
  el.addEventListener('change', e => { if (e.target.id === 'psz') { size = +e.target.value; playing = false; render(); } });
  render();
}

export function purpose(el) {
  sorter(el, {
    id: 'l3-purpose', icon: 'compass', title: 'What is this chart for?', options: ['Comparison', 'Distribution', 'Relationship', 'Composition'],
    items: [
      { t: 'Revenue of 6 branches this quarter', a: 'Comparison', why: 'Groups compared on one metric: bar or column chart.' },
      { t: 'How exam marks are spread across 1,000 students', a: 'Distribution', why: 'The full shape of one variable: histogram.' },
      { t: 'Does study time relate to grade?', a: 'Relationship', why: 'Two numeric attributes together: scatter plot.' },
      { t: 'Share of each product line within total sales per year', a: 'Composition', why: 'Parts of a whole: stacked column.' },
      { t: 'Where do earthquakes cluster on the globe?', a: 'Distribution', why: 'The lecture lists maps under distribution.' },
      { t: 'GDP vs life expectancy, with population as bubble size', a: 'Relationship', why: 'Bubble charts add a third dimension to a relationship.' },
    ],
  });
}
