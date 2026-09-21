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

  it("should serve OpenAPI specification at /swagger/json with response body examples", async () => {
    const response = await app.handle(
      new Request("http://localhost/swagger/json")
    );
    expect(response.status).toBe(200);
    const json: any = await response.json();
    expect(json.info.title).toBe("Vibe Coding User API");

    // Check register responses
    const registerResponses = json.paths["/api/users/register"].post.responses;
    expect(registerResponses["201"].content["application/json"].example).toEqual({ data: "OK" });
    expect(registerResponses["400"].content["application/json"].example).toEqual({ error: "Email sudah terdaftar" });

    // Check login responses
    const loginResponses = json.paths["/api/users/login"].post.responses;
    expect(loginResponses["200"].content["application/json"].example.data).toBeDefined();
    expect(loginResponses["400"].content["application/json"].example).toEqual({ error: "Email atau password salah" });

    // Check current responses
    const currentResponses = json.paths["/api/users/current"].get.responses;
    expect(currentResponses["200"].content["application/json"].example.data.name).toBe("John Doe");
    expect(currentResponses["401"].content["application/json"].example).toEqual({ error: "Unauthorized" });

    // Check logout responses
    const logoutResponses = json.paths["/api/users/logout"].delete.responses;
    expect(logoutResponses["200"].content["application/json"].example).toEqual({ data: "OK" });
    expect(logoutResponses["401"].content["application/json"].example).toEqual({ error: "Unauthorized" });
  });
});
