/**
 * 指令搜索/过滤/分组工具函数
 */
import type { ChatCommand } from '../types.js';

/** 无分组指令的默认组名 */
const DEFAULT_GROUP = '常用';

/**
 * 从输入文本中提取搜索词（去掉触发字符前缀）
 *
 * @returns 输入以 trigger 开头时返回去掉前缀的文本，否则返回 null
 */
export function extractSearchTerm(input: string, trigger: string): string | null {
  if (!input.startsWith(trigger)) {
    return null;
  }
  return input.slice(trigger.length);
}

/**
 * 模糊过滤指令
 *
 * 匹配规则（大小写不敏感）：
 * - command 字段前缀匹配
 * - label 字段包含匹配
 * - keywords 任一包含匹配
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
 * 按分组聚合指令
 *
 * group 为空的指令归入默认组（"常用"）
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
