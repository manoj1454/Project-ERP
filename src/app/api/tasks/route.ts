import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus, TaskPriority, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;

    const whereClause: Prisma.TaskWhereInput = {};

    if (projectId) {
      whereClause.phase = { projectId };
    }

    if (status && Object.values(TaskStatus).includes(status)) {
      whereClause.status = status;
    }

    if (priority && Object.values(TaskPriority).includes(priority)) {
      whereClause.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        subTasks: {
          select: { id: true, name: true, isCompleted: true },
          orderBy: { createdAt: "asc" },
        },
        phase: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error("Error fetching tasks:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch tasks";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
