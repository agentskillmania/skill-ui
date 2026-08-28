/**
 * @fileoverview A2UI block production — pure fold, reducer wiring, and
 * live ↔ history parity for a2ui_* tool calls.
 */
import { describe, it, expect } from 'vitest';
import {
  applyA2uiCall,
  a2uiBlockOpeningLines,
  A2UI_TOOLS,
} from '../../../src/core/conversation/a2ui.js';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { AgentBlock, SessionRunState } from '../../../src/core/conversation/types.js';
import type { ColtsMessageInput, SSEEvent } from '../../../src/core/types.js';

function pushEvents(events: SSEEvent[]): SessionRunState {
  return events.reduce(reducer, createEmptySessionState());
}

const comp = (id: string, component: string, extra: Record<string, unknown> = {}) => ({
  id,
  component,
  ...extra,
});

// ─── Pure fold ────────────────────────────────────────────────────

describe('applyA2uiCall — pure fold', () => {
  it('create_surface emits a createSurface line and registers title', () => {
    const res = applyA2uiCall({}, 'a2ui_create_surface', {
      surfaceId: 's1',
      layout: 'vertical',
      metadata: { title: '产品展示' },
    });
    expect(res).not.toBeNull();
    expect(res!.hadPriorState).toBe(false);
    expect(res!.title).toBe('产品展示');
    expect(JSON.parse(res!.lines[0])).toEqual({
      createSurface: { surfaceId: 's1', catalogId: 'default', theme: {} },
    });
    expect(res!.surfaces['s1']).toEqual({ components: [], dataModel: {}, title: '产品展示' });
  });

  it('skill dialect: replace /components with full array', () => {
    const res = applyA2uiCall({}, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'replace', path: '/components', value: [comp('root', 'Column')] }],
    });
    expect(res!.surfaces['s1'].components).toEqual([comp('root', 'Column')]);
    const line = JSON.parse(res!.lines[0]);
    expect(line.updateComponents.surfaceId).toBe('s1');
    expect(line.updateComponents.components).toEqual([comp('root', 'Column')]);
  });

  it('wrangler dialect: insert honors afterId over parentId', () => {
    let surfaces = {};
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [
        { op: 'replace', path: '/components', value: [comp('a', 'Row'), comp('b', 'Row')] },
      ],
    })!.surfaces;
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'insert', parentId: 'a', afterId: 'b', component: comp('c', 'Text') }],
    })!.surfaces;
    // afterId wins over parentId → c lands after b
    expect(surfaces['s1'].components.map((c) => (c as { id: string }).id)).toEqual(['a', 'b', 'c']);
  });

  it('wrangler dialect: update merges properties/styles, delete removes, replace upserts', () => {
    let surfaces = applyA2uiCall({}, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [
        {
          op: 'replace',
          path: '/components',
          value: [comp('t', 'Text', { text: 'hi', style: { color: '#000' } })],
        },
      ],
    })!.surfaces;
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [
        { op: 'update', componentId: 't', properties: { strong: true }, styles: { color: '#fff' } },
      ],
    })!.surfaces;
    expect(surfaces['s1'].components[0]).toEqual(
      comp('t', 'Text', { text: 'hi', strong: true, style: { color: '#fff' } })
    );
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [
        { op: 'replace', component: comp('t2', 'Text') },
        { op: 'delete', componentId: 't' },
      ],
    })!.surfaces;
    expect(surfaces['s1'].components.map((c) => (c as { id: string }).id)).toEqual(['t2']);
  });

  it('unknown op shapes are dropped, not thrown', () => {
    const res = applyA2uiCall({}, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'teleport', target: 'mars' }, 'nonsense', 42],
    });
    expect(res).not.toBeNull();
    expect(res!.surfaces['s1'].components).toEqual([]);
  });

  it('update_data_model fans out one line per update and merges nested paths', () => {
    let surfaces = applyA2uiCall({}, 'a2ui_update_data_model', {
      surfaceId: 's1',
      updates: [{ path: '/card/title', value: 'AirWave' }],
    })!.surfaces;
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_data_model', {
      surfaceId: 's1',
      updates: [
        { path: '/card/price', value: '¥1,299' },
        { path: '/count', value: 3 },
      ],
    })!;
    expect(surfaces.surfaces['s1'].dataModel).toEqual({
      card: { title: 'AirWave', price: '¥1,299' },
      count: 3,
    });
    expect(surfaces.lines).toHaveLength(2);
    expect(JSON.parse(surfaces.lines[0]).updateDataModel.path).toBe('/card/price');
    expect(JSON.parse(surfaces.lines[1]).updateDataModel.value).toBe(3);
  });

  it('delete_surface emits a line and clears the registry entry', () => {
    let r = applyA2uiCall({}, 'a2ui_create_surface', { surfaceId: 's1' })!;
    r = applyA2uiCall(r.surfaces, 'a2ui_delete_surface', { surfaceId: 's1' })!;
    expect(r.surfaces['s1']).toBeUndefined();
    expect(JSON.parse(r.lines[0])).toEqual({ deleteSurface: { surfaceId: 's1' } });
  });

  it('returns null on unusable args (missing surfaceId / wrong shape)', () => {
    expect(applyA2uiCall({}, 'a2ui_create_surface', {})).toBeNull();
    expect(applyA2uiCall({}, 'a2ui_create_surface', 'nope')).toBeNull();
    expect(applyA2uiCall({}, 'a2ui_update_components', { surfaceId: 's1' })).toBeNull();
    expect(applyA2uiCall({}, 'file_read', { surfaceId: 's1' })).toBeNull();
  });

  it('does not mutate the input registry (clone-on-write)', () => {
    const input = { s1: { components: [comp('a', 'Row')], dataModel: {} } };
    const snapshot = JSON.parse(JSON.stringify(input));
    applyA2uiCall(input, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'update', componentId: 'a', properties: { strong: true } }],
    });
    expect(input).toEqual(snapshot);
  });
});

