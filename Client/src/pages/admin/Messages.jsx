import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiStar,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiClock,
  FiCheckCircle,
  FiInbox,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiArrowUpRight,
} from "react-icons/fi";

import {
  getAdminContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../../features/contact/contactService";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const statusStyles = {
  new: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  read: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
  replied: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  archived: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 10,
  });

  const [selectedContact, setSelectedContact] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminContacts({
        page,
        limit: 10,
        status,
        search: appliedSearch,
      });

      setContacts(response.contacts || []);

      setPagination({
        total: response.total || 0,
        pages: response.pages || 1,
        limit: response.limit || 10,
      });
    } catch (err) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [page, status, appliedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  // Status filter
  const handleStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  // Open message details
  const openMessage = useCallback(async (id) => {
    if (!id) return;

    try {
      setDetailLoading(true);
      setSelectedContact(null);
      setError("");

      const response = await getContactById(id);

      let contact = response.contact;

      if (!contact) {
        throw new Error("Contact message not found.");
      }

      // Automatically mark new messages as read
      if (contact.status === "new") {
        const updated = await updateContact(id, {
          status: "read",
        });

        contact = updated.contact || {
          ...contact,
          status: "read",
        };

        setContacts((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: "read" } : item,
          ),
        );
      }

      setSelectedContact(contact);
    } catch (err) {
      setError(err.message || "Failed to open message.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Automatically open a message from notification URL
  useEffect(() => {
    const contactId = searchParams.get("contactId");

    if (contactId) {
      openMessage(contactId);
    }
  }, [searchParams, openMessage]);

  // Close details modal
  const closeMessage = () => {
    setSelectedContact(null);
    setSearchParams({}, { replace: true });
  };

  // Update message status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await updateContact(id, {
        status: newStatus,
      });

      const updatedContact = response.contact;

      setContacts((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, ...updatedContact } : item,
        ),
      );

      if (selectedContact?._id === id) {
        setSelectedContact((prev) => ({
          ...prev,
          ...updatedContact,
        }));
      }

      setSuccess(response.message || "Message status updated.");
    } catch (err) {
      setError(err.message || "Failed to update message status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle star
  const handleToggleStar = async (contact) => {
    try {
      setError("");

      const response = await updateContact(contact._id, {
        isStarred: !contact.isStarred,
      });

      const updated = response.contact;

      setContacts((prev) =>
        prev.map((item) =>
          item._id === contact._id ? { ...item, ...updated } : item,
        ),
      );

      if (selectedContact?._id === contact._id) {
        setSelectedContact((prev) => ({
          ...prev,
          ...updated,
        }));
      }
    } catch (err) {
      setError(err.message || "Failed to update starred status.");
    }
  };

  // Delete message
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await deleteContact(deleteTarget._id);

      setContacts((prev) =>
        prev.filter((item) => item._id !== deleteTarget._id),
      );

      if (selectedContact?._id === deleteTarget._id) {
        closeMessage();
      }

      setDeleteTarget(null);

      setSuccess(response.message || "Message deleted successfully.");

      if (contacts.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchContacts();
      }
    } catch (err) {
      setError(err.message || "Failed to delete message.");
    } finally {
      setActionLoading(false);
    }
  };

  // Statistics
  const newCount = contacts.filter((item) => item.status === "new").length;

  const starredCount = contacts.filter((item) => item.isStarred).length;

  const repliedCount = contacts.filter(
    (item) => item.status === "replied",
  ).length;

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Contact Messages
          </h1>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage messages sent through your portfolio contact form.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh Inbox
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          <FiAlertCircle />
          <span>{error}</span>

          <button onClick={() => setError("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-success)]">
          <FiCheckCircle />
          <span>{success}</span>

          <button onClick={() => setSuccess("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">Total Messages</p>
            <FiInbox className="text-xl text-[var(--color-primary)]" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {pagination.total}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              New on This Page
            </p>
            <FiMail className="text-xl text-[var(--color-primary)]" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {newCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              Starred on This Page
            </p>
            <FiStar className="text-xl text-[var(--color-warning)]" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {starredCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              Replied on This Page
            </p>
            <FiCheckCircle className="text-xl text-[var(--color-success)]" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {repliedCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or subject..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className={`${inputClass} lg:w-48`}
          >
            <option value="">All Statuses</option>

            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            <FiSearch />
            Search
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            Clear
          </button>
        </form>
      </div>

      {/* Inbox */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[var(--color-text)]">Inbox</h2>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {pagination.total} matching messages
            </p>
          </div>

          <span className="text-xs text-[var(--color-muted)]">
            Page {page} of {pagination.pages}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <FiRefreshCw className="animate-spin text-2xl text-[var(--color-primary)]" />

            <p className="text-sm text-[var(--color-muted)]">
              Loading messages...
            </p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-hover)]">
              <FiInbox className="text-3xl text-[var(--color-muted)]" />
            </div>

            <h3 className="font-semibold text-[var(--color-text)]">
              Your inbox is empty
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
              No messages match your current filters. New contact form
              submissions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border)]">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`flex flex-col gap-3 p-4 transition hover:bg-[var(--color-surface-hover)] sm:flex-row sm:items-center sm:gap-4 ${
                    contact.status === "new"
                      ? "bg-[var(--color-primary)]/[0.035]"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleStar(contact)}
                    title={contact.isStarred ? "Remove star" : "Add star"}
                    className={`self-start rounded-lg p-2 transition sm:self-auto ${
                      contact.isStarred
                        ? "text-[var(--color-warning)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-warning)]"
                    }`}
                  >
                    <FiStar
                      size={18}
                      fill={contact.isStarred ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    onClick={() => openMessage(contact._id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`truncate text-sm text-[var(--color-text)] ${
                          contact.status === "new" ? "font-bold" : "font-medium"
                        }`}
                      >
                        {contact.name}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
                          statusStyles[contact.status] || statusStyles.read
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                      {contact.email}
                    </p>

                    <p
                      className={`mt-2 truncate text-sm text-[var(--color-text)] ${
                        contact.status === "new" ? "font-semibold" : ""
                      }`}
                    >
                      {contact.subject}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                      {contact.message}
                    </p>
                  </button>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="whitespace-nowrap text-xs text-[var(--color-muted)]">
                      {formatDate(contact.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openMessage(contact._id)}
                        title="View message"
                        className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                      >
                        <FiExternalLink size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(contact)}
                        title="Delete message"
                        className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center">
              <p className="text-xs text-[var(--color-muted)]">
                Showing {(page - 1) * pagination.limit + 1}–
                {Math.min(page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} messages
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || loading}
                  className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <span className="px-2 text-sm text-[var(--color-muted)]">
                  {page} / {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.pages, prev + 1))
                  }
                  disabled={page >= pagination.pages || loading}
                  className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Message Detail Modal */}
      {(selectedContact || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5"
          onClick={() => {
            if (!actionLoading) closeMessage();
          }}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Message Details
                </h2>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  View and manage this contact submission.
                </p>
              </div>

              <button
                onClick={closeMessage}
                className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]"
              >
                <FiX size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <FiRefreshCw className="animate-spin text-2xl text-[var(--color-primary)]" />
              </div>
            ) : selectedContact ? (
              <div className="space-y-6 overflow-y-auto p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <FiUser size={22} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {selectedContact.name}
                      </h3>

                      <a
                        href={`mailto:${selectedContact.email}`}
                        className="mt-1 block text-sm text-[var(--color-primary)] hover:underline"
                      >
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStar(selectedContact)}
                    className={`flex items-center gap-2 self-start rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm ${
                      selectedContact.isStarred
                        ? "text-[var(--color-warning)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    <FiStar
                      fill={selectedContact.isStarred ? "currentColor" : "none"}
                    />

                    {selectedContact.isStarred ? "Starred" : "Star"}
                  </button>
                </div>

                <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">
                      <FiCalendar className="mr-1 inline" />
                      Received
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                      {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--color-muted)]">
                      <FiClock className="mr-1 inline" />
                      Status
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-[var(--color-text)]">
                      {selectedContact.status}
                    </p>
                  </div>

                  {selectedContact.repliedAt && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-[var(--color-muted)]">
                        Replied At
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text)]">
                        {formatDate(selectedContact.repliedAt)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    Subject
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                    {selectedContact.subject}
                  </h3>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    Message
                  </p>

                  <div className="whitespace-pre-wrap break-words rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm leading-7 text-[var(--color-text)]">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                        `Re: ${selectedContact.subject}`,
                      )}`}
                      className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Reply by Email
                      <FiArrowUpRight />
                    </a>
                  </div>

                  <select
                    value={selectedContact.status}
                    disabled={actionLoading}
                    onChange={(e) =>
                      handleUpdateStatus(selectedContact._id, e.target.value)
                    }
                    className={`${inputClass} sm:w-40`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
              <FiTrash2 size={22} />
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text)]">
              Delete Message?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Delete the message from{" "}
              <strong className="text-[var(--color-text)]">
                {deleteTarget.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)]"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-xl bg-[var(--color-danger)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
