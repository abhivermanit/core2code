# Feature Flags

Feature flags decouple deployment from release. Ship code to production daily, enable features when ready.

## Flag Lifecycle

```
Created → Development → Testing → Rollout → Fully Enabled → Cleanup → Removed
```

Every flag has a **kill date**. If a flag exists longer than 30 days after full rollout, it's tech debt.

### Lifecycle Rules

1. **Create** — ticket links to flag, owner assigned
2. **Develop** — code behind flag, default OFF
3. **Test** — QA tests both states (flag on AND off)
4. **Rollout** — gradual percentage increase or targeted cohorts
5. **Fully enabled** — 100% of users, flag evaluates to true
6. **Cleanup** — remove flag checks, remove dead code path
7. **Archive** — flag removed from system

## Flag Types

| Type | Purpose | Lifetime |
|------|---------|----------|
| Release | Ship incomplete features safely | Days to weeks |
| Experiment | A/B test variants | Weeks |
| Ops | Kill switch for degraded service | Permanent |
| Permission | User/tenant-level access control | Permanent |

Only **Ops** and **Permission** flags are allowed to be permanent. Everything else has an expiry.

## Naming Convention

```
<type>.<domain>.<feature>

release.checkout.new-payment-flow
experiment.onboarding.simplified-signup
ops.search.elasticsearch-fallback
permission.billing.enterprise-plan
```

**Rules:**
- Lowercase, kebab-case
- Descriptive enough to understand without context
- Never reuse flag names (even after deletion)

## Implementation Pattern

```typescript
// Good: clean separation
if (flags.isEnabled('release.checkout.new-payment-flow', { userId })) {
  return newCheckoutFlow(cart);
}
return legacyCheckoutFlow(cart);

// Bad: nested flags, impossible to reason about
if (flags.isEnabled('flag-a')) {
  if (flags.isEnabled('flag-b')) {
    // What state is this? How do you test it?
  }
}
```

### Rules for Flag Usage in Code

- **One flag per feature** — don't combine flags for complex conditional logic
- **Flag at the highest level possible** — route/page level, not deep in components
- **Both paths tested** — unit tests cover flag ON and flag OFF
- **No flag dependencies** — flag A should never depend on flag B being enabled
- **Default to OFF** — new flags should be safe to deploy with no behavior change

## Testing Feature Flags

```typescript
describe('checkout flow', () => {
  it('uses new flow when flag enabled', () => {
    mockFlags({ 'release.checkout.new-payment-flow': true });
    // test new behavior
  });

  it('uses legacy flow when flag disabled', () => {
    mockFlags({ 'release.checkout.new-payment-flow': false });
    // test old behavior
  });
});
```

Test the matrix:
- Flag ON in staging
- Flag OFF in production (during rollout)
- Flag removed entirely (after cleanup)

## Cleanup Policy

| Age Since Full Rollout | Action |
|------------------------|--------|
| 0-7 days | Verify metrics, prepare cleanup PR |
| 7-14 days | Cleanup PR merged |
| 14-30 days | Escalate if not cleaned |
| 30+ days | Block next feature flag creation for that team |

### Cleanup Checklist

- [ ] Remove flag evaluation from code
- [ ] Remove dead code path (the old behavior)
- [ ] Remove flag from configuration/provider
- [ ] Remove flag-specific tests (keep behavior tests)
- [ ] Update documentation

## Gradual Rollout Strategy

```
Day 1: 1% (internal users / team)
Day 2: 5% (beta users)
Day 3: 25% (random sample)
Day 5: 50%
Day 7: 100%
```

Monitor at each stage:
- Error rates
- Performance metrics
- Business metrics (conversion, engagement)
- Support ticket volume

## Tools

| Tool | Best For |
|------|----------|
| LaunchDarkly | Enterprise, complex targeting |
| Unleash | Self-hosted, open source |
| PostHog | Combined analytics + flags |
| Statsig | Experimentation focus |
| Custom (DB/config) | Simple on/off, small teams |

## Anti-Patterns

- **Flag graveyard** — hundreds of flags, nobody knows which are active
- **Nested flag logic** — combinatorial explosion of states
- **Flags as config** — use environment variables for config, flags for features
- **No owner** — every flag must have a responsible person
- **Testing only the happy path** — both flag states must be tested
- **Using flags to avoid fixing tech debt** — flags hide problems, they don't solve them
