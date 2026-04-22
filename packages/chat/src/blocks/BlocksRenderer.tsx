/**
 * Execution block rendering router
 */
import type { Block } from '../types.js';
import type { BlockProps } from '../types.js';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useChatContext } from '../context.js';
import { ThinkingBlock } from './ThinkingBlock.js';
import { ToolCallBlock } from './ToolCallBlock.js';
import { PlanBlock } from './PlanBlock.js';
import { ErrorBlock } from './ErrorBlock.js';
import { HumanInputBlock } from './HumanInputBlock.js';
import { SkillBlock } from './SkillBlock.js';

export interface BlocksRendererProps {
  blocks: Block[];
}

/** Built-in block renderers */
const builtinBlockRenderers: Record<string, React.ComponentType<BlockProps>> = {
  thinking: ThinkingBlock,
  tool_call: ToolCallBlock,
  plan: PlanBlock,
  error: ErrorBlock,
  human_input: HumanInputBlock,
  skill: SkillBlock,
};

export function BlocksRenderer({ blocks }: BlocksRendererProps) {
  const theme = useTheme();
  const { renderers, onConfirmHumanRequest } = useChatContext();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[2]};
      `}
    >
      {blocks.map((block) => {
        // Custom renderer takes priority
        const CustomRenderer = renderers.blocks?.[block.type];
        const BuiltinRenderer = builtinBlockRenderers[block.type];
        const Renderer = CustomRenderer ?? BuiltinRenderer;

        if (!Renderer) return null;

        return <Renderer key={block.id} block={block} onConfirm={onConfirmHumanRequest} />;
      })}
    </div>
  );
}
