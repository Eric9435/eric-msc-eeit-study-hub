const CACHE='eeit-source-derivations-v12';
const CORE=['./','./index.html','./styles.css','./app.js','./visuals.mjs','./cloud.css','./brand-ui.css','./inline-solutions.css','./visuals.css','./a4-paper.css','./cloud.js','./assets/eeit-study-hub-logo.webp','./data/content.json','./data/verified-expansion.json','./data/original-practice-reworked.json','./data/source-backed-derivations.json','./manifest.webmanifest','./assets/favicon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==location.origin)return;
 if(url.pathname.endsWith('/cloud-config.js')){e.respondWith(fetch(e.request).catch(()=>new Response('window.EEIT_FIREBASE_CONFIG=null;', {headers:{'Content-Type':'application/javascript'}})));return;}
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
   if(resp.ok && (url.pathname.includes('/assets/')))caches.open(CACHE).then(c=>c.put(e.request,resp.clone()));
   return resp;
 }).catch(()=>new Response('Offline. Reload after network is restored.',{status:503}))));
});