import {
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
} from "../../controllers/auth.controller";
import { createUserSchema, loginUserSchema } from "../../schema/user.schema";
import { publicProcedure, router } from "../trpc";

export const authRouter = router({
  registerUser: publicProcedure
    .input(createUserSchema)
    .mutation(({ input }) => registerHandler({ input })),
  loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(({ input, ctx }) => loginHandler({ input, ctx })),
  logoutUser: publicProcedure.mutation(({ ctx }) => logoutHandler({ ctx })),
  refreshAccessToken: publicProcedure.query(({ ctx }) =>
    refreshAccessTokenHandler({ ctx })
  ),
});
