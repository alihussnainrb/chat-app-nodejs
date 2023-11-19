import express from "express";
import db from "@/lib/db";
import { createExpressHandler } from "@/lib/router";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const channelsRouter = express.Router();

// const EARTH_RADIUS = 6371 as const;

// function calculateLatLngDistance(
//   lat1: number,
//   lng1: number,
//   lat2: number,
//   lng2: number
// ) {
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLng = (lng2 - lng1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = EARTH_RADIUS * c; // Distance in kilometers
//   return distance;
// }

/* Radius in kilometers */
const CHANNELS_FILTER_RADIUS = 20 as const;

/* Get channels list nearby to user location.*/
channelsRouter.get(
  "/",
  createExpressHandler({
    requireAuth: true,
    validate: {
      query: z.object({
        lat: z.string().transform((value) => Number(value)),
        lng: z.string().transform((value) => Number(value)),
      }),
    },
    handler: async ({ authUser, query }) => {
      const targetLatitude = query.lat;
      const targetLongitude = query.lng;
      const channels = await db.channel.findMany({
        where: {
          adminId: { not: authUser.id },
          location: {
            AND: [
              {
                lat: {
                  gte: targetLatitude - CHANNELS_FILTER_RADIUS / 111,
                  lte: targetLatitude + CHANNELS_FILTER_RADIUS / 111,
                },
              },
              {
                lng: {
                  gte:
                    targetLongitude -
                    CHANNELS_FILTER_RADIUS /
                      (111 * Math.cos(targetLatitude * (Math.PI / 180))),
                  lte:
                    targetLongitude +
                    CHANNELS_FILTER_RADIUS /
                      (111 * Math.cos(targetLatitude * (Math.PI / 180))),
                },
              },
            ],
          },
        },
        include: {
          admin: true,
          location: true,
        },
      });

      // const filteredChannels = channels.filter((channel) => {
      //   const distance = calculateLatLngDistance(
      //     targetLatitude,
      //     targetLongitude,
      //     channel.location.lat,
      //     channel.location.lng
      //   );
      //   return distance <= CHANNELS_FILTER_RADIUS;
      // });

      return {
        succeed: true,
        data: channels,
      };
    },
  })
);

/* Get channel by id */
channelsRouter.get(
  "/:id",
  createExpressHandler({
    validate: {
      params: z.object({
        id: z.string(),
      }),
    },
    requireAuth: true,
    handler: async ({ params }) => {
      const channel = await db.channel.findFirst({
        where: {
          id: params.id,
        },
        include: {
          admin: {
            select: {
              name: true,
              username: true,
              id: true,
            },
          },
          location: true,
        },
      });
      if (!channel) {
        return {
          succeed: false,
          reason: "NOT_FOUND",
        };
      }
      return {
        succeed: true,
        data: channel,
      };
    },
  })
);

/* Get messages by channel id */
channelsRouter.get(
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

channelsRouter.post(
  "/",
  createExpressHandler({
    validate: {
      /* Request body schema */
      body: z.object({
        name: z.string(),
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
    },
    requireAuth: true,
    handler: async ({ authUser, body }) => {
      let channel;
      try {
        channel = await db.channel.create({
          data: {
            name: body.name,
            location: {
              /* Use existing one if location exist with same lat & lang, Otherwise create new one */
              connectOrCreate: {
                where: {
                  lat: body.location.lat,
                  lng: body.location.lng,
                },
                create: {
                  lng: body.location.lng,
                  lat: body.location.lat,
                },
              },
            },
            admin: {
              connect: { id: authUser.id },
            },
          },
          include: {
            admin: true,
            location: true,
          },
        });
      } catch (e) {
        channel = undefined;
        /* If error is thrown by `Prisma` */
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            /* If channel already exist with given `name` */
            return {
              succeed: false,
              reason: "DUPLICATE",
            };
          }
        }
        return {
          succeed: false,
          reason: "INTERNAL_SERVER_ERROR",
        };
      }
      /* If channel is `null` | `undefinced`, it can be because of `duplicate error` or any other issue */
      if (!channel) {
        return {
          succeed: false,
          reason: "INTERNAL_SERVER_ERROR",
        };
      }
      /* Succeed! channel is created successfully. */
      return {
        succeed: true,
        data: channel,
      };
    },
  })
);

export default channelsRouter;
