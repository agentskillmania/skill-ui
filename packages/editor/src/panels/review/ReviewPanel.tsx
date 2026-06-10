/** @jsxImportSource @emotion/react */
/**
 * ReviewPanel — continuous log stream of review items
 *
 * Displays lint results and AI review feedback as an auto-scrolling log.
 */
import { css } from '@emotion/react';
import { useRef, useEffect } from 'react';
import { AlertTriangle, Info, XCircle, ClipboardCheck } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { useToggle, EmptyState } from '@agentskillmania/skill-ui-shared';
import { NAMESPACE } from '../../locales/index.js';
import type { ReviewPanelProps, ReviewItem, ReviewSeverity } from '../../types.js';

const SEVERITY_CONFIG: Record<ReviewSeverity, { icon: typeof Info; color: string }> = {
  error: { icon: XCircle, color: 'error' },
  warning: { icon: AlertTriangle, color: 'warning' },
  info: { icon: Info, color: 'info' },
};

function ReviewItemRow({ item }: { item: ReviewItem }) {
  const theme = useTheme();
  const expandedToggle = useToggle(item.severity === 'error' && !!item.detail);
  const cfg = SEVERITY_CONFIG[item.severity];
  const Icon = cfg.icon;

  return (
    <div
      css={css`
        padding: ${theme.spacing[1]} ${theme.spacing[2]};
        border-bottom: 1px solid ${theme.color.borderSecondary};
        cursor: ${item.detail ? 'pointer' : 'default'};
        font-size: ${theme.font.size.sm};

        &:hover {
          background: ${theme.color.fillSubtle};
        }
      `}
      onClick={() => item.detail && expandedToggle.toggle()}
    >
      <div
        css={css`
          display: flex;
          align-items: flex-start;
          gap: ${theme.spacing[2]};
        `}
      >
        <span
          css={css`
            flex-shrink: 0;
            margin-top: 2px;
            color: ${theme.color[cfg.color]};
          `}
        >
          <Icon size={14} />
        </span>
        <div
          css={css`
            flex: 1;
            min-width: 0;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[1]};
              color: ${theme.color.text};
            `}
          >
            <span>{item.message}</span>
          </div>
          {item.filePath && (
            <div
              css={css`
                font-size: ${theme.font.size.xs};
                color: ${theme.color.textTertiary};
                margin-top: ${theme.spacing['0.5']};
              `}
            >
              {item.filePath}
            </div>
          )}
        </div>
      </div>
      {expandedToggle.value && item.detail && (
        <div
          css={css`
            margin-top: ${theme.spacing[1]};
            margin-left: 22px;
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textSecondary};
            padding: ${theme.spacing[1]};
            background: ${theme.color.fillSubtle};
            border-radius: ${theme.radius.xs};
          `}
        >
          {item.detail}
        </div>
      )}
    </div>
  );
}

export function ReviewPanel({ items }: ReviewPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({
        behavior: 'smooth',
        top: el.scrollHeight,
      });
    }
  }, [items?.length]);

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={32} />}
        description={t('review.emptyHint')}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      css={css`
        height: 100%;
        overflow-y: auto;
      `}
    >
      {items.map((item) => (
        <ReviewItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
