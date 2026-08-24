/**
 * @agentskillmania/skill-ui-editor
 * Project editor component package
 */

// Types
export type {
  ProjectFile,
  EditMode,
  EditorPanel,
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
  CopilotPanelProps,
  ReviewPanelProps,
  TestCasePanelProps,
  EditorContextValue,
  FileBrowserSource,
  FileBrowserToolCall,
  FileBrowserMessage,
  ArtifactEntry,
  FileBrowserProps,
  ArtifactListProps,
  FileDetailProps,
} from './types.js';

// Layout
export { ProjectEditor } from './project-editor/index.js';

// Editor area
export { EditorArea, CodeEditor, VisualEditor } from './editor-area/index.js';

// Sections
export { FileTabs } from './sections/file-tabs/index.js';
export { StatusBar } from './sections/status-bar/index.js';

// Panels
export { FileTree } from './panels/file-tree/index.js';
export { CopilotPanel } from './panels/copilot/index.js';
export { ReviewPanel } from './panels/review/index.js';
export {
  FileBrowser,
  FILE_BROWSER_BREAKPOINT,
  ArtifactList,
  FileDetail,
} from './panels/file-browser/index.js';

// Context
export { useEditorContext } from './context/EditorContext.js';

// Utilities
export { getFileInfo, getFileLabel } from './utils/file-utils.js';
export { deriveArtifacts } from './utils/artifacts.js';
export { daemonTreeToProjectFiles } from './utils/daemon-files.js';
export type { DaemonTreeNode } from './utils/daemon-files.js';
export { IMAGE_EXTENSIONS, isImageName } from './utils/file-extensions.js';

// i18n
export { NAMESPACE, resources } from './locales/index.js';
