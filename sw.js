// Movimenti: copia locale per aprire subito l'app e usarla anche senza rete.
// Le pagine del sito arrivano sempre prima dalla rete (così le versioni nuove si vedono subito); senza rete si usa la copia salvata.
const C="movimenti-v1";
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html"])).catch(()=>{})); });
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){
    // librerie (Excel, PDF): prima la copia salvata
    if(/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)cdn\.jsdelivr\.net$/.test(u.hostname))
      e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==="opaque") c.put(r,res.clone()); return res; }))));
    return;
  }
  const key=u.origin+(u.pathname.endsWith("/")?u.pathname+"index.html":u.pathname);
  e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(key,cp)); } return res; })
    .catch(()=>caches.open(C).then(c=>c.match(key).then(m=>m||c.match(new URL("./index.html",self.registration.scope).href)))));
});
