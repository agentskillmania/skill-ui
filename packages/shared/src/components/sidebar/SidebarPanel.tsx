import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SidebarPanelProps {
  /** Panel title (rendered uppercase). */
  title: string;
  /** Panel icon. */
  icon: LucideIcon;
  /** Scrollable panel content. */
  children: ReactNode;
}

/** Renders a panel with icon + uppercase title header and scrollable body. */
export function SidebarPanel({ title, icon: Icon, children }: SidebarPanelProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          background: ${theme.color.fillSecondary};
          height: 40px;
          flex-shrink: 0;
        `}
      >
        <Icon size={16} css={css`color: ${theme.color.textSecondary};`} />
        <span
          css={css`
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            color: ${theme.color.textSecondary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          `}
        >
          {title.toUpperCase()}
        </span>
      </div>
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          padding: ${theme.spacing[2]} 0;
        `}
      >
        {children}
      </div>
    </div>
  );
}
