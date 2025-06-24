import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/admin`;

// สร้าง axios instance ที่มีการกำหนดค่าเริ่มต้น
const createAxiosInstance = (token: string) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export interface Guide {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    nickname: string;
    avatar: string;
  };
  bio: string;
  experience: string;
  languages: { id: number; name: string }[];
  price: number;
  rating: number;
  averageReview: number;
  availability: boolean;
  district: string;
  city: string;
  province: string;
  touristAttractions: { id: number; name: string }[];
  status: string;
}

export const adminService = {
  // ดึงข้อมูลไกด์ทั้งหมด
  async getAllGuides(token: string): Promise<Guide[]> {
    const api = createAxiosInstance(token);
    try {
      const { data } = await api.get("/guides");
      return data;
    } catch (error) {
      console.error("Error fetching guides:", error);
      return [];
    }
  },

  // อัพเดทสถานะไกด์
  async updateGuideStatus(
    guideId: number,
    status: string,
    token: string
  ): Promise<boolean> {
    const api = createAxiosInstance(token);
    try {
      await api.put(`/guides/${guideId}/status`, { status });
      return true;
    } catch (error) {
      console.error("Error updating guide status:", error);
      return false;
    }
  },
};
