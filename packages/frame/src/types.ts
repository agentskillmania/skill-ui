/**
 * @agentskillmania/skill-ui-frame type definitions
 */
import type { ReactNode } from 'react';

/** AppFrame component props */
export interface AppFrameProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  titlebarCenter?: ReactNode;
  titlebarEnd?: ReactNode;
  isMaximized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

/** Titlebar component props */
export interface TitlebarProps {
  title?: string;
  icon?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  isMaximized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  platform?: 'macos' | 'windows';
}

/** TrafficLights / WindowControls shared props */
export interface TrafficLightsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

/** AppBrand component props */
export interface AppBrandProps {
  title?: string;
  icon?: ReactNode;
}
