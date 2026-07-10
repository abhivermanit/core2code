# Non-Functional Requirements

Non-functional requirements define how the system behaves, not what it does. They are not optional add-ons — they are constraints that determine whether the system is fit for production.

---

## 1. Security

### Authentication
- All endpoints serving user data require authentication
- Passwords hashed with bcrypt (cost factor ≥ 12) or argon2id
- Session tokens are cryptographically random, minimum 256 bits
- Token rotation on privilege escalation
- Account lockout after 5 failed attempts (progressive delay, not permanent lock)

### Authorization
- Principle of least privilege by default
- Role-based access control with explicit permission grants
- Resource-level authorization checked on every request (not just route-level)
- Admin actions require re-authentication

### Data Protection
- PII encrypted at rest (AES-256) and in transit (TLS 1.2+)
- Sensitive data never logged (passwords, tokens, credit cards, SSNs)
- Input validation on all external boundaries (whitelist, not blacklist)
- Output encoding to prevent XSS
- Parameterized queries for all database access (no string concatenation)

### API Security
- Rate limiting on all public endpoints
- CORS configured to allow only known origins
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- API keys treated as secrets (never in URLs, always in headers)

---

## 2. Architecture

### Principles
- Separation of concerns: domain logic independent of infrastructure
- Dependency inversion: high-level modules don't depend on low-level modules
- Single responsibility: each module/service has one reason to change
- Interface segregation: clients don't depend on methods they don't use

### Boundaries
- Clear module boundaries with defined public interfaces
- No circular dependencies between modules
- Infrastructure concerns (DB, HTTP, messaging) at the edges, not in domain logic
- Configuration externalized, not embedded in code

### Extensibility
- Plugin points for anticipated change
- Feature flags for gradual rollout and kill switches
- Backward-compatible changes by default (additive, not breaking)

---

## 3. Performance

### Response Times
| Operation Type | Target (p50) | Target (p95) | Target (p99) |
|---------------|--------------|--------------|--------------|
| API read | < 100ms | < 250ms | < 500ms |
| API write | < 200ms | < 500ms | < 1000ms |
| Page load (initial) | < 1.5s | < 3s | < 5s |
| Search | < 200ms | < 500ms | < 1000ms |
| File upload | < 2s/MB | < 5s/MB | < 10s/MB |

