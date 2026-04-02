import type { Model } from "mongoose";
import { AppError } from "./appError";

export const findByIdInOrganization = async (
  model: Model<any>,
  id: string,
  organizationId: string,
  resourceName: string
) => {
  const document = await model.findOne({ _id: id, organizationId });

  if (!document) {
    throw new AppError(`${resourceName} not found`, 404);
  }

  return document;
};
