import { SessionUser } from "@/typing/express";
import { verify as jwtVerify, sign as jwtSign } from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? "kajskajskajskajsk";

export type JwtSessionPayload = {
  userId: string;
};

async function verifyToken(
  token: string
): Promise<JwtSessionPayload | undefined | null> {
  return await new Promise<any>((resolve) => {
    jwtVerify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err || !decoded) {
        resolve(null);
      }
      resolve(decoded);
    });
  });
}
async function generateToken(
  payload: JwtSessionPayload
): Promise<string | null | undefined> {
  return await new Promise<any>((resolve) => {
    jwtSign(payload, JWT_SECRET_KEY, { expiresIn: "24h" }, (err, token) => {
      if (err || !token) {
        resolve(null);
      }
      resolve(token);
    });
  });
}

const jwt = {
  verifyToken,
  generateToken,
};

export default jwt;
