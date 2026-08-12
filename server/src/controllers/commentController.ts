import type { Request, Response } from "express";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskCommentById,
  listTaskComments,
  updateTaskComment,
} from "../services/commentService";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Lists all comments for a task.
 *
 * @example
 * GET /api/tasks/:id/comments
 */
export const listTaskCommentsController = async (
  req: Request,
  res: Response,
) => {
  const { id: taskId } = req.params;
  const comments = await listTaskComments(req.auth!.organizationId, taskId);
  return sendSuccess(res, comments);
};

/**
 * Gets a single comment by ID for a specific task.
 *
 * @example
 * GET /api/tasks/:id/comments/:commentId
 */
export const getTaskCommentController = async (req: Request, res: Response) => {
  const { id: taskId, commentId } = req.params;
  const comment = await getTaskCommentById(
    req.auth!.organizationId,
    taskId,
    commentId,
  );
  return sendSuccess(res, comment);
};

/**
 * Creates a comment for a task.
 *
 * @example
 * POST /api/tasks/:id/comments
 */
export const createTaskCommentController = async (
  req: Request<Record<string, string>, unknown, Record<string, unknown>>,
  res: Response,
) => {
  const { id: taskId } = req.params;
  const comment = await createTaskComment(req.auth!, taskId, req.body);
  return sendSuccess(res, comment, 201);
};

/**
 * Updates an existing task comment.
 *
 * @example
 * PATCH /api/tasks/:id/comments/:commentId
 */
export const updateTaskCommentController = async (
  req: Request<Record<string, string>, unknown, Record<string, unknown>>,
  res: Response,
) => {
  const { id: taskId, commentId } = req.params;
  const comment = await updateTaskComment(
    req.auth!,
    taskId,
    commentId,
    req.body,
  );
  return sendSuccess(res, comment);
};

/**
 * Deletes a task comment.
 *
 * @example
 * DELETE /api/tasks/:id/comments/:commentId
 */
export const deleteTaskCommentController = async (
  req: Request,
  res: Response,
) => {
  const { id: taskId, commentId } = req.params;
  const result = await deleteTaskComment(req.auth!, taskId, commentId);
  return sendSuccess(res, result);
};
