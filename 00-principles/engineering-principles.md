# Engineering Principles

## Core Values

1. **Simplicity over complexity** — Choose the simplest solution that meets requirements.
2. **Correctness over speed** — Correct code first, fast code second.
3. **Explicit over implicit** — Make behavior obvious; avoid hidden dependencies.
4. **Composition over inheritance** — Prefer small, composable units.
5. **Fail fast, fail loud** — Surface errors immediately rather than masking them.

## Design Principles

- **Single Responsibility** — Each module/function does one thing well.
- **Dependency Inversion** — Depend on abstractions, not implementations.
- **Interface Segregation** — Prefer small, focused interfaces.
- **Least Surprise** — APIs should behave as users expect.
- **YAGNI** — Don't build what isn't needed yet.

## Operational Principles

- **Observable by default** — Every service produces structured logs, metrics, and traces.
- **Resilient by design** — Handle failure gracefully (timeouts, retries, circuit breakers).
- **Secure by default** — Follow least-privilege; validate all inputs.
- **Testable by construction** — Design code so it can be tested in isolation.
- **Documented decisions** — Record architectural choices via ADRs.
