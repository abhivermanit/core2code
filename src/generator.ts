import path from 'node:path';
import {
  FRAMEWORK_OVERVIEW_FILE,
  PROJECT_GITIGNORE,
  TEMPLATE_GITIGNORE_SOURCE,
  TEMPLATE_OVERVIEW_FILE,
  resolveTemplateRoot,
} from './constants';
import { DirectoryExistsError } from './errors';
import {
  copyDirectory,
  ensureDirectory,
  isDirectoryEmpty,
  moveFile,
  pathExists,
  removeDirectorySafe,
  writeFile,
} from './filesystem';
import { initRepository, isGitAvailable } from './git';
import {
  applyContextToTree,
  createTemplateContext,
  renderProjectReadme,
} from './template';
import { assertValidProjectName } from './validation';
import type { ScaffoldOptions, ScaffoldResult, TemplateContext } from './types';

export async function scaffoldProject(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const { projectName, cwd, overwrite, initGit, logger } = options;

  assertValidProjectName(projectName);

  const projectPath = path.resolve(cwd, projectName);
  const templateRoot = resolveTemplateRoot();
  const context = createTemplateContext(projectName);

  if (!overwrite && !(await isDirectoryEmpty(projectPath))) {
    throw new DirectoryExistsError(projectPath);
  }

  const { created } = await ensureDirectory(projectPath, overwrite);

  try {
    await logger.step('Copying Core2Code template', async () => {
      await copyDirectory(templateRoot, projectPath);
      await adjustCopiedTree(projectPath, templateRoot);
    });

    const filesProcessed = await logger.step('Applying project details', async () => {
      const modified = await applyContextToTree(projectPath, context);
      await writeGeneratedReadme(projectPath, context);
      return modified;
    });

    const gitInitialized = await maybeInitGit(projectPath, initGit, logger);

    return {
      projectName,
      projectPath,
      filesProcessed,
      gitInitialized,
    };
  } catch (error) {
    if (created) {
      await removeDirectorySafe(projectPath);
      logger.warn(`Cleaned up partially created directory: ${projectPath}`);
    }
    throw error;
  }
}

async function adjustCopiedTree(projectPath: string, templateRoot: string): Promise<void> {
  const copiedOverview = path.join(projectPath, TEMPLATE_OVERVIEW_FILE);
  if (await pathExists(copiedOverview)) {
    await moveFile(copiedOverview, path.join(projectPath, FRAMEWORK_OVERVIEW_FILE));
  }

  const rootGitignore = path.join(projectPath, PROJECT_GITIGNORE);
  if (!(await pathExists(rootGitignore))) {
    const templateGitignore = path.join(templateRoot, TEMPLATE_GITIGNORE_SOURCE);
    if (await pathExists(templateGitignore)) {
      await copyDirectory(templateGitignore, rootGitignore);
    }
  }
}

async function writeGeneratedReadme(
  projectPath: string,
  context: TemplateContext,
): Promise<void> {
  const readme = renderProjectReadme(context);
  await writeFile(path.join(projectPath, TEMPLATE_OVERVIEW_FILE), readme);
}

async function maybeInitGit(
  projectPath: string,
  initGit: boolean,
  logger: ScaffoldOptions['logger'],
): Promise<boolean> {
  if (!initGit) {
    return false;
  }
  if (!isGitAvailable()) {
    logger.warn('git not found on PATH — skipping repository initialization.');
    return false;
  }
  return logger.step('Initializing git repository', async () => {
    const ok = initRepository(projectPath);
    if (!ok) {
      logger.warn('git init failed — continuing without a repository.');
    }
    return ok;
  });
}
