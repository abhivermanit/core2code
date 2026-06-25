# Security Policy

## Secrets & Credentials

- All secrets, API keys, and credentials live in `.env` (gitignored) or a secrets manager.
- Never commit secrets to this repository — not even in branches or commit history.
- Use `.env.example` to document required environment variables without values.
- If a secret is ever exposed: rotate it immediately, then audit the git history.

## Reporting a Vulnerability

If you discover a security issue in this project, please report it privately to the repository owner rather than opening a public issue.

## Dependencies

- Review dependency updates before merging.
- Pin major versions in production.
- Run `npm audit` (or equivalent) as part of CI.

## AI-Generated Code

Per the project SOP: all AI-generated code is treated as untrusted until it runs and all imports/APIs are verified real. No AI-generated code goes to production without review.
