import type { Request, Response } from "express";
import { sendError } from "../utils/apiResponse";

export const notFoundHandler = (_req: Request, res: Response) => {
  return sendError(res, "Route not found", 404);
};
