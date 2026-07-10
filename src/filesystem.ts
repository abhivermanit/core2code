import fs from 'fs-extra';
import path from 'path';

/**
 * Ensure a directory exists, creating it recursively if necessary.
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Check if a directory is empty (or doesn't exist).
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  if (!(await fs.pathExists(dirPath))) {
    return true;
  }
  const entries = await fs.readdir(dirPath);
  return entries.length === 0;
}

/**
 * Recursively copy a directory from source to destination.
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, { overwrite: true });
}

/**
 * Recursively list all files in a directory, returning relative paths.
 */
export async function listFilesRecursively(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        results.push(path.relative(dirPath, fullPath));
      }
    }
  }

  if (await fs.pathExists(dirPath)) {
    await walk(dirPath);
  }

  return results;
}

/**
 * Binary file extensions that should not be processed as text.
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.zip', '.tar', '.gz', '.bz2',
  '.pdf', '.exe', '.dll', '.so', '.dylib',
]);

/**
 * Check if a file is likely binary based on its extension.
 */
export function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Replace occurrences of a pattern in a file.
 */
export async function replaceInFile(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const updated = content.replace(searchValue, replaceValue);
  await fs.writeFile(filePath, updated, 'utf-8');
}

/**
 * Write content to a file, creating parent directories if needed.
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Move (rename) a file or directory.
 */
export async function moveFile(src: string, dest: string): Promise<void> {
  await fs.move(src, dest, { overwrite: true });
}

/**
 * Safely remove a directory and its contents.
 */
export async function removeDirectorySafe(dirPath: string): Promise<void> {
  await fs.remove(dirPath);
}

/**
 * Check if a path exists.
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  return fs.pathExists(targetPath);
}
