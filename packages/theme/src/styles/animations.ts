/**
 * 过渡动画样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * 通用过渡动画
 * @param properties - 过渡的属性，默认包含常用属性
 * @param duration - 持续时间 key 或自定义值
 * @param timing - 时间函数 key 或自定义值
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
 * 旋转动画（用于 loading 等场景）
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
 * 点击缩放动画
 */
export function scaleActive(_theme: Theme, scale = 0.95, duration = '200ms') {
  return css`
    &:active {
      transform: scale(${scale});
      transition: transform ${duration};
    }
  `;
}
