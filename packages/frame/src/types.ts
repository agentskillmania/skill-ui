/**
 * @agentskillmania/skill-ui-frame type definitions
 */
import type { ReactNode } from 'react';

/** AppFrame component props */
export interface AppFrameProps {
  /** Main content area (Portal slot) */
  children: ReactNode;

  // Titlebar slots
  /** App name */
  title?: string;
  /** App icon */
  icon?: ReactNode;
  /** Titlebar center area (for WorkspaceSelector, etc.) */
  titlebarCenter?: ReactNode;
  /** Titlebar right area (for Toolbar, etc.) */
  titlebarEnd?: ReactNode;

  // Window controls
  /** Whether maximized */
  isMaximized?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Minimize callback */
  onMinimize?: () => void;
  /** Maximize/restore callback */
  onMaximize?: () => void;
}

/** Titlebar component props */
export interface TitlebarProps {
  /** Left brand name */
  title?: string;
  /** Left brand icon */
  icon?: ReactNode;
  /** Center area (workspace selector, etc.) */
  center?: ReactNode;
  /** Right toolbar area */
  end?: ReactNode;

  // Window controls
  /** Whether maximized */
  isMaximized?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Minimize callback */
  onMinimize?: () => void;
  /** Maximize/restore callback */
  onMaximize?: () => void;
}

/** TrafficLights component props */
export interface TrafficLightsProps {
  /** Close callback */
  onClose?: () => void;
  /** Minimize callback */
  onMinimize?: () => void;
  /** Maximize/restore callback */
  onMaximize?: () => void;
  /** Whether maximized */
  isMaximized?: boolean;
}

/** AppBrand component props */
export interface AppBrandProps {
  /** App name (space-separated, first word in default text color, second in primary) */
  title?: string;
  /** Custom icon */
  icon?: ReactNode;
}

/** Workspace card data */
export interface WorkspaceCard {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Last opened time (ISO format) */
  lastOpened?: string;
  /** Custom icon */
  icon?: ReactNode;
}

/** Workspace launcher layout mode */
export type WorkspaceLayoutMode = 'list' | 'mondrian';

/** WorkspaceLauncher component props */
export interface WorkspaceLauncherProps {
  /** Workspace card list */
  workspaces: WorkspaceCard[];
  /** Select callback */
  onSelect: (id: string) => void;
  /** Create callback */
  onCreate?: () => void;
  /** Layout mode, defaults to 'list' */
  layoutMode?: WorkspaceLayoutMode;
}
