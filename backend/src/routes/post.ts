import { Elysia, Static, t } from "elysia"
import { userMiddleware } from "../middlewares/auth-middleware"
import { db } from "../database"
import { post as postSchema } from "../database/schema"
import { baseResponseType, contentType as contentType, postType } from "../types"
import { eq, desc } from "drizzle-orm"
import { parseJsonContentToString } from "../utils"



const postRouter = new Elysia({ prefix: "/posts" })
  .get("/posts", async (ctx) => {
    const { page, limit } = ctx.query
    const posts = await db.select().from(postSchema).limit(limit).offset((page - 1) * limit).orderBy(desc(postSchema.createdAt))
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
    response: baseResponseType(t.Object({ posts: t.Array(postType) })),
    detail: {
      description: "Get all posts",
      responses: {
        200: {
          description: "Posts fetched successfully with pagination and no relationship added",
        },
      },
      tags: ["post", "get", "api"],
    }
  })
  .get("/:id", async (ctx) => {
    const { id } = ctx.params
    const post = await db.select().from(postSchema).where(eq(postSchema.id, id)).limit(1)
    if (!post.length) {
      return ctx.error(404, { status: 404, type: "error", success: false, message: "Post not found" });
    }
    ctx.response = {
      status: 200,
      message: "Post fetched successfully",
      success: true,
      type: "success",
      data: {
        post: post[0] as Static<typeof postType>
      }
    }
    return ctx.response
  }, {
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: baseResponseType(t.Object({ post: postType })),
      404: baseResponseType(t.Null())
    },
    detail: {
      description: "Get a post by id",
      responses: {
        200: {
          description: "Post fetched successfully with no relationship added",
        },
        404: {
          description: "Post not found",
        },
      },
      tags: ["post", "get", "api"]
    }
  })
  .guard({
    detail: {
      security: [
        {
          cookieAuth: []
        }
      ],
      tags: ["post", "api", "auth"]
    }
  },
    app =>
      app
        .resolve(userMiddleware)
        .post("/createPost", async (ctx) => {
          const { title, content } = ctx.body
          if (!parseJsonContentToString(content).length || !title.length) {
            return ctx.error(400, { status: 400, type: "error", success: false, message: "Title and content are required" });
          }
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
            content: contentType,
          }),
          response: {
            200: baseResponseType(postType),
            500: baseResponseType(t.Null()),
            400: baseResponseType(t.Null())
          },
          detail: {
            description: "Create a post",
            responses: {
              200: {
                description: "Post created successfully",
              },
              500: {
                description: "Post creation failed",
              },
              400: {
                description: "Title and content are required",
              },
            },
            tags: ["post", "api", "create"]
          }
        }).put("/:id", async (ctx) => {
          const { id } = ctx.params
          const post = await db.select().from(postSchema).where(eq(postSchema.id, id)).limit(1)
          if (!post.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Post not found" });
          }
          if (post[0].authorId !== ctx.user?.id) {
            return ctx.error(403, { status: 403, type: "error", success: false, message: "You are not authorized to update this post" });
          }
          const title = ctx.body.title || post[0].title;
          const content = ctx.body.content || (post[0].content as Record<string, any>);
          const updatedPost = await db.update(postSchema).set({ title, content, rawText: parseJsonContentToString(content) }).where(eq(postSchema.id, id)).returning()
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
            title: t.Optional(t.String()),
            content: contentType,
          }),
          response: {
            200: baseResponseType(postType),
            500: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            403: baseResponseType(t.Null())
          },
          detail: {
            description: "Update a post",
            responses: {
              200: {
                description: "Post updated successfully",
              },
              500: {
                description: "Post creation failed",
              },
              404: {
                description: "Post not found",
              },
              403: {
                description: "You are not authorized to update this post",
              },
            },
            tags: ["post", "api", "update"]
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
            500: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            403: baseResponseType(t.Null())
          },
          detail: {
            description: "Delete a post",
            responses: {
              200: {
                description: "Post deleted successfully",
              },
              500: {
                description: "Post deletion failed",
              },
              404: {
                description: "Post not found",
              },
              403: {
                description: "You are not authorized to delete this post",
              },
            },
            tags: ["post", "api", "delete"]
          }
        })

  )

export default postRouter