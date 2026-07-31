/**
 * @fileoverview normalizeAgent unit tests — raw agent config → AgentResource
 */
import { describe, it, expect } from 'vitest';
import { normalizeAgent } from '../../../src/core/resources/agents.js';

describe('normalizeAgent', () => {
  it('normalizes a raw agent object', () => {
    const result = normalizeAgent({
      name: 'coder',
      description: 'A coding agent',
      model: 'deepseek-chat',
      sandbox: true,
      configPath: '/agents/coder/AGENT.md',
    });
    expect(result.name).toBe('coder');
    expect(result.sandbox).toBe(true);
    expect(result.configPath).toBe('/agents/coder/AGENT.md');
  });

  it('falls back to path field for configPath', () => {
    const result = normalizeAgent({ name: 'x', path: '/agents/x' });
    expect(result.configPath).toBe('/agents/x');
  });

  it('defaults missing fields', () => {
    const result = normalizeAgent({ name: 'x' });
    expect(result.model).toBeUndefined();
    expect(result.sandbox).toBeUndefined();
    expect(result.configPath).toBe('');
  });
});
