/** @jsxImportSource @emotion/react */
/**
 * ProjectEditor top-level container component
 *
 * Three-column layout: EditorArea (flex:1) | SplitDivider | shared Sidebar
 */
import { Modal } from 'antd';
import { css } from '@emotion/react';
import { useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { EmptyState, Sidebar, SidebarPanel, SplitDivider } from '@agentskillmania/skill-ui-shared';
import type { SidebarIconItem } from '@agentskillmania/skill-ui-shared';
import { FolderOpen, Bot, ClipboardCheck, TestTube2 } from 'lucide-react';
import { NAMESPACE } from '../locales/index.js';
import type {
  ProjectEditorProps,
  FileTab,
  CursorPosition,
  EditorPanel,
  ProjectFile,
} from '../types.js';
import { EditorContext } from '../context/EditorContext.js';
import { getFileLabel } from '../utils/file-utils.js';
import { FileTabs } from '../sections/file-tabs/index.js';
import { EditorArea } from '../editor-area/index.js';
import { StatusBar } from '../sections/status-bar/index.js';
import { FileTree } from '../panels/file-tree/index.js';
import { CopilotPanel } from '../panels/copilot/index.js';
import { ReviewPanel } from '../panels/review/index.js';
import { TestCase } from '../panels/test-case/index.js';
import { useEditorLayout } from '../hooks/useEditorLayout.js';

export function ProjectEditor({
  editorFiles,
  editorActiveFilePath,
  editorActiveFileContent,
  editorOpenTabs,
  onEditorOpenTabsChange,
  editorDirtyFilePaths,
  onEditorDirtyChange,
  editorCursorPosition,
  onEditorCursorChange,
  editorEditMode,
  onEditorEditModeChange,
  editorActivePanel,
  onEditorPanelChange,
  onEditorFileChange,
  onEditorSave,
  onEditorActiveFileChange,
  copilotMessages,
  copilotStatus,
  copilotCommands,
  copilotInputValue,
  onCopilotInputChange,
  onCopilotSend,
  onCopilotStop,
  reviewItems,
  testCases,
  onTestRunAll,
  onTestRunCase,
  className,
  style,
}: ProjectEditorProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const layout = useEditorLayout();

  // Compute isDirty from props
  const isDirty = editorActiveFilePath
    ? (editorDirtyFilePaths ?? []).includes(editorActiveFilePath)
    : false;

  const sidebarItems: SidebarIconItem[] = [
    { id: 'files', icon: FolderOpen, label: t('activityBar.files') },
    { id: 'copilot', icon: Bot, label: t('activityBar.copilot') },
    { id: 'review', icon: ClipboardCheck, label: t('activityBar.review') },
    { id: 'test', icon: TestTube2, label: t('activityBar.test') },
  ];

  // Sync external editorActivePanel prop to internal layout state
  useEffect(() => {
    if (editorActivePanel && editorActivePanel !== layout.activePanel) {
      layout.switchPanel(editorActivePanel);
    }
  }, [editorActivePanel]);

  const activeFileNode = useMemo(() => {
    if (!editorActiveFilePath) return null;
    return findFile(editorFiles, editorActiveFilePath);
  }, [editorFiles, editorActiveFilePath]);

  const handleFileChange = useCallback(
    (content: string) => {
      if (!editorActiveFilePath) return;
      onEditorFileChange(editorActiveFilePath, content);
    },
    [editorActiveFilePath, onEditorFileChange]
  );

  const handleSave = useCallback(
    (content: string) => {
      if (!editorActiveFilePath) return;
      onEditorSave?.(editorActiveFilePath, content);
    },
    [editorActiveFilePath, onEditorSave]
  );

  const handleTabClose = useCallback(
    (path: string) => {
      const doClose = () => {
        const newTabs = editorOpenTabs.filter((tab) => tab.path !== path);
        onEditorOpenTabsChange(newTabs);
        onEditorDirtyChange?.((editorDirtyFilePaths ?? []).filter((p) => p !== path));
        if (editorActiveFilePath === path) {
          if (newTabs.length > 0) {
            onEditorActiveFileChange(newTabs[newTabs.length - 1].path);
          } else {
            onEditorActiveFileChange(null);
          }
        }
      };

      if ((editorDirtyFilePaths ?? []).includes(path)) {
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
    [
      editorOpenTabs,
      editorDirtyFilePaths,
      editorActiveFilePath,
      onEditorOpenTabsChange,
      onEditorDirtyChange,
      onEditorActiveFileChange,
    ]
  );

  const contextValue = useMemo(
    () => ({
      editMode: editorEditMode,
      activeFilePath: editorActiveFilePath,
      isDirty,
      cursorPosition: editorCursorPosition ?? null,
      setEditMode: onEditorEditModeChange,
      setCursorPosition: onEditorCursorChange ?? (() => {}),
      setDirty: () => {}, // No longer set dirty via context
    }),
    [
      editorEditMode,
      editorActiveFilePath,
      isDirty,
      editorCursorPosition,
      onEditorEditModeChange,
      onEditorCursorChange,
    ]
  );

  const renderPanel = () => {
    const panel = layout.activePanel;
    if (!panel || layout.isCollapsed) return null;

    switch (panel) {
      case 'files':
        return (
          <SidebarPanel title={t('activityBar.files')} icon={FolderOpen}>
            <FileTree
              files={editorFiles}
              activeFilePath={editorActiveFilePath}
              onSelect={onEditorActiveFileChange}
            />
          </SidebarPanel>
        );
      case 'copilot':
        return (
          <SidebarPanel title={t('activityBar.copilot')} icon={Bot}>
            <CopilotPanel
              messages={copilotMessages}
              status={copilotStatus}
              commands={copilotCommands}
              inputValue={copilotInputValue}
              onInputChange={onCopilotInputChange}
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
            <TestCase cases={testCases} onRunAll={onTestRunAll} onRunCase={onTestRunCase} />
          </SidebarPanel>
        );
      default:
        return null;
    }
  };

  return (
    <EditorContext.Provider value={contextValue}>
      <div
        className={className}
        style={style}
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
            tabs={editorOpenTabs}
            activePath={editorActiveFilePath}
            onTabChange={onEditorActiveFileChange}
            onTabClose={handleTabClose}
          />

          <div
            css={css`
              flex: 1;
              overflow: hidden;
            `}
          >
            {editorActiveFilePath && !activeFileNode?.isDirectory ? (
              <EditorArea
                content={editorActiveFileContent}
                filePath={editorActiveFilePath}
                mode={editorEditMode}
                onChange={handleFileChange}
                onSave={handleSave}
                onCursorChange={(pos) => onEditorCursorChange?.(pos)}
              />
            ) : (
              <EmptyState
                description={editorActiveFilePath ? t('editor.isDirectory') : t('editor.emptyHint')}
              />
            )}
          </div>

          <StatusBar
            filePath={editorActiveFilePath}
            editMode={editorEditMode}
            cursorPosition={editorCursorPosition ?? null}
            isDirty={isDirty}
            onEditModeChange={onEditorEditModeChange}
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
            // UI2: layout.isCollapsed is the value BEFORE the toggle. If
            // currently expanded (false), the toggle will collapse → notify
            // parent with null. If currently collapsed (true), the toggle
            // will expand → notify parent with the active panel.
            const willCollapse = !layout.isCollapsed;
            layout.toggleCollapse();
            onEditorPanelChange(willCollapse ? null : layout.activePanel);
          }}
          onSwitchPanel={(panel) => {
            layout.switchPanel(panel as Exclude<EditorPanel, null>);
            onEditorPanelChange(panel as EditorPanel);
          }}
        >
          {renderPanel()}
        </Sidebar>
      </div>
    </EditorContext.Provider>
  );
}

/** Recursively find file by path */
function findFile(files: ProjectFile[], path: string): ProjectFile | null {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
}
