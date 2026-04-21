/**
 * @agentskillmania/skill-ui-editor 类型定义
 */
import type { Message, ChatCommand } from '@agentskillmania/skill-ui-chat';

/** 技能项目文件 */
export interface SkillFile {
  /** 文件路径（相对项目根，如 "SKILL.md"、"src/index.ts"） */
  path: string;
  /** 文件内容 */
  content: string;
  /** 是否为目录 */
  isDirectory?: boolean;
  /** 子文件（目录时使用） */
  children?: SkillFile[];
}

/** 编辑模式 */
export type EditMode = 'code' | 'wysiwyg';

/** Sidebar 面板标识 */
export type SidebarPanel = 'files' | 'assistant' | 'review' | 'test' | null;

/** 编辑器光标位置 */
export interface CursorPosition {
  line: number;
  column: number;
}

/** 文件类型信息 */
export interface FileInfo {
  /** 文件扩展名 */
  extension: string;
  /** 语言名称（用于 Monaco） */
  language: string;
}

/** 测试用例 */
export interface SkillTestCase {
  /** 用例 ID */
  id: string;
  /** 用例名称 */
  name: string;
  /** 输入消息 */
  input: string;
  /** 期望的工具调用序列（可选） */
  expectedToolCalls?: string[];
  /** 期望输出关键词（可选） */
  expectedKeywords?: string[];
}

/** 测试结果 */
export interface TestResult {
  /** 用例 ID */
  caseId: string;
  /** 是否通过 */
  passed: boolean;
  /** 实际输出 */
  output?: string;
  /** 失败原因 */
  failureReason?: string;
  /** 执行耗时（ms） */
  duration?: number;
}

/** 审核结果项 */
export interface ReviewItem {
  /** 通过/警告/失败 */
  status: 'pass' | 'warn' | 'fail';
  /** 检查项名称 */
  label: string;
  /** 详细说明 */
  detail?: string;
}

/** 审核结果 */
export interface ReviewResult {
  /** 评分 0-100 */
  score: number;
  /** 检查项列表 */
  items: ReviewItem[];
}

// ─── 组件 Props ───────────────────────────────

/** 文件标签项 */
export interface FileTab {
  /** 文件路径（唯一标识） */
  path: string;
  /** 显示名称（文件名） */
  label: string;
  /** 是否有未保存修改 */
  modified?: boolean;
}

/** FileTabs 组件 Props */
export interface FileTabsProps {
  /** 标签页列表 */
  tabs: FileTab[];
  /** 当前激活的文件路径 */
  activePath: string | null;
  /** 标签切换回调 */
  onTabChange: (path: string) => void;
  /** 标签关闭回调 */
  onTabClose: (path: string) => void;
}

/** SkillEditor 顶层组件 Props */
export interface SkillEditorProps {
  /** 文件列表 */
  files: SkillFile[];
  /** 当前打开的文件路径 */
  activeFilePath: string | null;
  /** 编辑模式 */
  editMode: EditMode;
  /** 当前展开的 Sidebar 面板 */
  activePanel: SidebarPanel;

  // 回调
  onFileChange: (path: string, content: string) => void;
  onActiveFileChange: (path: string | null) => void;
  onEditModeChange: (mode: EditMode) => void;
  onPanelChange: (panel: SidebarPanel) => void;
  onSave?: (path: string, content: string) => void;

  // 助手面板
  assistantMessages?: Message[];
  assistantStatus?: 'idle' | 'streaming' | 'error';
  assistantCommands?: ChatCommand[];
  onAssistantSend?: (content: string) => void;
  onAssistantStop?: () => void;

  // 审核面板
  reviewResult?: ReviewResult;

  // 测试面板
  testCases?: SkillTestCase[];
  testResults?: TestResult[];
  onRunTests?: (caseIds?: string[]) => void;
}

/** FileTree 组件 Props */
export interface FileTreeProps {
  /** 文件列表 */
  files: SkillFile[];
  /** 当前选中文件路径 */
  activeFilePath: string | null;
  /** 选中文件回调 */
  onSelect: (path: string) => void;
}

/** EditorArea 组件 Props */
export interface EditorAreaProps {
  /** 当前文件内容 */
  content: string;
  /** 当前文件路径（用于判断语言） */
  filePath: string;
  /** 编辑模式 */
  mode: EditMode;
  /** 是否只读 */
  readOnly?: boolean;

  // 回调
  onChange: (content: string) => void;
  onSave?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
}

/** StatusBar 组件 Props */
export interface StatusBarProps {
  /** 当前文件路径 */
  filePath: string | null;
  /** 编辑模式 */
  editMode: EditMode;
  /** 光标位置 */
  cursorPosition: CursorPosition | null;
  /** 是否有未保存的修改 */
  isDirty?: boolean;

  // 回调
  onEditModeChange: (mode: EditMode) => void;
}

/** Sidebar 组件 Props */
export interface SidebarProps {
  /** 当前展开的面板 */
  activePanel: SidebarPanel;
  /** 文件列表（文件面板） */
  files: SkillFile[];
  /** 当前选中文件 */
  activeFilePath: string | null;
  /** 助手面板 */
  assistantMessages?: Message[];
  assistantStatus?: 'idle' | 'streaming' | 'error';
  assistantCommands?: ChatCommand[];
  /** 审核面板 */
  reviewResult?: ReviewResult;
  /** 测试面板 */
  testCases?: SkillTestCase[];
  testResults?: TestResult[];

  // 回调
  onPanelChange: (panel: SidebarPanel) => void;
  onFileSelect: (path: string | null) => void;
  onAssistantSend?: (content: string) => void;
  onAssistantStop?: () => void;
  onRunTests?: (caseIds?: string[]) => void;
}

/** ActivityBar 组件 Props */
export interface ActivityBarProps {
  /** 当前选中的面板 */
  activePanel: SidebarPanel;
  /** 面板切换回调 */
  onPanelChange: (panel: SidebarPanel) => void;
}

/** AssistantPanel 组件 Props */
export interface AssistantPanelProps {
  messages?: Message[];
  status?: 'idle' | 'streaming' | 'error';
  commands?: ChatCommand[];
  onSend?: (content: string) => void;
  onStop?: () => void;
}

/** ReviewPanel 组件 Props */
export interface ReviewPanelProps {
  result?: ReviewResult;
}

/** TestCasePanel 组件 Props */
export interface TestCasePanelProps {
  testCases?: SkillTestCase[];
  testResults?: TestResult[];
  onRunTests?: (caseIds?: string[]) => void;
}

// ─── 上下文类型 ───────────────────────────────

/** 编辑器内部上下文 */
export interface EditorContextValue {
  /** 当前编辑模式 */
  editMode: EditMode;
  /** 当前文件路径 */
  activeFilePath: string | null;
  /** 是否有未保存修改 */
  isDirty: boolean;
  /** 光标位置 */
  cursorPosition: CursorPosition | null;
  /** 切换编辑模式 */
  setEditMode: (mode: EditMode) => void;
  /** 更新光标位置 */
  setCursorPosition: (pos: CursorPosition | null) => void;
  /** 标记为脏 */
  setDirty: (dirty: boolean) => void;
}
