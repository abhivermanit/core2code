# Git Workflow

## Commit Messages

Follow Conventional Commits:

```
type(scope): short description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| refactor | Code refactoring |
| test | Adding/updating tests |
| chore | Maintenance tasks |
| perf | Performance improvement |
| ci | CI/CD changes |

### Examples

```
feat(auth): add OAuth2 login flow
fix(api): handle null response from upstream
docs(readme): update installation instructions
refactor(db): extract query builder module
```

## Pull Requests

- Keep PRs small (< 400 lines)
- Descriptive title (same as commit message format)
- Link to issue/ticket
- Include testing instructions
- Add screenshots for UI changes

## Merge Strategy

- Squash merge for feature branches
- Merge commit for release branches
- Rebase for keeping branches up to date
