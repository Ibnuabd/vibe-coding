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
});
