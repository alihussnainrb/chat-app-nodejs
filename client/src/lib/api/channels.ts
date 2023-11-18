import { AddChannelSchema } from "@/validations/channel.z";
import axiosClient from "../axios";
import { ApiResponse } from "@/typing/api";

export async function create(
  data: AddChannelSchema,
  location: ILocation
): Promise<ApiResponse<Channel>> {
  try {
    const res = await axiosClient.post<ApiResponse<Channel>>("/api/channels", {
      ...data,
      location: location,
    });
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
export async function getMyChannels(): Promise<ApiResponse<Channel[]>> {
  try {
    const res = await axiosClient.get<ApiResponse<Channel[]>>(
      "/api/users/me/channels"
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
export async function getNearbyChannels(
  location: ILocation
): Promise<ApiResponse<Channel[]>> {
  try {
    const res = await axiosClient.get<ApiResponse<Channel[]>>("/api/channels", {
      params: location,
    });
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}

export async function getById(id: string): Promise<ApiResponse<Channel>> {
  try {
    const res = await axiosClient.get<ApiResponse<Channel>>(
      `/api/channels/${id}`
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
