import express from "express";
import db from "@/lib/db";
import { createExpressHandler } from "@/lib/router";
import { z } from "zod";

const messagesRouter = express.Router();

messagesRouter.get(
  "/:channel/messages",
  createExpressHandler({
    requireAuth: true,
    validate: {
      params: z.object({
        channel: z.string(),
      }),
    },
    handler: async ({ params }) => {
      const messages = await db.message.findMany({
        where: {
          channelId: params.channel,
        },
        include: {
          sender: true,
        },
      });
      return {
        succeed: true,
        data: messages,
      };
    },
  })
);

export default messagesRouter;
