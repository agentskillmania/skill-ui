/**
 * @fileoverview i18n resources for settings components.
 *
 * @module
 */

import zhCN from './zh-CN.js';
import enUS from './en-US.js';

/** i18n namespace for settings package components. */
export const NAMESPACE = 'skill-ui-settings';

/** i18n resource bundle for all supported locales. */
export const resources = {
  'zh-CN': { [NAMESPACE]: zhCN },
  'en-US': { [NAMESPACE]: enUS },
} as const;
