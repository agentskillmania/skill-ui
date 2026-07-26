/** @jsxImportSource @emotion/react */
/**
 * Sub-agent delegation block — summary card with detail modal
 *
 * Follows the shared card pattern used by ToolCallBlock / SkillBlock /
 * PlanBlock: container with radius.lg + border + hover, header with fill
 * background + bottom border, body rows below. Clicking opens SubAgentModal
 * which embeds a MessageList showing the sub-agent's full conversation.
 */
import { memo, useState, lazy, Suspense } from 'react';
import { css } from '@emotion/react';
import { Bot, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useTheme, spinKeyframes } from '@agentskillmania/skill-ui-theme';
import { formatTokens, formatDuration } from '@agentskillmania/skill-ui-shared';
import { useTranslation } from 'react-i18next';
import type { BlockProps, SubAgentBlockMetadata, BlockStatus } from '../types.js';
import { NAMESPACE } from '../locales/index.js';

/**
 * SubAgentModal is lazy-loaded to break a circular dependency:
 * BlocksRenderer → SubAgentBlock → SubAgentModal → MessageList →
 * AssistantMessage → BlocksRenderer. The modal is only needed on click,
 * so deferring its import also avoids loading MessageList until then.
 */
const SubAgentModal = lazy(() =>
  import('./SubAgentModal.js').then((m) => ({ default: m.SubAgentModal }))
);

type TFunction = (key: string, params?: Record<string, unknown>) => string;

interface StatusConfig {
  label: string;
  icon: typeof Bot;
  /** theme.color key for status accent */
  colorKey: 'primary' | 'success' | 'error' | 'warning' | 'textTertiary';
  /** theme blockColor/error/success key for tag background */
  tagColorKey: 'subagent' | 'success' | 'error' | 'warning';
}

function getStatusConfig(
  status: BlockStatus,
  meta: SubAgentBlockMetadata | undefined,
  t: TFunction
): StatusConfig {
  if (status === 'error' || meta?.resultStatus === 'error') {
    return {
      label: t('subagent.error'),
      icon: XCircle,
      colorKey: 'error',
      tagColorKey: 'error',
    };
  }
  if (status === 'streaming') {
    return {
      label: t('subagent.streaming'),
      icon: Loader2,
      colorKey: 'primary',
      tagColorKey: 'subagent',
    };
  }
  switch (meta?.resultStatus) {
    case 'max_steps':
      return {
        label: t('subagent.maxSteps'),
        icon: AlertTriangle,
        colorKey: 'warning',
        tagColorKey: 'warning',
      };
    case 'timeout':
      return {
        label: t('subagent.timeout'),
        icon: Clock,
        colorKey: 'warning',
        tagColorKey: 'warning',
      };
    case 'abort':
      return {
        label: t('subagent.aborted'),
        icon: XCircle,
        colorKey: 'textTertiary',
        tagColorKey: 'subagent',
      };
    default:
      return {
        label: t('subagent.completed'),
        icon: CheckCircle2,
        colorKey: 'success',
        tagColorKey: 'success',
      };
  }
}

