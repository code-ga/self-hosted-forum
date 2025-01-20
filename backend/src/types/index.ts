import { t, TSchema } from "elysia"
export const baseResponseType = <T extends TSchema>(schema: T) => t.Object({
  status: t.Number(),
  message: t.String(),
  success: t.String(),
  data: schema
})