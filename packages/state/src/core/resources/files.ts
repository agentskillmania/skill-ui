export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

/** Find a node by path in a file tree. Returns undefined if not found. */
export function findFileNode(tree: FileNode[], path: string): FileNode | undefined {
  for (const node of tree) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileNode(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

/** Toggle a directory's expanded state. Returns a new Set (immutable). */
export function toggleDirExpanded(expanded: Set<string>, path: string): Set<string> {
  const next = new Set(expanded);
  if (next.has(path)) {
    next.delete(path);
  } else {
    next.add(path);
  }
  return next;
}

/** Flatten a file tree into a list of file paths (directories excluded). */
export function flattenTree(tree: FileNode[]): string[] {
  const paths: string[] = [];
  for (const node of tree) {
    if (node.type === 'file') {
      paths.push(node.path);
    }
    if (node.children) {
      paths.push(...flattenTree(node.children));
    }
  }
  return paths;
}
