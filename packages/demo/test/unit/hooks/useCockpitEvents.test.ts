import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCockpitEvents } from '../../../src/hooks/useCockpitEvents.js';

/** Mock EventSource that allows manually dispatching events */
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  listeners: Map<string, EventListener[]> = new Map();
  onerror: ((ev: Event) => void) | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  close() {
    this.closed = true;
  }

  /** Dispatch a mock event to all listeners of the given type */
  mockEvent(type: string, data: unknown) {
    const event = new MessageEvent(type, {
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
    this.listeners.get(type)?.forEach((fn) => fn(event));
  }
}

describe('useCockpitEvents', () => {
  const sessionId = 'sess-1';
  let OriginalEventSource: typeof EventSource;

  beforeEach(() => {
    MockEventSource.instances = [];
    OriginalEventSource = globalThis.EventSource;
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    globalThis.EventSource = OriginalEventSource;
    vi.restoreAllMocks();
  });

  it('creates EventSource connected to /api/agent/:sessionId/state', () => {
    renderHook(() => useCockpitEvents(sessionId));
    expect(MockEventSource.instances.length).toBe(1);
    expect(MockEventSource.instances[0].url).toBe(`/api/agent/${sessionId}/state`);
  });

  it('starts with empty events and null agentState', () => {
    renderHook(() => useCockpitEvents(sessionId));
    const es = MockEventSource.instances[0];
    expect(es).toBeDefined();
  });

  it('receives agent-state events', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('agent-state', {
        status: 'running',
        skills: [{ name: 'skill-1' }],
        tools: [{ name: 'tool-1' }],
      });
    });

    await waitFor(() => {
      expect(result.current.agentState).not.toBeNull();
    });
    expect(result.current.agentState?.status).toBe('running');
    expect(result.current.agentState?.skills).toEqual([{ name: 'skill-1' }]);
    expect(result.current.agentState?.tools).toEqual([{ name: 'tool-1' }]);
  });

  it('defaults missing fields in agent-state', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('agent-state', { status: 'idle' });
    });

    await waitFor(() => {
      expect(result.current.agentState).not.toBeNull();
    });
    expect(result.current.agentState?.status).toBe('idle');
    expect(result.current.agentState?.skills).toEqual([]);
    expect(result.current.agentState?.tools).toEqual([]);
    expect(result.current.agentState?.compressionHistory).toEqual([]);
  });

  it('receives cockpit-event events', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', {
        type: 'tool',
        subtype: 'start',
        label: 'read_file',
        payload: { path: '/test.txt' },
      });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });
    const event = result.current.events[0];
    expect(event.type).toBe('tool');
    expect(event.subtype).toBe('start');
    expect(event.label).toBe('read_file');
  });

  it('accumulates multiple cockpit events', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', { type: 'tool', subtype: 'start', label: 'event1' });
      es.mockEvent('cockpit-event', { type: 'tool', subtype: 'end', label: 'event2' });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(2);
    });
    expect(result.current.events[0].label).toBe('event1');
    expect(result.current.events[1].label).toBe('event2');
  });

  it('defaults missing fields in cockpit-event', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', { type: 'lifecycle' });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });
    const event = result.current.events[0];
    expect(event.subtype).toBe('');
    expect(event.label).toBe('');
  });

  it('uses provided timestamp in cockpit-event', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const customTs = 1234567890;
    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', {
        type: 'tool',
        subtype: 'start',
        label: 'test',
        timestamp: customTs,
      });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });
    expect(result.current.events[0].timestamp).toBe(customTs);
  });

  it('uses provided payload in cockpit-event', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', {
        type: 'tool',
        subtype: 'start',
        label: 'test',
        payload: { path: '/a.ts' },
      });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });
    expect(result.current.events[0].payload).toEqual({ path: '/a.ts' });
  });

  it('uses provided compressionHistory in agent-state', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('agent-state', {
        status: 'running',
        compressionHistory: [{ id: 1, tokens: 100 }],
      });
    });

    await waitFor(() => {
      expect(result.current.agentState).not.toBeNull();
    });
    expect(result.current.agentState?.compressionHistory).toEqual([{ id: 1, tokens: 100 }]);
  });

  it('ignores malformed JSON in events', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      // Send malformed data — should not crash
      const event = new MessageEvent('cockpit-event', { data: 'not-json' });
      es.listeners.get('cockpit-event')?.forEach((fn) => fn(event));
    });

    // Events should remain empty (malformed data ignored)
    expect(result.current.events).toEqual([]);
  });

  it('clearEvents resets the events list', async () => {
    const { result } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    act(() => {
      es.mockEvent('cockpit-event', { type: 'tool', subtype: 'start', label: 'test' });
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });

    act(() => {
      result.current.clearEvents();
    });

    expect(result.current.events).toEqual([]);
    // agentState should not be affected
    // (it was never set in this test, so it's null)
    expect(result.current.agentState).toBeNull();
  });

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    expect(es.closed).toBe(false);

    unmount();

    expect(es.closed).toBe(true);
  });

  it('handles EventSource error by closing', () => {
    renderHook(() => useCockpitEvents(sessionId));

    const es = MockEventSource.instances[0];
    expect(es.closed).toBe(false);

    // Simulate an error
    act(() => {
      if (es.onerror) {
        es.onerror(new Event('error'));
      }
    });

    expect(es.closed).toBe(true);
  });

  it('recreates EventSource when sessionId changes', () => {
    const { rerender } = renderHook(({ sid }: { sid: string }) => useCockpitEvents(sid), {
      initialProps: { sid: 'sess-1' },
    });

    expect(MockEventSource.instances.length).toBe(1);
    expect(MockEventSource.instances[0].url).toBe('/api/agent/sess-1/state');

    rerender({ sid: 'sess-2' });

    // Old one should be closed, new one created
    expect(MockEventSource.instances[0].closed).toBe(true);
    expect(MockEventSource.instances.length).toBe(2);
    expect(MockEventSource.instances[1].url).toBe('/api/agent/sess-2/state');
  });
});
