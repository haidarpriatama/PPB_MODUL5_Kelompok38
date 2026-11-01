// ---------------------------------------------------------------------------
// queryCache.js — Lightweight in-memory & session query cache with TTL & invalidation
// ---------------------------------------------------------------------------

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

class QueryCache {
  constructor() {
    this.cache = new Map()
    if (typeof window !== 'undefined') {
      window.__queryCache = this
    }
  }

  /**
   * Get cached data if present and not expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      console.log(`%c[QueryCache MISS] %cFetching fresh data: ${key}`, 'color: #3182ce; font-weight: bold;', 'color: inherit;')
      return null
    }

    const entry = this.cache.get(key)
    const isExpired = Date.now() - entry.timestamp > entry.ttl

    if (isExpired) {
      console.log(`%c[QueryCache EXPIRED] %cCache expired for: ${key}`, 'color: #e53e3e; font-weight: bold;', 'color: inherit;')
      this.cache.delete(key)
      return null
    }

    const ageSec = Math.round((Date.now() - entry.timestamp) / 1000)
    console.log(`%c[QueryCache HIT] %cServed from cache (${ageSec}s ago): ${key}`, 'color: #25D366; font-weight: bold;', 'color: inherit;')
    return entry.data
  }

  /**
   * Store data in cache
   */
  set(key, data, ttl = DEFAULT_TTL_MS) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
    console.log(`%c[QueryCache SET] %cCached data for ${ttl / 1000}s: ${key}`, 'color: #805ad5; font-weight: bold;', 'color: inherit;')
  }

  /**
   * Invalidate entries matching a prefix or regex pattern
   */
  invalidate(pattern) {
    let count = 0
    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string') {
        if (key.startsWith(pattern) || key.includes(pattern)) {
          this.cache.delete(key)
          count++
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(key)) {
          this.cache.delete(key)
          count++
        }
      }
    }
    console.log(`%c[QueryCache INVALIDATE] %cCleared ${count} entries matching: ${pattern}`, 'color: #dd6b20; font-weight: bold;', 'color: inherit;')
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
    console.log('%c[QueryCache CLEAR] %cAll query cache cleared', 'color: #e53e3e; font-weight: bold;', 'color: inherit;')
  }

  /**
   * Get current cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const queryCache = new QueryCache()
export default queryCache
