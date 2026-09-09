/**
 * Internal context channel for markdown rendering config.
 *
 * `ChatProps.markdownConfig` is broadcast once at the Chat root and consumed
 * by MarkdownRenderer — the component tree in between (MessageList →
 * MessageItem → BlocksRenderer → TextBlock) never sees it. The public
 * contract is `ChatMarkdownConfig` (types.ts); this module stays internal.
 */
import { createContext, useContext } from 'react';

import type { ChatMarkdownConfig } from '../types.js';

/** Module-level empty config: a stable reference, so an unconfigured Chat
 * never causes context-driven re-renders downstream. */
export const EMPTY_MARKDOWN_CONFIG: ChatMarkdownConfig = {};

export const MarkdownConfigContext = createContext<ChatMarkdownConfig>(EMPTY_MARKDOWN_CONFIG);

export function useMarkdownConfig(): ChatMarkdownConfig {
  return useContext(MarkdownConfigContext);
}
