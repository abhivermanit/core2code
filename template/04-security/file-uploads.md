# File Upload Security

## Principle

File uploads are one of the most dangerous attack surfaces. Treat every uploaded file as potentially malicious. Validate everything, trust nothing, and store outside the web root.

---

## MIME Type Validation

Never trust the `Content-Type` header. Validate the actual file content.

```typescript
import { fileTypeFromBuffer } from 'file-type';

async function validateFileType(buffer: Buffer, allowedTypes: string[]): boolean {
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected) return false;
  if (!allowedTypes.includes(detected.mime)) return false;

  return true;
}

// Usage
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const isValid = await validateFileType(fileBuffer, allowed);
```

### Validation Layers

| Layer | Check |
|-------|-------|
| 1. Extension | File extension matches expected type (basic filter) |
| 2. Content-Type header | Must match expected type (untrusted but useful for early rejection) |
| 3. Magic bytes | Read first bytes of file to determine actual type |
| 4. Deep validation | Parse the file (e.g., re-encode image, validate PDF structure) |

### Dangerous File Types to Block

- `.exe`, `.bat`, `.cmd`, `.ps1`, `.sh` — Executables
- `.php`, `.asp`, `.jsp`, `.py` — Server-side scripts
- `.html`, `.htm`, `.svg` — Can contain JavaScript (XSS)
- `.zip`, `.tar` (if extracted server-side) — Path traversal via filenames

---

## Size Limits

```typescript
const UPLOAD_LIMITS = {
  avatar: { maxSize: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png'] },      // 2MB
  document: { maxSize: 10 * 1024 * 1024, types: ['application/pdf'] },            // 10MB
  attachment: { maxSize: 25 * 1024 * 1024, types: ['image/*', 'application/pdf'] }, // 25MB
};
```

### Enforce at Multiple Levels

- **Client-side:** Reject before upload starts (UX, not security)
- **Reverse proxy:** Nginx `client_max_body_size`, Cloudflare limits
- **Application:** Validate file size before processing
- **Storage:** Quota per user/tenant

---

## Virus Scanning

Scan uploaded files before making them accessible.

```typescript
// Integration with ClamAV or similar
async function scanFile(buffer: Buffer): Promise<ScanResult> {
  const result = await clamav.scan(buffer);
  if (result.isInfected) {
    logger.warn('Malicious file detected', { viruses: result.viruses });
    throw new MaliciousFileError(result.viruses);
  }
  return result;
}
```

### Scan Workflow

```
Upload → Validate type/size → Scan for malware → Store → Make accessible
                                    ↓ (infected)
                              Reject + Log + Alert
```

---

## Storage Security

### Store Outside Web Root

Never store uploads in a publicly accessible directory.

```
// BAD — directly accessible
/var/www/html/uploads/user-file.jpg
→ https://example.com/uploads/user-file.jpg

// GOOD — not directly accessible
/var/data/uploads/a1b2c3d4-5678-90ab-cdef.bin
→ Served through application with auth check
```

### Storage Rules

| Rule | Rationale |
|------|-----------|
| Random filenames (UUID) | Prevent path traversal, enumeration |
| No user-supplied filenames in storage path | Path traversal prevention |
| Separate storage from application code | Limit blast radius |
| Serve through signed URLs with expiration | Time-limited, authenticated access |
| Set `Content-Disposition: attachment` | Prevent browser execution |
| Set `X-Content-Type-Options: nosniff` | Prevent MIME sniffing |

### Signed URL Pattern

```typescript
// Generate a time-limited download URL
function getDownloadUrl(fileId: string, userId: string): string {
  // Verify user has access to this file
  const file = await db.files.findOne({ id: fileId, userId });
  if (!file) throw new NotFoundError();

  // Generate signed URL (expires in 15 minutes)
  return s3.getSignedUrl('getObject', {
    Bucket: UPLOADS_BUCKET,
    Key: file.storageKey,
    Expires: 900,
    ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
  });
}
```

---

## Image-Specific Security

- Re-encode images on upload (strip metadata, EXIF data, embedded scripts)
- Resize to maximum dimensions (prevent pixel-flood DoS)
- Strip all EXIF metadata (may contain GPS, device info)
- Convert SVGs to PNG (SVGs can contain JavaScript)

```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .rotate()           // Apply EXIF rotation then strip metadata
    .jpeg({ quality: 85 })
    .toBuffer();
}
```

---

## Checklist

- [ ] Allowlist of permitted MIME types (not a denylist)
- [ ] Magic byte validation (not just extension or Content-Type)
- [ ] File size limits at proxy, application, and storage levels
- [ ] Virus/malware scanning before storage
- [ ] Random filename generation (UUID, not user-supplied)
- [ ] Storage outside web root
- [ ] Served through application with authorization check
- [ ] Signed URLs with expiration for downloads
- [ ] Content-Disposition: attachment on served files
- [ ] X-Content-Type-Options: nosniff header
- [ ] EXIF/metadata stripped from images
- [ ] SVG files either rejected or converted to raster
- [ ] Rate limiting on upload endpoints
- [ ] Per-user/tenant storage quotas
