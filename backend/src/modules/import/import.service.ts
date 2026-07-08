import { Readable } from "stream";
import { parseCSVStreamInBatches } from "../../common/utils/csv.utils";

export const importService = {
    processCsvFile: async (fileBuffer: Buffer) => {
        const stream = Readable.from(fileBuffer);

        let totalRows = 0;
        let totalBatches = 0;
        const batchSize = 30;

        await parseCSVStreamInBatches(stream, batchSize, async (chunk) => {
            totalBatches++;
            totalRows += chunk.length;
            console.log(`Processing batch #${totalBatches} containing ${chunk.length} rows`);

        });

        return {
            totalRows,
            totalBatches,
            batchSize
        };
    }
};
