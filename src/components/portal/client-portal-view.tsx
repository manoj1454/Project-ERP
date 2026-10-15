"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  FileCheck2,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  CreditCard,
  LogOut,
  Building,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { simulateClientPayment } from "@/app/actions/portal";

interface TaskItem {
  id: string;
  name: string;
  status: string;
  priority: string;
  deadline?: Date | string | null;
}

interface PhaseItem {
  id: string;
  name: string;
  status: string;
  orderIndex: number;
  tasks: TaskItem[];
}

interface AssetVersionItem {
  id: string;
  versionNumber: number;
  fileUrl: string;
  changeLog?: string | null;
  createdAt: Date | string;
  uploader?: { name?: string | null; email: string } | null;
}

interface AssetItem {
  id: string;
  name: string;
  category: "BLUEPRINT" | "CONTRACT" | "RENDER";
  currentVersion?: AssetVersionItem | null;
  versions: AssetVersionItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentItem {
  id: string;
  amount: number;
  paymentDate: Date | string;
  method: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  issueDate: Date | string;
  dueDate: Date | string;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID";
  items: InvoiceItem[];
  payments: PaymentItem[];
}

interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  phases: PhaseItem[];
  assets: AssetItem[];
  invoices: InvoiceRecord[];
}

interface ClientData {
  id: string;
  name: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  projects: ProjectData[];
}

interface ClientPortalViewProps {
  client: ClientData;
  userRole?: string;
}

