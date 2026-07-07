# Testing Strategy

## Testing Pyramid

```
        ╱╲
       ╱ E2E ╲         Few, slow, expensive
      ╱────────╲
     ╱Integration╲     Moderate count
    ╱──────────────╲
   ╱   Unit Tests    ╲  Many, fast, cheap
  ╱────────────────────╲
```

## Test Types

### Unit Tests

- Test individual functions/modules in isolation
- Mock external dependencies
- Fast (< 10ms per test)
- Coverage target: 80%+

### Integration Tests

- Test component interactions
- Use real dependencies where feasible (test DB, etc.)
- Focus on boundaries and contracts

### End-to-End Tests

- Test critical user journeys
- Run against staging environment
- Keep minimal (< 20 scenarios)

## Conventions

- Test files: `*.test.ts` co-located with source
- Describe blocks mirror module structure
- One assertion per test (where practical)
- No test interdependencies

## Tools

| Purpose | Tool |
|---------|------|
| Unit/Integration | Vitest / Jest |
| E2E | Playwright |
| API | Supertest |
| Mocking | vi.mock / msw |
| Coverage | c8 / istanbul |
