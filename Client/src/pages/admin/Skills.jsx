import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCode,
  FiEye,
  FiEyeOff,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../../features/skills/skillService";
import SkillFormModal from "../../components/dashboard/SkillFormModal";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools" },
  { value: "other", label: "Other" },
];

const categoryLabel = (category) =>
  categories.find((item) => item.value === category)?.label || category;

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminSkills();
      setSkills(response.skills || response.data?.skills || []);
    } catch (err) {
      setError(err.message || "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = category === "all" || skill.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [skills, search, category]);

  const totalVisible = skills.filter((skill) => skill.isVisible).length;
  const totalHidden = skills.length - totalVisible;

  const openCreateForm = () => {
    setEditingSkill(null);
    setShowForm(true);
  };

  const openEditForm = (skill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingSkill(null);
  };

  const handleSaveSkill = async (skillData) => {
    setSaving(true);
    setError("");

    try {
      if (editingSkill) {
        await updateSkill(editingSkill._id, skillData);
      } else {
        await createSkill(skillData);
      }

      setShowForm(false);
      setEditingSkill(null);
      await fetchSkills();
    } catch (err) {
      setError(err.message || "Failed to save skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (skill) => {
    setActionId(skill._id);
    setError("");

    try {
      await updateSkill(skill._id, {
        isVisible: !skill.isVisible,
      });
      await fetchSkills();
    } catch (err) {
      setError(err.message || "Failed to update visibility.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (skill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"?`,
    );

    if (!confirmed) return;

    setActionId(skill._id);
    setError("");

    try {
      await deleteSkill(skill._id);
      await fetchSkills();
    } catch (err) {
      setError(err.message || "Failed to delete skill.");
    } finally {
      setActionId(null);
    }
  };

  const cardClass =
    "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]";

  const actionButton =
    "rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Portfolio Management
          </p>
          <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            Skills Management
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Manage your technical skills and proficiency levels.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchSkills}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <FiPlus size={18} />
            Add Skill
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-muted)]">Total Skills</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {skills.length}
              </h2>
            </div>
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
              <FiLayers size={23} />
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-muted)]">
                Visible Skills
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-success)]">
                {totalVisible}
              </h2>
            </div>
            <div className="rounded-xl bg-[var(--color-success)]/10 p-3 text-[var(--color-success)]">
              <FiEye size={23} />
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-muted)]">Hidden Skills</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-muted)]">
                {totalHidden}
              </h2>
            </div>
            <div className="rounded-xl bg-[var(--color-surface-hover)] p-3 text-[var(--color-muted)]">
              <FiEyeOff size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} flex flex-col gap-3 p-4 sm:flex-row`}>
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-3 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        >
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Table */}
      <div className={cardClass}>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="font-bold text-[var(--color-text)]">All Skills</h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {filteredSkills.length} skills found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 rounded-2xl bg-[var(--color-surface-hover)] p-4 text-[var(--color-muted)]">
              <FiCode size={30} />
            </div>
            <h3 className="font-bold text-[var(--color-text)]">
              {skills.length === 0
                ? "No Skills Added Yet"
                : "No Matching Skills"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
              {skills.length === 0
                ? "Start building your skills collection by adding your first skill."
                : "Try changing your search or category filter."}
            </p>

            {skills.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white"
              >
                <FiPlus />
                Add Your First Skill
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-muted)]">
                    <th className="px-5 py-4 font-semibold">Skill</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Proficiency</th>
                    <th className="px-5 py-4 font-semibold">Visibility</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSkills.map((skill) => (
                    <tr
                      key={skill._id}
                      className="border-b border-[var(--color-border)] last:border-0 transition hover:bg-[var(--color-surface-hover)]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                              backgroundColor: skill.color
                                ? `${skill.color}20`
                                : "var(--color-surface-hover)",
                              color: skill.color || "var(--color-primary)",
                            }}
                          >
                            {skill.icon || skill.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-text)]">
                              {skill.name}
                            </p>
                            <p className="text-xs text-[var(--color-muted)]">
                              Order: {skill.displayOrder}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-[var(--color-surface-hover)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-text)]">
                          {categoryLabel(skill.category)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-36">
                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-[var(--color-muted)]">
                              Level
                            </span>
                            <span className="font-bold text-[var(--color-text)]">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${skill.level}%`,
                                backgroundColor:
                                  skill.color || "var(--color-primary)",
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={actionId === skill._id}
                          onClick={() => handleToggleVisibility(skill)}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            skill.isVisible
                              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                              : "bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
                          }`}
                        >
                          {skill.isVisible ? <FiEye /> : <FiEyeOff />}
                          {skill.isVisible ? "Visible" : "Hidden"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(skill)}
                            className={actionButton}
                            title="Edit skill"
                          >
                            <FiEdit2 size={17} />
                          </button>
                          <button
                            type="button"
                            disabled={actionId === skill._id}
                            onClick={() => handleDelete(skill)}
                            className={`${actionButton} hover:text-[var(--color-danger)]`}
                            title="Delete skill"
                          >
                            <FiTrash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-3 p-4 md:hidden">
              {filteredSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                        style={{
                          backgroundColor: skill.color
                            ? `${skill.color}20`
                            : "var(--color-surface-hover)",
                          color: skill.color || "var(--color-primary)",
                        }}
                      >
                        {skill.icon || skill.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[var(--color-text)]">
                          {skill.name}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {categoryLabel(skill.category)}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-[var(--color-primary)]">
                      {skill.level}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.color || "var(--color-primary)",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                    <button
                      type="button"
                      disabled={actionId === skill._id}
                      onClick={() => handleToggleVisibility(skill)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] disabled:opacity-50"
                    >
                      {skill.isVisible ? <FiEye /> : <FiEyeOff />}
                      {skill.isVisible ? "Visible" : "Hidden"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(skill)}
                        className={actionButton}
                        title="Edit skill"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={actionId === skill._id}
                        onClick={() => handleDelete(skill)}
                        className={`${actionButton} hover:text-[var(--color-danger)]`}
                        title="Delete skill"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Skill Form Modal */}
      {showForm && (
        <SkillFormModal
          skill={editingSkill}
          onClose={closeForm}
          onSubmit={handleSaveSkill}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Skills;
