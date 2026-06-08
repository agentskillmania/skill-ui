import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEditor } from '../../../src/hooks/useEditor.js';

describe('useEditor', () => {
  const sessionId = 'sess-1';
  const mockTree = {
    path: '.',
    name: 'root',
    isDirectory: true,
    children: [
      { path: 'index.ts', name: 'index.ts', isDirectory: false },
      { path: 'sub', name: 'sub', isDirectory: true, children: [] },
    ],
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with empty files and loading state', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useEditor(sessionId));
    expect(result.current.files).toEqual([]);
    expect(result.current.activeFilePath).toBeNull();
    expect(result.current.activeFileContent).toBe('');
    expect(result.current.isDirty).toBe(false);
  });

  it('loads file tree on mount', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTree),
    } as Response);

    const { result } = renderHook(() => useEditor(sessionId));

    await waitFor(() => {
      expect(result.current.files.length).toBeGreaterThan(0);
    });
    expect(result.current.files).toEqual(mockTree.children);
    expect(fetch).toHaveBeenCalledWith(`/api/files/${sessionId}/tree`);
  });

  it('handles tree load failure gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useEditor(sessionId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    // Should not throw, files remain empty
    expect(result.current.files).toEqual([]);
  });

  describe('openFile', () => {
    it('opens a file and sets content', async () => {
      // First load tree
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'file content here' }),
      } as Response);

      await act(() => result.current.openFile('index.ts'));

      expect(result.current.activeFilePath).toBe('index.ts');
      expect(result.current.activeFileContent).toBe('file content here');
      expect(result.current.isDirty).toBe(false);
    });

    it('handles open failure gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Not found'));

      await act(() => result.current.openFile('nonexistent.ts'));

      // Should not change state
      expect(result.current.activeFilePath).toBeNull();
    });
  });

  describe('saveFile', () => {
    it('saves file and clears dirty state', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'original' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));

      // Modify content
      act(() => result.current.updateContent('modified'));
      expect(result.current.isDirty).toBe(true);

      // Save
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      await act(() => result.current.saveFile('index.ts', 'modified'));

      expect(result.current.isDirty).toBe(false);
    });

    it('handles save failure gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open + modify
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'original' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));
      act(() => result.current.updateContent('modified'));

      // Save fails
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Save failed'));
      await act(() => result.current.saveFile('index.ts', 'modified'));

      // Should still be dirty
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('createFile', () => {
    it('creates a new file and refreshes tree', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // POST create
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, path: 'new.ts' }),
      } as Response);
      // loadTree after create
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      // openFile after create
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: '' }),
      } as Response);

      await act(() => result.current.createFile('new.ts', 'content'));

      expect(fetch).toHaveBeenCalledWith(
        `/api/files/${sessionId}`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('deleteFile', () => {
    it('deletes a file and refreshes tree', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open a file first
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'content' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));
      expect(result.current.activeFilePath).toBe('index.ts');

      // Delete the active file
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      // loadTree after delete
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);

      await act(() => result.current.deleteFile('index.ts'));

      // Active file should be cleared
      expect(result.current.activeFilePath).toBeNull();
      expect(result.current.activeFileContent).toBe('');
    });

    it('does not clear active file when deleting a different file', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file A
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'content A' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));

      // Delete file B
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);

      await act(() => result.current.deleteFile('other.ts'));

      // Active file should remain
      expect(result.current.activeFilePath).toBe('index.ts');
    });
  });

  describe('updateContent', () => {
    it('updates content and marks as dirty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'original' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));
      expect(result.current.isDirty).toBe(false);

      // Update content
      act(() => result.current.updateContent('changed'));
      expect(result.current.activeFileContent).toBe('changed');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('error branches', () => {
    it('handles loadTree with non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useEditor(sessionId));

      await waitFor(() => expect(result.current.loading).toBe(false));
      // Files should remain empty
      expect(result.current.files).toEqual([]);
    });

    it('handles loadTree with network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEditor(sessionId));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.files).toEqual([]);
    });

    it('handles saveFile with non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'original' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));

      // Modify content
      act(() => result.current.updateContent('modified'));
      expect(result.current.isDirty).toBe(true);

      // Save returns non-ok
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);
      await act(() => result.current.saveFile('index.ts', 'modified'));

      // Should still be dirty because save failed
      expect(result.current.isDirty).toBe(true);
    });

    it('handles createFile with non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // POST returns non-ok
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      // Should not crash
      await act(() => result.current.createFile('bad.ts', 'content'));
      expect(result.current.files).toBeDefined();
    });

    it('handles deleteFile with non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // DELETE returns non-ok
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      // Should not crash
      await act(() => result.current.deleteFile('missing.ts'));
    });

    it('handles openFile with non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // GET content returns non-ok
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await act(() => result.current.openFile('missing.ts'));
      // Should not change active file
      expect(result.current.activeFilePath).toBeNull();
    });

    it('handles openFile with network error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await act(() => result.current.openFile('broken.ts'));
      expect(result.current.activeFilePath).toBeNull();
    });

    it('handles saveFile with network error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      } as Response);
      const { result } = renderHook(() => useEditor(sessionId));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Open file
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'original' }),
      } as Response);
      await act(() => result.current.openFile('index.ts'));

      act(() => result.current.updateContent('modified'));

      // Save throws network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
      await act(() => result.current.saveFile('index.ts', 'modified'));

      expect(result.current.isDirty).toBe(true);
    });
  });
});
