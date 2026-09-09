/**
 * @agentskillmania/skill-ui-shared — 通用基础层
 *
 * 按"面"组织，每个成员都有 ≥2 个宿主/领域包的真实消费者：
 *
 * - **files**：文件浏览域（FileTree / FileTabs / FilePreview / FileTypeIcon +
 *   FileKind/getFileKind/getFileLabel + FileNode/FileTab 类型）——编辑器工作台
 *   与 gmemo 边窗共用。
 * - **display**：EmptyState —— FileTree/FilePreview/EditorWorkbench 共用的空态。
 * - **utils**：formatTokens / formatDuration —— chat 与 editor 共用的格式化契约。
 */

// ─── files ──────────────────────────────────────────────────
export { FileTree } from './files/FileTree.js';
export { FileTabs } from './files/FileTabs.js';
export { FileTypeIcon } from './files/FileTypeIcon.js';
export { FilePreview } from './files/FilePreview.js';
export {
  getFileKind,
  getFileLabel,
  getExtension,
  CODE_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  IMAGE_EXTENSIONS,
  type FileKind,
} from './files/file-extensions.js';
export type {
  FileNode,
  FileTab,
  FileTreeProps,
  FileTabsProps,
  FileTypeIconProps,
  FilePreviewProps,
} from './files/types.js';

// ─── display ────────────────────────────────────────────────
export { EmptyState } from './components/EmptyState.js';
export type { EmptyStateProps } from './components/EmptyState.js';

// ─── utils ──────────────────────────────────────────────────
export { formatTokens, formatDuration } from './utils/format.js';

// ─── locales ────────────────────────────────────────────────
export { NAMESPACE, resources } from './locales/index.js';
