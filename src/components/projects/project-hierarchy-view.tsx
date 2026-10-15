"use client";

import React, { useState } from "react";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { updateTaskStatus, addSubTask, toggleSubTask } from "@/app/actions/projects";
import { PhaseModal } from "@/components/projects/phase-modal";
import { TaskModal } from "@/components/projects/task-modal";
import { useTimerStore } from "@/store/useTimerStore";
import {
  Layers,
  Plus,
  CheckCircle2,
  User,
  Calendar,
  Play,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { OrganicProgressBar } from "@/components/visual/organic-progress-bar";
import { CuriousCard } from "@/components/visual/curious-card";
import { useNotificationStore } from "@/store/useNotificationStore";

interface SubTaskRecord {
  id: string;
  name: string;
  isCompleted: boolean;
}

interface TaskRecord {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: Date | null;
  assignee: { id: string; name: string; email: string } | null;
  subTasks: SubTaskRecord[];
}

interface PhaseRecord {
  id: string;
  name: string;
  orderIndex: number;
  status: string;
  tasks: TaskRecord[];
}

interface ProjectHierarchyViewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    budget: number | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    client: { id: string; name: string; companyName: string | null; email: string };
    phases: PhaseRecord[];
  };
  assignees: { id: string; name: string; email: string; role: string }[];
  onRefresh: () => void;
}

