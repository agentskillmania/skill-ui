/**
 * Slash autocomplete panel — focus-preserving implementation.
 *
 * antd's Dropdown/Menu steals keyboard focus when opened (the menu container
 * is focusable: see `@rc-component/menu` `tabIndex` + `@rc-component/dropdown`
 * `useAccessibility`), so typing `/` would move focus out of the input. This
 * panel instead renders through a portal with NO `tabIndex` on any element, so
 * the input never loses focus. Keyboard navigation is driven by
 * `handleKeyDown` exposed via ref and wired into the input's `onKeyDown` by the
 * parent — mirroring `@ant-design/x`'s `Suggestion`/`useActive` model. The
 * Sender skips its submit when `onKeyDown` returns `false` (TextArea.js
 * `eventRes === false`), which is what we return on Enter-select.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { ChatCommand } from '../types.js';
import {
  DEFAULT_GROUP_KEY,
  extractSearchTerm,
  filterCommands,
  groupCommands,
} from './commandUtils.js';

export interface CommandAutocompleteRef {
  /**
   * Handle a keydown bubbling from the input. Returns `false` when an Enter
   * was consumed to select a command — the parent forwards this so the Sender
   * skips its submit (TextArea.js treats `eventRes === false` as "don't
   * submit").
   */
  handleKeyDown: (e: KeyboardEvent) => false | undefined;
}

export interface CommandAutocompleteProps {
  /** All available commands */
  commands: ChatCommand[];
  /** Select command callback */
  onCommand: (command: ChatCommand) => void;
  /** Current input text */
  inputValue: string;
  /** Trigger character (default "/") */
  trigger?: string;
  /** Child element (the input) this panel wraps */
  children: ReactNode;
}

