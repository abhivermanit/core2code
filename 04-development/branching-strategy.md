# Branching Strategy

## Branch Types

| Branch | Purpose | Lifetime | Merges To |
|--------|---------|----------|-----------|
| `main` | Production code | Permanent | — |
| `develop` | Integration branch | Permanent | `main` |
| `feature/*` | New features | Short-lived | `develop` |
| `fix/*` | Bug fixes | Short-lived | `develop` |
| `hotfix/*` | Production fixes | Short-lived | `main` + `develop` |
| `release/*` | Release preparation | Short-lived | `main` + `develop` |

## Flow

```
main ─────────────────────────────────────────────
  │                                      ↑
  └── develop ───────────────────────────┤
        │         ↑        ↑             │
        ├── feature/xyz ───┘             │
        └── feature/abc ────────┘        │
                                         │
  └── hotfix/critical ───────────────────┘
```

## Rules

- `main` is always deployable.
- Feature branches branch from `develop`.
- Hotfixes branch from `main`.
- Delete branches after merge.
- No long-lived feature branches (> 1 week).

## Simplified (Trunk-Based)

For smaller teams:

```
main ────────────────────────────────────
  │      ↑       ↑       ↑
  ├── feat/a ────┘       │
  ├── feat/b ────────────┘
  └── fix/c ─────────────────────────┘
```

- Short-lived branches (< 2 days)
- Feature flags for incomplete work
- Direct merge to main
