import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { commentService } from "../services/commentService";
import { canManageComment } from "../utils/permissions";
import type { Comment, User } from "../types/models";

interface TaskCommentsProps {
  taskId: string;
  commentCount: number;
  users: User[];
  onCommentCreated?: () => void;
}

const resolveAuthorName = (authorId: string, users: User[]): string => {
  if (!authorId.trim() || users.length === 0) {
    return "Unknown user";
  }

  const matchingUser = users.find((user) => user._id === authorId);

  if (!matchingUser) {
    return "Unknown user";
  }

  return `${matchingUser.firstName} ${matchingUser.lastName}`;
};

export const TaskComments = ({
  taskId,
  commentCount,
  users,
  onCommentCreated,
}: TaskCommentsProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const loadComments = async () => {
    if (hasLoadedComments) {
      return;
    }

    setLoadingComments(true);
    setCommentsError(null);

    try {
      const nextComments = await commentService.list(taskId);
      setComments(nextComments);
      setHasLoadedComments(true);
    } catch (loadError) {
      setCommentsError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load comments.",
      );
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    if (!hasLoadedComments) {
      await loadComments();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = newCommentText.trim();

    if (!trimmedContent) {
      return;
    }

    setCreateError(null);

    try {
      const createdComment = await commentService.create(taskId, {
        content: trimmedContent,
      });

      setComments((currentComments) => [createdComment, ...currentComments]);
      setNewCommentText("");
      onCommentCreated?.();
    } catch (submitError) {
      setCreateError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to add comment.",
      );
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmedContent = editingContent.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      const updatedComment = await commentService.update(taskId, commentId, {
        content: trimmedContent,
      });

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment._id === commentId ? updatedComment : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (updateError) {
      setCreateError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update comment.",
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.delete(taskId, commentId);
      setComments((currentComments) =>
        currentComments.filter((comment) => comment._id !== commentId),
      );
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (deleteError) {
      setCreateError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete comment.",
      );
    }
  };

  return (
    <>
      {isExpanded ? (
        <button
          className="ml-auto rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          Hide Comments
        </button>
      ) : (
        <button
          className="ml-auto rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
          onClick={() => void handleToggleExpand()}
          type="button"
        >
          {`Show Comments (${commentCount})`}
        </button>
      )}

      {isExpanded ? (
        <section className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          <form
            className="space-y-3"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor={`comment-input-${taskId}`}
            >
              Add comment
            </label>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 placeholder:text-[#94A3B880]"
              id={`comment-input-${taskId}`}
              onChange={(event) => setNewCommentText(event.target.value)}
              placeholder="Write a comment"
              value={newCommentText}
            />
            {createError ? (
              <p className="text-sm text-danger">{createError}</p>
            ) : null}
            <button
              className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
              type="submit"
            >
              Add comment
            </button>
          </form>

          {loadingComments ? (
            <p className="text-sm text-slate-500">Loading comments...</p>
          ) : null}

          {commentsError ? (
            <p className="text-sm text-danger">{commentsError}</p>
          ) : null}

          {!loadingComments && comments.length === 0 && !commentsError ? (
            <p className="text-sm text-slate-500">No comments yet.</p>
          ) : null}

          {!loadingComments && comments.length > 0 ? (
            <ul className="space-y-3">
              {comments.map((comment) => {
                const canManage = canManageComment(user, comment);
                const isEditing = editingCommentId === comment._id;

                return (
                  <li
                    className="rounded-2xl border border-slate-200 p-3"
                    key={comment._id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700">
                        {resolveAuthorName(comment.authorId, users)}
                      </p>
                      {canManage ? (
                        <div className="flex min-w-0 flex-col items-center justify-center gap-2 text-xs">
                          <button
                            className="rounded-[10px] bg-ink px-3 py-1.5 font-medium text-white transition hover:opacity-80"
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditingContent(comment.content);
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="bg-transparent px-0 py-0 font-medium text-red-600 transition hover:opacity-80"
                            onClick={() =>
                              void handleDeleteComment(comment._id)
                            }
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="min-h-20 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300"
                          onChange={(event) =>
                            setEditingContent(event.target.value)
                          }
                          value={editingContent}
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded-[10px] bg-ink px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-80"
                            onClick={() => void handleSaveEdit(comment._id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1.5 text-xs text-slate-500 transition hover:text-slate-700"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingContent("");
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {comment.content}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      ) : null}
    </>
  );
};
