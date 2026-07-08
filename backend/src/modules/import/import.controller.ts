import { Request, Response, NextFunction } from "express";
import ApiResponse from "../../common/utils/ApiResponse";
import ApiError from "../../common/utils/ApiError";
import { importService } from "./import.service"; // 1. Import the service

export const importController = {
  importCsv: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ApiError(400, "No CSV file uploaded.");
      }

      // 2. Call the service method correctly
      const result = await importService.processCsvFile(req.file.buffer);

      // 3. Respond with ApiResponse
      const response = new ApiResponse(200, result, "CSV parsed successfully (No AI yet)");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
};
