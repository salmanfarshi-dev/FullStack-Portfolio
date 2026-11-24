import { useCallback, useEffect, useState } from "react";
import {
  FiMail,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiFilter,
  FiDownload,
} from "react-icons/fi";

import {
  getAdminSubscribers,
  updateSubscriber,
  deleteSubscriber,
} from "../../features/newsletter/newsletterService";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StatCard = ({ title, value, icon: Icon, description }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--color-muted)]">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
          {value}
        </h3>
      </div>

      <div className="rounded-xl bg-[var(--color-surface-hover)] p-3 text-[var(--color-primary)]">
        <Icon size={22} />
      </div>
    </div>

    <p className="mt-3 text-xs text-[var(--color-muted)]">{description}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const subscribed = status === "subscribed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        subscribed
          ? "bg-green-500/10 text-[var(--color-success)]"
          : "bg-red-500/10 text-[var(--color-danger)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          subscribed ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"
        }`}
      />
      {subscribed ? "Subscribed" : "Unsubscribed"}
    </span>
  );
};

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        listResponse,
        allResponse,
        subscribedResponse,
        unsubscribedResponse,
      ] = await Promise.all([
        getAdminSubscribers({ page, limit: 10, status, search }),
        getAdminSubscribers({ page: 1, limit: 1 }),
        getAdminSubscribers({
          page: 1,
          limit: 1,
          status: "subscribed",
        }),
        getAdminSubscribers({
          page: 1,
          limit: 1,
          status: "unsubscribed",
        }),
      ]);

      setSubscribers(listResponse.subscribers || []);

      setPagination({
        total: listResponse.total || 0,
        pages: Math.max(1, listResponse.pages || 1),
        limit: listResponse.limit || 10,
      });

      setStats({
        total: allResponse.total || 0,
        subscribed: subscribedResponse.total || 0,
        unsubscribed: unsubscribedResponse.total || 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load newsletter subscribers.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscribers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchSubscribers]);

  const handleStatusChange = async (subscriber) => {
    const newStatus =
      subscriber.status === "subscribed" ? "unsubscribed" : "subscribed";

    setActionLoading(subscriber._id);
    setError("");
    setSuccess("");

    try {
      await updateSubscriber(subscriber._id, { status: newStatus });

      setSuccess(
        newStatus === "subscribed"
          ? "Subscriber activated successfully."
          : "Subscriber unsubscribed successfully.",
      );

      await fetchSubscribers();
    } catch (err) {
      setError(err.message || "Failed to update subscription status.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (subscriber) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${subscriber.email}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionLoading(subscriber._id);
    setError("");
    setSuccess("");

    try {
      await deleteSubscriber(subscriber._id);

      setSuccess("Subscriber deleted successfully.");

      if (subscribers.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchSubscribers();
      }
    } catch (err) {
      setError(err.message || "Failed to delete subscriber.");
    } finally {
      setActionLoading("");
    }
  };

  const exportCSV = () => {
    if (!subscribers.length) {
      setError("There are no subscribers on this page to export.");
      return;
    }

    const headers = [
      "Email",
      "Status",
      "Source",
      "Subscribed At",
      "Unsubscribed At",
      "Created At",
    ];

    const rows = subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.source || "portfolio",
      subscriber.subscribedAt || "",
      subscriber.unsubscribedAt || "",
      subscriber.createdAt || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `newsletter-subscribers-page-${page}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const startItem =
    pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;

  const endItem = Math.min(page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
              <FiMail size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Newsletter
              </h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Manage your portfolio newsletter subscribers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            disabled={!subscribers.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-[var(--color-success)]">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Subscribers"
          value={stats.total}
          icon={FiUsers}
          description="All newsletter records"
        />

        <StatCard
          title="Subscribed"
          value={stats.subscribed}
          icon={FiUserCheck}
          description="Currently receiving newsletter updates"
        />

        <StatCard
          title="Unsubscribed"
          value={stats.unsubscribed}
          icon={FiUserX}
          description="Currently inactive subscribers"
        />
      </div>

      {/* Subscriber Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Subscriber List
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Search, filter and manage email subscribers.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                  size={17}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search email..."
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] sm:w-64"
                />
              </div>

              <div className="relative">
                <FiFilter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                  size={16}
                />

                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-9 pr-9 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] sm:w-44"
                >
                  <option value="">All Subscribers</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[var(--color-surface-hover)]">
              <tr className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                <th className="px-5 py-4 font-semibold">Subscriber</th>
                <th className="px-5 py-4 font-semibold">Source</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Subscribed Date</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-sm text-[var(--color-muted)]"
                  >
                    <FiRefreshCw
                      className="mx-auto mb-3 animate-spin"
                      size={22}
                    />
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <FiMail
                      className="mx-auto mb-3 text-[var(--color-muted)]"
                      size={30}
                    />
                    <p className="font-semibold text-[var(--color-text)]">
                      No subscribers found
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="transition hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          <FiMail size={17} />
                        </div>

                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            {subscriber.email}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            ID: {subscriber._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm capitalize text-[var(--color-muted)]">
                      {subscriber.source || "portfolio"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={subscriber.status} />
                    </td>

                    <td className="px-5 py-4 text-sm text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-2">
                        <FiCalendar />
                        {formatDate(subscriber.subscribedAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-[var(--color-muted)]">
                      {formatDate(subscriber.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusChange(subscriber)}
                          disabled={actionLoading === subscriber._id}
                          title={
                            subscriber.status === "subscribed"
                              ? "Unsubscribe"
                              : "Subscribe"
                          }
                          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
                        >
                          {actionLoading === subscriber._id
                            ? "Please wait..."
                            : subscriber.status === "subscribed"
                              ? "Unsubscribe"
                              : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(subscriber)}
                          disabled={actionLoading === subscriber._id}
                          title="Delete subscriber"
                          className="rounded-lg border border-red-500/20 p-2.5 text-[var(--color-danger)] transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-[var(--color-muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {pagination.total}
            </span>{" "}
            subscribers
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>

            <span className="min-w-24 text-center text-sm text-[var(--color-muted)]">
              Page {page} of {pagination.pages}
            </span>

            <button
              onClick={() =>
                setPage((current) => Math.min(pagination.pages, current + 1))
              }
              disabled={page >= pagination.pages || loading}
              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        CSV export downloads the subscribers currently visible on this page.
      </p>
    </div>
  );
};

export default Newsletter;
