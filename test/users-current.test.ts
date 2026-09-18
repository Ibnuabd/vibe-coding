import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("Get Current User Endpoint", () => {
  const app = new Elysia().use(usersRoute);

  it("should return 401 Unauthorized if Authorization header is missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if Authorization header is not Bearer", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Basic somecredential",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if token is empty or invalid format", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Bearer   ",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if token does not exist in sessions", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Bearer nonexistent-session-token-12345",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 200 with user data when valid token is provided", async () => {
    const uniqueEmail = `test-current-${Date.now()}@localhost`;
    const userName = "Current User Test";
    const password = "mysecretpassword";

    // 1. Register user
    const registerResponse = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: uniqueEmail,
          password: password,
        }),
      })
    );
    expect(registerResponse.status).toBe(201);

    // 2. Login to get token
    const loginResponse = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: uniqueEmail,
          password: password,
        }),
      })
    );
    expect(loginResponse.status).toBe(200);
    const loginBody = (await loginResponse.json()) as { data: string };
    const token = loginBody.data;
    expect(token).toBeDefined();

    // 3. Get current user
    const currentResponse = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    expect(currentResponse.status).toBe(200);
    const currentBody = (await currentResponse.json()) as {
      data: {
        id: number;
        name: string;
        email: string;
        create_at: string;
        password?: string;
      };
    };

    expect(currentBody.data).toBeDefined();
    expect(typeof currentBody.data.id).toBe("number");
    expect(currentBody.data.name).toBe(userName);
    expect(currentBody.data.email).toBe(uniqueEmail);
    expect(currentBody.data.create_at).toBeDefined();
    expect(currentBody.data.password).toBeUndefined();
  });
});
