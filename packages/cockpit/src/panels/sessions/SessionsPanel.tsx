/** @jsxImportSource @emotion/react */
/**
 * SessionsPanel component
 * Displays session list for quick switching
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { List, Empty } from 'antd';
import { LayoutList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SidebarPanel } from '../../sidebar/SidebarPanel.js';
import type { SessionsPanelProps } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

/** Format ISO date string to relative time */
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function SessionsPanel({ sessions = [], activeSessionId, onSelect }: SessionsPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <SidebarPanel title={t('sessionsPanel.title')} icon={LayoutList}>
      {sessions.length === 0 ? (
        <Empty description={t('sessionsPanel.noSessions')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={sessions}
          renderItem={(session) => {
            const isActive = session.id === activeSessionId;
            return (
              <List.Item
                onClick={() => onSelect?.(session.id)}
                css={css`
                  cursor: pointer;
                  padding: ${theme.spacing[2]} ${theme.spacing[3]};
                  background: ${isActive ? theme.color.primaryBg : 'transparent'};
                  border-radius: ${theme.radius.sm};
                  margin-bottom: ${theme.spacing[0.5]};
                  &:hover {
                    background: ${theme.color.fillSecondary};
                  }
                `}
              >
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    gap: ${theme.spacing[0.5]};
                    width: 100%;
                    min-width: 0;
                  `}
                >
                  {/* Agent name + model */}
                  <div
                    css={css`
                      font-size: ${theme.font.size.sm};
                      color: ${theme.color.text};
                      font-weight: ${isActive ? theme.font.weight.semibold : theme.font.weight.normal};
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    `}
                  >
                    {session.agentName}
                  </div>
                  {/* Model + relative time */}
                  <div
                    css={css`
                      font-size: ${theme.font.size.xs};
                      color: ${theme.color.textSecondary};
                      display: flex;
                      justify-content: space-between;
                    `}
                  >
                    <span>{session.model}</span>
                    <span>{formatRelativeTime(session.updatedAt)}</span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </SidebarPanel>
  );
}
