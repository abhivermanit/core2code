/**
 * Build the AuditContext for a given project directory.
 */

import fs from 'fs-extra';
import path from 'path';
import type { Dirent } from 'fs';
import { AuditContext } from './types';

const MD_EXTENSIONS = new Set(['.md', '.mdx']);
const DOC_DIRS = ['docs', 'documentation'];
const MAX_DOC_FILES = 500;
const MAX_DOC_DEPTH = 6;

/**
 * Find markdown docs at the project root and under docs/ or
 * documentation/ (recursive, bounded). Returns relative POSIX paths.
 * Deliberately generic (not tied to any one audit phase) so
 * evidence-based checks can look for a doc "wherever a project happens
 * to keep it" rather than a specific Core2Code-scaffolded path.
 */
async function findDocFiles(absDir: string, rootFiles: string[]): Promise<string[]> {
  const found: string[] = [];

  for (const f of rootFiles) {
    if (MD_EXTENSIONS.has(path.extname(f).toLowerCase())) {
      found.push(f);
    }
  }

  async function walk(dir: string, relDir: string, depth: number): Promise<void> {
    if (depth > MAX_DOC_DEPTH || found.length >= MAX_DOC_FILES) return;
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (found.length >= MAX_DOC_FILES) return;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(dir, entry.name), relPath, depth + 1);
      } else if (MD_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        found.push(relPath);
      }
    }
  }

  for (const docDir of DOC_DIRS) {
    await walk(path.join(absDir, docDir), docDir, 0);
  }

  return found;
}

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

  const docFiles = await findDocFiles(absDir, rootFiles);

  return {
    projectDir: absDir,
    packageJson,
    hasGit,
    hasTsConfig,
    rootFiles,
    docFiles,
  };
}
