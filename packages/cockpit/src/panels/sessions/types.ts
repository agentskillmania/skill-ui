/**
 * Sessions panel types
 */

import type { SessionInfo } from '../../types.js';

export interface SessionsPanelProps {
  sessions: SessionInfo[];
  activeSessionId?: string;
  onSelect?: (sessionId: string) => void;
}
