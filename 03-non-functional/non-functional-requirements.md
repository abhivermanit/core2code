# Non-Functional Requirements (NFR)

> This document defines the engineering, security, operational, and quality standards that every application must satisfy. These requirements are independent of business features and apply throughout the software lifecycle.

---

# 1. Security

## Authentication
- Use a managed authentication provider.
- Never implement custom authentication or password storage.
- Authentication must be enforced server-side.
- Sessions must be secure and expire appropriately.

## Authorization
- Apply least-privilege access.
- Implement Role-Based Access Control (RBAC) where applicable.
- Verify authorization on every protected endpoint.
- Never trust client-side permissions.

## Data Isolation
- Enable Row-Level Security (RLS) for all user-owned data.
- Prevent IDOR (Insecure Direct Object Reference).
- Test authorization by modifying resource IDs.

## Secrets Management
- No secrets in source code.
- Store secrets using environment variables or a secret manager.
- Rotate secrets periodically.
- Immediately revoke compromised credentials.

## API Security
- HTTPS only.
- Enable HSTS.
- Apply Content Security Policy.
- Configure CORS correctly.
- Use secure cookies where applicable.

## Input Validation
- Validate every request server-side.
- Sanitize all user-generated content.
- Reject invalid input by default.
- Prevent:
  - SQL Injection
  - XSS
  - Command Injection
  - Path Traversal

## Abuse Protection
- Backend rate limiting.
- CAPTCHA on public endpoints.
- Request throttling.
- IP blocking where appropriate.

## File Upload Security
- Validate MIME type.
- Validate file extension.
- Enforce size limits.
- Virus scan uploaded files.
- Store outside executable directories.

## Dependency Security
- Verify packages before installation.
- Reject suspicious or newly published packages unless approved.
- Enable automated vulnerability scanning.
- Keep dependencies updated.

## Logging Security
- Never log:
  - Passwords
  - API Keys
  - Tokens
  - Personal data
- Remove stack traces from production responses.

---

# 2. Architecture

- Modular architecture.
- Clear separation of concerns.
- Dependency injection where appropriate.
- Stateless APIs whenever possible.
- Versioned APIs.
- No business logic inside UI components.

---

# 3. Performance

## Response Time

Target:

- API P95 < 300ms
- Page load < 2s
- Time to Interactive < 3s

## Optimization

- Pagination
- Lazy loading
- Database indexing
- Query optimization
- Image optimization
- Compression
- CDN support
- Caching strategy

---

# 4. Reliability

- Graceful error handling.
- Retry transient failures.
- Circuit breakers for external services.
- Health check endpoints.
- Background jobs for long-running tasks.
- Idempotent operations where required.

Target uptime:

> 99.9%

---

# 5. Scalability

Application must support:

- Horizontal scaling
- Stateless services
- Load balancing
- Queue-based processing
- Distributed caching
- Database read replicas (future)

---

# 6. Database

- Primary keys on every table.
- Foreign key constraints.
- Index frequently queried columns.
- Soft delete where appropriate.
- Automated migrations.
- Backup strategy.
- Restore procedure tested.

---

# 7. Observability

## Logging

Structured logs including:

- Timestamp
- Request ID
- User ID (where appropriate)
- Service
- Severity

## Monitoring

Track:

- CPU
- Memory
- Error Rate
- Latency
- Database Performance
- Queue Length
- Cache Hit Rate

## Alerting

Alerts for:

- High error rates
- Downtime
- Slow responses
- Failed deployments
- Security events

---

# 8. Testing

Minimum requirements:

- Unit Tests
- Integration Tests
- API Tests
- End-to-End Tests

Security Testing:

- Authorization tests
- RLS tests
- Injection testing
- IDOR testing

Regression testing required before release.

---

# 9. DevOps

- CI/CD pipeline.
- Automated testing.
- Automated linting.
- Automated formatting.
- Dependency scanning.
- Secret scanning.
- Infrastructure as Code.
- Rollback support.

---

# 10. Documentation

Maintain:

- PRD
- Architecture
- Data Model
- API Documentation
- Deployment Guide
- Runbook
- ADRs (Architecture Decision Records)

Documentation must remain synchronized with implementation.

---

# 11. Privacy & Compliance

- Collect minimum required data.
- Encrypt data in transit.
- Encrypt sensitive data at rest.
- Data retention policy.
- User data deletion support.
- Consent management where required.

---

# 12. AI Development Standards

If AI is used during development:

- AI generates code.
- Independent AI reviews code.
- Human approves critical changes.

AI-generated code must never bypass:

- Security review
- Testing
- Architecture standards

---

# 13. Deployment

Each deployment must include:

- Environment validation
- Migration verification
- Health checks
- Rollback plan
- Monitoring enabled
- Logging enabled

No deployment if critical tests fail.

---

# 14. Maintainability

Code should be:

- Readable
- Modular
- Well documented
- Consistently formatted

Avoid:

- Dead code
- Duplicate logic
- Hardcoded configuration
- Large functions
- Tight coupling

---

# 15. Accessibility

Meet WCAG AA where applicable.

Support:

- Keyboard navigation
- Screen readers
- Proper contrast
- Responsive layouts

---

# 16. Definition of Done

A feature is considered complete only if:

- Functional requirements implemented
- Security requirements satisfied
- Tests pass
- Documentation updated
- Monitoring added
- Logging added
- Error handling implemented
- Performance acceptable
- Code reviewed
- Approved for deployment

---

# Engineering Principle

> Features are optional.
>
> Security, reliability, observability, maintainability, and operational readiness are mandatory.
>
> Any requirement marked as "Not Applicable" must include documented justification.
