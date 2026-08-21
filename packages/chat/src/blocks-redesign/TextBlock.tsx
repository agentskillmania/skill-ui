/**
 * Text block — a plain assistant prose segment rendered inline as markdown.
 *
 * Text is a block like any other so it keeps its chronological position
 * among thinking/tool/skill blocks. Unlike the other blocks it has no card
 * chrome: no header, no collapse, no border — it IS the message text, just
 * positioned in-order instead of appended after all blocks.
 */
import { memo } from 'react';

import { MarkdownRenderer } from '../content/MarkdownRenderer.js';
import type { BlockProps } from '../types.js';

export const TextBlock = memo(function TextBlock({ block }: BlockProps) {
  // Producers never emit empty text blocks; guard anyway so a malformed
  // state renders nothing rather than an empty gap.
  if (!block.content) return null;
  return (
    <MarkdownRenderer streaming={block.status === 'streaming'}>{block.content}</MarkdownRenderer>
  );
});
