/**
 * @agentskillmania/skill-ui-editor
 * Project editor component package
 */

// Types
export type {
  ProjectFile,
  EditMode,
  SidebarPanel,
  CursorPosition,
  FileInfo,
  FileTab,
  ReviewSeverity,
  ReviewSource,
  ReviewItem,
  TestCaseStatus,
  TestCase,
  ProjectEditorProps,
  FileTreeProps,
  FileTabsProps,
  EditorAreaProps,
  StatusBarProps,
  SidebarProps,
  CopilotPanelProps,
  ReviewPanelProps,
  TestCasePanelProps,
  EditorContextValue,
} from './types.js';

// Layout
export { ProjectEditor } from './project-editor/index.js';

// Editor area
export { EditorArea, CodeEditor, VisualEditor } from './editor-area/index.js';

// Sections
export { FileTabs } from './sections/file-tabs/index.js';
export { StatusBar } from './sections/status-bar/index.js';

// Sidebar
export { Sidebar } from './sidebar/index.js';

// Panels
export { FileTree } from './panels/file-tree/index.js';
export { CopilotPanel } from './panels/copilot/index.js';
export { ReviewPanel } from './panels/review/index.js';

// Context
export { useEditorContext } from './context/EditorContext.js';

// Utilities
export { getFileInfo, getFileLabel } from './shared/file-utils.js';

// i18n
export { NAMESPACE, resources } from './locales/index.js';
