/** @jsxImportSource @emotion/react */
/**
 * File detail — preview pane shared by both file browser sources.
 *
 * 文本/代码/Markdown 走 editor 自带的 EditorArea(只读,md 可经 StatusBar 切
 * wysiwyg);图片走 antd Image(URL 由 `imageSrcResolver` 提供,未注入时降级
 * 为占位 + 打开所在目录);二进制等不可读文件显示不支持提示。
 */
import { CopyValue, EmptyState } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Image, Spin, Tooltip } from 'antd';
import { Copy, ExternalLink, FolderOpen, ImageOff } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorArea } from '../../editor-area/index.js';
import { NAMESPACE } from '../../locales/index.js';
import { StatusBar } from '../../sections/status-bar/index.js';
import type { FileDetailProps } from '../../types.js';
import { isImageName } from '../../utils/file-extensions.js';
import { getFileInfo, getFileLabel } from '../../utils/file-utils.js';

export const FileDetail = memo(function FileDetail({
  path,
  content,
  unsupported,
  editMode = 'code',
  onEditModeChange,
  imageSrcResolver,
  onOpenInFolder,
}: FileDetailProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const isImage = isImageName(path);
  const imageSrc = useMemo(
    () => (isImage ? imageSrcResolver?.(path) : undefined),
    [isImage, imageSrcResolver, path]
  );

  const iconBtn = css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing[1]};
    height: 24px;
    padding: 0 ${theme.spacing[2]};
    border: 1px solid ${theme.color.border};
    border-radius: ${theme.radius.sm};
    background: ${theme.color.fillSubtle};
    color: ${theme.color.textSecondary};
    font-size: ${theme.font.size.xs};
    cursor: pointer;
    flex: none;
    &:hover {
      color: ${theme.color.text};
      border-color: ${theme.color.borderSecondary};
    }
  `;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        min-width: 0;
        overflow: hidden;
      `}
    >
      {/* 标题行:文件名 + 类型 + 动作 */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[3]} 0;
          flex-wrap: wrap;
          row-gap: ${theme.spacing[1]};
        `}
      >
        <span
          css={css`
            font-size: ${theme.font.size.sm};
            font-weight: ${theme.font.weight.semibold};
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
          `}
        >
          {getFileLabel(path)}
        </span>
        <span
          css={css`
            flex: none;
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textTertiary};
            border: 1px solid ${theme.color.border};
            border-radius: ${theme.radius.xs};
            padding: 0 ${theme.spacing[1]};
            line-height: 15px;
            text-transform: uppercase;
          `}
        >
          {getFileInfo(path).language}
        </span>
        <span
          css={css`
            margin-left: auto;
            display: flex;
            gap: ${theme.spacing[1]};
          `}
        >
          {onOpenInFolder ? (
            <Tooltip title={t('fileBrowser.openInFolder')}>
              <button
                type="button"
                aria-label={t('fileBrowser.openInFolder')}
                css={iconBtn}
                onClick={() => onOpenInFolder(path)}
              >
                <FolderOpen size={12} />
              </button>
            </Tooltip>
          ) : null}
          {imageSrc ? (
            <Tooltip title={t('fileBrowser.openExternal')}>
              <button
                type="button"
                aria-label={t('fileBrowser.openExternal')}
                css={iconBtn}
                onClick={() => window.open(imageSrc, '_blank')}
              >
                <ExternalLink size={12} />
              </button>
            </Tooltip>
          ) : null}
          <Tooltip title={t('fileBrowser.copyPath')}>
            <CopyValue text={path}>
              <span css={iconBtn}>
                <Copy size={12} />
              </span>
            </CopyValue>
          </Tooltip>
        </span>
      </div>

      {/* 路径条 */}
      <div
        css={css`
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
        `}
      >
        <CopyValue text={path}>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[1]};
              background: ${theme.color.fillSubtle};
              border: 1px solid ${theme.color.borderSecondary};
              border-radius: ${theme.radius.sm};
              padding: 2px ${theme.spacing[2]};
              font-family: ${theme.font.familyMono};
              font-size: ${theme.font.size.xs};
              color: ${theme.color.textTertiary};
              cursor: pointer;
              overflow: hidden;
            `}
          >
            <Copy size={11} />
            <span
              css={css`
                direction: rtl;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
              `}
            >
              {path}
            </span>
          </div>
        </CopyValue>
      </div>

      {/* 内容区 */}
      <div
        css={css`
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        `}
        data-testid="file-detail-body"
      >
        {renderBody()}
      </div>
    </div>
  );

  function renderBody() {
    if (isImage) {
      if (imageSrc) {
        return (
          <div
            css={css`
              flex: 1;
              min-height: 0;
              overflow: auto;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: ${theme.spacing[2]};
              background: ${theme.color.bgLayout};
            `}
          >
            <Image src={imageSrc} alt={getFileLabel(path)} />
          </div>
        );
      }
      return (
        <EmptyState
          icon={<ImageOff size={28} />}
          description={t('fileBrowser.imageNoChannel')}
          action={
            onOpenInFolder ? (
              <button type="button" css={iconBtn} onClick={() => onOpenInFolder(path)}>
                <FolderOpen size={12} />
                {t('fileBrowser.openInFolder')}
              </button>
            ) : undefined
          }
        />
      );
    }
    if (unsupported) {
      return (
        <EmptyState icon={<ImageOff size={28} />} description={t('fileBrowser.unsupported')} />
      );
    }
    if (content === undefined) {
      return (
        <div
          css={css`
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <Spin size="small" />
        </div>
      );
    }
    return (
      <>
        <div
          css={css`
            flex: 1;
            min-height: 0;
            overflow: hidden;
          `}
        >
          <EditorArea
            content={content}
            filePath={path}
            mode={editMode}
            readOnly
            onChange={() => {}}
          />
        </div>
        <StatusBar
          filePath={path}
          editMode={editMode}
          cursorPosition={null}
          onEditModeChange={(m) => onEditModeChange?.(m)}
        />
      </>
    );
  }
});
