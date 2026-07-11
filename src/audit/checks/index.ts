/**
 * Aggregates all audit checks across lifecycle phases.
 *
 * Architecture, Security, Delivery, and Operations phases have no checks
 * registered yet (see phases.ts PHASE_ORDER) — they'll be filled in as
 * later Audit Packs add checks for those phases (see ROADMAP.md).
 */

import { AuditCheck } from '../types';
import { DISCOVERY_CHECKS } from './discovery';
import { ENGINEERING_CHECKS } from './engineering';
import { QUALITY_CHECKS } from './quality';

export const ALL_CHECKS: AuditCheck[] = [...DISCOVERY_CHECKS, ...ENGINEERING_CHECKS, ...QUALITY_CHECKS];
