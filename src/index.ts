import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Server is running smoothly with ElysiaJS, Drizzle ORM, and MySQL on Bun!",
    timestamp: new Date().toISOString(),
  }))
  .use(usersRoute)
  .listen(Number(process.env.PORT) || 3000);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
