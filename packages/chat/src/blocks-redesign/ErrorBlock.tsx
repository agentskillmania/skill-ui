/**
 * Error display block — alert style, not all-red
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { AlertTriangle, Info } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, ErrorMetadata } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

export const ErrorBlock = memo(function ErrorBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as ErrorMetadata | undefined;
  // 错误默认展开（需要人看），仅手动收起
  const { expanded, toggle } = useBlockCollapse(false);

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.error};
        overflow: hidden;
        transition: box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          box-shadow: 0 0 0 3px ${theme.color.errorBg};
        }
      `}
    >
      {/* Header */}
      {/* Header — collapsible, but errors default expanded (need attention) */}
      <div
        onClick={toggle}
        aria-expanded={expanded}
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          background: ${theme.color.errorBg};
          border-bottom: 1px solid ${theme.color.error};
          ${expanded ? '' : 'border-bottom: none;'}
          cursor: pointer;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: ${theme.radius.md};
            background: ${theme.color.error};
            color: ${theme.color.textInverse};
            flex-shrink: 0;
          `}
        >
          <AlertTriangle size={13} />
        </div>
        <span
          css={css`
            font-size: ${theme.font.size.sm};
            font-weight: ${theme.font.weight.semibold};
            color: ${theme.color.error};
            flex: 1;
          `}
        >
          {t('error.executionError')}
        </span>
        {meta?.errorCode && (
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              font-weight: ${theme.font.weight.semibold};
              text-transform: uppercase;
              letter-spacing: 0.04em;
              padding: 2px 8px;
              border-radius: ${theme.radius.sm};
              background: ${theme.color.error};
              color: ${theme.color.textInverse};
              flex-shrink: 0;
            `}
          >
            {meta.errorCode}
          </span>
        )}
        <span
          css={css`
            color: ${theme.color.error};
            opacity: 0.7;
            flex-shrink: 0;
            display: inline-flex;
          `}
        >
          <CollapseChevron expanded={expanded} />
        </span>
      </div>

      {/* Body */}
      {expanded && (
        <pre
          css={css`
            padding: ${theme.spacing[3]};
            font-family: ${theme.font.familyMono};
            font-size: ${theme.font.size.xs};
            line-height: ${theme.font.lineHeightRelaxed};
            color: ${theme.color.textSecondary};
            white-space: pre-wrap;
            word-break: break-all;
            margin: 0;
            overflow-x: auto;
          `}
        >
          {block.content}
        </pre>
      )}

      {/* Hint — only shown when backend provides it */}
      {expanded && meta?.hint && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[2]} ${theme.spacing[4]};
            border-top: 1px solid ${theme.color.borderSecondary};
            font-size: ${theme.font.size.sm};
            color: ${theme.color.textTertiary};
          `}
        >
          <Info size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
          {meta.hint}
        </div>
      )}
    </div>
  );
});
