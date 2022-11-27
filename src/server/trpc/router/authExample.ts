import { protectedProcedure, router } from "../trpc";

export const exampleAuthRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
