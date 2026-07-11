/**
 * Shared result-builder helpers for audit check implementations.
 */

import { AuditPhase, CheckResult, Severity } from '../types';

export function pass(id: string, label: string, phase: AuditPhase, message: string): CheckResult {
  return { id, label, status: 'pass', severity: 'info', phase, message };
}

export function fail(
  id: string,
  label: string,
  phase: AuditPhase,
  severity: Severity,
  message: string,
): CheckResult {
  return { id, label, status: 'fail', severity, phase, message };
}

export function skip(id: string, label: string, phase: AuditPhase, message: string): CheckResult {
  return { id, label, status: 'skip', severity: 'info', phase, message };
}
