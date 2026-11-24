import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  FiGrid,
  FiFolder,
  FiCode,
  FiUser,
  FiImage,
  FiBriefcase,
  FiMail,
  FiUsers,
  FiFileText,
  FiSearch,
  FiSettings,
  FiBarChart2,
  FiBell,
  FiActivity,
  FiDatabase,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiExternalLink,
} from "react-icons/fi";

const navigationGroups = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
      { label: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
    ],
  },
  {
    title: "PORTFOLIO MANAGEMENT",
    items: [
      { label: "Projects", path: "/admin/projects", icon: FiFolder },
      { label: "Skills", path: "/admin/skills", icon: FiCode },
      { label: "About", path: "/admin/about", icon: FiUser },
      { label: "Hero Section", path: "/admin/hero", icon: FiImage },
      { label: "Journey", path: "/admin/journey", icon: FiBriefcase },
      { label: "Social Links", path: "/admin/socials", icon: FiUsers },
      { label: "Resume", path: "/admin/resume", icon: FiFileText },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { label: "Messages", path: "/admin/messages", icon: FiMail },
      { label: "Newsletter", path: "/admin/newsletter", icon: FiUsers },
      { label: "Notifications", path: "/admin/notifications", icon: FiBell },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "SEO Settings", path: "/admin/seo", icon: FiSearch },
      { label: "Website Settings", path: "/admin/settings", icon: FiSettings },
      {
        label: "Activity Logs",
        path: "/admin/activity-logs",
        icon: FiActivity,
      },
      { label: "Backups", path: "/admin/backups", icon: FiDatabase },
    ],
  },
];

const AdminLayout = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("admin-theme") || "light",
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const currentPage =
    navigationGroups
      .flatMap((group) => group.items)
      .find((item) => item.path === location.pathname)?.label || "Admin Panel";

  return (
    <div className="admin-theme" data-theme={theme}>
      <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
            border-r border-[var(--color-border)]
            bg-[var(--color-surface)]
            transition-transform duration-300
            lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Brand */}
          <div className="flex h-[76px] items-center justify-between border-b border-[var(--color-border)] px-6">
            <NavLink to="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-lg font-bold text-white">
                SF
              </div>

              <div>
                <h1 className="font-heading text-base font-bold tracking-wide">
                  SALMAN FARSHI
                </h1>
                <p className="text-[10px] font-semibold tracking-[2px] text-[var(--color-muted)]">
                  ADMIN PANEL
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] lg:hidden"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.8px] text-[var(--color-muted)]">
                  {group.title}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) => `
                          group flex items-center gap-3 rounded-xl px-3 py-3
                          text-sm font-medium transition-all
                          ${
                            isActive
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                          }
                        `}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-[var(--color-border)] p-4">
            <NavLink
              to="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
              <FiExternalLink size={18} />
              View Portfolio
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10 disabled:opacity-50"
            >
              <FiLogOut size={18} />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[270px]">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
                aria-label="Open menu"
              >
                <FiMenu size={22} />
              </button>

              <div>
                <h2 className="font-heading text-lg font-bold">
                  {currentPage}
                </h2>
                <p className="hidden text-xs text-[var(--color-muted)] sm:block">
                  Manage your portfolio from one place
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
              >
                {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={() => navigate("/admin/notifications")}
                aria-label="Notifications"
                className="relative rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)]"
              >
                <FiBell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
              </button>

              {/* Admin Profile */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[var(--color-surface-hover)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/15 font-bold text-[var(--color-primary)]">
                    {admin?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[130px] truncate text-sm font-semibold">
                      {admin?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Administrator
                    </p>
                  </div>

                  <FiChevronDown
                    size={15}
                    className="hidden text-[var(--color-muted)] sm:block"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">
                    <div className="border-b border-[var(--color-border)] px-3 py-3">
                      <p className="truncate text-sm font-semibold">
                        {admin?.name || "Administrator"}
                      </p>
                      <p className="truncate text-xs text-[var(--color-muted)]">
                        {admin?.email || ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin/profile");
                      }}
                      className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
