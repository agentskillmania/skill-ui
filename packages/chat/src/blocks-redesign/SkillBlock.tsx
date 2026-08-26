/**
 * Skill execution block — phase card with timeline
 */
import { useTheme, spinKeyframes, type Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, SkillBlockMetadata } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

type TFunction = (key: string, params?: Record<string, unknown>) => string;

/** Return display info based on phase */
function getPhaseDisplay(
  meta: SkillBlockMetadata | undefined,
  status: string,
  theme: Theme,
  t: TFunction
): { title: string; tag?: string; icon: React.ReactNode; tagBg: string; tagText: string } {
  const name = meta?.skillName ?? t('skill.defaultName');

  if (status === 'error') {
    return {
      title: `${name} ${t('skill.executionFailed')}`,
      tag: t('skill.failed'),
      icon: <XCircle size={13} />,
      tagBg: theme.color.errorBg,
      tagText: theme.color.error,
    };
  }

  switch (meta?.phase) {
    case 'loading':
      return {
        title: t('skill.loading', { name }),
        tag: t('skill.loadingShort'),
        icon: <Loader2 size={13} />,
        tagBg: theme.color.primaryBg,
        tagText: theme.color.primary,
      };
    case 'loaded':
      return {
        title: name,
        tag: t('skill.loaded'),
        icon: <Sparkles size={13} />,
        tagBg: theme.color.primaryBg,
        tagText: theme.color.primary,
      };
    case 'executing':
      return {
        title: t('skill.executing', { name }),
        tag: meta?.task ?? t('skill.executingShort'),
        icon: <Loader2 size={13} />,
        tagBg: theme.color.primaryBg,
        tagText: theme.color.primary,
      };
    case 'completed':
      return {
        title: t('skill.completed', { name }),
        icon: <CheckCircle2 size={13} />,
        tagBg: theme.color.successBg,
        tagText: theme.color.success,
      };
    default:
      return {
        title: name,
        icon: <Sparkles size={13} />,
        tagBg: theme.color.primaryBg,
        tagText: theme.color.primary,
      };
  }
}

/** Build phase timeline configuration */
function getPhases(t: TFunction): Array<{ key: SkillBlockMetadata['phase']; label: string }> {
  return [
    { key: 'loading', label: t('skill.phase.loading') },
    { key: 'loaded', label: t('skill.phase.loaded') },
    { key: 'executing', label: t('skill.phase.executing') },
    { key: 'completed', label: t('skill.phase.completed') },
  ];
}

function getPhaseStatus(
  phase: SkillBlockMetadata['phase'],
  currentPhase: SkillBlockMetadata['phase']
): 'done' | 'active' | 'pending' {
  const order = ['loading', 'loaded', 'executing', 'completed'];
  const currentIdx = currentPhase ? order.indexOf(currentPhase) : -1;
  const phaseIdx = phase ? order.indexOf(phase) : -1;

  if (phaseIdx < currentIdx) return 'done';
  if (phaseIdx === currentIdx) {
    // When the entire flow is completed, the last phase should also show done
    if (currentPhase === 'completed') return 'done';
    return 'active';
  }
  return 'pending';
}

