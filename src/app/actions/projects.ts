"use server";

import { prisma } from "@/lib/prisma";
import { ProjectStatus, TaskPriority, TaskStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ProjectInput {
  clientId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: ProjectStatus;
  initialPhases?: string[];
}

export async function getProjects(filter?: { clientId?: string; status?: ProjectStatus }) {
  try {
    const whereClause: Prisma.ProjectWhereInput = {};
    if (filter?.clientId) whereClause.clientId = filter.clientId;
    if (filter?.status) whereClause.status = filter.status;

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        phases: {
          orderBy: { orderIndex: "asc" },
          include: {
            tasks: {
              select: { id: true, status: true, priority: true },
            },
          },
        },
        _count: {
          select: { phases: true, assets: true, invoices: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: projects };
  } catch (error: unknown) {
    console.error("Error fetching projects:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch projects";
    return { success: false, error: msg };
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        phases: {
          orderBy: { orderIndex: "asc" },
          include: {
            tasks: {
              orderBy: { createdAt: "asc" },
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, role: true },
                },
                subTasks: {
                  orderBy: { createdAt: "asc" },
                },
                _count: {
                  select: { timeEntries: true, assets: true },
                },
              },
            },
          },
        },
        invoices: {
          select: { id: true, invoiceNumber: true, totalAmount: true, status: true },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return { success: true, data: project };
  } catch (error: unknown) {
    console.error("Error fetching project by id:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch project";
    return { success: false, error: msg };
  }
}

export async function createProject(data: ProjectInput) {
  try {
    if (!data.name || !data.clientId) {
      return { success: false, error: "Project name and client are required." };
    }

    const defaultPhases = data.initialPhases && data.initialPhases.length > 0
      ? data.initialPhases
      : ["Concept & Discovery", "Design & Architecture", "Implementation", "QA & Launch"];

    const project = await prisma.project.create({
      data: {
        name: data.name.trim(),
        clientId: data.clientId,
        description: data.description?.trim() || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget ? Number(data.budget) : null,
        status: data.status || ProjectStatus.PLANNING,
        phases: {
          create: defaultPhases.map((phaseName, idx) => ({
            name: phaseName.trim(),
            orderIndex: idx,
            status: idx === 0 ? "IN_PROGRESS" : "PENDING",
          })),
        },
      },
      include: {
        client: true,
        phases: true,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/crm");
    return { success: true, data: project };
  } catch (error: unknown) {
    console.error("Error creating project:", error);
    const msg = error instanceof Error ? error.message : "Failed to create project";
    return { success: false, error: msg };
  }
}

export async function addPhase(projectId: string, name: string) {
  try {
    const highestPhase = await prisma.projectPhase.findFirst({
      where: { projectId },
      orderBy: { orderIndex: "desc" },
    });

    const nextIndex = highestPhase ? highestPhase.orderIndex + 1 : 0;

    const phase = await prisma.projectPhase.create({
      data: {
        projectId,
        name: name.trim(),
        orderIndex: nextIndex,
        status: "PENDING",
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: phase };
  } catch (error: unknown) {
    console.error("Error adding phase:", error);
    const msg = error instanceof Error ? error.message : "Failed to add phase";
    return { success: false, error: msg };
  }
}

export async function addTask(data: {
  phaseId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  deadline?: string;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        phaseId: data.phaseId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        assigneeId: data.assigneeId || null,
        priority: data.priority || TaskPriority.MED,
        status: TaskStatus.TODO,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    const phase = await prisma.projectPhase.findUnique({
      where: { id: data.phaseId },
      select: { projectId: true },
    });

    if (phase) {
      revalidatePath(`/projects/${phase.projectId}`);
    }

    return { success: true, data: task };
  } catch (error: unknown) {
    console.error("Error adding task:", error);
    const msg = error instanceof Error ? error.message : "Failed to add task";
    return { success: false, error: msg };
  }
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: {
        phase: {
          include: {
            tasks: true,
          },
        },
      },
    });

    // Master Spec: PATCH /tasks/{id} triggers "Phase Complete" check
    const phaseTasks = updatedTask.phase.tasks;
    const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.status === TaskStatus.DONE);

    let phaseUpdated = false;
    if (allDone && updatedTask.phase.status !== "COMPLETED") {
      await prisma.projectPhase.update({
        where: { id: updatedTask.phaseId },
        data: { status: "COMPLETED" },
      });
      phaseUpdated = true;
    } else if (!allDone && updatedTask.phase.status === "COMPLETED") {
      await prisma.projectPhase.update({
        where: { id: updatedTask.phaseId },
        data: { status: "IN_PROGRESS" },
      });
      phaseUpdated = true;
    }

    revalidatePath(`/projects/${updatedTask.phase.projectId}`);
    return { success: true, data: updatedTask, phaseCompleted: phaseUpdated && allDone };
  } catch (error: unknown) {
    console.error("Error updating task status:", error);
    const msg = error instanceof Error ? error.message : "Failed to update task status";
    return { success: false, error: msg };
  }
}

export async function addSubTask(taskId: string, name: string) {
  try {
    const subtask = await prisma.subTask.create({
      data: {
        taskId,
        name: name.trim(),
        isCompleted: false,
      },
    });
    return { success: true, data: subtask };
  } catch (error: unknown) {
    console.error("Error adding subtask:", error);
    const msg = error instanceof Error ? error.message : "Failed to add subtask";
    return { success: false, error: msg };
  }
}

export async function toggleSubTask(subTaskId: string, isCompleted: boolean) {
  try {
    const subtask = await prisma.subTask.update({
      where: { id: subTaskId },
      data: { isCompleted },
    });
    return { success: true, data: subtask };
  } catch (error: unknown) {
    console.error("Error toggling subtask:", error);
    const msg = error instanceof Error ? error.message : "Failed to toggle subtask";
    return { success: false, error: msg };
  }
}

export async function getAssignees() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["SUPERADMIN", "EMPLOYEE"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: users };
  } catch (error: unknown) {
    console.error("Error fetching assignees:", error);
    return { success: false, data: [] };
  }
}
