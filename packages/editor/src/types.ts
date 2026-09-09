/**
 * @agentskillmania/skill-ui-editor type definitions
 *
 * 编辑域类型。文件浏览域类型（FileNode/FileTab/...）在
 * @agentskillmania/skill-ui-shared。
 */
import type { FileNode, FileTab } from '@agentskillmania/skill-ui-shared';

/** Edit mode */
export type EditMode = 'code' | 'wysiwyg';

/** Editor cursor position */
export interface CursorPosition {
  line: number;
  column: number;
}

// ─── Component Props ───

/** EditorWorkbench top-level component props */
export interface EditorWorkbenchProps {
  // ─── File tree (structure only, no content) ───
  editorFiles: FileNode[];

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

  // ─── File operation callbacks ───
  onEditorFileChange: (path: string, content: string) => void;
  onEditorSave?: (path: string, content: string) => void;
  onEditorActiveFileChange: (path: string | null) => void;

  // ─── Style ───
  className?: string;
  style?: React.CSSProperties;
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
