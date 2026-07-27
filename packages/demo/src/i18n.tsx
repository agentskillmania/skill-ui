/**
 * i18n setup — merges resources from every consumed skill-ui package.
 *
 * Each UI package exports its own NAMESPACE + resources; the consumer
 * (this demo) is responsible for bundling them into one i18next instance.
 * Packages do NOT self-register.
 */
import { createInstance, type i18n as I18nInstance } from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import type { ReactNode } from 'react';

import {
  NAMESPACE as chatNS,
  resources as chatResources,
} from '@agentskillmania/skill-ui-chat';
import {
  NAMESPACE as cockpitNS,
  resources as cockpitResources,
} from '@agentskillmania/skill-ui-cockpit';
import {
  NAMESPACE as editorNS,
  resources as editorResources,
} from '@agentskillmania/skill-ui-editor';
import {
  NAMESPACE as frameNS,
  resources as frameResources,
} from '@agentskillmania/skill-ui-frame';
import {
  NAMESPACE as sharedNS,
  resources as sharedResources,
} from '@agentskillmania/skill-ui-shared';

const ALL_NAMESPACES = [chatNS, cockpitNS, editorNS, frameNS, sharedNS];

/** Merge every package's resources into one i18next resources object */
const mergedResources = {
  'zh-CN': {
    [chatNS]: chatResources['zh-CN'][chatNS],
    [cockpitNS]: cockpitResources['zh-CN'][cockpitNS],
    [editorNS]: editorResources['zh-CN'][editorNS],
    [frameNS]: frameResources['zh-CN'][frameNS],
    [sharedNS]: sharedResources['zh-CN'][sharedNS],
  },
  'en-US': {
    [chatNS]: chatResources['en-US'][chatNS],
    [cockpitNS]: cockpitResources['en-US'][cockpitNS],
    [editorNS]: editorResources['en-US'][editorNS],
    [frameNS]: frameResources['en-US'][frameNS],
    [sharedNS]: sharedResources['en-US'][sharedNS],
  },
} as const;

/** Configured i18next instance (singleton) */
export const i18n: I18nInstance = createInstance();
i18n.use(initReactI18next).init({
  resources: mergedResources,
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  ns: ALL_NAMESPACES,
  defaultNS: cockpitNS,
  interpolation: { escapeValue: false },
});

/**
 * Provider wrapper — wraps the app with the configured i18next instance.
 * Usage: <I18nProvider><App /></I18nProvider>
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
