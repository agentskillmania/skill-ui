/**
 * File extension classification shared across editor file views
 * (FileTabs, FileTree, StatusBar).
 */

/** Document/text file extensions (rendered with a "book" icon). */
export const DOC_EXTENSIONS = ['md', 'mdx', 'txt', 'rst', 'adoc'] as const;

/** Source code file extensions (rendered with a "code" icon). */
export const CODE_EXTENSIONS = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'rb',
  'go',
  'rs',
  'java',
  'c',
  'cpp',
  'h',
  'sh',
  'bash',
  'zsh',
  'json',
  'yaml',
  'yml',
  'toml',
  'xml',
  'html',
  'css',
  'scss',
  'less',
  'sql',
] as const;

/** File extensions supported by the visual (wysiwyg) editor. */
export const VISUAL_EDITOR_EXTENSIONS = ['md', 'mdx'] as const;

/** Lowercased extension (without dot) for a file name or path, or '' if none. */
export function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/** File kind derived from its extension. */
export function getFileKind(name: string): 'doc' | 'code' | 'file' {
  const ext = getExtension(name);
  if ((DOC_EXTENSIONS as readonly string[]).includes(ext)) return 'doc';
  if ((CODE_EXTENSIONS as readonly string[]).includes(ext)) return 'code';
  return 'file';
}
