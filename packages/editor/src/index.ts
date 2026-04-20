/**
 * @agentskillmania/skill-ui-editor
 * Skill 编辑器组件包
 */

// 类型
export type {
  SkillFile,
  EditMode,
  SidebarPanel,
  CursorPosition,
  FileInfo,
  FileTab,
  SkillTestCase,
  TestResult,
  ReviewItem,
  ReviewResult,
  SkillEditorProps,
  FileTreeProps,
  FileTabsProps,
  EditorAreaProps,
  StatusBarProps,
  SidebarProps,
  ActivityBarProps,
  AssistantPanelProps,
  ReviewPanelProps,
  TestCasePanelProps,
  EditorContextValue,
} from './types.js';

// 组件
export { SkillEditor } from './components/SkillEditor/index.js';
export { FileTree } from './components/FileTree/index.js';
export { FileTabs } from './components/FileTabs/index.js';
export { EditorArea, CodeEditor, VisualEditor } from './components/EditorArea/index.js';
export { StatusBar } from './components/StatusBar/index.js';
export { Sidebar } from './components/Sidebar/index.js';
export { ActivityBar } from './components/ActivityBar/index.js';
export { AssistantPanel } from './components/AssistantPanel/index.js';
export { ReviewPanel } from './components/ReviewPanel/index.js';

// 上下文
export { useEditorContext } from './context/EditorContext.js';

// 工具
export { getFileInfo, getFileLabel } from './utils/file-utils.js';
