import * as userApi from "./user";
import * as authApi from "./auth";
import * as channelsApi from "./channels";
import * as messagesApi from "./messages";

const apiClient = {
  user: userApi,
  auth: authApi,
  channels: channelsApi,
  messages: messagesApi,
};

export default apiClient;
