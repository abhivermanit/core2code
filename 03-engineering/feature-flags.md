# Feature Flags

## Principle

Feature flags decouple deployment from release. Ship code continuously, control visibility independently. Every flag has an owner and an expiration date.

---

## Why Feature Flags

- Deploy incomplete features safely (trunk-based development enabler)
- Gradual rollouts (1% → 10% → 50% → 100%)
- A/B testing
- Kill switches for problematic features
- Operational toggles (graceful degradation)

---

## Flag Lifecycle

Every flag follows this lifecycle. No exceptions.

```
CREATE → DEVELOP → TEST → ENABLE → MONITOR → REMOVE
```

| Phase | Action |
|-------|--------|
| Create | Define flag with owner, expiration date, description |
| Develop | Code behind the flag. Both paths must work. |
| Test | Test with flag ON and OFF. Both paths are production code. |
| Enable | Roll out gradually. Monitor metrics. |
| Monitor | Watch for regressions for 1-2 weeks at 100%. |
| Remove | Delete the flag, dead code, and tests for the old path. |

### Expiration Rules

| Flag Type | Max Lifetime |
|-----------|-------------|
| Release flag (ship feature) | 30 days after 100% rollout |
| Experiment flag (A/B test) | Duration of experiment + 7 days |
| Ops toggle (kill switch) | Permanent (reviewed quarterly) |
| Permission flag (entitlement) | Permanent (managed via config) |

---

## Naming Convention

```
FF_<CATEGORY>_<DESCRIPTION>
```

| Category | Example |
|----------|---------|
| Release | `FF_RELEASE_NEW_CHECKOUT_FLOW` |
| Experiment | `FF_EXPERIMENT_PRICING_PAGE_V2` |
| Ops | `FF_OPS_DISABLE_EMAIL_NOTIFICATIONS` |
| Permission | `FF_PERMISSION_BETA_FEATURES` |

**In code (camelCase):**
```typescript
flags.releaseNewCheckoutFlow
flags.experimentPricingPageV2
flags.opsDisableEmailNotifications
```

---

## Implementation Patterns

### Simple Boolean Flag

```typescript
if (flags.isEnabled('releaseNewCheckoutFlow', { userId })) {
  return newCheckoutFlow(order);
} else {
  return legacyCheckoutFlow(order);
}
```

### Percentage Rollout

```typescript
// Flag service handles the percentage logic
// Developer just checks the flag — no manual percentage code
const variant = flags.getVariant('experimentPricingPage', { userId });

switch (variant) {
  case 'control': return renderCurrentPricing();
  case 'variant-a': return renderNewPricing();
  default: return renderCurrentPricing();
}
```

### Guard at the Boundary

Prefer checking flags at the highest level possible (route, controller, component entry) rather than deep in business logic.

```typescript
// GOOD — flag at the route level
router.get('/checkout', featureGuard('releaseNewCheckoutFlow'), newCheckoutHandler);

// AVOID — flag buried in service logic
function calculateTotal(items) {
  if (flags.isEnabled('releaseNewPricing')) { ... } // Hard to test, hard to find
}
```

---

## Testing with Flags

- **Test both paths.** The old path is production code until the flag is removed.
- **Default to OFF in tests.** Explicitly enable for flag-specific tests.
- **Test the transition.** What happens when the flag changes mid-session?

```typescript
describe('checkout flow', () => {
  it('uses legacy flow when flag is off', () => {
    flags.override('releaseNewCheckoutFlow', false);
    // ...
  });

  it('uses new flow when flag is on', () => {
    flags.override('releaseNewCheckoutFlow', true);
    // ...
  });
});
```

---

## Tools

| Tool | Strengths |
|------|-----------|
| LaunchDarkly | Full-featured, targeting, analytics |
| Unleash | Open-source, self-hosted |
| Flagsmith | Open-source, feature-rich |
| PostHog | Combined analytics + flags |
| Environment variables | Simplest. Fine for small teams / few flags |
| Config file | Simple, no external dependency, limited targeting |

### Decision Guide

- **< 5 flags, no targeting:** Env vars are fine.
- **5-20 flags, basic targeting:** Lightweight tool (Unleash, Flagsmith).
- **20+ flags, experiments, targeting rules:** Full platform (LaunchDarkly, PostHog).

---

## Flag Hygiene

| Practice | Details |
|----------|---------|
| Flag registry | Central document/tool listing all active flags with owners |
| Expiration alerts | CI warns when a flag exceeds its max lifetime |
| Dead flag detection | Lint rule or CI check for flags no longer in flag service |
| Code cleanup PR | When removing a flag, delete ALL code paths, not just the check |
| Regular review | Monthly review of all active flags. Remove what's done. |

---

## Anti-Patterns

- **Flag in a flag** — Nested flag checks create combinatorial complexity. Flatten.
- **Permanent "temporary" flags** — Set expiration. Enforce it.
- **Flag logic in business layer** — Check at boundaries, not deep in domain logic.
- **Testing only the happy path** — Both ON and OFF are production code. Test both.
- **Hundreds of stale flags** — Each flag is cognitive overhead. Remove aggressively.
- **No owner** — Every flag has a named owner responsible for cleanup.
