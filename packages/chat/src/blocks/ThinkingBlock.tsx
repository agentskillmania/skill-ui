/**
 * 思考过程块
 */
import { css } from '@emotion/react';
import { Brain } from 'lucide-react';
import type { BlockProps } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { BlockCard } from './BlockCard.js';

export function ThinkingBlock({ block }: BlockProps) {
  const theme = useTheme();

  return (
    <BlockCard
      icon={<Brain size={14} />}
      title={block.status === 'streaming' ? '思考中...' : '思考过程'}
      accentColor={theme.blockColor.thinking.text}
      tag={block.status === 'streaming' ? '进行中' : undefined}
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
