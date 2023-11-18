import { SignInSchema, SignUpSchema } from "@/validations";
import axiosClient from "../axios";
import { ApiResponse } from "@/typing/api";

export async function signin(data: SignInSchema): Promise<ApiResponse<User>> {
  try {
    const res = await axiosClient.post<ApiResponse<User>>(
      "/api/auth/signin",
      data
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
export async function signup(data: SignUpSchema): Promise<ApiResponse<User>> {
  try {
    const res = await axiosClient.post<ApiResponse<User>>("/api/auth/signup", {
      ...data,
      location: {
        lat: 22322.23323232,
        lng: 3232.3232323,
      },
    });
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
