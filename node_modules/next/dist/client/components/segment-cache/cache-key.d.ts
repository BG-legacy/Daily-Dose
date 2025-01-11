type Opaque<K, T> = T & {
    __brand: K;
};
export type NormalizedHref = Opaque<'NormalizedHref', string>;
export type NormalizedNextUrl = Opaque<'NormalizedNextUrl', string>;
export type RouteCacheKey = Opaque<'RouteCacheKey', {
    href: NormalizedHref;
    nextUrl: NormalizedNextUrl | null;
}>;
export declare function createCacheKey(originalHref: string, nextUrl: string | null): RouteCacheKey;
export {};
