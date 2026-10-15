import React from "react";
import { prisma } from "@/lib/prisma";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { TimesheetTable } from "@/components/time-tracking/timesheet-table";
import { Clock, Sparkles } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function TimeTrackingPage() {
  const [entries, tasks] = await Promise.all([
    prisma.timeEntry.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
            phase: {
              select: {
                id: true,
                name: true,
                project: {
                  select: { id: true, name: true, budget: true },
                },
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.task.findMany({
      select: {
        id: true,
        name: true,
        phase: {
          select: {
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  async function handleRefresh() {
    "use server";
    revalidatePath("/time-tracking");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar with live persistent timer */}
      <TopNavbar />

      <main className="relative z-10 max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-indigo-600" />
                <span>Timesheet & Work Logs</span>
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                MODULE E: TIME-TRACKING
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Active Session Timer • Billable vs Non-Billable Allocation • Financial Billing Readiness
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-semibold self-start sm:self-auto shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>TopNavbar Timer Connected</span>
          </div>
        </div>

        {/* Timesheet Data Table & Statistics */}
        <TimesheetTable
          initialEntries={entries}
          availableTasks={tasks}
          onRefresh={handleRefresh}
        />
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 font-mono text-center">
        Workspace ERP • Module E: Time-Tracking Engine • Synchronized with Supabase
      </footer>
    </div>
  );
}