export const CommandAutocomplete = forwardRef<CommandAutocompleteRef, CommandAutocompleteProps>(
  function CommandAutocomplete({ commands, onCommand, inputValue, trigger = '/', children }, ref) {
    const theme = useTheme();
    const { t } = useTranslation(NAMESPACE);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{
      top?: number;
      bottom?: number;
      left: number;
      width: number;
      maxHeight: number;
    } | null>(null);

    // Closed via Escape or command select: keep the input content but hide
    // the panel until the user edits the input (which can re-open it).
    const [dismissed, setDismissed] = useState(false);
    // The exact value written by a command select. While the input holds that
    // value the panel stays closed; any user edit resets the dismissal.
    const selectedValueRef = useRef<string | null>(null);
    useEffect(() => {
      if (inputValue === selectedValueRef.current) {
        // Programmatic write from selecting a command — keep it dismissed.
        selectedValueRef.current = null;
        return;
      }
      setDismissed(false);
    }, [inputValue]);

    const filtered = useMemo(() => {
      const searchTerm = extractSearchTerm(inputValue, trigger);
      if (searchTerm === null) {
        return [];
      }
      return filterCommands(commands, searchTerm);
    }, [commands, inputValue, trigger]);

    const grouped = useMemo(() => groupCommands(filtered), [filtered]);

    // Flattened view (group order preserved) so ArrowUp/ArrowDown roam across
    // all groups as a single linear sequence.
    const flatItems = useMemo(() => Array.from(grouped.values()).flat(), [grouped]);

    const visible = inputValue.startsWith(trigger) && !dismissed && commands.length > 0;

    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
      setActiveIndex(0);
    }, [flatItems]);

    // Keep the active item scrolled into view while navigating by keyboard.
    useEffect(() => {
      if (!visible) {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const el = panel.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
      // jsdom doesn't implement scrollIntoView; guard so tests don't blow up.
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [activeIndex, visible]);

    const handleSelect = useCallback(
      (command: ChatCommand) => {
        // The parent writes `${trigger}${command.command}` into the input
        // (instead of firing it immediately); keep the panel closed for that
        // written value until the user edits away from it.
        onCommand(command);
        setDismissed(true);
        selectedValueRef.current = `${trigger}${command.command}`;
      },
      [onCommand, trigger]
    );

    const close = useCallback(() => setDismissed(true), []);

    // Position the panel under (or, when below lacks room, above) the input.
    // Recompute on scroll/resize and when the input itself resizes (autoSize).
    useLayoutEffect(() => {
      if (!visible) {
        setCoords(null);
        return;
      }
      const el = wrapperRef.current;
      if (!el) {
        return;
      }
      const GAP = 4;
      const compute = () => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const spaceBelow = vh - rect.bottom - GAP;
        const spaceAbove = rect.top - GAP;
        // Prefer opening below; only flip up when below can't fit a reasonable
        // menu AND there is more room above.
        const preferBelow = spaceBelow >= 240 || spaceBelow >= spaceAbove;
        const available = preferBelow ? spaceBelow : spaceAbove;
        const maxHeight = Math.max(160, Math.min(available, vh * 0.5));
        setCoords({
          top: preferBelow ? rect.bottom + GAP : undefined,
          bottom: preferBelow ? undefined : vh - rect.top + GAP,
          left: rect.left,
          width: rect.width,
          maxHeight,
        });
      };
      compute();
      const scrollOpts: AddEventListenerOptions = { capture: true };
      window.addEventListener('scroll', compute, scrollOpts);
      window.addEventListener('resize', compute);
      // jsdom doesn't ship ResizeObserver; guard so tests don't crash.
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(compute) : null;
      ro?.observe(el);
      return () => {
        window.removeEventListener('scroll', compute, scrollOpts);
        window.removeEventListener('resize', compute);
        ro?.disconnect();
      };
    }, [visible]);

    // Click outside dismisses the panel (input keeps focus & content).
    useEffect(() => {
      if (!visible) {
        return;
      }
      const onDocMouseDown = (e: MouseEvent) => {
        const target = e.target as Node | null;
        if (!target) {
          return;
        }
        if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) {
          return;
        }
        close();
      };
      document.addEventListener('mousedown', onDocMouseDown);
      return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, [visible, close]);

    // Keyboard navigation, exposed to the parent input.
    useImperativeHandle(
      ref,
      () => ({
        handleKeyDown: (e: KeyboardEvent): false | undefined => {
          if (!visible) {
            return undefined;
          }
          switch (e.key) {
            case 'ArrowDown':
              if (flatItems.length === 0) {
                return undefined;
              }
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % flatItems.length);
              return undefined;
            case 'ArrowUp':
              if (flatItems.length === 0) {
                return undefined;
              }
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
              return undefined;
            case 'Enter': {
              // Input whose first token is already a full command (e.g.
              // "/search" or "/search args"): let it submit instead of
              // re-selecting — the parent resolves commands on submit.
              const token = inputValue.slice(trigger.length).trim().split(/\s+/)[0];
              const fullMatch = token !== '' && flatItems.some((c) => c.command === token);
              if (fullMatch) {
                return undefined;
              }
              const cmd = flatItems[activeIndex];
              if (cmd) {
                e.preventDefault();
                handleSelect(cmd);
                return false;
              }
              return undefined;
            }
            case 'Escape':
              e.preventDefault();
              close();
              return undefined;
            default:
              return undefined;
          }
        },
      }),
      [visible, flatItems, activeIndex, handleSelect, close, inputValue, trigger]
    );

    const groupsRender = useMemo(() => {
      const nodes: ReactNode[] = [];
      let runningIndex = 0;
      let groupCount = 0;
      for (const [groupName, cmds] of grouped) {
        if (groupCount > 0) {
          nodes.push(<div key={`divider-${groupName}`} css={dividerStyle(theme)} />);
        }
        groupCount += 1;
        nodes.push(
          <div key={`group-${groupName}`} css={groupTitleStyle(theme)}>
            {groupName === DEFAULT_GROUP_KEY ? t('commands.defaultGroup') : groupName}
          </div>
        );
        for (const cmd of cmds) {
          const idx = runningIndex;
          runningIndex += 1;
          nodes.push(
            <div
              key={cmd.id}
              data-testid="cmd-item"
              data-index={idx}
              data-active={idx === activeIndex ? '' : undefined}
              css={itemStyle(theme)}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => handleSelect(cmd)}
            >
              {cmd.icon && <span css={iconStyle(theme)}>{cmd.icon}</span>}
              <span css={labelStyle(theme)}>{cmd.label}</span>
              {cmd.description && (
                <span css={descStyle(theme)} title={cmd.description}>
                  {cmd.description}
                </span>
              )}
            </div>
          );
        }
      }
      return nodes;
    }, [grouped, theme, t, activeIndex, handleSelect]);

    return (
      <div ref={wrapperRef}>
        {children}
        {visible &&
          coords &&
          createPortal(
            <div
              ref={panelRef}
              data-testid="cmd-panel"
              role="listbox"
              style={{
                position: 'fixed',
                top: coords.top,
                bottom: coords.bottom,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
              }}
              css={panelStyle(theme)}
            >
              {flatItems.length === 0 ? (
                <div data-testid="cmd-empty" css={emptyStyle(theme)}>
                  {t('commands.noMatch')}
                </div>
              ) : (
                groupsRender
              )}
            </div>,
            document.body
          )}
      </div>
    );
  }
);

const panelStyle = (theme: ReturnType<typeof useTheme>) => css`
  min-width: 240px;
  max-width: 92vw;
  overflow-y: auto;
  background: ${theme.color.bgElevated};
  border: 1px solid ${theme.color.border};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.lg};
  z-index: 1050;
  padding: ${theme.spacing[1]} 0;
  box-sizing: border-box;
`;

const groupTitleStyle = (theme: ReturnType<typeof useTheme>) => css`
  padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[1]};
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.color.textTertiary};
  user-select: none;
`;

const dividerStyle = (theme: ReturnType<typeof useTheme>) => css`
  height: 1px;
  margin: ${theme.spacing[1]} 0;
  background: ${theme.color.border};
`;

const itemStyle = (theme: ReturnType<typeof useTheme>) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${theme.color.hoverOverlay};
  }

  &[data-active] {
    background: ${theme.color.primaryBg};
  }
`;

const iconStyle = (theme: ReturnType<typeof useTheme>) => css`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: ${theme.color.textSecondary};
`;

const labelStyle = (theme: ReturnType<typeof useTheme>) => css`
  font-weight: ${theme.font.weight.medium};
  font-size: ${theme.font.size.sm};
  white-space: nowrap;
  flex-shrink: 0;
  color: ${theme.color.text};
`;

const descStyle = (theme: ReturnType<typeof useTheme>) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
`;

const emptyStyle = (theme: ReturnType<typeof useTheme>) => css`
  padding: ${theme.spacing[3]} ${theme.spacing[3]};
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.sm};
  text-align: center;
`;
