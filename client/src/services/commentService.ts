import { api, unwrapResponse } from "./api";
import type { Comment, CommentCreatePayload } from "../types/models";

export const commentService = {
  list: async (taskId: string): Promise<Comment[]> =>
    unwrapResponse<Comment[]>(api.get(`/tasks/${taskId}/comments`)),
  create: async (
    taskId: string,
    payload: CommentCreatePayload,
  ): Promise<Comment> =>
    unwrapResponse<Comment>(api.post(`/tasks/${taskId}/comments`, payload)),
  update: async (
    taskId: string,
    commentId: string,
    payload: CommentCreatePayload,
  ): Promise<Comment> =>
    unwrapResponse<Comment>(
      api.patch(`/tasks/${taskId}/comments/${commentId}`, payload),
    ),
  delete: async (
    taskId: string,
    commentId: string,
  ): Promise<{ deleted: boolean }> =>
    unwrapResponse<{ deleted: boolean }>(
      api.delete(`/tasks/${taskId}/comments/${commentId}`),
    ),
};
