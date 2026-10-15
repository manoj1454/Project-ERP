import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getAssignees } from "@/app/actions/projects";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { ProjectHierarchyView } from "@/components/projects/project-hierarchy-view";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [projectRes, assigneesRes] = await Promise.all([
    getProjectById(id),
    getAssignees(),
  ]);

  if (!projectRes.success || !projectRes.data) {
    notFound();
  }

  const project = projectRes.data;
  const assignees = assigneesRes.data || [];

  async function handleRefresh() {
    "use server";
    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <TopNavbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* The Project -> Phase -> Task Hierarchy Interface */}
        <ProjectHierarchyView
          project={project}
          assignees={assignees}
          onRefresh={handleRefresh}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 font-mono text-center shadow-2xs">
        Workspace ERP &bull; Module C: Project Engine &bull; Synchronized with Supabase
      </footer>
    </div>
  );
}
