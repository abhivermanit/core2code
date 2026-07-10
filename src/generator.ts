import path from 'path';
import { GeneratorOptions, GeneratorResult } from './types';
import { resolveStacks } from './registry';
import { copyCommonTemplate, copyStackTemplate, applyTemplateVariables, getTemplateVariables } from './template';
import { ensureDirectory, isDirectoryEmpty, removeDirectorySafe, pathExists } from './filesystem';
import { isGitAvailable, initRepository } from './git';
import { FileSystemError } from './errors';

/**
 * Generate a new project based on the given configuration.
 */
export async function generateProject(options: GeneratorOptions): Promise<GeneratorResult> {
  const { config, logger } = options;
  const { projectName, stacks, outputDir, initGit, force } = config;

  // Check if output directory already exists
  const exists = await pathExists(outputDir);
  if (exists) {
    if (force) {
      logger.warn(`Removing existing directory: ${outputDir}`);
      await removeDirectorySafe(outputDir);
    } else {
      const empty = await isDirectoryEmpty(outputDir);
      if (!empty) {
        throw new FileSystemError(
          `Directory "${outputDir}" already exists and is not empty. Use --force to overwrite.`,
        );
      }
    }
  }

  // Create output directory
  await ensureDirectory(outputDir);

  // Copy common template
  logger.startSpinner('Copying project template...');
  await copyCommonTemplate(outputDir);

  // Resolve and copy stack templates
  const stackDefs = resolveStacks(stacks);
  for (const stack of stackDefs) {
    await copyStackTemplate(stack, outputDir);
  }
  logger.stopSpinner(true, 'Template files copied');

  // Post-copy normalization:
  // 1. Rename framework README to CORE2CODE.md (project gets its own README)
  // 2. Rename _gitignore to .gitignore (npm strips .gitignore from tarballs)
  const fs = await import('fs-extra');
  const readmePath = path.join(outputDir, 'README.md');
  const core2codePath = path.join(outputDir, 'CORE2CODE.md');
  if (await pathExists(readmePath)) {
    await fs.default.move(readmePath, core2codePath, { overwrite: true });
  }
  const gitignoreTemplate = path.join(outputDir, '_gitignore');
  const gitignoreDest = path.join(outputDir, '.gitignore');
  if (await pathExists(gitignoreTemplate)) {
    await fs.default.move(gitignoreTemplate, gitignoreDest, { overwrite: true });
  }

  // Apply template variables
  logger.startSpinner('Applying template variables...');
  const variables = getTemplateVariables(projectName, stacks);
  await applyTemplateVariables(outputDir, variables);

  // Generate project README
  const readmeContent = `# ${projectName}\n\n> Bootstrapped with the **Core2Code** engineering framework.\n\n## Getting Started\n\nSee \`PROJECT_BOOTSTRAP.md\` for the complete setup checklist.\n\n---\n\nGenerated on ${new Date().toISOString().slice(0, 10)}\n`;
  await fs.default.writeFile(path.join(outputDir, 'README.md'), readmeContent, 'utf8');

  // Generate STACK.md
  if (stacks.length > 0) {
    const stackRows = stackDefs.map(s => `| ${s.label} | ${s.category} | ${s.description} |`).join('\n');
    const stackMd = `# Stack\n\nSelected technology stack for **${projectName}**.\n\n| Technology | Category | Description |\n| --- | --- | --- |\n${stackRows}\n`;
    await fs.default.writeFile(path.join(outputDir, 'STACK.md'), stackMd, 'utf8');
  }

  logger.stopSpinner(true, 'Template variables applied');

  // Initialize git repository
  if (initGit) {
    if (isGitAvailable()) {
      logger.startSpinner('Initializing git repository...');
      initRepository(outputDir);
      logger.stopSpinner(true, 'Git repository initialized');
    } else {
      logger.warn('Git is not available. Skipping repository initialization.');
    }
  }

  // Summary
  logger.success(`Created ${projectName} at ${outputDir}`);
  if (stacks.length > 0) {
    logger.plain(`  Stacks: ${stacks.join(', ')}`);
  }

  return {
    projectPath: outputDir,
    stacks,
  };
}
