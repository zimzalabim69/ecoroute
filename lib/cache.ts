interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory TTL cache.
 *
 * Entries are stored with an absolute expiration timestamp. Expired entries are
 * removed lazily on access and can be purged eagerly with `clear()` or by
 * deleting a specific key.
 */
export class TTLCache<T> {
  private entries = new Map<string, CacheEntry<T>>();

  constructor(private readonly defaultTtlMs: number) {}

  /**
   * Returns the cached value if it exists and has not expired; otherwise
   * returns `undefined` and removes the stale entry.
   */
  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Stores a value with the given key. Uses the provided TTL if given, otherwise
   * falls back to the cache's default TTL.
   */
  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /** Checks whether a non-expired entry exists for the key. */
  has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return false;
    }
    return true;
  }

  /** Removes a single entry. */
  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  /** Clears all cached entries. */
  clear(): void {
    this.entries.clear();
  }
}
