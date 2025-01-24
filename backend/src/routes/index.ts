import Elysia from "elysia";
import postRouter from "./post";
import betterAuthView from "../libs/auth/auth-view";
import { userRouter } from "./user";
import { commentRouter } from "./comment";

const apiRouter = new Elysia({ prefix: "/api" })
  .all("/auth/*", betterAuthView)
  .use(postRouter)
  .use(userRouter)
  .use(commentRouter);

export default apiRouter