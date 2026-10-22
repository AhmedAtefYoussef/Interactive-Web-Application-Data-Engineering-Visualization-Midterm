import * as foundations from './w-foundations.js';
import * as stats from './w-stats.js';
import * as charts from './w-charts.js';
import * as prep from './w-prep.js';
import * as bi from './w-bi.js';

const { sorter, ...F } = foundations;
export const WIDGETS = { ...F, ...stats, ...charts, ...prep, ...bi };

// Mounts every [data-widget] inside root. Returns a cleanup for widgets with timers.
export function mountWidgets(root) {
  const cleanups = [];
  root.querySelectorAll('[data-widget]').forEach(el => {
    const fn = WIDGETS[el.dataset.widget];
    if (!fn) { el.innerHTML = `<div class="bench-body muted">Widget "${el.dataset.widget}" is missing.</div>`; return; }
    try {
      const c = fn(el);
      if (typeof c === 'function') cleanups.push(c);
    } catch (err) {
      console.error(err);
      el.innerHTML = `<div class="bench-body muted">This simulator failed to load. The notes around it still apply.</div>`;
    }
  });
  return () => cleanups.forEach(c => c());
}
