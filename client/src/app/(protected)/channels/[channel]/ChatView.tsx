"use client";
import { useSocket } from "@/components/socketio";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import apiClient from "@/lib/api";
import useAuthUser from "@/lib/stores/use-auth";
import useChatStore from "@/lib/stores/use-chat";
import { cn } from "@/lib/utils";
import {} from "@radix-ui/react-icons";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { format, isToday, isYesterday } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChatViewProps = {
  channel: Channel;
};

export default function ChatView({ channel }: ChatViewProps) {
  const { authUser } = useAuthUser();
  const { setMyChannels, messages, addMessage, setMessages, setActiveChannel } =
    useChatStore();
  const socket = useSocket();
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket?.emit("join", { channel: channel.id });
    socket?.on("message", (message) => {
      console.log("Message Received ", message);
      if (!message) return;
      addMessage(message);
    });
    socket?.on("user_joined", () => {});
    socket?.on("channel_update", ({ members }: { members?: number | null }) => {
      setActiveChannel((channel) => ({
        ...channel,
        members: members,
      }));
    });
    return () => {
      socket?.emit("leave", { channel: channel.id });
      socket?.off("message");
      socket?.off("channel_update");
      socket?.off("user_joined");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, socket]);

  useEffect(() => {
    setActiveChannel(channel);
    setMessages([]);

    apiClient.messages.getChannelMessages(channel.id).then((res) => {
      setMessages(res.data || []);
    });
    return () => {
      setMessages([]);
    };
  }, [channel, setActiveChannel, setMessages]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const sendMessage = (messageBody: string) => {
    socket?.emit("message", {
      channel: channel.id,
      content: messageBody,
    });
  };

  return (
    <main className="w-full h-screen flex flex-col bg-slate-100">
      <ChatHeader />
      <div
        className={cn(
          "w-full flex-1 max-h-[calc(100vh_-_160px)] overflow-y-auto px-5 py-5",
          "space-y-5"
        )}
      >
        {messages?.map((message) => (
          <MessageItem
            ref={lastMessageRef}
            message={message}
            key={message.id}
            primary={authUser?.id === message.sender.id}
          />
        ))}
      </div>
      <ChatFooter sendMessage={sendMessage} />
    </main>
  );
}

type MessageItemProps = {
  message: Message;
  primary: boolean;
};

function formatMessageTimestamp(timestamp: Date) {
  if (isToday(timestamp)) {
    return `today ${format(timestamp, "hh:mm a")}`;
  } else if (isYesterday(timestamp)) {
    return `yesterday ${format(timestamp, "hh:mm a")}`;
  } else {
    return format(timestamp, "dd-MM-yyyy hh:mm a");
  }
}

const MessageItem = React.forwardRef<HTMLDivElement, MessageItemProps>(
  ({ message, primary }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center w-full flex-col gap-1",
          primary ? "items-end" : "items-start"
        )}
      >
        <p className="text-xs text-slate-600">{message.sender.name}</p>
        <div
          className={cn(
            "w-auto max-w-[70%] rounded-full py-2 px-5",
            primary
              ? "bg-slate-900 text-white rounded-tr-none"
              : "bg-white text-slate-900 rounded-tl-none"
          )}
        >
          <p>{message.body}</p>
        </div>
        <p className="text-xs text-slate-600">
          {formatMessageTimestamp(new Date(message.timestamp))}
        </p>
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";

type ChatInputForm = {
  messageBody: string;
};

type ChatFooterProps = {
  sendMessage: (message: string) => void;
};

function ChatFooter({ sendMessage }: ChatFooterProps) {
  const form = useForm<ChatInputForm>({
    defaultValues: {
      messageBody: "",
    },
  });
  const handleFormSubmit = ({ messageBody }: ChatInputForm) => {
    if (messageBody.trim() === "") return;
    console.log(messageBody);
    sendMessage(messageBody);
    form.reset({
      messageBody: "",
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="flex items-center h-20 gap-5 w-full bg-white px-5 py-2">
          <FormField
            control={form.control}
            name="messageBody"
            rules={{
              required: true,
              minLength: 1,
            }}
            render={({ field }) => (
              <input
                type="text"
                autoComplete="off"
                className="flex-1 h-full w-full bg-transparent outline-none"
                placeholder="Type..."
                {...field}
              />
            )}
          />
          <Button>Send</Button>
        </div>
      </form>
    </Form>
  );
}

function ChatHeader() {
  const { activeChannel } = useChatStore();
  return (
    <div
      className={cn(
        "flex items-center w-full px-5 py-2 transition-colors duration-200 gap-4 focus:outline-none ",
        "bg-white h-20 w-full"
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "text-2xl font-bold text-slate-900 bg-slate-200 p-2",
            "w-[50px] h-[50px] flex items-center justify-center rounded-full"
          )}
        >
          {activeChannel?.name?.charAt(0)}
        </div>
      </div>

      <div className="text-left rtl:text-right">
        <h1 className="text-base font-medium text-gray-700 capitalize dark:text-white">
          {activeChannel?.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activeChannel?.members ? (
            <span className="text-green-500">
              {activeChannel.members} online
            </span>
          ) : (
            `@${activeChannel?.admin?.username}`
          )}
        </p>
      </div>
    </div>
  );
}
