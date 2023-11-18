import { create } from "zustand";

type UseAuthUserStore = {
  authUser?: User | null;
  setAuthUser: (value: User) => void;
};

const useAuthUser = create<UseAuthUserStore>()((setState) => ({
  authUser: null,
  setAuthUser(value) {
    setState({ authUser: value });
  },
}));

export default useAuthUser;
