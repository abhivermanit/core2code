/**
 * Architecture phase checks (v0.7 Architecture Audit Pack).
 *
 * Ids match docs/AUDIT_MATRIX.md (ARCH-001..009). Severity here is the
 * engine's 3-tier Severity, mapped from the matrix's 4-tier severity per
 * docs/AUDIT_MATRIX.md section 5 (critical/high -> error, medium -> warn) —
 * same convention discovery.ts uses.
 */

import { AuditCheck, AuditContext } from '../types';
import { fail, manualReview, findEvidenceDoc } from './helpers';

const PHASE = 'architecture';

const architectureDescriptionExists: AuditCheck = {
  id: 'ARCH-001',
  label: 'An architecture description exists',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/architecture/i, /system[-_ ]?context/i, /component[-_ ]?diagram/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No architecture description found',
      'Document the architecture: components, data flow, and how they fit together.',
    );
  },
};

const dataModelExists: AuditCheck = {
  id: 'ARCH-002',
  label: 'A data model / schema description exists',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/data[-_ ]?model/i, /schema/i, /storage/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No data model / schema description found',
      'Document the data model: entities, relationships, and storage choices.',
    );
  },
};

const authDesignExists: AuditCheck = {
  id: 'ARCH-003',
  label: 'AuthN/AuthZ design is documented',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/authentication/i, /authorization/i, /\bauthn\b/i, /\bauthz\b/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No authentication/authorization design doc found',
      'Document how authentication and authorization work.',
    );
  },
};

const apiContractsExist: AuditCheck = {
  id: 'ARCH-004',
  label: 'API contracts are documented',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/api[-_ ]?design/i, /api[-_ ]?spec/i, /openapi/i, /graphql/i, /api[-_ ]?contract/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No API contract (OpenAPI, GraphQL schema, or equivalent) found',
      'Document the API contract: endpoints/operations, request/response shapes.',
    );
  },
};

const decisionRecordsExist: AuditCheck = {
  id: 'ARCH-005',
  label: 'Decisions are recorded (ADRs or equivalent)',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/\badr\b/i, /decision[-_ ]?records?/i, /decisions?/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No decision records (ADRs or equivalent) found',
      'Write or backfill ADRs for significant architecture decisions.',
    );
  },
};

const decisionQuality: AuditCheck = {
  id: 'ARCH-006',
  label: 'Decision records show real reasoning',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'Confirm decision records state alternatives considered and tradeoff reasoning, not just the decision asserted.',
      'Rewrite thin ADRs to include the alternatives considered and why they were rejected.',
    );
  },
};

const threatModelExists: AuditCheck = {
  id: 'ARCH-007',
  label: 'A threat model exists',
  category: 'architecture',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/threat[-_ ]?model/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'warn',
      match ? `${match.path} exists but looks empty` : 'No threat model found',
      'Write a threat model covering the system\'s attack surface.',
    );
  },
};

const threatModelQuality: AuditCheck = {
  id: 'ARCH-008',
  label: "Threat model covers the system's actual attack surface",
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      "Confirm the threat model's enumerated threats match this system's real attack surface (auth boundaries, external integrations, data sensitivity) rather than being a generic unfilled template.",
      'Walk the actual system boundaries and integrations and update the threat model to match.',
    );
  },
};

const architectureSoundness: AuditCheck = {
  id: 'ARCH-009',
  label: 'Architecture is sound for the stated non-functional requirements',
  category: 'architecture',
  phase: PHASE,
  severity: 'error',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'Confirm the architecture can plausibly meet the stated non-functional requirements (scale, availability, latency targets), not just that both docs happen to exist.',
      'Review the architecture against the non-functional requirements and note any gaps.',
    );
  },
};

/**
 * All Architecture phase checks.
 */
export const ARCHITECTURE_CHECKS: AuditCheck[] = [
  architectureDescriptionExists,
  dataModelExists,
  authDesignExists,
  apiContractsExist,
  decisionRecordsExist,
  decisionQuality,
  threatModelExists,
  threatModelQuality,
  architectureSoundness,
];
