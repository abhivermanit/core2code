# Regression Testing

## Principle

Regression testing ensures that new changes don't break existing functionality. Every bug fix gets a test. Every critical path has automated coverage. Flaky tests are treated as bugs.

---

## Strategy

### What is Regression Testing?

Verifying that previously working functionality still works after code changes. It's not a separate test type — it's the practice of maintaining and running your existing test suite to catch unintended side effects.

---

## Automated Regression Suite

### Composition

| Source | What It Becomes |
|--------|----------------|
| Bug fix | Regression test (proves the bug stays fixed) |
| Feature tests | Regression coverage (verifies feature still works) |
| Integration tests | Interface regression (contracts still honored) |
| E2E critical paths | User journey regression (core flows work) |

### Organization

```
tests/
├── unit/              # Fast, isolated, run always
├── integration/       # Real dependencies, run on PR
├── e2e/
│   ├── critical/      # Must pass before deploy (login, purchase, core feature)
│   └── extended/      # Full regression, run nightly
└── regression/        # Bug-specific regression tests
    ├── BUG-123-duplicate-charge.test.ts
    ├── BUG-456-null-user-profile.test.ts
    └── BUG-789-timezone-offset.test.ts
```

---

## When to Run

| Trigger | What Runs | Time Budget |
|---------|-----------|-------------|
| Pre-commit (local) | Unit tests for changed files | < 30 seconds |
| PR opened | Unit + Integration + Critical E2E | < 10 minutes |
| Merge to main | Full regression suite | < 30 minutes |
| Nightly | Extended E2E + Performance baselines | < 2 hours |
| Pre-release | Full suite + manual exploratory | < 4 hours |

### CI Configuration

```yaml
# PR checks (must pass to merge)
pr-tests:
  parallel:
    - unit-tests         # 2 minutes
    - integration-tests  # 5 minutes
    - critical-e2e       # 5 minutes
  fail-fast: true

# Post-merge (nightly)
nightly-regression:
  schedule: "0 2 * * *"
  steps:
    - full-unit-tests
    - full-integration-tests
    - extended-e2e-tests
    - performance-baseline-comparison
  notify-on-failure: team-channel
```

---

## Baseline Management

### Visual Regression

For UI changes, maintain visual baselines (screenshots):

```typescript
// Playwright visual comparison
test('dashboard renders correctly', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
  });
});
```

**Baseline Rules:**
- Baselines committed to git (or stored in CI artifact storage)
- Updated explicitly when intentional visual changes are made
- Reviewed in PR (screenshot diffs visible)
- Separate baselines per OS/browser if rendering differs

### Performance Baselines

- Record p95 response times for key endpoints
- Alert when regression exceeds 20% degradation
- Store baselines in CI, update intentionally after optimizations

---

## Flaky Test Policy

Flaky tests erode trust in the entire suite. Treat them as production bugs.

### Definition

A test is flaky if it passes and fails without code changes. Common causes:
- Timing dependencies (race conditions, timeouts)
- Shared state between tests (test order dependency)
- External service dependencies (network, third-party APIs)
- Environment differences (timezone, locale, screen size)

### Process

```
1. Flaky test detected (failed in CI, passed on retry)
2. Mark as flaky immediately (@flaky tag or quarantine)
3. Create bug ticket with P2 priority
4. Fix within 1 week or delete the test
5. Never leave a flaky test in the suite longer than 2 weeks
```

### Prevention

```typescript
// BAD — timing-dependent
await page.click('.submit');
await new Promise(resolve => setTimeout(resolve, 1000));
expect(await page.textContent('.result')).toBe('Done');

// GOOD — wait for actual condition
await page.click('.submit');
await expect(page.locator('.result')).toHaveText('Done', { timeout: 5000 });
```

### Quarantine Strategy

```typescript
// Move flaky tests to a separate suite that doesn't block PRs
// but still runs and reports
describe.skip('FLAKY: order creation race condition', () => {
  // TODO: Fix by [date]. Ticket: BUG-789
  it('handles concurrent order creation', () => { ... });
});
```

---

## Writing Regression Tests for Bug Fixes

Every bug fix must include a test that:
1. Fails BEFORE the fix (reproduces the bug)
2. Passes AFTER the fix (proves it's fixed)
3. Prevents the same bug from recurring

```typescript
// regression/BUG-123-duplicate-charge.test.ts
describe('BUG-123: Duplicate charge on retry timeout', () => {
  it('does not create duplicate charge when first request times out but succeeds', async () => {
    // Arrange: simulate a timeout on first attempt that actually succeeded server-side
    mockPaymentGateway.onFirstCall().timeout();
    mockPaymentGateway.onSecondCall().resolve({ id: 'ch_123', status: 'succeeded' });

    // Act: process payment with retry
    const result = await paymentService.charge({
      orderId: 'ord-1',
      amount: 2999,
      idempotencyKey: 'idem-1',
    });

    // Assert: only one charge created (idempotency prevents duplicate)
    expect(result.chargeId).toBe('ch_123');
    const charges = await db.charges.findAll({ orderId: 'ord-1' });
    expect(charges.length).toBe(1);
  });
});
```

---

## Regression Test Maintenance

| Practice | Frequency |
|----------|-----------|
| Review test execution times | Weekly |
| Remove tests for deleted features | With feature removal |
| Update tests for intentional behavior changes | With the change PR |
| Fix or remove flaky tests | Within 1 week of detection |
| Review test coverage gaps | Monthly |
| Prune redundant tests (same behavior covered multiple times) | Quarterly |

---

## Metrics

| Metric | Target | Action if Not Met |
|--------|--------|-------------------|
| Suite pass rate | > 99% | Fix flaky tests |
| Suite execution time (PR) | < 10 min | Parallelize, optimize |
| Bug escape rate (bugs in prod without regression test) | < 5% | Add missing coverage |
| Flaky test count | 0 (goal), < 3 (tolerance) | Prioritize fixes |
| Time to fix flaky test | < 1 week | Escalate if stuck |

---

## Anti-Patterns

- **No test for bug fix** — You will reintroduce this bug. Write the test.
- **Retrying flaky tests until they pass** — Hides the problem. Fix the test.
- **Massive test suite nobody runs locally** — Split into fast/slow suites. Fast runs locally.
- **Tests that take 30+ minutes per PR** — Block development velocity. Optimize or parallelize.
- **"We'll write tests later"** — You won't. Write them with the code.
- **Disabling tests instead of fixing them** — Disabled tests provide zero value. Fix or delete.
