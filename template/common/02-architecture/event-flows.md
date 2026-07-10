# Event-Driven Architecture Patterns

Event-driven architecture decouples components by communicating through events rather than direct calls. Use it when you need loose coupling, scalability, or when multiple consumers need to react to the same action.

---

## When to Use Events

### Good Fit
- Multiple consumers need to react to the same action
- Producer shouldn't know or care about consumers
- Processing can be asynchronous
- You need an audit trail of what happened
- Cross-service communication in distributed systems
- Workload smoothing (handle spikes gracefully)

### Bad Fit
- Caller needs an immediate response
- Strong consistency is required between producer and consumer
- Simple request-response within a single service
- Debugging simplicity is more important than decoupling

---

## Event Types

| Type | Purpose | Example |
|------|---------|---------|
| Domain Event | Something that happened in the domain | `OrderPlaced`, `UserRegistered` |
| Integration Event | Cross-service communication | `PaymentCompleted`, `InventoryReserved` |
| Command Event | Request for action | `SendWelcomeEmail`, `GenerateInvoice` |
| Notification Event | Inform without expecting action | `DailyReportReady`, `ThresholdExceeded` |

---

## Pub/Sub Pattern

Producers publish events without knowing who consumes them. Consumers subscribe to events they care about.

```
┌──────────┐       ┌───────────────┐       ┌──────────────┐
│ Producer  │──────▶│  Event Bus    │──────▶│  Consumer A  │
│           │       │  (Topic)      │──────▶│  Consumer B  │
└──────────┘       └───────────────┘──────▶│  Consumer C  │
                                            └──────────────┘
```

### Event Schema

```typescript
interface DomainEvent {
  id: string;              // Unique event ID (UUID)
  type: string;            // Event type (e.g., "order.placed")
  source: string;          // Producing service
  timestamp: string;       // ISO 8601
  version: string;         // Schema version (e.g., "1.0")
  correlationId: string;   // Trace across events
  causationId: string;     // Event that caused this one
  data: Record<string, unknown>; // Event payload
  metadata: {
    userId?: string;       // Who triggered this
    tenantId?: string;     // Multi-tenant context
  };
}
```

### Example Event

```json
{
  "id": "evt_abc123",
  "type": "order.placed",
  "source": "order-service",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0",
  "correlationId": "req_xyz789",
  "causationId": "cmd_place_order_456",
  "data": {
    "orderId": "ord_123",
    "userId": "usr_456",
    "total": 9999,
    "currency": "USD",
    "items": [
      {"productId": "prod_789", "quantity": 2, "unitPrice": 4999}
    ]
  },
  "metadata": {
    "userId": "usr_456",
    "tenantId": "tenant_001"
  }
}
```

---

## Event Sourcing

Instead of storing current state, store the sequence of events that led to current state. Rebuild state by replaying events.

### When to Use
- Complete audit trail is a business requirement
- Need to reconstruct "what happened" at any point in time
- Domain has complex state transitions
- Temporal queries are needed ("what was the state on Jan 1?")

### When NOT to Use
- Simple CRUD applications
- When current state is all that matters
- Team unfamiliar with the pattern (high learning curve)
- Simple reporting needs (event sourcing makes queries complex)

### Structure

```
Event Store (append-only):
┌──────────────────────────────────────────────────┐
│ Stream: order-123                                  │
│                                                    │
│ Seq 1: OrderCreated    {items, userId}            │
│ Seq 2: ItemAdded       {productId, qty}           │
│ Seq 3: PaymentReceived {amount, method}           │
│ Seq 4: OrderShipped    {trackingNumber}           │
└──────────────────────────────────────────────────┘

Current State = replay(events)
```

### Projections

Read models built from events for query optimization:

```
Events → Projection Builder → Read Model (optimized for queries)
```

- Projections are disposable (can be rebuilt from events)
- Multiple projections for different query patterns
- Eventually consistent with the event stream

---

## CQRS (Command Query Responsibility Segregation)

Separate the write model (commands) from the read model (queries). Often paired with event sourcing but can be used independently.

### Architecture

```
┌──────────────┐           ┌──────────────┐
│   Commands    │           │   Queries     │
│  (Write Side) │           │  (Read Side)  │
└──────┬───────┘           └──────┬───────┘
       │                          │
       ▼                          ▼
┌──────────────┐           ┌──────────────┐
│  Write Model  │──events──▶│  Read Model   │
│  (Normalized) │           │  (Denormalized)│
└──────────────┘           └──────────────┘
```

### When CQRS Adds Value
- Read and write patterns are fundamentally different
- Read-heavy workload needs different optimization than writes
- Different scaling requirements for reads vs writes
- Complex domain logic on writes, simple lookups on reads

### When CQRS is Overkill
- Simple CRUD with similar read/write patterns
- Low traffic that doesn't need separate scaling
- Small team that can't maintain the complexity

---

## Delivery Guarantees

| Guarantee | Meaning | Implementation |
|-----------|---------|---------------|
| At-most-once | Message may be lost, never duplicated | Fire and forget (no ack) |
| At-least-once | Message never lost, may be duplicated | Ack after processing, retry on failure |
| Exactly-once | Message delivered and processed once | At-least-once + idempotent consumer |

**Recommendation:** Design for at-least-once delivery with idempotent consumers. Exactly-once is a consumer-side concern, not a transport concern.

### Idempotent Consumer Pattern

```typescript
async function handleEvent(event: DomainEvent) {
  // Check if already processed
  const processed = await idempotencyStore.exists(event.id);
  if (processed) {
    return; // Already handled, skip
  }

  // Process the event
  await processBusinessLogic(event);

  // Mark as processed (atomically with business logic if possible)
  await idempotencyStore.record(event.id);
}
```

---

## Error Handling

### Dead Letter Queue (DLQ)

Events that fail after all retries go to a dead letter queue for investigation.

```
Event → Consumer → [Fail] → Retry (3x with backoff) → [Still failing] → DLQ
```

### DLQ Management
- Alert when messages enter DLQ
- Include full event context in DLQ message
- Manual replay capability for recovered events
- TTL on DLQ messages (don't keep forever)
- Dashboard showing DLQ depth and aging

### Retry Strategy

| Attempt | Delay | Notes |
|---------|-------|-------|
| 1 | Immediate | First retry |
| 2 | 30 seconds | Short backoff |
| 3 | 5 minutes | Medium backoff |
| 4 | 30 minutes | Long backoff |
| 5 | DLQ | Give up, alert |

---

## Event Versioning

Events are contracts. They evolve but must not break consumers.

### Versioning Strategy

- **Additive changes** (new optional fields): No version bump needed
- **Breaking changes** (field removed, type changed): New event version
- **Consumer compatibility**: Handle unknown fields gracefully (ignore, don't fail)

### Schema Registry

- All event schemas registered and versioned
- Producers validate against schema before publishing
- Consumers validate against schema on receipt
- Breaking changes require consumer migration plan

---

## Ordering Guarantees

| Requirement | Implementation |
|-------------|---------------|
| Global ordering | Single partition (limits throughput) |
| Per-entity ordering | Partition by entity ID |
| No ordering needed | Multiple partitions (maximum throughput) |

**Recommendation:** Order per entity (partition by aggregate ID). Global ordering doesn't scale.

---

## Monitoring Events

| Metric | Alert Condition |
|--------|----------------|
| Event publish rate | Drops below baseline |
| Consumer lag | > 1000 messages behind |
| DLQ depth | > 0 messages |
| Processing latency (p95) | > 30 seconds |
| Consumer error rate | > 1% |
