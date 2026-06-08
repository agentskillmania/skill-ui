/** @jsxImportSource @emotion/react */
/**
 * ChatPanel component
 * Left main area containing the Chat component from skill-ui-chat
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Button, Tooltip } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Chat } from '@agentskillmania/skill-ui-chat';
import type { ChatPanelProps } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

export function ChatPanel(props: ChatPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
        background: ${theme.color.bgBase};
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: ${theme.spacing[10]};
          padding: 0 ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.border};
          flex-shrink: 0;
        `}
      >
        <span
          css={css`
            font-size: ${theme.font.size.sm};
            font-weight: ${theme.font.weight.semibold};
            color: ${theme.color.text};
          `}
        >
          {t('chatPanel.title')}
        </span>
        <Tooltip title={t('chatPanel.newSession')}>
          <Button type="text" size="small" icon={<Plus size={14} />} />
        </Tooltip>
      </div>

      {/* Chat */}
      <div
        css={css`
          flex: 1;
          overflow: hidden;
        `}
      >
        <Chat {...props} />
      </div>
    </div>
  );
}
