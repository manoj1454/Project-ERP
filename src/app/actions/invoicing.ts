"use server";

import { prisma } from "@/lib/prisma";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside active HTTP request context (e.g. tests)
  }
}

export interface GenerateInvoiceInput {
  projectId: string;
  hourlyRate?: number;
  dueDate?: string;
  notes?: string;
  customInvoiceNumber?: string;
}

export async function getUnbilledTimeSummary(projectId?: string) {
  try {
    const whereClause: Prisma.TimeEntryWhereInput = {
      isBillable: true,
      isBilled: false,
    };

    if (projectId) {
      whereClause.task = {
        phase: {
          projectId,
        },
      };
    }

    const unbilledEntries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        task: {
          include: {
            phase: {
              include: {
                project: {
                  include: {
                    client: {
                      select: { id: true, name: true, companyName: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    // Group entries by Project
    const groupedMap = new Map<
      string,
      {
        project: {
          id: string;
          name: string;
          client: { id: string; name: string; companyName: string | null; email: string };
        };
        entries: Array<{
          id: string;
          taskName: string;
          userName: string;
          durationMinutes: number;
          hours: number;
          notes: string | null;
          startTime: Date;
        }>;
        totalMinutes: number;
        totalHours: number;
      }
    >();

    for (const entry of unbilledEntries) {
      const proj = entry.task.phase.project;
      if (!groupedMap.has(proj.id)) {
        groupedMap.set(proj.id, {
          project: {
            id: proj.id,
            name: proj.name,
            client: proj.client,
          },
          entries: [],
          totalMinutes: 0,
          totalHours: 0,
        });
      }

      const group = groupedMap.get(proj.id)!;
      const duration = entry.durationMinutes || 0;
      group.totalMinutes += duration;
      group.entries.push({
        id: entry.id,
        taskName: entry.task.name,
        userName: entry.user.name || entry.user.email,
        durationMinutes: duration,
        hours: Number((duration / 60).toFixed(2)),
        notes: entry.notes,
        startTime: entry.startTime,
      });
    }

    // Compute total hours per project group
    const result = Array.from(groupedMap.values()).map((g) => ({
      ...g,
      totalHours: Number((g.totalMinutes / 60).toFixed(2)),
    }));

    return {
      success: true,
      data: {
        totalUnbilledCount: unbilledEntries.length,
        totalUnbilledMinutes: unbilledEntries.reduce(
          (acc, e) => acc + (e.durationMinutes || 0),
          0
        ),
        projects: result,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching unbilled time summary:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch unbilled time";
    return { success: false, error: msg };
  }
}

export async function generateInvoiceFromUnbilledTime(input: GenerateInvoiceInput) {
  try {
    const { projectId, hourlyRate = 120, dueDate, notes, customInvoiceNumber } = input;

    // 1. Fetch unbilled entries for this project
    const unbilledEntries = await prisma.timeEntry.findMany({
      where: {
        task: {
          phase: {
            projectId,
          },
        },
        isBillable: true,
        isBilled: false,
      },
      include: {
        task: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (unbilledEntries.length === 0) {
      return {
        success: false,
        error: "No unbilled billable time entries found for this project.",
      };
    }

    // 2. Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      return { success: false, error: "Project not found." };
    }

    // 3. Prepare Invoice Number
    let invoiceNumber = customInvoiceNumber;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count();
      invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
    }

    // 4. Compute line items
    // Group by task for clean itemization
    const taskGroups = new Map<
      string,
      {
        taskName: string;
        totalMinutes: number;
        contributors: Set<string>;
      }
    >();

    for (const entry of unbilledEntries) {
      const existing = taskGroups.get(entry.taskId) || {
        taskName: entry.task.name,
        totalMinutes: 0,
        contributors: new Set<string>(),
      };
      existing.totalMinutes += entry.durationMinutes || 0;
      existing.contributors.add(entry.user.name || entry.user.email);
      taskGroups.set(entry.taskId, existing);
    }

    const itemsToCreate: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];

    let calculatedTotal = 0;

    for (const group of Array.from(taskGroups.values())) {
      const hours = Math.max(0.25, Number((group.totalMinutes / 60).toFixed(2)));
      const lineTotal = Number((hours * hourlyRate).toFixed(2));
      calculatedTotal += lineTotal;

      const contributorNames = Array.from(group.contributors).join(", ");
      itemsToCreate.push({
        description: `Task: ${group.taskName} (${contributorNames})`,
        quantity: hours,
        unitPrice: hourlyRate,
        total: lineTotal,
      });
    }

    // If notes were provided, add as a line item or description
    if (notes?.trim()) {
      itemsToCreate.push({
        description: `Project Service Note: ${notes.trim()}`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
    }

    const finalDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const timeEntryIds = unbilledEntries.map((e) => e.id);

    // 5. Execute atomic transaction:
    // Create Invoice -> Create InvoiceItems -> Set TimeEntries isBilled = true
    const result = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const newInvoice = await tx.invoice.create({
        data: {
          projectId: project.id,
          invoiceNumber,
          issueDate: new Date(),
          dueDate: finalDueDate,
          totalAmount: calculatedTotal,
          status: InvoiceStatus.SENT,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          project: {
            include: { client: true },
          },
          items: true,
          payments: true,
        },
      });

      // Atomically mark all included time entries as billed!
      await tx.timeEntry.updateMany({
        where: {
          id: { in: timeEntryIds },
        },
        data: {
          isBilled: true,
        },
      });

      return newInvoice;
    });

    safeRevalidate("/financials");
    safeRevalidate("/time-tracking");
    safeRevalidate("/projects");

    return {
      success: true,
      data: result,
      billedEntriesCount: timeEntryIds.length,
      totalHours: Number(
        (unbilledEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 60).toFixed(2)
      ),
    };
  } catch (error: unknown) {
    console.error("Error generating invoice from unbilled time:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate invoice";
    return { success: false, error: msg };
  }
}

export async function getInvoices(filter?: {
  projectId?: string;
  status?: InvoiceStatus;
}) {
  try {
    const whereClause: Prisma.InvoiceWhereInput = {};
    if (filter?.projectId) whereClause.projectId = filter.projectId;
    if (filter?.status) whereClause.status = filter.status;

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            client: true,
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: invoices };
  } catch (error: unknown) {
    console.error("Error fetching invoices:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch invoices";
    return { success: false, error: msg };
  }
}

export async function recordInvoicePayment(input: {
  invoiceId: string;
  amount: number;
  method: string;
}) {
  try {
    const { invoiceId, amount, method } = input;

    if (amount <= 0) {
      return { success: false, error: "Payment amount must be greater than zero." };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    const previousPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
    const newTotalPaid = previousPaid + amount;

    let nextStatus: InvoiceStatus = invoice.status;
    if (newTotalPaid >= invoice.totalAmount) {
      nextStatus = InvoiceStatus.PAID;
    } else if (newTotalPaid > 0) {
      nextStatus = InvoiceStatus.PARTIAL;
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          paymentDate: new Date(),
        },
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: nextStatus,
        },
        include: {
          project: { include: { client: true } },
          items: true,
          payments: true,
        },
      });

      return { payment, updatedInvoice };
    });

    safeRevalidate("/financials");
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("Error recording payment:", error);
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return { success: false, error: msg };
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  try {
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
    safeRevalidate("/financials");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error updating invoice status:", error);
    const msg = error instanceof Error ? error.message : "Failed to update status";
    return { success: false, error: msg };
  }
}
