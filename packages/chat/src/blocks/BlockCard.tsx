/**
 * Unified execution block card shell
 */
import { css } from '@emotion/react';
import type { ReactNode } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';

export interface BlockCardProps {
  /** Left icon */
  icon?: ReactNode;
  /** Title */
  title: string;
  /** Left accent color */
  accentColor?: string;
  /** Tag text (right of title) */
  tag?: string;
  /** Content */
  children?: ReactNode;
}

export function BlockCard({ icon, title, accentColor, tag, children }: BlockCardProps) {
  const theme = useTheme();
  const accent = accentColor ?? theme.color.primary;

  return (
    <div
      css={css`
        border-left: 3px solid ${accent};
        border-top: 1px solid ${theme.color.borderSecondary};
        border-right: 1px solid ${theme.color.borderSecondary};
        border-bottom: 1px solid ${theme.color.borderSecondary};
        border-radius: ${theme.radius.md};
        background: ${theme.color.bgContainer};
        overflow: hidden;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          font-size: ${theme.font.size.sm};
          font-weight: ${theme.font.weight.medium};
          color: ${theme.color.textSecondary};
        `}
      >
        {icon && (
          <span
            css={css`
              display: flex;
              align-items: center;
              color: ${accent};
              flex-shrink: 0;
            `}
          >
            {icon}
          </span>
        )}
        <span
          css={css`
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {title}
        </span>
        {tag && (
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              padding: ${theme.spacing['0.5']} ${theme.spacing[2]};
              border-radius: ${theme.radius.full};
              background: ${theme.color.fillSubtle};
              color: ${accent};
              flex-shrink: 0;
            `}
          >
            {tag}
          </span>
        )}
      </div>
      {children && (
        <div
          css={css`
            padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[3]};
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}
