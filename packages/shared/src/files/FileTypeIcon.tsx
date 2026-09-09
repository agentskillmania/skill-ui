/**
 * 文件类型图标 — files 域共用（FileTree/FileTabs/宿主列表）。
 *
 * 图标映射独立于 FileKind：markdown→FileText、纯文本文档→Book、
 * code→FileCode、image→FileImage、其他→File。
 */
import { Book, File, FileCode, FileImage, FileText, type LucideIcon } from 'lucide-react';
import { createElement } from 'react';

import { getFileKind, isTextDoc } from './file-extensions.js';
import type { FileTypeIconProps } from './types.js';

function iconFor(path: string): LucideIcon {
  const kind = getFileKind(path);
  if (kind === 'markdown') return FileText;
  if (kind === 'image') return FileImage;
  if (kind === 'code') return FileCode;
  if (isTextDoc(path)) return Book;
  return File;
}

/** 按文件扩展名渲染对应图标。 */
export function FileTypeIcon({ path, size = 14 }: FileTypeIconProps) {
  return createElement(iconFor(path), { size });
}
