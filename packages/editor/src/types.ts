/**
 * @agentskillmania/skill-ui-editor type definitions
 */
import type { Message, ChatCommand } from '@agentskillmania/skill-ui-chat';

/** Project file */
export interface ProjectFile {
  /** File path (relative to project root, e.g. "README.md", "src/index.ts") */
  path: string;
  /** File content (optional — tree API typically doesn't return content) */
  content?: string;
  /** Whether it's a directory */
  isDirectory?: boolean;
  /** Child files (used for directories) */
  children?: ProjectFile[];
}

/** Edit mode */
export type EditMode = 'code' | 'wysiwyg';

/** Editor sidebar panel identifier */
export type EditorPanel = 'files' | 'copilot' | 'review' | 'test' | null;

/** Editor cursor position */
export interface CursorPosition {
  line: number;
  column: number;
}

/** File type info */
export interface FileInfo {
  extension: string;
  language: string;
}

// ─── Review ───

/** Review item severity */
export type ReviewSeverity = 'error' | 'warning' | 'info';

/** Review item source */
export type ReviewSource = 'lint' | 'agent';

/** Single review item in the log stream */
export interface ReviewItem {
  id: string;
  source: ReviewSource;
  severity: ReviewSeverity;
  filePath?: string;
  message: string;
  detail?: string;
  timestamp: number;
}

// ─── Test Case ───

/** Test case status */
export type TestCaseStatus = 'idle' | 'running' | 'passed' | 'failed';

/** Single test case */
export interface TestCase {
  id: string;
  name: string;
  status: TestCaseStatus;
  duration?: number;
  error?: string;
  output?: string;
}

// ─── Component Props ───

/** File tab item */
export interface FileTab {
  path: string;
  label: string;
  modified?: boolean;
}

export interface FileTabsProps {
  tabs: FileTab[];
  activePath: string | null;
  onTabChange: (path: string) => void;
  onTabClose: (path: string) => void;
}

/** ProjectEditor top-level component props */
export interface ProjectEditorProps {
  // ─── File tree (structure only, no content) ───
  editorFiles: ProjectFile[];

  // ─── Current file ───
  editorActiveFilePath: string | null;
  editorActiveFileContent: string;

  // ─── Tab state (controlled) ───
  editorOpenTabs: FileTab[];
  onEditorOpenTabsChange: (tabs: FileTab[]) => void;

  // ─── Dirty state (controlled) ───
  editorDirtyFilePaths?: string[];
  onEditorDirtyChange?: (paths: string[]) => void;

  // ─── Cursor position (optional controlled) ───
  editorCursorPosition?: CursorPosition | null;
  onEditorCursorChange?: (pos: CursorPosition | null) => void;

  // ─── Edit mode ───
  editorEditMode: EditMode;
  onEditorEditModeChange: (mode: EditMode) => void;

  // ─── Sidebar panel ───
  editorActivePanel: EditorPanel;
  onEditorPanelChange: (panel: EditorPanel) => void;

  // ─── File operation callbacks ───
  onEditorFileChange: (path: string, content: string) => void;
  onEditorSave?: (path: string, content: string) => void;
  onEditorActiveFileChange: (path: string | null) => void;

  // ─── Copilot ───
  copilotMessages?: Message[];
  copilotStatus?: 'idle' | 'streaming' | 'error';
  copilotCommands?: ChatCommand[];
  copilotInputValue?: string;
  onCopilotInputChange?: (value: string) => void;
  onCopilotSend?: (content: string) => void;
  onCopilotStop?: () => void;

  // ─── Review ───
  reviewItems?: ReviewItem[];

  // ─── Test ───
  testCases?: TestCase[];
  onTestRunAll?: () => void;
  onTestRunCase?: (id: string) => void;

  // ─── Style ───
  className?: string;
  style?: React.CSSProperties;
}

export interface FileTreeProps {
  files: ProjectFile[];
  activeFilePath: string | null;
  onSelect: (path: string) => void;
}

export interface EditorAreaProps {
  content: string;
  filePath: string;
  mode: EditMode;
  readOnly?: boolean;
  onChange: (content: string) => void;
  onSave?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
}

export interface StatusBarProps {
  filePath: string | null;
  editMode: EditMode;
  cursorPosition: CursorPosition | null;
  isDirty?: boolean;
  onEditModeChange: (mode: EditMode) => void;
}

export interface CopilotPanelProps {
  messages?: Message[];
  status?: 'idle' | 'streaming' | 'error';
  commands?: ChatCommand[];
  /** Controlled input value for ChatInput */
  inputValue?: string;
  /** Callback when input value changes */
  onInputChange?: (value: string) => void;
  onSend?: (content: string) => void;
  onStop?: () => void;
}

export interface ReviewPanelProps {
  items?: ReviewItem[];
}

export interface TestCasePanelProps {
  cases?: TestCase[];
  onRunAll?: () => void;
  onRunCase?: (id: string) => void;
}

// ─── Context Types ───

export interface EditorContextValue {
  editMode: EditMode;
  activeFilePath: string | null;
  isDirty: boolean;
  cursorPosition: CursorPosition | null;
  setEditMode: (mode: EditMode) => void;
  setCursorPosition: (pos: CursorPosition | null) => void;
  setDirty: (dirty: boolean) => void;
}
