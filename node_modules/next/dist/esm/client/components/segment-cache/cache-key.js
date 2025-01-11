// TypeScript trick to simulate opaque types, like in Flow.
export function createCacheKey(originalHref, nextUrl) {
    const originalUrl = new URL(originalHref);
    // TODO: As of now, we never include search params in the cache key because
    // per-segment prefetch requests are always static, and cannot contain search
    // params. But to support <Link prefetch={true}>, we will sometimes populate
    // the cache with dynamic data, so this will have to change.
    originalUrl.search = '';
    const normalizedHref = originalUrl.href;
    const normalizedNextUrl = nextUrl;
    const cacheKey = {
        href: normalizedHref,
        nextUrl: normalizedNextUrl
    };
    return cacheKey;
}

//# sourceMappingURL=cache-key.js.map