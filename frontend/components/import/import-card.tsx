"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { ImportPreview } from "./import-preview";
import { IconAlertTriangle, IconInfoCircle, IconFileSpreadsheet } from "@tabler/icons-react";
import Papa from "papaparse";

interface ImportCardProps {
  files: File[];
  onChange: (files: File[]) => void;
  onClear: () => void;
  onSubmit: () => void;
  error: string | null;
}

export function ImportCard({
  files,
  onChange,
  onClear,
  onSubmit,
  error,
}: ImportCardProps) {
  const [resetKey, setResetKey] = useState(0);
  
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<string[][]>([]);

  const handleFileChange = (newFiles: File[]) => {
    onChange(newFiles);
    
    if (newFiles.length === 0) {
      setPreviewHeaders([]);
      setPreviewData([]);
      return;
    }

    const file = newFiles[0];
    Papa.parse(file, {
      preview: 6,
      complete: (results) => {
        const parsedRows = results.data as string[][];
        if (parsedRows.length > 0) {
          const headers = parsedRows[0];
          const dataRows = parsedRows.slice(1).filter(row => row.some(cell => cell && cell.trim() !== ""));
          setPreviewHeaders(headers);
          setPreviewData(dataRows);
        }
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
      }
    });
  };

  const handleClear = () => {
    onClear();
    setPreviewHeaders([]);
    setPreviewData([]);
    setResetKey(prev => prev + 1);
  };

  const downloadTemplate = () => {
    const headers = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description"
    ];

    const sampleRow = [
      "2026-06-01 10:15:00",
      "Ankit Verma",
      "ankit.verma@gmail.com",
      "91",
      "9123456780",
      "Google",
      "Mumbai",
      "Maharashtra",
      "India",
      "Amrit",
      "GOOD_LEAD_FOLLOW_UP",
      "Needs urgent call",
      "meridian_tower",
      "Immediate",
      "Interested in commercial properties"
    ];

    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "crm_leads_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden p-4 md:p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-250">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Import Leads via CSV
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Upload a CSV file to bulk import leads into your system.
          </p>
        </div>
      </div>

      <FileUpload key={resetKey} onChange={handleFileChange} />

      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center -mt-2 z-20 gap-1.5">
          <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 ring-1 ring-inset ring-neutral-200/50 dark:ring-neutral-700/55">
            <IconInfoCircle className="h-3 w-3 text-neutral-500" />
            CSV format (max 5MB)
          </div>

          <p className="max-w-md px-4 text-center text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal font-normal">
            Required fields: <span className="font-mono text-neutral-700 dark:text-neutral-300">name, email, mobile_without_country_code, crm_status, data_source</span>, etc.
          </p>

          <button
            type="button"
            onClick={downloadTemplate}
            className="mt-1 inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            <IconFileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Download CSV Template
          </button>
        </div>
      )}

      {files.length > 0 && <ImportPreview headers={previewHeaders} data={previewData} />}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-4 text-xs font-medium text-red-700 dark:text-red-400">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <button
          type="button"
          onClick={handleClear}
          disabled={files.length === 0}
          className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:pointer-events-none cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={files.length === 0}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:border-none text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:pointer-events-none"
        >
          Upload File
        </button>
      </div>
    </div>
  );
}
