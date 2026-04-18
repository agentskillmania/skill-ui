/**
 * 响应式媒体查询工具
 */
import { breakpoints } from '../tokens/index.js';

/**
 * 媒体查询工具
 * - compact: 紧凑模式（窗口宽度 < 768px）
 * - standard: 标准模式（窗口宽度 ≥ 768px）
 */
export const media = {
  compact: `@media (max-width: ${breakpoints.compact})`,
  standard: `@media (min-width: ${breakpoints.compact})`,
} as const;

/**
 * 容器查询工具
 */
export const container = {
  compact: `@container main-content (max-width: ${breakpoints.compact})`,
  standard: `@container main-content (min-width: ${breakpoints.compact})`,
} as const;
