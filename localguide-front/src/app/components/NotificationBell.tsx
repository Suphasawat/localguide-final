"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotificationSystem } from "../contexts/NotificationSystemContext";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationSystem();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "offer_accepted":
        return "✅";
      case "new_offer":
        return "📩";
      case "booking_confirmed":
        return "🎉";
      case "payment_received":
        return "💰";
      case "trip_started":
        return "🚀";
      case "trip_completed":
        return "🏁";
      case "review_received":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const getRelatedLink = (notification: any) => {
    if (!notification.RelatedType || !notification.RelatedID) return "#";

    switch (notification.RelatedType) {
      case "trip_offer":
        return `/guide/my-offers`;
      case "trip_booking":
        return `/trip-bookings/${notification.RelatedID}`;
      case "trip_require":
        return `/user/trip-requires/${notification.RelatedID}`;
      default:
        return "#";
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.IsRead) {
      await markAsRead(notification.ID);
    }
    setIsOpen(false);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="mt-2 text-sm">กำลังโหลด...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-5xl mb-3">🔔</div>
                <p className="text-sm">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <Link
                  key={notification.ID}
                  href={getRelatedLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.IsRead ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.Type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          !notification.IsRead
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.Title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.Message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.CreatedAt).toLocaleString(
                          "th-TH",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    {!notification.IsRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium block text-center"
              >
                ดูทั้งหมด ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
