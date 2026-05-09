import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * Custom hook for authentication operations
 * Provides user state and auth methods
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    initialize,
    clearError,
    hasRole,
    hasAnyRole,
    isAuthenticated,
  } = useAuthStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle logout and redirect
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Check access based on roles
  const checkAccess = (allowedRoles) => {
    if (!isAuthenticated()) return false;
    return allowedRoles.includes(user?.role);
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    logout: handleLogout,
    clearError,
    hasRole,
    hasAnyRole,
    checkAccess,
  };
};
