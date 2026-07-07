# Production Hardening Checklist

THE checklist. If your application passes everything here, it's ready for real users with real money.

## Authentication Hardening

- [ ] Passwords hashed with bcrypt (cost factor 12+) or argon2id
- [ ] Session tokens are cryptographically random (minimum 256 bits)
- [ ] Sessions expire on inactivity (30 minutes) and absolutely (24 hours)
- [ ] Session invalidated on password change, email change, and logout
- [ ] Account lockout after 5 failed attempts (15-minute lockout)
- [ ] Password reset tokens are single-use and expire (1 hour max)
- [ ] OAuth tokens stored encrypted, refresh tokens rotated
- [ ] MFA available for sensitive accounts (admin, financial)
- [ ] Login events logged with IP, user agent, and geolocation
- [ ] "Remember me" uses separate long-lived token (not session extension)

## Row-Level Security

- [ ] Every table with tenant data has tenant_id column
- [ ] RLS policies enabled at database level (not just application)
- [ ] Cross-tenant data access impossible (even with direct DB query)
- [ ] RLS tested: query as tenant A cannot see tenant B's data
- [ ] Admin bypass is explicit and audited
- [ ] JOIN queries respect RLS (no data leaks through relationships)
- [ ] Aggregate queries don't leak cross-tenant information
- [ ] File/object storage also respects tenant boundaries

## Session Lifecycle

- [ ] Session created only on successful authentication
- [ ] Session ID regenerated after privilege change (login, role change)
- [ ] Concurrent session limit enforced (or at least visible to user)
- [ ] Session revocation works instantly (not on next request check)
- [ ] "Sign out all devices" functionality works
- [ ] Cookies: HttpOnly, Secure, SameSite=Lax, appropriate domain/path
- [ ] Session storage cleaned up (expired sessions removed)

## Rate Limiting

- [ ] Login endpoint: 5 attempts/minute per IP + per account
- [ ] Registration: 3/minute per IP (prevent spam signups)
- [ ] Password reset: 3/hour per account
- [ ] API endpoints: per-user limits appropriate to plan
- [ ] File upload: rate and size limited
- [ ] Email sending: rate limited to prevent abuse
- [ ] Search/expensive queries: stricter limits than reads
- [ ] Rate limit headers returned (Limit, Remaining, Reset)
- [ ] 429 response includes Retry-After header

## Secrets Management

- [ ] No secrets in source code (git history clean)
- [ ] No secrets in environment files committed to git
- [ ] Secrets stored in secret manager (Vault, AWS SM, Doppler)
- [ ] Secret rotation possible without downtime
- [ ] API keys/tokens have expiration dates
- [ ] Different secrets per environment (dev ≠ staging ≠ prod)
- [ ] Secret access is audited (who read what, when)
- [ ] Application fails fast if required secret is missing

## Database Transactions

- [ ] Multi-step operations use transactions (all-or-nothing)
- [ ] Transaction isolation level appropriate (read committed minimum)
- [ ] Optimistic locking for concurrent updates (version column)
- [ ] Deadlock detection and retry logic
- [ ] Long-running transactions avoided (< 5 seconds)
- [ ] Connection pool sized correctly (not too many, not too few)
- [ ] Connection leak detection enabled
- [ ] Read replicas used for read-heavy queries (where appropriate)

## N+1 Query Prevention

- [ ] List endpoints use eager loading / JOINs (not lazy loading in loops)
- [ ] DataLoader pattern used for GraphQL resolvers
- [ ] Query count monitoring in development (flag if > N queries per request)
- [ ] Database query logging enabled in development
- [ ] Common queries have appropriate indexes
- [ ] EXPLAIN ANALYZE run on slow queries
- [ ] Pagination enforced on all list endpoints (no unbounded queries)

## Indexing

- [ ] Every foreign key column has an index
- [ ] Columns used in WHERE clauses have indexes
- [ ] Composite indexes match query patterns (column order matters)
- [ ] Indexes don't slow writes unacceptably
- [ ] Unused indexes identified and removed
- [ ] Partial indexes for common filtered queries
- [ ] Index-only scans possible for frequent queries

## Responsive Design

- [ ] Mobile-first CSS (base = mobile, media queries add desktop)
- [ ] Touch targets minimum 44x44px
- [ ] Safe areas respected (notch, home indicator)
- [ ] Font scaling doesn't break layout (test at 200%)
- [ ] No horizontal scrollbar at any viewport width
- [ ] Images responsive (srcset/sizes)
- [ ] Forms usable on mobile (correct input types, stacked layout)
- [ ] Navigation accessible on all screen sizes

