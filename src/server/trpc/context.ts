import { deserializeUser } from "../common/get-server-auth-session";
import { type User } from "@prisma/client";
import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { prisma } from "../db/client";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  user: User | null;
  req: NextApiRequest;
  res: NextApiResponse;
};

/** Use this helper for:
 * - testing, so we don't have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    ...opts,
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const { user } = await deserializeUser({ req, res });

  return await createContextInner({ user, req, res });
};

export type Context = inferAsyncReturnType<typeof createContext>;
