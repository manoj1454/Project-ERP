import Link from "next/link";
import {
  Layers,
  Database,
  Activity,
  Boxes,
  Cpu,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const steps = [
    {
      num: "01",
      title: "Environment Foundation",
      status: "Live",
      detail: "Next.js 14 App Router, TypeScript (Strict), Tailwind CSS, Prisma, TanStack Query, Zustand.",
      active: true,
    },
    {
      num: "02",
      title: "Auth & Strict RBAC",
      status: "Live",
      detail: "NextAuth session management, Edge RBAC middleware, and bcrypt credential hashing.",
      active: true,
    },
    {
      num: "03",
      title: "Core DB Migration",
      status: "Live",
      detail: "14 normalized PostgreSQL tables across Modules A through F with Prisma ORM.",
      active: true,
    },
    {
      num: "04",
      title: "CRM & Project Engine",
      status: "Live",
      detail: "Client CRM, Project -> Phase -> Task hierarchy with automated phase completion triggers.",
      active: true,
    },
    {
      num: "05",
      title: "Kanban Board",
      status: "Live",
      detail: "dnd-kit drag-and-drop workflow with TanStack Query optimistic updates and snap-back rollback.",
      active: true,
    },
    {
      num: "06",
      title: "Timer & Time-Tracking",
      status: "Live",
      detail: "Zustand persisted timer in TopNavbar, automatic TimeEntry logging, and Timesheet view.",
      active: true,
    },
    {
      num: "07",
      title: "Asset Manager Vault",
      status: "Live",
      detail: "Immutable versioned storage preserving historical revisions with changelog audit trails.",
      active: true,
    },
    {
      num: "08",
      title: "Financial Billing Engine",
      status: "Live",
      detail: "Automated invoicing pipeline converting unbilled time into itemized invoices with payments.",
      active: true,
    },
    {
      num: "09",
      title: "Client Portal",
      status: "Live",
      detail: "Role-gated external hub for project progress tracking, asset downloads, and instant settlement.",
      active: true,
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-6 sm:p-12">
      {/* Header / Brand */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
              WORKSPACE{" "}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                ERP
              </span>
            </span>
            <p className="text-xs text-slate-500 font-medium">Enterprise Operations &amp; Resource Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition flex items-center gap-1.5"
          >
            <span>Client Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            Enter ERP Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <section className="relative z-10 max-w-5xl my-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-700 border border-emerald-200 font-semibold mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>All 9 Master Specification Modules Live &amp; Verified</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Enterprise ERP Engine. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
            Engineered for Precision &amp; Power.
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl font-normal leading-relaxed">
          Full-stack ERP system featuring Next.js 14 App Router, PostgreSQL on Supabase,
          strict RBAC middleware, dnd-kit Kanban with optimistic rollbacks, persistent Zustand timer,
          versioned immutable asset vaults, and automated billing engines.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="enterprise-card bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
            <Cpu className="h-6 w-6 text-indigo-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Next.js 14 + TS</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">App Router, Strict Mode, Server Actions.</p>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
            <Database className="h-6 w-6 text-cyan-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Prisma + PostgreSQL</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">14 normalized models, relations &amp; atomic triggers.</p>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
            <Activity className="h-6 w-6 text-emerald-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Timer &rarr; Invoice Link</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Atomic pipeline: Timer &rarr; TimeEntry &rarr; Invoice &rarr; Payment.</p>
          </div>

          <div className="enterprise-card bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
            <Layers className="h-6 w-6 text-indigo-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Modern Enterprise</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Landed design system with high-contrast surfaces.</p>
          </div>
        </div>

        {/* Step-by-Step Implementation Cards */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-mono">
              Architecture Delivery Timeline (Steps 1 &ndash; 9)
            </h2>
            <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-4 rounded-xl border bg-white border-slate-200 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600">{s.num}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{s.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div>Project WORKSPACE ERP — Production Ready • Modern Enterprise Design System</div>
        <div className="flex items-center gap-4 text-slate-600 font-medium">
          <Link href="/login" className="hover:text-indigo-600 transition">Sign In</Link>
          <span>&bull;</span>
          <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
          <span>&bull;</span>
          <Link href="/portal" className="hover:text-indigo-600 transition">Client Portal</Link>
        </div>
      </footer>
    </main>
  );
}
