import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "px-4 py-2 text-sm transition active:opacity-70",
    isActive
      ? "pointer-events-none rounded-[28px] border border-slate-200 bg-white font-semibold text-ink"
      : "rounded-[8px] font-medium text-slate-500 hover:text-ink",
  ].join(" ");

export const AppShell = () => {
  const { logout, organization, user, isFeatureEnabled } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-6">
        <header className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-brand">
                {organization?.slug}
              </p>
              <h1 className="text-2xl font-extrabold text-ink">WorkspaceHub</h1>
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
                <p className="text-sm font-semibold text-ink">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs capitalize text-slate-500">
                  {user?.role}
                </p>
              </div>
              <button
                className="rounded-[12px] bg-ink px-[18px] py-2.5 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70"
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
