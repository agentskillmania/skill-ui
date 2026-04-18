import { useState, type ReactNode } from 'react';
import { css } from '@emotion/react';
import { useTheme, getTheme, type Theme } from '../src/index';
import { ColorTokens } from './sections/ColorTokens';
import { BlockColors } from './sections/BlockColors';
import { Typography } from './sections/Typography';
import { Spacing } from './sections/Spacing';
import { Effects } from './sections/Effects';
import { AntdShowcase } from './sections/AntdShowcase';
import { AntdXShowcase } from './sections/AntdXShowcase';

export function App() {
  const theme = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const currentTheme = getTheme(mode);

  return (
    <ThemeProviderOverride theme={currentTheme} mode={mode}>
      <div
        css={css`
          min-height: 100vh;
          background: ${currentTheme.color.bgBase};
          color: ${currentTheme.color.text};
          padding: ${currentTheme.spacing[6]};
          font-family: ${currentTheme.font.family};
          transition:
            background 0.3s,
            color 0.3s;
        `}
      >
        {/* 顶部切换栏 */}
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: ${currentTheme.spacing[8]};
            padding-bottom: ${currentTheme.spacing[4]};
            border-bottom: 1px solid ${currentTheme.color.border};
          `}
        >
          <h1
            css={css`
              font-size: ${currentTheme.font.size['2xl']};
              font-weight: ${currentTheme.font.weight.bold};
            `}
          >
            @agentskillmania/skill-ui-theme
          </h1>
          <button
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            css={css`
              padding: ${currentTheme.spacing[2]} ${currentTheme.spacing[4]};
              border-radius: ${currentTheme.radius.md};
              border: 1px solid ${currentTheme.color.border};
              background: ${currentTheme.color.bgContainer};
              color: ${currentTheme.color.text};
              cursor: pointer;
              font-size: ${currentTheme.font.size.base};
              font-weight: ${currentTheme.font.weight.medium};
              transition: all 0.2s;
              &:hover {
                border-color: ${currentTheme.color.primary};
                background: ${currentTheme.color.primaryBg};
              }
            `}
          >
            {mode === 'light' ? '☀️ 浅色' : '🌙 深色'}
          </button>
        </div>

        {/* 内容区 */}
        <div
          css={css`
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: ${currentTheme.spacing[10]};
          `}
        >
          <Section title="颜色 Token" theme={currentTheme}>
            <ColorTokens theme={currentTheme} />
          </Section>

          <Section title="Block 颜色" theme={currentTheme}>
            <BlockColors theme={currentTheme} />
          </Section>

          <Section title="字体排版" theme={currentTheme}>
            <Typography theme={currentTheme} />
          </Section>

          <Section title="间距" theme={currentTheme}>
            <Spacing theme={currentTheme} />
          </Section>

          <Section title="效果（阴影 / 模糊 / 圆角）" theme={currentTheme}>
            <Effects theme={currentTheme} />
          </Section>

          <Section title="Antd 组件" theme={currentTheme}>
            <AntdShowcase theme={currentTheme} mode={mode} />
          </Section>

          <Section title="Antd X 组件" theme={currentTheme}>
            <AntdXShowcase theme={currentTheme} mode={mode} />
          </Section>
        </div>
      </div>
    </ThemeProviderOverride>
  );
}

function Section({ title, theme, children }: { title: string; theme: Theme; children: ReactNode }) {
  return (
    <section>
      <h2
        css={css`
          font-size: ${theme.font.size.xl};
          font-weight: ${theme.font.weight.semibold};
          margin-bottom: ${theme.spacing[4]};
          padding-bottom: ${theme.spacing[2]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          color: ${theme.color.text};
        `}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * 使用 Emotion ThemeProvider 覆盖当前主题，让 demo 切换生效
 */
import { ThemeProvider } from '@emotion/react';

function ThemeProviderOverride({
  theme,
  mode: _mode,
  children,
}: {
  theme: Theme;
  mode: string;
  children: ReactNode;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
