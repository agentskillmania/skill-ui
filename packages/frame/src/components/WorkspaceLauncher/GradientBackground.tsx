/** @jsxImportSource @emotion/react */
/**
 * GradientBackground component
 * Floating gradient blob background, simulating paint splatter effect
 *
 * Derived from skill-studio's GradientBackground, adapted for skill-ui-theme
 */
import { css, keyframes } from '@emotion/react';
import { useTheme, absoluteFill } from '@agentskillmania/skill-ui-theme';

/** Soft floating animation — each blob uses different parameters, with opacity changes creating a "wax and wane" effect */
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  25% { transform: translate(-60px, 80px) scale(1.3); opacity: 0.6; }
  50% { transform: translate(40px, -50px) scale(0.7); opacity: 0.35; }
  75% { transform: translate(-30px, -40px) scale(1.15); opacity: 0.55; }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
  33% { transform: translate(70px, -60px) scale(1.25); opacity: 0.3; }
  66% { transform: translate(-50px, 50px) scale(0.75); opacity: 0.55; }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
  20% { transform: translate(50px, 60px) scale(1.2); opacity: 0.55; }
  40% { transform: translate(-70px, -30px) scale(0.8); opacity: 0.3; }
  60% { transform: translate(30px, -50px) scale(1.1); opacity: 0.5; }
  80% { transform: translate(-40px, 30px) scale(0.85); opacity: 0.35; }
`;

const float4 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(-80px, 50px) scale(1.35); opacity: 0.3; }
`;

export function GradientBackground() {
  const theme = useTheme();

  return (
    <div
      css={css`
        ${absoluteFill(theme, { overflow: 'hidden', zIndex: 0 })}
        pointer-events: none;
      `}
    >
      {/* Sunset orange-pink */}
      <div
        css={css`
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fda085 0%, #f6d365 100%);
          top: -100px;
          right: -50px;
          filter: blur(60px);
          animation: ${float1} 15s ease-in-out infinite;
        `}
      />
      {/* Rose pink */}
      <div
        css={css`
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          bottom: 10%;
          left: -80px;
          filter: blur(50px);
          animation: ${float2} 12s ease-in-out infinite;
        `}
      />
      {/* Lavender purple */}
      <div
        css={css`
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
          bottom: -50px;
          right: 20%;
          filter: blur(40px);
          animation: ${float3} 18s ease-in-out infinite;
        `}
      />
      {/* Peach */}
      <div
        css={css`
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          top: 40%;
          left: 30%;
          filter: blur(45px);
          animation: ${float4} 14s ease-in-out infinite;
        `}
      />
    </div>
  );
}
