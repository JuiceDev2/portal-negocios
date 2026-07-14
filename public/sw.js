// Service worker de El Arenalense.
// Estrategia deliberadamente simple: solo cachea el "app shell" estático
// (iconos, manifest) y sirve una página de respaldo cuando no hay red.
// Nunca cachea /api/* ni datos de Supabase: esa información cambia seguido
// y necesita estar siempre fresca, así que esas peticiones van directo a red.

const VERSION = 'el-arenalense-v1';
const CACHE_ESTATICO = `estatico-${VERSION}`;
const RUTA_OFFLINE = '/offline';

const APP_SHELL = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  RUTA_OFFLINE,
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_ESTATICO)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== CACHE_ESTATICO)
            .map((clave) => caches.delete(clave))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;

  // Solo GET; y nunca tocar /api ni peticiones a otros dominios (Supabase, etc).
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navegación (cargar una página): red primero, con respaldo a la página offline.
  if (request.mode === 'navigate') {
    evento.respondWith(
      fetch(request).catch(() => caches.match(RUTA_OFFLINE))
    );
    return;
  }

  // Assets estáticos propios (íconos, manifest, _next/static): cache primero.
  const esAssetEstatico =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/manifest.json';

  if (esAssetEstatico) {
    evento.respondWith(
      caches.match(request).then(
        (enCache) =>
          enCache ||
          fetch(request).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(CACHE_ESTATICO).then((cache) => cache.put(request, copia));
            return respuesta;
          })
      )
    );
  }
});
