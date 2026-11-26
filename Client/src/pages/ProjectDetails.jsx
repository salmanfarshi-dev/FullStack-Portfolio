
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Layers3,
  Lightbulb,
  LoaderCircle,
  Monitor,
  Server,
  ShoppingBag,
  Sparkles,
  Target,
  XCircle,
  Wallet,
} from "lucide-react";

import { FiGithub } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// --------------------------------------------------
// STATIC HISHABIO PROJECT
// No API / MongoDB / Admin Dashboard dependency
// --------------------------------------------------

const hishabioProject = {
  title: "Hishabio",
  slug: "hishabio",
  category: "fullstack",

  shortDescription:
    "A full-stack shared expense management platform that helps families, friends, and roommates manage shared expenses, split bills, track balances, and record settlements.",

  description:
    "Hishabio is a full-stack MERN application designed to simplify shared expense management. Users can create households, add expenses, manage members, track individual contributions, view spending analytics, and record settlements through a centralized dashboard.",

  technologies: [
    "React 19",
    "JavaScript",
    "Tailwind CSS v4",
    "Vite",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Mongoose",
    "JWT",
    "bcryptjs",
    "Cloudinary",
    "Recharts",
    "Axios",
  ],

  liveUrl: "https://myhishabio.vercel.app",
  githubUrl: "https://github.com/salmanfarshi-dev/Hishabio",

  thumbnail: "",
  images: [],
};

// --------------------------------------------------
// YUMORA EXTENDED DETAILS
// --------------------------------------------------

const yumoraDetails = {
  overview:
    "Yumora is a modern food e-commerce web application designed to provide users with a smooth and convenient online shopping experience. Users can explore products, manage their cart, save wishlist items, authenticate their accounts, and place orders through an intuitive checkout experience.",

  problem:
    "Online shoppers need a convenient and organized way to discover products, manage selected items, and complete purchases without navigating through complicated interfaces.",

  solution:
    "Yumora brings product discovery, cart management, wishlist functionality, authentication, and checkout together in one responsive application.",

  features: [
    "Responsive product browsing and listing",
    "Product categories and promotional sections",
    "Shopping cart with quantity management",
    "Persistent cart using LocalStorage",
    "Wishlist management using LocalStorage",
    "Firebase email and password authentication",
    "User registration and login",
    "User account and profile management",
    "Checkout with billing information",
    "Order placement using Cloud Firestore",
    "Contact form integration using EmailJS",
    "Loading states and error handling",
    "Toast notifications and interactive UI",
  ],

  frontendArchitecture: [
    {
      title: "Pages",
      description:
        "Home, ProductList, ProductsDetails, Checkout, Account, Login, Contact, AboutUs, Wishlist and Cart pages.",
    },
    {
      title: "Components",
      description:
        "Reusable components such as ProductCard and PageBreadcrumb.",
    },
    {
      title: "Layouts",
      description:
        "Shared Navbar, Footer, promotional sections and common layout components.",
    },
    {
      title: "Redux Store",
      description:
        "Redux Toolkit manages shared shopping cart and wishlist states.",
    },
  ],

  backendArchitecture: [
    {
      title: "Firebase Authentication",
      description:
        "Handles user registration and login using Firebase authentication services.",
    },
    {
      title: "Cloud Firestore",
      description:
        "Stores user profile information and submitted order documents.",
    },
    {
      title: "DummyJSON API",
      description:
        "Provides external product data for product browsing and listing.",
    },
    {
      title: "EmailJS",
      description:
        "Handles contact form email functionality.",
    },
  ],

  database: [
    {
      title: "Firestore — users",
      description:
        "User profile and account-related information.",
    },
    {
      title: "Firestore — orders",
      description:
        "Order records containing userId, customer information, items, subtotal, deliveryCharges, totalAmount, currency, paymentMethod, paymentStatus, orderStatus and createdAt.",
    },
    {
      title: "LocalStorage",
      description:
        "Persists shopping cart and wishlist data in the browser.",
    },
  ],

  challenges: [
    {
      title: "State Management",
      description:
        "Managing shared cart and wishlist data across different components using Redux Toolkit.",
    },
    {
      title: "Authentication",
      description:
        "Integrating Firebase Authentication and managing authenticated user experiences.",
    },
    {
      title: "Order Processing",
      description:
        "Handling checkout details, calculating order totals, and storing orders in Firestore.",
    },
    {
      title: "Responsive Interface",
      description:
        "Building reusable and responsive interfaces for different screen sizes.",
    },
    {
      title: "API Integration",
      description:
        "Fetching external product data and managing loading and error states.",
    },
  ],
};

