"use server";

import { prisma } from "@/lib/prisma";
import { AssetCategory, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAssets(filter?: {
  projectId?: string;
  category?: AssetCategory;
  search?: string;
}) {
  try {
    const whereClause: Prisma.AssetWhereInput = {};

    if (filter?.projectId) whereClause.projectId = filter.projectId;
    if (filter?.category) whereClause.category = filter.category;
    if (filter?.search) {
      whereClause.name = { contains: filter.search, mode: "insensitive" };
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, name: true },
        },
        currentVersion: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        versions: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: assets };
  } catch (error: unknown) {
    console.error("Error fetching assets:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch assets";
    return { success: false, error: msg };
  }
}

export async function getAssetById(id: string) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        project: true,
        task: true,
        currentVersion: {
          include: {
            uploader: { select: { id: true, name: true, email: true } },
          },
        },
        versions: {
          include: {
            uploader: { select: { id: true, name: true, email: true } },
          },
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!asset) return { success: false, error: "Asset not found" };
    return { success: true, data: asset };
  } catch (error: unknown) {
    console.error("Error fetching asset:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch asset";
    return { success: false, error: msg };
  }
}

export async function deleteAsset(id: string) {
  try {
    await prisma.asset.delete({ where: { id } });
    revalidatePath("/assets");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting asset:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete asset";
    return { success: false, error: msg };
  }
}
