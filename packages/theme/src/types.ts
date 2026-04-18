/**
 * 主题类型定义
 */

/** Block 组件专用色项 */
export interface BlockColorItem {
  /** 文字色 */
  text: string;
  /** 背景色 */
  bg: string;
}

/** 主题定义 */
export interface Theme {
  /** 主题模式 */
  mode: 'light' | 'dark';
  /**
   * 基础颜色
   *
   * 包含：品牌色(primary/primaryHover/primaryActive/primaryBg)、
   * 语义色(success/warning/error/info 及对应 Bg/Border)、
   * 扩展色(green/blue/purple/orange/cyan 及对应 Bg)、
   * 背景(bgBase/bgContainer/bgElevated/bgSpotlight/bgMask)、
   * 文字(text/textSecondary/textTertiary/textQuaternary/textDisabled/textInverse)、
   * 边框(border/borderSecondary/borderHover/borderActive)、
   * 填充(fill/fillSecondary/fillTertiary/fillSubtle/fillLight)、
   * 链接(link/linkHover/linkActive)、
   * 玻璃效果(glassLight/glassLightStrong)、
   * 交互状态(hoverOverlay/activeOverlay)
   */
  color: Record<string, string>;
  /** Block 组件专用色（thinking/toolMcp/toolScript/toolBuiltin/plan 等） */
  blockColor: Record<string, BlockColorItem>;
  /** 间距 */
  spacing: Record<string, string>;
  /** 圆角 */
  radius: Record<string, string>;
  /** 阴影 */
  shadow: Record<string, string>;
  /** 模糊 */
  blur: Record<string, string>;
  /** 动效 */
  motion: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  /** 字体 */
  font: {
    family: string;
    familyMono: string;
    familyCode: string;
    weight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    size: Record<string, string>;
    lineHeight: string;
    lineHeightHeading: string;
  };
  /** 图标尺寸 */
  icon: Record<string, string>;
}
