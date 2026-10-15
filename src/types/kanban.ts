import { TaskPriority, TaskStatus } from "@prisma/client";

export interface KanbanTask {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  subTasks: {
    id: string;
    name: string;
    isCompleted: boolean;
  }[];
  phase: {
    id: string;
    name: string;
    projectId: string;
    project: {
      id: string;
      name: string;
    };
  };
}

export type KanbanColumnId = TaskStatus;

export interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: TaskStatus.TODO,
    title: "To Do",
    accentColor: "text-slate-600",
    borderColor: "border-slate-200",
    badgeBg: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: "In Progress",
    accentColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    badgeBg: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  {
    id: TaskStatus.REVIEW,
    title: "Under Review",
    accentColor: "text-purple-600",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  {
    id: TaskStatus.DONE,
    title: "Completed",
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
];
