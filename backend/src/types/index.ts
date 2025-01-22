import { createSelectSchema } from "drizzle-typebox"
import { Static, t, TSchema } from "elysia"
import { table } from "../database/schema"
export const baseResponseType = <T extends TSchema>(schema: T) => t.Object({
  status: t.Number(),
  message: t.String(),
  success: t.Boolean(),
  type: t.String(),
  data: t.Optional(schema)
})
export type BaseResponse<T> = {
  status: number
  message: string
  success: boolean
  type: string
  data: T
}

export const postType = createSelectSchema(table.post)

export type Post = Static<typeof postType>

export const userType = createSelectSchema(table.user)

export type User = Static<typeof userType>