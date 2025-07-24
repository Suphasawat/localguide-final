import axios from "axios";
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: number;
  };
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, data);
    
    if (response.data && response.data.token) {
      // ใช้ cookie แทน localStorage
      setCookie("token", response.data.token, {
        httpOnly: false, // ตั้งเป็น false เพื่อให้ client-side เข้าถึงได้
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 วัน
      });
      setCookie("user", JSON.stringify(response.data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Login failed");
    }
    throw new Error("Network error occurred");
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
    
    if (response.data && response.data.token) {
      setCookie("token", response.data.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      setCookie("user", JSON.stringify(response.data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Registration failed");
    }
    throw new Error("Network error occurred");
  }
};

export const logout = (): void => {
  deleteCookie("token");
  deleteCookie("user");
};

export const getToken = (): string | null => {
  return getCookie("token") as string || null;
};

export const getUser = (): any => {
  const user = getCookie("user") as string;
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Create axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the JWT token
authAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
