const CACHE_NAME = "skybound-cache-v2";

const ASSETS_TO_CACHE = [
  "./",
  "./skybound.html",
  "./manifest.json",

  // Character & decor images
  "./ChatGPT_Image_15_Jul_2025_15.20.27-removebg-preview.png",
  "./ChatGPT Image 15 Jul 2025 15.43.23.png",
  "./laki-laki copy.png",
  "./perempuan copyy.png",
  "./coin.png",
  "./heart.png",
  "./popup.jpg",
  "./zada.jpg",
  "./farel.jpg",
  "./powerup.png",

  // Icons
  "./icon-192.png",
  "./icon-512.png",

  // Audio (biggest source of mid-game stutter if not cached up front)
  "./jump.mp3",
  "./coin.mp3",
  "./gameover.mp3",
  "./powerup.mp3",
  "./damage.mp3",
  "./click.mp3",
  "./bgm.mp3",
  "./menu.mp3"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache individually instead of addAll() so one missing/renamed
      // file doesn't break the whole install (and therefore doesn't
      // break offline play for everything else).
      return Promise.all(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn("SW: gagal cache", url, err))
        )
      );
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache newly-seen same-origin assets too, so a fresh session
        // becomes fully offline-capable on the next visit.
        if (response && response.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
