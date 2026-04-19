/**
 * commandUtils 工具函数单元测试
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
  it('以 trigger 开头时返回去掉前缀的文本', () => {
    expect(extractSearchTerm('/search', '/')).toBe('search');
  });

  it('以 trigger 开头但无后续文本时返回空字符串', () => {
    expect(extractSearchTerm('/', '/')).toBe('');
  });

  it('不以 trigger 开头时返回 null', () => {
    expect(extractSearchTerm('hello', '/')).toBeNull();
  });

  it('空字符串不以 trigger 开头', () => {
    expect(extractSearchTerm('', '/')).toBeNull();
  });

  it('支持自定义 trigger', () => {
    expect(extractSearchTerm('>search', '>')).toBe('search');
  });

  it('trigger 在中间不算', () => {
    expect(extractSearchTerm('hello/world', '/')).toBeNull();
  });
});

describe('filterCommands', () => {
  it('空搜索词返回全部指令', () => {
    expect(filterCommands(mockCommands, '')).toEqual(mockCommands);
  });

  it('空格搜索词返回全部指令', () => {
    expect(filterCommands(mockCommands, '   ')).toEqual(mockCommands);
  });

  it('按 command 前缀匹配', () => {
    const result = filterCommands(mockCommands, 'sea');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('按 command 前缀匹配大小写不敏感', () => {
    const result = filterCommands(mockCommands, 'SEA');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('按 label 包含匹配', () => {
    const result = filterCommands(mockCommands, '新建');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('按 keywords 包含匹配', () => {
    const result = filterCommands(mockCommands, '查询');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('按 keywords 部分匹配', () => {
    const result = filterCommands(mockCommands, '清空');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('无匹配时返回空数组', () => {
    expect(filterCommands(mockCommands, 'xyz')).toHaveLength(0);
  });

  it('多个字段均可命中', () => {
    // "se" 匹配 command: "search"
    const result = filterCommands(mockCommands, 'se');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('空指令列表', () => {
    expect(filterCommands([], 'search')).toHaveLength(0);
  });

  it('keywords 为 undefined 的指令不受影响', () => {
    const cmds: ChatCommand[] = [{ id: '1', label: '测试', command: 'test' }];
    expect(filterCommands(cmds, 'test')).toHaveLength(1);
  });
});

describe('groupCommands', () => {
  it('按 group 分组', () => {
    const groups = groupCommands(mockCommands);
    expect(groups.get('工具')).toBeDefined();
    expect(groups.get('工具')!.length).toBe(2);
    expect(groups.get('文件')).toBeDefined();
    expect(groups.get('文件')!.length).toBe(1);
  });

  it('无 group 的指令归入"常用"组', () => {
    const groups = groupCommands(mockCommands);
    expect(groups.get('常用')).toBeDefined();
    // help 和 clear 没有 group
    expect(groups.get('常用')!.length).toBe(2);
  });

  it('全部无 group 时只有一个"常用"组', () => {
    const cmds: ChatCommand[] = [
      { id: '1', label: 'A', command: 'a' },
      { id: '2', label: 'B', command: 'b' },
    ];
    const groups = groupCommands(cmds);
    expect(groups.size).toBe(1);
    expect(groups.get('常用')).toHaveLength(2);
  });

  it('空指令列表返回空 Map', () => {
    const groups = groupCommands([]);
    expect(groups.size).toBe(0);
  });

  it('保持插入顺序', () => {
    const groups = groupCommands(mockCommands);
    const keys = [...groups.keys()];
    // "工具"组在 "文件"组之前
    expect(keys.indexOf('工具')).toBeLessThan(keys.indexOf('文件'));
  });
});
