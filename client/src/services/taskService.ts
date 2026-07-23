import { api, unwrapResponse } from "./api";
import type { Task } from "../types/models";

export const taskService = {
  list: (projectId?: string) =>
    unwrapResponse<Task[]>(
      api.get("/tasks", {
        params: projectId ? { projectId } : undefined,
      }),
    ),
  getById: (id: string) => unwrapResponse<Task>(api.get(`/tasks/${id}`)),
  create: (
    payload: Pick<
      Task,
      | "projectId"
      | "title"
      | "description"
      | "status"
      | "priority"
      | "assignedTo"
      | "dueDate"
    >,
  ) => unwrapResponse<Task>(api.post("/tasks", payload)),
  update: (
    id: string,
    payload: Partial<
      Pick<
        Task,
        | "projectId"
        | "title"
        | "description"
        | "status"
        | "priority"
        | "assignedTo"
        | "dueDate"
      >
    >,
  ) => unwrapResponse<Task>(api.patch(`/tasks/${id}`, payload)),
  delete: (id: string) =>
    unwrapResponse<{ deleted: boolean }>(api.delete(`/tasks/${id}`)),
};
