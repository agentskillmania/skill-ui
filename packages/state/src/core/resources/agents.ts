/**
 * @fileoverview Agent normalizer — raw agent config payload → AgentResource
 */
import type { AgentResource, RawResource } from './types.js';

export function normalizeAgent(raw: RawResource): AgentResource {
  return {
    name: String(raw.name ?? ''),
    description: raw.description as string | undefined,
    model: raw.model as string | undefined,
    thinking: raw.thinking as AgentResource['thinking'],
    sandbox: raw.sandbox as boolean | undefined,
    instructions: raw.instructions as string | undefined,
    skillDirs: raw.skillDirs as string[] | undefined,
    mcpPaths: raw.mcpPaths as string[] | undefined,
    configPath: String(raw.configPath ?? raw.path ?? ''),
  };
}

export function normalizeAgentList(rawList: RawResource[]): AgentResource[] {
  return rawList.map(normalizeAgent);
}