### Throughput
- System handles baseline traffic with < 50% resource utilization
- Designed to handle 3x current peak without architectural changes
- Graceful degradation under 5x peak (shed load, don't crash)

### Resource Budgets
- API memory: < 512MB per instance under normal load
- Frontend bundle: < 200KB gzipped (initial load)
- Database queries: < 50ms average, no query > 5s without async processing

---

## 4. Reliability

### Availability
- Target: 99.9% uptime (allows ~8.7 hours downtime/year)
- Planned maintenance windows: off-peak, with advance notice
- No single point of failure for critical paths

### Fault Tolerance
- Retry with exponential backoff for transient failures
- Circuit breakers for external dependencies
- Graceful degradation: core features remain available when non-critical services fail
- Bulkhead pattern: failure in one component doesn't cascade

### Data Integrity
- All mutations within database transactions
- Idempotent operations for all retry-safe actions
- Eventual consistency windows documented and bounded (< 5 seconds for user-visible data)
- No data loss under any failure scenario (crash, network partition, disk failure)

---

## 5. Scalability

### Horizontal Scaling
- Stateless application servers (session state externalized)
- Database read replicas for read-heavy workloads
- Connection pooling with bounded limits
- No server affinity required (any request, any instance)

### Capacity Planning
- Auto-scaling based on CPU/memory/queue depth
- Scale-up threshold: 70% utilization sustained for 5 minutes
- Scale-down threshold: 30% utilization sustained for 15 minutes
- Maximum scale factor defined and tested

### Data Growth
- Data archival strategy for records older than [retention period]
- Partition strategy for tables exceeding 100M rows
- Index strategy reviewed quarterly based on query patterns
- Storage cost projections for 12-month horizon

---

## 6. Database

### Design
- Normalized to 3NF minimum; denormalize only with measured evidence
- All tables have primary keys (prefer UUIDs over auto-increment for distributed systems)
- Foreign keys enforced at database level
- Created_at, updated_at timestamps on all mutable tables
- Soft deletes for user-facing data (hard deletes for internal processing data)

### Migrations
- All schema changes via versioned, reviewable migration files
- Migrations are backward-compatible (expand-then-contract pattern)
- Migrations tested against production-scale data before deployment
- Rollback script exists for every migration

### Operations
- Connection pool size tuned to workload (not default values)
- Query timeout: 30 seconds maximum
- Slow query logging enabled (threshold: 1 second)
- Backup: daily full, continuous WAL archiving, tested monthly

---

## 7. Observability

### Logging
- Structured logging (JSON format) in production
- Request ID propagated across all services
- Log levels used correctly: ERROR (requires action), WARN (investigate), INFO (business events), DEBUG (development)
- No PII in logs; no secrets in logs
- Retention: 30 days hot, 90 days cold

### Metrics
- RED metrics for all services: Rate, Errors, Duration
- USE metrics for infrastructure: Utilization, Saturation, Errors
- Business metrics: user actions, conversion events, feature usage
- Custom metrics for SLO tracking

### Tracing
- Distributed tracing across all service boundaries
- Trace ID in every log line
- Span annotations for key business operations
- Sampling rate: 100% for errors, 10% for success (adjust based on volume)

### Alerting
- Alert on symptoms (error rate, latency), not causes (CPU)
- Every alert has a runbook link
- Severity levels: P1 (page immediately), P2 (respond in 1 hour), P3 (next business day)
- Alert fatigue monitored: if an alert fires > 5x/week without action, fix or remove it

---

## 8. Testing

### Coverage Targets
| Type | Coverage | Purpose |
|------|----------|---------|
| Unit | > 80% branch coverage on business logic | Correctness of individual units |
| Integration | All system boundaries tested | Correct interaction with infrastructure |
| E2E | Critical user paths | User-visible flows work end-to-end |
| Load | Baseline + 3x peak simulated | Performance under stress |
| Security | OWASP Top 10 automated | Known vulnerability patterns |

### Test Properties
- All tests deterministic (no flaky tests)
- Test suite completes in < 10 minutes (CI)
- Tests run in isolation (no shared mutable state)
- Test data factories used (no production data in tests)

### Testing in Production
- Synthetic monitoring for critical paths
- Canary deployments for risk mitigation
- Feature flags enable testing in production safely
- Chaos engineering exercises quarterly

---

## 9. DevOps & CI/CD

### Pipeline
- All changes go through CI (no exceptions)
- Pipeline stages: lint → type-check → unit test → build → integration test → security scan → deploy
- Pipeline completes in < 15 minutes
- Failed pipeline blocks deployment

### Deployment
- Zero-downtime deployments (rolling or blue-green)
- Automated rollback on health check failure
- Deployment frequency: multiple times per day (target)
- Change lead time: < 1 day from commit to production

### Infrastructure as Code
- All infrastructure defined in code (Terraform, Pulumi, CDK)
- Infrastructure changes reviewed like application code
- Environments reproducible from code
- Secrets managed via dedicated service (not in repo, not in env files committed)

---

## 10. Documentation

### Required Documentation
- API documentation (OpenAPI/Swagger) generated from code
- Architecture decision records (ADRs) for significant choices
- Runbooks for all alerting scenarios
- Onboarding guide for new team members
- Data dictionary for all database tables

### Documentation Standards
- Documentation lives next to the code it describes
- Updated as part of the same PR that changes behavior
- Reviewed for accuracy during code review
- Stale documentation is worse than no documentation — delete what's outdated

---

## 11. Privacy & Compliance

### Data Classification
| Level | Description | Examples | Controls |
|-------|-------------|----------|----------|
| Public | No restrictions | Marketing content | None |
| Internal | Company employees only | Internal docs, analytics | Auth required |
| Confidential | Need-to-know basis | User PII, financial data | Encryption + access logging |
| Restricted | Maximum protection | Passwords, payment cards, health data | Encryption + access logging + approval workflow |

### Data Handling
- Data retention policy defined and enforced for all data classes
- Right to deletion implemented and tested
- Data export capability for user data (GDPR/CCPA)
- Consent tracked and revocable
- Third-party data sharing inventoried and documented
- Cross-border data transfer compliance verified

### Audit
- All access to confidential/restricted data logged
- Audit logs immutable and retained for 12 months minimum
- Quarterly access review for sensitive systems
- Annual compliance audit

---

## 12. AI & Machine Learning Standards

### Model Governance
- All models versioned and reproducible
- Training data documented (source, bias assessment, freshness)
- Model performance monitored post-deployment (drift detection)
- Rollback capability for model updates

### Safety
- Human-in-the-loop for high-stakes decisions
- Output validation and guardrails for generative models
- Prompt injection defenses for LLM-powered features
- Rate limiting on AI-powered endpoints (cost and abuse)

### Transparency
- Users informed when interacting with AI-generated content
- Explanation capability for consequential decisions
- Feedback mechanism for incorrect outputs
- Regular bias auditing

---

## 13. Deployment & Environments

### Environment Parity
| Environment | Purpose | Data | Refresh |
|-------------|---------|------|---------|
| Local | Development | Seed data | On demand |
| CI | Automated testing | Generated | Per run |
| Staging | Pre-production validation | Anonymized production snapshot | Weekly |
| Production | Live users | Real data | N/A |

### Deployment Requirements
- Feature flags for all new features
- Database migrations separate from application deployments
- Canary deployment for high-risk changes (< 5% traffic, monitor, then expand)
- Deployment window: any time (if zero-downtime); off-peak for breaking changes

---

## 14. Maintainability

### Code Health
- Technical debt tracked and addressed (20% of sprint capacity)
- Dependency updates automated (Dependabot/Renovate) with weekly review
- No dependency more than 2 major versions behind
- Cyclomatic complexity monitored and bounded

### Knowledge Distribution
- No single point of knowledge (bus factor ≥ 2 for all components)
- Code ownership assigned but shared (review across team boundaries)
- Pair programming for complex features
- Architecture sync meetings (monthly)

---

## 15. Accessibility

### Standards
- WCAG 2.1 Level AA compliance minimum
- Keyboard navigation for all interactive elements
- Screen reader support tested with actual screen readers
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- Focus indicators visible and consistent
- No content conveyed by color alone

### Testing
- Automated accessibility testing in CI (axe-core or equivalent)
- Manual testing with screen readers quarterly
- User testing with assistive technology users annually

---

## 16. Definition of Done (NFR)

A feature is production-ready when:

- [ ] Security review completed for sensitive changes
- [ ] Performance tested under expected load
- [ ] Error handling covers all identified failure modes
- [ ] Monitoring and alerting configured
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Data privacy implications assessed
- [ ] Deployment runbook updated

---

**Features are optional. Security, reliability, observability, maintainability, and operational readiness are mandatory.**
