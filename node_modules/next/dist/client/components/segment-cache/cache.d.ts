import type { TreePrefetch } from '../../../server/app-render/collect-segment-data';
import type { LoadingModuleData } from '../../../shared/lib/app-router-context.shared-runtime';
import { type PrefetchTask } from './scheduler';
import type { NormalizedHref, NormalizedNextUrl, RouteCacheKey } from './cache-key';
import { type Prefix } from './tuple-map';
type RouteCacheEntryShared = {
    staleAt: number;
    couldBeIntercepted: boolean;
    keypath: null | Prefix<RouteCacheKeypath>;
    next: null | RouteCacheEntry;
    prev: null | RouteCacheEntry;
    size: number;
};
export declare const enum EntryStatus {
    Pending = 0,
    Rejected = 1,
    Fulfilled = 2
}
type PendingRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Pending;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    tree: null;
    head: null;
    isHeadPartial: true;
};
type RejectedRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Rejected;
    blockedTasks: Set<PrefetchTask> | null;
    canonicalUrl: null;
    tree: null;
    head: null;
    isHeadPartial: true;
};
export type FulfilledRouteCacheEntry = RouteCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    blockedTasks: null;
    canonicalUrl: string;
    tree: TreePrefetch;
    head: React.ReactNode | null;
    isHeadPartial: boolean;
};
export type RouteCacheEntry = PendingRouteCacheEntry | FulfilledRouteCacheEntry | RejectedRouteCacheEntry;
type SegmentCacheEntryShared = {
    staleAt: number;
    key: null | string;
    next: null | RouteCacheEntry;
    prev: null | RouteCacheEntry;
    size: number;
};
type PendingSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Pending;
    rsc: null;
    loading: null;
    isPartial: true;
    promise: null | PromiseWithResolvers<FulfilledSegmentCacheEntry | null>;
};
type RejectedSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Rejected;
    rsc: null;
    loading: null;
    isPartial: true;
    promise: null;
};
type FulfilledSegmentCacheEntry = SegmentCacheEntryShared & {
    status: EntryStatus.Fulfilled;
    rsc: React.ReactNode | null;
    loading: LoadingModuleData | Promise<LoadingModuleData>;
    isPartial: boolean;
    promise: null;
};
export type SegmentCacheEntry = PendingSegmentCacheEntry | RejectedSegmentCacheEntry | FulfilledSegmentCacheEntry;
type RouteCacheKeypath = [NormalizedHref, NormalizedNextUrl];
export declare function readExactRouteCacheEntry(now: number, href: NormalizedHref, nextUrl: NormalizedNextUrl | null): RouteCacheEntry | null;
export declare function readRouteCacheEntry(now: number, key: RouteCacheKey): RouteCacheEntry | null;
export declare function readSegmentCacheEntry(now: number, path: string): SegmentCacheEntry | null;
export declare function waitForSegmentCacheEntry(pendingEntry: PendingSegmentCacheEntry): Promise<FulfilledSegmentCacheEntry | null>;
/**
 * Reads the route cache for a matching entry *and* spawns a request if there's
 * no match. Because this may issue a network request, it should only be called
 * from within the context of a prefetch task.
 */
export declare function requestRouteCacheEntryFromCache(now: number, task: PrefetchTask): RouteCacheEntry;
/**
 * Reads the route cache for a matching entry *and* spawns a request if there's
 * no match. Because this may issue a network request, it should only be called
 * from within the context of a prefetch task.
 */
export declare function requestSegmentEntryFromCache(now: number, task: PrefetchTask, route: FulfilledRouteCacheEntry, path: string, accessToken: string): SegmentCacheEntry;
export {};
