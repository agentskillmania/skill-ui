/** @jsxImportSource @emotion/react */
/**
 * ProjectEditor top-level container component
 *
 * Two-column layout: editor area (FileTabs + EditorArea + StatusBar) | Sidebar
 */
import { Modal } from 'antd';
import { css } from '@emotion/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@agentskillmania/skill-ui-shared';
import { NAMESPACE } from '../locales/index.js';
import type { ProjectEditorProps, FileTab, CursorPosition } from '../types.js';
import { EditorContext } from '../context/EditorContext.js';
import { getFileLabel } from '../shared/file-utils.js';
import { FileTabs } from '../sections/file-tabs/index.js';
import { EditorArea } from '../editor-area/index.js';
import { StatusBar } from '../sections/status-bar/index.js';
import { Sidebar } from '../sidebar/index.js';

export function ProjectEditor({
  files,
  activeFilePath,
  editMode,
  activePanel,
  onSave,
  onFileChange,
  onActiveFileChange,
  onEditModeChange,
  onPanelChange,
  copilotMessages,
  copilotStatus,
  copilotCommands,
  onCopilotSend,
  onCopilotStop,
  reviewItems,
  testCases,
  onRunAllTests,
  onRunTest,
}: ProjectEditorProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [isDirty, setIsDirty] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const dirtyFiles = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeFilePath) return;
    setOpenTabs((prev) => {
      const exists = prev.some((t) => t.path === activeFilePath);
      if (exists) return prev;
      return [
        ...prev,
        {
          path: activeFilePath,
          label: getFileLabel(activeFilePath),
          modified: dirtyFiles.current.has(activeFilePath),
        },
      ];
    });
  }, [activeFilePath]);

  useEffect(() => {
    setIsDirty(activeFilePath ? dirtyFiles.current.has(activeFilePath) : false);
  }, [activeFilePath]);

  const activeFile = useMemo(() => {
    if (!activeFilePath) return null;
    return findFile(files, activeFilePath);
  }, [files, activeFilePath]);

  const handleFileChange = useCallback(
    (content: string) => {
      if (!activeFilePath) return;
      setIsDirty(true);
      dirtyFiles.current.add(activeFilePath);
      setOpenTabs((prev) =>
        prev.map((t) => (t.path === activeFilePath ? { ...t, modified: true } : t))
      );
      onFileChange(activeFilePath, content);
    },
    [activeFilePath, onFileChange]
  );

  const handleSave = useCallback(
    (content: string) => {
      if (!activeFilePath) return;
      setIsDirty(false);
      dirtyFiles.current.delete(activeFilePath);
      setOpenTabs((prev) =>
        prev.map((t) => (t.path === activeFilePath ? { ...t, modified: false } : t))
      );
      onSave?.(activeFilePath, content);
    },
    [activeFilePath, onSave]
  );

  const handleTabClose = useCallback(
    (path: string) => {
      const doClose = () => {
        setOpenTabs((prev) => {
          const remaining = prev.filter((t) => t.path !== path);
          dirtyFiles.current.delete(path);
          if (activeFilePath === path) {
            if (remaining.length > 0) {
              onActiveFileChange(remaining[remaining.length - 1].path);
            } else {
              onActiveFileChange(null);
            }
          }
          return remaining;
        });
      };

      if (dirtyFiles.current.has(path)) {
        Modal.confirm({
          title: t('editor.closeConfirm.title'),
          content: t('editor.closeConfirm.content', { label: getFileLabel(path) }),
          okText: t('editor.closeConfirm.ok'),
          cancelText: t('editor.closeConfirm.cancel'),
          onOk: doClose,
        });
      } else {
        doClose();
      }
    },
    [activeFilePath, onActiveFileChange]
  );

  const contextValue = useMemo(
    () => ({
      editMode,
      activeFilePath,
      isDirty,
      cursorPosition,
      setEditMode: onEditModeChange,
      setCursorPosition,
      setDirty: setIsDirty,
    }),
    [editMode, activeFilePath, isDirty, cursorPosition, onEditModeChange]
  );

  return (
    <EditorContext.Provider value={contextValue}>
      <div
        css={css`
          display: flex;
          height: 100%;
          width: 100%;
          background: ${theme.color.bgLayout};
          color: ${theme.color.text};
          font-family: ${theme.font.family};
        `}
      >
        {/* Editor area */}
        <div
          css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          `}
        >
          <FileTabs
            tabs={openTabs}
            activePath={activeFilePath}
            onTabChange={onActiveFileChange}
            onTabClose={handleTabClose}
          />

          <div
            css={css`
              flex: 1;
              overflow: hidden;
            `}
          >
            {activeFile && !activeFile.isDirectory ? (
              <EditorArea
                content={activeFile.content}
                filePath={activeFile.path}
                mode={editMode}
                onChange={handleFileChange}
                onSave={handleSave}
                onCursorChange={setCursorPosition}
              />
            ) : (
              <EmptyState
                description={activeFilePath ? t('editor.isDirectory') : t('editor.emptyHint')}
              />
            )}
          </div>

          <StatusBar
            filePath={activeFilePath}
            editMode={editMode}
            cursorPosition={cursorPosition}
            isDirty={isDirty}
            onEditModeChange={onEditModeChange}
          />
        </div>

        {/* Right Sidebar */}
        <Sidebar
          activePanel={activePanel}
          files={files}
          activeFilePath={activeFilePath}
          copilotMessages={copilotMessages}
          copilotStatus={copilotStatus}
          copilotCommands={copilotCommands}
          reviewItems={reviewItems}
          testCases={testCases}
          onPanelChange={onPanelChange}
          onFileSelect={onActiveFileChange}
          onCopilotSend={onCopilotSend}
          onCopilotStop={onCopilotStop}
          onRunAllTests={onRunAllTests}
          onRunTest={onRunTest}
        />
      </div>
    </EditorContext.Provider>
  );
}

/** Recursively find file */
function findFile(
  files: import('../types.js').ProjectFile[],
  path: string
): import('../types.js').ProjectFile | null {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
}
