# Accessibility Testing

## Principle

Accessibility is not optional — it's a quality requirement. Build for all users from the start, not as a retrofit. Target WCAG 2.1 AA as the minimum standard. Note: full WCAG compliance validation requires manual testing with assistive technologies and expert accessibility review.

---

## WCAG 2.1 AA Requirements

| Principle | Key Requirements |
|-----------|-----------------|
| Perceivable | Text alternatives for images, captions for video, sufficient color contrast (4.5:1), content reflows at 320px |
| Operable | Keyboard navigable, no keyboard traps, skip links, focus visible, no time limits without extension |
| Understandable | Language declared, predictable navigation, input errors identified with suggestions |
| Robust | Valid HTML, ARIA used correctly, works with assistive tech |

---

## Automated Testing Tools

| Tool | Type | Coverage |
|------|------|----------|
| axe-core | Library | ~57% of WCAG issues (automated) |
| axe DevTools | Browser extension | Interactive testing + guided manual |
| Lighthouse | Browser/CI | Basic accessibility audit |
| pa11y | CLI/CI | Automated page scanning |
| jest-axe | Unit test | Component-level accessibility |
| Playwright + axe | E2E | Full page automated scanning |

### In Unit Tests (jest-axe / vitest-axe)

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button component', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button onClick={handleClick}>Submit</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### In E2E Tests (Playwright + axe)

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page has no critical accessibility issues', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

---

## Manual Testing Checklist

Automated tools catch ~30-50% of accessibility issues. Manual testing is required.

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual/logical order
- [ ] No keyboard traps (can always Tab away)
- [ ] Focus indicator visible on all focused elements
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys work in custom widgets (menus, tabs, sliders)
- [ ] Skip link jumps to main content

### Screen Reader

- [ ] Page title is descriptive and unique
- [ ] Headings form a logical outline (h1 → h2 → h3, no skips)
- [ ] Images have meaningful alt text (or empty alt for decorative)
- [ ] Form fields have associated labels
- [ ] Error messages announced when they appear
- [ ] Dynamic content updates announced (aria-live)
- [ ] Custom widgets have appropriate ARIA roles
- [ ] Links describe destination (not "click here")

### Visual

- [ ] Text contrast ratio ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- [ ] Information not conveyed by color alone
- [ ] Content readable at 200% zoom
- [ ] Layout doesn't break at 320px viewport
- [ ] Focus indicator has ≥ 3:1 contrast against background
- [ ] Animation respects `prefers-reduced-motion`

### Forms

- [ ] Every input has a visible label
- [ ] Required fields indicated (not just by color)
- [ ] Error messages identify the field and describe the fix
- [ ] Form can be completed with keyboard only
- [ ] Autocomplete attributes on appropriate fields

---

## Assistive Technology Testing Matrix

| Screen Reader | OS | Browser | Priority |
|--------------|-----|---------|----------|
| NVDA | Windows | Chrome, Firefox | High |
| JAWS | Windows | Chrome | High |
| VoiceOver | macOS | Safari | High |
| VoiceOver | iOS | Safari | High |
| TalkBack | Android | Chrome | Medium |

Test critical user flows (signup, login, primary feature) with at least 2 screen readers.

---

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| Missing alt text on images | Add descriptive alt, or `alt=""` for decorative |
| Missing form labels | Add `<label>` with `htmlFor`, or `aria-label` |
| Low contrast text | Increase contrast to ≥ 4.5:1 |
| Missing heading structure | Add proper h1-h6 hierarchy |
| Focus not visible | Add `:focus-visible` styles |
| Dynamic content not announced | Add `aria-live="polite"` region |
| Custom buttons not keyboard accessible | Use `<button>`, not `<div onClick>` |
| Modal doesn't trap focus | Implement focus trap |

---

## CI Integration

```yaml
accessibility:
  steps:
    - run: npx playwright test --grep @a11y
    - run: npx pa11y-ci --config .pa11yci.json
  on_failure:
    - Block merge for critical/serious violations
    - Warn for moderate violations
```

---

## Anti-Patterns

- **"We'll add accessibility later"** — Retrofitting is 10x more expensive. Build it in.
- **Only automated testing** — Catches half the issues at best. Manual testing is required.
- **ARIA everywhere** — Semantic HTML first. ARIA is a last resort, not a first choice.
- **Testing only with one screen reader** — Behavior varies. Test multiple.
- **Hiding content with `display: none` for "accessibility"** — Screen readers can't see it either.
- **"Accessible" overlays/widgets** — Third-party overlays often make things worse, not better.
