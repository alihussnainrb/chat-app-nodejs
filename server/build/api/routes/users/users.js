"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const me_1 = __importDefault(require("./me"));
const usersRouter = express_1.default.Router();
usersRouter.use("/me", me_1.default);
exports.default = usersRouter;
