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
  FiExternalLink,
  FiLink,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

import {
  getAdminSocials,
  createSocial,
  updateSocial,
  deleteSocial,
} from "../../features/socials/socialService";

const initialForm = {
  platform: "",
  username: "",
  url: "",
  icon: "",
  color: "",
  isVisible: true,
  displayOrder: 0,
};

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]";

const labelClass = "mb-2 block text-sm font-medium text-[var(--color-text)]";

const Socials = () => {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchSocials = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSocials();
      setSocials(response.socials || []);
    } catch (err) {
      setError(err.message || "Failed to load social links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const filteredSocials = socials.filter((social) => {
    const query = search.toLowerCase();

    const matchesSearch = [
      social.platform,
      social.username,
      social.url,
      social.icon,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && social.isVisible) ||
      (visibilityFilter === "hidden" && !social.isVisible);

    return matchesSearch && matchesVisibility;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (social) => {
    setEditingId(social._id);
    setForm({
      ...initialForm,
      ...social,
    });
    setError("");
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

    if (!form.platform.trim()) {
      setError("Platform name is required.");
      return;
    }

    if (!form.url.trim()) {
      setError("Social profile URL is required.");
      return;
    }

    if (!form.icon.trim()) {
      setError("Icon identifier is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        platform: form.platform.trim(),
        username: form.username.trim(),
        url: form.url.trim(),
        icon: form.icon.trim(),
        color: form.color.trim(),
      };

      const response = editingId
        ? await updateSocial(editingId, payload)
        : await createSocial(payload);

      setSuccess(response.message || "Social link saved successfully.");

      setModalOpen(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchSocials();
    } catch (err) {
      setError(err.message || "Failed to save social link.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setSuccess("");

      const response = await deleteSocial(id);

      setSocials((prev) => prev.filter((social) => social._id !== id));

      setSuccess(response.message || "Social link deleted successfully.");
      setDeleteId(null);
    } catch (err) {
      setError(err.message || "Failed to delete social link.");
      setDeleteId(null);
    }
  };

  const visibleCount = socials.filter((social) => social.isVisible).length;

  const hiddenCount = socials.length - visibleCount;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Social Links
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your social profiles and portfolio links.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus />
          Add Social Link
        </button>
      </div>

      {/* Notifications */}
      {error && !modalOpen && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          <FiAlertCircle />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-success)]">
          <FiCheckCircle />
          {success}
          <button onClick={() => setSuccess("")} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">
            Total Social Links
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {socials.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">Visible Links</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">
            {visibleCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">Hidden Links</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-muted)]">
            {hiddenCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search platform, username or URL..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className={`${inputClass} sm:w-48`}
        >
          <option value="all">All Links</option>
          <option value="visible">Visible Only</option>
          <option value="hidden">Hidden Only</option>
        </select>

        <button
          onClick={fetchSocials}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Social Links List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            All Social Profiles
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {filteredSocials.length} links found
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <FiRefreshCw className="animate-spin text-2xl text-[var(--color-primary)]" />
          </div>
        ) : filteredSocials.length === 0 ? (
          <div className="py-16 text-center">
            <FiLink className="mx-auto mb-3 text-4xl text-[var(--color-muted)]" />
            <h3 className="font-semibold text-[var(--color-text)]">
              No social links found
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Add a new social profile or change your filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSocials.map((social) => (
              <div
                key={social._id}
                className="rounded-xl border border-[var(--color-border)] p-4 transition hover:bg-[var(--color-surface-hover)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] text-lg font-bold"
                      style={{
                        color: social.color || "var(--color-primary)",
                      }}
                    >
                      {social.platform?.slice(0, 1)?.toUpperCase() || "S"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {social.platform}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        {social.username || "No username"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      social.isVisible
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"
                    }`}
                  >
                    {social.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <FiLink className="shrink-0" />
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate transition hover:text-[var(--color-primary)]"
                    >
                      {social.url}
                    </a>
                    <FiExternalLink className="shrink-0" />
                  </div>

                  <p className="text-xs text-[var(--color-muted)]">
                    Icon: {social.icon}
                  </p>

                  <p className="text-xs text-[var(--color-muted)]">
                    Display Order: {social.displayOrder ?? 0}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="text-xs text-[var(--color-muted)]">
                    {social.color || "Default color"}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(social)}
                      title="Edit social link"
                      className="rounded-lg border border-[var(--color-border)] p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => setDeleteId(social._id)}
                      title="Delete social link"
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
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  {editingId ? "Edit Social Link" : "Add Social Link"}
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Enter your social profile information.
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
                <div className="flex items-center gap-2 rounded-xl bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
                  <FiAlertCircle />
                  {error}
                </div>
              )}

              <div>
                <label className={labelClass}>Platform Name *</label>
                <input
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="GitHub, LinkedIn, Facebook..."
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="@yourusername"
                  maxLength={100}
                />
              </div>

              <div>
                <label className={labelClass}>Profile URL *</label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://github.com/username"
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Must be a valid HTTP or HTTPS URL.
                </p>
              </div>

              <div>
                <label className={labelClass}>React Icon Identifier *</label>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="FaGithub, FaLinkedin, FaFacebook..."
                  required
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Example: FaGithub, FaLinkedin, FaFacebook.
                </p>
              </div>

              <div>
                <label className={labelClass}>Brand Color</label>
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. #AAB3C7 or CSS color"
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Enter a CSS color value. Leave blank to use the model default.
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
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Smaller numbers appear first.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-3">
                  {form.isVisible ? (
                    <FiEye className="text-[var(--color-success)]" size={20} />
                  ) : (
                    <FiEyeOff className="text-[var(--color-muted)]" size={20} />
                  )}

                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      Show on Portfolio
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Control public visibility of this link.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="isVisible"
                  checked={form.isVisible}
                  onChange={handleChange}
                  className="h-5 w-5 accent-[var(--color-primary)]"
                />
              </label>

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
                      ? "Update Link"
                      : "Create Link"}
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
              Delete Social Link?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              This social profile will be permanently deleted. This action
              cannot be undone.
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

export default Socials;
