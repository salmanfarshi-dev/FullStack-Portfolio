import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../features/auth/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setSuccess(
        response.message ||
          "If an account exists with this email, password reset instructions will be sent.",
      );
    } catch (err) {
      setError(err.message || "Unable to process your request.");
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
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
            <path d="M16 16h5" />
          </svg>
        </div>

        {/* Heading */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Account Recovery
        </p>

        <h1 className="text-3xl font-bold">Forgot Password?</h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          No worries! Enter your registered admin email address and we will send
          you a password reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
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
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--color-primary)] px-5 py-4 text-sm font-bold text-[var(--color-background)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
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

export default ForgotPassword;
