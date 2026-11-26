
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Menu,
  X,
  Code2,
  Database,
  Server,
  Sparkles,
  Terminal,
  ExternalLink,
  Layers,
  BriefcaseBusiness,
  GraduationCap,
  Send,
  MapPin,
  Download,
} from "lucide-react";

import Footer from "../components/Footer";
import { FiGithub, FiLinkedin } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

/* =========================================
   STATIC PROJECTS
   Add frontend-only projects here.
========================================= */

const staticProjects = [
  {
    id: "hishabio-static",
    slug: "hishabio",
    name: "Hishabio",
    category: "Full Stack",
    description:
      "A full-stack shared expense management platform that helps families, friends, and roommates manage group expenses, split bills, track balances, and record settlements with ease.",
    technologies: [
      "React",
      "JavaScript",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Cloudinary",
      "Recharts",
    ],
    github: "https://github.com/salmanfarshi-dev/Hishabio",
    live: "https://myhishabio.vercel.app",
    thumbnail: "",
    featured: true,
    isStatic: true,
  },
];

const navLinks = [
  { label: "Home", target: "home" },
  { label: "About", target: "about" },
  { label: "Tech Stack", target: "tech-stack" },
  { label: "Projects", target: "projects" },
  { label: "Journey", target: "journey" },
  { label: "Contact", target: "contact" },
];

const skills = [
  {
    title: "Frontend Development",
    icon: Code2,
    color: "from-cyan-400 to-blue-500",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "React.js",
      "Tailwind CSS",
      "Redux",
      "React Router",
      "Framer Motion",
    ],
  },
  {
    title: "Backend Development",
    icon: Server,
    color: "from-violet-400 to-purple-500",
    items: [
      "Node.js",
      "Express.js",
      "REST APIs",
      "JWT Authentication",
      "Middleware",
    ],
  },
  {
    title: "Database & Tools",
    icon: Database,
    color: "from-blue-400 to-cyan-500",
    items: ["MongoDB", "Mongoose", "Git", "GitHub", "VS Code", "Postman"],
  },
];

