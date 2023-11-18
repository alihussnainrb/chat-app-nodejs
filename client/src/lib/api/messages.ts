import axiosClient from "../axios";
import { ApiResponse } from "@/typing/api";

export async function getChannelMessages(
  channel: string
): Promise<ApiResponse<Message[]>> {
  try {
    const res = await axiosClient.get<ApiResponse<Message[]>>(
      `/api/channels/${channel}/messages`
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}
