/**
 * AI assistant message
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { memo } from 'react';

import { TypingIndicator } from './TypingIndicator.js';
import { BlocksRenderer } from '../blocks-redesign/BlocksRenderer.js';
import { MarkdownRenderer } from '../content/MarkdownRenderer.js';
import type { MessageProps } from '../types.js';

export const AssistantMessage = memo(function AssistantMessage({
  message,
  onConfirmHumanRequest,
  onBlockAction,
  renderers,
}: MessageProps) {
  const theme = useTheme();

  const hasBlocks = message.blocks && message.blocks.length > 0;
  const hasContent = Boolean(message.content);
  // Empty streaming bubble — show typing dots before the first token arrives
  const showTyping = message.status === 'streaming' && !hasBlocks && !hasContent;

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        border-radius: ${theme.radius.xs} ${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg};
      `}
    >
      {hasBlocks && (
        <div
          css={css`
            margin-bottom: ${theme.spacing[3]};
          `}
        >
          <BlocksRenderer
            blocks={message.blocks!}
            renderers={renderers}
            onConfirmHumanRequest={onConfirmHumanRequest}
            onBlockAction={onBlockAction}
          />
        </div>
      )}
      {hasContent && (
        <MarkdownRenderer streaming={message.status === 'streaming'}>
          {message.content}
        </MarkdownRenderer>
      )}
      {showTyping && <TypingIndicator />}
    </div>
  );
});
