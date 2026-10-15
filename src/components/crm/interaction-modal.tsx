"use client";

import React, { useState } from "react";
import { addInteractionLog } from "@/app/actions/crm";
import { InteractionType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { X, Phone, Mail, Loader2, Calendar } from "lucide-react";

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
}

export function InteractionModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: InteractionModalProps) {
  const { data: session } = useSession();

  const [type, setType] = useState<InteractionType>(InteractionType.CALL);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("Active user session required to log interactions.");
      return;
    }

    if (!notes.trim()) {
      setError("Please provide interaction notes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await addInteractionLog(clientId, session.user.id, type, notes);
      if (!res.success) {
        throw new Error(res.error);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving interaction log";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Log Interaction</h3>
            <p className="text-xs text-slate-500 mt-0.5">Recording touchpoint with {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType(InteractionType.CALL)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  type === InteractionType.CALL
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-600/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>

              <button
                type="button"
                onClick={() => setType(InteractionType.EMAIL)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  type === InteractionType.EMAIL
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-600/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setType(InteractionType.MEETING)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  type === InteractionType.MEETING
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-600/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Meeting</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes &amp; Summary *</label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discussed scope revision, budget timeline, and architectural deliverables..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
