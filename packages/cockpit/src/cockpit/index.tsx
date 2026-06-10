/** @jsxImportSource @emotion/react */
/**
 * Cockpit component
 * Main layout: Chat (left) + SplitDivider (middle) + Sidebar (right)
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { ChatPanel } from '../panels/chat/ChatPanel.js';
import { EventLogPanel } from '../panels/event-log/EventLogPanel.js';
import { SessionBoardPanel } from '../panels/session-board/SessionBoardPanel.js';
import { SessionsPanel } from '../panels/sessions/SessionsPanel.js';
import { Sidebar, SplitDivider } from '@agentskillmania/skill-ui-shared';
import type { SidebarIconItem } from '@agentskillmania/skill-ui-shared';
import { LayoutList, ClipboardList, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import { useCockpitLayout } from '../hooks/useCockpitLayout.js';
import type { CockpitProps } from '../types.js';

export function Cockpit(props: CockpitProps) {
  const theme = useTheme();
  const layout = useCockpitLayout('event-log');
  const { t } = useTranslation(NAMESPACE);

  const sidebarItems: SidebarIconItem[] = [
    { id: 'sessions', icon: LayoutList, label: t('sidebar.sessions') },
    { id: 'event-log', icon: ClipboardList, label: t('sidebar.eventLog') },
    { id: 'session-board', icon: BarChart3, label: t('sidebar.sessionBoard') },
  ];

  const {
    // Chat props (prefixed)
    chatMessages,
    onChatSendMessage,
    onChatStop,
    onChatConfirmHumanRequest,
    onChatBlockAction,
    onChatCopyMessage,
    onChatResendMessage,
    onChatRegenerateMessage,
    onChatRollbackMessage,
    onChatForkMessage,
    chatInputValue,
    onChatInputChange,
    chatStatus,
    chatDisabled,
    chatRenderers,
    chatInputPrefix,
    chatInputSuffix,
    chatMessageDecorator,
    chatMaxWidth,
    chatPlaceholder,
    chatCommands,
    onChatCommand,
    chatMaxQuickCommands,
    chatCommandTrigger,

    // Cockpit-specific props
    eventLogEvents,
    sessionBoardState,
    sessionsSessions,
    sessionsActiveId,
    onSessionsSelect,
    className,
    style,
  } = props;

  const renderPanel = () => {
    switch (layout.activePanel) {
      case 'sessions':
        return (
          <SessionsPanel
            sessions={sessionsSessions ?? []}
            activeSessionId={sessionsActiveId}
            onSelect={onSessionsSelect}
          />
        );
      case 'event-log':
        return (
          <EventLogPanel events={eventLogEvents ?? []} />
        );
      case 'session-board':
        return (
          <SessionBoardPanel
            state={sessionBoardState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={className}
      style={style}
      css={css`
        display: flex;
        height: 100%;
        width: 100%;
        background: ${theme.color.bgBase};
        overflow: hidden;
      `}
    >
      {/* Left: Chat */}
      <ChatPanel
        messages={chatMessages}
        onSendMessage={onChatSendMessage}
        onStop={onChatStop}
        onConfirmHumanRequest={onChatConfirmHumanRequest}
        onBlockAction={onChatBlockAction}
        onCopyMessage={onChatCopyMessage}
        onResendMessage={onChatResendMessage}
        onRegenerateMessage={onChatRegenerateMessage}
        onRollbackMessage={onChatRollbackMessage}
        onForkMessage={onChatForkMessage}
        inputValue={chatInputValue}
        onInputChange={onChatInputChange}
        status={chatStatus}
        disabled={chatDisabled}
        renderers={chatRenderers}
        inputPrefix={chatInputPrefix}
        inputSuffix={chatInputSuffix}
        messageDecorator={chatMessageDecorator}
        maxWidth={chatMaxWidth}
        placeholder={chatPlaceholder}
        commands={chatCommands}
        onCommand={onChatCommand}
        maxQuickCommands={chatMaxQuickCommands}
        commandTrigger={chatCommandTrigger}
      />

      {/* Middle: SplitDivider */}
      <SplitDivider
        onResize={layout.setSidebarWidth}
        disabled={layout.isCollapsed}
      />

      {/* Right: Sidebar */}
      <Sidebar
        width={layout.sidebarWidth}
        isCollapsed={layout.isCollapsed}
        activePanel={layout.activePanel}
        items={sidebarItems}
        onToggleCollapse={layout.toggleCollapse}
        onSwitchPanel={(panel) => layout.switchPanel(panel as any)}
      >
        {renderPanel()}
      </Sidebar>
    </div>
  );
}
