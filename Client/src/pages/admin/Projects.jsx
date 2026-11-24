import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiFolder,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiGithub,
  FiStar,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../features/projects/projectService";

import ProjectFormModal from "../../components/dashboard/ProjectFormModal";

const categories = ["all", "frontend", "fullstack", "backend", "other"];

const Projects = () => {
  // Projects Data
  const [projects, setProjects] = useState([]);

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Actions
  const [actionId, setActionId] = useState(null);

  // Project Form Modal
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  const limit = 10;

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProjects(page, limit);

      setProjects(response.projects || []);
      setTotal(response.total || 0);
      setPages(response.pages || 1);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Open Create Form
  const openCreateForm = () => {
    setEditingProject(null);
    setError("");
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (project) => {
    setEditingProject(project);
    setError("");
    setShowForm(true);
  };

  // Close Form
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingProject(null);
  };

  // Create / Update Project
  const handleSaveProject = async (projectData) => {
    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject._id, projectData);
      } else {
        await createProject(projectData);
      }

      setShowForm(false);
      setEditingProject(null);

      // Go to first page after creating a project
      if (!editingProject && page !== 1) {
        setPage(1);
      } else {
        await fetchProjects();
      }
    } catch (err) {
      setError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  // Search & Category Filter
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = [
        project.title,
        project.shortDescription,
        ...(project.technologies || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || project.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [projects, search, category]);

  // Publish / Featured Status
  const handleStatusChange = async (project, field) => {
    try {
      setActionId(project._id);
      setError("");

      await updateProject(project._id, {
        [field]: !project[field],
      });

      await fetchProjects();
    } catch (err) {
      setError(err.message || "Unable to update project.");
    } finally {
      setActionId(null);
    }
  };

  // Delete Project
  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionId(project._id);
      setError("");

      await deleteProject(project._id);

      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchProjects();
      }
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    } finally {
      setActionId(null);
    }
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <FiFolder size={15} />
            <span>Portfolio Management</span>
            <span>/</span>
            <span className="text-[var(--color-primary)]">Projects</span>
          </div>

          <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
            Projects Management
          </h1>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Manage, organize and showcase your development projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus size={18} />
          Add New Project
        </button>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">Total Projects</p>

          <h2 className="mt-2 font-heading text-3xl font-bold">{total}</h2>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">Published on Page</p>

          <h2 className="mt-2 font-heading text-3xl font-bold">
            {projects.filter((project) => project.isPublished).length}
          </h2>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm text-[var(--color-muted)]">Featured on Page</p>

          <h2 className="mt-2 font-heading text-3xl font-bold">
            {projects.filter((project) => project.isFeatured).length}
          </h2>
        </div>
      </section>

      {/* Projects Table */}
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold">All Projects</h2>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Browse and manage your projects
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                size={17}
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all"
                    ? "All Categories"
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              title="Refresh projects"
              className="flex items-center justify-center rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
            >
              <FiRefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>

              <button
                type="button"
                onClick={fetchProjects}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading / Empty / Projects */}
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiFolder size={25} />
            </div>

            <h3 className="mt-4 font-semibold">
              {projects.length === 0
                ? "No projects found"
                : "No matching projects"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
              {projects.length === 0
                ? "Your projects will appear here after you add them."
                : "Try changing your search or category filter."}
            </p>

            {projects.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <FiPlus size={16} />
                Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs text-[var(--color-muted)]">
                    <th className="px-5 py-4 font-semibold">PROJECT</th>

                    <th className="px-4 py-4 font-semibold">CATEGORY</th>

                    <th className="px-4 py-4 font-semibold">STATUS</th>

                    <th className="px-4 py-4 font-semibold">FEATURED</th>

                    <th className="px-4 py-4 font-semibold">DATE</th>

                    <th className="px-5 py-4 text-right font-semibold">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project._id}
                      className="border-b border-[var(--color-border)] last:border-0 transition hover:bg-[var(--color-surface-hover)]"
                    >
                      {/* Project Information */}
                      <td className="px-5 py-4">
                        <div className="flex min-w-[220px] items-center gap-3">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="h-12 w-16 rounded-lg border border-[var(--color-border)] object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-muted)]">
                              <FiFolder size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {project.title}
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--color-muted)]">
                              {project.shortDescription}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-[var(--color-primary)]/10 px-2.5 py-1.5 text-xs font-medium capitalize text-[var(--color-primary)]">
                          {project.category}
                        </span>
                      </td>

                      {/* Publish Status */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={actionId === project._id}
                          onClick={() =>
                            handleStatusChange(project, "isPublished")
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                            project.isPublished
                              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                          }`}
                        >
                          {project.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={actionId === project._id}
                          onClick={() =>
                            handleStatusChange(project, "isFeatured")
                          }
                          aria-label="Toggle featured"
                          className={`rounded-lg p-2 transition disabled:opacity-50 ${
                            project.isFeatured
                              ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                              : "text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          <FiStar
                            size={17}
                            fill={project.isFeatured ? "currentColor" : "none"}
                          />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[var(--color-muted)]">
                        {formatDate(project.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Live website"
                              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
                            >
                              <FiExternalLink size={16} />
                            </a>
                          )}

                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="GitHub repository"
                              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
                            >
                              <FiGithub size={16} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditForm(project)}
                            title="Edit project"
                            className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={actionId === project._id}
                            onClick={() => handleDelete(project)}
                            title="Delete project"
                            className="rounded-lg p-2 text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10 disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Project Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex gap-3">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-16 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-muted)]">
                        <FiFolder size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-xs capitalize text-[var(--color-muted)]">
                        {project.category}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">
                    {project.shortDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                    {/* Publish */}
                    <button
                      type="button"
                      disabled={actionId === project._id}
                      onClick={() => handleStatusChange(project, "isPublished")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                        project.isPublished
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                      }`}
                    >
                      {project.isPublished ? (
                        <span className="inline-flex items-center gap-1">
                          <FiEye size={14} />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <FiEyeOff size={14} />
                          Draft
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Featured */}
                      <button
                        type="button"
                        disabled={actionId === project._id}
                        onClick={() =>
                          handleStatusChange(project, "isFeatured")
                        }
                        className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-warning)] disabled:opacity-50"
                        aria-label="Toggle featured"
                      >
                        <FiStar
                          size={16}
                          fill={project.isFeatured ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditForm(project)}
                        title="Edit project"
                        aria-label="Edit project"
                        className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={actionId === project._id}
                        onClick={() => handleDelete(project)}
                        className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-danger)] disabled:opacity-50"
                        aria-label="Delete project"
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

        {/* Pagination */}
        {!loading && projects.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--color-muted)]">
              Page {page} of {pages} · {total} total projects
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Project Form Modal */}
      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onClose={closeForm}
          onSubmit={handleSaveProject}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Projects;
