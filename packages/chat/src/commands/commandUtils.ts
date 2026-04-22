/**
 * Command search/filter/group utility functions
 */
import type { ChatCommand } from '../types.js';

/** Default group name for commands without a group */
const DEFAULT_GROUP = '常用';

/**
 * Extract search term from input text (remove trigger character prefix)
 *
 * @returns Returns text with prefix removed when input starts with trigger, otherwise null
 */
export function extractSearchTerm(input: string, trigger: string): string | null {
  if (!input.startsWith(trigger)) {
    return null;
  }
  return input.slice(trigger.length);
}

/**
 * Fuzzy filter commands
 *
 * Matching rules (case-insensitive):
 * - command field prefix match
 * - label field contains match
 * - keywords any contains match
 */
export function filterCommands(commands: ChatCommand[], searchTerm: string): ChatCommand[] {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    return commands;
  }

  return commands.filter((cmd) => {
    // command 前缀匹配
    if (cmd.command.toLowerCase().startsWith(term)) {
      return true;
    }

    // label 包含匹配
    if (cmd.label.toLowerCase().includes(term)) {
      return true;
    }

    // keywords 任一包含匹配
    if (cmd.keywords?.some((kw) => kw.toLowerCase().includes(term))) {
      return true;
    }

    return false;
  });
}

/**
 * Aggregate commands by group
 *
 * Commands with empty group are placed in default group ("常用")
 */
export function groupCommands(commands: ChatCommand[]): Map<string, ChatCommand[]> {
  const groups = new Map<string, ChatCommand[]>();

  for (const cmd of commands) {
    const groupName = cmd.group || DEFAULT_GROUP;
    const group = groups.get(groupName);

    if (group) {
      group.push(cmd);
    } else {
      groups.set(groupName, [cmd]);
    }
  }

  return groups;
}
