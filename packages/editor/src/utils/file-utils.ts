/**
 * 文件工具 — editor 私有（Monaco 语言映射、wysiwyg 支持表）。
 * 通用文件分类（FileKind/getFileKind/getFileLabel）在 shared。
 */
import { getExtension } from '@agentskillmania/skill-ui-shared';

/** File type info for the code editor */
export interface FileInfo {
  extension: string;
  language: string;
}

/** Extension → Monaco language mapping */
const EXT_LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  md: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  xml: 'xml',
  sh: 'shell',
  bash: 'shell',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  sql: 'sql',
};

/** File extensions supported by the visual (wysiwyg) editor. */
export const VISUAL_EDITOR_EXTENSIONS = ['md', 'mdx'] as const;

/** Whether the visual editor supports this file */
export function isVisualEditable(filePath: string | null): boolean {
  if (!filePath) return false;
  return (VISUAL_EDITOR_EXTENSIONS as readonly string[]).includes(getExtension(filePath));
}

/** Get file info from file path */
export function getFileInfo(filePath: string): FileInfo {
  const ext = getExtension(filePath);
  return {
    extension: ext,
    language: EXT_LANGUAGE_MAP[ext] ?? 'plaintext',
  };
}
