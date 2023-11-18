"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../lib/db"));
const router_1 = require("../../lib/router");
const zod_1 = require("zod");
const messagesRouter = express_1.default.Router();
messagesRouter.get("/:channel/messages", (0, router_1.createExpressHandler)({
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
exports.default = messagesRouter;
