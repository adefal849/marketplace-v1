// Service worker volontairement minimal pour un site marchand : les prix,
// stocks, panier et pages connectées changent tout le temps, donc on évite
// tout cache agressif qui pourrait montrer une donnée périmée ou, pire,
// une réponse d'API mise en cache pour le mauvais utilisateur.
//
// Ce que fait ce SW :
// - Permet l'installation de l'app (icône, plein écran) via manifest.json
// - Affiche une page "hors ligne" propre si la navigation échoue sans réseau
// Ce qu'il ne fait PAS :
// - Ne met jamais en cache /api/*, /dashboard/*, /panier, /connexion, /inscription
// - Ne met en cache aucune requête POST/PATCH/DELETE

const CACHE_OFFLINE = "divine-harvest-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_OFFLINE).then((cache) => cache.addAll(["/offline.html"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((c) => c !== CACHE_OFFLINE).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne touche qu'aux navigations (chargement de page HTML), jamais aux
  // appels API, images, scripts ou requêtes non-GET.
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match("/offline.html"))
  );
});
