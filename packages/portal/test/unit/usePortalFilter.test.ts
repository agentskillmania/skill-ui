import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePortalFilter } from '../../src/hooks/usePortalFilter.js';

const mockData = {
  agents: [
    {
      id: 'a1',
      name: 'Code Reviewer',
      description: 'Reviews code',
      source: 'custom' as const,
      skillCount: 2,
    },
    {
      id: 'a2',
      name: 'Translator',
      description: 'Translates text',
      source: 'builtin' as const,
      skillCount: 0,
    },
  ],
  skills: [
    { id: 's1', name: 'Web Search', description: 'Search the web' },
    { id: 's2', name: 'File Reader', description: 'Read files' },
  ],
  sessions: [
    {
      id: 'se1',
      agentId: 'a1',
      agentName: 'Code Reviewer',
      workspacePath: '/tmp/review',
      lastActive: '2h',
      errorCount: 0,
      tokenCount: 100,
    },
  ],
};

describe('usePortalFilter', () => {
  it('returns all data when query is empty', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, ''));
    expect(result.current.filteredAgents).toHaveLength(2);
    expect(result.current.filteredSkills).toHaveLength(2);
    expect(result.current.filteredSessions).toHaveLength(1);
  });

  it('filters agents by name', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, 'code'));
    expect(result.current.filteredAgents).toHaveLength(1);
    expect(result.current.filteredAgents[0].name).toBe('Code Reviewer');
  });

  it('filters skills by description', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, 'read'));
    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].name).toBe('File Reader');
  });

  it('limits search results to 5 per type', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, ''));
    expect(result.current.searchResults.agents.length).toBeLessThanOrEqual(5);
    expect(result.current.searchResults.skills.length).toBeLessThanOrEqual(5);
    expect(result.current.searchResults.sessions.length).toBeLessThanOrEqual(5);
  });
});
