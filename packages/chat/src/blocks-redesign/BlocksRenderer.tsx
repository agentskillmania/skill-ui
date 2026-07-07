/**
 * Execution block rendering router — redesigned blocks
 */
import type { Block, BlockProps } from '../types.js';
import { css, keyframes } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useChatContext } from '../context.js';
import { ThinkingBlock } from './ThinkingBlock.js';
import { ToolCallBlock } from './ToolCallBlock.js';
import { PlanBlock } from './PlanBlock.js';
import { ErrorBlock } from './ErrorBlock.js';
import { HumanInputBlock } from './HumanInputBlock.js';
import { SkillBlock } from './SkillBlock.js';
import { A2UIBlock } from './A2UIBlock.js';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export interface BlocksRendererProps {
  blocks: Block[];
}

/** Built-in block renderers (redesigned) */
const builtinBlockRenderers: Record<string, React.ComponentType<BlockProps>> = {
  thinking: ThinkingBlock,
  tool_call: ToolCallBlock,
  plan: PlanBlock,
  error: ErrorBlock,
  human_input: HumanInputBlock,
  skill: SkillBlock,
  a2ui: A2UIBlock,
};

export function BlocksRenderer({ blocks }: BlocksRendererProps) {
  const theme = useTheme();
  const { renderers, onConfirmHumanRequest, onBlockAction } = useChatContext();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[3]};
      `}
    >
      {blocks.map((block, index) => {
        // Custom renderer takes priority
        const CustomRenderer = renderers.blocks?.[block.type];
        const BuiltinRenderer = builtinBlockRenderers[block.type];
        const Renderer = CustomRenderer ?? BuiltinRenderer;

        if (!Renderer) return null;

        return (
          <div
            key={block.id}
            css={css`
              animation: ${fadeInUp} 200ms ${theme.motion.easing.out} both;
              animation-delay: ${index * 30}ms;
              @media (prefers-reduced-motion: reduce) {
                animation: none;
              }
            `}
          >
            <Renderer block={block} onConfirm={onConfirmHumanRequest} onAction={onBlockAction} />
          </div>
        );
      })}
    </div>
  );
}
