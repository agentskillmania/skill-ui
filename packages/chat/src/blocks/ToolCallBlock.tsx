/**
 * Tool call block
 */
import { css } from '@emotion/react';
import { Wrench } from 'lucide-react';
import type { BlockProps, ToolCallMetadata } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { BlockCard } from './BlockCard.js';

/** Get corresponding blockColor key by toolType */
function getToolColorKey(toolType?: string): string {
  switch (toolType) {
    case 'mcp':
      return 'toolMcp';
    case 'script':
      return 'toolScript';
    case 'builtin':
      return 'toolBuiltin';
    default:
      return 'toolMcp';
  }
}

export function ToolCallBlock({ block }: BlockProps) {
  const theme = useTheme();
  const meta = block.metadata as ToolCallMetadata | undefined;
  const toolName = meta?.toolName ?? '未知工具';
  const toolType = meta?.toolType;
  const colorKey = getToolColorKey(toolType);
  const accentColor = theme.blockColor[colorKey]?.text ?? theme.color.primary;
  const args = meta?.toolArgs;
  const result = meta?.toolResult;

  return (
    <BlockCard
      icon={<Wrench size={14} />}
      title={toolName}
      accentColor={accentColor}
      tag={toolType?.toUpperCase()}
    >
      {args && (
        <div
          css={css`
            margin-bottom: ${result ? theme.spacing[2] : 0};
            padding: ${theme.spacing[2]};
            background: ${theme.color.fill};
            border-radius: ${theme.radius.sm};
            font-family: ${theme.font.familyMono};
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textSecondary};
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
          `}
        >
          {args}
        </div>
      )}
      {result && (
        <div
          css={css`
            padding: ${theme.spacing[2]};
            background: ${block.status === 'error' ? theme.color.errorBg : theme.color.fill};
            border-radius: ${theme.radius.sm};
            font-family: ${theme.font.familyMono};
            font-size: ${theme.font.size.xs};
            color: ${block.status === 'error' ? theme.color.error : theme.color.textSecondary};
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
          `}
        >
          {result}
        </div>
      )}
    </BlockCard>
  );
}