// --------------------------------------------------
// HISHABIO EXTENDED DETAILS — FULL-STACK MERN
// --------------------------------------------------

const hishabioDetails = {
  overview:
    "Hishabio is a full-stack shared expense management platform built to help families, friends, and roommates organize their shared finances. Users can create households, record expenses, track individual contributions, understand outstanding balances, and manage settlements through a centralized dashboard. The application combines a React frontend with a Node.js and Express backend, using MongoDB for persistent data storage.",

  problem:
    "When multiple people share expenses, keeping track of who paid, how much each person owes, and whether payments have been settled can become confusing. Managing these calculations manually can lead to mistakes, unclear records, and disagreements.",

  solution:
    "Hishabio provides a centralized expense management system where users can create households, add shared expenses, view spending summaries, track member balances, and record settlements. It organizes shared financial activity in one place and makes expense tracking easier to understand.",

  features: [
    "User registration and login",
    "Email OTP verification during registration",
    "JWT-based authentication",
    "Password recovery and reset functionality",
    "Secure password hashing with bcryptjs",
    "User profile management",
    "Profile image upload using Cloudinary",
    "Create and manage households",
    "Join households using invitation codes",
    "View household details and members",
    "Household owner-based member management",
    "Add, update, and delete expenses",
    "Expense categories and paid-by information",
    "Equal expense splitting among participants",
    "Track individual expense shares",
    "View household spending and balances",
    "Record settlements between members",
    "Settlement history and payment tracking",
    "Dashboard with spending analytics",
    "Monthly spending charts and summaries",
    "Category-wise expense reports",
    "Member-wise spending reports",
    "Year and month-based report filtering",
    "In-app notifications for important activities",
    "Bangla and English language preferences",
    "Light, Dark, and System theme preferences",
    "Currency preference management",
    "Responsive user interface",
  ],

  frontendArchitecture: [
    {
      title: "React Application",
      description:
        "A component-based React 19 frontend built with JavaScript and Vite.",
    },
    {
      title: "Pages & Routing",
      description:
        "React Router manages navigation between authentication, dashboard, household, expense, report, settlement, notification, and profile pages.",
    },
    {
      title: "API Integration",
      description:
        "Axios connects the frontend with backend REST APIs for authentication, expenses, households, settlements, reports, and user data.",
    },
    {
      title: "Dashboard & Charts",
      description:
        "Recharts visualizes monthly spending trends and expense analytics.",
    },
    {
      title: "UI & Notifications",
      description:
        "Tailwind CSS v4, React Icons, and React Hot Toast support the interface, icons, and user feedback.",
    },
    {
      title: "Application Context",
      description:
        "LanguageContext and ThemeContext manage language and theme preferences across the application.",
    },
  ],

  backendArchitecture: [
    {
      title: "Node.js & Express.js",
      description:
        "A REST API backend built with Node.js and Express 5 to handle application logic and client requests.",
    },
    {
      title: "Authentication & Security",
      description:
        "JWT handles authentication, bcryptjs hashes passwords, and protected routes control access to authenticated resources.",
    },
    {
      title: "Expense Management",
      description:
        "Expense controllers handle expense creation, updates, deletion, participant information, and equal-share calculations.",
    },
    {
      title: "Household Management",
      description:
        "Household APIs support household creation, invitation-code joining, member information, and owner-based member management.",
    },
    {
      title: "Settlement Management",
      description:
        "Settlement APIs record payments between members and maintain settlement history.",
    },
    {
      title: "Reports & Notifications",
      description:
        "Backend controllers provide expense reporting, dashboard data, and notifications for important household activities.",
    },
    {
      title: "Cloud Services",
      description:
        "Cloudinary handles profile image uploads, while a Google Apps Script email service integration supports email OTP delivery.",
    },
  ],

  database: [
    {
      title: "MongoDB",
      description:
        "The primary database stores application data persistently.",
    },
    {
      title: "Mongoose Models",
      description:
        "Mongoose schemas organize and validate application data, including users, households, expenses, settlements, and notifications.",
    },
    {
      title: "Expense Records",
      description:
        "Expense data includes household information, category, amount, payer, participants, split information, and related timestamps.",
    },
    {
      title: "Household & Members",
      description:
        "Stores household information, invitation codes, ownership, and member relationships.",
    },
    {
      title: "Settlement Records",
      description:
        "Stores payment information between household members and maintains settlement history.",
    },
    {
      title: "Notifications",
      description:
        "Stores notification information for relevant household and account activities.",
    },
  ],

  challenges: [
    {
      title: "Authentication & Security",
      description:
        "Implementing JWT-based authentication, protected API routes, password hashing, email OTP verification, and password recovery.",
    },
    {
      title: "Expense Calculation",
      description:
        "Managing shared expense records and distributing amounts among participants while avoiding fractional rounding loss through integer-paisa calculations.",
    },
    {
      title: "Household Relationships",
      description:
        "Managing household ownership, invitation codes, member relationships, and access restrictions.",
    },
    {
      title: "Balance & Settlements",
      description:
        "Organizing payment records between members and making settlement information easier to track.",
    },
    {
      title: "Dashboard Analytics",
      description:
        "Preparing monthly summaries, category-based reports, member-wise spending information, and chart data.",
    },
    {
      title: "Frontend and Backend Integration",
      description:
        "Connecting React pages with REST APIs and handling authentication, loading states, errors, and user feedback.",
    },
  ],
};

