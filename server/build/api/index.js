"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users/users"));
const channels_1 = __importDefault(require("./routes/channels"));
const apiRouter = express_1.default.Router();
/* Mount Auth Router */
apiRouter.use("/auth", auth_1.default);
/* Mount Users Router */
apiRouter.use("/users", users_1.default);
/* Mount Channels Router */
apiRouter.use("/channels", channels_1.default);
exports.default = apiRouter;
