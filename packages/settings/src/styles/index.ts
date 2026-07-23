/**
 * @fileoverview Shared style utilities for settings form layout.
 *
 * @module
 *
 * @remarks
 * Most layout and grouping is handled by Ant Design components (Card,
 * Form, Form.Item, Alert, Empty). This file only contains styles that
 * have no direct Ant Design equivalent.
 */

import type { Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

// --- MCP Empty State Step Layout ---

/**
 * Step number circle indicator.
 *
 * @param theme - Theme object for token access
 * @returns Emotion serialized styles
 */
export function stepNumber(theme: Theme) {
  return css`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: ${theme.radius.full};
    background: ${theme.color.primary};
    color: ${theme.color.textInverse};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.font.size.sm};
    font-weight: ${theme.font.weight.semibold};
    line-height: 1;
    position: relative;
    z-index: 1;
  `;
}

/**
 * Vertical connector line between numbered steps.
 *
 * @param theme - Theme object for token access
 * @returns Emotion serialized styles
 */
export function stepConnector(theme: Theme) {
  return css`
    position: absolute;
    left: 15px;
    top: 32px;
    bottom: 0;
    width: 2px;
    background: ${theme.color.border};
  `;
}

/**
 * Step row: numbered circle + content side by side.
 *
 * @param theme - Theme object for token access
 * @returns Emotion serialized styles
 */
export function stepRow(theme: Theme) {
  return css`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]} 0;

    &:first-of-type {
      padding-top: 0;
    }
  `;
}

/**
 * Step content area (title + command + description).
 *
 * @param theme - Theme object for token access
 * @returns Emotion serialized styles
 */
export function stepContent(theme: Theme) {
  return css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    flex: 1;
    min-width: 0;
  `;
}

/**
 * Step description text.
 *
 * @param theme - Theme object for token access
 * @returns Emotion serialized styles
 */
export function stepDescription(theme: Theme) {
  return css`
    font-size: ${theme.font.size.sm};
    color: ${theme.color.textTertiary};
    line-height: ${theme.font.lineHeightRelaxed};
  `;
}
