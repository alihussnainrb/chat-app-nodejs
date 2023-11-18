import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  withCredentials: true,
});

const isServer = typeof window === "undefined";

axiosClient.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import("next/headers");
    config.headers["Authorization"] = cookies().get("accessToken")?.value;
    config.headers["Cookie"] = cookies().toString();
  }
  return config;
});

export default axiosClient;
