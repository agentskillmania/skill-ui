/**
 * 错误展示块
 */
import { css } from '@emotion/react';
import { AlertTriangle } from 'lucide-react';
import type { BlockProps, ErrorMetadata } from '../types.js';
import { useChatContext } from '../context.js';
import { BlockCard } from './BlockCard.js';

export function ErrorBlock({ block }: BlockProps) {
  const { theme } = useChatContext();
  const meta = block.metadata as ErrorMetadata | undefined;

  return (
    <BlockCard
      icon={<AlertTriangle size={14} />}
      title="执行错误"
      accentColor={theme.color.error}
      tag={meta?.errorCode}
      tagColor={theme.color.error}
    >
      <div
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.error};
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
        `}
      >
        {block.content}
      </div>
    </BlockCard>
  );
}
