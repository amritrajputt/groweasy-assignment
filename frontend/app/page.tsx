"use client";
import React from "react";
import { ImportCard } from "@/components/import/import-card";
import { ImportProgress } from "@/components/import/import-progress";
import { ImportResults } from "@/components/import/import-results";
import { useLeadImport } from "@/hooks/use-lead-import";
import { cn } from "@/lib/utils";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function Home() {
  const {
    files,
    uploading,
    error,
    jobId,
    progress,
    mounted,
    handleFileUpload,
    handleClear,
    handleUploadSubmit,
    handleStartOver,
  } = useLeadImport();

  const isCompleted = progress && (progress.status === "completed" || progress.status === "failed") && !uploading;

  if (!mounted) {
    return <div className="min-h-[400px]" />;
  }

  return (
    <div className={cn(
      "flex flex-col flex-1 transition-all",
      isCompleted 
        ? "items-stretch justify-start w-full max-w-none p-4 md:p-8" 
        : "items-center justify-center p-6 md:p-12"
    )}>
      {!jobId && !uploading && (
        <ImportCard
          files={files}
          onChange={handleFileUpload}
          onClear={handleClear}
          onSubmit={handleUploadSubmit}
          error={error}
        />
      )}

      {uploading && (
        <ImportProgress
          progress={progress?.progress ?? 0}
          completedBatches={progress?.completedBatches ?? 0}
          totalBatches={progress?.totalBatches ?? 0}
          totalImported={progress?.totalImported ?? 0}
          totalSkipped={progress?.totalSkipped ?? 0}
          status={progress?.status ?? "processing"}
        />
      )}

      {!uploading && progress && (progress.status === "completed" || progress.status === "failed") && (
        <ImportResults
          totalImported={progress.totalImported}
          totalSkipped={progress.totalSkipped}
          success={progress.success}
          skipped={progress.skipped}
          status={progress.status}
          onStartOver={handleStartOver}
        />
      )}

      {/* Fallback error state if we have an error but none of the above components are rendered */}
      {!uploading && !progress && jobId && error && (
        <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4 items-center text-center animate-in fade-in zoom-in-95 duration-250">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400">
            <IconAlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              Failed to load import job
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartOver}
            className="mt-2 px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-sm transition-all cursor-pointer shadow-sm"
          >
            Start Over / Import New CSV
          </button>
        </div>
      )}
    </div>
  );
}
