/**
 * @fileoverview Crew normalizer — raw crew config payload → CrewResource
 */
import type { CrewResource, RawResource } from './types.js';

export function normalizeCrew(raw: RawResource): CrewResource {
  return {
    name: String(raw.name ?? ''),
    description: raw.description as string | undefined,
    primaryAgent: String(raw.primaryAgent ?? raw.primary_agent ?? ''),
    memory: raw.memory as string | undefined,
    agentDefs: Array.isArray(raw.agentDefs) ? (raw.agentDefs as string[]) : [],
    skillDirs: raw.skillDirs as string[] | undefined,
    configPath: String(raw.configPath ?? raw.path ?? ''),
  };
}

export function normalizeCrewList(rawList: RawResource[]): CrewResource[] {
  return rawList.map(normalizeCrew);
}
