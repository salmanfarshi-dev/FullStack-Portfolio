import { useEffect, useState } from "react";
import { FiX, FiSave, FiPlus } from "react-icons/fi";

const initialForm = {
  title: "",
  shortDescription: "",
  description: "",
  thumbnail: "",
  images: "",
  technologies: "",
  category: "frontend",
  liveUrl: "",
  githubUrl: "",
  isFeatured: false,
  isPublished: false,
  displayOrder: 0,
};

const ProjectFormModal = ({
  project = null,
  onClose,
  onSubmit,
  saving = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(project);

  useEffect(() => {
    if (!project) {
      setForm(initialForm);
      return;
    }

    setForm({
      title: project.title || "",
      shortDescription: project.shortDescription || "",
      description: project.description || "",
      thumbnail: project.thumbnail || "",
      images: (project.images || []).join("\n"),
      technologies: (project.technologies || []).join(", "),
      category: project.category || "other",
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      isFeatured: Boolean(project.isFeatured),
      isPublished: Boolean(project.isPublished),
      displayOrder: project.displayOrder ?? 0,
    });
  }, [project]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Project title is required.";
    } else if (form.title.trim().length > 100) {
      nextErrors.title = "Title cannot exceed 100 characters.";
    }

    if (!form.shortDescription.trim()) {
      nextErrors.shortDescription = "Short description is required.";
    } else if (form.shortDescription.trim().length > 250) {
      nextErrors.shortDescription = "Maximum 250 characters allowed.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Project description is required.";
    }

    const technologies = form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!technologies.length) {
      nextErrors.technologies = "Add at least one technology.";
    }

    const validUrl = (value) => {
      if (!value.trim()) return true;

      try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (!validUrl(form.thumbnail)) {
      nextErrors.thumbnail = "Enter a valid image URL.";
    }

    if (!validUrl(form.liveUrl)) {
      nextErrors.liveUrl = "Enter a valid website URL.";
    }

    if (!validUrl(form.githubUrl)) {
      nextErrors.githubUrl = "Enter a valid GitHub URL.";
    }

    const images = form.images
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (images.some((url) => !validUrl(url) || !url.trim())) {
      nextErrors.images = "Each image must have a valid URL.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const projectData = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      thumbnail: form.thumbnail.trim(),
      images: form.images
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      technologies: form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      category: form.category,
      liveUrl: form.liveUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
      displayOrder: Number(form.displayOrder) || 0,
    };

    await onSubmit(projectData);
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--color-text)]";

  const renderError = (name) =>
    errors[name] ? (
      <p className="mt-1.5 text-xs text-[var(--color-danger)]">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-7">
          <div>
            <h2 className="font-heading text-xl font-bold">
              {isEditing ? "Edit Project" : "Add New Project"}
            </h2>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {isEditing
                ? "Update your project information."
                : "Add a new project to your portfolio."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-xl p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-50"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
            {/* Basic Information */}
            <section>
              <h3 className="mb-4 text-sm font-bold text-[var(--color-primary)]">
                01. Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Title *</label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Yumora - Food Ecommerce Platform"
                    className={inputClass}
                  />

                  {renderError("title")}
                </div>

                <div>
                  <label className={labelClass}>Short Description *</label>

                  <textarea
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    maxLength={250}
                    rows={2}
                    placeholder="Write a short introduction..."
                    className={inputClass}
                  />

                  <div className="mt-1 flex justify-between">
                    {renderError("shortDescription")}
                    <span className="ml-auto text-xs text-[var(--color-muted)]">
                      {form.shortDescription.length}/250
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Full Description *</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the project, features and functionality..."
                    className={inputClass}
                  />

                  {renderError("description")}
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="border-t border-[var(--color-border)] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[var(--color-primary)]">
                02. Project Images
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Thumbnail Image URL</label>

                  <input
                    name="thumbnail"
                    value={form.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className={inputClass}
                  />

                  {renderError("thumbnail")}

                  {form.thumbnail && !errors.thumbnail && (
                    <img
                      src={form.thumbnail}
                      alt="Project thumbnail preview"
                      className="mt-3 h-32 w-full rounded-xl border border-[var(--color-border)] object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      onLoad={(event) => {
                        event.currentTarget.style.display = "block";
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>Additional Image URLs</label>

                  <textarea
                    name="images"
                    value={form.images}
                    onChange={handleChange}
                    rows={3}
                    placeholder={
                      "Paste one image URL per line\nhttps://example.com/image-1.jpg"
                    }
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                    Enter one image URL per line.
                  </p>

                  {renderError("images")}
                </div>
              </div>
            </section>

            {/* Technologies & Category */}
            <section className="border-t border-[var(--color-border)] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[var(--color-primary)]">
                03. Technologies & Category
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Technologies *</label>

                  <input
                    name="technologies"
                    value={form.technologies}
                    onChange={handleChange}
                    placeholder="React, Tailwind CSS, Node.js, MongoDB"
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                    Separate technologies using commas.
                  </p>

                  {renderError("technologies")}
                </div>

                <div>
                  <label className={labelClass}>Project Category</label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="frontend">Frontend</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="backend">Backend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Links */}
            <section className="border-t border-[var(--color-border)] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[var(--color-primary)]">
                04. Project Links
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Live Website URL</label>

                  <input
                    name="liveUrl"
                    value={form.liveUrl}
                    onChange={handleChange}
                    placeholder="https://your-project.vercel.app"
                    className={inputClass}
                  />

                  {renderError("liveUrl")}
                </div>

                <div>
                  <label className={labelClass}>GitHub Repository URL</label>

                  <input
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username/repository"
                    className={inputClass}
                  />

                  {renderError("githubUrl")}
                </div>
              </div>
            </section>

            {/* Publishing */}
            <section className="border-t border-[var(--color-border)] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[var(--color-primary)]">
                05. Publishing Settings
              </h3>

              <div className="space-y-4">
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

                  <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                    Lower numbers appear first.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] p-4">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-sm font-semibold">Featured Project</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Highlight this project in your portfolio.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] p-4">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-sm font-semibold">Publish Project</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Make this project visible on your public portfolio.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] bg-[var(--color-background)] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                "Saving..."
              ) : isEditing ? (
                <>
                  <FiSave size={17} />
                  Update Project
                </>
              ) : (
                <>
                  <FiPlus size={17} />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
