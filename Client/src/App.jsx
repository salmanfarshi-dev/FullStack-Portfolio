import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";

// Temporary Portfolio Home
const PortfolioHome = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
    <h1 className="text-4xl font-bold">
      SALMAN FARSHI
      <span className="text-[var(--color-primary)]">.</span>
    </h1>
  </div>
);

// Temporary Dashboard Overview
const DashboardOverview = () => (
  <div>
    <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>

    <p className="mt-2 text-sm text-[var(--color-muted)]">
      Your portfolio management workspace.
    </p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Portfolio */}
          <Route path="/" element={<PortfolioHome />} />

          {/* Public Admin Authentication */}
          <Route element={<PublicRoute />}>
            <Route path="/admin/login" element={<Login />} />

            <Route path="/admin/forgot-password" element={<ForgotPassword />} />

            <Route path="/admin/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Private Admin Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardOverview />} />
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
