/** @jsxImportSource @emotion/react */
/**
 * Sub-agent delegation block — summary card with detail modal
 *
 * Shows a compact summary of a sub-agent's run (name, status, steps,
 * tokens, duration). Clicking opens SubAgentModal which embeds a
 * MessageList showing the sub-agent's full conversation.
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
  color: string;
}

function getStatusConfig(
  status: BlockStatus,
  meta: SubAgentBlockMetadata | undefined,
  t: TFunction
): StatusConfig {
  if (status === 'error' || meta?.resultStatus === 'error') {
    return { label: t('subagent.error'), icon: XCircle, color: 'error' };
  }
  if (status === 'streaming') {
    return { label: t('subagent.streaming'), icon: Loader2, color: 'primary' };
  }
  switch (meta?.resultStatus) {
    case 'max_steps':
      return { label: t('subagent.maxSteps'), icon: AlertTriangle, color: 'warning' };
    case 'timeout':
      return { label: t('subagent.timeout'), icon: Clock, color: 'warning' };
    case 'abort':
      return { label: t('subagent.aborted'), icon: XCircle, color: 'textTertiary' };
    default:
      return { label: t('subagent.completed'), icon: CheckCircle2, color: 'success' };
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
  const color = theme.color[statusConfig.color as keyof typeof theme.color] ?? theme.color.primary;
  const accent = theme.blockColor.subagent ?? { text: theme.color.primary, bg: 'transparent' };
  const isStreaming = block.status === 'streaming';

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        css={css`
          border-radius: ${theme.radius.lg};
          background: ${theme.color.bgContainer};
          border: 1px solid ${theme.color.border};
          border-left: 3px solid ${accent.text};
          overflow: hidden;
          cursor: pointer;
          transition:
            border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
            box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
          &:hover {
            border-color: ${theme.color.borderHover};
            box-shadow: ${theme.shadow.sm};
          }
        `}
      >
        {/* Header: icon + name + status */}
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[2]} ${theme.spacing[3]};
          `}
        >
          <div
            css={css`
              width: 28px;
              height: 28px;
              border-radius: ${theme.radius.md};
              background: ${accent.bg};
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            `}
          >
            <Bot size={16} style={{ color: accent.text }} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: 600;
              color: ${theme.color.text};
            `}
          >
            {name}
          </span>
          <div
            css={css`
              margin-left: auto;
              display: flex;
              align-items: center;
              gap: ${theme.spacing[1]};
            `}
          >
            <StatusIcon
              size={14}
              {...(isStreaming
                ? {
                    css: css`
                      animation: ${spinKeyframes} 1s linear infinite;
                      color: ${color};
                      @media (prefers-reduced-motion: reduce) {
                        animation: none;
                      }
                    `,
                  }
                : { style: { color } })}
            />
            <span
              css={css`
                font-size: ${theme.font.size.xs};
                color: ${color};
              `}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Task line */}
        {meta?.task && (
          <div
            css={css`
              padding: 0 ${theme.spacing[3]};
              font-size: ${theme.font.size.xs};
              color: ${theme.color.textSecondary};
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}
          >
            {meta.task}
          </div>
        )}

        {/* Metrics line */}
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[3]};
            padding: ${theme.spacing[1]} ${theme.spacing[3]} ${theme.spacing[2]};
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textTertiary};
          `}
        >
          {meta?.steps != null && <span>{t('subagent.steps', { count: meta.steps })}</span>}
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
