/**
 * chat locale resources
 */
import enUS from './en-US.json' with { type: 'json' };
import zhCN from './zh-CN.json' with { type: 'json' };

/** i18n namespace for chat package */
export const NAMESPACE = 'skill-ui-chat';

/** consumer register to i18next when use */
export const resources = {
  'zh-CN': { [NAMESPACE]: zhCN },
  'en-US': { [NAMESPACE]: enUS },
} as const;
