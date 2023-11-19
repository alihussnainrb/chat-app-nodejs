import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import apiRouter from "./api";
import corsMiddleware from "cors";
import { getAuthUser, registerAuthMiddleware } from "./utils/auth";
import { IUser } from "./typing/prisma";
import db from "./lib/db";
import cookieParser from "cookie-parser";
import { parse as parseSIOCookie } from "cookie";
import next from "next";
import urlParser from "url";
import { NextServer } from "next/dist/server/next";

/* Setup client app */

const isDev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
let clientApp: NextServer | undefined;
if (!isDev) {
  clientApp = next({
    dev: false,
    hostname,
    port,
    dir: "../client/",
  });
}

function startServer() {
  const clientAppHandler = clientApp?.getRequestHandler();

  /* Server intitialization basic middlewares declaration */
  const app = express();
  const server = createServer(app);
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    corsMiddleware({
      origin: isDev ? "http://localhost:4000" : "",
      credentials: true,
    })
  );
  app.use(registerAuthMiddleware());
  app.use(express.urlencoded({ extended: false }));

  /* Socket IO Intialization */
  const sioServer = new SocketIOServer(server, {
    cors: {
      origin: isDev ? "http://localhost:4000" : "",
      credentials: true,
    },
  });

  /* Socket IO Middleware to extract accessToken */
  sioServer.use(async (socket, next) => {
    let cookies: any | undefined;
    if (socket.handshake.headers.cookie) {
      cookies = parseSIOCookie(socket.handshake.headers.cookie);
    }
    const accessToken =
      cookies?.accessToken ||
      socket.handshake.headers.authorization ||
      socket.handshake.auth.token;
    if (accessToken) {
      const user = await getAuthUser(accessToken);
      (socket as any).user = user;
      if (user) return next();
    }
    next(new Error("Unauthorized"));
  });

  type SIOMessagePayload = {
    channel?: string;
    content?: string;
  };
  /* Socket IO connection (client connected to server) */
  sioServer.on("connection", (socket) => {
    const user = (socket as any).user as IUser;
    socket.join(user.id);

    const sendMembersUpdateToChannel = (room: string) => {
      const members = sioServer.sockets.adapter.rooms.get(room)?.size;
      sioServer.sockets.to(room).emit("channel_update", {
        members: members ? members - 1 : undefined,
      });
    };

    /* User join to channel */
    socket.on("join", ({ channel }) => {
      // console.log("Join Channel ", channel);
      if (!channel) return;
      socket.join(channel);
      socket.broadcast.in(channel).emit("user_joined", user);
      sendMembersUpdateToChannel(channel);
    });

    /* User leave channel */
    socket.on("leave", ({ channel }) => {
      // console.log("Leave Channel ", channel);
      if (!channel) return;
      socket.leave(channel);
      socket.broadcast.in(channel).emit("user_left", user);
      sendMembersUpdateToChannel(channel);
    });

    /* when user disconnect */
    socket.on("disconnect", (reason) => {
      // console.log("Disconnect Reason : ", reason);
      /* Notify joined rooms user disconnected */
      for (const room of socket.rooms) {
        if (room === socket.id) continue;
        if (room === user.id) continue;
        socket.broadcast.in(room).emit("user_left", user);
        sendMembersUpdateToChannel(room);
      }
    });

    /* Message sent by user/client */
    socket.on("message", async ({ channel, content }: SIOMessagePayload) => {
      if (!channel || !content) return;
      try {
        const message = await db.message.create({
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
      } catch (error) {
        console.log("Message Send Error ", error);
      }
    });
  });

  /* Mount API Router */
  app.use("/api", apiRouter);

  /* Mount Client App If Production Env */
  if (!isDev) {
    app.get("*", (req, res) => {
      const parsedUrl = urlParser.parse(req.url, true);
      clientAppHandler?.(req, res, parsedUrl);
    });
  }

  server.listen(port, () => {
    console.log(`http://${hostname}:${port}`);
  });
}

if (isDev) {
  startServer();
} else {
  clientApp?.prepare().then(() => {
    startServer();
  });
}
