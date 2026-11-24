import { createContext, useContext, useEffect, useState } from "react";

import {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} from "../features/auth/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing admin session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentAdmin();

        setAdmin(response.admin || response.data?.admin || null);
      } catch (error) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    const response = await loginAdmin(credentials);

    const adminData = response.admin || response.data?.admin;

    if (adminData) {
      setAdmin(adminData);
    }

    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated: Boolean(admin),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
