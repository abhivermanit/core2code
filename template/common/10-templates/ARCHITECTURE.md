# Architecture Document: [System/Feature Name]

**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Status:** Draft | Review | Approved
**Reviewers:** [Names]

---

## Context

### Problem

What technical problem are we solving? What are the requirements driving this architecture?

### Current State

How does the system work today? What are its limitations?

### Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| [Functional requirement] | Must Have | |
| [Non-functional: availability] | Must Have | 99.9% uptime |
| [Non-functional: latency] | Should Have | p99 < 500ms |
| [Non-functional: scale] | Should Have | 10K concurrent users |

## Architecture Overview

[High-level diagram or description of the system architecture]

```
[Client] → [API Gateway] → [Service A] → [Database]
                         → [Service B] → [Cache]
                                       → [Message Queue]
```

### Components

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| [Component] | [What it does] | [Tech choice] |
| [Component] | [What it does] | [Tech choice] |

## Data Model

### Core Entities

```sql
-- Key tables and their relationships
[table_name] (
  id UUID PRIMARY KEY,
  -- key columns
);
```

### Data Flow

How does data flow through the system? What are the read/write patterns?

## API Design

### Key Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/v1/resource | List resources |
| POST | /api/v1/resource | Create resource |

### Contracts Between Services

[Define the interfaces between components]

## Infrastructure

### Deployment Topology

- Region(s): [where]
- Compute: [type, size, count]
- Database: [type, size, replicas]
- Cache: [type, size]

### Scaling Strategy

How does each component scale? What are the limits?

## Security Considerations

- Authentication: [approach]
- Authorization: [approach]
- Data protection: [approach]
- Network: [approach]

## Reliability

### Failure Modes

| Component | Failure Mode | Impact | Mitigation |
|-----------|-------------|--------|------------|
| [Component] | [What can fail] | [User impact] | [How we handle it] |

### SLOs

| Metric | Target |
|--------|--------|
| Availability | 99.9% |
| Latency (p99) | < 500ms |
| Error rate | < 0.1% |

## Alternatives Considered

### Option A: [Name]

[Description, pros, cons, why rejected]

### Option B: [Name] ← Selected

[Description, pros, cons, why selected]

### Option C: [Name]

[Description, pros, cons, why rejected]

## Migration Plan

How do we get from current state to target state?

1. [Phase 1: description]
2. [Phase 2: description]
3. [Phase 3: description]

### Rollback Plan

How do we revert if migration goes wrong?

## Observability

- Metrics: [what we measure]
- Logging: [what we log]
- Tracing: [how we trace]
- Alerting: [what triggers alerts]

## Cost Estimate

| Resource | Monthly Cost | Notes |
|----------|-------------|-------|
| [Resource] | $X | [sizing basis] |
| **Total** | **$X** | |

## Open Questions

- [ ] [Decision needed]
- [ ] [Decision needed]

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| [date] | [what was decided] | [why] |
