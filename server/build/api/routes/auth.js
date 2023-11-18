"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("../../utils/bcrypt"));
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../../lib/db"));
const router_1 = require("../../lib/router");
const utils_1 = require("../../utils");
const jwt_1 = __importDefault(require("../../utils/jwt"));
const authRouter = express_1.default.Router();
authRouter.post("/signup", (0, router_1.createExpressHandler)({
    validate: {
        /* Request body schema */
        body: zod_1.z.object({
            name: zod_1.z.string(),
            username: zod_1.z.string(),
            password: zod_1.z.string(),
            location: zod_1.z.object({
                lat: zod_1.z.number(),
                lng: zod_1.z.number(),
            }),
        }),
    },
    handler: async ({ body }) => {
        /* Hash password with `bcryptjs` */
        const hashedPasswod = await bcrypt_1.default.hashPassword(body.password);
        if (!hashedPasswod) {
            return {
                succeed: false,
                reason: "INTERNAL_SERVER_ERROR",
            };
        }
        let user;
        try {
            user = await db_1.default.user.create({
                data: {
                    name: body.name,
                    username: body.username,
                    password: hashedPasswod,
                    // location: {
                    //   /* Use existing one if location exist with same lat & lang, Otherwise create new one */
                    //   connectOrCreate: {
                    //     where: {
                    //       lat: body.location.lat,
                    //       lng: body.location.lng,
                    //     },
                    //     create: {
                    //       lng: body.location.lng,
                    //       lat: body.location.lat,
                    //     },
                    //   },
                    // },
                },
                /* Select only fields that needs to be sent in response */
                select: {
                    name: true,
                    username: true,
                    id: true,
                },
            });
        }
        catch (e) {
            user = undefined;
            /* If error is thrown by `Prisma` */
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    /* If user already exist with given `username` */
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
        /* If user is `null` | `undefinced`, it can be because of `duplicate error` or any other issue */
        if (!user) {
            return {
                succeed: false,
                reason: "INTERNAL_SERVER_ERROR",
            };
        }
        const accessToken = await jwt_1.default.generateToken({ userId: user.id });
        if (!accessToken) {
            return {
                succeed: false,
                reason: "INTERNAL_SERVER_ERROR",
            };
        }
        /* Succeed! User is created successfully. */
        return {
            succeed: true,
            data: Object.assign(Object.assign({}, user), { accessToken: accessToken }),
            cookie: {
                name: "accessToken",
                value: accessToken,
            },
        };
    },
}));
authRouter.post("/signin", (0, router_1.createExpressHandler)({
    validate: {
        /* Request body schema */
        body: zod_1.z.object({
            username: zod_1.z.string(),
            password: zod_1.z.string(),
        }),
    },
    handler: async ({ body }) => {
        /* Get user by `username` */
        const user = await db_1.default.user.findFirst({
            where: {
                username: body.username,
            },
            select: {
                name: true,
                username: true,
                id: true,
                password: true,
            },
        });
        /* User not found in database */
        if (!user) {
            return {
                succeed: false,
                reason: "NOT_FOUND",
            };
        }
        /* Compare password with `user` hashed password */
        const passwordMatch = await bcrypt_1.default.comparePassword(body.password, user.password);
        /* If password not matched */
        if (!passwordMatch) {
            return {
                succeed: false,
                reason: "WRONG_PASSWORD",
            };
        }
        const accessToken = await jwt_1.default.generateToken({ userId: user.id });
        if (!accessToken) {
            return {
                succeed: false,
                reason: "INTERNAL_SERVER_ERROR",
            };
        }
        /* Succeed! User is signed in successfully. */
        return {
            succeed: true,
            data: (0, utils_1.excludeObjectField)(user, ["password"]),
            cookie: {
                name: "accessToken",
                value: accessToken,
            },
        };
    },
}));
exports.default = authRouter;
