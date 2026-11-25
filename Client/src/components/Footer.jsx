import { useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  Send,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { subscribeNewsletter } from "../features/newsletter/newsletterService";

const Footer = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await subscribeNewsletter(normalizedEmail);

      setStatus({
        type: "success",
        message: response.message || "Successfully subscribed!",
      });

      setEmail("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Subscription failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    if (onNavigate) {
      onNavigate("home");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[#070c14] px-5 pt-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Newsletter Section */}
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-[#101d2d] via-[#0d1725] to-[#101326] p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-semibold text-cyan-300">
                <Mail size={15} />
                NEWSLETTER
              </div>

              <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Stay in the
                <span className="text-cyan-400"> Loop.</span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                Get updates about my latest projects, development journey, new
                ideas and interesting things from the world of web development.
                No spam, just valuable updates.
              </p>
            </div>

            <div>
              <form onSubmit={handleSubscribe}>
                <label
                  htmlFor="newsletter-email"
                  className="mb-3 block text-sm font-semibold text-slate-200"
                >
                  Your email address
                </label>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080f1b] p-2 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                    <Mail size={19} className="shrink-0 text-cyan-400" />

                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      maxLength={150}
                      required
                      disabled={loading}
                      className="w-full min-w-0 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-[#080d16] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>

                {status.message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`mt-4 flex items-start gap-2 text-sm ${
                      status.type === "success"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {status.type === "success" && (
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                    )}
                    {status.message}
                  </p>
                )}

                <p className="mt-4 text-xs text-slate-500">
                  By subscribing, you agree to receive occasional email updates.
                  You can unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Main Content */}
        <div className="grid gap-12 border-b border-white/[0.07] py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <button
              onClick={scrollToTop}
              className="text-2xl font-extrabold tracking-wide"
            >
              SALMAN<span className="text-cyan-400">.</span>
            </button>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Full Stack Developer passionate about building modern, responsive
              and meaningful digital experiences.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <a
                href="https://github.com/salmanfarshi-dev"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
              >
                <FiGithub size={19} />
              </a>

              <a
                href="https://www.linkedin.com/in/salmanfarshi-dev/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
              >
                <FiLinkedin size={19} />
              </a>

              <a
                href="mailto:sfarshi222@gmail.com"
                aria-label="Email"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
              >
                <Mail size={19} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">Quick Links</h3>

            <div className="mt-6 flex flex-col items-start gap-4">
              {[
                "home",
                "about",
                "tech-stack",
                "projects",
                "journey",
                "contact",
              ].map((section) => (
                <button
                  key={section}
                  onClick={() => onNavigate?.(section)}
                  className="text-sm capitalize text-slate-400 transition hover:text-cyan-400"
                >
                  {section.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">Get In Touch</h3>

            <a
              href="mailto:sfarshi222@gmail.com"
              className="mt-6 flex items-center gap-3 text-sm text-slate-400 transition hover:text-cyan-400"
            >
              <Mail size={17} className="text-cyan-400" />
              sfarshi222@gmail.com
              <ArrowUpRight size={14} />
            </a>

            <p className="mt-5 text-sm text-slate-400">Based in Bangladesh</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-5 py-7 sm:flex-row">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Salman Farshi. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-cyan-400"
          >
            Back to top
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10">
              <ArrowUp size={15} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
