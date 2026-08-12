import { describe, expect, it } from "vitest";
import type { Project, Task } from "../types/models";
import { buildProjectWithTaskCount } from "./projectMetrics";

const buildProject = (id: string, name: string): Project => ({
  _id: id,
  organizationId: "org-1",
  name,
  description: `${name} description`,
  createdBy: "user-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const buildTask = (id: string, projectId: string): Task => ({
  _id: id,
  organizationId: "org-1",
  projectId,
  title: `Task ${id}`,
  description: "Task description",
  status: "todo",
  priority: "medium",
  assignedTo: null,
  dueDate: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("buildProjectWithTaskCount", () => {
  it("returns taskCount 0 when a project has zero matching tasks", () => {
    const project = buildProject("project-1", "Alpha");
    const tasks = [buildTask("task-1", "project-2")];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(0);
  });

  it("ignores tasks that belong to different projects or no known project", () => {
    const projects = [
      buildProject("project-1", "Alpha"),
      buildProject("project-2", "Beta"),
    ];
    const tasks = [
      buildTask("task-1", "project-1"),
      buildTask("task-2", "project-2"),
      buildTask("task-3", "project-2"),
      buildTask("task-4", "project-unknown"),
    ];

    const results = projects.map((project) =>
      buildProjectWithTaskCount(project, tasks),
    );

    expect(results).toEqual([
      expect.objectContaining({ _id: "project-1", taskCount: 1 }),
      expect.objectContaining({ _id: "project-2", taskCount: 2 }),
    ]);
  });

  it("returns an empty array when projects is empty and tasks is non-empty", () => {
    const projects: Project[] = [];
    const tasks = [buildTask("task-1", "project-1")];

    const results = projects.map((project) =>
      buildProjectWithTaskCount(project, tasks),
    );

    expect(results).toEqual([]);
  });

  it("returns all projects with taskCount 0 when tasks is empty", () => {
    const projects = [
      buildProject("project-1", "Alpha"),
      buildProject("project-2", "Beta"),
    ];
    const tasks: Task[] = [];

    const results = projects.map((project) =>
      buildProjectWithTaskCount(project, tasks),
    );

    expect(results).toEqual([
      expect.objectContaining({ _id: "project-1", taskCount: 0 }),
      expect.objectContaining({ _id: "project-2", taskCount: 0 }),
    ]);
  });

  it("returns an empty array when both projects and tasks are empty", () => {
    const projects: Project[] = [];
    const tasks: Task[] = [];

    const results = projects.map((project) =>
      buildProjectWithTaskCount(project, tasks),
    );

    expect(results).toEqual([]);
  });
});
