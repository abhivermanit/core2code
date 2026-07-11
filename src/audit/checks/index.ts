/**
 * Aggregates all audit checks across lifecycle phases.
 *
 * Discovery, Architecture, Security, Delivery, and Operations phases have
 * no checks registered yet (see phases.ts PHASE_ORDER) — they'll be filled
 * in as later milestones add checks for those phases.
 */

import { AuditCheck } from '../types';
import { ENGINEERING_CHECKS } from './engineering';
import { QUALITY_CHECKS } from './quality';

export const ALL_CHECKS: AuditCheck[] = [...ENGINEERING_CHECKS, ...QUALITY_CHECKS];
