import { useCallback, useEffect, useState } from "react";
import {
  FiUser,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiImage,
  FiExternalLink,
} from "react-icons/fi";

import {
  getAdminAbout,
  createAbout,
  updateAbout,
} from "../../features/about/aboutService";

const initialForm = {
  heading: "About Me",
  subtitle: "",
  description: "",
  profileImage: "",
  location: "",
  experience: "",
  resumeUrl: "",
  isVisible: true,
};

const About = () => {
  const [form, setForm] = useState(initialForm);
  const [aboutId, setAboutId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasAbout, setHasAbout] = useState(false);

  const fetchAbout = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getAdminAbout();
      const about = response.about || response.data?.about;

      if (about) {
        setAboutId(about._id);
        setHasAbout(true);

        setForm({
          heading: about.heading || "About Me",
          subtitle: about.subtitle || "",
          description: about.description || "",
          profileImage: about.profileImage || "",
          location: about.location || "",
          experience: about.experience || "",
          resumeUrl: about.resumeUrl || "",
          isVisible: about.isVisible ?? true,
        });
      } else {
        setAboutId(null);
        setHasAbout(false);
        setForm(initialForm);
      }
    } catch (err) {
      setError(err.message || "Failed to load About information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.description.trim()) {
      setError("About description is required.");
      return;
    }

    if (!form.heading.trim()) {
      setError("Heading is required.");
      return;
    }

    setSaving(true);

    try {
      const aboutData = {
        ...form,
        heading: form.heading.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        profileImage: form.profileImage.trim(),
        location: form.location.trim(),
        experience: form.experience.trim(),
        resumeUrl: form.resumeUrl.trim(),
      };

      let response;

      if (hasAbout && aboutId) {
        response = await updateAbout(aboutId, aboutData);
      } else {
        response = await createAbout(aboutData);
      }

      const savedAbout = response.about || response.data?.about;

      if (savedAbout?._id) {
        setAboutId(savedAbout._id);
        setHasAbout(true);
      }

      setSuccess(response.message || "About information saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save About information.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--color-text)]";

  const sectionClass =
    "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6";

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Portfolio Management
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            About Management
          </h1>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Manage your personal introduction and professional information.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAbout}
          disabled={loading || saving}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-success)]">
          {success}
        </div>
      )}

      {/* Record Status */}
      <div
        className={`${sectionClass} flex flex-col justify-between gap-3 sm:flex-row sm:items-center`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
            <FiUser size={22} />
          </div>

          <div>
            <h2 className="font-bold text-[var(--color-text)]">
              About Section
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {hasAbout
                ? "Your About information is saved."
                : "No About information has been created yet."}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
            hasAbout
              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
          }`}
        >
          {hasAbout ? "Record Created" : "Not Created"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className={sectionClass}>
          <div className="mb-6 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
            <FiUser className="text-[var(--color-primary)]" size={21} />
            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Basic Information
              </h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Your About section heading and introduction.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Section Heading *</label>
              <input
                name="heading"
                value={form.heading}
                onChange={handleChange}
                maxLength={100}
                placeholder="About Me"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                maxLength={200}
                placeholder="A little introduction about me"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={7}
              placeholder="Write your professional introduction..."
              className={`${inputClass} resize-y`}
              required
            />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Write about yourself, your expertise, interests and career goals.
            </p>
          </div>
        </section>

        {/* Profile Information */}
        <section className={sectionClass}>
          <div className="mb-6 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
            <FiImage className="text-[var(--color-primary)]" size={21} />
            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Profile Information
              </h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Your profile image and professional details.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Profile Image URL</label>
            <input
              type="url"
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
              className={inputClass}
            />

            {form.profileImage && (
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-[var(--color-border)] p-3">
                <img
                  src={form.profileImage}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Image Preview
                  </p>
                  <p className="mt-1 break-all text-xs text-[var(--color-muted)]">
                    {form.profileImage}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <FiMapPin /> Location
                </span>
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Dhaka, Bangladesh"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <FiBriefcase /> Experience
                </span>
              </label>
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 2+ Years"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Resume */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
            <FiFileText className="text-[var(--color-primary)]" size={21} />
            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Resume / CV
              </h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Add a link to your downloadable resume.
              </p>
            </div>
          </div>

          <label className={labelClass}>Resume URL</label>
          <input
            type="url"
            name="resumeUrl"
            value={form.resumeUrl}
            onChange={handleChange}
            placeholder="https://example.com/resume.pdf"
            className={inputClass}
          />

          {form.resumeUrl && (
            <a
              href={form.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Preview Resume <FiExternalLink />
            </a>
          )}
        </section>

        {/* Visibility */}
        <section className={sectionClass}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                {form.isVisible ? <FiEye size={21} /> : <FiEyeOff size={21} />}
              </div>

              <div>
                <h2 className="font-bold text-[var(--color-text)]">
                  Public Visibility
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Control whether visitors can see your About section.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {form.isVisible ? "Visible" : "Hidden"}
              </span>

              <input
                type="checkbox"
                name="isVisible"
                checked={form.isVisible}
                onChange={handleChange}
                className="h-5 w-5 accent-[var(--color-primary)]"
              />
            </label>
          </div>
        </section>

        {/* Save */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={fetchAbout}
            disabled={saving}
            className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave />
            {saving
              ? "Saving..."
              : hasAbout
                ? "Update About Information"
                : "Create About Information"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default About;
