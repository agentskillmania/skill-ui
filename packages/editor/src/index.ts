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
  ActivityBarProps,
  CopilotPanelProps,
  ReviewPanelProps,
  TestCasePanelProps,
  EditorContextValue,
} from './types.js';

// Components
export { ProjectEditor } from './components/ProjectEditor/index.js';
export { FileTree } from './components/FileTree/index.js';
export { FileTabs } from './components/FileTabs/index.js';
export { EditorArea, CodeEditor, VisualEditor } from './components/EditorArea/index.js';
export { StatusBar } from './components/StatusBar/index.js';
export { Sidebar } from './components/Sidebar/index.js';
export { ActivityBar } from './components/ActivityBar/index.js';
export { CopilotPanel } from './components/CopilotPanel/index.js';
export { ReviewPanel } from './components/ReviewPanel/index.js';

// Context
export { useEditorContext } from './context/EditorContext.js';

// Utilities
export { getFileInfo, getFileLabel } from './utils/file-utils.js';

// i18n
export { NAMESPACE, resources } from './locales/index.js';
