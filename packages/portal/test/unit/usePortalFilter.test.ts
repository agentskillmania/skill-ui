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

  it('filters agents by description', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, 'reviews'));
    expect(result.current.filteredAgents).toHaveLength(1);
    expect(result.current.filteredAgents[0].name).toBe('Code Reviewer');
  });

  it('returns no results when query does not match', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, 'zzzzzz'));
    expect(result.current.filteredAgents).toHaveLength(0);
    expect(result.current.filteredSkills).toHaveLength(0);
    expect(result.current.filteredSessions).toHaveLength(0);
    expect(result.current.searchResults.agents).toHaveLength(0);
    expect(result.current.searchResults.skills).toHaveLength(0);
    expect(result.current.searchResults.sessions).toHaveLength(0);
  });

  it('searches session by agent name', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, 'Code'));
    expect(result.current.filteredSessions).toHaveLength(1);
    expect(result.current.filteredSessions[0].agentName).toBe('Code Reviewer');
  });

  it('searches session by workspace path', () => {
    const { result } = renderHook(() => usePortalFilter(mockData, '/tmp'));
    expect(result.current.filteredSessions).toHaveLength(1);
  });

  it('handles agents with undefined description', () => {
    const dataWithUndefinedDesc = {
      ...mockData,
      agents: [
        ...mockData.agents,
        {
          id: 'a3',
          name: 'NoDesc',
          description: undefined,
          source: 'custom' as const,
          skillCount: 0,
        },
      ],
    };
    const { result } = renderHook(() => usePortalFilter(dataWithUndefinedDesc, 'nodesc'));
    expect(result.current.filteredAgents).toHaveLength(1);
    expect(result.current.filteredAgents[0].name).toBe('NoDesc');
  });

  it('handles skills with undefined description', () => {
    const dataWithUndefinedDesc = {
      ...mockData,
      skills: [...mockData.skills, { id: 's3', name: 'NoDescSkill', description: undefined }],
    };
    const { result } = renderHook(() => usePortalFilter(dataWithUndefinedDesc, 'nodesc'));
    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].name).toBe('NoDescSkill');
  });
});
