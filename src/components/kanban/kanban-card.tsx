"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTask } from "@/types/kanban";
import { TaskPriority } from "@prisma/client";
import { useTimerStore } from "@/store/useTimerStore";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Play,
  GripVertical,
  User,
} from "lucide-react";

interface KanbanCardProps {
  task: KanbanTask;
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const timer = useTimerStore();

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
            HIGH
          </span>
        );
      case TaskPriority.MED:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            MED
          </span>
        );
      case TaskPriority.LOW:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            LOW
          </span>
        );
    }
  };

  const completedSubtasks = task.subTasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subTasks.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl p-4 transition-all duration-200 select-none group relative bg-white ${
        isOverlay
          ? "border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-500/10 scale-105 cursor-grabbing"
          : isDragging
          ? "opacity-35 border-2 border-dashed border-indigo-400 bg-indigo-50/50 scale-95"
          : "border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Top Header: Project Tag & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition -ml-1"
            title="Drag task"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <span className="text-[10px] font-mono text-slate-600 truncate max-w-[140px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">
            {task.phase?.project?.name || "Project"}
          </span>
        </div>

        <div>{getPriorityBadge(task.priority)}</div>
      </div>

      {/* Task Name */}
      <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug mb-1.5 group-hover:text-indigo-600 transition">
        {task.name}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Phase breadcrumb */}
      <div className="text-[10px] text-slate-500 font-mono mb-3 truncate flex items-center gap-1">
        <span className="text-slate-400">Phase:</span>
        <span className="text-slate-600 font-medium">{task.phase?.name}</span>
      </div>

      {/* Footer Info: Subtasks, Deadline, Assignee, Timer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Left: Subtask counter and Deadline */}
        <div className="flex items-center gap-2.5 text-slate-500">
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-700">
              <CheckSquare className="w-3 h-3 text-indigo-600" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {task.deadline && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Right: Assignee Avatar + Live Timer shortcut */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              timer.startTimer(task.id, task.name, task.phase?.project?.name || "Kanban");
            }}
            title="Start live timer on this task"
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>

          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase"
              title={`${task.assignee.name} (${task.assignee.role})`}
            >
              {task.assignee.name.substring(0, 2)}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"
              title="Unassigned"
            >
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
