/** @jsxImportSource @emotion/react */
/**
 * EvalViewer — wrangler-devtool 评估报告查看器。
 *
 * 输入 EvalReport（由宿主通过 runEval / CLI / daemon 获得），渲染：
 * 头部（套件 + 运行信息 + 通过率）、采样摘要、用例手风琴（样本与评估器结果）。
 * 纯展示组件，不耦合 eval 的运行方式。
 */
import { formatDuration } from '@agentskillmania/skill-ui-shared';
import { useTheme, borderSeparator } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Collapse, Empty, Tag, Tooltip } from 'antd';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from './locales/index.js';
import type { CaseReport, EvalReport, EvalResult, SampleResult } from './types.js';

export interface EvalViewerProps {
  report: EvalReport;
  className?: string;
  style?: React.CSSProperties;
}

/** pass/fail 状态 Tag */
function ResultTag({ passed }: { passed: boolean }) {
  const { t } = useTranslation(NAMESPACE);
  return passed ? (
    <Tag color="success" icon={<CheckCircle2 size={12} />}>
      {t('eval.passed')}
    </Tag>
  ) : (
    <Tag color="error" icon={<XCircle size={12} />}>
      {t('eval.failed')}
    </Tag>
  );
}

/** 单个评估器结果行 */
function EvaluatorRow({ result }: { result: EvalResult }) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        display: flex;
        align-items: flex-start;
        gap: ${theme.spacing[2]};
        padding: ${theme.spacing['0.5']} 0;
        font-size: ${theme.font.size.sm};
      `}
    >
      <span
        css={css`
          display: flex;
          align-items: center;
          padding-top: 2px;
          color: ${result.passed ? theme.color.success : theme.color.error};
          flex-shrink: 0;
        `}
      >
        {result.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      </span>
      <span
        css={css`
          font-family: ${theme.font.familyMono};
          color: ${theme.color.textSecondary};
          flex-shrink: 0;
        `}
      >
        {result.name}
      </span>
      {result.score !== undefined && (
        <Tag
          css={css`
            margin-inline-end: 0;
          `}
        >
          {t('eval.score', { score: result.score })}
        </Tag>
      )}
      <span
        css={css`
          color: ${theme.color.textTertiary};
          min-width: 0;
          overflow-wrap: break-word;
        `}
      >
        {result.message}
      </span>
    </div>
  );
}

/** 单个样本行 */
function SampleRow({ sample }: { sample: SampleResult }) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        padding: ${theme.spacing[1]} ${theme.spacing[2]};
        border-radius: ${theme.radius.sm};
        background: ${theme.color.fillSubtle};
        margin-bottom: ${theme.spacing[1]};
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          margin-bottom: ${theme.spacing['0.5']};
        `}
      >
        <span
          css={css`
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textSecondary};
          `}
        >
          {t('eval.sample', { index: sample.sampleIndex + 1 })}
        </span>
        <ResultTag passed={sample.passed} />
      </div>
      {sample.results.map((r, i) => (
        <EvaluatorRow key={`${r.name}-${i}`} result={r} />
      ))}
    </div>
  );
}

/** 报告头部统计 */
function ReportHeader({ report }: { report: EvalReport }) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const durationMs = new Date(report.finishedAt).getTime() - new Date(report.startedAt).getTime();
  const passRatePct = Math.round(report.passRate * 100);
  const allPassed = report.failed === 0;

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]};
        ${borderSeparator(theme)}
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          flex-wrap: wrap;
        `}
      >
        <span
          css={css`
            font-size: ${theme.font.size.lg};
            font-weight: ${theme.font.weight.semibold};
            color: ${theme.color.text};
          `}
        >
          {report.suite}
        </span>
        <Tag color={allPassed ? 'success' : 'error'}>
          {t('eval.passRate')} {passRatePct}%
        </Tag>
        <Tag>
          {report.passed}/{report.totalCases} {t('eval.cases')}
        </Tag>
      </div>
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[3]};
          margin-top: ${theme.spacing[2]};
          font-size: ${theme.font.size.xs};
          color: ${theme.color.textTertiary};
          flex-wrap: wrap;
        `}
      >
        <Tooltip title={report.runId}>
          <span>
            {t('eval.runId')}: {report.runId}
          </span>
        </Tooltip>
        <span>
          {t('eval.duration')}: {formatDuration(Math.max(0, durationMs))}
        </span>
        <span>
          {t('eval.sampling')}: {t('eval.runs', { count: report.sampling.runs })} ·{' '}
          {t('eval.threshold', { value: report.sampling.passThreshold })}
        </span>
        <span>
          {t('eval.target')}: {report.target.type}
          {report.target.skill ? ` (${report.target.skill})` : ''}
        </span>
      </div>
    </div>
  );
}

/** 用例手风琴 header */
function CaseLabel({ caseReport }: { caseReport: CaseReport }) {
  const theme = useTheme();
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
        min-width: 0;
      `}
    >
      <ResultTag passed={caseReport.passed} />
      <span
        css={css`
          color: ${theme.color.text};
          font-size: ${theme.font.size.sm};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        {caseReport.name}
      </span>
      <span
        css={css`
          color: ${theme.color.textTertiary};
          font-size: ${theme.font.size.xs};
          flex-shrink: 0;
        `}
      >
        {caseReport.passCount}/{caseReport.samples.length}
      </span>
    </div>
  );
}

export function EvalViewer({ report, className, style }: EvalViewerProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      className={className}
      style={style}
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
        background: ${theme.color.bgContainer};
        color: ${theme.color.text};
        font-family: ${theme.font.family};
      `}
    >
      <ReportHeader report={report} />
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
        `}
      >
        {report.cases.length === 0 ? (
          <Empty description={t('eval.emptyHint')} />
        ) : (
          <Collapse
            ghost
            items={report.cases.map((caseReport) => ({
              key: caseReport.name,
              label: <CaseLabel caseReport={caseReport} />,
              children: (
                <div>
                  {caseReport.samples.length === 0 ? (
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: ${theme.spacing[1]};
                        color: ${theme.color.textTertiary};
                        font-size: ${theme.font.size.sm};
                      `}
                    >
                      <MinusCircle size={14} /> —
                    </div>
                  ) : (
                    caseReport.samples.map((sample) => (
                      <SampleRow key={sample.sampleIndex} sample={sample} />
                    ))
                  )}
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
}
