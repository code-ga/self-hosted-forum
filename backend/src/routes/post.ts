import { Elysia, Static, t } from "elysia"
import { userMiddleware } from "../middlewares/auth-middleware"
import { db } from "../database"
import { post as postSchema } from "../database/schema"
import { baseResponseType, postType } from "../types"
import { eq } from "drizzle-orm"
import { parseJsonContentToString } from "../utils"



const postRouter = new Elysia({ prefix: "/posts" })
  .get("/posts", async (ctx) => {
    const { page, limit } = ctx.query
    const posts = await db.select().from(postSchema).limit(limit).offset((page - 1) * limit)
    return {
      status: 200,
      message: "Posts fetched successfully",
      success: true,
      type: "success",
      data: {
        posts: posts as Static<typeof postType>[]
      }
    }
  }, {
    query: t.Object({
      page: t.Number({ default: 1 }),
      limit: t.Number({ default: 10 })
    }),
    response: baseResponseType(t.Object({ posts: t.Array(postType) }))
  })
  .guard({
  },
    app =>
      app
        .resolve(userMiddleware)
        .post("/createPost", async (ctx) => {
          const { title, content } = ctx.body
          const post = await db.insert(postSchema).values({ title, content, rawText: parseJsonContentToString(content), authorId: ctx.user?.id || "" }).returning()
          if (!post.length) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Post creation failed" });
          }
          return {
            status: 200,
            message: "Post created successfully",
            success: true,
            type: "success",
            data: post[0] as Static<typeof postType>
          }
        }, {
          body: t.Object({
            title: t.String(),
            content: t.Record(t.String(), t.Any()),
          }),
          response: { 200: baseResponseType(postType), 500: baseResponseType(postType) }
        }).put("/:id", async (ctx) => {
          const { id } = ctx.params
          const post = await db.select().from(postSchema).where(eq(postSchema.id, id)).limit(1)
          if (!post.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Post not found" });
          }
          if (post[0].authorId !== ctx.user?.id) {
            return ctx.error(403, { status: 403, type: "error", success: false, message: "You are not authorized to update this post" });
          }
          const { title, content, rawText } = ctx.body
          const updatedPost = await db.update(postSchema).set({ title, content, rawText: rawText }).where(eq(postSchema.id, id)).returning()
          if (!updatedPost) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Post creation failed" });
          }
          return {
            status: 200,
            message: "Post updated successfully",
            success: true,
            type: "success",
            data: updatedPost[0] as Static<typeof postType>
          }
        }, {
          params: t.Object({
            id: t.String()
          }),
          body: t.Object({
            title: t.String(),
            content: t.Record(t.String(), t.Any()),
            rawText: t.String()
          }),
          response: {
            200: baseResponseType(postType),
            500: baseResponseType(postType),
            404: baseResponseType(postType),
            403: baseResponseType(postType)
          }
        })
        .delete("/:id", async (ctx) => {
          const { id } = ctx.params
          const post = await db.select().from(postSchema).where(eq(postSchema.id, id)).limit(1)
          if (!post.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Post not found" });
          }
          if (post[0].authorId !== ctx.user?.id) {
            return ctx.error(403, { status: 403, type: "error", success: false, message: "You are not authorized to delete this post" });
          }
          const deletedPost = await db.delete(postSchema).where(eq(postSchema.id, id)).returning()
          if (!deletedPost) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Post deletion failed" });
          }
          return {
            status: 200,
            message: "Post deleted successfully",
            success: true,
            type: "success",
            data: deletedPost[0] as Static<typeof postType>
          }
        }, {
          params: t.Object({
            id: t.String()
          }),
          response: {
            200: baseResponseType(postType),
            500: baseResponseType(postType),
            404: baseResponseType(postType),
            403: baseResponseType(postType)
          }
        })

  )

export default postRouter