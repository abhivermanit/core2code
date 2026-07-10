# System Context Diagram

The system context diagram shows the highest level view of the system — what it is, who uses it, and what it interacts with. Everything inside the boundary is ours. Everything outside is not.

---

## System Boundary

```
                    ┌─────────────────────────────────────┐
                    │          SYSTEM BOUNDARY             │
                    │                                     │
  [Actor A] ──────▶│     ┌───────────────────────┐      │
                    │     │                       │      │
  [Actor B] ──────▶│     │    Our System          │      │──────▶ [External System X]
                    │     │    [Name]              │      │
  [Actor C] ──────▶│     │                       │      │──────▶ [External System Y]
                    │     └───────────────────────┘      │
                    │                                     │──────▶ [External System Z]
                    └─────────────────────────────────────┘
```

---

## Actors

Actors are people or systems that interact with our system from the outside.

| Actor | Type | Interaction | Channel | Volume |
|-------|------|-------------|---------|--------|
| End User | Human | Uses the application directly | Web browser, Mobile app | ~[X] daily active |
| Admin User | Human | Manages configuration, users, content | Web admin panel | ~[X] admins |
| API Consumer | System | Integrates programmatically | REST API | ~[X] requests/day |
| Scheduled Jobs | System | Triggers periodic processing | Internal cron | [X] jobs/day |
| Support Agent | Human | Investigates issues, manages users | Internal tools | ~[X] agents |

---

## External Systems

Systems outside our boundary that we depend on or that depend on us.

### Systems We Depend On (Upstream)

| System | Purpose | Protocol | SLA | Fallback |
|--------|---------|----------|-----|----------|
| [Auth Provider] | User authentication, SSO | OAuth 2.0 / OIDC | 99.99% | Cached sessions, graceful degradation |
| [Payment Processor] | Payment handling | REST API | 99.95% | Queue payments for retry |
| [Email Service] | Transactional email | SMTP / API | 99.9% | Queue and retry |
| [Cloud Storage] | File/media storage | S3-compatible API | 99.99% | — (critical dependency) |
| [Search Service] | Full-text search | REST API | 99.9% | Fall back to DB query |

### Systems That Depend On Us (Downstream)

| System | What They Consume | Protocol | Our SLA to Them | Rate Limit |
|--------|------------------|----------|-----------------|------------|
| [Partner System A] | User data, events | Webhooks | Best effort | 100 req/min |
| [Analytics Platform] | Events stream | Event bus | At-least-once | Unlimited |
| [Reporting System] | Read replicas | Database | Eventually consistent | N/A |

---

## Data Flows Across Boundaries

### Inbound Data

| Source | Data | Sensitivity | Volume | Format |
|--------|------|-------------|--------|--------|
| End User | Profile data, actions | PII | [X]/day | JSON over HTTPS |
| API Consumer | Integration data | Varies | [X]/day | JSON over HTTPS |
| [External System] | Webhook events | Internal | [X]/day | JSON over HTTPS |

### Outbound Data

| Destination | Data | Sensitivity | Volume | Format |
|-------------|------|-------------|--------|--------|
| [Email Service] | Email content, addresses | PII | [X]/day | API call |
| [Analytics] | User events (anonymized) | Internal | [X]/day | Event stream |
| [Partner System] | Webhooks | Varies | [X]/day | JSON over HTTPS |

---

## Trust Boundaries

| Boundary | What's Trusted | What's Untrusted | Controls |
|----------|---------------|-----------------|----------|
| Internet → API Gateway | Nothing external | All inbound traffic | TLS, rate limiting, WAF |
| API Gateway → Services | Authenticated requests | — | Token validation, authorization |
| Services → Database | Application queries | — | Connection pool, parameterized queries |
| Services → External APIs | — | External responses | Input validation, timeout, circuit breaker |

---

## Communication Patterns

### Synchronous

| From | To | Protocol | Auth | Timeout | Retry |
|------|----|----------|------|---------|-------|
| Client | API Gateway | HTTPS | Bearer token | 30s | Client-side |
| API Gateway | Service | HTTP | Internal token | 10s | None |
| Service | Database | TCP | Connection string | 5s | Connection pool |
| Service | External API | HTTPS | API key | 10s | 3x with backoff |

### Asynchronous

| Publisher | Event | Consumer(s) | Guarantee | Ordering |
|-----------|-------|-------------|-----------|----------|
| Service A | UserCreated | Service B, Service C | At-least-once | Per partition |
| Service B | OrderCompleted | Service A, Notifications | At-least-once | Per order |

---

## Environment Variations

| Aspect | Local Dev | Staging | Production |
|--------|-----------|---------|------------|
| Auth Provider | Mock/local | Sandbox | Production |
| Payment | Sandbox | Sandbox | Production |
| Email | Local mailbox | Sandbox | Production |
| External APIs | Mocked | Sandbox | Production |
| Data | Seed data | Anonymized production | Real |

---

## Questions to Answer

When creating a system context diagram, ensure you can answer:

1. Who are all the users of this system?
2. What external systems does this system call?
3. What external systems call this system?
4. What data crosses the system boundary?
5. What are the trust boundaries?
6. What happens when each external system is unavailable?
7. What is the expected load from each actor/system?
