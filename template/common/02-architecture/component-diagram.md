# Component Diagram

The component diagram breaks the system into its internal building blocks. Each component has a clear responsibility, well-defined interfaces, and explicit dependencies.

---

## Component Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        Application                              │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   Interface   │  │   Interface   │  │    Interface      │    │
│  │   (HTTP API)  │  │  (Events)     │  │   (Scheduled)     │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │
│         │                  │                    │               │
│         ▼                  ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Application Layer                        │  │
│  │   (Use Cases / Commands / Queries / Orchestration)       │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                  │
│                             ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Domain Layer                           │  │
│  │   (Entities / Value Objects / Domain Services / Rules)   │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                  │
│                             ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Infrastructure Layer                      │  │
│  │   (Repositories / External Clients / Messaging / Cache)  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Component Definitions

### Template

For each component, document:

```markdown
### [Component Name]

**Responsibility:** One sentence describing what this component does.

**Interface:**
- [Public method/endpoint 1]: [Description]
- [Public method/endpoint 2]: [Description]

**Dependencies:**
- [Component/service it depends on]: [Why]

**Data Owned:**
- [Data entity 1]: [Description]

**Technology:** [Language, framework, key libraries]

**Scaling:** [How this component scales]
```

---

## Core Components

### API Layer

**Responsibility:** HTTP request handling, input validation, response formatting, authentication.

**Interface:**
- REST endpoints organized by resource
- Request validation (schema + business rules)
- Response serialization
- Error response formatting

**Dependencies:**
- Application Layer (delegates all business logic)
- Auth Provider (token validation)

**Does NOT contain:**
- Business logic
- Direct database access
- Complex data transformations

---

### Application Layer

**Responsibility:** Orchestrates use cases by coordinating domain objects and infrastructure services.

**Interface:**
- Commands (mutate state): `CreateOrder`, `UpdateProfile`, `ProcessPayment`
- Queries (read state): `GetOrderById`, `ListUserOrders`, `SearchProducts`

**Dependencies:**
- Domain Layer (business rules and entities)
- Infrastructure Layer (persistence, external services)

**Patterns:**
- One use case = one class/function
- Commands and queries separated (CQRS-lite)
- Transaction boundaries defined here

---

### Domain Layer

**Responsibility:** Core business logic, rules, and entities. This is the heart of the system.

**Interface:**
- Entities with behavior (not anemic data objects)
- Value objects for typed, validated data
- Domain services for logic spanning multiple entities
- Domain events for signaling state changes

**Dependencies:**
- None (this layer depends on nothing else)
- Defines interfaces that infrastructure implements

**Rules:**
- No framework dependencies
- No I/O (database, HTTP, file system)
- Pure business logic only
- Testable without any infrastructure

---

### Infrastructure Layer

**Responsibility:** Implementation details — database access, external API calls, messaging, caching.

**Interface:**
- Repository implementations (implements domain interfaces)
- External service clients
- Message publishers/consumers
- Cache operations

**Dependencies:**
- Domain Layer (implements interfaces defined there)
- External systems (databases, APIs, queues)

---

## Supporting Components

### Authentication & Authorization

**Responsibility:** Identity verification and access control.

| Sub-component | Responsibility |
|---------------|---------------|
| Auth Middleware | Token validation, session management |
| Permission Service | Role/permission checks |
| Token Service | Token generation, refresh, revocation |

---

### Event Bus / Message Queue

**Responsibility:** Asynchronous communication between components.

| Sub-component | Responsibility |
|---------------|---------------|
| Publisher | Publishes domain events to the bus |
| Consumer | Receives and routes events to handlers |
| Dead Letter Handler | Manages failed messages |

---

### Background Workers

**Responsibility:** Async task processing, scheduled jobs.

| Worker | Responsibility | Schedule/Trigger |
|--------|---------------|-----------------|
| Email Worker | Sends queued emails | Event-driven |
| Report Generator | Creates periodic reports | Scheduled (daily) |
| Data Sync | Syncs with external systems | Scheduled (hourly) |
| Cleanup | Removes expired data | Scheduled (nightly) |

---

### Observability

**Responsibility:** Monitoring, logging, alerting.

| Sub-component | Responsibility |
|---------------|---------------|
| Logger | Structured logging, request correlation |
| Metrics Collector | RED/USE metrics emission |
| Tracer | Distributed trace propagation |
| Health Check | Readiness and liveness probes |

---

## Dependency Rules

1. **Arrows point inward** — outer layers depend on inner layers, never the reverse
2. **Domain has zero dependencies** — it defines interfaces, infrastructure implements them
3. **No circular dependencies** — if A depends on B, B cannot depend on A
4. **Interface segregation** — components depend only on the interfaces they use

```
Interface Layer  →  Application Layer  →  Domain Layer
                                              ↑
Infrastructure Layer ─────────────────────────┘
     (implements domain interfaces)
```

---

## Component Communication

| From | To | Method | Sync/Async | Notes |
|------|----|--------|-----------|-------|
| API Layer | Application Layer | Direct function call | Sync | Same process |
| Application Layer | Domain Layer | Direct function call | Sync | Same process |
| Application Layer | Infrastructure | Via interface | Sync | Dependency injection |
| Component A | Component B | Event bus | Async | Decoupled |
| Background Worker | Application Layer | Direct call | Async | Same codebase, different process |

---

## Component Ownership

| Component | Team | On-Call | Repository |
|-----------|------|---------|-----------|
| [API Layer] | [Team] | [Rotation] | [Repo] |
| [Domain - Orders] | [Team] | [Rotation] | [Repo] |
| [Domain - Users] | [Team] | [Rotation] | [Repo] |
| [Infrastructure] | [Team] | [Rotation] | [Repo] |
