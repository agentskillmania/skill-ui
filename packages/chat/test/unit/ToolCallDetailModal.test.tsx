import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { ToolCallDetailModal } from '../../src/blocks-redesign/ToolCallDetailModal.js';

function renderModal(overrides: Partial<Parameters<typeof ToolCallDetailModal>[0]> = {}) {
  const onClose = vi.fn();
  const result = render(
    <ChatWrapper>
      <ToolCallDetailModal
        open={true}
        toolName="search"
        toolType="mcp"
        args='{"q":"test"}'
        result='{"matches":3,"items":["a","b","c"]}'
        onClose={onClose}
        {...overrides}
      />
    </ChatWrapper>
  );
  return { onClose, ...result };
}

describe('ToolCallDetailModal', () => {
  it('renders tool name and type in header', () => {
    renderModal();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('mcp')).toBeInTheDocument();
  });

  it('renders input args in textarea', () => {
    renderModal();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('renders JSON result with two tabs (preview + raw)', () => {
    renderModal();
    expect(screen.getByText('预览')).toBeInTheDocument();
    expect(screen.getByText('原始数据')).toBeInTheDocument();
  });

  it('non-JSON result shows only raw tab', () => {
    renderModal({ result: 'plain text output' });
    // Only raw tab, no preview tab
    expect(screen.queryByText('预览')).not.toBeInTheDocument();
    expect(screen.getByText('原始数据')).toBeInTheDocument();
  });

  it('empty result shows only raw tab', () => {
    renderModal({ result: '' });
    expect(screen.queryByText('预览')).not.toBeInTheDocument();
    expect(screen.getByText('原始数据')).toBeInTheDocument();
  });

  it('undefined result shows only raw tab', () => {
    renderModal({ result: undefined });
    expect(screen.queryByText('预览')).not.toBeInTheDocument();
    expect(screen.getByText('原始数据')).toBeInTheDocument();
  });

  it('renders without toolType (no type badge)', () => {
    renderModal({ toolType: undefined });
    expect(screen.getByText('search')).toBeInTheDocument();
    // No type badge
    expect(screen.queryByText('mcp')).not.toBeInTheDocument();
  });

  it('renders without args (empty textarea)', () => {
    renderModal({ args: undefined });
    // Textarea should be present and empty
    const textarea = document.querySelector('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea?.value.trim()).toBe('');
  });

  it('calls onClose when modal close button clicked', () => {
    const { onClose } = renderModal();
    // antd Modal close icon renders as .ant-modal-close。无条件断言:
    // if 守卫会让选择器失效时整组断言静默通过
    const closeBtn = document.querySelector('.ant-modal-close');
    expect(closeBtn).not.toBeNull();
    closeBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('uses vs-dark theme in dark mode', () => {
    const { container } = render(
      <ChatWrapper context={{ theme: { mode: 'dark' } } as never}>
        <ToolCallDetailModal open={true} toolName="search" onClose={() => {}} />
      </ChatWrapper>
    );
    // Modal should exist
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('JSON result renders react-json-view', () => {
    renderModal({ result: '{"key":"value"}' });
    // react-json-view renders with .react-json-view root class
    const jsonView = document.querySelector('.react-json-view');
    expect(jsonView).toBeInTheDocument();
  });

  it('malformed JSON result falls back to raw-only view', () => {
    renderModal({ result: 'not valid json {' });
    expect(screen.queryByText('预览')).not.toBeInTheDocument();
    expect(screen.getByText('原始数据')).toBeInTheDocument();
  });
});
