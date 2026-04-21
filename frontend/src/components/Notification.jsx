import React, { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";

/**
 * Notification/Toast component
 */
const NotificationItem = ({ notification, onRemove }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(
        () => onRemove(notification.id),
        notification.duration,
      );
      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`${bgColors[notification.type]} border rounded-lg p-4 mb-3 flex justify-between items-center animate-slideIn`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{icons[notification.type]}</span>
        <p className={textColors[notification.type]}>{notification.message}</p>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Notification container component
 */
export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};
