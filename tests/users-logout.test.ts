import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("User Logout Endpoint", () => {
  const app = new Elysia().use(usersRoute);

  it("should return 401 Unauthorized if Authorization header is missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if Authorization header is not Bearer", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Basic somefakecredentials",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if token is empty or whitespace", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer    ",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 Unauthorized if token does not exist in sessions", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer nonexistent-session-token-999",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("should successfully logout valid session and invalidate subsequent requests", async () => {
    const uniqueEmail = `test-logout-${Date.now()}@localhost`;
    const password = "logoutpassword123";

    // 1. Register user
    const registerResponse = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Logout User Test",
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

    // 3. Verify user is currently authorized
    const currentResponse = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    expect(currentResponse.status).toBe(200);

    // 4. Logout
    const logoutResponse = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    expect(logoutResponse.status).toBe(200);
    const logoutBody = (await logoutResponse.json()) as { data: string };
    expect(logoutBody).toEqual({ data: "OK" });

    // 5. Verify subsequent logout with same token returns 401 Unauthorized
    const repeatLogoutResponse = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    expect(repeatLogoutResponse.status).toBe(401);
    const repeatLogoutBody = (await repeatLogoutResponse.json()) as {
      error: string;
    };
    expect(repeatLogoutBody).toEqual({ error: "Unauthorized" });

    // 6. Verify subsequent current user check returns 401 Unauthorized
    const postLogoutCurrentResponse = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    expect(postLogoutCurrentResponse.status).toBe(401);
    const postLogoutCurrentBody =
      (await postLogoutCurrentResponse.json()) as { error: string };
    expect(postLogoutCurrentBody).toEqual({ error: "Unauthorized" });
  });
});
