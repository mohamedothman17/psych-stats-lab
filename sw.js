/* Offline support. Only same-origin GET requests are handled.
   - The shell (index.html) is the only thing stored at install. It is answered from the cache at once and refreshed
     in the background, so a new version takes over on the next visit.
   - Everything else (route chunks, shared modules, vendor libraries) is stored the first time it is fetched.
     Files addressed with ?v=<hash> never change under the same address, so the stored copy is used as is. */
const CACHE = 'psych-stats-lab-b2b2fdd8';
const CORE = [
 "./",
 "icon-192.png",
 "icon-512.png",
 "manifest.webmanifest"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'no-cache' })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const ok = res => res && res.ok && res.type === 'basic';
/* Store a versioned file and drop older versions of the same file. */
async function putVersioned(c, req, res) {
  await c.put(req, res);
  const u = new URL(req.url);
  (await c.keys()).forEach(k => { const ku = new URL(k.url); if (ku.pathname === u.pathname && ku.search !== u.search && ku.search.startsWith('?v=')) c.delete(k); });
}
/* A new shell names new versions of the chunks; refresh the ones this visitor already has, so they still open offline. */
async function warm(c, res) {
  const html = await res.text(), names = new Set((await c.keys()).map(k => new URL(k.url).pathname.split('/').pop()));
  const refs = [...new Set(html.match(/[\w.-]+\.js\?v=[0-9a-zA-Z]+/g) || [])].filter(r => names.has(r.split('?')[0]));
  for (const r of refs) { if (await c.match(r)) continue; try { const f = await fetch(r); if (ok(f)) await putVersioned(c, new Request(r), f); } catch (e) { } }
}
async function refreshShell(c) {
  const old = await c.match('./'), res = await fetch('./', { cache: 'no-cache' });
  if (!ok(res)) return;
  const copy = res.clone(), was = old ? await old.text() : '', now = await res.clone().text();
  await c.put('./', res);
  if (was === now) return;
  await warm(c, copy);
  (await self.clients.matchAll({ type: 'window' })).forEach(cl => cl.postMessage({ type: 'shell-updated' }));
}
async function shell(e) {
  const c = await caches.open(CACHE), hit = await c.match('./');
  if (hit) { e.waitUntil(refreshShell(c).catch(() => { })); return hit; }
  try { const res = await fetch(e.request); if (ok(res)) c.put('./', res.clone()); return res; } catch (err) { return Response.error(); }
}
async function asset(e) {
  const req = e.request, c = await caches.open(CACHE), versioned = /[?&]v=/.test(req.url), hit = await c.match(req);
  const net = () => fetch(req).then(res => { if (ok(res)) { const copy = res.clone(); e.waitUntil((versioned ? putVersioned(c, req, copy) : c.put(req, copy)).catch(() => { })); } return res; });
  if (hit) { if (!versioned) e.waitUntil(net().catch(() => { })); return hit; }
  try { return await net(); } catch (err) { return (await c.match(req, { ignoreSearch: true })) || Response.error(); }
}
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  const scope = new URL('./', self.location).pathname;
  if (req.mode === 'navigate' && (u.pathname === scope || u.pathname === scope + 'index.html')) return e.respondWith(shell(e));
  if (u.pathname === scope + 'sw.js') return;
  e.respondWith(asset(e));
});
