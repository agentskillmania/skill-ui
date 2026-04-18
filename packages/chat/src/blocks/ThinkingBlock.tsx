/**
 * 思考过程块
 */
import { css } from '@emotion/react';
import { Brain } from 'lucide-react';
import type { BlockProps } from '../types.js';
import { useChatContext } from '../context.js';
import { BlockCard } from './BlockCard.js';

export function ThinkingBlock({ block }: BlockProps) {
  const { theme } = useChatContext();

  return (
    <BlockCard
      icon={<Brain size={14} />}
      title={block.status === 'streaming' ? '思考中...' : '思考过程'}
      accentColor={theme.blockColor.thinking.text}
      tag={block.status === 'streaming' ? '进行中' : undefined}
      tagColor={theme.blockColor.thinking.text}
    >
      <div
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.textSecondary};
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
