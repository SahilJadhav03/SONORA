import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SpotlightTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  maxTiltDeg?: number;
  spotlightColor?: string;
}

export const SpotlightTiltCard: React.FC<SpotlightTiltCardProps> = ({
  children,
  className,
  enableTilt = true,
  maxTiltDeg = 4,
  spotlightColor = 'rgba(255, 255, 255, 0.08)',
  onClick,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Framer Motion spring physics for 3D micro-tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [`${maxTiltDeg}deg`, `-${maxTiltDeg}deg`]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [`-${maxTiltDeg}deg`, `${maxTiltDeg}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePos({ x: mouseX, y: mouseY });

    if (enableTilt) {
      // Normalize -0.5 to 0.5 relative to center
      x.set(mouseX / rect.width - 0.5);
      y.set(mouseY / rect.height - 0.5);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt) {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={enableTilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface-1/70 backdrop-blur-xl transition-all duration-300 ease-out shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:shadow-elevation-2 cursor-pointer',
        className
      )}
      {...(props as any)}
    >
      {/* 21st.dev Mouse-Tracking Radial Spotlight Sheen */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out opacity-100"
          style={{
            background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 65%)`,
          }}
        />
      )}

      {/* Diagonal Specular Glare Pass on Tilt */}
      {enableTilt && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)`,
            transform: `translateX(${(mousePos.x / (cardRef.current?.clientWidth || 200) - 0.5) * 60}px)`,
          }}
        />
      )}

      {/* Card Content with 3D Z-index lift */}
      <div className="relative z-20 h-full w-full flex flex-col" style={{ transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </motion.div>
  );
};
