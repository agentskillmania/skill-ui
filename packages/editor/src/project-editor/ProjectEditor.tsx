/** @jsxImportSource @emotion/react */
/**
 * ProjectEditor top-level container component
 *
 * Three-column layout: EditorArea (flex:1) | SplitDivider | shared Sidebar
 */
import { Modal } from 'antd';
import { css } from '@emotion/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { EmptyState, Sidebar, SidebarPanel, SplitDivider } from '@agentskillmania/skill-ui-shared';
import type { SidebarIconItem } from '@agentskillmania/skill-ui-shared';
import { FolderOpen, Bot, ClipboardCheck, TestTube2 } from 'lucide-react';
import { NAMESPACE } from '../locales/index.js';
import type { ProjectEditorProps, FileTab, CursorPosition, EditorPanel, ProjectFile } from '../types.js';
import { EditorContext } from '../context/EditorContext.js';
import { getFileLabel } from '../shared/file-utils.js';
import { FileTabs } from '../sections/file-tabs/index.js';
import { EditorArea } from '../editor-area/index.js';
import { StatusBar } from '../sections/status-bar/index.js';
import { FileTree } from '../panels/file-tree/index.js';
import { CopilotPanel } from '../panels/copilot/index.js';
import { ReviewPanel } from '../panels/review/index.js';
import { TestCase } from '../panels/test-case/index.js';
import { useEditorLayout } from '../hooks/useEditorLayout.js';

export function ProjectEditor({
  files,
  activeFilePath,
  editMode,
  activePanel: externalActivePanel,
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
  const layout = useEditorLayout();
  const [isDirty, setIsDirty] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const dirtyFiles = useRef<Set<string>>(new Set());

  const sidebarItems: SidebarIconItem[] = [
    { id: 'files', icon: FolderOpen, label: t('activityBar.files') },
    { id: 'copilot', icon: Bot, label: t('activityBar.copilot') },
    { id: 'review', icon: ClipboardCheck, label: t('activityBar.review') },
    { id: 'test', icon: TestTube2, label: t('activityBar.test') },
  ];

  // Sync external activePanel prop to internal layout state
  useEffect(() => {
    if (externalActivePanel && externalActivePanel !== layout.activePanel) {
      layout.switchPanel(externalActivePanel);
    }
  }, [externalActivePanel]);

  useEffect(() => {
    if (!activeFilePath) return;
    setOpenTabs((prev) => {
      const exists = prev.some((tab) => tab.path === activeFilePath);
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
        prev.map((tab) => (tab.path === activeFilePath ? { ...tab, modified: true } : tab))
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
        prev.map((tab) => (tab.path === activeFilePath ? { ...tab, modified: false } : tab))
      );
      onSave?.(activeFilePath, content);
    },
    [activeFilePath, onSave]
  );

  const handleTabClose = useCallback(
    (path: string) => {
      const doClose = () => {
        setOpenTabs((prev) => {
          const remaining = prev.filter((tab) => tab.path !== path);
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

  const renderPanel = () => {
    const panel = layout.activePanel;
    if (!panel || layout.isCollapsed) return null;

    switch (panel) {
      case 'files':
        return (
          <SidebarPanel title={t('activityBar.files')} icon={FolderOpen}>
            <FileTree files={files} activeFilePath={activeFilePath} onSelect={onActiveFileChange} />
          </SidebarPanel>
        );
      case 'copilot':
        return (
          <SidebarPanel title={t('activityBar.copilot')} icon={Bot}>
            <CopilotPanel
              messages={copilotMessages}
              status={copilotStatus}
              commands={copilotCommands}
              onSend={onCopilotSend}
              onStop={onCopilotStop}
            />
          </SidebarPanel>
        );
      case 'review':
        return (
          <SidebarPanel title={t('activityBar.review')} icon={ClipboardCheck}>
            <ReviewPanel items={reviewItems} />
          </SidebarPanel>
        );
      case 'test':
        return (
          <SidebarPanel title={t('activityBar.test')} icon={TestTube2}>
            <TestCase cases={testCases} onRunAll={onRunAllTests} onRunCase={onRunTest} />
          </SidebarPanel>
        );
      default:
        return null;
    }
  };

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

        {/* SplitDivider */}
        <SplitDivider onResize={layout.setSidebarWidth} disabled={layout.isCollapsed} />

        {/* Shared Sidebar */}
        <Sidebar
          width={layout.sidebarWidth}
          isCollapsed={layout.isCollapsed}
          activePanel={layout.activePanel ?? ''}
          items={sidebarItems}
          onToggleCollapse={() => {
            layout.toggleCollapse();
            onPanelChange(layout.isCollapsed ? layout.activePanel : null);
          }}
          onSwitchPanel={(panel) => {
            layout.switchPanel(panel as Exclude<EditorPanel, null>);
            onPanelChange(panel as EditorPanel);
          }}
        >
          {renderPanel()}
        </Sidebar>
      </div>
    </EditorContext.Provider>
  );
}

/** Recursively find file by path */
function findFile(
  files: ProjectFile[],
  path: string
): ProjectFile | null {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
}
