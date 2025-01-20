import Elysia from "elysia";
import postRouter from "./post";

const apiRouter = new Elysia({ prefix: "/api" }).use(postRouter)

export default apiRouter