const journey = [
  {
    year: "Learning",
    title: "Started with Web Development",
    description:
      "Built a strong foundation in HTML, CSS, JavaScript and responsive web design.",
    icon: GraduationCap,
  },
  {
    year: "Frontend",
    title: "React.js Development",
    description:
      "Started building interactive interfaces and real-world frontend applications using React.",
    icon: Code2,
  },
  {
    year: "Expanding",
    title: "Exploring Full Stack Development",
    description:
      "Expanding my development skills with Node.js, Express.js, MongoDB and REST API development.",
    icon: Terminal,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const PortfolioHome = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [resume, setResume] = useState(null);

  // Hishabio is available immediately from frontend code.
  const [projects, setProjects] = useState(staticProjects);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactStatus, setContactStatus] = useState({
    type: "",
    text: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================================
     FETCH PUBLIC RESUME
  ========================================= */

  useEffect(() => {
    let active = true;

    const fetchResume = async () => {
      try {
        const response = await fetch(`${API_URL}/resume`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load resume.");
        }

        if (active && data.resume?.isVisible && data.resume?.fileUrl) {
          setResume(data.resume);
        }
      } catch (error) {
        console.error("Public resume could not be loaded:", error.message);
      }
    };

    fetchResume();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     TRACK RESUME DOWNLOAD
  ========================================= */

  const handleResumeDownload = () => {
    fetch(`${API_URL}/resume/download`, {
      method: "POST",
    }).catch((error) =>
      console.error("Resume download tracking failed:", error.message),
    );
  };

  /* =========================================
     FETCH BACKEND PROJECTS
     Static Hishabio is always preserved.
  ========================================= */

  useEffect(() => {
    let active = true;

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load projects.");
        }

        const backendProjects = (data.projects || [])
          // Prevent duplicate Hishabio if it exists in database.
          .filter(
            (project) =>
              (project.slug || "").toLowerCase() !== "hishabio",
          )
          .map((project) => ({
            id: project._id,
            slug: project.slug,
            name: project.title,

            category:
              project.category === "fullstack"
                ? "Full Stack"
                : project.category === "frontend"
                  ? "Frontend"
                  : project.category === "backend"
                    ? "Backend"
                    : "Mini Projects",

            description:
              project.shortDescription || project.description || "",

            technologies: project.technologies || [],
            github: project.githubUrl || "",
            live: project.liveUrl || "",
            thumbnail: project.thumbnail || "",
            featured: project.isFeatured,
            isStatic: false,
          }));

        if (active) {
          // Keep backend projects and append static Hishabio.
          const combinedProjects = [
            ...backendProjects,
            staticProjects[0],
          ].map((project, index) => ({
            ...project,
            number: String(index + 1).padStart(2, "0"),
          }));

          setProjects(combinedProjects);
        }
      } catch (error) {
        console.error("Projects loading error:", error);

        if (active) {
          // If backend fails, Hishabio still remains visible.
          setProjects(
            staticProjects.map((project, index) => ({
              ...project,
              number: String(index + 1).padStart(2, "0"),
            })),
          );
        }
      } finally {
        if (active) {
          setProjectsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     SAME-PAGE SMOOTH SCROLL
  ========================================= */

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMenuOpen(false);
  };

  /* =========================================
     CONTACT FORM
  ========================================= */

  const handleContactChange = (event) => {
    const { name, value } = event.target;

    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    setContactStatus({ type: "", text: "" });

    const { name, email, subject, message } = contactForm;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setContactStatus({
        type: "error",
        text: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to send your message. Please try again.",
        );
      }

      setContactStatus({
        type: "success",
        text: result.message || "Your message has been sent successfully!",
      });

      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setContactStatus({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     PROJECT FILTERS
  ========================================= */

  const filters = ["All", "Full Stack", "Frontend", "Backend", "Mini Projects"];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const openProjectDetails = (slug) => {
    if (!slug) return;

    navigate(`/projects/${slug}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#080d16] text-white selection:bg-cyan-400 selection:text-[#080d16]">
      {/* Background Effects */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-[140px]" />
      </div>

      {/* Navbar */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#080d16]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            onClick={() => scrollToSection("home")}
            className="group flex items-center gap-2"
            aria-label="Go to home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-bold text-[#080d16] transition group-hover:rotate-6">
              SF
            </span>

            <span className="text-lg font-bold tracking-wide">
              SALMAN<span className="text-cyan-400">.</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollToSection(link.target)}
                className="text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-cyan-400"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection("contact")}
              className="flex items-center gap-2 rounded-full border border-cyan-400/40 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400 hover:text-[#080d16]"
            >
              Let's Talk
              <ArrowUpRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/[0.06] bg-[#080d16] md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col px-5 py-5 sm:px-8">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.target}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => scrollToSection(link.target)}
                    className="border-b border-white/[0.06] py-3.5 text-left text-sm font-medium text-slate-300 transition hover:text-cyan-400"
                  >
                    {link.label}
                  </motion.button>
                ))}

                <button
                  onClick={() => scrollToSection("contact")}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-semibold text-[#080d16]"
                >
                  Let's Talk
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}

        <section
          id="home"
          className="scroll-mt-20 relative flex min-h-screen items-center px-5 pb-20 pt-32 sm:px-8 lg:px-10"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                <span className="text-xs font-medium tracking-wide text-cyan-300 sm:text-sm">
                  Available for Opportunities
                </span>
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Hello, I'm
              </p>

              <h1 className="text-5xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                Salman
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Farshi.
                </span>
              </h1>

              <h2 className="mt-7 text-xl font-semibold text-slate-200 sm:text-2xl">
                Full Stack Developer
                <span className="text-cyan-400"> | </span>
                MERN Stack
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                I build modern, responsive and user-focused web experiences. I
                enjoy turning ideas into functional applications and
                continuously expanding my skills across frontend and backend
                development.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection("projects")}
                  className="group flex items-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-[#080d16] transition hover:bg-cyan-300"
                >
                  Explore My Work
                  <ArrowUpRight
                    size={19}
                    className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </button>

                <button
                  onClick={() => scrollToSection("contact")}
                  className="flex items-center gap-3 rounded-xl border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-cyan-400/50 hover:text-cyan-400"
                >
                  <Mail size={18} />
                  Contact Me
                </button>

                {resume && (
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleResumeDownload}
                    className="flex items-center gap-3 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-7 py-4 font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#080d16]"
                    aria-label="Download CV PDF"
                  >
                    <Download size={18} />
                    Download CV
                  </a>
                )}
              </div>

              <div className="mt-12 flex items-center gap-5">
                <a
                  href="https://github.com/salmanfarshi-dev"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                >
                  <FiGithub size={20} />
                </a>

                <a
                  href="https://www.linkedin.com/in/salmanfarshi-dev/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                >
                  <FiLinkedin size={20} />
                </a>

                <a
                  href="mailto:sfarshi222@gmail.com"
                  aria-label="Email"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                >
                  <Mail size={19} />
                </a>
              </div>
            </motion.div>

            {/* Hero Visual */}

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-violet-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101927] p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>

                  <span className="text-xs text-slate-500">developer.js</span>
                </div>

                <div className="mt-10 flex flex-col items-center text-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#0b1421] text-5xl font-black text-cyan-300">
                      SF
                    </div>

                    <span className="absolute bottom-1 right-2 h-5 w-5 rounded-full border-4 border-[#101927] bg-green-400" />
                  </div>

                  <h3 className="mt-7 text-2xl font-bold">Salman Farshi</h3>

                  <p className="mt-2 text-sm text-cyan-300">
                    Full Stack Developer
                  </p>

                  <div className="mt-8 w-full rounded-2xl border border-white/[0.07] bg-[#080f1b] p-5 text-left font-mono text-sm leading-8">
                    <p>
                      <span className="text-violet-400">const</span>{" "}
                      <span className="text-cyan-300">developer</span> = {"{"}
                    </p>

                    <p className="pl-5 text-slate-400">
                      name:{" "}
                      <span className="text-green-300">"Salman Farshi"</span>,
                    </p>

                    <p className="pl-5 text-slate-400">
                      role: <span className="text-green-300">"Full Stack"</span>,
                    </p>

                    <p className="pl-5 text-slate-400">
                      passion:{" "}
                      <span className="text-green-300">
                        "Building Web Apps"
                      </span>
                    </p>

                    <p className="text-slate-300">{"};"}</p>
                  </div>

                  <div className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <span className="text-xs text-slate-400">
                      Current Focus
                    </span>
                    <span className="text-xs font-semibold text-cyan-300">
                      MERN Stack
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -right-5 top-20 hidden rounded-2xl border border-white/10 bg-[#111c2b] p-4 shadow-xl sm:block">
                <Code2 className="text-cyan-400" size={25} />
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#111c2b] p-4 shadow-xl sm:block">
                <Sparkles className="text-violet-400" size={25} />
              </div>
            </motion.div>
          </div>

          <button
            onClick={() => scrollToSection("about")}
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-500 transition hover:text-cyan-400 md:flex"
          >
            <span className="text-[10px] uppercase tracking-[0.25em]">
              Scroll to explore
            </span>
            <ArrowDown size={19} className="animate-bounce" />
          </button>
        </section>

        {/* About Section */}

        <section
          id="about"
          className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                Get to know me
              </p>

              <h2 className="text-4xl font-bold sm:text-5xl">
                About <span className="text-cyan-400">Me.</span>
              </h2>
            </motion.div>

            <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
              >
                <p className="text-lg leading-9 text-slate-300">
                  I'm a passionate web developer who enjoys creating modern
                  digital experiences. My journey started with frontend
                  development, where I discovered my interest in building
                  beautiful and interactive interfaces.
                </p>

                <p className="leading-8 text-slate-400">
                  I primarily work with React.js and modern frontend
                  technologies. Alongside frontend development, I'm expanding my
                  knowledge of backend technologies, including Node.js,
                  Express.js and MongoDB, to build complete web applications.
                </p>

                <p className="leading-8 text-slate-400">
                  My goal is to keep learning, improve my problem-solving skills
                  and build practical projects that solve real-world problems.
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => scrollToSection("projects")}
                    className="flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#080d16] transition hover:bg-cyan-300"
                  >
                    View Projects
                    <ArrowRight size={17} />
                  </button>

                  <a
                    href="mailto:sfarshi222@gmail.com"
                    className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-400"
                  >
                    Get in Touch
                    <Mail size={17} />
                  </a>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {[
                  {
                    icon: Code2,
                    title: "Frontend Focus",
                    description: "Building responsive user interfaces",
                  },
                  {
                    icon: Server,
                    title: "Backend Learning",
                    description: "Developing server-side applications",
                  },
                  {
                    icon: Layers,
                    title: "Clean Structure",
                    description: "Writing organized and maintainable code",
                  },
                  {
                    icon: Sparkles,
                    title: "Continuous Growth",
                    description: "Learning and improving every day",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                      <item.icon size={23} />
                    </div>

                    <h3 className="font-bold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}

        <section
          id="tech-stack"
          className="scroll-mt-20 border-t border-white/[0.06] bg-white/[0.015] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                My Technical Skills
              </p>

              <h2 className="text-4xl font-bold sm:text-5xl">
                Tech <span className="text-cyan-400">Stack.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                Technologies and tools I use while building web applications and
                improving my development skills.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#0d1522] p-7 transition duration-300 hover:-translate-y-2 hover:border-cyan-400/30"
                >
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${skill.color} text-[#080d16]`}
                  >
                    <skill.icon size={27} />
                  </div>

                  <h3 className="text-xl font-bold">{skill.title}</h3>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}

        <section
          id="projects"
          className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Selected Work
                </p>

                <h2 className="text-4xl font-bold sm:text-5xl">
                  Featured <span className="text-cyan-400">Projects.</span>
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-slate-400">
                  A selection of projects that reflect my learning, creativity
                  and development journey.
                </p>
              </div>

              <a
                href="https://github.com/salmanfarshi-dev?tab=repositories"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Explore GitHub
                <ArrowUpRight size={17} />
              </a>
            </div>

            {/* Project Filters */}

            <div className="mt-10 flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "border-cyan-400 bg-cyan-400 text-[#080d16]"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Projects Loading */}

            {projectsLoading && (
              <div className="mt-10 py-12 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading projects...
                </p>
              </div>
            )}

            {/* Project Cards */}

            {!projectsLoading && (
              <>
                <motion.div layout className="mt-9 grid gap-6 lg:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => {
                      const isMiniProject =
                        (project.category || "")
                          .toLowerCase()
                          .includes("mini") ||
                        (project.name || "")
                          .toLowerCase()
                          .includes("calculator") ||
                        (project.slug || "")
                          .toLowerCase()
                          .includes("calculator");

                      return (
                        <motion.article
                          layout
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => {
                            if (!isMiniProject) {
                              openProjectDetails(project.slug);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (
                              !isMiniProject &&
                              event.target === event.currentTarget &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              openProjectDetails(project.slug);
                            }
                          }}
                          role={isMiniProject ? undefined : "link"}
                          tabIndex={isMiniProject ? undefined : 0}
                          aria-label={
                            isMiniProject
                              ? `${project.name} mini project`
                              : `View ${project.name} project details`
                          }
                          className={`group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1522] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 ${
                            isMiniProject
                              ? ""
                              : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          }`}
                        >
                          {/* Project Thumbnail */}

                          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10">
                            {project.thumbnail ? (
                              <img
                                src={project.thumbnail}
                                alt={`${project.name} preview`}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <>
                                <div className="absolute inset-0 opacity-20">
                                  <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full border border-cyan-300/40" />
                                  <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full border border-violet-300/40" />
                                </div>

                                <span className="relative text-6xl font-black tracking-tighter text-white/10 transition duration-500 group-hover:scale-110">
                                  {project.name}
                                </span>
                              </>
                            )}

                            <span className="absolute left-6 top-6 rounded-full border border-cyan-400/20 bg-[#080d16]/80 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur">
                              {isMiniProject ? "Mini Project" : project.category}
                            </span>

                            <span className="absolute right-6 top-6 font-mono text-sm text-white/60">
                              /{project.number}
                            </span>

                            {!isMiniProject && (
                              <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#080d16]/70 text-cyan-300 opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                                <ArrowUpRight size={20} />
                              </div>
                            )}
                          </div>

                          {/* Project Information */}

                          <div className="p-7">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-2xl font-bold transition group-hover:text-cyan-300">
                                {project.name}
                              </h3>

                              <BriefcaseBusiness
                                size={21}
                                className="shrink-0 text-cyan-400"
                              />
                            </div>

                            <p className="mt-4 min-h-20 text-sm leading-7 text-slate-400">
                              {project.description}
                            </p>

                            {/* Technologies */}

                            <div className="mt-5 flex flex-wrap gap-2">
                              {project.technologies.map((technology) => (
                                <span
                                  key={technology}
                                  className="rounded-md bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300"
                                >
                                  {technology}
                                </span>
                              ))}
                            </div>

                            {/* Project Links */}

                            {(project.github || project.live) && (
                              <div className="mt-7 flex flex-wrap gap-3 border-t border-white/[0.07] pt-5">
                                {project.github && (
                                  <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                                  >
                                    <FiGithub size={16} />
                                    GitHub
                                    <ExternalLink size={14} />
                                  </a>
                                )}

                                {project.live && (
                                  <a
                                    href={project.live}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-[#080d16] transition hover:bg-cyan-300"
                                  >
                                    Live Demo
                                    <ArrowUpRight size={16} />
                                  </a>
                                )}
                              </div>
                            )}

                            {!isMiniProject && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openProjectDetails(project.slug);
                                }}
                                className="mt-5 flex w-full items-center justify-between border-t border-white/[0.07] pt-5 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                              >
                                View Project Details
                                <ArrowUpRight size={18} />
                              </button>
                            )}
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                {/* Empty Projects */}

                {filteredProjects.length === 0 && (
                  <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] py-16 text-center">
                    <Layers size={35} className="mx-auto text-slate-500" />

                    <p className="mt-4 text-slate-400">
                      No projects available in this category yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Journey Section */}

        <section
          id="journey"
          className="scroll-mt-20 border-t border-white/[0.06] bg-white/[0.015] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                My Development Journey
              </p>

              <h2 className="text-4xl font-bold sm:text-5xl">
                Learning & <span className="text-cyan-400">Growing.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                Every step is an opportunity to learn something new, improve my
                skills and become a better developer.
              </p>
            </div>

            <div className="relative mx-auto mt-16 max-w-3xl">
              <div className="absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-500 sm:left-8" />

              <div className="space-y-8">
                {journey.map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12 }}
                    className="relative flex gap-6"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-[#101927] text-cyan-400 sm:h-16 sm:w-16">
                      <item.icon size={24} />
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#0d1522] p-6 transition hover:border-cyan-400/30 sm:p-7">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                        {item.year}
                      </span>

                      <h3 className="mt-3 text-xl font-bold">{item.title}</h3>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}

        <section
          id="contact"
          className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="pt-4">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Get In Touch
                </p>

                <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                  Let’s build something{" "}
                  <span className="text-cyan-400">great.</span>
                </h2>

                <p className="mt-6 max-w-lg leading-8 text-slate-400">
                  Have a project idea, collaboration opportunity, or just want
                  to say hello? Send me a message. I’ll get back to you as soon
                  as possible.
                </p>

                <div className="mt-9 space-y-4 text-sm text-slate-300">
                  <a
                    href="mailto:sfarshi222@gmail.com"
                    className="flex items-center gap-3 transition hover:text-cyan-400"
                  >
                    <Mail size={18} className="text-cyan-400" />
                    sfarshi222@gmail.com
                  </a>

                  <span className="flex items-center gap-3">
                    <MapPin size={18} className="text-cyan-400" />
                    Bangladesh
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleContactSubmit}
                className="rounded-[2rem] border border-white/10 bg-[#101927]/90 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Your Name
                    <input
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter your name"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080f1b] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-300">
                    Email Address
                    <input
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      maxLength={150}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080f1b] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                    />
                  </label>
                </div>

                <label className="mt-5 block text-sm font-medium text-slate-300">
                  Subject
                  <input
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    required
                    maxLength={200}
                    placeholder="What is this about?"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#080f1b] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                  />
                </label>

                <label className="mt-5 block text-sm font-medium text-slate-300">
                  Message
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    maxLength={3000}
                    rows={6}
                    placeholder="Write your message here..."
                    className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#080f1b] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                  />
                </label>

                {contactStatus.text && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                      contactStatus.type === "success"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/20 bg-red-400/10 text-red-300"
                    }`}
                  >
                    {contactStatus.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-[#080d16] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending Message..." : "Send Message"}
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default PortfolioHome;
