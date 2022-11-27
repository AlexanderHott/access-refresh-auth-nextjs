import { TRPCError } from "@trpc/server";
import { type OptionsType } from "cookies-next/lib/types";
import { getCookie, setCookie } from "cookies-next";
import type { CreateUserInput, LoginUserInput } from "../schema/user.schema";
import {
  createUser,
  findUniqueUser,
  findUser,
  signTokens,
} from "../services/user.service";
import { signJwt, verifyJwt } from "../utils/jwt";
import type { Context } from "../trpc/context";

// TODO: Refactor these to a constants file.
const ACCESS_EXPIRES_IN = 60 * 10; // 10 minutes
const REFRESH_EXPIRES_IN = 60 * 60 * 24; // 1 day

const cookieOptions: OptionsType = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const accessTokenCookieOptions: OptionsType = {
  ...cookieOptions,
  expires: new Date(Date.now() + ACCESS_EXPIRES_IN * 1000),
};

const refreshTokenCookieOptions: OptionsType = {
  ...cookieOptions,
  expires: new Date(Date.now() + REFRESH_EXPIRES_IN * 60 * 1000),
};

export const registerHandler = async ({
  input,
}: {
  input: CreateUserInput;
}) => {
  try {
    // const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await createUser({
      email: input.email,
      username: input.username,
      password: input.password,
      photo: input.photo,
    });

    return {
      status: "success",
      data: {
        user,
      },
    };
  } catch (err: any) {
    // TODO: what is this error code?
    if (err.code === "P2002") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already exists",
      });
    }
    throw err;
  }
};

export const loginHandler = async ({
  input,
  ctx: { req, res },
}: {
  input: LoginUserInput;
  ctx: Context;
}) => {
  try {
    // Get the user from the collection
    const user = await findUser({ email: input.email });

    // Check if user exist and password is correct
    // TODO: AES-256
    if (!user || input.password !== user.password) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid email or password",
      });
    }

    // Create the Access and refresh Tokens
    const { access_token, refresh_token } = await signTokens(user);

    // Send Access Token in Cookie
    setCookie("access_token", access_token, {
      req,
      res,
      ...accessTokenCookieOptions,
    });
    setCookie("refresh_token", refresh_token, {
      req,
      res,
      ...refreshTokenCookieOptions,
    });
    setCookie("logged_in", "true", {
      req,
      res,
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send Access Token
    return {
      status: "success",
      access_token,
    };
  } catch (err: any) {
    console.log(err);

    throw err;
  }
};

export const refreshAccessTokenHandler = async ({
  ctx: { prisma, req, res },
}: {
  ctx: Context;
}) => {
  try {
    // Get the refresh token from cookie
    const refresh_token = getCookie("refresh_token", { req, res }) as string;

    const message = "Could not refresh access token";
    if (!refresh_token) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    // Validate the Refresh token
    const decoded = verifyJwt<{ sub: string }>(refresh_token, "refresh");

    if (!decoded) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    // Check if the user has a valid session
    const session = await prisma.session.findFirst({
      where: { userId: decoded.sub },
    });
    // const session = await redisClient.get(decoded.sub);
    if (!session || session.expiresAt < new Date()) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    // TODO: check logic
    // Check if the user exist
    const user = await findUniqueUser({ id: session.userId });

    if (!user) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, "access", {
      expiresIn: `${ACCESS_EXPIRES_IN}m`,
    });

    // Send the access token as cookie
    setCookie("access_token", access_token, {
      req,
      res,
      ...accessTokenCookieOptions,
    });
    setCookie("logged_in", "true", {
      req,
      res,
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send response
    return {
      status: "success",
      access_token,
    };
  } catch (err: any) {
    throw err;
  }
};

const logout = ({ ctx: { req, res } }: { ctx: Context }) => {
  setCookie("access_token", "", { req, res, maxAge: -1 });
  setCookie("refresh_token", "", { req, res, maxAge: -1 });
  setCookie("logged_in", "", { req, res, maxAge: -1 });
};

export const logoutHandler = async ({ ctx }: { ctx: Context }) => {
  try {
    const user = ctx.user;
    if (!user) {
      return;
    }

    // FIXME: delete specific session
    await ctx.prisma.session.deleteMany({ where: { userId: user.id } });
    // await redisClient.del(String(user?.id));
    logout({ ctx });
    return { status: "success" };
  } catch (err: any) {
    throw err;
  }
};
