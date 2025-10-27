"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useNotificationSystem } from "../contexts/NotificationSystemContext";
import type { SystemNotification } from "../contexts/NotificationSystemContext";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationSystem();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.IsRead)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "offer_accepted":
        return { icon: "✅", color: "bg-emerald-100 text-emerald-700" };
      case "new_offer":
        return { icon: "📩", color: "bg-blue-100 text-blue-700" };
      case "booking_confirmed":
        return { icon: "🎉", color: "bg-purple-100 text-purple-700" };
      case "payment_received":
        return { icon: "💰", color: "bg-green-100 text-green-700" };
      case "trip_started":
        return { icon: "🚀", color: "bg-indigo-100 text-indigo-700" };
      case "trip_completed":
        return { icon: "🏁", color: "bg-gray-100 text-gray-700" };
      case "review_received":
        return { icon: "⭐", color: "bg-yellow-100 text-yellow-700" };
      default:
        return { icon: "🔔", color: "bg-gray-100 text-gray-700" };
    }
  };

  const getRelatedLink = (notification: SystemNotification) => {
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

  const handleNotificationClick = async (notification: SystemNotification) => {
    if (!notification.IsRead) {
      await markAsRead(notification.ID);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("ต้องการลบการแจ้งเตือนนี้?")) {
      await deleteNotification(id);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดการแจ้งเตือน...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  การแจ้งเตือน
                </h1>
                <p className="mt-2 text-gray-600">
                  ดูการแจ้งเตือนทั้งหมดของคุณ
                  {unreadCount > 0 && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      ({unreadCount} ใหม่)
                    </span>
                  )}
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-50 transition-all font-medium shadow-sm"
              >
                <span>←</span>
                <span>กลับไป Dashboard</span>
              </Link>
            </div>

            {/* Filter & Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ทั้งหมด ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === "unread"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ยังไม่ได้อ่าน ({unreadCount})
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "unread"
                  ? "ไม่มีการแจ้งเตือนใหม่"
                  : "ไม่มีการแจ้งเตือน"}
              </h3>
              <p className="text-gray-600 text-sm">
                {filter === "unread"
                  ? "คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว"
                  : "คุณจะได้รับการแจ้งเตือนเมื่อมีกิจกรรมที่สำคัญ"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const { icon, color } = getNotificationIcon(notification.Type);
                return (
                  <Link
                    key={notification.ID}
                    href={getRelatedLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block rounded-2xl border transition-all hover:shadow-md ${
                      !notification.IsRead
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-200 hover:border-emerald-200"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full ${color} flex items-center justify-center text-2xl`}
                        >
                          {icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3
                                className={`text-base font-semibold ${
                                  !notification.IsRead
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.Title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.Message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(
                                  notification.CreatedAt
                                ).toLocaleString("th-TH", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!notification.IsRead && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              )}
                              <button
                                onClick={(e) =>
                                  handleDelete(e, notification.ID)
                                }
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="ลบ"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
