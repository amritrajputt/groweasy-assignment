"use client";
import { useState, useRef, useEffect } from "react";
import { importApi } from "@/services/import-api";
import { JobProgress } from "@/types/import.types";

export function useLeadImport() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [mounted, setMounted] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setUploading(false);
  };

  const startPolling = (id: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const fetchStatus = async () => {
      try {
        const response = await importApi.getJobStatus(id);
        const jobProgress: JobProgress = response.data;

        setProgress(jobProgress);

        if (jobProgress.status === "completed" || jobProgress.status === "failed") {
          stopPolling();
        }
      } catch (pollErr: unknown) {
        const errorWithMessage = pollErr as { response?: { data?: { message?: string } } };
        console.error("Polling error:", pollErr);
        setError(errorWithMessage.response?.data?.message || "An error occurred while tracking import progress.");
        stopPolling();
      }
    };

    fetchStatus(); // fetch immediately to avoid 1.5s delay
    pollingRef.current = setInterval(fetchStatus, 1500);
  };

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
  };

  const handleClear = () => {
    setFiles([]);
    setError(null);
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await importApi.uploadCsv(files[0]);
      const { jobId: newJobId, totalBatches } = response.data;

      setJobId(newJobId);
      localStorage.setItem("lead_import_job_id", newJobId);
      
      
      window.history.pushState(null, "", `/?jobId=${newJobId}`);

      setProgress({
        status: "processing",
        progress: 0,
        completedBatches: 0,
        totalBatches: totalBatches,
        totalImported: 0,
        totalSkipped: 0,
        failedBatches: [],
      });

      startPolling(newJobId);
    } catch (err: unknown) {
      const errorWithMessage = err as { response?: { data?: { message?: string } } };
      console.error("Upload error:", err);
      setError(errorWithMessage.response?.data?.message || "Failed to upload CSV file.");
      setUploading(false);
    }
  };

  const handleStartOver = () => {
    localStorage.removeItem("lead_import_job_id");

    
    window.history.pushState(null, "", "/");

    stopPolling();
    setFiles([]);
    setError(null);
    setJobId(null);
    setProgress(null);
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const params = new URLSearchParams(window.location.search);
      const urlJobId = params.get("jobId");
      const savedJobId = urlJobId || localStorage.getItem("lead_import_job_id");

      if (savedJobId) {
        setJobId(savedJobId);
        setUploading(true);
        startPolling(savedJobId);

        if (!urlJobId) {
          window.history.replaceState(null, "", `/?jobId=${savedJobId}`);
        }
      }
    }, 0);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
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
  };
}

