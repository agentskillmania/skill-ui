/** @jsxImportSource @emotion/react */
/**
 * EditorWorkbench — 完整编辑工作台（受控组合）。
 *
 * 布局：FileTree 侧栏 | SplitDivider |（FileTabs + EditorArea + StatusBar）。
 * 文件打开/页签/脏标记/保存/模式切换的编排状态机在此；数据由宿主注入。
 */
import {
  EmptyState,
  FileTree,
  FileTabs,
  getFileLabel,
  type FileNode,
} from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Modal } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplitDivider } from '../components/SplitDivider.js';
import { EditorContext } from '../context/EditorContext.js';
import { EditorArea } from '../editor-area/index.js';
import { useEditorLayout } from '../hooks/useEditorLayout.js';
import { NAMESPACE } from '../locales/index.js';
import { StatusBar } from '../sections/status-bar/index.js';
import type { EditorWorkbenchProps } from '../types.js';

export function EditorWorkbench({
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
  onEditorFileChange,
  onEditorSave,
  onEditorActiveFileChange,
  className,
  style,
}: EditorWorkbenchProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const layout = useEditorLayout();

  // Compute isDirty from props
  const isDirty = editorActiveFilePath
    ? (editorDirtyFilePaths ?? []).includes(editorActiveFilePath)
    : false;

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
      t,
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
        {/* File tree sidebar */}
        {!layout.isCollapsed && (
          <div
            css={css`
              width: ${layout.sidebarWidth}px;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              border-right: 1px solid ${theme.color.borderSecondary};
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: ${theme.spacing[1]} ${theme.spacing[2]};
                font-size: ${theme.font.size.sm};
                color: ${theme.color.textSecondary};
                user-select: none;
              `}
            >
              <span>{t('workbench.files')}</span>
              <button
                type="button"
                aria-label={t('workbench.collapseSidebar')}
                onClick={layout.toggleCollapse}
                css={css`
                  display: flex;
                  align-items: center;
                  border: none;
                  background: transparent;
                  cursor: pointer;
                  color: ${theme.color.textTertiary};
                  padding: ${theme.spacing['0.5']};
                  border-radius: ${theme.radius.xs};
                  &:hover {
                    color: ${theme.color.text};
                    background: ${theme.color.fillSubtle};
                  }
                `}
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
            <div
              css={css`
                flex: 1;
                overflow: hidden;
              `}
            >
              <FileTree
                files={editorFiles}
                activeFilePath={editorActiveFilePath}
                onSelect={onEditorActiveFileChange}
              />
            </div>
          </div>
        )}
        {layout.isCollapsed && (
          <button
            type="button"
            aria-label={t('workbench.expandSidebar')}
            onClick={layout.toggleCollapse}
            css={css`
              align-self: flex-start;
              margin: ${theme.spacing[1]};
              display: flex;
              align-items: center;
              border: none;
              background: transparent;
              cursor: pointer;
              color: ${theme.color.textTertiary};
              padding: ${theme.spacing['0.5']};
              border-radius: ${theme.radius.xs};
              &:hover {
                color: ${theme.color.text};
                background: ${theme.color.fillSubtle};
              }
            `}
          >
            <PanelLeftOpen size={14} />
          </button>
        )}

        {/* SplitDivider */}
        <SplitDivider onResize={layout.setSidebarWidth} disabled={layout.isCollapsed} side="left" />

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
      </div>
    </EditorContext.Provider>
  );
}

/** Recursively find file by path */
function findFile(files: FileNode[], path: string): FileNode | null {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
}
