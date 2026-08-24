import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import type { LucideIcon } from 'lucide-react';
import { memo } from 'react';
import type { ReactNode } from 'react';

export interface SidebarPanelProps {
  /** Panel title (rendered uppercase via CSS). */
  title: string;
  /** Panel icon. */
  icon: LucideIcon;
  /** Optional controls at the right end of the header (e.g. a Segmented switcher). */
  headerExtra?: ReactNode;
  /** Scrollable panel content. */
  children: ReactNode;
}

/** Renders a panel with icon + uppercase title header and scrollable body. */
export const SidebarPanel = memo(function SidebarPanel({
  title,
  icon: Icon,
  headerExtra,
  children,
}: SidebarPanelProps) {
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
        {headerExtra ? (
          <div
            css={css`
              margin-left: auto;
              /* 抵消 header 的 uppercase/字距样式,控件内容按原样渲染 */
              text-transform: none;
              letter-spacing: normal;
              font-weight: ${theme.font.weight.normal};
              display: flex;
              align-items: center;
              min-width: 0;
            `}
          >
            {headerExtra}
          </div>
        ) : null}
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
});
