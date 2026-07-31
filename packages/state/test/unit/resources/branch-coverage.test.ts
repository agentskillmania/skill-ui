/**
 * Branch coverage tests for resource normalizers — exercises null/undefined
 * fallback paths that the happy-path tests don't hit.
 */
import { describe, it, expect } from 'vitest';
import { normalizeAgent } from '../../../src/core/resources/agents.js';
import { normalizeSkill } from '../../../src/core/resources/skills.js';
import { normalizeCrew } from '../../../src/core/resources/crews.js';
import { normalizeSession } from '../../../src/core/resources/sessions.js';

describe('normalizeAgent — branch coverage', () => {
  it('handles null name (?? fallback)', () => {
    const result = normalizeAgent({ name: null });
    expect(result.name).toBe('');
  });

  it('handles undefined name (?? fallback)', () => {
    const result = normalizeAgent({});
    expect(result.name).toBe('');
  });

  it('handles null configPath and null path (?? fallback)', () => {
    const result = normalizeAgent({ name: 'x', configPath: null, path: null });
    expect(result.configPath).toBe('');
  });
});

describe('normalizeSession — branch coverage', () => {
  it('handles null id', () => {
    const result = normalizeSession({ id: null });
    expect(result.id).toBe('');
  });

  it('handles null status (defaults to idle)', () => {
    const result = normalizeSession({ id: 's1', status: null });
    expect(result.status).toBe('idle');
  });

  it('handles undefined status', () => {
    const result = normalizeSession({ id: 's1' });
    expect(result.status).toBe('idle');
  });

  it('handles null createdAt', () => {
    const result = normalizeSession({ id: 's1', createdAt: null });
    expect(result.createdAt).toBe('');
  });

  it('handles null updatedAt', () => {
    const result = normalizeSession({ id: 's1', updatedAt: null });
    expect(result.updatedAt).toBe('');
  });

  it('handles null tokensIn (stays undefined)', () => {
    const result = normalizeSession({ id: 's1', tokensIn: null });
    expect(result.tokensIn).toBeUndefined();
  });

  it('preserves tokensTotal when present', () => {
    const result = normalizeSession({ id: 's1', tokensTotal: 150 });
    expect(result.tokensTotal).toBe(150);
  });

  it('preserves contextWindow when present', () => {
    const result = normalizeSession({ id: 's1', contextWindow: 128000 });
    expect(result.contextWindow).toBe(128000);
  });

  it('preserves estimatedContextSize when present', () => {
    const result = normalizeSession({ id: 's1', estimatedContextSize: 50000 });
    expect(result.estimatedContextSize).toBe(50000);
  });

  it('handles null agentName', () => {
    const result = normalizeSession({ id: 's1', agentName: null });
    expect(result.agentName).toBe('');
  });
});

describe('normalizeSkill — branch coverage', () => {
  it('handles null name', () => {
    const result = normalizeSkill({ name: null });
    expect(result.name).toBe('');
  });

  it('handles null description', () => {
    const result = normalizeSkill({ name: 'x', description: null });
    expect(result.description).toBe('');
  });

  it('handles null configPath and null path', () => {
    const result = normalizeSkill({ name: 'x', description: 'd', configPath: null, path: null });
    expect(result.configPath).toBe('');
  });
});

describe('normalizeCrew — branch coverage', () => {
  it('handles null name', () => {
    const result = normalizeCrew({ name: null });
    expect(result.name).toBe('');
  });

  it('handles null primaryAgent and null primary_agent', () => {
    const result = normalizeCrew({ name: 'x', primaryAgent: null, primary_agent: null });
    expect(result.primaryAgent).toBe('');
  });

  it('handles undefined agentDefs (not present)', () => {
    const result = normalizeCrew({ name: 'x' });
    expect(result.agentDefs).toEqual([]);
  });

  it('handles null configPath and null path', () => {
    const result = normalizeCrew({ name: 'x', configPath: null, path: null });
    expect(result.configPath).toBe('');
  });
});
