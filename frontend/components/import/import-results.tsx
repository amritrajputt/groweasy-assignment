"use client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  IconCheck,
  IconAlertTriangle,
  IconSearch,
  IconFileSpreadsheet,
  IconFileText,
  IconArrowLeft,
} from "@tabler/icons-react";

interface Lead {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

interface SkippedRecord {
  row: any;
  reason: string;
}

interface ImportResultsProps {
  totalImported: number;
  totalSkipped: number;
  success?: Lead[];
  skipped?: SkippedRecord[];
  status: "completed" | "failed";
  onStartOver: () => void;
}

export function ImportResults({
  totalImported,
  totalSkipped,
  success = [],
  skipped = [],
  status,
  onStartOver,
}: ImportResultsProps) {
  const [activeTab, setActiveTab] = useState<"success" | "skipped">("success");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuccess = success.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.city?.toLowerCase().includes(query) ||
      lead.crm_status?.toLowerCase().includes(query) ||
      lead.data_source?.toLowerCase().includes(query)
    );
  });

  const filteredSkipped = skipped.filter((item) => {
    const query = searchQuery.toLowerCase();
    const rowValues = JSON.stringify(item.row).toLowerCase();
    return rowValues.includes(query) || item.reason.toLowerCase().includes(query);
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          {status === "completed" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400">
              <IconAlertTriangle className="h-6 w-6" />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {status === "completed" ? "Import Completed Successfully" : "Import Failed / Halted"}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              AI successfully sanitized and processed {totalImported + totalSkipped} rows.
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer self-start md:self-auto"
        >
          <IconArrowLeft className="h-4 w-4" />
          Import Another File
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Total Rows</span>
          <span className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">{totalImported + totalSkipped}</span>
        </div>
        <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Sanitized & Imported</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalImported}</span>
        </div>
        <div className="bg-amber-50/20 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100/50 dark:border-amber-900/10 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Skipped (Logs / Cleaned)</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{totalSkipped}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-50 dark:bg-neutral-950 self-start">
          <button
            type="button"
            onClick={() => { setActiveTab("success"); setSearchQuery(""); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "success"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <IconFileSpreadsheet className="h-4 w-4" />
            Imported Leads ({filteredSuccess.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("skipped"); setSearchQuery(""); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "skipped"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <IconFileText className="h-4 w-4" />
            Skipped Records ({filteredSkipped.length})
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder={activeTab === "success" ? "Search imported leads..." : "Search skipped errors..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm max-h-[700px] overflow-auto">
        {activeTab === "success" ? (
          filteredSuccess.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <TableHead className="font-bold whitespace-nowrap">Created At</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Name</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Email</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Country Code</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Mobile</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Company</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">City</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">State</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Country</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Lead Owner</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">CRM Status</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Data Source</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Possession Time</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Description</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">CRM Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuccess.map((lead, idx) => (
                  <TableRow key={`lead-${idx}`} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                    <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                      {lead.created_at || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                      {lead.name || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.email || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.country_code ? (lead.country_code.startsWith("+") ? lead.country_code : `+${lead.country_code}`) : <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.mobile_without_country_code || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.company || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.city || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.state || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.country || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {lead.lead_owner || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                        lead.crm_status === "GOOD_LEAD_FOLLOW_UP"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25"
                          : lead.crm_status === "SALE_DONE"
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/25"
                          : lead.crm_status === "BAD_LEAD"
                          ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/25"
                          : "bg-neutral-50 text-neutral-650 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                      }`}>
                        {lead.crm_status?.replace(/_/g, " ") || "UNMAPPED"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                      {lead.data_source || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                      {lead.possession_time || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 max-w-xs truncate whitespace-nowrap" title={lead.description}>
                      {lead.description || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 max-w-xs truncate whitespace-nowrap" title={lead.crm_note}>
                      {lead.crm_note || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-neutral-900 gap-2">
              <IconFileSpreadsheet className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No imported records found</p>
              <p className="text-xs text-neutral-400">Try adjusting your search query.</p>
            </div>
          )
        ) : (
          filteredSkipped.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <TableHead className="w-[10%] font-bold">Row #</TableHead>
                  <TableHead className="w-[40%] font-bold text-red-500 dark:text-red-400">Skip Reason</TableHead>
                  <TableHead className="w-[50%] font-bold">Original Row Data Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkipped.map((item, idx) => (
                  <TableRow key={`skipped-${idx}`} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                    <TableCell className="font-mono text-neutral-500">
                      #{idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600 dark:text-red-400 text-xs">
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-[11px] text-neutral-500 font-mono max-w-md truncate" title={JSON.stringify(item.row, null, 2)}>
                      {JSON.stringify(item.row)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-neutral-900 gap-2">
              <IconFileText className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No skipped records found</p>
              <p className="text-xs text-neutral-400">All rows were successfully imported or query matches nothing.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
