import Elysia from "elysia";
import postRouter from "./post";
import betterAuthView from "../libs/auth/auth-view";
import { userRouter } from "./user";
import { commentRouter } from "./comment";

const apiRouter = new Elysia({
  prefix: "/api", detail: {
    description: "API For The Forum to help you create your own forum with in a few minutes (using better auth for the authentication auth docs is here /api/auth/reference)",
    summary: "All Rest api of app stands here",
    tags: ["api"]
  }
})
  .all("/auth/*", betterAuthView)
  .use(postRouter)
  .use(userRouter)
  .use(commentRouter);

export default apiRouter