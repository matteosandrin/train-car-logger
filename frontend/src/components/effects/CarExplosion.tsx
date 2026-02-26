import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { assetUrl } from "../../assets";
import { SubwayLine } from "../../utils/subway";

type CarExplosionProps = (
  | { kind: "repeat"; repeatNumber: number }
  | { kind: "shared"; line: string; friendName: string }
) & {
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
};

type ParticleStyle = React.CSSProperties & {
  "--particle-translate-x": string;
  "--particle-translate-y": string;
  "--particle-scale": string;
  "--particle-rotation": string;
};

const CarExplosion: React.FC<CarExplosionProps> = ({
  duration = 2500,
  particleCount = 100,
  onComplete,
  ...props
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 200;
      const size = 32 + Math.random() * 24;
      const line =
        props.kind === "shared"
          ? props.line
          : Object.values(SubwayLine)[Math.floor(Math.random() * Object.values(SubwayLine).length)];

      return {
        id: index,
        line,
        size,
        translateX: Math.cos(angle) * distance,
        translateY: Math.sin(angle) * distance,
        scale: 0.5 + Math.random() * 0.8,
        rotation: 360 + Math.random() * 720,
        delay: Math.random() * 200,
      };
    });
  }, [particleCount, props.kind === "shared" ? props.line : null]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onComplete?.();
    }, duration + 300);
    return () => window.clearTimeout(timeout);
  }, [duration, onComplete]);

  if (typeof document === "undefined") {
    return null;
  }

  const centerText =
    props.kind === "repeat" ? (
      <div
        className="double-text absolute text-6xl font-black text-white bg-blue-600 rounded-xl px-4 py-2"
        style={{ animationDuration: `${duration}ms` }}
      >
        {(() => {
          switch (props.repeatNumber) {
            case 2: return "DOUBLE";
            case 3: return "TRIPLE";
            case 4: return "QUADRUPLE";
            case 5: return "QUINTUPLE";
            default: return `${props.repeatNumber}X`;
          }
        })()}
      </div>
    ) : (
      <div
        className="double-text absolute text-2xl font-black text-white bg-blue-600 rounded-xl px-5 py-3 text-center leading-normal"
        style={{ animationDuration: `${duration}ms` }}
      >
        YOU SHARED A CAR WITH
        <br />
        <span className="bg-white text-blue-600 px-1 py-0.5 rounded-md">{props.friendName.toUpperCase()}</span>
      </div>
    );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      {/* Subway icon particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {particles.map((particle) => {
          const style: ParticleStyle = {
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${duration}ms`,
            animationDelay: `${particle.delay}ms`,
            "--particle-translate-x": `${particle.translateX}px`,
            "--particle-translate-y": `${particle.translateY}px`,
            "--particle-scale": `${particle.scale}`,
            "--particle-rotation": `${particle.rotation}deg`,
          };
          return (
            <img
              key={particle.id}
              src={assetUrl(`/img/${particle.line}.svg`)}
              className="repeat-explosion-particle absolute"
              style={style}
              alt=""
            />
          );
        })}
      </div>

      {/* Center text */}
      {centerText}
    </div>,
    document.body,
  );
};

export default CarExplosion;
