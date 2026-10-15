"use client";

import React, { useState } from "react";
import { InvoiceStatus } from "@prisma/client";
import {
  Receipt,
  Search,
  Clock,
  Eye,
  Plus,
  ArrowRight,
  Building,
} from "lucide-react";
import { InvoiceGeneratorModal } from "./invoice-generator-modal";
import { InvoiceDetailModal } from "./invoice-detail-modal";

interface UnbilledProjectGroup {
  project: {
    id: string;
    name: string;
    client: { id: string; name: string; companyName: string | null; email: string };
  };
  entries: Array<{
    id: string;
    taskName: string;
    userName: string;
    durationMinutes: number;
    hours: number;
    notes: string | null;
    startTime: Date;
  }>;
  totalMinutes: number;
  totalHours: number;
}

interface FullInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface FullPayment {
  id: string;
  amount: number;
  paymentDate: string | Date;
  method: string;
}

interface FullInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  totalAmount: number;
  status: InvoiceStatus;
  project: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
      companyName: string | null;
      email: string;
      address?: string | null;
      phone?: string | null;
    };
  };
  items: FullInvoiceItem[];
  payments: FullPayment[];
}

interface InvoicesTableProps {
  initialInvoices: FullInvoice[];
  unbilledProjects: UnbilledProjectGroup[];
}

export function InvoicesTable({ initialInvoices, unbilledProjects }: InvoicesTableProps) {
  const [invoices, setInvoices] = useState<FullInvoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [selectedProjectIdForInvoice, setSelectedProjectIdForInvoice] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<FullInvoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.project.client.companyName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      inv.project.client.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
      case "PARTIAL":
        return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      case "SENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold";
      case "DRAFT":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 font-semibold";
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: Unbilled Time Pipeline (Timer -> Time Entry -> Invoice Link) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Unbilled Time Pipeline &amp; Billable Hours
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Logged time entries ready to be converted into client invoices with one click.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedProjectIdForInvoice(null);
              setGeneratorOpen(true);
            }}
            disabled={unbilledProjects.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Batch Invoice Unbilled Time
          </button>
        </div>

        {unbilledProjects.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-xs font-medium">
            All logged billable hours across all active projects have been fully invoiced. Great job!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unbilledProjects.map((group) => {
              const estimatedAmount = group.totalHours * 120; // estimate at standard $120/hr
              return (
                <div
                  key={group.project.id}
                  className="p-5 rounded-xl enterprise-card bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {group.entries.length} Unbilled Entries
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {group.totalHours} hrs
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 tracking-tight mt-1 line-clamp-1">
                      {group.project.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{group.project.client.companyName}</span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Est. Value (@ $120/h):</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ${estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedProjectIdForInvoice(group.project.id);
                        setGeneratorOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      <span>Generate Invoice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Invoices Register */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl enterprise-card bg-white border border-slate-200 shadow-xs">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoices by #, project, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {["ALL", "SENT", "PARTIAL", "PAID", "DRAFT"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {st === "ALL" ? "All Invoices" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices List Table */}
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <Receipt className="w-10 h-10 text-slate-300 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-900">No invoices found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
              No invoices match your filter. Generate your first invoice from unbilled time above!
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden enterprise-card bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Project &amp; Client</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                    const balanceDue = Math.max(0, inv.totalAmount - totalPaid);

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedInvoiceForDetail(inv);
                          setDetailModalOpen(true);
                        }}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {inv.invoiceNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{inv.project.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {inv.project.client.companyName}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(inv.issueDate).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {balanceDue === 0 ? (
                            <span className="text-emerald-600">$0.00</span>
                          ) : (
                            <span className="text-amber-600">
                              ${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${getStatusBadge(
                              inv.status
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedInvoiceForDetail(inv);
                              setDetailModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Generator Modal */}
      <InvoiceGeneratorModal
        isOpen={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onSuccess={(newInv) => {
          if (newInv) {
            setInvoices((prev) => [newInv as FullInvoice, ...prev]);
          }
          window.location.reload();
        }}
        unbilledProjects={unbilledProjects}
        selectedProjectId={selectedProjectIdForInvoice}
      />

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        invoice={selectedInvoiceForDetail}
        onInvoiceUpdated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
