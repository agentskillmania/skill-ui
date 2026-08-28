/**
 * Skill block — load_skill tool call presentation card.
 *
 * skill 只有加载、没有执行:块状态就是工具调用状态
 * (streaming → completed / error),不存在生命周期阶段。
 */
import { useTheme, spinKeyframes } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Sparkles, XCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, SkillBlockMetadata } from '../types.js';
import { BlockBadge, type BlockBadgeVariant } from './BlockBadge.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

type TFunction = (key: string, params?: Record<string, unknown>) => string;

function getDisplay(
  meta: SkillBlockMetadata | undefined,
  status: string,
  t: TFunction
): { title: string; tag?: string; icon: React.ReactNode; tagVariant: BlockBadgeVariant } {
  const name = meta?.skillName ?? t('skill.defaultName');

  if (status === 'error') {
    return {
      title: name,
      tag: t('skill.failed'),
      icon: <XCircle size={13} />,
      tagVariant: 'error',
    };
  }
  if (status === 'completed') {
    return {
      title: name,
      tag: t('skill.loaded'),
      icon: <Sparkles size={13} />,
      tagVariant: 'success',
    };
  }
  return {
    title: name,
    tag: t('skill.loadingShort'),
    icon: <Loader2 size={13} />,
    tagVariant: 'primary',
  };
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
  const { title, tag, icon, tagVariant } = getDisplay(meta, block.status, t);
  // 技能加载结束后收起；错误保持展开
  const { expanded, toggle } = useBlockCollapse(block.status === 'completed');
  const isSpinning = block.status === 'streaming';

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
              : block.status === 'completed'
                ? theme.color.successBg
                : theme.color.fillLight};
            color: ${block.status === 'error'
              ? theme.color.error
              : block.status === 'completed'
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
          {meta?.task && (
            <div
              css={css`
                font-size: ${theme.font.size.xs};
                color: ${theme.color.textTertiary};
                margin-top: 1px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {meta.task}
            </div>
          )}
        </div>
        {tag && <BlockBadge variant={tagVariant}>{tag}</BlockBadge>}
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
    </div>
  );
});
