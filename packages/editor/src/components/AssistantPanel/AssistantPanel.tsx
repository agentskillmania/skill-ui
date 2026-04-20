/**
 * AssistantPanel — AI 助手面板
 *
 * 嵌入 skill-ui-chat 的 MessageList + ChatInput，带快捷命令。
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { MessageList, ChatInput } from '@agentskillmania/skill-ui-chat';
import type { AssistantPanelProps } from '../../types.js';

export function AssistantPanel({
  messages = [],
  status = 'idle',
  commands,
  onSend,
  onStop,
}: AssistantPanelProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* 消息列表 */}
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
        `}
      >
        {messages.length === 0 ? (
          <div
            css={css`
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              gap: ${theme.spacing[2]};
              color: ${theme.color.textTertiary};
              font-size: ${theme.font.size.sm};
              padding: ${theme.spacing[3]};
            `}
          >
            <span>向 AI 助手提问，或使用快捷命令</span>
            {commands && commands.length > 0 && (
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
            )}
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* 输入框 */}
      <div
        css={css`
          padding: ${theme.spacing[2]};
          border-top: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <ChatInput
          loading={status === 'streaming'}
          onSubmit={(msg) => onSend?.(msg)}
          onCancel={onStop}
          placeholder="向助手提问..."
        />
      </div>
    </div>
  );
}
