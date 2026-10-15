"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Boxes, Loader2 } from "lucide-react";
import { LivingEntity } from "@/components/visual/living-entity";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    setActiveRole(roleName);

    try {
      const res = await signIn("credentials", {
        email: demoEmail.trim(),
        password: demoPass,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        setActiveRole(null);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
      setActiveRole(null);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* App Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
            WORKSPACE <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">ERP</span>
          </span>
        </div>
      </div>

      {/* Frosted Glass Login Card refracting the Living Entity */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-7 sm:p-8 border border-white/80 shadow-2xl shadow-indigo-950/10">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Authenticate to access role-gated operations</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* DEMO ROLES (1-CLICK FILL & SIGN-IN) - Placed just above the form */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>DEMO ROLES (1-CLICK FILL)</span>
            </p>
            <span className="text-[10px] text-slate-400 font-mono">Instant Sign-In</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* SuperAdmin Card (Gold Accent) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("admin@workspace.erp", "Admin@123", "SUPERADMIN")}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 shadow-2xs group relative cursor-pointer disabled:opacity-60 ${
                activeRole === "SUPERADMIN"
                  ? "bg-amber-100 border-amber-400 ring-2 ring-amber-400/30"
                  : "bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/80 hover:border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 tracking-tight">SUPERADMIN</span>
                {activeRole === "SUPERADMIN" ? (
                  <Loader2 className="w-3 h-3 text-amber-700 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                )}
              </div>
              <div className="text-[10px] text-amber-700/80 font-mono truncate mt-0.5">
                admin@...
              </div>
            </button>

            {/* Employee Card (Blue/Indigo Accent) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("employee@workspace.erp", "Employee@123", "EMPLOYEE")}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 shadow-2xs group relative cursor-pointer disabled:opacity-60 ${
                activeRole === "EMPLOYEE"
                  ? "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-400/30"
                  : "bg-indigo-50/70 hover:bg-indigo-100/80 border-indigo-200/80 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-800 tracking-tight">EMPLOYEE</span>
                {activeRole === "EMPLOYEE" ? (
                  <Loader2 className="w-3 h-3 text-indigo-700 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                )}
              </div>
              <div className="text-[10px] text-indigo-700/80 font-mono truncate mt-0.5">
                employee@...
              </div>
            </button>

            {/* Client Card (Green/Emerald Accent) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("client@workspace.erp", "Client@123", "CLIENT")}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 shadow-2xs group relative cursor-pointer disabled:opacity-60 ${
                activeRole === "CLIENT"
                  ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400/30"
                  : "bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200/80 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 tracking-tight">CLIENT</span>
                {activeRole === "CLIENT" ? (
                  <Loader2 className="w-3 h-3 text-emerald-700 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                )}
              </div>
              <div className="text-[10px] text-emerald-700/80 font-mono truncate mt-0.5">
                client@...
              </div>
            </button>
          </div>
        </div>

        {/* Clean Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white/90 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              or enter credentials
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@workspace.erp"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Living Animated Entity trapped behind the login card */}
      <LivingEntity />

      <Suspense fallback={<div className="text-slate-500 text-xs font-mono relative z-10">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
