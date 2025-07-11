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
  ID: number;
  User: {
    ID: number;
    FirstName: string;
    LastName: string;
    Nickname: string;
    Avatar: string;
  };
  Bio: string;
  Description: string;
  Certification: { ID: number; ImagePath: string; Description: string }[];
  Available: boolean;
  Language: { ID: number; Name: string }[];
  Price: number;
  Rating: number;
  District: string;
  City: string;
  Province: string;
  TouristAttraction: { ID: number; Name: string }[];
}

export const adminService = {
  // ดึงข้อมูลไกด์ทั้งหมด
  async getAllGuides(token: string): Promise<Guide[]> {
    const api = createAxiosInstance(token);
    try {
      const { data } = await api.get("/guides");
      return Array.isArray(data.guides) ? data.guides : [];
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
