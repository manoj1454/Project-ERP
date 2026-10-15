"use client";

import React from "react";
import { AssetCategory } from "@prisma/client";
import { X, GitCommit, Download, ExternalLink, Plus, FileText, CheckCircle2, User } from "lucide-react";

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

interface AssetWithVersions {
  id: string;
  name: string;
  category: AssetCategory;
  currentVersionId?: string | null;
  currentVersion?: AssetVersionItem | null;
  versions: AssetVersionItem[];
  project?: {
    id: string;
    name: string;
  } | null;
}

interface AssetVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithVersions | null;
  onUploadNewVersion: (asset: AssetWithVersions) => void;
}

export function AssetVersionHistoryModal({
  isOpen,
  onClose,
  asset,
  onUploadNewVersion,
}: AssetVersionHistoryModalProps) {
  if (!isOpen || !asset) return null;

  const currentVerId = asset.currentVersionId || asset.currentVersion?.id;

  const getCategoryColor = (cat: AssetCategory) => {
    switch (cat) {
      case "BLUEPRINT":
        return "text-cyan-700 bg-cyan-50 border-cyan-200 font-semibold";
      case "CONTRACT":
        return "text-amber-800 bg-amber-50 border-amber-200 font-semibold";
      case "RENDER":
        return "text-purple-700 bg-purple-50 border-purple-200 font-semibold";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200 font-medium";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                  asset.category
                )}`}
              >
                {asset.category}
              </span>
              {asset.project && (
                <span className="text-xs text-slate-500 font-medium">
                  in {asset.project.name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {asset.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Version History &amp; Changelog Audit ({asset.versions.length}{" "}
              {asset.versions.length === 1 ? "version" : "versions"} logged)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onUploadNewVersion(asset);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload v
              {(asset.currentVersion?.versionNumber || asset.versions.length || 0) + 1}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="overflow-y-auto flex-1 my-4 pr-1 space-y-4">
          {asset.versions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              No version history records found for this asset.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
              {asset.versions.map((v) => {
                const isCurrent = v.id === currentVerId;
                const formattedDate = new Date(v.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <div key={v.id} className="relative group">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                        isCurrent
                          ? "bg-emerald-600 border-white ring-4 ring-emerald-500/20"
                          : "bg-slate-400 border-white"
                      }`}
                    />

                    {/* Version Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-emerald-50/50 border-emerald-300 shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                              isCurrent
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-slate-200 text-slate-700 border border-slate-300"
                            }`}
                          >
                            v{v.versionNumber}.0
                          </span>

                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Live Version
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={v.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </a>
                          <a
                            href={v.fileUrl}
                            download
                            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      </div>

                      {/* Changelog */}
                      {v.changeLog ? (
                        <div className="bg-white rounded-lg p-2.5 my-2 border border-slate-200">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
                            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
                            Changelog Notes:
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {v.changeLog}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic my-2">
                          No changelog description provided.
                        </p>
                      )}

                      {/* Footer metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-mono">
                        <div className="flex items-center gap-1.5 font-sans font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>
                            {v.uploader?.name || v.uploader?.email || "Team Member"}
                          </span>
                        </div>
                        <time dateTime={new Date(v.createdAt).toISOString()}>
                          {formattedDate}
                        </time>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
