import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
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
    <AuthLayout
      eyebrow="Welcome Back"
      title="Admin Login"
      description="Welcome back! Enter your credentials to access your personal dashboard and manage your digital presence."
      panelTitle={
        <>
          Your digital world,
          <br />
          under your control.
        </>
      }
      panelDescription="A dedicated workspace to manage your portfolio, projects, skills, messages, content and everything that represents your digital identity."
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
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <path d="M12 14v3" />
        </svg>
      }
      footer={
        <Link
          to="/"
          className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
        >
          ← Back to Portfolio
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
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
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <label htmlFor="login-password" className="text-sm font-semibold">
              Password
            </label>

            <Link
              to="/admin/forgot-password"
              className="text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-70"
            >
              Forgot Password?
            </Link>
          </div>

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
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="auth-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="auth-alert auth-alert-error">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? (
            <>
              <span className="auth-spinner" />
              Signing in...
            </>
          ) : (
            <>
              Sign In to Dashboard
              <span>→</span>
            </>
          )}
        </button>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <svg
            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
            width="19"
            height="19"
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
            This is a private area. Only authorized administrators can access
            the dashboard.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
