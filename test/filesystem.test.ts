import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import {
  ensureDirectory,
  isDirectoryEmpty,
  copyDirectory,
  listFilesRecursively,
  isBinaryFile,
  replaceInFile,
  writeFile,
  moveFile,
  removeDirectorySafe,
  pathExists,
} from '../src/filesystem';

describe('filesystem', () => {
  const testDir = path.join(__dirname, '.tmp-fs-test');

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('ensureDirectory', () => {
    it('creates a new directory', async () => {
      const dir = path.join(testDir, 'new-dir');
      await ensureDirectory(dir);
      expect(await fs.pathExists(dir)).toBe(true);
    });

    it('creates nested directories', async () => {
      const dir = path.join(testDir, 'a', 'b', 'c');
      await ensureDirectory(dir);
      expect(await fs.pathExists(dir)).toBe(true);
    });

    it('does not fail if directory already exists', async () => {
      await ensureDirectory(testDir);
      expect(await fs.pathExists(testDir)).toBe(true);
    });
  });

  describe('isDirectoryEmpty', () => {
    it('returns true for empty directory', async () => {
      expect(await isDirectoryEmpty(testDir)).toBe(true);
    });

    it('returns false for non-empty directory', async () => {
      await fs.writeFile(path.join(testDir, 'file.txt'), 'hello');
      expect(await isDirectoryEmpty(testDir)).toBe(false);
    });

    it('returns true for non-existent directory', async () => {
      expect(await isDirectoryEmpty(path.join(testDir, 'nope'))).toBe(true);
    });
  });

  describe('copyDirectory', () => {
    it('copies directory contents', async () => {
      const src = path.join(testDir, 'src');
      const dest = path.join(testDir, 'dest');
      await fs.ensureDir(src);
      await fs.writeFile(path.join(src, 'file.txt'), 'content');

      await copyDirectory(src, dest);
      expect(await fs.readFile(path.join(dest, 'file.txt'), 'utf-8')).toBe('content');
    });

    it('copies nested directories', async () => {
      const src = path.join(testDir, 'src');
      await fs.ensureDir(path.join(src, 'sub'));
      await fs.writeFile(path.join(src, 'sub', 'nested.txt'), 'nested');

      const dest = path.join(testDir, 'dest');
      await copyDirectory(src, dest);
      expect(await fs.readFile(path.join(dest, 'sub', 'nested.txt'), 'utf-8')).toBe('nested');
    });
  });

  describe('listFilesRecursively', () => {
    it('returns all files with relative paths', async () => {
      await fs.writeFile(path.join(testDir, 'a.txt'), '');
      await fs.ensureDir(path.join(testDir, 'sub'));
      await fs.writeFile(path.join(testDir, 'sub', 'b.txt'), '');

      const files = await listFilesRecursively(testDir);
      expect(files.sort()).toEqual(['a.txt', path.join('sub', 'b.txt')].sort());
    });

    it('returns empty array for empty directory', async () => {
      const files = await listFilesRecursively(testDir);
      expect(files).toEqual([]);
    });

    it('returns empty array for non-existent directory', async () => {
      const files = await listFilesRecursively(path.join(testDir, 'nope'));
      expect(files).toEqual([]);
    });
  });

  describe('isBinaryFile', () => {
    it('identifies binary extensions', () => {
      expect(isBinaryFile('image.png')).toBe(true);
      expect(isBinaryFile('font.woff2')).toBe(true);
      expect(isBinaryFile('archive.zip')).toBe(true);
      expect(isBinaryFile('doc.pdf')).toBe(true);
    });

    it('identifies non-binary extensions', () => {
      expect(isBinaryFile('code.ts')).toBe(false);
      expect(isBinaryFile('readme.md')).toBe(false);
      expect(isBinaryFile('config.json')).toBe(false);
      expect(isBinaryFile('style.css')).toBe(false);
    });
  });

  describe('replaceInFile', () => {
    it('replaces text in a file', async () => {
      const file = path.join(testDir, 'test.txt');
      await fs.writeFile(file, 'Hello {{name}}, welcome!');

      await replaceInFile(file, /\{\{name\}\}/g, 'World');
      expect(await fs.readFile(file, 'utf-8')).toBe('Hello World, welcome!');
    });

    it('replaces string patterns', async () => {
      const file = path.join(testDir, 'test.txt');
      await fs.writeFile(file, 'foo bar foo');

      await replaceInFile(file, 'foo', 'baz');
      expect(await fs.readFile(file, 'utf-8')).toBe('baz bar foo');
    });
  });

  describe('writeFile', () => {
    it('writes content to a file', async () => {
      const file = path.join(testDir, 'output.txt');
      await writeFile(file, 'hello world');
      expect(await fs.readFile(file, 'utf-8')).toBe('hello world');
    });

    it('creates parent directories', async () => {
      const file = path.join(testDir, 'deep', 'nested', 'file.txt');
      await writeFile(file, 'content');
      expect(await fs.readFile(file, 'utf-8')).toBe('content');
    });
  });

  describe('moveFile', () => {
    it('moves a file to a new location', async () => {
      const src = path.join(testDir, 'source.txt');
      const dest = path.join(testDir, 'dest.txt');
      await fs.writeFile(src, 'content');

      await moveFile(src, dest);
      expect(await fs.pathExists(src)).toBe(false);
      expect(await fs.readFile(dest, 'utf-8')).toBe('content');
    });
  });

  describe('removeDirectorySafe', () => {
    it('removes a directory and its contents', async () => {
      const dir = path.join(testDir, 'to-remove');
      await fs.ensureDir(dir);
      await fs.writeFile(path.join(dir, 'file.txt'), 'content');

      await removeDirectorySafe(dir);
      expect(await fs.pathExists(dir)).toBe(false);
    });

    it('does not throw for non-existent directory', async () => {
      await expect(removeDirectorySafe(path.join(testDir, 'nope'))).resolves.not.toThrow();
    });
  });

  describe('pathExists', () => {
    it('returns true for existing path', async () => {
      expect(await pathExists(testDir)).toBe(true);
    });

    it('returns false for non-existing path', async () => {
      expect(await pathExists(path.join(testDir, 'nope'))).toBe(false);
    });
  });
});
