import { Elysia,t } from "elysia"
import { userMiddleware } from "../middlewares/auth-middleware"
import { db } from "../database"
import { post } from "../database/schema"

const postRouterWithAuth = new Elysia({ prefix: "/" }).onBeforeHandle(userMiddleware)

const postRouterWithoutAuth = new Elysia({ prefix: "/" }).get("/posts", (ctx) => {
  const { page, limit } = ctx.query
  const posts = db.select().from(post).limit(limit).offset((page - 1) * limit)
  return {
    message: "Hello World"
  }
 }, {
  query: t.Object({
    page: t.Number(),
    limit: t.Number()
  })
})

const postRouter = new Elysia({ prefix: "/post" }).use(postRouterWithAuth).use(postRouterWithoutAuth)


export default postRouter