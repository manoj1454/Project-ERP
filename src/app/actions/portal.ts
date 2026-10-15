"use server";

import { prisma } from "@/lib/prisma";
import { recordInvoicePayment } from "@/app/actions/invoicing";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback outside HTTP request context
  }
}

export async function getClientPortalData(userEmail?: string) {
  try {
    let client = null;

    if (userEmail) {
      client = await prisma.client.findFirst({
        where: { email: userEmail },
        include: {
          projects: {
            include: {
              phases: {
                orderBy: { orderIndex: "asc" },
                include: {
                  tasks: {
                    select: {
                      id: true,
                      name: true,
                      status: true,
                      priority: true,
                      deadline: true,
                    },
                  },
                },
              },
              assets: {
                include: {
                  currentVersion: {
                    include: {
                      uploader: {
                        select: { name: true, email: true },
                      },
                    },
                  },
                  versions: {
                    orderBy: { versionNumber: "desc" },
                  },
                },
              },
              invoices: {
                orderBy: { createdAt: "desc" },
                include: {
                  items: true,
                  payments: {
                    orderBy: { paymentDate: "desc" },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Fallback: If no client matches the user email directly (e.g. admin previewing the portal),
    // find the first active client that has associated projects.
    if (!client) {
      client = await prisma.client.findFirst({
        where: {
          projects: {
            some: {},
          },
        },
        include: {
          projects: {
            include: {
              phases: {
                orderBy: { orderIndex: "asc" },
                include: {
                  tasks: {
                    select: {
                      id: true,
                      name: true,
                      status: true,
                      priority: true,
                      deadline: true,
                    },
                  },
                },
              },
              assets: {
                include: {
                  currentVersion: {
                    include: {
                      uploader: {
                        select: { name: true, email: true },
                      },
                    },
                  },
                  versions: {
                    orderBy: { versionNumber: "desc" },
                  },
                },
              },
              invoices: {
                orderBy: { createdAt: "desc" },
                include: {
                  items: true,
                  payments: {
                    orderBy: { paymentDate: "desc" },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!client) {
      return { success: false, error: "No client profile found for portal." };
    }

    return { success: true, data: client };
  } catch (error: unknown) {
    console.error("Error fetching client portal data:", error);
    const msg = error instanceof Error ? error.message : "Failed to load portal data";
    return { success: false, error: msg };
  }
}

export async function simulateClientPayment(
  invoiceId: string,
  amount?: number,
  method = "Simulated Instant Settlement (Stripe/Card)"
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = Math.max(0, invoice.totalAmount - totalPaid);
    const payAmount = amount && amount > 0 ? Math.min(amount, balanceDue) : balanceDue;

    if (payAmount <= 0) {
      return { success: false, error: "Invoice is already fully settled." };
    }

    const result = await recordInvoicePayment({
      invoiceId,
      amount: payAmount,
      method,
    });

    safeRevalidate("/portal");
    safeRevalidate("/financials");

    return result;
  } catch (error: unknown) {
    console.error("Error processing client portal payment:", error);
    const msg = error instanceof Error ? error.message : "Failed to simulate payment";
    return { success: false, error: msg };
  }
}
