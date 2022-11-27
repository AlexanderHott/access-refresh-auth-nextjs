import { getMeHandler } from "../../controllers/user.controller";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  getMe: protectedProcedure.query(({ ctx }) => getMeHandler({ ctx })),
});
