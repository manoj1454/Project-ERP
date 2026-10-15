"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn as IKanbanColumn, KanbanTask } from "@/types/kanban";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { Circle, Clock, CheckCircle2, Eye } from "lucide-react";

interface KanbanColumnProps {
  column: IKanbanColumn;
  tasks: KanbanTask[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Circle className="w-3.5 h-3.5 text-zinc-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />;
      case "REVIEW":
        return <Eye className="w-3.5 h-3.5 text-purple-400" />;
      case "DONE":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl p-4 transition-all duration-300 min-h-[580px] w-full border ${
        isOver
          ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md"
          : "bg-slate-100/80 border-slate-200 shadow-2xs"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {getStatusIcon(column.id)}
          <h3 className="font-bold text-sm tracking-tight text-slate-900">
            {column.title}
          </h3>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${column.badgeBg}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable Task Container with SortableContext */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 bg-white/40 rounded-xl p-6 text-center text-slate-400 text-xs font-medium select-none">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}
