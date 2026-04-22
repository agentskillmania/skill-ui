/**
 * Theme type definitions
 */

/** Block component color items */
export interface BlockColorItem {
  /** Text color */
  text: string;
  /** Background color */
  bg: string;
}

/** Theme definition */
export interface Theme {
  /** Theme mode */
  mode: 'light' | 'dark';
  /**
   * Base colors
   *
   * Includes: brand colors (primary/primaryHover/primaryActive/primaryBg),
   * semantic colors (success/warning/error/info and corresponding Bg/Border),
   * extended colors (green/blue/purple/orange/cyan and corresponding Bg),
   * backgrounds (bgBase/bgContainer/bgElevated/bgSpotlight/bgMask),
   * text colors (text/textSecondary/textTertiary/textQuaternary/textDisabled/textInverse),
   * borders (border/borderSecondary/borderHover/borderActive),
   * fills (fill/fillSecondary/fillTertiary/fillSubtle/fillLight),
   * links (link/linkHover/linkActive),
   * glass effects (glassLight/glassLightStrong),
   * interaction states (hoverOverlay/activeOverlay)
   */
  color: Record<string, string>;
  /** Block component dedicated colors (thinking/toolMcp/toolScript/toolBuiltin/plan, etc.) */
  blockColor: Record<string, BlockColorItem>;
  /** Spacing */
  spacing: Record<string, string>;
  /** Border radius */
  radius: Record<string, string>;
  /** Shadows */
  shadow: Record<string, string>;
  /** Blur */
  blur: Record<string, string>;
  /** Motion */
  motion: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  /** Font */
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
  /** Icon sizes */
  icon: Record<string, string>;
}
