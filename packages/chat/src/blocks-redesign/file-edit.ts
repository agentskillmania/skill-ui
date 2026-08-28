/**
 * Pure helpers for the FileEditBlock — receipt parsing and diff-row building.
 * The wrangler file_edit receipt is a text protocol (see ShellBlock's
 * "Exit code: N" precedent): everything here parses defensively and leaves
 * fields absent rather than throwing on unexpected shapes.
 */
import { diffLines } from 'diff';

import type { FileEditMetadata } from '../types.js';

/** Fields of FileEditMetadata that come from the tool receipt rather than the args */
export type FileEditReceiptInfo = Pick<
  FileEditMetadata,
  'occurrences' | 'startLine' | 'errorMessage'
>;

/** Marker that starts the rendered post-edit snippet in a success receipt */
const UPDATED_REGION_MARKER = 'Updated region:';

/**
 * Parse a file_edit tool receipt.
 *
 * Success shape: `Edited {path}: Successfully replaced N occurrence(s)\nUpdated region:\n42→...`
 * Failure shape: the receipt is exactly the guard message starting with "Error:".
 */
export function parseFileEditReceipt(receipt: string): FileEditReceiptInfo {
  const trimmed = receipt.trim();
  if (trimmed.startsWith('Error:')) {
    return { errorMessage: trimmed };
  }
  const info: FileEditReceiptInfo = {};
  const replaced = /Successfully replaced (\d+) occurrence/.exec(trimmed);
  if (replaced) {
    info.occurrences = Number(replaced[1]);
  }
  // Line numbers only make sense inside the updated-region section — anchor
  // the search there so stray `N→` text elsewhere can't produce a wrong start.
  const markerAt = trimmed.indexOf(UPDATED_REGION_MARKER);
  if (markerAt >= 0) {
    const start = /^(\d+)→/m.exec(trimmed.slice(markerAt + UPDATED_REGION_MARKER.length));
    if (start) {
      info.startLine = Number(start[1]);
    }
  }
  return info;
}

/** One rendered line of the unified diff */
export interface DiffRow {
  kind: 'add' | 'del' | 'ctx';
  text: string;
  /** 1-based line in the old content (del/ctx rows), present only when numbered */
  oldLineNo?: number;
  /** 1-based line in the new content (add/ctx rows), present only when numbered */
  newLineNo?: number;
}

/** Normalize CRLF / lone CR to LF — file_edit may operate on CRLF files */
function normalizeEol(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r(?!\n)/g, '\n');
}

/**
 * Build unified diff rows from the replaced text pair.
 *
 * `startLine` is the 1-based line where the change begins (parsed from the
 * receipt, new-content coordinates). Everything before the change is
 * unchanged, so old and new line numbers start from the same value; rows are
 * numbered only when `startLine` is known (it arrives with the receipt).
 */
export function buildDiffRows(oldString: string, newString: string, startLine?: number): DiffRow[] {
  const parts = diffLines(normalizeEol(oldString), normalizeEol(newString));
  const rows: DiffRow[] = [];
  let oldNo = startLine ?? 1;
  let newNo = startLine ?? 1;
  const numbered = startLine !== undefined;
  for (const part of parts) {
    // diffLines keeps each line's trailing "\n"; a trailing newline produces
    // one final empty artifact line — drop it.
    const lines = part.value.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    for (const text of lines) {
      const kind: DiffRow['kind'] = part.added ? 'add' : part.removed ? 'del' : 'ctx';
      const row: DiffRow = { kind, text };
      if (numbered) {
        if (kind !== 'add') row.oldLineNo = oldNo++;
        if (kind !== 'del') row.newLineNo = newNo++;
      }
      rows.push(row);
    }
  }
  return rows;
}
