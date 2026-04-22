/**
 * @agentskillmania/skill-ui-editor type definitions
 */
import type { Message, ChatCommand } from '@agentskillmania/skill-ui-chat';

/** Skill project file */
export interface SkillFile {
  /** File path (relative to project root, e.g. "SKILL.md", "src/index.ts") */
  path: string;
  /** File content */
  content: string;
  /** Whether it's a directory */
  isDirectory?: boolean;
  /** Child files (used for directories) */
  children?: SkillFile[];
}

/** Edit mode */
export type EditMode = 'code' | 'wysiwyg';

/** Sidebar panel identifier */
export type SidebarPanel = 'files' | 'assistant' | 'review' | 'test' | null;

/** Editor cursor position */
export interface CursorPosition {
  line: number;
  column: number;
}

/** File type info */
export interface FileInfo {
  /** File extension */
  extension: string;
  /** Language name (for Monaco) */
  language: string;
}

/** Test case */
export interface SkillTestCase {
  /** Case ID */
  id: string;
  /** Case name */
  name: string;
  /** Input message */
  input: string;
  /** Expected tool call sequence (optional) */
  expectedToolCalls?: string[];
  /** Expected output keywords (optional) */
  expectedKeywords?: string[];
}

/** Test result */
export interface TestResult {
  /** Case ID */
  caseId: string;
  /** Whether passed */
  passed: boolean;
  /** Actual output */
  output?: string;
  /** Failure reason */
  failureReason?: string;
  /** Execution duration (ms) */
  duration?: number;
}

/** Review result item */
export interface ReviewItem {
  /** Pass/warn/fail */
  status: 'pass' | 'warn' | 'fail';
  /** Check item name */
  label: string;
  /** Detailed description */
  detail?: string;
}

/** Review result */
export interface ReviewResult {
  /** Score 0-100 */
  score: number;
  /** Check item list */
  items: ReviewItem[];
}

// ─── Component Props ───────────────────────────────

/** File tab item */
export interface FileTab {
  /** File path (unique identifier) */
  path: string;
  /** Display name (file name) */
  label: string;
  /** Whether there are unsaved changes */
  modified?: boolean;
}

/** FileTabs component props */
export interface FileTabsProps {
  /** Tab list */
  tabs: FileTab[];
  /** Currently active file path */
  activePath: string | null;
  /** Tab switch callback */
  onTabChange: (path: string) => void;
  /** Tab close callback */
  onTabClose: (path: string) => void;
}

/** SkillEditor top-level component props */
export interface SkillEditorProps {
  /** File list */
  files: SkillFile[];
  /** Currently open file path */
  activeFilePath: string | null;
  /** Edit mode */
  editMode: EditMode;
  /** Currently expanded Sidebar panel */
  activePanel: SidebarPanel;

  // Callbacks
  onFileChange: (path: string, content: string) => void;
  onActiveFileChange: (path: string | null) => void;
  onEditModeChange: (mode: EditMode) => void;
  onPanelChange: (panel: SidebarPanel) => void;
  onSave?: (path: string, content: string) => void;

  // Assistant panel
  assistantMessages?: Message[];
  assistantStatus?: 'idle' | 'streaming' | 'error';
  assistantCommands?: ChatCommand[];
  onAssistantSend?: (content: string) => void;
  onAssistantStop?: () => void;

  // Review panel
  reviewResult?: ReviewResult;

  // Test panel
  testCases?: SkillTestCase[];
  testResults?: TestResult[];
  onRunTests?: (caseIds?: string[]) => void;
}

/** FileTree component props */
export interface FileTreeProps {
  /** File list */
  files: SkillFile[];
  /** Currently selected file path */
  activeFilePath: string | null;
  /** Select file callback */
  onSelect: (path: string) => void;
}

/** EditorArea component props */
export interface EditorAreaProps {
  /** Current file content */
  content: string;
  /** Current file path (for language detection) */
  filePath: string;
  /** Edit mode */
  mode: EditMode;
  /** Whether read-only */
  readOnly?: boolean;

  // Callbacks
  onChange: (content: string) => void;
  onSave?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
}

/** StatusBar component props */
export interface StatusBarProps {
  /** Current file path */
  filePath: string | null;
  /** Edit mode */
  editMode: EditMode;
  /** Cursor position */
  cursorPosition: CursorPosition | null;
  /** Whether there are unsaved changes */
  isDirty?: boolean;

  // Callbacks
  onEditModeChange: (mode: EditMode) => void;
}

/** Sidebar component props */
export interface SidebarProps {
  /** Currently expanded panel */
  activePanel: SidebarPanel;
  /** File list (file panel) */
  files: SkillFile[];
  /** Currently selected file */
  activeFilePath: string | null;
  /** Assistant panel */
  assistantMessages?: Message[];
  assistantStatus?: 'idle' | 'streaming' | 'error';
  assistantCommands?: ChatCommand[];
  /** Review panel */
  reviewResult?: ReviewResult;
  /** Test panel */
  testCases?: SkillTestCase[];
  testResults?: TestResult[];

  // Callbacks
  onPanelChange: (panel: SidebarPanel) => void;
  onFileSelect: (path: string | null) => void;
  onAssistantSend?: (content: string) => void;
  onAssistantStop?: () => void;
  onRunTests?: (caseIds?: string[]) => void;
}

/** ActivityBar component props */
export interface ActivityBarProps {
  /** Currently selected panel */
  activePanel: SidebarPanel;
  /** Panel switch callback */
  onPanelChange: (panel: SidebarPanel) => void;
}

/** AssistantPanel component props */
export interface AssistantPanelProps {
  messages?: Message[];
  status?: 'idle' | 'streaming' | 'error';
  commands?: ChatCommand[];
  onSend?: (content: string) => void;
  onStop?: () => void;
}

/** ReviewPanel component props */
export interface ReviewPanelProps {
  result?: ReviewResult;
}

/** TestCasePanel component props */
export interface TestCasePanelProps {
  testCases?: SkillTestCase[];
  testResults?: TestResult[];
  onRunTests?: (caseIds?: string[]) => void;
}

// ─── Context Types ───────────────────────────────

/** Editor internal context */
export interface EditorContextValue {
  /** Current edit mode */
  editMode: EditMode;
  /** Current file path */
  activeFilePath: string | null;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Cursor position */
  cursorPosition: CursorPosition | null;
  /** Switch edit mode */
  setEditMode: (mode: EditMode) => void;
  /** Update cursor position */
  setCursorPosition: (pos: CursorPosition | null) => void;
  /** Mark as dirty */
  setDirty: (dirty: boolean) => void;
}
