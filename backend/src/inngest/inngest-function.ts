import { inngest } from "./inngest-client.js";
import { jobStore } from "../modules/job/job.store.js";
import { AIExtractionService } from "../modules/ai-extraction/ai-extraction.service.js";

export const processCsvJob = inngest.createFunction(
    {
        id: "process-csv-job",
        retries: 3,
        concurrency: {
            limit: 5,
            key: "event.data.jobId",
        },
        triggers: [{ event: "csv/import.start" }],
    },
    async ({ event, step }) => {
        const { jobId } = event.data as { jobId: string };
        console.log(`[processCsvJob] Job started: ${jobId}`);

        const job = jobStore.get(jobId);
        if (!job || !job.batches) {
            console.error(`[processCsvJob] Job not found or batches already processed: ${jobId}`);
            throw new Error(
                `Job ${jobId} not found or batches have already been processed/garbage collected.`
            );
        }

        const { batches } = job;
        console.log(
            `[processCsvJob] Job ${jobId} has ${batches.length} batches. Starting extraction (max 5 concurrent)...`
        );

      
        const results = await Promise.allSettled(
            batches.map((batch, i) =>
                step
                    .run(`extract-batch-${i}`, async () => {
                        console.log(`[processCsvJob] Batch ${i} started with ${batch.length} rows`);
                        const result = await AIExtractionService.extractLeads(batch);
                        jobStore.recordBatchSuccess(jobId, result);
                        console.log(
                            `[processCsvJob] Batch ${i} succeeded: extracted ${result.success.length} leads, skipped ${result.skipped.length}`
                        );
                        return {
                            batchIndex: i,
                            status: "success" as const,
                            extracted: result.success.length,
                            skipped: result.skipped.length,
                        };
                    })
                    .catch((error) => {
                        console.error(`[processCsvJob] Batch ${i} failed permanently:`, error);
                        jobStore.recordBatchFailure(jobId, i);
                        return { batchIndex: i, status: "failed" as const };
                    })
            )
        );

        const succeeded = results.filter(
            (r) => r.status === "fulfilled" && r.value.status === "success"
        ).length;
        const failed = batches.length - succeeded;

        console.log(
            `[processCsvJob] Job finished: ${jobId} — ${succeeded} batches succeeded, ${failed} failed`
        );

        return { status: "completed", jobId, succeeded, failed };
    }
);

export const functions = [processCsvJob];