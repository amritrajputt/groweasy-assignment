import { Readable } from "stream";
import { parseCSVStreamInBatches } from "../../common/utils/csv.utils";
import { AIExtractionService } from "../ai-extraction/ai-extraction.service.js";
import { ICrmLead } from "../../common/types/crm.types";

export const importService = {
    parseIntoBatches: async (fileBuffer: Buffer, batchSize = 30): Promise<any[][]> => {
        const stream = Readable.from(fileBuffer);
        const batches: any[][] = [];

        await parseCSVStreamInBatches(stream, batchSize, async (chunk: any) => {
            batches.push(chunk);
        });

        return batches;
    },
    processCsv: async (fileBuffer: Buffer) => {
        const batches = await importService.parseIntoBatches(fileBuffer, 30);
        const finalSuccess: ICrmLead[] = [];
        const finalSkipped: { row: any; reason: string }[] = [];
        for (const batch of batches) {
            const result = await AIExtractionService.extractLeads(batch)
            finalSuccess.push(...result.success)
            finalSkipped.push(...result.skipped)
        }
        return { success: finalSuccess, skipped: finalSkipped, totalImported: finalSuccess.length, totalSkipped: finalSkipped.length }
    }
};
