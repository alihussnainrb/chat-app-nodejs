import axiosClient from "../axios";
import { ApiResponse } from "@/typing/api";

export async function getProfile(): Promise<ApiResponse<User>> {
  try {
    const res = await axiosClient.get<ApiResponse<User>>("/api/users/me");
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
