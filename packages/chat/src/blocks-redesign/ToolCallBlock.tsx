/**
 * Tool call block — single-line rows with detail modal
 */
import { useState } from 'react';
import { css } from '@emotion/react';
import { Wrench } from 'lucide-react';
import type { BlockProps, ToolCallMetadata } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import { ToolCallDetailModal } from './ToolCallDetailModal.js';
import { getToolColorKey } from './toolColorUtils.js';

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
        gap: ${theme.spacing[3]};
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
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

export function ToolCallBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as ToolCallMetadata | undefined;
  const toolName = meta?.toolName ?? t('toolCall.unknownTool');
  const toolType = meta?.toolType;
  const colorKey = getToolColorKey(toolType);
  const accentColor =
    theme.blockColor[colorKey as keyof typeof theme.blockColor]?.text ?? theme.color.primary;
  const accentBg =
    theme.blockColor[colorKey as keyof typeof theme.blockColor]?.bg ?? theme.color.primaryBg;
  const args = meta?.toolArgs;
  const result = meta?.toolResult;

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
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${theme.spacing[3]} ${theme.spacing[4]};
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
                width: 28px;
                height: 28px;
                border-radius: ${theme.radius.md};
                background: ${accentBg};
                color: ${accentColor};
              `}
            >
              <Wrench size={14} />
            </div>
            <span
              css={css`
                font-size: ${theme.font.size.base};
                font-weight: ${theme.font.weight.semibold};
                color: ${theme.color.text};
              `}
            >
              {toolName}
            </span>
          </div>
          {toolType && (
            <span
              css={css`
                font-size: ${theme.font.size.xs};
                font-weight: ${theme.font.weight.bold};
                text-transform: uppercase;
                letter-spacing: 0.06em;
                padding: 2px 8px;
                border-radius: ${theme.radius.sm};
                background: ${accentBg};
                color: ${accentColor};
              `}
            >
              {toolType}
            </span>
          )}
        </div>

        {/* Input row */}
        <div
          css={css`
            border-bottom: 1px solid ${theme.color.borderSecondary};
          `}
        >
          <CodeRow
            label={t('toolCall.input')}
            dotColor={theme.color.info}
            content={args}
            onClick={() => setDetailOpen(true)}
          />
        </div>

        {/* Output row */}
        {result && (
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
}
