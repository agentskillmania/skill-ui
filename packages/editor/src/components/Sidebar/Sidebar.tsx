/**
 * Sidebar — 右侧面板容器
 *
 * ActivityBar（图标栏） + 面板内容区，切换文件/助手/审核/测试。
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { SidebarProps } from '../../types.js';
import { ActivityBar } from '../ActivityBar/index.js';
import { FileTree } from '../FileTree/index.js';
import { AssistantPanel } from '../AssistantPanel/index.js';
import { ReviewPanel } from '../ReviewPanel/index.js';
import { TestCase } from '../RightPanel/TestCase/TestCase.js';

export function Sidebar({
  activePanel,
  files,
  activeFilePath,
  assistantMessages,
  assistantStatus,
  assistantCommands,
  reviewResult,
  testCases,
  testResults,
  onPanelChange,
  onFileSelect,
  onAssistantSend,
  onAssistantStop,
  onRunTests,
}: SidebarProps) {
  const theme = useTheme();

  const contentWidth = 280;

  return (
    <div
      css={css`
        display: flex;
        height: 100%;
        flex-shrink: 0;
      `}
    >
      {/* 面板内容区 */}
      {activePanel && (
        <div
          css={css`
            width: ${contentWidth}px;
            border-left: 1px solid ${theme.color.borderSecondary};
            background: ${theme.color.bgContainer};
            overflow: hidden;
          `}
        >
          {activePanel === 'files' && (
            <FileTree files={files} activeFilePath={activeFilePath} onSelect={onFileSelect} />
          )}
          {activePanel === 'assistant' && (
            <AssistantPanel
              messages={assistantMessages}
              status={assistantStatus}
              commands={assistantCommands}
              onSend={onAssistantSend}
              onStop={onAssistantStop}
            />
          )}
          {activePanel === 'review' && <ReviewPanel result={reviewResult} />}
          {activePanel === 'test' && (
            <TestCase testCases={testCases} testResults={testResults} onRunTests={onRunTests} />
          )}
        </div>
      )}

      {/* 图标栏 */}
      <ActivityBar activePanel={activePanel} onPanelChange={onPanelChange} />
    </div>
  );
}
