# CLAUDE.md

This file provides context and directives for AI coding assistants working on this project.

---

## Engineering Directives

1. **Read before writing.** Always read existing code before modifying it. Match the project's style, conventions, and libraries rather than introducing new ones.

2. **Verify your changes.** Run the build and tests after every change. If something breaks, fix it before moving on.

3. **Security by default.** Use parameterized queries, validate all input, hash passwords with bcrypt/argon2, enforce authorization on every endpoint. Never store secrets in code.

4. **Handle all states.** Every async operation needs loading, error, and empty states. Every form needs validation and duplicate-submit prevention.

5. **Write tests for behavior, not implementation.** Test what the code does, not how it does it. Cover the happy path, error cases, and edge cases.

6. **Keep it simple.** Don't abstract until you have 3 concrete use cases. Don't optimize until you've measured. Don't add features that weren't asked for.

7. **Make it production-ready.** Structured logging, health checks, graceful shutdown, appropriate indexes, connection pooling, rate limiting. These aren't optional.

8. **Fail gracefully.** Circuit breakers for external calls, retries with backoff, fallbacks for degraded dependencies. Users should see helpful errors, not stack traces.

9. **Commit atomically.** Each commit should be a single logical change that leaves the system in a working state. Use conventional commit messages.

10. **Respect the data model.** Row-level security, foreign key constraints, NOT NULL defaults, proper indexes. The database enforces invariants that code cannot.

11. **Accessibility is not optional.** Semantic HTML, ARIA labels, keyboard navigation, color contrast, focus management. WCAG 2.1 AA minimum.

12. **Document decisions, not mechanics.** ADRs for why, not comments for what. Code should be self-explanatory. Comments explain intent and constraints.

---

## Project Context

### Stack

- **Language:** [TypeScript / Python / etc.]
- **Framework:** [Next.js / Express / Django / etc.]
- **Database:** [PostgreSQL / etc.]
- **ORM:** [Prisma / Drizzle / SQLAlchemy / etc.]
- **Auth:** [Auth provider or custom]
- **Hosting:** [Vercel / AWS / etc.]

### Key Commands

```bash
# Development
[npm run dev / etc.]

# Testing
[npm test / etc.]

# Lint + Type check
[npm run lint && npm run typecheck / etc.]

# Build
[npm run build / etc.]

# Database migrations
[npx prisma migrate dev / etc.]
```

### Architecture

[Brief description of project architecture — monorepo structure, services, key packages]

### Conventions

- [File naming convention]
- [Component structure]
- [API route patterns]
- [Error handling patterns]
- [Testing patterns]

### Important Files

- `[path]` — [what it contains / why it matters]
- `[path]` — [what it contains / why it matters]

### Environment

Required environment variables are documented in `.env.example`. Never commit real values.

### Known Constraints

- [Constraint 1 — e.g., "Must support Node 18+"]
- [Constraint 2 — e.g., "API must be backward-compatible with v1 clients"]
- [Constraint 3 — e.g., "Multi-tenant with RLS, always filter by tenant_id"]
