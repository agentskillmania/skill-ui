/**
 * A2UI block — renders GenUI protocol surface inside standard block card.
 */
import { Genui, SurfaceManager, GenUISurface } from '@agentskillmania/genui';
import { useTheme, spinKeyframes } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Modal } from 'antd';
import { Monitor, Loader2, Clock, Maximize2 } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, A2UIBlockMetadata, BlockAction } from '../types.js';

export function A2UIBlock({ block, onAction }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as A2UIBlockMetadata | undefined;
  const title = meta?.title ?? t('a2ui.defaultTitle');
  const surfaceId = meta?.surfaceId;
  const maxHeight = meta?.maxHeight ?? '400px';

  const [engineReady, setEngineReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const smRef = useRef<SurfaceManager | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastLengthRef = useRef(0);
  const endedRef = useRef(false);

  // Initialize engine + SurfaceManager on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!Genui.isInitialized()) {
        await Genui.initialize();
      }
      if (cancelled) return;

      const sm = new SurfaceManager();
      await sm.initialize();
      if (cancelled) {
        sm.destroy();
        return;
      }

      smRef.current = sm;
      sm.beginTextStream();
      setEngineReady(true);
    }

    init();
    return () => {
      cancelled = true;
      smRef.current?.destroy();
      smRef.current = null;
    };
  }, []);

  // Stream content diff
  useEffect(() => {
    if (!engineReady || !smRef.current) return;

    const content = block.content;
    if (content.length > lastLengthRef.current) {
      const diff = content.slice(lastLengthRef.current);
      smRef.current.receiveTextChunk(diff);
      lastLengthRef.current = content.length;
    }

    if ((block.status === 'completed' || block.status === 'error') && !endedRef.current) {
      smRef.current.endTextStream();
      endedRef.current = true;
    }
  }, [block.content, block.status, engineReady]);

  // Detect overflow when content changes
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      setIsOverflow(el.scrollHeight > el.clientHeight);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [block.content, engineReady]);

  // Theme sync
  useEffect(() => {
    Genui.setDayNightMode(theme.mode);
  }, [theme.mode]);

  // Action handler
  const handleSurfaceAction = useCallback(
    (action: { sourceComponentId?: string; context?: unknown }) => {
      if (!onAction) return;
      const blockAction: BlockAction = {
        type: 'a2ui-action',
        surfaceId,
        componentId: action.sourceComponentId,
        payload: action.context,
      };
      onAction(blockAction);
    },
    [onAction, surfaceId]
  );

  // Status tag
  const statusConfig = (() => {
    switch (block.status) {
      case 'streaming':
        return { label: t('a2ui.streaming'), color: theme.color.info };
      case 'completed':
        return { label: t('a2ui.completed'), color: theme.color.success };
      case 'error':
        return { label: t('a2ui.error'), color: theme.color.error };
      case 'pending':
        return { label: t('a2ui.waiting'), color: theme.color.warning };
    }
  })();

  const accentColor = theme.blockColor.a2ui?.text ?? theme.color.primary;
  const accentBg = theme.blockColor.a2ui?.bg ?? theme.color.primaryBg;

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${block.status === 'error' ? theme.color.errorBorder : theme.color.border};
        overflow: hidden;
        transition:
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
          box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          border-color: ${theme.color.borderHover};
          box-shadow: ${theme.shadow.sm};
        }
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          background: ${theme.color.fill};
          border-bottom: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: ${theme.radius.md};
              background: ${accentBg};
              color: ${accentColor};
            `}
          >
            <Monitor size={14} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {title}
          </span>
          {block.status === 'streaming' && (
            <Loader2
              size={14}
              css={css`
                animation: ${spinKeyframes} 1s linear infinite;
                color: ${theme.color.textTertiary};
              `}
            />
          )}
          {block.status === 'pending' && (
            <Clock
              size={14}
              css={css`
                color: ${theme.color.warning};
              `}
            />
          )}
        </div>

        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          {statusConfig && (
            <span
              css={css`
                font-size: ${theme.font.size.xs};
                font-weight: ${theme.font.weight.bold};
                text-transform: uppercase;
                letter-spacing: 0.06em;
                padding: 2px 8px;
                border-radius: ${theme.radius.sm};
                color: ${statusConfig.color};
                background: ${accentBg};
              `}
            >
              {statusConfig.label}
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border: none;
              border-radius: ${theme.radius.md};
              background: transparent;
              color: ${theme.color.textSecondary};
              cursor: pointer;
              transition:
                background ${theme.motion.duration.fast},
                color ${theme.motion.duration.fast};
              &:hover {
                background: ${theme.color.fillTertiary};
                color: ${theme.color.text};
              }
            `}
            title={t('a2ui.expand')}
            type="button"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        ref={contentRef}
        css={css`
          max-height: ${maxHeight};
          overflow: auto;
          position: relative;
        `}
      >
        {!engineReady ? (
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              gap: ${theme.spacing[2]};
              padding: ${theme.spacing[8]} ${theme.spacing[4]};
              color: ${theme.color.textTertiary};
              font-size: ${theme.font.size.sm};
            `}
          >
            <Loader2
              size={16}
              css={css`
                animation: ${spinKeyframes} 1s linear infinite;
              `}
            />
            <span>{t('a2ui.initializing')}</span>
          </div>
        ) : smRef.current ? (
          <div
            css={css`
              min-height: 100px;
              padding: ${theme.spacing[3]} ${theme.spacing[4]};
            `}
          >
            <GenUISurface
              surfaceManager={smRef.current}
              width="100%"
              height="100%"
              onAction={handleSurfaceAction}
            />
          </div>
        ) : null}

        {/* Gradient fade + expand button when overflow */}
        {isOverflow && engineReady && (
          <div
            css={css`
              position: sticky;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100%;
              pointer-events: none;
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: flex-end;
                justify-content: center;
                width: 100%;
                height: 80px;
                background: linear-gradient(
                  to bottom,
                  transparent 0%,
                  ${theme.color.bgContainer} 55%
                );
                padding-bottom: ${theme.spacing[3]};
              `}
            >
              <button
                onClick={() => setIsModalOpen(true)}
                css={css`
                  pointer-events: auto;
                  padding: ${theme.spacing[1]} ${theme.spacing[3]};
                  border: none;
                  border-radius: ${theme.radius.md};
                  background: ${theme.color.fill};
                  color: ${theme.color.primary};
                  font-size: ${theme.font.size.sm};
                  font-weight: ${theme.font.weight.medium};
                  cursor: pointer;
                  transition: background ${theme.motion.duration.fast};
                  &:hover {
                    background: ${theme.color.fillSecondary};
                  }
                `}
                type="button"
              >
                {t('a2ui.expand')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full-view modal */}
      <Modal
        title={title}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="80vw"
        styles={{ body: { height: '70vh', padding: 0, overflow: 'hidden' } }}
      >
        {engineReady && smRef.current && (
          <GenUISurface
            surfaceManager={smRef.current}
            width="100%"
            height="100%"
            onAction={handleSurfaceAction}
          />
        )}
      </Modal>
    </div>
  );
}
