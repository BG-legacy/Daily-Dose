/*
  This is the default "use cache" handler it defaults
  to an in memory store
*/ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _lrucache = require("../lru-cache");
const _tagsmanifestexternal = require("../incremental-cache/tags-manifest.external");
// LRU cache default to max 50 MB but in future track
const memoryCache = new _lrucache.LRUCache(50000000);
const pendingSets = new Map();
const DefaultCacheHandler = {
    async get (cacheKey, softTags) {
        await pendingSets.get(cacheKey);
        const privateEntry = memoryCache.get(cacheKey);
        if (!privateEntry) {
            return undefined;
        }
        const entry = privateEntry.entry;
        if (performance.timeOrigin + performance.now() > entry.timestamp + entry.revalidate * 1000) {
            // In memory caches should expire after revalidate time because it is unlikely that
            // a new entry will be able to be used before it is dropped from the cache.
            return undefined;
        }
        if ((0, _tagsmanifestexternal.isTagStale)(entry.tags, entry.timestamp) || (0, _tagsmanifestexternal.isTagStale)(softTags, entry.timestamp)) {
            return undefined;
        }
        const [returnStream, newSaved] = entry.value.tee();
        entry.value = newSaved;
        return {
            ...entry,
            value: returnStream
        };
    },
    async set (cacheKey, pendingEntry) {
        let resolvePending = ()=>{};
        const pendingPromise = new Promise((resolve)=>{
            resolvePending = resolve;
        });
        pendingSets.set(cacheKey, pendingPromise);
        const entry = await pendingEntry;
        let size = 0;
        try {
            const [value, clonedValue] = entry.value.tee();
            entry.value = value;
            const reader = clonedValue.getReader();
            for(let chunk; !(chunk = await reader.read()).done;){
                size += Buffer.from(chunk.value).byteLength;
            }
            memoryCache.set(cacheKey, {
                entry,
                isErrored: false,
                errorRetryCount: 0,
                size
            });
        } catch (err) {
            console.error(`Error while saving cache key: ${cacheKey}`, err);
        // TODO: store partial buffer with error after we retry 3 times
        } finally{
            resolvePending();
            pendingSets.delete(cacheKey);
        }
    },
    async unstable_expireTags (...tags) {
        for (const tag of tags){
            if (!_tagsmanifestexternal.tagsManifest.items[tag]) {
                _tagsmanifestexternal.tagsManifest.items[tag] = {};
            }
            // TODO: use performance.now and update file-system-cache?
            _tagsmanifestexternal.tagsManifest.items[tag].revalidatedAt = Date.now();
        }
    },
    async receiveExpiredTags (...tags) {
        return this.unstable_expireTags(...tags);
    }
};
const _default = DefaultCacheHandler;

//# sourceMappingURL=default.js.map