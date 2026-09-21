import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("User Login Endpoint", () => {
  const app = new Elysia().use(usersRoute);

  it("should successfully login with correct credentials and return UUID token with 200 OK", async () => {
    const uniqueEmail = `test-success-${Date.now()}@localhost`;

    // 1. Register user
    const registerResponse = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Login Success",
          email: uniqueEmail,
          password: "mysecretpassword",
        }),
      })
    );
    expect(registerResponse.status).toBe(201);

    // 2. Login
    const loginResponse = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: uniqueEmail,
          password: "mysecretpassword",
        }),
      })
    );

    expect(loginResponse.status).toBe(200);
    const body = (await loginResponse.json()) as { data: string };
    expect(body.data).toBeDefined();
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(body.data)).toBe(true);
  });

  describe("Validation Errors - Missing Required Fields", () => {
    it("should return 422 if email is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "rahasia",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if password is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@localhost",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("Validation Errors - Max Length Exceeded (>255 chars)", () => {
    it("should return 422 if email exceeds 255 characters", async () => {
      const longEmail = `${"b".repeat(250)}@localhost.com`;
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: longEmail,
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if password exceeds 255 characters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "valid@localhost",
            password: "P".repeat(256),
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("Authentication Errors", () => {
    it("should return 400 with generic error if user does not exist", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `nonexistent-${Date.now()}@localhost`,
            password: "any-password",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Email atau password salah" });
    });

    it("should return 400 if password is wrong for existing user", async () => {
      const uniqueEmail = `test-wrongpass-${Date.now()}@localhost`;

      // 1. Register user first
      const registerResponse = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Wrong Pass",
            email: uniqueEmail,
            password: "correctpassword",
          }),
        })
      );
      expect(registerResponse.status).toBe(201);

      // 2. Login with wrong password
      const loginResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: uniqueEmail,
            password: "wrongpassword",
          }),
        })
      );

      expect(loginResponse.status).toBe(400);
      const body = await loginResponse.json();
      expect(body).toEqual({ error: "Email atau password salah" });
    });
  });
});
