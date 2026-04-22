/**
 * File tab component
 *
 * Adapted from skill-studio PanelTabs, adapted for the editor package.
 * Supports elastic shrinkage, unsaved indicator, close button.
 */
import { css } from '@emotion/react';
import { X, FileCode, Book, File } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import type { FileTabsProps, FileTab } from '../../types.js';

/** Get icon by file name */
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const docExts = ['md', 'mdx', 'txt', 'rst', 'adoc'];
  if (docExts.includes(ext ?? '')) return <Book size={12} />;
  const codeExts = [
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
  ];
  if (codeExts.includes(ext ?? '')) return <FileCode size={12} />;
  return <File size={12} />;
}

/** Single tab */
function TabItem({
  tab,
  isActive,
  onClick,
  onClose,
}: {
  tab: FileTab;
  isActive: boolean;
  onClick: (path: string) => void;
  onClose: (path: string) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-editor');

  return (
    <div
      onClick={() => onClick(tab.path)}
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[1]};
        padding: ${theme.spacing[1]} ${theme.spacing[2]};
        background: ${isActive ? theme.color.primaryBg : 'transparent'};
        border-radius: ${theme.radius.sm};
        cursor: pointer;
        transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
        flex: 1;
        min-width: 0;
        max-width: 180px;
        flex-shrink: 1;
        overflow: hidden;

        &:hover {
          background: ${theme.color.primaryBg};
          button {
            opacity: 0.6;
          }
        }
      `}
    >
      <span
        css={css`
          display: flex;
          align-items: center;
          flex-shrink: 0;
          color: ${isActive ? theme.color.primary : theme.color.textTertiary};
        `}
      >
        {getFileIcon(tab.label)}
      </span>
      <span
        css={css`
          flex: 1;
          min-width: 0;
          font-size: ${theme.font.size.sm};
          color: ${isActive ? theme.color.text : theme.color.textSecondary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}
      >
        {tab.label}
        {tab.modified && (
          <span
            css={css`
              color: ${theme.color.primary};
              margin-left: 2px;
            `}
          >
            •
          </span>
        )}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.path);
        }}
        css={css`
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: ${theme.radius.xs};
          cursor: pointer;
          color: ${theme.color.textTertiary};
          opacity: ${isActive ? 0.7 : 0};
          flex-shrink: 0;
          transition: all ${theme.motion.duration.fast};

          &:hover {
            background: ${theme.color.fill};
            color: ${theme.color.text};
            opacity: 1;
          }
        `}
        type="button"
        aria-label={t('fileTabs.close', { label: tab.label })}
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function FileTabs({ tabs, activePath, onTabChange, onTabClose }: FileTabsProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing['0.5']};
        min-width: 0;
        overflow: hidden;
        padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
        border-bottom: 1px solid ${theme.color.borderSecondary};
      `}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.path}
          tab={tab}
          isActive={tab.path === activePath}
          onClick={onTabChange}
          onClose={onTabClose}
        />
      ))}
    </div>
  );
}
