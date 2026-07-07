# Privacy & Compliance

## Data Minimization

- Collect only the data required for the feature to function.
- Never collect "just in case" data.
- Review data collection annually — remove what's no longer needed.

## Encryption

### In Transit

- TLS 1.2+ for all connections (TLS 1.3 preferred)
- HSTS enabled
- No mixed content (HTTP/HTTPS)

### At Rest

- Encrypt sensitive data (PII, credentials, health data, financial data)
- Use platform-managed encryption keys where possible
- Document which fields are encrypted and why

## Data Retention

- Define retention periods for every data category
- Implement automated deletion/archival
- Document retention policy for users

| Data Category | Retention Period | After Expiry |
|---------------|----------------|--------------|
| User account data | Account lifetime + 30 days | Delete |
| Logs | 30-90 days | Archive or delete |
| Analytics | 12 months | Aggregate and anonymize |
| Backups | 30 days | Delete |

## User Data Rights

Support the following (as applicable by jurisdiction):

- **Right to access** — Users can export their data
- **Right to deletion** — Users can request account and data deletion
- **Right to rectification** — Users can correct their data
- **Right to portability** — Data export in a standard format

## Consent Management

- Explicit consent before data collection (where required)
- Granular consent options (not all-or-nothing)
- Easy consent withdrawal
- Consent records maintained for audit

## Compliance Frameworks

Identify which apply to your project:

- [ ] GDPR (EU)
- [ ] CCPA (California)
- [ ] HIPAA (US health data)
- [ ] SOC 2 (service organizations)
- [ ] PCI DSS (payment data)
- [ ] None — document justification

## Implementation Checklist

- [ ] Privacy policy published and accessible
- [ ] Data processing agreement with third parties
- [ ] Data flow diagram showing where PII travels
- [ ] Encryption applied to sensitive fields
- [ ] Retention automation implemented
- [ ] Deletion endpoint functional and tested
- [ ] Consent mechanism in place (if required)
