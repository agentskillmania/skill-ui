/**
 * AI assistant message
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { memo } from 'react';

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

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        border-radius: ${theme.radius.xs} ${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg};
      `}
    >
      {message.blocks && message.blocks.length > 0 && (
        <div
          css={css`
            margin-bottom: ${theme.spacing[3]};
          `}
        >
          <BlocksRenderer
            blocks={message.blocks}
            renderers={renderers}
            onConfirmHumanRequest={onConfirmHumanRequest}
            onBlockAction={onBlockAction}
          />
        </div>
      )}
      {message.content && (
        <MarkdownRenderer streaming={message.status === 'streaming'}>
          {message.content}
        </MarkdownRenderer>
      )}
    </div>
  );
});
