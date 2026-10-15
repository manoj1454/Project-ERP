"use client";

import React, { useState } from "react";
import { InvoiceStatus } from "@prisma/client";
import { recordInvoicePayment, updateInvoiceStatus } from "@/app/actions/invoicing";
import {
  X,
  Printer,
  CreditCard,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface InvoiceItemRecord {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
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
  items: InvoiceItemRecord[];
  payments: PaymentRecord[];
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FullInvoice | null;
  onInvoiceUpdated?: () => void;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onInvoiceUpdated,
}: InvoiceDetailModalProps) {
  const [currentInvoice, setCurrentInvoice] = useState<FullInvoice | null>(invoice);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer (ACH/Wire)");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentInvoice(invoice);
    if (invoice) {
      const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = Math.max(0, invoice.totalAmount - totalPaid);
      setPaymentAmount(remaining);
    }
  }, [invoice]);

  if (!isOpen || !currentInvoice) return null;

  const totalPaid = currentInvoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, currentInvoice.totalAmount - totalPaid);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIAL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DRAFT":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    setRecordingPayment(true);
    setError(null);

    const res = await recordInvoicePayment({
      invoiceId: currentInvoice.id,
      amount: paymentAmount,
      method: paymentMethod,
    });

    setRecordingPayment(false);

    if (res.success && res.data) {
      setCurrentInvoice(res.data.updatedInvoice as unknown as FullInvoice);
      setShowPaymentForm(false);
      if (onInvoiceUpdated) onInvoiceUpdated();
    } else {
      setError(res.error || "Failed to record payment.");
    }
  };

  const handleStatusChange = async (nextStatus: InvoiceStatus) => {
    const res = await updateInvoiceStatus(currentInvoice.id, nextStatus);
    if (res.success) {
      setCurrentInvoice({ ...currentInvoice, status: nextStatus });
      if (onInvoiceUpdated) onInvoiceUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Controls (not printed) */}
        <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                currentInvoice.status
              )}`}
            >
              {currentInvoice.status}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Created {new Date(currentInvoice.issueDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save PDF
            </button>

            {currentInvoice.status !== "PAID" && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-1 print:p-0">
          {/* Payment Form Drawer */}
          {showPaymentForm && (
            <form
              onSubmit={handleRecordPayment}
              className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Record Client Payment</span>
                <span className="text-slate-600 font-mono">Remaining Balance: ${balanceDue.toFixed(2)}</span>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Amount ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Bank Transfer (ACH/Wire)">Bank Transfer (ACH/Wire)</option>
                    <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                    <option value="Check">Corporate Check</option>
                    <option value="Crypto (USDC/USDT)">Crypto (USDC/USDT)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  {recordingPayment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Save Payment (${paymentAmount.toFixed(2)})
                </button>
              </div>
            </form>
          )}

          {/* Invoice Document Body */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Header: Company & Invoice Info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                    W
                  </div>
                  <span className="font-bold text-xl text-slate-900 tracking-tight">WORKSPACE ERP</span>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="font-medium text-slate-600">Enterprise Solutions &amp; Engineering</p>
                  <p>billing@workspace.erp</p>
                  <p>San Francisco, CA &bull; Global Operations</p>
                </div>
              </div>

              <div className="sm:text-right">
                <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {currentInvoice.invoiceNumber}
                </h1>
                <div className="text-xs text-slate-500 space-y-1 mt-2">
                  <div>
                    <span className="text-slate-400">Issue Date: </span>
                    <span className="text-slate-700 font-medium">
                      {new Date(currentInvoice.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date: </span>
                    <span className="text-amber-700 font-semibold">
                      {new Date(currentInvoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client & Project Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-200 pb-6 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To (Client):
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {currentInvoice.project.client.companyName || currentInvoice.project.client.name}
                </p>
                <p className="text-slate-600">{currentInvoice.project.client.name}</p>
                <p className="text-slate-500">{currentInvoice.project.client.email}</p>
                {currentInvoice.project.client.address && (
                  <p className="text-slate-500 mt-1">{currentInvoice.project.client.address}</p>
                )}
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Project Engagement:
                </span>
                <p className="font-bold text-indigo-600 text-sm">
                  {currentInvoice.project.name}
                </p>
                <p className="text-slate-500">Time-Tracking Auto Pipeline Billing</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Line Item / Task Description</th>
                      <th className="py-2.5 px-4 text-center">Hours</th>
                      <th className="py-2.5 px-4 text-right">Rate</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    ${currentInvoice.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (0%):</span>
                  <span className="font-mono text-slate-800 font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-900">Total Amount:</span>
                  <span className="font-mono text-slate-900 text-sm">
                    ${currentInvoice.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid:</span>
                  <span className="font-mono">-${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-700 font-bold border-t border-slate-200 pt-2 text-sm">
                  <span>Balance Due:</span>
                  <span className="font-mono">${balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payments History */}
            {currentInvoice.payments.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Payment History &amp; Settlements
                </h4>
                <div className="space-y-1.5">
                  {currentInvoice.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-800">{p.method}</span>
                        <span className="text-slate-400 text-[11px]">
                          ({new Date(p.paymentDate).toLocaleDateString()})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">
                        +${p.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="print:hidden pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status override:</span>
            {(["SENT", "PAID", "DRAFT"] as InvoiceStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={currentInvoice.status === st}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  currentInvoice.status === st
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
