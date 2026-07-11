import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import ApiResponse from "../../common/utils/ApiResponse.js";
import ApiError from "../../common/utils/ApiError.js";
import { importService } from "./import.service.js";
import { inngest } from "../../inngest/inngest-client.js";
import { jobStore } from "../job/job.store.js";

const hashToJobMap = new Map<string, string>();

export const importController = {
  importCsv: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No CSV file uploaded.");
      }

      const fileHash = crypto.createHash("md5").update(req.file.buffer).digest("hex");

      const existingJobId = hashToJobMap.get(fileHash);
      if (existingJobId) {
        const progress = jobStore.getProgress(existingJobId);// return it immediately (idempotent nature)
        
        if (progress && progress.status !== "failed") {
          const totalRows = progress.totalImported + progress.totalSkipped;
          const response = ApiResponse.success(
            { jobId: existingJobId, totalBatches: progress.totalBatches, totalRows }, 
            "CSV import retrieved from cache (idempotent)"
          );
          res.status(response.statusCode).json(response);
          return;
        }
      }

      const batches = await importService.parseIntoBatches(req.file.buffer, 25);
      
      if (batches.length === 0) {
        throw ApiError.badRequest("Uploaded CSV file is empty.");
      }

      const jobId = uuidv4(); //idempotency key for job
      jobStore.create(jobId, batches.length, batches);
      
      hashToJobMap.set(fileHash, jobId); //saving  hash for future same file uploads (idempotency)

      try {
        await inngest.send({
          name: "csv/import.start",
          data: {
            jobId
          }
        });
      } catch (err) {
        hashToJobMap.delete(fileHash);
        jobStore.delete(jobId);
        throw err;
      }

      const totalRows = batches.reduce((acc, batch) => acc + batch.length, 0);
      const response = ApiResponse.accepted(
        { jobId, totalBatches: batches.length, totalRows }, 
        "CSV import started in the background"
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  getJobStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const progress = jobStore.getProgress(jobId);

      if (!progress) {
        throw ApiError.notFound("Import job not found.");
      }

      const response = ApiResponse.success(progress, "Job status retrieved successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
};
