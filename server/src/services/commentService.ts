import { Comment } from "../models/Comment";
import { Task } from "../models/Task";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import { requireString, requireStringLength } from "../utils/validators";
import { canManageComment } from "./permissionService";

/**
 * Ensures a task exists in the actor's organization.
 *
 * @example
 * await ensureTaskExists("task-id", "org-id");
 */
const ensureTaskExists = async (taskId: string, organizationId: string) => {
  const task = await Task.findOne({ _id: taskId, organizationId });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

/**
 * Lists comments for a specific task in newest-first order.
 *
 * @example
 * await listTaskComments("org-id", "task-id");
 */
export const listTaskComments = async (
  organizationId: string,
  taskId: string,
) => {
  const validatedTaskId = requireString(taskId, "Task ID");
  await ensureTaskExists(validatedTaskId, organizationId);

  return Comment.find({ organizationId, taskId: validatedTaskId }).sort({
    createdAt: -1,
  });
};

/**
 * Gets one comment by task and comment identifiers.
 *
 * @example
 * await getTaskCommentById("org-id", "task-id", "comment-id");
 */
export const getTaskCommentById = async (
  organizationId: string,
  taskId: string,
  commentId: string,
) => {
  const validatedTaskId = requireString(taskId, "Task ID");
  const validatedCommentId = requireString(commentId, "Comment ID");
  await ensureTaskExists(validatedTaskId, organizationId);

  const comment = await Comment.findOne({
    _id: validatedCommentId,
    organizationId,
    taskId: validatedTaskId,
  });

  return assertFound(comment, "Comment");
};

/**
 * Creates a comment under a task, using the authenticated user as author.
 *
 * @example
 * await createTaskComment(actor, "task-id", { content: "Looks good" });
 */
export const createTaskComment = async (
  actor: AuthPayload,
  taskId: string,
  payload: Record<string, unknown>,
) => {
  const validatedTaskId = requireString(taskId, "Task ID");
  const content = requireStringLength(payload.content, "Content", 1);
  await ensureTaskExists(validatedTaskId, actor.organizationId);

  return Comment.create({
    organizationId: actor.organizationId,
    taskId: validatedTaskId,
    authorId: actor.userId,
    content,
  });
};

/**
 * Updates a task comment if the actor is the author or privileged.
 *
 * @example
 * await updateTaskComment(actor, "task-id", "comment-id", { content: "Updated" });
 */
export const updateTaskComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
  payload: Record<string, unknown>,
) => {
  const comment = await getTaskCommentById(
    actor.organizationId,
    taskId,
    commentId,
  );

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to update this comment",
      403,
    );
  }

  if (payload.content === undefined) {
    return comment;
  }

  comment.content = requireStringLength(payload.content, "Content", 1);
  await comment.save();
  return comment;
};

/**
 * Deletes a task comment if the actor is the author or privileged.
 *
 * @example
 * await deleteTaskComment(actor, "task-id", "comment-id");
 */
export const deleteTaskComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
) => {
  const comment = await getTaskCommentById(
    actor.organizationId,
    taskId,
    commentId,
  );

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to delete this comment",
      403,
    );
  }

  await comment.deleteOne();
  return { deleted: true };
};
