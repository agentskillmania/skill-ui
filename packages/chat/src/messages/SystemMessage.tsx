/**
 * 系统消息
 */
import { css } from '@emotion/react';
import type { MessageProps } from '../types.js';
import { useChatContext } from '../context.js';

export function SystemMessage({ message }: MessageProps) {
  const { theme } = useChatContext();

  return (
    <div
      css={css`
        text-align: center;
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        font-size: ${theme.font.size.sm};
        color: ${theme.color.textTertiary};
      `}
    >
      {message.content}
    </div>
  );
}
