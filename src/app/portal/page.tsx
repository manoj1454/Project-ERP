import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientPortalData } from "@/app/actions/portal";
import { ClientPortalView } from "@/components/portal/client-portal-view";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  // Middleware guards this, but defense in depth
  if (session.user.role === "EMPLOYEE") {
    redirect("/unauthorized?requiredRole=CLIENT&currentRole=EMPLOYEE");
  }

  const portalRes = await getClientPortalData(session.user.email || undefined);

  if (!portalRes.success || !portalRes.data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">No Client Record Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your user account ({session.user.email}) is authenticated, but no active client company
            or associated projects are linked yet in the CRM.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientPortalView
      client={portalRes.data as unknown as Parameters<typeof ClientPortalView>[0]["client"]}
      userRole={session.user.role}
    />
  );
}
