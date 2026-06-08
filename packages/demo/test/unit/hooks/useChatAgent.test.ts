import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChatAgent } from '../../../src/hooks/useChatAgent.js';

/** Commands API mock response */
const COMMANDS_RESPONSE = {
  ok: true,
  json: () => Promise.resolve([]),
} as Response;

/**
 * Build a ReadableStream from SSE event strings.
 * Each event is "event: type\ndata: json\n\n" format.
 */
function buildSSEStream(
  events: Array<{ event: string; data: unknown }>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const fullText = events
    .map((e) => {
      const dataStr = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
      return `event: ${e.event}\ndata: ${dataStr}\n\n`;
    })
    .join('');
  const chunk = encoder.encode(fullText);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(chunk);
      controller.close();
    },
  });
}

/** Mock Response with SSE body */
function mockSSEResponse(events: Array<{ event: string; data: unknown }>): Response {
  return {
    ok: true,
    body: buildSSEStream(events),
    status: 200,
  } as Response;
}

describe('useChatAgent', () => {
  const sessionId = 'sess-1';

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        // Commands fetch
        if (url === '/api/chat/commands') {
          return Promise.resolve(COMMANDS_RESPONSE);
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Set up the SSE response for sendMessage calls */
  function mockChatSSE(events: Array<{ event: string; data: unknown }>) {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.resolve(mockSSEResponse(events));
    });
  }

  /** Set up mock for chat error response */
  function mockChatError(status: number) {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.resolve({ ok: false, status, body: null } as Response);
    });
  }

  it('starts with idle status and empty messages', () => {
    const { result } = renderHook(() => useChatAgent(sessionId));
    expect(result.current.status).toBe('idle');
    expect(result.current.messages).toEqual([]);
    expect(result.current.commands).toEqual([]);
  });

  it('fetches command list on mount', () => {
    renderHook(() => useChatAgent(sessionId));
    expect(fetch).toHaveBeenCalledWith('/api/chat/commands');
  });

  it('sends a message and creates user + assistant messages', async () => {
    mockChatSSE([{ event: 'done', data: {} }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('hello');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
    });
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('hello');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('processes token events to build assistant content', async () => {
    mockChatSSE([
      { event: 'token', data: { delta: 'Hello' } },
      { event: 'token', data: { delta: ' world' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.content).toBe('Hello world');
  });

  it('handles thinking events with block creation', async () => {
    mockChatSSE([
      { event: 'thinking', data: { content: 'Let me think...' } },
      { event: 'token', data: { delta: 'answer' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const thinkingBlock = assistantMsg?.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock).toBeDefined();
    expect(thinkingBlock?.status).toBe('completed');
  });

  it('handles incremental thinking updates', async () => {
    mockChatSSE([
      { event: 'thinking', data: { content: 'Part 1' } },
      { event: 'thinking', data: { content: ' Part 2' } },
      { event: 'token', data: { delta: 'answer' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    // Log blocks for debugging incremental updates
    expect(assistantMsg?.blocks).toBeDefined();
    const thinkingBlock = assistantMsg?.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock).toBeDefined();
    // Incremental thinking content: the second thinking event appends to the first
    expect(thinkingBlock?.content).toContain('Part 1');
  });

  it('handles tool-start and tool-end events', async () => {
    mockChatSSE([
      {
        event: 'tool-start',
        data: { name: 'read_file', args: { path: '/test.txt' } },
      },
      {
        event: 'tool-end',
        data: { result: 'file contents here' },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const toolBlock = assistantMsg?.blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock).toBeDefined();
    expect(toolBlock?.status).toBe('completed');
    expect(toolBlock?.metadata?.toolName).toBe('read_file');
    expect(toolBlock?.metadata?.toolResult).toBe('file contents here');
  });

  it('handles skill lifecycle events', async () => {
    mockChatSSE([
      { event: 'skill-loading', data: { name: 'code-review' } },
      { event: 'skill-loaded', data: { name: 'code-review', tokenCount: 500 } },
      { event: 'skill-start', data: { task: 'Review code' } },
      { event: 'skill-end', data: { result: 'LGTM' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const skillBlock = assistantMsg?.blocks?.find((b) => b.type === 'skill');
    expect(skillBlock).toBeDefined();
    expect(skillBlock?.status).toBe('completed');
    expect(skillBlock?.metadata?.skillName).toBe('code-review');
    expect(skillBlock?.metadata?.phase).toBe('completed');
  });

  it('handles human-input events', async () => {
    mockChatSSE([
      {
        event: 'human-input',
        data: {
          requestId: 'req-1',
          context: 'Confirm action',
          questions: [
            { id: 'q1', question: 'Proceed?', type: 'single-select', options: ['Yes', 'No'] },
          ],
        },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const humanBlock = assistantMsg?.blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock).toBeDefined();
    expect(humanBlock?.metadata?.requestId).toBe('req-1');
    expect(humanBlock?.metadata?.inputType).toBe('single-select');
    expect(humanBlock?.metadata?.message).toBe('Proceed?');
  });

  it('handles human-input-resolved events', async () => {
    mockChatSSE([
      {
        event: 'human-input',
        data: {
          requestId: 'req-1',
          context: 'Confirm',
          questions: [{ id: 'q1', question: 'Go?', type: 'input' }],
        },
      },
      {
        event: 'human-input-resolved',
        data: { requestId: 'req-1', response: 'yes' },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const humanBlock = assistantMsg?.blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock?.status).toBe('completed');
    expect(humanBlock?.metadata?.response).toBe('yes');
  });

  it('handles error events from server', async () => {
    mockChatSSE([{ event: 'error', data: { message: 'Something went wrong' } }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.status).toBe('error');
    expect(assistantMsg?.content).toContain('Something went wrong');
  });

  it('handles HTTP error response', async () => {
    mockChatError(500);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('marks all streaming blocks as completed on done', async () => {
    mockChatSSE([
      { event: 'tool-start', data: { name: 'test_tool', args: {} } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.status).toBe('completed');
    const toolBlock = assistantMsg?.blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock?.status).toBe('completed');
  });

  it('respondHumanInput sends POST to /api/chat/:id/respond', async () => {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.resolve({ ok: true } as Response);
    });

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.respondHumanInput('req-1', 'yes');
    });

    expect(fetch).toHaveBeenCalledWith(
      `/api/chat/${sessionId}/respond`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ requestId: 'req-1', response: 'yes' }),
      })
    );
  });

  it('clears input value after sending', async () => {
    mockChatSSE([{ event: 'done', data: {} }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    // Set input value
    act(() => result.current.onInputChange('test input'));
    expect(result.current.inputValue).toBe('test input');

    await act(async () => {
      await result.current.sendMessage('test input');
    });

    // Input should be cleared after send
    expect(result.current.inputValue).toBe('');
  });

  it('handles network error (non-AbortError) in sendMessage', async () => {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.reject(new Error('Network failure'));
    });

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.status).toBe('error');
    expect(assistantMsg?.content).toContain('Connection failed');
  });

  it('handles AbortError by completing streaming message', async () => {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      const abortErr = new Error('Aborted');
      abortErr.name = 'AbortError';
      return Promise.reject(abortErr);
    });

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.status).toBe('completed');
  });

  it('stop() calls abort and fetches stop endpoint', async () => {
    mockChatSSE([{ event: 'done', data: {} }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    // Reset fetch mock to track stop call
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    await act(async () => {
      await result.current.stop();
    });

    expect(fetch).toHaveBeenCalledWith(`/api/chat/${sessionId}/stop`, { method: 'POST' });
  });

  it('stop() ignores fetch errors', async () => {
    mockChatSSE([{ event: 'done', data: {} }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    vi.mocked(fetch).mockRejectedValue(new Error('stop failed'));

    // Should not throw
    await act(async () => {
      await result.current.stop();
    });
  });

  it('respondHumanInput ignores fetch errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('respond failed'));

    const { result } = renderHook(() => useChatAgent(sessionId));

    // Should not throw
    await act(async () => {
      await result.current.respondHumanInput('req-1', 'yes');
    });
  });

  it('handles multi-select human-input type', async () => {
    mockChatSSE([
      {
        event: 'human-input',
        data: {
          requestId: 'req-2',
          context: 'Select options',
          questions: [{ id: 'q1', question: 'Which?', type: 'multi-select', options: ['A', 'B'] }],
        },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const humanBlock = assistantMsg?.blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock?.metadata?.inputType).toBe('multi-select');
  });

  it('handles human-input with default type (no type field)', async () => {
    mockChatSSE([
      {
        event: 'human-input',
        data: {
          requestId: 'req-3',
          context: 'Enter text',
          questions: [{ id: 'q1', question: 'Name?', type: 'text' }],
        },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const humanBlock = assistantMsg?.blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock?.metadata?.inputType).toBe('input');
  });

  it('handles skill-end with non-string result', async () => {
    mockChatSSE([
      { event: 'skill-loading', data: { name: 'test-skill' } },
      { event: 'skill-end', data: { result: { key: 'value' } } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const skillBlock = assistantMsg?.blocks?.find((b) => b.type === 'skill');
    expect(skillBlock?.status).toBe('completed');
    expect(skillBlock?.content).toContain('Result:');
  });

  it('handles response with no body (null body branch)', async () => {
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.resolve({ ok: true, status: 200, body: null } as Response);
    });

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('handles error event with empty content (fallback message)', async () => {
    mockChatSSE([{ event: 'error', data: { message: 'Custom error' } }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.content).toBe('Error: Custom error');
  });

  it('handles skill events with pre-existing blocks (else branches)', async () => {
    // Create a scenario with multiple block types to trigger else branches in .map()
    mockChatSSE([
      { event: 'thinking', data: { content: 'thinking...' } },
      { event: 'skill-loading', data: { name: 'test-skill' } },
      { event: 'skill-loaded', data: { name: 'test-skill', tokenCount: 100 } },
      { event: 'skill-start', data: { task: 'Do work' } },
      { event: 'skill-end', data: { result: 'done' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.blocks).toBeDefined();
    expect(assistantMsg?.blocks?.length).toBeGreaterThanOrEqual(2);
  });

  it('handles human-input-resolved with pre-existing blocks', async () => {
    mockChatSSE([
      {
        event: 'human-input',
        data: {
          requestId: 'req-1',
          context: 'Question',
          questions: [
            { id: 'q1', question: 'A or B?', type: 'single-select', options: ['A', 'B'] },
          ],
        },
      },
      {
        event: 'human-input',
        data: {
          requestId: 'req-2',
          context: 'Another question',
          questions: [{ id: 'q2', question: 'Yes or No?', type: 'input' }],
        },
      },
      {
        event: 'human-input-resolved',
        data: { requestId: 'req-1', response: 'A' },
      },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const blocks = assistantMsg?.blocks?.filter((b) => b.type === 'human_input');
    expect(blocks?.length).toBeGreaterThanOrEqual(2);
  });

  it('handles error event with pre-existing content', async () => {
    mockChatSSE([
      { event: 'token', data: { delta: 'Some text' } },
      { event: 'error', data: { message: 'Server error' } },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    // Error with pre-existing content keeps the content
    expect(assistantMsg?.content).toBe('Some text');
  });

  it('handles tool-start with no args field (nullish coalescing)', async () => {
    mockChatSSE([
      { event: 'tool-start', data: { name: 'run_cmd' } },
      { event: 'tool-end', data: { result: 'ok' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    const toolBlock = assistantMsg?.blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock?.metadata?.toolArgs).toBe('{}');
  });

  it('handles tool-end with multiple blocks (non-matching else branch)', async () => {
    mockChatSSE([
      { event: 'thinking', data: { content: 'Planning...' } },
      { event: 'tool-start', data: { name: 'read_file', args: { path: '/a.txt' } } },
      { event: 'tool-end', data: { result: 'file content' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    // Should have thinking block AND tool_call block
    expect(assistantMsg?.blocks?.length).toBeGreaterThanOrEqual(2);
    const thinkingBlock = assistantMsg?.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock).toBeDefined();
    const toolBlock = assistantMsg?.blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock?.metadata?.toolResult).toBe('file content');
  });

  it('handles malformed SSE data (JSON parse failure)', async () => {
    // Build SSE with invalid JSON data
    const encoder = new TextEncoder();
    const sseText = `event: token\ndata: {invalid-json\n\nevent: token\ndata: ${JSON.stringify({ delta: 'valid' })}\n\nevent: done\ndata: {}\n\n`;
    vi.mocked(fetch).mockImplementation((url: string | Request | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/chat/commands') {
        return Promise.resolve(COMMANDS_RESPONSE);
      }
      return Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(sseText));
            controller.close();
          },
        }),
        status: 200,
      } as Response);
    });

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    // Should still have the valid token content
    expect(assistantMsg?.content).toBe('valid');
  });

  it('handles token event closing a thinking block that does not match any block', async () => {
    // Thinking block gets an ID, then token comes — but thinkingBlockId was already set,
    // the .map() over blocks won't find a matching ID if the block was already completed
    mockChatSSE([
      { event: 'thinking', data: { content: 'Part 1' } },
      { event: 'thinking', data: { content: ' Part 2' } },
      { event: 'token', data: { delta: 'answer' } },
      { event: 'done', data: {} },
    ]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.blocks).toBeDefined();
    // Thinking block should be completed by the token event
    const thinkingBlock = assistantMsg?.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock?.status).toBe('completed');
    expect(assistantMsg?.content).toBe('answer');
  });

  it('handles error event after multiple messages', async () => {
    // Send first message successfully
    mockChatSSE([{ event: 'done', data: {} }]);

    const { result } = renderHook(() => useChatAgent(sessionId));

    await act(async () => {
      await result.current.sendMessage('first');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    // Send second message that errors
    mockChatSSE([{ event: 'error', data: { message: 'Boom' } }]);

    await act(async () => {
      await result.current.sendMessage('second');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    // Should have 4 messages total: user1, assistant1, user2, assistant2
    expect(result.current.messages.length).toBe(4);
    const errorMsg = result.current.messages.find(
      (m) => m.role === 'assistant' && m.status === 'error'
    );
    expect(errorMsg).toBeDefined();
  });
});
