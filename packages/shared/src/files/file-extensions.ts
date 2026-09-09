/**
 * 文件扩展名分类 — files 域共用（FileTree/FileTabs/FileTypeIcon/FilePreview）。
 *
 * 分类按行为差异定义，无装饰类：
 * - `code`     — 代码文本（可高亮语义）
 * - `markdown` — 文本但需渲染为 HTML
 * - `image`    — 二进制图片
 * - `file`     — 其余兜底（普通文本/未知）
 *
 * DOC_EXTENSIONS（txt/rst/adoc 等）不构成 FileKind，只用于 FileTypeIcon
 * 的图标细分（Book 图标），与行为无关。
 */

/** 代码文本扩展名（FileCode 图标；编辑器可语法高亮）。 */
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

/** Markdown 扩展名（需渲染为 HTML 的文本）。 */
export const MARKDOWN_EXTENSIONS = ['md', 'mdx'] as const;

/** 纯文本文档扩展名（仅图标细分为 Book，行为与普通文本一致）。 */
export const DOC_EXTENSIONS = ['txt', 'rst', 'adoc'] as const;

/** 图片扩展名（二进制，图片预览）。 */
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'] as const;

/** 行为分类。 */
export type FileKind = 'code' | 'markdown' | 'image' | 'file';

/** Lowercased extension (without dot) for a file name or path, or '' if none. */
export function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/** 由扩展名推导行为分类。 */
export function getFileKind(name: string): FileKind {
  const ext = getExtension(name);
  if ((MARKDOWN_EXTENSIONS as readonly string[]).includes(ext)) return 'markdown';
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return 'image';
  if ((CODE_EXTENSIONS as readonly string[]).includes(ext)) return 'code';
  return 'file';
}

/** 纯文本文档判定（仅图标细分用；不是 FileKind）。 */
export function isTextDoc(name: string): boolean {
  return (DOC_EXTENSIONS as readonly string[]).includes(getExtension(name));
}

/** 文件显示名（路径最后一段）。 */
export function getFileLabel(filePath: string): string {
  return filePath.split('/').pop() ?? filePath;
}
