import { prisma } from "./../db/client";
import { TRPCError } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../utils/jwt";
import { type User, type Session } from "@prisma/client";

export const deserializeUser = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<{
  req: NextApiRequest;
  res: NextApiResponse;
  user: User | null;
}> => {
  try {
    // Get the token
    let access_token: string | undefined = undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    const notAuthenticated = {
      req,
      res,
      user: null,
    };

    if (!access_token) {
      return notAuthenticated;
    }

    // Validate Access Token
    const decoded = verifyJwt<{ sub: string }>(access_token, "access");

    if (!decoded) {
      return notAuthenticated;
    }

    // Check if user has a valid session
    const sessions = await prisma.session.findMany({
      where: { userId: decoded.sub },
    });

    let session: Session | undefined = undefined;
    for (const s of sessions) {
      if (s.expiresAt < new Date()) {
        session = s;
        break;
      }
    }
    if (!session) {
      return notAuthenticated;
    }

    // Check if user still exist
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      return notAuthenticated;
    }

    return {
      req,
      res,
      user: { ...user, id: user.id },
    };
  } catch (err: any) {
    console.log(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "",
    });
  }
};
