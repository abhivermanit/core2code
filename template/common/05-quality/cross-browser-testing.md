# Cross-Browser Testing

## Principle

Users don't choose browsers based on what's convenient for developers. Support the browsers your users actually use, detect features instead of sniffing user agents, and polyfill judiciously.

---

## Browser Support Matrix

### Tier 1 — Full Support (Must Work)

| Browser | Version | Platform |
|---------|---------|----------|
| Chrome | Latest 2 versions | Windows, macOS, Android |
| Safari | Latest 2 versions | macOS, iOS |
| Firefox | Latest 2 versions | Windows, macOS |
| Edge | Latest 2 versions | Windows |
| Samsung Internet | Latest version | Android |

### Tier 2 — Best Effort (Should Work)

| Browser | Version | Platform |
|---------|---------|----------|
| Chrome | 3-4 versions back | All |
| Safari | 3-4 versions back | macOS, iOS |
| Firefox ESR | Latest ESR | Enterprise |

### Not Supported

| Browser | Action |
|---------|--------|
| Internet Explorer | Display upgrade notice |
| Opera Mini | Graceful degradation |
| Browsers > 2 years old | Display upgrade suggestion |

### How to Determine Your Matrix

- Check analytics: What do YOUR users actually use?
- Determine "last 2 versions" threshold with browserslist
- Document support level (full, best-effort, unsupported)
- Review quarterly as browser share shifts

---

## Feature Detection

Never check browser identity. Check feature availability.

```javascript
// BAD — user agent sniffing
if (navigator.userAgent.includes('Safari')) {
  // Safari-specific code
}

// GOOD — feature detection
if ('IntersectionObserver' in window) {
  // Use IntersectionObserver
} else {
  // Fallback behavior
}

// GOOD — CSS feature detection
@supports (display: grid) {
  .layout { display: grid; }
}

@supports not (display: grid) {
  .layout { display: flex; }
}
```

### Common Features to Detect

| Feature | Detection | Fallback |
|---------|-----------|----------|
| CSS Grid | `@supports (display: grid)` | Flexbox |
| Container Queries | `@supports (container-type: inline-size)` | Media queries |
| `fetch` API | `'fetch' in window` | XMLHttpRequest |
| WebP images | `<picture>` element with fallback | PNG/JPEG |
| CSS `has()` | `@supports selector(:has(*))` | JavaScript |
| View Transitions | `'startViewTransition' in document` | Instant navigation |

---

## Polyfill Policy

### Rules

1. **Don't polyfill by default.** Only add polyfills for features you actually use.
2. **Conditional loading.** Only load polyfills for browsers that need them.
3. **Size budget.** Total polyfill bundle < 20KB gzipped.
4. **Remove when baseline.** Once all Tier 1 browsers support a feature natively, remove the polyfill.
5. **Trust core-js and MDN data** for polyfill decisions.

### Conditional Loading

```javascript
// Modern approach: use browserslist + babel/core-js for automatic polyfilling
// Or manual conditional:
if (!('structuredClone' in window)) {
  await import('core-js/actual/structured-clone');
}
```

### Commonly Needed Polyfills (2024+)

| Feature | Polyfill Needed? |
|---------|-----------------|
| `fetch` | No (baseline since 2017) |
| `Promise` | No (baseline since 2015) |
| `Array.prototype.at()` | Rarely (Safari 15.4+, March 2022) |
| `structuredClone` | Rarely (baseline 2022) |
| `CSS :has()` | Cannot polyfill CSS in JS — use progressive enhancement |
| `Intl.Segmenter` | Yes, for Firefox (still partial as of 2024) |

---

## Testing Tools

| Tool | Best For | Type |
|------|----------|------|
| Playwright | Automated cross-browser testing | Chromium, Firefox, WebKit |
| BrowserStack | Real device/browser testing | Cloud, manual + automated |
| Sauce Labs | Enterprise CI integration | Cloud |
| LambdaTest | Budget-friendly | Cloud |
| Can I Use | Feature compatibility lookup | Reference |

### Playwright Multi-Browser Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

---

## Common Cross-Browser Issues

| Issue | Affected Browser | Solution |
|-------|-----------------|----------|
| Date parsing differences | Safari | Use ISO 8601 format, or date library |
| Scroll behavior | Safari (iOS) | `-webkit-overflow-scrolling: touch` |
| Form styling | Safari | Explicit styles, `-webkit-appearance: none` |
| Font rendering | All (differences) | System font stack or web fonts |
| CSS gap in flexbox | Older Safari | Margin fallback |
| `<dialog>` element | Older browsers | Polyfill or custom modal |
| Smooth scrolling | Safari | `scroll-behavior` with JS fallback |

---

## Progressive Enhancement

Build the core experience that works everywhere, then enhance for capable browsers.

```css
/* Base: works everywhere */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* Enhancement: better layout for modern browsers */
@supports (display: grid) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Enhancement: animations for browsers that support them */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 0.2s ease;
  }
  .card:hover {
    transform: translateY(-4px);
  }
}
```

---

## Anti-Patterns

- **User agent sniffing** — Browsers lie. Detect features, not identity.
- **"Works in Chrome"** — Chrome is ~65% of users. That's 35% potentially broken.
- **Polyfilling everything** — Bundle bloat. Only polyfill what you use.
- **Testing only on the latest version** — Your users may be a version behind.
- **CSS vendor prefixes everywhere** — Most are no longer needed. Use autoprefixer.
- **Ignoring Safari** — iOS users have no browser choice — it's all WebKit.
