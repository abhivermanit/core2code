# Decision Framework

A structured approach to common technology decisions. For each decision type, use the criteria to evaluate options rather than defaulting to familiarity or trend.

---

## How to Use This Framework

1. Identify the decision type
2. List your project's constraints
3. Score each option against the criteria
4. Document the decision and rationale in an ADR
5. Revisit only when constraints materially change

---

## Buy vs Build

**Default: Buy** (unless you have a strong reason to build)

### Choose Buy When:
- The problem is well-understood and commoditized
- Your competitive advantage is not in this area
- Time-to-market matters more than customization
- Maintenance burden would distract from core work
- Vendor has better security/compliance posture than you can maintain

### Choose Build When:
- The solution is core to your product differentiation
- No vendor adequately solves your specific problem
- Vendor lock-in risk outweighs development cost
- Integration complexity with existing systems is extreme
- You need control over the data pipeline end-to-end

### Red Flags:
- "We can build it in a weekend" (you can't)
- "No vendor does exactly what we need" (do you really need exactly that?)
- Building undifferentiated infrastructure (auth, email, payments)

---

## SQL vs NoSQL

**Default: SQL** (PostgreSQL specifically, unless you have a reason not to)

### Choose SQL (Relational) When:
- Data has clear relationships and referential integrity matters
- You need ACID transactions
- Query patterns are varied or not fully known yet
- Data model is structured and unlikely to change radically
- You need strong consistency
- Team is experienced with SQL

### Choose NoSQL (Document/Key-Value) When:
- Data is genuinely unstructured or semi-structured
- Write throughput is extreme (>100k writes/second)
- Data access is always by primary key
- Schema varies significantly between records
- Horizontal scaling is a day-one requirement
- Eventual consistency is acceptable

### Choose NoSQL (Wide Column / Time Series) When:
- Time-series data (metrics, logs, IoT sensor data)
- Write-heavy append-only workloads
- Data naturally expires or is partitioned by time

### Red Flags:
- Choosing NoSQL because "it scales better" (PostgreSQL scales further than most teams think)
- Choosing NoSQL because "schema-less is easier" (you still have a schema; it's just implicit and unvalidated)
- Choosing SQL for truly unstructured data or extreme write volumes

---

## Monolith vs Microservices

**Default: Monolith** (modular monolith specifically)

### Choose Monolith When:
- Team is fewer than 20 engineers
- Domain boundaries are not yet clear
- You're in early product stages (finding product-market fit)
- Deployment simplicity matters
- You don't have the infrastructure team to support distributed systems
- Cross-cutting changes are frequent

### Choose Microservices When:
- Teams need to deploy independently (organizational boundary)
- Different components have fundamentally different scaling requirements
- Different components need different technology stacks
- Domain boundaries are well-understood and stable
- You have the infrastructure maturity (CI/CD, observability, service mesh)
- Failure isolation is critical between components

### The Middle Ground: Modular Monolith
- Single deployment unit with clear internal module boundaries
- Enforced boundaries via interfaces/packages (not just conventions)
- Can extract modules to services later with minimal refactoring
- Gets you 80% of the organizational benefits at 20% of the operational cost

### Red Flags:
- Microservices with a team of 5 (you'll spend more time on infrastructure than product)
- "We might need to scale later" (modular monolith lets you extract later)
- Distributed monolith (microservices that must be deployed together)

---

## REST vs GraphQL

**Default: REST** (for most backend services)

### Choose REST When:
- API is resource-oriented (CRUD operations on entities)
- Clients are well-known and controlled by your team
- Caching at the HTTP level is valuable
- API will be consumed by third parties
- Team is familiar with REST conventions
- Operations map cleanly to HTTP verbs

### Choose GraphQL When:
- Multiple clients need different views of the same data (mobile, web, internal tools)
- Over-fetching/under-fetching is a measured problem (not hypothetical)
- Frontend teams need autonomy to evolve queries without backend changes
- Data is highly interconnected (graph-like)
- You have the tooling maturity (schema registry, query complexity analysis, monitoring)

### Choose gRPC When:
- Service-to-service communication (not client-facing)
- Performance is critical (binary protocol, streaming)
- Strong typing and code generation add value
- Bidirectional streaming is needed

### Red Flags:
- GraphQL for a single client with a single backend (unnecessary complexity)
- REST for data with 5+ levels of nested relationships
- GraphQL without query complexity limits (easy to DDoS yourself)

---

## Queue vs Synchronous

**Default: Synchronous** (unless you have a reason to decouple)

### Choose Synchronous When:
- Caller needs the result immediately
- Operation is fast (under 500ms)
- Failure should be visible to the caller immediately
- Transaction boundaries require both operations to succeed or fail together
- System is simple enough that sync calls don't create cascading failure risk

### Choose Queue (Async) When:
- Operation is slow (sending email, generating reports, processing images)
- Caller doesn't need to wait for the result
- Workload is spiky and needs to be smoothed
- Downstream system may be temporarily unavailable
- Multiple consumers need to react to the same event
- Retry semantics matter (at-least-once delivery)
- You need to decouple producer from consumer deployment

### Queue Selection:
- **Simple job queue** (Redis/BullMQ): Background jobs, delayed tasks, rate limiting
- **Message broker** (RabbitMQ): Complex routing, multiple consumers, work queues
- **Event streaming** (Kafka): Event sourcing, high throughput, replay capability, ordered processing
- **Cloud native** (SQS/SNS, Pub/Sub): Serverless, minimal ops, pay-per-use

### Red Flags:
- Queuing something and then polling for the result synchronously (just call it synchronously)
- Synchronous calls in a chain of 5+ services (one slow service kills everything)
- Queue without dead letter handling (messages will be lost)

---

## Cache or Not

**Default: Don't cache** (until you have evidence you need to)

### Choose to Cache When:
- Read-to-write ratio is high (>10:1)
- Data changes infrequently relative to access frequency
- Latency reduction is a measured need
- Upstream source is expensive to query (cost, time, or rate limits)
- Stale data is acceptable for a defined period

### Don't Cache When:
- Data must always be fresh (financial transactions, real-time inventory)
- Write frequency is close to read frequency
- Cache invalidation complexity exceeds the performance gain
- You haven't measured that the uncached version is actually too slow
- Dataset fits in memory on the application server already

### Caching Layers:
| Layer | Use Case | TTL Strategy |
|-------|----------|--------------|
| Browser/CDN | Static assets, public pages | Long TTL + cache busting |
| Application (in-memory) | Hot configuration, session data | Short TTL, bounded size |
| Distributed (Redis) | Shared across instances, API responses | Event-driven invalidation |
| Database (query cache) | Expensive aggregations | TTL or write-through |

### Invalidation Strategy (choose one):
1. **TTL-based**: Simple, eventual consistency. Best for data where staleness is tolerable.
2. **Event-driven**: Invalidate on write. More complex but more consistent.
3. **Write-through**: Update cache on every write. Consistent but adds write latency.

### Red Flags:
- Caching without measuring first (premature optimization)
- No invalidation strategy (stale data bugs are the worst kind)
- Caching mutable user-specific data without proper isolation
- Cache stampede potential without protection (thundering herd)

---

## Decision Documentation Template

For any significant technology decision, create an ADR:

```markdown
# ADR-XXXX: [Decision Title]

## Status
Proposed | Accepted | Superseded by ADR-YYYY

## Context
What forces are at play? What problem are we solving?

## Decision
What is the change we're making?

## Criteria Evaluated
| Criterion | Option A | Option B |
|-----------|----------|----------|
| ...       | ...      | ...      |

## Consequences
- What becomes easier?
- What becomes harder?
- What new risks are introduced?

## Review Date
When should we revisit this decision?
```
