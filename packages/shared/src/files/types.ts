/**
 * @agentskillmania/skill-ui-shared — files 域类型定义
 *
 * 文件浏览（树/页签/预览）的通用契约，无 editor/gmemo 领域词汇。
 */

/** 文件树节点（通用文件系统形状）。 */
export interface FileNode {
  /** File path (relative to the workspace root, e.g. "README.md", "src/index.ts") */
  path: string;
  /** File content (optional — tree API typically doesn't return content) */
  content?: string;
  /** Whether it's a directory */
  isDirectory?: boolean;
  /** Child files (used for directories) */
  children?: FileNode[];
}

/** 文件页签条目。 */
export interface FileTab {
  path: string;
  label: string;
  modified?: boolean;
}

export interface FileTreeProps {
  files: FileNode[];
  activeFilePath: string | null;
  onSelect: (path: string) => void;
}

export interface FileTabsProps {
  tabs: FileTab[];
  activePath: string | null;
  onTabChange: (path: string) => void;
  onTabClose: (path: string) => void;
}

export interface FileTypeIconProps {
  /** File name or path — classification is derived from its extension */
  path: string;
  /** Icon size in pixels (default 14) */
  size?: number;
}

export interface FilePreviewProps {
  /** File path — preview routing is derived from its extension */
  path: string;
  /** Text content to preview */
  content: string;
  /** Optional CSS class / style passthrough */
  className?: string;
  style?: React.CSSProperties;
}
