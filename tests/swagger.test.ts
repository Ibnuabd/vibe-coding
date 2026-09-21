import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "../src/routes/users-route";

describe("Swagger Documentation Endpoint", () => {
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
    .use(usersRoute);

  it("should serve Swagger UI at /swagger", async () => {
    const response = await app.handle(new Request("http://localhost/swagger"));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("swagger");
  });

  it("should serve OpenAPI specification at /swagger/json", async () => {
    const response = await app.handle(
      new Request("http://localhost/swagger/json")
    );
    expect(response.status).toBe(200);
    const json: any = await response.json();
    expect(json.info.title).toBe("Vibe Coding User API");
    expect(json.paths["/api/users/register"]).toBeDefined();
    expect(json.paths["/api/users/login"]).toBeDefined();
    expect(json.paths["/api/users/current"]).toBeDefined();
    expect(json.paths["/api/users/logout"]).toBeDefined();
  });
});
