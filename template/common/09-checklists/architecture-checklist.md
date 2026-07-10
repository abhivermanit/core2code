# Architecture Review Checklist

Review before implementation begins. Architecture mistakes are expensive to fix after code is written.

## System Design

- [ ] Problem statement is clear (what are we solving, for whom)
- [ ] Non-functional requirements defined (scale, latency, availability)
- [ ] Data model supports all known use cases
- [ ] API contracts defined between services/components
- [ ] Authentication and authorization approach chosen
- [ ] Multi-tenancy strategy defined (if applicable)
- [ ] Caching strategy identified (what, where, invalidation)
- [ ] Search requirements addressed (full-text, filters, performance)

## Data Architecture

- [ ] Database choice justified (relational vs. document vs. key-value)
- [ ] Schema supports required queries without N+1
- [ ] Indexes planned for known access patterns
- [ ] Data growth estimated (1 year, 3 year projections)
- [ ] Backup and recovery strategy defined
- [ ] Data retention policy established
- [ ] PII identified and protection plan in place
- [ ] Migration strategy for schema changes

## Scalability

- [ ] Bottlenecks identified (what breaks first under load)
- [ ] Horizontal scaling path exists (stateless services)
- [ ] Database scaling strategy (read replicas, sharding, or managed scaling)
- [ ] Async processing for non-critical-path operations
- [ ] Rate limiting to protect against abuse
- [ ] Queue/pub-sub for decoupling heavy operations
- [ ] CDN for static assets and cacheable responses

## Reliability

- [ ] Single points of failure eliminated (or accepted with justification)
- [ ] Graceful degradation defined (what happens when dependency fails)
- [ ] Circuit breakers for external dependencies
- [ ] Retry policies with exponential backoff
- [ ] Health check endpoints defined
- [ ] SLO targets set for critical paths
- [ ] Disaster recovery approach documented

## Security

- [ ] Authentication mechanism chosen and justified
- [ ] Authorization model defined (RBAC, ABAC, RLS)
- [ ] Data at rest encryption planned
- [ ] Data in transit encryption (TLS everywhere)
- [ ] Secret management strategy
- [ ] Input validation at system boundaries
- [ ] OWASP Top 10 addressed
- [ ] Compliance requirements identified (SOC2, GDPR, HIPAA)

## Observability

- [ ] Logging strategy defined (structured, levels, retention)
- [ ] Metrics identified (RED method for services, USE for resources)
- [ ] Distributed tracing planned (if multi-service)
- [ ] Alerting strategy (what alerts, who responds)
- [ ] Dashboards defined for operational visibility
- [ ] Error tracking and aggregation

## Deployment

- [ ] CI/CD pipeline defined
- [ ] Deployment strategy chosen (blue/green, canary, rolling)
- [ ] Rollback procedure documented
- [ ] Feature flag strategy for progressive rollout
- [ ] Environment parity (staging mirrors production)
- [ ] Database migration strategy (zero-downtime)
- [ ] Infrastructure as code (reproducible environments)

## Cost

- [ ] Infrastructure cost estimated (monthly, at projected scale)
- [ ] Cost scaling is sub-linear with user growth
- [ ] No unbounded resource consumption (rate limits, quotas)
- [ ] Expensive operations identified and optimized or deferred
- [ ] Third-party service costs estimated
- [ ] Cost monitoring and alerting planned

## Trade-offs Documented

- [ ] Key decisions documented with rationale (ADRs)
- [ ] Alternatives considered and rejected with reasoning
- [ ] Known limitations acknowledged
- [ ] Technical debt accepted intentionally (not accidentally)
- [ ] Upgrade path exists for known future requirements
