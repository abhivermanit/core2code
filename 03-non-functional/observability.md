# Observability

## Three Pillars

### Logging

- Structured JSON logs
- Correlation IDs across services
- Log levels: ERROR, WARN, INFO, DEBUG
- PII masking in logs
- Centralized log aggregation

### Metrics

- RED metrics (Rate, Errors, Duration) for services
- USE metrics (Utilization, Saturation, Errors) for resources
- Custom business metrics
- Dashboards per service

### Tracing

- Distributed tracing (OpenTelemetry)
- Trace context propagation
- Span attributes for debugging
- Sampling strategy

## Alerting

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Error rate spike | > 5% errors in 5min | Critical | Page on-call |
| Latency increase | P95 > 2x baseline | Warning | Investigate |
| Disk usage | > 80% | Warning | Scale or clean |

## Dashboards

- Service health overview
- Error rate and latency
- Infrastructure utilization
- Business KPIs
