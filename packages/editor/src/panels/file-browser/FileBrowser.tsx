/** @jsxImportSource @emotion/react */
/**
 * FileBrowser — side-window file panel.
 *
 * 两个数据源(产物 / Workspace)共享一套受控 props:数据与内容都由宿主提供,
 * 组件本身不发请求。布局没有内部拖拽手柄 —— 边窗宽度是唯一控制变量:
 * 容器 < 560px 上下排列(列表在上,高度钳制),≥ 560px 左右排列(列表宽度
 * 钳制,余量给详情)。源切换默认内嵌;宿主传 `source` + `onSourceChange`
 * 即可把它提升到面板头(SidebarPanel headerExtra)。
 */
import { EmptyState, useToggle } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Segmented, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArtifactList } from './ArtifactList.js';
import { FileDetail } from './FileDetail.js';
import { NAMESPACE } from '../../locales/index.js';
import type { FileBrowserProps, FileBrowserSource } from '../../types.js';
import { FileTree } from '../file-tree/index.js';

/** 容器宽度断点:低于它切换为上下排列。 */
export const FILE_BROWSER_BREAKPOINT = 560;

export function FileBrowser({
  workspaceFiles,
  artifacts,
  source: sourceProp,
  onSourceChange,
  activePath,
  activeContent,
  activeUnsupported,
  onActivePathChange,
  editMode,
  onEditModeChange,
  imageSrcResolver,
  onOpenInFolder,
  className,
  style,
}: FileBrowserProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [internalSource, setInternalSource] = useState<FileBrowserSource>('artifacts');
  const listCollapsed = useToggle(false);

  const source = sourceProp ?? internalSource;
  const isSourceControlled = sourceProp !== undefined;
  const stacked = width > 0 && width < FILE_BROWSER_BREAKPOINT;

  // 容器宽度驱动布局断点(jsdom 的 ResizeObserver 由测试 setup mock)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const switchSource = useCallback(
    (next: FileBrowserSource) => {
      if (!isSourceControlled) setInternalSource(next);
      onSourceChange?.(next);
    },
    [isSourceControlled, onSourceChange]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      data-testid="file-browser-root"
      data-stacked={stacked ? 'true' : 'false'}
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        min-width: 0;
        background: ${theme.color.bgContainer};
        overflow: hidden;
      `}
    >
      {/* 工具行:源切换(非受控时内嵌) + 列表折叠 */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[2]} 0;
          flex: none;
        `}
      >
        {isSourceControlled ? null : (
          <Segmented
            size="small"
            value={source}
            onChange={(v) => switchSource(v as FileBrowserSource)}
            options={[
              { label: t('fileBrowser.sourceArtifacts'), value: 'artifacts' },
              { label: t('fileBrowser.sourceWorkspace'), value: 'workspace' },
            ]}
          />
        )}
        <span
          css={css`
            flex: 1;
          `}
        />
        <Tooltip
          title={listCollapsed.value ? t('fileBrowser.showList') : t('fileBrowser.collapseList')}
        >
          <button
            type="button"
            data-testid="list-collapse-btn"
            onClick={() => listCollapsed.toggle()}
            css={css`
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              border: none;
              border-radius: ${theme.radius.sm};
              background: transparent;
              color: ${theme.color.textTertiary};
              cursor: pointer;
              &:hover {
                background: ${theme.color.fillSubtle};
                color: ${theme.color.text};
              }
            `}
          >
            {listCollapsed.value ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </Tooltip>
      </div>

      {/* 列表 + 详情 */}
      <div
        css={css`
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: ${stacked ? 'column' : 'row'};
          padding: ${theme.spacing[2]};
          gap: ${theme.spacing[2]};
        `}
      >
        {listCollapsed.value ? null : (
          <div
            data-testid="file-list-pane"
            css={css`
              ${stacked
                ? css`
                    flex: none;
                    width: 100%;
                    height: clamp(120px, 38%, 220px);
                    border-bottom: 1px solid ${theme.color.borderSecondary};
                  `
                : css`
                    flex: none;
                    width: clamp(160px, 40%, 240px);
                    border-right: 1px solid ${theme.color.borderSecondary};
                  `}
              min-width: 0;
              overflow: auto;
            `}
          >
            {source === 'artifacts' ? (
              <ArtifactList
                artifacts={artifacts}
                activePath={activePath}
                onSelect={onActivePathChange}
              />
            ) : (
              <FileTree
                files={workspaceFiles}
                activeFilePath={activePath}
                onSelect={onActivePathChange}
              />
            )}
          </div>
        )}

        <div
          css={css`
            flex: 1;
            min-width: 0;
            min-height: 0;
          `}
        >
          {activePath ? (
            <FileDetail
              path={activePath}
              content={activeContent}
              unsupported={activeUnsupported}
              editMode={editMode}
              onEditModeChange={onEditModeChange}
              imageSrcResolver={imageSrcResolver}
              onOpenInFolder={onOpenInFolder}
            />
          ) : (
            <div
              css={css`
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              <EmptyState description={t('fileBrowser.emptySelection')} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
