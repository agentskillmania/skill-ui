/**
 * Execution plan block — timeline/step list
 */
import { useTheme, type Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { FileText, Check, CircleDot, XCircle, Minus, Circle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, PlanMetadata, PlanStep } from '../types.js';

/** Get icon component for step status */
function getStepIcon(step: PlanStep): React.ReactNode {
  switch (step.status) {
    case 'completed':
      return <Check size={11} strokeWidth={3} />;
    case 'running':
      return <CircleDot size={11} />;
    case 'error':
      return <XCircle size={11} />;
    case 'skipped':
      return <Minus size={11} />;
    default:
      return <Circle size={11} />;
  }
}

/** Get color for step status */
function getStepColor(step: PlanStep, theme: Theme): string {
  switch (step.status) {
    case 'completed':
      return theme.color.success;
    case 'running':
      return theme.blockColor.plan.text;
    case 'error':
      return theme.color.error;
    case 'skipped':
      return theme.color.textQuaternary;
    default:
      return theme.color.textQuaternary;
  }
}

/** Get background for step icon */
function getStepIconBg(step: PlanStep, theme: Theme): string {
  switch (step.status) {
    case 'completed':
      return theme.color.successBg;
    case 'running':
      return theme.blockColor.plan.bg;
    case 'error':
      return theme.color.errorBg;
    case 'skipped':
      return theme.color.fill;
    default:
      return theme.color.fill;
  }
}

export const PlanBlock = memo(function PlanBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as PlanMetadata | undefined;
  const steps = meta?.steps ?? [];
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        overflow: hidden;
        transition:
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
          box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          border-color: ${theme.color.borderHover};
          box-shadow: ${theme.shadow.sm};
        }
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          background: ${theme.color.fill};
          border-bottom: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
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
              background: ${theme.blockColor.plan.bg};
              color: ${theme.blockColor.plan.text};
            `}
          >
            <FileText size={13} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {t('plan.title')}
          </span>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <div
            css={css`
              width: 80px;
              height: 4px;
              border-radius: ${theme.radius.full};
              background: ${theme.color.fillSecondary};
              overflow: hidden;
            `}
          >
            <div
              css={css`
                height: 100%;
                border-radius: ${theme.radius.full};
                background: ${theme.blockColor.plan.text};
                transition: width ${theme.motion.duration.slow} ${theme.motion.easing.out};
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.textTertiary};
            `}
          >
            {completedCount}/{steps.length}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div
        css={css`
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
        `}
      >
        {steps.map((step, index) => {
          const color = getStepColor(step, theme);
          const iconBg = getStepIconBg(step, theme);
          const isLast = index === steps.length - 1;
          return (
            <div
              key={index}
              css={css`
                display: flex;
                align-items: flex-start;
                gap: ${theme.spacing[2]};
                padding: ${theme.spacing[1]} 0;
                position: relative;
              `}
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  css={css`
                    position: absolute;
                    top: 24px;
                    left: 9px;
                    width: 2px;
                    height: calc(100% - 8px);
                    background: ${theme.color.borderSecondary};
                  `}
                />
              )}

              {/* Icon */}
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 20px;
                  height: 20px;
                  border-radius: ${theme.radius.full};
                  background: ${iconBg};
                  color: ${color};
                  flex-shrink: 0;
                  margin-top: 1px;
                  z-index: 1;
                  transition: all ${theme.motion.duration.normal} ${theme.motion.easing.out};
                  ${step.status === 'pending'
                    ? css`
                        border: 1px solid ${theme.color.border};
                      `
                    : ''}
                `}
              >
                {getStepIcon(step)}
              </div>

              {/* Content */}
              <div
                css={css`
                  flex: 1;
                  min-width: 0;
                `}
              >
                <div
                  css={css`
                    font-size: ${theme.font.size.sm};
                    font-weight: ${theme.font.weight.medium};
                    color: ${step.status === 'skipped'
                      ? theme.color.textTertiary
                      : theme.color.text};
                    line-height: ${theme.font.lineHeight};
                    ${step.status === 'skipped' ? 'text-decoration: line-through;' : ''}
                  `}
                >
                  {step.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
