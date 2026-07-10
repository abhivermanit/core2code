import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  copyDirectory,
  ensureDirectory,
  isBinaryFile,
  isDirectoryEmpty,
  listFilesRecursively,
  moveFile,
  removeDirectorySafe,
  replaceInFile,
  writeFile,
} from '../src/filesystem';

let workdir: string;

beforeEach(async () => {
  workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'c2c-fs-'));
});

afterEach(async () => {
  await removeDirectorySafe(workdir);
});

describe('ensureDirectory / isDirectoryEmpty', () => {
  it('creates a new directory and reports created=true', async () => {
    const dir = path.join(workdir, 'fresh');
    const result = await ensureDirectory(dir, false);
    expect(result.created).toBe(true);
    expect(await fs.pathExists(dir)).toBe(true);
  });

  it('treats a missing or empty directory as empty', async () => {
    const dir = path.join(workdir, 'empty');
    expect(await isDirectoryEmpty(dir)).toBe(true);
    await fs.ensureDir(dir);
    expect(await isDirectoryEmpty(dir)).toBe(true);
  });

  it('detects a non-empty directory', async () => {
    const dir = path.join(workdir, 'full');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'a.txt'), 'x');
    expect(await isDirectoryEmpty(dir)).toBe(false);
  });

  it('empties an existing directory when overwrite=true', async () => {
    const dir = path.join(workdir, 'to-empty');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'old.txt'), 'stale');
    const result = await ensureDirectory(dir, true);
    expect(result.created).toBe(false);
    expect(await isDirectoryEmpty(dir)).toBe(true);
  });
});

describe('copyDirectory', () => {
  it('copies a tree but skips excluded entries (.git)', async () => {
    const src = path.join(workdir, 'src');
    await fs.ensureDir(path.join(src, 'sub'));
    await fs.ensureDir(path.join(src, '.git'));
    await fs.writeFile(path.join(src, 'sub', 'file.txt'), 'hello');
    await fs.writeFile(path.join(src, '.git', 'HEAD'), 'ref');
    const dest = path.join(workdir, 'dest');
    await copyDirectory(src, dest);
    expect(await fs.pathExists(path.join(dest, 'sub', 'file.txt'))).toBe(true);
    expect(await fs.pathExists(path.join(dest, '.git'))).toBe(false);
  });
});

describe('listFilesRecursively', () => {
  it('returns every file and no directories', async () => {
    await fs.ensureDir(path.join(workdir, 'a', 'b'));
    await fs.writeFile(path.join(workdir, 'top.txt'), '1');
    await fs.writeFile(path.join(workdir, 'a', 'mid.txt'), '2');
    await fs.writeFile(path.join(workdir, 'a', 'b', 'deep.txt'), '3');
    const files = await listFilesRecursively(workdir);
    expect(files).toHaveLength(3);
    expect(files.every((f) => f.endsWith('.txt'))).toBe(true);
  });
});

describe('replaceInFile', () => {
  it('replaces tokens and reports modification', async () => {
    const file = path.join(workdir, 'doc.md');
    await fs.writeFile(file, 'Hello {{PROJECT_NAME}} and {{PROJECT_NAME}}');
    const changed = await replaceInFile(
      file,
      new Map([['{{PROJECT_NAME}}', 'demo']]),
    );
    expect(changed).toBe(true);
    expect(await fs.readFile(file, 'utf8')).toBe('Hello demo and demo');
  });

  it('does not write when no token is present', async () => {
    const file = path.join(workdir, 'plain.md');
    await fs.writeFile(file, 'nothing to replace');
    const before = (await fs.stat(file)).mtimeMs;
    const changed = await replaceInFile(file, new Map([['{{X}}', 'y']]));
    expect(changed).toBe(false);
    const after = (await fs.stat(file)).mtimeMs;
    expect(after).toBe(before);
  });

  it('skips binary files', async () => {
    const file = path.join(workdir, 'logo.png');
    await fs.writeFile(file, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const changed = await replaceInFile(file, new Map([['PNG', 'x']]));
    expect(changed).toBe(false);
  });
});

describe('isBinaryFile', () => {
  it('classifies by extension', () => {
    expect(isBinaryFile('/x/y.png')).toBe(true);
    expect(isBinaryFile('/x/y.md')).toBe(false);
    expect(isBinaryFile('/x/Y.PNG')).toBe(true);
  });
});

describe('writeFile / moveFile', () => {
  it('creates parent directories on write', async () => {
    const file = path.join(workdir, 'nested', 'deep', 'out.txt');
    await writeFile(file, 'content');
    expect(await fs.readFile(file, 'utf8')).toBe('content');
  });

  it('moves a file, overwriting the destination', async () => {
    const from = path.join(workdir, 'from.txt');
    const to = path.join(workdir, 'to.txt');
    await fs.writeFile(from, 'moved');
    await fs.writeFile(to, 'old');
    await moveFile(from, to);
    expect(await fs.pathExists(from)).toBe(false);
    expect(await fs.readFile(to, 'utf8')).toBe('moved');
  });
});
