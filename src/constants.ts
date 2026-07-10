import path from 'node:path';
import fs from 'fs-extra';
import { TemplateNotFoundError } from './errors';

export const CLI_NAME = 'create-core2code';
export const CLI_VERSION = '0.1.0';
export const CLI_DESCRIPTION =
  'Scaffold a new project using the Core2Code engineering framework.';

export const PLACEHOLDERS = {
  PROJECT_NAME: '{{PROJECT_NAME}}',
  CURRENT_YEAR: '{{CURRENT_YEAR}}',
  CURRENT_DATE: '{{CURRENT_DATE}}',
} as const;

export const BINARY_EXTENSIONS: ReadonlySet<string> = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.svg',
  '.pdf', '.zip', '.gz', '.tar', '.7z',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mov', '.mp3', '.wav',
]);

export const RESERVED_NAMES: ReadonlySet<string> = new Set([
  '.', '..', 'node_modules', '.git', 'con', 'prn', 'aux', 'nul',
]);

export const MAX_PROJECT_NAME_LENGTH = 214;

export const COPY_EXCLUDE: ReadonlySet<string> = new Set(['.git', 'node_modules']);

export const TEMPLATE_OVERVIEW_FILE = 'README.md';
export const FRAMEWORK_OVERVIEW_FILE = 'CORE2CODE.md';

export const TEMPLATE_GITIGNORE_SOURCE = path.join('10-templates', '.gitignore');
export const PROJECT_GITIGNORE = '.gitignore';

export function resolveTemplateRoot(fromDir: string = __dirname): string {
  const candidates = [
    path.resolve(fromDir, '..', 'template'),
    path.resolve(fromDir, '..', '..', 'template'),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found === undefined) {
    throw new TemplateNotFoundError(candidates);
  }
  return found;
}
