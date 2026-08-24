/**
 * Daemon file API adapters (wrangler-daemon `GET /api/files/:sessionId/*`).
 *
 * daemon `build_file_tree` 的节点是 `{path, name, isDirectory, children}`,
 * 根节点 `path` 为 `"."`;`ProjectFile` 只需要 `path / isDirectory / children`,
 * 直接映射即可。
 */
import type { ProjectFile } from '../types.js';

/** Node shape returned by the daemon tree endpoint. */
export interface DaemonTreeNode {
  /** Workspace-relative path; the root node uses `"."`. */
  path: string;
  /** Entry base name. */
  name: string;
  /** Whether this node is a directory. */
  isDirectory?: boolean;
  /** Child nodes (directories only). */
  children?: DaemonTreeNode[];
}

/** Maps a daemon tree response (the root node) to the `FileTree` input shape. */
export function daemonTreeToProjectFiles(root: DaemonTreeNode): ProjectFile[] {
  return (root.children ?? []).map(toProjectFile);
}

function toProjectFile(node: DaemonTreeNode): ProjectFile {
  return node.isDirectory
    ? {
        path: node.path,
        isDirectory: true,
        children: (node.children ?? []).map(toProjectFile),
      }
    : { path: node.path };
}
