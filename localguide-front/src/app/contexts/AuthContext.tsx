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
      // Handle different response structures from backend
      let token =
        (response as any).data?.token || (response as any).data?.Token;
      let userData =
        (response as any).data?.user ||
        (response as any).data?.User ||
        (response as any).data;

      if (token) {
        Cookies.set("token", token, { expires: 7 });
        if (userData && (userData.id || (userData as any).ID)) {
          setUser(userData as any);
        } else {
          await fetchUser();
        }
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
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
