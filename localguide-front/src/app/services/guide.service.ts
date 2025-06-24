import axios from "axios";
import { authAxios } from "./auth.service";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

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
  availability: boolean;
  district: string;
  city: string;
  province: string;
  touristAttractions: { id: number; name: string }[];
  status: string;
}

export const getGuides = async (): Promise<Guide[]> => {
  try {
    const response = await axios.get(`${API_URL}/guides`);
    return response.data;
  } catch (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
};

export const getGuideById = async (id: number): Promise<Guide | null> => {
  try {
    const response = await axios.get(`${API_URL}/guides/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching guide by ID:", error);
    return null;
  }
};
