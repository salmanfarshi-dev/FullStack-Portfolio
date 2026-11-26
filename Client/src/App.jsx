import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import AdminLayout from "./layouts/AdminLayout";

import Hero from "./pages/admin/Hero";
import About from "./pages/admin/About";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Projects from "./pages/admin/Projects";
import Skills from "./pages/admin/Skills";
import Journey from "./pages/admin/Journey";
import Socials from "./pages/admin/Socials";
import Messages from "./pages/admin/Messages";
import Newsletter from "./pages/admin/Newsletter";
import Notifications from "./pages/admin/Notifications";
import Analytics from "./pages/admin/Analytics";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Resume from "./pages/admin/Resume";
import Profile from "./pages/admin/Profile";
import WebsiteSettings from "./pages/admin/WebsiteSettings";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import AnalyticsTracker from "./components/AnalyticsTracker";

import PortfolioHome from "./pages/PortfolioHome";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnalyticsTracker />
        <Routes>
          {/* Public Portfolio */}
          <Route path="/" element={<PortfolioHome />} />

          {/* Admin Authentication */}
          <Route element={<PublicRoute />}>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Admin Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/projects" element={<Projects />} />
              <Route path="/admin/skills" element={<Skills />} />
              <Route path="/admin/about" element={<About />} />
              <Route path="/admin/hero" element={<Hero />} />
              <Route path="/admin/journey" element={<Journey />} />
              <Route path="/admin/socials" element={<Socials />} />
              <Route path="/admin/messages" element={<Messages />} />
              <Route path="/admin/newsletter" element={<Newsletter />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/admin/resume" element={<Resume />} />
              <Route path="/admin/seo" element={<AdminPlaceholder title="SEO Settings" description="Manage search engine metadata and portfolio discoverability." />} />
              <Route path="/admin/settings" element={<WebsiteSettings />} />
              <Route path="/admin/backups" element={<AdminPlaceholder title="Backups" description="Manage portfolio data backup and restore options." />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Unknown Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
