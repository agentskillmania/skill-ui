/**
 * Markdown renderer
 *
 * Based on @ant-design/x-markdown (marked.js), consistent with the studio
 * app's rendering. Supports streaming rendering, code highlighting, GFM syntax.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { CodeHighlighter } from '@ant-design/x';
import _XMarkdown from '@ant-design/x-markdown';
import type { ComponentProps, XMarkdownProps } from '@ant-design/x-markdown';
import { css, keyframes } from '@emotion/react';
import React, { isValidElement, useMemo } from 'react';

import type { ChatMarkdownConfig } from '../types.js';
import { useMarkdownConfig } from './markdownConfig.js';

// React 19 type compatibility: XMarkdown declared as FC but TS cannot recognize it as JSX component
const XMarkdown = _XMarkdown as unknown as React.ComponentType<XMarkdownProps>;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

/**
 * DOMPurify defaults, extended with the `file:` scheme. The upstream default
 * (x-markdown bundles DOMPurify; see its configureDOMPurify) strips file:/
 * hrefs because the scheme is not in its allowlist — but in agent-chat output
 * a local file reference is a first-class citizen, so the kit keeps it alive
 * by default. `file:` hrefs carry no script-execution vector; hosts with
 * stricter needs override via ChatMarkdownConfig.dompurifyConfig.
 */
