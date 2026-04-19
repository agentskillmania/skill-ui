/**
 * Chat 顶层组件
 */
import { css } from '@emotion/react';
import { useTheme, flexColumn } from '@agentskillmania/skill-ui-theme';
import type { ChatProps } from '../types.js';
import { ChatContext } from '../context.js';
import { MessageList } from '../MessageList/index.js';
import { ChatInput } from '../ChatInput/index.js';
import { QuickCommands } from '../commands/QuickCommands.js';

export function Chat({
  messages,
  onSendMessage,
  onStop,
  onConfirmHumanRequest,
  inputValue,
  onInputChange,
  status = 'idle',
  disabled = false,
  renderers = {},
  inputPrefix,
  inputSuffix,
  messageDecorator,
  maxWidth = '800px',
  placeholder = '输入消息...',
  className,
  style,
  commands,
  onCommand,
  maxQuickCommands = 5,
  commandTrigger = '/',
}: ChatProps) {
  const theme = useTheme();

  const contextValue = {
    renderers,
    onConfirmHumanRequest,
    messageDecorator,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      <div
        className={className}
        style={style}
        css={css`
          ${flexColumn(theme)}
          height: 100%;
          width: 100%;
          position: relative;
          background: ${theme.color.bgBase};
        `}
      >
        <div
          css={css`
            flex: 1;
            overflow: hidden;
            display: flex;
            justify-content: center;
          `}
        >
          <div
            css={css`
              width: 100%;
              max-width: ${maxWidth};
              height: 100%;
            `}
          >
            <MessageList messages={messages} />
          </div>
        </div>

        <div
          css={css`
            display: flex;
            justify-content: center;
            padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[4]};
          `}
        >
          <div
            css={css`
              width: 100%;
              max-width: ${maxWidth};
              display: flex;
              flex-direction: column;
              gap: ${theme.spacing[2]};
            `}
          >
            {commands && commands.length > 0 && onCommand && (
              <QuickCommands
                commands={commands}
                onCommand={onCommand}
                maxCommands={maxQuickCommands}
                disabled={disabled}
              />
            )}
            <ChatInput
              value={inputValue}
              onChange={onInputChange}
              onSubmit={onSendMessage}
              onCancel={onStop}
              loading={status === 'streaming'}
              disabled={disabled}
              placeholder={placeholder}
              prefix={inputPrefix}
              suffix={inputSuffix}
              commands={commands}
              onCommand={onCommand}
              commandTrigger={commandTrigger}
            />
          </div>
        </div>
      </div>
    </ChatContext.Provider>
  );
}
