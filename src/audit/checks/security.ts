/**
 * Security phase checks (v0.8 Security Audit Pack).
 *
 * Ids match docs/AUDIT_MATRIX.md (SEC-001..011, plus SEC-012 added in this
 * pack — see the matrix's Security section note). Severity here is the
 * engine's 3-tier Severity, mapped from the matrix's 4-tier severity
 * (critical/high -> error, medium -> warn), same convention as
 * discovery.ts/architecture.ts.
 *
 * Outcome model (see docs/AUDIT_SPEC.md v1.1): most of these checks can
 * only prove a positive (a recognized dependency or source pattern found).
 * Finding nothing is not proof the practice is absent — it's the tool's
 * pattern library not recognizing a hand-rolled implementation — so the
 * "nothing found" branch is manual_review, not fail. Only SEC-003
 * (secrets) and SEC-007 (scanning config existence) have a confidence-
 * equivalent signal to Discovery/Architecture's existence checks and can
 * resolve to fail.
 */

import fs from 'fs-extra';
import path from 'path';
import { AuditCheck, AuditContext, AuditPhase } from '../types';
import { pass, fail, skip, manualReview, hasDependency, findSourcePattern, findCodeEvidence, scanForSecrets } from './helpers';

const PHASE: AuditPhase = 'security';

const authenticationImplemented: AuditCheck = {
  id: 'SEC-001',
  label: 'Authentication is implemented',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^passport($|-)/i, /^next-auth$/i, /^@auth\/core$/i, /^@clerk\//i, /^lucia($|-)/i, /^iron-session$/i, /^jsonwebtoken$/i, /^@supabase\/supabase-js$/i, /^firebase-admin$/i, /^express-session$/i],
      [/passport\.authenticate/, /jwt\.verify/, /getServerSession/, /useSession\s*\(/, /requireAuth/],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'No recognized authentication dependency or code pattern found. Could be a hand-rolled implementation this scan doesn\'t recognize.',
      'Confirm authentication is implemented and protects private routes; if hand-rolled, consider documenting the approach.',
    );
  },
};

const authorizationImplemented: AuditCheck = {
  id: 'SEC-002',
  label: 'Authorization / access control is implemented',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^casl$/i, /^@casl\//i, /^accesscontrol$/i, /^@permify\//i],
      [/requireRole/, /checkPermission/, /isAuthorized/, /hasPermission/, /@Roles\(/],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'No recognized authorization/access-control dependency or code pattern found.',
      'Confirm access control decisions are enforced server-side, not just hidden in the UI.',
    );
  },
};

const secretsManagement: AuditCheck = {
  id: 'SEC-003',
  label: 'No secrets committed to source',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const finding = await scanForSecrets(ctx);
    if (finding) {
      return fail(
        this.id,
        this.label,
        this.phase,
        'error',
        finding,
        'Move the secret to an env var or secrets manager, rotate the exposed credential, and ensure .env files are gitignored.',
      );
    }
    return pass(this.id, this.label, this.phase, 'No high-confidence secret patterns found; env files (if any) are gitignored');
  },
};

const rateLimiting: AuditCheck = {
  id: 'SEC-004',
  label: 'Rate limiting is present on public endpoints',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^express-rate-limit$/i, /^rate-limiter-flexible$/i, /^@upstash\/ratelimit$/i, /^@fastify\/rate-limit$/i, /^koa-ratelimit$/i],
      [/rateLimit/, /RateLimiter/],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'No recognized rate-limiting dependency or code pattern found.',
      'Add rate limiting to public/unauthenticated endpoints to protect against abuse.',
    );
  },
};

const inputValidation: AuditCheck = {
  id: 'SEC-005',
  label: 'Input validation is present at trust boundaries',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^zod$/i, /^joi$/i, /^yup$/i, /^class-validator$/i, /^ajv$/i, /^io-ts$/i, /^valibot$/i],
      [/z\.object\(/, /Joi\.object\(/, /yup\.object\(/],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'No recognized input-validation dependency or code pattern found.',
      'Validate untrusted input (request bodies, query params) at the boundary before use.',
    );
  },
};

const httpsEnforced: AuditCheck = {
  id: 'SEC-006',
  label: 'HTTPS/TLS is enforced',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^helmet$/i],
      [/hsts/i, /forceSSL/i, /force-ssl/i, /X-Forwarded-Proto/i, /trust proxy/i],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'No code-level TLS-enforcement evidence found. This under-detects platforms that terminate TLS transparently (Vercel, Render, Heroku, etc.) — that ambiguity is exactly why this is a review flag, not a fail.',
      'Confirm TLS is enforced, whether in application code or at the hosting/proxy layer.',
    );
  },
};

const DEP_SCAN_CONFIG_FILES = ['.github/dependabot.yml', '.github/dependabot.yaml', 'renovate.json', '.renovaterc', '.renovaterc.json', '.snyk'];

