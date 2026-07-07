# Coding Standards

## General

- Use consistent formatting (enforce via linter/formatter).
- Prefer descriptive names over comments.
- Keep functions short (< 30 lines as a guideline).
- Limit file length (< 300 lines as a guideline).
- Avoid deep nesting (max 3 levels).

## Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Methods**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase` (no `I` prefix)
- **Enums**: `PascalCase` with `PascalCase` members

## Error Handling

- Use typed errors with error codes.
- Never swallow errors silently.
- Provide context in error messages.
- Use `Result<T, E>` patterns where appropriate.

## Comments

- Explain **why**, not **what**.
- Document public APIs with JSDoc/TSDoc.
- Remove dead/commented-out code.

## Imports

- Use explicit named imports.
- Group: external → internal → relative.
- Avoid circular dependencies.

## Testing

- Test public behavior, not implementation details.
- Use descriptive test names that read like specifications.
- Follow Arrange-Act-Assert pattern.
