"use client";

import React, { useState } from "react";
import { ClientStatus, InteractionType } from "@prisma/client";
import { deleteClient } from "@/app/actions/crm";
import { ClientModal } from "@/components/crm/client-modal";
import { InteractionModal } from "@/components/crm/interaction-modal";
import {
  Search,
  Plus,
  Building,
  Mail,
  Phone,
  Edit2,
  Trash2,
  MessageSquare,
  Briefcase,
} from "lucide-react";

interface ClientRecord {
  id: string;
  name: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  status: ClientStatus;
  createdAt: Date;
  projects: { id: string; name: string; status: string; budget: number | null }[];
  interactionLogs: {
    id: string;
    type: InteractionType;
    notes: string;
    timestamp: Date;
  }[];
  _count: {
    projects: number;
    interactionLogs: number;
  };
}

interface ClientTableProps {
  initialClients: ClientRecord[];
  onRefresh: () => void;
}

export function ClientTable({ initialClients, onRefresh }: ClientTableProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientRecord | null>(null);

  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [interactionClient, setInteractionClient] = useState<{ id: string; name: string } | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.companyName && client.companyName.toLowerCase().includes(search.toLowerCase())) ||
      client.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || client.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: clients.length,
    LEAD: clients.filter((c) => c.status === ClientStatus.LEAD).length,
    ACTIVE: clients.filter((c) => c.status === ClientStatus.ACTIVE).length,
    ARCHIVED: clients.filter((c) => c.status === ClientStatus.ARCHIVED).length,
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client "${name}" and all associated data?`)) {
      await deleteClient(id);
      onRefresh();
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ACTIVE
          </span>
        );
      case ClientStatus.LEAD:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            LEAD
          </span>
        );
      case ClientStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            ARCHIVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 overflow-x-auto">
          {(["ALL", "ACTIVE", "LEAD", "ARCHIVED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === tab
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                selectedStatus === tab ? "bg-indigo-50 text-indigo-700" : "bg-slate-200/80 text-slate-600"
              }`}>
                {statusCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Right Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients or company..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-2xs"
            />
          </div>

          <button
            onClick={() => {
              setClientToEdit(null);
              setIsClientModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Client / Organization</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Status</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Contact Info</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Projects</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px]">Recent Interaction</th>
                <th className="py-3 px-4 font-mono uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No client records match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const latestLog = client.interactionLogs[0];
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 tracking-tight">
                              {client.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{client.companyName || "Independent"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(client.status)}</td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a
                              href={`mailto:${client.email}`}
                              className="hover:text-indigo-600 hover:underline transition"
                            >
                              {client.email}
                            </a>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Projects count */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-bold text-slate-900">
                            {client._count.projects}
                          </span>
                          <span className="text-slate-500 text-[11px]">active</span>
                        </div>
                      </td>

                      {/* Recent Interaction */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {latestLog ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                                {latestLog.type}
                              </span>
                              <span>
                                {new Date(latestLog.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate mt-1">
                              {latestLog.notes}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            No interactions logged
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setInteractionClient({ id: client.id, name: client.name });
                              setIsInteractionModalOpen(true);
                            }}
                            title="Log Interaction"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition cursor-pointer shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setClientToEdit(client);
                              setIsClientModalOpen(true);
                            }}
                            title="Edit Client"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                            title="Delete Client"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={onRefresh}
        clientToEdit={clientToEdit}
      />

      {/* Interaction Modal */}
      {interactionClient && (
        <InteractionModal
          isOpen={isInteractionModalOpen}
          onClose={() => {
            setIsInteractionModalOpen(false);
            setInteractionClient(null);
          }}
          onSuccess={onRefresh}
          clientId={interactionClient.id}
          clientName={interactionClient.name}
        />
      )}
    </div>
  );
}