export const SkillBlock = memo(function SkillBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as SkillBlockMetadata | undefined;
  // Result preview: legacy state baked `Result: …(200 chars)` into content;
  // newer state leaves content empty and carries the raw result in
  // metadata.result — derive the same preview here so both render identically.
  const resultPreview =
    block.content || (meta?.result ? `Result: ${meta.result.slice(0, 200)}` : '');
  const { title, tag, icon, tagBg, tagText } = getPhaseDisplay(meta, block.status, theme, t);
  // 技能执行结束后收起；错误保持展开
  const { expanded, toggle } = useBlockCollapse(
    block.status === 'completed' && meta?.phase === 'completed'
  );
  const isSpinning = meta?.phase === 'loading' || meta?.phase === 'executing';
  const phases = getPhases(t);

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
        onClick={toggle}
        aria-expanded={expanded}
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          ${expanded ? '' : 'border-bottom: none;'}
          cursor: pointer;
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
            background: ${block.status === 'error'
              ? theme.color.errorBg
              : meta?.phase === 'completed'
                ? theme.color.successBg
                : theme.color.fillLight};
            color: ${block.status === 'error'
              ? theme.color.error
              : meta?.phase === 'completed'
                ? theme.color.success
                : theme.color.textSecondary};
            ${isSpinning
              ? css`
                  & > * {
                    animation: ${spinKeyframes} 1s linear infinite;
                  }
                  @media (prefers-reduced-motion: reduce) {
                    & > * {
                      animation: none;
                    }
                  }
                `
              : ''}
          `}
        >
          {icon}
        </div>
        <div
          css={css`
            flex: 1;
            min-width: 0;
          `}
        >
          <div
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {title}
          </div>
          {meta?.tokenCount && meta.phase !== 'completed' && (
            <div
              css={css`
                font-size: ${theme.font.size.xs};
                color: ${theme.color.textTertiary};
                margin-top: 1px;
              `}
            >
              {meta.tokenCount} tokens
              {meta?.task ? ` · ${meta.task}` : ''}
            </div>
          )}
        </div>
        {tag && (
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              font-weight: ${theme.font.weight.semibold};
              padding: 2px 8px;
              border-radius: ${theme.radius.full};
              background: ${tagBg};
              color: ${tagText};
              flex-shrink: 0;
            `}
          >
            {tag}
          </span>
        )}
        <span
          css={css`
            color: ${theme.color.textTertiary};
            flex-shrink: 0;
          `}
        >
          <CollapseChevron expanded={expanded} />
        </span>
      </div>

      {/* Content */}
      {expanded && resultPreview && (
        <div
          css={css`
            padding: ${theme.spacing[2]} ${theme.spacing[4]};
            font-size: ${theme.font.size.sm};
            line-height: ${theme.font.lineHeightRelaxed};
            color: ${theme.color.textSecondary};
          `}
        >
          {resultPreview}
        </div>
      )}

      {/* Phase Timeline — only render when a phase is known */}
      {expanded && meta?.phase && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            padding: ${theme.spacing[2]} ${theme.spacing[4]};
            border-top: 1px solid ${theme.color.borderSecondary};
            overflow-x: auto;
          `}
        >
          {phases.map((phase, index) => {
            const phaseStatus = getPhaseStatus(phase.key, meta?.phase);
            return (
              <div
                key={phase.key}
                css={css`
                  display: flex;
                  align-items: center;
                  gap: ${theme.spacing[1]};
                `}
              >
                <span
                  css={css`
                    display: flex;
                    align-items: center;
                    gap: ${theme.spacing[1]};
                    font-size: ${theme.font.size.xs};
                    font-weight: ${theme.font.weight.medium};
                    padding: 2px 6px;
                    border-radius: ${theme.radius.sm};
                    white-space: nowrap;
                    transition: all ${theme.motion.duration.normal} ${theme.motion.easing.out};
                    ${phaseStatus === 'done'
                      ? css`
                          color: ${theme.color.success};
                          background: ${theme.color.successBg};
                        `
                      : phaseStatus === 'active'
                        ? css`
                            color: ${theme.color.primary};
                            background: ${theme.color.primaryBg};
                          `
                        : css`
                            color: ${theme.color.textQuaternary};
                          `}
                  `}
                >
                  {phaseStatus === 'done' && <CheckCircle2 size={11} style={{ opacity: 0.7 }} />}
                  {phaseStatus === 'active' && <Loader2 size={11} style={{ opacity: 0.7 }} />}
                  {phase.label}
                </span>
                {index < phases.length - 1 && (
                  <span
                    css={css`
                      color: ${theme.color.textQuaternary};
                      font-size: ${theme.font.size.xs};
                      padding: 0 2px;
                    `}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