describe('a2uiBlockOpeningLines — self-contained reopen', () => {
  it('returns no prefix for create_surface (its own line opens the block)', () => {
    const res = applyA2uiCall({}, 'a2ui_create_surface', { surfaceId: 's1' })!;
    expect(a2uiBlockOpeningLines('a2ui_create_surface', res)).toEqual([]);
  });

  it('fresh surface via update gets only a createSurface line', () => {
    const res = applyA2uiCall({}, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'replace', path: '/components', value: [comp('a', 'Row')] }],
    })!;
    const prefix = a2uiBlockOpeningLines('a2ui_update_components', res);
    expect(prefix).toHaveLength(1);
    expect(JSON.parse(prefix[0]).createSurface.surfaceId).toBe('s1');
  });

  it('later-turn reopen replays full components and data model', () => {
    let surfaces = {};
    surfaces = applyA2uiCall(surfaces, 'a2ui_create_surface', { surfaceId: 's1' })!.surfaces;
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_components', {
      surfaceId: 's1',
      operations: [{ op: 'replace', path: '/components', value: [comp('a', 'Row')] }],
    })!.surfaces;
    surfaces = applyA2uiCall(surfaces, 'a2ui_update_data_model', {
      surfaceId: 's1',
      updates: [{ path: '/card/title', value: 'T' }],
    })!.surfaces;
    // 新 turn 首个调用是 update_data_model → 重放 createSurface + 全量 components
    const res = applyA2uiCall(surfaces, 'a2ui_update_data_model', {
      surfaceId: 's1',
      updates: [{ path: '/card/price', value: 9 }],
    })!;
    const prefix = a2uiBlockOpeningLines('a2ui_update_data_model', res);
    expect(JSON.parse(prefix[0]).createSurface).toBeDefined();
    expect(JSON.parse(prefix[1]).updateComponents.components).toEqual([comp('a', 'Row')]);
    expect(prefix).toHaveLength(2); // 数据模型由本次调用自身携带,不重复重放
  });
});

// ─── Reducer wiring ───────────────────────────────────────────────

