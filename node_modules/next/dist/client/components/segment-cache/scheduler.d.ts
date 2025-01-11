import type { RouteCacheKey } from './cache-key';
export type PrefetchTask = {
    key: RouteCacheKey;
    /**
     * sortId is an incrementing counter
     *
     * Newer prefetches are prioritized over older ones, so that as new links
     * enter the viewport, they are not starved by older links that are no
     * longer relevant. In the future, we can add additional prioritization
     * heuristics, like removing prefetches once a link leaves the viewport.
     *
     * The sortId is assigned when the prefetch is initiated, and reassigned if
     * the same URL is prefetched again (effectively bumping it to the top of
     * the queue).
     *
     * TODO: We can add additional fields here to indicate what kind of prefetch
     * it is. For example, was it initiated by a link? Or was it an imperative
     * call? If it was initiated by a link, we can remove it from the queue when
     * the link leaves the viewport, but if it was an imperative call, then we
     * should keep it in the queue until it's fulfilled.
     *
     * We can also add priority levels. For example, hovering over a link could
     * increase the priority of its prefetch.
     */
    sortId: number;
    /**
     * True if the prefetch is blocked by network data. We remove tasks from the
     * queue once they are blocked, and add them back when they receive data.
     *
     * isBlocked also indicates whether the task is currently in the queue; tasks
     * are removed from the queue when they are blocked. Use this to avoid
     * queueing the same task multiple times.
     */
    isBlocked: boolean;
    /**
     * The index of the task in the heap's backing array. Used to efficiently
     * change the priority of a task by re-sifting it, which requires knowing
     * where it is in the array. This is only used internally by the heap
     * algorithm. The naive alternative is indexOf every time a task is queued,
     * which has O(n) complexity.
     */
    _heapIndex: number;
};
/**
 * Initiates a prefetch task for the given URL. If a prefetch for the same URL
 * is already in progress, this will bump it to the top of the queue.
 *
 * This is not a user-facing function. By the time this is called, the href is
 * expected to be validated and normalized.
 *
 * @param key The RouteCacheKey to prefetch.
 */
export declare function schedulePrefetchTask(key: RouteCacheKey): void;
/**
 * Notifies the scheduler of an in-progress prefetch request. This is used to
 * control network bandwidth by limiting the number of concurrent requests.
 *
 * @param promise A promise that resolves when the request has finished.
 */
export declare function trackPrefetchRequestBandwidth(promiseForServerData: Promise<unknown>): void;
export declare function spawnPrefetchSubtask(promise: Promise<any>): void;
/**
 * Notify the scheduler that we've received new data for an in-progress
 * prefetch. The corresponding task will be added back to the queue (unless the
 * task has been canceled in the meantime).
 */
export declare function pingPrefetchTask(task: PrefetchTask): void;
