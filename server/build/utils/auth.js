"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthUser = exports.registerAuthMiddleware = void 0;
const jwt_1 = __importDefault(require("./jwt"));
const db_1 = __importDefault(require("../lib/db"));
function registerAuthMiddleware() {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization || req.cookies["accessToken"];
            if (!token)
                return next();
            const decoded = await jwt_1.default.verifyToken(token);
            if (!decoded)
                return next();
            const user = await db_1.default.user.findFirst({ where: { id: decoded.userId } });
            req.authUser = user;
            return next();
        }
        catch (error) {
            return next();
        }
    };
}
exports.registerAuthMiddleware = registerAuthMiddleware;
async function getAuthUser(token) {
    try {
        const decoded = await jwt_1.default.verifyToken(token);
        if (!decoded)
            return null;
        const user = await db_1.default.user.findFirst({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                username: true,
            },
        });
        return user;
    }
    catch (error) {
        return null;
    }
}
exports.getAuthUser = getAuthUser;
