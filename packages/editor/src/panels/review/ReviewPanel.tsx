/** @jsxImportSource @emotion/react */
/**
 * ReviewPanel — continuous log stream of review items
 *
 * Displays lint results and AI review feedback as an auto-scrolling log.
 */
import { EmptyState, ExpandableRow, InfoRow } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { AlertTriangle, Info, XCircle, ClipboardCheck } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { ReviewPanelProps, ReviewItem, ReviewSeverity } from '../../types.js';

const SEVERITY_CONFIG: Record<ReviewSeverity, { icon: typeof Info; color: string }> = {
  error: { icon: XCircle, color: 'error' },
  warning: { icon: AlertTriangle, color: 'warning' },
  info: { icon: Info, color: 'info' },
};

function ReviewItemRow({ item }: { item: ReviewItem }) {
  const theme = useTheme();
  const cfg = SEVERITY_CONFIG[item.severity];
  const Icon = cfg.icon;

  return (
    <ExpandableRow
      expandable={!!item.detail}
      defaultExpanded={item.severity === 'error' && !!item.detail}
      renderSummary={() => (
        <div
          css={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: theme.spacing[2],
            fontSize: theme.font.size.sm,
          }}
        >
          <span
            css={{
              flexShrink: 0,
              marginTop: 2,
              color: theme.color[cfg.color],
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon size={14} />
          </span>
          <div css={{ flex: 1, minWidth: 0 }}>
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[1],
                color: theme.color.text,
              }}
            >
              <span>{item.message}</span>
            </div>
            {item.filePath && (
              <div css={{ marginTop: theme.spacing['0.5'] }}>
                <InfoRow label="" text={item.filePath}>
                  <span
                    css={{
                      fontSize: theme.font.size.xs,
                      color: theme.color.textTertiary,
                    }}
                  >
                    {item.filePath}
                  </span>
                </InfoRow>
              </div>
            )}
          </div>
        </div>
      )}
      renderDetail={item.detail ? () => <div>{item.detail}</div> : undefined}
    />
  );
}

export function ReviewPanel({ items }: ReviewPanelProps) {
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
    return <EmptyState icon={<ClipboardCheck size={32} />} description={t('review.emptyHint')} />;
  }

  return (
    <div ref={containerRef} css={{ height: '100%', overflowY: 'auto' }}>
      {items.map((item) => (
        <ReviewItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