## Safe Areas

- [ ] `env(safe-area-inset-*)` used for edge-to-edge layouts
- [ ] Fixed headers/footers account for notch/home indicator
- [ ] Landscape orientation handles left/right insets
- [ ] Content not hidden behind rounded corners
- [ ] Viewport meta tag configured correctly

## Loading, Error, and Empty States

- [ ] Every async operation has a loading state (skeleton or spinner)
- [ ] Every error has a user-friendly message (not stack traces)
- [ ] Empty states guide users to take action ("No items yet. Create one?")
- [ ] Error boundaries prevent full-page crashes (React, or equivalent)
- [ ] Network errors have retry option
- [ ] Timeout errors distinguished from other errors
- [ ] Partial failure handled (some items load, some don't)
- [ ] Offline state communicated clearly

## Duplicate Prevention

- [ ] Forms prevent double-submit (disable button, idempotency key)
- [ ] Payment operations are idempotent (same key = same result)
- [ ] Unique constraints on business keys (email, SKU, etc.)
- [ ] Optimistic locking prevents lost updates
- [ ] Background jobs are idempotent (safe to retry)
- [ ] Webhook handlers check for duplicate events
- [ ] API mutations return existing resource on duplicate (not error)

## Error Boundaries

- [ ] Global error boundary catches unhandled exceptions
- [ ] Component-level error boundaries isolate failures
- [ ] Error boundaries show recovery action (reload, retry)
- [ ] Errors logged to error tracking service (Sentry, etc.)
- [ ] Unhandled promise rejections caught and reported
- [ ] API errors don't crash the client (graceful handling)

## Observability

- [ ] Structured logging (JSON) with consistent schema
- [ ] Request tracing (trace ID propagated through services)
- [ ] Error tracking with context (user, request, stack trace)
- [ ] Metrics for RED (Rate, Error, Duration) per endpoint
- [ ] Health check endpoint (liveness + readiness)
- [ ] Alerting on SLO breach (error rate, latency, availability)
- [ ] Dashboard for operational visibility
- [ ] Log retention and search capability

## Dependency Verification

- [ ] Lock file committed and used in CI/CD (exact versions)
- [ ] No vulnerable dependencies (critical/high)
- [ ] Dependency licenses compatible with your project
- [ ] All dependencies from official registries
- [ ] No typosquatting packages (manually verified names)
- [ ] Dependency update process automated (Dependabot/Renovate)
- [ ] Outdated dependencies tracked and updated regularly

## Supply Chain

- [ ] CI/CD pipeline uses pinned action versions (not @latest)
- [ ] Docker base images pinned to digest (not just tag)
- [ ] Package integrity verified (checksums, signatures)
- [ ] Build environment is reproducible
- [ ] Third-party integrations reviewed for security
- [ ] Webhook endpoints validate signatures
- [ ] No dynamic code execution from external sources

## CI/CD Gates

- [ ] Lint passes (no warnings treated as acceptable)
- [ ] Type check passes (strict mode)
- [ ] All tests pass (no skipped tests in CI)
- [ ] Security scan passes (no critical/high vulnerabilities)
- [ ] Build succeeds (production build, not dev)
- [ ] Bundle size within budget
- [ ] Code coverage doesn't decrease
- [ ] Database migrations apply cleanly

## Rollback

- [ ] Previous version tagged and accessible
- [ ] Rollback procedure documented and tested
- [ ] Anyone on-call can execute rollback (not just deployer)
- [ ] Rollback completes in < 5 minutes
- [ ] Feature flags allow instant disable without redeploy
- [ ] Database migrations are backward compatible (old code works with new schema)

## Production Readiness

- [ ] HTTPS everywhere (no mixed content)
- [ ] Error pages don't leak information (custom 404, 500 pages)
- [ ] Graceful shutdown (SIGTERM handler, drain connections)
- [ ] Health checks implemented (not just "server responds")
- [ ] Startup validation (fail fast on missing config/connections)
- [ ] Horizontal scaling works (stateless application layer)
- [ ] Backup system tested (restore verified)
- [ ] Disaster recovery plan documented and drilled
- [ ] SLOs defined and monitored
- [ ] On-call rotation established
- [ ] Runbooks written for known failure modes
