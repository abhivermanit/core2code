# Storage Architecture

Decisions about where and how to store files, media, and binary data outside the primary database.

---

## Storage Types

| Type | Use Case | Examples |
|------|----------|---------|
| Object/Blob Storage | User uploads, media, documents | S3, GCS, Azure Blob |
| File System | Temporary processing, local dev | Local disk, EFS, NFS |
| CDN | Static assets, cached content | CloudFront, Cloudflare, Fastly |
| Database BLOB | Small files tightly coupled to records | PostgreSQL bytea (< 1MB only) |

---

## Object Storage Design

### Bucket Strategy

| Bucket | Purpose | Access | Lifecycle |
|--------|---------|--------|-----------|
| `uploads-raw` | Unprocessed user uploads | Private | Delete after processing (24h) |
| `media-processed` | Processed/resized media | Private (signed URLs) | Indefinite |
| `assets-public` | Public static assets | Public (CDN fronted) | Versioned |
| `backups` | Database and system backups | Private (restricted) | Tiered lifecycle |
| `exports` | User data exports | Private (signed URLs) | Delete after 7 days |

### Key Naming Convention

```
{bucket}/{tenant_id}/{entity_type}/{entity_id}/{purpose}/{filename}

Examples:
media-processed/tenant_001/users/usr_abc/avatar/256x256.webp
media-processed/tenant_001/products/prod_xyz/gallery/image-01.webp
uploads-raw/tenant_001/imports/imp_123/data.csv
```

### Upload Flow

```
1. Client requests upload URL
2. Server generates pre-signed URL (PUT, 15-min expiry)
3. Client uploads directly to storage (bypasses your server)
4. Storage triggers event (S3 notification, etc.)
5. Worker processes file (validate, scan, resize)
6. Worker updates database record with final URL
7. Raw upload deleted after processing
```

### Security

- All buckets private by default (no public access)
- Pre-signed URLs for temporary access (read or write)
- Virus/malware scanning on all uploads before processing
- File type validation (magic bytes, not just extension)
- Maximum file size enforced at pre-signed URL level
- Content-Type validated server-side

---

## File Processing

### Image Processing Pipeline

```
Upload → Validate → Scan → Process → Store → Notify
                                │
                                ├── Generate thumbnails (150px, 300px, 600px)
                                ├── Convert to WebP (with fallback)
                                ├── Strip EXIF metadata (privacy)
                                └── Optimize (quality 80%)
```

### File Size Limits

| File Type | Max Size | Rationale |
|-----------|----------|-----------|
| Avatar image | 5 MB | Processed to small sizes anyway |
| Document upload | 25 MB | Reasonable for PDFs, docs |
| Media (image) | 50 MB | High-res photography |
| Media (video) | 500 MB | Short-form video |
| Data import (CSV) | 100 MB | Large datasets |
| Bulk export | No limit | Generated server-side |

---

## CDN Configuration

### What to Serve via CDN

| Content | Cache Duration | Invalidation |
|---------|---------------|--------------|
| Static assets (JS, CSS) | 1 year | Filename hashing (cache busting) |
| Public images | 30 days | Version in URL path |
| User media (public) | 7 days | Purge on update |
| API responses | Do not cache | — |
| HTML pages | Short (5 min) or no cache | Varies by dynamism |

### CDN Headers

```
Cache-Control: public, max-age=31536000, immutable    # Static assets
Cache-Control: public, max-age=86400, stale-while-revalidate=3600  # Media
Cache-Control: no-store                                # Dynamic/private
```

### CDN Security

- Origin access restricted (only CDN can access origin bucket)
- Signed URLs/cookies for premium/private content
- Geographic restrictions if required
- WAF rules at CDN edge
- DDoS protection enabled

---

## Backup Strategy

### Backup Schedule

| Data | Frequency | Retention | Location | Tested |
|------|-----------|-----------|----------|--------|
| Database (full) | Daily | 30 days | Cross-region | Monthly |
| Database (WAL/incremental) | Continuous | 7 days | Same region | Weekly |
| Object storage | Versioning enabled | 90 days | Cross-region replication | Quarterly |
| Configuration | On change (git) | Forever | Git repository | Every deploy |
| Secrets | On change | 30 versions | Secrets manager | Monthly |

### Recovery Targets

| Metric | Target | Notes |
|--------|--------|-------|
| RPO (Recovery Point Objective) | < 1 hour | Maximum data loss |
| RTO (Recovery Time Objective) | < 4 hours | Maximum downtime |
| Backup verification | Monthly | Actually restore and verify |

### Backup Rules

- Backups are encrypted at rest
- Backup access requires separate credentials (not same as production)
- Cross-region replication for disaster recovery
- Automated backup monitoring (alert if backup fails)
- Restore procedure documented and tested regularly
- Backup retention meets compliance requirements

---

## Data Lifecycle

```
Hot (Primary Storage) → Warm (Infrequent Access) → Cold (Archive) → Delete
     0-30 days              30-90 days              90-365 days       365+ days
```

### Lifecycle Rules

| Storage Class | Use Case | Access Pattern | Cost |
|--------------|----------|---------------|------|
| Standard | Active data | Frequent | $$$ |
| Infrequent Access | Older data, backups | Monthly | $$ |
| Archive/Glacier | Compliance, long-term | Rarely (hours to retrieve) | $ |
| Delete | Expired data | Never | Free |

### Implementation

```json
{
  "rules": [
    {
      "prefix": "uploads-raw/",
      "transition": { "days": 1, "action": "delete" }
    },
    {
      "prefix": "exports/",
      "transition": { "days": 7, "action": "delete" }
    },
    {
      "prefix": "backups/",
      "transitions": [
        { "days": 30, "storageClass": "INFREQUENT_ACCESS" },
        { "days": 90, "storageClass": "ARCHIVE" },
        { "days": 365, "action": "delete" }
      ]
    }
  ]
}
```

---

## Cost Optimization

| Strategy | Savings | Effort |
|----------|---------|--------|
| Lifecycle policies (auto-tier) | 40-60% on old data | Low |
| Image optimization (WebP, resize) | 30-50% on storage + bandwidth | Medium |
| CDN caching | 60-80% on bandwidth | Low |
| Deduplication (hash-based) | 10-30% on storage | Medium |
| Compression (gzip/brotli for text) | 60-80% on bandwidth | Low |
| Delete unused/orphaned files | Variable | Medium (need audit) |
