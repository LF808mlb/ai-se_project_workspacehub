import type { AuthPayload, UserRole } from "../types/domain";

export const isPrivilegedRole = (role: UserRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canManageProject = (
  actor: AuthPayload,
  createdBy: string | null | undefined,
): boolean => {
  return isPrivilegedRole(actor.role) || actor.userId === String(createdBy);
};

/**
 * Returns whether the actor can modify a comment.
 *
 * @example
 * canManageComment(actor, "64f7f9d8c1b2a3d4e5f67890"); // true/false
 */
export const canManageComment = (
  actor: AuthPayload,
  authorId: string | null | undefined,
): boolean => {
  return isPrivilegedRole(actor.role) || actor.userId === String(authorId);
};

export const canUpdateTask = (
  actor: AuthPayload,
  assignedTo: string | null | undefined,
): boolean => {
  return isPrivilegedRole(actor.role) || actor.userId === String(assignedTo);
};

export const canManageBooking = (
  actor: AuthPayload,
  createdBy: string | null | undefined,
): boolean => {
  return isPrivilegedRole(actor.role) || actor.userId === String(createdBy);
};

export const canDeleteResource = (actor: AuthPayload): boolean => {
  return isPrivilegedRole(actor.role);
};

export const canManageUsers = (
  actor: AuthPayload,
  targetUserId: string,
): boolean => {
  return isPrivilegedRole(actor.role) || actor.userId === targetUserId;
};

export const canChangeUserRole = (
  actor: AuthPayload,
  targetRole: UserRole,
  currentTargetRole: UserRole,
): boolean => {
  if (!isPrivilegedRole(actor.role)) {
    return false;
  }

  if (
    actor.role === "admin" &&
    (targetRole === "owner" || currentTargetRole === "owner")
  ) {
    return false;
  }

  return true;
};
