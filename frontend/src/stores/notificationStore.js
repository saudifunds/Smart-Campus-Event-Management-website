import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],

  // Add notification
  addNotification: (notification) => {
    const id = Date.now();
    const notif = {
      id,
      duration: 6000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, notif],
    }));

    if (notif.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notif.duration);
    }

    return id;
  },

  // Remove notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // Success notification
  success: (message, duration = 6000) => {
    return useNotificationStore.getState().addNotification({
      type: "success",
      message,
      duration,
    });
  },

  // Error notification
  error: (message, duration = 6000) => {
    return useNotificationStore.getState().addNotification({
      type: "error",
      message,
      duration,
    });
  },

  // Warning notification
  warning: (message, duration = 6000) => {
    return useNotificationStore.getState().addNotification({
      type: "warning",
      message,
      duration,
    });
  },

  // Info notification
  info: (message, duration = 6000) => {
    return useNotificationStore.getState().addNotification({
      type: "info",
      message,
      duration,
    });
  },

  // Clear all notifications
  clearAll: () => set({ notifications: [] }),
}));
