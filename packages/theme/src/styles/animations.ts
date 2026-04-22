/**
 * Transition and animation style utilities
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Common transition animation
 * @param properties - Properties to transition, defaults to commonly used properties
 * @param duration - Duration key or custom value
 * @param timing - Timing function key or custom value
 */
export function transition(
  theme: Theme,
  properties: string[] = ['background-color', 'border-color', 'opacity', 'transform'],
  duration: keyof Theme['motion']['duration'] | string = 'normal',
  timing: keyof Theme['motion']['easing'] | string = 'out'
) {
  const durationValue =
    typeof duration === 'string' && duration in theme.motion.duration
      ? theme.motion.duration[duration as keyof Theme['motion']['duration']]
      : duration;

  const timingValue =
    typeof timing === 'string' && timing in theme.motion.easing
      ? theme.motion.easing[timing as keyof Theme['motion']['easing']]
      : timing;

  return css`
    transition: ${properties.join(', ')} ${durationValue} ${timingValue};
  `;
}

/**
 * Spin animation (for loading scenarios, etc.)
 */
export function spin(
  _theme: Theme,
  duration = '1s',
  iterationCount = 'infinite',
  timing = 'linear'
) {
  return css`
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    animation: spin ${duration} ${timing} ${iterationCount};
  `;
}

/**
 * Click scale animation
 */
export function scaleActive(_theme: Theme, scale = 0.95, duration = '200ms') {
  return css`
    &:active {
      transform: scale(${scale});
      transition: transform ${duration};
    }
  `;
}
