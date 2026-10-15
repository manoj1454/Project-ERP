"use client";

import React, { useState } from "react";
import { AssetCategory } from "@prisma/client";
import {
  Upload,
  Layers,
  History,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Plus,
  FolderKanban,
  User,
  Calendar,
} from "lucide-react";
import { AssetUploadModal } from "./asset-upload-modal";
import { AssetVersionHistoryModal } from "./asset-version-history-modal";
import { deleteAsset } from "@/app/actions/assets";

interface AssetVersionItem {
  id: string;
  versionNumber: number;
  fileUrl: string;
  changeLog?: string | null;
  createdAt: string | Date;
  uploader?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

interface AssetWithRelations {
  id: string;
  name: string;
  category: AssetCategory;
  projectId: string;
  project?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    name: string;
  } | null;
  currentVersionId?: string | null;
  currentVersion?: AssetVersionItem | null;
  versions: AssetVersionItem[];
  updatedAt: string | Date;
}

interface AssetGridProps {
  initialAssets: AssetWithRelations[];
  projects: { id: string; name: string }[];
}

export function AssetGrid({ initialAssets, projects }: AssetGridProps) {
  const [assets, setAssets] = useState<AssetWithRelations[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetAssetForVersion, setTargetAssetForVersion] = useState<AssetWithRelations | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<AssetWithRelations | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || asset.category === selectedCategory;
    const matchesProject = selectedProject === "ALL" || asset.projectId === selectedProject;
    return matchesSearch && matchesCategory && matchesProject;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete asset "${name}" and all its versions?`)) {
      return;
    }
    const res = await deleteAsset(id);
    if (res.success) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("Failed to delete asset: " + res.error);
    }
  };

  const getCategoryStyles = (cat: AssetCategory) => {
    switch (cat) {
      case "BLUEPRINT":
        return {
          badge: "text-cyan-700 bg-cyan-50 border-cyan-200 font-semibold",
          glow: "hover:border-cyan-300",
        };
      case "CONTRACT":
        return {
          badge: "text-amber-800 bg-amber-50 border-amber-200 font-semibold",
          glow: "hover:border-amber-300",
        };
      case "RENDER":
        return {
          badge: "text-purple-700 bg-purple-50 border-purple-200 font-semibold",
          glow: "hover:border-purple-300",
        };
      default:
        return {
          badge: "text-slate-700 bg-slate-100 border-slate-200 font-medium",
          glow: "hover:border-slate-300",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl enterprise-card bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "BLUEPRINT", "CONTRACT", "RENDER"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Asset Action */}
        <button
          onClick={() => {
            setTargetAssetForVersion(null);
            setUploadModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Asset
        </button>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <Layers className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 font-medium">
            {search || selectedCategory !== "ALL" || selectedProject !== "ALL"
              ? "No assets match your current search and filter criteria."
              : "No assets have been uploaded to versioned storage yet. Upload your first blueprint, contract, or 3D render."}
          </p>
          <button
            onClick={() => {
              setTargetAssetForVersion(null);
              setUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const style = getCategoryStyles(asset.category);
            const currentVer = asset.currentVersion || asset.versions[0];
            const versionNum = currentVer?.versionNumber || asset.versions.length || 1;
            const updatedDate = new Date(asset.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={asset.id}
                className={`group relative flex flex-col justify-between p-5 rounded-xl enterprise-card bg-white border border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${style.glow}`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] tracking-wider px-2.5 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {asset.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      <Layers className="w-3 h-3 text-indigo-600" />v{versionNum}.0
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {asset.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                    <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{asset.project?.name || "General Project"}</span>
                  </div>

                  {/* Latest Version Changelog Snippet */}
                  {currentVer?.changeLog && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px] block mb-0.5 font-semibold">
                        Latest changelog:
                      </span>
                      <p className="line-clamp-2 text-slate-700">{currentVer.changeLog}</p>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3.5">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px] font-medium">
                        {currentVer?.uploader?.name || currentVer?.uploader?.email || "Team"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{updatedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {currentVer?.fileUrl && (
                        <a
                          href={currentVer.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          View
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAssetForHistory(asset);
                          setHistoryModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        title="View Version Timeline"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{asset.versions.length} ver</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setTargetAssetForVersion(asset);
                          setUploadModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                        title="Upload New Version"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>v{versionNum + 1}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(asset.id, asset.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload New Asset / Version Modal */}
      <AssetUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false);
          window.location.reload();
        }}
        projects={projects}
        targetAsset={targetAssetForVersion}
      />

      {/* Version History Modal */}
      <AssetVersionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        asset={selectedAssetForHistory}
        onUploadNewVersion={(asset) => {
          setHistoryModalOpen(false);
          const found = assets.find((a) => a.id === asset.id);
          if (found) setTargetAssetForVersion(found);
          setUploadModalOpen(true);
        }}
      />
    </div>
  );
}
