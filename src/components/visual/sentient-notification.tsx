"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore, SentientNotificationItem } from "@/store/useNotificationStore";
import { CheckCircle2, Sparkles, X } from "lucide-react";

function SingleSentientNotification({
  item,
  onDismiss,
}: {
  item: SentientNotificationItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isPhase = item.type === "phase_completed";
  const isPayment = item.type === "payment";

  // Glowing accent themes based on notification type
  const themeGlow = isPhase
    ? "from-emerald-500 to-indigo-600 shadow-emerald-500/25"
    : isPayment
    ? "from-indigo-600 to-cyan-500 shadow-cyan-500/25"
    : "from-indigo-600 to-violet-600 shadow-indigo-500/25";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 50, scale: 0.92, transition: { duration: 0.35, ease: "easeIn" } }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        mass: 1,
      }}
      className="pointer-events-auto relative flex items-center gap-3.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl p-4 max-w-sm w-full overflow-hidden"
      style={{
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* Background Micro-Living Entity Aura */}
      <div className="absolute -left-4 -top-4 w-28 h-28 pointer-events-none opacity-40 blur-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400" />

      {/* Tiny Sentient Living Blob Herald */}
      <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
        <motion.div
          animate={{
            scale: [1, 1.18, 0.94, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${themeGlow} blur-sm opacity-80`}
        />

        <motion.div
          animate={{
            scale: [0.95, 1.08, 0.95],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr ${themeGlow} shadow-lg flex items-center justify-center text-white`}
        >
          {isPhase ? (
            <CheckCircle2 className="w-4 h-4 text-white drop-shadow-sm" />
          ) : (
            <Sparkles className="w-4 h-4 text-white drop-shadow-sm" />
          )}
        </motion.div>
      </div>

      {/* Notification Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
            Living Soul
          </span>
          <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
        </div>
        <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2 font-medium">
          {item.message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function SentientNotification() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((item) => (
          <SingleSentientNotification
            key={item.id}
            item={item}
            onDismiss={() => removeNotification(item.id)}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
}
