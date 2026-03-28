import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON: " + err.message,
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  const statusCode = (err as any).status || 500;
  
  if (isDev) {
    console.error("Unhandled error:", err.stack ?? err);
  } else {
    console.error("Unhandled error:", err.message);
  }

  return res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : "Internal server error",
  });
};
