import express from "express";
import { z } from "zod";
import bcrypt from "@/utils/bcrypt";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { createExpressHandler } from "@/lib/router";
import { excludeObjectField } from "@/utils";
import jwt from "@/utils/jwt";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  createExpressHandler({
    validate: {
      /* Request body schema */
      body: z.object({
        name: z.string(),
        username: z.string(),
        password: z.string(),
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
    },
    handler: async ({ body }) => {
      /* Hash password with `bcryptjs` */
      const hashedPasswod = await bcrypt.hashPassword(body.password);
      if (!hashedPasswod) {
        return {
          succeed: false,
          reason: "INTERNAL_SERVER_ERROR",
        };
      }
      let user;
      try {
        user = await db.user.create({
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
      } catch (e) {
        user = undefined;
        /* If error is thrown by `Prisma` */
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
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
      const accessToken = await jwt.generateToken({ userId: user.id });
      if (!accessToken) {
        return {
          succeed: false,
          reason: "INTERNAL_SERVER_ERROR",
        };
      }
      /* Succeed! User is created successfully. */
      return {
        succeed: true,
        data: {
          ...user,
          accessToken: accessToken,
        },
        cookie: {
          name: "accessToken",
          value: accessToken,
        },
      };
    },
  })
);

authRouter.post(
  "/signin",
  createExpressHandler({
    validate: {
      /* Request body schema */
      body: z.object({
        username: z.string(),
        password: z.string(),
      }),
    },
    handler: async ({ body }) => {
      /* Get user by `username` */
      const user = await db.user.findFirst({
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
      const passwordMatch = await bcrypt.comparePassword(
        body.password,
        user.password
      );
      /* If password not matched */
      if (!passwordMatch) {
        return {
          succeed: false,
          reason: "WRONG_PASSWORD",
        };
      }
      const accessToken = await jwt.generateToken({ userId: user.id });
      if (!accessToken) {
        return {
          succeed: false,
          reason: "INTERNAL_SERVER_ERROR",
        };
      }
      /* Succeed! User is signed in successfully. */
      return {
        succeed: true,
        data: excludeObjectField(user, ["password"]),
        cookie: {
          name: "accessToken",
          value: accessToken,
        },
      };
    },
  })
);

export default authRouter;
