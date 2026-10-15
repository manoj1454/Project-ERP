import React from "react";
import { prisma } from "@/lib/prisma";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Kanban, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const taskStats = await prisma.task.groupBy({
    by: ["status"],
    _count: true,
  });

  const getCount = (status: string) => {
    return taskStats.find((s) => s.status === status)?._count || 0;
  };

  const todoCount = getCount("TODO");
  const inProgressCount = getCount("IN_PROGRESS");
  const reviewCount = getCount("REVIEW");
  const doneCount = getCount("DONE");
  const totalTasks = todoCount + inProgressCount + reviewCount + doneCount;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <TopNavbar />

      <main className="relative z-10 max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                <Kanban className="w-6 h-6 text-indigo-600" />
                <span>Kanban Operations Board</span>
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                STEP 5: DND & OPTIMISTIC UI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Drag-and-Drop Workflow Orchestration • Powered by dnd-kit & TanStack Query Optimistic Cache
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold self-start sm:self-auto shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Optimistic Sync</span>
          </div>
        </div>

        {/* Metric Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="text-[11px] font-medium text-slate-500">Total Workload</div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalTasks} Tasks</div>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="text-[11px] font-medium text-slate-500">To Do</div>
            <div className="text-2xl font-bold text-slate-700 font-mono mt-1">{todoCount}</div>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="text-[11px] font-medium text-slate-500">In Progress</div>
            <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{inProgressCount}</div>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="text-[11px] font-medium text-slate-500">Under Review</div>
            <div className="text-2xl font-bold text-purple-600 font-mono mt-1">{reviewCount}</div>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="text-[11px] font-medium text-slate-500">Completed</div>
            <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{doneCount}</div>
          </div>
        </div>

        {/* The Drag-and-Drop Kanban Board */}
        <KanbanBoard initialProjects={projects} />
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 font-mono text-center">
        Workspace ERP • Step 5: Kanban Interface • TanStack Query Optimistic State Engine
      </footer>
    </div>
  );
}
