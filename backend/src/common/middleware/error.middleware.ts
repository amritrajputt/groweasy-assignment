import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof ZodError) {


        res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: err.issues.map((issue: any) => ({
                field: issue.path.join("."),
                message: issue.message
            }))

        });
        return;
    }


    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        message,
    });
};
