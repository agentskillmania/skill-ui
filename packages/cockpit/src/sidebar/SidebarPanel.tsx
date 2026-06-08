/** @jsxImportSource @emotion/react */
/**
 * SidebarPanel component
 * Wrapper for a single sidebar panel with title bar and content area
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarPanelProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function SidebarPanel({ title, icon: Icon, children }: SidebarPanelProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      `}
    >
      {/* Title bar */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          height: ${theme.spacing[10]};
          padding: 0 ${theme.spacing[3]};
          border-bottom: 1px solid ${theme.color.border};
          flex-shrink: 0;
          font-size: ${theme.font.size.sm};
          font-weight: ${theme.font.weight.semibold};
          color: ${theme.color.text};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        `}
      >
        <Icon size={16} />
        <span>{title}</span>
      </div>

      {/* Content */}
      <div
        css={css`
          flex: 1;
          overflow: auto;
          padding: ${theme.spacing[3]};
        `}
      >
        {children}
      </div>
    </div>
  );
}
