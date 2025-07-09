import { authAxios } from "./auth.service";

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
    const response = await authAxios.get<User>(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response?.data?.error || "Failed to fetch user");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const editUser = async (
  id: number,
  data: Partial<User>
): Promise<User> => {
  try {
    const response = await authAxios.put<User>(`/users/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response?.data?.error || "Failed to edit user");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
