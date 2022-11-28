import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../env/server.mjs";

const SECRET = "1234";

export const signJwt = (
  payload: Record<string, unknown>,
  key: "access" | "refresh",
  options: SignOptions = {}
) => {
  // const base64 =
  //   key === "access"
  //     ? env.ACCESS_TOKEN_PRIVATE_KEY
  //     : env.REFRESH_TOKEN_PRIVATE_KEY;

  // const privateKey = Buffer.from(base64, "base64").toString("ascii");
  // return jwt.sign(payload, privateKey, { ...options, algorithm: "RS256" });
  return jwt.sign(payload, SECRET, { ...options });
};

export const verifyJwt = <T>(
  token: string,
  key: "access" | "refresh"
): T | null => {
  // const base64 =
  //   key === "access"
  //     ? env.ACCESS_TOKEN_PUBLIC_KEY
  //     : env.REFRESH_TOKEN_PUBLIC_KEY;

  try {
    // const publicKey = Buffer.from(base64, "base64").toString("ascii");
    // return jwt.verify(token, publicKey) as T;
    return jwt.verify(token, SECRET) as T;
    // TODO: Safe parse with zod
  } catch (error) {
    console.log(error);
    return null;
  }
};
