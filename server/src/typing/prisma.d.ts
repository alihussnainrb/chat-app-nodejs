import { Channel, Location, Message, User } from "@prisma/client";

export type IMessage = Message & {
  sender?: IUser;
  channel?: IChannel;
};

export type IChannel = Channel & {
  members?: IUser;
  messages?: Message[];
  location?: Location;
};
export type IUser = User & {
  location?: Location;
  channels?: IChannel[];
  messages?: Message[];
};
