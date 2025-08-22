"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { User, LoginData, RegisterData, LoginResponse } from "../types";
import { authAPI } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via cookie
    const token = Cookies.get("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.me();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      console.log("Attempting login with data:", data);
      const response = await authAPI.login(data);
      console.log("Full login response:", response);
      console.log("Login response data:", response.data);

      // Handle different response structures from backend
      // Backend returns: { token: "...", user: { id: 1, email: "...", role: 1 } }
      let token = response.data?.token || response.data?.Token;
      let userData =
        response.data?.user || response.data?.User || response.data;

      console.log("Extracted token:", token ? "exists" : "missing");
      console.log("Extracted user data:", userData);

      if (token) {
        // Set cookie with secure options
        Cookies.set("token", token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        // If we have user data, set it immediately
        if (userData && (userData.id || userData.ID)) {
          console.log("Setting user data from login response:", userData);
          setUser(userData);
        } else {
          // Otherwise fetch user data separately
          console.log("No user data in login response, fetching separately...");
          await fetchUser();
        }

        console.log("Login successful");
        return true;
      } else {
        console.error("No token found in login response");
        return false;
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      console.error("Error response:", error.response?.data);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await authAPI.register(data);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
