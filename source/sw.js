/* Network-first versioned PWA: online changes must never be masked by stale exercise JS. */
const CACHE='eeit-private-drive-pdfs-v16';
const CORE=[
 './','./index.html','./styles.css','./app.js','./visuals.mjs',
 './cloud.css','./brand-ui.css','./inline-solutions.css','./a4-paper.css','./source-library.css','./source-library.mjs',
 './visuals.css','./cloud.js','./assets/eeit-study-hub-logo.webp',
 './data/content.json','./data/verified-expansion.json',
 './data/pdf-catalog.json','./data/original-practice-reworked.json','./data/source-backed-derivations.json','./manifest.webmanifest','./assets/favicon.svg'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/cloud-config.js')){
   event.respondWith(fetch(request).catch(()=>new Response('window.EEIT_FIREBASE_CONFIG=null;', {headers:{'Content-Type':'application/javascript'}})));
   return;
 }
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{
     const response=await fetch(request);
     if(response.ok && response.type!=='opaque'){
       const pathname=url.pathname.toLowerCase();
       if(request.mode==='navigate'||/\.(?:js|mjs|css|json|svg|webp|png|webmanifest)$/.test(pathname)||pathname.endsWith('/')){
         await cache.put(request,response.clone()).catch(()=>{});
       }
     }
     return response;
   }catch(error){
     const saved=await cache.match(request);
     if(saved)return saved;
     if(request.mode==='navigate'){
       const fallback=await cache.match('./index.html');
       if(fallback)return fallback;
     }
     return new Response('Offline. Reload after network is restored.',{status:503,headers:{'Content-Type':'text/plain'}});
   }
 })());
});
