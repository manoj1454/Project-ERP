import React from "react";
import { getInvoices, getUnbilledTimeSummary } from "@/app/actions/invoicing";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { InvoicesTable } from "@/components/financials/invoices-table";
import {
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Receipt,
  CreditCard,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface InvoiceRecord {
  id: string;
  totalAmount: number;
  payments: Array<{ amount: number }>;
}

export default async function FinancialsPage() {
  const [invoicesRes, unbilledRes] = await Promise.all([
    getInvoices(),
    getUnbilledTimeSummary(),
  ]);

  const invoices = invoicesRes.success && invoicesRes.data ? invoicesRes.data : [];
  const unbilledProjects =
    unbilledRes.success && unbilledRes.data?.projects ? unbilledRes.data.projects : [];
  const totalUnbilledMinutes =
    unbilledRes.success && unbilledRes.data?.totalUnbilledMinutes
      ? unbilledRes.data.totalUnbilledMinutes
      : 0;

  // Calculate live financial metrics
  const invoiceList = invoices as unknown as InvoiceRecord[];
  const totalBilled = invoiceList.reduce((acc: number, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoiceList.reduce((acc: number, inv) => {
    const paid = inv.payments.reduce((pAcc: number, p) => pAcc + p.amount, 0);
    return acc + paid;
  }, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const unbilledHours = Number((totalUnbilledMinutes / 60).toFixed(2));
  const estimatedUnbilledRevenue = Number((unbilledHours * 120).toFixed(2));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <TopNavbar />

      <div className="p-6 md:p-10 space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              Module F &bull; Financial Engine &amp; Billing
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Financials &amp; Accounts Receivable
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                SUPERADMIN CLEARANCE
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl font-medium">
              Automated Invoicing Pipeline: Query unbilled time entries logged via persistent timer,
              generate itemized invoices, record client settlements, and monitor cashflow.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold w-fit shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict RBAC Protected</span>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="enterprise-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
              <span>Total Billed Volume</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Across {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </div>
          </div>

          <div className="enterprise-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
              <span>Collected Revenue</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cash settled &amp; recorded</span>
            </div>
          </div>

          <div className="enterprise-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
              <span>Outstanding Balance</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono">
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">Awaiting client payment</div>
          </div>

          <div className="enterprise-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
              <span>Unbilled Pipeline</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {unbilledHours} hrs
            </div>
            <div className="text-[11px] text-indigo-700 mt-2 font-medium">
              Est. ${estimatedUnbilledRevenue.toLocaleString()} ready to bill
            </div>
          </div>
        </div>

        {/* Live Invoicing Table & Unbilled Pipeline Component */}
        <InvoicesTable initialInvoices={invoices} unbilledProjects={unbilledProjects} />
      </div>
    </div>
  );
}
