"use client";

import React, { useState, useEffect } from "react";
import { generateInvoiceFromUnbilledTime } from "@/app/actions/invoicing";
import {
  X,
  Receipt,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface UnbilledProjectGroup {
  project: {
    id: string;
    name: string;
    client: { id: string; name: string; companyName: string | null; email: string };
  };
  entries: Array<{
    id: string;
    taskName: string;
    userName: string;
    durationMinutes: number;
    hours: number;
    notes: string | null;
    startTime: Date;
  }>;
  totalMinutes: number;
  totalHours: number;
}

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInvoice?: unknown) => void;
  unbilledProjects: UnbilledProjectGroup[];
  selectedProjectId?: string | null;
}

export function InvoiceGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  unbilledProjects,
  selectedProjectId,
}: InvoiceGeneratorModalProps) {
  const [projectId, setProjectId] = useState<string>(
    selectedProjectId || unbilledProjects[0]?.project.id || ""
  );
  const [hourlyRate, setHourlyRate] = useState<number>(120);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProjectId) {
      setProjectId(selectedProjectId);
    } else if (unbilledProjects.length > 0 && !projectId) {
      setProjectId(unbilledProjects[0].project.id);
    }
  }, [selectedProjectId, unbilledProjects, projectId]);

  if (!isOpen) return null;

  const currentProjectGroup = unbilledProjects.find((g) => g.project.id === projectId);
  const totalHours = currentProjectGroup?.totalHours || 0;
  const estimatedTotal = Number((totalHours * hourlyRate).toFixed(2));

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError("Please select a project with unbilled time entries.");
      return;
    }
    if (hourlyRate <= 0) {
      setError("Hourly rate must be greater than zero.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await generateInvoiceFromUnbilledTime({
      projectId,
      hourlyRate,
      dueDate,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setError(res.error || "Failed to generate invoice.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Automated Invoicing Pipeline
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Generate Project Invoice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Converts unbilled logged time entries directly into an itemized, client-ready invoice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Project to Bill
            </label>
            {unbilledProjects.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-medium">
                No unbilled billable hours detected in any project. Start a timer or log time entries first!
              </div>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
              >
                {unbilledProjects.map((group) => (
                  <option key={group.project.id} value={group.project.id}>
                    {group.project.name} &bull; {group.project.client.name} ({group.totalHours} hrs unbilled)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pricing & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hourly Billing Rate ($ / hour)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pipeline Summary Calculation Card */}
          {currentProjectGroup && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-800">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Billable Items Summary
                </span>
                <span className="font-mono bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded text-indigo-800 font-bold">
                  {currentProjectGroup.entries.length} entries to bill
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-200 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Total Hours</div>
                  <div className="text-base font-bold text-slate-900 font-mono">{totalHours} hrs</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Rate Applied</div>
                  <div className="text-base font-bold text-slate-900 font-mono">${hourlyRate}/hr</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Invoice Total</div>
                  <div className="text-base font-bold text-emerald-600 font-mono">
                    ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Task breakdown list */}
              <div className="pt-2 border-t border-indigo-200 max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {currentProjectGroup.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <div className="truncate mr-2">
                      <span className="text-slate-900 font-bold">{entry.taskName}</span>
                      <span className="text-slate-500 ml-1.5 font-medium">({entry.userName})</span>
                    </div>
                    <div className="font-mono text-indigo-700 font-semibold shrink-0">
                      {entry.hours} hrs &bull; ${(entry.hours * hourlyRate).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Service Notes or Memo (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Milestone billing for infrastructure audit and database optimization."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white resize-none"
            />
          </div>

          {/* Atomic Link Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Generating this invoice will atomically mark all {currentProjectGroup?.entries.length || 0}{" "}
              time entries as <span className="font-mono text-emerald-700 font-bold">isBilled = true</span>.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !currentProjectGroup || currentProjectGroup.entries.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Invoice...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Invoice (${estimatedTotal.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
