/** @jsxImportSource @emotion/react */
/**
 * MondrianLayout component
 * Mondrian decorative painting style layout — thick black lines + large white space + a few bold solid color blocks
 *
 * Design principles (referencing Mondrian's original works):
 * 1. Thick black grid lines are the skeleton of the composition, 5px solid lines
 * 2. ~80% white/neutral blocks, ~20% solid color blocks (mainly red, blue, yellow)
 * 3. Color blocks use solid opaque backgrounds, not semi-transparent
 * 4. Extremely uneven sizes: giant blocks / squares / narrow strips mixed
 * 5. Overall composition forms a square
 */
import { useMemo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from './time.js';
import type { WorkspaceCard as WorkspaceCardData } from '../../types.js';

/** Number of grid columns */
const COLUMNS = 6;

/** Row height cycle pattern (short-medium-tall, creating staggered rhythm) */
const ROW_PATTERN = ['55px', '85px', '115px'];

/** Grid gap (Mondrian thick black lines) */
const GAP = '5px';

/**
 * Color block palette — solid opaque background + contrasting text color
 * Mondrian classics: red, blue, yellow + a few modern extensions
 */
const PALETTE = [
  { bg: '#dc2626', text: '#ffffff' }, // Red
  { bg: '#2563eb', text: '#ffffff' }, // Blue
  { bg: '#eab308', text: '#1a1a1a' }, // Yellow (dark text)
  { bg: '#16a34a', text: '#ffffff' }, // Green
  { bg: '#8b5cf6', text: '#ffffff' }, // Purple
] as const;

/** Deterministic hash based on id */
function hashId(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Determine grid span based on id — extremely uneven */
function getSpan(id: string): { col: number; row: number } {
  const h = hashId(id) % 100;
  if (h < 22) return { col: 1, row: 1 }; // 22% small block
  if (h < 38) return { col: 2, row: 1 }; // 16% wide strip
  if (h < 50) return { col: 1, row: 2 }; // 12% tall strip
  if (h < 62) return { col: 2, row: 2 }; // 12% square
  if (h < 74) return { col: 3, row: 1 }; // 12% long strip
  if (h < 82) return { col: 1, row: 3 }; // 8%  narrow tall strip
  if (h < 88) return { col: 2, row: 3 }; // 6%  tall block
  if (h < 94) return { col: 3, row: 2 }; // 6%  large block
  return { col: 3, row: 3 }; // 6%  giant block
}

/** Determine color block color based on id, returns null for white/neutral */
function getColor(id: string): (typeof PALETTE)[number] | null {
  const h = hashId(id);
  // ~20% colored (Mondrian is mostly white background)
  if (((h >> 16) & 0xff) % 100 < 20) {
    return PALETTE[((h >> 8) & 0xff) % PALETTE.length];
  }
  return null;
}

/** Calculate how many rows are needed */
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
        /* Thick black lines = container background */
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
  const { t } = useTranslation('skill-ui-frame');
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
      aria-label={t('launcher.open', { name: workspace.name })}
    >
      {/* Icon */}
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

      {/* Name */}
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

      {/* Description: shown in wide/large blocks */}
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

      {/* Time: shown in tall/large blocks */}
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
