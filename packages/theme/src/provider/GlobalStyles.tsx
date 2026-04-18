/**
 * 全局样式组件
 */
import { Global, css } from '@emotion/react';
import { useTheme } from './index.js';

export function GlobalStyles() {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        /* ========== 全局重置 ========== */
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body,
        #root {
          height: 100%;
          width: 100%;
        }

        body {
          font-family: ${theme.font.family};
          font-size: ${theme.font.size.base};
          font-weight: ${theme.font.weight.normal};
          line-height: ${theme.font.lineHeight};
          color: ${theme.color.text};
          background: ${theme.color.bgBase};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* ========== 滚动条样式 ========== */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.color.border};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.color.textSecondary};
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: ${theme.color.border} transparent;
        }

        /* ========== 选中文本样式 ========== */
        ::selection {
          background: ${theme.color.primary};
          color: ${theme.color.textInverse};
        }

        /* ========== 焦点样式 ========== */
        :focus-visible {
          outline: 2px solid ${theme.color.primary};
          outline-offset: 2px;
        }

        /* ========== 链接样式 ========== */
        a {
          color: ${theme.color.link};
          text-decoration: none;
          transition: color ${theme.motion.duration.fast} ${theme.motion.easing.out};
        }

        a:hover {
          color: ${theme.color.linkHover};
        }

        /* ========== 代码样式 ========== */
        code,
        pre,
        kbd,
        samp {
          font-family: ${theme.font.familyCode};
        }

        code {
          padding: ${theme.spacing['0.5']} ${theme.spacing['2']};
          font-size: ${theme.font.size.sm};
          background: ${theme.color.fill};
          border-radius: ${theme.radius.sm};
        }

        pre {
          padding: ${theme.spacing['4']};
          background: ${theme.color.bgElevated};
          border-radius: ${theme.radius.md};
          overflow-x: auto;
        }

        pre code {
          padding: 0;
          background: transparent;
        }

        /* ========== 动效减弱模式 ========== */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ========== Ant Design X Sender 发送按钮 ========== */
        .ant-sender-actions-list button:not(:disabled) {
          background: ${theme.color.primary} !important;
          color: white !important;
        }

        .ant-sender-actions-list button:not(:disabled):hover {
          background: ${theme.color.primaryHover} !important;
          color: white !important;
        }
      `}
    />
  );
}
