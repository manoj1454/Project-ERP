import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssetCategory } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const taskId = (formData.get("taskId") as string) || null;
    const category = formData.get("category") as AssetCategory | null;
    const assetName = formData.get("assetName") as string | null;
    const changeLog = (formData.get("changeLog") as string) || "Initial upload";
    const uploadedBy = formData.get("uploadedBy") as string | null;
    const existingAssetId = formData.get("assetId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!uploadedBy) {
      return NextResponse.json({ error: "Uploader ID is required" }, { status: 400 });
    }

    // Save file to storage (/public/uploads/assets)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name) || ".bin";
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/assets/${uniqueFileName}`;

    let assetId = existingAssetId;
    let nextVersionNumber = 1;

    if (assetId) {
      // Fetch existing asset and highest version
      const existingAsset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      });

      if (!existingAsset) {
        return NextResponse.json({ error: "Target asset not found" }, { status: 404 });
      }

      nextVersionNumber = existingAsset.versions[0]
        ? existingAsset.versions[0].versionNumber + 1
        : 1;
    } else {
      // Creating a new Asset container
      if (!projectId || !category || !assetName) {
        return NextResponse.json(
          { error: "Project ID, category, and asset name are required for new assets." },
          { status: 400 }
        );
      }

      const newAsset = await prisma.asset.create({
        data: {
          name: assetName.trim(),
          projectId,
          taskId: taskId || null,
          category,
        },
      });

      assetId = newAsset.id;
      nextVersionNumber = 1;
    }

    // 2. Create AssetVersion entry without overwriting the old version
    const newVersion = await prisma.assetVersion.create({
      data: {
        assetId,
        versionNumber: nextVersionNumber,
        fileUrl,
        uploadedBy,
        changeLog: changeLog.trim(),
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
    });

    // 3. Update Asset.currentVersionId pointer
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        currentVersionId: newVersion.id,
      },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, name: true } },
        currentVersion: {
          include: {
            uploader: { select: { id: true, name: true, email: true } },
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            uploader: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: `Version v${nextVersionNumber} created successfully.`,
        data: updatedAsset,
        newVersion,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Asset upload error:", err);
    const msg = err instanceof Error ? err.message : "Asset upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
