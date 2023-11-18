"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../lib/db"));
const router_1 = require("../../lib/router");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const channelsRouter = express_1.default.Router();
const EARTH_RADIUS = 6371;
function calculateLatLngDistance(lat1, lng1, lat2, lng2) {
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c; // Distance in kilometers
    return distance;
}
/* Radius in kilometers */
const CHANNELS_FILTER_RADIUS = 20;
/* Get channels list nearby to user location.*/
channelsRouter.get("/", (0, router_1.createExpressHandler)({
    requireAuth: true,
    validate: {
        query: zod_1.z.object({
            lat: zod_1.z.string().transform((value) => Number(value)),
            lng: zod_1.z.string().transform((value) => Number(value)),
        }),
    },
    handler: async ({ authUser, query }) => {
        const centerLatitude = 40.7128;
        const centerLongitude = -74.006;
        const channels = await db_1.default.channel.findMany({
            where: {
                adminId: { not: authUser.id },
                location: {
                    AND: [
                        {
                            lat: {
                                gte: centerLatitude - CHANNELS_FILTER_RADIUS / 111,
                                lte: centerLatitude + CHANNELS_FILTER_RADIUS / 111,
                            },
                        },
                        {
                            lng: {
                                gte: centerLongitude -
                                    CHANNELS_FILTER_RADIUS /
                                        (111 * Math.cos(centerLatitude * (Math.PI / 180))),
                                lte: centerLongitude +
                                    CHANNELS_FILTER_RADIUS /
                                        (111 * Math.cos(centerLatitude * (Math.PI / 180))),
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
        //     centerLatitude,
        //     centerLongitude,
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
}));
/* Get channel by id */
channelsRouter.get("/:id", (0, router_1.createExpressHandler)({
    validate: {
        params: zod_1.z.object({
            id: zod_1.z.string(),
        }),
    },
    requireAuth: true,
    handler: async ({ params }) => {
        const channel = await db_1.default.channel.findFirst({
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
}));
/* Get messages by channel id */
channelsRouter.get("/:channel/messages", (0, router_1.createExpressHandler)({
    requireAuth: true,
    validate: {
        params: zod_1.z.object({
            channel: zod_1.z.string(),
        }),
    },
    handler: async ({ params }) => {
        const messages = await db_1.default.message.findMany({
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
}));
channelsRouter.post("/", (0, router_1.createExpressHandler)({
    validate: {
        /* Request body schema */
        body: zod_1.z.object({
            name: zod_1.z.string(),
            location: zod_1.z.object({
                lat: zod_1.z.number(),
                lng: zod_1.z.number(),
            }),
        }),
    },
    requireAuth: true,
    handler: async ({ authUser, body }) => {
        let channel;
        try {
            channel = await db_1.default.channel.create({
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
        }
        catch (e) {
            channel = undefined;
            /* If error is thrown by `Prisma` */
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
}));
exports.default = channelsRouter;
