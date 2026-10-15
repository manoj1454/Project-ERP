"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProjectModal } from "@/components/projects/project-modal";
import { ProjectStatus } from "@prisma/client";
import {
  Plus,
  Search,
  Building,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  budget: number | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  client: { id: string; name: string; companyName: string | null; email: string };
  phases: {
    id: string;
    tasks: { id: string; status: string; priority: string }[];
  }[];
  _count: {
    phases: number;
    assets: number;
    invoices: number;
  };
}

interface ProjectCardListProps {
  initialProjects: ProjectRecord[];
  clients: { id: string; name: string; companyName: string | null }[];
  onRefresh: () => void;
}

export function ProjectCardList({ initialProjects, clients, onRefresh }: ProjectCardListProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const filtered = projects.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === (statusFilter as ProjectStatus);
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(searchLower) ||
      p.client.name.toLowerCase().includes(searchLower) ||
      (p.client.companyName && p.client.companyName.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const activeCount = projects.filter((p) => p.status === ProjectStatus.ACTIVE).length;
  const planningCount = projects.filter((p) => p.status === ProjectStatus.PLANNING).length;
  const completedCount = projects.filter((p) => p.status === ProjectStatus.COMPLETED).length;

  return (
    <div className="space-y-6">
      {/* Page Title & New Project Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              MODULE C
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Project Operations Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Enterprise Projects &amp; Deliverables
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverable Milestones, Lifecycle Phases, and Work Breakdown Hierarchy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metrics Row (Crisp White Landed Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-medium">Total Portfolio Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Contracted portfolio budget</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-medium">In Execution</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active client deliverables</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-medium">Planning &amp; Scoping</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{planningCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pre-kickoff phase</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-medium">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-600 font-mono">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Completed successfully</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 overflow-x-auto">
          {(["ALL", "ACTIVE", "PLANNING", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-slate-700 mb-2">No projects found.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              Create First Project
            </button>
          </div>
        ) : (
          filtered.map((proj) => {
            const allTasks = proj.phases.flatMap((p) => p.tasks);
            const doneTasks = allTasks.filter((t) => t.status === "DONE");
            const progress = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Client & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{proj.client.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        proj.status === "ACTIVE"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : proj.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Project Name & Description */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || "No project description provided."}
                  </p>
                </div>

                {/* Bottom Progress & Stats */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{proj.phases.length} Phases</span>
                    </div>

                    <div className="font-mono text-slate-900 font-bold">
                      {proj.budget ? `$${proj.budget.toLocaleString()}` : "Budget N/A"}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-mono text-slate-800 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-800 transition pt-0.5">
                    <span className="flex items-center gap-1">
                      View Hierarchy &amp; Tasks <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        clients={clients}
      />
    </div>
  );
}