export function ProjectHierarchyView({ project, assignees, onRefresh }: ProjectHierarchyViewProps) {
  const timer = useTimerStore();
  const { notify } = useNotificationStore();

  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<{ id: string; name: string } | null>(null);

  const [newSubTaskName, setNewSubTaskName] = useState<{ [taskId: string]: string }>({});
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null);
  const [phaseSuccessAlert, setPhaseSuccessAlert] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, phaseName: string) => {
    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      if (res.phaseCompleted) {
        setPhaseSuccessAlert(
          `Phase "${phaseName}" has reached 100% completion! All tasks resolved.`
        );
        notify(
          "Phase Completed! 🚀",
          `Phase "${phaseName}" reached 100% completion! Milestone achieved.`,
          "phase_completed"
        );
      }
      onRefresh();
    } else {
      alert("Failed to update status: " + res.error);
    }
  };

  const handleAddSubTask = async (taskId: string) => {
    const name = newSubTaskName[taskId]?.trim();
    if (!name) return;

    const res = await addSubTask(taskId, name);
    if (res.success) {
      setNewSubTaskName((prev) => ({ ...prev, [taskId]: "" }));
      setAddingSubTaskFor(null);
      onRefresh();
    } else {
      alert("Failed to add subtask: " + res.error);
    }
  };

  const handleToggleSubTask = async (subTaskId: string, currentStatus: boolean) => {
    const res = await toggleSubTask(subTaskId, !currentStatus);
    if (res.success) {
      onRefresh();
    }
  };

  // Metrics calculation
  const allTasks = project.phases.flatMap((p) => p.tasks);
  const doneTasks = allTasks.filter((t) => t.status === TaskStatus.DONE);
  const overallProgress = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-50 text-red-700 border border-red-200">
            HIGH
          </span>
        );
      case TaskPriority.MED:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
            MED
          </span>
        );
      case TaskPriority.LOW:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hierarchy Progression Alert */}
      {phaseSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{phaseSuccessAlert}</span>
          </div>
          <button
            onClick={() => setPhaseSuccessAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Project Overview Card (Crisp White Landed Card) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                PROJECT SOURCE
              </span>
              <span>&bull;</span>
              <span>Client: {project.client.name} {project.client.companyName ? `(${project.client.companyName})` : ""}</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {project.description || "No project description specified."}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsPhaseModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phase</span>
            </button>
          </div>
        </div>

        {/* Project Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">Total Budget</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {project.budget ? `$${project.budget.toLocaleString()}` : "Unspecified"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">Milestone Phases</div>
            <div className="text-base font-bold text-indigo-600 font-mono mt-0.5">
              {project.phases.length} Phases
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">Task Completion</div>
            <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
              {doneTasks.length} / {allTasks.length} Done ({overallProgress}%)
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">Lifecycle Status</div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Living Organic Progress Bar */}
        <div className="mt-4">
          <OrganicProgressBar progress={overallProgress} heightClass="h-2" />
        </div>
      </div>

      {/* The Hierarchy Flow: Phases -> Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-600 flex items-center gap-2 font-bold">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Project Hierarchy (Phase &rarr; Tasks)</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {project.phases.length} Total Phases
          </span>
        </div>

        {project.phases.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-600 mb-3">No phases have been defined for this project yet.</p>
            <button
              onClick={() => setIsPhaseModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              Add First Phase
            </button>
          </div>
        ) : (
          project.phases.map((phase, phaseIdx) => {
            const phaseTasks = phase.tasks;
            const phaseDoneTasks = phaseTasks.filter((t) => t.status === TaskStatus.DONE);
            const isPhaseComplete = phase.status === "COMPLETED" || (phaseTasks.length > 0 && phaseDoneTasks.length === phaseTasks.length);
            const phaseProgress = phaseTasks.length > 0 ? Math.round((phaseDoneTasks.length / phaseTasks.length) * 100) : 0;

            return (
              <div
                key={phase.id}
                className={`bg-white rounded-xl border transition-all shadow-xs overflow-hidden ${
                  isPhaseComplete
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : "border-slate-200"
                }`}
              >
                {/* Phase Header */}
                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono border ${
                        isPhaseComplete
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {phaseIdx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 tracking-tight">
                          {phase.name}
                        </h3>
                        {isPhaseComplete ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            PHASE COMPLETE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                            {phase.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="text-xs text-slate-500 font-medium">
                          {phaseDoneTasks.length} of {phaseTasks.length} tasks completed ({phaseProgress}%)
                        </div>
                        <div className="w-28 sm:w-36">
                          <OrganicProgressBar
                            progress={phaseProgress}
                            heightClass="h-1.5"
                            barColor={isPhaseComplete ? "from-emerald-500 to-emerald-600" : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedPhase({ id: phase.id, name: phase.name });
                        setIsTaskModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Tasks List within Phase */}
                <div className="p-4 sm:p-5">
                  {phaseTasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                      No tasks in this phase yet. Click &quot;Add Task&quot; above to assign work.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {phaseTasks.map((task) => (
                        <CuriousCard
                          key={task.id}
                          glowSize={190}
                          glowOpacity={0.14}
                          className={`p-4 rounded-xl border transition ${
                            task.status === TaskStatus.DONE
                              ? "bg-slate-50/60 border-slate-200 opacity-80"
                              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Left: Task Name, Desc, Assignee */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span
                                  className={`text-sm font-bold ${
                                    task.status === TaskStatus.DONE
                                      ? "text-slate-400 line-through"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {task.name}
                                </span>
                                {getPriorityBadge(task.priority)}

                                {task.assignee && (
                                  <span className="text-[11px] text-slate-600 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                    <User className="w-3 h-3 text-indigo-600" />
                                    <span>{task.assignee.name}</span>
                                  </span>
                                )}

                                {task.deadline && (
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                  </span>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Right: Status Selector & Timer Trigger */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Quick Timer Tracker Start */}
                              <button
                                onClick={() =>
                                  timer.startTimer(task.id, task.name, project.name)
                                }
                                title="Start live timer on this task"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition cursor-pointer shadow-2xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>

                              {/* Task Status Dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleStatusChange(task.id, e.target.value as TaskStatus, phase.name)
                                }
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition cursor-pointer ${
                                  task.status === TaskStatus.DONE
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : task.status === TaskStatus.IN_PROGRESS
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : task.status === TaskStatus.REVIEW
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-slate-100 text-slate-700 border-slate-300"
                                }`}
                              >
                                <option value={TaskStatus.TODO}>TODO</option>
                                <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                                <option value={TaskStatus.REVIEW}>REVIEW</option>
                                <option value={TaskStatus.DONE}>DONE ✓</option>
                              </select>
                            </div>
                          </div>

                          {/* Subtasks Section */}
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="space-y-1.5">
                              {task.subTasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={() => handleToggleSubTask(sub.id, sub.isCompleted)}
                                  className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900 transition py-0.5"
                                >
                                  {sub.isCompleted ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                                  )}
                                  <span
                                    className={`${
                                      sub.isCompleted ? "text-slate-400 line-through" : ""
                                    }`}
                                  >
                                    {sub.name}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Add Subtask Input Form */}
                            {addingSubTaskFor === task.id ? (
                              <div className="flex items-center gap-2 mt-2 pt-1">
                                <input
                                  type="text"
                                  value={newSubTaskName[task.id] || ""}
                                  onChange={(e) =>
                                    setNewSubTaskName((prev) => ({
                                      ...prev,
                                      [task.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Subtask title..."
                                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 flex-1 shadow-2xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddSubTask(task.id);
                                    if (e.key === "Escape") setAddingSubTaskFor(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleAddSubTask(task.id)}
                                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setAddingSubTaskFor(null)}
                                  className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAddingSubTaskFor(task.id)}
                                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-2 transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add checklist item</span>
                              </button>
                            )}
                          </div>
                        </CuriousCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Phase Modal */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSuccess={onRefresh}
        projectId={project.id}
        nextOrderIndex={project.phases.length}
      />

      {/* Add Task Modal */}
      {selectedPhase && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedPhase(null);
          }}
          onSuccess={onRefresh}
          phaseId={selectedPhase.id}
          phaseName={selectedPhase.name}
          assignees={assignees}
        />
      )}
    </div>
  );
}
