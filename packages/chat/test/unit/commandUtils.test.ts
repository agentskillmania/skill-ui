/**
 * commandUtils utility function unit tests
 */
import { describe, it, expect } from 'vitest';
import {
  extractSearchTerm,
  filterCommands,
  groupCommands,
} from '../../src/commands/commandUtils.js';
import type { ChatCommand } from '../../src/types.js';

const mockCommands: ChatCommand[] = [
  {
    id: '1',
    label: '搜索',
    command: 'search',
    description: '搜索知识库',
    group: '工具',
    keywords: ['查询', 'find'],
  },
  { id: '2', label: '分析', command: 'analyze', description: '分析数据', group: '工具' },
  {
    id: '3',
    label: '新建文件',
    command: 'new',
    description: '创建新文件',
    group: '文件',
    keywords: ['创建'],
  },
  { id: '4', label: '帮助', command: 'help', description: '查看帮助' },
  { id: '5', label: '清除', command: 'clear', description: '清除对话', keywords: ['清空'] },
];

describe('extractSearchTerm', () => {
  it('returns text with prefix removed when starting with trigger', () => {
    expect(extractSearchTerm('/search', '/')).toBe('search');
  });

  it('returns empty string when starting with trigger but no subsequent text', () => {
    expect(extractSearchTerm('/', '/')).toBe('');
  });

  it('returns null when not starting with trigger', () => {
    expect(extractSearchTerm('hello', '/')).toBeNull();
  });

  it('empty string does not start with trigger', () => {
    expect(extractSearchTerm('', '/')).toBeNull();
  });

  it('supports custom trigger', () => {
    expect(extractSearchTerm('>search', '>')).toBe('search');
  });

  it('trigger in the middle does not count', () => {
    expect(extractSearchTerm('hello/world', '/')).toBeNull();
  });
});

describe('filterCommands', () => {
  it('empty search term returns all commands', () => {
    expect(filterCommands(mockCommands, '')).toEqual(mockCommands);
  });

  it('whitespace search term returns all commands', () => {
    expect(filterCommands(mockCommands, '   ')).toEqual(mockCommands);
  });

  it('matches by command prefix', () => {
    const result = filterCommands(mockCommands, 'sea');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('command prefix match is case-insensitive', () => {
    const result = filterCommands(mockCommands, 'SEA');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('matches by label contains', () => {
    const result = filterCommands(mockCommands, '新建');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('matches by keywords contains', () => {
    const result = filterCommands(mockCommands, '查询');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('matches by keywords partial match', () => {
    const result = filterCommands(mockCommands, '清空');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('returns empty array when no match', () => {
    expect(filterCommands(mockCommands, 'xyz')).toHaveLength(0);
  });

  it('multiple fields can match', () => {
    // "se" 匹配 command: "search"
    const result = filterCommands(mockCommands, 'se');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('empty command list', () => {
    expect(filterCommands([], 'search')).toHaveLength(0);
  });

  it('commands with undefined keywords are not affected', () => {
    const cmds: ChatCommand[] = [{ id: '1', label: '测试', command: 'test' }];
    expect(filterCommands(cmds, 'test')).toHaveLength(1);
  });
});

describe('groupCommands', () => {
  it('groups by group', () => {
    const groups = groupCommands(mockCommands);
    expect(groups.get('工具')).toBeDefined();
    expect(groups.get('工具')!.length).toBe(2);
    expect(groups.get('文件')).toBeDefined();
    expect(groups.get('文件')!.length).toBe(1);
  });

  it('commands without group are placed in "常用" group', () => {
    const groups = groupCommands(mockCommands);
    expect(groups.get('常用')).toBeDefined();
    // help and clear have no group
    expect(groups.get('常用')!.length).toBe(2);
  });

  it('only one "常用" group when all have no group', () => {
    const cmds: ChatCommand[] = [
      { id: '1', label: 'A', command: 'a' },
      { id: '2', label: 'B', command: 'b' },
    ];
    const groups = groupCommands(cmds);
    expect(groups.size).toBe(1);
    expect(groups.get('常用')).toHaveLength(2);
  });

  it('empty command list returns empty Map', () => {
    const groups = groupCommands([]);
    expect(groups.size).toBe(0);
  });

  it('maintains insertion order', () => {
    const groups = groupCommands(mockCommands);
    const keys = [...groups.keys()];
    // "工具" group is before "文件" group
    expect(keys.indexOf('工具')).toBeLessThan(keys.indexOf('文件'));
  });
});