// --------------------------------------------------
// TECHNOLOGY FALLBACK
// --------------------------------------------------

const defaultTechnologies = [
  "React",
  "JavaScript",
  "Tailwind CSS",
  "Vite",
];

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

const SectionHeading = ({ number, title, subtitle }) => (
  <div className="mb-8">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
      {number} / Project Details
    </p>

    <h2 className="text-2xl font-bold text-white md:text-3xl">
      {title}
    </h2>

    {subtitle && (
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
        {subtitle}
      </p>
    )}
  </div>
);

const DetailCard = ({ icon: Icon, title, description }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
      <Icon size={21} />
    </div>

    <h3 className="font-semibold text-white">{title}</h3>

    <p className="mt-3 text-sm leading-7 text-slate-400">
      {description}
    </p>
  </div>
);

const FeatureCard = ({ children }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
    <CheckCircle2
      size={18}
      className="mt-0.5 shrink-0 text-cyan-400"
    />

    <span className="text-sm leading-6 text-slate-300">
      {children}
    </span>
  </div>
);

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function ProjectDetails() {
  const { slug } = useParams();

  const normalizedRouteSlug = (slug || "")
    .toLowerCase()
    .trim();

  // Hishabio is a static project.
  const isStaticHishabio =
    normalizedRouteSlug === "hishabio";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH PROJECT
  // HISHABIO BYPASSES API COMPLETELY
  // --------------------------------------------------

  useEffect(() => {
    // STATIC HISHABIO
    if (isStaticHishabio) {
      setProject(hishabioProject);
      setError("");
      setLoading(false);

      // Important: Do not make an API request.
      return;
    }

    // OTHER PROJECTS: BACKEND API
    const controller = new AbortController();

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");
        setProject(null);

        const response = await fetch(
          `${API_URL}/projects/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.project) {
          throw new Error(
            data.message || "Project could not be found."
          );
        }

        setProject(data.project);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchProject();
    } else {
      setError("Project slug is missing.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [slug, isStaticHishabio]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d16] text-white">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-5 text-sm text-slate-400">
            Loading project details...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR / NOT FOUND
  // --------------------------------------------------

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d16] px-5 text-white">
        <div className="max-w-md text-center">
          <XCircle
            size={48}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-6 text-3xl font-bold">
            Project Not Found
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {error || "The requested project is not available."}
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // PROJECT DATA
  // --------------------------------------------------

  const normalizedSlug = (
    project.slug || slug || ""
  )
    .toLowerCase()
    .trim();

  const isYumora =
    normalizedSlug.startsWith("yumora");

  const isHishabio =
    normalizedSlug.startsWith("hishabio");

  const selectedDetails = isHishabio
    ? hishabioDetails
    : isYumora
      ? yumoraDetails
      : null;

  const technologies =
    project.technologies?.length > 0
      ? project.technologies
      : defaultTechnologies;

  const images = [
    ...(project.thumbnail ? [project.thumbnail] : []),
    ...(Array.isArray(project.images)
      ? project.images
      : []),
  ].filter(Boolean);

  const description =
    project.description ||
    project.shortDescription ||
    "Explore this project and discover its features.";

  const shortDescription =
    project.shortDescription || description;

  const features =
    selectedDetails?.features || [];

  const displayDate = project.createdAt
    ? new Date(project.createdAt).getFullYear()
    : "Project";

  const architectureIcon = isHishabio
    ? Code2
    : Layers3;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d16] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-[-150px] top-[45%] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-10">

        {/* BACK */}

        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
        >
          <ArrowLeft size={17} />
          Back to Portfolio
        </Link>

        {/* HERO */}

        <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
              <Sparkles size={14} />

              {isHishabio
                ? "Full-Stack MERN Project"
                : project.category || "Development Project"}
            </div>

            <h1 className="break-words text-5xl font-bold tracking-tight md:text-7xl">
              {project.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
              {shortDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Live Demo
                  <ArrowUpRight size={18} />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
                >
                  <FiGithub size={18} />
                  GitHub Repository
                </a>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-7">
              <div>
                <p className="text-xs text-slate-500">
                  Category
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {isHishabio
                    ? "Full Stack"
                    : project.category || "Development"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Technologies
                </p>

                <p className="mt-1 font-semibold">
                  {technologies.length}+
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Year
                </p>

                <p className="mt-1 font-semibold">
                  {displayDate}
                </p>
              </div>
            </div>
          </motion.div>

          {/* PROJECT THUMBNAIL */}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101927] p-3">
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#132c35] to-[#17152c] p-8 text-center">
                  {isHishabio ? (
                    <Wallet
                      size={60}
                      className="text-cyan-400"
                    />
                  ) : (
                    <ShoppingBag
                      size={60}
                      className="text-cyan-400"
                    />
                  )}

                  <h2 className="mt-6 text-3xl font-bold">
                    {project.title}
                  </h2>

                  <p className="mt-3 text-sm text-slate-400">
                    Project Preview
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* SECTION NAVIGATION */}

        <nav className="sticky top-3 z-30 my-12 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#0c1420]/95 p-3 backdrop-blur-xl">
          {[
            "Overview",
            "Description",
            "Problem",
            "Features",
            "Technologies",
            "Gallery",
            "Frontend",
            "Backend",
            "Database",
            "Learnings",
          ].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="space-y-24 py-10">

          {/* 01 OVERVIEW */}

          <section
            id="overview"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="01"
              title="Project Overview"
            />

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">
              <div className="flex items-center gap-3 text-cyan-400">
                <Monitor size={22} />

                <span className="font-semibold">
                  About the Project
                </span>
              </div>

              <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
                {selectedDetails?.overview || description}
              </p>
            </div>
          </section>

          {/* 02 DESCRIPTION */}

          <section
            id="description"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="02"
              title="Project Description"
            />

            <p className="max-w-4xl text-base leading-8 text-slate-400">
              {description}
            </p>
          </section>

          {/* 03 PROBLEM & SOLUTION */}

          <section
            id="problem"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="03"
              title="Problem & Solution"
            />

            {selectedDetails ? (
              <div className="grid gap-5 md:grid-cols-2">
                <DetailCard
                  icon={Target}
                  title="The Problem"
                  description={selectedDetails.problem}
                />

                <DetailCard
                  icon={Lightbulb}
                  title="The Solution"
                  description={selectedDetails.solution}
                />
              </div>
            ) : (
              <DetailCard
                icon={Lightbulb}
                title="Project Approach"
                description={shortDescription}
              />
            )}
          </section>

          {/* 04 FEATURES */}

          <section
            id="features"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="04"
              title="Key Features"
              subtitle={
                isHishabio
                  ? "Explore the core features of this full-stack expense management platform."
                  : "Explore the main features and functionality of this project."
              }
            />

            {features.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <FeatureCard key={feature}>
                    {feature}
                  </FeatureCard>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-slate-400">
                {project.shortDescription ||
                  "Project features and functionality."}
              </div>
            )}
          </section>

          {/* 05 TECHNOLOGIES */}

          <section
            id="technologies"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="05"
              title="Technologies Used"
            />

            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <span
                  key={`${tech}-${index}`}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm font-medium text-cyan-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* 06 GALLERY */}

          <section
            id="gallery"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="06"
              title="Screenshots & Gallery"
              subtitle="Explore the visual assets available for this project."
            />

            {images.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {images.map((image, index) => (
                  <motion.div
                    key={`${image}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <img
                      src={image}
                      alt={`${project.title} preview ${index + 1}`}
                      loading="lazy"
                      className="aspect-video w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center">
                <Monitor
                  size={35}
                  className="mx-auto text-slate-500"
                />

                <p className="mt-4 text-sm text-slate-400">
                  No project images have been added yet.
                </p>
              </div>
            )}
          </section>

          {/* 07 FRONTEND ARCHITECTURE */}

          <section
            id="frontend"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="07"
              title="Frontend Architecture"
              subtitle={
                isHishabio
                  ? "The React frontend handles user interaction, application navigation, data visualization, and API integration."
                  : "The frontend structure and application organization."
              }
            />

            {selectedDetails ? (
              <div className="grid gap-5 md:grid-cols-2">
                {selectedDetails.frontendArchitecture.map(
                  (item) => (
                    <DetailCard
                      key={item.title}
                      icon={architectureIcon}
                      title={item.title}
                      description={item.description}
                    />
                  )
                )}
              </div>
            ) : (
              <DetailCard
                icon={Code2}
                title="Frontend"
                description={`This project uses ${technologies.join(", ")}.`}
              />
            )}
          </section>

          {/* 08 BACKEND ARCHITECTURE */}

          <section
            id="backend"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="08"
              title="Backend Architecture"
              subtitle={
                isHishabio
                  ? "A Node.js and Express backend provides REST APIs and manages application business logic."
                  : isYumora
                    ? "Yumora uses Firebase services instead of a custom Node.js and Express backend."
                    : "Project backend information."
              }
            />

            {selectedDetails ? (
              <div className="grid gap-5 md:grid-cols-2">
                {selectedDetails.backendArchitecture.map(
                  (item) => (
                    <DetailCard
                      key={item.title}
                      icon={Server}
                      title={item.title}
                      description={item.description}
                    />
                  )
                )}
              </div>
            ) : (
              <DetailCard
                icon={Server}
                title="Backend Information"
                description={
                  project.category === "frontend"
                    ? "This is a frontend-focused project. No separate backend information is configured."
                    : "Backend details are not currently available for this project."
                }
              />
            )}
          </section>

          {/* 09 DATABASE */}

          <section
            id="database"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="09"
              title="Database Structure"
              subtitle={
                isHishabio
                  ? "MongoDB and Mongoose provide persistent data storage and schema-based data management."
                  : "Data storage and persistence information."
              }
            />

            {selectedDetails ? (
              <div className="grid gap-5 md:grid-cols-2">
                {selectedDetails.database.map((item) => (
                  <DetailCard
                    key={item.title}
                    icon={Database}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            ) : (
              <DetailCard
                icon={Database}
                title="Database Information"
                description="Database details have not been configured for this project."
              />
            )}
          </section>

          {/* 10 CHALLENGES & LEARNINGS */}

          <section
            id="learnings"
            className="scroll-mt-28"
          >
            <SectionHeading
              number="10"
              title="Challenges & Learnings"
              subtitle="Technical challenges and practical experience gained while building this project."
            />

            {selectedDetails ? (
              <div className="space-y-4">
                {selectedDetails.challenges.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <h3 className="font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm leading-7 text-slate-400">
                  This project helped develop practical experience with{" "}
                  {technologies.join(", ")}.
                </p>
              </div>
            )}
          </section>

          {/* 11 PROJECT LINKS */}

          <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.10] to-violet-500/[0.08] p-8 text-center md:p-12">
            <SectionHeading
              number="11"
              title="Explore This Project"
              subtitle="Explore the live application or review the source code."
            />

            <div className="flex flex-wrap justify-center gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Live Demo
                  <ExternalLink size={17} />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  <FiGithub size={18} />
                  GitHub Repository
                </a>
              )}
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Salman Farshi. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
