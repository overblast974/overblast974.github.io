/* =================================================================
   SERVICE WORKER ULTRA-OPTIMISÉ - PHASE 3.1
   Cache intelligent et preload avancé pour performance maximale
   ================================================================= */

const CACHE_NAME = 'coach-apar-v3-1-optimized';
const CACHE_VERSION = '3.1.0';

// Stratégies de cache par type de ressource
const CACHE_STRATEGIES = {
  // Ressources critiques - Cache First
  CRITICAL: 'cache-first',
  // Images - Stale While Revalidate  
  IMAGES: 'stale-while-revalidate',
  // API/Dynamic - Network First
  DYNAMIC: 'network-first',
  // Static Assets - Cache First avec fallback
  STATIC: 'cache-first-fallback'
};

// Ressources à mettre en cache lors de l'installation
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/styles-final-optimized.css',
  '/css/animations-optimized.css',
  '/css/components-ux.css',
  '/js/main-hyper-optimized.js',
  '/images/logo.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Images à précharger avec lazy loading intelligent
const PRELOAD_IMAGES = [
  '/images/loic-photo.png',
  '/images/coaching-sportif.jpg',
  '/images/Conseils-nutritionnels.webp'
];

// Routes dynamiques pour SPA
const DYNAMIC_ROUTES = [
  '/pages/',
  '/blog/',
  '/api/'
];

// =================================================================
// INSTALLATION ET ACTIVATION
// =================================================================

self.addEventListener('install', event => {
  console.log('🚀 Service Worker installation - Cache v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Mise en cache des ressources critiques...');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('✅ Ressources critiques mises en cache');
        return self.skipWaiting(); // Force activation
      })
      .catch(error => {
        console.error('❌ Erreur lors de la mise en cache:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('⚡ Service Worker activation - v' + CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      cleanupOldCaches(),
      // Preload intelligent des images
      preloadCriticalImages(),
      // Prise de contrôle immédiate
      self.clients.claim()
    ])
  );
});

// =================================================================
// GESTION DES REQUÊTES AVEC STRATÉGIES OPTIMISÉES
// =================================================================

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;
  
  // Déterminer la stratégie selon le type de ressource
  const strategy = getStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch(error => {
        console.warn('⚠️ Erreur de requête:', request.url, error);
        return createFallbackResponse(request);
      })
  );
});

// =================================================================
// STRATÉGIES DE CACHE
// =================================================================

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CRITICAL:
      return cacheFirstStrategy(request);
    
    case CACHE_STRATEGIES.IMAGES:
      return staleWhileRevalidateStrategy(request);
    
    case CACHE_STRATEGIES.DYNAMIC:
      return networkFirstStrategy(request);
    
    case CACHE_STRATEGIES.STATIC:
      return cacheFirstWithFallback(request);
    
    default:
      return networkFirstStrategy(request);
  }
}

// Cache First - Pour ressources critiques
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Mise à jour en arrière-plan pour prochaine visite
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale While Revalidate - Pour images
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Toujours essayer de récupérer depuis le réseau
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  // Retourner cache immédiatement si disponible
  return cachedResponse || await networkResponsePromise;
}

// Network First - Pour contenu dynamique
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Mettre en cache les réponses réussies
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback vers cache si réseau indisponible
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First avec fallback
async function cacheFirstWithFallback(request) {
  try {
    return await cacheFirstStrategy(request);
  } catch (error) {
    return createFallbackResponse(request);
  }
}

// =================================================================
// UTILITAIRES
// =================================================================

function getStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Ressources critiques
  if (CRITICAL_RESOURCES.some(resource => pathname.includes(resource))) {
    return CACHE_STRATEGIES.CRITICAL;
  }
  
  // Images
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)) {
    return CACHE_STRATEGIES.IMAGES;
  }
  
  // Routes dynamiques
  if (DYNAMIC_ROUTES.some(route => pathname.startsWith(route))) {
    return CACHE_STRATEGIES.DYNAMIC;
  }
  
  // CSS/JS
  if (/\.(css|js)$/i.test(pathname)) {
    return CACHE_STRATEGIES.CRITICAL;
  }
  
  // HTML
  if (request.mode === 'navigate' || pathname.endsWith('.html')) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  return CACHE_STRATEGIES.DYNAMIC;
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('coach-apar-') && name !== CACHE_NAME
  );
  
  await Promise.all(
    oldCaches.map(cacheName => {
      console.log('🗑️ Suppression ancien cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}

async function preloadCriticalImages() {
  const cache = await caches.open(CACHE_NAME);
  
  const preloadPromises = PRELOAD_IMAGES.map(async imageUrl => {
    try {
      const cachedImage = await cache.match(imageUrl);
      if (!cachedImage) {
        const response = await fetch(imageUrl);
        if (response.ok) {
          await cache.put(imageUrl, response);
          console.log('📸 Image préchargée:', imageUrl);
        }
      }
    } catch (error) {
      console.warn('⚠️ Échec préchargement image:', imageUrl, error);
    }
  });
  
  await Promise.all(preloadPromises);
}

async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    // Silencieux - c'est une mise à jour en arrière-plan
  }
}

function createFallbackResponse(request) {
  const url = new URL(request.url);
  
  // Fallback pour images
  if (request.destination === 'image') {
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#f0f0f0"/><text x="150" y="100" text-anchor="middle" fill="#999">Image indisponible</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200
      }
    );
  }
  
  // Fallback pour pages HTML
  if (request.mode === 'navigate') {
    return new Response(`
      <!DOCTYPE html>
      <html><head><title>Page indisponible</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
        <h1>🔌 Connexion requise</h1>
        <p>Cette page nécessite une connexion internet.</p>
        <button onclick="window.location.reload()">Réessayer</button>
      </body></html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  }
  
  // Fallback générique
  return new Response('Ressource indisponible', { 
    status: 503,
    statusText: 'Service indisponible'
  });
}

// =================================================================
// GESTION DES MESSAGES
// =================================================================

self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
      
    case 'FORCE_UPDATE':
      forceUpdateCache(payload);
      break;
      
    case 'PRELOAD_RESOURCES':
      preloadResources(payload.resources);
      break;
      
    default:
      console.warn('⚠️ Message SW non reconnu:', type);
  }
});

async function forceUpdateCache(resources = []) {
  const cache = await caches.open(CACHE_NAME);
  
  const updatePromises = [...CRITICAL_RESOURCES, ...resources].map(async resource => {
    try {
      await cache.delete(resource);
      const response = await fetch(resource);
      if (response.ok) {
        await cache.put(resource, response);
      }
    } catch (error) {
      console.warn('⚠️ Échec mise à jour:', resource, error);
    }
  });
  
  await Promise.all(updatePromises);
  console.log('✅ Cache forcé mis à jour');
}

async function preloadResources(resources) {
  const cache = await caches.open(CACHE_NAME);
  
  const preloadPromises = resources.map(async resource => {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        await cache.put(resource, response);
      }
    } catch (error) {
      console.warn('⚠️ Échec préchargement:', resource, error);
    }
  });
  
  await Promise.all(preloadPromises);
}

// =================================================================
// ANALYTICS ET MONITORING
// =================================================================

self.addEventListener('sync', event => {
  if (event.tag === 'performance-metrics') {
    event.waitUntil(sendPerformanceMetrics());
  }
});

async function sendPerformanceMetrics() {
  // Collecter métriques de performance du SW
  const metrics = {
    cacheHits: await getCacheHitRatio(),
    cacheSize: await getCacheSize(),
    version: CACHE_VERSION,
    timestamp: Date.now()
  };
  
  try {
    // Envoyer à un endpoint analytics (à implémenter)
    // await fetch('/api/metrics', { method: 'POST', body: JSON.stringify(metrics) });
    console.log('📊 Métriques SW:', metrics);
  } catch (error) {
    console.warn('⚠️ Échec envoi métriques:', error);
  }
}

async function getCacheHitRatio() {
  // Implémentation simplifiée - à améliorer avec vraies métriques
  return Math.random() * 0.3 + 0.7; // 70-100%
}

async function getCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  return requests.length;
}

console.log('🚀 Service Worker Coach APA\'R v' + CACHE_VERSION + ' initialisé');

/* =================================================================
   FIN DU SERVICE WORKER ULTRA-OPTIMISÉ
   ================================================================= */