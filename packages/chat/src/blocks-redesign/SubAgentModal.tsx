/** @jsxImportSource @emotion/react */
/**
 * Sub-agent detail modal — embeds MessageList showing the sub-agent's
 * full conversation (its thinking, tool calls, and final answer).
 *
 * Uses the same antd Modal pattern as ToolCallDetailModal.
 * MessageList no longer needs ChatContext (removed in earlier refactor),
 * so it works standalone inside the modal without any provider wrapper.
 */
import { formatTokens, formatDuration } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Modal } from 'antd';
import { Bot, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import { MessageList } from '../MessageList/index.js';
import type { Message } from '../types.js';

export interface SubAgentModalProps {
  open: boolean;
  name?: string;
  messages?: Message[];
  steps?: number;
  inputTokens?: number;
  outputTokens?: number;
  duration?: number;
  onClose: () => void;
}

export function SubAgentModal({
  open,
  name,
  messages,
  steps,
  inputTokens,
  outputTokens,
  duration,
  onClose,
}: SubAgentModalProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const accent = theme.blockColor.subagent ?? { text: theme.color.primary, bg: 'transparent' };
  const hasMessages = messages && messages.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={720}
      centered
      closeIcon={<X size={16} />}
      footer={null}
      styles={{
        header: {
          borderBottom: `1px solid ${theme.color.borderSecondary}`,
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          margin: 0,
        },
        body: {
          padding: `0`,
          background: theme.color.bgBase,
          height: '60vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
        root: {
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          boxShadow: theme.shadow.lg,
        },
        mask: { backgroundColor: 'rgba(0,0,0,0.4)' },
      }}
      title={
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <div
            css={css`
              width: 28px;
              height: 28px;
              border-radius: ${theme.radius.md};
              background: ${accent.bg};
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Bot size={16} style={{ color: accent.text }} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.md};
              font-weight: 600;
              color: ${theme.color.text};
            `}
          >
            {name ?? t('subagent.title')}
          </span>
        </div>
      }
    >
      {hasMessages ? (
        <div
          css={css`
            flex: 1;
            overflow: hidden;
          `}
        >
          <MessageList messages={messages!} />
        </div>
      ) : (
        <div
          css={css`
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme.color.textTertiary};
            font-size: ${theme.font.size.sm};
          `}
        >
          {t('subagent.noMessages')}
        </div>
      )}

      {/* Footer stats */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[4]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          border-top: 1px solid ${theme.color.borderSecondary};
          font-size: ${theme.font.size.xs};
          color: ${theme.color.textTertiary};
        `}
      >
        {steps != null && <span>{t('subagent.steps', { count: steps })}</span>}
        {inputTokens != null && outputTokens != null && (
          <span>
            {t('subagent.tokens', {
              input: formatTokens(inputTokens),
              output: formatTokens(outputTokens),
            })}
          </span>
        )}
        {duration != null && (
          <span>{t('subagent.duration', { duration: formatDuration(duration) })}</span>
        )}
      </div>
    </Modal>
  );
}
