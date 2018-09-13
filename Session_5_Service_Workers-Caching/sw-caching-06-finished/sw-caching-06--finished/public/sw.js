
var CACHE_STATIC_NAME = 'static-v4';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

//1. We execute some code at the 'install' lifecycle of the service worker
//2. The event will wait for the containin code to be finished
//3. Will open the cache, if there is no cache, it will create one
//4. Once it created it, it will return the cache object
//5.We execute the cache.addAll, method which will store all of the static files
//6. it is important to add '/' to the files so it will store everything which is in the public file

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  )
});

//1. Active lifecycle hook of the service worker
//2. Will get the caches.keylist, which will be an array of the cache names
//3. We wrap the looping to a promise.all, to wait for every loop to be finished
//4. Looping through the keylist and delete the cache if it is not equal to the current verions of the caches
//

self.addEventListener('activate', function(event) {                         //1.
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(  
    caches.keys()                                                           //2.
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {                      //3.    
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

//1. intercepting "fetch" event
//2. event will provide the returned data in it to the service worker
//3. Wil try to match the url stored in the cache
//4. If there is a response it will return the response data
//5. Will try to fetch data from the recieved url (event.request)
//6. If the request finished the response data will be provided
//7. Will open the cache
//8. Will put the request url and a copy of the response res.clone() to the cache
//9. Any error is catched
self.addEventListener('fetch', function(event) {                //1.
  event.respondWith(                                            //2.
    caches.match(event.request)                                 //3.
      .then(function(response) {                                //4.
        if (response) {                     
          return response;
        } else {
          return fetch(event.request)                           //5.
            .then(function(res) {                               //6.
              return caches.open(CACHE_DYNAMIC_NAME)            //7.  
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {                              //8.

            });
        }
      })
  );
});