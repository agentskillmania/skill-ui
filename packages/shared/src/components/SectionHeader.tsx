import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  /** Section icon (rendered at 14px). */
  icon: LucideIcon;
  /** Section label (rendered uppercase via CSS). */
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
        gap: ${theme.spacing[1]};
        padding: ${theme.spacing[1]} 0;
        font-size: ${theme.font.size.xs};
        font-weight: ${theme.font.weight.bold};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${theme.color.textSecondary};
      `}
    >
      <Icon size={14} />
      {title}
      <div
        css={css`
          flex: 1;
          height: 1px;
          background: ${theme.color.borderSecondary};
        `}
      />
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
