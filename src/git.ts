import { execSync } from 'child_process';

/**
 * Check if git is available on the system PATH.
 */
export function isGitAvailable(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize a git repository in the given directory.
 * Tries --initial-branch=main first, falls back to plain init.
 */
export function initRepository(directory: string): void {
  try {
    execSync('git init --initial-branch=main', {
      cwd: directory,
      stdio: 'ignore',
    });
  } catch {
    // Fallback for older git versions that don't support --initial-branch
    execSync('git init', {
      cwd: directory,
      stdio: 'ignore',
    });
  }
}
