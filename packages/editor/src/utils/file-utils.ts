/**
 * File utility functions
 */
import type { FileInfo } from '../types.js';

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

/** Get file info from file path */
export function getFileInfo(filePath: string): FileInfo {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return {
    extension: ext,
    language: EXT_LANGUAGE_MAP[ext] ?? 'plaintext',
  };
}

/** Get file display name (last path segment) */
export function getFileLabel(filePath: string): string {
  return filePath.split('/').pop() ?? filePath;
}