/** 用户日志里的真实调用序列(裁剪)。 */
function liveA2uiEvents(): SSEEvent[] {
  return [
    { event: 'user-message', data: { content: '测试一下a2ui' } },
    {
      event: 'tool-start',
      data: {
        id: 'c1',
        name: 'a2ui_create_surface',
        args: { surfaceId: 'card', layout: 'vertical', metadata: { title: '产品展示卡片' } },
      },
    },
    { event: 'tool-end', data: { callId: 'c1', result: 'Surface created: "card"' } },
    {
      event: 'tool-start',
      data: {
        id: 'c2',
        name: 'a2ui_update_components',
        args: {
          surfaceId: 'card',
          operations: [
            {
              op: 'replace',
              path: '/components',
              value: [comp('root', 'Column', { children: ['t'] }), comp('t', 'Text')],
            },
          ],
        },
      },
    },
    {
      event: 'tool-end',
      data: { callId: 'c2', result: 'Components updated on surface "card" (1 operation)' },
    },
    {
      event: 'tool-start',
      data: {
        id: 'c3',
        name: 'a2ui_update_data_model',
        args: { surfaceId: 'card', updates: [{ path: '/card/title', value: 'AirWave' }] },
      },
    },
    {
      event: 'tool-end',
      data: { callId: 'c3', result: 'Data model updated on surface "card" (1 update)' },
    },
    { event: 'done', data: { totalSteps: 3, duration: 100, tokens: { input: 1, output: 1 } } },
  ];
}

describe('reducer — a2ui tool calls', () => {
  it('aggregates the full sequence into one completed a2ui block', () => {
    const state = pushEvents(liveA2uiEvents());
    const msg = state.main.messages[state.main.messages.length - 1];
    const a2uiBlocks = (msg.blocks ?? []).filter((b) => b.type === 'a2ui');
    expect(a2uiBlocks).toHaveLength(1);
    const b = a2uiBlocks[0];
    expect(b.status).toBe('completed');
    expect(b.metadata?.surfaceId).toBe('card');
    expect(b.metadata?.title).toBe('产品展示卡片');
    expect(b.metadata?.pendingCallIds).toEqual([]);
    const lines = b.content.split('\n');
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0]).createSurface).toBeDefined();
    expect(JSON.parse(lines[1]).updateComponents.components).toHaveLength(2);
    expect(JSON.parse(lines[2]).updateDataModel.value).toBe('AirWave');
    // a2ui 调用不再另出 tool_call 块
    expect((msg.blocks ?? []).filter((x) => x.type === 'tool_call')).toHaveLength(0);
  });

  it('block stays streaming between tool-start and tool-end, then reopens on the next call', () => {
    const events = liveA2uiEvents();
    const afterFirstEnd = pushEvents(events.slice(0, 3));
    const b1 = lastA2uiBlock(afterFirstEnd);
    expect(b1.status).toBe('completed');
    expect(b1.content.split('\n')).toHaveLength(1);
    const afterSecondStart = pushEvents(events.slice(0, 4));
    const b2 = lastA2uiBlock(afterSecondStart);
    expect(b2.status).toBe('streaming');
    expect(b2.content.split('\n')).toHaveLength(2); // append-only
    expect(b2.content.startsWith(b1.content)).toBe(true);
  });

  it('degrades to a plain tool_call block on unusable args', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'go' } },
      {
        event: 'tool-start',
        data: { id: 'bad', name: 'a2ui_update_components', args: { surfaceId: 's' } },
      },
      { event: 'tool-end', data: { callId: 'bad', result: 'ack' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    expect((msg.blocks ?? []).filter((b) => b.type === 'a2ui')).toHaveLength(0);
    const tool = (msg.blocks ?? []).find((b) => b.type === 'tool_call');
    expect(tool?.metadata?.toolName).toBe('a2ui_update_components');
    expect(tool?.status).toBe('completed');
  });

  it('two surfaces in one turn produce two blocks', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'go' } },
      {
        event: 'tool-start',
        data: { id: 'a', name: 'a2ui_create_surface', args: { surfaceId: 's1' } },
      },
      { event: 'tool-end', data: { callId: 'a', result: 'ok' } },
      {
        event: 'tool-start',
        data: { id: 'b', name: 'a2ui_create_surface', args: { surfaceId: 's2' } },
      },
      { event: 'tool-end', data: { callId: 'b', result: 'ok' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const ids = (msg.blocks ?? [])
      .filter((b) => b.type === 'a2ui')
      .map((b) => b.metadata?.surfaceId);
    expect(ids).toEqual(['s1', 's2']);
  });

  it('registry persists across turns; a reopened surface block replays full state', () => {
    const state = pushEvents([
      ...liveA2uiEvents(),
      { event: 'user-message', data: { content: '再改一下' } },
      {
        event: 'tool-start',
        data: {
          id: 'c4',
          name: 'a2ui_update_data_model',
          args: { surfaceId: 'card', updates: [{ path: '/card/price', value: 1299 }] },
        },
      },
      { event: 'tool-end', data: { callId: 'c4', result: 'ok' } },
      { event: 'done', data: { totalSteps: 1, duration: 1, tokens: { input: 1, output: 1 } } },
    ]);
    const turn2 = state.main.messages[state.main.messages.length - 1];
    const b = (turn2.blocks ?? []).find((x) => x.type === 'a2ui');
    expect(b).toBeDefined();
    const lines = b!.content.split('\n');
    // createSurface + 全量 components 重放 + 本次 data model 更新
    expect(JSON.parse(lines[0]).createSurface.surfaceId).toBe('card');
    expect(JSON.parse(lines[1]).updateComponents.components).toHaveLength(2);
    expect(JSON.parse(lines[2]).updateDataModel.value).toBe(1299);
  });
});

