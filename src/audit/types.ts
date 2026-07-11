/**
 * Audit feature type definitions.
 */

/**
 * Severity levels for audit findings.
 */
export type Severity = 'error' | 'warn' | 'info';

/**
 * The result status of an individual audit check.
 *
 * `manual_review` is returned by `manual`-type checks (see AUDIT_SPEC.md) —
 * a question a tool can't reliably infer, so it's never faked as pass/fail.
 */
export type CheckStatus = 'pass' | 'fail' | 'skip' | 'manual_review';

/**
 * A single audit check result.
 */
export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  phase: AuditPhase;
  /** Guidance on what to do when status is 'fail' or 'manual_review'. */
  remediation?: string;
}

/**
 * Category grouping for audit checks. Engineering/Quality use the finer
 * sub-categories below; phases without sub-categories (Discovery, and
 * others as they're implemented) use their own phase name.
 */
export type AuditCategory = 'structure' | 'dependencies' | 'config' | 'git' | 'quality' | 'discovery' | 'architecture';

/**
 * Lifecycle phase a check belongs to, per the Core2Code production
 * readiness model (Discovery -> Operations).
 */
export type AuditPhase =
  | 'discovery'
  | 'architecture'
  | 'engineering'
  | 'security'
  | 'quality'
  | 'delivery'
  | 'operations';

/**
 * Definition of an audit check to run.
 */
export interface AuditCheck {
  id: string;
  label: string;
  category: AuditCategory;
  phase: AuditPhase;
  severity: Severity;
  run: (ctx: AuditContext) => Promise<CheckResult> | CheckResult;
}

/**
 * Context passed to each audit check.
 */
export interface AuditContext {
  /** Absolute path to the project root being audited. */
  projectDir: string;
  /** Parsed package.json (or null if not found). */
  packageJson: Record<string, unknown> | null;
  /** Whether a .git directory exists. */
  hasGit: boolean;
  /** Whether a tsconfig.json file exists. */
  hasTsConfig: boolean;
  /** List of files in the project root. */
  rootFiles: string[];
  /**
   * Relative POSIX paths of markdown docs found at the project root and
   * under docs/ or documentation/ (if present). Used by evidence-based
   * checks that shouldn't hard-require a specific file path.
   */
  docFiles: string[];
}

/**
 * Computed score for the audit.
 */
export interface AuditScore {
  /** Total points earned. */
  earned: number;
  /** Maximum possible points. */
  possible: number;
  /** Percentage (0-100). */
  percentage: number;
  /** Letter grade. */
  grade: string;
}

/**
 * Computed score for a single lifecycle phase. `percentage`/`grade` are
 * `null` when the phase has no checks registered yet (N/A, not 0%).
 */
export interface PhaseScore {
  phase: AuditPhase;
  label: string;
  earned: number;
  possible: number;
  percentage: number | null;
  grade: string | null;
  checkCount: number;
}

/**
 * Full audit report.
 */
export interface AuditReport {
  projectDir: string;
  timestamp: string;
  results: CheckResult[];
  score: AuditScore;
  phaseScores: PhaseScore[];
  readyForProduction: boolean;
  passed: number;
  failed: number;
  skipped: number;
  needsReview: number;
}

/**
 * CLI options specific to the audit subcommand.
 */
export interface AuditCliOptions {
  dir: string;
  json: boolean;
  verbose: boolean;
}
