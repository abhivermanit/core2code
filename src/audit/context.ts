/**
 * Build the AuditContext for a given project directory.
 */

import fs from 'fs-extra';
import path from 'path';
import { AuditContext } from './types';

/**
 * Gather context about the project directory for audit checks.
 */
export async function buildAuditContext(projectDir: string): Promise<AuditContext> {
  const absDir = path.resolve(projectDir);

  // List root files
  let rootFiles: string[] = [];
  try {
    rootFiles = await fs.readdir(absDir);
  } catch {
    // If directory doesn't exist or isn't readable, leave empty
  }

  // Try to parse package.json
  let packageJson: Record<string, unknown> | null = null;
  const pkgPath = path.join(absDir, 'package.json');
  try {
    if (await fs.pathExists(pkgPath)) {
      packageJson = await fs.readJson(pkgPath);
    }
  } catch {
    // Couldn't parse - leave null
  }

  // Check for .git directory
  const hasGit = await fs.pathExists(path.join(absDir, '.git'));

  // Check for tsconfig.json
  const hasTsConfig = await fs.pathExists(path.join(absDir, 'tsconfig.json'));

  return {
    projectDir: absDir,
    packageJson,
    hasGit,
    hasTsConfig,
    rootFiles,
  };
}
