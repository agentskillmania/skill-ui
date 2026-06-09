import zhCN from './zh-CN.js';
import enUS from './en-US.js';

/** i18n namespace for shared package components. */
export const NAMESPACE = 'skill-ui-shared';

/** i18n resource bundle for all supported locales. */
export const resources = {
  'zh-CN': { [NAMESPACE]: zhCN },
  'en-US': { [NAMESPACE]: enUS },
} as const;
