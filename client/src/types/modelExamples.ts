import type { Project, Task } from "./models";
import type { ProjectWithTaskCount } from "./views";

export const exampleProject: Project = {
  _id: "proj_001",
  organizationId: "org_001",
  name: "Workspace Redesign",
  description: "Refresh the internal workspace UI and navigation.",
  createdBy: "user_001",
  createdAt: "2026-07-01T09:00:00.000Z",
  updatedAt: "2026-07-15T14:30:00.000Z",
};

export const exampleTask: Task = {
  _id: "task_001",
  organizationId: "org_001",
  projectId: exampleProject._id,
  title: "Create project dashboard mockups",
  description: "Prepare first-pass dashboard mockups for design review.",
  status: "in_progress",
  priority: "high",
  assignedTo: "user_002",
  dueDate: "2026-08-01T17:00:00.000Z",
  createdAt: "2026-07-16T10:15:00.000Z",
  updatedAt: "2026-07-20T11:45:00.000Z",
};

const allExampleTasks: Task[] = [exampleTask];

export const exampleProjectWithTaskCount: ProjectWithTaskCount = {
  ...exampleProject,
  taskCount: allExampleTasks.filter(
    (task) => task.projectId === exampleProject._id,
  ).length,
};
