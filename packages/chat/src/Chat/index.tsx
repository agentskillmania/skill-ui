/**
 * Chat top-level component
 */
import { useTheme, flexColumn } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { ChatInput } from '../ChatInput/index.js';
import { NAMESPACE } from '../locales/index.js';
import { MessageList } from '../MessageList/index.js';
import type { ChatProps } from '../types.js';

export function Chat({
  messages,
  onSendMessage,
  onStop,
  onConfirmHumanRequest,
  onBlockAction,
  onCopyMessage,
  onResendMessage,
  onRegenerateMessage,
  onRollbackMessage,
  onForkMessage,
  inputValue,
  onInputChange,
  status = 'idle',
  disabled = false,
  renderers = {},
  inputPrefix,
  inputSuffix,
  messageDecorator,
  maxWidth = '800px',
  placeholder,
  className,
  style,
  commands,
  onCommand,
  maxQuickCommands = 5,
  commandTrigger = '/',
  models,
  selectedModel,
  onModelChange,
  thinking,
  onThinkingChange,
  contextUsage,
}: ChatProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const resolvedPlaceholder = placeholder ?? t('chat.placeholder');

  return (
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
          <MessageList
            messages={messages}
            renderers={renderers}
            messageDecorator={messageDecorator}
            onConfirmHumanRequest={onConfirmHumanRequest}
            onBlockAction={onBlockAction}
            onCopyMessage={onCopyMessage}
            onResendMessage={onResendMessage}
            onRegenerateMessage={onRegenerateMessage}
            onRollbackMessage={onRollbackMessage}
            onForkMessage={onForkMessage}
          />
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
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onSendMessage}
            onCancel={onStop}
            loading={status === 'streaming'}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            prefix={inputPrefix}
            suffix={inputSuffix}
            commands={commands}
            onCommand={onCommand}
            commandTrigger={commandTrigger}
            maxQuickCommands={maxQuickCommands}
            models={models}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            thinking={thinking}
            onThinkingChange={onThinkingChange}
            contextUsage={contextUsage}
          />
        </div>
      </div>
    </div>
  );
}
