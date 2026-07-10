# Code Review Checklist

Review for what matters. Your job as a reviewer is to catch what automated tools cannot: design issues, missing edge cases, and maintenance traps.

## Correctness

- [ ] Code does what the ticket/PR description says
- [ ] Edge cases handled (empty arrays, null values, zero, negative numbers)
- [ ] Error cases handled (what happens when it fails?)
- [ ] Race conditions considered (concurrent access, double-submit)
- [ ] Boundary conditions checked (off-by-one, max/min values)
- [ ] Data validation at input boundaries
- [ ] Idempotency where needed (payments, side effects)
- [ ] State transitions are valid (can't go from "shipped" to "draft")

## Security

- [ ] No SQL injection (parameterized queries used)
- [ ] No XSS (user input encoded in output)
- [ ] Authentication checked on new endpoints
- [ ] Authorization checked (not just "is logged in" but "can access THIS resource")
- [ ] No secrets in code or comments
- [ ] User input validated and sanitized
- [ ] File uploads validated (type, size, content)
- [ ] Rate limiting on new public endpoints
- [ ] No sensitive data in logs

## Performance

- [ ] No N+1 queries (loading related data in a loop)
- [ ] Database queries have appropriate indexes (or existing indexes cover them)
- [ ] Large result sets paginated (not loading 10K records into memory)
- [ ] Expensive operations are async/background (email, notifications, exports)
- [ ] Caching used where appropriate (with invalidation strategy)
- [ ] No unnecessary database calls (cached lookups, early returns)
- [ ] Bundle size impact considered (new dependency justified?)
- [ ] Image/asset optimization if applicable

## Maintainability

- [ ] Code is readable without comments explaining "what" (comments explain "why")
- [ ] Naming is clear and consistent with codebase conventions
- [ ] Functions/methods are focused (single responsibility)
- [ ] No code duplication that should be abstracted
- [ ] No premature abstraction (don't abstract for one use case)
- [ ] Error messages are helpful for debugging
- [ ] Magic numbers extracted to named constants
- [ ] Complex logic has explanatory comments

## Testing

- [ ] New behavior has tests
- [ ] Tests cover the happy path AND failure cases
- [ ] Tests are readable (describe what they verify, not how)
- [ ] Tests don't depend on external services or timing
- [ ] Tests don't depend on execution order
- [ ] Edge cases from correctness section have test coverage
- [ ] If bug fix: test proves the bug existed (fails without the fix)

## API Design (if applicable)

- [ ] Endpoint follows existing API conventions
- [ ] Response format consistent with other endpoints
- [ ] Error responses follow standard format
- [ ] New fields are backward compatible (additive only)
- [ ] Documentation/types updated

## Database Changes (if applicable)

- [ ] Migration is reversible
- [ ] Migration tested against production-like data
- [ ] No breaking changes to existing columns
- [ ] Indexes added for new query patterns
- [ ] Constraints added where appropriate (NOT NULL, UNIQUE, FK)
- [ ] New columns have defaults or are nullable

## What NOT to Bikeshed

Don't block PRs for:
- Formatting (automate with Prettier/ESLint)
- Minor naming preferences (unless genuinely confusing)
- Alternative approaches that aren't clearly better
- Style differences within acceptable range
- Missing optimizations that aren't currently needed

## Review Response Time

- Small PRs (< 100 lines): Review within 4 hours
- Medium PRs (100-400 lines): Review within 1 day
- Large PRs (400+ lines): Ask to split, or review within 2 days

If a PR is too large to review effectively, that's feedback: it should be smaller.
