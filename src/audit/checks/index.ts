/**
 * Aggregates all audit checks across lifecycle phases.
 *
 * Delivery and Operations phases have no checks registered yet (see
 * phases.ts PHASE_ORDER) — they'll be filled in as later Audit Packs add
 * checks for those phases (see ROADMAP.md).
 */

import { AuditCheck } from '../types';
import { ARCHITECTURE_CHECKS } from './architecture';
import { DISCOVERY_CHECKS } from './discovery';
import { ENGINEERING_CHECKS } from './engineering';
import { QUALITY_CHECKS } from './quality';
import { SECURITY_CHECKS } from './security';

export const ALL_CHECKS: AuditCheck[] = [
  ...DISCOVERY_CHECKS,
  ...ARCHITECTURE_CHECKS,
  ...ENGINEERING_CHECKS,
  ...SECURITY_CHECKS,
  ...QUALITY_CHECKS,
];
