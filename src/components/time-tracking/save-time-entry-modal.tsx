"use client";

import React, { useState } from "react";
import { useTimerStore } from "@/store/useTimerStore";
import { useSession } from "next-auth/react";
import { createTimeEntry } from "@/app/actions/time-tracking";
import {
  Timer,
  X,
  DollarSign,
  FileText,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export function SaveTimeEntryModal() {
  const { data: session } = useSession();
  const timer = useTimerStore();

  const [notes, setNotes] = useState("");
  const [isBillable, setIsBillable] = useState(timer.isBillable);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!timer.isSaveModalOpen || !timer.taskId) {
    return null;
  }

  const durationSeconds = timer.stoppedDurationSeconds || timer.elapsedSeconds;
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = (durationMinutes / 60).toFixed(2);

  const startTimeDate = timer.startTime ? new Date(timer.startTime) : new Date(Date.now() - durationSeconds * 1000);
  const endTimeDate = new Date();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("Active session required to save time entry.");
      return;
    }

    if (!timer.taskId) {
      setError("Task ID is missing.");
      return;
    }

    const targetTaskId = timer.taskId;

    setLoading(true);
    setError(null);

    try {
      const res = await createTimeEntry({
        userId: session.user.id,
        taskId: targetTaskId,
        startTime: startTimeDate.toISOString(),
        endTime: endTimeDate.toISOString(),
        durationMinutes,
        isBillable,
        notes,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      timer.resetTimer();
      setNotes("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save time entry";
      setError(msg);
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (confirm("Discard this recorded time session?")) {
      timer.resetTimer();
      setNotes("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Log Time Entry</h3>
              <p className="text-xs text-slate-500 font-medium">
                Session ended • Review and submit to Timesheet
              </p>
            </div>
          </div>
          <button
            onClick={() => timer.closeSaveModal()}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Task & Project Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono font-semibold">PROJECT</span>
              <span className="font-bold text-slate-900 truncate max-w-[220px]">
                {timer.projectName || "General Operations"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 font-mono font-semibold">TASK</span>
              <span className="font-bold text-indigo-700 truncate max-w-[220px]">
                {timer.taskName || "Active Task"}
              </span>
            </div>
          </div>

          {/* Time & Duration Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Logged Duration</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {hours} hrs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                ({durationMinutes} minutes recorded)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Time Window</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                {startTimeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} →{" "}
                {endTimeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {startTimeDate.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Billable Toggle (Requirement 3: Billable Logic) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg border ${isBillable ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Billable Time Entry</div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isBillable ? "Will be included in client invoicing" : "Internal overhead / non-billable hours"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBillable(!isBillable)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                isBillable
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isBillable ? "BILLABLE ✓" : "NON-BILLABLE"}
            </button>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Notes & Summary
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of code changes, debugging, architecture decisions, or meetings..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => timer.closeSaveModal()}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to Timesheet</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
