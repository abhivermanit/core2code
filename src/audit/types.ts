/**
 * Audit feature type definitions.
 */

/**
 * Severity levels for audit findings.
 */
export type Severity = 'error' | 'warn' | 'info';

/**
 * The result status of an individual audit check.
 */
export type CheckStatus = 'pass' | 'fail' | 'skip';

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
}

/**
 * Category grouping for audit checks.
 */
export type AuditCategory = 'structure' | 'dependencies' | 'config' | 'git' | 'quality';

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
}

/**
 * CLI options specific to the audit subcommand.
 */
export interface AuditCliOptions {
  dir: string;
  json: boolean;
  verbose: boolean;
}
