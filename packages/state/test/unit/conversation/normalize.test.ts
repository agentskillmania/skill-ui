/**
 * @fileoverview normalizeEvent unit tests — wire variants fold into the
 * canonical shape exactly once, at the boundary. Variant table per the
 * daemon recon (see normalize.ts header).
 */
import { describe, it, expect } from 'vitest';
import { normalizeEvent } from '../../../src/core/conversation/normalize.js';

describe('normalizeEvent — TokenStats casing', () => {
  it('folds snake_case cache fields (wrangler.rs) into camelCase', () => {
    const out = normalizeEvent({
      event: 'step-end',
      data: { step: 0, tokens: { input: 100, output: 50, cache_read: 10, cache_write: 5 } },
    });
    expect(out.data.tokens).toEqual({ input: 100, output: 50, cacheRead: 10, cacheWrite: 5 });
  });

  it('passes camelCase (TS daemon) through canonical', () => {
    const out = normalizeEvent({
      event: 'done',
      data: { tokens: { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 } },
    });
    expect(out.data.tokens).toEqual({ input: 1, output: 2, cacheRead: 3, cacheWrite: 4 });
  });

  it('leaves a missing tokens field absent (callers distinguish "no field" from zeros)', () => {
    const out = normalizeEvent({ event: 'done', data: { duration: 100 } });
    expect(out.data).not.toHaveProperty('tokens');
  });
});

describe('normalizeEvent — sub-agent envelope unwrap', () => {
  it('subagent-token → token {delta} with subtaskId', () => {
    expect(
      normalizeEvent({ event: 'subagent-token', data: { subtaskId: 's1', name: 'a', delta: 'x' } })
    ).toEqual({ event: 'token', data: { delta: 'x' }, subtaskId: 's1' });
  });

  it('subagent-thinking → thinking {content}', () => {
    expect(
      normalizeEvent({ event: 'subagent-thinking', data: { subtaskId: 's1', content: 'hmm' } })
    ).toEqual({ event: 'thinking', data: { content: 'hmm' }, subtaskId: 's1' });
  });

  it('subagent-tool-start unwraps the colts Action wrapper to the main tool-start shape', () => {
    const out = normalizeEvent({
      event: 'subagent-tool-start',
      data: { subtaskId: 's1', action: { id: 'c1', tool: 'search', arguments: { q: 'x' } } },
    });
    expect(out).toEqual({
      event: 'tool-start',
      data: { id: 'c1', name: 'search', args: { q: 'x' } },
      subtaskId: 's1',
    });
  });

  it('subagent-tool-start passes toolType through (host-decoration channel)', () => {
    const out = normalizeEvent({
      event: 'subagent-tool-start',
      data: { subtaskId: 's1', action: { id: 'c1', tool: 't', toolType: 'mcp' } },
    });
    expect(out.data.toolType).toBe('mcp');
  });

  it('subagent-tool-end stringifies an object result (TS daemon may emit objects)', () => {
    const out = normalizeEvent({
      event: 'subagent-tool-end',
      data: { subtaskId: 's1', callId: 'c1', result: { files: 3 } },
    });
    expect(out.data.result).toBe('{"files":3}');
  });

  it('subagent content events with a missing subtaskId keep the sub marker ("") so they route to the sub path and drop on lookup', () => {
    const out = normalizeEvent({ event: 'subagent-token', data: { delta: 'x' } });
    expect(out.subtaskId).toBe('');
    expect(out.event).toBe('token');
  });

  it('subagent-start/end keep their names and surface subtaskId', () => {
    const start = normalizeEvent({
      event: 'subagent-start',
      data: { subtaskId: 's1', name: 'helper', task: 't' },
    });
    expect(start).toMatchObject({ event: 'subagent-start', subtaskId: 's1' });
    const end = normalizeEvent({
      event: 'subagent-end',
      data: { subtaskId: 's1', status: 'success', tokens: { input: 1, cache_read: 2 } },
    });
    expect(end).toMatchObject({ event: 'subagent-end', subtaskId: 's1' });
    // tokens casing normalized on lifecycle events too
    expect(end.data.tokens).toEqual({ input: 1, output: 0, cacheRead: 2, cacheWrite: 0 });
  });
});

describe('normalizeEvent — main events untouched', () => {
  it('main token passes through with no subtaskId', () => {
    const out = normalizeEvent({ event: 'token', data: { delta: 'hi' } });
    expect(out).toEqual({ event: 'token', data: { delta: 'hi' }, subtaskId: undefined });
  });

  it('unknown events pass through unmodified', () => {
    const out = normalizeEvent({ event: 'some-future-event', data: { x: 1 } });
    expect(out.event).toBe('some-future-event');
    expect(out.subtaskId).toBeUndefined();
  });
});
