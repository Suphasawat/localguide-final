import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

export interface User {
  ID: number;
  FirstName: string;
  LastName: string;
  Nickname: string;
  BirthDate: string;
  Nationality: string;
  Phone: string;
  Sex: string;
  Avatar: string;
}

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_URL}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to fetch user");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
