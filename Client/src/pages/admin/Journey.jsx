import { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";

import {
  getAdminJourneys,
  createJourney,
  updateJourney,
  deleteJourney,
} from "../../features/journey/journeyService";

const initialForm = {
  title: "",
  organization: "",
  description: "",
  type: "education",
  startDate: "",
  endDate: "",
  isCurrent: false,
  location: "",
  icon: "",
  isVisible: true,
  displayOrder: 0,
};

const categories = [
  { value: "education", label: "Education" },
  { value: "experience", label: "Experience" },
  { value: "learning", label: "Learning" },
  { value: "achievement", label: "Achievement" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]";

const labelClass = "mb-2 block text-sm font-medium text-[var(--color-text)]";

const Journey = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminJourneys();
      setJourneys(response.journeys || []);
    } catch (err) {
      setError(err.message || "Failed to load journeys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const filteredJourneys = journeys.filter((item) => {
    const matchesSearch = [
      item.title,
      item.organization,
      item.description,
      item.location,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === "all" || item.type === filterType;

    return matchesSearch && matchesType;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (journey) => {
    setEditingId(journey._id);

    setForm({
      ...initialForm,
      ...journey,
      startDate: journey.startDate
        ? new Date(journey.startDate).toISOString().split("T")[0]
        : "",
      endDate: journey.endDate
        ? new Date(journey.endDate).toISOString().split("T")[0]
        : "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "displayOrder"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.organization.trim()) {
      setError("Title and organization are required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (
      !form.isCurrent &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        organization: form.organization.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        icon: form.icon.trim(),
        endDate: form.isCurrent ? null : form.endDate || null,
      };

      const response = editingId
        ? await updateJourney(editingId, payload)
        : await createJourney(payload);

      setSuccess(response.message || "Journey saved successfully.");

      setModalOpen(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchJourneys();
    } catch (err) {
      setError(err.message || "Failed to save journey.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setSuccess("");

      const response = await deleteJourney(id);

      setJourneys((prev) => prev.filter((item) => item._id !== id));

      setSuccess(response.message || "Journey deleted successfully.");
      setDeleteId(null);
    } catch (err) {
      setError(err.message || "Failed to delete journey.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Present";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getTypeLabel = (type) =>
    categories.find((item) => item.value === type)?.label || type;

  const countByType = (type) =>
    journeys.filter((item) => item.type === type).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Journey Management
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your education, experience and career journey.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus />
          Add Journey
        </button>
      </div>

      {/* Messages */}
      {error && !modalOpen && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-success)]">
          {success}
          <button onClick={() => setSuccess("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <div
            key={category.value}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-xs text-[var(--color-muted)]">
              {category.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {countByType(category.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search journeys..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`${inputClass} sm:w-52`}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <button
          onClick={fetchJourneys}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Journey List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              All Journeys
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {filteredJourneys.length} journey records found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <FiRefreshCw className="animate-spin text-2xl text-[var(--color-primary)]" />
          </div>
        ) : filteredJourneys.length === 0 ? (
          <div className="py-16 text-center">
            <FiCalendar className="mx-auto mb-3 text-4xl text-[var(--color-muted)]" />
            <h3 className="font-semibold text-[var(--color-text)]">
              No journeys found
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Add a journey or change your search filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJourneys.map((journey) => (
              <div
                key={journey._id}
                className="relative rounded-xl border border-[var(--color-border)] p-4 transition hover:bg-[var(--color-surface-hover)] sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <FiCalendar size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text)]">
                          {journey.title}
                        </h3>

                        <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          {getTypeLabel(journey.type)}
                        </span>

                        {journey.isVisible ? (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                            <FiEye /> Visible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                            <FiEyeOff /> Hidden
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
                        {journey.organization}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          {formatDate(journey.startDate)} –{" "}
                          {journey.isCurrent
                            ? "Present"
                            : formatDate(journey.endDate)}
                        </span>

                        {journey.location && (
                          <span className="flex items-center gap-1">
                            <FiMapPin />
                            {journey.location}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
                        {journey.description}
                      </p>

                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        Display Order: {journey.displayOrder ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:self-start">
                    <button
                      onClick={() => openEditModal(journey)}
                      title="Edit journey"
                      className="rounded-lg border border-[var(--color-border)] p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => setDeleteId(journey._id)}
                      title="Delete journey"
                      className="rounded-lg border border-[var(--color-border)] p-2.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  {editingId ? "Edit Journey" : "Add New Journey"}
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Fill in the details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 overflow-y-auto p-5"
            >
              {error && (
                <div className="rounded-xl bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Journey Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Organization *</label>
                  <input
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Company or Institution"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>

                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={form.isCurrent}
                  />
                </div>

                <div>
                  <label className={labelClass}>Icon Identifier</label>
                  <input
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="FiBookOpen"
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    React Icon identifier, e.g. FiBookOpen
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={form.displayOrder}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder="Describe this journey..."
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] p-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      Currently Working / Studying
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Mark this as your current journey.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isCurrent"
                    checked={form.isCurrent}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[var(--color-primary)]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] p-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      Visible on Portfolio
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Show this journey publicly.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={form.isVisible}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[var(--color-primary)]"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  <FiSave />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Journey"
                      : "Create Journey"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
              <FiTrash2 size={22} />
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text)]">
              Delete Journey?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              This journey will be permanently deleted. This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)]"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded-xl bg-[var(--color-danger)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journey;
