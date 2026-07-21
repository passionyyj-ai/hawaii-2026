const CACHE_NAME='travelmate-v22-1-beta';
const CORE=['./','./index.html','./config.js','./v21.js','./manifest.webmanifest','./version.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.ico'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('travelmate-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'||/\.(?:html|js|css|webmanifest|json)$/.test(url.pathname)){
   event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(c=>c.put(event.request,r.clone()));return r}).catch(()=>caches.match(event.request).then(x=>x||caches.match('./index.html'))));return;
 }
 event.respondWith(caches.match(event.request).then(x=>x||fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(c=>c.put(event.request,r.clone()));return r})));
});
