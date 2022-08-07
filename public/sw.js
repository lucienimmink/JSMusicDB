/* eslint-disable no-undef */
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

const CACHE_NAME = 'v1';

self.addEventListener('fetch', function (event) {
  // SKIP cachecheck if it's the streaming path
  try {
    if (
      event.request.url.indexOf('/listen') !== -1 ||
      event.request.url.indexOf('/rescan') !== -1 ||
      event.request.url.indexOf('/version') !== -1 ||
      event.request.url.indexOf('/public-key') !== -1 ||
      event.request.url.indexOf('file://') !== -1
    ) {
      // nothing to see here, carry on
    } else if (event.request.url.indexOf('music.json') !== -1) {
      // send back from the cache but always update the cache with the networks version.
      event.respondWith(fromCache(event.request));
      event.waitUntil(update(event.request).then(refresh));
    } else {
      event.respondWith(
        caches.match(event.request).then(function (response) {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // IMPORTANT: Clone the request. A request is a stream and
          // can only be consumed once. Since we are consuming this
          // once by cache and once by the browser for fetch, we need
          // to clone the response.
          var fetchRequest = event.request.clone();
          if (
            fetchRequest.cache === 'only-if-cached' &&
            fetchRequest.mode !== 'same-origin'
          ) {
            return;
          }
          return fetch(fetchRequest).then(function (response) {
            // Check if we received a valid response
            if (!response) {
              return response;
            }
            if (
              fetchRequest.url.indexOf('/data/') === -1 &&
              fetchRequest.url.indexOf('lastfm-img2') === -1
            ) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
      );
    }
  } catch (e) {
    console.log(e);
  }
});

function fromCache(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

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
