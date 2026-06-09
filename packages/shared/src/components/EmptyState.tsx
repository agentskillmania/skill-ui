import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Empty } from 'antd';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Primary message. */
  title?: string;
  /** Secondary explanation. */
  description?: string;
  /** Custom icon/illustration. */
  icon?: ReactNode;
  /** CTA element (e.g. button). */
  action?: ReactNode;
  /** Reduced padding for inline use. */
  compact?: boolean;
}

/** Renders an empty state placeholder with optional title, description, and action. */
export function EmptyState({ title, description, icon, action, compact = false }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: ${compact ? 'row' : 'column'};
        align-items: center;
        justify-content: center;
        ${compact
          ? `gap: ${theme.spacing[1]}; padding: ${theme.spacing[4]} ${theme.spacing[2]};`
          : `gap: ${theme.spacing[2]}; padding: ${theme.spacing[8]} ${theme.spacing[4]};`}
        text-align: center;
      `}
    >
      {icon ? (
        <div
          css={css`
            font-size: ${compact ? '20px' : '36px'};
            opacity: 0.4;
          `}
        >
          {icon}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description={null} />
      )}
      {title && (
        <div
          css={css`
            font-size: ${theme.font.size.base};
            font-weight: ${theme.font.weight.medium};
            color: ${theme.color.textSecondary};
          `}
        >
          {title}
        </div>
      )}
      {description && (
        <div
          css={css`
            font-size: ${theme.font.size.sm};
            color: ${theme.color.textTertiary};
            max-width: 240px;
            line-height: 1.5;
          `}
        >
          {description}
        </div>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
