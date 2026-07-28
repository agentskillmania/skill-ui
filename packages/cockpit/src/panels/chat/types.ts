/**
 * Chat panel types
 */

import type { ChatProps } from '@agentskillmania/skill-ui-chat';

export interface ChatPanelProps extends Omit<ChatProps, 'className' | 'style'> {
  /** Callback for the "new session" button in the chat panel header */
  onChatNewSession?: () => void;
}
