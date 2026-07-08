import { Request, Response, NextFunction } from "express";
import ApiResponse from "../../common/utils/ApiResponse";
import ApiError from "../../common/utils/ApiError";
import { importService } from "./import.service";

export const importController = {
  importCsv: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ApiError(400, "No CSV file uploaded.");
      }

      const result = await importService.processCsvFile(req.file.buffer);

      const response = new ApiResponse(200, result, "CSV parsed successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
};
