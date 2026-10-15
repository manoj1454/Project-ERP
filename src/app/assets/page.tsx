import React from "react";
import { getAssets } from "@/app/actions/assets";
import { getProjects } from "@/app/actions/projects";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { AssetGrid } from "@/components/assets/asset-grid";
import { Layers, FileCode2, FileSignature, Box, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const [assetsRes, projectsRes] = await Promise.all([
    getAssets(),
    getProjects(),
  ]);

  const assets = assetsRes.success && assetsRes.data ? assetsRes.data : [];
  const projects =
    projectsRes.success && projectsRes.data
      ? projectsRes.data.map((p) => ({ id: p.id, name: p.name }))
      : [];

  const totalAssets = assets.length;
  const totalVersions = assets.reduce(
    (acc, curr) => acc + (curr.versions?.length || 1),
    0
  );
  const blueprintsCount = assets.filter((a) => a.category === "BLUEPRINT").length;
  const contractsCount = assets.filter((a) => a.category === "CONTRACT").length;
  const rendersCount = assets.filter((a) => a.category === "RENDER").length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <TopNavbar />
      <div className="p-6 md:p-10 space-y-8 flex-1">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              Module D &bull; Versioned Storage
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Asset Manager &amp; Vault
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl font-medium">
              Upload blueprints, contracts, and 3D renders with automatic immutable
              versioning. Historical revisions are preserved with changelogs and audit trails.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="enterprise-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Total Assets
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalAssets}
            </p>
          </div>

          <div className="enterprise-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <Box className="w-3.5 h-3.5 text-emerald-600" />
              Logged Versions
            </div>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight font-mono">
              {totalVersions}
            </p>
          </div>

          <div className="enterprise-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-600" />
              Blueprints
            </div>
            <p className="text-2xl font-bold text-cyan-700 tracking-tight font-mono">
              {blueprintsCount}
            </p>
          </div>

          <div className="enterprise-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <FileSignature className="w-3.5 h-3.5 text-amber-600" />
              Contracts
            </div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight font-mono">
              {contractsCount}
            </p>
          </div>

          <div className="enterprise-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <Box className="w-3.5 h-3.5 text-purple-600" />
              3D Renders
            </div>
            <p className="text-2xl font-bold text-purple-700 tracking-tight font-mono">
              {rendersCount}
            </p>
          </div>
        </div>

        {/* Main Asset Grid & Filter Manager */}
        <AssetGrid initialAssets={assets} projects={projects} />
      </div>
    </div>
  );
}
