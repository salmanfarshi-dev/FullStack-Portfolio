import apiRequest from "../../services/api";

// Admin Login
export const loginAdmin = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });

// Get Current Admin
export const getCurrentAdmin = () => apiRequest("/auth/me");

// Admin Logout
export const logoutAdmin = () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });

// Forgot Password
export const forgotPassword = (email) =>
  apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

// Reset Password
export const resetPassword = (passwordData) =>
  apiRequest("/auth/reset-password", {
    method: "POST",
    body: passwordData,
  });
