import { inngest } from "./inngest-client.js";
import { jobStore } from "../modules/job/job.store.js";
import { AIExtractionService } from "../modules/ai-extraction/ai-extraction.service.js";

const MAX_RETRIES = 3;

export const processCsvJob = inngest.createFunction(
    {
        id: "process-csv-job",
        retries: MAX_RETRIES,
        concurrency: {
            limit: 5,
            key: "event.data.jobId",
        },
        triggers: [{ event: "csv/import.start" }],
    },
    async ({ event, step, attempt }) => {
        const { jobId } = event.data as { jobId: string };
        console.log(`[processCsvJob] Job started: ${jobId}, attempt: ${attempt}`);

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

        try {
            const results = await Promise.all(
                batches.map((batch, i) =>
                    step.run(`extract-batch-${i}`, async () => {
                        const result = await AIExtractionService.extractLeads(batch);
                        jobStore.recordBatchSuccess(jobId, i, result);
                        return {
                            batchIndex: i,
                            status: "success" as const,
                            extracted: result.success.length,
                            skipped: result.skipped.length,
                        };
                    })
                )
            );

            console.log(
                `[processCsvJob] Job finished: ${jobId} — all ${results.length} batches succeeded`
            );

            return { status: "completed", jobId, succeeded: results.length, failed: 0 };
        } catch (error) {
            console.error(
                `[processCsvJob] Job execution attempt ${attempt} encountered error:`,
                error
            );

            if (attempt < MAX_RETRIES) {
                throw error;
            }

            const latestJob = jobStore.get(jobId);
            if (latestJob) {
                const successfulIndices = new Set(latestJob.successfulBatches || []);
                const failedIndices = new Set(latestJob.failedBatches || []);

                for (let i = 0; i < latestJob.totalBatches; i++) {
                    if (!successfulIndices.has(i) && !failedIndices.has(i)) {
                        jobStore.recordBatchFailure(jobId, i);
                    }
                }
            }

            throw error;
        }
    }
);

export const functions = [processCsvJob];