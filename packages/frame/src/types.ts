/**
 * @agentskillmania/skill-ui-frame 类型定义
 */
import type { ReactNode } from 'react';

/** AppFrame 组件属性 */
export interface AppFrameProps {
  /** 主内容区（Portal 插槽） */
  children: ReactNode;

  // Titlebar 插槽
  /** 应用名称 */
  title?: string;
  /** 应用图标 */
  icon?: ReactNode;
  /** Titlebar 中间区域（放 WorkspaceSelector 等） */
  titlebarCenter?: ReactNode;
  /** Titlebar 右侧区域（放 Toolbar 等） */
  titlebarEnd?: ReactNode;

  // 窗口控制
  /** 是否最大化 */
  isMaximized?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 最大化/还原回调 */
  onMaximize?: () => void;
}

/** Titlebar 组件属性 */
export interface TitlebarProps {
  /** 左侧品牌名称 */
  title?: string;
  /** 左侧品牌图标 */
  icon?: ReactNode;
  /** 中间区域（workspace 选择器等） */
  center?: ReactNode;
  /** 右侧工具区域 */
  end?: ReactNode;

  // 窗口控制
  /** 是否最大化 */
  isMaximized?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 最大化/还原回调 */
  onMaximize?: () => void;
}

/** TrafficLights 组件属性 */
export interface TrafficLightsProps {
  /** 关闭回调 */
  onClose?: () => void;
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 最大化/还原回调 */
  onMaximize?: () => void;
  /** 是否最大化状态 */
  isMaximized?: boolean;
}

/** AppBrand 组件属性 */
export interface AppBrandProps {
  /** 应用名称（空格分隔，第一个单词黑色，第二个单词主色） */
  title?: string;
  /** 自定义图标 */
  icon?: ReactNode;
}

/** Workspace 卡片数据 */
export interface WorkspaceCard {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 最后打开时间（ISO 格式） */
  lastOpened?: string;
  /** 自定义图标 */
  icon?: ReactNode;
}

/** WorkspaceLauncher 组件属性 */
export interface WorkspaceLauncherProps {
  /** Workspace 卡片列表 */
  workspaces: WorkspaceCard[];
  /** 选择回调 */
  onSelect: (id: string) => void;
  /** 新建回调 */
  onCreate?: () => void;
}
