/** @jsxImportSource @emotion/react */
/**
 * 文件树组件 — 文件浏览域通用件（文件树 + 目录展开 + 单选）。
 */
import { useTheme, interactiveItem } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileTypeIcon } from './FileTypeIcon.js';
import type { FileNode, FileTreeProps } from './types.js';
import { EmptyState } from '../components/EmptyState.js';
import { NAMESPACE } from '../locales/index.js';

/** Single tree node */
function TreeNode({
  file,
  activeFilePath,
  depth,
  onSelect,
}: {
  file: FileNode;
  activeFilePath: string | null;
  depth: number;
  onSelect: (path: string) => void;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const isActive = file.path === activeFilePath;

  const handleClick = useCallback(() => {
    if (file.isDirectory) {
      setExpanded((prev) => !prev);
    } else {
      onSelect(file.path);
    }
  }, [file, onSelect]);

  return (
    <div>
      <div
        onClick={handleClick}
        data-active={isActive ? 'true' : undefined}
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[1]};
          padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
          padding-left: ${theme.spacing[1 + depth * 2]};
          cursor: pointer;
          border-radius: ${theme.radius.xs};
          background: ${isActive ? theme.color.primaryBg : 'transparent'};
          color: ${isActive ? theme.color.primary : theme.color.text};
          font-size: ${theme.font.size.sm};
          transition: background ${theme.motion.duration.fast};
          ${interactiveItem(theme, isActive ? theme.color.primaryBg : theme.color.fillSubtle)}
        `}
      >
        {file.isDirectory && (
          <span
            css={css`
              display: flex;
              color: ${theme.color.textTertiary};
            `}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <span
          css={css`
            display: flex;
            color: ${theme.color.textTertiary};
          `}
        >
          {file.isDirectory ? (
            <FolderOpen size={14} />
          ) : (
            <FileTypeIcon path={file.path} size={14} />
          )}
        </span>
        <span
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {file.path.split('/').pop()}
        </span>
      </div>
      {file.isDirectory && expanded && file.children && (
        <div>
          {file.children.map((child) => (
            <TreeNode
              key={child.path}
              file={child}
              activeFilePath={activeFilePath}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, activeFilePath, onSelect }: FileTreeProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  if (!files || files.length === 0) {
    return <EmptyState description={t('fileTree.emptyHint')} />;
  }

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        padding: ${theme.spacing[1]} 0;
      `}
    >
      {files.map((file) => (
        <TreeNode
          key={file.path}
          file={file}
          activeFilePath={activeFilePath}
          depth={0}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
