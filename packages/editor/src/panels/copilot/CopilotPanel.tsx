/** @jsxImportSource @emotion/react */
/**
 * CopilotPanel — AI copilot chat panel
 *
 * Embeds skill-ui-chat's MessageList + ChatInput, with quick commands.
 */
import { MessageList, ChatInput } from '@agentskillmania/skill-ui-chat';
import { EmptyState } from '@agentskillmania/skill-ui-shared';
import { useTheme, borderSeparator } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { CopilotPanelProps } from '../../types.js';

export function CopilotPanel({
  messages = [],
  status = 'idle',
  commands,
  inputValue = '',
  onInputChange,
  onSend,
  onStop,
}: CopilotPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* Message list */}
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
        `}
      >
        {messages.length === 0 ? (
          <EmptyState
            description={t('copilot.emptyHint')}
            action={
              commands && commands.length > 0 ? (
                <div
                  css={css`
                    display: flex;
                    flex-wrap: wrap;
                    gap: ${theme.spacing[1]};
                    justify-content: center;
                  `}
                >
                  {commands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => onSend?.(cmd.command)}
                      css={css`
                        padding: ${theme.spacing['0.5']} ${theme.spacing[2]};
                        border: 1px solid ${theme.color.borderSecondary};
                        border-radius: ${theme.radius.sm};
                        background: transparent;
                        cursor: pointer;
                        font-size: ${theme.font.size.xs};
                        color: ${theme.color.textSecondary};
                        transition: all ${theme.motion.duration.fast};

                        &:hover {
                          border-color: ${theme.color.primary};
                          color: ${theme.color.primary};
                          background: ${theme.color.primaryBg};
                        }
                      `}
                      type="button"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              ) : null
            }
          />
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input box */}
      <div
        css={css`
          padding: ${theme.spacing[2]};
          ${borderSeparator(theme, 'top')}
        `}
      >
        <ChatInput
          value={inputValue}
          onChange={onInputChange ?? (() => {})}
          loading={status === 'streaming'}
          onSubmit={(msg) => onSend?.(msg)}
          onCancel={onStop}
          placeholder={t('copilot.placeholder')}
        />
      </div>
    </div>
  );
}
