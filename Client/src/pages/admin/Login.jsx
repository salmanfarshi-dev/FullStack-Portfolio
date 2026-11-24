import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const destination = location.state?.from?.pathname;

      navigate(
        destination?.startsWith("/admin") && destination !== "/admin/login"
          ? destination
          : "/admin/dashboard",
        { replace: true },
      );
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background)] px-4 py-10 text-[var(--color-text)] sm:px-6">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--color-secondary)] opacity-[0.10] blur-[120px]" />

      {/* Login Container */}
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl lg:grid-cols-2">
        {/* Left Branding Panel */}
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden border-r border-[var(--color-border)] p-10 lg:flex">
          <div className="pointer-events-none absolute -right-28 top-28 h-72 w-72 rounded-full border border-[var(--color-primary)] opacity-20" />

          <div className="pointer-events-none absolute -right-16 top-40 h-48 w-48 rounded-full border border-[var(--color-secondary)] opacity-20" />

          <div className="relative z-10">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              SALMAN FARSHI
              <span className="text-[var(--color-primary)]">.</span>
            </Link>

            <div className="mt-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-xs font-medium text-[var(--color-primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                PERSONAL CONTROL CENTER
              </span>

              <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-5xl">
                Manage your
                <br />
                digital presence
                <br />
                <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                  with confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
                Your personal workspace to manage projects, skills, messages,
                content and everything that powers your portfolio.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
            <span>© {new Date().getFullYear()} Salman Farshi</span>
            <span>Private Admin Access</span>
          </div>
        </section>

        {/* Right Login Panel */}
        <section className="flex min-h-[650px] flex-col justify-center p-6 sm:p-10 lg:p-12">
          {/* Mobile Branding */}
          <Link
            to="/"
            className="mb-12 text-xl font-bold tracking-tight lg:hidden"
          >
            SALMAN FARSHI
            <span className="text-[var(--color-primary)]">.</span>
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)]">
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

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                Welcome Back
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Login
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                Enter your credentials to access your personal dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-transparent py-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>

                  <Link
                    to="/admin/forgot-password"
                    className="text-xs font-medium text-[var(--color-primary)] transition hover:opacity-75"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-transparent py-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-xs font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--color-primary)] px-5 py-4 text-sm font-bold text-[var(--color-background)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <svg
                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                width="18"
                height="18"
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

              <p className="text-xs leading-5 text-[var(--color-muted)]">
                This is a private area. Only authorized administrators can
                access the dashboard.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
              <Link
                to="/"
                className="transition hover:text-[var(--color-primary)]"
              >
                ← Back to Portfolio
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
