import express from "express";
import db from "@/lib/db";
import { createExpressHandler } from "@/lib/router";

const usersMeRouter = express.Router();

usersMeRouter.get(
  "/",
  createExpressHandler({
    requireAuth: true,
    handler: async ({ authUser }) => {
      const user = await db.user.findFirst({
        where: {
          id: authUser.id,
        },
        select: {
          name: true,
          username: true,
          id: true,
        },
      });
      if (!user) {
        return {
          succeed: false,
          reason: "NOT_FOUND",
        };
      }
      return {
        succeed: true,
        data: user,
      };
    },
  })
);
usersMeRouter.get(
  "/channels",
  createExpressHandler({
    requireAuth: true,
    handler: async ({ authUser }) => {
      const channels = await db.channel.findMany({
        where: { adminId: authUser.id },
        include: {
          admin: true,
          location: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return {
        succeed: true,
        data: channels,
      };
    },
  })
);

export default usersMeRouter;
