# Backups

Backups you haven't tested are not backups. They're hopes.

## Backup Strategy

### What to Back Up

| Data | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| Database | Automated snapshots + WAL | Continuous + daily full | 30 days |
| File storage (S3, etc.) | Versioning + cross-region | Continuous | 90 days |
| Configuration | Version control | Every change | Forever (git) |
| Secrets | Secret manager snapshots | Daily | 30 days |
| Infrastructure state | Terraform state backup | Every apply | 90 days |

### Backup Types

**Full backup:** Complete copy of all data. Expensive but simple to restore.
**Incremental:** Only changes since last backup. Cheap but complex restore chain.
**Continuous (WAL/binlog):** Transaction log streaming. Point-in-time recovery.

**Recommended:** Continuous replication + daily full snapshots. Best of both worlds.

## Frequency and Windows

| Tier | RPO (max data loss) | Backup Frequency |
|------|---------------------|------------------|
| Critical (user data, transactions) | < 1 hour | Continuous + hourly snapshots |
| Important (analytics, logs) | < 24 hours | Daily |
| Replaceable (caches, derived data) | N/A | No backup needed |

### RPO/RTO Targets

- **RPO (Recovery Point Objective):** How much data can you afford to lose?
- **RTO (Recovery Time Objective):** How long can you be down?

```
Critical system:  RPO = 5 min,  RTO = 30 min
Standard system:  RPO = 1 hour, RTO = 4 hours
Non-critical:     RPO = 24 hours, RTO = 24 hours
```

## Retention Policy

```
Hourly snapshots:  Keep 24 hours
Daily snapshots:   Keep 30 days
Weekly snapshots:  Keep 12 weeks
Monthly snapshots: Keep 12 months
Annual snapshots:  Keep 7 years (if compliance requires)
```

Retention increases cost. Only retain what regulation or business logic requires.

## Testing Restores

**Schedule:** Monthly restore test for critical systems. Quarterly for everything else.

### Restore Test Process

```
1. Pick a random backup from last 7 days
2. Restore to isolated environment
3. Verify data integrity:
   - Row counts match expected
   - Sample records are correct
   - Application can connect and query
   - No corruption errors
4. Measure restore time (compare to RTO)
5. Document results
6. Fix any issues found
```

### Restore Test Checklist

- [ ] Backup file accessible and not corrupted
- [ ] Restore completes without errors
- [ ] Application starts against restored data
- [ ] Critical queries return expected results
- [ ] Restore time within RTO target
- [ ] Process documented and runbook updated

## Encryption

### At Rest

- All backups encrypted with AES-256
- Encryption keys stored separately from backups
- Key rotation schedule (annually minimum)
- If backup storage is compromised, data is unreadable

### In Transit

- TLS for all backup transfers
- No unencrypted backup data over the network
- Secure protocols only (no FTP, no plain HTTP)

### Key Management

```
Backup encryption key → stored in KMS/Vault
KMS/Vault access → restricted to backup service + break-glass
Key rotation → automated, annual
Old keys retained → until all backups using them expire
```

## Storage Strategy

### 3-2-1 Rule

- **3** copies of data
- **2** different storage types (e.g., disk + object storage)
- **1** offsite/different region

### Implementation

```
Primary:    RDS automated backups (same region)
Secondary:  Cross-region snapshot copy (different region)  
Tertiary:   S3 Glacier archive (quarterly full, different account)
```

### Cross-Region Considerations

- Compliance: Some data cannot leave certain regions
- Cost: Cross-region transfer charges
- Latency: Restore from remote region takes longer
- Test both local and cross-region restore

## Monitoring Backups

### Alert On

- Backup job failed
- Backup size anomaly (sudden drop = data loss, sudden spike = corruption)
- Backup age exceeds policy (last backup > 24 hours old)
- Restore test failed
- Encryption key expiring

### Dashboard

- Last successful backup timestamp per system
- Backup size trend over time
- Restore test results (pass/fail history)
- Storage usage and cost

## Disaster Scenarios

| Scenario | Recovery Method |
|----------|----------------|
| Accidental deletion (table, rows) | Point-in-time recovery to just before |
| Corruption | Restore last known good snapshot |
| Region failure | Restore from cross-region backup |
| Ransomware | Restore from immutable/isolated backup |
| Account compromise | Restore from separate AWS account |

## Anti-Patterns

- **Untested backups** — Schrödinger's backup: you don't know if it works until you try
- **Backups in same account as production** — account compromise takes both
- **No encryption** — stolen backup = data breach
- **No monitoring** — backup failed silently 3 weeks ago
- **Only full backups** — expensive and slow, miss changes between
- **Manual backup process** — if it depends on a human remembering, it won't happen
- **No documented restore process** — during an incident is not the time to figure out how to restore
