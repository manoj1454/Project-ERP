"use client";

import React from "react";
import { motion } from "framer-motion";

interface OrganicProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  heightClass?: string;
  showHeartbeat?: boolean;
  barColor?: string;
}

export function OrganicProgressBar({
  progress,
  className = "",
  heightClass = "h-2",
  showHeartbeat = true,
  barColor = "from-indigo-600 via-indigo-500 to-violet-500",
}: OrganicProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className={`relative w-full ${heightClass} bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 ${className}`}
    >
      {/* Animated Elastic Fill Bar */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{
          type: "spring",
          stiffness: 65,
          damping: 14,
          mass: 0.8,
        }}
        className={`relative h-full rounded-full bg-gradient-to-r ${barColor} shadow-sm`}
        style={{ transform: "translate3d(0, 0, 0)", willChange: "width" }}
      >
        {/* Subtle Liquid Shimmer Reflection */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.2,
          }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
        />

        {/* Leading-Edge Living Heartbeat Pulse Bulb */}
        {showHeartbeat && clampedProgress > 3 && clampedProgress < 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 flex items-center justify-center">
            {/* Soft Bioluminescent Halo */}
            <motion.div
              animate={{
                scale: [1, 1.8, 1, 1.5, 1],
                opacity: [0.4, 0.9, 0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.3, 0.45, 1], // Double heartbeat rhythm
              }}
              className="absolute w-3.5 h-3.5 rounded-full bg-indigo-400 blur-[2px]"
            />
            {/* Core Living Pulse Bead */}
            <motion.div
              animate={{
                scale: [0.9, 1.35, 0.95, 1.2, 0.9],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.3, 0.45, 1],
              }}
              className="relative z-10 w-2 h-2 rounded-full bg-white shadow-xs"
            />
          </div>
        )}

        {/* Complete State Glow */}
        {clampedProgress === 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-emerald-400/25 rounded-full"
          />
        )}
      </motion.div>
    </div>
  );
}
