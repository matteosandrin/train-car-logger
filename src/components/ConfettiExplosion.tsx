import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type ConfettiExplosionProps = {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
};

type ConfettiStyle = React.CSSProperties & {
  '--confetti-translate-x': string;
  '--confetti-translate-y': string;
  '--confetti-scale': string;
  '--confetti-rotation': string;
};

const COLORS = ['#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ec4899'];

const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({
  duration = 2200,
  particleCount = 80,
  onComplete,
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 120;
      const width = 6 + Math.random() * 4;
      const height = 12 + Math.random() * 8;
      return {
        id: index,
        left: 50 + (Math.random() - 0.5) * 20,
        translateX: Math.cos(angle) * distance,
        translateY: Math.sin(angle) * distance,
        scale: 0.6 + Math.random() * 0.8,
        color: COLORS[index % COLORS.length],
        rotation: 360 + Math.random() * 540,
        delay: Math.random() * 150,
        width,
        height,
      };
    });
  }, [particleCount]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onComplete?.();
    }, duration + 200);
    return () => window.clearTimeout(timeout);
  }, [duration, onComplete]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="confetti-container" aria-hidden="true">
      {particles.map((particle) => {
        const style: ConfettiStyle = {
          left: `${particle.left}%`,
          width: `${particle.width}px`,
          height: `${particle.height}px`,
          backgroundColor: particle.color,
          animationDuration: `${duration}ms`,
          animationDelay: `${particle.delay}ms`,
          '--confetti-translate-x': `${particle.translateX}px`,
          '--confetti-translate-y': `${particle.translateY}px`,
          '--confetti-scale': `${particle.scale}`,
          '--confetti-rotation': `${particle.rotation}deg`,
        };
        return <span key={particle.id} className="confetti-piece" style={style} />;
      })}
    </div>,
    document.body
  );
};

export default ConfettiExplosion;
