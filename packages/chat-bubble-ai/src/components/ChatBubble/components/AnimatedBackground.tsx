import React from 'react';

interface AnimatedBackgroundProps {
  waves?: boolean;
  particles?: boolean;
  waveColor?: string;
  particleColor?: string;
}

// Fixed positions so they don't change on re-render
const PARTICLES = [
  { left: '7%',  bottom: '12%', size: 4, delay: 0,   dur: 6.2 },
  { left: '18%', bottom: '28%', size: 3, delay: 1.4, dur: 8.1 },
  { left: '31%', bottom: '8%',  size: 5, delay: 0.7, dur: 7.3 },
  { left: '45%', bottom: '22%', size: 3, delay: 2.1, dur: 9.0 },
  { left: '58%', bottom: '35%', size: 4, delay: 1.0, dur: 6.7 },
  { left: '70%', bottom: '14%', size: 3, delay: 2.9, dur: 8.4 },
  { left: '83%', bottom: '25%', size: 5, delay: 0.4, dur: 7.8 },
  { left: '12%', bottom: '45%', size: 2, delay: 3.8, dur: 10.2 },
  { left: '38%', bottom: '38%', size: 3, delay: 2.6, dur: 8.8 },
  { left: '63%', bottom: '48%', size: 2, delay: 1.6, dur: 9.6 },
  { left: '52%', bottom: '55%', size: 3, delay: 3.3, dur: 7.1 },
  { left: '88%', bottom: '42%', size: 4, delay: 0.2, dur: 6.9 },
  { left: '25%', bottom: '62%', size: 2, delay: 4.5, dur: 11.0 },
  { left: '75%', bottom: '65%', size: 3, delay: 2.0, dur: 8.6 },
];

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  waves = true,
  particles = true,
  waveColor = 'rgba(255, 255, 255, 0.2)',
  particleColor = 'rgba(255, 255, 255, 0.5)',
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <style>{`
        @keyframes cb-wave-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes cb-wave-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes cb-particle-float {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(-90px) scale(0.5); opacity: 0; }
        }
      `}</style>

      {/* Floating particles */}
      {particles && PARTICLES.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: particleColor,
            animation: `cb-particle-float ${p.dur}s ${p.delay}s infinite ease-in-out`,
          }}
        />
      ))}

      {/* SVG waves — 200% wide for seamless loop */}
      {waves && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          {/* back wave — slowest */}
          <div style={{
            position: 'absolute', bottom: 0,
            width: '200%',
            animation: 'cb-wave-fwd 14s linear infinite',
          }}>
            <svg viewBox="0 0 2400 50" style={{ display: 'block', width: '100%', height: 30 }} preserveAspectRatio="none">
              <path
                d="M0,25 C200,5 400,45 600,25 C800,5 1000,45 1200,25 C1400,5 1600,45 1800,25 C2000,5 2200,45 2400,25 L2400,50 L0,50 Z"
                fill={waveColor}
                opacity="0.4"
              />
            </svg>
          </div>
          {/* mid wave — medium speed, reverse */}
          <div style={{
            position: 'absolute', bottom: 0,
            width: '200%',
            animation: 'cb-wave-rev 9s linear infinite',
          }}>
            <svg viewBox="0 0 2400 65" style={{ display: 'block', width: '100%', height: 45 }} preserveAspectRatio="none">
              <path
                d="M0,40 C300,10 600,60 900,35 C1100,15 1350,58 1500,30 C1700,5 1950,60 2100,35 C2250,15 2350,55 2400,30 L2400,65 L0,65 Z"
                fill={waveColor}
                opacity="0.55"
              />
            </svg>
          </div>
          {/* front wave — fastest */}
          <div style={{
            position: 'absolute', bottom: 0,
            width: '200%',
            animation: 'cb-wave-fwd 6s linear infinite',
          }}>
            <svg viewBox="0 0 2400 75" style={{ display: 'block', width: '100%', height: 55 }} preserveAspectRatio="none">
              <path
                d="M0,45 C250,10 500,70 750,40 C950,18 1150,65 1400,30 C1600,5 1850,68 2050,35 C2200,12 2350,62 2400,38 L2400,75 L0,75 Z"
                fill={waveColor}
                opacity="0.75"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
