# Distributed Tracing

Tracing shows you the journey of a request across services. When a request is slow, tracing tells you exactly where time was spent.

## What is a Trace?

```
Trace (one user request, end to end)
├── Span: API Gateway (5ms)
│   ├── Span: Auth middleware (2ms)
│   └── Span: Route handler (150ms)
│       ├── Span: Database query (45ms)
│       ├── Span: Cache lookup (1ms, cache miss)
│       ├── Span: External API call (95ms)  ← bottleneck
│       └── Span: Response serialization (2ms)
```

- **Trace:** The full lifecycle of a request across all services
- **Span:** A single unit of work within a trace (function call, DB query, HTTP call)
- **Context:** Metadata propagated between services (trace ID, span ID, baggage)

## OpenTelemetry

Use OpenTelemetry (OTel). It's the industry standard, vendor-neutral, and supported everywhere.

### Setup

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'checkout-api',
});

sdk.start();
```

### Auto-Instrumentation Covers

- HTTP requests (incoming and outgoing)
- Database queries (pg, mysql, mongodb, redis)
- Message queues (RabbitMQ, Kafka)
- gRPC calls
- Framework middleware (Express, Fastify, NestJS)

### Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('checkout-service');

async function processOrder(order: Order) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', order.id);
    span.setAttribute('order.total', order.total);
    span.setAttribute('order.items_count', order.items.length);

    try {
      const result = await chargePayment(order);
      span.setAttribute('payment.status', result.status);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## Span Attributes

### Standard Attributes (Semantic Conventions)

| Category | Attributes |
|----------|-----------|
| HTTP | `http.method`, `http.status_code`, `http.url`, `http.route` |
| Database | `db.system`, `db.statement`, `db.operation`, `db.name` |
| User | `enduser.id`, `enduser.role` |
| Error | `exception.type`, `exception.message`, `exception.stacktrace` |

### Custom Business Attributes

```typescript
span.setAttribute('order.id', 'ord_123');
span.setAttribute('order.total_cents', 4999);
span.setAttribute('tenant.id', 'acme-corp');
span.setAttribute('feature_flag.new_checkout', true);
```

**Rules for attributes:**
- Use namespaced keys (e.g., `order.id` not `id`)
- Keep values low cardinality where possible (for querying)
- Never include PII (emails, names) in span attributes
- Never include secrets or tokens

## Sampling

You don't need to trace 100% of requests. Sampling reduces cost while maintaining visibility.

### Sampling Strategies

| Strategy | When to Use |
|----------|-------------|
| Always On (100%) | Low-traffic services, development |
| Probabilistic (10%) | High-traffic services, steady-state |
| Rate-limited (100/sec) | Consistent sample regardless of traffic |
| Tail-based | Keep traces with errors or high latency |
| Parent-based | Follow the parent span's sampling decision |

### Recommended Configuration

```yaml
# Development/Staging
sampling:
  strategy: always_on   # 100%, trace everything

# Production
sampling:
  strategy: tail_based
  rules:
    - condition: error    # Always keep errors
      sample_rate: 1.0
    - condition: latency > 2s  # Always keep slow requests
      sample_rate: 1.0
    - condition: default
      sample_rate: 0.1   # 10% of normal traffic
```

### Tail-Based Sampling

Decision made after the trace completes. Keeps interesting traces (errors, slow, specific user).

**Pro:** Never miss an error or slow request
**Con:** Requires collector infrastructure, more complex

## Context Propagation

Trace context must propagate between services. Use W3C Trace Context standard.

```http
# HTTP headers (automatic with OTel)
traceparent: 00-abc123def456-span789-01
tracestate: vendor=value

# Message queue (add to message headers/attributes)
{
  "traceparent": "00-abc123def456-span789-01",
  "payload": { ... }
}
```

### Propagation Checklist

- [ ] HTTP calls propagate context (automatic with OTel HTTP instrumentation)
- [ ] Message queue producers attach context to messages
- [ ] Message queue consumers extract context from messages
- [ ] Background jobs inherit context from triggering request
- [ ] Cron jobs create new root traces

## Correlation: Traces + Logs + Metrics

Link all three signals:

```json
// In logs
{ "traceId": "abc123", "spanId": "span789", "message": "..." }

// In metrics (exemplars)
http_request_duration{status="500"} 1.5  # exemplar: traceId=abc123

// In traces
Span attributes include the same context
```

This lets you:
1. See a metric spike
2. Click through to an example trace
3. See corresponding logs inline with the trace

## Tools

| Tool | Best For |
|------|----------|
| Jaeger | Open source, self-hosted |
| Grafana Tempo | Cost-effective, pairs with Grafana |
| Datadog APM | Enterprise, full-featured |
| Honeycomb | High-cardinality queries, debugging |
| AWS X-Ray | AWS-native services |

## Anti-Patterns

- **No tracing in microservices** — you cannot debug distributed systems with logs alone
- **Tracing 100% in production** — cost explodes, storage fills, queries slow
- **Missing context propagation** — broken traces are worse than no traces
- **Only auto-instrumentation** — custom spans add business context that matters
- **Giant spans** — a span wrapping an entire request handler tells you nothing. Break it down.
- **Sensitive data in attributes** — trace data is broadly accessible, treat it like logs
