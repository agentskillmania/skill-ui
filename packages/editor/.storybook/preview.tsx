/** @jsxImportSource @emotion/react */
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig, GlobalStyles } from '@agentskillmania/skill-ui-theme';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NAMESPACE, resources } from '../src/locales/index.js';

const i18n = createInstance();
i18n.use(initReactI18next).init({
  resources,
  lng: 'zh-CN',
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
});

// expose for console access: window.__I18N__.changeLanguage('en-US')
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__I18N__ = i18n;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: lightTheme.color.bgBase },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Switch language',
      defaultValue: 'zh-CN',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'zh-CN', title: '中文' },
          { value: 'en-US', title: 'English' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale as string;
      if (i18n.language !== locale) {
        i18n.changeLanguage(locale);
      }
      return (
        <I18nextProvider i18n={i18n}>
          <ConfigProvider theme={lightAntdConfig}>
            <ThemeProvider theme={lightTheme}>
              <GlobalStyles />
              <Story />
            </ThemeProvider>
          </ConfigProvider>
        </I18nextProvider>
      );
    },
  ],
};

export default preview;
