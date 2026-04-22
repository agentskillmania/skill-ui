/**
 * File tree component
 */
import { css } from '@emotion/react';
import { ChevronRight, ChevronDown, FileCode, Book, FolderOpen } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useState, useCallback } from 'react';
import type { FileTreeProps, SkillFile } from '../../types.js';

/** Get file icon by extension */
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const docExts = ['md', 'mdx', 'txt', 'rst'];
  if (docExts.includes(ext)) return <Book size={14} />;
  return <FileCode size={14} />;
}

/** Single tree node */
function TreeNode({
  file,
  activeFilePath,
  depth,
  onSelect,
}: {
  file: SkillFile;
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

          &:hover {
            background: ${isActive ? theme.color.primaryBg : theme.color.fillSubtle};
          }
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
          {file.isDirectory ? <FolderOpen size={14} /> : getFileIcon(file.path)}
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
