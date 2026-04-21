/** @jsxImportSource @emotion/react */
/**
 * MondrianLayout 组件
 * 蒙德里安装饰画风格布局 — 粗黑线 + 大面积留白 + 少量大胆纯色色块
 *
 * 设计原则（参考蒙德里安原作）：
 * 1. 粗黑网格线是画面骨架，5px 实线
 * 2. ~80% 白色/中性块，~20% 纯色块（红蓝黄为主）
 * 3. 色块用纯色实底，不是半透明
 * 4. 尺寸极度不均：巨块 / 方块 / 窄条 混排
 * 5. 整体镶嵌成正方形
 */
import { useMemo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { formatRelativeTime } from './time.js';
import type { WorkspaceCard as WorkspaceCardData } from '../../types.js';

/** 网格列数 */
const COLUMNS = 6;

/** 行高循环模式（矮-中-高，制造错落） */
const ROW_PATTERN = ['55px', '85px', '115px'];

/** 网格间距（蒙德里安粗黑线） */
const GAP = '5px';

/**
 * 色块调色板 — 纯色实底 + 对比文字色
 * 蒙德里安经典：红、蓝、黄 + 少量现代扩展
 */
const PALETTE = [
  { bg: '#dc2626', text: '#ffffff' }, // 红
  { bg: '#2563eb', text: '#ffffff' }, // 蓝
  { bg: '#eab308', text: '#1a1a1a' }, // 黄（深色文字）
  { bg: '#16a34a', text: '#ffffff' }, // 绿
  { bg: '#8b5cf6', text: '#ffffff' }, // 紫
] as const;

/** 基于 id 的确定性哈希 */
function hashId(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** 根据 id 确定网格跨度 — 极端不均 */
function getSpan(id: string): { col: number; row: number } {
  const h = hashId(id) % 100;
  if (h < 22) return { col: 1, row: 1 }; // 22% 小块
  if (h < 38) return { col: 2, row: 1 }; // 16% 宽条
  if (h < 50) return { col: 1, row: 2 }; // 12% 高条
  if (h < 62) return { col: 2, row: 2 }; // 12% 方块
  if (h < 74) return { col: 3, row: 1 }; // 12% 长条
  if (h < 82) return { col: 1, row: 3 }; // 8%  窄高条
  if (h < 88) return { col: 2, row: 3 }; // 6%  高块
  if (h < 94) return { col: 3, row: 2 }; // 6%  大块
  return { col: 3, row: 3 }; // 6%  巨块
}

/** 根据 id 确定色块颜色，返回 null 表示白色/中性 */
function getColor(id: string): (typeof PALETTE)[number] | null {
  const h = hashId(id);
  // ~20% 着色（蒙德里安大部分是白底）
  if (((h >> 16) & 0xff) % 100 < 20) {
    return PALETTE[((h >> 8) & 0xff) % PALETTE.length];
  }
  return null;
}

/** 计算需要多少行 */
function computeRows(items: { col: number; row: number }[]): number {
  let totalCells = 0;
  for (const item of items) {
    totalCells += item.col * item.row;
  }
  const minRows = Math.ceil(totalCells / COLUMNS);
  return Math.max(Math.ceil(COLUMNS * 0.8), minRows);
}

interface MondrianLayoutProps {
  workspaces: WorkspaceCardData[];
  onSelect: (id: string) => void;
}

export function MondrianLayout({ workspaces, onSelect }: MondrianLayoutProps) {
  const theme = useTheme();

  const spans = useMemo(() => workspaces.map((ws) => getSpan(ws.id)), [workspaces]);
  const rowCount = useMemo(() => computeRows(spans), [spans]);

  const rowTemplate = useMemo(() => {
    const rows: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push(ROW_PATTERN[i % ROW_PATTERN.length]);
    }
    return rows.join(' ');
  }, [rowCount]);

  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(${COLUMNS}, 1fr);
        grid-template-rows: ${rowTemplate};
        grid-auto-flow: dense;
        gap: ${GAP};
        /* 粗黑线 = 容器背景 */
        background: ${theme.color.text};
        padding: ${GAP};
        border-radius: ${theme.radius.lg};
        overflow: hidden;
        width: 100%;
        max-width: 600px;
        aspect-ratio: 1 / 1;
      `}
    >
      {workspaces.map((ws) => (
        <MondrianBlock key={ws.id} workspace={ws} onSelect={onSelect} />
      ))}
    </div>
  );
}

function MondrianBlock({
  workspace,
  onSelect,
}: {
  workspace: WorkspaceCardData;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  const span = useMemo(() => getSpan(workspace.id), [workspace.id]);
  const color = useMemo(() => getColor(workspace.id), [workspace.id]);

  const isLarge = span.col >= 3 || span.row >= 3;
  const isWide = span.col >= 2;
  const isTall = span.row >= 2;

  const bg = color?.bg ?? theme.color.bgContainer;
  const textColor = color?.text ?? theme.color.text;
  const mutedColor = color?.text ?? theme.color.textTertiary;
  const faintColor = color?.text ?? theme.color.textQuaternary;

  return (
    <button
      css={css`
        grid-column: span ${span.col};
        grid-row: span ${span.row};
        background: ${bg};
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: ${isTall ? 'flex-start' : 'center'};
        padding: ${theme.spacing['3']};
        text-align: left;
        transition: filter ${theme.motion.duration.fast};
        overflow: hidden;

        &:hover {
          filter: brightness(0.92);
        }
        &:active {
          filter: brightness(0.85);
        }
      `}
      onClick={() => onSelect(workspace.id)}
      type="button"
      aria-label={`打开 ${workspace.name}`}
    >
      {/* 图标 */}
      {workspace.icon && (
        <div
          css={css`
            color: ${textColor};
            margin-bottom: ${theme.spacing['1']};
            flex-shrink: 0;
            opacity: 0.9;
          `}
        >
          {workspace.icon}
        </div>
      )}

      {/* 名称 */}
      <div
        css={css`
          font-weight: 600;
          color: ${textColor};
          font-size: ${isLarge
            ? theme.font.size.xl
            : isWide
              ? theme.font.size.lg
              : theme.font.size.base};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          line-height: 1.3;
        `}
      >
        {workspace.name}
      </div>

      {/* 描述：宽/大块显示 */}
      {(isWide || isLarge) && workspace.description && (
        <div
          css={css`
            font-size: ${theme.font.size.xs};
            color: ${mutedColor};
            margin-top: ${theme.spacing['0.5']};
            opacity: 0.85;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          `}
        >
          {workspace.description}
        </div>
      )}

      {/* 时间：高/大块显示 */}
      {(isTall || isLarge) && workspace.lastOpened && (
        <div
          css={css`
            font-size: ${theme.font.size.xs};
            color: ${faintColor};
            opacity: 0.75;
            margin-top: auto;
          `}
        >
          {formatRelativeTime(workspace.lastOpened)}
        </div>
      )}
    </button>
  );
}
