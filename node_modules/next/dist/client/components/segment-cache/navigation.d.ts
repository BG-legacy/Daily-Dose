import type { FlightRouterState } from '../../../server/app-render/types';
import type { CacheNode } from '../../../shared/lib/app-router-context.shared-runtime';
export declare const enum NavigationResultTag {
    MPA = 0,
    Success = 1,
    NoOp = 2,
    Async = 3
}
type MPANavigationResult = {
    tag: NavigationResultTag.MPA;
    data: string;
};
type NoOpNavigationResult = {
    tag: NavigationResultTag.NoOp;
    data: null;
};
type SuccessfulNavigationResult = {
    tag: NavigationResultTag.Success;
    data: {
        flightRouterState: FlightRouterState;
        cacheNode: CacheNode;
        canonicalUrl: string;
    };
};
type AsyncNavigationResult = {
    tag: NavigationResultTag.Async;
    data: Promise<MPANavigationResult | NoOpNavigationResult | SuccessfulNavigationResult>;
};
export type NavigationResult = MPANavigationResult | SuccessfulNavigationResult | NoOpNavigationResult | AsyncNavigationResult;
/**
 * Navigate to a new URL, using the Segment Cache to construct a response.
 *
 * To allow for synchronous navigations whenever possible, this is not an async
 * function. It returns a promise only if there's no matching prefetch in
 * the cache. Otherwise it returns an immediate result and uses Suspense/RSC to
 * stream in any missing data.
 */
export declare function navigate(url: URL, currentCacheNode: CacheNode, currentFlightRouterState: FlightRouterState, nextUrl: string | null): AsyncNavigationResult | SuccessfulNavigationResult | NoOpNavigationResult;
export {};
