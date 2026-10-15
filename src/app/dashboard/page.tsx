"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  DollarSign,
  Briefcase,
  Users,
  Timer,
  Lock,
  Boxes,
  Kanban,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { TopNavbar } from "@/components/navigation/top-navbar";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session } = useSession();
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

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPERADMIN":
        return {
          label: "SUPERADMIN",
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          desc: "Full System Clearance & Financial Controller",
        };
      case "EMPLOYEE":
        return {
          label: "EMPLOYEE",
          bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
          desc: "Internal Engineering Staff & Resource Contributor",
        };
      case "CLIENT":
        return {
          label: "CLIENT",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
          desc: "External Client Stakeholder • Portal Restricted",
        };
      default:
        return {
          label: "AUTHENTICATED",
          bg: "bg-slate-100 border-slate-200 text-slate-800",
          desc: "Active Session User",
        };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <TopNavbar />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Spotlight Layout: Split-screen approach */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SPOTLIGHT PANEL (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Spotlight Card: Enterprise Operations Pulse */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-md border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-300 px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/50">
                    Live Operational Spotlight
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Operations Matrix
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Integrated enterprise workspace with real-time RBAC, persistent timers, and billing automation.
                  </p>
                </div>

                {/* Spotlight Key Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] text-slate-300 block">System Clearance</span>
                    <span className="text-sm font-bold text-amber-300 font-mono">
                      {roleInfo.label}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] text-slate-300 block">Core Modules</span>
                    <span className="text-sm font-bold text-emerald-300 font-mono">
                      6 / 6 Live
                    </span>
                  </div>
                </div>

                {/* Spotlight Live Timer Widget */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Timer className="w-3.5 h-3.5 text-indigo-400" />
                      Active Task Timer
                    </span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      {timer.isRunning ? "RUNNING" : "STANDBY"}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white tracking-wider">
                    {formatTimer(timer.elapsedSeconds)}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {timer.taskName ? `Target: ${timer.taskName}` : "No task actively clocked"}
                  </p>
                </div>
              </div>
            </div>

            {/* User Session Profile Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Session
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {session?.user?.name || "Authenticated User"}
                </h3>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {roleInfo.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">ID: {session?.user?.id?.slice(0, 12)}...</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs font-semibold text-slate-600 hover:text-red-600 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT PANEL (8 cols): Modules Matrix */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Enterprise Modules &amp; Engines
                </h2>
                <p className="text-xs text-slate-500">
                  Select a workflow module to launch operational pipelines.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Strict RBAC Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. FINANCIALS (SUPERADMIN ONLY) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      SUPERADMIN ONLY
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Financials &amp; Invoicing
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Module F: Automated invoicing pipeline from unbilled time entries, payment settlement, and accounts receivable metrics.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  {userRole === "SUPERADMIN" ? (
                    <Link
                      href="/financials"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                    >
                      <span>Open Financials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Clearance Restricted</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 2. PROJECTS & HIERARCHY (SUPERADMIN & EMPLOYEE) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      STAFF ACCESS
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Project Engine &amp; CRM
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Modules B &amp; C: Client CRM customer profiles, Project &rarr; Phase &rarr; Task hierarchy with automated phase completion triggers.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/projects"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                  >
                    <span>Launch Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3. KANBAN BOARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                      <Kanban className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      OPTIMISTIC UI
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Kanban Board
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Step 5: Drag-and-drop task workflows with dnd-kit, TanStack Query optimistic updates, and instant snap-back error rollback.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/kanban"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                  >
                    <span>Open Kanban</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 4. ASSET MANAGER & VAULT */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      VERSIONED STORAGE
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Asset Manager &amp; Vault
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Module D: Immutable versioned blueprints, contracts, and 3D renders with changelog audits and zero file overwriting.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/assets"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                  >
                    <span>Open Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 5. TIME-TRACKING & TIMESHEET */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      ZUSTAND PERSIST
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Time-Tracking &amp; Timesheets
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Module E: Global persistent timer in TopNavbar, automatic database TimeEntry logging, and weekly timesheet grid.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/time-tracking"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                  >
                    <span>Open Timesheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 6. CLIENT PORTAL */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      CLIENT PORTAL
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Client Portal View
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Module G: External client hub with Project Hierarchy progress, approved asset downloads, and instant invoice payment settlement.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/portal"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 transition"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 font-mono text-center shadow-2xs">
        Workspace ERP &bull; Modern Enterprise Edition &bull; RBAC Verified &bull; NextAuth JWT Session
      </footer>
    </div>
  );
}
