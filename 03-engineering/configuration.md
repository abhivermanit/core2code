# Configuration Management

## Principle

Configuration is anything that varies between environments. It lives outside the code, is validated at startup, and never contains secrets in plaintext.

---

## 12-Factor Config

Follow [12-Factor App](https://12factor.net/config) methodology:

1. **Store config in environment variables** — Not in code, not in config files checked into git.
2. **Strict separation** — Code doesn't change between deploys; config does.
3. **No environment-specific branches** — Same artifact, different config.

---

## Environment Variables

### Naming Convention

```bash
# Format: APP_SECTION_KEY
APP_DATABASE_URL=postgres://...
APP_REDIS_HOST=localhost
APP_REDIS_PORT=6379
APP_JWT_SECRET=...
APP_LOG_LEVEL=info
APP_FEATURE_NEW_CHECKOUT=true
```

### Rules

| Rule | Rationale |
|------|-----------|
| Prefix with app name (`APP_`) | Avoid conflicts with system vars |
| UPPER_SNAKE_CASE | Universal convention for env vars |
| Group by section | `APP_DATABASE_*`, `APP_REDIS_*`, `APP_AUTH_*` |
| No nested structures | Env vars are flat key-value pairs |
| Boolean values: `true`/`false` | Not `1`/`0`, not `yes`/`no` |

---

## .env Files

### Usage

| File | Purpose | In Git? |
|------|---------|---------|
| `.env.example` | Documents all required variables (no real values) | Yes |
| `.env` | Local development values | No (gitignored) |
| `.env.test` | Test environment overrides | Sometimes |
| `.env.production` | Never exists locally | Never |

### .env.example

```bash
# Database
APP_DATABASE_URL=postgres://user:pass@localhost:5432/myapp_dev
APP_DATABASE_POOL_SIZE=10

# Auth
APP_JWT_SECRET=your-secret-here
APP_JWT_EXPIRY_SECONDS=3600

# External Services
APP_STRIPE_SECRET_KEY=sk_test_...
APP_SENDGRID_API_KEY=SG...

# Feature Flags
APP_FEATURE_NEW_CHECKOUT=false
```

**Rule:** `.env.example` must always be up to date. If you add a new env var, update the example file in the same PR.

---

## Config Validation at Startup

Never let the app start with invalid or missing config. Fail fast, fail loud.

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().min(1).max(50).default(10),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY_SECONDS: z.coerce.number().default(3600),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

### Validation Rules

- Parse and validate ALL config at startup (not on first use)
- Crash immediately on invalid config — don't limp along
- Provide clear error messages about what's missing/wrong
- Use defaults for non-critical values only
- Never default secrets or connection strings

---

## Never Hardcode

| What | Where It Belongs |
|------|-----------------|
| Database URLs | Environment variable |
| API keys | Secret manager / env var |
| Timeouts | Config with sensible defaults |
| Feature flags | Config or flag service |
| Port numbers | Environment variable with default |
| Email addresses | Config (not buried in code) |
| Magic numbers | Named constants in config |
| File paths | Config or convention-based |

```typescript
// BAD
const timeout = 5000;
const apiUrl = 'https://api.stripe.com';
if (retries > 3) { ... }

// GOOD
const timeout = config.httpTimeoutMs;       // From validated config
const apiUrl = config.stripeApiUrl;         // From env var
if (retries > config.maxRetryAttempts) { ... }
```

---

## Config Hierarchy (Precedence)

From highest to lowest priority:

1. Command-line arguments
2. Environment variables
3. `.env` file (local only, via `dotenv`)
4. Config file defaults
5. Application code defaults

---

## Secrets vs Config

| Type | Example | Storage |
|------|---------|---------|
| Config | Port, log level, timeout | Env vars, config files |
| Secrets | API keys, DB passwords, tokens | Secret manager (Vault, AWS Secrets Manager, etc.) |

**Rule:** If rotating the value requires no code change, it's config. If leaking the value is a security incident, it's a secret.

See `../04-security/secrets.md` for secret management details.

---

## Anti-Patterns

- **Checking `.env` into git** — Secrets leak. Use `.env.example` instead.
- **Config that changes behavior in ways that aren't tested** — If a config value can break the app, test with that value.
- **"It works on my machine" config** — If your setup requires special env vars, document them.
- **Reading `process.env` everywhere** — Load once at startup, pass config object via DI.
- **Defaulting secrets to empty string** — Crash instead. An empty secret is worse than no secret.
