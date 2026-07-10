import type { ICrmLead } from "../../common/types/crm.types.js";

export type JobStatus = "processing" | "completed" | "failed";

export interface Job {
    id: string;
    status: JobStatus;
    totalBatches: number;
    completedBatches: number;
    successRecords: ICrmLead[];
    skippedRecords: { row: unknown; reason: string }[];
    failedBatches: number[];
    createdAt: number;
    batches?: any[][];
}
const jobs = new Map<string, Job>();

export const jobStore = {
    create(jobId: string, totalBatches: number, batches?: any[][]): Job {
        const job: Job = {
            id: jobId,
            status: "processing",
            totalBatches,
            completedBatches: 0,
            successRecords: [],
            skippedRecords: [],
            failedBatches: [],
            createdAt: Date.now(),
            batches,
        };
        jobs.set(jobId, job);
        return job;
    },

    get(jobId: string): Job | undefined {
        return jobs.get(jobId);
    },

    recordBatchSuccess(
        jobId: string,
        result: { success: ICrmLead[]; skipped: { row: unknown; reason: string }[] }
    ): void {
        const job = jobs.get(jobId);
        if (!job) return;

        job.completedBatches += 1;
        job.successRecords.push(...result.success);
        job.skippedRecords.push(...result.skipped);

        if (job.completedBatches >= job.totalBatches) {
            job.status = "completed";
            delete job.batches;
        }
    },

    recordBatchFailure(jobId: string, batchIndex: number): void {
        const job = jobs.get(jobId);
        if (!job) return;

        job.completedBatches += 1;
        job.failedBatches.push(batchIndex);

        if (job.completedBatches >= job.totalBatches) {
            job.status = job.failedBatches.length > 0 ? "failed" : "completed";
            delete job.batches;
        }
    },

    getProgress(jobId: string) {
        const job = jobs.get(jobId);
        if (!job) return null;

        return {
            status: job.status,
            progress: Math.round((job.completedBatches / job.totalBatches) * 100),
            completedBatches: job.completedBatches,
            totalBatches: job.totalBatches,
            totalImported: job.successRecords.length,
            totalSkipped: job.skippedRecords.length,
            failedBatches: job.failedBatches,
            ...(job.status !== "processing" && {
                success: job.successRecords,
                skipped: job.skippedRecords,
            }),
        };
    },

    cleanupOldJobs(maxAgeMs: number = 30 * 60 * 1000): void {
        const now = Date.now();
        for (const [id, job] of jobs.entries()) {
            if (now - job.createdAt > maxAgeMs) {
                jobs.delete(id);
            }
        }
    },
};