/**
 * 文件工具函数
 */
import type { FileInfo } from '../types.js';

/** 扩展名 → Monaco 语言映射 */
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

/** 根据文件路径获取文件信息 */
export function getFileInfo(filePath: string): FileInfo {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return {
    extension: ext,
    language: EXT_LANGUAGE_MAP[ext] ?? 'plaintext',
  };
}

/** 获取文件显示名（最后一段路径） */
export function getFileLabel(filePath: string): string {
  return filePath.split('/').pop() ?? filePath;
}
