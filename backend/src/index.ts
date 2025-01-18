import { Elysia } from "elysia";
import betterAuthView from "./libs/auth/auth-view";
import swagger from "@elysiajs/swagger";

const PORT = process.env.PORT || 3000;
const app = new Elysia().get("/", () => "Hello Elysia").use(swagger()).all("/api/auth/*", betterAuthView).listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
