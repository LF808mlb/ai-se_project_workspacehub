import type { NextFunction, Request, Response } from "express";
import type { FeatureFlagKey } from "../types/domain";
import { ensureFeatureEnabled } from "../services/featureFlagService";
import { sendError } from "../utils/apiResponse";

export const requireFeatureFlag = (featureKey: FeatureFlagKey) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return sendError(res, "Authentication is required", 401);
    }

    try {
      await ensureFeatureEnabled(req.auth.organizationId, featureKey);
      return next();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Feature is not available";
      return sendError(res, message, 403);
    }
  };
};
