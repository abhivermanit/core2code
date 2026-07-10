# Testing Strategy

## Principle

Tests exist to give you confidence to ship. The testing pyramid guides investment: many fast unit tests, fewer integration tests, and minimal end-to-end tests. Every test should answer: "If this fails, what broke?"

---

## Testing Pyramid

```
        /   E2E   \          Few (5-10%)   — Slow, brittle, expensive
       /  (UI/API)  \        Critical user paths only
      /───────────────\
     / Integration     \     Some (20-30%) — Real dependencies, boundaries
    /   (Components)    \    Service interactions, DB queries
   /─────────────────────\
  /     Unit Tests        \  Many (60-70%) — Fast, isolated, focused
 /   (Functions/Classes)   \ Business logic, transformations, validations
/───────────────────────────\
```

---

## Types of Tests

| Type | What It Tests | Speed | Dependencies | When to Write |
|------|--------------|-------|-------------|---------------|
| Unit | Single function/class in isolation | < 10ms | None (mocked) | Every function with logic |
| Integration | Components working together | < 5s | Real DB, real services | Service boundaries, DB queries |
| Contract | API interface compatibility | < 2s | Schema/mock | API boundaries between teams |
| E2E | Full user workflow | 10-60s | Everything | Critical happy paths |
| Performance | Speed under load | Minutes | Full environment | Before major releases |
| Security | Vulnerability detection | Varies | Depends on type | CI pipeline, pre-release |

---

## Coverage Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Line coverage | > 80% | Not a goal in itself, but a smell detector |
| Branch coverage | > 75% | More meaningful than line coverage |
| Critical path coverage | 100% | Auth, payment, data mutation |
| New code coverage | > 90% | No new code without tests |

### Coverage is a Compass, Not a Destination

- 100% coverage doesn't mean no bugs
- 80% coverage with meaningful tests > 95% coverage with assertion-free tests
- Focus on: "What breaks if this test doesn't exist?"

---

## When to Write Each Test Type

### Unit Tests — Write for:

- Pure functions and transformations
- Business logic and calculations
- Validation rules
- State machines and reducers
- Edge cases and boundary conditions
- Error handling paths

### Integration Tests — Write for:

- Database queries (actual DB, not mocks)
- API endpoint behavior (request → response)
- Service interactions (service A calls service B)
- Message queue producers/consumers
- Cache interactions
- File system operations

### E2E Tests — Write for:

- Critical user journeys (signup, login, purchase, core feature)
- Flows involving multiple services
- Regression tests for critical bugs
- Smoke tests for deployment verification

### Skip Tests When:

- The code is trivially simple (getter, pass-through)
- The test would just restate the implementation
- The behavior is already covered by a higher-level test
- It's generated code that's verified by the generator

---

## Test Organization

```
src/
├── services/
│   ├── order.service.ts
│   └── order.service.test.ts      # Unit tests co-located
├── repositories/
│   ├── order.repository.ts
│   └── order.repository.test.ts   # Integration tests co-located
tests/
├── integration/                    # Cross-service integration tests
│   └── checkout-flow.test.ts
├── e2e/                           # End-to-end tests
│   └── purchase.e2e.test.ts
├── fixtures/                      # Shared test data
└── helpers/                       # Shared test utilities
```

---

## Test Quality Signals

| Good Test | Bad Test |
|-----------|----------|
| Fails when behavior breaks | Fails when implementation changes |
| One clear reason to fail | Multiple unrelated assertions |
| Readable as documentation | Requires reading implementation to understand |
| Independent (runs in any order) | Depends on other tests' side effects |
| Fast and deterministic | Flaky or slow |
| Tests behavior, not implementation | Mocks everything, tests mock interactions |

---

## CI Integration

```yaml
# Run on every PR
test:unit → test:integration → test:e2e → deploy:preview

# Fail fast
- Unit tests first (fastest feedback)
- Integration tests second
- E2E tests last (slowest, most expensive)
- If any stage fails, stop and report
```

---

## Anti-Patterns

- **Testing implementation details** — Your test breaks when you refactor but behavior is unchanged.
- **No assertions** — Test "passes" because it doesn't check anything.
- **Test interdependence** — Test B fails if Test A doesn't run first.
- **Excessive mocking** — If you mock everything, you test nothing real.
- **Ignoring flaky tests** — Fix or delete. A flaky test is worse than no test.
- **Testing framework code** — Don't test that React renders or Express routes.
- **Coverage-driven development** — Writing tests to hit coverage numbers, not to verify behavior.
