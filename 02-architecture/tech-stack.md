# Tech Stack Decisions

This document records technology choices with rationale. Every choice has trade-offs — document them honestly.

---

## Decision Template

For each technology choice:

```markdown
### [Category]: [Choice]

**Alternatives Considered:** [What else was evaluated]
**Decision Date:** [When]
**Revisit Date:** [When to reconsider]

**Why this choice:**
- [Reason 1]
- [Reason 2]

**Trade-offs accepted:**
- [Downside 1]
- [Downside 2]

**Exit strategy:**
- [How to migrate away if needed]
```

---

## Language & Runtime

### Primary Language: [Language]

**Alternatives Considered:** [List]

| Criterion | [Language A] | [Language B] | [Language C] |
|-----------|-------------|-------------|-------------|
| Team expertise | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Ecosystem maturity | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Performance | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Hiring pool | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Tooling quality | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Decision:** [Language] because [primary reason].

**Trade-offs:**
- [What we give up]

---

## Framework

### Web Framework: [Framework]

**Alternatives Considered:** [List]

| Criterion | [Framework A] | [Framework B] | [Framework C] |
|-----------|--------------|--------------|--------------|
| Learning curve | Low | Medium | High |
| Performance | Good | Excellent | Good |
| Community/ecosystem | Large | Medium | Growing |
| Convention vs configuration | Convention | Configuration | Convention |
| Long-term maintenance | Stable | Stable | Uncertain |

**Decision:** [Framework] because [reason].

---

## Database

### Primary Database: [Database]

**Alternatives Considered:** [List]

| Criterion | PostgreSQL | MySQL | MongoDB | DynamoDB |
|-----------|-----------|-------|---------|----------|
| Data model fit | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Query flexibility | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| Scalability | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Operational complexity | Medium | Low | Medium | Low (managed) |
| Cost at scale | Low | Low | Medium | Variable |
| Team expertise | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |

**Decision:** [Database] because [reason].

**Scaling plan:**
- Phase 1: Single instance with read replica
- Phase 2: Connection pooling (PgBouncer)
- Phase 3: Vertical scaling
- Phase 4: Partitioning / sharding (if needed)

---

## Hosting & Infrastructure

### Cloud Provider: [Provider]

**Alternatives Considered:** [List]

| Criterion | AWS | GCP | Azure | Vercel/Railway |
|-----------|-----|-----|-------|---------------|
| Service breadth | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Developer experience | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Pricing clarity | ⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Team expertise | [Rating] | [Rating] | [Rating] | [Rating] |
| Compliance certs | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

**Decision:** [Provider] because [reason].

### Compute

| Option | Use Case | Decision |
|--------|----------|----------|
| Containers (ECS/GKE/AKS) | Primary application | [Choice + reason] |
| Serverless (Lambda/Cloud Functions) | Event processing, scheduled jobs | [Choice + reason] |
| VMs | Legacy compatibility, specific requirements | [Choice + reason] |

### Container Orchestration

| Option | When to Use |
|--------|-------------|
| Docker Compose | Local development only |
| ECS/Fargate | AWS, simpler ops, smaller scale |
| Kubernetes | Multi-cloud, large scale, team expertise |
| Platform as a Service | Minimal ops team, fast iteration |

---

## Supporting Services

### Cache: [Choice]

| Option | Best For | Decision |
|--------|----------|----------|
| Redis | Session store, rate limiting, general cache | [Why chosen/not] |
| Memcached | Simple key-value, multi-threaded | [Why chosen/not] |
| Application-level | Small datasets, single instance | [Why chosen/not] |

### Message Queue: [Choice]

| Option | Best For | Decision |
|--------|----------|----------|
| SQS/SNS | Simple queues, AWS native | [Why chosen/not] |
| RabbitMQ | Complex routing, multiple consumers | [Why chosen/not] |
| Kafka | Event streaming, high throughput, replay | [Why chosen/not] |
| Redis (BullMQ) | Job queues, simple setup | [Why chosen/not] |

### Search: [Choice]

| Option | Best For | Decision |
|--------|----------|----------|
| PostgreSQL FTS | Simple search, < 1M records | [Why chosen/not] |
| Elasticsearch | Complex search, facets, large scale | [Why chosen/not] |
| Meilisearch/Typesense | Simple setup, good defaults | [Why chosen/not] |
| Algolia | Managed, fast setup, hosted | [Why chosen/not] |

---

## Development Tools

### Version Control & CI/CD

| Tool | Purpose | Decision |
|------|---------|----------|
| Git hosting | Source control | [GitHub/GitLab/Bitbucket] |
| CI/CD | Build and deploy | [GitHub Actions/GitLab CI/CircleCI] |
| IaC | Infrastructure management | [Terraform/Pulumi/CDK] |
| Container registry | Image storage | [ECR/GCR/Docker Hub] |

### Code Quality

| Tool | Purpose | Decision |
|------|---------|----------|
| Linter | Code style enforcement | [ESLint/Prettier/etc.] |
| Type checker | Static analysis | [TypeScript/mypy/etc.] |
| Security scanner | Vulnerability detection | [Snyk/Dependabot/etc.] |
| Test runner | Automated testing | [Jest/Vitest/pytest/etc.] |

### Observability

| Tool | Purpose | Decision |
|------|---------|----------|
| Logging | Log aggregation | [Datadog/CloudWatch/ELK] |
| Metrics | Performance monitoring | [Datadog/Prometheus/CloudWatch] |
| Tracing | Distributed tracing | [Datadog/Jaeger/X-Ray] |
| Error tracking | Exception monitoring | [Sentry/Bugsnag/Datadog] |
| Alerting | Incident notification | [PagerDuty/OpsGenie/built-in] |

---

## Technology Radar

Track technologies the team is evaluating:

| Technology | Status | Notes |
|-----------|--------|-------|
| [Tech A] | Adopt | Using in production |
| [Tech B] | Trial | Piloting in non-critical path |
| [Tech C] | Assess | Evaluating, no commitment |
| [Tech D] | Hold | Not using, previously considered |

---

## Cost Estimation

| Service | Monthly Cost (estimate) | Scale Factor | Notes |
|---------|------------------------|--------------|-------|
| Compute | $[X] | Per instance | [N] instances |
| Database | $[X] | Per GB + IOPS | [Size] |
| Cache | $[X] | Per GB | [Size] |
| Storage | $[X] | Per GB | [Size] |
| CDN | $[X] | Per GB transferred | [Traffic] |
| Third-party APIs | $[X] | Per request/user | [Volume] |
| **Total** | **$[X]** | | |
