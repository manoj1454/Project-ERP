"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Timer,
  Play,
  Square,
  LogOut,
  Users,
  Briefcase,
  DollarSign,
  LayoutDashboard,
  Kanban,
  Clock,
} from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { SaveTimeEntryModal } from "@/components/time-tracking/save-time-entry-modal";

export function TopNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timer = useTimerStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        timer.tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const userRole = session?.user?.role;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/crm", label: "Clients CRM", icon: Users },
    { href: "/projects", label: "Projects Engine", icon: Briefcase },
    { href: "/kanban", label: "Kanban", icon: Kanban },
    { href: "/time-tracking", label: "Timesheet", icon: Clock },
    { href: "/assets", label: "Asset Vault", icon: Boxes },
    ...(userRole === "SUPERADMIN"
      ? [{ href: "/financials", label: "Financials", icon: DollarSign, badge: "Admin" }]
      : []),
  ];

  return (
    <header className="relative z-20 bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      {/* Brand & Main Nav */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              WORKSPACE{" "}
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                ERP
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Modern Enterprise Underlined/High Contrast) */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all rounded-md ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50/80 shadow-xs after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-indigo-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global Active Timer + User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Global Active Timer (Crisp Enterprise Pill) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <Timer
            className={`w-3.5 h-3.5 ${
              timer.isRunning ? "text-emerald-600 animate-pulse" : "text-slate-400"
            }`}
          />

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
              {formatTimer(timer.elapsedSeconds)}
            </span>
            {timer.taskName && (
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px] hidden lg:inline">
                • {timer.taskName}
              </span>
            )}
          </div>

          {timer.isRunning ? (
            <button
              onClick={() => timer.stopTimer()}
              className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition text-[10px] cursor-pointer"
              title="Stop timer and log entry"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
            </button>
          ) : timer.taskId ? (
            <button
              onClick={() =>
                timer.startTimer(
                  timer.taskId!,
                  timer.taskName || "Active Task",
                  timer.projectName || "General"
                )
              }
              className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition text-[10px] cursor-pointer"
              title="Resume timer"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          ) : null}
        </div>

        {/* Global Save Time Entry Modal mounted across all views */}
        <SaveTimeEntryModal />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">
              {session?.user?.name || "Staff Member"}
            </div>
            <div className="text-[10px] font-mono text-slate-500">{session?.user?.email}</div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              userRole === "SUPERADMIN"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : userRole === "EMPLOYEE"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {userRole}
          </span>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
