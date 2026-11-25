import { FiArrowLeft, FiClock, FiLayers } from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminPlaceholder = ({
  title = "Coming Soon",
  description = "This admin section is being prepared.",
}) => {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <FiLayers size={28} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Admin workspace
        </p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
          {description}
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-muted)]">
          <FiClock size={14} />
          Coming soon
        </div>

        <div className="mt-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <FiArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminPlaceholder;
