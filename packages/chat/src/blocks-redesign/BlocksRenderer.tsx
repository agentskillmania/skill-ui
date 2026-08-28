/**
 * Execution block rendering router — redesigned blocks
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';

import type { Block, BlockProps, ChatRenderers, BlockAction } from '../types.js';
import type { FileEditMetadata, ShellMetadata, ToolCallMetadata } from '../types.js';
import { A2UIBlock } from './A2UIBlock.js';
import { ErrorBlock } from './ErrorBlock.js';
import { parseFileEditReceipt } from './file-edit.js';
import { FileEditBlock } from './FileEditBlock.js';
import { HumanInputBlock } from './HumanInputBlock.js';
import { PlanBlock } from './PlanBlock.js';
import { ShellBlock } from './ShellBlock.js';
import { SkillBlock } from './SkillBlock.js';
import { SubAgentBlock } from './SubAgentBlock.js';
import { TextBlock } from './TextBlock.js';
import { ThinkingBlock } from './ThinkingBlock.js';
import { TodoBlock } from './TodoBlock.js';
import { ToolCallBlock } from './ToolCallBlock.js';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export interface BlocksRendererProps {
  blocks: Block[];
  /** Custom block renderers (override built-ins) */
  renderers?: ChatRenderers;
  /** Human interaction confirmation callback */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Block action callback */
  onBlockAction?: (action: BlockAction) => void;
}

/** Built-in block renderers (redesigned) */
const builtinBlockRenderers: Record<string, React.ComponentType<BlockProps>> = {
  text: TextBlock,
  thinking: ThinkingBlock,
  tool_call: ToolCallBlock,
  plan: PlanBlock,
  error: ErrorBlock,
  human_input: HumanInputBlock,
  skill: SkillBlock,
  a2ui: A2UIBlock,
  subagent: SubAgentBlock,
  todo: TodoBlock,
  shell: ShellBlock,
  file_edit: FileEditBlock,
};

/** tool_call 块是否为 shell 工具(命中专用块渲染)。 */
function isShellToolCall(block: Block): boolean {
  return (
    block.type === 'tool_call' &&
    (block.metadata as ToolCallMetadata | undefined)?.toolName === 'shell'
  );
}

/** tool_call(shell) → ShellBlock 适配:命令取 args.command,输出取
 * toolResult(block.content 兜底),exitCode 按 wrangler shell 约定解析
 * —— exit 0 输出纯 stdout,非零以 "Exit code: N" 开头。 */
function asShellBlock(block: Block): Block {
  const meta = (block.metadata ?? {}) as Partial<ToolCallMetadata> & Partial<ShellMetadata>;
  let command = meta.command;
  if (command === undefined) {
    try {
      const args = meta.toolArgs ? (JSON.parse(meta.toolArgs) as { command?: string }) : {};
      command = typeof args.command === 'string' ? args.command : (meta.toolArgs ?? '');
    } catch {
      command = meta.toolArgs ?? '';
    }
  }
  const output = meta.toolResult ?? meta.output ?? block.content ?? '';
  let exitCode = meta.exitCode;
  if (exitCode === undefined && block.status === 'completed') {
    const m = /^Exit code: (\d+)/m.exec(output);
    exitCode = m ? Number(m[1]) : 0;
  }
  return {
    ...block,
    type: 'shell',
    // keep the raw tool_call fields so tool_call-level custom renderers
    // still see the original shape (same contract as asFileEditBlock)
    metadata: { ...block.metadata, command, output, exitCode },
  };
}

/** tool_call 块是否为 file_edit 工具(命中专用块渲染)。 */
function isFileEditToolCall(block: Block): boolean {
  return (
    block.type === 'tool_call' &&
    (block.metadata as ToolCallMetadata | undefined)?.toolName === 'file_edit'
  );
}

/** tool_call(file_edit) → FileEditBlock 适配:oldString/newString/replaceAll 取自
 * toolArgs,occurrences/startLine/errorMessage 按 wrangler file_edit 回执约定从
 * toolResult 解析。args 缺失或损坏时返回 null,回落通用 ToolCallBlock。 */
function asFileEditBlock(block: Block): Block | null {
  const meta = (block.metadata ?? {}) as Partial<ToolCallMetadata> & Partial<FileEditMetadata>;
  let args: {
    filePath?: unknown;
    oldString?: unknown;
    newString?: unknown;
    replaceAll?: unknown;
  } = {};
  try {
    args = meta.toolArgs ? (JSON.parse(meta.toolArgs) as typeof args) : {};
  } catch {
    return null;
  }
  if (typeof args.oldString !== 'string' || typeof args.newString !== 'string') {
    return null;
  }
  return {
    ...block,
    type: 'file_edit',
    metadata: {
      // keep the raw tool_call fields (toolName/toolType/toolArgs/toolResult)
      // so tool_call-level custom renderers still see the original shape
      ...block.metadata,
      filePath: typeof args.filePath === 'string' ? args.filePath : undefined,
      oldString: args.oldString,
      newString: args.newString,
      replaceAll: args.replaceAll === true,
      ...parseFileEditReceipt(meta.toolResult ?? ''),
    },
  };
}

export function BlocksRenderer({
  blocks,
  renderers,
  onConfirmHumanRequest,
  onBlockAction,
}: BlocksRendererProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[3]};
      `}
    >
      {blocks.map((block, index) => {
        // shell/file_edit 工具的 tool_call 走各自专用块(结构化展示);
        // file_edit 的 args 损坏时适配返回 null,回落通用 ToolCallBlock。
        const shell = isShellToolCall(block);
        const edit = isFileEditToolCall(block) ? asFileEditBlock(block) : null;
        const effective = shell ? asShellBlock(block) : (edit ?? block);
        // Custom renderer takes priority:tool_call 级定制优先,其次专用块
        // (shell/file_edit)的定制,最后内置渲染器。
        const CustomRenderer =
          renderers?.blocks?.[block.type] ??
          (shell || edit ? renderers?.blocks?.[effective.type] : undefined);
        const BuiltinRenderer = shell
          ? ShellBlock
          : edit
            ? FileEditBlock
            : builtinBlockRenderers[block.type];
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
            <Renderer
              block={effective}
              onConfirm={onConfirmHumanRequest}
              onAction={onBlockAction}
            />
          </div>
        );
      })}
    </div>
  );
}
