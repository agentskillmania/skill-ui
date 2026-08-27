/**
 * @fileoverview blocks.ts — the single source for AgentBlock shapes
 *
 * Both producers of conversation blocks — the live reducer and fromHistory —
 * build through these constructors, so block semantics cannot drift between
 * the live and resume paths (the old "block-for-block identical" comment was
 * a convention; this module makes it structural). ID generation stays at the
 * call sites (live uses genBlockId, history uses hist- prefixed ids).
 *
 * Known intentional live/resume differences (NOT shape drift):
 * - sub-agent blocks: resume cannot reconstruct the sub-run's internal
 *   conversation (metadata.messages is a task+answer summary there)
 * - human_input: live `metadata.response` is the host-pushed response object;
 *   history's is the persisted tool-result string (render side handles both)
 * - todo card: within-bubble position is chronological-arrival live vs
 *   tail-of-last-assistant on resume (arrival time is not persisted)
 */

import type { AgentBlock, BlockStatus, TodoItem } from './types.js';

/** Tool names that map to special block types. fromHistory dispatches all
 * three; the live path receives dedicated events for ask_human/delegate and
 * only ever sees load_skill arrive as a tool-start. */
export const SKILL_TOOL = 'load_skill';
export const HUMAN_TOOL = 'ask_human';
export const DELEGATE_TOOL = 'delegate';
export const TODO_TOOL = 'todolist_write';

/** Tool calls whose tool_call block is suppressed on BOTH paths because a
 * dedicated presentation block carries the information (ask_human → the
 * human_input question card; todolist_write → the todo card). Rendering a
 * generic tool_call block for them was pure noise and made live vs resume
 * inconsistent (live showed both, history only one of the two). */
export const PRESENTED_TOOLS: ReadonlySet<string> = new Set([HUMAN_TOOL, TODO_TOOL]);

export function textBlock(id: string, content: string, status: BlockStatus): AgentBlock {
  return { id, type: 'text', status, content };
}

export function thinkingBlock(id: string, content: string, status: BlockStatus): AgentBlock {
  return { id, type: 'thinking', status, content };
}

export function errorBlock(id: string, message: string): AgentBlock {
  return { id, type: 'error', status: 'error', content: message };
}

export function skillBlock(opts: {
  id: string;
  skillName?: string;
  phase: string;
  status: BlockStatus;
  result?: string;
}): AgentBlock {
  const { id, skillName, phase, status, result } = opts;
  return {
    id,
    type: 'skill',
    status,
    // 表现归 UI 层:content 不烤展示串,全量原始结果在 metadata.result,
    // 预览(截断/前缀)由 chat 的 SkillBlock 自行派生。
    content: '',
    metadata: { skillName, phase, ...(result !== undefined ? { result } : {}) },
  };
}

/** Terminal transition for a live skill block (tool-end on load_skill, or
 * skill-end) — identical shape to the history-rebuilt completed block. */
export function completeSkillBlock(block: AgentBlock, result: string): AgentBlock {
  return {
    ...block,
    status: 'completed',
    metadata: { ...block.metadata, phase: 'completed', result },
  };
}

export function toolCallBlock(opts: {
  id: string;
  toolName: string;
  args: unknown;
  toolType?: unknown;
  status: BlockStatus;
  toolResult?: unknown;
}): AgentBlock {
  const { id, toolName, args, toolType, status, toolResult } = opts;
  return {
    id,
    type: 'tool_call',
    status,
    content: '',
    metadata: {
      toolName,
      toolArgs: JSON.stringify(args ?? {}),
      // 可选工具来源('mcp'|'builtin'|'script')——宿主装饰通道,仅透传徽章。
      ...(typeof toolType === 'string' && toolType ? { toolType } : {}),
      ...(toolResult !== undefined ? { toolResult } : {}),
    },
  };
}

export function completeToolCallBlock(block: AgentBlock, result: unknown): AgentBlock {
  return {
    ...block,
    status: 'completed',
    metadata: { ...block.metadata, toolResult: result ?? '' },
  };
}

export interface HumanInputQuestion {
  /** Optional on the history path — old archives may lack it. */
  id?: string;
  question: string;
  type: string;
  options?: string[];
}

export function humanInputBlock(opts: {
  id: string;
  requestId: string;
  questions: HumanInputQuestion[];
  context?: unknown;
  status: BlockStatus;
  response?: unknown;
}): AgentBlock {
  const { id, requestId, questions, context, status, response } = opts;
  const firstQ = questions[0];
  let inputType = 'input';
  let options: Array<{ label: string; value: string }> | undefined;
  if (firstQ && (firstQ.type === 'single-select' || firstQ.type === 'multi-select')) {
    inputType = firstQ.type;
    options = firstQ.options?.map((o) => ({ label: o, value: o }));
  }
  return {
    id,
    type: 'human_input',
    status,
    content: '',
    metadata: {
      requestId,
      inputType,
      // 无 context 时不设 title——默认文案是 chat HumanInputBlock 的 i18n
      // 兜底(原先这里烤英文默认串,把本地化遮蔽掉了)。
      ...(context !== undefined && context !== null ? { title: context } : {}),
      message: questions.map((q) => q.question).join('\n'),
      options,
      // Full question list — HumanInputBlock renders one input per question
      // when this is present (multi-question ask_human).
      questions,
      ...(response !== undefined ? { response } : {}),
    },
  };
}

export function subagentBlock(opts: {
  id: string;
  subtaskId: string;
  name: unknown;
  task: unknown;
  status: BlockStatus;
  summary?: Record<string, unknown>;
}): AgentBlock {
  const { id, subtaskId, name, task, status, summary } = opts;
  return {
    id,
    type: 'subagent',
    status,
    content: '',
    metadata: { subtaskId, name: name ?? '', task: task ?? '', ...summary },
  };
}

export function todoBlock(id: string, items: TodoItem[], status: BlockStatus): AgentBlock {
  return { id, type: 'todo', status, content: '', metadata: { items } };
}
