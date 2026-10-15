import React from "react";
import { prisma } from "@/lib/prisma";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { ProjectCardList } from "@/components/projects/project-card-list";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
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

  const clients = await prisma.client.findMany({
    select: { id: true, name: true, companyName: true },
    orderBy: { name: "asc" },
  });

  async function handleRefresh() {
    "use server";
    revalidatePath("/projects");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <TopNavbar />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        <ProjectCardList initialProjects={projects} clients={clients} onRefresh={handleRefresh} />
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 font-mono text-center shadow-2xs">
        Workspace ERP &bull; Module C: Project Engine &bull; Synchronized with Supabase
      </footer>
    </div>
  );
}
