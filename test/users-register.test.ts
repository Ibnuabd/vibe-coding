import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("User Registration Endpoint", () => {
  const app = new Elysia().use(usersRoute);

  it("should validate input schema - return 422/400 if required fields are missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "ibnu",
          // email is missing
          password: "rahasia",
        }),
      })
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("should validate input schema - return 422 if name exceeds 255 characters", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "A".repeat(300),
          email: "valid@localhost",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(422);
  });
});
