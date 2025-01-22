import Elysia from "elysia";
import postRouter from "./post";
import betterAuthView from "../libs/auth/auth-view";
import { userRouter } from "./user";

const apiRouter = new Elysia({ prefix: "/api" })
  .all("/auth/*", betterAuthView)
  .use(postRouter)
  .use(userRouter)

export default apiRouter