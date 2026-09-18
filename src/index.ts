import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Server is running smoothly with ElysiaJS, Drizzle ORM, and MySQL on Bun!",
    timestamp: new Date().toISOString(),
  }))
  .group("/api", (app) =>
    app
      .get("/users", async () => {
        try {
          const allUsers = await db.select().from(users);
          return { success: true, data: allUsers };
        } catch (error: any) {
          return {
            success: false,
            message: "Failed to fetch users. Make sure MySQL is running and migrations are applied.",
            error: error.message,
          };
        }
      })
      .post(
        "/users",
        async ({ body, set }) => {
          try {
            await db.insert(users).values({
              name: body.name,
              email: body.email,
            });
            set.status = 201;
            return { success: true, message: "User created successfully" };
          } catch (error: any) {
            set.status = 500;
            return {
              success: false,
              message: "Failed to create user",
              error: error.message,
            };
          }
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String(),
          }),
        }
      )
  )
  .listen(Number(process.env.PORT) || 3000);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
