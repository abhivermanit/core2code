import { describe, expect, it } from 'vitest';
import {
  buildReplacements,
  createTemplateContext,
  renderProjectReadme,
  renderString,
} from '../src/template';

describe('createTemplateContext', () => {
  it('derives year and ISO date from the injected clock', () => {
    const clock = new Date('2026-03-09T12:34:56Z');
    const ctx = createTemplateContext('nutrition-app', clock);
    expect(ctx.PROJECT_NAME).toBe('nutrition-app');
    expect(ctx.CURRENT_YEAR).toBe('2026');
    expect(ctx.CURRENT_DATE).toBe('2026-03-09');
  });
});

describe('renderString', () => {
  const ctx = createTemplateContext('demo', new Date('2030-01-02T00:00:00Z'));

  it('replaces every occurrence of every known token', () => {
    const input = '{{PROJECT_NAME}} / {{PROJECT_NAME}} @ {{CURRENT_YEAR}}-{{CURRENT_DATE}}';
    expect(renderString(input, ctx)).toBe('demo / demo @ 2030-2030-01-02');
  });

  it('leaves unknown tokens untouched', () => {
    const input = 'keep {{UNKNOWN_TOKEN}} but change {{PROJECT_NAME}}';
    expect(renderString(input, ctx)).toBe('keep {{UNKNOWN_TOKEN}} but change demo');
  });

  it('is a no-op when there are no tokens', () => {
    expect(renderString('plain text', ctx)).toBe('plain text');
  });
});

describe('buildReplacements', () => {
  it('maps all three placeholders', () => {
    const ctx = createTemplateContext('x');
    const map = buildReplacements(ctx);
    expect(map.get('{{PROJECT_NAME}}')).toBe('x');
    expect(map.has('{{CURRENT_YEAR}}')).toBe(true);
    expect(map.has('{{CURRENT_DATE}}')).toBe(true);
  });
});

describe('renderProjectReadme', () => {
  it('embeds the project name and leaves no unrendered known tokens', () => {
    const ctx = createTemplateContext('nutrition-app', new Date('2026-07-10T00:00:00Z'));
    const readme = renderProjectReadme(ctx);
    expect(readme).toContain('# nutrition-app');
    expect(readme).toContain('2026-07-10');
    expect(readme).not.toContain('{{PROJECT_NAME}}');
    expect(readme).not.toContain('{{CURRENT_DATE}}');
    expect(readme).not.toContain('{{CURRENT_YEAR}}');
  });
});
