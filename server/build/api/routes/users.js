"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../lib/db"));
const router_1 = require("../../lib/router");
const usersRouter = express_1.default.Router();
usersRouter.get("/me", (0, router_1.createExpressHandler)({
    requireAuth: true,
    handler: ({ authUser }) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db_1.default.user.findFirst({
            where: {
                id: authUser.id,
            },
            select: {
                location: true,
                password: true,
                messages: true,
                name: true,
                username: true,
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
    }),
}));
exports.default = usersRouter;
