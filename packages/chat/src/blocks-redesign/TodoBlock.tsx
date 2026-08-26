/**
 * Todo list block — session checklist, plan-like step visuals.
 * Collapses to a summary line once every item is completed.
 */
import { useTheme, spinKeyframes } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Check, Circle, ListChecks, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, TodoItem, TodoMetadata } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

function itemIcon(item: TodoItem) {
  switch (item.status) {
    case 'completed':
      return <Check size={11} strokeWidth={3} />;
    case 'in_progress':
      return (
        <Loader2
          size={11}
          css={css`
            animation: ${spinKeyframes} 1s linear infinite;
            @media (prefers-reduced-motion: reduce) {
              animation: none;
            }
          `}
        />
      );
    default:
      return <Circle size={8} strokeWidth={2} />;
  }
}

export const TodoBlock = memo(function TodoBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as TodoMetadata | undefined;
  const items = meta?.items ?? [];
  const doneCount = items.filter((i) => i.status === 'completed').length;
  const allDone = items.length > 0 && doneCount === items.length;

  // 全部完成后默认折叠成摘要，进行中展开；标题栏随时可手动收起
  const { expanded, toggle } = useBlockCollapse(allDone);
  const showList = expanded;

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
          justify-content: space-between;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          border-bottom: ${showList ? `1px solid ${theme.color.borderSecondary}` : 'none'};
          cursor: pointer;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            min-width: 0;
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
            <ListChecks size={13} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {meta?.title ?? t('todo.title')}
          </span>
        </div>
        {allDone ? (
          <span
            css={css`
              display: inline-flex;
              align-items: center;
              gap: ${theme.spacing[1]};
              font-size: ${theme.font.size.xs};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.success};
              flex-shrink: 0;
            `}
          >
            {t('todo.allDone', { done: doneCount, total: items.length })}
            <CollapseChevron expanded={expanded} />
          </span>
        ) : (
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              flex-shrink: 0;
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
                  background: ${theme.color.primary};
                  transition: width ${theme.motion.duration.slow} ${theme.motion.easing.out};
                `}
                style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
              />
            </div>
            <span
              css={css`
                font-size: ${theme.font.size.sm};
                font-weight: ${theme.font.weight.semibold};
                color: ${theme.color.textTertiary};
              `}
            >
              {t('todo.count', { done: doneCount, total: items.length })}
            </span>
            <span
              css={css`
                color: ${theme.color.textTertiary};
                display: inline-flex;
              `}
            >
              <CollapseChevron expanded={expanded} />
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      {showList && (
        <div
          css={css`
            padding: ${theme.spacing[2]} ${theme.spacing[4]};
          `}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const iconStyle =
              item.status === 'completed'
                ? css`
                    background: ${theme.color.successBg};
                    color: ${theme.color.success};
                  `
                : item.status === 'in_progress'
                  ? css`
                      background: ${theme.color.primaryBg};
                      color: ${theme.color.primary};
                    `
                  : css`
                      background: transparent;
                      color: ${theme.color.textQuaternary};
                      border: 1px solid ${theme.color.border};
                    `;
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
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: ${theme.radius.full};
                    flex-shrink: 0;
                    margin-top: 1px;
                    z-index: 1;
                    ${iconStyle}
                  `}
                >
                  {itemIcon(item)}
                </div>
                <div
                  css={css`
                    flex: 1;
                    min-width: 0;
                    font-size: ${theme.font.size.sm};
                    font-weight: ${theme.font.weight.medium};
                    line-height: ${theme.font.lineHeight};
                    color: ${item.status === 'completed'
                      ? theme.color.textTertiary
                      : item.status === 'in_progress'
                        ? theme.color.text
                        : theme.color.textSecondary};
                  `}
                >
                  {/* wire/daemon 的真字段是 subject;content 是旧形状(stories) */}
                  {item.subject ?? item.content ?? ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
