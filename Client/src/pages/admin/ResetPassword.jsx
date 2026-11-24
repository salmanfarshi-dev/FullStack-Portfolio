import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../features/auth/authService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(
        response.message || "Your password has been reset successfully.",
      );

      setFormData({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background)] px-4 py-10 text-[var(--color-text)]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--color-secondary)] opacity-[0.10] blur-[120px]" />

      {/* Main Card */}
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-2xl sm:p-10">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          SALMAN FARSHI
          <span className="text-[var(--color-primary)]">.</span>
        </Link>

        {/* Icon */}
        <div className="mb-7 mt-12 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)]">
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>
        </div>

        {/* Heading */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Account Security
        </p>

        <h1 className="text-3xl font-bold">Reset Password</h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          Create a new secure password for your admin account. Choose at least 8
          characters.
        </p>

        {!token && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
          >
            Invalid or missing reset link. Please request a new password reset
            link.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              New Password
            </label>

            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || !token || Boolean(success)}
                className="w-full bg-transparent py-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm New Password
            </label>

            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading || !token || Boolean(success)}
                className="w-full bg-transparent py-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-success)]"
            >
              {success} Redirecting to login...
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !token || Boolean(success)}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--color-primary)] px-5 py-4 text-sm font-bold text-[var(--color-background)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating Password...
              </>
            ) : (
              <>
                Reset Password
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center">
          <Link
            to="/admin/login"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
          >
            ← Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
