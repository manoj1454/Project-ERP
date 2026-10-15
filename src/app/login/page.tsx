"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Boxes } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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

      {/* Card */}
      <div className="enterprise-card bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Authenticate to access role-gated operations</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo RBAC Fast-Login Selectors */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Demo Roles (1-Click Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@workspace.erp", "Admin@123")}
              className="px-2.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition"
            >
              <div className="text-[11px] font-bold text-amber-800">SUPERADMIN</div>
              <div className="text-[10px] text-amber-600 truncate font-mono">admin@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("employee@workspace.erp", "Employee@123")}
              className="px-2.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition"
            >
              <div className="text-[11px] font-bold text-indigo-700">EMPLOYEE</div>
              <div className="text-[10px] text-indigo-600 truncate font-mono">employee@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("client@workspace.erp", "Client@123")}
              className="px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition"
            >
              <div className="text-[11px] font-bold text-emerald-800">CLIENT</div>
              <div className="text-[10px] text-emerald-600 truncate font-mono">client@...</div>
            </button>
          </div>
        </div>

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
      <Suspense fallback={<div className="text-slate-500 text-xs font-mono">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
