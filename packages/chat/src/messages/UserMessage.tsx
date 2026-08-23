/**
 * User message
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Image } from 'antd';
import { css } from '@emotion/react';
import { memo } from 'react';

import type { MessageProps } from '../types.js';

export const UserMessage = memo(function UserMessage({ message }: MessageProps) {
  const theme = useTheme();
  const hasAttachments = Boolean(message.attachments && message.attachments.length > 0);

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        background: ${theme.color.primary};
        color: ${theme.color.textInverse};
        border-radius: ${theme.radius.lg} ${theme.radius.xs} ${theme.radius.lg} ${theme.radius.lg};
        font-size: ${theme.font.size.base};
        line-height: ${theme.font.lineHeight};
        white-space: pre-wrap;
        word-break: break-word;

        ::selection {
          background: ${theme.color.textInverse};
          color: ${theme.color.primary};
        }
      `}
    >
      {hasAttachments && (
        <Image.PreviewGroup>
          <div
            css={css`
              display: flex;
              flex-wrap: wrap;
              gap: ${theme.spacing[2]};
              margin-bottom: ${message.content ? theme.spacing[2] : 0};
            `}
          >
            {message.attachments!.map((a) => (
              <Image
                key={a.id}
                src={a.url}
                alt={a.name}
                css={css`
                  width: 128px;
                  height: 84px;
                  object-fit: cover;
                  border-radius: ${theme.radius.md};
                  border: 1px solid rgba(255, 255, 255, 0.35);
                  box-shadow: ${theme.shadow.sm};
                  cursor: zoom-in;
                `}
              />
            ))}
          </div>
        </Image.PreviewGroup>
      )}
      {message.content}
    </div>
  );
});