export const SubAgentBlock = memo(function SubAgentBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [modalOpen, setModalOpen] = useState(false);

  const meta = block.metadata as SubAgentBlockMetadata | undefined;
  const name = meta?.name ?? t('subagent.title');
  const statusConfig = getStatusConfig(block.status, meta, t);
  const StatusIcon = statusConfig.icon;
  const statusColor =
    theme.color[statusConfig.colorKey as keyof typeof theme.color] ?? theme.color.primary;
  const accent = theme.blockColor.subagent ?? { text: theme.color.primary, bg: 'transparent' };
  const isStreaming = block.status === 'streaming';
  const isError = block.status === 'error' || meta?.resultStatus === 'error';

  // Tag background/color — mirrors the pill style used by SkillBlock/ErrorBlock
  const tagColors =
    statusConfig.tagColorKey === 'error'
      ? { bg: theme.color.error, fg: theme.color.textInverse }
      : statusConfig.tagColorKey === 'success'
        ? { bg: theme.color.successBg, fg: theme.color.success }
        : statusConfig.tagColorKey === 'warning'
          ? { bg: theme.color.warningBg, fg: theme.color.warning }
          : { bg: accent.bg, fg: accent.text };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        css={css`
          border-radius: ${theme.radius.lg};
          background: ${theme.color.bgContainer};
          border: 1px solid ${isError ? theme.color.error : theme.color.border};
          overflow: hidden;
          cursor: pointer;
          transition:
            border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
            box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
          &:hover {
            border-color: ${isError ? theme.color.error : theme.color.borderHover};
            box-shadow: ${isError ? `0 0 0 3px ${theme.color.errorBg}` : theme.shadow.sm};
          }
        `}
      >
        {/* Header — fill background + bottom border, matches ToolCallBlock/SkillBlock */}
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${theme.spacing[3]} ${theme.spacing[4]};
            background: ${isError ? theme.color.errorBg : theme.color.fill};
            border-bottom: 1px solid ${isError ? theme.color.error : theme.color.borderSecondary};
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              min-width: 0;
              flex: 1;
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: ${theme.radius.md};
                background: ${accent.bg};
                color: ${accent.text};
                flex-shrink: 0;
              `}
            >
              <Bot size={16} />
            </div>
            <span
              css={css`
                font-size: ${theme.font.size.base};
                font-weight: ${theme.font.weight.semibold};
                color: ${theme.color.text};
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              `}
            >
              {name}
            </span>
          </div>
          {/* Status tag — pill style, matches SkillBlock/ErrorBlock */}
          <span
            css={css`
              display: inline-flex;
              align-items: center;
              gap: ${theme.spacing[1]};
              font-size: ${theme.font.size.xs};
              font-weight: ${theme.font.weight.semibold};
              padding: 3px 10px;
              border-radius: ${theme.radius.sm};
              background: ${tagColors.bg};
              color: ${tagColors.fg};
              flex-shrink: 0;
            `}
          >
            <StatusIcon
              size={12}
              {...(isStreaming
                ? {
                    css: css`
                      animation: ${spinKeyframes} 1s linear infinite;
                      @media (prefers-reduced-motion: reduce) {
                        animation: none;
                      }
                    `,
                  }
                : {})}
            />
            {statusConfig.label}
          </span>
        </div>

        {/* Body: task line + metrics */}
        {(meta?.task ||
          meta?.steps != null ||
          (meta?.inputTokens != null && meta?.outputTokens != null) ||
          meta?.duration != null) && (
          <div
            css={css`
              padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[3]};
            `}
          >
            {meta?.task && (
              <div
                css={css`
                  font-size: ${theme.font.size.sm};
                  color: ${theme.color.textSecondary};
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  margin-bottom: ${theme.spacing[2]};
                `}
              >
                {meta.task}
              </div>
            )}
            {/* Metrics row */}
            {(meta?.steps != null ||
              (meta?.inputTokens != null && meta?.outputTokens != null) ||
              meta?.duration != null) && (
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  gap: ${theme.spacing[3]};
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textTertiary};
                `}
              >
                {meta?.steps != null && (
                  <span>{t('subagent.steps', { count: meta.steps })}</span>
                )}
                {meta?.inputTokens != null && meta?.outputTokens != null && (
                  <span>
                    {t('subagent.tokens', {
                      input: formatTokens(meta.inputTokens),
                      output: formatTokens(meta.outputTokens),
                    })}
                  </span>
                )}
                {meta?.duration != null && (
                  <span>{t('subagent.duration', { duration: formatDuration(meta.duration) })}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <SubAgentModal
          open={modalOpen}
          name={name}
          messages={meta?.messages}
          steps={meta?.steps}
          inputTokens={meta?.inputTokens}
          outputTokens={meta?.outputTokens}
          duration={meta?.duration}
          onClose={() => setModalOpen(false)}
        />
      </Suspense>
    </>
  );
});
