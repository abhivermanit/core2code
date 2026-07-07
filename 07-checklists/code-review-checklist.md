# Code Review Checklist

## Correctness

- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error paths work correctly
- [ ] No off-by-one errors
- [ ] Concurrency issues addressed

## Security

- [ ] No hardcoded secrets
- [ ] Input validated
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)
- [ ] Authorization checks in place

## Performance

- [ ] No unnecessary database queries (N+1)
- [ ] Large collections paginated
- [ ] No blocking operations on hot paths
- [ ] Appropriate caching

## Maintainability

- [ ] Code is readable without explanation
- [ ] Functions are small and focused
- [ ] Naming is clear and consistent
- [ ] No dead code
- [ ] No premature abstractions

## Testing

- [ ] Tests cover the change
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested
- [ ] Mocks are appropriate

## Documentation

- [ ] Public APIs documented
- [ ] Complex logic explained (why, not what)
- [ ] Breaking changes noted
