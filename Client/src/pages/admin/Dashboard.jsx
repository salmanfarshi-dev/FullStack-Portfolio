import {
  FiFolder,
  FiMail,
  FiEye,
  FiUsers,
  FiArrowUpRight,
  FiClock,
  FiActivity,
  FiPlus,
  FiExternalLink,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const stats = [
  {
    title: "Total Projects",
    value: "—",
    description: "Portfolio projects",
    icon: FiFolder,
  },
  {
    title: "Total Messages",
    value: "—",
    description: "Contact submissions",
    icon: FiMail,
  },
  {
    title: "Portfolio Views",
    value: "—",
    description: "Website visitors",
    icon: FiEye,
  },
  {
    title: "Subscribers",
    value: "—",
    description: "Newsletter subscribers",
    icon: FiUsers,
  },
];

const Dashboard = () => {
  const { admin } = useAuth();

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-primary)]">
            {currentDate}
          </p>

          <h1 className="font-heading text-2xl font-bold sm:text-3xl">
            {greeting}, {admin?.name?.split(" ")[0] || "Admin"}!
          </h1>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Here's what's happening with your portfolio today.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          View Portfolio
          <FiExternalLink size={15} />
        </a>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold">
              Portfolio Overview
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Your portfolio performance at a glance
            </p>
          </div>

          <span className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)]">
            Live data pending
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Icon size={21} />
                  </div>

                  <FiArrowUpRight
                    size={18}
                    className="text-[var(--color-muted)]"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-[var(--color-muted)]">
                  {stat.title}
                </p>

                <h3 className="mt-1 font-heading text-3xl font-bold">
                  {stat.value}
                </h3>

                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Dashboard Sections */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Messages */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">
                Recent Messages
              </h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Latest messages from your visitors
              </p>
            </div>

            <FiMail size={20} className="text-[var(--color-primary)]" />
          </div>

          <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiMail size={25} />
            </div>

            <h3 className="mt-4 font-semibold">Messages will appear here</h3>

            <p className="mt-2 max-w-xs text-xs leading-6 text-[var(--color-muted)]">
              Once your contact form is connected, your latest messages will be
              displayed here.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-lg font-bold">Quick Actions</h2>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Manage your portfolio efficiently
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FiPlus size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">Add New Project</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Showcase your latest work
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                <FiUsers size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">Update Skills</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Keep your expertise updated
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)]">
                <FiActivity size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">Activity Overview</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Monitor admin activities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Section */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <FiClock size={19} />
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold">Recent Activity</h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Keep track of your latest admin activities
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-[120px] flex-col items-center justify-center text-center">
          <FiActivity size={25} className="text-[var(--color-muted)]" />

          <p className="mt-3 text-sm font-medium">
            No recent activity to display
          </p>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Your activity history will appear here.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
