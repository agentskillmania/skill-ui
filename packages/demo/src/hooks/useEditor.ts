/**
 * useEditor — file tree, active file, dirty tracking
 */
import type { ProjectFile } from '@agentskillmania/skill-ui-editor';
import { useState, useEffect, useCallback } from 'react';

interface UseEditorReturn {
  files: ProjectFile[];
  activeFilePath: string | null;
  activeFileContent: string;
  isDirty: boolean;
  loading: boolean;
  loadTree: () => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  updateContent: (content: string) => void;
}

export function useEditor(sessionId: string): UseEditorReturn {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const isDirty = activeFileContent !== savedContent;

  const loadTree = useCallback(async () => {
    // Skip when session not yet established (placeholder ID)
    if (!sessionId || sessionId.startsWith('__') || sessionId.startsWith('pending-')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${sessionId}/tree`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const root = await res.json();
      setFiles(root.children ?? []);
    } catch {
      // Ignore — tree loads best-effort
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const openFile = useCallback(
    async (filePath: string) => {
      try {
        const res = await fetch(
          `/api/files/${sessionId}/content?path=${encodeURIComponent(filePath)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setActiveFilePath(filePath);
        setActiveFileContent(data.content);
        setSavedContent(data.content);
      } catch {
        // Ignore — open fails silently
      }
    },
    [sessionId]
  );

  const saveFile = useCallback(
    async (filePath: string, content: string) => {
      try {
        const res = await fetch(`/api/files/${sessionId}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: filePath, content }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSavedContent(content);
      } catch {
        // Ignore — save fails silently
      }
    },
    [sessionId]
  );

  const createFile = useCallback(
    async (filePath: string, content = '') => {
      try {
        const res = await fetch(`/api/files/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: filePath, content }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await loadTree();
        await openFile(filePath);
      } catch {
        // Ignore
      }
    },
    [sessionId, loadTree, openFile]
  );

  const deleteFile = useCallback(
    async (filePath: string) => {
      try {
        const res = await fetch(`/api/files/${sessionId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: filePath }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (activeFilePath === filePath) {
          setActiveFilePath(null);
          setActiveFileContent('');
          setSavedContent('');
        }
        await loadTree();
      } catch {
        // Ignore
      }
    },
    [sessionId, activeFilePath, loadTree]
  );

  const updateContent = useCallback((content: string) => {
    setActiveFileContent(content);
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  return {
    files,
    activeFilePath,
    activeFileContent,
    isDirty,
    loading,
    loadTree,
    openFile,
    saveFile,
    createFile,
    deleteFile,
    updateContent,
  };
}
