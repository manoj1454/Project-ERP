"use client";

import React, { useState } from "react";
import { deleteTimeEntry } from "@/app/actions/time-tracking";
import { EditTimeEntryModal } from "@/components/time-tracking/edit-time-entry-modal";
import { ManualEntryModal } from "@/components/time-tracking/manual-entry-modal";
import {
  Clock,
  DollarSign,
  Plus,
  Search,
  Briefcase,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TimeEntryData {
  id: string;
  userId: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  isBillable: boolean;
  notes: string | null;
  isBilled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  task: {
    id: string;
    name: string;
    status: string;
    priority: string;
    phase: {
      id: string;
      name: string;
      project: {
        id: string;
        name: string;
        budget: number | null;
      };
    };
  };
}

interface TimesheetTableProps {
  initialEntries: TimeEntryData[];
  availableTasks: { id: string; name: string; phase: { project: { name: string } } }[];
  onRefresh: () => void;
}

export function TimesheetTable({
  initialEntries,
  availableTasks,
  onRefresh,
}: TimesheetTableProps) {
  const [entries, setEntries] = useState<TimeEntryData[]>(initialEntries);
  const [billableFilter, setBillableFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [editingEntry, setEditingEntry] = useState<TimeEntryData | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  React.useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const filtered = entries.filter((e) => {
    const matchesBillable =
      billableFilter === "ALL"
        ? true
        : billableFilter === "BILLABLE"
        ? e.isBillable
        : billableFilter === "NON_BILLABLE"
        ? !e.isBillable
        : billableFilter === "UNBILLED"
        ? !e.isBilled && e.isBillable
        : true;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      e.task.name.toLowerCase().includes(searchLower) ||
      e.task.phase.project.name.toLowerCase().includes(searchLower) ||
      e.user.name.toLowerCase().includes(searchLower) ||
      (e.notes && e.notes.toLowerCase().includes(searchLower));

    return matchesBillable && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Delete this time entry?")) {
      await deleteTimeEntry(id);
      onRefresh();
    }
  };

  // Metrics
  const totalMinutes = entries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  const billableMinutes = entries
    .filter((e) => e.isBillable)
    .reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  const unbilledMinutes = entries
    .filter((e) => e.isBillable && !e.isBilled)
    .reduce((acc, e) => acc + (e.durationMinutes || 0), 0);

  const totalHours = (totalMinutes / 60).toFixed(1);
  const billableHours = (billableMinutes / 60).toFixed(1);
  const unbilledHours = (unbilledMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Total Hours Logged</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalHours} hrs</div>
          <div className="text-[10px] text-slate-400 mt-1">{entries.length} entries recorded</div>
        </div>

        <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Billable Hours</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{billableHours} hrs</div>
          <div className="text-[10px] text-slate-400 mt-1">Client billable deliverables</div>
        </div>

        <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Unbilled Hours</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{unbilledHours} hrs</div>
          <div className="text-[10px] text-slate-400 mt-1">Ready for invoice pipeline</div>
        </div>

        <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Billable Utilization</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600">
            {totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Of total recorded effort</div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {[
            { id: "ALL", label: "All Hours" },
            { id: "BILLABLE", label: "Billable" },
            { id: "NON_BILLABLE", label: "Non-Billable" },
            { id: "UNBILLED", label: "Unbilled Pipeline" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBillableFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                billableFilter === tab.id
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Manual Log Button */}
        <div className="flex items-center gap-3">
          <div className="relative sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, notes, user..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-xs"
            />
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* High-Density Timesheet Table */}
      <div className="enterprise-card bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Date / Time</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Team Member</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Project & Task</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Duration</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Status & Billing</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Work Notes</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No time tracking entries found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const startDate = new Date(entry.startTime);
                  const durationMins = entry.durationMinutes || 0;
                  const hoursDecimal = (durationMins / 60).toFixed(2);

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">
                          {startDate.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase">
                            {entry.user.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-semibold">{entry.user.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {entry.user.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project & Task */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 tracking-tight">
                          {entry.task.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                          <Briefcase className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-xs">
                            {entry.task.phase.project.name}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-emerald-600">
                          {hoursDecimal} hrs
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {durationMins} min
                        </div>
                      </td>

                      {/* Billable & Billed Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {entry.isBillable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              BILLABLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              NON-BILLABLE
                            </span>
                          )}

                          {entry.isBilled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              BILLED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              UNBILLED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {entry.notes ? (
                          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                            {entry.notes}
                          </p>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            No notes recorded
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            title="Edit Time Entry"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Delete Time Entry"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <EditTimeEntryModal
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={onRefresh}
          entry={editingEntry}
        />
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={onRefresh}
        tasks={availableTasks}
      />
    </div>
  );
}
