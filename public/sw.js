/* eslint-disable no-undef */
// time to rewrite this once and for all using
// https://jakearchibald.com/2014/offline-cookbook/

// I have 4 types of requests
// 1. requests that should not be cached at all; always fetch
// 2. requests that should come from the cache, returned and updated in the background (node-music.json?update)
// 3. requests that should come from the network and cached in the background (node-music.json)
// 4. requests that should be cached and returned from the cache (everything else)

const CACHE_NAME = 'v3';

// step 0: clean-up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async function () {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => {
            if (cacheName === CACHE_NAME) {
              return false;
            }
            return true;
          })
          .map(cacheName => caches.delete(cacheName))
      );
    })()
  );
});

// step 1: define a list of files that should not be cached
const NON_CACHEABLE = [
  '/listen',
  '/rescan',
  '/version',
  '/public-key',
  '/stream',
  'file://',
  '//ws.audioscrobbler.com',
  '//localhost',
  '#no-sw-cache',
  'ts=',
  '/proxy',
];

// step 2: define a list of files that should come from cache and updated in the background
const CACHE_AND_UPDATE = [/\/node-music\.json$/];

// step 3: define a list of files that should come from network and update cache in the background
const UPDATE_AND_CACHE = [/\/node-music\.json\?update$/];

// step 1.1 handle these requests
self.addEventListener('fetch', async event => {
  try {
    if (
      event.request.destination === 'document' ||
      NON_CACHEABLE.some(url => event.request.url.includes(url)) ||
      event.request.method !== 'GET'
    ) {
      return;
    } else if (CACHE_AND_UPDATE.some(url => event.request.url.match(url))) {
      return await cacheAndNetwork(event);
    } else if (UPDATE_AND_CACHE.some(url => event.request.url.match(url))) {
      return await updateCache(event);
    } else {
      return await cacheFirst(event);
    }
  } catch (e) {
    console.log(`error while fetching using the service worker`, e);
  }
});

// get from cache but get from network and update cache if not found in cache
const cacheFirst = async function (event) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request);
  if (response) {
    return response;
  } else {
    const networkResponse = await fetch(event.request);
    cache.put(event.request, networkResponse.clone());
    return response || networkResponse;
  }
};

const cacheAndNetwork = async function (event) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request);
  const networkResponse = await fetch(event.request);
  cache.put(event.request, networkResponse.clone());
  // tell clients it's updated
  refresh(networkResponse);
  return response || networkResponse;
};

const updateCache = async function (event) {
  const cache = await caches.open(CACHE_NAME);
  const networkResponse = await fetch(event.request);
  cache.put(event.request, networkResponse.clone());
  // tell clients it's updated
  refresh(networkResponse);
  return networkResponse;
};

let db;

function getDB() {
  if (!db) {
    db = new Promise((resolve, reject) => {
      const openreq = indexedDB.open('keyval-store', 1);
      openreq.onerror = () => {
        reject(openreq.error);
      };
      openreq.onupgradeneeded = () => {
        // First time setup: create an empty object store
        openreq.result.createObjectStore('keyval');
      };
      openreq.onsuccess = () => {
        resolve(openreq.result);
      };
    });
  }
  return db;
}

async function withStore(type, callback) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('keyval', type);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    callback(transaction.objectStore('keyval'));
  });
}
function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      var message = {
        type: 'refresh',
        url: response.url,
      };
      var responseToCache = response.clone();
      // once updated let the client know it's updated
      responseToCache
        .json()
        .then(async musicdb => {
          withStore('readwrite', store => {
            store.put(musicdb, 'musicdb');
          });
          client.postMessage(message);
        })
        .catch(() => {
          console.log('error parsing response');
        });
    });
  });
}
