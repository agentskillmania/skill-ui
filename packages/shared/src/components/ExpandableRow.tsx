/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { ExpandableItem } from './ExpandableItem.js';

/** Detail area style variant. */
export type DetailVariant = 'default' | 'code';

export interface ExpandableRowProps {
  /** Whether this item can expand. Default: true */
  expandable?: boolean;
  /** Uncontrolled initial state. Default: false */
  defaultExpanded?: boolean;
  /** Controlled expand state. */
  expanded?: boolean;
  /** Expand state change callback. */
  onToggle?: (expanded: boolean) => void;

  /** Summary content — always visible. */
  renderSummary: (ctx: { expanded: boolean; toggle: () => void }) => ReactNode;
  /** Detail content — shown when expanded. */
  renderDetail?: () => ReactNode;

  /** Show chevron indicator. Default: false */
  showChevron?: boolean;
  /** Detail area style variant. Default: 'default' */
  detailVariant?: DetailVariant;
  /** Animation duration in ms. Default: 150 */
  animationDuration?: number;
  /** Additional className. */
  className?: string;
}

/** Container style — wraps both summary and detail. */
const containerStyle = (theme: ReturnType<typeof useTheme>, isExpanded: boolean) => css`
  border-left: 2px solid ${isExpanded ? theme.color.primary : 'transparent'};
  background: ${isExpanded ? theme.color.fillSubtle : 'transparent'};
  border-bottom: 1px solid ${theme.color.borderSecondary};
  transition:
    border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
    background ${theme.motion.duration.normal} ${theme.motion.easing.out};
`;

/** Summary row style — clickable with hover. */
const summaryStyle = (theme: ReturnType<typeof useTheme>, isExpanded: boolean) => css`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  cursor: pointer;
  transition: background ${theme.motion.duration.normal} ${theme.motion.easing.out};

  &:hover {
    background: ${isExpanded ? 'transparent' : theme.color.fillSecondary};
  }
`;

/** Detail area for default variant. */
const detailDefaultStyle = (theme: ReturnType<typeof useTheme>) => css`
  padding: ${theme.spacing['0.5']} ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]};
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textSecondary};
  line-height: 1.5;
`;

/** Detail area for code variant. */
const detailCodeStyle = (theme: ReturnType<typeof useTheme>) => css`
  margin: 0 ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[1]};
  padding: ${theme.spacing[2]};
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.xs};
  font-size: ${theme.font.size.xs};
  font-family: ${theme.font.familyMono};
  color: ${theme.color.textSecondary};
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow: auto;
`;

/**
 * ExpandableRow — visual shell for expandable list items.
 * Wraps ExpandableItem (headless behavior) with container-highlight styling:
 * left border + fillSubtle background when expanded, border-bottom separator, hover effect.
 */
export function ExpandableRow({
  expandable = true,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  renderSummary,
  renderDetail,
  showChevron = false,
  detailVariant = 'default',
  animationDuration = 150,
  className,
}: ExpandableRowProps) {
  const theme = useTheme();

  return (
    <ExpandableItem
      expandable={expandable}
      defaultExpanded={defaultExpanded}
      expanded={controlledExpanded}
      onToggle={onToggle}
      renderSummary={({ expanded, toggle }) => (
        <div css={containerStyle(theme, expanded)}>
          <div
            css={summaryStyle(theme, expanded)}
            onClick={toggle}
            data-testid="expandable-summary"
          >
            {showChevron && (
              <span
                css={css`
                  flex-shrink: 0;
                  margin-right: ${theme.spacing['0.5']};
                  color: ${theme.color.textTertiary};
                  display: flex;
                  align-items: center;
                `}
              >
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            )}
            <div
              css={css`
                flex: 1;
                min-width: 0;
              `}
            >
              {renderSummary({ expanded, toggle })}
            </div>
          </div>
        </div>
      )}
      renderDetail={
        renderDetail
          ? () => (
              <div data-testid="expandable-detail">
                <div
                  css={
                    detailVariant === 'code' ? detailCodeStyle(theme) : detailDefaultStyle(theme)
                  }
                >
                  {renderDetail()}
                </div>
              </div>
            )
          : undefined
      }
      animationDuration={animationDuration}
      className={className}
    />
  );
}
