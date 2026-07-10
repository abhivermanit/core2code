# Responsive UI Checklist

A responsive UI works on every screen. Not just the one on your desk.

## Breakpoints

- [ ] Defined and documented breakpoints (sm, md, lg, xl)
- [ ] Mobile-first approach (base styles are mobile, media queries add for larger)
- [ ] Content readable at every breakpoint (no overflow, no truncation without indication)
- [ ] Navigation transforms appropriately (hamburger menu on mobile, full nav on desktop)
- [ ] Tables have mobile alternative (cards, horizontal scroll, or collapsed rows)
- [ ] Forms stack vertically on mobile (not side-by-side inputs)
- [ ] Modals become full-screen on mobile (or bottom sheets)
- [ ] Images scale and don't overflow container

## Common Breakpoints

```css
/* Mobile first */
.container { /* mobile styles (default) */ }

@media (min-width: 640px) { /* sm: large phone / small tablet */ }
@media (min-width: 768px) { /* md: tablet */ }
@media (min-width: 1024px) { /* lg: desktop */ }
@media (min-width: 1280px) { /* xl: large desktop */ }
```

## Touch Targets

- [ ] All interactive elements minimum 44x44px (Apple HIG) / 48x48dp (Material)
- [ ] Spacing between tap targets prevents mis-taps (minimum 8px gap)
- [ ] Links within text have sufficient padding
- [ ] Close buttons (X) are large enough to tap easily
- [ ] Form inputs have adequate height on mobile
- [ ] Dropdown options are tall enough for finger selection
- [ ] Swipe gestures have visual affordance (handle, arrow)

## Safe Areas

- [ ] Content respects device notch/camera cutout
- [ ] Bottom navigation clears home indicator (iOS) / navigation bar (Android)
- [ ] env(safe-area-inset-*) used for edge-to-edge layouts
- [ ] Fixed elements (headers, footers) account for safe areas
- [ ] Landscape orientation handles left/right safe areas
- [ ] Content doesn't hide behind rounded corners on modern devices

```css
.fixed-bottom {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.header {
  padding-top: calc(16px + env(safe-area-inset-top));
}
```

## Orientation

- [ ] Layout works in both portrait and landscape
- [ ] No content is inaccessible in either orientation
- [ ] If orientation is locked, user is informed why
- [ ] Video/media players support landscape full-screen
- [ ] Keyboard appearance doesn't hide form fields
- [ ] Split-view and multitasking supported (iPad, desktop windows)

## Font Scaling

- [ ] Text uses relative units (rem, em) not fixed pixels
- [ ] Layout doesn't break when font size is increased 200%
- [ ] Important text remains visible at maximum system font size
- [ ] Line heights are proportional (not fixed pixel values)
- [ ] Containers expand to fit larger text (don't clip or overflow)
- [ ] Tested with browser zoom at 200% (WCAG requirement)

## Typography

- [ ] Body text minimum 16px on mobile (prevents iOS zoom on input focus)
- [ ] Line length 45-75 characters on desktop (max-width on text containers)
- [ ] Sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] Heading hierarchy makes sense (h1 → h2 → h3, not just visual)
- [ ] Text wraps properly (no horizontal scrolling for text content)

## Images and Media

- [ ] Images have explicit width/height (prevent layout shift)
- [ ] Responsive images served (srcset/sizes for different screens)
- [ ] Images lazy-loaded below the fold
- [ ] Videos don't autoplay on mobile (bandwidth, user preference)
- [ ] Image aspect ratios maintained (no stretching/squishing)
- [ ] WebP/AVIF with fallback for older browsers
- [ ] Alt text for all meaningful images

## Layout

- [ ] No horizontal scrollbar at any breakpoint
- [ ] Flexbox/Grid used instead of float (modern layout)
- [ ] Content hierarchy clear at every size
- [ ] Adequate whitespace on all screen sizes
- [ ] Cards and grid items reflow (not shrink to unusable size)
- [ ] Sidebar collapses to bottom or overlay on mobile
- [ ] Footer doesn't dominate viewport on mobile

## Forms

- [ ] Input type matches content (email, tel, number, url — triggers correct mobile keyboard)
- [ ] Labels visible (not just placeholder text)
- [ ] Error messages visible near the field (not just at top of form)
- [ ] Form doesn't require horizontal scrolling
- [ ] Submit button always visible (not hidden below keyboard)
- [ ] Date pickers work on mobile (native when possible)
- [ ] Autocomplete attributes set correctly

## Testing Devices

- [ ] iPhone SE (smallest common iPhone, 375px)
- [ ] iPhone 14/15 (standard, 390px)
- [ ] iPad (768px portrait, 1024px landscape)
- [ ] Android small (360px)
- [ ] 1920x1080 desktop
- [ ] 2560x1440 large desktop
- [ ] Browser zoom at 150% and 200%
