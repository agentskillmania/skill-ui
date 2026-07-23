/** @jsxImportSource @emotion/react */
import {
  CollapsibleCard,
  useToggle,
  MetricTile,
  formatTokens,
  formatTimestamp,
  metricGrid,
} from '@agentskillmania/skill-ui-shared';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme, flexColumn, flexRow } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Progress, Tag, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SessionOverviewData, SessionStatus } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

/** Props for SessionOverviewCard. */
export interface SessionOverviewCardProps {
  /** Session overview data to display. */
  data: SessionOverviewData;
  /** Whether the card starts collapsed. Defaults to false. */
  defaultCollapsed?: boolean;
}

/** Resolve i18n key for session status. */
function statusI18nKey(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    running: 'session.overview.statusRunning',
    idle: 'session.overview.statusIdle',
    error: 'session.overview.statusError',
  };
  return map[status];
}

/** Map status to tag color token name. */
function statusTagColor(status: SessionStatus, theme: Theme): string {
  if (status === 'running') return theme.color.success;
  if (status === 'error') return theme.color.error;
  return theme.color.textTertiary;
}

/** Subtitle style — muted agent · model line. */
const subtitleStyle = (theme: Theme) => css`
  color: ${theme.color.textSecondary};
  font-size: ${theme.font.size.xs};
  margin-bottom: ${theme.spacing['2']};
`;

/** Context section spacing. */
const contextSectionStyle = (theme: Theme) => css`
  margin-top: ${theme.spacing['2']};
`;

/** Timestamp text style. */
const timestampStyle = (theme: Theme) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.xs};
`;

/**
 * SessionOverviewCard renders a collapsible card summarizing a session's
 * title, status, metrics, token usage, context window, and timestamps.
 */
export const SessionOverviewCard = memo(function SessionOverviewCard({
  data,
  defaultCollapsed = false,
}: SessionOverviewCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(defaultCollapsed);

  const displayTitle = data.title || t('session.overview.titleFallback');
  const contextPercent =
    data.contextWindow && data.estimatedContextSize != null
      ? Math.min(Math.round((data.estimatedContextSize / data.contextWindow) * 100), 100)
      : undefined;

  const contextLabel = t('session.overview.contextLabel', {
    used: formatTokens(data.estimatedContextSize),
    limit: formatTokens(data.contextWindow),
  });

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
            {displayTitle}
          </Typography.Text>
          <Tag
            color={statusTagColor(data.status, theme)}
            style={{
              fontSize: theme.font.size.xs,
              padding: '0 4px',
              lineHeight: '16px',
              margin: 0,
            }}
          >
            {t(statusI18nKey(data.status))}
          </Tag>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      <div
        css={css`
          ${flexColumn(theme, '2')}
        `}
      >
        {/* Agent · Model subtitle */}
        <div css={subtitleStyle(theme)}>
          {data.agentName} · {data.model}
        </div>

        {/* Steps & Messages — 2-col grid */}
        <div css={metricGrid(theme, 2)}>
          <MetricTile title={t('session.overview.steps')} value={data.stepCount} />
          <MetricTile title={t('session.overview.messages')} value={data.messageCount} />
        </div>

        {/* Token metrics — 3-col grid */}
        <div css={metricGrid(theme, 3)}>
          <MetricTile title={t('session.overview.tokensIn')} value={formatTokens(data.tokensIn)} />
          <MetricTile
            title={t('session.overview.tokensOut')}
            value={formatTokens(data.tokensOut)}
          />
          <MetricTile
            title={t('session.overview.tokensTotal')}
            value={formatTokens(data.tokensTotal)}
          />
        </div>

        {/* Context usage progress bar */}
        {contextPercent !== undefined && (
          <div css={contextSectionStyle(theme)}>
            <div style={{ marginBottom: theme.spacing['1'], fontSize: theme.font.size.sm }}>
              {contextLabel}
            </div>
            <Progress
              percent={contextPercent}
              showInfo={false}
              strokeColor={theme.color.purple}
              size="small"
            />
          </div>
        )}

        {/* Timestamps footer */}
        <div
          css={css`
            ${flexRow(theme, '1')};
            justify-content: space-between;
          `}
        >
          <span css={timestampStyle(theme)}>
            {t('session.overview.created', { time: formatTimestamp(data.createdAt) })}
          </span>
          <span css={timestampStyle(theme)}>
            {t('session.overview.updated', { time: formatTimestamp(data.updatedAt) })}
          </span>
        </div>
      </div>
    </CollapsibleCard>
  );
});
