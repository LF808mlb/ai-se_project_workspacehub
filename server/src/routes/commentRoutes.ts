import express from "express";
import {
  createTaskCommentController,
  deleteTaskCommentController,
  getTaskCommentController,
  listTaskCommentsController,
  updateTaskCommentController,
} from "../controllers/commentController";
import { asyncHandler } from "../utils/asyncHandler";

const commentRouter = express.Router({ mergeParams: true });

commentRouter.get("/", asyncHandler(listTaskCommentsController));
commentRouter.post("/", asyncHandler(createTaskCommentController));
commentRouter.get("/:commentId", asyncHandler(getTaskCommentController));
commentRouter.patch("/:commentId", asyncHandler(updateTaskCommentController));
commentRouter.delete("/:commentId", asyncHandler(deleteTaskCommentController));

export default commentRouter;
