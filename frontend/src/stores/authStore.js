import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../utils/axiosConfig";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Login user
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/login", {
            email,
            password,
          });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          return response;
        } catch (err) {
          set({
            error: err.message || "Login failed",
            isLoading: false,
          });
          throw err;
        }
      },

      // Register user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/register", userData);
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          return response;
        } catch (err) {
          set({
            error: err.message || "Registration failed",
            isLoading: false,
          });
          throw err;
        }
      },

      // Logout user
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          set({ user: null, token: null });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },

      // Initialize auth from localStorage
      initialize: () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user) {
          set({ token, user: JSON.parse(user) });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user has any of the roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return user && roles.includes(user.role);
      },

      // Check if authenticated
      isAuthenticated: () => {
        return get().token !== null;
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
