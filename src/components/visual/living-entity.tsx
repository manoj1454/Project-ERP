"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function LivingEntity() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate motion values
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Smooth, organic spring physics for curiosity and fluid inertia
  const springConfig = { damping: 26, stiffness: 48, mass: 1.3 };
  const springX = useSpring(targetX, springConfig);
  const springY = useSpring(targetY, springConfig);

  // Secondary satellite spring with slightly looser lag for dynamic tail/orb
  const satelliteSpringX = useSpring(targetX, { damping: 32, stiffness: 35, mass: 1.8 });
  const satelliteSpringY = useSpring(targetY, { damping: 32, stiffness: 35, mass: 1.8 });

  // Subtle organic tilt based on movement direction
  const rotation = useTransform(springX, [-400, 400], [-18, 18]);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const mousePos = { x: 0, y: 0, isMouseActive: false };
    let idleTimer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.isMouseActive = true;
      // Calculate cursor offset relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mousePos.x = e.clientX - centerX;
      mousePos.y = e.clientY - centerY;

      clearTimeout(idleTimer);
      // After 2.5s of mouse stillness, gently bias back towards organic autonomous wandering
      idleTimer = setTimeout(() => {
        mousePos.isMouseActive = false;
      }, 2500);
    };

    const handleMouseLeave = () => {
      mousePos.isMouseActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const updatePosition = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Autonomous organic drift frequencies (compound sinusoidal wandering)
      const driftX =
        Math.sin(elapsed * 0.55) * 160 +
        Math.cos(elapsed * 0.85) * 90 +
        Math.sin(elapsed * 0.22) * 50;
      const driftY =
        Math.cos(elapsed * 0.45) * 140 +
        Math.sin(elapsed * 0.75) * 80 +
        Math.cos(elapsed * 0.18) * 40;

      // Mouse attraction logic: if mouse is moving, entity leans and swims toward cursor
      let destX = driftX;
      let destY = driftY;

      if (mousePos.isMouseActive) {
        // Attract 45% towards the cursor location while retaining organic life oscillation
        destX = driftX * 0.55 + mousePos.x * 0.45;
        destY = driftY * 0.55 + mousePos.y * 0.45;
      }

      targetX.set(destX);
      targetY.set(destY);

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [targetX, targetY]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {/* SVG Turbulence & Displacement Filter Definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="blob" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014"
              numOctaves="3"
              result="turbulence"
              seed="7"
            >
              <animate
                attributeName="baseFrequency"
                dur="16s"
                values="0.014;0.019;0.012;0.014"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="75"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="32" result="blurred" />
            <feBlend in="SourceGraphic" in2="blurred" mode="screen" />
          </filter>
        </defs>
      </svg>

      {/* Primary Autonomous Living Entity */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          rotate: rotation,
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
        }}
        animate={{
          scale: [0.96, 1.07, 0.98, 1.05, 0.96],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center w-[540px] h-[540px] rounded-full"
      >
        {/* Outermost ambient glowing mantle */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/40 via-purple-600/35 to-cyan-500/30 blur-3xl opacity-80"
          style={{ filter: "url(#blob)" }}
        />

        {/* Dense mid-layer fluid organism body */}
        <div
          className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 opacity-60 blur-2xl"
          style={{ filter: "url(#blob)" }}
        />

        {/* Sentient bioluminescent nucleus */}
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1.1, 1],
            opacity: [0.75, 0.95, 0.8, 1, 0.75],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-indigo-400 via-violet-300 to-cyan-200 blur-xl opacity-90 shadow-2xl shadow-indigo-500/50"
        />

        {/* Shimmering core hot spot */}
        <div className="absolute w-[120px] h-[120px] rounded-full bg-white/70 blur-md opacity-75" />
      </motion.div>

      {/* Curious Satellite Tendril / Symbiont Orb drifting with loose spring */}
      <motion.div
        style={{
          x: satelliteSpringX,
          y: satelliteSpringY,
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
        }}
        animate={{
          scale: [0.9, 1.12, 0.95, 1.08, 0.9],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute w-[220px] h-[220px] -translate-x-32 translate-y-36 rounded-full pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full bg-gradient-to-tr from-violet-500/40 via-cyan-400/35 to-indigo-600/30 blur-2xl opacity-70"
          style={{ filter: "url(#blob)" }}
        />
      </motion.div>
    </div>
  );
}
