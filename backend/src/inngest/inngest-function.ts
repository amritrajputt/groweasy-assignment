import { inngest } from "./inngest-client.js";
import { jobStore } from "../modules/job/job.store.js";
import { AIExtractionService } from "../modules/ai-extraction/ai-extraction.service.js";

export const processCsvJob = inngest.createFunction(
    {
        id: "process-csv-job",
        triggers: [{ event: "csv/import.start" }],
        retries: 5
    },
    async ({ event, step }) => {
        const { jobId } = event.data as { jobId: string };
        const job = jobStore.get(jobId);
        if (!job || !job.batches) {
            throw new Error(`Job ${jobId} not found or batches have already been processed/garbage collected.`);
        }
        const { batches } = job;

        await step.run("process-all-batches", async () => {
            const promises = batches.map(async (batch, i) => {
                try {
                    const result = await AIExtractionService.extractLeads(batch);
                    jobStore.recordBatchSuccess(jobId, result);
                    return result;
                } catch (error) {
                    console.error(`Error processing batch ${i} in background job:`, error);
                    jobStore.recordBatchFailure(jobId, i);
                    return null;
                }
            });
            await Promise.all(promises);
        });
        return { status: "completed", jobId };
    }
);

export const functions = [processCsvJob];
