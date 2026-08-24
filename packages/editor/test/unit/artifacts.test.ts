import { describe, it, expect } from 'vitest';
import { deriveArtifacts } from '../../src/utils/artifacts.js';
import type { FileBrowserMessage } from '../../src/types.js';

describe('deriveArtifacts', () => {
  it('collects file_write / file_edit paths via camelCase filePath', () => {
    const messages: FileBrowserMessage[] = [
      { role: 'user', toolCalls: [] },
      {
        role: 'assistant',
        toolCalls: [
          // wrangler.rs 工具 schema 的 camelCase 参数是既有契约
          { name: 'file_write', arguments: { filePath: 'src/main.rs', content: 'x' } },
        ],
      },
      {
        role: 'assistant',
        toolCalls: [
          {
            name: 'file_edit',
            arguments: { filePath: 'README.md', oldString: 'a', newString: 'b' },
          },
        ],
      },
    ];
    const arts = deriveArtifacts(messages);
    expect(arts.map((a) => a.path)).toEqual(['README.md', 'src/main.rs']);
  });

  it('marks first touch created, later touch modified, ordered by last touch', () => {
    const messages: FileBrowserMessage[] = [
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_write', arguments: { filePath: 'a.md' } }],
      },
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_write', arguments: { filePath: 'b.md' } }],
      },
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_edit', arguments: { filePath: 'a.md' } }],
      },
    ];
    const arts = deriveArtifacts(messages);
    // a.md 最后触达在 index 2,排最前;状态 modified
    expect(arts[0]).toMatchObject({ path: 'a.md', status: 'modified', lastTouch: 2 });
    expect(arts[1]).toMatchObject({ path: 'b.md', status: 'created', lastTouch: 1 });
  });

  it('ignores non-write tools (contract: only file_write / file_edit)', () => {
    const messages: FileBrowserMessage[] = [
      {
        role: 'assistant',
        toolCalls: [
          { name: 'file_read', arguments: { filePath: 'secret.md' } },
          { name: 'shell', arguments: { command: 'echo hi' } },
          { name: 'git', arguments: {} },
        ],
      },
    ];
    expect(deriveArtifacts(messages)).toEqual([]);
  });

  it('ignores missing / non-string / empty filePath', () => {
    const messages: FileBrowserMessage[] = [
      {
        role: 'assistant',
        toolCalls: [
          { name: 'file_write', arguments: { content: 'no path' } },
          { name: 'file_write', arguments: { filePath: 42 } },
          { name: 'file_write', arguments: { filePath: '' } },
        ],
      },
    ];
    expect(deriveArtifacts(messages)).toEqual([]);
  });

  it('accumulates distinct ops per path without duplicates', () => {
    const messages: FileBrowserMessage[] = [
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_write', arguments: { filePath: 'x.ts' } }],
      },
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_edit', arguments: { filePath: 'x.ts' } }],
      },
      {
        role: 'assistant',
        toolCalls: [{ name: 'file_edit', arguments: { filePath: 'x.ts' } }],
      },
    ];
    const [art] = deriveArtifacts(messages);
    expect(art.ops).toEqual(['file_write', 'file_edit']);
    expect(art.lastTouch).toBe(2);
  });

  it('returns empty for empty input or messages without toolCalls', () => {
    expect(deriveArtifacts([])).toEqual([]);
    expect(deriveArtifacts([{ role: 'user' }, { role: 'assistant', toolCalls: [] }])).toEqual([]);
  });
});
