# Mobile Testing

## Principle

Mobile is not a small desktop. It has unique interaction patterns (touch, gestures), connectivity challenges (offline, slow networks), system-level features (notifications, deep links), and lifecycle behavior (backgrounding, state restoration) that require dedicated testing.

---

## Touch Interactions

### What to Test

| Gesture | Test Cases |
|---------|-----------|
| Tap | Single tap registers accurately, no double-fire |
| Long press | Context menu / secondary action triggers correctly |
| Swipe | Horizontal (carousel, dismiss), vertical (scroll, pull-to-refresh) |
| Pinch/zoom | Maps, images scale correctly, UI remains usable |
| Drag | Reorderable lists, sliders, draggable elements |
| Multi-touch | Two-finger gestures don't conflict with single-finger |

### Touch-Specific Issues

- [ ] No hover-dependent interactions (mobile has no hover)
- [ ] Touch targets are ≥ 44×44px (see responsive-testing.md)
- [ ] No 300ms tap delay (use `touch-action: manipulation`)
- [ ] Scroll isn't blocked by gesture handlers
- [ ] Accidental touches near screen edges handled gracefully
- [ ] Input fields scroll into view above virtual keyboard
- [ ] Pull-to-refresh doesn't conflict with in-app scroll

---

## Gestures

### Gesture Conflict Prevention

```typescript
// Ensure swipe-to-dismiss doesn't conflict with horizontal scroll
const handleTouchMove = (e: TouchEvent) => {
  const deltaX = Math.abs(e.touches[0].clientX - startX);
  const deltaY = Math.abs(e.touches[0].clientY - startY);

  // Only treat as swipe if horizontal movement dominates
  if (deltaX > deltaY * 1.5 && deltaX > 10) {
    handleSwipeDismiss(e);
  }
};
```

### Test Matrix

- [ ] Swipe gestures don't block scrolling
- [ ] Back gesture (iOS swipe from left edge) works
- [ ] Android back button/gesture navigates correctly
- [ ] Gestures work for left-handed users
- [ ] Gesture animations complete smoothly (60fps)

---

## Offline Support

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| App opens with no network | Show cached data, indicate offline status |
| Network drops mid-operation | Queue operation, show pending state |
| Network returns | Sync queued operations, update UI |
| Conflict during sync | Show conflict resolution UI or auto-resolve |
| Long offline period (days) | Data still accessible, sync on reconnect |
| Slow/intermittent connection | Timeout handling, retry without duplicates |

### How to Test

```typescript
// Playwright: simulate offline
await page.context().setOffline(true);
await page.goto('/dashboard');
// Verify offline indicator shown
await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
// Verify cached data still displayed
await expect(page.locator('.order-list')).not.toBeEmpty();
```

### Manual Test Steps

1. Load app with network on, navigate through key screens (cache them)
2. Enable airplane mode
3. Navigate to cached screens — content should display
4. Perform an action (create/edit) — should queue
5. Disable airplane mode
6. Verify queued action syncs successfully
7. Verify no duplicate data created

---

## Notifications

### Test Scenarios

| Scenario | Expected |
|----------|----------|
| Permission prompt shown at appropriate time | Not immediately on first visit |
| Notification received in foreground | In-app banner or toast, not system notification |
| Notification received in background | System notification appears |
| Tapping notification | Opens correct screen with correct data |
| Notification with app killed | App opens to correct screen |
| Multiple notifications | Grouped appropriately |
| Permission denied | App works without notifications, offers re-prompt |

### Testing Checklist

- [ ] Permission requested at contextual moment (not app launch)
- [ ] Graceful handling of denied permissions
- [ ] Notifications arrive within expected timeframe
- [ ] Tap opens correct deep link target
- [ ] Badge count updates correctly
- [ ] Notification content is accurate and timely
- [ ] Silent/do-not-disturb mode respected
- [ ] Notification sounds appropriate (or silent)

---

## Deep Links

### What to Test

```
https://app.example.com/orders/ord-123
myapp://orders/ord-123
```

| Scenario | Expected |
|----------|----------|
| App installed, deep link tapped | Opens app to correct screen |
| App not installed, deep link tapped | Opens app store or web fallback |
| App in background, deep link tapped | Navigates to correct screen |
| Invalid/expired deep link | Shows helpful error, not crash |
| Deep link with authentication required | Redirect to login, then to target |
| Sharing a deep link | Generates correct URL |

### Test Matrix

- [ ] Universal links (iOS) / App links (Android) resolve correctly
- [ ] Custom scheme links work (`myapp://`)
- [ ] Links from email, SMS, social media all work
- [ ] Deferred deep links work (install then route)
- [ ] Deep link parameters passed correctly
- [ ] Deep links work when app is killed/backgrounded/foregrounded

---

## State Restoration

### Scenarios

| Trigger | Expected |
|---------|----------|
| App backgrounded and resumed | State preserved (scroll position, form inputs, navigation state) |
| App killed by OS (memory pressure) | State restored from persistence |
| Orientation change | Form inputs preserved, scroll position maintained |
| Phone call interrupts | Return to same state |
| Low memory warning | Non-critical state can be freed, critical state preserved |
| App update | User data preserved, no re-login required (unless security update) |

### Testing Steps

1. Fill out a complex form (multi-step, selections, text input)
2. Switch to another app for 5 minutes
3. Return — all form state should be preserved
4. Repeat with OS killing the app in background
5. Return — at minimum, navigate back to the correct screen

---

## Network Conditions to Test

| Condition | Simulation | Tool |
|-----------|-----------|------|
| No network | Airplane mode | Device/emulator |
| Slow 3G | 400kbps, 400ms latency | Chrome DevTools, Charles Proxy |
| Fast 3G | 1.5Mbps, 100ms latency | Chrome DevTools |
| Intermittent | Random packet loss | Network Link Conditioner (iOS), Charles |
| Switching (WiFi ↔ cellular) | Toggle manually | Device |
| Captive portal | Behind login page | Manual |

---

## Platform-Specific Testing

### iOS

- [ ] Safe area insets (notch, dynamic island, home indicator)
- [ ] Swipe-back gesture works
- [ ] Status bar interaction (scroll-to-top on tap)
- [ ] Keyboard avoidance (content scrolls above keyboard)
- [ ] Universal links configured and working
- [ ] App Transport Security (HTTPS required)

### Android

- [ ] Back button/gesture navigates correctly
- [ ] Material Design patterns followed
- [ ] Notification channels configured
- [ ] App links verified
- [ ] Various screen densities handled (ldpi to xxxhdpi)
- [ ] Split-screen / foldable device support

---

## Anti-Patterns

- **Testing only on emulators** — Real devices have different performance, touch response, and edge cases.
- **Ignoring the keyboard** — Virtual keyboard resizes viewport. Test form interactions.
- **No offline testing** — Mobile connections are unreliable. Plan for it.
- **Assuming fast network** — Test on 3G. If it works on 3G, it works everywhere.
- **No state restoration** — Users don't "close" mobile apps. They get backgrounded and killed.
- **Desktop interaction patterns on mobile** — No hover states, no right-click, no tooltips.
