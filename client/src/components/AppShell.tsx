import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white text-ink shadow-sm"
      : "text-slate-600 hover:bg-white/80 hover:text-ink"
  ].join(" ");

export const AppShell = () => {
  const { logout, organization, user, isFeatureEnabled } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-6">
        <header className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand">
                {organization?.slug}
              </p>
              <h1 className="text-2xl font-semibold text-ink">WorkspaceHub</h1>
            </div>
            <nav className="flex flex-wrap gap-2">
              <NavLink className={navClassName} to="/">
                Dashboard
              </NavLink>
              <NavLink className={navClassName} to="/projects">
                Projects
              </NavLink>
              <NavLink className={navClassName} to="/tasks">
                Tasks
              </NavLink>
              {isFeatureEnabled("scheduling") ? (
                <NavLink className={navClassName} to="/bookings">
                  Bookings
                </NavLink>
              ) : null}
              <NavLink className={navClassName} to="/settings/organization">
                Organization
              </NavLink>
              <NavLink className={navClassName} to="/settings/features">
                Feature Flags
              </NavLink>
            </nav>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-ink">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm capitalize text-slate-500">{user?.role}</p>
              </div>
              <button
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                onClick={logout}
                type="button"
              >
                Log out
              </button>
            </div>
          </div>
        </header>
        <main className="mt-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
