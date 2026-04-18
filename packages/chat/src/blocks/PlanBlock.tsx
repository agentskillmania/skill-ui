/**
 * 执行计划块
 */
import { css } from '@emotion/react';
import { FileText } from 'lucide-react';
import type { BlockProps, PlanMetadata, PlanStep } from '../types.js';
import { useChatContext } from '../context.js';
import { BlockCard } from './BlockCard.js';

function getStepIcon(step: PlanStep, index: number): string {
  switch (step.status) {
    case 'completed':
      return '✓';
    case 'running':
      return '●';
    case 'error':
      return '✗';
    case 'skipped':
      return '—';
    default:
      return `${index + 1}`;
  }
}

function getStepColor(step: PlanStep, theme: { color: Record<string, string> }): string {
  switch (step.status) {
    case 'completed':
      return theme.color.success;
    case 'running':
      return theme.color.primary;
    case 'error':
      return theme.color.error;
    case 'skipped':
      return theme.color.textTertiary;
    default:
      return theme.color.textTertiary;
  }
}

export function PlanBlock({ block }: BlockProps) {
  const { theme } = useChatContext();
  const meta = block.metadata as PlanMetadata | undefined;
  const steps = meta?.steps ?? [];

  return (
    <BlockCard
      icon={<FileText size={14} />}
      title="执行计划"
      accentColor={theme.blockColor.plan.text}
      tag={`${steps.filter((s) => s.status === 'completed').length}/${steps.length}`}
      tagColor={theme.blockColor.plan.text}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[2]};
        `}
      >
        {steps.map((step, index) => {
          const color = getStepColor(step, theme);
          return (
            <div
              key={index}
              css={css`
                display: flex;
                align-items: flex-start;
                gap: ${theme.spacing[2]};
                font-size: ${theme.font.size.sm};
                color: ${step.status === 'skipped' ? theme.color.textTertiary : theme.color.text};
                ${step.status === 'skipped' ? 'text-decoration: line-through;' : ''}
              `}
            >
              <span
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 20px;
                  height: 20px;
                  border-radius: ${theme.radius.full};
                  background: ${color}20;
                  color: ${color};
                  font-size: ${theme.font.size.xs};
                  font-weight: ${theme.font.weight.semibold};
                  flex-shrink: 0;
                `}
              >
                {getStepIcon(step, index)}
              </span>
              <span
                css={css`
                  line-height: 1.5;
                `}
              >
                {step.content}
              </span>
            </div>
          );
        })}
      </div>
    </BlockCard>
  );
}
