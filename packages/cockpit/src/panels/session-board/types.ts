/**
 * Session board panel types
 */

import type { SessionBoardData } from '../../types.js';

export interface SessionBoardPanelProps {
  /** Strict daemon agent-diagnostics payload. */
  state?: SessionBoardData;
}
