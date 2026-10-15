"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { KanbanTask, KANBAN_COLUMNS } from "@/types/kanban";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import {
  Filter,
  Search,
  AlertCircle,
  FolderKanban,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";

interface KanbanBoardProps {
  initialProjects: { id: string; name: string }[];
}

export function KanbanBoard({ initialProjects }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const { notify } = useNotificationStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticAlert, setOptimisticAlert] = useState<string | null>(null);

  // TanStack Query Key
  const queryKey = ["tasks", selectedProjectId || "all"];

  // 1. Fetch Tasks
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<KanbanTask[]>({
    queryKey,
    queryFn: async () => {
      const url = selectedProjectId
        ? `/api/tasks?projectId=${selectedProjectId}`
        : `/api/tasks`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks from server");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  // 2. TanStack Query Optimistic Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: TaskStatus;
    }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Server failed to update task status");
      }

      return res.json();
    },
    // OPTIMISTIC UPDATE: Move card instantly in UI
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<KanbanTask[]>(queryKey);

      // Instantly mutate cache
      queryClient.setQueryData<KanbanTask[]>(queryKey, (old) => {
        if (!old) return [];
        return old.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      });

      setOptimisticAlert(`Task updated to ${newStatus} (Optimistic UI)`);
      setTimeout(() => setOptimisticAlert(null), 3000);

      if (newStatus === TaskStatus.DONE) {
        const movedTask = previousTasks?.find((t) => t.id === taskId);
        notify(
          "Task Resolved! ✨",
          `"${movedTask?.name || "Task"}" moved to DONE. Phase velocity updated.`,
          "task_done"
        );
      }

      // Return context for rollback
      return { previousTasks };
    },
    // ROLLBACK ON ERROR: Snap card back to original position
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      setErrorMessage(`Update failed! Rolled back card position: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    },
    // Invalidate queries after finish to guarantee consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // DND Sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // Requires 5px drag to initiate, preventing accidental drag on click
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesPriority =
      priorityFilter === "ALL" || t.priority === (priorityFilter as TaskPriority);
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower)) ||
      (t.phase?.project?.name && t.phase.project.name.toLowerCase().includes(searchLower));

    return matchesPriority && matchesSearch;
  });

  // Group tasks by status columns
  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = tasks.find((t) => t.id === activeId);
    if (!activeItem) return;

    // Check if over a column or over another task
    let targetStatus: TaskStatus | null = null;

    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && activeItem.status !== targetStatus) {
      queryClient.setQueryData<KanbanTask[]>(queryKey, (old) => {
        if (!old) return [];
        return old.map((t) => (t.id === activeId ? { ...t, status: targetStatus! } : t));
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetStatus: TaskStatus | null = null;

    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus) {
      // Trigger TanStack Query mutation with optimistic update
      updateStatusMutation.mutate({
        taskId: activeId,
        newStatus: targetStatus,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-950 font-semibold underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {optimisticAlert && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0 animate-bounce" />
            <span className="font-semibold">{optimisticAlert}</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
            TanStack Cache Synced
          </span>
        </div>
      )}

      {/* Control Bar: Project filter, Priority, Search, Sync Indicator */}
      <div className="enterprise-card bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Project Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Project Scope:</span>
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
          >
            <option value="" className="bg-white text-slate-900">
              All Active Projects (Universal Board)
            </option>
            {initialProjects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white text-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Filters, Search, Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            >
              <option value="ALL" className="bg-white text-slate-900">
                All Priorities
              </option>
              <option value={TaskPriority.HIGH} className="bg-white text-slate-900">
                High Priority
              </option>
              <option value={TaskPriority.MED} className="bg-white text-slate-900">
                Medium Priority
              </option>
              <option value={TaskPriority.LOW} className="bg-white text-slate-900">
                Low Priority
              </option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or tags..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Sync indicator */}
          <button
            onClick={() => refetch()}
            title="Refresh TanStack Query cache"
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Kanban Drag-and-Drop Columns Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 enterprise-card bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-900">Loading Kanban board...</p>
          <p className="text-xs text-slate-500 mt-1">Hydrating tasks into TanStack Query state engine</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
              />
            ))}
          </div>

          {/* Drag Overlay with translucent Liquid Glass styling */}
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
