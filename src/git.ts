import { spawnSync } from 'node:child_process';

export function isGitAvailable(): boolean {
  const result = spawnSync('git', ['--version'], { stdio: 'ignore' });
  return result.error === undefined && result.status === 0;
}

export function initRepository(directory: string): boolean {
  const withMain = spawnSync('git', ['init', '--initial-branch=main', '--quiet'], {
    cwd: directory,
    stdio: 'ignore',
  });

  if (withMain.error === undefined && withMain.status === 0) {
    return true;
  }

  const fallback = spawnSync('git', ['init', '--quiet'], {
    cwd: directory,
    stdio: 'ignore',
  });

  return fallback.error === undefined && fallback.status === 0;
}
