import { StackDefinition, StackCategory } from './types';
import { STACKS, VALID_STACK_KEYS, CATEGORY_ORDER } from './constants';

/**
 * Returns all registered stack definitions.
 */
export function getAllStacks(): StackDefinition[] {
  return [...STACKS];
}

/**
 * Returns stack definitions filtered by category.
 */
export function getStacksByCategory(category: StackCategory): StackDefinition[] {
  return STACKS.filter((s) => s.category === category);
}

/**
 * Check if a given key is a valid stack key.
 */
export function isValidStack(key: string): boolean {
  return VALID_STACK_KEYS.has(key);
}

/**
 * Validate an array of stack keys, returning any that are invalid.
 */
export function findInvalidStacks(keys: string[]): string[] {
  return keys.filter((k) => !isValidStack(k));
}

/**
 * Resolve an array of stack keys into full StackDefinition objects.
 * Throws if any key is invalid.
 */
export function resolveStacks(keys: string[]): StackDefinition[] {
  const invalid = findInvalidStacks(keys);
  if (invalid.length > 0) {
    throw new Error(`Unknown stack(s): ${invalid.join(', ')}`);
  }
  return keys.map((k) => STACKS.find((s) => s.key === k)!);
}

/**
 * Returns the ordered list of stack categories.
 */
export function getCategories(): StackCategory[] {
  return [...CATEGORY_ORDER];
}
