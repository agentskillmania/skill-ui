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
  onEditMessage,
  onRegenerateMessage,
  onRollbackMessage,
  onForkMessage,
  inputValue,
  onInputChange,
  status = 'idle',
  disabled = false,
  renderers = {},
  welcome,
  autoFocusComposer = 'empty',
  inputPrefix,
  inputSuffix,
  inputBanner,
  messageDecorator,
  messageMeta,
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
  attachments,
  onAttachmentsChange,
  attachmentsDisabled,
  attachmentsDisabledReason,
  maxAttachments,
  maxAttachmentMB,
  onAttachmentsRejected,
}: ChatProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const resolvedPlaceholder = placeholder ?? t('chat.placeholder');

  // Empty-conversation welcome state: the composer centers itself on screen
  // until the first message exists, then slides to the bottom (ChatGPT-style).
  // welcome: undefined = default localized greeting, null = off, node = custom.
  const isEmpty = messages.length === 0;
  const welcomeContent =
    welcome === null ? null : welcome !== undefined ? welcome : t('chat.welcome.title');

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
          position: relative;
        `}
      >
        {welcomeContent !== null && (
          <div
            data-testid="chat-welcome"
            css={css`
              position: absolute;
              left: 0;
              right: 0;
              bottom: ${theme.spacing[8]};
              display: flex;
              justify-content: center;
              padding: 0 ${theme.spacing[4]};
              opacity: ${isEmpty ? 1 : 0};
              pointer-events: ${isEmpty ? 'auto' : 'none'};
              transition: opacity ${theme.motion.duration.slower} ${theme.motion.easing.out};
            `}
          >
            {typeof welcomeContent === 'string' ? (
              <div
                css={css`
                  text-align: center;
                  font-size: ${theme.font.size['2xl']};
                  font-weight: ${theme.font.weight.medium};
                  line-height: ${theme.font.lineHeightHeading};
                  color: ${theme.color.text};
                `}
              >
                {welcomeContent}
              </div>
            ) : (
              welcomeContent
            )}
          </div>
        )}
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
            messageMeta={messageMeta}
            onConfirmHumanRequest={onConfirmHumanRequest}
            onBlockAction={onBlockAction}
            onCopyMessage={onCopyMessage}
            onEditMessage={onEditMessage}
            onRegenerateMessage={onRegenerateMessage}
            onRollbackMessage={onRollbackMessage}
            onForkMessage={onForkMessage}
            hideActions={status === 'streaming'}
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
            autoFocus={autoFocusComposer === 'always' ? true : isEmpty}
            placeholder={resolvedPlaceholder}
            prefix={inputPrefix}
            suffix={inputSuffix}
            banner={inputBanner}
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
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            attachmentsDisabled={attachmentsDisabled}
            attachmentsDisabledReason={attachmentsDisabledReason}
            maxAttachments={maxAttachments}
            maxAttachmentMB={maxAttachmentMB}
            onAttachmentsRejected={onAttachmentsRejected}
          />
        </div>
      </div>

      {/* Empty-state spacer: shares the leftover space with the message area
          50/50 while empty (centering the composer mid-screen), then animates
          flex-grow to 0 so the composer slides to the bottom on first message.
          flex-grow is animatable, unlike justify-content. */}
      <div
        aria-hidden
        css={css`
          flex-grow: ${isEmpty ? 1 : 0};
          flex-shrink: 1;
          flex-basis: 0;
          pointer-events: none;
          transition: flex-grow ${theme.motion.duration.slower} ${theme.motion.easing.out};
        `}
      />
    </div>
  );
}