function lastA2uiBlock(state: SessionRunState): AgentBlock {
  const msg = state.main.messages[state.main.messages.length - 1];
  const b = (msg.blocks ?? []).filter((x) => x.type === 'a2ui').pop();
  expect(b).toBeDefined();
  return b!;
}

// ─── Live ↔ history parity ────────────────────────────────────────

describe('a2ui — live ↔ history parity', () => {
  /** 与 liveA2uiEvents 对应的 colts 持久化行(一轮 = thought 可省,action 行
   * 携带 toolCalls,tool 结果行配对)。 */
  const historyRows: ColtsMessageInput[] = [
    { role: 'user', content: '测试一下a2ui', timestamp: 1000 },
    {
      role: 'assistant',
      timestamp: 1001,
      content: '',
      toolCalls: [
        {
          id: 'c1',
          name: 'a2ui_create_surface',
          arguments: { surfaceId: 'card', layout: 'vertical', metadata: { title: '产品展示卡片' } },
        },
      ],
    },
    { role: 'tool', toolCallId: 'c1', content: 'Surface created: "card"', timestamp: 1002 },
    {
      role: 'assistant',
      timestamp: 1003,
      content: '',
      toolCalls: [
        {
          id: 'c2',
          name: 'a2ui_update_components',
          arguments: {
            surfaceId: 'card',
            operations: [
              {
                op: 'replace',
                path: '/components',
                value: [comp('root', 'Column', { children: ['t'] }), comp('t', 'Text')],
              },
            ],
          },
        },
      ],
    },
    {
      role: 'tool',
      toolCallId: 'c2',
      content: 'Components updated (1 operation)',
      timestamp: 1004,
    },
    {
      role: 'assistant',
      timestamp: 1005,
      content: '',
      toolCalls: [
        {
          id: 'c3',
          name: 'a2ui_update_data_model',
          arguments: { surfaceId: 'card', updates: [{ path: '/card/title', value: 'AirWave' }] },
        },
      ],
    },
    { role: 'tool', toolCallId: 'c3', content: 'Data model updated (1 update)', timestamp: 1006 },
  ];

  it('rebuilds the identical a2ui block and restores the surface registry', () => {
    const live = pushEvents(liveA2uiEvents());
    const hist = fromHistory(historyRows);
    const liveMsg = live.main.messages[live.main.messages.length - 1];
    const histMsg = hist.main.messages[hist.main.messages.length - 1];
    const strip = (b: AgentBlock) => ({ ...b, id: undefined, metadata: b.metadata });
    const liveBlock = (liveMsg.blocks ?? []).find((b) => b.type === 'a2ui')!;
    const histBlock = (histMsg.blocks ?? []).find((b) => b.type === 'a2ui')!;
    expect(strip(histBlock)).toEqual(strip(liveBlock));
    // registry 恢复:后续 turn 重开可继续物化
    expect(hist.main.a2uiSurfaces['card'].components).toHaveLength(2);
    expect(hist.main.a2uiSurfaces['card'].title).toBe('产品展示卡片');
  });

  it('A2UI_TOOLS covers exactly the four display tools', () => {
    expect([...A2UI_TOOLS].sort()).toEqual([
      'a2ui_create_surface',
      'a2ui_delete_surface',
      'a2ui_update_components',
      'a2ui_update_data_model',
    ]);
  });
});
