/**
 * Business constants (not part of theme variables, do not change with theme mode)
 */

/** Layout constants */
export const layout = {
  titlebarHeight: '38px',
  chatInputHeight: '56px',
} as const;

/** Z-index constants */
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
