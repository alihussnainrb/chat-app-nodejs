"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const api_1 = __importDefault(require("./api"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./utils/auth");
const db_1 = __importDefault(require("./lib/db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cookie_1 = require("cookie");
const next_1 = __importDefault(require("next"));
const url_1 = __importDefault(require("url"));
/* Setup client app */
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
let clientApp;
if (!dev) {
    clientApp = (0, next_1.default)({
        dev: false,
        hostname,
        port,
        dir: "../client/",
    });
}
function startServer() {
    const clientAppHandler = clientApp === null || clientApp === void 0 ? void 0 : clientApp.getRequestHandler();
    /* Server intitialization basic middlewares declaration */
    const app = (0, express_1.default)();
    const server = (0, http_1.createServer)(app);
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({ origin: "http://localhost:4000", credentials: true }));
    app.use((0, auth_1.registerAuthMiddleware)());
    app.use(express_1.default.urlencoded({ extended: false }));
    /* Socket IO Intialization */
    const sioServer = new socket_io_1.Server(server, {
        cors: { origin: "http://localhost:4000", credentials: true },
    });
    /* Socket IO Middleware to extract accessToken */
    sioServer.use(async (socket, next) => {
        let cookies;
        if (socket.handshake.headers.cookie) {
            cookies = (0, cookie_1.parse)(socket.handshake.headers.cookie);
        }
        const accessToken = (cookies === null || cookies === void 0 ? void 0 : cookies.accessToken) ||
            socket.handshake.headers.authorization ||
            socket.handshake.auth.token;
        if (accessToken) {
            const user = await (0, auth_1.getAuthUser)(accessToken);
            socket.user = user;
            if (user)
                return next();
        }
        next(new Error("Unauthorized"));
    });
    /* Socket IO connection (client connected to server) */
    sioServer.on("connection", (socket) => {
        const user = socket.user;
        socket.join(user.id);
        const sendMembersUpdateToChannel = (room) => {
            var _a;
            const members = (_a = sioServer.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size;
            sioServer.sockets.to(room).emit("channel_update", {
                members: members ? members - 1 : undefined,
            });
        };
        /* User join to channel */
        socket.on("join", ({ channel }) => {
            // console.log("Join Channel ", channel);
            if (!channel)
                return;
            socket.join(channel);
            socket.broadcast.in(channel).emit("user_joined", user);
            sendMembersUpdateToChannel(channel);
        });
        /* User leave channel */
        socket.on("leave", ({ channel }) => {
            // console.log("Leave Channel ", channel);
            if (!channel)
                return;
            socket.leave(channel);
            socket.broadcast.in(channel).emit("user_left", user);
            sendMembersUpdateToChannel(channel);
        });
        /* when user disconnect */
        socket.on("disconnect", (reason) => {
            // console.log("Disconnect Reason : ", reason);
            /* Notify joined rooms user disconnected */
            for (const room of socket.rooms) {
                if (room === socket.id)
                    continue;
                if (room === user.id)
                    continue;
                socket.broadcast.in(room).emit("user_left", user);
                sendMembersUpdateToChannel(room);
            }
        });
        /* Message sent by user/client */
        socket.on("message", async ({ channel, content }) => {
            if (!channel || !content)
                return;
            try {
                const message = await db_1.default.message.create({
                    data: {
                        body: content,
                        channelId: channel,
                        senderId: user.id,
                    },
                    include: {
                        channel: true,
                        sender: true,
                    },
                });
                // console.log("New Message", message);
                /* Send message to target to channel */
                sioServer.sockets.to(channel).emit("message", message);
                // socket.broadcast.in(channel).emit("message", message);
            }
            catch (error) {
                console.log("Message Send Error ", error);
            }
        });
    });
    /* Mount API Router */
    app.use("/api", api_1.default);
    /* Mount Client App If Production Env */
    if (!dev) {
        app.get("*", (req, res) => {
            const parsedUrl = url_1.default.parse(req.url, true);
            clientAppHandler === null || clientAppHandler === void 0 ? void 0 : clientAppHandler(req, res, parsedUrl);
        });
    }
    server.listen(port, () => {
        console.log(`http://${hostname}:${port}`);
    });
}
if (dev) {
    startServer();
}
else {
    clientApp === null || clientApp === void 0 ? void 0 : clientApp.prepare().then(() => {
        startServer();
    });
}
