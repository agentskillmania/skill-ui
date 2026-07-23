/**
 * Thinking process block — lightweight, draft-like
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';
import { Brain } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps } from '../types.js';

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

  return (
    <div
      css={css`
        position: relative;
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
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
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          margin-bottom: ${theme.spacing[2]};
          font-size: ${theme.font.size.sm};
          font-weight: ${theme.font.weight.semibold};
          color: ${accentColor};
          text-transform: uppercase;
          letter-spacing: 0.04em;
        `}
      >
        <Brain size={14} style={{ opacity: 0.7 }} />
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
      </div>
      <div
        css={css`
          font-size: ${theme.font.size.base};
          line-height: ${theme.font.lineHeightRelaxed};
          color: ${theme.color.textTertiary};
          font-style: italic;
          padding-left: calc(14px + ${theme.spacing[2]});
        `}
      >
        {block.content}
      </div>
    </div>
  );
});
