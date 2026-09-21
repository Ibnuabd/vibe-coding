import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Vibe Coding User API",
          version: "1.0.0",
          description: "Dokumentasi API untuk aplikasi Vibe Coding",
        },
      },
    })
  )
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
