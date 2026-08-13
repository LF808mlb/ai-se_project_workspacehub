import { useState, type FormEvent } from "react";
import type { Comment, User } from "../types/models";

interface TaskCommentsProps {
  taskId: string;
  users: User[];
}

/**
 * Builds local mock comments for UI preview before wiring API calls.
 *
 * @example
 * const comments = buildMockComments("task-123");
 */
const buildMockComments = (taskId: string): Comment[] => {
  if (!taskId.trim()) {
    return [];
  }

  return [
    {
      _id: `mock-comment-1-${taskId}`,
      organizationId: "mock-organization-id",
      taskId,
      authorId: "mock-user-a",
      content: "Captured the first QA notes for this task.",
      createdAt: "2026-08-12T09:45:00.000Z",
      updatedAt: "2026-08-12T09:45:00.000Z",
    },
    {
      _id: `mock-comment-2-${taskId}`,
      organizationId: "mock-organization-id",
      taskId,
      authorId: "mock-user-b",
      content: "Blocked on design copy. Following up with product.",
      createdAt: "2026-08-11T17:05:00.000Z",
      updatedAt: "2026-08-11T17:05:00.000Z",
    },
  ];
};

/**
 * Resolves a display name for a comment author.
 *
 * @example
 * const displayName = resolveAuthorName(comment.authorId, users);
 */
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

/**
 * Creates a local comment object for instant UI updates.
 *
 * @example
 * const draft = buildLocalComment({ taskId: "task-123", content: "Looks good", users });
 */
const buildLocalComment = ({
  taskId,
  content,
  users,
}: {
  taskId: string;
  content: string;
  users: User[];
}): Comment | null => {
  const trimmedContent = content.trim();

  if (!taskId.trim() || !trimmedContent) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const fallbackAuthorId = users[0]?._id ?? "deleted-user";

  return {
    _id: `local-comment-${nowIso}`,
    organizationId: users[0]?.organizationId ?? "mock-organization-id",
    taskId,
    authorId: fallbackAuthorId,
    content: trimmedContent,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
};

export const TaskComments = ({ taskId, users }: TaskCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(() =>
    buildMockComments(taskId),
  );
  const [newCommentText, setNewCommentText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const localComment = buildLocalComment({
      taskId,
      content: newCommentText,
      users,
    });

    if (!localComment) {
      return;
    }

    setComments((currentComments) => [localComment, ...currentComments]);
    setNewCommentText("");
  };

  return (
    <>
      {isExpanded ? (
        <button
          className="ml-auto rounded-[10px] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:opacity-70"
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          Hide Comments
        </button>
      ) : (
        <button
          className="ml-auto rounded-[10px] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:opacity-70"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          {`Show Comments (${comments.length})`}
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
            <button
              className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
              type="submit"
            >
              Add comment
            </button>
          </form>

          <ul className="space-y-3">
            {comments.map((comment) => (
              <li
                className="rounded-2xl border border-slate-200 p-3"
                key={comment._id}
              >
                <p className="text-sm font-medium text-slate-700">
                  {resolveAuthorName(comment.authorId, users)}
                </p>
                <p className="mt-1 text-sm text-slate-600">{comment.content}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
};
