# Security Checklist

## Code

- [ ] No hardcoded credentials or API keys
- [ ] Input validation on all user inputs
- [ ] Parameterized database queries
- [ ] Output encoding for XSS prevention
- [ ] CSRF protection enabled
- [ ] Proper error messages (no stack traces in production)
- [ ] Secure random number generation

## Authentication & Authorization

- [ ] Strong password requirements enforced
- [ ] MFA available
- [ ] Session timeout configured
- [ ] Role-based access control implemented
- [ ] Principle of least privilege applied
- [ ] API keys have expiration and rotation

## Data

- [ ] Encryption at rest
- [ ] Encryption in transit (TLS 1.2+)
- [ ] PII identified and protected
- [ ] Data retention policy implemented
- [ ] Backup encryption

## Infrastructure

- [ ] Secrets in vault (not environment files)
- [ ] Network segmentation
- [ ] Firewalls configured (minimal open ports)
- [ ] Container images scanned
- [ ] Dependencies scanned for vulnerabilities

## Operations

- [ ] Audit logging enabled
- [ ] Security alerts configured
- [ ] Incident response plan documented
- [ ] Regular access review
