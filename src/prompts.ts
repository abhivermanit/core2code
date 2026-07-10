import prompts from 'prompts';
import { PromptAnswers, StackCategory } from './types';
import { getStacksByCategory, getCategories } from './registry';
import { CATEGORY_LABELS } from './constants';
import { validateProjectName } from './validation';
import { AbortedError } from './errors';

/**
 * Run the interactive prompt wizard to collect project configuration.
 */
export async function runPrompts(defaultName?: string): Promise<PromptAnswers> {
  const selectedStacks: string[] = [];

  // Prompt for project name
  const nameResponse = await prompts(
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: defaultName || '',
      validate: (value: string) => {
        const result = validateProjectName(value);
        if (!result.valid) {
          return result.errors[0] || 'Invalid project name';
        }
        return true;
      },
    },
    { onCancel: () => { throw new AbortedError(); } },
  );

  if (!nameResponse.projectName) {
    throw new AbortedError();
  }

  // Prompt for stacks by category
  const categories = getCategories();

  for (const category of categories) {
    const stacks = getStacksByCategory(category);
    if (stacks.length === 0) continue;

    const choices = stacks.map((s) => ({
      title: `${s.label} — ${s.description}`,
      value: s.key,
    }));

    // Add "None" option
    choices.unshift({ title: 'None', value: '' });

    const response = await prompts(
      {
        type: 'select',
        name: 'stack',
        message: `${CATEGORY_LABELS[category]}:`,
        choices,
        initial: 0,
      },
      { onCancel: () => { throw new AbortedError(); } },
    );

    if (response.stack) {
      selectedStacks.push(response.stack);
    }
  }

  return {
    projectName: nameResponse.projectName as string,
    stacks: selectedStacks,
  };
}
