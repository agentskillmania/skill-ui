/**
 * Skill execution block — phase card with timeline
 */
import { memo } from 'react';
import { css, keyframes } from '@emotion/react';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { BlockProps, SkillBlockMetadata } from '../types.js';
import { useTheme, type Theme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

type TFunction = (key: string, params?: Record<string, unknown>) => string;

/** Return display info based on phase */
function getPhaseDisplay(
  meta: SkillBlockMetadata | undefined,
  status: string,
  theme: Theme,
  t: TFunction
): { title: string; tag?: string; icon: React.ReactNode; accentColor: string } {
  const name = meta?.skillName ?? t('skill.defaultName');
  const skillAccent = theme.blockColor.skill.text;

  if (status === 'error') {
    return {
      title: `${name} ${t('skill.executionFailed')}`,
      tag: t('skill.failed'),
      icon: <XCircle size={16} />,
      accentColor: theme.color.error,
    };
  }

  switch (meta?.phase) {
    case 'loading':
      return {
        title: t('skill.loading', { name }),
        tag: t('skill.loadingShort'),
        icon: <Loader2 size={16} />,
        accentColor: skillAccent,
      };
    case 'loaded':
      return {
        title: name,
        tag: t('skill.loaded'),
        icon: <Sparkles size={16} />,
        accentColor: skillAccent,
      };
    case 'executing':
      return {
        title: t('skill.executing', { name }),
        tag: meta?.task ?? t('skill.executingShort'),
        icon: <Loader2 size={16} />,
        accentColor: skillAccent,
      };
    case 'completed':
      return {
        title: t('skill.completed', { name }),
        icon: <CheckCircle2 size={16} />,
        accentColor: theme.color.success,
      };
    default:
      return {
        title: name,
        icon: <Sparkles size={16} />,
        accentColor: skillAccent,
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
  const { title, tag, icon, accentColor } = getPhaseDisplay(meta, block.status, theme, t);
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
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[3]};
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
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
            background: ${block.status === 'error'
              ? theme.color.errorBg
              : meta?.phase === 'completed'
                ? theme.color.successBg
                : theme.blockColor.skill.bg};
            color: ${block.status === 'error'
              ? theme.color.error
              : meta?.phase === 'completed'
                ? theme.color.success
                : theme.blockColor.skill.text};
            ${isSpinning
              ? css`
                  & > * {
                    animation: ${spin} 1s linear infinite;
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
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {title}
          </div>
          {meta?.tokenCount && meta.phase !== 'completed' && (
            <div
              css={css`
                font-size: ${theme.font.size.sm};
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
              padding: 3px 10px;
              border-radius: ${theme.radius.full};
              background: ${accentColor}15;
              color: ${accentColor};
              border: 1px solid ${accentColor}30;
              flex-shrink: 0;
            `}
          >
            {tag}
          </span>
        )}
      </div>

      {/* Content */}
      {block.content && (
        <div
          css={css`
            padding: ${theme.spacing[3]} ${theme.spacing[4]};
            font-size: ${theme.font.size.base};
            line-height: ${theme.font.lineHeightRelaxed};
            color: ${theme.color.textSecondary};
          `}
        >
          {block.content}
        </div>
      )}

      {/* Phase Timeline — only render when a phase is known */}
      {meta?.phase && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            padding: ${theme.spacing[3]} ${theme.spacing[4]};
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
                    padding: 3px 8px;
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
                            color: ${theme.blockColor.skill.text};
                            background: ${theme.blockColor.skill.bg};
                          `
                        : css`
                            color: ${theme.color.textQuaternary};
                          `}
                  `}
                >
                  {phaseStatus === 'done' && <CheckCircle2 size={12} style={{ opacity: 0.7 }} />}
                  {phaseStatus === 'active' && <Loader2 size={12} style={{ opacity: 0.7 }} />}
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
