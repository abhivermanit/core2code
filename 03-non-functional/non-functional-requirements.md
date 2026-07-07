# Non-Functional Requirements

## Categories

| Category | Requirement | Target | Priority |
|----------|-------------|--------|----------|
| Performance | Response time (P95) | < 200ms | P0 |
| Performance | Throughput | > 1000 req/s | P1 |
| Availability | Uptime | 99.9% | P0 |
| Scalability | Concurrent users | 10,000 | P1 |
| Security | Authentication | MFA supported | P0 |
| Security | Data encryption | AES-256 at rest, TLS 1.3 in transit | P0 |
| Compliance | Data residency | Region-specific | P1 |
| Observability | Log retention | 30 days | P1 |
| Recovery | RTO | < 1 hour | P0 |
| Recovery | RPO | < 5 minutes | P0 |
