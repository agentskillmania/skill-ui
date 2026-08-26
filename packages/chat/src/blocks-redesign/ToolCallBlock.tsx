/**
 * Tool call block — single-line rows with detail modal
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';
import { Wrench } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BlockProps, ToolCallMetadata } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';
import { ToolCallDetailModal } from './ToolCallDetailModal.js';
import { NAMESPACE } from '../locales/index.js';

const subtlePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

/** Single-line code row with ellipsis */
function CodeRow({
  label,
  dotColor,
  content,
  onClick,
}: {
  label: string;
  dotColor: string;
  content?: string;
  onClick?: () => void;
}) {
  const theme = useTheme();

  return (
    <div
      onClick={onClick}
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        cursor: ${onClick ? 'pointer' : 'default'};
        transition: background ${theme.motion.duration.fast} ${theme.motion.easing.out};
        ${onClick
          ? css`
              &:hover {
                background: ${theme.color.fillSubtle};
              }
              &:active {
                background: ${theme.color.hoverOverlay};
              }
            `
          : ''}
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          flex-shrink: 0;
        `}
      >
        <span
          css={css`
            width: 6px;
            height: 6px;
            border-radius: ${theme.radius.full};
            background: ${dotColor};
            flex-shrink: 0;
          `}
        />
        <span
          css={css`
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${theme.color.textTertiary};
            flex-shrink: 0;
            width: 32px;
          `}
        >
          {label}
        </span>
      </div>
      <span
        css={css`
          font-family: ${theme.font.familyMono};
          font-size: ${theme.font.size.sm};
          color: ${theme.color.textSecondary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
          line-height: ${theme.font.lineHeight};
        `}
      >
        {content || '—'}
      </span>
    </div>
  );
}

export const ToolCallBlock = memo(function ToolCallBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as ToolCallMetadata | undefined;
  const toolName = meta?.toolName ?? t('toolCall.unknownTool');
  const toolType = meta?.toolType;
  const isRunning = block.status === 'streaming' || block.status === 'pending';
  const isError = block.status === 'error';
  const args = meta?.toolArgs;
  const result = meta?.toolResult;

  // 工具调用结束后收起；错误保持展开
  const { expanded, toggle } = useBlockCollapse(block.status === 'completed');

  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
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
                background: ${theme.color.fillLight};
                color: ${theme.color.textSecondary};
              `}
            >
              <Wrench size={13} />
            </div>
            <span
              css={css`
                font-size: ${theme.font.size.sm};
                font-weight: ${theme.font.weight.semibold};
                color: ${theme.color.text};
              `}
            >
              {toolName}
            </span>
          </div>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              flex-shrink: 0;
              color: ${theme.color.textTertiary};
            `}
          >
            {toolType && (
              <span
                css={css`
                  font-size: ${theme.font.size.xs};
                  font-weight: ${theme.font.weight.bold};
                  text-transform: uppercase;
                  letter-spacing: 0.06em;
                  padding: 2px 8px;
                  border-radius: ${theme.radius.sm};
                  background: ${theme.color.fillSubtle};
                  color: ${theme.color.textTertiary};
                `}
              >
                {toolType}
              </span>
            )}
            {isRunning && (
              <span
                css={css`
                  display: inline-flex;
                  align-items: center;
                  gap: ${theme.spacing[1]};
                  font-size: ${theme.font.size.xs};
                  font-weight: ${theme.font.weight.semibold};
                  padding: 2px 8px;
                  border-radius: ${theme.radius.full};
                  background: ${theme.color.primaryBg};
                  color: ${theme.color.primary};
                `}
              >
                <span
                  css={css`
                    width: 5px;
                    height: 5px;
                    border-radius: ${theme.radius.full};
                    background: ${theme.color.primary};
                    animation: ${subtlePulse} 1.2s ease-in-out infinite;
                  `}
                />
                {t('toolCall.running')}
              </span>
            )}
            {isError && (
              <span
                css={css`
                  display: inline-flex;
                  align-items: center;
                  gap: ${theme.spacing[1]};
                  font-size: ${theme.font.size.xs};
                  font-weight: ${theme.font.weight.semibold};
                  padding: 2px 8px;
                  border-radius: ${theme.radius.full};
                  background: ${theme.color.errorBg};
                  color: ${theme.color.error};
                `}
              >
                {t('toolCall.error')}
              </span>
            )}
            <CollapseChevron expanded={expanded} />
          </div>
        </div>

        {/* Input row */}
        {expanded && (
          <div
            css={css`
              border-bottom: 1px solid ${theme.color.borderSecondary};
            `}
          >
            <CodeRow
              label={t('toolCall.input')}
              dotColor={theme.color.textQuaternary}
              content={args}
              onClick={() => setDetailOpen(true)}
            />
          </div>
        )}

        {/* Output row */}
        {expanded && result && (
          <CodeRow
            label={t('toolCall.output')}
            dotColor={block.status === 'error' ? theme.color.error : theme.color.success}
            content={result}
            onClick={() => setDetailOpen(true)}
          />
        )}
      </div>

      <ToolCallDetailModal
        open={detailOpen}
        toolName={toolName}
        toolType={toolType}
        args={args}
        result={result}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
});
