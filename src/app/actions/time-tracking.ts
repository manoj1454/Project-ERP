"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface TimeEntryInput {
  userId: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isBillable: boolean;
  notes?: string;
}

export async function getTimeEntries(filter?: {
  userId?: string;
  taskId?: string;
  projectId?: string;
  isBillable?: boolean;
}) {
  try {
    const whereClause: Prisma.TimeEntryWhereInput = {};

    if (filter?.userId) whereClause.userId = filter.userId;
    if (filter?.taskId) whereClause.taskId = filter.taskId;
    if (filter?.isBillable !== undefined) whereClause.isBillable = filter.isBillable;
    if (filter?.projectId) {
      whereClause.task = {
        phase: {
          projectId: filter.projectId,
        },
      };
    }

    const entries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
            phase: {
              select: {
                id: true,
                name: true,
                project: {
                  select: { id: true, name: true, budget: true },
                },
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    return { success: true, data: entries };
  } catch (error: unknown) {
    console.error("Error fetching time entries:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch time entries";
    return { success: false, error: msg };
  }
}

export async function createTimeEntry(data: TimeEntryInput) {
  try {
    if (!data.userId || !data.taskId) {
      return { success: false, error: "User ID and Task ID are required." };
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : new Date(),
        durationMinutes: Math.max(1, Math.round(data.durationMinutes)),
        isBillable: data.isBillable ?? true,
        notes: data.notes?.trim() || null,
        isBilled: false,
      },
      include: {
        task: {
          select: {
            name: true,
            phase: {
              select: { project: { select: { name: true } } },
            },
          },
        },
      },
    });

    revalidatePath("/time-tracking");
    revalidatePath("/dashboard");
    return { success: true, data: entry };
  } catch (error: unknown) {
    console.error("Error creating time entry:", error);
    const msg = error instanceof Error ? error.message : "Failed to log time entry";
    return { success: false, error: msg };
  }
}

export async function updateTimeEntry(
  id: string,
  data: {
    durationMinutes?: number;
    isBillable?: boolean;
    notes?: string;
  }
) {
  try {
    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(data.durationMinutes !== undefined && {
          durationMinutes: Math.max(1, Math.round(data.durationMinutes)),
        }),
        ...(data.isBillable !== undefined && { isBillable: data.isBillable }),
        ...(data.notes !== undefined && { notes: data.notes.trim() || null }),
      },
    });

    revalidatePath("/time-tracking");
    return { success: true, data: entry };
  } catch (error: unknown) {
    console.error("Error updating time entry:", error);
    const msg = error instanceof Error ? error.message : "Failed to update time entry";
    return { success: false, error: msg };
  }
}

export async function deleteTimeEntry(id: string) {
  try {
    await prisma.timeEntry.delete({ where: { id } });
    revalidatePath("/time-tracking");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting time entry:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete time entry";
    return { success: false, error: msg };
  }
}
