/* Offline support: network first, cached copy when offline. Only same-origin GET requests are cached. */
const CACHE = 'psych-stats-lab-d40a5d58';
const CORE = [
 "./",
 "icon-192.png",
 "icon-512.png",
 "manifest.webmanifest",
 "firebase-config.js?v=eda8311d",
 "account.js?v=41f29d65",
 "vendor/anim/gsap.min.js",
 "vendor/anim/ScrollTrigger.min.js",
 "vendor/anim/SplitText.min.js",
 "vendor/anim/MotionPathPlugin.min.js",
 "vendor/anim/lenis.min.js",
 "stats-motion.js?v=5b9d929e",
 "stats-exam.js?v=55ac3a71",
 "audience.js?v=00c14371",
 "constructs.js?v=daa0e288",
 "destrieux.js?v=ddb32acb",
 "stats-neuro.js?v=df252a82",
 "privacy.js?v=2298d6fa",
 "visits.js?v=60e8c491",
 "know.js?v=ad290bf1",
 "tests.js?v=660c3b93",
 "reward.js?v=ea623b54",
 "stats-thesis.js?v=08dd84c0",
 "admin.js?v=7076a1a8",
 "laws.js?v=cca56bd5",
 "qr.js?v=6e6189e2"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || (req.mode === 'navigate' ? caches.match('./') : null)).then(r => r || Response.error())));
});
