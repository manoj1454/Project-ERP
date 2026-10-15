"use client";

import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CuriousCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowSize?: number;
  glowOpacity?: number;
}

export const CuriousCard = forwardRef<HTMLDivElement, CuriousCardProps>(function CuriousCard(
  {
    children,
    className = "",
    glowSize = 220,
    glowOpacity = 0.2,
    style,
    ...props
  },
  forwardedRef
) {
  const internalRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => internalRef.current as HTMLDivElement);

  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Responsive, fluid spring for curiosity tracking
  const springX = useSpring(mouseX, { damping: 20, stiffness: 220, mass: 0.35 });
  const springY = useSpring(mouseY, { damping: 20, stiffness: 220, mass: 0.35 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!internalRef.current) return;
    const rect = internalRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    if (props.onMouseMove) props.onMouseMove(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (props.onMouseEnter) props.onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  return (
    <div
      ref={internalRef}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Curious Fragment Hover Glow (Subtle Living Soul Shard) */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? glowOpacity : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          x: springX,
          y: springY,
          width: glowSize,
          height: glowSize,
          marginLeft: -(glowSize / 2),
          marginTop: -(glowSize / 2),
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity",
        }}
        className="pointer-events-none absolute left-0 top-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 blur-2xl z-0"
      />

      {/* Subtle border sheen highlight on hover */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-indigo-400/25 z-0"
      />

      {/* Card Contents */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
});
