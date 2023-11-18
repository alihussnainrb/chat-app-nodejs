import { RequestHandler } from "express";
import jwt from "./jwt";
import db from "../lib/db";

export function registerAuthMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization || req.cookies["accessToken"];
      if (!token) return next();
      const decoded = await jwt.verifyToken(token);
      if (!decoded) return next();
      const user = await db.user.findFirst({ where: { id: decoded.userId } });
      req.authUser = user;
      return next();
    } catch (error) {
      return next();
    }
  };
}

export async function getAuthUser(token: string) {
  try {
    const decoded = await jwt.verifyToken(token);
    if (!decoded) return null;
    const user = await db.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}
