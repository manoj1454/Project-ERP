"use client";

import React, { useState } from "react";
import { AssetCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { X, Upload, FileText, Layers, Loader2, FileCheck2, Building } from "lucide-react";

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: { id: string; name: string }[];
  targetAsset?: {
    id: string;
    name: string;
    category: AssetCategory;
    projectId: string;
    currentVersion?: { versionNumber: number } | null;
  } | null;
}

export function AssetUploadModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
  targetAsset,
}: AssetUploadModalProps) {
  const { data: session } = useSession();
  const isNewVersion = !!targetAsset;

  const [assetName, setAssetName] = useState(targetAsset?.name || "");
  const [projectId, setProjectId] = useState(targetAsset?.projectId || projects[0]?.id || "");
  const [category, setCategory] = useState<AssetCategory>(
    targetAsset?.category || AssetCategory.BLUEPRINT
  );
  const [changeLog, setChangeLog] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVer = targetAsset?.currentVersion?.versionNumber || 1;
  const nextVer = isNewVersion ? currentVer + 1 : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!session?.user?.id) {
      setError("Active session required to upload assets.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", session.user.id);
      formData.append("changeLog", changeLog || (isNewVersion ? `Updated to v${nextVer}` : "Initial version"));

      if (isNewVersion && targetAsset) {
        formData.append("assetId", targetAsset.id);
      } else {
        formData.append("assetName", assetName);
        formData.append("projectId", projectId);
        formData.append("category", category);
      }

      const res = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading asset";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isNewVersion ? `Upload New Version (v${nextVer})` : "Upload New Enterprise Asset"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isNewVersion
                ? `Appending version to "${targetAsset?.name}" without overwriting v${currentVer}`
                : "Module D: Asset Versioning Engine"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isNewVersion ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asset Title *
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g. Master Structural Architectural Blueprint"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project *</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-white text-slate-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                  <div className="relative">
                    <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AssetCategory)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                    >
                      <option value={AssetCategory.BLUEPRINT} className="bg-white text-slate-900">
                        BLUEPRINT (Schematics & CAD)
                      </option>
                      <option value={AssetCategory.CONTRACT} className="bg-white text-slate-900">
                        CONTRACT (Legal & SOW)
                      </option>
                      <option value={AssetCategory.RENDER} className="bg-white text-slate-900">
                        RENDER (3D Models & Visuals)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-indigo-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Target Asset: </span>
                <span className="font-bold text-slate-900">{targetAsset?.name}</span>
              </div>
              <span className="font-mono text-indigo-700 font-bold px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">
                v{currentVer} $\rightarrow$ v{nextVer}
              </span>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select File to Version *
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-5 text-center transition cursor-pointer relative bg-slate-50/60">
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              {file ? (
                <div className="text-xs text-emerald-700 font-bold">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium">
                  <span className="text-indigo-600 font-bold">Click to browse</span> or drag and drop file here
                  <div className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG, DWG, ZIP, DOCX</div>
                </div>
              )}
            </div>
          </div>

          {/* Version Changelog */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Version ChangeLog Notes
            </label>
            <textarea
              rows={2}
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder={
                isNewVersion
                  ? `Summary of changes in v${nextVer} (e.g. Updated electrical load tolerances)...`
                  : "Initial release notes..."
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isNewVersion ? `Publish v${nextVer}` : "Create Asset"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
