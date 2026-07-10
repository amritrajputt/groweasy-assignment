"use client";
import React from "react";
import { ImportCard } from "@/components/import/import-card";
import { ImportProgress } from "@/components/import/import-progress";
import { ImportResults } from "@/components/import/import-results";
import { useLeadImport } from "@/hooks/use-lead-import";
import { cn } from "@/lib/utils";

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
    </div>
  );
}
