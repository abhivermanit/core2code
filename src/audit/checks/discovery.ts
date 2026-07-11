/**
 * Discovery phase checks (v0.6 Discovery Audit Pack).
 *
 * Ids match docs/AUDIT_MATRIX.md (DISC-001..007). Severity here is the
 * engine's 3-tier Severity, mapped from the matrix's 4-tier severity per
 * docs/AUDIT_MATRIX.md section 5 (critical/high -> error, medium -> warn,
 * info -> info) — the matrix stays the source of truth for the richer
 * tier, this file just carries the mapped value the engine understands.
 */

import { AuditCheck, AuditContext } from '../types';
import { fail, manualReview, findEvidenceDoc } from './helpers';

const PHASE = 'discovery';

const problemStatementExists: AuditCheck = {
  id: 'DISC-001',
  label: 'A problem statement / PRD exists',
  category: 'discovery',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/prd/i, /vision/i, /problem[-_ ]?statement/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    if (match) {
      return fail(
        this.id,
        this.label,
        this.phase,
        'error',
        `${match.path} exists but looks empty`,
        'Write a PRD or link to where the problem statement lives.',
      );
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      'No problem statement / PRD / vision doc found',
      'Write a PRD or link to where the problem statement lives.',
    );
  },
};

const scopeDefined: AuditCheck = {
  id: 'DISC-002',
  label: 'Scope (in/out) is explicitly bounded',
  category: 'discovery',
  phase: PHASE,
  severity: 'error',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'error',
      'Confirm the project explicitly states what is in scope and out of scope, not just a feature list.',
      'Add an explicit "Scope" / "Out of scope" section to the PRD or README.',
    );
  },
};

const functionalRequirements: AuditCheck = {
  id: 'DISC-003',
  label: 'Functional requirements are documented',
  category: 'discovery',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(
      ctx,
      [/requirements/i, /user[-_ ]?stories/i],
      [/non[-_ ]?functional/i, /\bnfr\b/i],
    );
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No functional requirements / user stories doc found',
      'Document functional requirements or user stories.',
    );
  },
};

const nonFunctionalRequirements: AuditCheck = {
  id: 'DISC-004',
  label: 'Non-functional requirements are documented',
  category: 'discovery',
  phase: PHASE,
  severity: 'error',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/non[-_ ]?functional/i, /\bnfr\b/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'error',
      match ? `${match.path} exists but looks empty` : 'No non-functional requirements doc found',
      'Document non-functional requirements (performance, scale, availability targets).',
    );
  },
};

const risksDocumented: AuditCheck = {
  id: 'DISC-005',
  label: 'Known risks are documented',
  category: 'discovery',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/risks?/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'warn',
      match ? `${match.path} exists but looks empty` : 'No risks doc found',
      'Document known risks.',
    );
  },
};

const assumptionsDocumented: AuditCheck = {
  id: 'DISC-006',
  label: 'Assumptions are documented',
  category: 'discovery',
  phase: PHASE,
  severity: 'warn',
  async run(ctx: AuditContext) {
    const match = await findEvidenceDoc(ctx, [/assumptions?/i]);
    if (match?.substantive) {
      return { id: this.id, label: this.label, status: 'pass', severity: 'info', phase: this.phase, message: `Found ${match.path}` };
    }
    return fail(
      this.id,
      this.label,
      this.phase,
      'warn',
      match ? `${match.path} exists but looks empty` : 'No assumptions doc found',
      'Document assumptions and mark each validated/unvalidated.',
    );
  },
};

const problemStatementQuality: AuditCheck = {
  id: 'DISC-007',
  label: 'Problem statement is specific and falsifiable',
  category: 'discovery',
  phase: PHASE,
  severity: 'warn',
  run() {
    return manualReview(
      this.id,
      this.label,
      this.phase,
      'warn',
      'Confirm the problem statement names a specific, falsifiable problem, not generic boilerplate ("improve engagement", "build a platform").',
      'Rewrite the problem statement to name who has the problem, what it costs them, and how you\'ll know it\'s solved.',
    );
  },
};

/**
 * All Discovery phase checks.
 */
export const DISCOVERY_CHECKS: AuditCheck[] = [
  problemStatementExists,
  scopeDefined,
  functionalRequirements,
  nonFunctionalRequirements,
  risksDocumented,
  assumptionsDocumented,
  problemStatementQuality,
];
