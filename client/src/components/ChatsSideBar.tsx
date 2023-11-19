"use client";
import useChatStore from "@/lib/stores/use-chat";
import AddChannelForm from "./AddChannelForm";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import useAuthUser from "@/lib/stores/use-auth";
import { useGeolocated } from "react-geolocated";

type Props = {
  className?: string;
};

export default function ChatsSideBar({ className = "" }: Props) {
  const { authUser } = useAuthUser();
  const { coords: locationCoords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });
  const {
    myChannels,
    setMyChannels,
    nearbyChannels,
    setNearbyChannels,
    activeChannel,
  } = useChatStore();

  const loadNearbyChannels = (curLocation: ILocation) => {
    apiClient.channels.getNearbyChannels(curLocation).then((res) => {
      setNearbyChannels(res.data || []);
    });
  };

  useEffect(() => {
    apiClient.channels.getMyChannels().then((res) => {
      setMyChannels(res.data || []);
    });
  }, [setMyChannels]);

  useEffect(() => {
    if (locationCoords) {
      loadNearbyChannels({
        lat: locationCoords.latitude,
        lng: locationCoords.longitude,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationCoords]);

  return (
    <div
      className={
        "h-screen max-h-screen overflow-y-auto border-r-2 border-slate-300" +
        className
      }
    >
      <div className="overflow-y-auto bg-white sm:w-64 w-60 divide-y divide-slate-200">
        <div className="p-4 px-5">
          <h2 className="text-xl font-bold uppercase">Chat App</h2>
        </div>
        <div
          className={cn(
            "flex items-center w-full px-5 py-2 transition-colors duration-200 gap-x-2 focus:outline-none "
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "text-lg font-bold text-slate-900 bg-slate-200 p-2",
                "w-[40px] h-[40px] flex items-center justify-center rounded-full"
              )}
            >
              {authUser?.name?.charAt(0)}
            </div>
          </div>

          <div className="text-left rtl:text-right">
            <h1 className="text-sm font-medium text-gray-700 capitalize dark:text-white">
              {authUser?.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{authUser?.username}
            </p>
          </div>
        </div>
        <div className="py-5">
          <div className="flex items-center justify-between gap-5 px-5">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              My Channels
            </h2>
            <AddChannelForm />
          </div>

          <div className="mt-5 space-y-3">
            {myChannels?.map((channel) => (
              <ChannelItem
                active={activeChannel?.id === channel.id}
                channel={channel}
                key={channel.id}
              />
            ))}
          </div>
        </div>
        <div className="py-5">
          <div className="flex items-center justify-between gap-5 px-5">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              Nearby Channels
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {nearbyChannels?.map((channel) => (
              <ChannelItem
                active={activeChannel?.id === channel.id}
                channel={channel}
                key={channel.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ChannelItemProps = {
  channel: Channel;
  active?: boolean;
};

function ChannelItem({ channel, active }: ChannelItemProps) {
  //{bg-gray-100 dark:bg-gray-800 active}

  return (
    <Link
      href={`/channels/${channel.id}`}
      className={
        "flex items-center w-full px-5 py-2 transition-colors duration-200 gap-x-2 focus:outline-none " +
        (active
          ? "bg-gray-100 dark:bg-gray-800"
          : "hover:bg-gray-100 dark:hover:bg-gray-800")
      }
    >
      <div className="relative">
        <div
          className={cn(
            "text-lg font-bold text-slate-900 bg-slate-200 p-2",
            "w-[40px] h-[40px] flex items-center justify-center rounded-full"
          )}
        >
          {channel?.name?.charAt(0)}
        </div>
        {channel.hasNewMessages && (
          <span className="h-2 w-2 rounded-full bg-emerald-500 absolute right-0.5 ring-1 ring-white bottom-0" />
        )}
      </div>

      <div className="text-left rtl:text-right">
        <h1 className="text-sm font-medium text-gray-700 capitalize dark:text-white">
          {channel.name}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          @{channel.admin?.username}
        </p>
      </div>
    </Link>
  );
}
