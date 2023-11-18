import { create } from "zustand";

export type ActiveChannel = Channel & {
  members?: number | null;
};

type UseChatStore = {
  myChannels?: Channel[] | null;
  setMyChannels: (value: Channel[] | ((value: Channel[]) => Channel[])) => void;
  nearbyChannels?: Channel[] | null;
  setNearbyChannels: (
    value: Channel[] | ((value: Channel[]) => Channel[])
  ) => void;
  setMessages: (value: Message[] | ((value: Message[]) => Message[])) => void;
  addMessage: (value: Message) => void;
  messages?: Message[] | null;
  setActiveChannel: (
    value: ActiveChannel | ((value: ActiveChannel) => ActiveChannel)
  ) => void;
  activeChannel?: ActiveChannel | null;
  // intitiateChatStore: () => void;
};

const useChatStore = create<UseChatStore>()((setState, getState) => ({
  setMyChannels(value) {
    setState((state) => ({
      ...state,
      myChannels:
        typeof value === "function" ? value(state.myChannels || []) : value,
    }));
  },
  setNearbyChannels(value) {
    setState((state) => ({
      ...state,
      nearbyChannels:
        typeof value === "function" ? value(state.nearbyChannels || []) : value,
    }));
  },
  setMessages(value) {
    setState((state) => ({
      ...state,
      messages:
        typeof value === "function" ? value(state.messages || []) : value,
    }));
  },
  addMessage(message) {
    getState().setMessages((messages) => [...messages, message]);
  },
  setActiveChannel(value) {
    setState((state) => ({
      ...state,
      activeChannel:
        typeof value === "function"
          ? state.activeChannel
            ? value(state.activeChannel)
            : null
          : value,
    }));
  },
  // intitiateChatStore() {
  //   apiClient.channels.getMyChannels().then((res) => {
  //     getState().setMyChannels(res.data || []);
  //   });
  //   apiClient.channels.getNearbyChannels().then((res) => {
  //     getState().setNearbyChannels(res.data || []);
  //   });
  // },
}));

export default useChatStore;
