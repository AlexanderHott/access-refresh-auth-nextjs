import { prisma } from "./../db/client";
import { signJwt } from "../utils/jwt";
import type { Prisma, User } from "@prisma/client";

// TODO: Refactor to constants file
const SESSION_LIFETIME = 60 * 60 * 24; // 1 day

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: input,
  })) as User;
};

export const findUser = async (
  where: Prisma.UserWhereInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findFirst({
    where,
    select,
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findUnique({
    where,
    select,
  })) as User;
};

export const updateUser = async (
  where: Partial<Prisma.UserWhereUniqueInput>,
  data: Prisma.UserUpdateInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.update({ where, data, select })) as User;
};

// TODO: check User type
export const signTokens = async (user: User) => {
  // 1. Create Session
  prisma.session.create({
    data: {
      expiresAt: new Date(Date.now() + SESSION_LIFETIME * 1000),
      userId: user.id,
    },
  });

  // redisClient.set(`${user.id}`, JSON.stringify(user), {
  //   EX: customConfig.redisCacheExpiresIn * 60,
  // });

  // 2. Create Access and Refresh tokens
  const access_token = signJwt({ sub: user.id }, "access", {
    expiresIn: `10m`,
  });

  const refresh_token = signJwt({ sub: user.id }, "refresh", {
    expiresIn: `1000m`,
  });

  return { access_token, refresh_token };
};
