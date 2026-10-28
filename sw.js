/* NeuroGym service worker — neurogym-v34 */
const V='neurogym-v34',CORE=['./','index.html','manifest.webmanifest','icon-192.png'];
const EXT=['fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const swr=(r)=>caches.open(V).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>m);return m||n}));
const netFirst=(r)=>caches.open(V).then(c=>fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>c.match(r).then(m=>m||c.match('index.html')||c.match('./'))));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;let u;try{u=new URL(r.url)}catch(x){return}
if(u.origin===location.origin){if(r.mode==='navigate'||/\.html$|\/$/.test(u.pathname))e.respondWith(netFirst(r));else e.respondWith(swr(r));return}
if(EXT.includes(u.hostname))e.respondWith(swr(r))});