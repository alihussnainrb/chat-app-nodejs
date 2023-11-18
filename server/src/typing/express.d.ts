// import { ERequest } from "express";
import { IUser } from "./prisma";

export type SessionUser = Omit<IUser, "password">;

declare module "express-serve-static-core" {
  interface Request {
    authUser?: SessionUser | null;
  }
}
