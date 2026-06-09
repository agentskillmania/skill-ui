import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Card } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, type CSSProperties, type ReactNode } from 'react';
import { useToggle } from '../hooks/index.js';

export interface CollapsibleCardProps {
  /** Card title text. */
  title: string;
  /** Uncontrolled initial collapse state. */
  defaultCollapsed?: boolean;
  /** Controlled collapse state. */
  collapsed?: boolean;
  /** Collapse state change callback. */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Optional badge/tag in header (right side). */
  badge?: ReactNode;
  /** Collapsible content. */
  children: ReactNode;
  /** Additional className. */
  className?: string;
  /** Additional styles. */
  style?: CSSProperties;
}

/** Renders a collapsible antd Card with title, optional badge, and toggle button. */
export function CollapsibleCard({
  title,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapseChange,
  badge,
  children,
  className,
  style,
}: CollapsibleCardProps) {
  const theme = useTheme();
  const toggle = useToggle(defaultCollapsed);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : toggle.value;

  const handleToggle = useCallback(() => {
    const next = !isCollapsed;
    toggle.set(next);
    onCollapseChange?.(next);
  }, [isCollapsed, onCollapseChange, toggle]);

  return (
    <Card
      size="small"
      className={className}
      style={style}
      css={css`
        overflow: hidden;
        .ant-card-head {
          ${isCollapsed ? '' : `border-bottom: 1px solid ${theme.color.borderSecondary};`}
        }
      `}
      title={
        <span
          css={css`
            font-size: ${theme.font.size.sm};
            font-weight: ${theme.font.weight.semibold};
          `}
        >
          {title}
        </span>
      }
      extra={
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          {badge}
          <button
            data-testid="collapse-toggle"
            onClick={handleToggle}
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              background: none;
              border: none;
              cursor: pointer;
              color: ${theme.color.textTertiary};
              padding: ${theme.spacing[1]};
            `}
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      }
    >
      {!isCollapsed && children}
    </Card>
  );
}
