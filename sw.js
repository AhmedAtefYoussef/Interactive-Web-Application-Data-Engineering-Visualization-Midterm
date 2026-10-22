// Offline support and instant repeat visits.
// Strategy: serve from cache immediately, refresh the cache in the background
// (stale-while-revalidate). A new deploy shows up on the next visit.
const CACHE = 'devstudy-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg',
  'css/styles.css', 'css/quiz.css', 'css/motion.css',
  'js/app.js', 'js/modules.js', 'js/bank.js', 'js/store.js', 'js/viz.js', 'js/motion.js', 'js/quiz-setup.js', 'js/placement.js',
  'js/widgets/index.js', 'js/widgets/w-foundations.js', 'js/widgets/w-stats.js', 'js/widgets/w-charts.js', 'js/widgets/w-prep.js', 'js/widgets/w-bi.js',
];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !CDN.includes(url.hostname)) return;

  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: same });
    const fresh = fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) { e.waitUntil(fresh); return cached; }
    return fresh;
  }));
});
