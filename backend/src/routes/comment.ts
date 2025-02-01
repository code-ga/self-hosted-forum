
import Elysia, { Static, t } from "elysia";
import { baseResponseType, commentType, contentType } from "../types";
import { table } from "../database/schema";
import { db } from "../database";
import { eq } from "drizzle-orm";
import { userMiddleware } from "../middlewares/auth-middleware";
import { parseJsonContentToString } from "../utils";

export const commentRouter = new Elysia({ prefix: "/comments" })
  .get("/posts/:postId", async (ctx) => {
    const { postId } = ctx.params;
    const comments = await db.select().from(table.comment).where(eq(table.comment.postId, postId));
    return {
      status: 200,
      message: "Comments fetched successfully",
      success: true,
      type: "success",
      data: {
        comments: comments as Static<typeof commentType>[]
      }
    }
  }, {
    response: {
      200: baseResponseType(t.Object({ comments: t.Array(commentType) })),
      404: baseResponseType(t.Null()),
    },
    detail: {
      description: "Get comments for a post",
      responses: {
        200: {
          description: "Comments fetched successfully",
        },
        404: {
          description: "Post not found",
        },
      },
      tags: ["comment", "get", "api"]
    }
  })
  .guard(
    {},
    app =>
      app
        .resolve(userMiddleware)
        .post("/createComment", async ctx => {
          const { content, postId, parent_comment_id } = ctx.body
          if (!postId) {
            return ctx.error(400, { status: 400, type: "error", success: false, message: "Post ID is required" });
          }
          if (!parseJsonContentToString(content).length) {
            return ctx.error(400, { status: 400, type: "error", success: false, message: "Content is required" });
          }
          const post = await db.select().from(table.post).where(eq(table.post.id, postId)).limit(1)
          if (!post.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Post not found" });
          }
          const comment = await db.insert(table.comment).values({ content, authorId: ctx.user?.id || "", postId: post[0].id, parentCommentId: parent_comment_id }).returning()
          if (!comment.length) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Comment creation failed" });
          }
          return {
            status: 200,
            message: "Comment created successfully",
            success: true,
            type: "success",
            data: comment[0] as Static<typeof commentType>
          }
        }, {
          body: t.Object({
            content: contentType,
            postId: t.String(),
            parent_comment_id: t.Optional(t.String())
          }),
          response: {
            200: baseResponseType(commentType),
            500: baseResponseType(t.Null()),
            400: baseResponseType(t.Null()),
            404: baseResponseType(t.Null())
          },
          detail: {
            description: "Create a new comment for the post",
            responses: {
              200: {
                description: "Comment created successfully",
              },
              500: {
                description: "Internal server error",
              },
              400: {
                description: "Bad request with the reason included",
              },
              404: {
                description: "Post not found or comment not found",
              }
            },
            tags: ["comment", "api", "create"]
          }
        })
        .put("/:id", async (ctx) => {
          const { id } = ctx.params
          const { content } = ctx.body
          const comment = await db.select().from(table.comment).where(eq(table.comment.id, id)).limit(1)
          if (!comment.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Comment not found" });
          }
          if (comment[0].authorId !== ctx.user?.id) {
            return ctx.error(401, { status: 401, type: "error", success: false, message: "Unauthorized" });
          }
          const updatedComment = await db.update(table.comment).set({ content }).where(eq(table.comment.id, id)).returning()
          if (!updatedComment.length) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Comment update failed" });
          }
          return {
            status: 200,
            message: "Comment updated successfully",
            success: true,
            type: "success",
            data: updatedComment[0] as Static<typeof commentType>
          }
        }, {
          params: t.Object({
            id: t.String()
          }),
          body: t.Object({
            content: contentType
          }),
          response: {
            200: baseResponseType(commentType),
            404: baseResponseType(t.Null()),
            401: baseResponseType(t.Null()),
            500: baseResponseType(t.Null())
          },
          detail: {
            description: "Update a comment",
            responses: {
              200: {
                description: "Comment updated successfully",
              },
              404: {
                description: "Comment not found",
              },
              401: {
                description: "Unauthorized to update comment",
              },
              500: {
                description: "Internal server error",
              }
            },
            tags: ["comment", "api", "update"]
          }
        })
        .delete("/:id", async (ctx) => {
          const { id } = ctx.params
          const comment = await db.select().from(table.comment).where(eq(table.comment.id, id)).limit(1)
          if (!comment.length) {
            return ctx.error(404, { status: 404, type: "error", success: false, message: "Comment not found" });
          }
          if (comment[0].authorId !== ctx.user?.id) {
            return ctx.error(401, { status: 401, type: "error", success: false, message: "Unauthorized" });
          }
          const deletedComment = await db.delete(table.comment).where(eq(table.comment.id, id)).returning()
          if (!deletedComment) {
            return ctx.error(500, { status: 500, type: "error", success: false, message: "Comment deletion failed" });
          }
          return {
            status: 200,
            message: "Comment deleted successfully",
            success: true,
            type: "success",
            data: deletedComment[0] as Static<typeof commentType>
          }
        }, {
          params: t.Object({
            id: t.String()
          }),
          response: {
            200: baseResponseType(commentType),
            404: baseResponseType(t.Null()),
            401: baseResponseType(t.Null()),
            500: baseResponseType(t.Null())
          },
          detail: {
            description: "Delete a comment",
            responses: {
              200: {
                description: "Comment deleted successfully",
              },
              404: {
                description: "Comment not found",
              },
              401: {
                description: "Unauthorized to trigger this action",
              },
              500: {
                description: "Internal server error",
              }
            },
            tags: ["comment", "api", "delete"]
          }
        })
  );
