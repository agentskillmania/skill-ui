/**
 * Typing indicator — three dots that breathe in sequence.
 *
 * Shown inside an empty streaming assistant bubble to signal "the AI is
 * composing a response" before the first token arrives. Quiet, non-blocking,
 * and localized to the message bubble (no global overlay).
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';

export const TypingIndicator = () => {
  const theme = useTheme();

  const breathe = keyframes`
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  `;

  const dot = (delay: string) => css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${theme.color.textTertiary};
    display: inline-block;
    animation: ${breathe} 1.4s ${theme.motion.easing.inOut} ${delay} infinite;
  `;

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 0;
        min-height: 22px;
      `}
      aria-label="AI is typing"
      role="status"
    >
      <span css={dot('0s')} />
      <span css={dot('0.2s')} />
      <span css={dot('0.4s')} />
    </div>
  );
};
