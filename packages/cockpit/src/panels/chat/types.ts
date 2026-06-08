/**
 * Chat panel types
 */

import type { ChatProps } from '@agentskillmania/skill-ui-chat';

export type ChatPanelProps = Omit<ChatProps, 'className' | 'style'>;
