# API Security

## Principle

APIs are the front door to your application. Secure them by default: encrypt everything, validate everything, limit everything, and expose nothing unnecessarily.

---

## HTTPS Everywhere

- All traffic over TLS 1.2+ (preferably TLS 1.3)
- No HTTP endpoints. Redirect HTTP → HTTPS at the edge.
- TLS termination at load balancer/CDN is acceptable, but internal traffic should also be encrypted in zero-trust environments.
- Certificate auto-renewal (Let's Encrypt, AWS ACM)
- Monitor certificate expiration

---

## HSTS (HTTP Strict Transport Security)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- `max-age=31536000` — Browser remembers HTTPS-only for 1 year
- `includeSubDomains` — Applies to all subdomains
- `preload` — Submit to browser preload lists (cannot be easily undone)
- Deploy without `preload` first, add after confirming no HTTP dependencies

---

## Content Security Policy (CSP)

Prevent XSS by controlling what content can execute.

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

### Key Directives

| Directive | Purpose |
|-----------|---------|
| `default-src 'self'` | Block everything not explicitly allowed |
| `script-src 'self'` | Only load scripts from same origin (no inline) |
| `frame-ancestors 'none'` | Prevent clickjacking (replaces X-Frame-Options) |
| `base-uri 'self'` | Prevent base tag injection |
| `form-action 'self'` | Forms only submit to same origin |

### For APIs (No HTML Response)

```
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
```

---

## CORS (Cross-Origin Resource Sharing)

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.example.com',
      'https://admin.example.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 86400, // Preflight cache: 24 hours
};
```

### Rules

| Rule | Rationale |
|------|-----------|
| Never use `Access-Control-Allow-Origin: *` with credentials | Credential leaks |
| Explicit allowlist of origins | Don't trust regex for origin validation |
| Restrict methods to what's actually needed | Reduce attack surface |
| Set `maxAge` for preflight caching | Performance |

---

## Secure Cookies

```typescript
const cookieOptions = {
  httpOnly: true,       // Not accessible via JavaScript
  secure: true,         // HTTPS only
  sameSite: 'strict',   // No cross-site sending (or 'lax' for navigation)
  path: '/',
  maxAge: 3600,         // 1 hour
  domain: '.example.com',
};
```

| Attribute | Required | Purpose |
|-----------|----------|---------|
| `httpOnly` | Yes | Prevents XSS from stealing cookies |
| `secure` | Yes | Only sent over HTTPS |
| `sameSite` | Yes | Prevents CSRF (use 'strict' or 'lax') |
| `path` | Recommended | Limit cookie scope |
| `maxAge` | Yes | Don't use session cookies for auth |

---

## Rate Limiting

See `rate-limiting.md` for comprehensive patterns.

Minimum requirements:
- Global rate limit (e.g., 1000 req/min per IP)
- Endpoint-specific limits (login: 5/min, API: 100/min)
- Authenticated user limits (higher than anonymous)
- Return `429 Too Many Requests` with `Retry-After` header

---

## Request Validation

Validate every input on every request. Trust nothing from the client.

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(50),
  shippingAddressId: z.string().uuid(),
  couponCode: z.string().max(20).optional(),
});

// Middleware
function validate(schema: z.ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid request', result.error.flatten().fieldErrors);
    }
    req.validated = result.data;
    next();
  };
}
```

### Validate

- Request body (POST/PUT/PATCH)
- Query parameters
- Path parameters
- Headers (custom headers used in business logic)
- Content-Type header matches expected format
- Content-Length within limits

---

## Additional Security Headers

```typescript
// Helmet.js or manual headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',           // Prevent MIME sniffing
  'X-Frame-Options': 'DENY',                     // Prevent clickjacking (legacy, use CSP)
  'X-XSS-Protection': '0',                       // Disabled (outdated, can cause issues)
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cache-Control': 'no-store',                   // For API responses with sensitive data
};
```

---

## API Response Security

- Never return more data than needed (don't expose internal IDs, timestamps, or metadata)
- Strip `null` fields — don't reveal database schema
- Consistent error format (code + message, never stack traces)
- Pagination with limits (prevent data dumping)
- No `Server` header (don't advertise technology stack)

---

## Checklist

- [ ] TLS 1.2+ on all endpoints
- [ ] HSTS header with long max-age
- [ ] CSP header configured
- [ ] CORS restricted to allowed origins
- [ ] Cookies: httpOnly, secure, sameSite
- [ ] Rate limiting on all endpoints
- [ ] Request body validation with schema
- [ ] Security headers (X-Content-Type-Options, etc.)
- [ ] No sensitive data in URLs (query params)
- [ ] API versioning for backward-compatible changes
- [ ] Request size limits configured
- [ ] Timeout on all upstream requests
