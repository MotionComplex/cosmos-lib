/**
 * Time-bucketed memoization for astronomical position functions.
 *
 * Rounds Date inputs to the nearest `bucketMs` milliseconds to create
 * cache keys. Uses LRU eviction via Map insertion order.
 *
 * @param fn - Pure function accepting a Date as its first argument.
 * @param bucketMs - Time bucket size in milliseconds (default: 60 000 = 1 minute).
 * @param maxSize - Maximum cache entries before LRU eviction (default: 128).
 */
export declare function memoByTime<T>(fn: (date: Date) => T, bucketMs?: number, maxSize?: number): (date?: Date) => T;
