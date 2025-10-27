"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

export interface SystemNotification {
  ID: number;
  UserID: number;
  Type: string;
  Title: string;
  Message: string;
  RelatedID?: number;
  RelatedType?: string;
  IsRead: boolean;
  CreatedAt: string;
  ReadAt?: string;
}

interface NotificationSystemContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationSystemContext = createContext<
  NotificationSystemContextType | undefined
>(undefined);

export function NotificationSystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.ID === id ? { ...n, IsRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.ID !== id));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.IsRead).length;

  return (
    <NotificationSystemContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationSystemContext.Provider>
  );
}

export function useNotificationSystem() {
  const context = useContext(NotificationSystemContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationSystem must be used within a NotificationSystemProvider"
    );
  }
  return context;
}
