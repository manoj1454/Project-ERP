"use server";

import { prisma } from "@/lib/prisma";
import { ClientStatus, InteractionType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ClientInput {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  status?: ClientStatus;
}

export async function getClients(filter?: { status?: ClientStatus; search?: string }) {
  try {
    const whereClause: Prisma.ClientWhereInput = {};

    if (filter?.status) {
      whereClause.status = filter.status;
    }

    if (filter?.search) {
      whereClause.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { companyName: { contains: filter.search, mode: "insensitive" } },
        { email: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
          },
        },
        interactionLogs: {
          orderBy: { timestamp: "desc" },
          take: 3,
        },
        _count: {
          select: { projects: true, interactionLogs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: clients };
  } catch (error: unknown) {
    console.error("Error fetching clients:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch clients";
    return { success: false, error: msg };
  }
}

export async function createClient(data: ClientInput) {
  try {
    if (!data.name || !data.email) {
      return { success: false, error: "Client name and email are required." };
    }

    const client = await prisma.client.create({
      data: {
        name: data.name.trim(),
        companyName: data.companyName?.trim() || null,
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        status: data.status || ClientStatus.LEAD,
      },
    });

    revalidatePath("/crm");
    revalidatePath("/projects");
    return { success: true, data: client };
  } catch (error: unknown) {
    console.error("Error creating client:", error);
    const msg = error instanceof Error ? error.message : "Failed to create client";
    return { success: false, error: msg };
  }
}

export async function updateClient(id: string, data: Partial<ClientInput>) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.companyName !== undefined && { companyName: data.companyName ? data.companyName.trim() : null }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone !== undefined && { phone: data.phone ? data.phone.trim() : null }),
        ...(data.address !== undefined && { address: data.address ? data.address.trim() : null }),
        ...(data.status && { status: data.status }),
      },
    });

    revalidatePath("/crm");
    return { success: true, data: client };
  } catch (error: unknown) {
    console.error("Error updating client:", error);
    const msg = error instanceof Error ? error.message : "Failed to update client";
    return { success: false, error: msg };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/crm");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting client:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete client";
    return { success: false, error: msg };
  }
}

export async function addInteractionLog(clientId: string, userId: string, type: InteractionType, notes: string) {
  try {
    const log = await prisma.interactionLog.create({
      data: {
        clientId,
        userId,
        type,
        notes: notes.trim(),
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    revalidatePath("/crm");
    return { success: true, data: log };
  } catch (error: unknown) {
    console.error("Error adding interaction log:", error);
    const msg = error instanceof Error ? error.message : "Failed to add interaction log";
    return { success: false, error: msg };
  }
}
