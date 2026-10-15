"use client";

import React, { useState } from "react";
import { updateTimeEntry } from "@/app/actions/time-tracking";
import { X, Clock, DollarSign, FileText, Loader2 } from "lucide-react";

interface TimeEntryRecord {
  id: string;
  durationMinutes: number | null;
  isBillable: boolean;
  notes: string | null;
  task: {
    name: string;
    phase: {
      project: { name: string };
    };
  };
}

interface EditTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entry: TimeEntryRecord;
}

export function EditTimeEntryModal({
  isOpen,
  onClose,
  onSuccess,
  entry,
}: EditTimeEntryModalProps) {
  const [durationMinutes, setDurationMinutes] = useState(entry.durationMinutes || 30);
  const [isBillable, setIsBillable] = useState(entry.isBillable);
  const [notes, setNotes] = useState(entry.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await updateTimeEntry(entry.id, {
        durationMinutes: Number(durationMinutes),
        isBillable,
        notes,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update entry";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Edit Time Entry</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {entry.task.name} • {entry.task.phase.project.name}
            </p>
          </div>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Duration (Minutes) *
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              = {(durationMinutes / 60).toFixed(2)} hours
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">Billable Entry</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBillable(!isBillable)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                isBillable
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isBillable ? "BILLABLE ✓" : "NON-BILLABLE"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
