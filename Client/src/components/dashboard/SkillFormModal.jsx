import { useEffect, useState } from "react";
import { FiX, FiSave, FiPlus } from "react-icons/fi";

const initialForm = {
  name: "",
  category: "frontend",
  level: 70,
  icon: "",
  color: "",
  isVisible: true,
  displayOrder: 0,
};

const categories = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools" },
  { value: "other", label: "Other" },
];

const SkillFormModal = ({ skill, onClose, onSubmit, saving }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (skill) {
      setForm({
        name: skill.name || "",
        category: skill.category || "frontend",
        level: skill.level ?? 70,
        icon: skill.icon || "",
        color: skill.color || "",
        isVisible: skill.isVisible ?? true,
        displayOrder: skill.displayOrder ?? 0,
      });
    } else {
      setForm(initialForm);
    }
  }, [skill]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Skill name is required.");
      return;
    }

    if (!Number.isFinite(form.level) || form.level < 0 || form.level > 100) {
      setError("Skill level must be between 0 and 100.");
      return;
    }

    const skillData = {
      ...form,
      name: form.name.trim(),
      icon: form.icon.trim(),
      color: form.color.trim(),
      displayOrder: Number(form.displayOrder),
    };

    await onSubmit(skillData);
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]";

  const labelClass = "mb-2 block text-sm font-medium text-[var(--color-text)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {skill ? "Edit Skill" : "Add New Skill"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Manage your portfolio skills.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {error && (
            <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          {/* Name and Category */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Skill Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. React.js"
                maxLength={50}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Proficiency Level</label>
              <span className="text-sm font-bold text-[var(--color-primary)]">
                {form.level}%
              </span>
            </div>

            <input
              type="range"
              name="level"
              min="0"
              max="100"
              value={form.level}
              onChange={handleChange}
              className="w-full accent-[var(--color-primary)]"
            />

            <div className="mt-1 flex justify-between text-xs text-[var(--color-muted)]">
              <span>Beginner (0%)</span>
              <span>Expert (100%)</span>
            </div>
          </div>

          {/* Icon and Color */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Icon Identifier</label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="e.g. FaReact"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Example: FaReact, SiNodedotjs
              </p>
            </div>

            <div>
              <label className={labelClass}>Skill Color</label>
              <div className="flex gap-2">
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="#61DAFB"
                  className={inputClass}
                />

                <input
                  type="color"
                  value={
                    /^#[0-9A-Fa-f]{6}$/.test(form.color)
                      ? form.color
                      : "#22D3EE"
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="h-12 w-14 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-1"
                  title="Choose skill color"
                />
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className={labelClass}>Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              min="0"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Lower numbers appear first.
            </p>
          </div>

          {/* Visibility */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] p-4">
            <input
              type="checkbox"
              name="isVisible"
              checked={form.isVisible}
              onChange={handleChange}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block text-sm font-semibold text-[var(--color-text)]">
                Visible on Portfolio
              </span>
              <span className="mt-1 block text-xs text-[var(--color-muted)]">
                Show this skill on your public website.
              </span>
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {skill ? <FiSave /> : <FiPlus />}
              {saving ? "Saving..." : skill ? "Update Skill" : "Create Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillFormModal;
