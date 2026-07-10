# Folder Structure

## Principle

Your folder structure should communicate intent. A new developer should be able to navigate the codebase within minutes, not hours.

---

## Feature-Based (Domain-First)

Organize by business capability. Each feature owns its routes, components, services, and tests.

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── billing/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   └── projects/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── infrastructure/
│   ├── api-client.ts
│   ├── logger.ts
│   └── config.ts
└── app.ts
```

**When to use:**
- Teams own features end-to-end
- Product has distinct bounded contexts
- Team size > 5 developers
- Features rarely share internal logic

**Benefits:** High cohesion, low coupling between features, easy to delete/extract a feature, scales with team size.

---

## Layer-Based (Technical-First)

Organize by technical concern. All controllers together, all services together.

```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── billing.controller.ts
│   └── projects.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── billing.service.ts
│   └── projects.service.ts
├── repositories/
│   ├── user.repository.ts
│   └── project.repository.ts
├── models/
│   ├── user.model.ts
│   └── project.model.ts
├── middleware/
├── utils/
└── types/
```

**When to use:**
- Small applications (< 10 routes)
- Solo developer or very small team (2–3)
- CRUD-heavy apps with minimal business logic
- Early-stage prototypes

**Benefits:** Simple mental model, easy to find files by type, works well when features are small.

---

## Hybrid (Recommended for Most Projects)

Start layer-based, graduate to feature-based as complexity grows. Keep shared infrastructure in a `shared/` or `lib/` folder.

```
src/
├── features/           # Complex domains get their own folder
│   ├── billing/
│   └── workflow-engine/
├── routes/             # Simple CRUD stays flat
│   ├── users.ts
│   └── health.ts
├── lib/                # Shared infrastructure
│   ├── db.ts
│   ├── logger.ts
│   └── errors.ts
└── types/
```

---

## Rules

| Rule | Rationale |
|------|-----------|
| No circular imports between features | Features must communicate via explicit interfaces |
| `index.ts` is the public API of a folder | Internal files are private; import from the barrel |
| Tests live next to source (`*.test.ts`) | Reduces navigation cost, ensures coverage visibility |
| Max folder depth: 4 levels | Deeper nesting signals a design smell |
| `shared/` must not import from `features/` | Dependency direction is always inward |

---

## Anti-Patterns

- **"components" folder with 200 files** — Split by feature or atomic design level.
- **"utils" as a junk drawer** — Every util should belong to a domain or be promoted to `lib/`.
- **Mirroring folder structure in tests/** — Co-locate tests instead.
- **Empty index.ts barrel files** — Only create barrels when there are multiple exports to manage.

---

## Migration Strategy

1. Identify the feature with the most files
2. Move all related files into a `features/<name>/` folder
3. Create an `index.ts` public API
4. Update imports (automated with IDE refactoring)
5. Repeat for the next-largest feature
6. What remains in the flat structure is your `shared/` layer
