# Versioning

Versioning communicates change. Done right, consumers know exactly what to expect. Done wrong, every update is a surprise.

## API Versioning

### Strategy: URL Path Versioning

```
GET /api/v1/users
GET /api/v2/users
```

**Why path versioning wins:**
- Obvious and visible in logs, docs, and debugging
- Easy to route at the infrastructure level
- No ambiguity about which version a client is using
- Simple to deprecate and sunset

### Alternative: Header Versioning

```
Accept: application/vnd.api+json; version=2
```

Use only when URL versioning is impractical (GraphQL, RPC).

### When to Create a New API Version

**Do version (MAJOR):**
- Removing an endpoint
- Removing a required field from response
- Changing the type of an existing field
- Changing error response format
- Changing authentication mechanism

**Don't version (additive, backward compatible):**
- Adding a new endpoint
- Adding an optional field to response
- Adding an optional query parameter
- Adding a new error code (if clients handle unknowns)
- Performance improvements

### API Deprecation Process

```
1. Announce deprecation (6+ months before removal)
2. Add Deprecation header to responses
3. Add Sunset header with removal date
4. Monitor usage of deprecated version
5. Contact remaining consumers directly
6. Remove when usage is zero (or grace period expires)
```

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Jun 2025 00:00:00 GMT
Link: <https://api.example.com/v2/docs>; rel="successor-version"
```

### Running Multiple Versions

```
/api/v1/* → v1 handlers (maintenance only)
/api/v2/* → v2 handlers (active development)
```

**Rules:**
- Bug fixes apply to all supported versions
- New features only go in latest version
- Maximum 2 live versions at a time (current + previous)
- Previous version gets 12 months of support after new version launches

## Schema Versioning (Database)

### Migration Naming

```
YYYYMMDDHHMMSS_description.sql

20240315120000_create_users_table.sql
20240316090000_add_email_to_users.sql
20240320140000_create_orders_table.sql
```

### Rules

- Migrations are immutable once applied to any shared environment
- Never edit a migration that has run in staging or production
- Always write both UP and DOWN migrations
- Test down migrations in CI

### Breaking Schema Changes

Use the expand-contract pattern:

```
Phase 1 (Expand): Add new column/table alongside old
Phase 2 (Migrate): Backfill data, update code to write to both
Phase 3 (Contract): Remove old column/table after all reads use new
```

## Library Versioning

Follow SemVer strictly. See [release-strategy.md](./release-strategy.md) for details.

### Publishing Checklist

- [ ] Version bumped according to SemVer
- [ ] Changelog updated
- [ ] Types exported correctly
- [ ] Peer dependencies specified (not bundled)
- [ ] Minimum supported runtime version documented
- [ ] Breaking changes have migration guide

### Dependency Ranges

```json
{
  "dependencies": {
    "lodash": "4.17.21"         // Exact: you control updates
  },
  "peerDependencies": {
    "react": "^18.0.0"          // Range: consumer controls
  }
}
```

**For applications:** Use exact versions. You control when to update.
**For libraries:** Use ranges for peer deps. Let consumers choose compatible versions.

## Breaking Changes Communication

### Before the Change

1. Deprecation notice in current version
2. Migration guide published
3. Timeline communicated (minimum 1 major version cycle)
4. Codemod or automated migration tool if possible

### The Change

1. Major version bump
2. Changelog clearly states what broke and why
3. Before/after examples in migration guide
4. Old version still receives security patches for defined period

### After the Change

1. Monitor adoption of new version
2. Support consumers migrating
3. Eventually sunset old version (with notice)

## Version Pinning Strategy

| Context | Strategy | Rationale |
|---------|----------|-----------|
| Application deps | Exact (lock file) | Reproducible builds |
| Library peer deps | Range (^) | Consumer flexibility |
| CI tools | Exact | Reproducible pipelines |
| Docker base images | Specific tag | Security, reproducibility |
| Infrastructure | Exact (Terraform lock) | Prevent drift |

## Anti-Patterns

- **No versioning** — consumers can't depend on stability
- **v0.x forever** — shipping to production without committing to stability
- **Breaking changes in minor versions** — violates SemVer contract
- **Too many live versions** — maintenance burden grows exponentially
- **Versioning internal services** — between your own services, use contracts and feature flags instead
- **Calendar versioning for APIs** — CalVer (2024.03) communicates nothing about compatibility
