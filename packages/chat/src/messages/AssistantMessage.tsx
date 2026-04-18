/**
 * AI 助手消息
 */
import { css } from '@emotion/react';
import type { MessageProps } from '../types.js';
import { useChatContext } from '../context.js';
import { MarkdownRenderer } from '../content/MarkdownRenderer.js';
import { BlocksRenderer } from '../blocks/BlocksRenderer.js';

export function AssistantMessage({ message }: MessageProps) {
  const { theme } = useChatContext();

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        border-radius: ${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg} ${theme.radius.xs};
      `}
    >
      {message.blocks && message.blocks.length > 0 && (
        <div
          css={css`
            margin-bottom: ${theme.spacing[3]};
          `}
        >
          <BlocksRenderer blocks={message.blocks} />
        </div>
      )}
      {message.content && (
        <MarkdownRenderer streaming={message.status === 'streaming'}>
          {message.content}
        </MarkdownRenderer>
      )}
    </div>
  );
}
