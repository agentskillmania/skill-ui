/**
 * Unit tests for eventRows.tsx
 * Tests the renderEventContent pure function across all event types,
 * covering normal, edge, and boundary scenarios.
 */
import { describe, it, expect } from 'vitest';
import { renderEventContent } from '../../../../src/panels/event-log/eventRows.js';
import type { CockpitEvent } from '../../../../src/panels/event-log/types.js';

function makeEvent(overrides: Partial<CockpitEvent>): CockpitEvent {
  return {
    id: 'test',
    timestamp: 0,
    type: 'complete',
    label: '',
    ...overrides,
  } as CockpitEvent;
}

describe('renderEventContent', () => {
  // ── step:start / step:end ──────────────────────────────────────────
  describe('step:start / step:end', () => {
    it('returns step number when payload has step', () => {
      expect(
        renderEventContent(makeEvent({ type: 'step:start', payload: { step: 3 } }), false)
      ).toBe('#3');
    });

    it('returns fallback when step is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'step:end', payload: {} }), false)).toBe('#?');
    });

    it('returns fallback when step is nullish', () => {
      expect(
        renderEventContent(makeEvent({ type: 'step:start', payload: { step: null } }), false)
      ).toBe('#?');
    });
  });

  // ── complete ───────────────────────────────────────────────────────
  describe('complete', () => {
    it('returns checkmark', () => {
      expect(renderEventContent(makeEvent({ type: 'complete' }), false)).toBe('✓');
    });

    it('ignores payload', () => {
      expect(
        renderEventContent(makeEvent({ type: 'complete', payload: { extra: true } }), false)
      ).toBe('✓');
    });
  });

  // ── abort ──────────────────────────────────────────────────────────
  describe('abort', () => {
    it('returns abort info with step', () => {
      expect(renderEventContent(makeEvent({ type: 'abort', payload: { step: 7 } }), false)).toBe(
        '✕ @ step 7'
      );
    });

    it('returns fallback when step is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'abort', payload: {} }), false)).toBe(
        '✕ @ step ?'
      );
    });
  });

  // ── phase-change ───────────────────────────────────────────────────
  describe('phase-change', () => {
    it('returns from → to', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'phase-change', payload: { from: 'idle', to: 'running' } }),
          false
        )
      ).toBe('idle → running');
    });

    it('falls back when from is missing', () => {
      expect(
        renderEventContent(makeEvent({ type: 'phase-change', payload: { to: 'done' } }), false)
      ).toBe('? → done');
    });

    it('falls back when to is missing', () => {
      expect(
        renderEventContent(makeEvent({ type: 'phase-change', payload: { from: 'idle' } }), false)
      ).toBe('idle → ?');
    });

    it('falls back when both are missing', () => {
      expect(renderEventContent(makeEvent({ type: 'phase-change', payload: {} }), false)).toBe(
        '? → ?'
      );
    });
  });

  // ── thinking ───────────────────────────────────────────────────────
  describe('thinking', () => {
    const longText = 'a'.repeat(100);

    it('truncates long content when collapsed', () => {
      const result = renderEventContent(
        makeEvent({ type: 'thinking', payload: { content: longText } }),
        false
      );
      // truncate appends '...' within maxLength, so 57 chars + '...' = 60
      expect(result).toBe('a'.repeat(57) + '...');
      expect(result.length).toBe(60);
    });

    it('returns full content when expanded', () => {
      const result = renderEventContent(
        makeEvent({ type: 'thinking', payload: { content: longText } }),
        true
      );
      expect(result).toBe(longText);
    });

    it('falls back when content is missing (collapsed)', () => {
      const result = renderEventContent(makeEvent({ type: 'thinking', payload: {} }), false);
      expect(result).toBe('...');
    });

    it('falls back when content is missing (expanded)', () => {
      const result = renderEventContent(makeEvent({ type: 'thinking', payload: {} }), true);
      expect(result).toBe('...');
    });
  });

  // ── token ──────────────────────────────────────────────────────────
  describe('token', () => {
    const longText = 'b'.repeat(100);

    it('truncates long text when collapsed', () => {
      const result = renderEventContent(
        makeEvent({ type: 'token', payload: { text: longText } }),
        false
      );
      // truncate appends '...' within maxLength, so 57 chars + '...' = 60
      expect(result).toBe('b'.repeat(57) + '...');
      expect(result.length).toBe(60);
    });

    it('returns full text when expanded', () => {
      const result = renderEventContent(
        makeEvent({ type: 'token', payload: { text: longText } }),
        true
      );
      expect(result).toBe(longText);
    });

    it('falls back to p.token when p.text is undefined', () => {
      const result = renderEventContent(
        makeEvent({ type: 'token', payload: { token: 'abc' } }),
        false
      );
      expect(result).toBe('abc');
    });

    it('renders empty string when both text and token are missing', () => {
      const result = renderEventContent(makeEvent({ type: 'token', payload: {} }), false);
      expect(result).toBe('');
    });
  });

  // ── llm:request ────────────────────────────────────────────────────
  describe('llm:request', () => {
    it('includes skill name when skill.current is set', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: {
          skill: { current: 'code-writer' },
          messages: [{ role: 'user' }, { role: 'assistant' }],
        },
      });
      expect(renderEventContent(event, false)).toBe('code-writer · 2 msgs');
    });

    it('uses generic message when skill.current is null', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: { skill: { current: null }, messages: [{ role: 'user' }] },
      });
      expect(renderEventContent(event, false)).toBe('1 messages');
    });

    it('uses generic message when skill is absent', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: { messages: [{ role: 'user' }] },
      });
      expect(renderEventContent(event, false)).toBe('1 messages');
    });

    it('handles messages not being an array', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: { skill: { current: 'coder' }, messages: 'not-an-array' },
      });
      expect(renderEventContent(event, false)).toBe('coder · ? msgs');
    });

    it('handles absent messages field', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: { skill: { current: 'coder' } },
      });
      expect(renderEventContent(event, false)).toBe('coder · ? msgs');
    });

    it('uses generic format when skill is absent and messages is not an array', () => {
      const event = makeEvent({
        type: 'llm:request',
        payload: { skill: { current: null }, messages: 'not-an-array' },
      });
      expect(renderEventContent(event, false)).toBe('? messages');
    });
  });

  // ── llm:response ───────────────────────────────────────────────────
  describe('llm:response', () => {
    it('returns truncated text when text is present', () => {
      const event = makeEvent({
        type: 'llm:response',
        payload: {
          text: 'Here is a very long response that should be truncated to fifty characters exactly',
        },
      });
      const result = renderEventContent(event, false);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('returns tool call count when text is empty', () => {
      const event = makeEvent({
        type: 'llm:response',
        payload: { text: '', toolCalls: [{ name: 'read' }, { name: 'write' }] },
      });
      expect(renderEventContent(event, false)).toBe('2 tool calls');
    });

    it('uses singular for single tool call', () => {
      const event = makeEvent({
        type: 'llm:response',
        payload: { toolCalls: [{ name: 'read' }], text: '' },
      });
      expect(renderEventContent(event, false)).toBe('1 tool call');
    });

    it('handles zero tool calls', () => {
      const event = makeEvent({
        type: 'llm:response',
        payload: { toolCalls: [] },
      });
      expect(renderEventContent(event, false)).toBe('0 tool calls');
    });

    it('handles toolCalls not being an array', () => {
      const event = makeEvent({
        type: 'llm:response',
        payload: { toolCalls: 'invalid' },
      });
      expect(renderEventContent(event, false)).toBe('0 tool calls');
    });

    it('handles empty payload', () => {
      const event = makeEvent({ type: 'llm:response', payload: {} });
      expect(renderEventContent(event, false)).toBe('0 tool calls');
    });
  });

  // ── tool:start ─────────────────────────────────────────────────────
  describe('tool:start', () => {
    it('returns tool name when present', () => {
      expect(
        renderEventContent(makeEvent({ type: 'tool:start', payload: { name: 'read_file' } }), false)
      ).toBe('read_file');
    });

    it('falls back when name is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'tool:start', payload: {} }), false)).toBe('?');
    });
  });

  // ── tool:end ───────────────────────────────────────────────────────
  describe('tool:end', () => {
    it('returns truncated result', () => {
      const longResult = 'c'.repeat(100);
      const result = renderEventContent(
        makeEvent({ type: 'tool:end', payload: { result: longResult } }),
        false
      );
      // truncate appends '...' within maxLength, so 57 chars + '...' = 60
      expect(result).toBe('c'.repeat(57) + '...');
      expect(result.length).toBe(60);
    });

    it('handles empty result', () => {
      expect(renderEventContent(makeEvent({ type: 'tool:end', payload: {} }), false)).toBe('');
    });

    it('converts non-string result to string', () => {
      expect(
        renderEventContent(makeEvent({ type: 'tool:end', payload: { result: 42 } }), false)
      ).toBe('42');
    });
  });

  // ── tools:start ────────────────────────────────────────────────────
  describe('tools:start', () => {
    it('returns action count when actions is an array', () => {
      const event = makeEvent({
        type: 'tools:start',
        payload: { actions: [{ name: 'read' }, { name: 'write' }, { name: 'exec' }] },
      });
      expect(renderEventContent(event, false)).toBe('3 tools');
    });

    it('falls back when actions is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'tools:start', payload: {} }), false)).toBe(
        '? tools'
      );
    });

    it('falls back when actions is not an array', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'tools:start', payload: { actions: 'string' } }),
          false
        )
      ).toBe('? tools');
    });
  });

  // ── tools:end ──────────────────────────────────────────────────────
  describe('tools:end', () => {
    it('returns results count when results is an array', () => {
      const event = makeEvent({
        type: 'tools:end',
        payload: { results: [{ name: 'read' }, { name: 'write' }, { name: 'exec' }] },
      });
      expect(renderEventContent(event, false)).toBe('3 results');
    });

    it('falls back when results is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'tools:end', payload: {} }), false)).toBe(
        '? results'
      );
    });

    it('falls back when results is not an object', () => {
      const event = makeEvent({
        type: 'tools:end',
        payload: { results: 'not-an-object' },
      });
      expect(renderEventContent(event, false)).toBe('? results');
    });
  });

  // ── skill:loading ──────────────────────────────────────────────────
  describe('skill:loading', () => {
    it('returns skill name', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'skill:loading', payload: { name: 'code-review' } }),
          false
        )
      ).toBe('code-review');
    });

    it('falls back when name is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'skill:loading', payload: {} }), false)).toBe(
        '?'
      );
    });
  });

  // ── skill:loaded ───────────────────────────────────────────────────
  describe('skill:loaded', () => {
    it('returns name and token count', () => {
      const event = makeEvent({
        type: 'skill:loaded',
        payload: { name: 'code-review', tokenCount: 15000 },
      });
      expect(renderEventContent(event, false)).toBe('code-review · 15000 tokens');
    });

    it('falls back when name is missing', () => {
      expect(
        renderEventContent(makeEvent({ type: 'skill:loaded', payload: { tokenCount: 500 } }), false)
      ).toBe('? · 500 tokens');
    });

    it('falls back when tokenCount is missing', () => {
      expect(
        renderEventContent(makeEvent({ type: 'skill:loaded', payload: { name: 'coder' } }), false)
      ).toBe('coder · ? tokens');
    });
  });

  // ── skill:start ────────────────────────────────────────────────────
  describe('skill:start', () => {
    it('returns name and truncated task', () => {
      const event = makeEvent({
        type: 'skill:start',
        payload: { name: 'code-review', task: 'Review this PR for bugs' },
      });
      expect(renderEventContent(event, false)).toBe('code-review: Review this PR for bugs');
    });

    it('falls back when name is missing', () => {
      expect(
        renderEventContent(makeEvent({ type: 'skill:start', payload: { task: 'do work' } }), false)
      ).toBe('?: do work');
    });

    it('handles missing task', () => {
      expect(
        renderEventContent(makeEvent({ type: 'skill:start', payload: { name: 'tester' } }), false)
      ).toBe('tester: ');
    });

    it('truncates long task to 40 chars', () => {
      const longTask = 'd'.repeat(100);
      const result = renderEventContent(
        makeEvent({ type: 'skill:start', payload: { name: 'x', task: longTask } }),
        false
      );
      // truncate with maxLength=40 => 37 chars + '...' = 40
      expect(result).toBe('x: ' + 'd'.repeat(37) + '...');
    });
  });

  // ── skill:end ──────────────────────────────────────────────────────
  describe('skill:end', () => {
    it('returns skill name', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'skill:end', payload: { name: 'code-review' } }),
          false
        )
      ).toBe('code-review');
    });

    it('falls back when name is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'skill:end', payload: {} }), false)).toBe('?');
    });
  });

  // ── subagent:start ─────────────────────────────────────────────────
  describe('subagent:start', () => {
    it('returns name and truncated task', () => {
      const event = makeEvent({
        type: 'subagent:start',
        payload: { name: 'researcher', task: 'Find relevant sources' },
      });
      expect(renderEventContent(event, false)).toBe('researcher: Find relevant sources');
    });

    it('falls back when name is missing', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'subagent:start', payload: { task: 'research' } }),
          false
        )
      ).toBe('?: research');
    });

    it('handles missing task', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'subagent:start', payload: { name: 'helper' } }),
          false
        )
      ).toBe('helper: ');
    });
  });

  // ── subagent:end ───────────────────────────────────────────────────
  describe('subagent:end', () => {
    it('returns subagent name', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'subagent:end', payload: { name: 'researcher' } }),
          false
        )
      ).toBe('researcher');
    });

    it('falls back when name is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'subagent:end', payload: {} }), false)).toBe('?');
    });
  });

  // ── compressing ────────────────────────────────────────────────────
  describe('compressing', () => {
    it('returns ellipsis', () => {
      expect(renderEventContent(makeEvent({ type: 'compressing' }), false)).toBe('...');
    });
  });

  // ── compressed ─────────────────────────────────────────────────────
  describe('compressed', () => {
    it('returns removed count', () => {
      expect(
        renderEventContent(makeEvent({ type: 'compressed', payload: { removedCount: 5 } }), false)
      ).toBe('-5 msgs');
    });

    it('falls back when removedCount is missing', () => {
      expect(renderEventContent(makeEvent({ type: 'compressed', payload: {} }), false)).toBe(
        '-? msgs'
      );
    });
  });

  // ── waiting-human ──────────────────────────────────────────────────
  describe('waiting-human', () => {
    it('returns pause symbol', () => {
      expect(renderEventContent(makeEvent({ type: 'waiting-human' }), false)).toBe('⏸');
    });
  });

  // ── error ──────────────────────────────────────────────────────────
  describe('error', () => {
    it('returns message when present', () => {
      expect(
        renderEventContent(
          makeEvent({ type: 'error', payload: { message: 'Something broke' } }),
          false
        )
      ).toBe('Something broke');
    });

    it('falls back to error field when message is absent', () => {
      expect(
        renderEventContent(makeEvent({ type: 'error', payload: { error: 'Error details' } }), false)
      ).toBe('Error details');
    });

    it('falls back to Unknown when both are missing', () => {
      expect(renderEventContent(makeEvent({ type: 'error', payload: {} }), false)).toBe('Unknown');
    });
  });

  // ── default ────────────────────────────────────────────────────────
  describe('default / unknown event type', () => {
    it('returns label when present', () => {
      const event = makeEvent({ type: 'complete' as never, label: 'custom-label' });
      // Override type to something not in the switch — via payload to avoid type error
      const result = renderEventContent({ ...event, type: 'unknown-type' as never }, false);
      expect(result).toBe('custom-label');
    });

    it('falls back to event type when label is empty', () => {
      const result = renderEventContent(
        { ...makeEvent(), type: 'unknown-type' as never, label: '' },
        false
      );
      expect(result).toBe('unknown-type');
    });
  });
});
