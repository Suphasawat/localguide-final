import axios from "axios";
import { authAxios } from "./auth.service";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

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
  Language: { ID: number; Name: string }[];
  Price: number;
  Rating: number;
  Available: boolean;
  District: string;
  City: string;
  Province: string;
  TouristAttraction: { ID: number; Name: string }[];
  Certification?: { ID: number; ImagePath: string; Description: string }[];
}

export const getGuides = async (): Promise<Guide[]> => {
  try {
    const response = await axios.get(`${API_URL}/guides`);
    return Array.isArray(response.data.guides) ? response.data.guides : [];
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
