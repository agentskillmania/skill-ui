/**
 * @agentskillmania/skill-ui-editor
 * 编辑域：编辑核心（EditorArea/CodeEditor/VisualEditor/StatusBar）+
 * 完整工作台（EditorWorkbench）。
 */

// Types
export type {
  EditMode,
  CursorPosition,
  EditorAreaProps,
  StatusBarProps,
  EditorWorkbenchProps,
} from './types.js';

// Workbench (file tree + tabs + editor area + status bar)
export { EditorWorkbench } from './project-editor/index.js';

// Editor core
export { EditorArea, CodeEditor, VisualEditor } from './editor-area/index.js';

// Sections
export { StatusBar } from './sections/status-bar/index.js';

// i18n
export { NAMESPACE, resources } from './locales/index.js';
