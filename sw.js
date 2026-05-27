const CACHE_NAME = "phoenix-host-v1";

const urlsToCache = [

"/",
"/index.html",
"/cache.html",
"/style.css",
"/bundle.js",

"/icon0.png",
"/bg.jpg",

"/psfree.js",
"/psfree_lapse.cache",
"/psfree_lapse_shared.js",
"/webkit.js",

"/702/index.html",
"/755/index.html",
"/900/index.html"

];

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE_NAME)

.then(cache => {

return cache.addAll(urlsToCache);

})

);

});

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)

.then(response => {

return response || fetch(event.request);

})

);

});
