/**
 * Responsive media query utilities
 */
import { breakpoints } from '../tokens/index.js';

/**
 * Media query utilities
 * - compact: compact mode (window width < 768px)
 * - standard: standard mode (window width ≥ 768px)
 */
export const media = {
  compact: `@media (max-width: ${breakpoints.compact})`,
  standard: `@media (min-width: ${breakpoints.compact})`,
} as const;

/**
 * Container query utilities
 */
export const container = {
  compact: `@container main-content (max-width: ${breakpoints.compact})`,
  standard: `@container main-content (min-width: ${breakpoints.compact})`,
} as const;
