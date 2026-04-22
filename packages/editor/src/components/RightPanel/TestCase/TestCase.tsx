/**
 * TestCase panel — test case management
 */
import { css } from '@emotion/react';
import { TestTube2, Play } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { SkillTestCase, TestResult } from '../../../types.js';

interface TestCasePanelProps {
  testCases?: SkillTestCase[];
  testResults?: TestResult[];
  onRunTests?: (caseIds?: string[]) => void;
}

export function TestCase({ testCases, testResults, onRunTests }: TestCasePanelProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            font-size: ${theme.font.size.sm};
            font-weight: 500;
            color: ${theme.color.text};
          `}
        >
          <TestTube2 size={14} />
          测试用例
        </div>
        <button
          onClick={() => onRunTests?.()}
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing['0.5']};
            padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
            border: none;
            border-radius: ${theme.radius.xs};
            background: ${theme.color.primary};
            color: white;
            cursor: pointer;
            font-size: ${theme.font.size.xs};
            transition: opacity ${theme.motion.duration.fast};

            &:hover {
              opacity: 0.85;
            }
          `}
          type="button"
        >
          <Play size={12} /> 全部运行
        </button>
      </div>

      {/* Case list */}
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          padding: ${theme.spacing[1]};
        `}
      >
        {(!testCases || testCases.length === 0) && (
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100px;
              color: ${theme.color.textTertiary};
              font-size: ${theme.font.size.xs};
            `}
          >
            暂无测试用例
          </div>
        )}
        {testCases?.map((tc) => {
          const result = testResults?.find((r) => r.caseId === tc.id);
          return (
            <div
              key={tc.id}
              css={css`
                padding: ${theme.spacing[1]} ${theme.spacing[2]};
                border-radius: ${theme.radius.xs};
                font-size: ${theme.font.size.xs};
                margin-bottom: ${theme.spacing['0.5']};

                &:hover {
                  background: ${theme.color.fillSubtle};
                }
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                `}
              >
                <span
                  css={css`
                    color: ${theme.color.text};
                  `}
                >
                  {tc.name}
                </span>
                {result && (
                  <span
                    css={css`
                      color: ${result.passed ? theme.color.success : theme.color.error};
                    `}
                  >
                    {result.passed ? '通过' : '失败'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
