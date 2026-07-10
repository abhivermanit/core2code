# Caching Strategy

Cache only what you've measured needs caching. Premature caching creates stale data bugs that are harder to debug than latency.

---

## Caching Decision Checklist

Before adding a cache, answer:

1. Is the current latency actually a problem? (Measured, not assumed)
2. What's the read-to-write ratio? (Cache helps when reads >> writes)
3. Is stale data acceptable? For how long?
4. What's the invalidation strategy?
5. What happens on cache miss? (Cold start, thundering herd)
6. Does the added complexity justify the performance gain?

---

## Cache Layers

### Layer Overview

```
Client (Browser) → CDN → API Gateway → Application Cache → Database
    ↑ Cache L1      ↑ L2      ↑ L3           ↑ L4            ↑ L5 (query cache)
```

| Layer | What to Cache | TTL | Invalidation | Tool |
|-------|--------------|-----|--------------|------|
| Browser | Static assets, API responses | Varies | Cache-Control headers | HTTP cache |
| CDN | Static assets, public content | Hours-days | Purge API, versioned URLs | CloudFront, Cloudflare |
| API Gateway | Rate limit counters, auth tokens | Minutes | TTL-based | Redis, in-memory |
| Application (local) | Hot config, computed values | Seconds-minutes | TTL, bounded size | In-memory (LRU) |
| Application (distributed) | Session data, frequent queries | Minutes-hours | Event-driven or TTL | Redis |
| Database | Query plans, buffer pool | Automatic | DB manages | Built-in |

---

## Cache Patterns

### Cache-Aside (Lazy Loading)

Most common pattern. Application manages the cache explicitly.

```
Read:
1. Check cache
2. If hit → return cached value
3. If miss → query database → store in cache → return

Write:
1. Update database
2. Invalidate cache (delete key)
```

**Pros:** Simple, cache only what's accessed
**Cons:** First request always slow (cold miss), potential inconsistency window

### Write-Through

Write to cache and database together.

```
Write:
1. Write to cache
2. Write to database (synchronously)
3. Respond to caller

Read:
1. Read from cache (always populated)
```

**Pros:** Cache always consistent, no cold misses after first write
**Cons:** Write latency increases, cache may hold unused data

### Write-Behind (Write-Back)

Write to cache immediately, async write to database.

```
Write:
1. Write to cache
2. Respond to caller (fast!)
3. Async: flush to database

Read:
1. Read from cache
```

**Pros:** Very fast writes
**Cons:** Data loss risk if cache crashes before flush, complex

### Read-Through

Cache fetches from database on miss (cache is aware of data source).

```
Read:
1. Request from cache
2. Cache checks if it has the data
3. If miss → cache fetches from DB → stores → returns
```

**Pros:** Application code simpler
**Cons:** Cache implementation more complex

---

## Invalidation Strategies

| Strategy | When to Use | Complexity | Consistency |
|----------|-------------|-----------|-------------|
| TTL-based | Data where staleness is tolerable | Low | Eventual |
| Event-driven | Data that changes and must be fresh | Medium | Near-real-time |
| Write-through | Data that's always read after write | Medium | Strong |
| Version-based | Immutable data with new versions | Low | Strong |

### TTL Guidelines

| Data Type | Suggested TTL | Rationale |
|-----------|--------------|-----------|
| User session | 30 minutes | Security balance |
| API rate limit counters | 1 minute | Accuracy vs performance |
| Product catalog | 5 minutes | Changes infrequently |
| User profile | 1 minute | Changes rarely, freshness matters |
| Configuration | 5 minutes | Rarely changes |
| Search results | 30 seconds | Freshness important |
| Static content references | 1 hour | Very stable |
| Computed aggregations | 15 minutes | Expensive to recompute |

---

## Cache Key Design

### Naming Convention

```
{service}:{entity}:{identifier}:{variant}

Examples:
users:profile:usr_abc123           # User profile
orders:list:usr_abc123:page_1      # User's orders page 1
products:detail:prod_xyz:v2        # Product detail (version 2)
config:feature_flags:tenant_001    # Tenant feature flags
rate_limit:api:ip_10.0.0.1        # Rate limit counter
```

### Rules

- Include all dimensions that affect the cached value
- Include version/locale if responses vary
- Keep keys readable for debugging
- Namespace by service to avoid collisions
- Use consistent separators (colons)

---

## Common Problems and Solutions

### Thundering Herd (Cache Stampede)

Many requests hit a cold cache simultaneously, all query the database.

**Solutions:**
- Lock/mutex: First request fetches, others wait
- Probabilistic early expiration: Refresh before TTL expires
- Background refresh: Separate process keeps cache warm

### Cache Penetration

Requests for data that doesn't exist bypass cache and hit DB every time.

**Solutions:**
- Cache negative results (cache `null` with short TTL)
- Bloom filter to check existence before cache/DB lookup

### Hot Key

Single cache key receives disproportionate traffic.

**Solutions:**
- Local (in-process) cache for hottest keys
- Key replication across multiple slots
- Read replicas for cache layer

### Stale Data After Write

User updates data but reads stale cached version.

**Solutions:**
- Invalidate on write (delete key)
- Read-your-writes: bypass cache for the writing user briefly
- Write-through: update cache synchronously on write

---

## Tools and Infrastructure

### Redis Configuration

```
# Production Redis configuration considerations
maxmemory 2gb
maxmemory-policy allkeys-lru    # Evict least recently used when full
timeout 300                      # Close idle connections after 5 min
tcp-keepalive 60                # Detect dead connections
```

### Eviction Policies

| Policy | Use Case |
|--------|----------|
| `allkeys-lru` | General cache (evict least recently used) |
| `volatile-lru` | Mix of cached and persistent data |
| `allkeys-lfu` | Frequency matters more than recency |
| `noeviction` | Don't lose data (will error when full) |

---

## Monitoring

| Metric | Healthy Range | Alert |
|--------|--------------|-------|
| Hit rate | > 90% | < 80% |
| Miss rate | < 10% | > 20% |
| Memory usage | < 80% | > 90% |
| Eviction rate | Low and stable | Sudden spike |
| Latency (p99) | < 5ms | > 10ms |
| Connection pool usage | < 70% | > 90% |

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Cache everything | Stale data, memory waste | Cache only measured bottlenecks |
| No TTL | Data never refreshes | Always set a TTL (even long ones) |
| Large serialized objects | Slow reads, memory pressure | Cache only needed fields |
| Cache in business logic | Hard to test, tangled concerns | Cache at infrastructure boundary |
| Ignoring cache failures | App crashes if cache is down | Graceful fallback to source |
