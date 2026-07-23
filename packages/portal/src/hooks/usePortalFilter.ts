import { useMemo } from 'react';

import type { AgentItem, SkillItem, SessionItem, SearchResults } from '../types.js';

interface PortalData {
  agents: AgentItem[];
  skills: SkillItem[];
  sessions: SessionItem[];
}

interface UsePortalFilterResult {
  filteredAgents: AgentItem[];
  filteredSkills: SkillItem[];
  filteredSessions: SessionItem[];
  searchResults: SearchResults;
}

function matchesQuery(item: { name?: string; description?: string }, query: string): boolean {
  const q = query.toLowerCase();
  return (
    (item.name?.toLowerCase().includes(q) ?? false) ||
    (item.description?.toLowerCase().includes(q) ?? false)
  );
}

export function usePortalFilter(data: PortalData, query: string): UsePortalFilterResult {
  return useMemo(() => {
    const q = query.trim().toLowerCase();

    const filteredAgents = q ? data.agents.filter((a) => matchesQuery(a, q)) : data.agents;

    const filteredSkills = q ? data.skills.filter((s) => matchesQuery(s, q)) : data.skills;

    const filteredSessions = q
      ? data.sessions.filter(
          (s) => s.agentName.toLowerCase().includes(q) || s.workspacePath.toLowerCase().includes(q)
        )
      : data.sessions;

    const searchResults: SearchResults = {
      skills: filteredSkills.slice(0, 5).map((s) => ({
        type: 'skill',
        id: s.id,
        title: s.name,
        subtitle: s.description,
      })),
      agents: filteredAgents.slice(0, 5).map((a) => ({
        type: 'agent',
        id: a.id,
        title: a.name,
        subtitle: a.description,
      })),
      sessions: filteredSessions.slice(0, 5).map((se) => ({
        type: 'session',
        id: se.id,
        title: se.agentName,
        subtitle: se.workspacePath,
      })),
    };

    return {
      filteredAgents,
      filteredSkills,
      filteredSessions,
      searchResults,
    };
  }, [data.agents, data.skills, data.sessions, query]);
}
