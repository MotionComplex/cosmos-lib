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
export function memoByTime<T>(
  fn: (date: Date) => T,
  bucketMs = 60_000,
  maxSize = 128,
): (date?: Date) => T {
  const cache = new Map<number, T>()

  return (date: Date = new Date()): T => {
    const key = Math.round(date.getTime() / bucketMs)

    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const result = fn(date)

    if (cache.size >= maxSize) {
      cache.delete(cache.keys().next().value!)
    }

    cache.set(key, result)
    return result
  }
}
