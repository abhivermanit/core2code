# Non-Functional Requirements

Index of all NFR documents in this directory.

## Master Document

- [non-functional-requirements.md](./non-functional-requirements.md) — Complete NFR specification (all 16 sections)

## Topic-Specific Documents

| Document | Covers |
|----------|--------|
| [security.md](./security.md) | Authentication, authorization, data isolation, secrets, API security, input validation, abuse protection |
| [performance.md](./performance.md) | Response time targets, optimization strategies, load testing |
| [scalability.md](./scalability.md) | Horizontal scaling, stateless services, caching, database scaling |
| [reliability.md](./reliability.md) | Error handling, retries, circuit breakers, availability targets, disaster recovery |
| [observability.md](./observability.md) | Logging, metrics, tracing, alerting |
| [testing.md](./testing.md) | Testing requirements, security testing, regression testing |
| [devops.md](./devops.md) | CI/CD, deployment, infrastructure, rollback |
| [privacy-compliance.md](./privacy-compliance.md) | Data minimization, encryption, retention, deletion, consent |
| [accessibility.md](./accessibility.md) | WCAG AA, keyboard navigation, screen readers |

## How to Use

- The **master document** is the canonical reference.
- Topic-specific documents expand on each section with implementation guidance.
- As any section grows beyond ~2 pages, its detail moves to the dedicated file while the master retains a summary.
