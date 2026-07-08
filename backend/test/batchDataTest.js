import { createReadStream } from "fs";
import { parseCSVStreamInBatches } from "../src/common/utils/csv.utils.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  const csvFilePath = "D:/groweasy assignment (csv cleaner)/backend/sample.csv";
  const stream = createReadStream(csvFilePath);
  
  console.log("Parsing CSV stream...");
  
  await parseCSVStreamInBatches(stream, 30, async (chunk) => {
    chunk.forEach(c => console.log(c));
    
    console.log(`BATCH COMPLETED. Sleeping 2 seconds before next batch...`);
    await sleep(2000); 
  });
  
  console.log("Completed!");
}

runTest().catch(console.error);
