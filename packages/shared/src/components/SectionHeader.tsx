import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  /** Section icon (rendered at 14px). */
  icon: LucideIcon;
  /** Section label (rendered uppercase, 11px, semibold, letter-spacing: 0.3px). */
  title: string;
  /** Right-aligned extra content. */
  extra?: ReactNode;
}

/** Renders a section header with icon, uppercase title, and optional extra content. */
export function SectionHeader({ icon: Icon, title, extra }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
        padding-bottom: ${theme.spacing[2]};
        border-bottom: 1px solid ${theme.color.border};
      `}
    >
      <Icon
        size={14}
        css={css`
          color: ${theme.color.primary};
          flex-shrink: 0;
        `}
      />
      <span
        css={css`
          font-size: ${theme.font.size.xs};
          font-weight: ${theme.font.weight.semibold};
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: ${theme.color.textSecondary};
        `}
      >
        {title.toUpperCase()}
      </span>
      {extra && (
        <span
          data-testid="section-extra"
          css={css`
            margin-left: auto;
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textTertiary};
          `}
        >
          {extra}
        </span>
      )}
    </div>
  );
}
