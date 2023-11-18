import { redirect } from "next/navigation";
import ChatView from "./ChatView";
import apiClient from "@/lib/api";

export default async function Page({
  params,
}: {
  params: { channel: string };
}) {
  const { data: channel } = await apiClient.channels.getById(params.channel);

  if (!channel) return redirect("/");

  return <ChatView channel={channel} />;
}
