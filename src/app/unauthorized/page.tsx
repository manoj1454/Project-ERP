"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ShieldAlert, ArrowLeft, LogOut, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const requiredRole = searchParams.get("requiredRole") || "Elevated";
  const currentRole = searchParams.get("currentRole") || session?.user?.role || "UNKNOWN";

  return (
    <div className="w-full max-w-lg relative z-10">
      <div className="enterprise-card bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-6 shadow-xs">
          <ShieldAlert className="w-7 h-7 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Access Restricted</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto font-medium">
          Your account does not possess the required RBAC privilege level to view this module.
        </p>

        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 uppercase tracking-wider font-mono font-semibold">Your Current Role:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold border border-slate-200">
              {currentRole}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 uppercase tracking-wider font-mono font-semibold">Required Role:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono font-bold border border-amber-200">
              {requiredRole}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Strict RBAC enforcement is active at the middleware layer.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={currentRole === "CLIENT" ? "/portal" : "/dashboard"}
            className="px-5 py-2.5 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {currentRole === "CLIENT" ? "Portal" : "Dashboard"}</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-5 py-2.5 rounded-lg font-bold text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Different Role</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Suspense fallback={<div className="text-slate-500 text-xs font-mono">Loading access privileges...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </div>
  );
}
