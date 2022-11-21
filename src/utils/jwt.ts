import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../env/server.mjs";

export const signJwt = ({
  payload,
  key,
  options = {},
}: {
  payload: Record<string, unknown>;
  key: "access" | "refresh";
  options: SignOptions;
}) => {
  const base64 =
    key === "access"
      ? env.ACCESS_TOKEN_PRIVATE_KEY
      : env.REFRESH_TOKEN_PRIVATE_KEY;

  const privateKey = Buffer.from(base64, "base64").toString("ascii");
  return jwt.sign(payload, privateKey, { ...options, algorithm: "RS256" });
};

export const verifyJwt = <T>(
  token: string,
  key: "access" | "refresh"
): T | null => {
  const base64 =
    key === "access"
      ? env.ACCESS_TOKEN_PUBLIC_KEY
      : env.REFRESH_TOKEN_PUBLIC_KEY;

  try {
    const publicKey = Buffer.from(base64, "base64").toString("ascii");
    return jwt.verify(token, publicKey) as T;
    // TODO: Safe parse with zod
  } catch (error) {
    console.log(error);
    return null;
  }
};
