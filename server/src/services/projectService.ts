import { Project } from "../models/Project";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { findByIdInOrganization } from "../utils/scopedQuery";
import { optionalString, requireString } from "../utils/validators";
import {
  canDeleteResource,
  canManageProject
} from "./permissionService";

export const listProjects = async (organizationId: string) => {
  return Project.find({ organizationId }).sort({ createdAt: -1 });
};

export const createProject = async (
  actor: AuthPayload,
  payload: Record<string, unknown>
) => {
  const name = requireString(payload.name, "Name");
  const description = optionalString(payload.description) ?? "";

  return Project.create({
    organizationId: actor.organizationId,
    name,
    description,
    createdBy: actor.userId
  });
};

export const getProjectById = async (organizationId: string, id: string) => {
  return findByIdInOrganization(Project, id, organizationId, "Project");
};

export const updateProject = async (
  actor: AuthPayload,
  id: string,
  payload: Record<string, unknown>
) => {
  const project = await getProjectById(actor.organizationId, id);

  if (!canManageProject(actor, String(project.createdBy))) {
    throw new AppError("You do not have permission to update this project", 403);
  }

  if (payload.name !== undefined) {
    project.name = requireString(payload.name, "Name");
  }

  if (payload.description !== undefined) {
    project.description = optionalString(payload.description) ?? "";
  }

  await project.save();
  return project;
};

export const deleteProject = async (actor: AuthPayload, id: string) => {
  const project = await getProjectById(actor.organizationId, id);

  if (!canDeleteResource(actor)) {
    throw new AppError("You do not have permission to delete this project", 403);
  }

  await project.deleteOne();
  return { deleted: true };
};
