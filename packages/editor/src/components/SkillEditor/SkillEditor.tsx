/**
 * SkillEditor 顶层容器组件
 *
 * 两栏布局：编辑区（FileTabs + EditorArea + StatusBar） | Sidebar
 */
import { Modal, Empty } from 'antd';
import { css } from '@emotion/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { SkillEditorProps, FileTab, CursorPosition } from '../../types.js';
import { EditorContext } from '../../context/EditorContext.js';
import { getFileLabel } from '../../utils/file-utils.js';
import { FileTabs } from '../FileTabs/index.js';
import { EditorArea } from '../EditorArea/index.js';
import { StatusBar } from '../StatusBar/index.js';
import { Sidebar } from '../Sidebar/index.js';

export function SkillEditor({
  files,
  activeFilePath,
  editMode,
  activePanel,
  onSave,
  onFileChange,
  onActiveFileChange,
  onEditModeChange,
  onPanelChange,
  assistantMessages,
  assistantStatus,
  assistantCommands,
  onAssistantSend,
  onAssistantStop,
  reviewResult,
  testCases,
  testResults,
  onRunTests,
}: SkillEditorProps) {
  const theme = useTheme();
  const [isDirty, setIsDirty] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  // 跟踪每个文件是否修改过
  const dirtyFiles = useRef<Set<string>>(new Set());

  // 当 activeFilePath 变化时，确保 tab 存在（实际写入 state）
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

  // 文件切换时同步 isDirty 状态
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
      // 更新 tab 的 modified 状态
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
      // 更新 tab 的 modified 状态
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
          // 当前活动文件被关闭
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
          title: '关闭确认',
          content: `"${getFileLabel(path)}" 有未保存的修改，确定要关闭吗？`,
          okText: '关闭',
          cancelText: '取消',
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
        {/* 编辑区 */}
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
              <div
                css={css`
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}
              >
                <Empty description={activeFilePath ? '此文件为目录' : '选择一个文件开始编辑'} />
              </div>
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

        {/* 右侧 Sidebar */}
        <Sidebar
          activePanel={activePanel}
          files={files}
          activeFilePath={activeFilePath}
          assistantMessages={assistantMessages}
          assistantStatus={assistantStatus}
          assistantCommands={assistantCommands}
          reviewResult={reviewResult}
          testCases={testCases}
          testResults={testResults}
          onPanelChange={onPanelChange}
          onFileSelect={onActiveFileChange}
          onAssistantSend={onAssistantSend}
          onAssistantStop={onAssistantStop}
          onRunTests={onRunTests}
        />
      </div>
    </EditorContext.Provider>
  );
}

/** 递归查找文件 */
function findFile(
  files: import('../../types.js').SkillFile[],
  path: string
): import('../../types.js').SkillFile | null {
  for (const f of files) {
    if (f.path === path) return f;
    if (f.children) {
      const found = findFile(f.children, path);
      if (found) return found;
    }
  }
  return null;
}
