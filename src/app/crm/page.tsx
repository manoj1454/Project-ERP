import React from "react";
import { prisma } from "@/lib/prisma";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { ClientTable } from "@/components/crm/client-table";
import { Users, UserPlus, FolderKanban, TrendingUp } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const clients = await prisma.client.findMany({
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          budget: true,
        },
      },
      interactionLogs: {
        orderBy: { timestamp: "desc" },
        take: 3,
      },
      _count: {
        select: { projects: true, interactionLogs: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const leadClients = clients.filter((c) => c.status === "LEAD").length;
  const totalProjects = clients.reduce((acc, c) => acc + c._count.projects, 0);

  async function handleRefresh() {
    "use server";
    revalidatePath("/crm");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <TopNavbar />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                MODULE B
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Client Relationship Management
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Customer Accounts &amp; CRM Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer Master Directory, Relationship Status, and Interaction Audit Trails
            </p>
          </div>
        </div>

        {/* Metrics Grid (Crisp Landed Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
              <span className="font-medium">Total Accounts</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{totalClients}</div>
            <div className="text-[11px] text-slate-500 mt-1">Clients registered in CRM</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
              <span className="font-medium">Active Partners</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">{activeClients}</div>
            <div className="text-[11px] text-slate-500 mt-1">Under ongoing contracts</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
              <span className="font-medium">Qualified Leads</span>
              <UserPlus className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono">{leadClients}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pre-contract discovery phase</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
              <span className="font-medium">Linked Projects</span>
              <FolderKanban className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-sky-600 font-mono">{totalProjects}</div>
            <div className="text-[11px] text-slate-500 mt-1">Across all active phases</div>
          </div>
        </div>

        {/* High-Density Client Table */}
        <ClientTable initialClients={clients} onRefresh={handleRefresh} />
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 font-mono text-center shadow-2xs">
        Workspace ERP &bull; Module B: Client CRM &bull; Synchronized with Supabase
      </footer>
    </div>
  );
}
