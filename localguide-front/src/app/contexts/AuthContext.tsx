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
      const response = await authAPI.login(data);
      // Backend returns { token, user } which axios wraps in { data: { token, user } }
      const token = response.data?.token;
      const userData = response.data?.user;

      if (token && userData) {
        Cookies.set("token", token, { expires: 7 });
        // Set user with proper role mapping
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role, // This is the RoleID from backend
          FirstName: userData.FirstName || userData.firstName,
          LastName: userData.LastName || userData.lastName,
          Phone: userData.Phone || userData.phone,
          Nationality: userData.Nationality || userData.nationality,
          Sex: userData.Sex || userData.sex,
          Avatar: userData.Avatar || userData.avatar,
        });
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await authAPI.register(data);
      return true;
    } catch (error) {
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
    // Consider token during loading to avoid flicker redirects
    isAuthenticated: !!user || !!Cookies.get("token"),
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
