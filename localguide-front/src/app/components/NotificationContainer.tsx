"use client";

import { useNotification } from "../contexts/NotificationContext";
import type { NotificationType } from "../contexts/NotificationContext";

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-xl border px-4 py-3 shadow-lg animate-slide-in-right ${getNotificationStyles(
            notification.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl font-bold flex-shrink-0">
              {getIcon(notification.type)}
            </span>
            <p className="text-sm font-medium flex-1">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Close notification"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
