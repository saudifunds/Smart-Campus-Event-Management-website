import { useNotificationStore } from "../stores/notificationStore";

export const useNotification = () => {
  return {
    showSuccess: (message, duration = 6000) =>
      useNotificationStore.getState().success(message, duration),
    showError: (message, duration = 6000) =>
      useNotificationStore.getState().error(message, duration),
    showWarning: (message, duration = 6000) =>
      useNotificationStore.getState().warning(message, duration),
    showInfo: (message, duration = 6000) =>
      useNotificationStore.getState().info(message, duration),
  };
};
