import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSession } from '../../../src/hooks/useSession.js';

describe('useSession', () => {
  const mockSession = {
    id: 'sess-1',
    workspacePath: '/test/workspace',
    agentPath: undefined,
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no active session', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.activeSession).toBeNull();
    expect(result.current.creating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('createSession', () => {
    it('creates a session and sets it as active', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as Response);

      const { result } = renderHook(() => useSession());

      const info = await act(() =>
        result.current.createSession({ workspacePath: '/test/workspace' })
      );

      expect(info).toEqual(mockSession);
      expect(result.current.activeSession).toEqual(mockSession);
      expect(result.current.creating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets creating=true while in progress', async () => {
      let resolvePromise: (value: unknown) => void;
      vi.mocked(fetch).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.createSession({ workspacePath: '/test' });
      });

      expect(result.current.creating).toBe(true);

      await act(async () => {
        resolvePromise!({ ok: true, json: () => Promise.resolve(mockSession) });
      });

      expect(result.current.creating).toBe(false);
    });

    it('sets error when create fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useSession());

      const info = await act(() => result.current.createSession({ workspacePath: '/test' }));

      expect(info).toBeNull();
      expect(result.current.error).toBe('Error: HTTP 500');
    });

    it('sets error when fetch throws', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network fail'));

      const { result } = renderHook(() => useSession());

      const info = await act(() => result.current.createSession({ workspacePath: '/test' }));

      expect(info).toBeNull();
      expect(result.current.error).toBe('Error: Network fail');
    });
  });

  describe('loadSession', () => {
    it('loads a session by id', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as Response);

      const { result } = renderHook(() => useSession());

      const info = await act(() => result.current.loadSession('sess-1'));

      expect(info).toEqual(mockSession);
      expect(result.current.activeSession).toEqual(mockSession);
      expect(fetch).toHaveBeenCalledWith('/api/sessions/sess-1');
    });

    it('sets error when load fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useSession());

      const info = await act(() => result.current.loadSession('bad-id'));

      expect(info).toBeNull();
      expect(result.current.error).toBe('Error: Not found');
    });

    it('sets error when load returns non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const { result } = renderHook(() => useSession());

      const info = await act(() => result.current.loadSession('missing'));

      expect(info).toBeNull();
      expect(result.current.error).toBe('Error: HTTP 404');
    });
  });

  describe('deleteSession', () => {
    it('deletes a session and clears active if it matches', async () => {
      // First create a session
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as Response);
      const { result } = renderHook(() => useSession());
      await act(() => result.current.createSession({ workspacePath: '/test' }));
      expect(result.current.activeSession).toBeTruthy();

      // Delete it
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      const success = await act(() => result.current.deleteSession('sess-1'));

      expect(success).toBe(true);
      expect(result.current.activeSession).toBeNull();
    });

    it('does not clear active session when deleting a different session', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as Response);
      const { result } = renderHook(() => useSession());
      await act(() => result.current.createSession({ workspacePath: '/test' }));

      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      await act(() => result.current.deleteSession('other-session'));

      expect(result.current.activeSession).toEqual(mockSession);
    });

    it('returns false when delete fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Fail'));

      const { result } = renderHook(() => useSession());
      const success = await act(() => result.current.deleteSession('sess-1'));

      expect(success).toBe(false);
    });

    it('returns false when delete returns non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const { result } = renderHook(() => useSession());
      const success = await act(() => result.current.deleteSession('missing'));

      expect(success).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('clears the active session', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as Response);
      const { result } = renderHook(() => useSession());
      await act(() => result.current.createSession({ workspacePath: '/test' }));
      expect(result.current.activeSession).toBeTruthy();

      act(() => result.current.clearSession());
      expect(result.current.activeSession).toBeNull();
    });
  });
});
