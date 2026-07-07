# Playbook: Build a Mobile App

Mobile apps operate in a hostile environment: unreliable networks, limited resources, and users who uninstall after one bad experience.

## Offline-First Architecture

### Core Principle

Design as if the network doesn't exist. Then add sync when it's available.

```typescript
// Data flow: UI → Local Store → Sync Engine → Server
interface SyncEngine {
  // Queue operations locally
  enqueue(operation: Operation): void;
  // Process queue when online
  sync(): Promise<SyncResult>;
  // Handle conflicts
  resolve(conflict: Conflict): Resolution;
}
```

### Local Storage Strategy

| Data Type | Storage | Sync Strategy |
|-----------|---------|---------------|
| User data (profile, settings) | SQLite/Realm | Sync on change, server wins |
| Content (posts, messages) | SQLite | Sync on pull, merge |
| Media (images, files) | File system + manifest | Lazy download, upload on WiFi |
| App state (UI, navigation) | In-memory + AsyncStorage | Don't sync |
| Credentials | Keychain/Keystore | Don't sync (server-issued) |

### Conflict Resolution

```typescript
// Last-write-wins (simplest)
function resolve(local: Record, remote: Record): Record {
  return local.updatedAt > remote.updatedAt ? local : remote;
}

// Field-level merge (better for forms)
function mergeFields(local: Record, remote: Record, base: Record): Record {
  const merged = { ...base };
  for (const key of Object.keys(base)) {
    if (local[key] !== base[key]) merged[key] = local[key]; // local changed
    else if (remote[key] !== base[key]) merged[key] = remote[key]; // remote changed
    // If both changed same field → conflict → ask user or pick latest
  }
  return merged;
}
```

### Offline Queue

```typescript
// Queue mutations when offline, replay when online
const offlineQueue: Operation[] = [];

async function createPost(post: Post) {
  // Optimistic: update local store immediately
  localStore.insert(post);
  updateUI();

  // Queue for sync
  offlineQueue.push({
    type: 'CREATE',
    entity: 'post',
    data: post,
    timestamp: Date.now(),
    retryCount: 0,
  });

  // Attempt immediate sync if online
  if (isOnline()) await processQueue();
}
```

## Push Notifications

### Permission Strategy

- Never ask for permission on first launch
- Ask after user has seen value (after onboarding, after first action)
- Explain WHY before the system prompt ("Get notified when someone replies")
- Respect "not now" — ask again later, not immediately
- Always provide in-app notification settings

### Notification Types

| Type | Priority | Grouping |
|------|----------|----------|
| Direct message | High | Per conversation |
| Activity on your content | Medium | Batch by time window |
| Marketing/promotional | Low | Max 1/day |
| Transactional (receipt, shipping) | High | Per transaction |
| System (security alert, required action) | Critical | Never grouped |

### Implementation

```typescript
// Server-side notification dispatch
async function sendPushNotification(userId: string, notification: Notification) {
  const devices = await getDeviceTokens(userId);
  const preferences = await getNotificationPreferences(userId);

  if (!preferences[notification.type].push) return; // respect preferences

  for (const device of devices) {
    await pushProvider.send({
      token: device.pushToken,
      title: notification.title,
      body: notification.body,
      data: notification.payload, // for deep linking
      badge: await getUnreadCount(userId),
      sound: notification.priority === 'high' ? 'default' : null,
    });
  }
}
```

## Deep Linking

### Universal Links / App Links

```
https://app.example.com/post/123
  → If app installed: open app to post 123
  → If not installed: open web version (or app store)
```

### Deep Link Routing

```typescript
// Handle incoming deep links
function handleDeepLink(url: string) {
  const route = parseDeepLink(url);

  switch (route.type) {
    case 'post':
      navigate('PostDetail', { id: route.id });
      break;
    case 'profile':
      navigate('Profile', { userId: route.id });
      break;
    case 'invite':
      handleInviteFlow(route.code);
      break;
    default:
      navigate('Home');
  }
}
```

### Deferred Deep Links

For users who don't have the app yet:
1. Click link → App Store
2. Install and open app
3. App retrieves the deferred link
4. Navigate to correct content

## App Store Considerations

### Release Process

```
Code complete → Internal testing → TestFlight/Beta → Review submission → Release
                                                        │
                                                        └── Rejection → Fix → Resubmit
```

### Review Guidelines (Avoid Rejections)

- No private API usage
- All purchases through in-app purchase (iOS 30% cut)
- No placeholder content or "coming soon" features
- Privacy policy required
- App must work without account (or demonstrate value first)
- No external payment links (iOS)
- Accurate screenshots and descriptions

### Versioning

```
Version: 1.2.3
  1 = Major (new features, UI overhaul)
  2 = Minor (new features, improvements)
  3 = Patch (bug fixes)

Build: 456 (always incrementing, never reset)
```

## Background Sync

### iOS Background Modes

- Background fetch (periodic, system-scheduled)
- Background processing (longer tasks, overnight)
- Push notification processing (silent pushes to trigger sync)

### Android WorkManager

```kotlin
val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES // minimum interval
)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
    )
    .build()

WorkManager.getInstance(context).enqueue(syncWork)
```

### Background Sync Rules

- Respect battery (only sync on WiFi for large data)
- Incremental sync (only changed records)
- Exponential backoff on failures
- Silent push to trigger important syncs
- Don't wake the device for non-urgent data

## Safe Areas and UI

### Layout Considerations

```css
/* iOS safe area insets */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Device Diversity

- Support multiple screen sizes (phone, tablet, foldable)
- Handle notches, rounded corners, camera cutouts
- Support both orientations (or lock to portrait with justification)
- Dynamic Type / font scaling support
- Dark mode support (not optional in 2024)
- Respect reduced motion preferences

## Performance

### Targets

| Metric | Target |
|--------|--------|
| Cold start | < 2 seconds |
| Navigation | < 300ms |
| List scroll | 60 FPS |
| Image load | Progressive, < 1s |
| Memory | < 150MB active |
| Battery | < 5% per hour of active use |

### Optimization Tactics

- Lazy load screens (code splitting)
- Virtualized lists (only render visible items)
- Image caching and progressive loading
- Minimize re-renders (memoization)
- Reduce bridge calls (React Native) or platform channel calls (Flutter)
- Profile with platform tools (Instruments, Android Profiler)

## Anti-Patterns

- **Assuming connectivity** — the app is useless without network = bad UX
- **Blocking UI on network calls** — show cached data immediately, refresh in background
- **Asking for all permissions upfront** — users deny everything. Ask contextually.
- **No offline feedback** — user taps button, nothing happens. Show that action is queued.
- **Ignoring safe areas** — content behind notch or system bars
- **No haptic/feedback** — mobile interactions need tactile response
- **Desktop patterns on mobile** — hover states, tiny tap targets, dense layouts
- **Enormous app size** — every 10MB reduces installs. Target < 50MB.
