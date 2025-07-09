import { authAxios } from "./auth.service";

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

export interface Verification {
  id: number;
  guide: Guide;
  status: string;
  submittedAt: string;
  documents: string[];
}

export const adminService = {
  // ดึงข้อมูลไกด์ทั้งหมด
  async getAllGuides(): Promise<Guide[]> {
    try {
      const { data } = await authAxios.get("/admin/guides");
      return data;
    } catch (error) {
      console.error("Error fetching guides:", error);
      return [];
    }
  },

  // ดึงข้อมูลการยืนยันตัวตนที่รอการอนุมัติ
  async getPendingVerifications(): Promise<Verification[]> {
    try {
      const { data } = await authAxios.get("/admin/verifications");
      return data;
    } catch (error) {
      console.error("Error fetching verifications:", error);
      return [];
    }
  },

  // อนุมัติหรือปฏิเสธการยืนยันตัวตน
  async updateVerificationStatus(
    id: number,
    status: "approved" | "rejected"
  ): Promise<boolean> {
    try {
      await authAxios.put(`/admin/verifications/${id}/status`, { status });
      return true;
    } catch (error) {
      console.error("Error updating verification status:", error);
      return false;
    }
  },
};
