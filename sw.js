const CACHE_NAME = 'game-center-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './memory-game.html',
  './block-blast.html',
  './one-line.html',
  './screw-puzzle.html',
  './skybound.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
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
  "./jump.mp3",
  "./coin.mp3",
  "./gameover.mp3",
  "./powerup.mp3",
  "./damage.mp3",
  "./click.mp3",
  "./bgm.mp3",
  "./menu.mp3"
];

// Install: pre-cache the app shell. Assets that fail (e.g. missing sound
// files, or fonts if offline during install) are skipped instead of
// aborting the whole install.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
});

// Activate: drop old cache versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin app files so the games work fully
// offline once opened once; network-first fallback for everything else
// (e.g. Google Fonts), with cache fallback if offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            return res;
          })
          .catch(() => cached);
      })
    );
  } else {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
