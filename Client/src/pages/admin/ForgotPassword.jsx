import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../features/auth/authService";
import AuthLayout from "../../components/auth/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(cleanEmail);

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
    <AuthLayout
      eyebrow="Account Recovery"
      title="Forgot Password?"
      description="No worries. Enter your registered email address and we'll help you securely recover access to your admin account."
      panelTitle={
        <>
          A fresh start
          <br />
          is just one step away.
        </>
      }
      panelDescription="Your account security matters. Use our secure password recovery process to regain access to your personal admin workspace."
      icon={
        <svg
          width="30"
          height="30"
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
      }
      footer={
        <Link
          to="/admin/login"
          className="text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          ← Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-2.5 block text-sm font-semibold"
          >
            Email Address
          </label>

          <div className="auth-input-wrap">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>

            <input
              id="forgot-email"
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
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="auth-alert auth-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="auth-alert auth-alert-success">
            <strong className="mb-1 block">✓ Request submitted</strong>
            {success}
          </div>
        )}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? (
            <>
              <span className="auth-spinner" />
              Sending...
            </>
          ) : (
            <>
              Send Reset Link
              <span>→</span>
            </>
          )}
        </button>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 shrink-0 text-[var(--color-primary)]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <p className="text-xs leading-6 text-[var(--color-muted)]">
              For security, reset instructions are provided only through the
              registered email address.
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
