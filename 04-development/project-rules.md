# Project Rules

## Code Organization

- One concern per file
- Feature-based directory structure
- Shared code in `packages/` or `lib/`
- No business logic in controllers/routes

## Dependencies

- Pin exact versions in production
- Review all new dependencies before adding
- Prefer well-maintained packages with active communities
- Run `npm audit` / `pnpm audit` regularly

## Environment

- Never commit secrets
- Use `.env.example` for documenting required variables
- All config via environment variables (12-factor)
- Separate config per environment (dev, staging, prod)

## Communication

- Decisions in ADRs
- Async-first communication
- Document meeting outcomes
- Code speaks louder than docs (but docs matter)

## Quality Gates

- All PRs require at least one review
- CI must pass before merge
- No force-pushes to main
- No direct commits to main
