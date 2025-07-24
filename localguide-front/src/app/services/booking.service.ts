import axios from "axios";
import { getCookie } from "cookies-next";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

export interface Booking {
  ID: number;
  UserID: number;
  GuideID: number;
  StartDate: string;
  EndDate?: string;
  Days?: number;
  TotalPrice?: number;
  BookingDate?: string;
  Status: string;
  Note: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Guide: {
    ID: number;
    User: {
      FirstName: string;
      LastName: string;
      Nickname?: string;
      Avatar?: string;
    };
    Price: number;
    Province?: string;
    City?: string;
  };
}

export interface Review {
  ID: number;
  Rating: number;
  Comment: string;
  User: {
    FirstName: string;
    LastName: string;
  };
  CreatedAt: string;
}

export interface UnavailableDate {
  ID: number;
  Date: string;
  Reason: string;
}

export interface CreateBookingData {
  guideID: number;
  startDate: string;
  endDate: string;
  note?: string;
}

const createAxiosInstance = () => {
  const token = getCookie("token") as string;
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const bookingService = {
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const api = createAxiosInstance();
    try {
      const response = await api.post("/bookings", data);
      return response.data.booking;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการจอง");
    }
  },

  async getUserBookings(): Promise<Booking[]> {
    const api = createAxiosInstance();
    try {
      const response = await api.get("/bookings/my");
      return Array.isArray(response.data.bookings) ? response.data.bookings : [];
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  },

  async cancelBooking(bookingId: number): Promise<void> {
    const api = createAxiosInstance();
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยกเลิกการจอง");
    }
  },

  async getUnavailableDates(guideId: number): Promise<string[]> {
    try {
      const response = await axios.get(
        `${API_URL}/guides/${guideId}/unavailable`
      );
      return Array.isArray(response.data.dates) ? response.data.dates : [];
    } catch (error) {
      console.error("Error fetching unavailable dates:", error);
      return [];
    }
  },

  async getGuideReviews(guideId: number): Promise<Review[]> {
    try {
      const response = await axios.get(`${API_URL}/guides/${guideId}/reviews`);
      return Array.isArray(response.data.reviews) ? response.data.reviews : [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },
};
