"use client";

import React, { useState } from "react";
import { createProject, ProjectInput } from "@/app/actions/projects";
import { ProjectStatus } from "@prisma/client";
import { X, Briefcase, DollarSign, Calendar, FileText, UserCheck, Loader2 } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: { id: string; name: string; companyName: string | null }[];
}

export function ProjectModal({ isOpen, onClose, onSuccess, clients }: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectInput>({
    name: "",
    clientId: clients[0]?.id || "",
    description: "",
    budget: undefined,
    startDate: "",
    endDate: "",
    status: ProjectStatus.PLANNING,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!formData.clientId) {
      setError("Please select a client for this project.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createProject(formData);
      if (!res.success) {
        throw new Error(res.error);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating project";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create Enterprise Project</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Module C: Project Engine &amp; Automatic Phase Provisioning
            </p>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Name *</label>
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. NextGen Core Cloud Architecture"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Linked Client Organization *</label>
            <div className="relative">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              >
                <option value="" disabled>
                  Select a Client from CRM...
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Budget (USD)</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="50000.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProjectStatus })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              >
                <option value={ProjectStatus.PLANNING}>
                  PLANNING (Scoping &amp; Requirements)
                </option>
                <option value={ProjectStatus.ACTIVE}>
                  ACTIVE (In Execution)
                </option>
                <option value={ProjectStatus.COMPLETED}>
                  COMPLETED (Delivered)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Estimated End Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description &amp; Scope</label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key deliverables, technological requirements, and business goals..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] leading-relaxed">
            ℹ Automatically scaffolds 4 standard enterprise phases: <strong>Concept &amp; Discovery</strong>, <strong>Design &amp; Architecture</strong>, <strong>Implementation</strong>, and <strong>QA &amp; Launch</strong>.
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
              <span>Launch Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
