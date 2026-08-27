/** @jsxImportSource @emotion/react */
/**
 * Sub-agent delegation block — summary card with detail modal
 *
 * Follows the shared card pattern used by ToolCallBlock / SkillBlock /
 * PlanBlock: container with radius.lg + border + hover, transparent header
 * with bottom border, body rows below. Clicking opens SubAgentModal
 * which embeds a MessageList showing the sub-agent's full conversation.
 */
import { formatTokens, formatDuration } from '@agentskillmania/skill-ui-shared';
import { useTheme, spinKeyframes } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Bot, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { memo, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, SubAgentBlockMetadata, BlockStatus } from '../types.js';
import { BlockBadge, type BlockBadgeVariant } from './BlockBadge.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

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
  /** BlockBadge variant for the status pill */
  tagVariant: BlockBadgeVariant;
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
      tagVariant: 'solidError',
    };
  }
  if (status === 'streaming') {
    return {
      label: t('subagent.streaming'),
      icon: Loader2,
      tagVariant: 'primary',
    };
  }
  switch (meta?.resultStatus) {
    case 'max_steps':
      return {
        label: t('subagent.maxSteps'),
        icon: AlertTriangle,
        tagVariant: 'warning',
      };
    case 'timeout':
      return {
        label: t('subagent.timeout'),
        icon: Clock,
        tagVariant: 'warning',
      };
    case 'abort':
      return {
        label: t('subagent.aborted'),
        icon: XCircle,
        tagVariant: 'neutral',
      };
    default:
      return {
        label: t('subagent.completed'),
        icon: CheckCircle2,
        tagVariant: 'success',
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
  const isStreaming = block.status === 'streaming';
  const isError = block.status === 'error' || meta?.resultStatus === 'error';
  // 子代理完成后收起；错误保持展开
  const { expanded, toggle } = useBlockCollapse(block.status === 'completed' && !isError);

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
        {/* Header */}
        <div
          onClick={toggle}
          aria-expanded={expanded}
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${theme.spacing[2]} ${theme.spacing[4]};
            background: ${isError ? theme.color.errorBg : 'transparent'};
            border-bottom: 1px solid ${isError ? theme.color.error : theme.color.borderSecondary};
            ${expanded ? '' : 'border-bottom: none;'}
            cursor: pointer;
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
                width: 22px;
                height: 22px;
                border-radius: ${theme.radius.md};
                background: ${theme.color.fillLight};
                color: ${theme.color.textSecondary};
                flex-shrink: 0;
              `}
            >
              <Bot size={13} />
            </div>
            <span
              css={css`
                font-size: ${theme.font.size.sm};
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
          {/* Status tag — shared badge style */}
          <BlockBadge
            variant={statusConfig.tagVariant}
            icon={
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
            }
          >
            {statusConfig.label}
          </BlockBadge>
          <span
            css={css`
              color: ${theme.color.textTertiary};
              flex-shrink: 0;
              display: inline-flex;
            `}
          >
            <CollapseChevron expanded={expanded} />
          </span>
        </div>

        {/* Body: task line + metrics */}
        {expanded &&
          (meta?.task ||
            meta?.steps != null ||
            (meta?.inputTokens != null && meta?.outputTokens != null) ||
            meta?.duration != null) && (
            <div
              css={css`
                padding: ${theme.spacing[2]} ${theme.spacing[4]};
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
                    margin-bottom: ${theme.spacing[1]};
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
                    gap: ${theme.spacing[2]};
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
                    <span>
                      {t('subagent.duration', { duration: formatDuration(meta.duration) })}
                    </span>
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
