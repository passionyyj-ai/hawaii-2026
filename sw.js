const CACHE_NAME='travelmate-v19-0';
const CORE=['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.ico'];

self.addEventListener('install',event=>{
  // skipWaiting을 사용하지 않습니다. 현재 사용 중인 화면을 강제로 교체하지 않습니다.
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(key=>key.startsWith('travelmate-v19-0')&&key!==CACHE_NAME)
          .map(key=>caches.delete(key))
    ))
  );
  // clients.claim()을 사용하지 않아 실행 중인 페이지가 갑자기 재제어되지 않게 합니다.
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(event.request.mode==='navigate'||/\.(?:html|js|css|webmanifest|json)$/.test(url.pathname)){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});
