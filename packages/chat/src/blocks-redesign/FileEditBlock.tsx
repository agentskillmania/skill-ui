/**
 * File edit tool block — renders a file_edit tool call as a unified diff.
 *
 * The diff is computed client-side from the tool args (oldString → newString),
 * so it is visible immediately while the edit is running. Line numbers and the
 * occurrence count are parsed from the success receipt and appear on
 * completion. Collapses to the header summary once the edit succeeds; stays
 * expanded while running or when a guard rejected the edit.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { FileDiff } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, FileEditMetadata } from '../types.js';
import { BlockBadge } from './BlockBadge.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';
import { buildDiffRows } from './file-edit.js';

/** Split a path into (kept-separator) directory part and emphasized basename */
function splitPath(path: string): { dir: string; base: string } {
  const sep = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return sep >= 0
    ? { dir: path.slice(0, sep + 1), base: path.slice(sep + 1) }
    : { dir: '', base: path };
}

export const FileEditBlock = memo(function FileEditBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = (block.metadata ?? {}) as FileEditMetadata;

  const isRunning = block.status === 'streaming' || block.status === 'pending';
  const failed = block.status === 'error' || meta.errorMessage !== undefined;

  const rows = useMemo(
    () =>
      meta.oldString !== undefined && meta.newString !== undefined
        ? buildDiffRows(meta.oldString, meta.newString, meta.startLine)
        : [],
    [meta.oldString, meta.newString, meta.startLine]
  );
  const added = rows.filter((row) => row.kind === 'add').length;
  const removed = rows.filter((row) => row.kind === 'del').length;
  const numbered = meta.startLine !== undefined;

  // Stay expanded while running or rejected; auto-collapse to the header
  // summary once the edit succeeds (same rule as ShellBlock).
  const { expanded, toggle } = useBlockCollapse(!isRunning && !failed);

  const { dir, base } = splitPath(meta.filePath ?? '');

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        overflow: hidden;
        transition:
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
          box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          border-color: ${theme.color.borderHover};
          box-shadow: ${theme.shadow.sm};
        }
      `}
    >
      {/* Header — click toggles collapse */}
      <div
        onClick={toggle}
        aria-expanded={expanded}
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          cursor: pointer;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            min-width: 0;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              border-radius: ${theme.radius.md};
              background: ${theme.color.fillLight};
              color: ${theme.color.textSecondary};
              flex-shrink: 0;
            `}
          >
            <FileDiff size={13} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
              flex-shrink: 0;
            `}
          >
            {t('fileEdit.title')}
          </span>
          <span
            css={css`
              font-family: ${theme.font.familyMono};
              font-size: ${theme.font.size.sm};
              min-width: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              direction: rtl;
              text-align: left;
            `}
            title={meta.filePath}
          >
            <span
              css={css`
                color: ${theme.color.textSecondary};
              `}
            >
              {dir}
            </span>
            <span
              css={css`
                color: ${theme.color.text};
              `}
            >
              {base}
            </span>
          </span>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            flex-shrink: 0;
          `}
        >
          {isRunning ? (
            <BlockBadge variant="primary" pulse>
              {t('fileEdit.running')}
            </BlockBadge>
          ) : failed ? (
            <BlockBadge variant="error">error</BlockBadge>
          ) : (
            <>
              {added > 0 && <BlockBadge variant="success">+{added}</BlockBadge>}
              {removed > 0 && <BlockBadge variant="error">-{removed}</BlockBadge>}
              {meta.occurrences !== undefined && meta.occurrences > 1 && (
                <BlockBadge variant="neutral">×{meta.occurrences}</BlockBadge>
              )}
              {meta.replaceAll && (meta.occurrences ?? 1) <= 1 && (
                <BlockBadge variant="neutral">replaceAll</BlockBadge>
              )}
            </>
          )}
          <CollapseChevron expanded={expanded} />
        </div>
      </div>

      {/* Body */}
      {expanded &&
        (failed
          ? meta.errorMessage && (
              <div
                css={css`
                  margin: ${theme.spacing[2]} ${theme.spacing[4]};
                  padding: ${theme.spacing[2]} ${theme.spacing[3]};
                  border-radius: ${theme.radius.base};
                  background: ${theme.color.errorBg};
                  color: ${theme.color.error};
                  font-family: ${theme.font.familyMono};
                  font-size: ${theme.font.size.sm};
                  line-height: ${theme.font.lineHeightRelaxed};
                  white-space: pre-wrap;
                  word-break: break-all;
                `}
              >
                {meta.errorMessage}
              </div>
            )
          : rows.length > 0 && (
              <div
                css={css`
                  max-height: 220px;
                  overflow: auto;
                  padding: ${theme.spacing[2]} 0;
                  font-family: ${theme.font.familyMono};
                  font-size: ${theme.font.size.sm};
                  line-height: ${theme.font.lineHeightRelaxed};
                `}
              >
                {rows.map((row, index) => (
                  <div
                    key={index}
                    css={css`
                      display: flex;
                      align-items: baseline;
                      background: ${row.kind === 'add'
                        ? theme.color.successBg
                        : row.kind === 'del'
                          ? theme.color.errorBg
                          : 'transparent'};
                      white-space: pre;
                    `}
                  >
                    {numbered && (
                      <span
                        css={css`
                          flex-shrink: 0;
                          min-width: 3ch;
                          padding: 0 ${theme.spacing[1]};
                          text-align: right;
                          user-select: none;
                          font-size: ${theme.font.size.xs};
                          color: ${row.kind === 'add'
                            ? theme.color.success
                            : row.kind === 'del'
                              ? theme.color.error
                              : theme.color.textTertiary};
                        `}
                      >
                        {row.kind === 'add' ? row.newLineNo : (row.oldLineNo ?? '')}
                      </span>
                    )}
                    <span
                      css={css`
                        flex-shrink: 0;
                        user-select: none;
                        color: ${row.kind === 'add'
                          ? theme.color.success
                          : row.kind === 'del'
                            ? theme.color.error
                            : theme.color.textTertiary};
                      `}
                    >
                      {row.kind === 'add' ? '+' : row.kind === 'del' ? '-' : ' '}
                    </span>
                    <span
                      css={css`
                        padding-right: ${theme.spacing[3]};
                        color: ${theme.color.text};
                      `}
                    >
                      {row.text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
    </div>
  );
});
