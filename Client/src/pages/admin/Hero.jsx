import { useEffect, useState } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiImage,
  FiExternalLink,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";

import {
  getAdminHero,
  createHero,
  updateHero,
} from "../../features/hero/heroService";

const initialForm = {
  greeting: "Hello, I'm",
  name: "",
  role: "",
  headline: "",
  description: "",
  profileImage: "",
  availability: "Available for opportunities",
  isAvailable: true,
  primaryButton: {
    text: "View Projects",
    link: "#projects",
  },
  secondaryButton: {
    text: "Contact Me",
    link: "#contact",
  },
  isVisible: true,
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-[var(--color-text)]">
      {label}{" "}
      {required && <span className="text-[var(--color-danger)]">*</span>}
    </label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
    />
  </div>
);

const Hero = () => {
  const [form, setForm] = useState(initialForm);
  const [heroId, setHeroId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHero = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminHero();
      const hero = response.hero || response.data?.hero || null;

      if (hero) {
        setHeroId(hero._id);

        setForm({
          ...initialForm,
          ...hero,
          primaryButton: {
            ...initialForm.primaryButton,
            ...(hero.primaryButton || {}),
          },
          secondaryButton: {
            ...initialForm.secondaryButton,
            ...(hero.secondaryButton || {}),
          },
        });
      } else {
        setHeroId(null);
        setForm(initialForm);
      }
    } catch (err) {
      setError(err.message || "Failed to load Hero information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleButtonChange = (buttonName, field, value) => {
    setForm((prev) => ({
      ...prev,
      [buttonName]: {
        ...prev[buttonName],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        greeting: form.greeting.trim(),
        name: form.name.trim(),
        role: form.role.trim(),
        headline: form.headline.trim(),
        description: form.description.trim(),
        profileImage: form.profileImage.trim(),
        availability: form.availability.trim(),
        primaryButton: {
          text: form.primaryButton.text.trim(),
          link: form.primaryButton.link.trim(),
        },
        secondaryButton: {
          text: form.secondaryButton.text.trim(),
          link: form.secondaryButton.link.trim(),
        },
      };

      let response;

      if (heroId) {
        response = await updateHero(heroId, payload);
      } else {
        response = await createHero(payload);
      }

      const savedHero =
        response.hero || response.data?.hero || response.data || null;

      if (savedHero?._id) {
        setHeroId(savedHero._id);
      }

      setSuccess(
        heroId
          ? "Hero section updated successfully!"
          : "Hero section created successfully!",
      );

      await fetchHero();
    } catch (err) {
      setError(err.message || "Failed to save Hero information.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (heroId) {
      fetchHero();
    } else {
      setForm(initialForm);
    }

    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FiRefreshCw
          className="animate-spin text-[var(--color-primary)]"
          size={28}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
              <FiUser size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Hero Management
              </h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Manage your portfolio homepage hero section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchHero}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-[var(--color-success)]">
          <FiCheckCircle />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 xl:col-span-2">
          {/* Main Content */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Hero Content
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Set the main text displayed on your homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField
                label="Greeting"
                name="greeting"
                value={form.greeting}
                onChange={handleChange}
                placeholder="Hello, I'm"
              />

              <InputField
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Salman Farshi"
                required
                maxLength={100}
              />

              <InputField
                label="Professional Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="Frontend Developer"
                required
                maxLength={100}
              />

              <InputField
                label="Availability Text"
                name="availability"
                value={form.availability}
                onChange={handleChange}
                placeholder="Available for opportunities"
              />

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--color-text)]">
                  Main Headline{" "}
                  <span className="text-[var(--color-danger)]">*</span>
                </label>

                <textarea
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  rows={3}
                  placeholder="Building modern digital experiences..."
                  className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
                />

                <p className="text-right text-xs text-[var(--color-muted)]">
                  {form.headline.length}/200
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--color-text)]">
                  Description{" "}
                  <span className="text-[var(--color-danger)]">*</span>
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  rows={5}
                  placeholder="Write a short introduction about yourself..."
                  className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
                />

                <p className="text-right text-xs text-[var(--color-muted)]">
                  {form.description.length}/500
                </p>
              </div>
            </div>
          </section>

          {/* Profile Image */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Profile Image
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Add an image URL for your hero section.
              </p>
            </div>

            <InputField
              label="Image URL"
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
            />

            {form.profileImage && (
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
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
          </section>

          {/* Buttons */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Call To Action Buttons
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Configure the two buttons shown in your hero section.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                { key: "primaryButton", title: "Primary Button" },
                { key: "secondaryButton", title: "Secondary Button" },
              ].map((button) => (
                <div
                  key={button.key}
                  className="space-y-4 rounded-xl border border-[var(--color-border)] p-4"
                >
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {button.title}
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-muted)]">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={form[button.key].text}
                      onChange={(e) =>
                        handleButtonChange(button.key, "text", e.target.value)
                      }
                      maxLength={50}
                      placeholder="Button label"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-muted)]">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={form[button.key].link}
                      onChange={(e) =>
                        handleButtonChange(button.key, "link", e.target.value)
                      }
                      maxLength={500}
                      placeholder="#projects or /contact"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Visibility */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Display Settings
            </h2>

            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    Availability Status
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Show that you are available for opportunities.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-5 w-5 accent-[var(--color-primary)]"
                />
              </label>

              <div className="h-px bg-[var(--color-border)]" />

              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    Hero Section Visibility
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Control whether the hero section appears on your portfolio.
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
          </section>

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)]"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  {heroId ? "Update Hero Section" : "Create Hero Section"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview */}
        <aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 xl:sticky xl:top-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Live Preview
              </h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Preview your hero content.
              </p>
            </div>

            <FiEye className="text-[var(--color-primary)]" size={20} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
            <div className="flex flex-col items-center text-center">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt={form.name || "Profile"}
                  className="mb-5 h-28 w-28 rounded-full border-4 border-[var(--color-primary)]/20 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-muted)]">
                  <FiImage size={32} />
                </div>
              )}

              {form.isAvailable && (
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-success)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-success)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  {form.availability || "Available"}
                </span>
              )}

              <p className="text-sm text-[var(--color-muted)]">
                {form.greeting}
              </p>

              <h3 className="mt-1 break-words text-2xl font-bold text-[var(--color-text)]">
                {form.name || "Your Name"}
              </h3>

              <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">
                {form.role || "Your Professional Role"}
              </p>

              <h4 className="mt-5 text-lg font-bold leading-snug text-[var(--color-text)]">
                {form.headline || "Your Main Headline"}
              </h4>

              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {form.description || "Your introduction will appear here."}
              </p>

              <div className="mt-6 flex w-full flex-col gap-2">
                <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white">
                  {form.primaryButton.text || "Primary Button"}
                  <FiExternalLink />
                </span>

                <span className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
                  {form.secondaryButton.text || "Secondary Button"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-muted)]">
            {form.isVisible ? (
              <>
                <FiEye className="text-[var(--color-success)]" />
                Hero section is visible
              </>
            ) : (
              <>
                <FiEyeOff className="text-[var(--color-danger)]" />
                Hero section is hidden
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Hero;
