/**
 * Thinking process block — lightweight, draft-like
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';
import { Brain } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 var(--pulse-color); }
  70% { box-shadow: 0 0 0 5px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

const subtlePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export const ThinkingBlock = memo(function ThinkingBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const isStreaming = block.status === 'streaming';
  const accentColor = theme.blockColor.thinking.text;
  const accentBg = theme.blockColor.thinking.bg;

  // 思考结束后收起——思考内容本就不引导细读
  const { expanded, toggle } = useBlockCollapse(!isStreaming);

  const contentRef = useRef<HTMLDivElement>(null);

  // 内容增长（流式填充）时始终钉在底部，展示最新一段思考
  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [block.content]);

  return (
    <div
      css={css`
        position: relative;
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        border-radius: ${theme.radius.md};
        background: ${isStreaming ? accentBg : 'transparent'};
        border: 1px solid ${isStreaming ? accentBg : 'transparent'};
        transition:
          background ${theme.motion.duration.normal} ${theme.motion.easing.out},
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out};
        ${isStreaming
          ? css`
              --pulse-color: ${accentBg};
              animation: ${pulseRing} 2s ease-out infinite;
            `
          : css`
              &:hover {
                background: ${theme.color.fillSubtle};
                border-color: ${theme.color.borderSecondary};
              }
            `}
      `}
    >
      <div
        onClick={toggle}
        aria-expanded={expanded}
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          margin-bottom: ${expanded ? theme.spacing[1] : '0'};
          font-size: ${theme.font.size.sm};
          font-weight: ${theme.font.weight.semibold};
          color: ${accentColor};
          text-transform: uppercase;
          letter-spacing: 0.04em;
          cursor: pointer;
        `}
      >
        <Brain size={13} style={{ opacity: 0.7 }} />
        {isStreaming ? t('thinking.thinking') : t('thinking.process')}
        {isStreaming && (
          <span
            css={css`
              width: 5px;
              height: 5px;
              border-radius: ${theme.radius.full};
              background: ${accentColor};
              animation: ${subtlePulse} 1.5s ease-in-out infinite;
            `}
          />
        )}
        <span
          css={css`
            margin-left: auto;
            color: ${theme.color.textTertiary};
          `}
        >
          <CollapseChevron expanded={expanded} />
        </span>
      </div>
      {expanded && (
        <div
          ref={contentRef}
          css={css`
            font-size: ${theme.font.size.sm};
            line-height: ${theme.font.lineHeightRelaxed};
            color: ${theme.color.textTertiary};
            font-style: italic;
            white-space: pre-wrap;
            padding-left: calc(13px + ${theme.spacing[2]});
            /* 最多展示 4 行，超出内部滚动 */
            max-height: calc(${theme.font.lineHeightRelaxed}em * 4);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: ${theme.color.border} transparent;
          `}
        >
          {block.content}
        </div>
      )}
    </div>
  );
});
