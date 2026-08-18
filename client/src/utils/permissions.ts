import type {
  Booking,
  Comment,
  Project,
  Task,
  User,
  UserRole,
} from "../types/models";

export const isPrivilegedRole = (role?: UserRole | null): boolean => {
  return role === "owner" || role === "admin";
};

export const canEditProject = (
  user: User | null,
  project: Project,
): boolean => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === project.createdBy;
};

export const canEditTask = (user: User | null, task: Task): boolean => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === task.assignedTo;
};

export const canEditBooking = (
  user: User | null,
  booking: Booking,
): boolean => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === booking.createdBy;
};

export const canManageComment = (
  user: User | null,
  comment: Comment,
): boolean => {
  if (!user) {
    return false;
  }

  return isPrivilegedRole(user.role) || user._id === comment.authorId;
};

export const canDeleteResources = (user: User | null): boolean => {
  return isPrivilegedRole(user?.role);
};

export const canCreateProject = (user: User | null): boolean => {
  return isPrivilegedRole(user?.role);
};