const dependencyScanning: AuditCheck = {
  id: 'SEC-007',
  label: 'Dependency vulnerability scanning is configured',
  category: 'security',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    for (const rel of DEP_SCAN_CONFIG_FILES) {
      if (await fs.pathExists(path.join(ctx.projectDir, rel))) {
        return pass(this.id, this.label, this.phase, `Found ${rel}`);
      }
    }
    const dep = hasDependency(ctx, [/^audit-ci$/i, /^snyk$/i]);
    if (dep) return pass(this.id, this.label, this.phase, `Found dependency "${dep}"`);
    return fail(
      this.id,
      this.label,
      this.phase,
      'warn',
      'No dependency vulnerability scanning configuration found (Dependabot, Renovate, Snyk)',
      'Add Dependabot (.github/dependabot.yml) or Renovate to keep dependencies patched.',
    );
  },
};

const securityHeaders: AuditCheck = {
  id: 'SEC-008',
  label: 'CSP / security headers are configured',
  category: 'security',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const evidence = await findCodeEvidence(
      ctx,
      [/^helmet$/i, /^@fastify\/helmet$/i, /^koa-helmet$/i],
      [/Content-Security-Policy/i, /X-Frame-Options/i, /helmet\(/],
    );
    if (evidence.found) return pass(this.id, this.label, this.phase, `Evidence: ${evidence.evidence}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'warn',
      'No recognized security-header dependency or code pattern found.',
      'Configure security headers (CSP, X-Frame-Options, etc.), e.g. via helmet.',
    );
  },
};

const authorizationModelQuality: AuditCheck = {
  id: 'SEC-009',
  label: 'Authorization model matches data sensitivity',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'Confirm the authorization model actually matches the sensitivity of the data it protects, not just that some access-control mechanism exists.',
      'Review who can access the most sensitive data and confirm the authorization checks match that sensitivity.',
    );
  },
};

const auditLogging: AuditCheck = {
  id: 'SEC-010',
  label: 'Security-relevant events are audit-logged',
  category: 'security',
  phase: PHASE,
  severity: 'info',
  async run(ctx: AuditContext) {
    if (!ctx.packageJson) return skip(this.id, this.label, this.phase, 'No package.json to evaluate');
    const file = await findSourcePattern(ctx, [/auditLog/i, /audit_log/i, /securityEvent/i, /logSecurityEvent/i]);
    if (file) return pass(this.id, this.label, this.phase, `Evidence: ${file}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'info',
      'No audit-logging-specific code pattern found (a general logger\'s presence isn\'t treated as evidence here).',
      'Log security-relevant events (auth failures, permission denials, admin actions) distinctly from general application logs.',
    );
  },
};

const cookieFlags: AuditCheck = {
  id: 'SEC-011',
  label: 'Session cookies use Secure/HttpOnly/SameSite',
  category: 'security',
  phase: PHASE,
  severity: 'info',
  async run(ctx: AuditContext) {
    const sessionDep = hasDependency(ctx, [/^express-session$/i, /^cookie-session$/i, /^iron-session$/i, /^next-auth$/i]);
    if (!sessionDep) {
      return skip(this.id, this.label, this.phase, 'No session/cookie dependency detected — check does not apply');
    }
    const file = await findSourcePattern(ctx, [/secure\s*:\s*true/i, /httpOnly\s*:\s*true/i, /sameSite\s*:\s*['"]/i]);
    if (file) return pass(this.id, this.label, this.phase, `Evidence: ${file}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'info',
      `Session dependency "${sessionDep}" found, but no Secure/HttpOnly/SameSite cookie flags were found in source (they may be set via a variable/config object this scan can't see).`,
      'Confirm session cookies set Secure, HttpOnly, and SameSite.',
    );
  },
};

const fileUploadSecurity: AuditCheck = {
  id: 'SEC-012',
  label: 'File uploads are size/type restricted',
  category: 'security',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const uploadDep = hasDependency(ctx, [/^multer$/i, /^busboy$/i, /^formidable$/i, /^express-fileupload$/i, /^@fastify\/multipart$/i]);
    if (!uploadDep) {
      return skip(this.id, this.label, this.phase, 'No file-upload dependency detected — check does not apply');
    }
    const file = await findSourcePattern(ctx, [/fileSize/, /limits\s*:/, /fileFilter/, /MAX_FILE_SIZE/i]);
    if (file) return pass(this.id, this.label, this.phase, `Evidence: ${file}`);
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      `File-upload dependency "${uploadDep}" found, but no size/type limit configuration was found in source.`,
      'Restrict uploaded file size and type (e.g. multer limits/fileFilter) to prevent abuse.',
    );
  },
};

/**
 * All Security phase checks.
 */
export const SECURITY_CHECKS: AuditCheck[] = [
  authenticationImplemented,
  authorizationImplemented,
  secretsManagement,
  rateLimiting,
  inputValidation,
  httpsEnforced,
  dependencyScanning,
  securityHeaders,
  authorizationModelQuality,
  auditLogging,
  cookieFlags,
  fileUploadSecurity,
];
