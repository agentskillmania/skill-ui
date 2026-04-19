/**
 * Chat UI 组件类型定义
 */
import type { ComponentType, ReactNode, CSSProperties } from 'react';

// ---- 基础枚举 ----

/** 消息状态 */
export type MessageStatus = 'streaming' | 'completed' | 'error';

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/** 执行块状态 */
export type BlockStatus = 'streaming' | 'completed' | 'error' | 'pending';

/** 人机交互类型 */
export type HumanInputType = 'confirmation' | 'input' | 'single-select' | 'multi-select';

// ---- 核心数据模型 ----

/** 消息 */
export interface Message {
  /** 唯一标识 */
  id: string;
  /** 发送者角色 */
  role: MessageRole;
  /** 文本内容（Markdown） */
  content: string;
  /** 执行块列表（assistant 消息） */
  blocks?: Block[];
  /** 消息状态 */
  status: MessageStatus;
  /** 创建时间戳 */
  createdAt?: number;
}

/** 执行块 */
export interface Block {
  /** 唯一标识 */
  id: string;
  /** 块类型 */
  type: string;
  /** 块状态 */
  status: BlockStatus;
  /** 文本内容 */
  content: string;
  /** 附加元数据 */
  metadata?: Record<string, unknown>;
}

// ---- 元数据约定结构 ----

/** 工具调用元数据 */
export interface ToolCallMetadata {
  toolName?: string;
  toolType?: 'mcp' | 'script' | 'builtin';
  toolArgs?: string;
  toolResult?: string;
}

/** 计划步骤 */
export interface PlanStep {
  content: string;
  status: 'completed' | 'running' | 'pending' | 'error' | 'skipped';
}

/** 计划元数据 */
export interface PlanMetadata {
  steps?: PlanStep[];
}

/** 人机交互元数据 */
export interface HumanInputMetadata {
  requestId?: string;
  inputType?: HumanInputType;
  title?: string;
  message?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

/** 错误元数据 */
export interface ErrorMetadata {
  errorCode?: string;
}

/** 技能块元数据 */
export interface SkillBlockMetadata {
  /** 技能名称 */
  skillName?: string;
  /** 技能执行阶段 */
  phase?: 'loading' | 'loaded' | 'executing' | 'completed';
  /** 执行任务描述 */
  task?: string;
  /** 技能文档 token 数量 */
  tokenCount?: number;
  /** 执行结果摘要 */
  result?: string;
}

// ---- 指令系统 ----

/** 指令 */
export interface ChatCommand {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 触发指令（不含 `/`，如 "search" 表示 /search） */
  command: string;
  /** 指令描述（下拉菜单中显示） */
  description?: string;
  /** 指令图标 */
  icon?: ReactNode;
  /** 分组名称（下拉菜单中按组展示） */
  group?: string;
  /** 搜索关键词（用于模糊匹配，补充 label 和 command 之外的别名） */
  keywords?: string[];
}

// ---- 组件 Props ----

/** 消息渲染组件 props */
export interface MessageProps {
  message: Message;
  children?: ReactNode;
}

/** 执行块渲染组件 props */
export interface BlockProps {
  block: Block;
  onConfirm?: (requestId: string, response: unknown) => void;
}

// ---- 渲染器注册表 ----

/** 自定义渲染器注册表 */
export interface ChatRenderers {
  /** 按消息角色注册自定义渲染器（可覆盖内置、可扩展新 role） */
  messages?: Record<string, ComponentType<MessageProps>>;
  /** 按块类型注册自定义渲染器（可覆盖内置、可扩展新 type） */
  blocks?: Record<string, ComponentType<BlockProps>>;
}

// ---- 顶层组件 Props ----

/** Chat 组件 Props */
export interface ChatProps {
  /** 消息列表 */
  messages: Message[];

  // 消息交互
  /** 发送消息回调 */
  onSendMessage?: (content: string) => void;
  /** 停止生成回调 */
  onStop?: () => void;
  /** 人机交互确认回调 */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;

  // 受控输入
  /** 输入框内容（受控模式） */
  inputValue?: string;
  /** 输入框内容变化回调 */
  onInputChange?: (value: string) => void;

  // 状态
  /** Chat 整体状态 */
  status?: 'idle' | 'streaming' | 'error';
  /** 是否禁用输入 */
  disabled?: boolean;

  // 扩展性
  /** 自定义渲染器注册表 */
  renderers?: ChatRenderers;
  /** 输入框前缀内容 */
  inputPrefix?: ReactNode;
  /** 输入框后缀内容 */
  inputSuffix?: ReactNode;
  /** 消息装饰器（在消息前后加内容，如时间戳、操作按钮） */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;

  // 布局
  /** 内容区最大宽度 */
  maxWidth?: string;
  /** 输入框占位文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;

  // 指令系统
  /** 指令列表 */
  commands?: ChatCommand[];
  /** 选择指令回调（快捷指令 + 自动补全统一出口） */
  onCommand?: (command: ChatCommand) => void;
  /** 快捷指令最多显示几个（默认 5） */
  maxQuickCommands?: number;
  /** 斜杠触发字符（默认 "/"） */
  commandTrigger?: string;
}