export function ClientPortalView({ client, userRole }: ClientPortalViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    client.projects[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState<"progress" | "assets" | "invoices">("progress");
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const activeProject =
    client.projects.find((p) => p.id === selectedProjectId) || client.projects[0];

  // Progress metrics calculation
  const allTasks = activeProject?.phases.flatMap((ph) => ph.tasks) || [];
  const completedTasks = allTasks.filter((t) => t.status === "DONE");
  const projectProgressPercent =
    allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // Invoice calculations
  const invoices = activeProject?.invoices || [];
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, inv) => {
    const paid = inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
    return acc + paid;
  }, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  const handlePayNow = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    setErrorMsg(null);

    const res = await simulateClientPayment(invoiceId);
    setPayingInvoiceId(null);

    if (res.success) {
      setPaymentSuccessId(invoiceId);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Payment simulation failed");
    }
  };

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "BLUEPRINT":
        return "text-cyan-700 bg-cyan-50 border-cyan-200";
      case "CONTRACT":
        return "text-amber-800 bg-amber-50 border-amber-200";
      case "RENDER":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
      {/* Top Client Portal Header */}
      <div className="max-w-7xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AUTHORIZED CLIENT PORTAL
              </span>
              {userRole === "SUPERADMIN" && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  Admin Preview Mode
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {client.companyName || client.name}
            </h1>
            <p className="text-xs text-slate-500">
              Client Partner: <span className="font-semibold text-slate-700">{client.name}</span> &bull;{" "}
              <span>{client.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {client.projects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-2xs"
            >
              {client.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition text-xs font-semibold cursor-pointer shadow-2xs"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Spotlight Split-Screen Layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* LEFT COLUMN: Spotlight Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Spotlight Hero Card: Project Pulse */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                Project Health Spotlight
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div>
              <span className="text-xs text-slate-300 block mb-1">Active Engagement</span>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                {activeProject?.name}
              </h2>
            </div>

            {/* Completion Dial / Progress */}
            <div className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Milestone Progress</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {projectProgressPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700 rounded-full"
                  style={{ width: `${projectProgressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>{completedTasks.length} / {allTasks.length} tasks done</span>
                <span>{activeProject?.phases.length || 0} phases</span>
              </div>
            </div>

            {/* Quick Financial Pulse */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[11px] text-slate-300 block">Total Settled</span>
                <span className="font-mono font-bold text-emerald-300">
                  ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[11px] text-slate-300 block">Outstanding</span>
                <span className="font-mono font-bold text-amber-300">
                  ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Vertical Modern Enterprise Stack) */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab("progress")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "progress"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>1. Project Progress &amp; Phases</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{projectProgressPercent}%</span>
            </button>

            <button
              onClick={() => setActiveTab("assets")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "assets"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4" />
                <span>2. Approved Deliverables</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-700">
                {activeProject?.assets.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4" />
                <span>3. Invoices &amp; Pay Now</span>
              </div>
              {totalOutstanding > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-800">
                  Due
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800">
                  Clear
                </span>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Content Panel (8 cols) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* TAB 1: MY PROJECT PROGRESS */}
            {activeTab === "progress" && (
              <motion.div
                key="tab-progress"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Phase Hierarchy &amp; Milestones
                    </h3>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {activeProject?.phases.length || 0} Total Phases
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Track deliverable execution across active development phases. Completed phases advance automatically as tasks reach completion.
                  </p>
                </div>

                <div className="space-y-3">
                  {activeProject?.phases.map((phase) => {
                    const phaseCompleted = phase.tasks.filter((t) => t.status === "DONE");
                    const phasePercent =
                      phase.tasks.length > 0
                        ? Math.round((phaseCompleted.length / phase.tasks.length) * 100)
                        : 0;
                    const isExpanded =
                      expandedPhaseId === phase.id || expandedPhaseId === null;

                    return (
                      <div
                        key={phase.id}
                        className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all"
                      >
                        {/* Phase Header */}
                        <div
                          onClick={() =>
                            setExpandedPhaseId(
                              expandedPhaseId === phase.id ? "none" : phase.id
                            )
                          }
                          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                                phasePercent === 100
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              }`}
                            >
                              {phase.orderIndex + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                                {phase.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {phase.tasks.length} {phase.tasks.length === 1 ? "task" : "tasks"} logged
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${phasePercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {phasePercent}%
                              </span>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                phasePercent === 100
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                              }`}
                            >
                              {phasePercent === 100 ? "Completed" : phase.status}
                            </span>

                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Task Breakdown */}
                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 border-t border-slate-100 divide-y divide-slate-100">
                            {phase.tasks.length === 0 ? (
                              <p className="text-xs text-slate-500 py-2.5 italic">
                                No individual tasks registered in this phase yet.
                              </p>
                            ) : (
                              phase.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="py-2.5 flex items-center justify-between text-xs gap-3"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {task.status === "DONE" ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span
                                      className={`${
                                        task.status === "DONE"
                                          ? "text-slate-500 line-through"
                                          : "text-slate-800 font-medium"
                                      }`}
                                    >
                                      {task.name}
                                    </span>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      task.status === "DONE"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : task.status === "IN_PROGRESS"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {task.status.replace("_", " ")}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 2: MY APPROVED ASSETS */}
            {activeTab === "assets" && (
              <motion.div
                key="tab-assets"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Approved Deliverables &amp; Asset Vault
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Download verified blueprints, legal contracts, and high-fidelity 3D renders.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {activeProject?.assets.length || 0} Assets Approved
                  </span>
                </div>

                {activeProject?.assets.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No assets published yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Deliverables will appear here as soon as approved versions are logged.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeProject?.assets.map((asset) => {
                      const activeVer = asset.currentVersion || asset.versions[0];
                      const catStyle = getCategoryStyles(asset.category);

                      return (
                        <div
                          key={asset.id}
                          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span
                                className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${catStyle}`}
                              >
                                {asset.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                v{activeVer?.versionNumber || 1}.0 Active
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                              {asset.name}
                            </h4>

                            {activeVer?.changeLog && (
                              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">
                                  Version notes:
                                </span>
                                <p className="line-clamp-2 text-slate-700">{activeVer.changeLog}</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {asset.versions.length}{" "}
                              {asset.versions.length === 1 ? "revision" : "revisions"} logged
                            </span>

                            {activeVer?.fileUrl && (
                              <a
                                href={activeVer.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: MY INVOICES & BILLING */}
            {activeTab === "invoices" && (
              <motion.div
                key="tab-invoices"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 block mb-1">Total Invoiced</span>
                    <p className="text-xl font-bold font-mono text-slate-900">
                      ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 block mb-1">Total Settled</span>
                    <p className="text-xl font-bold font-mono text-emerald-600">
                      ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 block mb-1">Outstanding Balance</span>
                    <p
                      className={`text-xl font-bold font-mono ${
                        totalOutstanding > 0 ? "text-amber-600" : "text-slate-400"
                      }`}
                    >
                      ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Invoices List */}
                {invoices.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No invoices issued</p>
                    <p className="text-xs text-slate-500 mt-1">
                      All deliverables are currently up to date without outstanding statements.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => {
                      const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                      const balance = Math.max(0, inv.totalAmount - paid);
                      const isPaying = payingInvoiceId === inv.id;
                      const isSuccess = paymentSuccessId === inv.id;

                      return (
                        <div
                          key={inv.id}
                          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                                <Receipt className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold font-mono text-slate-900">
                                    {inv.invoiceNumber}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                      inv.status === "PAID"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : inv.status === "PARTIAL"
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Issued: {new Date(inv.issueDate).toLocaleDateString()} &bull; Due:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {new Date(inv.dueDate).toLocaleDateString()}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-slate-500 block">Total Statement</span>
                              <span className="text-base font-bold font-mono text-slate-900">
                                ${inv.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Line items preview */}
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 space-y-1.5 text-xs">
                            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                              Deliverable Line Items
                            </span>
                            {inv.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-slate-700"
                              >
                                <span className="truncate pr-2">{item.description}</span>
                                <span className="font-mono text-slate-900 font-semibold shrink-0">
                                  {item.quantity} hrs &times; ${item.unitPrice} = ${item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Footer with Pay Now action */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="text-xs">
                              <span className="text-slate-500">Remaining Balance: </span>
                              <span
                                className={`font-mono font-bold ${
                                  balance === 0 ? "text-emerald-600" : "text-amber-600 text-sm"
                                }`}
                              >
                                ${balance.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {balance > 0 ? (
                                <button
                                  onClick={() => handlePayNow(inv.id)}
                                  disabled={isPaying || isSuccess}
                                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {isPaying ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      Processing Settlement...
                                    </>
                                  ) : isSuccess ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                      Settlement Confirmed!
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3.5 h-3.5" />
                                      Pay Now (${balance.toFixed(2)})
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Fully Settled &amp; Paid</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
