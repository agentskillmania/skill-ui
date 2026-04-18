/**
 * 业务常量（不属于主题变量，不随主题模式变化）
 */

/** 布局常量 */
export const layout = {
  titlebarHeight: '38px',
  chatInputHeight: '56px',
} as const;

/** 层级常量 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  cuiLayer: 1800,
} as const;
