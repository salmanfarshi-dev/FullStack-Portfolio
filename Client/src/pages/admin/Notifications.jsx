import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
  FiExternalLink,
  FiInbox,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Request failed (${response.status})`,
      );
    }

    return data;
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const data = await request(`${API_URL}/notifications`);

      const result = Array.isArray(data)
        ? data
        : data.notifications || data.data || [];

      setNotifications(result);
    } catch (error) {
      console.error("Fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      setActionLoading(id);

      await request(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, isRead: true, readAt: new Date() }
            : item,
        ),
      );
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setActionLoading("all-read");

      await request(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await request(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
      });

      setNotifications((prev) => prev.filter((item) => item._id !== id));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete all notifications
  const deleteAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?",
    );

    if (!confirmed) return;

    try {
      setActionLoading("delete-all");

      await request(`${API_URL}/notifications/delete-all`, {
        method: "DELETE",
      });

      setNotifications([]);
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Get correct internal navigation path
  const getNotificationPath = (item) => {
    if (item.type === "contact") {
      // Prefer contactId stored in notification metadata
      let contactId = item.metadata?.contactId;

      // Fallback for older notifications
      if (!contactId && item.link) {
        const match = item.link.match(/\/admin\/contacts\/([^/?#]+)/);

        contactId = match?.[1];
      }

      if (contactId) {
        return `/admin/messages?contactId=${encodeURIComponent(contactId)}`;
      }
    }

    // Allow only internal application paths
    if (
      typeof item.link === "string" &&
      item.link.startsWith("/") &&
      !item.link.startsWith("//")
    ) {
      // Convert old contact URLs to the Messages modal URL
      const oldContactMatch = item.link.match(/^\/admin\/contacts\/([^/?#]+)/);

      if (oldContactMatch) {
        return `/admin/messages?contactId=${encodeURIComponent(
          oldContactMatch[1],
        )}`;
      }

      return item.link;
    }

    return null;
  };

  // Statistics
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const readCount = notifications.length - unreadCount;

  // Filter
  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "read") return item.isRead;
    return true;
  });

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
            <FiBell size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage all your portfolio notifications.
            </p>
          </div>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total notifications</p>
          <h2 className="mt-2 text-3xl font-bold">{notifications.length}</h2>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-sm text-cyan-300">Unread notifications</p>
          <h2 className="mt-2 text-3xl font-bold text-cyan-400">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Read notifications</p>
          <h2 className="mt-2 text-3xl font-bold">{readCount}</h2>
        </div>
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {["all", "unread", "read"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                filter === item
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50"
            >
              <FiCheckCircle />
              Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <FiTrash2 />
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 py-16 text-center text-slate-400">
            <FiRefreshCw className="mx-auto mb-3 animate-spin text-2xl" />
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-16 text-center">
            <FiInbox className="mx-auto text-4xl text-slate-600" />

            <h3 className="mt-4 text-lg font-semibold">
              No notifications found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const targetPath = getNotificationPath(item);

            return (
              <div
                key={item._id}
                className={`group flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-start sm:p-5 ${
                  item.isRead
                    ? "border-slate-800 bg-slate-900"
                    : "border-cyan-500/20 bg-cyan-500/[0.04]"
                }`}
              >
                <div className="h-fit rounded-xl bg-slate-800 p-3 text-cyan-400">
                  <FiBell size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {item.title || "New notification"}
                    </h3>

                    {!item.isRead && (
                      <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-400">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.message || "No message available"}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(item.createdAt)}
                  </p>

                  {targetPath && (
                    <Link
                      to={targetPath}
                      onClick={() => {
                        if (!item.isRead) {
                          markAsRead(item._id);
                        }
                      }}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      Open details
                      <FiExternalLink />
                    </Link>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item._id)}
                      disabled={actionLoading !== null}
                      title="Mark as read"
                      className="rounded-lg border border-slate-700 p-2.5 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50"
                    >
                      <FiCheck />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item._id)}
                    disabled={actionLoading !== null}
                    title="Delete notification"
                    className="rounded-lg border border-slate-700 p-2.5 text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
