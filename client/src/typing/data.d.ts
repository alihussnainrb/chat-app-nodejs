type ILocation = {
  lat: number;
  lng: number;
};

type SessionUser = User & {
  accessToken: string;
};
type User = {
  id: string;
  name: string;
  username: string;
  location?: Location;
};

type Channel = {
  id: string;
  name: string;
  admin?: User;
  hasNewMessages?: boolean;
};

type Message = {
  id: string;
  body: string;
  sender: User;
  channel?: Channel;
  timestamp: Date;
};
