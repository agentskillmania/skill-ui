/** @jsxImportSource @emotion/react */
import {
  CollapsibleCard,
  useToggle,
  MetricTile,
  SectionLabel,
  formatRelativeTime,
  formatTokens,
  metricGrid,
  emptyTextStyle,
} from '@agentskillmania/skill-ui-shared';
import { useTheme, flexRow } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { textBlockStyle } from './styles.js';
import type { CompressionData } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

/** Props for CompressionCard. */
export interface CompressionCardProps {
  /** Compression state from colts AgentContext. */
  compression?: CompressionData | null;
}

/**
 * CompressionCard displays the current compression state: anchor index,
 * removed token count, summary token count, and time since compression.
 * Summary text is shown directly, truncated by default, click to expand.
 */
export const CompressionCard = memo(function CompressionCard({
  compression,
}: CompressionCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const summaryToggle = useToggle(false);

  const isEmpty = !compression;

  return (
    <CollapsibleCard
      title={
        <div
          css={css`
            ${flexRow(theme, '1')};
            align-items: center;
          `}
        >
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.compression.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>{t('agentState.compression.none')}</div>
      ) : (
        <div>
          {/* Metrics — 4-column grid */}
          <div css={metricGrid(theme, 4)}>
            <MetricTile title={t('agentState.compression.anchor')} value={compression!.anchor} />
            <MetricTile
              title={t('agentState.compression.removed')}
              value={formatTokens(compression!.removedTokenCount)}
              valueStyle={{ color: theme.color.error }}
            />
            <MetricTile
              title={t('agentState.compression.summary')}
              value={formatTokens(compression!.summaryTokenCount)}
              valueStyle={{ color: theme.color.success }}
            />
            <MetricTile
              title={t('agentState.compression.at')}
              value={formatRelativeTime(compression!.compressedAt)}
            />
          </div>

          {/* Summary text — shown directly, truncated, click to expand */}
          {compression!.summary && (
            <div>
              <SectionLabel>{t('agentState.compression.summaryPreview')}</SectionLabel>
              <div
                css={textBlockStyle(theme, summaryToggle.value)}
                onClick={summaryToggle.toggle}
                data-testid="summary-toggle"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    summaryToggle.toggle();
                  }
                }}
              >
                {compression!.summary}
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
});
