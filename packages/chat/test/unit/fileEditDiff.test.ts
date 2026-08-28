/**
 * FileEditBlock pure helpers: file_edit receipt parsing and unified diff row
 * building. The receipt is wrangler's text protocol — parsing must be
 * defensive (absent fields, never throws) for every guard-message variant.
 */
import { describe, it, expect } from 'vitest';

import { buildDiffRows, parseFileEditReceipt } from '../../src/blocks-redesign/file-edit.js';

// ── parseFileEditReceipt ────────────────────────────────────────────────────

describe('parseFileEditReceipt', () => {
  it('parses a single-replacement success receipt', () => {
    const receipt = [
      'Edited src/foo.rs: Successfully replaced 1 occurrence',
      'Updated region:',
      '10→const a = 1;',
      '11→const b = 2;',
    ].join('\n');
    expect(parseFileEditReceipt(receipt)).toEqual({
      occurrences: 1,
      startLine: 10,
    });
  });

  it('parses a replace_all receipt with occurrence count > 1', () => {
    const receipt = [
      'Edited src/foo.rs: Successfully replaced 3 occurrences',
      'Updated region:',
      '42→let x = 1;',
    ].join('\n');
    expect(parseFileEditReceipt(receipt)).toEqual({
      occurrences: 3,
      startLine: 42,
    });
  });

  it('treats a guard rejection as an error message (whole receipt)', () => {
    expect(parseFileEditReceipt('Error: oldString must not be empty')).toEqual({
      errorMessage: 'Error: oldString must not be empty',
    });
  });

  it('parses multi-match guard rejections without phantom fields', () => {
    const receipt =
      'Error: Found 2 matches. Set replaceAll to true to replace all.\nUpdated region:\n7→x';
    const info = parseFileEditReceipt(receipt);
    expect(info.errorMessage).toContain('Found 2 matches');
    expect(info.occurrences).toBeUndefined();
    expect(info.startLine).toBeUndefined();
  });

  it('returns empty info for empty or unexpected text', () => {
    expect(parseFileEditReceipt('')).toEqual({});
    expect(parseFileEditReceipt('totally unrelated output')).toEqual({});
  });

  it('ignores N→ prefixes that appear before the Updated region marker', () => {
    // oldString text echoing file_read style lines must not produce a startLine
    const receipt = [
      'Edited a.txt: Successfully replaced 1 occurrence',
      '1→decoy line from args',
      'Updated region:',
      '99→real first line',
    ].join('\n');
    expect(parseFileEditReceipt(receipt).startLine).toBe(99);
  });
});

// ── buildDiffRows ───────────────────────────────────────────────────────────

describe('buildDiffRows', () => {
  it('builds ctx/add/del rows with aligned line numbers', () => {
    const rows = buildDiffRows('keep\nold line\n', 'keep\nnew line\n', 10);
    expect(rows).toEqual([
      { kind: 'ctx', text: 'keep', oldLineNo: 10, newLineNo: 10 },
      { kind: 'del', text: 'old line', oldLineNo: 11 },
      { kind: 'add', text: 'new line', newLineNo: 11 },
    ]);
  });

  it('omits line numbers when startLine is unknown (edit still running)', () => {
    const rows = buildDiffRows('a\n', 'b\n');
    expect(rows).toEqual([
      { kind: 'del', text: 'a' },
      { kind: 'add', text: 'b' },
    ]);
  });

  it('renders a pure deletion (empty newString) with only del rows', () => {
    const rows = buildDiffRows('gone\n', '', 1);
    expect(rows).toEqual([{ kind: 'del', text: 'gone', oldLineNo: 1 }]);
  });

  it('renders a pure addition (empty oldString) with only add rows', () => {
    const rows = buildDiffRows('', 'fresh\n', 5);
    expect(rows).toEqual([{ kind: 'add', text: 'fresh', newLineNo: 5 }]);
  });

  it('normalizes CRLF in both inputs', () => {
    const rows = buildDiffRows('old\r\nline\r\n', 'new\r\nline\r\n', 1);
    expect(rows.map((row) => row.text)).toEqual(['old', 'new', 'line']);
  });

  it('keeps identical inputs as context rows and drops the trailing artifact', () => {
    const rows = buildDiffRows('same\nlines\n', 'same\nlines\n', 3);
    expect(rows).toEqual([
      { kind: 'ctx', text: 'same', oldLineNo: 3, newLineNo: 3 },
      { kind: 'ctx', text: 'lines', oldLineNo: 4, newLineNo: 4 },
    ]);
  });

  it('drops the trailing empty artifact for inputs without a final newline', () => {
    expect(buildDiffRows('a', 'b', 1)).toEqual([
      { kind: 'del', text: 'a', oldLineNo: 1 },
      { kind: 'add', text: 'b', newLineNo: 1 },
    ]);
  });
});
