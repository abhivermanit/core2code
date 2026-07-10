# Responsive Testing

## Principle

Responsive design isn't just "works on mobile." It means the interface is usable, readable, and functional at every viewport width. Test at breakpoints, between breakpoints, and on real devices.

---

## Breakpoints

### Standard Breakpoint System

| Name | Min Width | Target Devices |
|------|-----------|---------------|
| Mobile (sm) | 320px | iPhone SE, small Android |
| Mobile (md) | 375px | iPhone 12/13/14, Pixel |
| Tablet | 768px | iPad, Android tablets |
| Desktop (sm) | 1024px | Small laptops |
| Desktop (md) | 1280px | Standard laptops |
| Desktop (lg) | 1440px | Large monitors |
| Desktop (xl) | 1920px | Full HD monitors |

### Critical Test Points

- **320px** — Minimum supported width (content must not overflow)
- **375px** — Most common mobile width
- **768px** — Tablet / breakpoint between mobile and desktop
- **1024px** — Small desktop / large tablet landscape
- **1440px** — Common design target

---

## Device Testing Matrix

### Tier 1 (Must Test)

| Device | Viewport | OS | Browser |
|--------|----------|-----|---------|
| iPhone 14/15 | 390×844 | iOS 17 | Safari |
| iPhone SE | 375×667 | iOS | Safari |
| Samsung Galaxy S23 | 360×780 | Android 14 | Chrome |
| iPad (10th gen) | 820×1180 | iPadOS | Safari |
| MacBook Air 13" | 1440×900 | macOS | Chrome/Safari |
| Standard desktop | 1920×1080 | Windows | Chrome/Edge |

### Tier 2 (Should Test)

| Device | Viewport | OS | Browser |
|--------|----------|-----|---------|
| Pixel 7 | 412×915 | Android 13 | Chrome |
| iPad Pro 12.9" | 1024×1366 | iPadOS | Safari |
| Surface Pro | 1368×912 | Windows | Edge |
| 4K monitor | 3840×2160 (scaled) | Any | Any |

---

## Safe Areas

Mobile devices have notches, dynamic islands, home indicators, and rounded corners. Account for them.

```css
/* Use env() for safe areas */
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Ensure viewport-meta supports it */
/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */
```

### What to Check

- [ ] Content not obscured by notch/dynamic island
- [ ] Bottom navigation not hidden behind home indicator
- [ ] Landscape orientation accounts for camera cutout
- [ ] Rounded corners don't clip interactive elements

---

## Touch Targets

| Requirement | Minimum Size | Recommended |
|-------------|-------------|-------------|
| Touch target (WCAG) | 24×24px | 44×44px |
| Touch target (Apple HIG) | 44×44pt | — |
| Touch target (Material) | 48×48dp | — |
| Spacing between targets | 8px minimum | 12px |

```css
/* Ensure touch targets meet minimum size */
.button, .link, .interactive {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Increase tap target without changing visual size */
.small-icon-button::after {
  content: '';
  position: absolute;
  inset: -8px; /* Expands touch area */
}
```

---

## Viewport Testing

### Automated with Playwright

```typescript
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

viewports.forEach(({ name, width, height }) => {
  test(`layout is correct at ${name} (${width}×${height})`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/dashboard');

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(width);

    // Screenshot for visual comparison
    await expect(page).toHaveScreenshot(`dashboard-${name}.png`);
  });
});
```

### Manual Checks

- [ ] No horizontal scrollbar at any viewport
- [ ] Text is readable without zooming (min 16px body text on mobile)
- [ ] Navigation is accessible (hamburger menu on mobile, full nav on desktop)
- [ ] Forms are usable (labels visible, inputs full-width on mobile)
- [ ] Tables adapt (horizontal scroll or card layout on mobile)
- [ ] Images scale without distortion
- [ ] Modals fit within viewport
- [ ] Fixed/sticky elements don't cover content

---

## Orientation Testing

- [ ] Layout works in portrait AND landscape
- [ ] No content lost on orientation change
- [ ] No state lost on orientation change (form inputs preserved)
- [ ] Full-screen media (video, maps) handles both orientations
- [ ] Virtual keyboard doesn't break layout in landscape

---

## Typography at Scale

```css
/* Fluid typography that scales with viewport */
:root {
  font-size: clamp(14px, 1vw + 12px, 18px);
}

/* Ensure readability */
body {
  line-height: 1.5;
  max-width: 75ch; /* Optimal reading width */
}
```

### Rules

- Body text: minimum 16px on mobile
- Line length: 45-75 characters (max-width constraint)
- Heading scale reduces on mobile (h1 not 64px on 320px screen)
- Never use viewport units alone for font-size (breaks zoom)

---

## Anti-Patterns

- **Testing only at exact breakpoints** — Bugs often appear between breakpoints. Resize continuously.
- **Desktop-first development** — Mobile-first CSS is easier to scale up.
- **`overflow: hidden` on body** — Hides the problem (horizontal scroll) without fixing it.
- **Fixed-width containers** — Use percentage or max-width.
- **Assuming 16px = 1rem** — Users may have larger default font size.
- **Ignoring landscape mobile** — Many users browse in landscape.
