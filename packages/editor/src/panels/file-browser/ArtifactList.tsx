/** @jsxImportSource @emotion/react */
/**
 * Artifact list — files created/modified during the session.
 *
 * 数据是 `deriveArtifacts` 的纯输出(受控),这里只负责展示:类型图标 +
 * 文件名 + 新建/修改徽章。徽章等元信息 FileTree 渲染不了,故独立成列表。
 */
import { EmptyState } from '@agentskillmania/skill-ui-shared';
import { useTheme, interactiveRow, textTruncate } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Book, FileCode, File as FileIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { ArtifactListProps } from '../../types.js';
import { getFileKind } from '../../utils/file-extensions.js';
import { getFileLabel } from '../../utils/file-utils.js';

const KIND_ICON = { doc: Book, code: FileCode, file: FileIcon } as const;

export const ArtifactList = memo(function ArtifactList({
  artifacts,
  activePath,
  onSelect,
}: ArtifactListProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  if (artifacts.length === 0) {
    return <EmptyState description={t('fileBrowser.emptyArtifacts')} compact />;
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[0.5]};
      `}
      role="list"
    >
      {artifacts.map((art) => {
        const Icon = KIND_ICON[getFileKind(art.path)];
        const isActive = art.path === activePath;
        const isNew = art.status === 'created';
        return (
          <div
            key={art.path}
            role="listitem"
            data-active={isActive}
            data-testid="artifact-item"
            onClick={() => onSelect(art.path)}
            css={css`
              ${interactiveRow(theme, { active: isActive })}
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              padding: ${theme.spacing[1]} ${theme.spacing[2]};
              border-radius: ${theme.radius.sm};
              cursor: pointer;
            `}
          >
            <Icon size={14} />
            <span css={textTruncate(theme)}>{getFileLabel(art.path)}</span>
            <span
              data-testid="artifact-status"
              css={css`
                margin-left: auto;
                flex: none;
                font-size: ${theme.font.size.xs};
                color: ${isNew ? theme.color.primary : theme.color.textTertiary};
                border: 1px solid ${isNew ? theme.color.primaryBg : theme.color.border};
                background: ${isNew ? theme.color.primaryBg : 'transparent'};
                border-radius: ${theme.radius.xs};
                padding: 0 ${theme.spacing[1]};
                line-height: 16px;
              `}
            >
              {t(`fileBrowser.${art.status}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
});
