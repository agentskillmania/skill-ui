/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Card, Statistic, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { CompressionData } from './types.js';
import {
  emptyTextStyle,
  metricTileStyle,
  metricsRowStyle,
  sectionLabelStyle,
  textBlockStyle,
} from './styles.js';
import { CollapsibleCard, useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for CompressionCard. */
export interface CompressionCardProps {
  /** Compression state from colts AgentContext. */
  compression?: CompressionData | null;
}

/** Title row style. */
const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Format token counts into human-readable strings. */
function formatTokens(value: number | undefined): string {
  if (value == null) return '-';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

/** Format relative time from a unix timestamp (ms). */
function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp == null) return '-';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * CompressionCard displays the current compression state: anchor index,
 * removed token count, summary token count, and time since compression.
 * Summary text is shown directly, truncated by default, click to expand.
 */
export function CompressionCard({ compression }: CompressionCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const summaryToggle = useToggle(false);

  const isEmpty = !compression;

  return (
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.compression.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('agentState.compression.none')}
        </div>
      ) : (
        <div>
          {/* Metrics row */}
          <div css={metricsRowStyle(theme)}>
            <div css={metricTileStyle(theme)}>
              <Statistic title={t('agentState.compression.anchor')} value={compression!.anchor} />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.removed')}
                value={formatTokens(compression!.removedTokenCount)}
                valueStyle={{ color: theme.color.error }}
              />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.summary')}
                value={formatTokens(compression!.summaryTokenCount)}
                valueStyle={{ color: theme.color.success }}
              />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.at')}
                value={formatRelativeTime(compression!.compressedAt)}
              />
            </div>
          </div>

          {/* Summary text — shown directly, truncated, click to expand */}
          {compression!.summary && (
            <div>
              <div css={sectionLabelStyle(theme)}>
                {t('agentState.compression.summaryPreview')}
              </div>
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
}
