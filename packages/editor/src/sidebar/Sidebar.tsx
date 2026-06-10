/** @jsxImportSource @emotion/react */
/**
 * Sidebar — right-side panel container
 *
 * SidebarIcons (icon bar) + panel content area, switch between files/copilot/review/test.
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { SidebarIcons } from '@agentskillmania/skill-ui-shared';
import type { SidebarIconItem } from '@agentskillmania/skill-ui-shared';
import { FolderOpen, Bot, ClipboardCheck, TestTube2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import type { SidebarProps, SidebarPanel } from '../types.js';
import { FileTree } from '../panels/file-tree/index.js';
import { CopilotPanel } from '../panels/copilot/index.js';
import { ReviewPanel } from '../panels/review/index.js';
import { TestCase } from '../panels/test-case/index.js';

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
  const { t } = useTranslation(NAMESPACE);

  const panelIcons: SidebarIconItem[] = [
    { id: 'files', icon: FolderOpen, label: t('activityBar.files') },
    { id: 'copilot', icon: Bot, label: t('activityBar.copilot') },
    { id: 'review', icon: ClipboardCheck, label: t('activityBar.review') },
    { id: 'test', icon: TestTube2, label: t('activityBar.test') },
  ];

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
      <SidebarIcons
        items={panelIcons}
        activeId={activePanel ?? ''}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        onSwitchPanel={(id) => onPanelChange(activePanel === id ? null : (id as SidebarPanel))}
      />
    </div>
  );
}
