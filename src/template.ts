import path from 'path';
import { TEMPLATE_DIR } from './constants';
import { StackDefinition } from './types';
import { copyDirectory, replaceInFile, listFilesRecursively, isBinaryFile } from './filesystem';

/**
 * Copy the common template to the project directory.
 */
export async function copyCommonTemplate(projectDir: string): Promise<void> {
  const commonDir = path.join(TEMPLATE_DIR, 'common');
  await copyDirectory(commonDir, projectDir);
}

/**
 * Copy a stack-specific template to the project directory.
 */
export async function copyStackTemplate(
  stack: StackDefinition,
  projectDir: string,
): Promise<void> {
  const templateDir = path.join(TEMPLATE_DIR, stack.templateDir);
  await copyDirectory(templateDir, projectDir);
}

/**
 * Replace template placeholders in all text files within a directory.
 */
export async function applyTemplateVariables(
  projectDir: string,
  variables: Record<string, string>,
): Promise<void> {
  const files = await listFilesRecursively(projectDir);

  for (const file of files) {
    const filePath = path.join(projectDir, file);

    if (isBinaryFile(filePath)) {
      continue;
    }

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      await replaceInFile(filePath, new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
  }
}

/**
 * Get the default template variables for a project.
 * Replaces {{PROJECT_NAME}}, {{CURRENT_YEAR}}, {{CURRENT_DATE}}, {{PACKAGE_MANAGER}}.
 */
export function getTemplateVariables(projectName: string, stacks: string[]): Record<string, string> {
  const now = new Date();
  return {
    PROJECT_NAME: projectName,
    CURRENT_YEAR: String(now.getFullYear()),
    CURRENT_DATE: now.toISOString().slice(0, 10),
    PACKAGE_MANAGER: 'pnpm',
  };
}
