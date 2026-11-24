import { Link } from "react-router-dom";

const AuthLayout = ({
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
  children,
  footer,
  icon,
}) => {
  return (
    <main className="auth-theme relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="relative z-10 grid w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl lg:min-h-[680px] lg:grid-cols-2">
        {/* Branding Panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--color-border)] bg-[#0D172C] p-10 xl:p-14 lg:flex">
          <div className="auth-ring auth-ring-one" />
          <div className="auth-ring auth-ring-two" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex text-2xl font-bold tracking-tight text-white"
            >
              SALMAN FARSHI<span className="text-[#22D3EE]">.</span>
            </Link>

            <div className="mt-28 max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#263B59] bg-[#14243D] px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-[#22D3EE]">
                <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_12px_#22D3EE]" />
                PRIVATE ADMIN WORKSPACE
              </span>

              <h2 className="mt-8 text-4xl font-bold leading-[1.2] tracking-tight text-white xl:text-[52px]">
                {panelTitle}
              </h2>

              <p className="mt-6 max-w-md text-sm leading-8 text-slate-400">
                {panelDescription}
              </p>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#263B59] bg-[#14243D]/70 p-5">
                <p className="text-2xl font-bold text-[#22D3EE]">01</p>
                <p className="mt-2 text-xs font-medium text-slate-300">
                  Secure Access
                </p>
              </div>

              <div className="rounded-2xl border border-[#263B59] bg-[#14243D]/70 p-5">
                <p className="text-2xl font-bold text-[#A78BFA]">02</p>
                <p className="mt-2 text-xs font-medium text-slate-300">
                  Personal Workspace
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between border-t border-[#263B59] pt-6 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} Salman Farshi</span>
            <span>Private Admin Access</span>
          </div>
        </section>

        {/* Form Panel */}
        <section className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-12 lg:px-10 xl:px-16">
          <Link
            to="/"
            className="mb-12 inline-flex text-xl font-bold tracking-tight text-[var(--color-text)] lg:hidden"
          >
            SALMAN FARSHI<span className="text-[var(--color-primary)]">.</span>
          </Link>

          <div className="mx-auto w-full max-w-[430px]">
            {/* Icon */}
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)] shadow-lg shadow-black/5">
              {icon}
            </div>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              {eyebrow}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-[40px]">
              {title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              {description}
            </p>

            <div className="mt-9">{children}</div>

            {footer && (
              <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
