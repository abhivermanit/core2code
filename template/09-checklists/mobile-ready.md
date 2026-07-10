# Mobile Readiness Checklist

Mobile users are the majority. If your app doesn't work well on phones, it doesn't work well for most people.

## Offline Capability

- [ ] App shows meaningful content when offline (cached data)
- [ ] User knows they're offline (visual indicator, not a crash)
- [ ] Actions taken offline are queued and synced when online
- [ ] Conflicting changes handled gracefully (last-write-wins or merge)
- [ ] Offline data has TTL (stale data clearly indicated)
- [ ] Sync status visible to user (last synced: 5 min ago)
- [ ] Large files only download on WiFi (or ask user)
- [ ] Network transitions (WiFi → cellular) don't break state

## Gestures and Interactions

- [ ] Pull-to-refresh on scrollable lists
- [ ] Swipe actions where appropriate (dismiss, archive, delete)
- [ ] Long-press for context menu (don't hide essential actions behind it)
- [ ] Pinch-to-zoom on images and maps
- [ ] Back gesture/button works correctly (doesn't close app unexpectedly)
- [ ] Scroll behavior is smooth (60fps, no jank)
- [ ] Haptic feedback on important actions (success, error, selection)
- [ ] No hover-only interactions (hover doesn't exist on touch)

## Push Notifications

- [ ] Permission requested contextually (not on first launch)
- [ ] User can control notification types in settings
- [ ] Notifications are actionable (tap → relevant screen)
- [ ] Deep link in notification opens correct content
- [ ] Notification grouping for high-volume events
- [ ] Silent/background notifications for data sync
- [ ] Badge count accurate and cleared on view
- [ ] Notification channels configured (Android)
- [ ] Critical alerts use appropriate priority level

## Performance

- [ ] Cold start < 2 seconds
- [ ] Warm start < 500ms
- [ ] Screen transitions < 300ms
- [ ] Scroll at 60fps (no dropped frames)
- [ ] Images lazy-loaded and appropriately sized
- [ ] Memory usage < 150MB active
- [ ] No memory leaks (test with extended use)
- [ ] Battery usage reasonable (< 5% per hour of active use)
- [ ] Network usage minimized (compressed payloads, delta sync)
- [ ] Background activity minimal when app is backgrounded

## Accessibility

- [ ] VoiceOver (iOS) / TalkBack (Android) works for all screens
- [ ] Semantic labels on all interactive elements
- [ ] Focus order is logical (top-to-bottom, left-to-right)
- [ ] Custom components have appropriate accessibility roles
- [ ] Color is not the only indicator of state (use icons, text, pattern)
- [ ] Minimum contrast ratio 4.5:1 (text), 3:1 (large text, UI components)
- [ ] Dynamic type supported (text scales with system settings)
- [ ] Animations respect "reduce motion" preference
- [ ] Touch targets minimum 44x44pt (iOS) / 48x48dp (Android)
- [ ] No time-dependent interactions without accommodation

## App Lifecycle

- [ ] App state preserved on background/foreground transition
- [ ] Long background → re-authenticate gracefully (not crash)
- [ ] Data refreshed on foreground (if stale)
- [ ] In-progress forms preserved if app is backgrounded
- [ ] Pending uploads resume after interruption
- [ ] Deep links work when app is cold-started
- [ ] App handles being killed by OS (low memory) gracefully
- [ ] Force update mechanism for critical versions

## Camera and Media

- [ ] Camera permission requested only when needed
- [ ] Photo library access scoped (selected photos only on iOS 14+)
- [ ] Image upload compresses appropriately (not sending 12MB photos)
- [ ] Video recording respects storage limits
- [ ] Media playback handles audio session correctly (other apps, calls)
- [ ] Downloaded media stored efficiently (cache vs. persistent)

## Security (Mobile-Specific)

- [ ] Certificate pinning for critical endpoints (optional but recommended)
- [ ] Sensitive data not stored in plain text (use Keychain/Keystore)
- [ ] Screen content hidden in app switcher (for sensitive apps)
- [ ] Clipboard cleared after password paste (timeout)
- [ ] Jailbreak/root detection (for high-security apps)
- [ ] Biometric authentication for sensitive actions
- [ ] No sensitive data in local notifications

## Network Handling

- [ ] Graceful degradation on slow networks (3G, spotty connectivity)
- [ ] Request timeouts appropriate (not 30s for a simple query)
- [ ] Retry with exponential backoff (not immediate hammering)
- [ ] Large downloads/uploads are resumable
- [ ] Network type awareness (WiFi vs. cellular for large transfers)
- [ ] Connection change doesn't drop pending operations
- [ ] API responses compressed (gzip/brotli)

## Testing

- [ ] Tested on smallest supported screen (iPhone SE / small Android)
- [ ] Tested on largest supported screen (Pro Max / tablet)
- [ ] Tested on oldest supported OS version
- [ ] Tested with slow network simulation (3G)
- [ ] Tested with airplane mode toggle during operations
- [ ] Tested with system font scaled to maximum
- [ ] Tested with dark mode enabled
- [ ] Tested with VoiceOver/TalkBack
- [ ] Memory profiled during extended use session
