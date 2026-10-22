import * as foundations from './w-foundations.js';
import * as stats from './w-stats.js';
import * as charts from './w-charts.js';
import * as prep from './w-prep.js';
import * as bi from './w-bi.js';

const { sorter, ...F } = foundations;
export const WIDGETS = { ...F, ...stats, ...charts, ...prep, ...bi };

function mountOne(el, cleanups) {
  if (el.dataset.mounted) return;
  el.dataset.mounted = '1';
  const fn = WIDGETS[el.dataset.widget];
  if (!fn) { el.innerHTML = `<div class="bench-body muted">Widget "${el.dataset.widget}" is missing.</div>`; return; }
  coalesceSliders(el);
  try {
    const c = fn(el);
    if (typeof c === 'function') cleanups.push(c);
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="bench-body muted">This simulator failed to load. The notes around it still apply.</div>`;
  }
}

// Sliders fire "input" far more often than the screen refreshes. Hold back all but the
// latest value until the next animation frame, so a drag redraws at most once per frame.
function coalesceSliders(el) {
  const pending = new Set();
  el.addEventListener('input', e => {
    const t = e.target;
    if (t.type !== 'range' || e.coalesced) return;
    e.stopImmediatePropagation();
    if (pending.has(t)) return;
    pending.add(t);
    requestAnimationFrame(() => {
      pending.delete(t);
      const ev = new Event('input', { bubbles: true });
      ev.coalesced = true;
      t.dispatchEvent(ev);
    });
  }, true);
}

// Simulators mount only when they come within ~1.5 screens of the viewport, so opening a
// module renders its text immediately and spreads the chart work across the scroll.
// The returned cleanup also has mountThrough(target): mounts every simulator up to and inside
// target first, so jumping to a section does not drift while charts above it appear.
export function mountWidgets(root) {
  const cleanups = [];
  const els = [...root.querySelectorAll('[data-widget]')];
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      mountOne(en.target, cleanups);
    }), { rootMargin: '150% 0px 150% 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => mountOne(el, cleanups));
  }
  const api = () => { io?.disconnect(); cleanups.forEach(c => c()); };
  api.mountThrough = target => els.forEach(el => {
    if (target.contains(el) || el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) { io?.unobserve(el); mountOne(el, cleanups); }
  });
  return api;
}
