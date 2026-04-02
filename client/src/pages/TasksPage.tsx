import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { useAuth } from "../hooks/useAuth";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import type { Project, Task, User } from "../types/models";
import { formatDateInput } from "../utils/date";
import { canDeleteResources, canEditTask, isPrivilegedRole } from "../utils/permissions";

interface TaskFormState {
  projectId: string;
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  assignedTo: string;
  dueDate: string;
}

const buildTaskFormState = (task: Task): TaskFormState => ({
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignedTo: task.assignedTo ?? "",
  dueDate: formatDateInput(task.dueDate)
});

export const TasksPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskEdits, setTaskEdits] = useState<Record<string, TaskFormState>>({});
  const [createState, setCreateState] = useState<TaskFormState>({
    projectId: "",
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: user?._id ?? "",
    dueDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setCreateError(null);

    try {
      const [nextProjects, nextUsers, nextTasks] = await Promise.all([
        projectService.list(),
        userService.list(),
        taskService.list()
      ]);

      setProjects(nextProjects);
      setUsers(nextUsers);
      setTasks(nextTasks);
      setTaskEdits(
        Object.fromEntries(nextTasks.map((task) => [task._id, buildTaskFormState(task)]))
      );
      setCreateState((current) => ({
        ...current,
        projectId: nextProjects[0]?._id ?? "",
        assignedTo: user?._id ?? ""
      }));
    } catch (loadError) {
      setCreateError(loadError instanceof Error ? loadError.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user?._id]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    try {
      const createdTask = await taskService.create({
        ...createState,
        assignedTo: createState.assignedTo || null,
        dueDate: createState.dueDate || null
      });

      setTasks((current) => [createdTask, ...current]);
      setTaskEdits((current) => ({
        ...current,
        [createdTask._id]: buildTaskFormState(createdTask)
      }));
      setCreateState({
        projectId: projects[0]?._id ?? "",
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: user?._id ?? "",
        dueDate: ""
      });
    } catch (createError) {
      setCreateError(createError instanceof Error ? createError.message : "Unable to create task");
    }
  };

  const handleTaskEdit = (
    taskId: string,
    field: keyof TaskFormState,
    value: string
  ) => {
    setTaskEdits((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        [field]: value
      }
    }));
  };

  const handleSaveTask = async (taskId: string) => {
    const formState = taskEdits[taskId];

    try {
      const updatedTask = await taskService.update(taskId, {
        ...formState,
        assignedTo: formState.assignedTo || null,
        dueDate: formState.dueDate || null
      });

      setTasks((current) =>
        current.map((task) => (task._id === taskId ? updatedTask : task))
      );
      setTaskEdits((current) => ({
        ...current,
        [taskId]: buildTaskFormState(updatedTask)
      }));
      setTaskErrors((current) => ({ ...current, [taskId]: "" }));
    } catch (saveError) {
      setTaskErrors((current) => ({
        ...current,
        [taskId]: saveError instanceof Error ? saveError.message : "Unable to update task"
      }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
    } catch (deleteError) {
      setTaskErrors((current) => ({
        ...current,
        [taskId]: deleteError instanceof Error ? deleteError.message : "Unable to delete task"
      }));
    }
  };

  if (loading) {
    return <StatusPanel title="Loading tasks" message="Fetching projects, users, and tasks." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create tasks inside projects and let org rules govern what each role can change."
        title="Tasks"
      />
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-3xl bg-white p-6 shadow-sm" onSubmit={handleCreate}>
          <h2 className="text-xl font-semibold text-ink">Create task</h2>
          <div className="mt-4 space-y-4">
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  projectId: event.target.value
                }))
              }
              value={createState.projectId}
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              onChange={(event) =>
                setCreateState((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Task title"
              value={createState.title}
            />
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Task description"
              value={createState.description}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    status: event.target.value as Task["status"]
                  }))
                }
                value={createState.status}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    priority: event.target.value as Task["priority"]
                  }))
                }
                value={createState.priority}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                disabled={!isPrivilegedRole(user?.role)}
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    assignedTo: event.target.value
                  }))
                }
                value={createState.assignedTo}
              >
                {isPrivilegedRole(user?.role)
                  ? users.map((assignee) => (
                      <option key={assignee._id} value={assignee._id}>
                        {assignee.firstName} {assignee.lastName}
                      </option>
                    ))
                  : user
                    ? [
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ]
                    : null}
              </select>
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    dueDate: event.target.value
                  }))
                }
                type="date"
                value={createState.dueDate}
              />
            </div>
            {createError ? <p className="text-sm text-danger">{createError}</p> : null}
            <button className="rounded-2xl bg-ink px-4 py-3 font-medium text-white" type="submit">
              Create task
            </button>
          </div>
        </form>
        <div className="space-y-4">
          {tasks.length ? (
            tasks.map((task) => {
              const canEdit = canEditTask(user, task);
              const formState = taskEdits[task._id];

              return (
                <article className="rounded-3xl bg-white p-6 shadow-sm" key={task._id}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                      disabled={!canEdit}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "title", event.target.value)
                      }
                      value={formState?.title ?? task.title}
                    />
                    <textarea
                      className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                      disabled={!canEdit}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "description", event.target.value)
                      }
                      value={formState?.description ?? task.description}
                    />
                    <select
                      className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                      disabled={!canEdit}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "status", event.target.value)
                      }
                      value={formState?.status ?? task.status}
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                    <select
                      className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                      disabled={!canEdit}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "priority", event.target.value)
                      }
                      value={formState?.priority ?? task.priority}
                    >
                      <option value="low">Low priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="high">High priority</option>
                    </select>
                    <select
                      className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                      disabled={!isPrivilegedRole(user?.role)}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "assignedTo", event.target.value)
                      }
                      value={formState?.assignedTo ?? task.assignedTo ?? ""}
                    >
                      <option value="">Unassigned</option>
                      {users.map((assignee) => (
                        <option key={assignee._id} value={assignee._id}>
                          {assignee.firstName} {assignee.lastName}
                        </option>
                      ))}
                    </select>
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
                      disabled={!canEdit}
                      onChange={(event) =>
                        handleTaskEdit(task._id, "dueDate", event.target.value)
                      }
                      type="date"
                      value={formState?.dueDate ?? formatDateInput(task.dueDate)}
                    />
                  </div>
                  {taskErrors[task._id] ? (
                    <p className="mt-4 text-sm text-danger">{taskErrors[task._id]}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
                      disabled={!canEdit}
                      onClick={() => void handleSaveTask(task._id)}
                      type="button"
                    >
                      Save
                    </button>
                    {canDeleteResources(user) ? (
                      <button
                        className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-danger"
                        onClick={() => void handleDeleteTask(task._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <StatusPanel title="No tasks" message="Create the first task for this organization." />
          )}
        </div>
      </section>
    </div>
  );
};
