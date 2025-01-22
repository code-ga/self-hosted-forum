import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import apiRouter from "./routes";

const PORT = process.env.PORT || 3000;
export const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(cors())
  .use(swagger())
  .use(apiRouter)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app
export * from "./types"