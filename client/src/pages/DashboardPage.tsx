import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { bookingService } from "../services/bookingService";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import type { Booking, Project, Task, User } from "../types/models";
import { formatDateInput, formatDateTime } from "../utils/date";

interface DashboardData {
  projects: Project[];
  tasks: Task[];
  users: User[];
  bookings: Booking[];
}

export const DashboardPage = () => {
  const { organization, isFeatureEnabled } = useAuth();
  const [data, setData] = useState<DashboardData>({
    projects: [],
    tasks: [],
    users: [],
    bookings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [projects, tasks, users, bookings] = await Promise.all([
          projectService.list(),
          taskService.list(),
          userService.list(),
          isFeatureEnabled("scheduling") ? bookingService.list() : Promise.resolve([])
        ]);

        setData({ projects, tasks, users, bookings });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [isFeatureEnabled]);

  const upcomingTasks = [...data.tasks]
    .filter((task) => task.dueDate)
    .sort((left, right) => {
      return new Date(left.dueDate ?? "").getTime() - new Date(right.dueDate ?? "").getTime();
    })
    .slice(0, 5);

  if (loading) {
    return <StatusPanel title="Loading dashboard" message="Fetching workspace data." />;
  }

  if (error) {
    return <StatusPanel title="Dashboard unavailable" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Monitor organization activity, project volume, and access-sensitive product areas."
        title={`Welcome to ${organization?.name ?? "WorkspaceHub"}`}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Members</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{data.users.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Projects</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{data.projects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Tasks</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{data.tasks.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bookings</p>
          <p className="mt-2 text-4xl font-semibold text-ink">
            {isFeatureEnabled("scheduling") ? data.bookings.length : "Off"}
          </p>
        </article>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Upcoming task deadlines</h2>
            <Link className="text-sm font-medium text-brand" to="/tasks">
              Manage tasks
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => (
                <div
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  key={task._id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-ink">{task.title}</h3>
                      <p className="text-sm text-slate-500">
                        Due {formatDateTime(task.dueDate)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <StatusPanel
                title="No upcoming tasks"
                message="Assign due dates to surface urgent work here."
              />
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Feature flags</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(organization?.featureFlags ?? {}).map(([key, value]) => (
                <div
                  className="flex items-center justify-between rounded-2xl bg-panel px-4 py-3"
                  key={key}
                >
                  <span className="text-sm font-medium capitalize text-slate-700">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    ].join(" ")}
                  >
                    {value ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Scheduling</h2>
            {isFeatureEnabled("scheduling") ? (
              <div className="mt-4 space-y-3">
                {data.bookings.length ? (
                  data.bookings.slice(0, 3).map((booking) => (
                    <div
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                      key={booking._id}
                    >
                      <p className="font-medium text-ink">{booking.title}</p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(booking.startsAt)} to {formatDateTime(booking.endsAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No upcoming bookings yet.</p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Scheduling is disabled for this organization.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
