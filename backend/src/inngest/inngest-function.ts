import { inngest } from "./inngest-client.js";
import { jobStore } from "../modules/job/job.store.js";
import { AIExtractionService } from "../modules/ai-extraction/ai-extraction.service.js";


export const processCsvJob = inngest.createFunction(
    {
        id: "process-csv-job",
        retries: 3,
        triggers: [{ event: "csv/import.start" }],
    },
    async ({ event, step }: { event: any; step: any }) => {
        const { jobId } = event.data as { jobId: string };
        const job = jobStore.get(jobId);
        if (!job || !job.batches) {
            throw new Error(`Job ${jobId} not found or batches have already been processed/garbage collected.`);
        }

        const totalBatches = job.batches.length;

        await step.sendEvent(
            "fan-out-batches",
            job.batches.map((batch: any[], i: number) => ({
                name: "csv/batch.process",
                data: {
                    jobId,
                    batchIndex: i,
                    rows: batch,
                    totalBatches,
                },
            }))
        );
        delete job.batches;

        return { status: "dispatched", jobId, totalBatches };
    }
);


 
export const processBatch = inngest.createFunction(
    {
        id: "process-csv-batch",
        retries: 3,
        triggers: [{ event: "csv/batch.process" }],
        concurrency: {
            limit: 10, 
        },
    },
    async ({ event }: { event: any }) => {
        const { jobId, batchIndex, rows } = event.data as {
            jobId: string;
            batchIndex: number;
            rows: Record<string, any>[];
        };

        try {
            const result = await AIExtractionService.extractLeads(rows);
            jobStore.recordBatchSuccess(jobId, result);
            return { batchIndex, status: "success", processed: result.success.length, skipped: result.skipped.length };
        } catch (error) {
            console.error(`Error processing batch ${batchIndex}:`, error);
            jobStore.recordBatchFailure(jobId, batchIndex);
            return { batchIndex, status: "failed" };
        }
    }
);

export const functions = [processCsvJob, processBatch];
