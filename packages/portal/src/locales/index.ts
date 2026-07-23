import enUS from './en-US.json' with { type: 'json' };
import zhCN from './zh-CN.json' with { type: 'json' };

export const NAMESPACE = 'skill-ui-portal';

export const resources = {
  'zh-CN': { [NAMESPACE]: zhCN.portal },
  'en-US': { [NAMESPACE]: enUS.portal },
};
