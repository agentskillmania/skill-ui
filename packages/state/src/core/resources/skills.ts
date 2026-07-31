/**
 * @fileoverview Skill normalizer — raw skill config payload → SkillResource
 */
import type { SkillResource, RawResource } from './types.js';

export function normalizeSkill(raw: RawResource): SkillResource {
  return {
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    files: raw.files as string[] | undefined,
    configPath: String(raw.configPath ?? raw.path ?? ''),
  };
}

export function normalizeSkillList(rawList: RawResource[]): SkillResource[] {
  return rawList.map(normalizeSkill);
}
