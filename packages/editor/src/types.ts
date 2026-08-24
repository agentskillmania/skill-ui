/**
 * @agentskillmania/skill-ui-editor type definitions
 */
import type { Message, ChatCommand } from '@agentskillmania/skill-ui-chat';
import type { CSSProperties } from 'react';

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
  style?: CSSProperties;
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

// ─── File Browser (side window) ───

/** List source of the side-window file browser. */
export type FileBrowserSource = 'artifacts' | 'workspace';

/** Tool call as persisted in the session message history (camelCase wire shape). */
export interface FileBrowserToolCall {
  /** Tool name, e.g. "file_write" | "file_edit" */
  name: string;
  /** Tool arguments as a live JSON object (paths live under `filePath`). */
  arguments?: Record<string, unknown>;
}

/**
 * Minimal message shape consumed by [`deriveArtifacts`] — a subset of what
 * `GET /api/chat/:sessionId/messages` returns, so callers can feed the raw
 * response without mapping.
 */
export interface FileBrowserMessage {
  /** Message role; only assistant messages carry `toolCalls`. */
  role?: string;
  /** Tool calls issued by this (assistant) message. */
  toolCalls?: FileBrowserToolCall[];
}

/** A file touched by `file_write` / `file_edit` during the session. */
export interface ArtifactEntry {
  /** Workspace-relative path. */
  path: string;
  /** `created` on first touch, `modified` once touched again. */
  status: 'created' | 'modified';
  /** Index of the message that last touched the file (higher = newer). */
  lastTouch: number;
  /** Tools that touched the path, in first-seen order. */
  ops: string[];
}

export interface FileBrowserProps {
  /** Workspace tree (map the daemon tree response via `daemonTreeToProjectFiles`). */
  workspaceFiles: ProjectFile[];
  /** Artifact list (output of `deriveArtifacts`). */
  artifacts: ArtifactEntry[];
  /** Active list source. Controlled; when omitted the browser renders its own switcher. */
  source?: FileBrowserSource;
  /**
   * Fired on source switch. Pair with `source` to lift the switcher into the
   * host panel header (SidebarPanel `headerExtra`).
   */
  onSourceChange?: (source: FileBrowserSource) => void;
  /** Selected workspace-relative path, null = nothing selected. */
  activePath: string | null;
  /** Content of the active file; undefined while loading. */
  activeContent?: string;
  /** True when the content endpoint failed (e.g. binary file). */
  activeUnsupported?: boolean;
  onActivePathChange: (path: string | null) => void;
  /** Editor mode for the text preview (toggleable via StatusBar). Defaults to 'code'. */
  editMode?: EditMode;
  onEditModeChange?: (mode: EditMode) => void;
  /** Resolves an image path to a previewable URL; absence degrades to a placeholder. */
  imageSrcResolver?: (path: string) => string | undefined;
  /** Host "reveal in folder" action; the button is hidden when omitted. */
  onOpenInFolder?: (path: string) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ArtifactListProps {
  /** Derived artifact entries, newest touch first. */
  artifacts: ArtifactEntry[];
  /** Currently selected workspace-relative path. */
  activePath: string | null;
  /** Fired when an entry is clicked. */
  onSelect: (path: string) => void;
}

export interface FileDetailProps {
  /** Selected workspace-relative path. */
  path: string;
  /** File text content; undefined while loading. */
  content?: string;
  /** True when the content endpoint failed (e.g. binary file). */
  unsupported?: boolean;
  /** Editor mode for text preview (StatusBar toggles it). */
  editMode?: EditMode;
  onEditModeChange?: (mode: EditMode) => void;
  /** Resolves an image path to a previewable URL; absence degrades to placeholder. */
  imageSrcResolver?: (path: string) => string | undefined;
  /** Host "reveal in folder" action; button hidden when omitted. */
  onOpenInFolder?: (path: string) => void;
}
