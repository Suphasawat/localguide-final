import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token from cookie
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post("/register", data),
  login: (data: any) => api.post("/login", data),
  forgotPassword: (data: any) => api.post("/auth/forgot-password", data),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
  me: () => api.get("/me"),
};

// Province API
export const provinceAPI = {
  getAll: () => api.get("/provinces"),
  getAttractions: (id: number) => api.get(`/provinces/${id}/attractions`),
};

// Language API
export const languageAPI = {
  getAll: () => api.get("/languages"),
};

// Tourist Attraction API
export const attractionAPI = {
  getAll: (provinceId?: number) =>
    api.get(`/attractions${provinceId ? `?province_id=${provinceId}` : ""}`),
};

// Guide API
export const guideAPI = {
  getAll: () => api.get("/guides"),
  getById: (id: number) => api.get(`/guides/${id}`),
  create: (data: any) => api.post("/guides", data),
};

// TripRequire API
export const tripRequireAPI = {
  create: (data: any) => api.post("/trip-requires", data),
  getOwn: () => api.get("/trip-requires"),
  getById: (id: number) => api.get(`/trip-requires/${id}`),
  update: (id: number, data: any) => api.put(`/trip-requires/${id}`, data),
  delete: (id: number) => api.delete(`/trip-requires/${id}`),
  browse: () => api.get("/browse/trip-requires"),
};

// TripOffer API
export const tripOfferAPI = {
  create: (data: any) => api.post("/trip-offers", data),
  getOwn: () => api.get("/trip-offers"), // ดึง offers ของ guide เอง
  getByRequire: (requireId: number) =>
    api.get(`/trip-requires/${requireId}/offers`),
  getById: (id: number) => api.get(`/trip-offers/${id}`),
  update: (id: number, data: any) => api.put(`/trip-offers/${id}`, data),
  delete: (id: number) => api.delete(`/trip-offers/${id}`),
  accept: (id: number) => api.put(`/trip-offers/${id}/accept`),
  reject: (id: number, data?: { reason?: string }) =>
    api.put(`/trip-offers/${id}/reject`, data || {}),
};

// TripBooking API
export const tripBookingAPI = {
  getAll: () => api.get("/trip-bookings"),
  getById: (id: number) => api.get(`/trip-bookings/${id}`),
  createPayment: (id: number) => api.post(`/trip-bookings/${id}/payment`),
  confirmPayment: (id: number, data: any) =>
    api.post(`/trip-bookings/${id}/payment/confirm`, data),
  getPayment: (id: number) => api.get(`/trip-bookings/${id}/payment`),
  confirmGuideArrival: (id: number) =>
    api.put(`/trip-bookings/${id}/confirm-guide-arrival`),
  confirmTripComplete: (id: number) =>
    api.put(`/trip-bookings/${id}/confirm-trip-complete`),
  reportUserNoShow: (id: number, data: any) =>
    api.put(`/trip-bookings/${id}/report-user-no-show`, data),
  confirmUserNoShow: (id: number) =>
    api.put(`/trip-bookings/${id}/confirm-user-no-show`),
  reportGuideNoShow: (id: number, data: any) =>
    api.put(`/trip-bookings/${id}/report-guide-no-show`, data),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.put("/users/profile", data),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
};

// Review API
export const reviewAPI = {
  create: (data: any) => api.post("/reviews", data),
  getGuideReviews: (guideId: number) => api.get(`/guides/${guideId}/reviews`),
  getMyReviews: () => api.get("/my-reviews"),
  update: (id: number, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
  respond: (id: number, response: string) =>
    api.post(`/reviews/${id}/response`, { response }),
  markHelpful: (id: number) => api.post(`/reviews/${id}/helpful`),
  getReviewableBookings: () => api.get("/trip-bookings/reviewable"),
};

export default api;
