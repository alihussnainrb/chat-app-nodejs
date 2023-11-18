"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../../lib/db"));
const router_1 = require("../../../lib/router");
const usersMeRouter = express_1.default.Router();
usersMeRouter.get("/", (0, router_1.createExpressHandler)({
    requireAuth: true,
    handler: async ({ authUser }) => {
        const user = await db_1.default.user.findFirst({
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
}));
usersMeRouter.get("/channels", (0, router_1.createExpressHandler)({
    requireAuth: true,
    handler: async ({ authUser }) => {
        const channels = await db_1.default.channel.findMany({
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
}));
exports.default = usersMeRouter;
