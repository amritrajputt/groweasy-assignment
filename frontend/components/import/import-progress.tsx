"use client";
import React from "react";

interface ImportProgressProps {
  progress: number;
  completedBatches: number;
  totalBatches: number;
  totalImported: number;
  totalSkipped: number;
  status: string;
}

export function ImportProgress({
  progress,
  completedBatches,
  totalBatches,
  totalImported,
  totalSkipped,
  status,
}: ImportProgressProps) {
  return (
    <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-250">
      <div className="relative flex items-center justify-center">
       
        <svg 
          className="h-16 w-16 animate-spin text-emerald-600 dark:text-emerald-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-20" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="1.5"
          />
          <path 
            className="opacity-80" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M12 2a10 10 0 0 1 10 10"
          />
        </svg>
      </div>

      <div className="text-center flex flex-col gap-1.5 w-full">
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
          Sanitizing & Importing Leads
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {status === "processing"
            ? `AI is mapping and cleaning leads... Batch ${completedBatches} of ${totalBatches} complete.`
            : "Parsing CSV data..."}
        </p>
      </div>

      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex w-full items-center justify-between px-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <span>{progress}% processed</span>
        <div className="flex gap-3">
          <span className="text-emerald-600 dark:text-emerald-400">Imported: {totalImported}</span>
          <span className="text-amber-600 dark:text-amber-500">Skipped: {totalSkipped}</span>
        </div>
      </div>
    </div>
  );
}