const DEFAULT_DOMPURIFY = {
  // Copy of DOMPurify's default regexp with `file` added to the scheme group.
  // The `\-` escapes keep the hyphen literal — bare `.-:` inside the negated
  // class would parse as a range and wrongly swallow `/` and digits.
  ALLOWED_URI_REGEXP:
    // eslint-disable-next-line no-useless-escape
    /^(?:(?:(?:f|ht)tps?|file|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

export interface MarkdownRendererProps {
  children: string;
  /** Whether streaming output */
  streaming?: boolean;
}

/** Code block rendering: integrates CodeHighlighter (skipped during streaming) */
function makeCodeComponent(isStreaming: boolean) {
  return function CodeComponent({ className, children, block }: ComponentProps) {
    if (!block) {
      return <code className={className}>{children}</code>;
    }

    const lang = className?.match(/language-(\w+)/)?.[1] ?? '';

    if (typeof children !== 'string') {
      return <code className={className}>{children}</code>;
    }

    // During streaming, code blocks are incomplete — CodeHighlighter's
    // lazy language loading + re-parsing on every token causes flicker.
    // Render plain <pre><code> until streaming is done.
    if (isStreaming) {
      return (
        <pre>
          <code className={className}>{children}</code>
        </pre>
      );
    }

    return <CodeHighlighter lang={lang}>{children}</CodeHighlighter>;
  };
}

/** Streaming cursor rendered inside x-markdown tail */
function StreamingCursor() {
  const theme = useTheme();
  return (
    <span
      css={css`
        display: inline-block;
        width: 2px;
        height: 1.2em;
        background: ${theme.color.primary};
        vertical-align: text-bottom;
        margin-left: 2px;
        animation: ${blink} 1s step-end infinite;
      `}
    />
  );
}

/** Flatten React children back to their text content (link display text). */
function flattenText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (isValidElement(node)) {
    return flattenText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/** A standalone link: the only meaningful child of its parent paragraph. */
function isStandaloneLink(domNode: ComponentProps['domNode']): boolean {
  const parent = domNode.parent as
    | { name?: string; children?: ComponentProps['domNode'][] }
    | undefined;
  if (!parent || parent.name !== 'p') return false;
  const meaningful = (parent.children ?? []).filter(
    (child) =>
      !(
        (child as { type?: string; data?: string }).type === 'text' &&
        !((child as { data?: string }).data ?? '').trim()
      )
  );
  return meaningful.length === 1 && meaningful[0] === domNode;
}

/**
 * Anchor override: when a linkCard takeover is configured and this link
 * stands alone in its paragraph, render the host's card instead of the
 * default `<a>`. Registered only when linkCard is provided — without it the
 * anchor path is x-markdown's own, byte-for-byte unchanged.
 */
function makeLinkAComponent(linkCard: NonNullable<ChatMarkdownConfig['linkCard']>) {
  return function LinkA(props: ComponentProps) {
    const { domNode, children } = props;
    const href = typeof props.href === 'string' ? props.href : undefined;
    if (href && isStandaloneLink(domNode)) {
      const card = linkCard({ href, text: flattenText(children) });
      if (card != null) return <>{card}</>;
    }
    // Default path: spread the DOM attribs only (href/target/rel…). Spreading
    // the full ComponentProps would leak React-internal props (domNode,
    // streamStatus) onto the DOM element.
    const attribs = (domNode as { attribs?: Record<string, string> }).attribs;
    return <a {...attribs}>{children}</a>;
  };
}

export function MarkdownRenderer({ children, streaming }: MarkdownRendererProps) {
  const theme = useTheme();
  const { onLinkClick, linkCard, dompurifyConfig } = useMarkdownConfig();

  // Memoize the code component so it doesn't recreate on every token —
  // only changes when streaming flag flips.
  const codeComponent = useMemo(() => makeCodeComponent(streaming ?? false), [streaming]);
  const linkA = useMemo(() => (linkCard ? makeLinkAComponent(linkCard) : undefined), [linkCard]);

  // One delegated listener on the rendered root covers every <a>; only
  // attached when interception is configured.
  const handleRootClick = onLinkClick
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        const anchor = (e.target as HTMLElement).closest('a');
        const href = anchor?.getAttribute('href');
        if (href !== null && href !== undefined && onLinkClick(href, e)) {
          e.preventDefault();
        }
      }
    : undefined;

  return (
    <div
      onClick={handleRootClick}
      css={css`
        line-height: ${theme.font.lineHeightRelaxed};
        /* Headings */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin-top: ${theme.spacing[3]};
          margin-bottom: ${theme.spacing[1]};
          font-weight: ${theme.font.weight.semibold};
          line-height: ${theme.font.lineHeightHeading};
        }
        h1 {
          font-size: ${theme.font.size.xl};
        }
        h2 {
          font-size: ${theme.font.size.lg};
        }
        h3 {
          font-size: ${theme.font.size.lg};
        }
        h4 {
          font-size: ${theme.font.size.sm};
        }
        h5,
        h6 {
          font-size: ${theme.font.size.xs};
        }

        /* Paragraphs */
        p {
          margin: ${theme.spacing[1]} 0;
        }

        /* Lists */
        ul,
        ol {
          margin: ${theme.spacing[1]} 0;
          padding-left: ${theme.spacing[5]};
        }
        li {
          margin-bottom: ${theme.spacing['0.5']};
        }
        ul ul,
        ol ol,
        ul ol,
        ol ul {
          margin: ${theme.spacing['0.5']} 0;
        }

        /* Blockquotes */
        blockquote {
          margin: ${theme.spacing[2]} 0;
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          border-left: 2px solid ${theme.color.borderSecondary};
          color: ${theme.color.textSecondary};
          background: ${theme.color.fillSubtle};
          border-radius: 0 ${theme.radius.sm} ${theme.radius.sm} 0;
          p {
            margin: 0;
          }
        }

        /* Horizontal rules */
        hr {
          margin: ${theme.spacing[3]} 0;
          border: none;
          border-top: 1px solid ${theme.color.borderSecondary};
        }

        /* Links */
        a {
          color: ${theme.color.primary};
          text-decoration: none;
          &:hover {
            opacity: 0.8;
          }
        }

        /* Tables */
        table {
          width: 100%;
          margin: ${theme.spacing[2]} 0;
          border-collapse: collapse;
          font-size: ${theme.font.size.xs};
        }
        th,
        td {
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          border: 1px solid ${theme.color.borderSecondary};
          text-align: left;
        }
        th {
          background: ${theme.color.fillSubtle};
          font-weight: ${theme.font.weight.semibold};
        }

        /* Inline code */
        code:not(pre code) {
          padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
          background: ${theme.color.fillSubtle};
          border-radius: ${theme.radius.xs};
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.875em;
        }
      `}
    >
      <XMarkdown
        content={children}
        components={linkA ? { code: codeComponent, a: linkA } : { code: codeComponent }}
        streaming={
          streaming
            ? {
                hasNextChunk: true,
                enableAnimation: true,
                animationConfig: { fadeDuration: 100, easing: 'ease-out' },
                tail: { content: '|', component: StreamingCursor },
              }
            : undefined
        }
        openLinksInNewTab
        dompurifyConfig={dompurifyConfig ?? DEFAULT_DOMPURIFY}
        // SEC13: escape raw HTML in markdown as plain text to prevent XSS.
        // LLM output is untrusted; <script>/<img onerror> must not execute.
        escapeRawHtml
      />
    </div>
  );
}
