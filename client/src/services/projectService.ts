import { api, unwrapResponse } from "./api";
import type { Project } from "../types/models";

export const projectService = {
  list: () => unwrapResponse<Project[]>(api.get("/projects")),
  getById: (id: string) => unwrapResponse<Project>(api.get(`/projects/${id}`)),
  create: (payload: Pick<Project, "name" | "description">) =>
    unwrapResponse<Project>(api.post("/projects", payload)),
  update: (id: string, payload: Partial<Pick<Project, "name" | "description">>) =>
    unwrapResponse<Project>(api.patch(`/projects/${id}`, payload)),
  delete: (id: string) =>
    unwrapResponse<{ deleted: boolean }>(api.delete(`/projects/${id}`))
};
