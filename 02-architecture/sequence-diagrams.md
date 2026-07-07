# Sequence Diagrams

Sequence diagrams document the runtime behavior of key flows. They show which components interact, in what order, and what data passes between them.

---

## When to Create Sequence Diagrams

- Authentication/authorization flows
- Core business operations (create, purchase, process)
- Error handling and recovery flows
- Multi-service interactions
- Any flow that spans more than 2 components

---

## Diagram Format

Use Mermaid syntax for maintainability:

```mermaid
sequenceDiagram
    participant A as Actor/Client
    participant B as Component B
    participant C as Component C

    A->>B: Request
    B->>C: Delegate
    C-->>B: Response
    B-->>A: Result
```

---

## 1. Authentication Flow

### Login (Username/Password)

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as User Store
    participant Token as Token Service

    Client->>API: POST /auth/login {email, password}
    API->>Auth: validateCredentials(email, password)
    Auth->>DB: findByEmail(email)
    DB-->>Auth: User record (with hashed password)
    Auth->>Auth: verifyPassword(input, hash)

    alt Password valid
        Auth->>Token: generateTokenPair(userId, roles)
        Token-->>Auth: {accessToken, refreshToken}
        Auth->>DB: recordLoginSuccess(userId, metadata)
        Auth-->>API: AuthResult(tokens, user)
        API-->>Client: 200 {accessToken, refreshToken, user}
    else Password invalid
        Auth->>DB: recordLoginFailure(userId)
        Auth-->>API: AuthError(INVALID_CREDENTIALS)
        API-->>Client: 401 {error: "Invalid credentials"}
    end
```

### Token Refresh

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Token as Token Service
    participant DB as Token Store

    Client->>API: POST /auth/refresh {refreshToken}
    API->>Token: refreshTokenPair(refreshToken)
    Token->>DB: findRefreshToken(tokenHash)

    alt Token valid and not revoked
        Token->>Token: generateNewAccessToken(userId, roles)
        Token->>DB: rotateRefreshToken(oldToken, newToken)
        Token-->>API: {accessToken, refreshToken}
        API-->>Client: 200 {accessToken, refreshToken}
    else Token invalid or revoked
        Token-->>API: AuthError(INVALID_TOKEN)
        API-->>Client: 401 {error: "Token expired or revoked"}
    end
```

---

## 2. Data Creation Flow

### Create Resource (with validation)

```mermaid
sequenceDiagram
    participant Client
    participant API as API Layer
    participant App as Application Layer
    participant Domain as Domain Layer
    participant Repo as Repository
    participant Bus as Event Bus

    Client->>API: POST /resources {data}
    API->>API: validateSchema(data)

    alt Schema invalid
        API-->>Client: 400 {errors: [...]}
    else Schema valid
        API->>App: createResource(command)
        App->>Domain: Resource.create(data)
        Domain->>Domain: validateBusinessRules()

        alt Business rules violated
            Domain-->>App: DomainError
            App-->>API: BusinessRuleViolation
            API-->>Client: 422 {error: "..."}
        else Valid
            Domain-->>App: Resource entity
            App->>Repo: save(resource)
            Repo-->>App: saved resource (with ID)
            App->>Bus: publish(ResourceCreated)
            App-->>API: Resource
            API-->>Client: 201 {resource}
        end
    end
```

---

## 3. Error Handling Flow

### Transient Failure with Retry

```mermaid
sequenceDiagram
    participant App as Application
    participant Client as External Client
    participant CB as Circuit Breaker
    participant DLQ as Dead Letter Queue

    App->>CB: callExternalService(request)
    CB->>Client: HTTP request

    alt Success
        Client-->>CB: 200 Response
        CB-->>App: Result
    else Transient failure (timeout, 503)
        Client-->>CB: Error
        CB->>CB: Wait (exponential backoff)
        CB->>Client: Retry #2
        Client-->>CB: Error
        CB->>CB: Wait (longer)
        CB->>Client: Retry #3
        Client-->>CB: Error

        alt Max retries exceeded
            CB->>CB: Open circuit
            CB-->>App: CircuitOpenError
            App->>DLQ: enqueue(request, context)
            App-->>App: Return graceful degradation
        end
    end
```

### Circuit Breaker States

```mermaid
sequenceDiagram
    participant App as Application
    participant CB as Circuit Breaker
    participant Ext as External Service

    Note over CB: State: CLOSED (normal)
    App->>CB: request
    CB->>Ext: forward
    Ext-->>CB: failure (5th in a row)

    Note over CB: State: OPEN (failing fast)
    App->>CB: request
    CB-->>App: CircuitOpenError (immediate, no call to Ext)

    Note over CB: After timeout period...
    Note over CB: State: HALF-OPEN (testing)
    App->>CB: request
    CB->>Ext: forward (single probe)

    alt Probe succeeds
        Ext-->>CB: success
        Note over CB: State: CLOSED (recovered)
    else Probe fails
        Ext-->>CB: failure
        Note over CB: State: OPEN (still broken)
    end
```

---

## 4. Async Processing Flow

### Background Job Execution

```mermaid
sequenceDiagram
    participant API
    participant Queue as Job Queue
    participant Worker
    participant Service as External Service
    participant DB

    API->>Queue: enqueue(job, priority)
    API-->>API: Return 202 Accepted

    Note over Worker: Picks up job
    Worker->>Queue: dequeue()
    Queue-->>Worker: Job payload
    Worker->>Worker: validateIdempotencyKey()

    alt Already processed
        Worker->>Queue: acknowledge()
    else New job
        Worker->>Service: processJob(payload)
        Service-->>Worker: result
        Worker->>DB: saveResult(jobId, result)
        Worker->>Queue: acknowledge()
        Worker->>Queue: publish(JobCompleted event)
    end
```

---

## 5. Webhook Delivery Flow

```mermaid
sequenceDiagram
    participant System as Our System
    participant Queue as Delivery Queue
    participant Endpoint as Subscriber Endpoint
    participant DLQ as Dead Letter Queue

    System->>Queue: enqueue(webhook, subscriberUrl)

    Queue->>Endpoint: POST /webhook {event, signature, timestamp}

    alt 2xx Response (within 5s)
        Endpoint-->>Queue: 200 OK
        Queue->>Queue: Mark delivered
    else Timeout or 5xx
        Endpoint-->>Queue: Error/Timeout
        Queue->>Queue: Schedule retry (backoff: 30s, 5m, 30m, 2h, 12h)
        Note over Queue: Retry attempts...
        Queue->>Endpoint: POST /webhook (retry)

        alt Still failing after all retries
            Queue->>DLQ: Move to dead letter
            Queue->>System: Alert: webhook delivery failed
        end
    end
```

---

## Diagram Conventions

| Symbol | Meaning |
|--------|---------|
| `->>` | Synchronous request |
| `-->>` | Response |
| `--)` | Asynchronous message (fire and forget) |
| `alt/else` | Conditional branches |
| `opt` | Optional interaction |
| `loop` | Repeated interaction |
| `Note over` | Annotation |

---

## Template for New Diagrams

```mermaid
sequenceDiagram
    participant [Actor]
    participant [Component 1]
    participant [Component 2]
    participant [Component 3]

    Note over [Actor],[Component 3]: [Flow Name]

    [Actor]->>[Component 1]: [Action] {[data]}
    [Component 1]->>[Component 2]: [Action]
    [Component 2]->>[Component 3]: [Action]
    [Component 3]-->>[Component 2]: [Response]
    [Component 2]-->>[Component 1]: [Response]
    [Component 1]-->>[Actor]: [Response]
```
