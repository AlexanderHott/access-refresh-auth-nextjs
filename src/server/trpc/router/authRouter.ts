import { prisma } from "./../../db/client";
import z from "zod";
import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.password !== input.password) {
        throw new Error("Incorrect password");
      }

      return {
        accessToken: "",
        refreshToken: "",
      };
    }),
});
