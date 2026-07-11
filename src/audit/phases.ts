/**
 * Registry of audit lifecycle phases, mirroring the pattern in src/registry.ts.
 */

import { AuditPhase } from './types';

/**
 * Ordered list of lifecycle phases, Discovery through Operations.
 */
export const PHASE_ORDER: AuditPhase[] = [
  'discovery',
  'architecture',
  'engineering',
  'security',
  'quality',
  'delivery',
  'operations',
];

/**
 * Display labels for each lifecycle phase.
 */
export const PHASE_LABELS: Record<AuditPhase, string> = {
  discovery: 'Discovery',
  architecture: 'Architecture',
  engineering: 'Engineering',
  security: 'Security',
  quality: 'Quality',
  delivery: 'Delivery',
  operations: 'Operations',
};

/**
 * Overall readiness percentage (averaged across phases with checks) at or
 * above which a project is considered production ready.
 */
export const PRODUCTION_READY_THRESHOLD = 80;
