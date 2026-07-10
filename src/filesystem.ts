import path from 'node:path';
import fs from 'fs-extra';
import { BINARY_EXTENSIONS, COPY_EXCLUDE } from './constants';
import { FileSystemError } from './errors';

export interface EnsureDirectoryResult {
  readonly created: boolean;
}

function describeError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EACCES' || code === 'EPERM') {
      return `Permission denied: ${fallback}`;
    }
    if (code === 'ENOSPC') {
      return `No space left on device: ${fallback}`;
    }
    return `${fallback} (${error.message})`;
  }
  return fallback;
}

export async function pathExists(target: string): Promise<boolean> {
  return fs.pathExists(target);
}

export async function ensureDirectory(
  directory: string,
  overwrite: boolean,
): Promise<EnsureDirectoryResult> {
  try {
    const exists = await fs.pathExists(directory);
    if (!exists) {
      await fs.ensureDir(directory);
      return { created: true };
    }
    if (overwrite) {
      await fs.emptyDir(directory);
    }
    return { created: false };
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not prepare directory ${directory}`),
      error,
    );
  }
}

export async function isDirectoryEmpty(directory: string): Promise<boolean> {
  try {
    const exists = await fs.pathExists(directory);
    if (!exists) {
      return true;
    }
    const entries = await fs.readdir(directory);
    return entries.length === 0;
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not read directory ${directory}`),
      error,
    );
  }
}

export async function copyDirectory(source: string, destination: string): Promise<void> {
  try {
    await fs.copy(source, destination, {
      overwrite: true,
      errorOnExist: false,
      filter: (src: string) => !COPY_EXCLUDE.has(path.basename(src)),
    });
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not copy template into ${destination}`),
      error,
    );
  }
}

export async function listFilesRecursively(root: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
  }
  try {
    await walk(root);
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not enumerate files under ${root}`),
      error,
    );
  }
  return files;
}

export function isBinaryFile(filePath: string): boolean {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export async function replaceInFile(
  filePath: string,
  replacements: ReadonlyMap<string, string>,
): Promise<boolean> {
  if (isBinaryFile(filePath)) {
    return false;
  }
  try {
    const original = await fs.readFile(filePath, 'utf8');
    let updated = original;
    for (const [token, value] of replacements) {
      if (updated.includes(token)) {
        updated = updated.split(token).join(value);
      }
    }
    if (updated !== original) {
      await fs.writeFile(filePath, updated, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not process file ${filePath}`),
      error,
    );
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not write file ${filePath}`),
      error,
    );
  }
}

export async function moveFile(from: string, to: string): Promise<void> {
  try {
    await fs.move(from, to, { overwrite: true });
  } catch (error) {
    throw new FileSystemError(
      describeError(error, `could not move ${from} to ${to}`),
      error,
    );
  }
}

export async function removeDirectorySafe(directory: string): Promise<void> {
  try {
    await fs.remove(directory);
  } catch {
    /* best effort: ignore */
  }
}
