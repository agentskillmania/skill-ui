import { describe, it, expect } from 'vitest';
import { normalizeSkill, normalizeSkillList } from '../../../src/core/resources/skills.js';
import { normalizeCrew, normalizeCrewList } from '../../../src/core/resources/crews.js';
import { normalizeAgentList } from '../../../src/core/resources/agents.js';
import { normalizeSessionList, findSession } from '../../../src/core/resources/sessions.js';

describe('normalizeSkill', () => {
  it('normalizes a raw skill object', () => {
    const result = normalizeSkill({
      name: 'my-skill',
      description: 'A test skill',
      files: ['SKILL.md'],
      configPath: '/skills/my-skill',
    });
    expect(result.name).toBe('my-skill');
    expect(result.description).toBe('A test skill');
    expect(result.files).toEqual(['SKILL.md']);
    expect(result.configPath).toBe('/skills/my-skill');
  });

  it('falls back to path field for configPath', () => {
    const result = normalizeSkill({ name: 'x', description: 'd', path: '/skills/x' });
    expect(result.configPath).toBe('/skills/x');
  });

  it('defaults missing fields', () => {
    const result = normalizeSkill({ name: 'x' });
    expect(result.description).toBe('');
    expect(result.configPath).toBe('');
    expect(result.files).toBeUndefined();
  });
});

describe('normalizeSkillList', () => {
  it('normalizes an array of raw skills', () => {
    const result = normalizeSkillList([
      { name: 's1', description: 'd1' },
      { name: 's2', description: 'd2' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('s1');
    expect(result[1].name).toBe('s2');
  });

  it('returns empty array for empty input', () => {
    expect(normalizeSkillList([])).toEqual([]);
  });
});

describe('normalizeCrew', () => {
  it('normalizes a raw crew object', () => {
    const result = normalizeCrew({
      name: 'demo-crew',
      description: 'A crew',
      primaryAgent: 'orchestrator',
      sandbox: true,
      agentDefs: ['orchestrator', 'coder'],
      configPath: '/crews/demo',
    });
    expect(result.name).toBe('demo-crew');
    expect(result.primaryAgent).toBe('orchestrator');
    expect(result.sandbox).toBe(true);
    expect(result.agentDefs).toEqual(['orchestrator', 'coder']);
  });

  it('handles primary_agent snake_case fallback', () => {
    const result = normalizeCrew({ name: 'x', primary_agent: 'lead' });
    expect(result.primaryAgent).toBe('lead');
  });

  it('defaults agentDefs to empty array', () => {
    const result = normalizeCrew({ name: 'x' });
    expect(result.agentDefs).toEqual([]);
  });

  it('defaults agentDefs to empty array when not array', () => {
    const result = normalizeCrew({ name: 'x', agentDefs: 'not-an-array' });
    expect(result.agentDefs).toEqual([]);
  });

  it('falls back to path field for configPath', () => {
    const result = normalizeCrew({ name: 'x', primaryAgent: 'a', path: '/crews/x' });
    expect(result.configPath).toBe('/crews/x');
  });
});

describe('normalizeCrewList', () => {
  it('normalizes an array of raw crews', () => {
    const result = normalizeCrewList([
      { name: 'c1', primaryAgent: 'a' },
      { name: 'c2', primary_agent: 'b' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].primaryAgent).toBe('a');
    expect(result[1].primaryAgent).toBe('b');
  });
});

describe('normalizeAgentList', () => {
  it('normalizes an array of raw agents', () => {
    const result = normalizeAgentList([
      { name: 'a1', model: 'm1' },
      { name: 'a2', model: 'm2' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a1');
    expect(result[1].model).toBe('m2');
  });
});

describe('normalizeSessionList', () => {
  it('normalizes an array of raw sessions', () => {
    const result = normalizeSessionList([
      { id: 's1', agentName: 'a' },
      { id: 's2', agentName: 'b' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('s1');
    expect(result[1].agentName).toBe('b');
  });
});

describe('findSession', () => {
  it('finds session by id', () => {
    const sessions = normalizeSessionList([
      { id: 's1', agentName: 'a' },
      { id: 's2', agentName: 'b' },
    ]);
    const found = findSession(sessions, 's2');
    expect(found?.agentName).toBe('b');
  });

  it('returns undefined for unknown id', () => {
    const sessions = normalizeSessionList([{ id: 's1', agentName: 'a' }]);
    expect(findSession(sessions, 'nope')).toBeUndefined();
  });

  it('returns undefined for empty list', () => {
    expect(findSession([], 'any')).toBeUndefined();
  });
});
