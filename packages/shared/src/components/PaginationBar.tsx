/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Pagination } from 'antd';

/** Props for the PaginationBar component. */
export interface PaginationBarProps {
  /** 1-indexed current page. */
  current: number;
  /** Number of items per page. */
  pageSize: number;
  /** Total item count. */
  total: number;
  /** Callback fired when the page changes. */
  onChange: (page: number) => void;
}

const barStyle = css`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
`;

/**
 * PaginationBar — antd Pagination hidden when total fits within a single page,
 * wrapped in a right-aligned container with consistent top spacing.
 */
export function PaginationBar({ current, pageSize, total, onChange }: PaginationBarProps) {
  if (total <= pageSize) return null;
  return (
    <div css={barStyle}>
      <Pagination current={current} pageSize={pageSize} total={total} onChange={onChange} />
    </div>
  );
}
