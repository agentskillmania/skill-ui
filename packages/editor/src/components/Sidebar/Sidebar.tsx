/** @jsxImportSource @emotion/react */
/**
 * Sidebar — right-side panel container
 *
 * ActivityBar (icon bar) + panel content area, switch between files/copilot/review/test.
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { SidebarProps } from '../../types.js';
import { ActivityBar } from '../ActivityBar/index.js';
import { FileTree } from '../FileTree/index.js';
import { CopilotPanel } from '../CopilotPanel/index.js';
import { ReviewPanel } from '../ReviewPanel/index.js';
import { TestCase } from '../TestCase/index.js';

export function Sidebar({
  activePanel,
  files,
  activeFilePath,
  copilotMessages,
  copilotStatus,
  copilotCommands,
  reviewItems,
  testCases,
  onPanelChange,
  onFileSelect,
  onCopilotSend,
  onCopilotStop,
  onRunAllTests,
  onRunTest,
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
      {/* Panel content area */}
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
          {activePanel === 'copilot' && (
            <CopilotPanel
              messages={copilotMessages}
              status={copilotStatus}
              commands={copilotCommands}
              onSend={onCopilotSend}
              onStop={onCopilotStop}
            />
          )}
          {activePanel === 'review' && <ReviewPanel items={reviewItems} />}
          {activePanel === 'test' && (
            <TestCase cases={testCases} onRunAll={onRunAllTests} onRunCase={onRunTest} />
          )}
        </div>
      )}

      {/* Icon bar */}
      <ActivityBar activePanel={activePanel} onPanelChange={onPanelChange} />
    </div>
  );
}
