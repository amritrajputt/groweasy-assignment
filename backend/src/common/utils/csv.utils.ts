import papaParse from "papaparse";
import { Readable } from "stream";

export const parseCSVStreamInBatches = (
    stream: Readable,
    batchSize: number,
    onBatch: (chunkOfRows: any[]) => Promise<void>
) => {
    return new Promise<void>((resolve, reject) => {
        let rowBuffer: any[] = [];

        papaParse.parse(stream, {
            header: true,
            dynamicTyping: true, //auto convert to types
            skipEmptyLines: true,
            step: async (results, parser) => {
                rowBuffer.push(results.data);

                if (rowBuffer.length >= batchSize) {
                    parser.pause();
                    try {
                        await onBatch(rowBuffer);
                        rowBuffer = [];
                        parser.resume();
                    } catch (error) {
                        parser.abort();
                        reject(error);
                    }
                }
            },
            complete: async () => {
                try {
                    if (rowBuffer.length > 0) {
                        await onBatch(rowBuffer);
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            },
            error: reject,
        });
    });
};
