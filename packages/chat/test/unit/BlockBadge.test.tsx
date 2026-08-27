import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { BlockBadge, type BlockBadgeVariant } from '../../src/blocks-redesign/BlockBadge.js';

function renderBadge(variant: BlockBadgeVariant) {
  return render(
    <ThemeProvider theme={lightTheme}>
      <BlockBadge variant={variant}>标签</BlockBadge>
    </ThemeProvider>
  );
}

/** Emotion 把样式序列化进 document 的 <style> 标签(jsdom 下 head/body 均可能) */
function allSerializedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((el) => el.textContent ?? '')
    .join('\n');
}

describe('BlockBadge', () => {
  it.each(['neutral', 'primary', 'success', 'error', 'warning', 'solidError'] as const)(
    'renders %s variant',
    (variant) => {
      renderBadge(variant);
      expect(screen.getByText('标签')).toBeInTheDocument();
    }
  );

  it('maps variants to the expected paired token colors', () => {
    const pairs: Record<BlockBadgeVariant, [string, string]> = {
      neutral: [lightTheme.color.fillSubtle, lightTheme.color.textTertiary],
      primary: [lightTheme.color.primaryBg, lightTheme.color.primary],
      success: [lightTheme.color.successBg, lightTheme.color.success],
      error: [lightTheme.color.errorBg, lightTheme.color.error],
      warning: [lightTheme.color.warningBg, lightTheme.color.warning],
      solidError: [lightTheme.color.error, lightTheme.color.textInverse],
    };
    for (const [variant, [bg, fg]] of Object.entries(pairs) as [
      BlockBadgeVariant,
      [string, string],
    ][]) {
      const { unmount } = renderBadge(variant);
      const css = allSerializedCss();
      expect(css, `${variant} bg`).toContain(bg);
      expect(css, `${variant} fg`).toContain(fg);
      unmount();
    }
  });

  it('renders leading icon and pulse dot', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <BlockBadge variant="primary" pulse icon={<Loader2 size={12} data-testid="icon" />}>
          运行中
        </BlockBadge>
      </ThemeProvider>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const badge = screen.getByText('运行中').closest('span')!;
    const dot = badge.querySelector('span');
    expect(dot).not.toBeNull();
    expect(allSerializedCss()).toContain('animation');
  });

  it('uppercase adds text-transform for type badges', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <BlockBadge variant="neutral" uppercase>
          mcp
        </BlockBadge>
      </ThemeProvider>
    );
    expect(screen.getByText('mcp')).toBeInTheDocument();
    expect(allSerializedCss()).toContain('text-transform:uppercase');
  });
});
